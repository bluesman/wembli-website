/* Filters */
angular.module('wembliApp.filters.feed', []).

//- feed
filter('feedString', ['$filter',
	function($filter) {
		return function(feed) {
			angular.forEach(feed, function(f) {
				var dateStr = createdAgoString(f.created, $filter);
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
				f.string = actorStr + actionStr + dateStr;
			});
			return feed;
		};
	}
]);
