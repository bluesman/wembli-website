/* get all the plans that have (rsvp date of today or have all friends responded ) and !rsvpComplete */
var wembliMail = require('wembli/email');
var wembliUtils = require('wembli/utils');
var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');
var Friend = wembliModel.load('friend');
var Plan = wembliModel.load('plan');

module.exports = function(app) {
	app.get('/send-rsvp-email', function(req, res) {
		var rsvpComplete = function(p) {
			/* set the plan rsvp to complete with date of today and send email to the organizer */
			Customer.findOne().where("_id").equals(p.organizer.customerId).exec(function(err, c) {
				console.log('set rsvp to complete');
				console.log(c);
				//p.rsvpComplete = true;
				//p.rsvpCompleteDate = new Date();
				p.save(function(err) {
					if (!err) {
						wembliMail.sendRsvpComplete({
							res: res,
							req: req,
							customer: c,
							plan: p
						});
					}
				});
			});
		};

		var today = new Date();

		/* get all the plans */
		Plan.find().where('rsvpComplete').equals(false)
		.where('active').equals(true)
		.where('rsvpDate').ne(null)
		.exec(function(err, plans) {
			plans.map(function(p) {
				/* check if there's an event and if so is the date of the event expired? */
				if (typeof p.event === "undefined") {
					return;
				}

				if (typeof p.event.eventDate === "undefined") {
					return;
				}

				if (p.event.eventDate < today) {
					/* event is in the past, set active to false */
					p.active = false;
					p.save();
					return;
				}

				/* get friends invited and see if they have responded */
				Friend.find().where('planGuid').equals(p.guid).exec(function(err, friends) {
					var complete = true; // assume its complete until we figure out otherwise
					console.log('rsvpDate: ' + p.rsvpDate);
					console.log('friends invited: '+friends.length);
					if (friends.length) {
						friends.map(function(f) {
							console.log(f);
							/* make sure inviteStatus is true, which means the organizer wants this person to come */
							if (f.inviteStatus) {
								/* if rsvp.decision is null then they have not responded.  if it is true or false then they have responded */
								if (f.rsvp.decision === null) {
									complete = false; //the rsvp is not complete because not everyone has responded. the only exception is if the rsvpDate is passed
								}
							}
						});
					} else {
						/* no one is invited can't be complete */
						complete = false;
					}

					console.log('looked through the friends and found that the rsvpComplete is now '+complete);

					/* at this point, if all the friends have rsvp'd we don't need to check the rsvpDate */
					if (complete) {
						/* update the plan and set rsvp to complete and send the rsvp-complete email */
						rsvpComplete(p);
						console.log('rsvp is complete because everyone has responded');
					} else {
						console.log(p.rsvpDate);
						/* not all friends have responded, lets check the rsvp date */
						var rsvpDate = new Date(p.rsvpDate);

						/* if the rsvpDate is < right now then rsvp is complete even if friends have not responded */
						console.log(rsvpDate);
						console.log(today);
						if (rsvpDate < today) {
							console.log('rsvp date has passed');
							rsvpComplete(p);
						} else {
							console.log('rsvp is not complete yet');
						}
					}
				});
			});
		});
	});
};


