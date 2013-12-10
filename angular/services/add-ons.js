angular.module('wembliApp.services.add-ons', []).

/* add-ons */
factory('parking', ['wembliRpc', 'googlePlaces',
	function(wembliRpc, googlePlaces) {
		var self = this;
		self.googleParking = null;
		self.parkingReservations = null;

		return {
			getGoogleParking: function() {
				return self.googleParking;
			},
			getParkingReservations: function() {
				return self.parkingReservations;
			},
			setGoogleParking: function(p) {
				self.googleParking = p;
			},
			setParkingReservations: function(p) {
				self.parkingReservations = p;
			},
			fetchGoogleParking: function(args, callback) {
				args.radius = args.radius || 5000; /* meters, little over 3 miles */

				googlePlaces.getParking(args.lat, args.lng, args.radius, function(results, status) {
					if (status == google.maps.places.PlacesServiceStatus.OK) {
						self.googleParking = results;
					}
					callback(null, self.googleParking);
				});

			},
			fetchParkingReservations: function(args, callback) {
				/* get parking from parkwhiz and update scope */
				wembliRpc.fetch('event.getParking', {
					lat: args.lat,
					lng: args.lng,
					radius: args.radius
					//start: start, //optional
					//end: end //optional
				}, function(err, result) {

					if (err) {
						//handle err
						alert('error happened - contact help@wembli.com');
						return;
					}

					if (typeof result.parking !== "undefined") {
						self.parkingReservations = result.parking;
					}
					callback(null, self.parkingReservations);
				});
			}
		};
	}
]).

/* add-ons */
factory('restaurants', ['wembliRpc', 'googlePlaces',
	function(wembliRpc, googlePlaces) {
		var self = this;
		self.googleRestaurants = null;
		self.deals = null;

		return {
			getGoogleRestaurants: function() {
				return self.googleRestaurants;
			},
			getDeals: function() {
				return self.deals;
			},
			setGoogleRestaurants: function(r) {
				self.googleRestaurants = r;
			},
			setDeals: function(r) {
				self.deals = r;
			},
			fetchGoogleRestaurants: function(args, callback) {
				args.radius = args.radius || 5000; /* meters, little over 3 miles */

				googlePlaces.getRestaurants(args.lat, args.lng, args.radius, function(results, status) {
					if (status == google.maps.places.PlacesServiceStatus.OK) {
						self.googleRestaurants = results;
					}
					callback(null, self.googleRestaurants);
				});

			},
			fetchDeals: function(args, callback) {
				/* get parking from parkwhiz and update scope */
				wembliRpc.fetch('event.getRestaurantDeals', {
					lat: args.lat,
					lng: args.lng,
					radius: args.radius
				}, function(err, result) {

					if (err) {
						//handle err
						alert('error happened - contact help@wembli.com');
						return;
					}

					if (typeof result.deals !== "undefined") {
						self.deals = result.deals;
					}
					callback(null, self.deals);
				});
			}
		};
	}
]).

/* add-ons */
factory('hotels', ['wembliRpc', 'googlePlaces',
	function(wembliRpc, googlePlaces) {
		var self = this;
		self.googleHotels = null;
		self.expediaHotels = null;

		return {
			getGoogleHotels: function() {
				return self.googleHotels;
			},
			getExpediaHotels: function() {
				return self.expediaHotels;
			},
			setGoogleHotels: function(h) {
				self.googleHotels = h;
			},
			setExpediaHotels: function(p) {
				self.expediaHotels = p;
			},
			fetchGoogleHotels: function(args, callback) {
				args.radius = args.radius || 5000; /* meters, little over 3 miles */

				googlePlaces.getHotels(args.lat, args.lng, args.radius, function(results, status) {
					if (status == google.maps.places.PlacesServiceStatus.OK) {
						self.googleHotels = results;
					}
					callback(null, self.googleHotels);
				});

			},
			fetchExpediaHotels: function(args, callback) {
				/* get parking from parkwhiz and update scope */
				wembliRpc.fetch('event.getHotels', {
					lat: args.lat,
					lng: args.lng,
					radius: args.radius
				}, function(err, result) {

					if (err) {
						//handle err
						alert('error happened - contact help@wembli.com');
						return;
					}

					if (typeof result.hotels !== "undefined") {
						self.expediaHotels = result.hotels;
					}
					callback(null, self.expediaHotels);
				});
			}
		};
	}
]);
