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

	//templates can't make a date for some reason
	$rootScope.getDate = function(d) {
		return new Date(d);
		//return $filter('date')(d, "MM-dd-yy");
	}

}])

.factory('plan',['$rootScope','wembliRpc',function($rootScope,wembliRpc) {
	var self = this;
	self.plan = null;
	self.tickets = null;

	return {
		get: function() {
			return self.plan;
		},

		set: function(plan,friends) {
			self.plan = plan;
			self.friends = friends;
			return self.plan;
		},

		getFriends: function() {
			return self.friends;
		},

		//get plan from server and return it
		fetch: function() {
			//if ther eis no plan set self.plan to false
			$rootScope.$broadcast('plan-fetched',{});
		},

		//push $rootScope.plan to server and save
		push: function() {

		}
	}
}])

.factory('customer',['$rootScope','$q','wembliRpc', function($rootScope, wembliRpc) {
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

		//get plan from server and return it
		fetch: function() {
			//if there is no customer set it to false to indicate we explicitly know there is no customer
			$rootScope.$broadcast('customer-fetched',{});
		},

		//push $rootScope.plan to server and save
		push: function() {

		}
	}
}])

.factory('fetchModals', ['$rootScope', '$location', '$http', '$compile', function($rootScope, $location, $http, $compile) {

	var inviteFriendsWizard = '/partials/invite-friends-wizard';
	var modalPageMap = {
		'/invitation': [inviteFriendsWizard]
	};
	var modalFetched = {};
	return {
		'fetch': function(path, callback) {
			if(typeof modalPageMap[path] !== "undefined") {
				for(var i = 0; i < modalPageMap[path].length; i++) {
					//if the modal has already been fetched, don't fetch it again but do fire the broadcast
					if(typeof modalFetched[path] === "undefined") {

						var partialUrl = modalPageMap[path][i];

						$http({
							method: 'get',
							url: partialUrl,
							cache: false
						}).success(function(data, status, headers, config) {
							$('body').prepend($compile(data)($rootScope));

							modalFetched[path] = $('body :first-child').attr('id');

							//send a broadcast that the modal is loaded
							$rootScope.$broadcast($('body :first-child').attr('id') + '-fetched', {
								modalId: $('body :first-child').attr('id')
							});
						}).error(function() {
							console.log('error getting: ' + partialUrl);
						});
					} else {
						//send a broadcast that the modal is loaded
						$rootScope.$broadcast(modalFetched[path]+'-fetched', {
							modalId: modalFetched[path]
						});
					}

				}
			}
		}
	};
}])

.factory('friendFilter',[function() {
	return {
		filter: function(key,self) {
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
				if(r.test(f.name)) {
					me.push(f);
					return;
				}

				var ary = f.name.split(' ');

				angular.forEach(ary,function(name) {
					if(r.test(name)) {
						me.push(f);
						return;
					}
				});
			}, filtered);
			self.friends = filtered;

		}
	};
}])

.factory('facebook', ['$rootScope','$q','friendFilter', function($rootScope, $q, friendFilter) {

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
			if(typeof response.data !== "undefined") {
				self.friends = response.data;
				self.allFriends = response.data;
			} else {
				self.friends = null;
			}
			cb(response);
		}
	}

	return {
		//TODO make a filterFriend service to be used by the different social network api services
		filterFriends: function(filterKey) {
			friendFilter.filter(filterKey,self);
		},

		getAuth: function() {
			return self.auth;
		},

		getLoginStatus: function() {
			FB.getLoginStatus(function(response) {
				if(response.status === 'connected') {
					self.auth = response.authResponse;
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
				if(response.authResponse) {
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
			FB.logout(function(response) {
				if(response) {
					self.auth = false;
					$rootScope.$broadcast('facebook-logout', {
						auth: self.auth
					});
				} else {
					console.log('Facebook logout failed.', response);
				}

			});
		},

		api: function(method, callback) {
			if(typeof self.preApi[method] !== "undefined") {
				self.preApi[method]();
			}

			FB.api(method, function(response) {
				$rootScope.$broadcast('facebook-api-response', {
					method: method,
					response: response
				});
				if(typeof self.postApi[method] !== "undefined") {
					self.postApi[method](response, callback);
				} else {
					callback(response);
				}
			});
		}
	}
}])

.factory('twitter', ['$rootScope','friendFilter', function($rootScope,friendFilter) {

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
			if(typeof response.data !== "undefined") {
				self.friends = response.data;
				self.allFriends = response.data;
			} else {
				self.friends = null;
			}
			cb(response);
		}
	}

	return {
		//TODO make a filterFriend service to be used by the different social network api services
		filterFriends: function(filterKey) {
			friendFilter.filter(filterKey,self);
		},

		getAuth: function() {
			return self.auth;
		},

		getLoginStatus: function() {
			FB.getLoginStatus(function(response) {
				if(response.status === 'connected') {
					self.auth = response.authResponse;
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
				if(response.authResponse) {
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

			FB.logout(function(response) {
				if(response) {
					self.auth = false;
					$rootScope.$broadcast('facebook-logout', {
						auth: self.auth
					});
				} else {
					console.log('Facebook logout failed.', response);
				}

			});

		},

		api: function(method, callback) {
			if(typeof self.preApi[method] !== "undefined") {
				self.preApi[method]();
			}

			FB.api(method, function(response) {
				$rootScope.$broadcast('facebook-api-response', {
					method: method,
					response: response
				});

				if(typeof self.postApi[method] !== "undefined") {
					self.postApi[method](response, callback);
				} else {
					callback(response);
				}
			});
		}
	}
}])


.factory('interactiveMapDefaults', [function() {
	return {
		ServiceUrl: "https://imap.ticketutils.com",
		MapSet: "tn",
		ZoomLevel: 2,
		ColorScheme: 1,
		//AutoSwitchToStatic: true,
		ControlsPosition: "Outside",
		FailOverMapUrl: "http://data.ticketutils.com/Charts/No-Seating-Chart.jpg",
		GroupsContainer: "#groups-container",
		RowSelector: ".ticket-row",
		SectionSelector: ".ticket-section",
		PriceSelector: ".actual-price",
		QuantitySelector: ".ticket-quantity",
		eTicketSelector: ".e-ticket"
	};
}])

.factory('wembliRpc', ['$rootScope', '$http', function($rootScope, $http) {
	var wembliRpc = {};

	var jsonRpc = {
		"jsonrpc": "2.0",
		"id": 1,
		"params": {}
	};


	wembliRpc.fetch = function(method, args, callback, transformRequest, transformResponse) {
		jsonRpc.method = method;
		jsonRpc.params.args = args;
		var data = JSON.stringify(jsonRpc);

		var cb = function(err, data) {
				var eventName = 'wembliRpc:';
				$rootScope.$broadcast(eventName + 'success', {
					'method': method
				});
				var ret = callback(err, data);
				$rootScope.$broadcast(eventName + 'callbackComplete', {
					'method': method
				});
			}

		if(typeof transformRequest === "undefined") {
			transformRequest = function(data) {
				return data;
			}
		}

		if(typeof transformResponse === "undefined") {
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
			return cb(null, result.data.result);
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
		if(e.id == 'index') {
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
		if(startClass == endClass) {
			startClass = 'center-';
		}

		//activate/deactivate the search button
		if($location.path() === '/search') {
			$('#nav-search').addClass('active');
		} else {
			$('#nav-search').removeClass('active');
		}

		//if there already is a footer-left-position element, just update the class, else make a new hidden div
		if($('#footer #footer-left-position').length > 0) {
			$('#footer #footer-left-position').attr('class', endClass);
		} else {
			$('#footer').append('<div id="footer-left-position" class="' + endClass + '"" style="display:none;position:absolute;height:0;width:0;"/>');
		}
		var moveTo = $('#footer #footer-left-position').css('left');

		if(moveTo == 'auto') {
			//hide the nav arrow
			$('#nav-arrow').hide();
		} else {
			$('#nav-arrow').show();
			$('#nav-arrow').animate({
				left: moveTo
			}, 1000, function() {
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
	if($scope.currentFrame == 2) {
		options.animateStartingFrameIn = true;
		options.startingFrameID = 2;
	}

	footer.slideNavArrow();

	var sequence = angular.element("#content").sequence(options).data("sequence");

	sequence.beforeCurrentFrameAnimatesIn = function() {
		$scope.$broadcast('sequence-beforeCurrentFrameAnimatesIn');
		$scope.afterNextFrameAnimatesIn = false;
		$scope.beforeCurrentFrameAnimatesIn = true;
	};
	sequence.afterCurrentFrameAnimatesIn = function() {
		$scope.$broadcast('sequence-afterCurrentFrameAnimatesIn');
		$scope.beforeCurrentFrameAnimatesIn = false;
		$scope.afterCurrentFrameAnimatesIn = true;
	};

	sequence.beforeNextFrameAnimatesIn = function() {
		$scope.$broadcast('sequence-beforeNextFrameAnimatesIn');
		$scope.afterCurrentFrameAnimatesIn = false;
		$scope.beforeNextFrameAnimatesIn = true;
	};
	sequence.afterNextFrameAnimatesIn = function() {
		$scope.$broadcast('sequence-afterNextFrameAnimatesIn');
		$scope.afterNextFrameAnimatesIn = true;
		$scope.beforeNextFrameAnimatesIn = false;
	};

	//init the sequence (page slider)
	return sequence;

}]).value('version', '0.0.1');
