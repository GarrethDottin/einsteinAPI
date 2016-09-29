	var nodewiki = require('node-wikipedia');
	var jsonParser 	= require('jsonfile');
	var redis 		= require('redis');
	var striptags = require('striptags');
	var outputFile = 'outputFile.json';
	var testFile = 'scientists.json';
	var client 		= redis.createClient();
	var scientists = ['Clifford_Brown', 'Clifford_Brown']; 
	var modifiedResults = {}; 
	modifiedResults.scientists = []; 

	// 	Try Endpoint Call 
	//	setup method to replace certain text 

	jsonParser.readFile(testFile, function(err, obj) {
		var modObj = obj.map(function(val) {
			var newObj = {}; 
			newObj.title = val.title.split(" ").join("_");
			newObj.century = val.century;
			return newObj;
		});
		var test = [modObj[0]]
		cycleScientists(test);
	});

	function cycleScientists (set) { 
		var numberOfScientists = set.length - 1;
		set.map(function(val, counter) {
			if (numberOfScientists === counter ) {
				console.log('api end of call');
				apiCall(val,getCachedResults());
			}
			else {
				console.log('api first call');
				apiCall(val);
			}
		});
	}

	function apiCall(val, callback) { 
		nodewiki.page.data(val.title, { content: true }, function(response) {
			console.log('response');
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
		keyValuePair.title = val.title;
		keyValuePair.century = val.century; 
		keyValuePair.text = formattedData;
		modifiedResults.scientists.push(keyValuePair);
	  	var modVal = JSON.stringify(modifiedResults);
	  	return modVal; 
	}

	function setInRedis(value) { 
	  	client.set('scientists', value);
	}


	function writeToJSON(reply) { 
	  	jsonParser.writeFile(outputFile, reply, function(err, obj) {
	  		console.log('Successfully wrote to File');
	  		client.quit();
   		});	
	}
 
 	function getCachedResults() { 
		client.get('scientists', function(err, reply){
			var cleanedData = dataCleaner(reply);
			writeToJSON(reply);
		});
	}

	function dataCleaner(data) { 
		var cleanedData = data.map(function(obj){
			obj.text = obj.text.replace(/MusicBrain/g, "");
			return obj;
		}); 
		return cleanedData;
	}