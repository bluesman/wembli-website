/* Filters */
angular.module('wembliApp.filters.facebook', []).

//- facebook
filter('facebookFriends', [
	function() {
		return function(friends, match) {
			if (typeof friends === "undefined") {
				return friends;
			}

			if (!match || match.length < 2) {
				return friends;
			}

			var newList = [];

			for (var i = 0; i < friends.length; i++) {
				var f = friends[i];
				var r = new RegExp(match, 'im');
				if (r.test(f.name)) {
					newList.push(f);
				}
			};
			return newList;
		}
	}
]);
