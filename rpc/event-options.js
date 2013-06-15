var ticketNetwork = require('../lib/wembli/ticketnetwork');
var async = require('async');

exports['event-options'] = {
	init: function(args, req, res) {
		var me = this;
		var data = {
			restaurant   : req.session.plan.preferences.addOns.restaurant          || false,
			parking      : req.session.plan.preferences.addOns.parking             || false,
			hotel        : req.session.plan.preferences.addOns.hotel               || false,
			over21       : req.session.plan.preferences.inviteOptions.over21       || false,
			guestFriends : req.session.plan.preferences.inviteOptions.guestFriends || false,
			guestList    : req.session.plan.preferences.guestList                  || 'rsvp',
			errors: {}
		};

		if (req.session.plan.organizer.rsvp.decision === null) {
		    data.organizerNotAttending = false;
		} else {
		    data.organizerNotAttending = !req.session.plan.organizer.rsvp.decision;
		}
		if (typeof req.session.eventOptionsForm !== "undefined") {
			data = req.session.eventOptionsForm;
		}
		console.log('event options:');
		console.log(data);
		me(null,data);
	}
};
