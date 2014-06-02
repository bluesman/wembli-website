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



controller('PlanCtrl', ['$scope', 'wembliRpc', '$window', 'plan', 'planNav', '$location', '$rootScope', 'googleMap',
	function($scope, wembliRpc, $window, plan, planNav, $location, $rootScope, googleMap) {
		plan.get(function(p) {
			$scope.plan = p;

			$scope.activateSection = function(sectionNumber) {
				console.log('activateSection '+ sectionNumber);
        var sectionNumber = parseInt(sectionNumber.charAt(sectionNumber.length - 1));
        planNav.activate(sectionNumber);
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
