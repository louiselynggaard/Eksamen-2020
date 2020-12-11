const http = require('http');

function callCreate(testId, expectedStatusCode, postBody) { //kilde til anvendt kode: https://stackoverflow.com/questions/6158933/how-is-an-http-post-request-made-in-node-js

    var postBodyString = JSON.stringify(postBody);

    // An object of options to indicate where to post to
    var options = {
        host: 'localhost',
        port: 3000,
        path: '/api/user/create',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postBodyString)
        }
    };

    // Set up the request    
    var post_req = http.request(options, function(res) {
        console.log("Test: " + testId, "- Expected StatusCode:" 
        + expectedStatusCode, '- StatusCode: ' + res.statusCode, "- Test passed: " 
        + (res.statusCode==expectedStatusCode));
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    });

    // post the data
    post_req.write(postBodyString);
    post_req.end();
}


var postBody = //test cases fyldes i modellen
{
    "name":"Timon",
    "dateOfBirth":"2020-10-10",
    "zipCode":"2000",
    "email":"timon@gmail.com",
    "password":"Timon1234",
    "description":""
};

callCreate("1", 200, { "name":"Simba", "dateOfBirth":"2020-05-05", "zipCode":"4040", "email":"simba@gmail.com", "password":"Simba1234", "description":"ROAR!" } );
callCreate("2", 400, postBody);
callCreate("3", 400, { "name":"Pumba", "dateOfBirth":"", "zipCode":"2000", "email":"Pumba@gmail.com", "password":"Pumba1234", "description":"Jeg har luft i maven" } );

