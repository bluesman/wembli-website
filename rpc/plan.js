var wembliUtils = require('wembli/utils');
var wembliMail = require('wembli/email');
var wembliModel = require('../lib/wembli-model');
var Customer = wembliModel.load('customer');
var Friend = wembliModel.load('friend');
var Plan = wembliModel.load('plan');
var Feed = wembliModel.load('feed');
var Ticket = wembliModel.load('ticket');
var feedRpc = require('./feed').feed;
var async = require('async');
var ticketNetwork = require('../lib/wembli/ticketnetwork');

exports.plan = {
	init: function(args, req, res) {
		var me = this;
		console.log('plan.init args');
		console.log(args);
		/* return different data depending on the visit context? */
		var data = {
			success: 1,
			plan: req.session.plan,
			context: req.session.visitor.context
		};

		/* refresh the plan from the db if asked to */
		if (args.refresh) {
			Plan.findOne().where('_id').equals(req.session.plan._id).exec(function(err, plan) {
				req.session.plan = plan;
				getRelated(plan);
			});
		} else {
			getRelated(req.session.plan);
		}

		function getRelated(plan) {
			if (plan) {
				async.parallel([

					function(callback) {
						/* get feed for the plan */
						Feed.findOne().where('planGuid').equals(req.session.plan.guid).exec(function(err, feed) {
							if (feed !== null) {
								data.feed = feed;
							}
							callback();
						});
					},

					function(callback) {
						/* get friends for this plan */
						Friend.find({
							planId: req.session.plan.id
						}, function(err, results) {
							data.friends = results;
							callback();
						});
					},

					function(callback) {
						/* get tickets for this plan */
						Ticket.find({
							planId: req.session.plan.id
						}, function(err, results) {
							data.tickets = results;
							/* check if these tickets are still available */
							async.forEach(data.tickets, function(item, callback2) {
								console.log('tickets in plan');
								console.log(item.ticketGroup.ID);

								ticketNetwork.GetTickets({
									ticketGroupID: item.ticketGroup.ID
								}, function(err, results) {
									console.log('results from GetTickets');
									if (err) {
										console.log('ERROR GETTING TIX');
										console.log(err);
										callback2(err);
									}
									if (typeof results.TicketGroup === "undefined") {
										item.gone = true;
										item.save(function(err) {
											console.log('tickets are gone :( saved as such')
											callback2();
										});
									} else {
										/* done with loop iteration */
										callback2();
									}
								});
							}, function(err) {
								/* done with outer loop iteration */
								callback();
							});
						});
					},

					function(callback) {
						/* get customer who is the organizer */
						if (req.session.plan.organizer.customerId) {
							Customer.findOne().where('_id').equals(req.session.plan.organizer.customerId).exec(function(err, organizer) {
								console.log('organizer: ' + req.session.plan.organizer.customerId);
								console.log(organizer);
								data.organizer = organizer;
								callback();
							});
						} else {
							callback();
						}
					}
				],

				function(err, results) {
					if (err) {
						me(err);
					}
					me(null, data);
				});
			} else {
				me(null, data);
			}
		}
	},

	save: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};
		console.log('plan.save');
		console.log(args);
		console.log('saving plan in rpc');
		console.log(req.session.plan);

		req.session.plan.save(function(err, res) {
			data.plan = req.session.plan;
			me(null, data);
		});
	},

	update: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};
		console.log('plan.save');
		console.log(args);
		req.session.plan.update(args, function(err, res) {
			data.plan = req.session.plan;
			me(null, data);
		});

	},
	/* organizer submit rsvp on behalf of friend */
	submitRsvpFor: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		/* you must be logged in as the organizer to do this */
		if (req.session.customer._id != req.session.plan.organizer.customerId) {
			console.log(req.session.customer._id);
			console.log(req.session.plan.organizer.customerId);
			data.success = 0;
			data.errror = 'Not Authorized';
			return me(null, data);
		}

		/* get the friend for this customer & plan */
		Friend.findOne()
			.where('planGuid').equals(req.session.plan.guid)
			.where('_id').equals(args.friendId)
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
				data.friend = result;
				console.log('submitRsvp');
				console.log(data.friend);
				console.log(result);
				console.log(err);
				me(null, data);
			});
		});
	},

	submitRsvpComplete: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};
		console.log('args in submitRsvpcomplete');
		console.log(args);
		if (typeof args.rsvpComplete !== "undefined") {
			req.session.plan.rsvpComplete = args.rsvpComplete;
			req.session.plan.rsvpCompleteDate = Date.now();
		}

		console.log('plan.save');
		console.log(args);
		req.session.plan.save(function(err, res) {
			data.rsvpComplete = req.session.plan.rsvpComplete;
			data.rsvpCompleteDate = req.session.plan.rsvpCompleteDate;
			feedRpc['logActivity'].apply(function(err, feedResult) {
				data.plan = req.session.plan;
				return me(null, data);
			}, [{
					action: 'rsvpComplete',
					meta: {
						decision: args.rsvpComplete
					}
				},
				req, res
			]);

		});
	},

submitNotes: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		/* you must be logged in as the organizer to do this */
		if (req.session.customer._id != req.session.plan.organizer.customerId) {
			console.log(req.session.customer._id);
			console.log(req.session.plan.organizer.customerId);
			data.success = 0;
			data.error = 'Not Authorized';
			return me(null, data);
		}

		req.session.plan.notes = args.notes;
		req.session.plan.save(function(err) {
			if (err) {
				return me(err);
			}
			return me(null,data);
		});
	},

	/*
	 * args:
	 *  friendId
	 *  amount
	 *  paymentType
	 */
	submitOutsidePayment: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		/* you must be logged in as the organizer to do this */
		if (req.session.customer._id != req.session.plan.organizer.customerId) {
			console.log(req.session.customer._id);
			console.log(req.session.plan.organizer.customerId);
			data.success = 0;
			data.error = 'Not Authorized';
			return me(null, data);
		}

		/* get the friend for this customer & plan */
		Friend.findOne()
			.where('planGuid').equals(req.session.plan.guid)
			.where('_id').equals(args.friendId)
			.exec(function(err, friend) {
			var payment = {
				amount: args.amount,
				method: args.method,
				status: args.status,
				type: 'outside'
			};
			friend.payment.push(payment);
			friend.save(function(err) {
				data.friend = friend;
				me(null, data);
			});
		});
	},


	/*
	 * args:
	 *  [{friendId: amount }]
	 */
	sendPonyUpEmail: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		/* you must be logged in as the organizer to do this */
		if (req.session.customer._id != req.session.plan.organizer.customerId) {
			console.log(req.session.customer._id);
			console.log(req.session.plan.organizer.customerId);
			data.success = 0;
			data.error = 'Not Authorized';
			return me(null, data);
		}

		var sendPonyUpRequest = function(f, callback) {
			console.log('sent request to ' + f.friendId + ' for ' + f.amount);


			Friend.findOne()
				.where('planGuid').equals(req.session.plan.guid)
				.where('_id').equals(f.friendId)
				.exec(function(err, friend) {
				/* update the friend and set the payment type: request */
				var payment = {
					amount: f.amount,
					status: 'queued',
					type: 'request'
				};

				var p = friend.payment.create(payment);
				console.log(p);
				friend.payment.push(p);
				friend.save(function(err) {
					wembliMail.sendPonyUpEmail({
						res: res,
						req: req,
						friend: friend,
						payment: payment,
					}, function() {
						callback();
					});
				});
			});
		};

		console.log(args);

		/* get the friend for this customer & plan */
		async.forEach(args.ponyUpRequests, function(item, callback) {
			sendPonyUpRequest(item, callback);
		}, function() {
			Friend.find().where('planGuid').equals(req.session.plan.guid)
				.exec(function(err, friends) {
				console.log('finished sending pony up request');
				console.log(err);
				data.friends = friends;
				me(null, data);
			});
		});
	},

	resendPonyUpEmail: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		/* you must be logged in as the organizer to do this */
		if (req.session.customer._id != req.session.plan.organizer.customerId) {
			console.log(req.session.customer._id);
			console.log(req.session.plan.organizer.customerId);
			data.success = 0;
			data.error = 'Not Authorized';
			return me(null, data);
		}


		console.log('resend request to ' + args.friendId + ' for ' + args.amount);


		Friend.findOne()
			.where('planGuid').equals(req.session.plan.guid)
			.where('_id').equals(args.friendId)
			.exec(function(err, friend) {
			var p = friend.payment.id(args.paymentId);
			console.log(p);
			p.status = 'queued';
			p.date = Date.now();

			p.save(function(err) {
				console.log('save updated payment');
				console.log(err);
				wembliMail.sendPonyUpEmail({
					res: res,
					req: req,
					friend: friend,
					payment: p,
				}, function(err) {
					if (err) {
						console.log('err sending email: '+err);
						return me(err);
					}
					data.payment = p;
					console.log('successfully resent email');
					return me(null, data);
				});
			});
		});
	},

	removeOutsidePayment: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		/* you must be logged in as the organizer to do this */
		if (req.session.customer._id != req.session.plan.organizer.customerId) {
			console.log(req.session.customer._id);
			console.log(req.session.plan.organizer.customerId);
			data.success = 0;
			data.error = 'Not Authorized';
			return me(null, data);
		}

		console.log('remove outside payment for ' + args.friendId + ' for ' + args.paymentId);

		Friend.findOne()
			.where('planGuid').equals(req.session.plan.guid)
			.where('_id').equals(args.friendId)
			.exec(function(err, friend) {
			var p = friend.payment.id(args.paymentId).remove();
			console.log(p);
			friend.save(function(err) {
				console.log('save removed payment');
				console.log(err);
				if (err) {
					console.log('err removing payment: '+err);
					return me(err);
				}
				console.log('successfully removed payment');
				return me(null, data);
			});
		});
	},

	submitOrganizerRsvp: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		if (typeof args.decision !== "undefined") {
			req.session.plan.organizer.rsvp.decision = args.decision;
			req.session.plan.organizer.rsvp.decidedLastDate = Date.now();
			req.session.plan.organizer.rsvp.guestCount = parseInt(args.guestCount);
		}

		console.log('plan.save');
		console.log(args);
		req.session.plan.save(function(err, res) {

			feedRpc['logActivity'].apply(function(err, feedResult) {
				data.plan = req.session.plan;
				return me(null, data);
			}, [{
					action: 'rsvp',
					meta: {
						decision: args.decision
					}
				},
				req, res
			]);

		});
	},

	setTicketsPriceRange: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};
		console.log(args);
		req.session.plan.preferences.tickets.priceRange = args;
		req.session.plan.save(function(err, res) {
			data.plan = req.session.plan;
			me(null, data);
		});
	},

	addFriend: function(args, req, res) {
		var me = this;

		var data = {
			success: 1
		};

		/* must have a customer to create a plan in the db */
		if (!req.session.customer) {
			console.log('no customer..back to step 1 please');
			data.noCustomer = true;
			return me(null, data);
		}

		if (!req.session.plan) {
			console.log('no plan...to add friend to');
			data.noPlan = true;
			return me(null, data);
		}

		if (args.service === 'wemblimail') {
			if (req.session.customer.email === args.serviceId) {
				data.isOrganizer = true;
				return me(null, data);
			}
		}

		console.log('add friend to plan:');
		console.log(args);

		var query = {
			'planId': req.session.plan.id,
			'planGuid': req.session.plan.guid,
			'contactInfo.service': args.service,
			'contactInfo.serviceId': args.serviceId
		};

		Friend.findOne(query, function(err, friend) {
			if (err) {
				data.success = 0;
				data.dbError = 'unable to find friends';
				return me(null, data);
			}

			var confirmationTimestamp = new Date().getTime().toString();
			var digestKey = args.serviceId + confirmationTimestamp;
			var confirmationToken = wembliUtils.digest(digestKey);

			if (friend) {
				/* the friend is not invited until the callback sets it to true */
				friend.inviteStatus = args.inviteStatus || false;
				/* make a new inviteStatusToken that will be used to confirm the facebook callback */
				friend.inviteStatusConfirmation = {
					token: confirmationToken,
					timestamp: confirmationTimestamp
				};
				/* update the name */
				friend.contactInfo.name = args.name;
			} else {
				console.log('adding a new friend');
				var set = {
					planId: req.session.plan.id,
					planGuid: req.session.plan.guid,
					contactInfo: {
						service: args.service,
						serviceId: args.serviceId,
						name: args.name,
						imageUrl: args.imageUrl
					},
					rsvp: {
						token: confirmationToken,
						tokenTimestamp: confirmationTimestamp
					},
					inviteStatus: args.inviteStatus || false,
					inviteStatusConfirmation: {
						token: confirmationToken,
						timestamp: confirmationTimestamp
					}
				}
				console.log(set);
				friend = new Friend(set);
			}

			friend.save(function(err) {
				if (err) {
					data.success = 0;
					data.dbError = 'unable to save friend';
					return me(null, data);
				}
				console.log('saved friend: ' + friend.id);
				console.log(friend);
				/* now add the friend to the plan */
				req.session.plan.addFriend(friend, function(err) {
					if (err) {
						console.log(err);
						data.success = 0;
						data.dbError = 'unable to add friend ' + friend.id;
						return me(null, data);
					}
					console.log('added friend to plan: ' + req.session.plan.guid);
					data.friend = friend;

					/* get list of friends for this plan */
					Friend.find({
						planId: req.session.plan.id
					}, function(err, friends) {

						data.friends = friends;
						console.log('all friends in the plan');
						console.log(friends);

						feedRpc['logActivity'].apply(function(err, feedResult) {
							return me(null, data);
						}, [{
								action: 'addFriend',
								meta: {
									friendName: friend.name
								}
							},
							req, res
						]);
					})
				});
			});
		});
	},

	addTicketGroup: function(args, req, res) {
		var me = this;

		var data = {
			success: 1
		};

		/* must have a customer to create a plan in the db */
		if (!req.session.customer) {
			console.log('no customer...');
			data.noCustomer = true;
			return me(null, data);
		}

		if (!req.session.plan) {
			console.log('no plan...to add tickets to');
			data.noPlan = true;
			return me(null, data);
		}

		if (typeof args.ticketGroup === "undefined") {
			console.log('no ticketGroup');
			data.noTicketGroup = true;
			return me(null, data);
		}

		console.log('add tickets to plan:');
		console.log(args);

		var query = {
			'planId': req.session.plan.id,
			'planGuid': req.session.plan.guid,
		};

		/* right now - you can only have 1 un-purchased ticket group..so remove any tickets that are unpurchased from the plan */


		/* find all the existing tickets for this plan and remove them if payment is not complete */
		Ticket.find(query, function(err, tickets) {
			if (err) {
				data.success = 0;
				data.dbError = 'unable to find ticketGroup';
				return me(null, data);
			}

			/* check if these tickets are still available */
			async.forEach(tickets, function(item, callback) {
				/* check if any of these are not yet purchased and remove them */
				if (!item.payment[0]) {
					item.remove(function(err) {
						console.log('removed unpaidfor ticket');
						/* now remove the ticket from the plan */
						req.session.plan.removeTicket(item.id, function(err) {
							if (err) {
								console.log(err);
								data.success = 0;
								data.dbError = 'unable to add ticketGroup ' + item.id;
								return callback();
							}
							console.log('removed ticketGroup from plan: ' + req.session.plan.guid);
							return callback();
						});
					})
				} else {
					callback();
				}
			}, function() {
				/* finished iterating through existing tickets */
				var set = {
					planId: req.session.plan.id,
					planGuid: req.session.plan.guid,
					service: 'tn',
					ticketGroup: args.ticketGroup,
					qty: args.qty,
					total: args.total,
				};

				console.log(set);
				if (typeof args.payment !== "undefined") {
					console.log(args.payment);
					var p = JSON.parse(args.payment);

					set.purchased = true;
					set.payment = [{
							organizer: true,
							transactionToken: p.transactionToken,
							customerId: req.session.customer.id,
							amount: p.total,
							qty: p.qty
						}
					];
				}

				ticket = new Ticket(set);

				ticket.save(function(err) {
					if (err) {
						data.success = 0;
						data.dbError = 'unable to save ticketGroup';
						callback();
					}

					/* now add the ticket to the plan */
					req.session.plan.addTicket(ticket, function(err) {
						if (err) {
							console.log(err);
							data.success = 0;
							data.dbError = 'unable to add ticketGroup ' + ticket.id;
							return callback();
						}
						console.log('added ticketGroup to plan: ' + req.session.plan.guid);
						data.ticketGroup = ticket;
						return me(null, data);
					});
				});
			});
		});
	},

	removeTicketGroup: function(args, req, res) {
		var me = this;

		var data = {
			success: 1
		};

		/* must have a customer to create a plan in the db */
		if (!req.session.customer) {
			console.log('no customer...');
			data.noCustomer = true;
			return me(null, data);
		}

		if (!req.session.plan) {
			console.log('no plan...to add tickets to');
			data.noPlan = true;
			return me(null, data);
		}

		Ticket.remove({
			"_id": args.ticketId
		}, function(err) {
			console.log('remove ticket err is: ' + err);
			/* delete the ticket id from the plan and save it */
			var newTickets = [];
			for (var i = 0; i < req.session.plan.tickets.length; i++) {
				if (req.session.plan.tickets[i] != args.ticketId) {
					newTickets.push(req.session.plan.tickets[i]);
				}
			};
			console.log('removing ticket from plan');
			req.session.plan.tickets = newTickets;
			req.session.plan.save(function(err, results) {
				console.log('saved plan after removing ticket - err is:' + err);
				/* get tickets to return */
				Ticket.find({
					planId: req.session.plan.id
				}, function(err, results) {
					data.tickets = results;
					me(null, data);
				});
			});
		});
	},

	savePreferences: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		if (typeof args.preferences !== "undefined") {
			req.session.plan.preferences.addOns = args.preferences.addOns;
			req.session.plan.preferences.inviteOptions = args.preferences.inviteOptions;
			req.session.plan.preferences.guestList = args.preferences.guestList;
			//req.session.plan.preferences.payment = args.preferences.payment;
			req.session.plan.preferences.tickets.payment = args.preferences.tickets.payment;
			req.session.plan.preferences.parking.payment = args.preferences.parking.payment;
			req.session.plan.preferences.hotels.payment = args.preferences.hotels.payment;
			req.session.plan.preferences.restaurants.payment = args.preferences.restaurants.payment;

			console.log('plan.save');
			console.log(args);
			//req.session.plan.markModified('preferences');
			req.session.plan.save(function(err, res) {
				data.plan = req.session.plan;
				me(null, data);
			});


		} else {
			data.success = 0;
			data.error = true;
			me(null, data);
		}
	},
}
