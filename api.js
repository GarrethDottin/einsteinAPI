var nodewiki = require('node-wikipedia');
var jsonParser 	= require('jsonfile');
var redis 		= require('redis');
var striptags = require('striptags');
var outputFile = 'outputFile.json';

var client 		= redis.createClient();
var scientists = ['Clifford_Brown', 'Clifford_Brown']; 
var modifiedResults = {}; 
modifiedResults.scientists = []; 

var numberOfScientists = scientists.length - 1;
scientists.map(function(val, counter) {
	if (numberOfScientists === counter ) {
		apiCall(val,writeToJSON())
	}
	else { 
		apiCall(val);
	}
});

function apiCall(name, callback) { 
	nodewiki.page.data(name, { content: true }, function(response) {
		var formattedData = formatResponse(response.text);
		var stringifiedData = stringified(formattedData, name);
		var cacheResults =  setInRedis(stringifiedData); 
		callback;
	});
}

function formatResponse (response) { 
	var uncleanedText = response['*'];
	var cleanedText = striptags(uncleanedText);
	return cleanedText;
}

function stringified(formattedData, name) {
	var keyValuePair = {}; 
	keyValuePair[name] = formattedData;
	modifiedResults.scientists.push(keyValuePair);
  	var modVal = JSON.stringify(modifiedResults);
  	return modVal; 
}

function setInRedis(value) { 
  	client.set('scientists', value);
}


function writeToJSON() { 
	client.get('scientists', function(err, reply){
	  	jsonParser.writeFile(outputFile, reply, function(err, obj) {
	  		console.log('Successfully wrote to File');
	  		client.quit();
   		});	
	});
}
 