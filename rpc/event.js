var ticketNetwork = require('../lib/wembli/ticketnetwork');
var pw = require('../lib/wembli/parkwhiz');
var async = require('async');

exports.event = {
	init: function(args, req, res) {
		var me = this;
		me(null, data);
	},

	search: function(args, req, res) {
		var me = this;
		args.cnt = (args.cnt) ? args.cnt : 15;
		//ticketNetwork.GetEvents({beginDate:date,nearZip:zip,orderByClause:'Date'},function(err,results) {
		ticketNetwork.SearchEvents(args, function(err, results) {
			if (err) {
				return me(err);
			}

			//if lastEventId is passed in, determine which element has that Id and start the splice there
			var beginIdx = 0;
			if (args.lastEventId) {
				for (var i = results.Event.length - 1; i >= 0; i--) {
					if (results.Event[i].ID == args.lastEventId) {
						beginIdx = i + 1;
					}
				}
			}

			if (Object.prototype.toString.call(results.Event) === '[object Array]') {
				var events = results.Event.slice(beginIdx, args.cnt + beginIdx);
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
						beginIdx = i + 1;
					}
				}
			}

			if (Object.prototype.toString.call(results.Event) === '[object Array]') {
				var events = results.Event.slice(beginIdx, args.cnt + beginIdx);
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
			var ret = {
				success: 1,
				ticketPricingInfo: results
			};
			return me(null, ret);
		});
	},
	getTickets: function(args, req, res) {
		var me = this;
		ticketNetwork.GetEvents({
			eventID: args.eventID
		}, function(err, results) {
			if (err) {
				console.log('ERROR');
				console.log(err);
				return me(err);
			}
			var ret = {
				success: 1,
				event: results.Event
			};
			ticketNetwork.GetTickets(args, function(err, results) {

				if (err) {
					console.log('ERROR GETTING TIX');
					console.log(err);
					return me(err);
				}
				ret.tickets = [];
				if (typeof results.TicketGroup !== "undefined") {

					ret.tickets = (typeof results.TicketGroup.length == "undefined") ? [results.TicketGroup] : results.TicketGroup;
				} else {
					ret.success = 0;
					ret.error = 'no tickets';
				}
				me(null, ret);
			});
		});
	},
	getParking: function(args, req, res) {
		var me = this;
		/*convert date into timestamp */
		var date = req.session.plan.event.eventDate;
		var eDate = new Date(date);
		eDate.clearTime();
		eDate.addHours(9);
		var start = eDate.getTime() / 1000;
		eDate.addHours(5);
		var end = eDate.getTime() / 1000;
		/* get the parking for this lat/log */
		//pw.search({lat:geocode[0].lat,lng:geocode[0].lon,start:start,end:end}, function(err, results) {
		pw.search({
			lat: req.session.plan.venue.data.geocode.geometry.location.lat,
			lng: req.session.plan.venue.data.geocode.geometry.location.lng,
			start: start,
			end: end
		}, function(err, results) {
			if (err) {
				return me(err);
			}
			me(null,{success:1,parking:results});
		});
	}

};
