const fs = require('fs');

const User = require('../models/user.model'); //klasse hentes fra denne mappe.

function readUserData() { //sørger for at hver gang serveren startes, så loades alt hvad der er tilgængeligt i "databasen" user.data.json
    let fileData = fs.readFileSync('./app_data/user.data.json', 'utf8', function (err) {
        if (err) return console.log(err);
    });
       
    console.log('Loaded: user.data.json');
    return JSON.parse(fileData);
};

var userData = readUserData();

exports.user_create = function (req, res) {
    let user = new User(
        (++userData.lastUserId).toString(),
        req.body.name,
        req.body.dateOfBirth,
        req.body.zipCode,
        req.body.email,
        req.body.password
    );

    userData.userList.push(user); //indsæt som statisk data i JSON-fil
    console.log('user_create, user:', user);

    res.send(user)
};