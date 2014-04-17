/* Controllers */
angular.module('wembliApp.controllers-old', []).

/*
 * Confirm Email Controller
 */

controller('ConfirmCtrl', ['$scope', 'wembliRpc',
	function($scope, wembliRpc) {
		wembliRpc.fetch('confirm.init', {},
			function(err, result) {
				$scope.emailError = result.emailError;
				$scope.resent = result.resent;
				$scope.expiredToken = result.expiredToken;
			});
	}
]).

/*
 * Event Options Controller
 */

controller('HotelsCtrl', ['$rootScope', '$scope', '$timeout', 'plan', 'wembliRpc', 'googleMap', 'mapInfoWindowContent', 'loadingModal',
	function($rootScope, $scope, $timeout, plan, wembliRpc, googleMap, mapInfoWindowContent, loadingModal) {
		loadingModal.show('Finding hotels...', null);
		/* get the spots for this lat long and display them as markers */
		/*
			var markers = new L.MarkerClusterGroup({ spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: false });
			markers.addLayer(new L.marker([30.269218,-97.735557]));
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

		$scope.$watch('hotels', function(hotels) {
			/* make markers & infoWindows for these and add them to the map */
			if (!hotels) {
				return;
			};

			//$scope.notFound = false;

			$timeout(function() {
				angular.forEach(hotels.listing, function(v, i) {

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

		var deregGP = $scope.$watch('googleHotels', function(hotels) {
			/* make markers & infoWindows for these and add them to the map */
			if (!hotels) {
				return;
			};

			$timeout(function() {
				angular.forEach(hotels, function(place, i) {

					//if (!googleMap.hasMarker(place.geometry.location.lat(), place.geometry.location.lng())) {

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
				getHotels(p);
			} else {
				var dereg = $rootScope.$on('google-map-drawn', function() {
					getHotels(p);
					dereg();
				});
			}
		});
	}
]).

controller('RestaurantsCtrl', ['$rootScope', '$scope', '$timeout', 'plan', 'restaurants', 'wembliRpc', 'fetchModals', 'googleMap', 'googlePlaces', 'mapVenue', 'mapMarker', 'mapInfoWindowContent', 'loadingModal',
	function($rootScope, $scope, $timeout, plan, restaurants, wembliRpc, fetchModals, googleMap, googlePlaces, mapVenue, mapMarker, mapInfoWindowContent, loadingModal) {
		loadingModal.show('Finding Restaurants & Deals...', null);
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

		var filterNone = function() {
			$scope.$apply(function() {
				for (var i = 0; i < $scope.deals.length; i++) {
					$scope.deals[i].hide = false;
				};
			});
		}

		var filterDealsById = function(id) {
			if (typeof id === "undefined") {
				return filterNone();
			}
			$scope.$apply(function() {

				for (var i = 0; i < $scope.deals.length; i++) {
					$scope.deals[i].hide = ($scope.deals[i].id != id);
				}
			});

		};

		updateDeals = function(deals) {
			$scope.notFound = false;

			angular.forEach(deals, function(d, i) {
				d.service = 'yipit';
				d.hide = (typeof d.hide === "undefined") ? false : d.hide;


				if (typeof $scope.restaurants !== "undefined") {
					if (typeof $scope.restaurants[0] === "undefined") {
						d.restaurantInPlan = false;
					} else {

						for (var i = 0; i < $scope.restaurants.length; i++) {
							var r = $scope.restaurants[i];
							if ((r.restaurant.service === 'yipit') && (r.restaurant.id == d.id)) {
								d._id = r._id;
								d.purchased = r.purchased;
								d.restaurantInPlan = true;
							} else {
								d.restaurantInPlan = false;
							}
						};
					}
				}
				if (!googleMap.hasMarker(d.business.locations[0].lat, d.business.locations[0].lon)) {
					mapMarker.create(googleMap, {
						icon: "/images/icons/map-icons/entertainment/restaurant.png",
						lat: d.business.locations[0].lat,
						lng: d.business.locations[0].lon,
						name: d.title,
						body: d.business.name,
						click: {
							on: function() {
								filterDealsById(d.id)
							},
							off: function() {
								filterDealsById()
							}
						}
					});
				}
			});
		};

		updateGoogleRestaurants = function(googleRestaurants) {
			$scope.notFound = false;
			angular.forEach(googleRestaurants, function(place, i) {
				place.service = 'google';
				if (typeof $scope.restaurants !== "undefined") {

					if (typeof $scope.restaurants[0] === "undefined") {
						place.restaurantInPlan = false;
					} else {
						for (var i = 0; i < $scope.restaurants.length; i++) {
							var r = $scope.restaurants[i];
							if ((r.restaurant.service === 'google') && (r.restaurant.id == place.id)) {
								place._id = r._id;
								place.restaurantInPlan = true;
							} else {
								place.restaurantInPlan = false;
							}
						};
					}
				}
				if (!googleMap.hasMarker(place.geometry.location.lat(), place.geometry.location.lng())) {
					mapMarker.create(googleMap, {
						icon: "/images/icons/map-icons/entertainment/restaurant.png",
						position: place.geometry.location,
						name: place.name,
						body: place.vicinity
					});
				}
			});
		};

		$scope.$on('restaurants-changed', function(e, args) {
			$scope.restaurants = args.restaurants;
			$timeout(function() {
				return updateDeals($scope.deals);
			});
			$timeout(function() {
				return updateGoogleRestaurants($scope.googleRestaurants);
			});
		});

		/* watch for parkingReservations (right now its just parkwhiz) */
		$scope.$watch('deals', function(deals) {
			/* make markers & infoWindows for these and add them to the map */
			if (!deals) {
				return;
			};
			$timeout(function() {
				return updateDeals(deals);
			});
		});

		$scope.$watch('googleRestaurants', function(googleRestaurants) {
			/* make markers & infoWindows for these and add them to the map */
			if (!googleRestaurants) {
				return;
			};
			$timeout(function() {
				return updateGoogleRestaurants(googleRestaurants);
			})
		});

		function getRestaurants(p, args) {
			/* no google restaurants for now until we figure how to fit it in with deals */
			/*
		restaurants.fetchGoogleRestaurants(args, function(err, r) {
			$scope.$apply(function() {
				$scope.googleRestaurants = r;
			});
		});
		*/
			restaurants.fetchDeals(args, function(err, r) {
				$timeout(function() {
					$scope.$apply(function() {
						$scope.deals = r;
						loadingModal.hide();
					});
				});
			});
		};

		var initMap = function(p) {
			var lat = p.venue.data.geocode.geometry.location.lat;
			var lng = p.venue.data.geocode.geometry.location.lng;

			$scope.eventOptionsLink = '/event-options/' + p.event.eventId + '/' + p.event.eventName;

			mapVenue.create(googleMap, {
				lat: lat,
				lng: lng,
				name: p.event.eventVenue,
				street: p.venue.data.Street1,
				city: p.event.eventCity,
				state: p.event.eventState
			});

			var purchasedRestaurants = plan.getRestaurants();
			if ((typeof purchasedRestaurants[0] !== "undefined") && purchasedRestaurants[0].purchased) {
				$scope.restaurants = purchasedRestaurants;
				if (purchasedRestaurants[0].service === 'yipit') {
					if (!googleMap.hasMarker(purchasedRestaurants[0].restaurant.business.locations[0].lat, purchasedRestaurants[0].restaurant.business.locations[0].lon)) {
						mapMarker.create(googleMap, {
							icon: "/images/icons/map-icons/entertainment/restaurant.png",
							lat: purchasedRestaurants[0].restaurant.business.locations[0].lat,
							lng: purchasedRestaurants[0].restaurant.business.locations[0].lon,
							name: purchasedRestaurants[0].restaurant.business.name,
							body: purchasedRestaurants[0].title
						});
					}
				}
				if (purchasedRestaurants[0].service === 'google') {
					if (!googleMap.hasMarker(purchasedRestaurants[0].restaurant.geometry.location.lat(), purchasedRestaurants[0].restaurant.geometry.location.lng())) {
						mapMarker.create(googleMap, {
							icon: "/images/icons/map-icons/entertainment/restaurant.png",
							lat: purchasedRestaurants[0].restaurant.geometry.location.lat(),
							lng: purchasedRestaurants[0].restaurant.geometry.location.lng(),
							name: purchasedRestaurants[0].restaurant.name,
							body: purchasedRestaurants[0].restaurant.vicinity
						});
					}

				}
				loadingModal.hide();
			} else {
				getRestaurants(p, {
					lat: lat,
					lng: lng
				});
			}
		};

		$scope.removeRestaurant = function(restaurantId) {
			/* remove the restaurant and close the modal */
			plan.removeRestaurant({
				restaurantId: restaurantId
			}, function(err, results) {
				$rootScope.$broadcast('restaurants-changed', {
					parking: []
				});
			});
		};

		/* display a modal when they click to go off and buy tickets */
		fetchModals.fetch('/partials/modals/restaurants-modals', function(err) {
			if (err) {
				return;
			}

			plan.get(function(p) {
				$scope.restaurants = plan.getRestaurants();
				$scope.context = plan.getContext() || 'visitor';

				$scope.backToPlan = true;
				if (plan.getFriends().length == 0) {
					$scope.backToPlan = false;
				}
				if ($scope.context === 'friend') {
					$scope.backToPlan = true;
				}

				if (googleMap.isDrawn()) {
					initMap(p);
				} else {
					var dereg = $rootScope.$on('google-map-drawn', function() {
						initMap(p);
						dereg();
					});
				}
			});
		});
	}
]).

controller('ParkingCtrl', ['$rootScope', '$scope', '$timeout', 'plan', 'parking', 'wembliRpc', 'fetchModals', 'googleMap', 'googlePlaces', 'mapVenue', 'mapMarker', 'mapInfoWindowContent', 'loadingModal',
	function($rootScope, $scope, $timeout, plan, parking, wembliRpc, fetchModals, googleMap, googlePlaces, mapVenue, mapMarker, mapInfoWindowContent, loadingModal) {
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

		var filterNone = function(service) {
			$scope.$apply(function() {
				for (var i = 0; i < $scope.googleParking.length; i++) {
					$scope.googleParking[i].hide = false;
				};
				for (var i = 0; i < $scope.parkingReservations.parking_listings.length; i++) {
					$scope.parkingReservations.parking_listings[i].hide = false;
				};
			});
		}

		var filterGoogleParkingById = function(id) {
			if (typeof id === "undefined") {
				return filterNone();
			}
			$scope.$apply(function() {
				for (var i = 0; i < $scope.googleParking.length; i++) {
					$scope.googleParking[i].hide = ($scope.googleParking[i].id != id);
				}
				for (var i = 0; i < $scope.parkingReservations.parking_listings.length; i++) {
					$scope.parkingReservations.parking_listings[i].hide = true;
				}
			});
		};

		var filterParkingReservationsById = function(id) {
			if (typeof id === "undefined") {
				return filterNone();
			}

			$scope.$apply(function() {
				for (var i = 0; i < $scope.parkingReservations.parking_listings.length; i++) {
					$scope.parkingReservations.parking_listings[i].hide = ($scope.parkingReservations.parking_listings[i].listing_id != id);
				}
				for (var i = 0; i < $scope.googleParking.length; i++) {
					$scope.googleParking[i].hide = true;
				}
			});
		};


		updateParkingReservations = function(parkingReservations) {
			$scope.notFound = false;
			if (typeof parkingReservations == "undefined") {
				return;
			}
			angular.forEach(parkingReservations.parking_listings, function(v, i) {
				/* this will have to be set serverside once we aggregate */
				v.service = 'pw';
				v.hide = (typeof v.hide === "undefined") ? false : v.hide;

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
						body: v.address + ', ' + v.city,
						click: {
							on: function() {
								filterParkingReservationsById(v.listing_id)
							},
							off: function() {
								filterParkingReservationsById()
							}
						}

					});
				}
			});
		};

		updateGoogleParking = function(googleParking) {
			if (typeof googleParking == "undefined") {
				return;
			}
			$scope.notFound = false;
			angular.forEach(googleParking, function(place, i) {
				place.service = 'google';
				place.hide = (typeof place.hide === "undefined") ? false : place.hide;
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

				if (!googleMap.hasMarker(place.geometry.location.lat(), place.geometry.location.lng())) {
					mapMarker.create(googleMap, {
						icon: "/images/icons/map-icons/transportation/parkinggarage.png",
						position: place.geometry.location,
						name: place.name,
						body: place.vicinity,
						click: {
							on: function() {
								filterGoogleParkingById(place.id)
							},
							off: function() {
								filterGoogleParkingById()
							}
						}

					});
				}
			});
		};

		$scope.$on('parking-changed', function(e, args) {

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
				return;
			};
			$timeout(function() {
				return updateGoogleParking(googleParking);
			})
		});

		function getParking(p, args) {
			parking.fetchGoogleParking(args, function(err, p) {
				$scope.$apply(function() {
					$scope.googleParking = p;
				});
			});

			parking.fetchParkingReservations(args, function(err, p) {
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
					var ll = new google.maps.LatLng(purchasedParking[0].parking.geometry.location.ob, purchasedParking[0].parking.geometry.location.pb);

					mapMarker.create(googleMap, {
						icon: "/images/icons/map-icons/transportation/parkinggarage.png",
						lat: ll.lat(),
						lng: ll.lng(),
						name: purchasedParking[0].parking.name,
						body: purchasedParking[0].parking.vicinity
					});

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
			plan.removeParking({
				parkingId: parkingId
			}, function(err, results) {
				$rootScope.$broadcast('parking-changed', {
					parking: results.parking
				});
			});
		};

		/* display a modal when they click to go off and buy tickets */
		fetchModals.fetch('/partials/modals/parking-modals', function(err) {
			if (err) {
				return;
			}

			plan.get(function(p) {
				$scope.parking = plan.getParking();
				$scope.context = plan.getContext() || 'visitor';

				$scope.backToPlan = true;
				if (plan.getFriends().length == 0) {
					$scope.backToPlan = false;
				}
				if ($scope.context === 'friend') {
					$scope.backToPlan = true;
				}

				if (googleMap.isDrawn()) {
					initMap(p);
				} else {
					var dereg = $rootScope.$on('google-map-drawn', function() {
						initMap(p);
						dereg();
					});
				}
			});
		});
	}
]).

controller('RsvpLoginCtrl', ['$rootScope', '$scope', '$location', 'plan', 'customer', 'wembliRpc', 'rsvpLoginModal', 'pixel', 'googleAnalytics',
	function($rootScope, $scope, $location, plan, customer, wembliRpc, rsvpLoginModal, pixel, googleAnalytics) {
		$scope.plan = plan.get();
		$scope.guid = rsvpLoginModal.get('guid');
		$scope.service = rsvpLoginModal.get('service');
		$scope.token = rsvpLoginModal.get('token');
		$scope.friend = rsvpLoginModal.get('friend');
		$scope.event = JSON.parse(rsvpLoginModal.get('event'));
		$scope.listId = 'a55323395c';

		if ($scope.service === 'wemblimail') {
			wembliRpc.fetch('friend.getServiceId', {
				token: $scope.token
			}, function(err, result) {
				if (result.serviceId) {
					$scope.email = result.serviceId;
				}
			});
		}


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
						next: $scope.next,
						listId: $scope.listId
					}, function(err, result) {

						if (result.customer) {
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


						/* fire the signup pixels */
						var gCookie = googleAnalytics.getCookie();

						pixel.fire({
							type: 'signup',
							campaign: gCookie.__utmz.utmccn,
							source: 'google',
							medium: gCookie.__utmz.utmcmd,
							term: gCookie.__utmz.utmctr,
							content: '1070734106',
						});


						/* fire the facebook signup pixels */
			      pixel.fire({
			        type: 'signup',
			        campaign: 'Signup Conversion Pixel Facebook Ad',
			        source: 'facebook',
			        medium: 'cpc',
			        term: '',
			        content: '6013588786171',
			      });

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
						$scope.customer = result.customer;
					}

					if (result.loggedIn) {
						$rootScope.loggedIn = result.loggedIn;
					}
				});
			}
		};
	}
]).

controller('ParkingLoginCtrl', ['$rootScope', '$scope', '$location', 'plan', 'customer', 'wembliRpc', 'pixel', 'googleAnalytics',
	function($rootScope, $scope, $location, plan, customer, wembliRpc, pixel, googleAnalytics) {
		$scope.listId = 'a55323395c';

		plan.get(function(p) {
			$scope.$on('parking-login-clicked', function(e, args) {
				$scope.redirectUrl = '/parking/' + $scope.plan.event.eventId + '/' + $scope.plan.event.eventName + '/login/';

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

		$scope.authActions = {
			signup: function() {
				wembliRpc.fetch('customer.signup', {
						firstName: $scope.firstName,
						lastName: $scope.lastName,
						email: $scope.email,
						listId: $scope.listId

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

						/* fire the signup pixels */
						var gCookie = googleAnalytics.getCookie();

						pixel.fire({
							type: 'signup',
							campaign: gCookie.__utmz.utmccn,
							source: 'google',
							medium: gCookie.__utmz.utmcmd,
							term: gCookie.__utmz.utmctr,
							content: '1070734106',
						});

						/* fire the facebook signup pixels */
			      pixel.fire({
			        type: 'signup',
			        campaign: 'Signup Conversion Pixel Facebook Ad',
			        source: 'facebook',
			        medium: 'cpc',
			        term: '',
			        content: '6013588786171',
			      });

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
	}
]).

controller('RestaurantsLoginCtrl', ['$rootScope', '$scope', '$location', 'plan', 'customer', 'wembliRpc', 'ticketPurchaseUrls', 'pixel', 'googleAnalytics',
	function($rootScope, $scope, $location, plan, customer, wembliRpc, ticketPurchaseUrls, pixel, googleAnalytics) {
		$scope.listId = 'a55323395c';

		plan.get(function(p) {
			$scope.$on('restaurants-login-clicked', function(e, args) {
				$scope.redirectUrl = '/restaurants/' + $scope.plan.event.eventId + '/' + $scope.plan.event.eventName + '/login/';
				if (args.restaurant.service === 'google') {
					$scope.redirectUrl += 'google/' + args.restaurant.id;
				} else {
					$scope.redirectUrl += 'yipit/' + args.restaurant.id;
				}
				$scope.restaurant = args.restaurant;
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
						email: $scope.email,
						listId: $scope.listId

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

						/* fire the signup pixels */
						var gCookie = googleAnalytics.getCookie();

						pixel.fire({
							type: 'signup',
							campaign: gCookie.__utmz.utmccn,
							source: 'google',
							medium: gCookie.__utmz.utmcmd,
							term: gCookie.__utmz.utmctr,
							content: '1070734106',
						});

						/* fire the facebook signup pixels */
			      pixel.fire({
			        type: 'signup',
			        campaign: 'Signup Conversion Pixel Facebook Ad',
			        source: 'facebook',
			        medium: 'cpc',
			        term: '',
			        content: '6013588786171',
			      });

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
	}
]).

controller('HotelsLoginCtrl' ['$rootScope', '$scope', '$location', 'plan', 'customer', 'wembliRpc', 'ticketPurchaseUrls', 'pixel', 'googleAnalytics',
	function($rootScope, $scope, $location, plan, customer, wembliRpc, ticketPurchaseUrls, pixel, googleAnalytics) {
		$scope.tnUrl = ticketPurchaseUrls.tn;
		$scope.listId = 'a55323395c';

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
						email: $scope.email,
						listId: $scope.listId

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

						/* fire the signup pixels */
						var gCookie = googleAnalytics.getCookie();

						pixel.fire({
							type: 'signup',
							campaign: gCookie.__utmz.utmccn,
							source: 'google',
							medium: gCookie.__utmz.utmcmd,
							term: gCookie.__utmz.utmctr,
							content: '1070734106',
						});

						/* fire the facebook signup pixels */
			      pixel.fire({
			        type: 'signup',
			        campaign: 'Signup Conversion Pixel Facebook Ad',
			        source: 'facebook',
			        medium: 'cpc',
			        term: '',
			        content: '6013588786171',
			      });


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

controller('ParkingInfoCtrl', ['$scope', 'plan', 'googlePlaces',
	function($scope, plan, googlePlaces) {

		plan.get(function(p) {
			$scope.plan = p;
		});


		$scope.$on('parking-info-clicked', function(e, args) {
			$scope.parking = args.parking;

			/* get the place details */
			googlePlaces.getDetails(args.parking.reference, function(place, status) {
				if (status == google.maps.places.PlacesServiceStatus.OK) {
					$scope.$apply(function() {
						$scope.details = place;
					});
				}
			});
		});

	}
]).

controller('RestaurantsInfoCtrl', ['$scope', 'plan',
	function($scope, plan) {

		plan.get(function(p) {
			$scope.plan = p;
		});


		$scope.$on('restaurants-info-clicked', function(e, args) {
			$scope.restaurant = args.restaurant;
		});

	}
]).

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

controller('LandingPageSearchCtrl', ['$rootScope', '$scope', '$location', 'wembliRpc', 'pixel',
	function($rootScope, $scope, $location, wembliRpc, pixel) {

		$rootScope.$broadcast('search-page-loaded', {});

		$scope.searchInProgress = false;

		$scope.$on('search-page-loaded', function() {
			$scope.searchInProgress = false;
		});

		$scope.submitSearch = function() {
			$scope.searchInProgress = true;
			$location.path('/search/events/' + $scope.search);
		}

	}
]).

controller('LandingPageCtrl', ['$rootScope', '$scope', '$location', 'wembliRpc', 'pixel',
	function($rootScope, $scope, $location, wembliRpc, pixel) {
		$scope.searchInProgress = false;
		$scope.signupInProgress = false;
		$scope.showSearch = false;

		$scope.listId = 'a55323395c';

		$scope.submitSearch = function() {
			$scope.searchInProgress = true;
			$location.path('/search/events/' + $scope.search);
		}


		$scope.submitSignup = function() {
			$scope.signupInProgress = true;

			if ($scope.landingPageSignupForm.$invalid) {
				$scope.signupInProgress = false;
				return;
			}

			wembliRpc.fetch('customer.signup', {
				firstName: $scope.firstName,
				lastName: $scope.lastName,
				email: $scope.email,
				promo: $scope.promo,
				listId: $scope.listId
			}, function(err, result) {
				console.log($scope.customer);
				$scope.signupInProgress = false;

				if (result.customer) {
					$rootScope.customer = result.customer;
				}

				if (result.loggedIn) {
					$rootScope.loggedIn = result.loggedIn;
				}

				$scope.signupError = false;
				$scope.formError = false;
				$scope.accountExists = false;
				$scope.showSearch = true;

				$rootScope.$broadcast('search-page-loaded', {});

				$scope.$on('search-page-loaded', function() {
					$scope.searchInProgress = false;
				});
				/* fire the san diego chargers conversion pixel */
				/* fire the facebook signup pixels */
				pixel.fire({
					type: 'signup',
					campaign: $scope.campaign,
					source: 'facebook',
					medium: 'cpc',
					term: '',
					content: $scope.pixelId
				});
				/*
				pixel.fire({
					type: 'test',
					campaign: 'Test 01',
					source: 'facebook',
					medium: 'cpc',
					term: '',
					content: '6012676009971',
				});

				pixel.fire({
					type: 'test',
					campaign: 'Test 02',
					source: 'facebook',
					medium: 'cpc',
					term: '',
					content: '6012676037771',
				});
				*/
			});
		}
	}
]);
