/*This is a snippet of codes realizing the bing search function on the website.
  For realizing this function, our application needs to use the bing search API.
  However, Microsoft only provides us an example which shows how to output the result on the terminal in just one function.
  As an application, it needs to get the user input from the website and transmit it to the backend, which shows below.

  A problem occurs when I try to output the results on the website instead of in the terminal.
  Since there are two functions, one is to get the bing search result, and the other is to display the result on the website, 
  I have to find a way to allow two functions use the same variable, which is the result.
  I try to define a global variable and allow both of functions to modify and get it, it does not work.
  Javascript is not the same as C, C++ or Java.
  Then I find a property of Javascript, which is trace back. 
  This property allows us to use embedded functions and the inner function can also access to the variables in the outer one, which solves the problem.

  Since I have never used Javascript before, I believe this snippet could demonstrate my ability of self-learning and problem-solving.*/

var express = require('express');
var router = express.Router();
var path1 = require('path');
var mysql = require('mysql');

var https = require('https');
var subscriptionKey = 'ca99f77c6dbd460cb89a73353941b9e7';//set the key for using the bing search API
var host = 'api.cognitive.microsoft.com';
var path = '/bing/v7.0/search';//use the API

var getJSON = function (search, onResult){
  console.log('Searching the Web for: ' + search);
  var request_params = {
        method : 'GET',
        hostname : host,
        path : path + '?q=' + encodeURIComponent(search),
        headers : {
            'Ocp-Apim-Subscription-Key' : subscriptionKey,
        }
    };
  var reques = https.request(request_params, function (response) {
    body = '';
    response.on('data', function (d) {
        body += d;//get the search result
    });
    response.on('end', function () {
        console.log('\nRelevant Headers:\n');
        for (var header in response.headers)
            // header keys are lower-cased by Node.js
            if (header.startsWith("bingapis-") || header.startsWith("x-msedge-"))
                 console.log(header + ": " + response.headers[header]);
        //body = JSON.stringify(JSON.parse(body), null, '  ');
        body = JSON.parse(body);//get the JSON format of the result
        onResult(response.statusCode, body);
        //console.log('\nJSON Response:\n');
        //console.log(body.webPages.value);

    });
    response.on('error', function (e) {
        console.log('Error: ' + e.message);
    });
  });
  reques.end();
}

router.post('/bingpage', function(req, res, next) {
  var term = req.body.info;
  //console.log(this.body.webPages.value);
  if (subscriptionKey.length === 32) {
    //bing_web_search(term);
    getJSON(term, function(statusCode, result) {
      //load the stylew
      template = require('jade').compileFile(path1.join(__dirname, '../',  '/source/templates/bingpage.jade'));
      // I could work with the result html/json here.  I could also just return it
      //console.log("onResult: (" + statusCode + ")" + JSON.stringify(result));
      //res.statusCode = statusCode;
      //console.log('\nJSON Response:\n');
      //console.log(result.webPages.value);

      try {
        var html = template({ title: 'Bing' , rows: result.webPages.value})//shows the result on the website
        res.send(html)
      } catch (e) {
        next(e)
      }
      //res.send(result);
    });

  } else {
      console.log('Invalid Bing Search API subscription key!');
      console.log('Please paste yours into the source code.');
  }

});