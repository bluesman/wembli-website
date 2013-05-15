var ticketNetwork = require('../lib/wembli/ticketnetwork');
var async = require('async');

exports.performer = {
	init: function(args, req, res) {
		var me = this;
		me(null,data);
	},

	get: function(args, req, res) {
		var me = this;
		args.cnt = (args.cnt) ? args.cnt : 15;

		//ticketNetwork.GetEvents({beginDate:date,nearZip:zip,orderByClause:'Date'},function(err,results) {
		ticketNetwork.GetEventPerformers(args, function(err, results) {
			console.log('performer.get');
			console.log(results);
			if (err) {
				return me(err);
			}

			//if lastEventId is passed in, determine which element has that Id and start the splice there
			var beginIdx = 0;
			if (args.lastEventId) {
				for (var i = results.Performer.length - 1; i >= 0; i--) {
					if (results.Performer[i].ID == args.lastPerformerId) {
						beginIdx = i+1;
					}
				}
			}

			if (Object.prototype.toString.call( results.Performer ) === '[object Array]') {
				var performers = results.Performer.slice(beginIdx,args.cnt+beginIdx);
			} else {
				//there's only 1 and its not an array
				var performers = [results.Performer];
			}
			return me(null, {
				success: 1,
				performer: performers
			});
		});
	},


	search: function(args, req, res) {
		var me = this;
		args.cnt = (args.cnt) ? args.cnt : 15;
		ticketNetwork.SearchPerformers(args, function(err, results) {
			if (err) { return me(err); }

			//if lastPerformerId is passed in, determine which element has that Id and start the splice there
			var beginIdx = 0;
			if (args.lastPerformerId) {
				for (var i = results.Performer.length - 1; i >= 0; i--) {
					if (results.Performer[i].ID == args.lastPerformerId) {
						beginIdx = i+1;
					}
				}
			}

			if (Object.prototype.toString.call( results.Performer ) === '[object Array]') {
				var performers = results.Performer.slice(beginIdx,args.cnt+beginIdx);
			} else {
				//there's only 1 and its not an array
				var performers = [results.Performer];
			}

			return me(null, {
				success: 1,
				performer: performers
			});
		});
	},


};