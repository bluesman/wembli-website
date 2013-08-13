'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('wembliApp.services', []).

factory('loadingModal', ['$rootScope',
	function($rootScope) {
		var stack = 0;
		return {
			title: 'Page Loading',
			show: function(title, body) {
				if (title) {
					this.title = title;
				}
				if (body) {
					this.body = body;
				}

				/* hide any modals right now */
				if (stack == 0) {
					angular.element(".modal").modal("hide");
				}

				/* show the page loading modal */
				stack++;
				angular.element('#generic-loading-modal').modal("show");
				$rootScope.$broadcast('loading-modal-show');
			},
			hide: function() {
				stack--;
				if (stack < 1) {
					stack = 0;
					/* hide only the generic loading modal */
					$('#generic-loading-modal').modal("hide");
				}
			}
		}
	}
]).

factory('environment', ['$location',
	function($location) {
		var env = 'development';
		if (/www|www2/.test($location.host())) {
			env = 'production';
		}
		return env;
	}
]).

/* BALANCED API config settings */
factory('balancedApiConfig', ['environment',
	function(environment) {
		var config = {
			'development': {
				'balancedMarketplace': 'TEST-MPlx4ZJIAbA85beTs7q2Omz',
			},
			'production': {
				'balancedMarketplace': 'MP22BmXshSp7Q8DjgBYnKJmi',
			}
		};

		var envConfig = config[environment];
		envConfig.balancedMarketplaceUri = '/v1/marketplaces/' + envConfig.balancedMarketplace;
		return envConfig;
	}
]).

/* ticket network config */
factory('tnConfig', ['environment',
	function(environment) {
		var config = {
			'development': {
				'baseUrl': 'https://tickettransaction2.com/Checkout.aspx',
				'brokerId': 5006,
				'siteNumber': 0
			},
			'production': {
				'baseUrl': 'https://tickettransaction2.com/Checkout.aspx',
				'brokerId': 5006,
				'siteNumber': 0
			}
		};
		var envConfig = config[environment];
		envConfig.url = envConfig.baseUrl + '?brokerid=' + envConfig.brokerId + '&sitenumber=' + envConfig.siteNumber;
		return envConfig;
	}
]).

/* ticket purchase urls */
factory('ticketPurchaseUrls', ['tnConfig',
	function(tnConfig) {
		return {
			'tn': tnConfig.url
		};
	}
]).

factory('initRootScope', ['$window', '$rootScope', '$location',
	function($window, $rootScope, $location) {
		$rootScope.partial = false; //partial starts as false, indicating the the full page was loaded from server without any ajax partials
		//init some scope vars
		$rootScope.currentPath = $window.location.pathname;
		//if there is a class 'animate-in' in the doc,then set currentFrame = 2 which will make the frame animate in
		$rootScope.currentFrame = ($('#content').find('.animate-in')[0]) ? 2 : 1;

		$rootScope.pageLoadingModal = {};
		$rootScope.pageLoadingModal.header = 'Loading the next bit of awesome...';
		$rootScope.pageLoadingModal.body = 'When you can take the pebble from my hand, it will be time for you to leave.'

		$rootScope.genericLoadingModal = {};
		$rootScope.genericLoadingModal.header = 'Patience Young Grasshopper...';

		$rootScope.sequenceCompleted = true;

		//templates can't make a date for some reason
		$rootScope.getDate = function(d) {
			return new Date(d);
			//return $filter('date')(d, "MM-dd-yy");
		}

	}
]).

factory('pluralize', ['$rootScope', 'wembliRpc', 'customer',
	function($rootScope, wembliRpc, customer) {
		return function(num) {
			return (num != 1);
		};
	}
]).

factory('pluralizeWords', [
	function() {
		return {
			'person': function(number) {
				return (number == 1) ? 'person' : 'people';
			},
			'ticket': function(number) {
				return (number == 1) ? 'ticket' : 'tickets';
			},
			'guest': function(number) {
				return (number == 1) ? 'guest' : 'guests';
			}
		};
	}
]).

factory('planNav', ['$timeout', '$rootScope', '$location',
	function($timeout, $rootScope, $location) {
		var self = this;
		self.sectionsCount = 0;
		self.sectionsLoaded = -1;
		self.scrollToSection = 1;
		var planNav = {
			init: function(sectionsCount) {
				console.log('watch for section-loaded event');
				var dereg = $rootScope.$on('section-loaded', function(e, data) {
					self.sectionsLoaded++;
					console.log('sections loaded: ' + self.sectionsLoaded);
					if (self.sectionsLoaded == sectionsCount) {
						/* all the sections are loaded */
						self.sectionsLoaded = -1;
						console.log('all sections loaded');

						/* setup the scroll handler for each of the sections */
						angular.element('#content').on('scroll', function() {

							for (var i = 1; i <= sectionsCount; i++) {
								/* if the previous section has scrolled halfway
								 * and this section is not more off the screen than half the height of the section
								 * then highlight the left nav for this element
								 */
								var sectionNum = i;
								var currentId = '#section' + sectionNum;
								var prevId = '#section' + sectionNum--;
								var h = $(currentId).height();
								var prevHeight = ($(prevId).height() / 2);
								var t = $(currentId).offset().top;
								if (t <= prevHeight && t > -(h / 2)) {
									/*
									 * if the section nav that is active is not the one that should be active
									 * then make that section in active
									 */
									if ($('.plan-section-nav.active').attr('id') !== 'nav-section' + i) {
										$('.plan-section-nav.active').removeClass('active');
										$('#nav-section' + i).addClass('active');
									}
								}
							}
						});

						$('.plan-section-nav').removeClass('active');
						$('#nav-section' + (self.scrollToSection)).addClass('active');

						$timeout(function() {
							console.log('hide page loading modal');
							$('#page-loading-modal').modal("hide");
							planNav.scrollTo(self.scrollToSection);
						}, 1000);

						dereg();
					}
				});

			},
			setScrollToSection: function(sectionNumber) {
				console.l
				self.scrollToSection = sectionNumber;
			},
			setSectionsCount: function(cnt) {
				self.sectionsCount = cnt;
				return cnt;
			},

			getSectionsCount: function() {
				return self.sectionsCount;
			},

			scrollTo: function(sectionNumber) {
				/* get the heights of all the sections */
				var height = 20;
				for (var i = 1; i < sectionNumber; i++) {
					var h = $('#section' + i).height();
					height += parseInt($('#section' + i).height());
				};

				console.log('scrollToSection ' + sectionNumber);
				$('#content').animate({
					scrollTop: (height - 10)
				}, 1000, 'easeOutBack');
			}
		};
		return planNav;
	}
]).

/* plan.fetch sets plan and isLoggedIn in the $rootScope and calls customer.set() which sets customer in the root scope */
factory('plan', ['$rootScope', 'wembliRpc', 'customer', '$timeout',
	function($rootScope, wembliRpc, customer, $timeout) {
		var self = this;
		self.plan = null;
		self.tickets = null;
		self.fetchInProgress = false;
		self.getStack = 0;

		return {
			get: function(callback) {
				if (callback) {
					if (self.plan) {
						callback(self.plan);
					} else {
						self.getStack++;
						var dereg = $rootScope.$on('plan-fetched', function() {
							self.getStack--;
							if (self.getStack == 0) {
								dereg();
							}
							callback(self.plan);
						});
						this.fetch();
					}
				} else {
					return self.plan;
				}
			},

			set: function(plan, friends, organizer) {
				self.plan = plan;
				self.friends = friends;
				self.organizer = organizer;
				return self.plan;
			},
			setFriends: function(friends) {
				self.friends = friends;
				return self.friends;
			},

			getFriends: function() {
				return self.friends;
			},

			getTickets: function() {
				return self.tickets;
			},

			setTickets: function(tickets) {
				self.tickets = tickets;
				return self.tickets;
			},

			getFeed: function() {
				return self.feed;
			},

			setFeed: function(feed) {
				self.feed = feed;
				return self.feed;
			},

			getOrganizer: function() {
				return self.organizer;
			},

			setOrganizer: function(o) {
				self.organizer = o;
				return self.organizer;
			},

			getContext: function() {
				return self.context;
			},

			setContext: function(c) {
				self.context = c;
				return self.context;
			},

			addFriend: function(args, callback) {
				wembliRpc.fetch('plan.addFriend', args, function(err, result) {
					if (result.friends) {
						self.friends = result.friends;
						$rootScope.$broadcast('plan-friends-changed', result.friends);
					}
					callback(err, result);
				});
			},

			addTicketGroup: function(args, callback) {
				wembliRpc.fetch('plan.addTicketGroup', args, callback);
			},

			savePreferences: function(args, callback) {
				wembliRpc.fetch('plan.savePreferences', args, callback);
			},

			//get plan from server and return it
			fetch: function(args, callback) {
				if (typeof callback === "undefined") {
					callback = args;
					args = {};
				}

				if (self.fetchInProgress) {
					if (callback) {
						var dereg = $rootScope.$on('plan-fetched', function() {
							dereg();
							callback(self);
						});
					}
					return;
				}
				self.fetchInProgress = true;
				wembliRpc.fetch('plan.init', args,
					//response

					function(err, result) {
						if (typeof result.plan !== "undefined") {
							$rootScope.plan = result.plan;
							self.plan = result.plan;
							self.friends = result.friends;
							self.tickets = result.tickets;
							self.organizer = result.organizer;
							self.context = result.context;
							self.feed = result.feed;
						}

						if (typeof result.loggedIn !== "undefined") {
							$rootScope.loggedIn = result.loggedIn;
						}

						if (typeof result.customer !== "undefined" && result.customer) {
							customer.set(result.customer);
						}
						self.fetchInProgress = false;
						$rootScope.$broadcast('plan-fetched', {});
						if (callback) {
							callback(self);
						}

					});
			},

			poll: function(callback) {
				var p = this;
				(function tick() {
					p.fetch({
						refresh: true
					}, function() {
						callback(p);
						$timeout(tick, 30000);
					});
				})();
			},
			/* tell the server to save the plan in the session */
			save: function(callback) {
				wembliRpc.fetch('plan.save', {}, function(err, result) {
					if (err) {
						return;
					}
					$rootScope.$broadcast('plan-saved', {});
					self.plan = result.plan;
					if (callback) {
						callback(err, result);
					}
				});
			},

			submitRsvp: function(rsvpFor, args, callback) {
				args.rsvpFor = rsvpFor;
				wembliRpc.fetch('plan.submitRsvp', args, function(err, result) {
						$('#generic-loading-modal').modal("hide");
						if (callback) {
							return callback(err, result);
						}
					},

					function(data, headersGetter) {

						$rootScope.genericLoadingModal.header = 'Saving...';
						$('#page-loading-modal').modal("hide");
						$('#generic-loading-modal').modal("show");
						return data;
					},

					/* transformResponse */

					function(data, headersGetter) {
						return JSON.parse(data);
					});
			},

			/* is rsvp complete:
				everyone has responded or date is passed
			*/
			rsvpComplete: function() {
				var complete = true;

				/* check if rsvpDate exists */
				if (typeof self.plan.rsvpDate === "undefined") {
					return !complete;
				}
				/* check if rsvpDate < now */
				/* lastnight at midnight */
				var now = new Date();
				now.setHours(0, 0, 0, 0);
				var t1 = now.getTime();

				/* rsvpDate's next midnight */
				var rsvpDate = new Date(self.plan.rsvpDate);
				rsvpDate.setHours(24, 0, 0, 0);
				var t2 = rsvpDate.getTime();

				/* give them until the next day
				 * so if they have to rsvp by 6/10/2013
				 * then give them until 6/11/2013
				 */
				if (t1 >= t2) {
					return complete;
				} else {}

				if (self.friends.length == 0) {
					return !complete;
				}

				/* check if every friend has responded */
				for (var i = 0; i < self.friends.length; i++) {
					if (self.friends[i].rsvp.decision === null) {
						return !complete;
					}
				};
				return complete;
			},

			/* this may require some tweaking */
			ponyUpSent: function() {
				if (!self.plan.ponyUpDate) {
					return false;
				}
				/* lastnight at midnight */
				var now = new Date();
				now.setHours(0, 0, 0, 0);
				var t1 = now.getTime();

				/* rsvpDate's next midnight */
				var ponyUpDate = new Date(self.plan.ponyUpDate);
				ponyUpDate.setHours(24, 0, 0, 0);
				var t2 = ponyUpDate.getTime();

				/* give them until the next day
				 * so if they have to rsvp by 6/10/2013
				 * then give them until 6/11/2013
				 */
				return (t1 >= t2);
			},


			//push $rootScope.plan to server and save
			push: function() {}
		}
	}
]).

factory('customer', ['$rootScope',
	function($rootScope) {
		var self = this;
		self.customer = null;

		return {
			get: function() {
				return self.customer;
			},

			set: function(customer) {
				$rootScope.customer = self.customer = customer;
				/* broadcast that customer was updated */
				$rootScope.$broadcast('customer-changed', self.customer);
				return self.customer;
			},
		}
	}
]).

factory('fetchModals', ['$rootScope', '$location', '$http', '$compile',
	function($rootScope, $location, $http, $compile) {

		var modalFetched = {};
		var modalFetchInProgress = null;

		var success = function(callback) {
			//send a broadcast that the modal is loaded
			$rootScope.$broadcast($('body :first-child').attr('id') + '-fetched', {
				modalId: $('body :first-child').attr('id')
			});
			if (callback) {
				callback();
			};
		};

		var fetchPartial = function(partialUrl, callback) {
			modalFetchInProgress = partialUrl;

			$http({
				method: 'get',
				url: partialUrl,
				cache: false
			}).success(function(data, status, headers, config) {
				$('body').prepend($compile(data)($rootScope));

				modalFetched[partialUrl] = $('body :first-child').attr('id');
				modalFetchInProgress = null;

				if (callback) {
					callback();
				};
				return success();

			}).error(function(err) {
				if (callback) {
					callback(err);
				};
			});
		};

		return {
			'fetch': function(path, callback) {

				/* clean the path */
				var pathKey = path.split('?')[0];

				/* its already fetched and cached and prepended to the body */
				if (modalFetched[pathKey]) {
					return success(callback);
				}
				/* this fetch is alredy in progress call the callback when the event is called */
				if (modalFetchInProgress === pathKey) {
					if (callback) {
						var dereg = $rootScope.$on($('body :first-child').attr('id') + '-fetched', function() {
							callback();
							dereg();
						});
					}
					return;
				}

				if (/^\/partials/.test(path)) {
					return fetchPartial(path, callback);
				}
			}
		};
	}
]).

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
		}

			function floatEqual(f1, f2) {
				return (Math.abs(f1 - f2) < 0.000001);
			}

		return {
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
				if (typeof marker !== "undefined") {
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
				win.open = true;
				win.infoWindow.open(self._map, marker);
			}

		};

	}
]).

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
]).

factory('rsvpLoginModal', [
	function() {
		var self = this;
		return {
			set: function(key, val) {
				self[key] = val;
			},
			get: function(key) {
				return self[key];
			}
		};
	}
]).

factory('loggedIn', [
	function() {
		var self = this;
		this.loggedIn = false;
		return {
			set: function(val) {
				self.loggedIn = val;
			},
			check: function() {
				return self.loggedIn;
			}
		};
	}
]).

factory('facebook', ['$rootScope', '$q', 'wembliRpc', '$window', '$filter', 'customer', '$location',
	function($rootScope, $q, wembliRpc, $window, $filter, customer, $location) {

		var self = this;
		this.auth = null;
		this.friends = null;
		this.allFriends = null;

		/* preApi methods here */
		self.preApi = {};

		/* postApi methods here */
		self.postApi = {
			//set friends in the obj
			'/me/friends': function(response, cb) {
				if (typeof response.data !== "undefined") {
					self.friends = $filter('orderBy')(response.data, '+name');
					self.allFriends = self.friends;
				} else {
					self.friends = null;
				}
				cb(response);
			}
		}

		return {
			feedDialog: function(args, cb) {
				FB.getLoginStatus(function(response) {
					if (response.authResponse) {
						var actionLink = 'http://' + $location.host() + '/rsvp/' + args.guid + '/' + args.token + '/facebook';
						var obj = {
							method: 'feed',
							display: 'iframe',
							link: actionLink,
							picture: 'http://www2.wembli.com/images/layout/wembli-orange-beta-small.png',
							name: 'Click Here To Check Out The Details & RSVP',
							caption: 'Wembli lets friends plan, vote and split the cost of going to live events.',
							to: args.to,
							properties: {
								'RSVP Before': args.rsvpDate,
								'Event': args.eventName + ' @ ' + args.venue
							},
							actions: {
								name: 'RSVP',
								link: actionLink
							},
							ref: 'rsvp'
						};
						FB.ui(obj, cb);

					}
				});
			},

			getAuth: function() {
				return self.auth;
			},

			getLoginStatus: function() {
				FB.getLoginStatus(function(response) {
					if (response.status === 'connected') {
						self.auth = response.authResponse;
						/* send the accessToken to wembli to auto log in */
						wembliRpc.fetch('facebook.setAccessToken', {
								accessToken: response.authResponse.accessToken
							},

							function(err, result) {
								if (err) {
									return false;
								}
							});
					} else {
						self.auth = false;
					}
					$rootScope.$broadcast('facebook-login-status', {
						auth: self.auth
					});
				});
			},

			getFriends: function(callback) {
				return self.friends;
			},

			getAllFriends: function() {
				return self.allFriends;
			},
			login: function() {

				FB.login(function(response) {
					if (response.authResponse) {
						self.auth = response.authResponse;
						$rootScope.$broadcast('facebook-login', {
							auth: self.auth
						});
					} else {}
				});

			},

			logout: function() {
				if (self.auth) {
					FB.logout(function(response) {
						if (response) {
							self.auth = false;
							$rootScope.$broadcast('facebook-logout', {
								auth: self.auth
							});
						} else {}
						$window.location = '/logout';
					});
				} else {
					$window.location = '/logout';
				}
			},

			api: function(method, callback) {
				if (typeof self.preApi[method] !== "undefined") {
					self.preApi[method]();
				}

				FB.api(method, function(response) {
					$rootScope.$broadcast('facebook-api-response', {
						method: method,
						response: response
					});
					if (typeof self.postApi[method] !== "undefined") {
						self.postApi[method](response, callback);
					} else {
						callback(response);
					}
				});
			}
		}
	}
]).

factory('twitter', ['$rootScope', '$filter', 'wembliRpc',
	function($rootScope, $filter, wembliRpc) {

		var self = this;
		this.auth = null;
		this.selectedFriends = {};
		this.friends = null;
		this.allFriends = null;

		return {
			tweet: function(args, cb) {
				wembliRpc.fetch('twitter.tweet', args,

					function(err, result) {
						if (err) {
							return cb(err);
						}
						$rootScope.$broadcast('twitter-tweet', {});
						cb(err, result);
					});

			},

			getAuth: function() {
				return self.auth;
			},

			getLoginStatus: function() {
				wembliRpc.fetch('twitter.getLoginStatus', {},

					function(err, result) {
						if (err) {
							return false;
						}
						self.auth = result.loginStatus;
						$rootScope.$broadcast('twitter-login-status', {
							auth: self.auth
						});
					});
			},

			searchUsers: function(q, args, callback) {
				wembliRpc.fetch('twitter.searchUsers', {
						q: q,
						args: args
					},

					function(err, result) {
						if (err) {
							callback(false);
						}
						self.friends = $filter('orderBy')(result.friends, '+name');
						self.allFriends = self.friends;
						callback(result);
					});
			},

			getFriends: function() {
				return self.friends;
			},

			fetchFriends: function(callback) {
				wembliRpc.fetch('twitter.getFriends', {},

					function(err, result) {
						if (err) {
							callback(false);
						}
						self.friends = result.friends.users;
						self.allFriends = result.friends.users;
						callback(result);
					});
			},

			fetchProfile: function() { /* wembliRpc call to get twitter user info */ },

			login: function() { /* wembliRpc call? */ },
		};
	}
]).

factory('interactiveMapDefaults', [
	function() {
		return {
			ServiceUrl: "https://imap.ticketutils.com",
			MapSet: "tn",
			ZoomLevel: 1,
			ColorScheme: 1,
			//AutoSwitchToStatic: true,
			ControlsPosition: "Outside",
			FailOverMapUrl: "http://data.ticketutils.com/Charts/No-Seating-Chart.jpg",
			GroupsContainer: "#groups-container",
			RowSelector: ".ticket-row",
			SectionSelector: ".ticket-section",
			PriceSelector: ".actual-price",
			QuantitySelector: ".ticket-quantity",
			eTicketSelector: ".e-ticket",
			ResetButtonText: "Reset Map"
		};
	}
]).

factory('wembliRpc', ['$rootScope', '$http', 'customer', 'loggedIn',
	function($rootScope, $http, customer, loggedIn) {
		var wembliRpc = {
			_cache: {}
		};

		var jsonRpc = {
			"jsonrpc": "2.0",
			"id": 1,
			"params": {}
		};


		wembliRpc.fetch = function(method, args, callback, transformRequest, transformResponse) {
			var cache = (args.cache) ? true : false;
			if (cache) {
				delete args.cache;
			}

			jsonRpc.method = method;
			jsonRpc.params.args = args;
			var data = JSON.stringify(jsonRpc);

			/* store this in a cache with stringified data as key */
			var cb = function(err, result) {
				var eventName = 'wembliRpc:';

				if (err) {
					$rootScope.$broadcast(eventName + 'error', {
						'method': method
					});
					/* show error modal? */
					var ret = callback(err);
					$rootScope.$broadcast(eventName + 'callbackComplete', {
						'method': method
					});
					return;
				}

				$rootScope.$broadcast(eventName + 'success', {
					'method': method
				});

				/* every wembliRpc call should try to return the customer */
				if (typeof result.customer !== "undefined") {
					customer.set(result.customer);
					$rootScope.$broadcast('customer-fetched', {
						customer: customer
					});
				}

				if (typeof result.loggedIn !== "undefined") {
					loggedIn.set(result.loggedIn);
				}


				var ret = callback(err, result);
				$rootScope.$broadcast(eventName + 'callbackComplete', {
					'method': method
				});
			};

			if (cache && (typeof wembliRpc._cache[data] !== "undefined")) {
				return cb(null, wembliRpc._cache[data]);
			}

			if (typeof callback === "undefined") {
				callback = function() {
					return true;
				};
			}

			if (typeof transformRequest === "undefined") {
				transformRequest = function(data) {
					return data;
				}
			}

			if (typeof transformResponse === "undefined") {
				transformResponse = function(data) {
					return JSON.parse(data);
				}
			}

			return $http.post('/', data, {
				headers: {
					"Content-Type": "application/json"
				},
				transformRequest: transformRequest,
				transformResponse: transformResponse
			}).success(function(data, status) {
				var result = {};
				result.data = data;
				result.status = status;
				if (cache) {
					wembliRpc._cache[data] = result.data.result;
				}
				if (result.data.error) {
					return cb(result.data.error);
				} else {
					return cb(null, result.data.result);
				}
			}).error(function(err) {
				callback(err);
			});
		};

		return wembliRpc;
	}
]).

//this is the order of the frames so sequence knows which direction to slide the frame
factory('footer', ['initRootScope', '$rootScope', '$location',
	function(initRootScope, $scope, $location) {
		var footer = {};
		//get the class names of the li elements in the #nav
		footer.framesMap = {};
		angular.element('#nav').children().each(function(i, e) {
			//hack for index
			if (e.id == 'index') {
				footer.framesMap['/'] = i;
			} else {
				footer.framesMap['/' + e.id] = i;
			}
		});

		footer.slideNavArrow = function() {
			footer.currentPath = $location.path();
			//append a fake element to #footer to get the left css property of end
			var startClass = 'center-' + $scope.currentPath.split('/')[1];
			var endClass = 'center-' + $location.path().split('/')[1];
			if (startClass == endClass) {
				startClass = 'center-';
			}

			//activate/deactivate the search button
			if ($location.path() === '/search') {
				$('#nav-search').addClass('active');
			} else {
				$('#nav-search').removeClass('active');
			}

			//if there already is a footer-left-position element, just update the class, else make a new hidden div
			if ($('#footer #footer-left-position').length > 0) {
				$('#footer #footer-left-position').attr('class', endClass);
			} else {
				$('#footer').append('<div id="footer-left-position" class="' + endClass + '"" style="display:none;position:absolute;height:0;width:0;"/>');
			}
			var moveTo = $('#footer #footer-left-position').css('left');

			if (moveTo == 'auto') {
				//hide the nav arrow
				$('#nav-arrow').hide();
			} else {
				$('#nav-arrow').show();
				$('#nav-arrow').animate({
					left: moveTo
				}, 750, function() {
					$('#nav-arrow').removeClass(startClass)
					$('#nav-arrow').addClass(endClass);
				});
			}
		}
		return footer;
	}
]).

factory('slidePage', ['$rootScope', '$window', '$templateCache', '$timeout', '$location', '$http', '$compile', 'footer', 'sequence', 'fetchModals', 'plan', 'wembliRpc', 'loadingModal',
	function($rootScope, $window, $templateCache, $timeout, $location, $http, $compile, footer, sequence, fetchModals, plan, wembliRpc, loadingModal) {
		return {
			direction: -1,
			frame: 1,
			loadingDuration: 500,
			getDirection: function() {
				return this.direction;
			},
			setDirection: function(direction) {
				this.direction = direction;
			},
			getFrame: function() {
				return this.frame;
			},
			setFrame: function(frame) {
				this.frame = frame;
			},
			setLoadingDuration: function(d) {
				this.loadingDuration = d;
			},
			getLoadingDuration: function() {
				return this.loadingDuration;
			},
			slide: function(e, newUrl, oldUrl, callback) {
				console.log('sliding page');
				console.log(newUrl);
				console.log(oldUrl);
				/* if either new or old has a hash tag and the urls are otherwise the same the gtfo */
				if (newUrl.split('#')[1] || oldUrl.split('#')[1]) {
					if (newUrl.split('#')[0] === oldUrl.split('#')[0]) {
						return;
					}
				}

				var me = this;
				var path = $location.path();
				/* clear out the search args from the path */
				$rootScope.sequenceCompleted = false;

				/* interactive-venue-map seems to disrespect template no-cache */
				/* $templateCache.removeAll(); */

				/* show the page loading modal */
				loadingModal.show('Patience Young Grasshopper...', 'When you can take the pebble from my hand, it will be time for you to leave.');

				/* init some defaults */
				var args = {
					method: 'get',
					cache: false
				}; //args for the http request

				args.url = '/partials' + $location.url();
				if (args.url === "/partials/") {
					args.url = args.url + "index";
				}

				/* if newUrl === oldUrl then its the same page */
				var samePage = (newUrl === oldUrl);

				/* fetch the partial */
				$http(args).success(function(data, status, headers, config) {
					var headerFunc = headers;
					/* fetch the plan once we have the html */
					plan.get(function(p) {
						var headers = headerFunc();

						/* if the server tells us explicitly what the location should be, set it here: */
						if (typeof headers['x-wembli-location'] !== "undefined") {
							//have to comment this out right now because this causes the page to reload :(
							$location.path(headers['x-wembli-location']);
							/* if x-location comes back and its the same as $location.path() - don't slide */
							samePage = ($rootScope.currentPath === headers['x-wembli-location']);
						}

						if (samePage) {
							angular.element('#frame' + $rootScope.currentFrame).html($compile(data)($rootScope));
							$rootScope.$emit('viewContentLoaded', {});
							loadingModal.hide();
							return callback();
						}

						/* not on the same page so we're gonna slide to the other frame */
						var nextFrameID = ($rootScope.currentFrame === 1) ? 2 : 1;
						me.setFrame(nextFrameID);

						/*
                split location path on '/' to get the right framesMap key
                this is so we know where to slide the footer arrow to
              */
						var nextPath = '/' + $location.path().split('/')[1];
						var currentPath = '/' + $rootScope.currentPath.split('/')[1];

						/*
                if footer.framesMap[$location.path()] (where they are going) is undefined
                then don't move the arrow and slide to the right
                if footer.framesMap[$rootScope.currentPath] (where they are coming from) is undefined
                then move the arrow, but still slide to the right
              */

						/* if where they are coming from doesn't have an arrow location */
						if (typeof footer.framesMap[currentPath] === "undefined") {
							currentPath = nextPath;
							/* slide the arrow only if where they are coming from is undefined */
							footer.slideNavArrow();
						}

						/*
                if both are defined
                then move the arrow and figure out which way to slide
              */
						var direction = me.getDirection();
						if ((typeof footer.framesMap[nextPath] !== "undefined") && (typeof footer.framesMap[currentPath] !== "undefined")) {
							var currNavIndex = footer.framesMap[currentPath];
							var nextNavIndex = footer.framesMap[nextPath];
							direction = (currNavIndex < nextNavIndex) ? 1 : -1;
							me.setDirection(direction);
							/* slide the nav arrow - this should be async with using sequence to transition to the next frame */
							footer.slideNavArrow();
						}

						/* find out what direction to go to we sliding in this element */
						direction = parseInt($rootScope.direction) || direction;
						me.setDirection(direction);

						/* compile the page we just fetched and link the scope */
						console.log('compile the page we just fetched and attach to the right frame');
						var frameNode = angular.element('#frame' + nextFrameID);
						var frameHtml = $compile(data)($rootScope);
						frameNode.html(frameHtml);

						/* should this go before the compile? or after? */
						$rootScope.$emit('viewContentLoaded', {});

						/* do the animations */
						sequence.goTo(nextFrameID, direction);

						$('#content').scrollTop(0);
						$('#content').css('overflow', 'visible');
						$('#content').css('overflow-x', 'hidden');

						/* server can tell us to overflow hidden or not - this is for the venue map pages */
						if (typeof headers['x-wembli-overflow'] !== "undefined") {
							if (headers['x-wembli-overflow'] === 'hidden') {
								$('#content').css('overflow', 'hidden');
							}
						}

						//update the currentPath and the currentFrame
						$rootScope.currentPath = $location.path();
						$rootScope.currentFrame = nextFrameID;

						/* dismiss any modals once the page loads */
						sequence.ready(function() {
							$timeout(function() {
								loadingModal.hide();
							}, me.getLoadingDuration());
						});

						return callback();
					});

				}).error(function() {
					console.log('error getting: ' + args.url);
					//send to a 404 page
					$location.path('/');
				});

			}
		}
	}
]).

//wrap the jquery sequence plugin
factory('sequence', ['initRootScope', '$rootScope', '$window', 'footer',
	function(initRootScope, $scope, $window, footer) {
		var options = {
			startingFrameID: 1,
			preloader: false,
			animateStartingFrameIn: false,
			transitionThreshold: false,
			autoPlay: false,
			cycle: true,
			keyNavigation: false,
			swipeNavigation: false
		};

		//make the page animate in
		if ($scope.currentFrame == 2) {
			options.animateStartingFrameIn = true;
			options.startingFrameID = 2;
		}

		footer.slideNavArrow();

		var sequence = angular.element("#content").sequence(options).data("sequence");

		sequence.beforeCurrentFrameAnimatesIn = function() {
			$scope.afterNextFrameAnimatesIn = false;
			$scope.beforeCurrentFrameAnimatesIn = true;
			$scope.$broadcast('sequence-beforeCurrentFrameAnimatesIn');
		};
		sequence.afterCurrentFrameAnimatesIn = function() {
			$scope.beforeCurrentFrameAnimatesIn = false;
			$scope.afterCurrentFrameAnimatesIn = true;
			$scope.$broadcast('sequence-afterCurrentFrameAnimatesIn');
		};

		sequence.beforeNextFrameAnimatesIn = function() {
			$scope.afterCurrentFrameAnimatesIn = false;
			$scope.beforeNextFrameAnimatesIn = true;
			$scope.$broadcast('sequence-beforeNextFrameAnimatesIn');
		};
		sequence.afterNextFrameAnimatesIn = function() {
			$scope.afterNextFrameAnimatesIn = true;
			$scope.beforeNextFrameAnimatesIn = false;
			$scope.$apply(function() {
				$scope.sequenceCompleted = true;
			});
			$scope.$broadcast('sequence-afterNextFrameAnimatesIn');
		};

		sequence.ready = function(callback) {
			if ($scope.afterNextFrameAnimatesIn) {
				callback();
			} else {
				var dereg = $scope.$on('sequence-afterNextFrameAnimatesIn', function() {
					callback();
					dereg();
				});
			}
		};

		/* init the sequence (page slider) */
		return sequence;

	}
]).value('version', '0.0.1');
