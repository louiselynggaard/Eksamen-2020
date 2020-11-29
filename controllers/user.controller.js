const fs = require('fs'); //node.js filesystem gør det muligt at læse, oprette, opdatere, slette filer

const User = require('../models/user.model'); //klasse hentes fra denne mappe.

function readUserData() { //sørger for at hver gang serveren startes, så loades alt hvad der er tilgængeligt i "databasen" user.data.json
    let fileData = fs.readFileSync('./app_data/user.data.json', 'utf8', function (err) {
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

var userData = readUserData(); //variablen userData oprettes ud fra det funktionen finder i json-filen/"databasen" user.data.json

exports.user_create = function (req, res) {
    let user = new User( //der oprettes en ny bruger på baggrund af klassen "User" i user.model.js
        (++userData.lastUserId).toString(), //når der oprettes en ny bruger, tildeles den et id, som tæller fra de i forvejen oprettede brugeres id'er. 
        req.body.name, //her bruges body-parser, som er en udvidelse af Express
        req.body.dateOfBirth,
        req.body.zipCode,
        req.body.email,
        req.body.password
    );

    userData.userList.push(user); //indsæt som statisk data i JSON-fil
    console.log('user_create, user:', user); //det logges i consolen, at der er oprettet en ny bruger

    writeUserData(); //når der er oprettet en ny bruges skrives denne ind i "databasen" user.data.json

    res.send(user)
};