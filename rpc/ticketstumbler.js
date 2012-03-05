var sys = require('sys'),
    http = require('http'),
    querystring = require('querystring'),
    venue = require('../models/venue');

var host    = "ticketstumbler.com";
var port    = 80;
var baseUri = "/api/1.0/rest/";
var token   = "b1773c";
var venueObj = new Venue();

/*
input: uri: (venue/search.json)
       args: ({name:Petco Park})
       map: (venue) - a phatseat collection to try and map results to
*/

exports.ticketstumbler = {
    request: function(uri,args,map) {
	var me = this;
	args['token'] = token;
	var reqUri = baseUri+uri+'?'+querystring.stringify(args);
	sys.log('requesting: '+reqUri);

	var ts = http.createClient(port, host);
	var request = ts.request('GET', reqUri, {'host': host});
	request.end();
	request.on('response', function (response) {
		//TODO: error handling - check response: response.statusCode;
		//if you want headers: response.headers
		response.setEncoding('utf8');
		var string = '';

		response.on('data', function (chunk) {
			string += chunk;
			//once we've streamed in the entire response body
		    });

		response.on('end', function() {
			results = JSON.parse(string);
			//now i have a list of ticketstumbler results
			//if the request says map:
			//loop through the results and fetch a matching phatseat result
			//match criteria are defined by the mappingFunctions based on the value of the map argument
			if (map) {
			    //now we need to make sure that all the mapping functions have the opportunity to run
			    //before returning back to the client...
			    me.totalCallbacksToRun = results.length; //we won't return until totalcallbacks to run =< 0
			    results.forEach(function(el) {
				    //see if phatseat is mapped to the result with this id
				    mappingFunctions[map](me,el);
				});
			} else {
			    //just return the ticketstumbler results, not mapped to phatseat data
			    me(null,results);
			}
		    });
	    });
    }
};

//these functions tell you how to associate phatseat objects to ticketstumbler objs
var mappingFunctions = {
    venue :function(me,el) {
	    //find a phatseat venue that is mapped to this source
	    venueObj.findBySource({source:"ticketstumbler",id: el.id},function(error,phatseatVenue) {
		    --me.totalCallbacksToRun; //decrement the totalCallbacksToRun once we've this result into the global storage
		    if (error) { 
			me(error);
                    } else {
			if (phatseatVenue) {
			    phatseatVenue.id = phatseatVenue._id.toHexString();
			    el.match = phatseatVenue; //put the match with the ts result
			}

			//load this match into a global array - to be returned to the client
			if ("undefined" !== typeof me.results) {
			    me.results.push(el);
			} else {
			    me.results = [el];
			}
			
			//return back to the client when all the callbacks have run
			if (me.totalCallbacksToRun <= 0) {
			    //seems like there is a race condition here that might result in this getting called twice..
			    //return the global array
			    me(null,me.results);
			}

		    }
		});
    }
};
