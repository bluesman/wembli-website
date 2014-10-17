var wembliUtils = require('./utils');
var key = "8sDRmrnmTXntsAgtNp3wxo4KBc4GwUDFngwJHU6ASt4k4lORLRoigs3SF8yb3bRq";

/* http://zipcodedistanceapi.redline13.com/API */
module.exports = {
	lookup: function(zip, radius, units, cb) {
		if (typeof units === "undefined") {
			units = 'miles';
		}

		var params = {
			'host':'zipcodedistanceapi.redline13.com',
			'port':80,
			'path':'/rest/'+key+'/radius.json/'+zip+'/'+radius+'/'+units,
		}
		wembliUtils.makeRequest(params, cb);
	}
};
