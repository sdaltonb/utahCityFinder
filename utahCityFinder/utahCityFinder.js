var fs = require('fs');
var http = require('http');
var url = require('url');

var ROOT_DIR = "html/";

http.createServer(function (req, res) {
   var urlObj = url.parse(req.url, true, false);
   if (urlObj.pathname.indexOf("getcity") != -1) {
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
	       cityJson.push({city:cities[i]});
	       console.log(cities[i]);
	    }            
         }
	 console.log(cityJson);
         console.log(JSON.stringify(cityJson));
   	 res.writeHead(200);
	 res.end(JSON.stringify(cityJson));
      });      
      console.log("GOT INTO GET CITY!!");
   } else {
      fs.readFile(ROOT_DIR + urlObj.pathname, function (err,data) {
         if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
         }

         console.log("URL path: " + urlObj.pathname);
         console.log("URL search: " + urlObj.search);
         console.log("URL query: " + urlObj.query['q']);
         res.writeHead(200);
         res.end(data);
      });
   }
}).listen(80);



//var options = {
//    hostname: 'localhost',
//    port: '80',
//    path: '/hello.html'
//  };
//function handleResponse(response) {
//  var serverData = '';
//  response.on('data', function (chunk) {
//    serverData += chunk;
//  });
//  response.on('end', function () {
//    console.log(serverData);
//  });
//}
//http.request(options, function(response){
//  handleResponse(response);
//}).end();
