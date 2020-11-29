const express = require('express');
const bodyParser = require('body-parser');
//const fs = require('fs');
//const http = require('http');
//console.log(http.METHODS); //Viser alle tilgængelige http-metoder vdr. API'er.
//console.log(http.STATUS_CODES); //Viser alle tilgængelige hhtp-statuskoder - forespørgsler fra browseren til serveren.

const app = express();

//Middleware
app.use(bodyParser.json()); //gør det muligt at læse 'body' via Express
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/views'));

const userRoute = require('./routes/user.route');
app.use('/api/user', userRoute);

let port = 3000;
app.listen(port, () => {
    console.log('Listening at port ' + port); 
});