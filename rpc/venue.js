var ticketNetwork = require('../lib/wembli/ticketnetwork');
var async = require('async');

exports.venue = {

	get: function(args, req, res) {
		var me = this;
		args.cnt = (args.cnt) ? args.cnt : 15;
		console.log(args);
		//ticketNetwork.GetEvents({beginDate:date,nearZip:zip,orderByClause:'Date'},function(err,results) {
		ticketNetwork.GetVenue(args, function(err, results) {
			if (err) {
				return me(err);
			}

			//if lastEventId is passed in, determine which element has that Id and start the splice there
			var beginIdx = 0;
			if (args.lastEventId) {
				for (var i = results.Venue.length - 1; i >= 0; i--) {
					if (results.Venue[i].ID == args.lastVenueId) {
						beginIdx = i+1;
					}
				}
			}

			if (Object.prototype.toString.call( results.Venue ) === '[object Array]') {
				var venues = results.Venue.slice(beginIdx,args.cnt+beginIdx);
			} else {
				//there's only 1 and its not an array
				var venues = [results.Venue];
			}
			return me(null, {
				success: 1,
				venue: venues
			});
		});
	},

	getConfigurations: function(args,req,res) {
		var me = this;
		args.cnt = (args.cnt) ? args.cnt : 15;

		ticketNetwork.GetVenueConfigurations(args, function(err, results) {
			if (err) {
				return me(err);
			}

			//if lastEventId is passed in, determine which element has that Id and start the splice there
			var beginIdx = 0;
			if (args.lastEventId) {
				for (var i = results.VenueConfiguration.length - 1; i >= 0; i--) {
					if (results.VenueConfiguration[i].ID == args.lastVenueConfigurationId) {
						beginIdx = i+1;
					}
				}
			}

			if (Object.prototype.toString.call( results.VenueConfiguration ) === '[object Array]') {
				var events = results.VenueConfiguration.slice(beginIdx,args.cnt+beginIdx);
			} else {
				//there's only 1 and its not an array
				var events = [results.VenueConfiguration];
			}
			return me(null, {
				success: 1,
				venue: events
			});
		});
        }
}
