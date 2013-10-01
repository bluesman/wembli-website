var keen = require('../lib/wembli/keenio');
exports.analytics = {
	addEvent: function(args, req, res) {
		var me = this;
		if (args.collection) {
			var collection = args.collection;
			delete args.collection;
			keen.addEvent(collection, args, req, res, function(err, result) {
				if (err) {
					return me(err);
				} else {
					return me(null,result);
				}
			});
		};
	}
};
