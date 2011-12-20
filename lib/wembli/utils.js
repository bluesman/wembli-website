var querystring = require('querystring'),
    async = require('async'),
    http = require('http');

module.exports = {
 
    deepCopy: function(p,c) {
	return _deepCopy(p,c);
    },
    sort: function(ary,key,order) {
	//make sure our ary is an ary
	if (!(Array.isArray(ary))) {
	    ary = [ary];
	}
	order = ((typeof order == "undefined") || (order == 'asc')) ? 'asc' : 'desc';
	var greaterThan = 1;
	var lessThan = -1;
	if (order == 'desc') {
	    greaterThan = -1;
	    lessThan = 1;
	}
	ary.sort(function(a,b) { 
	    if (a[key] > b[key]) return greaterThan;
	    if (a[key] < b[key]) return lessThan;
	    return 0;
	});
	return ary;
    },

    merge: function (o1,o2) {
	for(var i in o2) { o1[i] = o2[i]; }
	return o1;
    },

    makeRequest: function(args,callback) {
	var options = {};
	options.host = args.host;
	delete args['host'];
	options.port = args.port;
	delete args['port'];
	options.path = args.path;
	delete args['path'];

	var uri = querystring.stringify(args, sep='&', eq='=');
	options.path += '?'+uri;
	
	console.log(options);
    
	var req = http.request(options, function(res) {
	    res.setEncoding('utf8');
	    var str = '';
	    res.on('data', function(d) {
		str = str+d;
	    });
	    
	    res.on('end', function() {
		callback(null,JSON.parse(str));
	    });
	    
	});
	
	req.end();
	
	req.on('error', function(e) { callback(e); });
    }
}

function _deepCopy(p,c) {
    var c = c||{};
    for (var i in p) {
	if (typeof p[i] === 'object') {
	    c[i] = (p[i].constructor === Array)?[]:{};
	    _deepCopy(p[i],c[i]);
	} else {
	    c[i] = p[i];
	}
    }
    return c;
}