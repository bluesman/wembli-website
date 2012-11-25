var ticketNetwork = require('../lib/wembli/ticketnetwork');
var async = require('async');

exports.event = {
	init: function(args, req, res) {
		var me = this;
		var data = {
			payment:'group',
			restaurant:true,
			parking:true,
			hotel:false,
			over21: false,
			guestFriends: true,
			guestList: 'full',
			errors: {}
		};

		if (typeof req.session.eventOptionsForm != "undefined") {
			data = req.session.eventOptionsForm;
		}

		me(null,data);

	},

	search: function(args, req, res) {
		var me = this;
		console.log('search args:');
		console.log(args);
		args.cnt = (args.cnt) ? args.cnt : 15;
		//ticketNetwork.GetEvents({beginDate:date,nearZip:zip,orderByClause:'Date'},function(err,results) {
		ticketNetwork.SearchEvents(args, function(err, results) {
			if (err) { return me(err);	}


			//if lastEventId is passed in, determine which element has that Id and start the splice there
			var beginIdx = 0;
			if (args.lastEventId) {
				for (var i = results.Event.length - 1; i >= 0; i--) {
					if (results.Event[i].ID == args.lastEventId) {
						beginIdx = i+1;
					}
				}
			}

			if (Object.prototype.toString.call( results.Event ) === '[object Array]') {
				var events = results.Event.slice(beginIdx,args.cnt+beginIdx);
			} else {
				//there's only 1 and its not an array
				var events = [results.Event];
			}

			return me(null, {
				success: 1,
				event: events
			});
		});
	},

	get: function(args, req, res) {
		var me = this;
		console.log('here');
		args.cnt = (args.cnt) ? args.cnt : 15;

		if (args.nearZip == "undefined") {
			//get more top events
			delete args.nearZip;
		}

		//ticketNetwork.GetEvents({beginDate:date,nearZip:zip,orderByClause:'Date'},function(err,results) {
		ticketNetwork.GetEvents(args, function(err, results) {
			if (err) {
				return me(err);
			}

			//if lastEventId is passed in, determine which element has that Id and start the splice there
			var beginIdx = 0;
			if (args.lastEventId) {
				for (var i = results.Event.length - 1; i >= 0; i--) {
					if (results.Event[i].ID == args.lastEventId) {
						beginIdx = i+1;
					}
				}
			}

			if (Object.prototype.toString.call( results.Event ) === '[object Array]') {
				var events = results.Event.slice(beginIdx,args.cnt+beginIdx);
			} else {
				//there's only 1 and its not an array
				var events = [results.Event];
			}
			return me(null, {
				success: 1,
				event: events
			});
		});
	},
	getPricingInfo: function(args, req, res) {
		var me = this;

		//get the ticket pricing info for this event
		ticketNetwork.GetPricingInfo({
			eventID: args.eventID
		}, function(err, results) {
			if (err) {
				return me(err);
			}
			console.log(results);
			var ret = {
				success: 1,
				ticketPricingInfo: results
			};
			return me(null,ret);
		});
	},
	getTickets: function(args, req, res) {
		var me = this;

		ticketNetwork.GetEvents({
			eventID: args.eventID
		}, function(err, results) {
			if (err) {
				return me(err);
			}
			var ret = {
				success: 1,
				event: results.Event
			};
			ticketNetwork.GetTickets(args, function(err, results) {
				if (err) {
					return me(err);
				}
				ret.tickets = results.TicketGroup;
				me(null, ret);
			});
		});
	},

};
