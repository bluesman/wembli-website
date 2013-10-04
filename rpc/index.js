var ticketNetwork = require('../lib/wembli/ticketnetwork');

exports.index = {
	init: function(args,req,res) {
		var me = this;
		var data = {
			success:1,
		};
		me(null,data);
	},

	getHighSalesPerformers: function(args, req, res) {
		var me = this;
		ticketNetwork.GetHighSalesPerformers(args, function(err, results) {
			if (err) {
				return me(err);
			}

			return me(null, {
				success: 1,
				performers: results.PerformerPercent
			});
		});
	}

}
