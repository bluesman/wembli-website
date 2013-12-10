angular.module('wembliApp.services.google', []).


/* google */
factory('googleMap', ['$rootScope',
	function($rootScope) {
		var self = this;
		var centerOffset = {
			lat: -0.002,
			lng: 0.01
		}

		self._markers = [];
		self._infoWindows = [];
		self._map = null;

		/* state */
		self.drawn = false;
		self.dragging = false;
		self.zoom = 14;
		self.center = new google.maps.LatLng(32.722439302963, -117.1645658798);

		var mapDefaults = {
			center: self.center,
			zoom: self.zoom,
			draggable: true,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		function floatEqual(f1, f2) {
			return (Math.abs(f1 - f2) < 0.000001);
		}

		return {
			/* clear the googleMap state so a new map can be drawn */
			init: function() {
				self._markers = [];
				self._infoWindows = [];
				self._map = null;

				/* state */
				self.drawn = false;
				self.dragging = false;
				self.zoom = 14;
				self.center = new google.maps.LatLng(32.722439302963, -117.1645658798);
			},
			/* create a google map instance */
			draw: function(element, options, handlers) {
				var o = angular.extend(mapDefaults, options);
				/* apply the center offset */
				var lat = o.center.lat() + centerOffset.lat;
				var lng = o.center.lng() + centerOffset.lng;
				o.center = new google.maps.LatLng(lat, lng);

				/* instantiate a new google map */
				self._map = new google.maps.Map(element[0], o);

				google.maps.event.addListener(self._map, "dragstart", function() {
					self.dragging = true;
				});

				google.maps.event.addListener(self._map, "idle", function() {
					self.dragging = false;
				});

				google.maps.event.addListener(self._map, "drag", function() {
					self.dragging = true;
				});

				google.maps.event.addListener(self._map, "zoom_changed", function() {
					self.zoom = self._map.getZoom();
					self.center = self._map.getCenter();
				});

				google.maps.event.addListener(self._map, "center_changed", function() {
					self.center = self._map.getCenter();
				});

				// Attach additional event listeners if needed
				if (typeof handlers !== "undefined" && handlers.length) {
					angular.forEach(handlers, function(h, i) {
						google.maps.event.addListener(self._map, h.on, h.handler);
					});
				}
				self.drawn = true;
				$rootScope.$broadcast('google-map-drawn');
			},
			isDrawn: function(val) {
				if (typeof val !== "undefined") {
					self.drawn = val;
				}
				return self.drawn;
			},
			getMap: function() {
				return self._map;
			},
			/* add markers to the map */
			addMarker: function(marker) {
				self._markers.unshift(marker);
				return marker;
			},
			findMarker: function(lat, lng) {
				for (var i = 0; i < self._markers.length; i++) {
					var pos = self._markers[i].getPosition();
					if (floatEqual(pos.lat(), lat) && floatEqual(pos.lng(), lng)) {
						return self._markers[i];
					}
				}
				return null;
			},
			hasMarker: function(lat, lng) {
				return this.findMarker(lat, lng) !== null;
			},

			removeMarker: function(lat, lng) {

			},
			addInfoWindow: function(infoWindow, marker) {
				var win = {
					infoWindow: infoWindow,
					open: false
				}
				if (typeof infoWindow === "undefined") {
					return;
				}

				if (typeof marker === "undefined") {
					return;
				}

				if (typeof infoWindow.getPosition() === "undefined") {
					return;
				}

				if (typeof marker.getPosition() === "undefined") {
					return;
				}


				if ((typeof marker !== "undefined") && (typeof marker.getPosition() !== "undefined")) {
					win.lat = marker.getPosition().lat();
					win.lng = marker.getPosition().lng();
				} else {
					win.lat = infoWindow.getPosition().lat();
					win.lng = infoWindow.getPosition().lng();
				}
				self._infoWindows.unshift(win);
				return win;
			},
			_findInfoWindow: function(lat, lng) {
				for (var i = 0; i < self._infoWindows.length; i++) {
					var winLat = self._infoWindows[i].lat;
					var winLng = self._infoWindows[i].lng;
					if (floatEqual(winLat, lat) && floatEqual(winLng, lng)) {
						return self._infoWindows[i];
					}
				}
				return null;
			},
			findInfoWindow: function(lat, lng) {
				var win = this._findInfoWindow(lat, lng);
				return (win) ? win.infoWindow : null;
			},
			/* check if the infoWindow for a marker is open */
			isInfoWindowOpen: function(marker) {
				var lat = marker.getPosition().lat();
				var lng = marker.getPosition().lng();
				var win = this._findInfoWindow(lat, lng);
				return (win) ? win.open : false;
			},
			closeInfoWindow: function(marker) {
				var lat = marker.getPosition().lat();
				var lng = marker.getPosition().lng();
				var win = this._findInfoWindow(lat, lng);
				win.open = false;
				win.infoWindow.close();
			},
			openInfoWindow: function(marker) {
				var lat = marker.getPosition().lat();
				var lng = marker.getPosition().lng();
				var win = this._findInfoWindow(lat, lng);
				if (win) {
					win.open = true;
					win.infoWindow.open(self._map, marker);
				}
			},
			resize: function() {
				google.maps.event.trigger(self._map, 'resize');
				$rootScope.$broadcast('google-map-resize');
			}

		};

	}
]).

/* google */
factory('googlePlaces', ['googleMap',
	function(googleMap) {
		return {
			getParking: function(lat, lng, radius, callback) {
				/* get all the google parking nearby and add it to the scope */
				var request = {
					location: new google.maps.LatLng(lat, lng),
					radius: radius,
					types: ['parking']
				};

				var service = new google.maps.places.PlacesService(googleMap.getMap());

				service.nearbySearch(request, callback);

			},
			getRestaurants: function(lat, lng, radius, callback) {
				/* get all the google parking nearby and add it to the scope */
				var request = {
					location: new google.maps.LatLng(lat, lng),
					radius: radius,
					types: ['restaurant']
				};

				var service = new google.maps.places.PlacesService(googleMap.getMap());

				service.nearbySearch(request, callback);

			},
			getHotels: function(lat, lng, radius, callback) {
				/* get all the google parking nearby and add it to the scope */
				var request = {
					location: new google.maps.LatLng(lat, lng),
					radius: radius,
					types: ['lodging']
				};

				var service = new google.maps.places.PlacesService(googleMap.getMap());

				service.nearbySearch(request, callback);

			},

			getDetails: function(reference, callback) {
				var request = {
					reference: reference
				};
				var service = new google.maps.places.PlacesService(googleMap.getMap());
				service.getDetails(request, callback);
			}


		};
	}
]).

/* google */
factory('mapMarker', ['mapInfoWindowContent',
	function(mapInfoWindowContent) {
		return {
			create: function(googleMap, args) {


				var markerArgs = {
					map: googleMap.getMap()
				};

				var position;
				if (typeof args.position !== "undefined") {
					position = args.position;
				}

				if ((typeof args.lat !== "undefined") && (typeof args.lng !== "undefined")) {
					position = new google.maps.LatLng(args.lat, args.lng);
				}

				markerArgs.position = position;

				/* make a marker */
				var marker = new google.maps.Marker(markerArgs);
				marker.setIcon(args.icon);
				marker.setAnimation(google.maps.Animation.DROP);

				/* infoWindow for the marker */
				var win = new google.maps.InfoWindow({
					position: position,
					content: mapInfoWindowContent.create({
						header: args.name,
						body: args.body
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

				if (typeof args.click !== "undefined") {
					google.maps.event.addListener(marker, 'click', function() {
						if (googleMap.isInfoWindowOpen(marker)) {
							args.click.on();
						} else {
							args.click.off();
						}
					});
				}

				/* put the marker on the map */
				googleMap.addMarker(marker);
				/* put the infoWindow on the map */
				googleMap.addInfoWindow(win, marker);

			}
		};

	}
]).

/* google */
factory('mapVenue', ['mapInfoWindowContent',
	function(mapInfoWindowContent) {
		return {
			create: function(googleMap, args) {

				var position;
				if (typeof args.position !== "undefined") {
					position = args.position;
				}

				if ((typeof args.lat !== "undefined") && (typeof args.lng !== "undefined")) {
					position = new google.maps.LatLng(args.lat, args.lng);
				}

				/* make a marker for the venue */
				var marker = new google.maps.Marker({
					map: googleMap.getMap(),
					position: position
				});
				marker.setIcon("/images/icons/map-icons/sports/stadium.png");
				marker.setAnimation(google.maps.Animation.DROP);

				/* infoWindow for the venue marker */
				var win = new google.maps.InfoWindow({
					position: position,
					content: mapInfoWindowContent.create({
						header: args.name,
						body: args.street + ', ' + args.city + ', ' + args.state
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


			}
		};

	}
]).

/* google */
factory('mapInfoWindowContent', [
	function() {
		return {
			create: function(args) {
				var html = '<div class="info-window">';
				html += '<h3 class="info-window-header">' + args.header + '</h3>';
				html += '<div class="info-window-body">' + args.body + '</div>';
				html += '</div>';
				return html;
			}
		};

	}
]);
