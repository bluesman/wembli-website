'use strict';

function createdAgoString(date, $filter) {
	var now = new Date().getTime();
	now = parseInt(now / 1000);
	var then = new Date(date);
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
	return dateStr;
};

/* Filters */
angular.module('wembliApp.filters', []).

filter('chatterDateString', ['$filter',
	function($filter) {
		return function(date) {
			return createdAgoString(date, $filter);
		};
	}
]).

filter('historyStatus', [
	function() {
		return function(historyStatus) {
			if (typeof historyStatus === "undefined") {
				return 'logged';
			}
			var historyStatusFilter = {
				'queued' : 'Sending Email',
				'delivered' : 'Email Sent',
				'opened' : 'Email Opened',
				'responded' : 'Payment Posted',
				'received' : 'Payment Received',
			}

			return (typeof historyStatusFilter[historyStatus] !== "undefined") ? historyStatusFilter[historyStatus] : historyStatus;
		}
	}
]).

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
]).

filter('pluralize', ['$filter', 'pluralizeWords',
	function($filter, pluralizeWords) {
		return function(number, word) {
			return pluralizeWords[word](number);
		};
	}
]).

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
				var r = new RegExp(match,'im');
				if (r.test(f.name)) {
					newList.push(f);
				}
			};
			return newList;
		}
	}
]).

filter('filterInvitees', ['plan',
	function(plan) {
		return function(friends) {
			if (typeof friends === "undefined") {
				return friends;
			}

			var newList = [];
			var p = plan.get();

			/* check plan preferences to figure out which friends show up
			 * p.preferences.guestList can be: full, rsvp, private
			*/

			/* grab the organizer and add to the top of the list */
			var o = plan.getOrganizer();
			var organizer = {
				'contactInfo': {
					'name': o.firstName + ' ' + o.lastName
				},
				'rsvp': p.organizer.rsvp,
			};

			//newList.push(organizer);

			if (p.preferences.guestList === 'private') {
				return newList;
			}

			for (var i = 0; i < friends.length; i++) {
				var f = friends[i];

				/* rsvp means only show those guests that have rsvp'd */
				if (p.preferences.guestList === 'rsvp') {
					if (f.rsvp.decision !== null) {
						newList.push(f);
					}
				}

				if (p.preferences.guestList === 'full') {
					newList.push(f);
				}
			};
			return newList;
		}
	}
]).

filter('interpolate', ['version',
	function(version) {
		return function(text) {
			return String(text).replace(/\%VERSION\%/mg, version);
		}
	}
]);
