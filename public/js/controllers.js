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

function IndexCtrl($scope, $location, $window, $templateCache, wembliRpc, fetchModals) {
	//clear the cache when the home page loads to make sure we start fresh
	$templateCache.removeAll();

	/*
	$scope.startPlan = function() {
			if ($location.path() !== '/index') {
				$location.path('/index');
			}
		$('#payment-type-modal').modal('show');
	}

	$scope.$on('payment-type-modal-fetched', function(e, args) {
		if ($location.hash() === "payment-type-modal") {
			console.log('path'+$location.path());
			$('#payment-type-modal').modal('show');
		}
	});
	*/

	/* this doesn't do anything right now
	wembliRpc.fetch('index.init', {},
	function(err, result) {

	});
	*/
};

/*
 * Confirm Email Controller
 */

function ConfirmCtrl($scope, wembliRpc) {
	wembliRpc.fetch('confirm.init', {},
	//response

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
	$scope.continue = function() {
		//fetchModals.fetch('/invitation');
		console.log('next: '+$scope.next);
		$location.path($scope.next);
	}
};



/*
 * Event List Controller
 */

function EventListCtrl($scope, $location, wembliRpc, $filter, $rootScope, plan, fetchModals) {
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
			console.log('back from event.search');
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
		},

		function(data, headersGetter) {
			$('#page-loading-modal').modal("hide");
			$rootScope.genericLoadingModal.header = 'Loading Event Search...';
			$('#generic-loading-modal').modal("show");
			return data;
		},

		function(data, headersGetter) {
			console.log('hide generic loading modal');
			$('#generic-loading-modal').modal("hide");
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


function ParkingCtrl($rootScope, $scope, $timeout, plan, wembliRpc, googleMap, mapInfoWindowContent) {
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

	console.log('setting watch for parkingReservations');
	/* watch for parkingReservations (right now its just parkwhiz) */
	$scope.$watch('parkingReservations', function(parking) {
		/* make markers & infoWindows for these and add them to the map */
		if (!parking) {
			return;
		};

		$scope.notFound = false;

		$timeout(function() {
			angular.forEach(parking.parking_listings, function(v, i) {
				console.log('parking reservation listing:');
				console.log(v);

				if (!googleMap.hasMarker(v.lat, v.lng)) {

					var marker = new google.maps.Marker({
						position: new google.maps.LatLng(v.lat, v.lng),
						map: googleMap.getMap(),
					});
					marker.setIcon("/images/icons/map-icons/transportation/parkinggarage.png");
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

	console.log('setting watch for googleParking');
	var deregGP = $scope.$watch('googleParking', function(parking) {
		console.log('googleParking changed: ');
		console.log(parking);
		/* make markers & infoWindows for these and add them to the map */
		if (!parking) {
			console.log('googleParking outa here');
			return;
		};

		console.log('notfound is false');
		$scope.notFound = false;

		$timeout(function() {
			angular.forEach(parking, function(place, i) {
				console.log('google parking item:');
				console.log(place);


				//if (!googleMap.hasMarker(place.geometry.location.lat(), place.geometry.location.lng())) {
				console.log(place);
				var marker = new google.maps.Marker({
					map: googleMap.getMap(),
					position: place.geometry.location,
				});
				marker.setIcon("/images/icons/map-icons/transportation/parkinggarage.png");
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

	function getParking(p) {
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

		/* get all the google parking nearby and add it to the scope */
		var request = {
			location: new google.maps.LatLng(lat, lng),
			radius: 1500,
			types: ['parking']
		};
		var service = new google.maps.places.PlacesService(googleMap.getMap());
		service.nearbySearch(request, function(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				console.log('got googleParking results');
				console.log(results);
				$scope.$apply(function() {
					$scope.googleParking = results;
				});
			}
		});

		/* get parking from parkwhiz and update scope */
		wembliRpc.fetch('event.getParking', {
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

			$('#generic-loading-modal').modal("hide");

			console.log('results from event.getParking');
			$timeout(function() {
				$scope.$apply(function() {
					$scope.parkingReservations = result.parking;
				});
			});
			var minParkingPrice = result.parking.min_price;
			var maxParkingPrice = result.parking.max_price;

			var initSlider = function() {
				/*Set Minimum and Maximum Price from your Dataset*/
				$("#price-slider").slider("option", "min", minParkingPrice);
				$("#price-slider").slider("option", "max", maxParkingPrice);
				$("#price-slider").slider("option", "values", [minParkingPrice, maxParkingPrice]);
				$("#amount").val("$" + minParkingPrice + " - $" + maxParkingPrice);
			};

			var filterParking = function() {
				var priceRange = $("#price-slider").slider("option", "values");

				/* hide parking locations that are out of range */
				console.log('filtering parking');
			};

			//set the height of the map-container to the window height
			//$('#map-container').css("height", $($window).height() - 60);
			//$('#parking').css("height", $($window).height() - 60);
			//$('#map-container').css("width", $($window).width() - 480);

			$('#price-slider').slider({
				range: true,
				min: minParkingPrice,
				max: maxParkingPrice,
				step: 5,
				values: [minParkingPrice, maxParkingPrice],
				slide: function(event, ui) {
					$("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
				},
				stop: function(event, ui) {
					filterParking();
				}

			});

			var amtVal = "$" + $("#price-slider").slider("values", 0) + " - $" + $("#price-slider").slider("values", 1);
			$("#amount").val(amtVal);

			/* filter tix when the drop down changes */
			$("#quantity-filter").change(function() {
				filterParking();
			});
		},
		/* transformRequest */

		function(data, headersGetter) {

			$rootScope.genericLoadingModal.header = 'Finding Parking...';
			$('#page-loading-modal').modal("hide");
			console.log('show generic modal');
			$('#generic-loading-modal').modal("show");
			return data;
		},

		/* transformResponse */

		function(data, headersGetter) {
			return JSON.parse(data);
		});
	};


	plan.get(function(p) {
		$scope.context = plan.getContext() || 'visitor';
		$scope.backToPlan = false;
		if ($scope.context === 'friend') {
			$scope.backToPlan = true;
		}
		if (plan.getFriends().length > 0) {
			$scope.backToPlan = true;
		}

		if (googleMap.isDrawn()) {
			console.log('google map is drawn');
			getParking(p);
		} else {
			console.log('google map is not drawn');
			var dereg = $rootScope.$on('google-map-drawn', function() {
				console.log('google map is draen now');
				getParking(p);
				dereg();
			});
		}
	});
};

function PaymentTypeModalCtrl($scope) {
	$scope.$on('payment-type-modal-clicked', function(e, args) {
		$scope.$apply(function() {
			$scope.name = args.name;
			$scope.nextLink = args.nextLink;
		});
	});
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



function TicketsCtrl($scope, wembliRpc, fetchModals, plan, customer) {
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
			$scope.backToPlan = false;
			if ($scope.context === 'friend') {
				$scope.backToPlan = true;
			}
			if (plan.getFriends().length > 0) {
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

function TicketsLoginCtrl($rootScope, $scope, $location, plan, customer, wembliRpc) {
	$scope.plan = plan.get();
	$scope.$on('tickets-login-clicked', function(e, args) {
		$scope.redirectUrl = '/tickets/' + $scope.plan.event.eventId + '/' + $scope.plan.event.eventName + '/login/' + args.ticket.ID;
		$scope.ticket = args.ticket;
	});

	$scope.authActions = {
		signup: function() {
			wembliRpc.fetch('customer.signup', {
				firstName: $scope.firstName,
				lastName: $scope.lastName,
				email: $scope.email
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

function TicketsOffsiteCtrl($scope, plan) {
	$scope.plan = plan.get();
	$scope.$on('tickets-offsite-clicked', function(e, args) {
		$scope.qty = args.qty;
		$scope.amountPaid = args.amountPaid;
		$scope.eventId = args.eventId,
		$scope.sessionId = args.sessionId,
		$scope.ticketGroup = args.ticketGroup;
	})

	$scope.showButton = function() {
		return ($scope.ticketsOffsite === 'bought');
	};

	$scope.submitForm = function() {
		if ($scope.ticketGroup === null) {
			console.log('no ticket group :(');
			return;
		}

		plan.addTicketGroup({
			service: 'tn',
			ticketGroup: $scope.ticketGroup,
			qty: $scope.qty,
			total: $scope.amountPaid,
			payment: JSON.stringify({
				transactionToken: $scope.sessionId,
				amount: $scope.amountPaid,
				qty: $scope.qty
			})
		}, function(err, results) {
			console.log(results);
		});
	};

	$scope.cancelForm = function() {
		$('#tickets-offsite-modal').modal('hide');
	};

};

function VenueMapCtrl($scope, interactiveMapDefaults, plan, $filter, customer, wembliRpc) {
	plan.get(function(p) {
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
