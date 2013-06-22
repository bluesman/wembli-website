var wembliModel = require('wembli-model'),
    Customer    = wembliModel.load('customer'),
    Friend      = wembliModel.load('friend'),
    Plan        = wembliModel.load('plan');
var async       = require('async');
var feedRpc    = require('../../rpc/feed').feed;

module.exports = function(req, res, next) {
	/* no plan lets make one */
	if (!req.session.plan) {
		/*
		taking this out for now - people who just show up on the home page don't need a plan
		plan should be set explicitly into the session on either of the start plan pages
		var guid = Plan.makeGuid();
		req.session.plan = new Plan({guid:guid});
		*/
		return next();
	}
	console.log('plan before determine context:');
	//console.log(req.session.plan);

	var claimPlan = function(p) {
		/* this plan has no organizer -it must be me */
		console.log('this plan has no organizer - it must be me!');
		req.session.visitor.context = 'organizer';
		/* set the organizer for the plan to this customer */
		if (typeof req.session.customer !== "undefined") {
			console.log('i have a customer now - associate this plan with this customer');
			/* if there is a plan from the db */
			if (typeof p !== "undefined") {
				console.log('DB PLAN:');
				console.log(p);
				console.log('SESSION PLAN');
				console.log(req.session.plan);
				req.session.plan = new Plan(req.session.plan);
				/* overwrite what is in the db with what is in the session cause req.session.plan may have newer stuff */
				/* why can't i just save req.session.plan instead of overwrite? */
				/*
				Object.keys(req.session.plan).forEach(function(key) {
					if (key === '_id') {return;}
					p[key] = req.session.plan[key];
				});
				req.session.plan = p;
				*/

			} else {
				console.log('there was no plan in the db use req session plan and associate this customer to it');
				req.session.plan.organizer.customerId  = req.session.customer.id;
			}

			/* save the plan if there's an eventId */
			if (typeof req.session.plan.event.eventId !== "undefined") {
				console.log('this plan has an eventId so im saving it');

				req.session.plan.save(function(err) {
					console.log('SAVED PLAN');
					console.log(err);
					/* add this plan to the customer's list of plans - and then call next() */
					req.session.customer.addPlan(req.session.plan.guid,function(err,results) {
						/* logActivity for the feed - this will actually create */
						feedRpc['logActivity'].apply(function(err,feedResult) {
							next();
						},[{action:'createPlan'}, req, res]);
					});
				});
			} else {
				/* can't claim a plan that has no event */
				return next();
			}
		} else {
			/* can't claim a plan if you're not logged in */
			if (typeof p !== "undefined") {
				console.log('not logged in but i have a plan in the db');
				console.log('i want to keep whats in my session and not what is in the db');
				req.session.plan = new Plan(req.session.plan);
				/* overwrite what is in the db with what is in the session cause req.session.plan may have newer stuff */
				/* why can't i just de new Plan(req.session.plan) ??
				Object.keys(req.session.plan).forEach(function(key) {
					if (key === '_id') {return;}
					p[key] = req.session.plan[key];
				});
				*/
				req.session.plan = p;
			}

			return next();
		}
	};

	var checkInvited = function() {
		Friend.find().where('planGuid').equals(req.session.plan.guid).exec(function(err,friends) {
			async.detect(friends,function(friend,cb) {
				console.log('checking if friend is invited');
				console.log('friend.customerId: '+friend.customerId);
				console.log('customer.id ' + req.session.customer.id);
				cb((friend.customerId === req.session.customer.id));
			},function(result){
				/* if we got a result it means that this customer is invited */
				req.session.visitor.context = (typeof result === "undefined") ? 'visitor' : 'friend';
				console.log('result from detect friend is ');
				console.log(req.session.visitor.context);
				return next();
			});
		});
	};

	/* have a plan guid already - get it from the db */
	Plan.findOne({guid: req.session.plan.guid}, function(err, p) {
		/* no plan in the db */
		if (!p) {
			console.log('this plan is not in the db');
			console.log(req.session.plan);
			/* hydrate the mongoose object */
			req.session.plan = new Plan(req.session.plan);

			/* still workin on it...if there's a customer figure out the context and maybe save the plan */
			if (req.session.customer) {
				/* this plan is not in the db but we have a customer... */

				/* if there is an organizer for this plan and there is a customer..determine context */
				if (req.session.plan.organizer.customerId === req.session.customer.id) {
					/* i am the organizer - but i probably already knew that */
					req.session.visitor.context = 'organizer';
					return next();
				}

				/* if there is no organizer for this plan and i'm logged in, I can claim this plan */
				if (typeof req.session.plan.organizer.customerId === "undefined") {
					return claimPlan();
				}

				/* i am definitely not the organizer am I invited? */
				if (typeof req.session.plan.friends !== "undefined") {
					return checkInvited();
				}

				/* plan has no friends invited so there's no way i could be invited */
			} else {
				/*
					if the plan being worked on does not have an organizer then this person can be the organizer
					a friend or visitor should never be able to view a plan that has no organizer
				*/
				if (typeof req.session.plan.organizer.customerId === "undefined") {
						req.session.visitor.context = 'organizer';
						return next();
				}

			}

			/* at this point, thers no plan in the db */

			req.session.visitor.context = 'visitor';
			return next();
		}

		console.log('refreshed plan from db');
		/* here we do have a plan in the db */

		/* am I the organizer? */
		if (typeof p.organizer.customerId === "undefined") {
			console.log('theres no organizer for this plan..it must be me!');
			return claimPlan(p);
		}

		/* if there is an organizer for this plan and we know there is a customer..determine context */
		if (p.organizer.customerId === req.session.customer.id) {
			/* i am the organizer - but i probably already knew that */
			console.log('im the organizer of this plan');
			req.session.visitor.context = 'organizer';

			/* overwrite what is in the db with what is in the session cause req.session.plan may have newer stuff */
			Object.keys(req.session.plan).forEach(function(key) {
				if (key === '_id') {return;}
				p[key] = req.session.plan[key];
			});
			req.session.plan = p;

			return next();
		}

		req.session.plan = p;

		/* i am definitely not the organizer am I invited? */
		if (typeof p.friends !== "undefined") {
			console.log('im not the organizer...checking if im invited');
			return checkInvited();
		}

		/* not the organizer and not invited - i'm just a visitor */
		req.session.visitor.context = 'visitor';

		return next();
	});
};
