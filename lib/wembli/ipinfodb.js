var wembliUtils = require('../wembli/utils');

(function() {
    var apiKey = '2e09afd55f51e1f56b6ae617dd56d4c97d5277aaa1762359fbc6463179c980ff';
    var requestOptions = {'host':'api.ipinfodb.com',
			  'port':80};


    var ipinfodb = {};
    ipinfodb.getAddressByIp = function(args,callback) {
	var template = {
	    path:'/v3/ip-city/',
	    key:apiKey,
	    format:"json",
	    ip:null
	};
	args       = wembliUtils.merge(requestOptions,args);
	var params = wembliUtils.merge(template,args);
	wembliUtils.makeRequest(params,callback);	
    }

    module.exports = function(req,res,next) {
	if (typeof req.session.ipinfo == "undefined") {
	    var ipAddress = req.headers['x-forwarded-for'];
	    console.log(ipAddress);
	    if ((/(\d+)\.(\d+)\.(\d+)\.(\d+)/.test(ipAddress)) && ipAddress != '127.0.0.1') {
	    } else {
		ipAddress = "184.106.146.14";
	    }
	    ipinfodb.getAddressByIp({ip:ipAddress},function(err,ipinfo) {
		req.session.ipinfo = ipinfo;
		next();
	    });
	} else {
	    next();
	}
    }

}());