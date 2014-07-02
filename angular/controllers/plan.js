/* Controllers */
angular.module('wembliApp.controllers.plan', []).

controller('RestaurantsOffsiteCtrl', ['$scope', 'plan', '$http', '$rootScope', '$location',
	function($scope, plan, $http, $rootScope, $location) {

		plan.get(function(p) {
			$scope.plan = p;
		});


		$scope.$on('restaurants-offsite-clicked', function(e, args) {
			$scope.amountPaid = args.amountPaid;
			$scope.eventId = args.eventId,
			$scope.eventName = args.eventName,
			$scope.restaurantId = args.restaurantId,
			$scope.restaurant = args.restaurant;
			$scope.qty = args.qty;
		});

		$scope.showButton = function() {
			return ($scope.restaurantsOffsite === 'bought');
		};

		$scope.submitForm = function() {
			/* update the parking to have a receipt because parkwhiz doesn't give us a pixel yet */
			plan.addRestaurantReceipt({
				restaurantId: $scope.restaurantId,
				service: $scope.restaurant.service,
				receipt: {
					qty: $scope.qty,
					amountPaid: $scope.amountPaid
				}
			}, function(err, result) {
				$('#restaurants-offsite-modal').modal('hide');
				/* have to back to plan so they don't have a chance to buy more */
				$location.path("/plan");

				var r = plan.getRestaurants();

				var newR = [];

				if (typeof r[0] === "undefined") {
					newR.push(result.restaurant);
				} else {
					for (var i = 0; i < r.length; i++) {
						if (r[i]._id = result.restaurant._id) {
							newR.push(result.restaurant);
						} else {
							newR.push(r[i]);
						}
					};
				}
				plan.setRestaurants(newR);
				$rootScope.$broadcast('restaurants-changed', {
					restaurants: newR
				});

				/* uncomment if we end up supporting multiple parking in a plan
			$rootScope.$broadcast('parking-changed', {
				parking: [result.parking]
			});
			*/
			});
		};

		$scope.cancelForm = function() {
			/* remove the parking and close the modal */
			plan.removeRestaurant({
				restaurantId: $scope.restaurantId
			}, function(err, results) {

				$('#restaurants-offsite-modal').modal('hide');

				$rootScope.$broadcast('restaurants-changed', {
					restaurants: results.restaurants
				});

			});

		};

	}
]).

controller('HotelsOffsiteCtrl', ['$scope', 'plan', '$http',
	function($scope, plan, $http) {
		plan.get(function(p) {
			$scope.plan = p;
		});

		$scope.$on('tickets-offsite-clicked', function(e, args) {

			$scope.qty = args.qty;
			$scope.amountPaid = args.amountPaid;
			$scope.eventId = args.eventId,
			$scope.eventName = args.eventName,
			$scope.sessionId = args.sessionId,
			$scope.ticketGroup = args.ticketGroup,
			$scope.ticketId = args.ticketId
		})

		$scope.showButton = function() {
			return ($scope.ticketsOffsite === 'bought');
		};

		$scope.submitForm = function() {
			/* for testing, fire the ticketnetwork pixel */
			$http.get('http://tom.wembli.com/callback/tn/checkout?request_id=' + $scope.sessionId + '&event_id=' + $scope.eventId);
		};

		$scope.cancelForm = function() {
			/* remove the ticketgroup and close the modal */
			plan.removeTicketGroup({
				ticketId: $scope.ticketId
			}, function(err, results) {
				$('#tickets-offsite-modal').modal('hide');
			});

		};

	}
]).

controller('ParkingOffsiteCtrl', ['$scope', 'plan', '$http', '$location', '$rootScope',
	function($scope, plan, $http, $location, $rootScope) {
		plan.get(function(p) {
			$scope.plan = p;
		});


		$scope.$on('parking-offsite-clicked', function(e, args) {

			$scope.amountPaid = args.amountPaid;
			$scope.eventId = args.eventId,
			$scope.eventName = args.eventName,
			$scope.parkingId = args.parkingId,
			$scope.parking = args.parking;
			$scope.qty = args.qty;
		});

		$scope.showButton = function() {
			return ($scope.parkingOffsite === 'bought');
		};

		$scope.submitForm = function() {
			/* update the parking to have a receipt because parkwhiz doesn't give us a pixel yet */
			plan.addParkingReceipt({
				parkingId: $scope.parkingId,
				service: $scope.parking.service,
				receipt: {
					qty: $scope.qty,
					amountPaid: $scope.amountPaid
				}
			}, function(err, result) {
				$('#parking-offsite-modal').modal('hide');
				/* have to back to plan so they don't have a chance to buy more */
				$location.path("/plan");
				var p = plan.getParking();

				var newP = [];

				if (typeof p[0] === "undefined") {
					newP.push(result.parking);
				} else {
					for (var i = 0; i < p.length; i++) {
						if (p[i]._id = result.parking._id) {
							newP.push(result.parking);
						} else {
							newP.push(p[i]);
						}
					};
				}
				plan.setParking(newP);
				$rootScope.$broadcast('parking-changed', {
					parking: newP
				});


				/* uncomment if we end up supporting multiple parking in a plan
			$rootScope.$broadcast('parking-changed', {
				parking: [result.parking]
			});
			*/
			});
		};

		$scope.cancelForm = function() {
			/* remove the parking and close the modal */
			plan.removeParking({
				parkingId: $scope.parkingId
			}, function(err, results) {
				$('#parking-offsite-modal').modal('hide');

				$rootScope.$broadcast('parking-changed', {
					parking: results.parking
				});

			});

		};

	}
]).


/* don't rely on DOM based inheritence in angular
 *
 * http://stackoverflow.com/questions/15386137/angularjs-controller-inheritance
 *
 */
controller('PlanCtrl', ['$scope', 'plan', 'customer','overlay', 'cart',
	function($scope, plan, customer, overlay, cart) {
    $scope.buyTickets = function() {
      overlay.show();
      $scope.buyTicketsOffsite = true;
    };

    $scope.removeTicketGroup = function() {
      $scope.buyTicketsOffsite = false;
      overlay.hide();
    };

		$scope.activateSection = function(sectionName) {
			console.log('activateSection '+ sectionName);
      var sectionName = sectionName.split('-')[2];
      planNav.activate(sectionName);
      googleMap.resize();
		};

    $scope.friendsPonyUp = function(friends) {

      var tickets = plan.getTickets();
      var parking = plan.getParking();
      var restaurants = plan.getRestaurants();

      /* assuming there's only 1 ticketGroup for now */
      /* kim and ash say guests don't count for a delivery fee */
      var totalPoniedUp = 0;
      for (var i = 0; i < friends.length; i++) {
        friends[i].suggestedPonyUpAmount = 0;


        if ((typeof tickets[0] !== "undefined") && (typeof tickets[0].costBreakdown !== "undefined")) {
          if (typeof friends[i].tickets == "undefined") {
            friends[i].tickets = {};
          }
          friends[i].tickets = tickets[0];
          var suggested = friends[i].tickets.costBreakdown.totalEach * friends[i].rsvp.guestCount + friends[i].tickets.costBreakdown.deliveryFeeEach;
          friends[i].tickets.suggestedPonyUpAmount = suggested.toFixed(2);
          friends[i].suggestedPonyUpAmount += parseFloat(suggested);
        } else {
          friends[i].tickets = [];
        }

        if ((typeof parking[0] !== "undefined") && (typeof parking[0].costBreakdown !== "undefined")) {
          friends[i].parking = parking[0];
          var suggested = friends[i].parking.costBreakdown.totalEach * friends[i].rsvp.guestCount;
          friends[i].parking.suggestedPonyUpAmount = suggested.toFixed(2);
          friends[i].suggestedPonyUpAmount += parseFloat(suggested);
        } else {
          friends[i].parking = [];
        }

        if ((typeof restaurants[0] !== "undefined") && (typeof restaurants[0].costBreakdown !== "undefined")) {
          friends[i].restaurants = restaurants[0];
          var suggested = friends[i].restaurants.costBreakdown.totalEach * friends[i].rsvp.guestCount;
          friends[i].restaurants.suggestedPonyUpAmount = suggested.toFixed(2);
          friends[i].suggestedPonyUpAmount += parseFloat(suggested);
        } else {
          friends[i].restaurants = [];
        }
        friends[i].suggestedPonyUpAmount = parseFloat(friends[i].suggestedPonyUpAmount).toFixed(2);
      };
      return friends;
    };

    $scope.calcTotalComing = function() {
      $scope.totalComing = 0;
      $scope.friendsComing = [];
      $scope.totalPoniedUp = 0.00;
      if (!$scope.friends) {
        return;
      }
      /* get the friend that is this customer */
      for (var i = 0; i < $scope.friends.length; i++) {
        if ($scope.friends[i].customerId === customer.get().id) {
          if ($scope.me.rsvp.decision) {
            $scope.totalComing = parseInt($scope.totalComing) + parseInt($scope.me.rsvp.guestCount);
            $scope.friendsComing.push($scope.me);
            $scope.friends[i] = $scope.me;
          }
          continue;
        }

        if ($scope.friends[i].rsvp.decision && $scope.friends[i].inviteStatus) {
          $scope.totalComing = parseInt($scope.totalComing) + parseInt($scope.friends[i].rsvp.guestCount);
          $scope.friendsComing.push($scope.friends[i]);

          /* sum the total ponied up for this friend */
          $scope.friends[i].totalPoniedUp = 0;
          for (var j = 0; j < $scope.friends[i].payment.length; j++) {
            var p = $scope.friends[i].payment[j];
            if (p.type !== 'request') {
              $scope.friends[i].totalPoniedUp += p.amount;
            }
          };
          $scope.totalPoniedUp += parseInt($scope.friends[i].totalPoniedUp);
        }
      };

      /* count the organizer */
      if ($scope.plan.organizer.rsvp.decision) {
        $scope.totalComing = parseInt($scope.totalComing) + parseInt($scope.plan.organizer.rsvp.guestCount);
      }

    };

    $scope.setSelectedQty = function() {
      /* init selectedQty */
      angular.forEach($scope.tickets, function(t) {
        if (typeof t.ticketGroup.selectedQty === "undefined") {
          /* if there is a split that matches totalComing use that, else use the highest split */
          angular.forEach(t.ticketGroup.ValidSplits.int, function(split) {
            console.log('valid split: '+split+ ' == '+$scope.totalComing);
            if (split == $scope.totalComing) {
              t.ticketGroup.selectedQty = parseInt(split)
            }
          });

          if (typeof t.ticketGroup.selectedQty === "undefined") {
            console.log('using last split');
            t.ticketGroup.selectedQty = parseInt(t.ticketGroup.ValidSplits.int[t.ticketGroup.ValidSplits.int.length - 1]);
          }
        }
      });

    };

    $scope.reconcileTicketQty = function() {
      if (typeof $scope.tickets === "undefined") {
        return;
      }
      /* if there are tickets, see if there is the right number of tickets for the number of people confirmed */
      var sum = 0;
      for (var i = 0; i < $scope.tickets.length; i++) {
        var t = $scope.tickets[i];
        sum += parseInt(t.ticketGroup.selectedQty);
      };

      /* if they have more than 0 tickets, check to see if they have more than the number of people coming */
      if (sum > 0) {
        $scope.ticketCountMismatch = true;
        if (sum >= $scope.totalComing) {
          $scope.ticketCountMismatch = false;
        }
      }
    };


    $scope.acknowledgeNotification = function(key) {
      plan.acknowledgeNotification(key);
    };

    $scope.serviceFee = function(price) {
      return price * 0.15;
    }

    // TODO - make this a filter?
    $scope.showEllipses = function(ary, len) {
      if (typeof ary !== "undefined") {
        return (ary.join(', ').length > len);
      }
    };

    $scope.$watch('restaurants', function(newVal, oldVal) {
      if (typeof newVal === "undefined") {
        return;
      }
      if (oldVal === newVal) {
        return;
      }
      cart.totals('restaurants');
      $scope.friendsPonyUp($scope.friends);
    });

    $scope.$watch('hotels', function(newVal, oldVal) {
      if (typeof newVal === "undefined") {
        return;
      }
      if (oldVal === newVal) {
        return;
      }
      cart.totals('hotels');
      $scope.friendsPonyUp($scope.friends);
    });

    $scope.$watch('parking', function(newVal, oldVal) {
      if (typeof newVal === "undefined") {
        return;
      }
      if (oldVal === newVal) {
        return;
      }
      $scope.friendsPonyUp($scope.friends);
      cart.totals('parking');
    });

    $scope.$watch('tickets', function(newVal, oldVal) {
      if (typeof newVal === "undefined") {
        return;
      }
      if (oldVal === newVal) {
        return;
      }
      cart.totals('tickets');
      $scope.friendsPonyUp($scope.friends);
      $scope.setSelectedQty();
    });

    /* get the plan */
    plan.get(function(p) {

      $scope.plan        = p;
      $scope.organizer   = plan.getOrganizer();
      $scope.tickets     = plan.getTickets();
      $scope.parking     = plan.getParking();
      $scope.hotels      = plan.getHotels();
      $scope.restaurants = plan.getRestaurants();
      $scope.friends     = plan.getFriends();
      $scope.context     = plan.getContext();

      /* debug stuff */
      console.log('GETTING PLAN INFO:');
      console.log('plan:');
      console.log($scope.plan);
      console.log('organizer');
      console.log($scope.organizer);
      console.log('tickets');
      console.log($scope.tickets);
      console.log('friends');
      console.log($scope.friends);
      console.log('parking');
      console.log($scope.parking);
      console.log('restaurants');
      console.log($scope.restaurants);
      console.log('hotels');
      console.log($scope.hotels);
      console.log('context');
      console.log($scope.context);

      /* get the friend that is this customer */
      for (var i = 0; i < $scope.friends.length; i++) {
        if ($scope.friends[i].customerId === customer.get().id) {
          $scope.me = $scope.friends[i];
        }
      };

      $scope.calcTotalComing();
      $scope.setSelectedQty();
      $scope.friendsPonyUp($scope.friends);

      $scope.canRequestPonyUp = ($scope.friendsComing && ($scope.friendsComing.length > 0));

	    /* start polling for changes - polls every 30 seconds */
      /*
	    plan.poll(function(plan) {
	      plan.get(function(p) {
		      $scope.plan        = p;
		      $scope.organizer   = plan.getOrganizer();
		      $scope.tickets     = plan.getTickets();
		      $scope.parking     = plan.getParking();
		      $scope.hotels      = plan.getHotels();
		      $scope.restaurants = plan.getRestaurants();
		      $scope.friends     = plan.getFriends();
		      $scope.context     = plan.getContext();
		      $scope.feed        = plan.getFeed();

		      $scope.calcTotalComing();
          $scope.setSelectedQty();

	      });
	    });
      */
    });
	}
]).

controller('OrganizerPlanCtrl', ['$scope', 'cart', 'plan', '$location', 'wembliRpc', 'overlay', 'ticketPurchaseUrls', 'notifications',
	function($scope, cart, plan, $location, wembliRpc, overlay, ticketPurchaseUrls, notifications) {

    $scope.tnUrl = ticketPurchaseUrls.tn;

    $scope.$watch('plan.tickets[0].ticketGroup.selectedQty', function() {
      if (typeof newVal === "undefined") {
        return;
      }
      if (oldVal === newVal) {
        return;
      }
      cart.totals('tickets');
      $scope.friendsPonyUp(scope.friends);
      $scope.reconcileTicketQty();

    })

    /* what calls this? */
    $scope.setPayment = function(addOn, value) {
      $scope.plan.preferences[addOn].payment = value;
      $scope.savePrefs(function() {
        var path = '/' + addOn + '/' + $scope.plan.event.eventId + '/' + $scope.plan.event.eventName;
        $location.path(path);
      });

    }

    /* what calls this? */
    $scope.removeTicketGroup = function(ticketId) {
      wembliRpc.fetch('plan.removeTicketGroup', {
        ticketId: ticketId
      }, function(err, result) {
        $scope.tickets = plan.setTickets(result.tickets);
        $scope.plan = result.plan;
      });
    };

    $scope.$watch('rsvpCompleteNotification', function(n, o) {
    	if (typeof n !== "undefined") {
	    	notifications.update();
	    }
    });

    $scope.$watch('plan', function(p, oldP) {
    	if (typeof p === "undefined") {
    		return;
    	}

  		plan.rsvpComplete(function(complete) {
    		/* if the plan was not complete but is now determined to be complete */
    		if (!p.rsvpComplete && complete) {
    			plan.submitRsvpComplete(true, function(err, result) {
    				$scope.plan.rsvpComplete        = result.plan.rsvpComplete;
    				$scope.plan.rsvpCompleteDate    = result.plan.rsvpCompleteDate;
    				$scope.rsvpCompleteNotification = true;
    			});
    		}
    	});

  		console.log(p);
			angular.forEach(p.notifications, function(n) {
				if (n.key === "rsvpComplete") {
					$scope.rsvpCompleteNotification = true;
				}
			});

    });

	}
]).

controller('OrganizerRsvpCtrl', ['$rootScope', '$scope','plan', 'planNav', 'wembliRpc',
	function($rootScope, $scope, plan, planNav, wembliRpc) {

    var makeRsvpDays = function() {
      var rsvpTime = new Date($scope.plan.rsvpDate).getTime();
      var now = new Date().getTime();
      var difference = rsvpTime - now;
      var hour = 3600 * 1000;
      var day = hour * 24;
      if (difference > 0) {
        if (difference < day) {
          $scope.rsvpDays = "That's today!";
        } else {
          var days = difference / day;
          if (days < 14) {
            var d = (parseInt(days) == 1) ? 'day' : 'days';
            $scope.rsvpDays = "That's in " + parseInt(days) + " " + d + "!";
          }
        }
      } else {
        if ($scope.plan.rsvpComplete) {
          $scope.rsvpDays = "RSVP Date has passed.";
        }
      }
    }

    /* key bindings for up and down arrows for guestCount */
    $scope.guestCountKeyUp = function() {
      if ($scope.plan.organizer.rsvp.guestCount === "") {
        return;
      }
      //$scope.plan.organizer.rsvp.decision = ($scope.plan.organizer.rsvp.guestCount > 0);

      //$scope.guestCountPlural = pluralize($scope.plan.organizer.rsvp.guestCount);
      $scope.calcTotalComing();

      wembliRpc.fetch('plan.submitOrganizerRsvp', {
        decision: $scope.plan.organizer.rsvp.decision,
        guestCount: $scope.plan.organizer.rsvp.guestCount
      }, function(err, result) {

      });
    }

    $scope.guestCountKeyDown = function(scope, elm, attr, e) {
      if (e.keyCode == 38) {
        $scope.plan.organizer.rsvp.guestCount++;
      }
      if (e.keyCode == 40) {
        $scope.plan.organizer.rsvp.guestCount--;
        if ($scope.plan.organizer.rsvp.guestCount < 0) {
          $scope.plan.organizer.rsvp.guestCount = 0;
        }
      }
    }

    /* prefs watch function */
    var savePrefs = function(n, o) {
      if (typeof n === "undefined") {
        return;
      }
      if (typeof o === "undefined") {
        return;
      }

			if (n !== o) {
	      plan.savePreferences({
	        preferences: $scope.plan.preferences
	      }, function(err, result) {
	        $scope.calcTotalComing();
	      });
			}
    };

    /* watch the prefs change */
    $scope.$watch('plan.preferences.inviteOptions.guestFriends', savePrefs);
    $scope.$watch('plan.preferences.inviteOptions.over21', savePrefs);
    $scope.$watch('plan.preferences.guestList', savePrefs);

    $scope.setRsvp = function(rsvp) {
      $scope.plan.organizer.rsvp.decision = rsvp;

      if ($scope.plan.organizer.rsvp.decision === false) {
        $scope.plan.organizer.rsvp.guestCount = 0;
      }

      if ($scope.plan.organizer.rsvp.decision === true) {
        if ($scope.plan.organizer.rsvp.guestCount == 0) {
          $scope.plan.organizer.rsvp.guestCount = 1;
        }
      }

      $scope.calcTotalComing();

      wembliRpc.fetch('plan.submitOrganizerRsvp', {
        decision: $scope.plan.organizer.rsvp.decision,
        guestCount: $scope.plan.organizer.rsvp.guestCount
      }, function(err, result) {

      });
    }

    $scope.$watch('plan', function(p, oldP) {
    	if (typeof p === "undefined") {
    		return;
    	}

    	console.log('rsvpDate: '+$scope.plan.rsvpDate);

      makeRsvpDays();

      if ($scope.plan.organizer.rsvp.decision === null) {
        $scope.setRsvp(true);
      }

    });

    planNav.activate('rsvp');

	}
]).

controller('OrganizerCartCtrl', ['$scope','plan', 'planNav',
	function($scope, plan, planNav) {
    planNav.activate('cart');
    $scope.$watch('buyTicketsOffsite', function(n, o) {
      console.log('buyTicketsOffsite: '+n);
    });

    $scope.showChangeTicketsLink = function() {
      plan.get(function(p) {
        /* show the change tix link if tix are chosen */
        return (p.tickets && p.tickets.length > 0);

      });
    }

    $scope.showTicketPriceDetails = {};
    $scope.toggleTicketPriceDetails = function(ticketId) {
      if (typeof $scope.showTicketPriceDetails[ticketId] === "undefined" ) {
        $scope.showTicketPriceDetails[ticketId] = true;
      } else {
        delete $scope.showTicketPriceDetails[ticketId];
      }
    }

	}
]).

controller('OrganizerPonyUpCtrl', ['$scope','plan', 'planNav',
	function($scope, plan, planNav) {

    $scope.submitOutsidePayment = function(friendId) {
      var friends;
      angular.forEach($scope.friends, function(f) {
        if (f._id == friendId) {
          if (!f.ponyUp.outsideSourceAmount || (parseFloat(f.ponyUp.outsideSourceAmount) == 0)) {
            return;
          }
          f.ponyUp.submitInProgress = true;
          wembliRpc.fetch('plan.submitOutsidePayment', {
            friendId: friendId,
            amount: f.ponyUp.outsideSourceAmount,
            method: f.ponyUp.outsideSourcePaymentMethod,
            status: 'logged'
          }, function(err, result) {
            if (err) {
              return;
            }

            if (!result.success) {
              f.error = true;
              return;
            }
            /* friend changed this does nto work*/
            //$scope.friends[i] = result.friend;
            //$scope.friends[i].ponyUp = f.ponyUp;
            //$scope.friends[i].ponyUp.submitInProgress = false;
            f.ponyUp.submitInProgress = false;
            f.payment = result.friend.payment;
            $rootScope.$broadcast('plan-friends-changed', plan.getFriends());
            $scope.paymentTotals();

          });
        }
      });
    };

    $scope.removeOutsidePayment = function(friendId, paymentId) {
      for (var i = 0; i < $scope.friends.length; i++) {
        var f = $scope.friends[i]
        if (f._id === friendId) {
          var l = f.payment.length;
          for (var j = 0; j < l; j++) {
            var p = f.payment.shift();
            if (p._id === paymentId) {
              p.removeOutsidePaymentInProgress = true;

              wembliRpc.fetch('plan.removeOutsidePayment', {
                'friendId': f._id,
                'paymentId': p._id,
              }, function(err, result) {

                if (err) {

                  p.error = true;
                  f.payment.push(p);
                  return;
                }

                if (!result.success) {
                  p.error = true;
                  f.payment.push(p);
                  return;
                }

                p.removeOutsidePaymentInProgress = false;
                $scope.paymentTotals();
              });
            } else {
              f.payment.push(p);
            }
          }
        }
      }
    };

    $scope.cancelPonyUpRequest = function(friendId, paymentId) {
      for (var i = 0; i < $scope.friends.length; i++) {
        var f = $scope.friends[i]
        if (f._id === friendId) {
          var l = f.payment.length;
          for (var j = 0; j < l; j++) {
            var p = f.payment.shift();
            if (p._id === paymentId) {
              p.cancelPonyUpRequestInProgress = true;

              wembliRpc.fetch('plan.cancelPonyUpRequest', {
                'friendId': f._id,
                'paymentId': p._id,
              }, function(err, result) {


                if (err) {
                  p.error = true;
                  f.payment.push(p);
                  return;
                }

                if (!result.success) {
                  p.error = true;
                  f.payment.push(p);
                  return;
                }

                f.payment.push(result.payment);
                p.cancelPonyUpRequestInProgress = false;
                $scope.paymentTotals();

              });
            } else {
              f.payment.push(p);
            }
          }
        }
      }
    };

    $scope.resendPonyUp = function(friendId, paymentId) {

      for (var i = 0; i < $scope.friends.length; i++) {
        var f = $scope.friends[i]
        if (f._id === friendId) {
          angular.forEach(f.payment, function(p) {
            if (p._id === paymentId) {
              p.resendPonyUpInProgress = true;

              wembliRpc.fetch('plan.resendPonyUpEmail', {
                'friendId': f._id,
                'paymentId': p._id,
                'amount': parseInt(p.amount * 100),
              }, function(err, result) {

                if (err) {

                  p.error = true;
                  return;
                }

                if (!result.success) {
                  p.error = true;
                  return;
                }

                p.status = result.payment.status;
                p.date = result.payment.date;
                p.resendPonyUpInProgress = false;
                p.resent = true;
              });
            }
          });
        }
      }
    };

    $scope.sendPonyUpEmail = function() {
      /* check if they have an account - if not throw a modal to collect account info */
      if ((typeof customer.get().balancedAPI === "undefined") || (typeof customer.get().balancedAPI.bankAccounts === "undefined")) {
        $('#create-account-modal').modal('show');
        return;
      }

      if ($scope.sendPonyUpInProgress) {
        return;
      }

      $scope.sendPonyUpInProgress = true;
      $scope.error = $scope.formError = $scope.success = false;
      /* get all the friends that have sendponyup checked and get the amounts */
      var ponyUpRequests = [];
      for (var i = 0; i < $scope.friends.length; i++) {
        var f = $scope.friends[i];
        if ((typeof f.ponyUp.amount !== "undefined") && f.ponyUp.request) {
          if (parseFloat(f.ponyUp.amount) > 0) {
            var d = {
              'friendId': f._id,
              'amount': parseInt(parseFloat(f.ponyUp.amount) * 100)
            };
            ponyUpRequests.push(d);
          } else {
            $scope.error = false;
            $scope.success = false;
            $scope.formError = true;
            $scope.sendPonyUpInProgress = false;
            return;
          }
        }
      };

      if (!ponyUpRequests[0]) {
        $scope.error = false;
        $scope.success = false;
        $scope.formError = true;
        $scope.sendPonyUpInProgress = false;
        return;
      }


      wembliRpc.fetch('plan.sendPonyUpEmail', {
        ponyUpRequests: ponyUpRequests
      }, function(err, result) {
        $scope.sendPonyUpInProgress = false;

        if (err) {

          $scope.error = true;
          return;
        }

        if (!result.success) {
          $scope.error = true;
          return;
        }

        $scope.success = true;

        for (var i = 0; i < $scope.friends.length; i++) {
          var f = $scope.friends[i]
          for (var j = 0; j < result.friends.length; j++) {
            var f2 = result.friends[j];
            if (f2._id === f._id) {
              f.payment = f2.payment;
            }
          };
        };
        $rootScope.$broadcast('plan-friends-changed', plan.getFriends());
        $scope.paymentTotals();
      });
    };

    var dereg = $scope.$on('bank-account-created', function(e) {
      $scope.sendPonyUpEmail();
      dereg();
    });

    /*
      sum all the type: requests
      sum all the others
      subtract requests from others and get balance
    */
    $scope.paymentTotals = function() {
      for (var i = 0; i < $scope.friends.length; i++) {
        var requested = 0;
        var received = 0;
        var balance = 0;
        var f = $scope.friends[i];
        f.ponyUp = (typeof f.ponyUp === "undefined") ? {} : f.ponyUp;
        f.ponyUp.open = false;
        f.ponyUp.request = true;

        for (var j = 0; j < f.payment.length; j++) {
          var p = f.payment[j];
          if (p.type == 'request') {
            if (p.open) {
              f.ponyUp.open = true;
              f.ponyUp.request = false;
            }
            if (p.status !== 'canceled') {
              requested += parseInt(p.amount);
              p.amount = parseInt(p.amount);

            }
          } else {
            received += parseInt(p.amount);
          }
        }
        var reqFloat = requested;
        var recFloat = received;
        var balFloat = requested - received;
        f.payment.requested = requested;
        f.payment.received = received;
        f.payment.balance = balance;

      }
    }

    $scope.$watch('friends', function(newVal, oldVal) {
      if (newVal) {
        $scope.paymentTotals();
      }
    });


    planNav.activate('pony-up');
	}
]).

controller('OrganizerItineraryCtrl', ['$scope','plan', 'planNav',
	function($scope, plan, planNav) {
    var timer;
    $scope.submitNotes = function() {
      clearTimeout(timer);
      timer = setTimeout(function() {
        wembliRpc.fetch('plan.submitNotes', {
          notes: $scope.plan.notes
        }, function(err, result) {
          /* handle error */
        });
      }, 2000);

    };

    planNav.activate('itinerary');
	}
]).

controller('OrganizerChatterCtrl', ['$scope','plan', 'planNav',
	function($scope, plan, planNav) {
    planNav.activate('chatter');
	}
]).

controller('PlanCtrlOff', ['$scope', 'wembliRpc', '$window', 'plan', 'planNav', '$location', '$rootScope', 'googleMap',
	function($scope, wembliRpc, $window, plan, planNav, $location, $rootScope, googleMap) {
		plan.get(function(p) {
			$scope.plan = p;

			/* this activate section stuff should no longer be needed */
			$scope.activateSection = function(sectionName) {
				console.log('activateSection '+ sectionName);
        var sectionName = parseInt(sectionName.charAt(sectionName.length - 1));
        planNav.activate(sectionName);
        googleMap.resize();
			}

	    var activateSection = 1;
	    if ($location.path()) {
	      var h = $location.path();
	      /* everyauth hack */
	      if (h == '_=_') {
	        activateSection = 1;
	      } else {
	        activateSection = parseInt(h.charAt(h.length - 1));
	      }
	      console.log('activate section from path '+activateSection);
	    } else {
	      if ((typeof $scope.customer !== "undefined") && (p.organizer.customerId === $scope.customer.id)) {
	        /* automatically go to the right section depending on what phase of the plan they are in */
	        if (p && p.rsvpComplete) {
	          activateSection = 2; //cart

	          /* if tickets are not chosen */
	          if (!p.tickets[0]) {
	            activateSection = 2;
	          }

	          /* parking is in plan but parking not chosen */
	          if (p.preferences.addOns.parking && !p.parking[0]) {
	            activateSection = 2;
	          }

	          /* restaurants in plan but not chosen */
	          if (p.preferences.addOns.restaurants && !p.restaurants[0]) {
	            activateSection = 2;
	          }
	          /* hotels are in the plan but not chosen */
	          if (p.preferences.addOns.hotels && !p.hotels[0]) {
	            activateSection = 2;
	          }
	        }
	      } else {
	        /* i'm not the organizer */
	        if (!p.rsvpComplete) {
	          activateSection = 1;
	        } else {
	          activateSection = 4;
	        }
	      }
	    }

	    planNav.setActivateSection(activateSection);
			planNav.setSectionsCount($scope.sections);

	    //$rootScope.$broadcast('section-loaded');


		});
	}
]);
