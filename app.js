const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

//Middleware
app.use(express.static(__dirname + '/views'));

const userRoute = require('./routes/user.route');
app.use('/api/user', userRoute);

let port = 3000;
app.listen(port, () => {
    console.log('Listening af port ' + port); 
});