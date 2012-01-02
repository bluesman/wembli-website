var querystring = require('querystring'),
http     = require('http');

module.exports = function(app) {
    app.post(/^\/(getdata-2|getsectionlist-2)/,function(req,res) {
	console.log(req.body);
	var params = querystring.stringify(req.body, sep='&', eq='=');
	var base = '/'+req.params[0];
	var uri = base + '?'+params;
	console.log(uri);
	
	var options = {'host':'fanvenues2.appspot.com',
		       'port':80,
		       'path':uri};
	
	http.get(options,function (res2) {
	    var str = '';
	    res2.on('data', function(d) {
		str = str+d;
	    });
	    
	    res2.on('end', function() {
		res.json(str);
	    });
	});
	
    });
};

