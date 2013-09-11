/*
 * Main Controller
 */

function MainCtrl($scope, $location, $window, footer, plan) {

};


function InviteFriendsWizardCtrl($scope) {

};

/*
 * Index Controller
 */

function IndexCtrl($scope, $templateCache) {
	/* clear the cache when the home page loads to make sure we start fresh */
	/* taking this out for now - i'd like to be able to cache some things */
	/* $templateCache.removeAll(); */
};

/*
 * Confirm Email Controller
 */

function ConfirmCtrl($scope, wembliRpc) {
	wembliRpc.fetch('confirm.init', {},
		function(err, result) {
			$scope.emailError = result.emailError;
			$scope.resent = result.resent;
			$scope.expiredToken = result.expiredToken;
		});
};

/*
 * Event Options Controller
 */

function EventOptionsCtrl($scope, $http, $compile, $location, wembliRpc, fetchModals) {
	//init login vars
	var args = {};
	//$scope.paymentOptionsError = false;
	$scope.addOnsError = false;
	$scope.inviteOptionsError = false;
	$scope.guestListOptionsError = false;

	wembliRpc.fetch('event-options.init', {},

		function(err, result) {

			//$scope.payment = result.payment;
			$scope.parking = result.parking;
			$scope.restaurant = result.restaurant;
			$scope.hotel = result.hotel;
			$scope.guest_friends = result.guestFriends;
			$scope.organizer_not_attending = result.organizerNotAttending;
			$scope.guest_list = result.guestList;
			$scope.over_21 = result.over21;

			if (Object.keys(result.errors).length > 0) {
				//$scope.paymentOptionsError = (result.errors.payment) ? true : false;
				$scope.addOnsError = (result.errors.addOns) ? true : false;
				$scope.inviteOptionsError = (result.errors.inviteOptions) ? true : false;
				$scope.guestListOptionsError = (result.errors.guestList) ? true : false;
			}
		});

	//putting an action in the form causes angular to post the form

	//put fetchModals in the scope so we can call fetch from the view when they hit continue
	$scope.fetchModals = fetchModals;
	$scope.
	continue = function() {
		//fetchModals.fetch('/invitation');
		console.log('next: ' + $scope.next);
		$location.path($scope.next);
	}
};


/*
 * Event List Controller
 */

function EventListCtrl($scope, $location, wembliRpc, $filter, $rootScope, plan, fetchModals, loadingModal, $timeout) {
	/* does nothing right now
	wembliRpc.fetch('eventlist.init', {},
	function(err, result) {

	});
	*/

	plan.get(function(planData) {
		$scope.plan = planData;
		if ((planData === null) || ($scope.plan.preferences.payment === "undefined")) {
			/* fetch the payment-type-modal  */
			fetchModals.fetch('/partials/payment-type');
		}
	});

	$scope.moreEvents = function() {
		//fetch the upcoming events
		var args = {
			"beginDate": $scope.lastEventDate,
			"orderByClause": "Date",
			"lastEventId": $scope.lastEventId
		};

		if ($scope.search) {
			args.searchTerms = $scope.search;
			var method = 'event.search';
		} else {
			args.nearZip = $scope.postalCode;
			var method = 'event.get';
		}

		wembliRpc.fetch(method, args,
			//response callback

			function(err, result) {
				console.log('back from ' + method);
				if (err) {
					//handle err
					alert('error happened - contact help@wembli.com');
					return;
				}

				if (!$scope.events) {
					$scope.events = [];
				}
				$scope.events = $scope.events.concat(result['event']);
				var d = new Date($scope.events[$scope.events.length - 1].Date);
				$scope.lastEventDate = $filter('date')(d, "MM-dd-yy");
				$scope.lastEventId = $scope.events[$scope.events.length - 1].ID;
				$timeout(function() {
					loadingModal.hide();
				}, 500);
			},

			function(data, headersGetter) {
				loadingModal.show('Loading Event Search...');
				return data;
			},

			function(data, headersGetter) {
				return JSON.parse(data);
			});

	};

	if ($rootScope.partial) {
		if ($location.search().search) {
			$scope.search = $location.search().search;
		}
		//begin date for event list
		var daysPadding = 2; //how many days from today for the beginDate
		var d = new Date();
		d2 = new Date(d);
		d2.setDate(d.getDate() + daysPadding);
		$scope.lastEventDate = $filter('date')(d2, "MM-dd-yy");
		$scope.moreEvents();
	}

	//hack so that after the 1st page load, we will render this page using ajax
	$rootScope.partial = true;
};

/*
 * Event Controller
 */

function EventCtrl($scope) {};


function HotelsCtrl($rootScope, $scope, $timeout, plan, wembliRpc, googleMap, mapInfoWindowContent, loadingModal) {
	loadingModal.show('Finding hotels...', null);
	/* get the spots for this lat long and display them as markers */
	/*
	var markers = new L.MarkerClusterGroup({ spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: false });
	markers.addLayer(new L.marker([30.269218,-97.735557]));
	console.log('setting markers in ctrl');
	console.log(markers);
	$scope.markers = markers;
	*/

	$scope.determineRange = function(price) {
		/* hard coded price range for now */
		var i = parseFloat(price);
		if (i <= 20) {
			return '$';
		}
		if (i > 20 && i <= 50) {
			return '$$';
		}
		if (i > 50) {
			return '$$$';
		}
	};

	$scope.determineDistance = function(feet) {
		return parseFloat(feet / 5280).toFixed(2);
	}

	$scope.notFound = true;

	console.log('setting watch for hotels');

	$scope.$watch('hotels', function(hotels) {
		/* make markers & infoWindows for these and add them to the map */
		if (!hotels) {
			return;
		};

		$scope.notFound = false;

		$timeout(function() {
			angular.forEach(hotels.listing, function(v, i) {
				console.log('hotels listing:');
				console.log(v);

				if (!googleMap.hasMarker(v.lat, v.lng)) {
					var marker = new google.maps.Marker({
						position: new google.maps.LatLng(v.lat, v.lng),
						map: googleMap.getMap(),
					});
					marker.setIcon("/images/icons/map-icons/entertainment/hotel_0star.png");
					marker.setAnimation(google.maps.Animation.DROP);

					var win = new google.maps.InfoWindow({
						content: mapInfoWindowContent.create({
							header: v.location_name,
							body: v.address + ', ' + v.city
						}),
						pixelOffset: new google.maps.Size(10, 0),
					});
					google.maps.event.addListener(marker, 'click', function() {
						console.log('clicked infowindow')
						if (googleMap.isInfoWindowOpen(marker)) {
							googleMap.closeInfoWindow(marker);
						} else {
							googleMap.openInfoWindow(marker);
						}
					});

					/* put the marker on the map */
					googleMap.addMarker(marker);
					/* put the infoWindow on the map */
					googleMap.addInfoWindow(win, marker);
				}
			});
		});
	});

	console.log('setting watch for google hotels');
	var deregGP = $scope.$watch('googleHotels', function(hotels) {
		console.log('googleHotels changed: ');
		console.log(hotels);
		/* make markers & infoWindows for these and add them to the map */
		if (!hotels) {
			console.log('google hotels outa here');
			return;
		};

		console.log('notfound is false');
		$scope.notFound = false;

		$timeout(function() {
			angular.forEach(hotels, function(place, i) {
				console.log('google hotels item:');
				console.log(place);


				//if (!googleMap.hasMarker(place.geometry.location.lat(), place.geometry.location.lng())) {
				console.log(place);
				var marker = new google.maps.Marker({
					map: googleMap.getMap(),
					position: place.geometry.location,
				});
				marker.setIcon("/images/icons/map-icons/entertainment/hotel_0star.png");
				marker.setAnimation(google.maps.Animation.DROP);

				var win = new google.maps.InfoWindow({
					content: mapInfoWindowContent.create({
						header: place.name,
						body: place.vicinity
					}),
					pixelOffset: new google.maps.Size(10, 0),
				});

				google.maps.event.addListener(marker, 'click', function() {
					console.log('clicked infowindow')
					if (googleMap.isInfoWindowOpen(marker)) {
						googleMap.closeInfoWindow(marker);
					} else {
						googleMap.openInfoWindow(marker);
					}
				});

				/* put the marker on the map */
				googleMap.addMarker(marker);
				/* put the infoWindow on the map */
				googleMap.addInfoWindow(win, marker);
				//}
			});
			deregGP();

		});

	});

	function getHotels(p) {
		console.log('plan');
		console.log(p);

		/* reset the map */
		googleMap.isDrawn(false);

		var lat = p.venue.data.geocode.geometry.location.lat;
		var lng = p.venue.data.geocode.geometry.location.lng;

		/* make a marker for the venue */
		var marker = new google.maps.Marker({
			map: googleMap.getMap(),
			position: new google.maps.LatLng(lat, lng),
		});
		marker.setIcon("/images/icons/map-icons/sports/stadium.png");
		marker.setAnimation(google.maps.Animation.DROP);

		/* infoWindow for the venue marker */
		var win = new google.maps.InfoWindow({
			content: mapInfoWindowContent.create({
				header: p.event.eventVenue,
				body: p.venue.data.Street1 + ', ' + p.event.eventCity + ', ' + p.event.eventState
			}),
			pixelOffset: new google.maps.Size(10, 0),
		});

		google.maps.event.addListener(marker, 'click', function() {
			console.log('clicked infowindow')
			if (googleMap.isInfoWindowOpen(marker)) {
				googleMap.closeInfoWindow(marker);
			} else {
				googleMap.openInfoWindow(marker);
			}
		});

		/* put the marker on the map */
		googleMap.addMarker(marker);
		/* put the infoWindow on the map */
		googleMap.addInfoWindow(win, marker);
		/* open the infowindow for the venue by default */
		googleMap.openInfoWindow(marker);

		/* get all the google hotels nearby and add it to the scope */
		var request = {
			location: new google.maps.LatLng(lat, lng),
			radius: 1500,
			types: ['lodging']
		};
		var service = new google.maps.places.PlacesService(googleMap.getMap());
		service.nearbySearch(request, function(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				console.log('got googleParking results');
				console.log(results);
				$scope.$apply(function() {
					$scope.googleHotels = results;
				});
			}
		});

		/* get parking from parkwhiz and update scope */
		wembliRpc.fetch('event.getHotels', {
				lat: lat,
				lng: lng,
				//start: start, //optional
				//end: end //optional
			}, function(err, result) {

				if (err) {
					//handle err
					alert('error happened - contact help@wembli.com');
					return;
				}

				console.log('results from event.getHotels');
				$timeout(function() {
					$scope.$apply(function() {
						$scope.hotels = result.hotels;
					});
				});
				//var minRestaurantPrice = result.restaurant.min_price;
				//var maxRestaurantPrice = result.restaurant.max_price;

				var minHotelPrice = 0;
				var maxHotelPrice = 600;

				var initSlider = function() {
					/*Set Minimum and Maximum Price from your Dataset*/
					$("#price-slider").slider("option", "min", minHotelPrice);
					$("#price-slider").slider("option", "max", maxHotelPrice);
					$("#price-slider").slider("option", "values", [minHotelPrice, maxHotelPrice]);
					$("#amount").val("$" + minHotelPrice + " - $" + maxHotelPrice);
				};

				var filterHotel = function() {
					var priceRange = $("#price-slider").slider("option", "values");

					/* hide parking locations that are out of range */
					console.log('filtering hotel');
				};

				//set the height of the map-container to the window height
				//$('#map-container').css("height", $($window).height() - 60);
				//$('#parking').css("height", $($window).height() - 60);
				//$('#map-container').css("width", $($window).width() - 480);

				$('#price-slider').slider({
					range: true,
					min: minHotelPrice,
					max: maxHotelPrice,
					step: 5,
					values: [minHotelPrice, maxHotelPrice],
					slide: function(event, ui) {
						$("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
					},
					stop: function(event, ui) {
						filterHotel();
					}

				});

				var amtVal = "$" + $("#price-slider").slider("values", 0) + " - $" + $("#price-slider").slider("values", 1);
				$("#amount").val(amtVal);

				/* filter tix when the drop down changes */
				$("#quantity-filter").change(function() {
					filterHotel();
				});
				loadingModal.hide();
			},
			/* transformRequest */

			function(data, headersGetter) {
				return data;
			},

			/* transformResponse */

			function(data, headersGetter) {
				return JSON.parse(data);
			});
	};


	plan.get(function(p) {
		$scope.context = plan.getContext() || 'visitor';

		$scope.backToPlan = true;
		if (plan.getFriends().length == 0) {
			$scope.backToPlan = false;
		}
		if ($scope.context === 'friend') {
			$scope.backToPlan = true;
		}

		if (googleMap.isDrawn()) {
			console.log('google map is drawn');
			getHotels(p);
		} else {
			console.log('google map is not drawn');
			var dereg = $rootScope.$on('google-map-drawn', function() {
				console.log('google map is draen now');
				getHotels(p);
				dereg();
			});
		}
	});
};


function RestaurantsCtrl($rootScope, $scope, $timeout, plan, wembliRpc, googleMap, mapInfoWindowContent, loadingModal) {
	loadingModal.show('Finding Restaurants...', null);
	/* get the spots for this lat long and display them as markers */
	/*
	var markers = new L.MarkerClusterGroup({ spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: false });
	markers.addLayer(new L.marker([30.269218,-97.735557]));
	console.log('setting markers in ctrl');
	console.log(markers);
	$scope.markers = markers;
	*/

	$scope.determineRange = function(price) {
		/* hard coded price range for now */
		var i = parseFloat(price);
		if (i <= 20) {
			return '$';
		}
		if (i > 20 && i <= 50) {
			return '$$';
		}
		if (i > 50) {
			return '$$$';
		}
	};

	$scope.determineDistance = function(feet) {
		return parseFloat(feet / 5280).toFixed(2);
	}

	$scope.notFound = true;

	console.log('setting watch for restaurantReservations');

	$scope.$watch('deals', function(deals) {
		/* make markers & infoWindows for these and add them to the map */
		if (!deals) {
			return;
		};

		$scope.notFound = false;

		$timeout(function() {
			angular.forEach(deals, function(d, i) {
				console.log('deals listing:');
				console.log(d);

				if (!googleMap.hasMarker(d.business.locations[0].lat, d.business.locations[0].lon)) {
					var marker = new google.maps.Marker({
						position: new google.maps.LatLng(d.business.locations[0].lat, d.business.locations[0].lon),
						map: googleMap.getMap(),
					});
					marker.setIcon("/images/icons/map-icons/entertainment/restaurant.png");
					marker.setAnimation(google.maps.Animation.DROP);

					var win = new google.maps.InfoWindow({
						content: mapInfoWindowContent.create({
							header: d.business.name,
							body: d.business.locations[0].address + ', ' + d.business.locations[0].locality
						}),
						pixelOffset: new google.maps.Size(10, 0),
					});

					google.maps.event.addListener(marker, 'click', function() {
						console.log('clicked infowindow')
						if (googleMap.isInfoWindowOpen(marker)) {
							googleMap.closeInfoWindow(marker);
						} else {
							googleMap.openInfoWindow(marker);
						}
					});

					/* put the marker on the map */
					googleMap.addMarker(marker);
					/* put the infoWindow on the map */
					googleMap.addInfoWindow(win, marker);
				}
			});
		});
	});

	console.log('setting watch for google restaurants');
	var deregGP = $scope.$watch('googleRestaurants', function(restaurants) {
		console.log('googleRestaurants changed: ');
		console.log(restaurants);
		/* make markers & infoWindows for these and add them to the map */
		if (!restaurants) {
			console.log('google restaurants outa here');
			return;
		};

		console.log('notfound is false');
		$scope.notFound = false;

		$timeout(function() {
			angular.forEach(restaurants, function(place, i) {
				console.log('google restaurant item:');
				console.log(place);


				//if (!googleMap.hasMarker(place.geometry.location.lat(), place.geometry.location.lng())) {
				console.log(place);
				var marker = new google.maps.Marker({
					map: googleMap.getMap(),
					position: place.geometry.location,
				});
				marker.setIcon("/images/icons/map-icons/entertainment/restaurant.png");
				marker.setAnimation(google.maps.Animation.DROP);

				var win = new google.maps.InfoWindow({
					content: mapInfoWindowContent.create({
						header: place.name,
						body: place.vicinity
					}),
					pixelOffset: new google.maps.Size(10, 0),
				});

				google.maps.event.addListener(marker, 'click', function() {
					console.log('clicked infowindow')
					if (googleMap.isInfoWindowOpen(marker)) {
						googleMap.closeInfoWindow(marker);
					} else {
						googleMap.openInfoWindow(marker);
					}
				});

				/* put the marker on the map */
				googleMap.addMarker(marker);
				/* put the infoWindow on the map */
				googleMap.addInfoWindow(win, marker);
				//}
			});
			deregGP();

		});

	});

	function getRestaurants(p) {
		console.log('plan');
		console.log(p);

		/* reset the map */
		googleMap.isDrawn(false);

		var lat = p.venue.data.geocode.geometry.location.lat;
		var lng = p.venue.data.geocode.geometry.location.lng;

		/* make a marker for the venue */
		var marker = new google.maps.Marker({
			map: googleMap.getMap(),
			position: new google.maps.LatLng(lat, lng),
		});
		marker.setIcon("/images/icons/map-icons/sports/stadium.png");
		marker.setAnimation(google.maps.Animation.DROP);

		/* infoWindow for the venue marker */
		var win = new google.maps.InfoWindow({
			content: mapInfoWindowContent.create({
				header: p.event.eventVenue,
				body: p.venue.data.Street1 + ', ' + p.event.eventCity + ', ' + p.event.eventState
			}),
			pixelOffset: new google.maps.Size(10, 0),
		});

		google.maps.event.addListener(marker, 'click', function() {
			console.log('clicked infowindow')
			if (googleMap.isInfoWindowOpen(marker)) {
				googleMap.closeInfoWindow(marker);
			} else {
				googleMap.openInfoWindow(marker);
			}
		});

		/* put the marker on the map */
		googleMap.addMarker(marker);
		/* put the infoWindow on the map */
		googleMap.addInfoWindow(win, marker);
		/* open the infowindow for the venue by default */
		googleMap.openInfoWindow(marker);

		/* get all the google restaurants nearby and add it to the scope */
		/*
		var request = {
			location: new google.maps.LatLng(lat, lng),
			radius: 1500,
			types: ['restaurant']
		};
		var service = new google.maps.places.PlacesService(googleMap.getMap());
		service.nearbySearch(request, function(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				console.log('got googleParking results');
				console.log(results);
				$scope.$apply(function() {
					$scope.googleRestaurants = results;
				});
			}
		});
		*/
		/* get parking from parkwhiz and update scope */
		wembliRpc.fetch('event.getDeals', {
				lat: lat,
				lon: lng,
			}, function(err, result) {

				if (err) {
					//handle err
					alert('error happened - contact help@wembli.com');
					return;
				}

				console.log('results from event.getDeals');
				console.log(result);
				$timeout(function() {
					$scope.$apply(function() {
						$scope.deals = result.deals;
					});
				});
				//var minRestaurantPrice = result.restaurant.min_price;
				//var maxRestaurantPrice = result.restaurant.max_price;

				var minRestaurantPrice = 0;
				var maxRestaurantPrice = 600;

				var initSlider = function() {
					/*Set Minimum and Maximum Price from your Dataset*/
					$("#price-slider").slider("option", "min", minRestaurantPrice);
					$("#price-slider").slider("option", "max", maxRestaurantPrice);
					$("#price-slider").slider("option", "values", [minRestaurantPrice, maxRestaurantPrice]);
					$("#amount").val("$" + minRestaurantPrice + " - $" + maxRestaurantPrice);
				};

				var filterRestaurant = function() {
					var priceRange = $("#price-slider").slider("option", "values");

					/* hide parking locations that are out of range */
					console.log('filtering restaurant');
				};

				//set the height of the map-container to the window height
				//$('#map-container').css("height", $($window).height() - 60);
				//$('#parking').css("height", $($window).height() - 60);
				//$('#map-container').css("width", $($window).width() - 480);

				$('#price-slider').slider({
					range: true,
					min: minRestaurantPrice,
					max: maxRestaurantPrice,
					step: 5,
					values: [minRestaurantPrice, maxRestaurantPrice],
					slide: function(event, ui) {
						$("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
					},
					stop: function(event, ui) {
						filterRestaurant();
					}

				});

				var amtVal = "$" + $("#price-slider").slider("values", 0) + " - $" + $("#price-slider").slider("values", 1);
				$("#amount").val(amtVal);

				/* filter tix when the drop down changes */
				$("#quantity-filter").change(function() {
					filterRestaurant();
				});
				loadingModal.hide();
			},
			/* transformRequest */

			function(data, headersGetter) {
				return data;
			},

			/* transformResponse */

			function(data, headersGetter) {
				return JSON.parse(data);
			});
	};


	plan.get(function(p) {
		$scope.context = plan.getContext() || 'visitor';

		$scope.backToPlan = true;
		if (plan.getFriends().length == 0) {
			$scope.backToPlan = false;
		}
		if ($scope.context === 'friend') {
			$scope.backToPlan = true;
		}

		if (googleMap.isDrawn()) {
			console.log('google map is drawn');
			getRestaurants(p);
		} else {
			console.log('google map is not drawn');
			var dereg = $rootScope.$on('google-map-drawn', function() {
				console.log('google map is draen now');
				getRestaurants(p);
				dereg();
			});
		}
	});
};

function ParkingCtrl($rootScope, $scope, $timeout, plan, parking, wembliRpc, fetchModals, googleMap, googlePlaces, mapVenue, mapMarker, mapInfoWindowContent, loadingModal) {
	loadingModal.show('Finding Parking...', null);
	/* get the spots for this lat long and display them as markers */
	googleMap.init();


	$scope.determineRange = function(price) {
		/* hard coded price range for now */
		var i = parseFloat(price);
		if (i <= 20) {
			return '$';
		}
		if (i > 20 && i <= 50) {
			return '$$';
		}
		if (i > 50) {
			return '$$$';
		}
	};

	$scope.determineDistance = function(feet) {
		return parseFloat(feet / 5280).toFixed(2);
	}

	$scope.notFound = true;

	updateParkingReservations = function(parkingReservations) {
		$scope.notFound = false;
		angular.forEach(parkingReservations.parking_listings, function(v, i) {
			console.log('each parking reservation');
			/* this will have to be set serverside once we aggregate */
			v.service = 'pw';

			/* check if this parking is in the plan */
			if (typeof $scope.parking !== "undefined") {
				if (typeof $scope.parking[0] === "undefined") {
					v.parkingInPlan = false;
				} else {

					for (var i = 0; i < $scope.parking.length; i++) {
						var p = $scope.parking[i];
						if ((p.parking.service === 'pw') && (p.parking.listing_id == v.listing_id)) {
							v._id = p._id;
							v.purchased = p.purchased;
							v.parkingInPlan = true;
						} else {
							v.parkingInPlan = false;
						}
					};
				}
			}
			if (!googleMap.hasMarker(v.lat, v.lng)) {
				mapMarker.create(googleMap, {
					icon: "/images/icons/map-icons/transportation/parkinggarage.png",
					lat: v.lat,
					lng: v.lng,
					name: v.location_name,
					body: v.address + ', ' + v.city
				});
			}
		});
	};

	updateGoogleParking = function(googleParking) {
		$scope.notFound = false;
		console.log('updating google parking');
		angular.forEach(googleParking, function(place, i) {
			place.service = 'google';
			if (typeof $scope.parking !== "undefined") {

				if (typeof $scope.parking[0] === "undefined") {
					place.parkingInPlan = false;
				} else {
					for (var i = 0; i < $scope.parking.length; i++) {
						var p = $scope.parking[i];
						if ((p.parking.service === 'google') && (p.parking.id == place.id)) {
							place._id = p._id;
							place.parkingInPlan = true;
						} else {
							place.parkingInPlan = false;
						}
					};
				}
			}
			if (!googleMap.hasMarker(place.geometry.location.ob, place.geometry.location.pb)) {
				mapMarker.create(googleMap, {
					icon: "/images/icons/map-icons/transportation/parkinggarage.png",
					position: place.geometry.location,
					name: place.name,
					body: place.vicinity
				});
			}
		});
	};

	$scope.$on('parking-changed', function(e, args) {
		console.log('caught parking-changed');
		console.log(args.parking);

		$scope.parking = args.parking;
		$timeout(function() {
			return updateParkingReservations($scope.parkingReservations);
		});
		$timeout(function() {
			return updateGoogleParking($scope.googleParking);
		});
	});

	/* watch for parkingReservations (right now its just parkwhiz) */
	$scope.$watch('parkingReservations', function(parkingReservations) {
		/* make markers & infoWindows for these and add them to the map */
		if (!parkingReservations) {
			return;
		};
		$timeout(function() {
			return updateParkingReservations(parkingReservations);
		});
	});

	$scope.$watch('googleParking', function(googleParking) {
		/* make markers & infoWindows for these and add them to the map */
		if (!googleParking) {
			console.log('googleParking outa here');
			return;
		};
		$timeout(function() {
			console.log('updated google parking');
			return updateGoogleParking(googleParking);
		})
	});

	function getParking(p, args) {
		parking.fetchGoogleParking(args, function(err, p) {
			$scope.$apply(function() {
				console.log('updating googleParking');
				$scope.googleParking = p;
			});
		});

		parking.fetchParkingReservations(args, function(err, p) {
			console.log('FETCHED PARKING RESERVATIONS');
			console.log(p);
			$timeout(function() {
				$scope.$apply(function() {
					$scope.parkingReservations = p;
					loadingModal.hide();
				});
			});
		});
	};

	var initMap = function(p) {
		var lat = p.venue.data.geocode.geometry.location.lat;
		var lng = p.venue.data.geocode.geometry.location.lng;

		console.log('PLAN in init parking map');
		console.log(p);
		$scope.eventOptionsLink = '/event-options/' + p.event.eventId + '/' + p.event.eventName;

		mapVenue.create(googleMap, {
			lat: lat,
			lng: lng,
			name: p.event.eventVenue,
			street: p.venue.data.Street1,
			city: p.event.eventCity,
			state: p.event.eventState
		});

		var purchasedParking = plan.getParking();
		if ((typeof purchasedParking[0] !== "undefined") && purchasedParking[0].purchased) {
			console.log('setting scope parking');
			$scope.parking = purchasedParking;
			if (purchasedParking[0].service === 'pw') {
				if (!googleMap.hasMarker(purchasedParking[0].parking.lat, purchasedParking[0].parking.lng)) {
					mapMarker.create(googleMap, {
						icon: "/images/icons/map-icons/transportation/parkinggarage.png",
						lat: purchasedParking[0].parking.lat,
						lng: purchasedParking[0].parking.lng,
						name: purchasedParking[0].parking.location_name,
						body: purchasedParking[0].parking.address + ', ' + purchasedParking[0].parking.city
					});
				}
			}
			if (purchasedParking[0].service === 'google') {
				if (!googleMap.hasMarker(purchasedParking[0].parking.geometry.location.pb, purchasedParking[0].parking.geometry.location.qb)) {
					mapMarker.create(googleMap, {
						icon: "/images/icons/map-icons/transportation/parkinggarage.png",
						lat: purchasedParking[0].parking.geometry.location.pb,
						lng: purchasedParking[0].parking.geometry.location.qb,
						name: purchasedParking[0].parking.name,
						body: purchasedParking[0].parking.vicinity
					});
				}

			}
			loadingModal.hide();
		} else {
			getParking(p, {
				lat: lat,
				lng: lng
			});
		}
	};

	$scope.removeParking = function(parkingId) {
		/* remove the parking and close the modal */
		console.log('removingparking: ' + parkingId);
		plan.removeParking({
			parkingId: parkingId
		}, function(err, results) {
			console.log('removed parking from plan:');
			console.log(results);
			$rootScope.$broadcast('parking-changed', {
				parking: []
			});
		});
	};

	/* get the login modal */
	fetchModals.fetch('/partials/parking-login-modal');

	/* display a modal when they click to go off and buy tickets */
	fetchModals.fetch('/partials/parking-offsite', function(err) {
		if (err) {
			return console.log('no modal for buy tickets offsite');
		}

		plan.get(function(p) {
			$scope.parking = plan.getParking();
			console.log('parking from plan: ');
			console.log($scope.parking);
			$scope.context = plan.getContext() || 'visitor';

			$scope.backToPlan = true;
			if (plan.getFriends().length == 0) {
				$scope.backToPlan = false;
			}
			if ($scope.context === 'friend') {
				$scope.backToPlan = true;
			}

			if (googleMap.isDrawn()) {
				console.log('google map is drawn');
				initMap(p);
			} else {
				console.log('google map is not drawn');
				var dereg = $rootScope.$on('google-map-drawn', function() {
					console.log('google map is drawn now');
					initMap(p);
					dereg();
				});
			}
		});
	});
};

function PaymentTypeModalCtrl($scope, $location, plan, wembliRpc, $rootScope) {
	$scope.$on('payment-type-modal-clicked', function(e, args) {
		$scope.$apply(function() {
			console.log('payment modal clicked');
			console.log(args);
			$scope.name = args.name;
			$scope.eventId = args.eventId;
			$scope.eventName = args.eventName;
			$scope.nextLink = args.nextLink;
		});
	});

	$scope.startPlan = function() {
		console.log('call start plan');
		console.log('paymentType: ' + $scope.paymentType);
		console.log('nextLink: ' + $scope.nextLink);

		/* start the plan */
		wembliRpc.fetch('plan.startPlan', {
			payment: $scope.paymentType,
			eventId: $scope.eventId,
			eventName: $scope.eventName
		}, function(err, result) {
			console.log('result from start plan');
			console.log(result);
			plan.fetch(function() {
				$location.path($scope.nextLink);
			});


		})
	};
};

function SearchCtrl($scope) {};

function SignupCtrl($scope, $http, wembliRpc) {
	//init login vars
	var args = {};
	$scope.error = false;

	wembliRpc.fetch('signup.init', {},
		//response

		function(err, result) {
			$scope.firstName = result.firstName;
			$scope.lastName = result.lastName;
			$scope.email = result.email;
			$scope.error = result.formError ? result.formError : false;
			$scope.exists = result.exists ? result.exists : false;
		});


	$('#signup-form').submit(function(e) {
		//don't allow submit unless all fields are supplied and passwords match
		if (typeof $scope.firstName === "undefined") {
			return false;
		}
		if (typeof $scope.lastName === "undefined") {
			return false;
		}
		if (typeof $scope.email === "undefined") {
			return false;
		}
	});
};

function LoginCtrl($scope, $http, wembliRpc) {
	//init login vars
	var args = {};
	$scope.error = false;

	wembliRpc.fetch('login.init', {},
		//response

		function(err, result) {
			$scope.remember = result.remember;
			$scope.email = result.email;
			$scope.error = result.formError ? result.formError : false;
			$scope.redirectUrl = result.redirectUrl;
		});

	$scope.forgotPassword = function() {
		$http.get('/partials/forgot-password', {
			cache: true
		}).success(function(data, status, headers, config) {
			$('#login-form fieldset').fadeOut(function() {
				$('#login-form fieldset').html(data);
				$('#login-form fieldset').fadeIn();
				$('#arrow .arrow-text').html('Reset');
				$('#login-form').attr('action', '/forgot-password');
			});
		}).error();

	}
};

function SupplyPasswordCtrl($scope) {
	$('#confirm-password-form').submit(function(e) {
		if ((typeof $scope.password == "undefined") || ($scope.password !== $scope.password2)) {
			$('#error .error-text').show();
			return false;
		}
	});
};

function FooterCtrl($scope, $location, $window, facebook, plan) {
	//this is how high they can drag it
	var y = $("#footer").offset().top - $("#footer").height() + ($("#nav").offset().top - $("#footer").offset().top) + $("#nav").height();
	$('#footer').draggable({
		snap: "#footerContainer",
		snapTolerance: 30,
		snapMode: "inner",
		cursor: "move",
		axis: "y",
		containment: [0, y, 0, $("#footer").offset().top],
		handle: "#help"
	});

	$scope.slide = function() {
		if ($('#footer').css('bottom') === '-300px') {
			$('#footer').animate({
				bottom: '0px'
			});
		} else {
			$('#footer').animate({
				bottom: '-300px'
			});
		}
	}

	$scope.facebook = facebook;

	var updateLinks = function() {
		$scope.eventLink = plan.get() ? '/' + plan.get().event.eventId + '/' + plan.get().event.eventName : '';
	};

	$scope.$on('plan-fetched', updateLinks);
	plan.get(function(plan) {
		updateLinks();
	});
};

function RsvpLoginCtrl($rootScope, $scope, $location, plan, customer, wembliRpc, rsvpLoginModal) {
	$scope.plan = plan.get();
	console.log('rsvp login ctrl');
	$scope.guid = rsvpLoginModal.get('guid');
	$scope.service = rsvpLoginModal.get('service');
	$scope.token = rsvpLoginModal.get('token');
	$scope.friend = rsvpLoginModal.get('friend');
	$scope.event = JSON.parse(rsvpLoginModal.get('event'));

	console.log('service is: ' + $scope.service);
	if ($scope.service === 'wemblimail') {
		$scope.email = rsvpLoginModal.get('serviceId');
		console.log('serviceId = ' + $scope.email);
	}


	console.log($scope.event);
	$scope.confirmSocial = rsvpLoginModal.get('confirmSocial');
	$scope.next = '/rsvp/' + $scope.guid + '/' + $scope.token + '/' + $scope.service;

	$scope.confirm = function(social) {
		if (typeof social === "undefined") {
			if ($scope.customer && ($scope.service !== 'twitter') && ($scope.service !== 'facebook')) {
				return true;
			} else {
				return false;
			}
		}

		/* ghetto - bools become strings */
		if ($scope.confirmSocial === 'false') {
			return false;
		}
		return (social === $scope.service) ? true : false;
	}

	$scope.$on('rsvp-login-modal-init', function(e, args) {
		console.log('rsvp-login-modal-init happened');
		$scope.guid = rsvpLoginModal.get('guid');
		$scope.service = rsvpLoginModal.get('service');
		$scope.token = rsvpLoginModal.get('token');
		$scope.confirmSocial = rsvpLoginModal.get('confirmSocial');
	});


	$scope.authActions = {
		signup: function() {
			wembliRpc.fetch('customer.signup', {
					firstName: $scope.firstName,
					lastName: $scope.lastName,
					email: $scope.email,
					next: $scope.next
				}, function(err, result) {
					console.log(result);

					if (result.customer) {
						console.log('returned a customer - im logged in!');
						/* hide this modal and display the tickets offsite modal */
						$scope.customer = result.customer;
					}

					if (result.loggedIn) {
						$rootScope.loggedIn = result.loggedIn;
					}

					if (result.exists) {
						$scope.formError = false;
						$scope.signupError = true;
						$scope.accountExists = result.exists;
						return;
					}

					if (result.formError) {
						$scope.signupError = true;
						$scope.formError = true;
						$scope.accountExists = false;
						return;
					}
					$scope.signupError = false;
					$scope.formError = false;
					$scope.accountExists = false;

					var confirmSocialMap = {
						facebook: true,
						twitter: true
					};
					/* if the service is facebook or twitter they need to confirm social */
					if ((typeof confirmSocialMap[$scope.service] !== "undefined") && confirmSocialMap[$scope.service]) {
						$scope.confirmSocial = 'true';
					}

				},
				/* transformRequest */

				function(data, headersGetter) {
					$scope.continueSpinner = true;
					return data;
				},

				/* transformResponse */

				function(data, headersGetter) {
					$scope.continueSpinner = false;
					return JSON.parse(data);
				});
		},
		login: function() {
			wembliRpc.fetch('customer.login', {
				email: $scope.email,
				password: $scope.password,
				next: $scope.next
			}, function(err, result) {
				console.log(result);
				if (result.error) {
					$scope.loginError = result.error;

					if (typeof result.noPassword !== "undefined") {
						$scope.noPassword = result.noPassword;
					} else if (result.invalidCredentials) {
						$scope.invalidCredentials = result.invalidCredentials;
					}
				}
				if (result.customer) {
					console.log('returned a customer im logged in!');
					/* hide this modal and display the tickets offsite modal */
					$scope.customer = result.customer;
				}

				if (result.loggedIn) {
					$rootScope.loggedIn = result.loggedIn;
				}

			})
		}
	};
};



function TicketsCtrl($scope, wembliRpc, fetchModals, plan, customer, ticketPurchaseUrls) {
	$scope.tnUrl = ticketPurchaseUrls.tn;

	/* get the login modal */
	fetchModals.fetch('/partials/tickets-login-modal');

	/* display a modal when they click to go off and buy tickets */
	fetchModals.fetch('/partials/tickets-offsite', function(err) {
		if (err) {
			return console.log('no modal for buy tickets offsite');
		}
		plan.get(function(p) {
			$scope.plan = p;
			$scope.organizer = plan.getOrganizer();

			/* todo find out if this person is a friend invited to the plan */
			$scope.context = plan.getContext() || 'visitor';

			$scope.backToPlan = true;
			if (plan.getFriends().length == 0) {
				$scope.backToPlan = false;
			}
			if ($scope.context === 'friend') {
				$scope.backToPlan = true;
			}
		});
	});

	$scope.handlePriceRange = function() {
		/* post the updated preferences to the server */
		wembliRpc.fetch('plan.setTicketsPriceRange', {
				"low": $scope.priceRange.low,
				"med": $scope.priceRange.med,
				"high": $scope.priceRange.high,
			},

			function(err, res) {
				console.log('back from setting price range');
				console.log(res);
			});


		/* hide the tix they don't want to see */
		angular.forEach($scope.tickets, function(t) {
			/* if the price is <= 100 and priceRange.low filter is not checked then hide it*/
			t.hide = false;
			if ((parseInt(t.ActualPrice) <= 100)) {
				return t.hide = !$scope.priceRange.low;
			}
			/* if the price is <= 300 and > 100 and priceRange.med filter is not checked then hide it*/
			if ((parseInt(t.ActualPrice) > 100) && (parseInt(t.ActualPrice) <= 300)) {
				return t.hide = !$scope.priceRange.med;
			}
			/* if the price is > 300 and priceRange.high filter is not checked then hide it*/
			if (parseInt(t.ActualPrice) > 300) {
				return t.hide = !$scope.priceRange.high;
			}
		});
	};

	$scope.sortByPrice = function() {
		if (typeof $scope.ticketSort === "undefined") {
			$scope.ticketSort = 1;
		}

		$scope.tickets.sort(function(a, b) {
			if ($scope.ticketSort) {
				return a.ActualPrice - b.ActualPrice;
			} else {
				return b.ActualPrice - a.ActualPrice;
			}
		});

		$scope.ticketSort = ($scope.ticketSort) ? 0 : 1;
	}

	$scope.sortBySection = function() {
		if (typeof $scope.sectionSort === "undefined") {
			$scope.sectionSort = 1;
		}

		$scope.tickets.sort(function(a, b) {
			if ($scope.sectionSort) {
				return a.Section.localeCompare(b.Section);
			} else {
				return b.Section.localeCompare(a.Section);
			}
		});

		$scope.sectionSort = ($scope.sectionSort) ? 0 : 1;
	}

	$scope.sortByQty = function() {
		if (typeof $scope.qtySort === "undefined") {
			$scope.qtySort = 1;
		}

		$scope.tickets.sort(function(a, b) {
			var cmpA = '';
			var cmpB = '';

			if (typeof a.ValidSplits.int === 'string') {
				cmpA = a.ValidSplits.int;
			} else {

				a.ValidSplits.int.sort();
				cmpA = a.ValidSplits.int[a.ValidSplits.int.length - 1];
			}


			if (typeof b.ValidSplits.int === 'string') {
				cmpB = b.ValidSplits.int;
			} else {

				b.ValidSplits.int.sort();
				cmpB = b.ValidSplits.int[b.ValidSplits.int.length - 1];
			}

			if ($scope.qtySort) {
				return parseInt(cmpA) - parseInt(cmpB);
			} else {
				return parseInt(cmpB) - parseInt(cmpA);
			}
		});

		$scope.qtySort = ($scope.qtySort) ? 0 : 1;
	}

};

function TicketsLoginCtrl($rootScope, $scope, $location, plan, customer, wembliRpc, ticketPurchaseUrls) {
	$scope.tnUrl = ticketPurchaseUrls.tn;

	plan.get(function(p) {
		$scope.$on('tickets-login-clicked', function(e, args) {
			$scope.redirectUrl = '/tickets/' + $scope.plan.event.eventId + '/' + $scope.plan.event.eventName + '/login/' + args.ticket.ID;
			$scope.ticket = args.ticket;
		});
	});

	$scope.authActions = {
		signup: function() {
			wembliRpc.fetch('customer.signup', {
					firstName: $scope.firstName,
					lastName: $scope.lastName,
					email: $scope.email
				}, function(err, result) {
					if (result.customer) {
						/* hide this modal and display the tickets offsite modal */
						//$scope.customer = result.customer;
						customer.set(result.customer);
					}

					if (result.loggedIn) {
						$rootScope.loggedIn = result.loggedIn;
					}

					if (result.exists) {
						$scope.formError = false;
						$scope.signupError = true;
						$scope.accountExists = result.exists;
						return;
					}

					if (result.formError) {
						$scope.signupError = true;
						$scope.formError = true;
						$scope.accountExists = false;
						return;
					}
					$scope.signupError = false;
					$scope.formError = false;
					$scope.accountExists = false;

				},
				/* transformRequest */

				function(data, headersGetter) {
					$scope.continueSpinner = true;
					return data;
				},

				/* transformResponse */

				function(data, headersGetter) {
					$scope.continueSpinner = false;
					return JSON.parse(data);
				});
		},
		login: function() {
			wembliRpc.fetch('customer.login', {
				email: $scope.email,
				password: $scope.password
			}, function(err, result) {
				if (result.error) {
					$scope.loginError = result.error;

					if (typeof result.noPassword !== "undefined") {
						$scope.noPassword = result.noPassword;
					} else if (result.invalidCredentials) {
						$scope.invalidCredentials = result.invalidCredentials;
					}
				}
				if (result.customer) {
					/* hide this modal and display the tickets offsite modal */
					customer.set(result.customer);
				}

				if (result.loggedIn) {
					$rootScope.loggedIn = result.loggedIn;
				}

			})
		}
	};
};

function ParkingLoginCtrl($rootScope, $scope, $location, plan, customer, wembliRpc) {
	plan.get(function(p) {
		$scope.$on('parking-login-clicked', function(e, args) {
			$scope.redirectUrl = '/parking/' + $scope.plan.event.eventId + '/' + $scope.plan.event.eventName + '/login/';
			console.log('parking login clicked');
			console.log(args);
			if (args.parking.service === 'google') {
				$scope.redirectUrl += 'google/' + args.parking.id;
			} else {
				$scope.redirectUrl += 'pw/' + args.parking.listing_id;
			}
			$scope.parking = args.parking;
			//$scope.googleParking = args.googleParking;
			//$scope.parkingReservations = args.parkingReservations;
		});
	});

	$scope.closeLoginModal = function() {
		$location.hash('');
		angular.element('#parking-login-modal').modal('hide');
	};


	$scope.authActions = {
		signup: function() {
			wembliRpc.fetch('customer.signup', {
					firstName: $scope.firstName,
					lastName: $scope.lastName,
					email: $scope.email
				}, function(err, result) {
					if (result.customer) {
						/* hide this modal and display the tickets offsite modal */
						//$scope.customer = result.customer;
						customer.set(result.customer);
					}

					if (result.loggedIn) {
						$rootScope.loggedIn = result.loggedIn;
					}

					if (result.exists) {
						$scope.formError = false;
						$scope.signupError = true;
						$scope.accountExists = result.exists;
						return;
					}

					if (result.formError) {
						$scope.signupError = true;
						$scope.formError = true;
						$scope.accountExists = false;
						return;
					}
					$scope.signupError = false;
					$scope.formError = false;
					$scope.accountExists = false;

				},
				/* transformRequest */

				function(data, headersGetter) {
					$scope.continueSpinner = true;
					return data;
				},

				/* transformResponse */

				function(data, headersGetter) {
					$scope.continueSpinner = false;
					return JSON.parse(data);
				});
		},
		login: function() {
			wembliRpc.fetch('customer.login', {
				email: $scope.email,
				password: $scope.password
			}, function(err, result) {
				if (result.error) {
					$scope.loginError = result.error;

					if (typeof result.noPassword !== "undefined") {
						$scope.noPassword = result.noPassword;
					} else if (result.invalidCredentials) {
						$scope.invalidCredentials = result.invalidCredentials;
					}
				}
				if (result.customer) {
					/* hide this modal and display the tickets offsite modal */
					customer.set(result.customer);
				}

				if (result.loggedIn) {
					$rootScope.loggedIn = result.loggedIn;
				}

			})
		}
	};
};

function RestaurantsLoginCtrl($rootScope, $scope, $location, plan, customer, wembliRpc, ticketPurchaseUrls) {
	$scope.tnUrl = ticketPurchaseUrls.tn;

	plan.get(function(p) {
		$scope.$on('tickets-login-clicked', function(e, args) {
			$scope.redirectUrl = '/tickets/' + $scope.plan.event.eventId + '/' + $scope.plan.event.eventName + '/login/' + args.ticket.ID;
			$scope.ticket = args.ticket;
		});
	});

	$scope.authActions = {
		signup: function() {
			wembliRpc.fetch('customer.signup', {
					firstName: $scope.firstName,
					lastName: $scope.lastName,
					email: $scope.email
				}, function(err, result) {
					if (result.customer) {
						/* hide this modal and display the tickets offsite modal */
						//$scope.customer = result.customer;
						customer.set(result.customer);
					}

					if (result.loggedIn) {
						$rootScope.loggedIn = result.loggedIn;
					}

					if (result.exists) {
						$scope.formError = false;
						$scope.signupError = true;
						$scope.accountExists = result.exists;
						return;
					}

					if (result.formError) {
						$scope.signupError = true;
						$scope.formError = true;
						$scope.accountExists = false;
						return;
					}
					$scope.signupError = false;
					$scope.formError = false;
					$scope.accountExists = false;

				},
				/* transformRequest */

				function(data, headersGetter) {
					$scope.continueSpinner = true;
					return data;
				},

				/* transformResponse */

				function(data, headersGetter) {
					$scope.continueSpinner = false;
					return JSON.parse(data);
				});
		},
		login: function() {
			wembliRpc.fetch('customer.login', {
				email: $scope.email,
				password: $scope.password
			}, function(err, result) {
				if (result.error) {
					$scope.loginError = result.error;

					if (typeof result.noPassword !== "undefined") {
						$scope.noPassword = result.noPassword;
					} else if (result.invalidCredentials) {
						$scope.invalidCredentials = result.invalidCredentials;
					}
				}
				if (result.customer) {
					/* hide this modal and display the tickets offsite modal */
					customer.set(result.customer);
				}

				if (result.loggedIn) {
					$rootScope.loggedIn = result.loggedIn;
				}

			})
		}
	};
};

function HotelsLoginCtrl($rootScope, $scope, $location, plan, customer, wembliRpc, ticketPurchaseUrls) {
	$scope.tnUrl = ticketPurchaseUrls.tn;

	plan.get(function(p) {
		$scope.$on('tickets-login-clicked', function(e, args) {
			$scope.redirectUrl = '/tickets/' + $scope.plan.event.eventId + '/' + $scope.plan.event.eventName + '/login/' + args.ticket.ID;
			$scope.ticket = args.ticket;
		});
	});

	$scope.authActions = {
		signup: function() {
			wembliRpc.fetch('customer.signup', {
					firstName: $scope.firstName,
					lastName: $scope.lastName,
					email: $scope.email
				}, function(err, result) {
					if (result.customer) {
						/* hide this modal and display the tickets offsite modal */
						//$scope.customer = result.customer;
						customer.set(result.customer);
					}

					if (result.loggedIn) {
						$rootScope.loggedIn = result.loggedIn;
					}

					if (result.exists) {
						$scope.formError = false;
						$scope.signupError = true;
						$scope.accountExists = result.exists;
						return;
					}

					if (result.formError) {
						$scope.signupError = true;
						$scope.formError = true;
						$scope.accountExists = false;
						return;
					}
					$scope.signupError = false;
					$scope.formError = false;
					$scope.accountExists = false;

				},
				/* transformRequest */

				function(data, headersGetter) {
					$scope.continueSpinner = true;
					return data;
				},

				/* transformResponse */

				function(data, headersGetter) {
					$scope.continueSpinner = false;
					return JSON.parse(data);
				});
		},
		login: function() {
			wembliRpc.fetch('customer.login', {
				email: $scope.email,
				password: $scope.password
			}, function(err, result) {
				if (result.error) {
					$scope.loginError = result.error;

					if (typeof result.noPassword !== "undefined") {
						$scope.noPassword = result.noPassword;
					} else if (result.invalidCredentials) {
						$scope.invalidCredentials = result.invalidCredentials;
					}
				}
				if (result.customer) {
					/* hide this modal and display the tickets offsite modal */
					customer.set(result.customer);
				}

				if (result.loggedIn) {
					$rootScope.loggedIn = result.loggedIn;
				}

			})
		}
	};
};

function TicketsOffsiteCtrl($scope, plan, $http) {
	plan.get(function(p) {
		console.log('plan in tickets tickets-offsite');
		console.log(p);
		$scope.plan = p;
	});

	$scope.$on('tickets-offsite-clicked', function(e, args) {
		console.log('handle tickets-offsite-clicked');
		console.log(args);
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
		/* for testing, fire the ticketnetwork pixel which will set the payment.receipt value */
		$http.get('http://tom.wembli.com/callback/tn/checkout?request_id=' + $scope.sessionId + '&event_id=' + $scope.eventId);
	};

	$scope.cancelForm = function() {
		/* remove the ticketgroup and close the modal */
		plan.removeTicketGroup({
			ticketId: $scope.ticketId
		}, function(err, results) {
			console.log('removed ticketgroup from plan:');
			console.log(results);
			$('#tickets-offsite-modal').modal('hide');
		});

	};

};

function ParkingOffsiteCtrl($scope, plan, $http, $location) {
	plan.get(function(p) {
		console.log('plan in parking-offsite');
		console.log(p);
		$scope.plan = p;
	});


	$scope.$on('parking-offsite-clicked', function(e, args) {
		console.log('handle parking-offsite-clicked');
		console.log(args);
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
		console.log('adding parking receipt for:');
		console.log($scope.parkingId);
		/* update the parking to have a receipt because parkwhiz doesn't give us a pixel yet */
		plan.addParkingReceipt({
			parkingId: $scope.parkingId,
			service: $scope.parking.service,
			receipt: {
				qty: $scope.qty,
				amountPaid: $scope.amountPaid
			}
		}, function(err, result) {
			console.log('added parking receipt:');
			console.log(err);
			console.log(result);

			$('#parking-offsite-modal').modal('hide');
			/* have to back to plan so they don't have a chance to buy more */
			$location.path("/plan");
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
			console.log('removed parking from plan:');
			console.log(results);
			$('#parking-offsite-modal').modal('hide');
			$rootScope.$broadcast('parking-changed', {
				parking: results.parking
			});

		});

	};

};

function RestaurantsOffsiteCtrl($scope, plan, $http) {
	plan.get(function(p) {
		console.log('plan in tickets tickets-offsite');
		console.log(p);
		$scope.plan = p;
	});

	$scope.$on('tickets-offsite-clicked', function(e, args) {
		console.log('handle tickets-offsite-clicked');
		console.log(args);
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
			console.log('removed ticketgroup from plan:');
			console.log(results);
			$('#tickets-offsite-modal').modal('hide');
		});

	};

};

function HotelsOffsiteCtrl($scope, plan, $http) {
	plan.get(function(p) {
		console.log('plan in tickets tickets-offsite');
		console.log(p);
		$scope.plan = p;
	});

	$scope.$on('tickets-offsite-clicked', function(e, args) {
		console.log('handle tickets-offsite-clicked');
		console.log(args);
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
			console.log('removed ticketgroup from plan:');
			console.log(results);
			$('#tickets-offsite-modal').modal('hide');
		});

	};

};

function VenueMapCtrl($rootScope, $scope, interactiveMapDefaults, plan, $filter, customer, wembliRpc) {
	plan.fetch(function(result) {
		var p = result.plan;
		$scope.plan = p;
		$scope.priceRange = {};
		$scope.eventOptionsLink = '/event-options/' + p.event.eventId + '/' + p.event.eventName;
		$scope.priceRange.low = p.preferences.tickets.priceRange.low || true;
		$scope.priceRange.med = p.preferences.tickets.priceRange.med || true;
		$scope.priceRange.high = p.preferences.tickets.priceRange.high || true;
		//$scope.rsvpComplete = plan.rsvpComplete();
	});

	$scope.determineRange = function(price) {
		/* hard coded price range for now */
		var i = parseInt(price);
		if (i <= 100) {
			return '$';
		}
		if (i > 100 && i <= 300) {
			return '$$';
		}
		if (i > 300) {
			return '$$$';
		}
	}

	$scope.removeTicketGroup = function(ticketId) {
		wembliRpc.fetch('plan.removeTicketGroup', {
			ticketId: ticketId
		}, function(err, result) {
			console.log(result);
			plan.setTickets(result.tickets);
		});

	};


	$scope.determineTixAvailable = function(tix) {
		if (typeof tix[0] === "undefined") {
			tix = [tix];
		}
		var highest = tix[0];
		angular.forEach(tix, function(el) {
			if (el > highest) {
				highest = el;
			}
		});
		var str = 'up to ' + highest + ' tix available';
		return str;
	}

};
