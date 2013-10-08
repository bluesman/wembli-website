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
		me(null,data);
	},

	submit: function(args, req, res) {
		var me = this;
		var data = {success:1};

		/* if this visitor already has a req.session.plan
			and they are the organizer
			and it is the same eventId as req.session.eventId
			then override only the preferences */
		if ((req.session.visitor.context === "organizer") || ((req.session.visitor.context === 'visitor') && (typeof req.session.plan.organizer.customerId === "undefined"))) {
			//set the form data in the session so the angular app can read any errors
			req.session.eventOptionsForm = {
				parking: args.parking ? true : false,
				restaurant: args.restaurant ? true : false,
				hotel: args.hotel ? true : false,
				organizerNotAttending: args.organizer_not_attending ? true : false,
				guestFriends: args.guest_friends ? true : false,
				over21: args.over_21 ? true : false,
				guestList: args.guest_list,
				errors: {}
			};
			//add-ons
			//parking, restaurant or hotel
			req.session.plan.preferences.addOns = {
				'parking': false,
				'restaurant': false,
				'hotel': false
			}

			if (typeof args.parking !== "undefined") {
				req.session.plan.preferences.addOns.parking = req.session.eventOptionsForm.parking;
			}
			if (typeof args.restaurant !== "undefined") {
				req.session.plan.preferences.addOns.restaurants = req.session.eventOptionsForm.restaurant;
			}
			if (typeof args.hotel !== "undefined") {
				req.session.plan.preferences.addOns.hotels = req.session.eventOptionsForm.hotel;
			}

			//invite options: guest_friends, over_21
			req.session.plan.preferences.inviteOptions = {
				'guestFriends': true, //guests are allowed to invite friends
				'over21': false //lets guests know kids are not invited
			}

			if (typeof args.organizer_not_attending !== "undefined") {
				req.session.plan.organizer.rsvp.decision = args.organizer_not_attending ? false : true;
			}
			if (typeof args.guest_friends !== "undefined") {
				req.session.plan.preferences.inviteOptions.guestFriends = req.session.eventOptionsForm.guestFriends;
			}
			if (typeof args.over_21 !== "undefined") {
				req.session.plan.preferences.inviteOptions.over21 = req.session.eventOptionsForm.over21;
			}

			//guest list privacy options: full, rsvp, private
			if ((args.guest_list === 'full') || (args.guest_list === 'rsvp') || (args.guest_list === 'private')) {
				req.session.plan.preferences.guestList = args.guest_list;
			} else {
				req.session.eventOptionsForm.errors.guestList = true;
			}

			data.eventOptions = req.session.eventOptionsForm;

			if (Object.keys(req.session.eventOptionsForm.errors).length > 0) {
				data.success = 0;
				return me(null,data);
			}

			/* actually save this in the db if they are logged in */
			if (req.session.loggedIn) {
				req.session.plan.save(function(err, result) {
					return me(null,data);
				});
			} else {
				return me(null, data);
			}
		} else {
			data.success = 0;
			me(null,data);
		}
	}
};
