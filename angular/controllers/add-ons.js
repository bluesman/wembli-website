/* Controllers */
angular.module('wembliApp.controllers.addOns', []).

controller('HotelsCtrlOff', ['$rootScope', '$scope', '$timeout', 'plan', 'wembliRpc', 'googleMap', 'mapInfoWindowContent', 'loadingModal',
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


controller('HotelsCtrl', ['$rootScope', '$scope', '$timeout', 'plan', 'wembliHotels', 'wembliRpc', 'googleMap', 'googlePlaces', 'mapVenue', 'mapMarker', 'mapInfoWindowContent', 'overlay', '$location','$window', 'googleAnalytics', 'header',
	function($rootScope, $scope, $timeout, plan, wembliHotels, wembliRpc, googleMap, googlePlaces, mapVenue, mapMarker, mapInfoWindowContent, overlay, $location, $window, googleAnalytics, header) {
		/* tell the header not to disappear on scroll */
		header.fixed();

		/* get the spots for this lat long and display them as markers */
		googleMap.init();
		$scope.currentPath   = $location.path();
		$scope.addonsFetched = 0;
		$scope.filteredList  = false;
		$scope.notFound      = true;

		$scope.parseDate = function(d) {
			return new Date(d);
		}

		$scope.determineDistance = function(feet) {
			return parseFloat(feet / 5280).toFixed(2);
		}

		var filterNone = function() {
			$scope.filteredList = false;
			$timeout(function() {
				$scope.$apply(function() {
					for (var i = 0; i < $scope.hotels.length; i++) {
						$scope.hotels[i].hide = false;
					};
				});
			});

		}
		$scope.filterNone = filterNone;

		var filterHotelsById = function(id) {
			$scope.filteredList = true;
			if (typeof id === "undefined") {
				return filterNone();
			}
			$scope.$apply(function() {

				for (var i = 0; i < $scope.hotels.length; i++) {
					$scope.hotels[i].hide = ($scope.hotels[i].id != id);
				}
			});
		};

		var updateHotels = function(hotels) {
			$scope.notFound = false;
			if (typeof hotels === "undefined") {
				return;
			}
			angular.forEach(hotels, function(d, i) {
				d.service = 'yipit';
				d.hide = (typeof d.hide === "undefined") ? false : d.hide;

				d.inPlan = false;

				var dList = plan.getHotels();
				/* check if this parking is in the plan */
				if (typeof dList !== "undefined" && typeof dList[0] !== "undefined") {

					/* there's hotels in the plan - check if its this one */
					for (var i = 0; i < dList.length; i++) {
						var r = dList[i];
						if ((r.hotel.service === 'yipit') && (r.hotel.id == d.id)) {
							d._id = r._id;
							d.purchased = r.purchased;
							d.inPlan = true;
						}
					};
				}

				if (!googleMap.hasMarker(d.business.locations[0].lat, d.business.locations[0].lon)) {
					mapMarker.create(googleMap, {
						icon: "/images/icons/map-icons/entertainment/hotel_0star.png",
						lat: d.business.locations[0].lat,
						lng: d.business.locations[0].lon,
						name: d.title,
						body: d.business.name,
						click: {
							on: function() {
								filterHotelsById(d.id)
							},
							off: function() {
								filterHotelsById()
							}
						}
					});
				}
			});
		};

		var updateGoogleHotels = function(googleHotels) {
			$scope.notFound = false;
			if (typeof googleHotels === "undefined") {
				return;
			}
			console.log(googleHotels);
			angular.forEach(googleHotels, function(place, i) {
				place.service = 'google';
				place.hide = (typeof place.hide === "undefined") ? false : place.hide;

				/* assume its not in the plan until we figure out otherwise */
				place.inPlan = false;

				var hList = plan.getHotels();
				/* check if this parking is in the plan */
				if (typeof hList !== "undefined" && typeof hList[0] !== "undefined") {

					/* there's parking in the plan - check if its this one */
					for (var i = 0; i < hList.length; i++) {
						var h = hList[i];
						if ((h.hotel.service === 'google') && (h.hotel.id == place.id)) {
							place._id = h._id;
							place.inPlan = true;
						}
					};
				}

				if (!googleMap.hasMarker(place.geometry.location.lat(), place.geometry.location.lng())) {
					mapMarker.create(googleMap, {
						icon: "/images/icons/map-icons/entertainment/hotel_0star.png",
						position: place.geometry.location,
						name: place.name,
						body: place.vicinity
					});
				}
			});
		};

		$scope.$on('hotels-changed', function(e, args) {
			$timeout(function() {
				return updateHotels($scope.hotels);
			});
			$timeout(function() {
				return updateGoogleHotels($scope.googleHotels);
			});
		});

		/* watch for parkingReservations (right now its just parkwhiz) */
		$scope.$watch('hotels', function(hotels) {
			/* make markers & infoWindows for these and add them to the map */
			if (!hotels) {
				return;
			};
			$timeout(function() {
				return updateHotels(hotels);
			});
		});

		$scope.$watch('googleHotels', function(googleHotels) {
			/* make markers & infoWindows for these and add them to the map */
			if (!googleHotels) {
				return;
			};
			$timeout(function() {
				return updateGoogleHotels(googleHotels);
			})
		});

		$scope.$watch('addonsFetched', function(n, o) {
			/* all 2 providers are fetched */
			if (n && n > 0) {
				$scope.addonsFetched = 0;
				/* hide the overlay */
	      overlay.loading(false);
  	    overlay.hide();
		  	//googleMap.resize();
			}
		});

		var initMap = function(p) {
			var lat = p.venue.data.geocode.geometry.location.lat;
			var lng = p.venue.data.geocode.geometry.location.lng;

			/* set the height for the container that will hold the parking list */
      $('.addons-list-col').css("height", $($window).height() - 111);

			/* put the venue on the map */
			mapVenue.create(googleMap, {
				lat: lat,
				lng: lng,
				name: p.event.eventVenue,
				street: p.venue.data.Street1,
				city: p.event.eventCity,
				state: p.event.eventState
			});


			wembliHotels.fetchGoogleHotels({lat:lat,lng:lng}, function(err, h) {
				$scope.$apply(function() {
					$scope.googleHotels = h;
					$scope.addonsFetched++;
				});
			});

			/* not supported yet
			wembliHotels.fetchHotels({lat:lat,lng:lng}, function(err, r) {
				$timeout(function() {
					$scope.$apply(function() {
						$scope.hotels = r;
						$scope.addonsFetched++;
					});
				});
			});
			*/
		};

		var addHotel = function(r) {
      var payment = {};

      if (r.service !== 'yipit') {
        payment.receipt = {
          "not-available": true
        };
      }

      wembliRpc.fetch('plan.addHotel', {
        service: r.service,
        eventId: plan.get().event.eventId,
        hotel: r,
        total: 0,
        payment: JSON.stringify(payment)
      }, function(err, result) {
      	console.log('added hotel:');
      	console.log(err,result);
      	/* TODO: check to make sure result is success */
        r._id     = result.hotel._id;
      	r.inPlan  = true;
        $scope.currentHotel = r;

        /* if payment type is split-first just go straight to the options page */
        if ($scope.plan.preferences.payment === 'split-first') {
          $scope.hotelConfirm = true;
          overlay.show();
        } else {
        	/* TODO: make sure we don't try to buy google places off site */
          /* offsite - wait then show the slidedown */
          var Promise = $timeout(function() {
            $rootScope.$apply(function() {
              $scope.buyHotelOffsite = true;
              overlay.show();
            });
          }, 1500);
        }

      });
		};

		$scope.addHotel = function(idx) {
      var hotel = $scope.hotels[idx];
      console.log(hotel);
      /* angularjs hack */
      delete hotel["$$hashKey"];
      addHotel(hotel);
		};

		/* add google hotel (not implemented) */
		$scope.addGoogleHotel = function(idx) {
      var hotel = $scope.googleHotels[idx];
      /* angularjs hack */
      delete hotel["$$hashKey"];

			/* get the place details */
			googlePlaces.getDetails(hotel.reference, function(place, status) {
				if (status == google.maps.places.PlacesServiceStatus.OK) {
					$scope.$apply(function() {
						$scope.hotelDetails = place;
			      addHotel(hotel);
					});
				}
			});
		};

		$scope.removeHotel = function() {
			var hotelId = $scope.currentHotel._id;
			if (!hotelId) {
				$scope.hotelConfirm = false;
        $scope.buyHotelOffsite = false;
        overlay.hide();
        return;
			}

			/* remove the hotel and close the modal */
			plan.removeHotel({
				hotelId: hotelId
			}, function(err, results) {
        /* no longer interested in this parking */
        if ($scope.currentHotel) {
        	delete $scope.currentHotel;
        }

        /* hide the slide down popover */
        if ($scope.buyHotelOffsite) {
          $scope.buyHotelOffsite = false;
          overlay.hide();
        }
        if ($scope.hotelConfirm) {
          $scope.hotelConfirm = false;
          overlay.hide();
        }

        plan.setHotels(results.hotel);

				$rootScope.$broadcast('hotels-changed');

			});
		};

    $scope.boughtHotel = function() {

      if (typeof $scope.currentHotel == "undefined") {
        $window.location.href = $scope.nextLink;
        return;
      }

			/* update the parking to have a receipt because parkwhiz doesn't give us a pixel yet */
			plan.addHotelReceipt({
				hotelId: $scope.currentHotel._id,
				service: $scope.currentHotel.service,
				receipt: {
					qty: $scope.currentHotel.selectedQty,
					amountPaid: $scope.currentHotel.amountPaid
				}
			}, function(err, result) {

        googleAnalytics.trackEvent('Plan', 'boughtHotel', $scope.plan.event.eventName, '', function(err, result) {
          /* go to the next page which depends on whether they are splitting with friends or paying themself */
          $window.location.href = $scope.nextLink;
        });

			});

    }

    $rootScope.$on('overlay-clicked', function() {
      $scope.removeHotel($scope.currentHotel._id);
    });

		plan.get(function(p) {

			$scope.context = plan.getContext() || 'visitor';

      $scope.backToPlan = false;
      /* if organizer rsvp not null then go back to plan */
      if (p.organizer.rsvp.decision !== null) {
        $scope.backToPlan = true;
      }
      $scope.nextLink = $scope.backToPlan ? "/plan" : "/event-options/" + p.event.eventId + '/' + p.event.eventName;
      $scope.nextText = $scope.backToPlan ? "Ok, Back To Plan Dashboard" : "Continue To Plan Preferences";

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
	}
]).


controller('RestaurantsCtrl', ['$rootScope', '$scope', '$timeout', 'plan', 'wembliRestaurants', 'wembliRpc', 'googleMap', 'googlePlaces', 'mapVenue', 'mapMarker', 'mapInfoWindowContent', 'overlay', '$location','$window', 'googleAnalytics', 'header',
	function($rootScope, $scope, $timeout, plan, wembliRestaurants, wembliRpc, googleMap, googlePlaces, mapVenue, mapMarker, mapInfoWindowContent, overlay, $location, $window, googleAnalytics, header) {
		/* tell the header not to disappear on scroll */
		header.fixed();

		/* get the spots for this lat long and display them as markers */
		googleMap.init();
		$scope.currentPath   = $location.path();
		$scope.addonsFetched = 0;
		$scope.filteredList  = false;
		$scope.notFound      = true;

		$scope.parseDate = function(d) {
			return new Date(d);
		}

		$scope.determineDistance = function(feet) {
			return parseFloat(feet / 5280).toFixed(2);
		}

		var filterNone = function() {
			$scope.filteredList = false;
			$timeout(function() {
				$scope.$apply(function() {
					for (var i = 0; i < $scope.deals.length; i++) {
						$scope.deals[i].hide = false;
					};
				});
			});

		}
		$scope.filterNone = filterNone;

		var filterDealsById = function(id) {
			$scope.filteredList = true;
			if (typeof id === "undefined") {
				return filterNone();
			}
			$scope.$apply(function() {

				for (var i = 0; i < $scope.deals.length; i++) {
					$scope.deals[i].hide = ($scope.deals[i].id != id);
				}
			});
		};

		var updateDeals = function(deals) {
			$scope.notFound = false;
			if (typeof deals === "undefined") {
				return;
			}
			angular.forEach(deals, function(d, i) {
				d.service = 'yipit';
				d.hide = (typeof d.hide === "undefined") ? false : d.hide;

				d.inPlan = false;

				var dList = plan.getRestaurants();
				/* check if this parking is in the plan */
				if (typeof dList !== "undefined" && typeof dList[0] !== "undefined") {

					/* there's deals in the plan - check if its this one */
					for (var i = 0; i < dList.length; i++) {
						var r = dList[i];
						if ((r.restaurant.service === 'yipit') && (r.restaurant.id == d.id)) {
							d._id = r._id;
							d.purchased = r.purchased;
							d.inPlan = true;
						}
					};
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

		var updateGoogleRestaurants = function(googleRestaurants) {
			$scope.notFound = false;
			if (typeof googleRestaurants === "undefined") {
				return;
			}

			angular.forEach(googleRestaurants, function(place, i) {
				place.service = 'google';
				place.hide = (typeof place.hide === "undefined") ? false : place.hide;

				/* assume its not in the plan until we figure out otherwise */
				place.inPlan = false;

				var dList = plan.getRestaurants();
				/* check if this parking is in the plan */
				if (typeof dList !== "undefined" && typeof dList[0] !== "undefined") {

					/* there's parking in the plan - check if its this one */
					for (var i = 0; i < dList.length; i++) {
						var r = dList[i];
						if ((r.restaurant.service === 'google') && (r.restaurant.id == place.id)) {
							place._id = r._id;
							place.inPlan = true;
						}
					};
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

		$scope.$watch('addonsFetched', function(n, o) {
			/* all 2 providers are fetched */
			if (n && n > 0) {
				$scope.addonsFetched = 0;
				/* hide the overlay */
	      overlay.loading(false);
  	    overlay.hide();
		  	//googleMap.resize();
			}
		});

		var initMap = function(p) {
			var lat = p.venue.data.geocode.geometry.location.lat;
			var lng = p.venue.data.geocode.geometry.location.lng;

			/* set the height for the container that will hold the parking list */
      $('.addons-list-col').css("height", $($window).height() - 111);

			/* put the venue on the map */
			mapVenue.create(googleMap, {
				lat: lat,
				lng: lng,
				name: p.event.eventVenue,
				street: p.venue.data.Street1,
				city: p.event.eventCity,
				state: p.event.eventState
			});


			/* no google restaurants for now until we figure how to fit it in with deals */
			/*
			wembliRestaurants.fetchGoogleRestaurants(args, function(err, r) {
				$scope.$apply(function() {
					$scope.googleRestaurants = r;
					$scope.addonsFetched++;
				});
			});
			*/
			wembliRestaurants.fetchDeals({lat:lat,lng:lng}, function(err, r) {
				$timeout(function() {
					$scope.$apply(function() {
						$scope.deals = r;
						$scope.addonsFetched++;
					});
				});
			});
		};

		var addRestaurant = function(r) {
      var payment = {};

      if (r.service !== 'yipit') {
        payment.receipt = {
          "not-available": true
        };
      }

      wembliRpc.fetch('plan.addRestaurant', {
        service: r.service,
        eventId: plan.get().event.eventId,
        restaurant: r,
        total: 0,
        payment: JSON.stringify(payment)
      }, function(err, result) {
      	console.log('added restaurant:');
      	console.log(result);
      	/* TODO: check to make sure result is success */
        r._id     = result.restaurant._id;
      	r.inPlan  = true;
        $scope.currentDeal = r;
        /* if payment type is split-first just go straight to the options page */
        if ($scope.plan.preferences.payment === 'split-first') {
          $scope.restaurantConfirm = true;
          overlay.show();
        } else {
          /* offsite - wait then show the slidedown */
          var Promise = $timeout(function() {
            $rootScope.$apply(function() {
              $scope.buyDealOffsite = true;
              overlay.show();
            });
          }, 1500);
        }

      });
		};

		$scope.addDeal = function(idx) {
      var deal = $scope.deals[idx];
      console.log(deal);
      /* angularjs hack */
      delete deal["$$hashKey"];
      addRestaurant(deal);
		};

		/* add google restaurant (not implemented) */
		$scope.addGoogleRestaurant = function(idx) {
      var parking              = $scope.googleParking[idx];
      /* angularjs hack */
      delete parking["$$hashKey"];

			/* get the place details */
			googlePlaces.getDetails(parking.reference, function(place, status) {
				if (status == google.maps.places.PlacesServiceStatus.OK) {
					$scope.$apply(function() {
						$scope.parkingDetails = place;
			      addParking(parking);
					});
				}
			});
		};

		$scope.removeDeal = function() {
			var dealId = $scope.currentDeal._id;

			if (!dealId) {
				$scope.restaurantConfirm = false;
        $scope.buyDealOffsite = false;
        overlay.hide();
        return;
			}

			/* remove the restaurant and close the modal */
			plan.removeRestaurant({
				restaurantId: dealId
			}, function(err, results) {
        /* no longer interested in this parking */
        if ($scope.currentDeal) {
        	delete $scope.currentDeal;
        }

        /* hide the slide down popover */
        if ($scope.buyDealOffsite) {
          $scope.buyDealOffsite = false;
          overlay.hide();
        }
        if ($scope.restaurantConfirm) {
          $scope.restaurantConfirm = false;
          overlay.hide();
        }

        plan.setRestaurants(results.restaurant);

				$rootScope.$broadcast('restaurants-changed');

			});
		};

    $scope.boughtDeal = function() {

      if (typeof $scope.deal == "undefined") {
        $window.location.href = $scope.nextLink;
        return;
      }

			/* update the parking to have a receipt because parkwhiz doesn't give us a pixel yet */
			plan.addRestaurantReceipt({
				restaurantId: $scope.currentDeal._id,
				service: $scope.currentDeal.service,
				receipt: {
					qty: $scope.currentDeal.selectedQty,
					amountPaid: $scope.currentDeal.amountPaid
				}
			}, function(err, result) {

        googleAnalytics.trackEvent('Plan', 'boughtDeal', $scope.plan.event.eventName, '', function(err, result) {
          /* go to the next page which depends on whether they are splitting with friends or paying themself */
          $window.location.href = $scope.nextLink;
        });

			});

    }

    $rootScope.$on('overlay-clicked', function() {
      $scope.removeDeal($scope.currentDeal._id);
    });

		plan.get(function(p) {

			$scope.context = plan.getContext() || 'visitor';

      $scope.backToPlan = false;
      /* if organizer rsvp not null then go back to plan */
      if (p.organizer.rsvp.decision !== null) {
        $scope.backToPlan = true;
      }
      $scope.nextLink = $scope.backToPlan ? "/plan" : "/event-options/" + p.event.eventId + '/' + p.event.eventName;
      $scope.nextText = $scope.backToPlan ? "Ok, Back To Plan Dashboard" : "Continue To Plan Preferences";

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
	}
]).

controller('ParkingCtrl', ['$rootScope', '$scope', '$timeout', 'plan', 'wembliParking', 'wembliRpc', 'googleMap', 'googlePlaces', 'mapVenue', 'mapMarker', 'mapInfoWindowContent', 'overlay', '$location','$window', 'googleAnalytics', 'header',
	function($rootScope, $scope, $timeout, plan, wembliParking, wembliRpc, googleMap, googlePlaces, mapVenue, mapMarker, mapInfoWindowContent, overlay, $location, $window, googleAnalytics, header) {
		/* tell the header not to disappear on scroll */
		header.fixed();

		/* get the spots for this lat long and display them as markers */
		googleMap.init();
		$scope.currentPath = $location.path();
		$scope.parkingFetched = 0;
		$scope.notFound = true;
		$scope.filteredList = false;

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

		var filterNone = function(service) {
			$timeout(function() {
				$scope.$apply(function() {
					for (var i = 0; i < $scope.googleParking.length; i++) {
						$scope.googleParking[i].hide = false;
					};
					for (var i = 0; i < $scope.parkingReservations.parking_listings.length; i++) {
						$scope.parkingReservations.parking_listings[i].hide = false;
					};
					$scope.filteredList = false;
				});
			});
		}
		$scope.filterNone = filterNone;

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
				$scope.filteredList = true;
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
				$scope.filteredList = true;
			});

		};

		/* put the parking reservations on the map */
		var updateParkingReservations = function(parkingReservations) {
			$scope.notFound = false;
			if (typeof parkingReservations == "undefined") {
				return;
			}
			angular.forEach(parkingReservations.parking_listings, function(v, i) {
				/* this will have to be set serverside once we aggregate */
				v.service = 'pw';
				v.hide = (typeof v.hide === "undefined") ? false : v.hide;

				/* assume its not in the plan until we figure out otherwise */
				v.parkingInPlan = false;

				var pList = plan.getParking();
				/* check if this parking is in the plan */
				if (typeof pList !== "undefined" && typeof pList[0] !== "undefined") {

					/* there's parking in the plan - check if its this one */
					for (var i = 0; i < pList.length; i++) {
						var p = pList[i];
						if ((p.parking.service === 'pw') && (p.parking.listing_id == v.listing_id)) {
							v._id = p._id;
							v.purchased = p.purchased;
							v.parkingInPlan = true;
						}
					};
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

		var updateGoogleParking = function(googleParking) {
			$scope.notFound = false; //where is this used?
			if (typeof googleParking == "undefined") {
				return;
			}

			angular.forEach(googleParking, function(place, i) {
				place.service = 'google';
				place.hide = (typeof place.hide === "undefined") ? false : place.hide;

				/* assume its not in the plan until we figure out otherwise */
				place.parkingInPlan = false;

				var pList = plan.getParking();
				/* check if this parking is in the plan */
				if (typeof pList !== "undefined" && typeof pList[0] !== "undefined") {

					/* there's parking in the plan - check if its this one */
					for (var i = 0; i < pList.length; i++) {
						var p = pList[i];
						if ((p.parking.service === 'google') && (p.parking.id == place.id)) {
							place._id = p._id;
							place.parkingInPlan = true;
						}
					};
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

		$scope.$watch('parkingFetched', function(n, o) {
			/* all 2 parking providers are fetched */
			if (n && n > 1) {
				$scope.parkingFetched = 0;
				/* hide the overlay */
	      overlay.loading(false);
  	    overlay.hide();
		  	//googleMap.resize();
			}
		});

		var initMap = function(p) {
			var lat = p.venue.data.geocode.geometry.location.lat;
			var lng = p.venue.data.geocode.geometry.location.lng;

			/* set the height for the container that will hold the parking list */
      $('#parking-list > div').css("height", $($window).height() - 111);

			/* put the venue on the map */
			mapVenue.create(googleMap, {
				lat: lat,
				lng: lng,
				name: p.event.eventVenue,
				street: p.venue.data.Street1,
				city: p.event.eventCity,
				state: p.event.eventState
			});

			/* get the google parking - async */
			wembliParking.fetchGoogleParking({lat:lat,lng:lng}, function(err, p) {
				$scope.$apply(function() {
					$scope.googleParking = p;
					$scope.parkingFetched++;
				});
			});

			/* get parkwhiz parking - async */
			wembliParking.fetchParkingReservations({lat:lat,lng:lng}, function(err, p) {
				$timeout(function() {
					$scope.$apply(function() {
						$scope.parkingReservations = p;
						$scope.parkingFetched++;
					});
				});
			});
		};

		var addParking = function(parking) {
      var payment = {};

      if (parking.service !== 'pw') {
        payment.receipt = {
          "not-available": true
        };
      }

      wembliRpc.fetch('plan.addParking', {
        service: parking.service,
        eventId: plan.get().event.eventId,
        parking: parking,
        total: 0,
        payment: JSON.stringify(payment)
      }, function(err, result) {

      	/* TODO: check to make sure result is success */
        parking._id            = result.parking._id;
      	parking.parkingInPlan  = true;
        $scope.currentParking  = parking;
        console.log('parking is now current: ');
        console.log($scope.currentParking);
        /* if payment type is split-first just go straight to the options page */
        if ($scope.plan.preferences.payment === 'split-first') {
          $scope.parkingConfirm = true;
          overlay.show();
        } else {
          /* offsite - wait then show the slidedown */
          var Promise = $timeout(function() {
            $rootScope.$apply(function() {
              $scope.buyParkingOffsite = true;
              overlay.show();
            });
          }, 1500);
        }

      });
		};

		$scope.addParkingReservations = function(idx) {
      var parking              = $scope.parkingReservations.parking_listings[idx];
      console.log('add parking res: ');
      console.log(parking);
      /* angularjs hack */
      delete parking["$$hashKey"];
      addParking(parking);
		};

		$scope.addGoogleParking = function(idx) {
      var parking              = $scope.googleParking[idx];
      /* angularjs hack */
      delete parking["$$hashKey"];

			/* get the place details */
			googlePlaces.getDetails(parking.reference, function(place, status) {
				if (status == google.maps.places.PlacesServiceStatus.OK) {
					$scope.$apply(function() {
						$scope.parkingDetails = place;
			      addParking(parking);
					});
				}
			});
		};

		$scope.removeParking = function() {
			var parkingId = $scope.currentParking._id;
			if (!parkingId) {
				$scope.parkingConfirm = false;
        $scope.buyParkingOffsite = false;
        overlay.hide();
        return;
			}

			/* remove the parking and close the modal */
			plan.removeParking({
				parkingId: parkingId
			}, function(err, results) {
        /* no longer interested in this parking */
        if ($scope.currentParking) {
        	delete $scope.currentParking;
        }

        if ($scope.parkingDetails) {
        	delete $scope.parkingDetails;
        }

        /* hide the slide down popover */
        if ($scope.buyParkingOffsite) {
          $scope.buyParkingOffsite = false;
          overlay.hide();
        }
        if ($scope.parkingConfirm) {
          $scope.parkingConfirm = false;
          overlay.hide();
        }

        plan.setParking(results.parking);

				$rootScope.$broadcast('parking-changed', {
					parking: results.parking
				});
			});
		};

    $scope.boughtParking = function() {

      if (typeof $scope.currentParking == "undefined") {
        $window.location.href = $scope.nextLink;
        return;
      }

			/* update the parking to have a receipt because parkwhiz doesn't give us a pixel yet */
			plan.addParkingReceipt({
				parkingId: $scope.currentParking._id,
				service: $scope.currentParking.service,
				receipt: {
					qty: $scope.currentParking.selectedQty,
					amountPaid: $scope.currentParking.amountPaid
				}
			}, function(err, result) {

        googleAnalytics.trackEvent('Plan', 'boughtParking', $scope.plan.event.eventName, '', function(err, result) {
          /* go to the next page which depends on whether they are splitting with friends or paying themself */
          $window.location.href = $scope.nextLink;
        });

			});

    }

    $rootScope.$on('overlay-clicked', function() {
      $scope.removeParking($scope.currentParking._id);
    });

		plan.get(function(p) {

			$scope.context = plan.getContext() || 'visitor';

      $scope.backToPlan = false;
      /* if organizer rsvp not null then go back to plan */
      if (p.organizer.rsvp.decision !== null) {
        $scope.backToPlan = true;
      }
      $scope.nextLink = $scope.backToPlan ? "/plan" : "/event-options/" + p.event.eventId + '/' + p.event.eventName;
      $scope.nextText = $scope.backToPlan ? "Ok, Back To Plan Dashboard" : "Continue To Plan Preferences";

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


		/* display a modal when they click to go off and buy tickets
		fetchModals.fetch('/partials/modals/parking-modals', function(err) {
			if (err) {
				return;
			}

		});
		*/
	}
]);

