const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

app.use(express.static(__dirname + '/views'));

let port = 3000;
app.listen(port, () => {
    console.log('Listening af port ' + port); 
});