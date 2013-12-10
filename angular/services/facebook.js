angular.module('wembliApp.services.facebook', []).

/* facebook */
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
							picture: 'http://www.wembli.com/images/layout/wembli-button-222x198.png',
							name: 'Click Here To RSVP To '+args.eventName,
							to: args.to,
							properties: {
								'Event': args.eventName + ' @ ' + args.venue
							},
							actions: {
								name: 'Click To RSVP Before '+args.rsvpDate,
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
]);
