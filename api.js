	var nodewiki = require('node-wikipedia');
	var jsonParser 	= require('jsonfile');
	var redis 		= require('redis');
	var striptags = require('striptags');
	var outputFile = 'outputFile.json';
	var testFile = 'scientists.json';
	// var client 		= redis.createClient();
	var scientists = ['Clifford_Brown', 'Clifford_Brown']; 
	var modifiedResults = {}; 
	modifiedResults.scientists = []; 


	// Add in century & name to a hash thats passed around 
	// Fix Name so spaces are replaced with _
	// Get rid of MusicBrain from text 

	jsonParser.readFile(testFile, function(err, obj) {
		var modObj = obj.map(function(val) {
			var newObj = {}; 
			newObj.title = val.title.split(" ").join("_");
			newObj.century = val.century;
			return newObj;
		});
	});
	var numberOfScientists = scientists.length - 1;
	function cycleScientists (set) { 
		var numberOfScientists = set.length - 1;
		set.map(function(val, counter) {
			if (numberOfScientists === counter ) {
				apiCall(val,writeToJSON())
			}
			else { 
				apiCall(val);
			}
		});
	}


	function apiCall(val, callback) { 
		nodewiki.page.data(val.title, { content: true }, function(response) {
			var formattedData = formatResponse(response.text);
			var stringifiedData = stringified(formattedData, val);
			var cacheResults =  setInRedis(stringifiedData); 
			callback;
		});
	}

	function formatResponse (response) { 
		var uncleanedText = response['*'];
		var cleanedText = striptags(uncleanedText);
		return cleanedText;
	}

	function stringified(formattedData, val) {
		var keyValuePair = {}; 
		keyValuePair[val.title] = {};
		keyValuePair[val.title].century = val.century; 
		keyValuePair[val.title].data = formattedData;
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
 