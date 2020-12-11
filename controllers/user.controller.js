//MIDDLEWARE
const fs = require('fs'); //node.js filesystem gør det muligt at læse, oprette, opdatere, slette filer
const User = require('../models/user.model'); //klasse hentes fra denne mappe.
const auth = require('../auth.js'); // middleware auth

function readUserData() { //sørger for at hver gang serveren startes, så loades alt hvad der er tilgængeligt i "databasen" user.data.json
    let fileData = fs.readFileSync('./app_data/user.data.json', 'utf8', function (err) { //fs.readFileSync er en del af node.js-bibliotek. SYNC gør at serveren "blokeres" indtil ordren er udført. Serveren lytter ikke på andet imens. Det kan den ved redFile()
        if (err) return console.log(err);
    });
       
    console.log('Loaded: user.data.json');
    return JSON.parse(fileData);
};

function writeUserData() { //overskriver alt hvad der er i user.data.json med nyt indhold (hvor noget af det er det samme)
    fs.writeFile('./app_data/user.data.json', JSON.stringify(userData,null,4), 'utf8', function (err) { //skriver filen i mappen '...', laver indryk 4 og sørger for æ, ø, å.
        if (err) return console.log(err); //hvis der er fejl, rapporteres dette i consollen
        console.log('Saved: user.data.json'); //når denne funktion kaldes, rapporteres dette i consollen.
    });
};

function isDate(date) { //tjekker for valid dato
    return (new Date(date) !== "invalid date") && !isNaN(new Date(date));
};

function isNumeric(num) { //tjekker for reelt tal
    return !isNaN(num);
};

function validateEmail(email) { //tjekker for email med krav - kode fundet her: https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript?fbclid=IwAR37mfxZX4HbA6P5VPMeW-FbO1E_BA3B94HlWeRgu7pipJhCOf2HOkWe5Wg
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
};

/* BRUGES IKKE LÆNGERE. Blev anvendt til at udvikle resterende funktioner før der var implementeret JWT og Cookies.
function getMyIndex(req) { //index på aktiv login-bruger er hårdkodet for at oprette resterende funktioner
    return 0;
};
*/

var userData = readUserData(); //variablen userData oprettes ud fra det funktionen finder i json-filen/"databasen" user.data.json

//READ
exports.user_test = function (req, res) { // Testfunktion der viser indhold af token. Testet i Postman

    if (req._customTokenData == undefined) {
        res.send("token data: NO TOKEN");
        return;
    }

    var tokenDate = new Date(req._customTokenData.iat * 1000);
    var expireDate = new Date(req._customTokenData.exp * 1000);
    res.send("token data:" + JSON.stringify(req._customTokenData) + ", tokenDate:" + tokenDate + ", expireDate:" + expireDate);
};

exports.user_likes_list = function (req, res) {
    //Hvilket id/index har jeg?
    let myId = req._customTokenData.id; //eget id hentes fra token
    let myUser = userData.userList.find(x => x.id === myId); //finder egen user i userData database
    
    //For loop, der gennemgår alle i databasen
    let responseList = [];
    for (i=0; i<userData.userList.length; i++) { 
        let otherUser = userData.userList[i];
        //Er det mit eget id, så spring over
        if (otherUser.id == myId)
            continue;
        
        //Har jeg liket id'et, adderes dette til nyt array
        if (myUser.likeIdList.includes(otherUser.id)) {
            let mutualMatch = otherUser.likeIdList.includes(myId); //true hvis otherUser har liket mig
            
            responseList.push({id: otherUser.id, name: otherUser.name, dateOfBirth: otherUser.dateOfBirth, 
                zipCode: otherUser.zipCode, match: mutualMatch}); //objektet indeholder kun tilgængeligt data
        }
    }
    //Returner nyt array
    res.send(responseList);
};

exports.suggested_match = function (req, res) {
    let myId = req._customTokenData.id; //eget id hentes fra token
    let myUser = userData.userList.find(x => x.id === myId); //finder user i userData database

    //For loop, der gennemgår alle i databasen
    let suggestedMatchList = [];
    for (i=0; i<userData.userList.length; i++) {
        let suggestedMatch = userData.userList[i];
        //Er det mit eget id, så spring over
        if (suggestedMatch.id == myUser.id)
            continue;
        
        //Har jeg allerede liket, så spring over
        if (myUser.likeIdList.includes(suggestedMatch.id))
            continue;

        suggestedMatchList.push({id: suggestedMatch.id, name: suggestedMatch.name, dateOfBirth: suggestedMatch.dateOfBirth, zipCode: suggestedMatch.zipCode, description: suggestedMatch.description});
    };

    let index = parseInt(Math.random()*suggestedMatchList.length); //Math.random() ganget med antallet af index i bruger-array. parseInt() gør decimal-tallet til et helt tal.
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    
    //console.log(suggestedMatchList[index], index);
    res.send(suggestedMatchList[index]);
};

//CREATE
exports.user_login = function (req, res) {
    let user = userData.userList.find(x => x.email === req.body.email); // find user in userData database

    if (user == undefined) { // bruger ikke fundet med denne email
        res.status(404).send(); // 404 Not Found
        return;
    }

    if (req.body.token != null && req.body.token != '') { // Login af
        if ( auth.isTokenValid(req.body.email, req.body.token) == false ) { // Token er invalid eller der er email mismatch
            res.status(401).send(); // 401 Unauthorized
            return;
        }
       
        res.send({name: user.name, dateOfBirth: user.dateOfBirth, zipCode: user.zipCode, email: user.email, description: user.description, token: req.body.token});
        return;
    }

    if (user.password != req.body.password) { // password stemmer ikke
        res.status(401).send(); // 401 Unauthorized
        return;
    }

    let jwtToken = auth.giveToken(user.id, user.email, user.name);
    res.send({name: user.name, dateOfBirth: user.dateOfBirth, zipCode: user.zipCode, email: user.email, description: user.description, token: jwtToken});
};

exports.user_create = function (req, res) {

    let user = new User( //der oprettes en ny bruger på baggrund af klassen "User" i user.model.js
        (++userData.lastUserId).toString(), //når der oprettes en ny bruger, tildeles den et id, som tæller fra de i forvejen oprettede brugeres id'er. 
        req.body.name, //her bruges body-parser, som er en udvidelse til biblioteket Express
        req.body.dateOfBirth,
        req.body.zipCode,
        req.body.email,
        req.body.password,
        req.body.description
    );

    //"Hjælpefunktioner" anvendes for at tjekke at req har korrekt format
    if (req.body.name == null || req.body.name.trim() == '') {
        res.status(400).send('name missing');
        return;
    }
    if (req.body.dateOfBirth == null || !isDate(req.body.dateOfBirth)) {
        res.status(400).send('date error');
        return;
    }
    if (req.body.zipCode == null || !isNumeric(req.body.zipCode)) {
        res.status(400).send('zipcode is not numeric');
        return;
    }
    if (req.body.email == null || !validateEmail(req.body.email)) {
        res.status(400).send('email error');
        return;
    }
    if (req.body.password == null || req.body.password.trim() == '') {
        res.status(400).send('password missing');
        return;
    }
    if (req.body.description == null || req.body.description.trim() == '') {
        res.status(400).send('description missing');
        return;
    }

    userData.userList.push(user); //indsæt som statisk data i JSON-fil
    console.log('user_create, user:', user); //det logges i consolen, at der er oprettet en ny bruger

    writeUserData(); //når der er oprettet en ny bruger skrives denne ind i "databasen" user.data.json

    res.send(user)
};

//UPDATE
exports.user_update = function (req, res) {
    //Hvilket id/index har jeg?
    let myId = req._customTokenData.id; //eget id hentes fra token
    let myUser = userData.userList.find(x => x.id === myId); //finder user i userData database

    //Hvad vil jeg opdatere?
    myUser.name = req.body.name;
    myUser.dateOfBirth = req.body.dateOfBirth;
    myUser.zipCode = req.body.zipCode;
    myUser.email = req.body.email;
    myUser.password = req.body.password;
    myUser.description = req.body.description;

    console.log('user_update, user:', myUser);

    writeUserData(); //opdateres i databasen

    res.send(myUser);
};

exports.user_like = function (req, res) {
    //Hvilket id/index har jeg?
    let myId = req._customTokenData.id; //eget id hentes fra token
    let myUser = userData.userList.find(x => x.id === myId); //finder user i userData database

    //Hvem vil jeg like?
    let suggestedUserId = req.body.id; //variablen id hentes fra request-body

    if (!myUser.likeIdList.includes(suggestedUserId)) //hvis ikke brugeren er liket i forvejen, likes den nu
        myUser.likeIdList.push(suggestedUserId); //man kan ikke like en person flere gange

    let suggestedUser = userData.userList.find(x => x.id === suggestedUserId); //den forslåedes brugers id findes 

    let mutualLike = (myUser.likeIdList.includes(suggestedUserId) && suggestedUser.likeIdList.includes(myUser.id)); //hvis der er like fra begge parter er denne variable true

    writeUserData(); //skriver opdatering i basen

    res.send({mutualLike: mutualLike, likeIdList: myUser.likeIdList}); //returnerer JSON-objekt 
};

//DELETE
exports.user_likes_delete = function (req, res) {
    //Hvilket id/index har jeg?
    let myId = req._customTokenData.id; //eget id hentes fra token
    let myUser = userData.userList.find(x => x.id === myId); //finder user i userData database

    //Hvem vil jeg slette?
    let suggestedUser = req.body.id;
    let index = myUser.likeIdList.findIndex(x => x === suggestedUser);

    //Hvordan slettes vedkommende?
    if(index != -1) {
        myUser.likeIdList.splice(index,1);
    }

    //databsen opdateres
    writeUserData();

    //JSON-objekt returneres
    res.send(myUser.likeIdList);
};

exports.user_delete = function (req, res) {
    //Hvilket id/index har jeg?
    let myId = req._customTokenData.id; //eget id hentes fra token
    let myUser = userData.userList.find(x => x.id === myId); //finder user i userData database
    let myIndex = myUser.likeIdList.findIndex(x => x === myUser);

    //let myIndex = getMyIndex(req);
    //let user = userData.userList[myIndex];

    userData.userList.splice(myIndex, 1); // remove from array https://www.w3schools.com/jsref/jsref_splice.asp
    console.log('user_delete, user:', myUser);

    writeUserData();

    res.send(myUser);
};