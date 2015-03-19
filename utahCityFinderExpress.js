var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var fs = require('fs');
var http = require('http');
var url = require('url');

var ROOT_DIR = "html/";
var MongoClient = require('mongodb').MongoClient;

var app = express();
var options = {
   host: '127.0.0.1',
   key: fs.readFileSync('ssl/server.key'),
   cert: fs.readFileSync('ssl/server.crt')
};

http.createServer(app).listen(80);
https.createServer(options, app).listen(443);

app.use(bodyParser.json());

app.get('/comment', function (req, res) {
   console.log("In comment route");
   MongoClient.connect("mongodb://localhost/weatherdb", function(err, db) {
      if (err) {
         throw err;
      }
      db.collection("comments", function(err, comments) {
         if (err) {
            throw err;
         }
         comments.find(function(err, items) {
            items.toArray(function(err, itemArr) {
               console.log("Document Array: ");
               console.log(itemArr);
               res.writeHead(200);
               res.end();
            });
         });
      });
   });
});

app.post('/comment', function (req, res) {
   console.log("IN POST COMMENT ROUTE");
   console.log(req.body);
   var jsonData = "";
   req.on('data', function(chunk) {
      console.log("GETTING DATA");
      jsonData += chunk;
   });
   req.on('end', function() {
      var reqObj = JSON.parse(jsonData);
      console.log(reqObj);
      console.log("Name: " + reqObj.Name);
      console.log("Comment: " + reqObj.Comment);
      
      MongoClient.connect("mongodb://localhost/weatherdb", function(err, db) {
         if (err) {
            throw err;
         }
         db.collection('comments').insert(reqObj, function(err, records) {
            console.log("Record added as " + records[0]._id);
         });
      });
      res.status(200);
      res.end();
   });
});

app.get('/', function (request, response) {
   response.send('Get Index');
});   

app.use('/', express.static('./html', { maxAge: 60*60*1000 }));

app.get('/getcity', function (request, response) {
   console.log("In getcity route");
   var urlObj = url.parse(request.url, true);
   fs.readFile(ROOT_DIR + "cities.dat.txt", function (err, data) {
      if (err) {
         throw err;
      }
      var cityPrefix = new RegExp("^" + urlObj.query["q"]);
      console.log(cityPrefix);
      var cities = data.toString().split("\n");
      var cityJson = [];
      for (var i = 0; i < cities.length; ++i) {
         var regExResult = cities[i].search(cityPrefix);
         if (regExResult != -1) {
            cityJson.push({ city: cities[i] });
            console.log(cities[i]);
         }
      }
      console.log(cityJson);
      console.log(JSON.stringify(cityJson));
      response.send(cityJson);
   });
});
