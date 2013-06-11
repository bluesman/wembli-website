var keen = require('../lib/wembli/keenio');
exports.analytics = {
	addEvent: function(args, req, res) {
		var me = this;
		if (args.collection) {
			var collection = args.collection;
			delete args.collection;
			keen.addEvent(collection, args, req, res, function(err, result) {
				if (err) {
					console.log('error logging keenio event');
					console.log(err);
					return me(err);
				} else {
					console.log('logged event in keenio:');
					console.log(result);
					return me(null,result);
				}
			});
		};
	}
};
