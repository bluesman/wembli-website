var wembliMail = require('wembli/email');
var wembliUtils = require('wembli/utils');
var wembliModel = require('../lib/wembli-model');
var Customer = wembliModel.load('customer');
var Friend = wembliModel.load('friend');
var Ticket = wembliModel.load('ticket');
var async = require('async');

exports.friend = {
 submitRsvp: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		/* TODO: make sure we have a customer and plan in session and validate args */

		/* get the friend for this customer & plan */
		Friend.findOne()
		.where('planGuid').equals(req.session.plan.guid)
		.where('customerId').equals(req.session.customer._id)
		.exec(function(err, friend) {

			/* this function is a mess */
			/* args.decision is the overall plan decision and also means they are in for tickets */
			if (typeof args.decision !== "undefined") {
				friend.rsvp.decision = args.decision;
				friend.rsvp.decidedLastDate = Date.now();
				friend.rsvp.status = "responded";
				friend.rsvp.guestCount = parseInt(args.guestCount);
				friend.rsvp.tickets.number = friend.rsvp.guestCount;
				friend.rsvp.tickets.decision = friend.rsvp.decision;
				friend.rsvp.tickets.decidedLastDate = friend.rsvp.decidedLastDate;
			}

			if (typeof args.tickets !== "undefined") {
				friend.rsvp.tickets.number = parseInt(args.guestCount);
				friend.rsvp.tickets.decision = args.tickets;
				friend.rsvp.tickets.decidedLastDate = Date.now();
			}

			if (typeof args.restaurant !== "undefined") {
				friend.rsvp.restaurant.number = parseInt(args.guestCount);
				friend.rsvp.restaurant.decision = args.restaurant;
				friend.rsvp.restaurant.decidedLastDate = Date.now();
			}

			if (typeof args.hotel !== "undefined") {
				friend.rsvp.hotel.number = parseInt(args.guestCount);
				friend.rsvp.hotel.decision = args.hotel;
				friend.rsvp.hotel.decidedLastDate = Date.now();
			}

			if (typeof args.parking !== "undefined") {
				friend.rsvp.parking.number = parseInt(args.guestCount);
				friend.rsvp.parking.decision = args.parking;
				friend.rsvp.parking.decidedLastDate = Date.now();
			}

			friend.save(function(err, result) {

				/* send email to organizer that rsvp changed */
				/* get the organizer for this plan */
				Customer.findOne().where('_id').equals(req.session.plan.organizer.customerId).exec(function(err,organizer) {
					wembliMail.sendRsvpChanged({organizer: organizer, plan: req.session.plan, req: req, res: res}, function(e,r) {
						data.friend = result;
						me(null, data);
					});
				});
			});
		});
	},

	submitVote: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		/* TODO: make sure we have a customer and plan in session and validate args */

		/* get the friend for this customer & plan */
		Friend.findOne()
		.where('planGuid').equals(req.session.plan.guid)
		.where('customerId').equals(req.session.customer._id)
		.exec(function(err, friend) {

			if (typeof args.tickets !== "undefined") {
				friend.rsvp.tickets.number = parseInt(args.tickets.number);
				friend.rsvp.tickets.decision = args.tickets.decision;
				friend.rsvp.tickets.decidedLastDate = Date.now();
				friend.rsvp.tickets.price = args.tickets.price;
				friend.rsvp.tickets.priceGroup = args.tickets.priceGroup;
			}

			if (typeof args.restaurant !== "undefined") {
				friend.rsvp.restaurant.number = parseInt(args.restaurant.number);
				friend.rsvp.restaurant.decision = args.restaurant.decision;
				friend.rsvp.restaurant.decidedLastDate = Date.now();
				friend.rsvp.restaurant.price = args.restaurant.price;
				friend.rsvp.restaurant.priceGroup = args.restaurant.priceGroup;
				friend.rsvp.restaurant.preference = args.restaurant.preference;
			}

			if (typeof args.hotel !== "undefined") {
				friend.rsvp.hotel.number = parseInt(args.hotel.number);
				friend.rsvp.hotel.decision = args.hotel.decision;
				friend.rsvp.hotel.decidedLastDate = Date.now();
				friend.rsvp.hotel.price = args.hotel.price;
				friend.rsvp.hotel.priceGroup = args.hotel.priceGroup;
				friend.rsvp.hotel.preference = args.hotel.preference;
			}

			if (typeof args.parking !== "undefined") {
				friend.rsvp.parking.number = parseInt(args.parking.number);
				friend.rsvp.parking.decision = args.parking.decision;
				friend.rsvp.parking.decidedLastDate = Date.now();
				friend.rsvp.parking.price = args.parking.price;
				friend.rsvp.parking.priceGroup = args.parking.priceGroup;
			}

			friend.save(function(err, result) {
				data.friend = result;

				me(null, data);
			});
		});
	},
	getServiceId: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		/* use a token to get the serviceId */
		if (!args.token) {
			return me({success:0});
		}

		Friend.findOne({'rsvp.token':args.token},'contactInfo').exec(function(err, results) {
			console.log(results);
			data.serviceId = results.contactInfo.serviceId;
			return me(null,data);
		});

	}
};
