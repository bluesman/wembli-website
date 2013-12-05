var ticketNetwork = require('../lib/wembli/ticketnetwork');
var pw = require('../lib/wembli/parkwhiz');
var yipit = require('../lib/wembli/yipit');
var async = require('async');

exports.event = {
	init: function(args, req, res) {
		var me = this;
		me(null, data);
	},

	search: function(args, req, res) {
		var me = this;
		args.cnt = (args.cnt) ? args.cnt : 15;

		/* where clause for search */
		var daysPadding = 2; //how many days from today for the beginDate
		var d1 = Date.today();
		var d = new Date(d1);
		d.setDate(d1.getDate() + daysPadding);

		dateFmt = d.format("isoDateTime")
		args.whereClause = "Date > DateTime(\"" + dateFmt + "\")";
		args.orderByClause = 'Date';
		//ticketNetwork.GetEvents({beginDate:date,nearZip:zip,orderByClause:'Date'},function(err,results) {
		ticketNetwork.SearchEvents(
		{
			searchTerms: args.searchTerms,
			//whereClause: args.whereClause,
			orderByClause: args.orderByClause
		},
		function(err, results) {

			if (err) {
				return me(err);
			}

			if (typeof results.Event === "undefined") {
				return me(null,{success:1,event:[]});
			}

			if (Object.prototype.toString.call(results.Event) === '[object Array]') {
				/* filter out events that sart with PARKING */
				results.Event = results.Event.filter(function(el) {
					return (/^PARKING/.test(el.Name)) ? false : true;
				});
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
			if (typeof results.Event === "undefined") {
				return me(null,{success:1,event:[]});
			}

			if (Object.prototype.toString.call(results.Event) === '[object Array]') {
				/* filter out events that sart with PARKING */
				results.Event = results.Event.filter(function(el) {
					return (/^PARKING/.test(el.Name)) ? false : true;
				});
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



	getEventPerformers: function(args, req, res) {
		var me = this;

		//get the ticket pricing info for this event
		ticketNetwork.GetEventPerformers({
			eventID: args.eventID
		}, function(err, results) {
			if (err) {
				return me(err);
			}
			var ret = {
				success: 1,
				eventPerformers: results
			};
			return me(null, ret);
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
	},

	getRestaurantDeals: function(args, req, res) {
		var me = this;
		/*convert date into timestamp */
		var date = req.session.plan.event.eventDate;
		var eDate = new Date(date);
		eDate.clearTime();
		eDate.addHours(9);
		var start = eDate.getTime() / 1000;
		eDate.addHours(5);
		var end = eDate.getTime() / 1000;
		/* get the deals for this lat/log */
		//pw.search({lat:geocode[0].lat,lng:geocode[0].lon,start:start,end:end}, function(err, results) {
		yipit.deals({
			lat: req.session.plan.venue.data.geocode.geometry.location.lat,
			lon: req.session.plan.venue.data.geocode.geometry.location.lng,
			radius: args.radius || 10,
			tag:'restaurants'
		}, function(err, results) {
			if (err) {
				return me(err);
			}
			me(null,{success:1,deals:results.response.deals});
		});
	},

	getHotels: function(args, req, res) {
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
			me(null,{success:1,hotels:results});
		});
	}

};
