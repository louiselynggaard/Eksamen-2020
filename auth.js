//Middleware
const jwt = require('jsonwebtoken');
const fs = require('fs');

exports.isAuthenticated = function (req, res, next) { //kilde for følgende funktion: https://tutorialedge.net/nodejs/nodejs-jwt-authentication-tutorial/
    if (typeof req.headers.authorization !== "undefined") {
        // retrieve the authorization header and parse out the
        // JWT using the split function
        let token = req.headers.authorization.split(" ")[1];
        let privateKey = fs.readFileSync('./private.pem', 'utf8');
        // Here we validate that the JSON Web Token is valid and has been 
        // created using the same private pass phrase
        jwt.verify(token, privateKey, {algorithms: "HS256"}, (error, tokenData) => {

            // if there has been an error...
            if(error) {
                console.log(error);
                // shut them out!
                res.status(401).json({ error: "Not Authorized"});  // F.eks hvis token er udløbet
                throw new Error("Not Authorized");
            }

            // add token data to request header 
            req._customTokenData = tokenData; //bruges nu når id bestemmes ifb. kald af API'er

            // if the JWT is valid, allow them to hit
            // the intended endpoint
            return next();
        });
    } else {
        // No authorization header exists on the incoming
        // request, return not authorized and throw a new error 
        res.status(401).json({ error: "Not Authorized" });
        throw new Error("Not Authorized");
    }
}

exports.giveToken = function (id, email, name) { //bygger token med indhold: id, email, name
    let privateKey = fs.readFileSync('./private.pem', 'utf8');
    let jwtToken = jwt.sign({ id: id, email: email, name: name }, privateKey, 
        { algorithm: 'HS256', expiresIn: '7d'}); // token er gyldig i 7 døgn - herefter 401 Unauthorized
    return jwtToken;
}

exports.isTokenValid = function (email, token) { //verificerer token 
    let success = null;
    let privateKey = fs.readFileSync('./private.pem', 'utf8');
    jwt.verify(token, privateKey, { algorithm: "HS256" }, (err, tokenData) => {  
        //algoritme HS256 bruges ved aflæsning og bygning af token = krypteringsalgoritme        
        if (err) 
            success = false; //token ikke valid
        else
            success = (tokenData.email === email); //hvis succes, tjekkes email også
    });
    return success; //success-token er enten true eller false alt efter verificering
}