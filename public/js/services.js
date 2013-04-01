'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('wembliApp.services', [])

	.factory('initRootScope', ['$window', '$rootScope', function($window, $rootScope) {
	$rootScope.tnUrl = 'https://tickettransaction2.com/Checkout.aspx?brokerid=5006&sitenumber=0';

	$rootScope.partial = false; //partial starts as false, indicating the the full page was loaded from server without any ajax partials
	//init some scope vars
	$rootScope.currentPath = $window.location.pathname;
	//if there is a class 'animate-in' in the doc,then set currentFrame = 2 which will make the frame animate in
	$rootScope.currentFrame = ($('#content').find('.animate-in')[0]) ? 2 : 1;

	$rootScope.pageLoadingModal = {};
	$rootScope.pageLoadingModal.header = 'Loading the next bit of awesome...';
	$rootScope.pageLoadingModal.body = 'When you can take the pebble from my hand, it will be time for you to leave.'

	//templates can't make a date for some reason
	$rootScope.getDate = function(d) {
		return new Date(d);
		//return $filter('date')(d, "MM-dd-yy");
	}

}])

	.factory('plan', ['$rootScope', 'wembliRpc', 'customer', function($rootScope, wembliRpc, customer) {
	var self = this;
	self.plan = null;
	self.tickets = null;
	self.fetchInProgress = false;

	return {
		get: function(callback) {
			if (callback) {
				if (self.plan) {
					callback(self.plan);
				} else {
					var dereg = $rootScope.$on('plan-fetched', function() {
						dereg();
						callback(self.plan);
					});
					this.fetch();
				}
			} else {
				return self.plan;
			}
		},

		set: function(plan, friends) {
			self.plan = plan;
			self.friends = friends;
			return self.plan;
		},

		getFriends: function() {
			return self.friends;
		},

		addFriend: function(args, callback) {
			wembliRpc.fetch('plan.addFriend', args, callback);
		},

		//get plan from server and return it
		fetch: function(callback) {
			if (self.fetchInProgress) {
				if (callback) {
					var dereg = $rootScope.$on('plan-fetched', function(self) {
						dereg();
						callback(self);
					});
				}
				return;
			}

			self.fetchInProgress = true;

			wembliRpc.fetch('plan.init', {},
			//response

			function(err, result) {

				if (typeof result.plan !== "undefined") {
					self.plan = result.plan
					self.friends = result.friends;
				}

				self.fetchInProgress = false;
				$rootScope.$broadcast('plan-fetched', {});
				if (callback) {
					callback(self);
				}
			});
		},

		//push $rootScope.plan to server and save
		push: function() {

		}
	}
}])

	.factory('customer', ['$rootScope', '$q', function($rootScope) {
	var self = this;
	self.customer = null;

	return {
		get: function() {
			return self.customer;
		},

		set: function(customer) {
			self.customer = customer;
			return self.customer;
		},
	}
}])

	.factory('fetchModals', ['$rootScope', '$location', '$http', '$compile', function($rootScope, $location, $http, $compile) {

	var inviteFriendsWizard = '/partials/invite-friends-wizard';
	//var paymentType = '/partials/payment-type';
	var modalPageMap = {
		'/invitation': [inviteFriendsWizard],
		//'/index':[paymentType],
		//'/':[paymentType],
		//'/search':[paymentType],
		'/tickets-offsite': ['/partials/tickets-offsite']
	};
	var modalFetched = {};
	var modalFetchInProgress = null;

	var success = function() {
		//send a broadcast that the modal is loaded
		$rootScope.$broadcast($('body :first-child').attr('id') + '-fetched', {
			modalId: $('body :first-child').attr('id')
		});
	};

	var fetchPartial = function(path, partialUrl, callback) {
		modalFetchInProgress = path;
		console.log('fetching modal: '+path);
		console.log('partial url for modal is '+partialUrl);

		$http({
			method: 'get',
			url: partialUrl,
			cache: false
		}).success(function(data, status, headers, config) {
			$('body').prepend($compile(data)($rootScope));

			modalFetched[path]   = $('body :first-child').attr('id');
			modalFetchInProgress = null;

			if (callback) {
				callback();
			};
			return success();

		}).error(function(err) {
			if (callback) {
				callback(err);
			};
			console.log('error getting: ' + partialUrl);
		});
	};

	return {
		'fetch': function(path, callback) {
			console.log("fetchmodal:"+path);
			/* its already fetched and cached and prepended to the body */
			if (modalFetched[path]) {	return success();	}
			/* this fetch is alredy in progress call the callback when the event is called */
			if (modalFetchInProgress === path) {
				if (callback) {
					var dereg = $rootScope.$on($('body :first-child').attr('id') + '-fetched', function() {
						callback();
						dereg();
					});
				}
				return;
			}

			if (typeof modalPageMap[path] !== "undefined") {
				for (var i = 0; i < modalPageMap[path].length; i++) {
					//if the modal has already been fetched, don't fetch it again but do fire the broadcast
					fetchPartial(path, modalPageMap[path][i], callback);
				}
				return;
			}

			if (path.split('/')[1] === 'partials' ) {
				/* modalPageMap has no key for this url - try to just fetch ot */
				return fetchPartial(path,path,callback);
			}
		}
	};
}])

	.factory('friendFilter', [function() {
	return {
		filter: function(key, self) {
			var r = new RegExp("^" + key, "i");

			if (key.length <= 1) {
				self.friends = self.allFriends;
				return;
			}
			var filtered = [];
			angular.forEach(self.friends, function(val) {
				var me = this;
				var f = val;

				//fullname
				if (r.test(f.name)) {
					me.push(f);
					return;
				}

				var ary = f.name.split(' ');

				angular.forEach(ary, function(name) {
					if (r.test(name)) {
						me.push(f);
						return;
					}
				});
			}, filtered);
			self.friends = filtered;

		}
	};
}])

	.factory('facebook', ['$rootScope', '$q', 'friendFilter', 'wembliRpc', '$window', '$filter', 'customer', function($rootScope, $q, friendFilter, wembliRpc, $window, $filter, customer) {

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
		//TODO make a filterFriend service to be used by the different social network api services
		filterFriends: function(filterKey) {
			friendFilter.filter(filterKey, self);
		},

		feedDialog: function(args, cb) {
			console.log('display feed dialog');
			console.log(args);
			FB.getLoginStatus(function(response) {
				if (response.authResponse) {
					var actionLink = 'http://tom.wembli.com/rsvp/' + args.guid + '/' + args.token;
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
							console.log(err);
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
		login: function() {

			FB.login(function(response) {
				if (response.authResponse) {
					self.auth = response.authResponse;
					$rootScope.$broadcast('facebook-login', {
						auth: self.auth
					});
				} else {
					console.log('Facebook login failed', response);
				}
			});

		},

		logout: function() {
			console.log('bam logging out of fb');
			if (self.auth) {
				FB.logout(function(response) {
					console.log(response);
					if (response) {
						self.auth = false;
						$rootScope.$broadcast('facebook-logout', {
							auth: self.auth
						});
					} else {
						console.log('Facebook logout failed.', response);
					}
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
}])

	.factory('twitter', ['$rootScope', '$filter', 'friendFilter', 'wembliRpc', function($rootScope, $filter, friendFilter, wembliRpc) {

	var self = this;
	this.auth = null;
	this.selectedFriends = {};
	this.friends = null;
	this.allFriends = null;

	return {
		//TODO make a filterFriend service to be used by the different social network api services
		filterFriends: function(filterKey) {
			friendFilter.filter(filterKey, self);
		},

		tweet: function(args, cb) {
			wembliRpc.fetch('twitter.tweet', args,

			function(err, result) {
				if (err) {
					console.log(err);
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
					console.log(err);
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
					console.log(err);
					callback(false);
				}
				console.log('friends');
				console.log(result.friends);
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
					console.log(err);
					callback(false);
				}
				self.friends = result.friends.users;
				self.allFriends = result.friends.users;
				callback(result);
			});
		},

		fetchProfile: function() { /* wembliRpc call to get twitter user info */
		},

		login: function() { /* wembliRpc call? */
		},
	};
}])

	.factory('interactiveMapDefaults', [function() {
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
}])

	.factory('wembliRpc', ['$rootScope', '$http', 'customer', function($rootScope, $http, customer) {
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
				console.log(err);
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
			var ret = callback(err, result);
			$rootScope.$broadcast(eventName + 'callbackComplete', {
				'method': method
			});
		};

		if (cache && (typeof wembliRpc._cache[data] !== "undefined")) {
			console.log('got cached data');
			console.log(wembliRpc._cache[data]);
			return cb(null, wembliRpc._cache[data]);
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
}])

//this is the order of the frames so sequence knows which direction to slide the frame
.factory('footer', ['initRootScope', '$rootScope', '$location', function(initRootScope, $scope, $location) {
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
}])

//wrap the jquery sequence plugin
.factory('sequence', ['initRootScope', '$rootScope', '$window', 'footer', function(initRootScope, $scope, $window, footer) {

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
		console.log('beforecurrentanimatesin');
		$scope.$broadcast('sequence-beforeCurrentFrameAnimatesIn');
		$scope.afterNextFrameAnimatesIn = false;
		$scope.beforeCurrentFrameAnimatesIn = true;
	};
	sequence.afterCurrentFrameAnimatesIn = function() {
		console.log('after currentanimatesin');
		$scope.$broadcast('sequence-afterCurrentFrameAnimatesIn');
		$scope.beforeCurrentFrameAnimatesIn = false;
		$scope.afterCurrentFrameAnimatesIn = true;
	};

	sequence.beforeNextFrameAnimatesIn = function() {
		console.log('before next animatesin');
		$scope.$broadcast('sequence-beforeNextFrameAnimatesIn');
		$scope.afterCurrentFrameAnimatesIn = false;
		$scope.beforeNextFrameAnimatesIn = true;
	};
	sequence.afterNextFrameAnimatesIn = function() {
		console.log('after next animatesin');
		$scope.$broadcast('sequence-afterNextFrameAnimatesIn');
		$scope.afterNextFrameAnimatesIn = true;
		$scope.beforeNextFrameAnimatesIn = false;
	};

	//init the sequence (page slider)
	return sequence;

}]).value('version', '0.0.1');
