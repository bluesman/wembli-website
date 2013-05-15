'use strict';

/* Filters */
angular.module('wembliApp.filters', []).
filter('feedString', ['$filter', function($filter) {
	return function(feed) {
		angular.forEach(feed, function(f) {
			var now = new Date().getTime();
			now = parseInt(now / 1000);
			var then = new Date(f.created);
			var t = then.getTime();
			t = parseInt(t / 1000);

			/*
    	subtract t from now
    	- if <= 60 : xx seconds ago
    	- if <= 3600 : xx minutes ago
    	- if <= 86400 : xx hours ago
    	- else 12/05/2012
  		*/
			var s = parseInt(now - t);

			var dateStr = 'on ' + $filter('date')(then, 'shortDate') + '.';

			if (s <= 86400) {
				var dd = parseInt(s / 3600);
				var sString = (dd == 1) ? '' : 's';
				dateStr = dd + ' hour' + sString + ' ago.';
			}

			if (s <= 3600) {
				var m = parseInt(s / 60);
				var sString = (m == 1) ? '' : 's';
				dateStr = m + ' minute' + sString + ' ago.';
			}

			if (s <= 60) {
				var sString = (s == 1) ? '' : 's';
				//dateStr = parseInt(s) + ' second' + sString + ' ago.';
				dateStr = 'less than a minute ago.';
			}
			var actorStr = f.actor.name;
			var actionStr = '';
			switch (f.action.name) {
				case 'createPlan':
					actionStr = ' created a new plan ';
					break;
				case 'addFriend':
					actionStr = ' invited someone ';
					break;
				case 'clickedLink':
					actionStr = ' clicked on a link ';
					break;
			}
			f.string = actorStr+actionStr+dateStr;
		});
		return feed;
	};
}])
	.filter('interpolate', ['version', function(version) {
	return function(text) {
		return String(text).replace(/\%VERSION\%/mg, version);
	}
}]);
