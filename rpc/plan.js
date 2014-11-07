/*

TODO:
- make sure friends can not do organizer functionality:
	- change friend rsvp

*/
var wembliUtils = require('wembli/utils');
var wembliMail = require('wembli/email');
var wembliModel = require('../lib/wembli-model');
var Customer = wembliModel.load('customer');
var Friend = wembliModel.load('friend');
var Plan = wembliModel.load('plan');
var Feed = wembliModel.load('feed');
var Ticket = wembliModel.load('ticket');
var Parking = wembliModel.load('parking');
var Restaurant = wembliModel.load('restaurant');
var Hotel = wembliModel.load('hotel');
var feedRpc = require('./feed').feed;
var async = require('async');
var ticketNetwork = require('../lib/wembli/ticketnetwork');
var balanced = require('wembli/balanced-api')({
	secret: app.settings.balancedSecret,
	marketplace_uri: app.settings.balancedMarketplaceUri
});
var eventRpc = require('./event').event;
var venueRpc = require('./venue').venue;
var gg = require('../lib/wembli/google-geocode');

exports.plan = {
	init: function(args, req, res) {
		var me = this;
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
								console.log(req.session.ticketsToAdd);
								if (req.session.context === 'organizer') {
									/* merge in any tickets that didn't get saved in the db yet */
									if (typeof req.session.ticketsToAdd !== "undefined") {
										for (var i = req.session.ticketsToAdd.length - 1; i >= 0; i--) {
											/* sanity check - make sure the guid for the tix is this plans guid */
											if (req.session.plan.guid === req.session.ticketsToAdd[i].planGuid) {
												data.tickets.push(req.session.ticketsToAdd[i]);
											}
										};
									}
								}
								/* check if these tickets are still available */
								async.forEach(data.tickets, function(item, callback2) {
									if ((typeof item.ticketGroup !== "undefined") && (typeof item.ticketGroup.ID !== "undefined")) {
										ticketNetwork.GetTickets({
											ticketGroupID: item.ticketGroup.ID
										}, function(err, results) {
											if (err) {
												callback2(err);
											}
											if (results && (typeof results.TicketGroup === "undefined")) {
												item.gone = true;

												if (item._id) {
													item.save(function(err) {
														callback2();
													});
												}

											} else {
												/* done with loop iteration */
												callback2();
											}
										});
									} else {
										callback2();
									}
								}, function(err) {
									/* done with outer loop iteration */
									callback();
								});
							});
						},

						function(callback) {
							/* get parking for this plan */
							Parking.find({
								planId: req.session.plan.id
							}, function(err, results) {
								data.parking = results;
								callback();
								/* check if these parking spots are still available
										TODO: not sure what the best way to do this is just yet
								 */
								/*
								async.forEach(data.parking, function(item, callback2) {

									ticketNetwork.GetTickets({
										ticketGroupID: item.ticketGroup.ID
									}, function(err, results) {
										if (err) {
											callback2(err);
										}
										if (typeof results.TicketGroup === "undefined") {
											item.gone = true;
											item.save(function(err) {
												callback2();
											});
										} else {
											// done with loop iteration
											callback2();
										}
									});
								}, function(err) {
									// done with outer loop iteration
									callback();
								});
								*/

							});
						},

						function(callback) {
							/* get restaurants for this plan */
							Restaurant.find({
								planId: req.session.plan.id
							}, function(err, results) {
								data.restaurants = results;
								callback();
							});
						},

						function(callback) {
							/* get hotels for this plan */
							Hotel.find({
								planId: req.session.plan.id
							}, function(err, results) {
								data.hotels = results;
								callback();
							});
						},

						function(callback) {
							/* get customer who is the organizer */
							if (req.session.plan.organizer.customerId) {
								Customer.findOne().where('_id').equals(req.session.plan.organizer.customerId).exec(function(err, organizer) {
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

	startPlan: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		req.session.plan = new Plan({
			guid: Plan.makeGuid()
		});

		if (typeof args.eventId !== "undefined") {
			args.eventId = parseInt(args.eventId);
		} else {
			args.eventId = null;
		}

		req.session.plan.preferences.payment = args.payment ? args.payment : 'split-first';
		if (args.payment !== "split-first") {
			/* set all the addons to have this payment too */
			req.session.plan.preferences.tickets.payment = args.payment;
			req.session.plan.preferences.parking.payment = args.payment;
			req.session.plan.preferences.restaurants.payment = args.payment;
			req.session.plan.preferences.hotels.payment = args.payment;
		}
		/* must be the organizer if we're creating a new plan - this won't stick if they're not logged in */
		req.session.visitor.context = 'organizer';

		/* if there is a customer check for an existing plan for this event and use that */
		if (req.session.customer) {
			Plan.findOne()
				.where('active').equals(true)
				.where('organizer.customerId').equals(req.session.customer._id)
				.where('event.eventId').equals(args.eventId).exec(function(err, p) {
					if (p === null) {
						req.syslog.notice('existing customer, starting a new plan');
						return newPlan();
					}
					req.session.plan = p;
					req.session.plan.save(function() {
						data.plan = req.session.plan;
						req.syslog.notice('existing customer, revisiting an existing plan');
						return me(null, data);
					});
				});
		} else {
			req.syslog.notice('new customer starting a new plan');
			newPlan();
		}

		function newPlan() {
			/* get the event and venue data and stuff it in the plan */
			console.log('newplan event args');
			console.log(args);
			eventRpc['get'].apply(function(err, results) {
				console.log('fetch event data from tn results');
				console.log(results);

				var venueId = '';
				/* its possible that this event is no longer available - if that is the case, send them to the no-event page */
				if (err || !results.event[0]) {
					data.noEvent = true;
					data.success = false;
					return me(null, data);
				} else {
					venueId = results.event[0].VenueID;
				}

				/* get the venue data for this event - why do this if i already did? */
				venueRpc['get'].apply(function(err, venueResults) {
					console.log('fetch venue data from tn:');
					console.log(venueResults);
					var address = venueResults.venue[0].Street1 + ', ' + venueResults.venue[0].City + ', ' + venueResults.venue[0].StateProvince + ' ' + venueResults.venue[0].ZipCode;

					gg.geocode(address, function(err, geocode) {
						console.log('fetch geocode');
						console.log(geocode);
						req.session.plan.event.eventId = args.eventId;
						req.session.plan.event.eventName = args.eventName;
						req.session.plan.event.eventDate = results.event[0].Date;
						req.session.plan.event.eventVenue = results.event[0].Venue;
						req.session.plan.event.eventCity = results.event[0].City;
						req.session.plan.event.eventState = results.event[0].StateProvince;
						req.session.plan.event.data = results.event[0];
						req.session.plan.venue.venueId = results.event[0].VenueID;
						req.session.plan.venue.data = venueResults.venue[0];
						if (typeof geocode !== "undefined") {
							req.session.plan.venue.data.geocode = geocode[0];
						}
						data.plan = req.session.plan;
						return me(null, data);

					});
				}, [{
						VenueID: venueId
					},
					req, res
				]);
			}, [{
					eventID: args.eventID
				},
				req, res
			]);
		};

	},
	save: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

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
					me(null, data);
				});
			});
	},

	submitRsvpComplete: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		if (typeof args.rsvpComplete !== "undefined") {
			req.session.plan.rsvpComplete = args.rsvpComplete;
			req.session.plan.rsvpCompleteDate = Date.now();
			req.session.plan.notifications.push({key:'rsvpComplete'});
		}

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

	acknowledgeNotification: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};
		console.log(args);
		if (typeof args['key'] !== "undefined") {
			async.forEach(req.session.plan.notifications, function(item, callback) {
				console.log(item);
				if (item.key === args.key) {
					item.acknowledged = Date.now()
				}
				callback();
			}, function() {
				console.log(req.session.plan);
				req.session.plan.markModified('notifications');
				req.session.plan.save(function(err, res) {
					data.plan = req.session.plan;
					me(null, data);
				});
			});
		} else {
			data.success = 0;
			data.error = true;
			me(null, data);
		}

	},

	submitNotification: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};
		console.log(args);
		if (typeof args['key'] !== "undefined") {
			var exists = false;
			for (var i = req.session.plan.notifications.length - 1; i >= 0; i--) {
				var item = req.session.plan.notifications[i];
				if (item.key === args.key) {
					exists = true;
				}
			};

			if (!exists) {
				req.session.plan.notifications.push({key:args['key']});

				req.session.plan.save(function(err, res) {
					data.plan = req.session.plan;
					me(null, data);
				});
			}
		} else {
			data.success = 0;
			data.error = true;
			me(null, data);
		}

	},


	submitNotes: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		/* you must be logged in as the organizer to do this */
		if (req.session.customer._id != req.session.plan.organizer.customerId) {
			data.success = 0;
			data.error = 'Not Authorized';
			return me(null, data);
		}

		req.session.plan.notes = args.notes;
		req.session.plan.save(function(err) {
			if (err) {
				return me(err);
			}
			return me(null, data);
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

			data.success = 0;
			data.error = 'Not Authorized';
			return me(null, data);
		}

		var sendPonyUpRequest = function(f, callback) {

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

		/* get the friend for this customer & plan */
		async.forEach(args.ponyUpRequests, function(item, callback) {
			sendPonyUpRequest(item, callback);
		}, function() {
			Friend.find().where('planGuid').equals(req.session.plan.guid)
				.exec(function(err, friends) {

					data.friends = friends;
					me(null, data);
				});
		});
	},

	sendPonyUp: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		/* you must be logged in to do this */
		if (!req.session.customer || !req.session.plan) {
			data.success = 0;
			data.error = 'Not Authorized';
			return me(null, data);
		}


		/* this is the total to charge the card (includes the fee) */
		var total = parseInt(args.total);

		/* this is the pony up amount without the fee */
		var amount = parseInt(args.amount);

		/* this is the pony up fee */
		var transactionFee = parseInt(args.transactionFee);

		var creditCard = {
			card_number: args.creditCardNumber,
			expiration_month: args.expirationDateMonth,
			expiration_year: args.expirationDateYear,
			security_code: args.cvv,
			postal_code: args.postalCode,
			name: args.cardHolderName
		}

		var buyer = {
			name: req.session.customer.firstName + ' ' + req.session.customer.lastName,
			email: req.session.customer.email,
			card: creditCard,
			meta: {
				customerId: req.session.customer._id
			}
		};

		/* perform the balanced transaction and handle errors */
		/* get the merchant account for the organizer (make sure there is one) */
		Customer.findById(req.session.plan.organizer.customerId, function(err, organizer) {
			if (typeof organizer.balancedAPI === "undefined" || typeof organizer.balancedAPI.bankAccounts === "undefined" || typeof organizer.balancedAPI.bankAccounts.items[0] === "undefined") {
				data.error = 'No Organizer Bank Account';
				data.success = 0;
				return me(null, data);
			}

			var onBehalfOf = organizer.balancedAPI.customerAccount.uri;

			var successfulDebit = function(transaction, data) {
				/* deposit funds into the organizer's account */
				/* assuming there will only ever be 1 bank account right now */
				console.log(organizer.balancedAPI.bankAccounts);
				var bankAccount = new balanced.bank_accounts(organizer.balancedAPI.bankAccounts.items[0]);

				/* TODO: appears on statement as */
				bankAccount.credit({
					amount: amount
				}, function(err, res, credit) {
					/* if there's an error gtfo */
					/* TODO:if there's an error - refund the creditcard */
					if (err) {
						data.success = 0;
						data.error = 'unable to credit bank account: ' + err;
						return me(null, data);
					}

					/* get the friend and add the transaction */
					var query = {
						'planId': req.session.plan.id,
						'planGuid': req.session.plan.guid,
						'customerId': req.session.customer._id
					};

					Friend.findOne(query, function(err, friend) {
						if (err) {
							data.success = 0;
							data.error = 'unable to find friend: ' + err;
							return me(null, data);
						}

						/* find the open pony up request */
						var ponyUpRequest;
						for (var i = 0; i < friend.payment.length; i++) {
							if (friend.payment[i].type == 'request' && friend.payment[i].open) {
								ponyUpRequest = friend.payment[i];
								friend.payment[i].status = 'responded';
								friend.payment[i].open = false;
							}
						};

						data.friend = friend;
						var payment = {
							amount: amount,
							total: total,
							transactionFee: transactionFee,
							status: 'completed',
							method: 'creditcard',
							open: false,
							type: 'response',
							transaction: {
								debit: transaction,
								credit: credit
							},
						};

						if (typeof ponyUpRequest !== "undefined") {
							payment.requestId = ponyUpRequest._id;
						}

						var p = friend.payment.create(payment);

						friend.payment.push(p);
						friend.save(function(err) {
							/* TODO:
												wembliMail.sendPonyUpReceipt({
													res: res,
													req: req,
													friend: friend,
													payment: payment,
												}, function() {
													callback();
												});
												*/
							return me(null, data);
						});
					});
				});
			};

			/* check if there's an existing balanced customerAccount for this logged in customer */
			if (req.session.customer.balancedAPI.customerAccount && req.session.customer.balancedAPI.customerAccount.uri) {
				console.log('existing balanced customeraccount for this customer');
				if (req.session.customer.balancedAPI.creditCards) {
					/* they already have cards, check if the one they are using is one of them */
					var foundCard = false;
					for (var i = 0; i < req.session.customer.balancedAPI.creditCards.items.length; i++) {
						var card = req.session.customer.balancedAPI.creditCards.items[i];
						var lastFour = args.creditCardNumber.substr(args.creditCardNumber.length - 4);
						if ((lastFour == card.last_four) && card.is_valid) {
							foundCard = true;
						}
					};

					if (foundCard) {
						/* use it */
						/* charge the card */
						var bCustomers = new balanced.customers();
						bCustomers.setContext(req.session.customer.balancedAPI.customerAccount);
						bCustomers.debit({
							customer_uri: req.session.customer.balancedAPI.customerAccount.uri,
							on_behalf_of_uri: onBehalfOf,
							amount: total
						}, function(err, res, transaction) {

							/* if there's an error gtfo */
							if (err) {
								data.success = 0;
								data.error = 'unable to debit card: ' + err;
								return me(null, data);
							}
							return successfulDebit(transaction, data);
						});
					} else {
						/* this is a new card */
						var bCards = new balanced.cards();
						bCards.create(creditCard, function(err, res, card) {

							if (card.status_code == '400') {
								data.body = card;
								data.success = 0;
								if (card.category_code == 'card-number-not-valid') {
									data.error = 'The credit card number is not valid.';
								}
								return me(null, data);
							}
							console.log('CUSTOMER CARD:');
							console.log(card);
							/* now debit the card */
							var bCustomers = new balanced.customers();
							bCustomers.setContext(req.session.customer.balancedAPI.customerAccount);
							bCustomers.debit({
								customer_uri: req.session.customer.balancedAPI.customerAccount.uri,
								on_behalf_of_uri: onBehalfOf,
								amount: total
							}, function(err, res, transaction) {

								/* if there's an error gtfo */
								if (err) {
									data.success = 0;
									data.error = 'unable to debit card: ' + err;
									return me(null, data);
								}
								return successfulDebit(transaction, data);
							});

						});
					}

				}
			} else {
				console.log('no customer in balanced yet');
				/* no customer in balanced yet...add the card and the customer */
				var bCustomers = new balanced.customers();
				bCustomers.create(buyer, function(err, res, body) {
					/* if there's an error gtfo */
					if (err) {
						data.success = 0;
						data.error = 'unable to create balanced customer: ' + err;
						return me(null, data);
					}

					if (body.status_code == '409') {
						data.body = body;
						data.success = 0;
						if (body.category_code == 'card-not-validated') {
							data.error = 'Card could not be validated.';
						}
						return me(null, data);
					}

					/* save this in our customer document */
					req.session.customer.balancedAPI.customerAccount = body;
					req.session.customer.markModified('balancedAPI.customerAccount');

					bCustomers.setContext(body);
					/* add the creditcards to this customer */
					bCustomers.listCards(function(err, res, cards) {
						req.session.customer.balancedAPI.creditCards = cards;
						req.session.customer.markModified('balancedAPI.creditCards');

						/* save the balancedAPI data for this customer */
						req.session.customer.save(function(err, c) {

							if (err) {
								data.success = 0;
								data.error = 'unable to save customer: ' + err;
								return me(null, data);
							}
							/* charge the card */
							bCustomers.debit({
								customer_uri: body.uri,
								on_behalf_of_uri: onBehalfOf,
								amount: total
							}, function(err, res, transaction) {

								/* if there's an error gtfo */
								if (err) {
									data.success = 0;
									data.error = 'unable to debit card: ' + err;
									return me(null, data);
								}
								return successfulDebit(transaction, data);
							});
						});
					});
				});
			}
		});
	},

	cancelPonyUpRequest: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		/* you must be logged in as the organizer to do this */
		if (req.session.customer._id != req.session.plan.organizer.customerId) {

			data.success = 0;
			data.error = 'Not Authorized';
			return me(null, data);
		}

		Friend.findOne()
			.where('planGuid').equals(req.session.plan.guid)
			.where('_id').equals(args.friendId)
			.exec(function(err, friend) {
				var p = friend.payment.id(args.paymentId);
				p.status = 'canceled';
				p.open = false;
				p.date = Date.now();

				p.save(function(err) {
					data.payment = p;
					friend.save(function(err) {
						return me(null, data);
					});
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
			data.success = 0;
			data.error = 'Not Authorized';
			return me(null, data);
		}


		Friend.findOne()
			.where('planGuid').equals(req.session.plan.guid)
			.where('_id').equals(args.friendId)
			.exec(function(err, friend) {
				var p = friend.payment.id(args.paymentId);
				p.status = 'queued';
				p.date = Date.now();

				p.save(function(err) {
					wembliMail.sendPonyUpEmail({
						res: res,
						req: req,
						friend: friend,
						payment: p,
					}, function(err) {
						if (err) {
							return me(err);
						}
						data.payment = p;
						friend.save(function(err) {
							return me(null, data);
						});
					});
				});
			});
	},

	resendRsvpEmail: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		if (!req.session.customer.email) {
			data.error = true;
			data.success = 0;
			data.noEmail = true;
			return me(null, data);
		}

		/* you must be logged in as the organizer to do this */
		if (req.session.customer._id != req.session.plan.organizer.customerId) {
			data.success = 0;
			data.error = 'Not Authorized';
			return me(null, data);
		}

		/* we can't send the email until the organizer confirms their email address */
		if (req.session.customer.confirmed) {
			Friend.findOne()
				.where('planGuid').equals(req.session.plan.guid)
				.where('_id').equals(args.friendId)
				.exec(function(err, friend) {

					/* now that we have added the friend to the plan and have a token, send the wembli email */
					var rsvpLink = "http://" + app.settings.host + ".wembli.com/rsvp/" + req.session.plan.guid + "/" + friend.rsvp.token + "/wemblimail";
					wembliMail.sendRSVPEmail({
						res: res,
						req: req,
						rsvpDate: req.session.plan.rsvpDate,
						rsvpLink: rsvpLink,
						email: friend.contactInfo.serviceId,
						message: args.message,
						friendId: friend._id,
						friendName:friend.contactInfo.name,
						planGuid: req.session.plan.guid
					}, function() {
						me(null, data);
					});
				});
		}
	},

	removeOutsidePayment: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		/* you must be logged in as the organizer to do this */
		if (req.session.customer._id != req.session.plan.organizer.customerId) {
			data.success = 0;
			data.error = 'Not Authorized';
			return me(null, data);
		}

		Friend.findOne()
			.where('planGuid').equals(req.session.plan.guid)
			.where('_id').equals(args.friendId)
			.exec(function(err, friend) {
				var p = friend.payment.id(args.paymentId).remove();
				friend.save(function(err) {
					if (err) {
						return me(err);
					}
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
			data.noCustomer = true;
			return me(null, data);
		}

		if (!req.session.plan) {
			data.noPlan = true;
			return me(null, data);
		}

		if (args.service === 'wemblimail') {
			if (req.session.customer.email === args.serviceId) {
				data.isOrganizer = true;
				return me(null, data);
			}
		}

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
				friend = new Friend(set);
			}

			friend.save(function(err) {
				if (err) {
					data.success = 0;
					data.dbError = 'unable to save friend';
					return me(null, data);
				}

				/* now add the friend to the plan */
				console.log('addingfriend');
				console.log(req.session.plan);
				req.session.plan.addFriend(friend, function(err) {
					/*
					if (err) {
						data.success = 0;
						data.dbError = 'unable to add friend ' + friend.id + ' ' + err;
						return me(null, data);
					}
					*/
					console.log('friend added:');
					console.log(friend);
					data.friend = friend;

					/* get list of friends for this plan */
					Friend.find({
						planId: req.session.plan._id
					}, function(err, friends) {

						data.friends = friends;
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

	addHotel: function(args, req, res) {
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
			console.log('no plan...to add hotel to');
			data.noPlan = true;
			return me(null, data);
		}

		if (typeof args.hotel === "undefined") {
			console.log('no hotel');
			data.noHotel = true;
			return me(null, data);
		}

		console.log('add hotel to plan:');
		console.log(args);

		var query = {
			'planId': req.session.plan.id,
			'planGuid': req.session.plan.guid,
		};
		var set = {
			planId: req.session.plan.id,
			planGuid: req.session.plan.guid,
			service: args.service,
			eventId: args.eventId,
			hotel: args.hotel,
			total: args.total,
		};

		console.log(set);
		if (typeof args.payment !== "undefined") {

			var pmt = JSON.parse(args.payment);
			var payment = {
				organizer: true,
				customerId: req.session.customer.id,
			};

			if (typeof pmt.amount !== "undefined") {
				payment.amount = pmt.total;
			}

			if (typeof pmt.receipt !== "undefined") {
				set.purchased = true;
				payment.receipt = pmt.receipt;
			}

			set.payment = payment;
		}

		r = new Hotel(set);

		r.save(function(err) {
			if (err) {
				data.success = 0;
				data.dbError = 'unable to save hotel';
				return me(null, data);
			}

			/* now add the ticket to the plan */
			req.session.plan.addHotel(r, function(err) {
				if (err) {
					console.log(err);
					data.success = 0;
					data.dbError = 'unable to add Hotel ' + r.id;
					return me(null, data);
				}
				console.log('added hotel to plan: ' + req.session.plan.guid);
				data.hotel = r;
				return me(null, data);
			});
		});
	},

	addHotelReceipt: function(args, req, res) {
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

		if (typeof args.hotelId === "undefined") {
			console.log('no hotel');
			data.noHotel = true;
			return me(null, data);
		}

		console.log('add receipt to hotel:');
		console.log(args);

		var query = {
			'planId': req.session.plan.id,
			'planGuid': req.session.plan.guid,
			'service': args.service
		};

		/* find all the existing parking for this plan and remove them if payment is not complete */
		Hotel.find(query, function(err, hotels) {
			console.log('found hotels');
			console.log(hotels);
			if (err) {
				data.success = 0;
				data.dbError = 'unable to find hotel';
				return me(null, data);
			}

			var notFound = true;
			/* TODO: to actually support an array of parking, this needs to change */
			for (var i = 0; i < hotels.length; i++) {
				var item = hotels[i];
				console.log('existing hotels to add receipt to');
				console.log(item);

				/* find the parking that matches args.parkingId */
				if (args.hotelId == item.id) {
					notFound = false;
					item.purchased = true;
					console.log('adding receipt for:');
					console.log(item);
					item.payment.manual = args.receipt;
					if (args.receipt.qty) {
						item.payment.qty = args.receipt.qty;
					}
					if (args.receipt.amountPaid) {
						item.payment.amount = args.receipt.amountPaid;
					}
					item.save(function(err) {
						if (err) {
							data.success = 0;
							data.dbError = 'unable to save parking';
							return me(null, data);
						}

						data.hotel = item;
						return me(null, data);
					});
					break;
				}
			};
			if (notFound) {
				console.log('hotel not found for add receipt');
				data.notFound = notFound;
				me(null, data);
			}
		});
	},

	removeHotel: function(args, req, res) {
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
			console.log('no plan...to add parking to');
			data.noPlan = true;
			return me(null, data);
		}
		console.log('remove hotel args:');
		console.log(args);

		Hotel.remove({
			"_id": args.hotelId
		}, function(err) {
			console.log('remove hotel err is: ' + err);
			/* delete the hotel id from the plan and save it */
			var newHotels = [];
			for (var i = 0; i < req.session.plan.hotels.length; i++) {
				if (req.session.plan.hotels[i] != args.hotelId) {
					newHotels.push(req.session.plan.hotels[i]);
				}
			};
			console.log('removing hotels from plan');
			req.session.plan.hotels = newHotels;
			req.session.plan.save(function(err, results) {
				console.log('saved plan after removing hotel - err is:' + err);
				/* get parking to return */
				Hotel.find({
					planId: req.session.plan.id
				}, function(err, results) {
					data.hotels = results;
					me(null, data);
				});
			});
		});
	},

	addRestaurant: function(args, req, res) {
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
			console.log('no plan...to add restaurant to');
			data.noPlan = true;
			return me(null, data);
		}

		if (typeof args.restaurant === "undefined") {
			console.log('no restaurant');
			data.noRestaurant = true;
			return me(null, data);
		}

		console.log('add restaurant to plan:');
		console.log(args);

		var query = {
			'planId': req.session.plan.id,
			'planGuid': req.session.plan.guid,
		};

		var set = {
			planId: req.session.plan.id,
			planGuid: req.session.plan.guid,
			service: args.service,
			eventId: args.eventId,
			restaurant: args.restaurant,
			total: args.total,
		};

		console.log(set);
		if (typeof args.payment !== "undefined") {

			var pmt = JSON.parse(args.payment);
			var payment = {
				organizer: true,
				customerId: req.session.customer.id,
			};

			if (typeof pmt.amount !== "undefined") {
				payment.amount = pmt.total;
			}

			if (typeof pmt.receipt !== "undefined") {
				set.purchased = true;
				payment.receipt = pmt.receipt;
			}

			set.payment = payment;
		}

		r = new Restaurant(set);

		r.save(function(err) {
			if (err) {
				data.success = 0;
				data.dbError = 'unable to save restaurant';
				return me(null, data);
			}

			/* now add the ticket to the plan */
			req.session.plan.addRestaurant(r, function(err) {
				if (err) {
					console.log(err);
					data.success = 0;
					data.dbError = 'unable to add Parking ' + r.id;
					return me(null, data);
				}
				console.log('added parking to plan: ' + req.session.plan.guid);
				data.restaurant = r;
				return me(null, data);
			});
		});
	},

	addRestaurantReceipt: function(args, req, res) {
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

		if (typeof args.restaurantId === "undefined") {
			console.log('no restaurant');
			data.noRestaurant = true;
			return me(null, data);
		}

		console.log('add receipt to restaurant:');
		console.log(args);

		var query = {
			'planId': req.session.plan.id,
			'planGuid': req.session.plan.guid,
			'service': args.service
		};

		/* find all the existing parking for this plan and remove them if payment is not complete */
		Restaurant.find(query, function(err, restaurants) {
			console.log('found restaurants');
			console.log(restaurants);
			if (err) {
				data.success = 0;
				data.dbError = 'unable to find restaurant';
				return me(null, data);
			}

			var notFound = true;
			/* TODO: to actually support an array of parking, this needs to change */
			for (var i = 0; i < restaurants.length; i++) {
				var item = restaurants[i];
				console.log('existing restaurants to add receipt to');
				console.log(item);

				/* find the parking that matches args.parkingId */
				if (args.restaurantId == item.id) {
					notFound = false;
					item.purchased = true;
					console.log('adding receipt for:');
					console.log(item);
					item.payment.manual = args.receipt;
					if (args.receipt.qty) {
						item.payment.qty = args.receipt.qty;
					}
					if (args.receipt.amountPaid) {
						item.payment.amount = args.receipt.amountPaid;
					}
					item.save(function(err) {
						if (err) {
							data.success = 0;
							data.dbError = 'unable to save parking';
							return me(null, data);
						}

						data.restaurant = item;
						return me(null, data);
					});
					break;
				}
			};
			if (notFound) {
				console.log('restaurant not found for add receipt');
				data.notFound = notFound;
				me(null, data);
			}
		});
	},

	removeRestaurant: function(args, req, res) {
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
			console.log('no plan...to add parking to');
			data.noPlan = true;
			return me(null, data);
		}
		console.log('remove restaurant args:');
		console.log(args);

		Restaurant.remove({
			"_id": args.restaurantId
		}, function(err) {
			console.log('remove restaurant err is: ' + err);
			/* delete the restaurant id from the plan and save it */
			var newRestaurants = [];
			for (var i = 0; i < req.session.plan.restaurants.length; i++) {
				if (req.session.plan.restaurants[i] != args.restaurantId) {
					newRestaurants.push(req.session.plan.restaurants[i]);
				}
			};
			console.log('removing restaurants from plan');
			req.session.plan.restaurants = newRestaurants;
			req.session.plan.save(function(err, results) {
				console.log('saved plan after removing restaurant - err is:' + err);
				/* get parking to return */
				Restaurant.find({
					planId: req.session.plan.id
				}, function(err, results) {
					data.restaurants = results;
					me(null, data);
				});
			});
		});
	},

	addParking: function(args, req, res) {
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

		if (typeof args.parking === "undefined") {
			console.log('no parking');
			data.noParking = true;
			return me(null, data);
		}

		console.log('add parking to plan:');
		console.log(args);

		var query = {
			'planId': req.session.plan.id,
			'planGuid': req.session.plan.guid,
		};

		var set = {
			planId: req.session.plan.id,
			planGuid: req.session.plan.guid,
			service: args.service,
			eventId: args.eventId,
			parking: args.parking,
			total: args.total,
		};

		console.log(set);
		if (typeof args.payment !== "undefined") {

			var pmt = JSON.parse(args.payment);
			var payment = {
				organizer: true,
				customerId: req.session.customer.id,
			};

			if (typeof pmt.amount !== "undefined") {
				payment.amount = pmt.total;
			}

			if (typeof pmt.receipt !== "undefined") {
				set.purchased = true;
				payment.receipt = pmt.receipt;
			}

			set.payment = payment;
		}

		p = new Parking(set);

		p.save(function(err) {
			if (err) {
				data.success = 0;
				data.dbError = 'unable to save parking';
				return me(null, data);
			}

			/* now add the ticket to the plan */
			req.session.plan.addParking(p, function(err) {
				if (err) {
					console.log(err);
					data.success = 0;
					data.dbError = 'unable to add Parking ' + p.id;
					return me(null, data);
				}


				console.log('added parking to plan: ' + req.session.plan.guid);
				data.parking = p;
				return me(null, data);
			});
		});
	},

	addParkingReceipt: function(args, req, res) {
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

		if (typeof args.parkingId === "undefined") {
			console.log('no parking');
			data.noParking = true;
			return me(null, data);
		}

		console.log('add parking receipt to parking:');
		console.log(args);

		var query = {
			'planId': req.session.plan.id,
			'planGuid': req.session.plan.guid,
			'service': args.service
		};

		/* find all the existing parking for this plan and remove them if payment is not complete */
		Parking.find(query, function(err, parking) {
			console.log('found parking');
			console.log(parking);
			if (err) {
				data.success = 0;
				data.dbError = 'unable to find parking';
				return me(null, data);
			}

			var notFound = true;
			/* TODO: to actually support an array of parking, this needs to change */
			for (var i = 0; i < parking.length; i++) {
				var item = parking[i];
				console.log('existing parking to add receipt to');
				console.log(item);

				/* find the parking that matches args.parkingId */
				if (args.parkingId == item.id) {
					notFound = false;
					item.purchased = true;
					console.log('adding receipt for:');
					console.log(item);
					item.payment.manual = args.receipt;
					if (args.receipt.qty) {
						item.payment.qty = args.receipt.qty;
					}
					if (args.receipt.amountPaid) {
						item.payment.amount = args.receipt.amountPaid;
					}

					item.save(function(err) {
						if (err) {
							data.success = 0;
							data.dbError = 'unable to save parking';
							return me(null, data);
						}

						data.parking = item;
						return me(null, data);
					});
					break;
				}
			};
			if (notFound) {
				console.log('parking not found for add receipt');
				data.notFound = notFound;
				me(null, data);
			}
		});
	},

	removeParking: function(args, req, res) {
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
			console.log('no plan...to add parking to');
			data.noPlan = true;
			return me(null, data);
		}
		console.log('remove parking args:');
		console.log(args);

		Parking.remove({
			"_id": args.parkingId
		}, function(err) {
			console.log('remove parking err is: ' + err);
			/* delete the parking id from the plan and save it */
			var newParking = [];
			for (var i = 0; i < req.session.plan.parking.length; i++) {
				console.log('checking parking for removal');
				console.log('existing: ' + req.session.plan.parking[i] + ' - ' + args.parkingId);
				if (req.session.plan.parking[i] != args.parkingId) {
					newParking.push(req.session.plan.parking[i]);
				}
			};
			console.log('removing parking from plan');
			console.log(newParking);
			req.session.plan.parking = newParking;
			req.session.plan.save(function(err, results) {
				console.log('saved plan after removing parking - err is:' + err);
				/* get parking to return */
				Parking.find({
					planId: req.session.plan.id
				}, function(err, results) {
					data.parking = results;
					me(null, data);
				});
			});
		});
	},

	addTicketGroup: function(args, req, res) {
		var me = this;

		var data = {
			success: 1
		};

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

		/* must have a customer to create a plan in the db */
		if (!req.session.customer) {
			/* throw the ticket group in the session */
			if (typeof req.session.ticketsToAdd == "undefined") {
				req.session.ticketsToAdd = [];
			}

			var set = {
				planGuid: req.session.plan.guid,
				service: args.service,
				eventId: args.ticketGroup.EventID,
				ticketGroup: args.ticketGroup,
			};

			if (typeof args.qty !== "undefined") {
				set.qty = args.qty;
			}

			if (typeof args.total !== "undefined") {
				set.total = args.total;
			}
			req.session.ticketsToAdd.push(set);
			data.ticketGroup = set;
			return me(null, data);
		}

		console.log('add tickets to plan:');
		console.log(args);

		var query = {
			'planId': req.session.plan.id,
			'planGuid': req.session.plan.guid,
		};

		var addTicketGroup = function() {
			/* finished iterating through existing tickets */
			var set = {
				planId: req.session.plan.id,
				planGuid: req.session.plan.guid,
				service: args.service,
				eventId: args.ticketGroup.EventID,
				ticketGroup: args.ticketGroup
			};

			console.log('add tickets');
			if (typeof args.qty !== "undefined") {
				set.qty = args.qty;
			}

			if (typeof args.total !== "undefined") {
				set.total = args.total;
			}

			console.log(set);
			if (typeof args.payment !== "undefined") {

				var p = JSON.parse(args.payment);
				var payment = {
					organizer: true,
					transactionToken: p.transactionToken,
					customerId: req.session.customer.id,
					amount: p.total,
					qty: p.qty
				};

				set.payment = payment;
			}

			ticket = new Ticket(set);

			ticket.save(function(err) {
				console.log('saved ticket');
				if (err) {
					data.success = 0;
					data.dbError = 'unable to save ticketGroup: ' + err;
					console.log('error adding ticket to plan:');
					console.log(data);
					return me(null, data);
				}

				/* now add the ticket to the plan */
				req.session.plan.addTicket(ticket, function(err) {
					console.log('added ticket');
					console.log(err);
					if (err) {
						console.log(err);
						data.success = 0;
						data.dbError = 'unable to add ticketGroup ' + ticket.id;
						return me(null, data);
					}
					console.log('added ticketGroup to plan: ' + req.session.plan.guid);
					data.ticketGroup = ticket;
					return me(null, data);
				});
			});

		};
		addTicketGroup();

		/* find all the existing tickets for this plan and remove them if payment is not complete */
		/* allowing multiple unpurchased ticket groups for now */
		if (0) {
			Ticket.find(query, function(err, tickets) {
				if (err) {
					data.success = 0;
					data.dbError = 'unable to find ticketGroup';
					return me(null, data);
				}

				/* check if these tickets are still available */
				async.forEach(tickets, function(item, callback) {
					console.log('remove existing ticket item');
					console.log(item);

					/* check if any of these are not yet purchased and remove them */
					if (!item.purchased) {
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
					addTicketGroup();
				});
			});
		}
	},

	removeTicketGroup: function(args, req, res) {
		console.log('remove ticket group called');
		var me = this;

		var data = {
			success: 1
		};

		/* must have a customer to create a plan in the db */
		if (!req.session.customer) {
			/* no customer then check the ticketsToAdd in session
			 * should be its own function because this uses the service's id not our own db id
			 */
			var newT = [];
			if (typeof req.session.ticketsToAdd !== "undefined") {
				for (var i = req.session.ticketsToAdd.length - 1; i >= 0; i--) {
					console.log(req.session.ticketsToAdd[i]);
					if (req.session.ticketsToAdd[i].ticketGroup.ID != args.ticketId) {
						newT.push(req.session.ticketsToAdd[i]);
					}
				};
				req.session.ticketsToAdd = newT;
			}
			data.tickets = newT;
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
			/* sync the plan ticket list with whats in the tickets collection */
			Ticket.find({
				planId: req.session.plan.id
			}, function(err, results) {
				console.log(results);

				var newT = [];
				for (var i = results.length - 1; i >= 0; i--) {
					var t = results[i];
					newT.push(t.id);
				};
				req.session.plan.tickets = newT;
				req.session.plan.markModified('tickets');
				req.session.plan.save(function(err, results) {
					if (err) {
						Plan.findOne()
							.where('organizer.customerId').equals(req.session.customer._id)
							.where('guid').equals(req.session.plan.guid).exec(function(err, p) {
								console.log(err,p);
								if (p === null) {
									//this plan does not belong to this customer
									return me('invalid guid');
								}
								req.session.plan = p;
								return me(null, data);
							});
					} else {

						console.log('saved plan after removing ticket - err is:' + err);
						data.tickets = results;
						me(null, data);

					}
				});
			});
		});
	},

	addTicketGroupReceipt: function(args, req, res) {
		var me = this;

		var data = {
			success: 1
		};

		console.log('add receipt');
		console.log(args);

		/* must have a customer to create a plan in the db */
		if (!req.session.customer) {
			if (typeof req.session.ticketsToAdd !== "undefined") {
				for (var i = req.session.ticketsToAdd.length - 1; i >= 0; i--) {
					console.log(req.session.ticketsToAdd[i]);
					if (req.session.ticketsToAdd[i].ticketGroup.ID === args.ticketId) {
						console.log('adding receipt to ticket:');
						console.log(req.session.ticketsToAdd[i]);

						var item = req.session.ticketsToAdd[i];
						if (typeof item.payment === "undefined") {
							item.payment = {};
						}

						item.purchased = true;
						console.log('adding receipt for:');
						console.log(item);
						item.payment.manual = args.receipt;
						if (args.receipt.qty) {
							item.payment.qty = args.receipt.qty;
							item.qty         = args.receipt.qty;
						}
						if (args.receipt.amountPaid) {
							item.payment.amount = args.receipt.amountPaid;
							item.total          = args.receipt.amountPaid;

						}
						console.log('finished adding receipt to ticket:');
						console.log(req.session.ticketsToAdd[i]);

					}
				};
			}
			data.tickets = req.session.ticketsToAdd;
			console.log(data);
			return me(null, data);
		}

		if (!req.session.plan) {
			console.log('no plan...to add tickets receipt to');
			data.noPlan = true;
			return me(null, data);
		}

		if (typeof args.ticketId === "undefined") {
			console.log('no ticket');
			data.noTicket = true;
			return me(null, data);
		}

		console.log('add ticket receipt to tickets:');
		console.log(args);

		var query = {
			'planId': req.session.plan.id,
			'planGuid': req.session.plan.guid,
			'service': args.service
		};

		console.log('args for tickets querry');
		console.log(query);
		/* find all the existing parking for this plan and remove them if payment is not complete */
		Ticket.find(query, function(err, ticket) {
			console.log('found ticket');
			console.log(ticket);
			if (err) {
				data.success = 0;
				data.dbError = 'unable to find ticket';
				return me(null, data);
			}

			var notFound = true;
			/* TODO: to actually support an array of parking, this needs to change */
			for (var i = 0; i < ticket.length; i++) {
				var item = ticket[i];
				console.log('existing ticket to add receipt to');
				console.log(item);

				/* find the item that matches args.ticketId */
				if (args.ticketId == item.id) {
					notFound = false;
					item.purchased = true;
					console.log('adding receipt for:');
					console.log(item);
					item.payment.manual = args.receipt;
					if (args.receipt.qty) {
						item.payment.qty = args.receipt.qty;
						item.qty         = args.receipt.qty;
						item.ticketGroup.selectedQty = args.receipt.qty;
					}
					if (args.receipt.amountPaid) {
						item.payment.amount = args.receipt.amountPaid;
						item.total          = args.receipt.amountPaid;
					}

					item.save(function(err) {
						if (err) {
							data.success = 0;
							data.dbError = 'unable to save ticket';
							return me(null, data);
						}

						data.ticket = item;
						return me(null, data);
					});
					break;
				}
			};
			if (notFound) {
				console.log('ticket not found for add receipt');
				data.notFound = notFound;
				me(null, data);
			}
		});
	},

	deactivate: function(args, req, res) {
		/* make sure this plan guid belongs to this customer */
		var me = this;
		var data = {
			success: 1
		};
		if (!args.guid) {
			return me('no guid');
		}
		console.log(args);
		Plan.findOne()
			.where('organizer.customerId').equals(req.session.customer._id)
			.where('guid').equals(args.guid).exec(function(err, p) {
				console.log(err,p);
				if (p === null) {
					//this plan does not belong to this customer
					return me('invalid guid');
				}
				console.log('set active to false');
				p.active = false;
				p.save(function() {
					console.log('saved active false');
					me(null,data);
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

			console.log('saving prefs');
			console.log(req.session.plan.preferences.guestList);

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
