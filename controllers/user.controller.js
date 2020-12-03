const fs = require('fs'); //node.js filesystem gør det muligt at læse, oprette, opdatere, slette filer

const User = require('../models/user.model'); //klasse hentes fra denne mappe.

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

function getMyIndex(req) { //index på aktiv login-bruger er hårdkodet for at oprette resterende funktioner
    return 0;
};

var userData = readUserData(); //variablen userData oprettes ud fra det funktionen finder i json-filen/"databasen" user.data.json

//READ
exports.user_login = function (req, res) {
    let user = userData.userList.find(x => x.email === req.params.email);
    console.log('user_login, user:', user);

    if (user == undefined)
        res.status(204).send();
    else 
        res.send(user)
};

exports.user_likes_list = function (req, res) {
    //console.log('user_likes:', userData.userList);

    //Hvilket id/index har jeg?
    var myIndex = getMyIndex(req); //tester på den første i array
    var myId = userData.userList[myIndex].id;

    //Hvem har jeg liket?
    var myLikeIdList = userData.userList[myIndex].likeIdList;
    
    //For loop, der gennemgår alle i databasen
    var responseList = [];
    for (i=0; i<userData.userList.length; i++) { 
        let otherUser = userData.userList[i];
        //Er det mit eget id, så spring over
        if (otherUser.id == myId)
            continue;
        
        //Har jeg liket id'et, adderes dette til nyt array
        if (myLikeIdList.includes(otherUser.id)) {
            let mutualMatch = otherUser.likeIdList.includes(myId);
            
            responseList.push({id: otherUser.id, name: otherUser.name, dateOfBirth: otherUser.dateOfBirth, zipCode: otherUser.zipCode, match: mutualMatch}); //objektet indeholder kun tilgængeligt data
        }
    }
    //Returner nyt array
    res.send(responseList);
};

exports.suggested_match = function (req, res) {
    let myIndex = getMyIndex(req);
    let myUser = userData.userList[myIndex];

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
    
    console.log(suggestedMatchList[index], index);
    res.send(suggestedMatchList[index]);
};

//CREATE
exports.user_create = function (req, res) {
    let user = new User( //der oprettes en ny bruger på baggrund af klassen "User" i user.model.js
        (++userData.lastUserId).toString(), //når der oprettes en ny bruger, tildeles den et id, som tæller fra de i forvejen oprettede brugeres id'er. 
        req.body.name, //her bruges body-parser, som er en udvidelse af Express
        req.body.dateOfBirth,
        req.body.zipCode,
        req.body.email,
        req.body.password,
        req.body.description
    );

    userData.userList.push(user); //indsæt som statisk data i JSON-fil
    console.log('user_create, user:', user); //det logges i consolen, at der er oprettet en ny bruger

    writeUserData(); //når der er oprettet en ny bruger skrives denne ind i "databasen" user.data.json

    res.send(user)
};

//UPDATE
exports.user_update = function (req, res) {
    let myIndex = getMyIndex();

    let user = userData.userList[myIndex];

    user.name = req.body.name;
    user.dateOfBirth = req.body.dateOfBirth;
    user.zipCode = req.body.zipCode;
    user.email = req.body.email;
    user.password = req.body.password;
    user.description = req.body.description;

    console.log('user_update, user:', user);

    writeUserData();

    res.send(user);
};

exports.user_like = function (req, res) {
    //Hvem er jeg?
    let myIndex = getMyIndex();
    let myUser = userData.userList[myIndex];

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
    //Hvilket index/id har jeg selv?
    let myIndex = getMyIndex();
    let myUser = userData.userList[myIndex];

    //Hvem vil jeg slette?
    let suggestedUser = req.body.id;

    let index = myUser.likeIdList.findIndex(x => x === suggestedUser);

    if(index != -1) {
        myUser.likeIdList.splice(index,1);
    }

    writeUserData();

    res.send(myUser.likeIdList);
};

exports.user_delete = function (req, res) {
    let myIndex = getMyIndex(req);

    let user = userData.userList[myIndex];

    userData.userList.splice(myIndex, 1); // remove from array https://www.w3schools.com/jsref/jsref_splice.asp
    console.log('user_delete, user:', user);

    writeUserData();

    res.send(user);
};