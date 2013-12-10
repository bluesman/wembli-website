angular.module('wembliApp.services.twitter', []).

/* twitter */
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
]);
