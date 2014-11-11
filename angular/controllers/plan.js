/* Controllers */
angular.module('wembliApp.controllers.plan', []).

/* don't rely on DOM based inheritence in angular
 *
 * http://stackoverflow.com/questions/15386137/angularjs-controller-inheritance
 *
 */
controller('PlanCtrl', ['$scope', 'plan', 'planNav', 'customer','overlay', 'cart', 'notifications', 'googlePlaces', '$timeout', 'googleAnalytics',
	function($scope, plan, planNav, customer, overlay, cart, notifications, googlePlaces, $timeout, googleAnalytics) {

    $scope.getPlacePhotoUrl = function(type, idx) {
      var lookup = {
        'hotels':'hotel',
        'restaurants':'restaurant',
        'parking':'parking'
      }
      var obj = $scope[type][idx];
      var url = '';
      if (typeof obj[lookup[type]].details !== "undefined") {
        if (obj[lookup[type]].details.photos[0].url) {
          return obj[lookup[type]].details.photos[0].url;
        } else {
          url = obj[lookup[type]].details.photos[0].getUrl({'maxWidth': 300, 'maxHeight': 300});
          obj[lookup[type]].details.photos[0].url = url;
        }
      }
      return url;
    }

    /*
      sum all the type: requests
      sum all the others
      subtract requests from others and get balance
    */
    $scope.paymentTotals = function() {
      for (var i = 0; i < $scope.friends.length; i++) {
        var requested = 0;
        var received  = 0;
        var balance   = 0;

        var f = $scope.friends[i];
        f.ponyUp         = (typeof f.ponyUp === "undefined") ? {} : f.ponyUp;
        f.ponyUp.open    = false;
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

        f.payment.requested = requested;
        f.payment.received  = received;
        f.payment.balance   = requested - received;

      }
    }

    /* buy stuff offsite */
    $scope.buyTickets = function(idx) {
      overlay.show();
      $scope.currentTicket     = $scope.tickets[idx].ticketGroup;
      $scope.currentTicketIdx  = idx;
      $scope.buyTicketsOffsite = true;
    };

    $scope.buyParking = function(idx) {
      overlay.show();
      $scope.currentParking    = $scope.parking[idx].parking;
      $scope.currentParkingIdx = idx;
      $scope.buyParkingOffsite = true;
    };

    $scope.buyDeal = function(idx) {
      overlay.show();
      $scope.currentDeal    = $scope.restaurants[idx].restaurant;
      $scope.currentDealIdx = idx;
      $scope.buyDealOffsite = true;
    };

    $scope.buyHotel = function(idx) {
      overlay.show();
      $scope.currentHotel    = $scope.hotels[idx].hotel;
      $scope.currentHotelIdx = idx;
      $scope.buyHotelOffsite = true;
    };

    $scope.removeTicketGroup = function() {
      $timeout(function() {
        $scope.$apply(function() {
          delete $scope.currentTicket;
          delete $scope.currentTicketIdx;
          $scope.buyTicketsOffsite = false;
          overlay.hide();
        });
      });
    };

    $scope.removeParking = function() {
      $timeout(function() {
        $scope.$apply(function() {
          delete $scope.currentParking;
          delete $scope.currentParkingIdx;
          $scope.buyParkingOffsite = false;
          overlay.hide();
        });
      });
    };

    $scope.removeDeal = function() {
      $timeout(function() {
        $scope.$apply(function() {
          delete $scope.currentDeal;
          delete $scope.currentDealIdx;
          $scope.buyDealOffsite = false;
          overlay.hide();
        });
      });
    };

    $scope.removeHotel = function() {
      $timeout(function() {
        $scope.$apply(function() {
          delete $scope.currentHotel;
          delete $scope.currentHotelIdx;
          $scope.buyHotelOffsite = false;
          overlay.hide();
        });
      });
    };

    $scope.boughtTickets = function() {
      $scope.confirmErr    = false;

      if (typeof $scope.currentTicket == "undefined") {
        $scope.removeTicketGroup();
        return;
      }

      /* did they fill out the form? */
      if (!$scope.confirmPriceQty) {
        /* they much check the checkbox */
        $scope.confirmErr = true;
        return;
      }

      if (!$scope.currentTicket.selectedQty) {
        /* they must tell us how many they selected */
        $scope.confirmErr = true;
        return;
      }

      if (!$scope.currentTicket.amountPaid) {
        /* they must tell us how many they selected */
        $scope.confirmErr = true;
        return;
      }

      var ticket = $scope.tickets[$scope.currentTicketIdx];
      var id = ticket._id ? ticket._id : ticket.ID;
      /* update the tickets to have a receipt */
      plan.addTicketGroupReceipt({
        ticketId: id,
        service: 'tn',
        receipt: {
          transactionToken: ticket.sessionId,
          amountPaid: $scope.currentTicket.amountPaid,
          qty: $scope.currentTicket.selectedQty
        }
      }, function(err, result) {
        var t = result.ticket;
        /* for testing, fire the ticketnetwork pixel which will set the payment.receipt value */
        //$http.get('http://tom.wembli.com/callback/tn/checkout?request_id=' + $scope.sessionId + '&event_id=' + $scope.eventId);

        googleAnalytics.trackEvent('Plan', 'boughtTickets', $scope.plan.event.eventName, '', function(err, result) {
          $timeout(function() {
            $scope.$apply(function() {
              $scope.tickets[$scope.currentTicketIdx] = t;
              $scope.removeTicketGroup();
            });
          });
        });
      });

    }

    $scope.boughtParking = function() {
      $scope.confirmErr    = false;

      if (typeof $scope.currentParking == "undefined") {
        $scope.removeParking();
        return;
      }

      /* did they fill out the form? */
      if (!$scope.confirmPriceQty) {
        /* they much check the checkbox */
        $scope.confirmErr = true;
        return;
      }

      if (!$scope.currentParking.selectedQty) {
        /* they must tell us how many they selected */
        $scope.confirmErr = true;
        return;
      }

      if (!$scope.currentParking.amountPaid) {
        /* they must tell us how many they selected */
        $scope.confirmErr = true;
        return;
      }

      var parking = $scope.parking[$scope.currentParkingIdx];
      var id = parking._id;
      /* update the parking to have a receipt */
      plan.addParkingReceipt({
        parkingId: id,
        service: 'pw',
        receipt: {
          amountPaid: $scope.currentParking.amountPaid,
          qty: $scope.currentParking.selectedQty
        }
      }, function(err, result) {
        var p = result.parking;
        /* for testing, fire the ticketnetwork pixel which will set the payment.receipt value */
        //$http.get('http://tom.wembli.com/callback/tn/checkout?request_id=' + $scope.sessionId + '&event_id=' + $scope.eventId);

        googleAnalytics.trackEvent('Plan', 'boughtParking', $scope.plan.event.eventName, '', function(err, result) {
          $timeout(function() {
            $scope.$apply(function() {
              $scope.parking[$scope.currentParkingIdx] = p;
              $scope.removeParking();
            });
          });
        });
      });

    }

    $scope.boughtDeal = function() {
      $scope.confirmErr    = false;

      if (typeof $scope.currentDeal == "undefined") {
        $scope.removeDeal();
        return;
      }

      /* did they fill out the form? */
      if (!$scope.confirmPriceQty) {
        /* they much check the checkbox */
        $scope.confirmErr = true;
        return;
      }

      if (!$scope.currentDeal.selectedQty) {
        /* they must tell us how many they selected */
        $scope.confirmErr = true;
        return;
      }

      if (!$scope.currentDeal.amountPaid) {
        /* they must tell us how many they selected */
        $scope.confirmErr = true;
        return;
      }

      var deal = $scope.restaurants[$scope.currentDealIdx];
      var id = deal._id;
      /* update the deals to have a receipt */
      plan.addRestaurantReceipt({
        restaurantId: id,
        service: 'yipit',
        receipt: {
          amountPaid: $scope.currentDeal.amountPaid,
          qty: $scope.currentDeal.selectedQty
        }
      }, function(err, result) {

        var d = result.restaurant;
        /* for testing, fire the ticketnetwork pixel which will set the payment.receipt value */
        //$http.get('http://tom.wembli.com/callback/tn/checkout?request_id=' + $scope.sessionId + '&event_id=' + $scope.eventId);

        googleAnalytics.trackEvent('Plan', 'boughtDeal', $scope.plan.event.eventName, '', function(err, result) {
          $timeout(function() {
            $scope.$apply(function() {
              $scope.restaurants[$scope.currentDealIdx] = d;
              $scope.removeDeal();
            });
          });
        });
      });

    }

    /* not implemented */
    $scope.boughtHotel = function() {
      $scope.removeHotel();
    }

    $scope.$on('overlay-clicked', function() {
      $scope.removeTicketGroup();
      $scope.removeParking();
      $scope.removeDeal();
      $scope.removeHotel();
    });



		$scope.activateSection = function(sectionName) {
      var sectionName = sectionName.split('-')[2];
      planNav.activate(sectionName);
      googleMap.resize();
		};

    $scope.calcTotalComing = function() {
      $scope.totalComing   = 0;
      $scope.totalInvited  = 0;
      $scope.friendsComing = [];
      $scope.totalPoniedUp = 0.00;

      if (!$scope.friends) {
        return;
      }

      /* get the friend that is this customer */
      for (var i = 0; i < $scope.friends.length; i++) {

        if ($scope.friends[i].customerId === customer.get().id) {
          if ($scope.me.rsvp.decision) {
            $scope.totalComing = parseInt($scope.totalComing) + parseInt($scope.me.rsvp.guestCount) + 1;
            $scope.friendsComing.push($scope.me);
            $scope.friends[i] = $scope.me;
          }
          $scope.totalInvited = parseInt($scope.totalInvited) + 1;
          continue;
        }

        if ($scope.friends[i].inviteStatus) {
          $scope.totalInvited = parseInt($scope.totalInvited) + 1;

          if ($scope.friends[i].rsvp.decision) {
            $scope.totalComing = parseInt($scope.totalComing) + parseInt($scope.friends[i].rsvp.guestCount) + 1;
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
        }
      };

      /* count the organizer */
      if ($scope.plan.organizer.rsvp.decision) {
        $scope.totalInvited = parseInt($scope.totalInvited) + 1;
        $scope.totalComing  = parseInt($scope.totalComing) + parseInt($scope.plan.organizer.rsvp.guestCount) + 1;
      }

    };

    $scope.setSelectedQty = function() {
      /* init selectedQty */
      angular.forEach($scope.tickets, function(t) {
        if (typeof t.ticketGroup.selectedQty === "undefined") {
          /* if there is a split that matches totalComing use that, else use the highest split */
          angular.forEach(t.ticketGroup.ValidSplits.int, function(split) {
            if (split == $scope.totalComing) {
              t.ticketGroup.selectedQty = parseInt(split)
            }
          });

          if (typeof t.ticketGroup.selectedQty === "undefined") {
            t.ticketGroup.selectedQty = parseInt(t.ticketGroup.ValidSplits.int[t.ticketGroup.ValidSplits.int.length - 1]);
          }

        }

        /* if selected qty is > totalComing - set it to totalComing */
        if (t.ticketGroup.selectedQty > $scope.totalComing) {
          t.ticketGroup.selectedQty = $scope.totalComing;
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
    });

    $scope.$watch('hotels', function(newVal, oldVal) {
      if (typeof newVal === "undefined") {
        return;
      }
      if (oldVal === newVal) {
        return;
      }
      /* fetch the details for the google parking */
      angular.forEach(newVal, function(h) {
        if (h.service === 'google') {
          googlePlaces.getDetails(h.hotel.reference, function(place, status) {
            h.hotel.details = place;
          });
        }
      });

      cart.totals('hotels');
    });

    $scope.$watch('parking', function(newVal, oldVal) {
      if (typeof newVal === "undefined") {
        return;
      }
      if (oldVal === newVal) {
        return;
      }

      /* fetch the details for the google parking */
      angular.forEach(newVal, function(p) {
        if (p.service === 'google') {
          googlePlaces.getDetails(p.parking.reference, function(place, status) {
            p.parking.details = place;
          });
        }
      });

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
      $scope.setSelectedQty();
    });

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

      angular.forEach(p.notifications, function(n) {
        if (n.key === "rsvpComplete") {
          $scope.rsvpCompleteNotification = true;
        }
      });

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

      /* get the friend that is this customer */
      for (var i = 0; i < $scope.friends.length; i++) {
        if ($scope.friends[i].customerId === customer.get().id) {
          $scope.me = $scope.friends[i];
        }
      };

      $scope.calcTotalComing();
      $scope.setSelectedQty();
      $scope.reconcileTicketQty();

      $scope.canRequestPonyUp = ($scope.friendsComing && ($scope.friendsComing.length > 0));
      overlay.loading(false);
      overlay.hide();

	    /* start polling for changes - polls every 30 seconds */
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
          $scope.reconcileTicketQty();

	      });
	    });

    });
	}
]).

controller('OrganizerPlanCtrl', ['$scope', 'cart', 'plan', '$location', 'wembliRpc', 'overlay', 'ticketPurchaseUrls',
  function($scope, cart, plan, $location, wembliRpc, overlay, ticketPurchaseUrls) {

    $scope.tnUrl = ticketPurchaseUrls.tn;

    $scope.$watch('plan.tickets[0].ticketGroup.selectedQty', function() {
      if (typeof newVal === "undefined") {
        return;
      }
      if (oldVal === newVal) {
        return;
      }
      cart.totals('tickets');
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
    $scope.$watch('plan.preferences.addOns.parking', savePrefs);
    $scope.$watch('plan.preferences.addOns.hotels', savePrefs);
    $scope.$watch('plan.preferences.addOns.restaurants', savePrefs);


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

      $scope.calcTotalComing();

      wembliRpc.fetch('plan.submitOrganizerRsvp', {
        decision: $scope.plan.organizer.rsvp.decision,
        guestCount: $scope.plan.organizer.rsvp.guestCount
      }, function(err, result) {

      });
    }

    $scope.guestCountKeyDown = function($scope, elm, attr, e) {
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

    $scope.setRsvp = function(rsvp) {
      $scope.plan.organizer.rsvp.decision = rsvp;

      if ($scope.plan.organizer.rsvp.decision === false) {
        $scope.plan.organizer.rsvp.guestCount = 0;
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
    $scope.parkingSpotsNeeded = 1;
    if ($scope.totalComing > 3) {
      $scope.parkingSpotsNeeded = Math.ceil($scope.totalComing/3);
    }

    planNav.activate('cart');

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

controller('OrganizerPonyUpCtrl', ['$rootScope','$scope','plan', 'planNav', 'wembliRpc', 'customer',
	function($rootScope, $scope, plan, planNav, wembliRpc, customer) {
    $scope.needBalancedAccount = false;
    $scope.showSuggestedAmount = {};
    $scope.toggleSuggestedAmounts = function(friendId) {
      if (typeof $scope.showSuggestedAmount[friendId] === "undefined" ) {
        $scope.showSuggestedAmount[friendId] = true;
      } else {
        delete $scope.showSuggestedAmount[friendId];
      }
    }

    $scope.showHistory = {};
    $scope.toggleHistory = function(friendId) {
      if (typeof $scope.showHistory[friendId] === "undefined" ) {
        $scope.showHistory[friendId] = true;
      } else {
        delete $scope.showHistory[friendId];
      }
    }


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
            amount: parseInt(parseFloat(f.ponyUp.outsideSourceAmount) * 100),
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
      if ((typeof customer.get().balancedAPI === "undefined") || (typeof customer.get().balancedAPI.bankAccounts === "undefined") || (typeof customer.get().balancedAPI.bankAccounts.items[0] === "undefined")) {
        $scope.needBalancedAccount = true;
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
      $scope.needBalancedAccount = false;
      $scope.sendPonyUpEmail();
      dereg();
    });

    $scope.$watch('friends', function(newVal, oldVal) {
      if (newVal) {
        $scope.paymentTotals();
      }
    });

    planNav.activate('pony-up');
	}
]).

controller('OrganizerItineraryCtrl', ['$scope','plan', 'planNav', 'wembliRpc',
  function($scope, plan, planNav, wembliRpc) {
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

controller('FriendPlanCtrl', ['$scope', 'plan', '$location', 'wembliRpc',
  function($scope, plan, $location, wembliRpc) {
  }
]).

controller('FriendRsvpCtrl', ['$scope', 'plan', 'planNav', 'wembliRpc',
  function($scope, plan, planNav, wembliRpc) {

    /* handle the main plan rsvp */
    $scope.setRsvp = function(rsvp) {
      $scope.me.rsvp.decision = rsvp;
      if ($scope.me.rsvp.decision === false) {
        $scope.me.rsvp.guestCount = 0;
      }

      wembliRpc.fetch('friend.submitRsvp', {
        decision: $scope.me.rsvp.decision,
        guestCount: $scope.me.rsvp.guestCount
      }, function(err, result) {
        $scope.me = result.friend;
      });
    };

    /* key bindings for up and down arrows for guestCount */
    $scope.guestCountKeyUp = function() {
      if ($scope.me.rsvp.guestCount === "") {
        return;
      }

      $scope.calcTotalComing();

      wembliRpc.fetch('friend.submitRsvp', {
        decision: $scope.me.rsvp.decision,
        guestCount: $scope.me.rsvp.guestCount
      }, function(err, result) {
        $scope.me = result.friend;
      });
    };

    $scope.guestCountKeyDown = function($scope, elm, attr, e) {
      if (e.keyCode == 38) {
        $scope.me.rsvp.guestCount++;
      }
      if (e.keyCode == 40) {
        $scope.me.rsvp.guestCount--;
        if ($scope.me.rsvp.guestCount < 0) {
          $scope.me.rsvp.guestCount = 0;
        }
      }
    };


    planNav.activate('rsvp');
  }
]).

controller('FriendVoteCtrl',['$scope', 'plan', 'planNav', 'wembliRpc',
  function($scope, plan, planNav, wembliRpc) {

    var submitVote = function() {
      wembliRpc.fetch('friend.submitVote', {
        tickets: {
          number: $scope.me.rsvp.guestCount,
          decision: $scope.me.rsvp.decision,
          price: $scope.me.rsvp.tickets.price,
          priceGroup: $scope.me.rsvp.tickets.priceGroup,
        },
        parking: {
          number: $scope.me.rsvp.guestCount,
          decision: $scope.me.rsvp.parking.decision,
          price: $scope.me.rsvp.parking.price,
          priceGroup: $scope.me.rsvp.parking.priceGroup
        },
        restaurant: {
          number: $scope.me.rsvp.guestCount,
          decision: $scope.me.rsvp.restaurant.decision,
          price: $scope.me.rsvp.restaurant.price,
          priceGroup: $scope.me.rsvp.restaurant.priceGroup,
          preference: $scope.me.rsvp.restaurant.preference
        },
        hotel: {
          number: $scope.me.rsvp.guestCount,
          decision: $scope.me.rsvp.hotel.decision,
          price: $scope.me.rsvp.hotel.price,
          priceGroup: $scope.me.rsvp.hotel.priceGroup,
          preference: $scope.me.rsvp.hotel.preference
        },
      }, function(err, result) {
        $scope.me = result.friend;
      });
    };

    var calcVotePriceTotal = function() {
      var total = 0;
      if (parseInt($scope.me.rsvp.tickets.price) > 0) {
        total += parseInt($scope.me.rsvp.tickets.price);
      }

      if ($scope.me.rsvp.parking.decision && $scope.plan.preferences.addOns.parking) {
        if (parseInt($scope.me.rsvp.parking.price) > 0) {
          total += parseInt($scope.me.rsvp.parking.price);
        }
      }

      if ($scope.me.rsvp.restaurant.decision && $scope.plan.preferences.addOns.restaurants) {
        if (parseInt($scope.me.rsvp.restaurant.price) > 0) {
          total += parseInt($scope.me.rsvp.restaurant.price);
        }
      }

      if ($scope.me.rsvp.hotel.decision && $scope.plan.preferences.addOns.hotels) {
        if (parseInt($scope.me.rsvp.hotel.price) > 0) {
          total += parseInt($scope.me.rsvp.hotel.price);
        }
      }

      $scope.votePriceTotalPerPerson = total;
      $scope.votePriceTotal = total * ($scope.me.rsvp.guestCount + 1);
    }

    /* watch the rsvp checkboxes */
    $scope.$watch('me.rsvp.parking.decision', function(val) {
      if (typeof val === "undefined") {
        return;
      }
      submitVote();
      calcVotePriceTotal();
    });
    $scope.$watch('me.rsvp.restaurant.decision', function(val) {
      if (typeof val === "undefined") {
        return;
      }
      submitVote();
      calcVotePriceTotal();
    });
    $scope.$watch('me.rsvp.hotel.decision', function(val) {
      if (typeof val === "undefined") {
        return;
      }
      submitVote();
      calcVotePriceTotal();
    });

    /* watch the price values to update the total */
    $scope.$watch('me.rsvp.tickets.price', function(val) {
      if (typeof val === "undefined") {
        return;
      }
      calcVotePriceTotal();
    });
    $scope.$watch('me.rsvp.parking.price', function(val) {
      if (typeof val === "undefined") {
        return;
      }
      calcVotePriceTotal();
    });
    $scope.$watch('me.rsvp.restaurant.price', function(val) {
      if (typeof val === "undefined") {
        return;
      }
      calcVotePriceTotal();
    });
    $scope.$watch('me.rsvp.hotel.price', function(val) {
      if (typeof val === "undefined") {
        return;
      }
      calcVotePriceTotal();
    });

    var toggleSlider = function(id, val) {
      if (val) {
        $(id).slider("enable");
      } else {
        $(id).slider("disable");
      }
    }

    var toggleMultiselect = function(id, val) {
      if (val) {
        $(id).multiselect("enable");
      } else {
        $(id).multiselect("disable");
      }
    }

    $scope.toggleInputs = function(category, val) {
      var categories = {
        'restaurant': function(val) {
          toggleSlider('#restaurant-price-slider', val);
          toggleMultiselect('#food-preference', val)
        },
        'parking': function(val) {
          toggleSlider('#parking-price-slider', val);
        },
        'hotel': function(val) {
          toggleSlider('#hotel-price-slider', val);
          toggleMultiselect('#hotel-preference', val)
        },
      };
      categories[category](val);
    };

    /*multiselect events */
    $scope.foodPreferenceClick = function(event, ui) {
      if (typeof $scope.me.rsvp.restaurant.preference === "undefined") {
        $scope.me.rsvp.restaurant.preference = [];
      }
      if (ui.checked) {
        $scope.me.rsvp.restaurant.preference.push(ui.value);
      } else {
        /* find the value in the model and remove it */
        var n = [];
        for (var i = 0; i < $scope.me.rsvp.restaurant.preference.length; i++) {
          var p = $scope.me.rsvp.restaurant.preference[i];
          if (p !== ui.value) {
            n.push(p);
          }
        }
        $scope.me.rsvp.restaurant.preference = n;
      }

      submitVote();
    }
    $scope.hotelPreferenceClick = function(event, ui) {
      if (typeof $scope.me.rsvp.hotel.preference === "undefined") {
        $scope.me.rsvp.hotel.preference = [];
      }
      if (ui.checked) {
        $scope.me.rsvp.hotel.preference.push(ui.value);
      } else {
        /* find the value in the model and remove it */
        var n = [];
        for (var i = 0; i < $scope.me.rsvp.hotel.preference.length; i++) {
          var p = $scope.me.rsvp.hotel.preference[i];
          if (p !== ui.value) {
            n.push(p);
          }
        }
        $scope.me.rsvp.hotel.preference = n;
      }

      submitVote();
    }

    /* vote sliders */
    $scope.ticketsPriceSlide = function(event, ui) {
      $scope.me.rsvp.tickets.price = ui.value;

      if (ui.value > 0) {
        $scope.me.rsvp.tickets.priceGroup.low = true;
      }
      if (ui.value > 100) {
        $scope.me.rsvp.tickets.priceGroup.med = true;
      }
      if (ui.value > 300) {
        $scope.me.rsvp.tickets.priceGroup.high = true;
      }
      if (ui.value <= 100) {
        $scope.me.rsvp.tickets.priceGroup.med = false;
      }
      if (ui.value <= 300) {
        $scope.me.rsvp.tickets.priceGroup.high = false;
      }
    }
    $scope.ticketsPriceStop = function(event, ui) {
      /* when they stop we save it */
      submitVote();
    }
    $scope.parkingPriceSlide = function(event, ui) {
      $scope.me.rsvp.parking.price = ui.value;

      if (ui.value > 0) {
        $scope.me.rsvp.parking.priceGroup.low = true;
      }
      if (ui.value > 25) {
        $scope.me.rsvp.parking.priceGroup.med = true;
      }
      if (ui.value > 50) {
        $scope.me.rsvp.parking.priceGroup.high = true;
      }
      if (ui.value <= 25) {
        $scope.me.rsvp.parking.priceGroup.med = false;
      }
      if (ui.value <= 50) {
        $scope.me.rsvp.parking.priceGroup.high = false;
      }
    }
    $scope.parkingPriceStop = function(event, ui) {
      submitVote();
    }
    $scope.restaurantPriceSlide = function(event, ui) {
      $scope.me.rsvp.restaurant.price = ui.value;

      if (ui.value > 0) {
        $scope.me.rsvp.restaurant.priceGroup.low = true;
      }
      if (ui.value > 25) {
        $scope.me.rsvp.restaurant.priceGroup.med = true;
      }
      if (ui.value > 50) {
        $scope.me.rsvp.restaurant.priceGroup.high = true;
      }
      if (ui.value <= 25) {
        $scope.me.rsvp.restaurant.priceGroup.med = false;
      }
      if (ui.value <= 50) {
        $scope.me.rsvp.restaurant.priceGroup.high = false;
      }
    }
    $scope.restaurantPriceStop = function(event, ui) {
      submitVote();
    }

    $scope.hotelPriceSlide = function(event, ui) {
      $scope.me.rsvp.hotel.price = ui.value;

      if (ui.value > 0) {
        $scope.me.rsvp.hotel.priceGroup.low = true;
      }
      if (ui.value > 100) {
        $scope.me.rsvp.hotel.priceGroup.med = true;
      }
      if (ui.value > 300) {
        $scope.me.rsvp.hotel.priceGroup.high = true;
      }
      if (ui.value <= 100) {
        $scope.me.rsvp.hotel.priceGroup.med = false;
      }
      if (ui.value <= 300) {
        $scope.me.rsvp.hotel.priceGroup.high = false;
      }
    }

    $scope.hotelPriceStop = function(event, ui) {
      submitVote();
    }


    /* init the section */
    var watchMe = function() {
      $scope.toggleInputs('parking', $scope.me.rsvp.parking.decision);
      $scope.toggleInputs('restaurant', $scope.me.rsvp.restaurant.decision);
      $scope.toggleInputs('hotel', $scope.me.rsvp.hotel.decision);
    };

    if ($scope.me) {
      watchMe();
    } else {
      var d = $scope.$watch('me', function(newVal) {
        if (typeof newVal !== "undefined") {
          watchMe();
          d();
        }
      });
    }
    planNav.activate('vote');
  }
]).

controller('FriendPonyUpCtrl',['$rootScope', '$scope', 'plan', 'planNav', 'wembliRpc', '$timeout',
  function($rootScope, $scope, plan, planNav, wembliRpc, $timeout) {
    $scope.displaySendPonyUp = false;
    $scope.showFees = false;
    $scope.showHistory = false;

    $scope.$watch('ponyUp.amountFormatted', function(newVal) {
      if (typeof newVal !== "undefined") {
        var amount = parseInt(parseFloat(newVal) * 100);
        $scope.ponyUp.transactionFee = .029 * parseFloat(amount) + 250;
        $scope.ponyUp.total = $scope.ponyUp.transactionFee + amount;
      }
    });


    function handlePonyUp(newValue) {
      if (typeof newValue !== "undefined") {
        var requested = 0;
        var received = 0;
        var balance = 0;

        /* evaluate what phase the pony-up section is in */
        /* check for any pony up requets from the organizer and grab the most recent one */
        for (var i = 0; i < newValue.payment.length; i++) {

          var p = newValue.payment[i];

          $scope.ponyUp = {
            expirationDateMonth: '01',
            expirationDateYear: '2014',
            amount: 0,
            amountFormatted: 0.00,
            transactionFee: 0,
            total: 0
          };

          if (p.type === 'request' && p.open) {

            /* found a pony up request */
            $scope.ponyUpRequest = p;
            if (!$scope.ponyUp || !$scope.ponyUp.amount) {
              $scope.ponyUp.amount = parseInt(p.amount) || 0;
              $scope.ponyUp.amountFormatted = parseFloat($scope.ponyUp.amount / 100).toFixed(2);
              $scope.ponyUp.transactionFee = ($scope.ponyUp.amount * .029) + 250; //tx fee %2.9 + 250
              $scope.ponyUp.total = $scope.ponyUp.transactionFee + $scope.ponyUp.amount;

              $scope.ponyUp.cardHolderName = $scope.customer.firstName + ' ' + $scope.customer.lastName;
              $scope.ponyUp.organizerFirstName = $scope.organizer.firstName;
            }
          }

          if (p.type == 'request') {

            if (p.status !== 'canceled') {
              requested += parseInt(p.amount);
              p.amount = parseInt(p.amount);
            }
          } else {
            received += parseInt(p.amount);
          }



        };
        newValue.payment.requested = parseFloat(requested);
        newValue.payment.received = parseFloat(received);
        newValue.payment.balance = parseFloat((requested - received));
      }
    }

    handlePonyUp($scope.me);

    $rootScope.$on('pony-up-success', function(e, friend) {
      //$scope.me = JSON.parse(friend);
      $scope.me = friend;
      $scope.paymentTotals();
    });

    $scope.$watch('me', function(newValue, oldValue) {
      handlePonyUp(newValue);
    });

    $scope.sendPonyUp = function() {
      if ($scope.sendPonyUpInProgress) {
        return;
      }
      $scope.sendPonyUpInProgress = true;
      $scope.error = $scope.formError = $scope.success = false;
      var args = {};
      args.total               = $scope.ponyUp.total;
      args.amount              = parseInt(parseFloat($scope.ponyUp.amountFormatted) * 100);
      args.transactionFee      = parseInt($scope.ponyUp.transactionFee);
      args.cardHolderName      = $scope.ponyUp.cardHolderName;
      args.creditCardNumber    = $scope.ponyUp.creditCardNumber;
      args.expirationDateMonth = $scope.ponyUp.expirationDateMonth;
      args.expirationDateYear  = $scope.ponyUp.expirationDateYear;
      args.cvv                 = $scope.ponyUp.cvv;
      args.postalCode          = $scope.ponyUp.postalCode;

      wembliRpc.fetch('plan.sendPonyUp', args, function(err, result) {
        $scope.sendPonyUpInProgress = false;
        if (err) {

          $scope.error = true;
          $scope.errorMessage = err;
          $scope.success = false;
          return;
        }

        if (!result.success) {
          $scope.error = true;
          $scope.success = false;

          $scope.errorMessage = result.error;

          if (result.error = "No Organizer Bank Account") {
            $scope.errorMessage = "The organizer cannot receive funds until they provide a bank account to deposit in to. Please try again once the organizer has created their account";
          }

          return;
        }
        $scope.success = true;
        $rootScope.$broadcast('pony-up-success', result.friend);
      });

    };

    planNav.activate('pony-up');
  }
]).

controller('FriendItineraryCtrl', ['$scope','plan', 'planNav', 'wembliRpc',
  function($scope, plan, planNav, wembliRpc) {
    planNav.activate('itinerary');
  }
]).


controller('ChatterCtrl',['$scope', 'wembliRpc', 'planNav',
  function($scope, wembliRpc, planNav) {

    $scope.createChatter = function() {
      if ($scope.chatterForm.$valid) {
        $scope.createChatterInProgress = true;
        wembliRpc.fetch('chatter.create', {
          body: $scope.newChatter
        }, function(err, results) {
          $scope.chatters = results.chatters;
          $scope.createChatterInProgress = false;
        });
      }
    };

    $scope.upVoteChatter = function() {};

    $scope.createChatterComment = function(chatterIdx) {
      var chatter = $scope.chatters[chatterIdx];

      if (chatter.newComment) {
        chatter.commentInProgress = true;
        var args = {
          body: chatter.newComment,
          chatterId: chatter._id
        };
        wembliRpc.fetch('chatter.addComment', args, function(err, results) {
          chatter.comments = results.comments;
          chatter.commentInProgress = false;
          chatter.newComment = "";
        });
      }
    }

    $scope.$watch('newChatterComment', function(val, old) {

    })

    $scope.chatterLoading = true;
    wembliRpc.fetch('chatter.get', {}, function(err, results) {
      $scope.chatters = results.chatters;
      $scope.chatterLoading = false;
      planNav.activate('chatter');
    });



  }
]).

controller('PlanCtrlOff', ['$scope', 'wembliRpc', '$window', 'plan', 'planNav', '$location', '$rootScope', 'googleMap',
	function($scope, wembliRpc, $window, plan, planNav, $location, $rootScope, googleMap) {
		plan.get(function(p) {
			$scope.plan = p;

			/* this activate section stuff should no longer be needed */
			$scope.activateSection = function(sectionName) {
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
