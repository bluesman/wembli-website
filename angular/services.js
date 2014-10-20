'use strict';

/* Services */
var runCount = 0;

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('wembliApp.services', []).

/* deprecated?
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

				if (stack == 0) {
					angular.element(".modal").modal("hide");
				}

				stack++;
				angular.element('#generic-loading-modal').modal("show");
				$rootScope.$broadcast('loading-modal-show');
			},
			hide: function() {
				stack--;
				if (stack < 1) {
					stack = 0;
					if (typeof $('#generic-loading-modal').modal !== "undefined") {
						$('#generic-loading-modal').modal("hide");
					}
				}
			}
		}
	}
]).
*/

factory('overlay', ['$rootScope',
	function($rootScope) {
		return {
			show: function() {
				angular.element('#overlay').addClass('overlay');
			},
			hide: function() {
				angular.element('#overlay').removeClass('overlay');
			},
			loading: function(bool) {
				if (bool) {
					angular.element('#overlay > .overlay-loading').removeClass('hide');
				} else {
					angular.element('#overlay > .overlay-loading').addClass('hide');
				}
			}
		}
	}
]).

factory('environment', ['$location',
	function($location) {
		var env = 'development';
		if (/www/.test($location.host())) {
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

/* goldstar config */
factory('gsConfig', ['environment',
	function(environment) {
		var config = {
			'development': {
				'baseUrl': 'http://tracking.goldstar.com/aff_c',
				'pixelBaseUrl':'//tracking.goldstar.com/aff_i',
				'affiliateId': 2437,
				'offerId':1,
				'source':'development'
			},
			'production': {
				'baseUrl': 'http://tracking.goldstar.com/aff_c',
				'pixelBaseUrl':'//tracking.goldstar.com/aff_i',
				'affiliateId': 2437,
				'offerId':1,
				'source':'website'
			}
		};
		var envConfig = config[environment];
		envConfig.url = envConfig.baseUrl + '?aff_id=' + envConfig.affiliateId + '&offer_id='+envConfig.offerId+'&source='+envConfig.source;
		envConfig.pixel = envConfig.pixelBaseUrl + '?aff_id=' + envConfig.affiliateId + '&offer_id='+envConfig.offerId+'&source='+envConfig.source;

		return envConfig;
	}
]).
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

		envConfig.generateSessionId = function() {
      var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
      var sid_length = 5;
      var sid = '';
      for (var i = 0; i < sid_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        sid += chars.substring(rnum, rnum + 1);
      }
      return sid;
    };

		return envConfig;
	}
]).

/* ticket purchase urls */
factory('ticketPurchaseUrls', ['tnConfig','gsConfig',
	function(tnConfig, gsConfig) {
		return {
			'tn': tnConfig.url,
			'gs': gsConfig.url,
			'gsPixel':gsConfig.pixel
		};
	}
]).

factory('initRootScope', ['$window', '$rootScope', '$location',
	function($window, $rootScope, $location) {
		//templates can't make a date for some reason
		$rootScope.getDate = function(d) {
			//return new Date(d);

			/* get current timezone offset for this browser */
			var tmpDate = new Date()
			var h = '0' + tmpDate.getTimezoneOffset() / 60;
			h = h.substr(-2);
			var m = '0' + tmpDate.getTimezoneOffset() % 60;
			m = m.substr(-2);

			var operator = (tmpDate.getTimezoneOffset() > 0) ? '-' : '+';
			var offset = operator + h + ':' + m;

			if (/Z$/.test(d)) {
				d = d.substring(0, d.length - 1);
			}
			d = d + offset;
			return new Date(d);
			//return $filter('date')(d, "MM-dd-yy");
		}

		$rootScope.feetToMiles = function(feet) {
			return parseFloat(feet / 5280).toFixed(2);
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
			'deal': function(number) {
				return (number == 1) ? 'deal' : 'deals';
			},
			'spot': function(number) {
				return (number == 1) ? 'spot' : 'spots';
			},
			'person': function(number) {
				return (number == 1) ? 'person' : 'people';
			},
			'ticket': function(number) {
				return (number == 1) ? 'ticket' : 'tickets';
			},
			'parking': function(number) {
				return (number == 1) ? 'parking' : 'parking';
			},
			'restaurant': function(number) {
				return (number == 1) ? 'restaurant' : 'restaurants';
			},
			'hotel': function(number) {
				return (number == 1) ? 'hotel' : 'hotels';
			},
			'seat': function(number) {
				return (number == 1) ? 'seat' : 'seats';
			},
			'guest': function(number) {
				return (number == 1) ? 'guest' : 'guests';
			}
		};
	}
]).

/* shared */
/* plan.fetch sets plan and isLoggedIn in the $rootScope and calls customer.set() which sets customer in the root scope */
factory('plan', ['$rootScope', 'wembliRpc', 'customer', '$timeout', 'loggedIn', 'googleAnalytics',
	function($rootScope, wembliRpc, customer, $timeout, loggedIn, googleAnalytics) {
		var self = this;
		self.plan = null;
		self.tickets = null;
		self.fetchInProgress = false;
		self.getStack = 0;
		self.fetchStack = 0;
		return {
			get: function(callback, str) {
				if (callback) {
					if (self.plan) {
						callback(self.plan);
					} else {
						if (self.getStack == 0) {
							this.fetch(function(p) {

								callback(p.plan);
							});
						} else {
							self.getStack++;

							var dereg = $rootScope.$on('plan-fetched', function() {
								self.getStack--;
								if (self.getStack == 0) {
									dereg();
								}
								callback(self.plan);
							});
						}
					}
				} else {
					return self.plan;
				}
			},

			set: function(plan, friends, organizer) {

				if (typeof plan !== "undefined") {
					self.plan = plan;
				}

				if (typeof friends !== "undefined") {
					self.friends = friends;
				}
				if (typeof organizer !== "undefined") {
					self.organizer = organizer;
				}
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

			getParking: function() {
				return self.parking;
			},

			setParking: function(parking) {
				self.parking = parking;
				return self.parking;
			},

			getHotels: function() {
				return self.hotels;
			},

			setHotels: function(hotels) {
				self.hotels = hotels;
				return self.hotels;
			},

			getRestaurants: function() {
				return self.restaurants;
			},

			setRestaurants: function(restaurants) {
				self.restaurants = restaurants;
				return self.restaurants;
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
            googleAnalytics.trackEvent('Plan', 'add-friend', self.plan.event.eventName, '', function(e2, r2) {
							callback(err, result);
            });
					} else {
							callback(err, result);
					}

				});
			},

			deactivate: function(args, callback) {
				wembliRpc.fetch('plan.deactivate', args, function(err, result) {
          googleAnalytics.trackEvent('Plan', 'deactivate', self.plan.event.eventName, '', function(e2, r2) {
						callback(err, result);
          });
				});
			},


			addRestaurant: function(args, callback) {
				wembliRpc.fetch('plan.addRestaurant', args, function(err, result) {
          googleAnalytics.trackEvent('Plan', 'add-restaurant', self.plan.event.eventName, '', function(e2, r2) {
						callback(err, result);
          });
				});
			},

			addRestaurantReceipt: function(args, callback) {
				wembliRpc.fetch('plan.addRestaurantReceipt', args, function(err, result) {
          googleAnalytics.trackEvent('Plan', 'add-restaurant-receipt', self.plan.event.eventName, '', function(e2, r2) {
						callback(err, result);
          });
				});
			},

			removeRestaurant: function(args, callback) {
				wembliRpc.fetch('plan.removeRestaurant', args, function(err, result) {
          googleAnalytics.trackEvent('Plan', 'remove-restaurant', self.plan.event.eventName, '', function(e2, r2) {
						callback(err, result);
          });
				});
			},

			addHotel: function(args, callback) {
				wembliRpc.fetch('plan.addHotel', args, function(err, result) {
          googleAnalytics.trackEvent('Plan', 'add-hotel', self.plan.event.eventName, '', function(e2, r2) {
						callback(err, result);
          });
				});
			},

			addHotelReceipt: function(args, callback) {
				wembliRpc.fetch('plan.addHotelReceipt', args, function(err, result) {
          googleAnalytics.trackEvent('Plan', 'add-hotel-receipt', self.plan.event.eventName, '', function(e2, r2) {
						callback(err, result);
          });
				});
			},

			removeHotel: function(args, callback) {
				wembliRpc.fetch('plan.removeHotel', args, function(err, result) {
          googleAnalytics.trackEvent('Plan', 'remove-hotel', self.plan.event.eventName, '', function(e2, r2) {
						callback(err, result);
          });
				});
			},

			addParking: function(args, callback) {
				wembliRpc.fetch('plan.addParking', args, function(err, result) {
          googleAnalytics.trackEvent('Plan', 'add-parking', self.plan.event.eventName, '', function(e2, r2) {
						callback(err, result);
          });
				});
			},

			addParkingReceipt: function(args, callback) {
				wembliRpc.fetch('plan.addParkingReceipt', args, function(err, result) {
          googleAnalytics.trackEvent('Plan', 'add-parking-receipt', self.plan.event.eventName, '', function(e2, r2) {
						callback(err, result);
          });
				});
			},

			removeParking: function(args, callback) {
				wembliRpc.fetch('plan.removeParking', args, function(err, result) {
          googleAnalytics.trackEvent('Plan', 'remove-parking', self.plan.event.eventName, '', function(e2, r2) {
						callback(err, result);
          });
				});
			},

			addTicketGroup: function(args, callback) {
				wembliRpc.fetch('plan.addTicketGroup', args, function(err, result) {
          googleAnalytics.trackEvent('Plan', 'add-tickets', self.plan.event.eventName, '', function(e2, r2) {
						callback(err, result);
          });
				});
			},

			addTicketGroupReceipt: function(args, callback) {
				wembliRpc.fetch('plan.addTicketGroupReceipt', args, function(err, result) {
          googleAnalytics.trackEvent('Plan', 'add-tickets-receipt', self.plan.event.eventName, '', function(e2, r2) {
						callback(err, result);
          });
				});
			},

			removeTicketGroup: function(args, callback) {
				wembliRpc.fetch('plan.removeTicketGroup', args, function(err, result) {
          googleAnalytics.trackEvent('Plan', 'remove-tickets', self.plan.event.eventName, '', function(e2, r2) {
						callback(err, result);
          });
				});
			},

			savePreferences: function(args, callback) {
				wembliRpc.fetch('plan.savePreferences', args, function(err, result) {
          googleAnalytics.trackEvent('Plan', 'save-preferences', self.plan.event.eventName, '', function(e2, r2) {
						callback(err, result);
          });
				});
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
							callback(self);
						});
					}
					return;
				}
				self.fetchInProgress = true;
				wembliRpc.fetch('plan.init', args,
					function(err, result) {
						if (typeof result.plan !== "undefined") {
							$rootScope.plan = result.plan;
							self.plan = result.plan;
							self.friends = result.friends;
							self.tickets = result.tickets;
							self.parking = result.parking;
							self.hotels = result.hotels;
							self.restaurants = result.restaurants;
							self.organizer = result.organizer;
							self.context = result.context;
							self.feed = result.feed;
						}

						if (typeof result.loggedIn !== "undefined") {
							$rootScope.loggedIn = result.loggedIn;
							loggedIn.set(result.loggedIn);
						}

						if (typeof result.rememberEmail !== "undefined") {
							$rootScope.rememberEmail = result.rememberEmail;
						}

						if (typeof result.customer !== "undefined" && result.customer) {
							customer.set(result.customer);
							console.log('set customer:');
							console.log(customer.get());
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
						$timeout(tick, 30000); //30 seconds
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
		          googleAnalytics.trackEvent('Plan', 'submit-rsvp', self.plan.event.eventName, '', function(e2, r2) {
								return callback(err, result);
        		  });
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
			rsvpComplete: function(f) {
				var complete = true;

				/* check if rsvpDate exists */
				if (typeof self.plan.rsvpDate === "undefined") {
					return f(!complete);
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
					return f(complete);
				} else {}

				if (self.friends.length == 0) {
					return f(!complete);
				}

				/* check if every friend has responded */
				for (var i = 0; i < self.friends.length; i++) {
					if (self.friends[i].rsvp.decision === null) {
						return f(!complete);
					}
				};
				return f(complete);
			},

			submitRsvpComplete: function(rsvpComplete, callback) {
				wembliRpc.fetch('plan.submitRsvpComplete', {"rsvpComplete":rsvpComplete}, function(err, result) {
					if (callback) {
						return callback(err, result);
					}
				});
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


			acknowledgeNotification: function(key, callback) {
				wembliRpc.fetch('plan.acknowledgeNotification', {"key":key}, function(err, result) {
					if (callback) {
						return callback(err, result);
					}
				});
			},


			//push $rootScope.plan to server and save
			push: function() {}
		}
	}
]).

/* shared */
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

/* get rid of this?
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

				var pathKey = path.split('?')[0];

				if (modalFetched[pathKey]) {
					return success(callback);
				}

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
*/

/* rsvp or shared? deprecated?
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
*/

/* shared */
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

/* shared */
/* http://www.quirksmode.org/js/cookies.html */
factory('cookie', [
	function() {
		return {
			create: function(name, value, days) {
				if (days) {
					var date = new Date();
					date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
					var expires = "; expires=" + date.toGMTString();
				} else var expires = "";
				document.cookie = name + "=" + value + expires + "; path=/";
			},
			read: function(name) {
				var nameEQ = name + "=";
				var ca = document.cookie.split(';');
				for (var i = 0; i < ca.length; i++) {
					var c = ca[i];
					while (c.charAt(0) == ' ') c = c.substring(1, c.length);
					if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
				}
				return null;
			},

			erase: function(name) {
				createCookie(name, "", -1);
			}
		}
	}
]).

/* shared */
factory('googleAnalytics', ['wembliRpc', 'cookie',
	function(wembliRpc, cookie) {
		var self = this;

		/* parse the ga cookie
		 * inspiration from http://stackoverflow.com/questions/1688657/how-do-i-extract-google-analytics-campaign-data-from-their-cookie-with-javascript
		 * readCookie is from // http://www.quirksmode.org/js/cookies.html
		 * utmcsr = utm_source
		 * utmccn = utm_campaign
		 * utmcmd = utm_medium
		 * utmctr = utm_term
		 * utmcct = utm_content
		 */
		self.cookie = {__utmz: {}};
		var cookie = cookie.read("__utmz");
		if (cookie) {
			var z = cookie.split('.');
			if (z.length >= 4) {
				var y = z[4].split('|');
				for (var i = 0; i < y.length; i++) {
					var pair = y[i].split("=");
					self.cookie.__utmz[pair[0]] = pair[1];
				}
			}
		}

		return {
			getCookie: function() {
				return self.cookie;
			},

			trackEvent: function(category, action, label, value, cb) {


				//_gaq.push(['_trackEvent', category, action, label, value]);
				ga('send', {
					'hitType':'event',
					'eventCategory':category,
					'eventAction':action,
					'eventLabel':label,
					'eventValue':0,
					'hitCallback': function() {

						wembliRpc.fetch('analytics.addEvent', {
							collection: "event",
							category: category,
							action: action,
							label: label,
							value: value
						}, function(err, result) {
							if (typeof cb !== "undefined") {
								cb(err, result);
							}
							console.log('logged event:' + category + ' ' + action + ' ' + label +  ' ' + value);
						});

					}
				});

			},
		}
	}
]).

/* shared */
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
					$rootScope.loggedIn = result.loggedIn;
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
]).value('version', '0.0.1');
