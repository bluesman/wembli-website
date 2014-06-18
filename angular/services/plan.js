angular.module('wembliApp.services.plan', []).
/* plan */
factory('planNav', ['$timeout', '$rootScope', '$location', 'header', 'notifications',
	function($timeout, $rootScope, $location, header, notifications) {
		var self             = this;
		self.activateSection = 1;
		self.arrowTop        = 111;
		self.arrowHeight     = 109;
		self.navFactor = {
			'rsvp':1,
			'cart':2,
			'pony-up':3,
			'itinerary':4,
			'chatter':5
		};


		var planNav = {

			onActivate: function(f) {
				self.onActivate = f;
			},

			setActivateSection: function(sectionName) {
				console.log('to section ' + sectionName);
				self.activateSection = sectionName;
				this.activate();
			},

			/* took out scroll functionality for click instead */
			activate: function(sectionName) {
				self.activateSection = sectionName ? sectionName : self.activateSection;

				console.log('activate section ' + self.activateSection);

				/* hide all the sections */
				$('.plan-section').removeClass('hide').hide();
				/* deactivate all the navs */
				$('.plan-section-nav').removeClass('active');
				/* activate the one we're going to */
				$('#nav-section-' + self.activateSection).addClass('active');
				var top = self.arrowTop + (self.arrowHeight * self.navFactor[self.activateSection]);
				/* put the arrow in the right place */
				$('.nav-arrow').css('top', top + 'px').removeClass('hide').show();
				/* fade in the section */
				$('#section-' + self.activateSection).fadeIn(500);

				notifications.update();

				header.fixed();

				/* custom callback once a section loads */
				if (self.onActivate) {
					self.onActivate();
				}

			}

		};
		return planNav;
	}
]).

/* plan */
factory('notifications', ['$timeout',
	function($timeout) {
		return {
			update: function() {
				$timeout(function() {
					/* check for notifications */
					$('section').each(function(sectionNumber, section) {
						var count = 0;
						var key = '#' + section.id + ' .notification';
						$(key).each(function(idx, el) {
							if ($(el).css('display') === 'block') {
								count++;
							}
						});
						if (count) {
							$('#notification-nav-' + section.id).html(count).show();
						} else {
							$('#notification-nav-' + section.id).html(count).hide();
						}
					});
				}, 500);
			}
		};
	}
]).

factory('cart', ['plan',
	function(plan) {
		var self = this;

		self.tickets = {
			fee: 0.15,
			deliveryFee: 15,
			label: 'Ticket Group '
		};

		self.parking = {
			fee: 0,
			deliveryFee: 0,
			label: 'Parking Spot '
		};

		self.restaurants = {
			fee: 0,
			deliveryFee: 0,
			label: 'Restaurant Deal '
		};

		self.hotels = {
			fee: 0,
			deliveryFee: 0,
			label: 'Hotel Room '
		};

		return {
			totals: function(key) {
				plan.get(function(p) {
					var methods = {
						'tickets': {
							"get": function() {
								return plan.getTickets();
							},
							"getConfig": function() {
								return self.tickets;
							},
							"getAmount": function(item) {
								if (item.purchased) {
									return item.payment.qty ? (item.payment.amount / item.payment.qty) : 0;
								} else {
									return item.ticketGroup.ActualPrice || 0;
								}
							},
							"getQty": function(item) {
								return (item.purchased) ? item.payment.qty : item.ticketGroup.selectedQty;
							},
							"totalEach": function(price, fee, qty, splitBy) {
								//return price + fee;
								return ((price * qty) + fee) / splitBy;
							},

						},
						'parking': {
							"get": function() {
								return plan.getParking();
							},
							"getConfig": function() {
								return self.parking;
							},
							"getAmount": function(item) {
								if (item.purchased) {
									return item.payment.qty ? (item.payment.amount / item.payment.qty) : 0;
								} else {
									if (item.service === 'pw') {
										return item.parking.price || 0;
									} else {
										0
									}
								}
							},
							"getQty": function(item) {
								if (item.purchased) {
									return item.payment.qty;
								} else {
									if (item.service === 'pw') {
										return item.parking.reservation;
									} else {
										0
									}
								}
							},
							"totalEach": function(price, fee, qty, splitBy) {
								return ((price * qty) + fee) / splitBy;
							},

						},
						'restaurants': {
							"get": function() {
								return plan.getRestaurants();
							},
							"getConfig": function() {
								return self.restaurants;
							},

							"getAmount": function(item) {
								if (item.purchased) {
									return item.payment.qty ? (item.payment.amount / item.payment.qty) : 0;
								} else {
									if (item.service === 'yipit') {
										return item.restaurant.price.raw || 0;
									} else {
										0
									}
								}
							},

							"totalEach": function(price, fee, qty, splitBy) {
								return ((price * qty) + fee) / splitBy;
							},

							"getQty": function(item) {
								if (item.purchased) {
									return item.payment.qty;
								} else {
									if (item.service === 'yipit') {
										return 1;
									} else {
										0
									}
								}
							}
						},
						'hotels': {
							"get": function() {
								return plan.getHotels();
							},
							"getConfig": function() {
								return self.hotels;
							},
							"getAmount": function(item) {
								return 0;
							},
							"getQty": function(item) {
								return 0;
							},
							"totalEach": function(price, fee, qty, splitBy) {
								return ((price * qty) + fee) / splitBy;
							},


						},
					};

					var funcs = methods[key];
					var config = funcs.getConfig();
					var items = funcs.get();
					var groupTotal = 0;
					var groupCount = 0;
					var groups = [];
					var groupTotalEach = {};
					var fee = config.fee || 0;
					var deliveryFee = config.deliveryFee || 0;
					var splitBy = 0;
					var deliverySplitBy = 0;

					/* count the organizer in the split? */
					if (p.organizer.rsvp.decision) {
						splitBy += parseInt(p.organizer.rsvp.guestCount);
						deliverySplitBy++;
					}

					/* get the friends to split by */
					var friends = plan.getFriends();
					for (var i = 0; i < friends.length; i++) {
						var f = friends[i];
						/* add 1 for each friend who is invited and going but don't count their guests */
						if (f.inviteStatus && f.rsvp.decision) {
							splitBy += parseInt(f.rsvp.guestCount);
							deliverySplitBy++;
						}
					};

					/* loop through the list of add-ons and generate totals */
					for (var i = 0; i < items.length; i++) {
						var item = items[i];
						var amount = parseFloat(funcs.getAmount(item));
						var qty = funcs.getQty(item);
						if (typeof qty === "undefined") {
							qty = 0;
						}

						var cb = {};
						var groupNumber = i + 1;

						/* price each */
						cb.price = parseFloat(amount) || 0;
						/* service fee each */
						cb.serviceFee = cb.price * fee;
						/* total delivery fee */
						cb.deliveryFee = deliveryFee;
						/* delivery fee each */
						cb.deliveryFeeEach = (deliverySplitBy > 0) ? cb.deliveryFee / deliverySplitBy : 0;
						cb.totalEach = funcs.totalEach(cb.price, cb.serviceFee, qty, splitBy);

						cb.total = cb.totalEach * splitBy + cb.deliveryFee;
						groupTotal += cb.total;
						groupCount += qty;
						groups.push({
							value: i,
							label: config.label + groupNumber
						});
						groupTotalEach[i] = cb.totalEach;
						item.costBreakdown = cb;
					};

					items.total = groupTotal;
					items.totalQty = groupCount;
					items.groups = groups;
					items.groupTotalEach = groupTotalEach;

				});
			}
		};
	}
]);
