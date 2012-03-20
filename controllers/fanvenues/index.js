var querystring = require('querystring'),
http     = require('http');

module.exports = function(app) {
    app.post(/^\/(getdata-2|getsectionlist-2)/,function(req,res) {
	console.log('here');
	console.log(req.body);
	var params = querystring.stringify(req.body, sep='&', eq='=');
	console.log(params);
	var base = '/'+req.params[0];
	var uri = base;
	console.log(uri);
	
	var options = {'host':'fanvenues2.appspot.com',
		       'port':80,
		       'path':uri,
		       'method': 'POST',
		       'headers': {
			   'Content-Type': 'application/x-www-form-urlencoded',
			   'Content-Length': params.length
		       }
		      };
	
	// Set up the request
	var post_req = http.request(options, function(res2) {
	    res2.setEncoding('utf8');
	    var str = '';
	    res2.on('data', function(d) {
		str = str+d;
	    });
	    
	    res2.on('end', function() {
		console.log(str);
		res.json(str);
	    });
	});

	// post the data
	post_req.write(params);
	post_req.end();
	
    });
};

