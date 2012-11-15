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

	get: function(args, req, res) {
		var me = this;

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
			var cb = function() {
				console.log(events);
				return me(null, {
					success: 1,
					event: events
				});
			};

			async.forEach(events, function(item, callback) {
				//format the date info

				//get the ticket pricing info for this event
				ticketNetwork.GetPricingInfo({
					eventID: item.ID
				}, function(err, results) {
					if (err) {
						callback(err);
					} else {
						item.TicketPricingInfo = results;
						console.log(results);
						callback();
					}
				});
			}, cb);
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
