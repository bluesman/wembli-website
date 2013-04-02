var wembliModel = require('wembli-model'),
    Customer    = wembliModel.load('customer'),
    Plan        = wembliModel.load('plan');

module.exports = function(req, res, next) {
	/* no plan lets make one */
	if (!req.session.plan) {
		/*
		taking this out for now - people who just show up on the home page don't need a plan
		plan should be set explicitly into the session on either of the start plan pages
		var guid = Plan.makeGuid();
		req.sess
		ion.plan = new Plan({guid:guid});
		*/
		return next();
	}
	console.log('plan before determine context:');
	//console.log(req.session.plan);

	var claimPlan = function() {
		/* this plan has no organizer -it must be me */
		console.log('this plan has no organizer - it must be me!');
		req.session.visitor.context = 'organizer';
		/* set the organizer for the plan to this customer */
		if (typeof req.session.customer.id !== "undefined") {
			req.session.plan.organizer  = req.session.customer.id;
			/* save the plan if there's an eventId*/
			if (typeof req.session.plan.event.eventId !== "undefined") {
				req.session.plan.save(function(err) {
					/* add this plan to the customer's list of plans - and then call next() */
					req.session.customer.addPlan(req.session.plan.guid,next);
				});
			} else {
				/* can't claim a plan that has no event */
				return next();
			}
		} else {
			/* can't claim a plan if you're not logged in */
			return next();
		}
	};

	var checkInvited = function() {
		async.detect(req.session.plan.friends,function(friend,cb) {
			console.log('checking if friend is invited');
			console.log('friend.customerId: '+friend.customerId);
			console.log('customer.id ' + req.session.customer.id);
			cb((friend.customerId === req.session.customer.id));
		},function(result){
			console.log('result from detect friend is invited');
			console.log(result);
			/* if we got a result it means that this customer is invited */
			req.session.visitor.context = (result) ? 'friend' : 'visitor';
			return next();
		});
	};

	/* have a plan guid already - get it from the db */
	Plan.findOne({guid: req.session.plan.guid}, function(err, p) {
		/* no plan in the db */
		if (!p) {
			/* hydrate the mongoose object */
			req.session.plan = new Plan(req.session.plan);

			/*
				if the plan being worked on does not have an organizer then this person can be the organizer
				a friend or visitor should never be able to view a plan that has no organizer
			*/
			if (typeof req.session.plan.organizer === "undefined") {
					req.session.visitor.context = 'organizer';
					return next();
			}


			/* still workin on it...if there's a customer figure out the context and maybe save the plan */
			if (req.session.customer) {
				/* this plan is not in the db but we have a customer... */


				/* if there is an organizer for this plan and there is a customer..determine context */
				if (req.session.plan.organizer === req.session.customer.id) {
					/* i am the organizer - but i probably already knew that */
					req.session.visitor.context = 'organizer';
					return next();
				}

				/* i am definitely not the organizer am I invited? */
				if (typeof req.session.plan.friends !== "undefined") {
					return checkInvited();
				}

				/* plan has no friends invited so there's no way i could be invited */
			}

			/* at this point, thers no plan in the db */

			req.session.visitor.context = 'visitor';
			return next();
		}

		console.log('refreshed plan from db');
		/* here we do have a plan in the db */
		/* overwrite this though cause req.session.plan may have newer stuff */
		Object.keys(req.session.plan).forEach(function(key) {
			if (key === '_id') {return;}
			p[key] = req.session.plan[key];
		});
		req.session.plan = p;

		if (!req.session.customer) {
			/* no customer - just gtfo */
			req.session.visitor.context = 'visitor';
			return next();
		}

		/* am I the organizer? */
		if (typeof req.session.plan.organizer === "undefined") {
			console.log('theres no organizer for this plan..it must be me!');
			return claimPlan();
		}

		/* if there is an organizer for this plan and we know there is a customer..determine context */
		if (req.session.plan.organizer === req.session.customer.id) {
			/* i am the organizer - but i probably already knew that */
			console.log('im the organizer of this plan');
			req.session.visitor.context = 'organizer';
			return next();
		}

		/* i am definitely not the organizer am I invited? */
		if (typeof req.session.plan.friends !== "undefined") {
			console.log('im not the organizer...checking if im invited');
			return checkInvited();
		}

		/* not the organizer and not invited - i'm just a visitor */
		req.session.visitor.context = 'visitor';

		return next();
	});
};
