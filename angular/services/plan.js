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
			'vote':2,
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
				self.activateSection = sectionName;
				this.activate();
			},

			/* took out scroll functionality for click instead */
			activate: function(sectionName) {
				self.activateSection = sectionName ? sectionName : self.activateSection;

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
factory('notifications', ['$timeout', 'plan',
	function($timeout, plan) {
		/* maps notification keys to the com elements */
		var keyMapping = {
			'rsvpComplete': {
				id: '#rsvp-complete-notification',
				nav: 'notification-nav-section-rsvp'
			},
			'notConfirmed': {
				id: '#not-confirmed-notification',
				nav: 'notification-nav-section-rsvp'
			},
			'ticketCountMismatch': {
				id: '#ticket-count-mismatch-notification',
				nav: 'notification-nav-section-cart'
			}
		};

		var reverseKeyMapping = {
			'rsvp-complete-notification':'rsvpComplete',
			'not-confirmed-notification':'notConfirmed',
			'ticket-count-mismatch-notification':'ticketCountMismatch'
		};


		return {

			findInPlan: function(id, notifications) {
				var ret = null;
				angular.forEach(notifications, function(n) {
					if (reverseKeyMapping[id] == n.key) {
						ret = n;
					}
				});
				if (ret) {
					return ret;
				}
			},

			update: function(p) {
				var self = this;
				$timeout(function() {
					var counts = {};

					/* count all the notifications */
					plan.get(function(p) {
						angular.forEach(p.notifications, function(n) {
							if (!n.acknowledged) {
								var mapping = keyMapping[n.key];
								counts[mapping.nav] = (typeof counts[mapping.nav] !== "undefined") ? counts[mapping.nav]++ : 1;
							}
						});

						/* check for notifications on the page to display */
						$('section .notification').each(function(idx, el) {

							var mapping = keyMapping[reverseKeyMapping[el.id]];
							/* console will throw: undefined is not a function if the notification isn't in the mappings */
							/* if its in the plan then display it else hide it */
							var n = self.findInPlan(el.id, p.notifications);

							if ((typeof n === "undefined") || n.acknowledged) {
								console.log('hiding notification because it has been acknowledged: ');
								$(el).hide();
							} else {
								$(el).show();
							}
						});

						/* display the counts */
						$('#plan-nav a .notification').each(function(idx, n) {
							if (counts[n.id]) {
								$(n).html(counts[n.id]).show();
							} else {
								$(n).html('0').hide();
							}
	 					});
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
			label: 'Ticket Group ',
			perGroup: false
		};

		self.parking = {
			fee: 0,
			deliveryFee: 0,
			label: 'Parking Spot ',
			perGroup: true
		};

		self.restaurants = {
			fee: 0,
			deliveryFee: 0,
			label: 'Restaurant Deal ',
			perGroup: true
		};

		self.hotels = {
			fee: 0,
			deliveryFee: 0,
			label: 'Hotel Room ',
			perGroup: true
		};
		self.methods = {
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
					return (item.purchased) ? item.payment.qty : item.ticketGroup.maxSplit;
				},
				"totalEach": function(item, price, fee, qty, splitBy) {
					//return price + fee;
					//return ((price * qty) + fee) / splitBy;
					if (item.purchased) {
						return price;
					} else {
						return price + fee;
						//return ((price + fee) * qty) / splitBy;
					}
				},
				"total": function(item, totalEach, splitBy, deliveryFee) {
					if (item.purchased) {
						return item.payment.amount || 0;
					} else {
						return totalEach * splitBy + deliveryFee;
					}
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
							return 0;
						}
					}
				},
				"getQty": function(item) {
					if (item.purchased) {
						return item.payment.qty || 0;
					} else {
						if (item.service === 'pw') {
							return item.parking.available_spots;
						} else {
							return 0;
						}
					}
				},
				"totalEach": function(item, price, fee, qty, splitBy) {
					//return price + fee;
					//return ((price * qty) + fee) / splitBy;
					if (item.purchased) {
						return price;
					} else {
						return price + fee;
						//return ((price + fee) * qty) / splitBy;
					}
				},
				"total": function(item, totalEach, splitBy, deliveryFee) {
					if (item.purchased) {
						return item.payment.amount || 0;
					} else {
						return totalEach * splitBy + deliveryFee;
					}
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
							return 0;
						}
					}
				},
				"totalEach": function(item, price, fee, qty, splitBy) {
					//return price + fee;
					//return ((price * qty) + fee) / splitBy;
					if (item.purchased) {
						return price;
					} else {
						return price + fee;
						//return ((price + fee) * qty) / splitBy;
					}
				},
				"total": function(item, totalEach, splitBy, deliveryFee) {
					if (item.purchased) {
						return item.payment.amount || 0;
					} else {
						return totalEach * splitBy + deliveryFee;
					}
				},

				"getQty": function(item) {
					if (item.purchased) {
						return item.payment.qty || 0;
					} else {
						if (item.service === 'yipit') {
							return 1;
						} else {
							return 0;
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
				"totalEach": function(item, price, fee, qty, splitBy) {
					//return price + fee;
					//return ((price * qty) + fee) / splitBy;
					if (item.purchased) {
						return price;
					} else {
						return price + fee;
						//return ((price + fee) * qty) / splitBy;
					}
				},
				"total": function(item, totalEach, splitBy, deliveryFee) {
					if (item.purchased) {
						return item.payment.amount || 0;
					} else {
						return totalEach * splitBy + deliveryFee;
					}
				},

			},
		};

		return {
			suggestedAmounts: function() {
				var friends = plan.getFriends();
				var p = plan.get();
				if (typeof p === "undefined") {
					return;
				}
				if (typeof friends === "undefined") {
					return;
				}

	      var addOns = ['tickets', 'parking', 'restaurants', 'hotels'];

	      angular.forEach(addOns, function(a) {
	      	console.log('processing suggest amounts for '+a);
					var funcs            = self.methods[a];
					var config           = funcs.getConfig();
					var items            = funcs.get();
	        var remainingQty     = null;
	        var remainingItem    = null;
	        var used             = {};
	        used[a]              = {};


	        var handleFriend = function(friend) {
	          var friendCount      = 1;
	          var purchased        = [];
	          var notPurchased     = [];
	          var remainingFriends = null;
	          friend[a]            = {};
	          friend[a].suggestedPonyUpAmount = 0;
	          friend.suggestedPonyUpAmount = 0;

	          /* is this item per person or per friend group? */
	          if (!config.perGroup) {
	          	friendCount += parseInt(friend.rsvp.guestCount);
	          }

	          console.log('friendCount: '+friendCount);
	          console.log('remainingQty: '+remainingQty);
						/* didn't use all the qty from the last item */
						if (remainingQty > 0) {
							/* this friend still didn't use all the qty */
							if (friendCount <= remainingQty) {
								remainingQty    = remainingQty - friendCount;
		            friend[a].suggestedPonyUpAmount += (remainingItem.costBreakdown.totalEach * friendCount) + remainingItem.costBreakdown.deliveryFeeEach;
		            return;
							} else {
								/* not enough qty for all these friends */
		            friend[a].suggestedPonyUpAmount += (remainingItem.costBreakdown.totalEach * remainingQty) + remainingItem.costBreakdown.deliveryFeeEach;

		            /* decrement friendCount by remainingQty */
		            friendCount   = friendCount - remainingQty;
		          	used[a][remainingItem._id] = true;
		            remainingQty  = null;
		            remainingItem = null;
							}

						}

						if (remainingQty == 0) {
		          used[a][remainingItem._id] = true;
		          remainingQty               = null;
		          remainingItem              = null;
						}


	          angular.forEach(items, function(i) {
	            if (i.purchased) {
	              purchased.push(i);
	            } else {
	              notPurchased.push(i);
	            }
	          });
	          var all = purchased.concat(notPurchased);

	          angular.forEach(all, function(item) {
	          	if (typeof item.costBreakdown === "undefined") {
	          		return;
	          	}
	          	if (friendCount == 0) {
	          		return;
	          	}
	          	if (used[a][item._id]) {
	          		return;
	          	}
	            /* are there enough qty in this item to satisfy this invitee */
							var qty = funcs.getQty(item);
							console.log('item qty: '+qty);

							/* there more qty in this item than friends */
							if (friendCount < qty) {
								remainingQty    = qty - friendCount;
								remainingItem   = item;
		            friend[a].suggestedPonyUpAmount += (item.costBreakdown.totalEach * friendCount) + item.costBreakdown.deliveryFeeEach;
		            /* all friends accounted for */
			          friendCount     = 0;
							}

							if (friendCount >= qty) {
								/* need to use the next ticket group */
								friendCount  = friendCount - qty;
								friend[a].suggestedPonyUpAmount += (item.costBreakdown.totalEach * qty) + item.costBreakdown.deliveryFeeEach;
								used[a][item._id] = true;
							}

	          });
	        };

	        if (p.organizer.rsvp.decision) {
	        	handleFriend(p.organizer);
	        }

	        angular.forEach(friends, handleFriend);

	      });

        angular.forEach(friends, function(friend) {
		      angular.forEach(addOns, function(a) {
	        	friend.suggestedPonyUpAmount += friend[a].suggestedPonyUpAmount;
	        	friend[a].suggestedPonyUpAmount = parseFloat(friend[a].suggestedPonyUpAmount).toFixed(2);
	        });
	        friend.suggestedPonyUpAmount = parseFloat(friend.suggestedPonyUpAmount).toFixed(2);
	      });
			},

			totals: function(key) {
				var me = this;
				plan.get(function(p) {
					var funcs            = self.methods[key];
					var config           = funcs.getConfig();
					var items            = funcs.get();
					var groupTotal       = 0;
					var groupCount       = 0;
					var groups           = [];
					var groupTotalEach   = {};
					var fee              = config.fee || 0;
					var deliveryFee      = config.deliveryFee || 0;
					var splitBy          = 0;
					var deliverySplitBy  = 0;
					var remainingSplitBy = null;

					/* count the organizer in the split? */
					if (p.organizer.rsvp.decision) {
						splitBy += 1;
	          /* is this item per person or per friend group? */
	          if (!config.perGroup) {
	          	splitBy += p.organizer.rsvp.guestCount;
	          }
						deliverySplitBy++;
					}

					/* get the friends to split by */
					var friends = plan.getFriends();
					for (var i = 0; i < friends.length; i++) {
						var f = friends[i];
						/* add 1 for each friend who is invited and going but don't count their guests */
						if (f.inviteStatus && f.rsvp.decision) {
							splitBy += 1;
		          /* is this item per person or per friend group? */
		          if (!config.perGroup) {
		          	splitBy += parseInt(f.rsvp.guestCount);
		          }


							deliverySplitBy++;
						}
					};

					/* separate purchased and not purchased */
					var purchasedFirst = [];
					var notPurchased   = [];
					for (var i = 0; i < items.length; i++) {
						if (items[i].purchased) {
							purchasedFirst.push(items[i]);
						} else {
							notPurchased.push(items[i]);
						}
					}
					var all = purchasedFirst.concat(notPurchased);
					/* loop through the purchased list of add-ons first then not purchased and generate totals */
					for (var i = 0; i < all.length; i++) {
						var item   = items[i];
						var amount = parseFloat(funcs.getAmount(item));
						var qty    = funcs.getQty(item);

						if (typeof qty === "undefined") {
							qty = 0;
						}

						/* edge case - what to split by if no one is invited yet? try total tickets
						 * if organizer is coming but no one else
						 * or no one is coming at all
						 */
						if ((p.organizer.rsvp.decision && splitBy == 1) || (splitBy == 0)) {
							splitBy         = qty;
							deliverySplitBy = qty;
						}


						/* if not everyone was covered by the previos ticket group then catch them with this one */
						if (remainingSplitBy !== null) {
							if (remainingSplitBy > 0) {
								splitBy         = remainingSplitBy;
								deliverySplitBy = remainingSplitBy;
							}

							/* if everyone coming is covered then use the qty for the calc */
							if (remainingSplitBy <= 0) {
								splitBy          = qty;
								deliverySplitBy  = qty;
							}
						}
						/* if splitBy > qty then make splitBy = qty for this calculation
							this way we'll never split by more people than we have tickets for.
							the remaining splitBy should be covered by another ticket group
						*/
						remainingSplitBy = splitBy - qty;
						if (splitBy > qty) {
							splitBy          = qty;
							deliverySplitBy  = qty;
						}

						var cb = {};
						var groupNumber = i + 1;

						/* how many tickets of this group are claimed */
						cb.claimed         = parseInt(splitBy);
						/* price each */
						cb.price           = parseFloat(amount) || 0;
						/* service fee each */
						cb.serviceFee      = cb.price * fee;
						/* total delivery fee */
						cb.deliveryFee     = deliveryFee;
						/* delivery fee each */
						cb.deliveryFeeEach = (deliverySplitBy > 0) ? cb.deliveryFee / deliverySplitBy : 0;
						cb.totalEach       = funcs.totalEach(item, cb.price, cb.serviceFee, qty, splitBy);
						cb.total           = funcs.total(item, cb.totalEach, splitBy, cb.deliveryFee);

						groupTotal        += cb.total;
						groupCount        += cb.claimed;
						groups.push({
							value: i,
							label: config.label + groupNumber
						});
						groupTotalEach[i]  = cb.totalEach;
						item.costBreakdown = cb;
					};

					items.total          = groupTotal;
					items.totalQty       = groupCount;
					items.groups         = groups;
					items.groupTotalEach = groupTotalEach;
					me.suggestedAmounts();
				});
			}
		};
	}
]);
