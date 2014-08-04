/* Filters */
angular.module('wembliApp.filters.plan', []).

//- plan
filter('chatterDateString', ['$filter',
	function($filter) {
		return function(date) {
			return createdAgoString(date, $filter);
		};
	}
]).

//- plan
filter('historyStatus', [
	function() {
		return function(historyStatus) {
			if (typeof historyStatus === "undefined") {
				return 'logged';
			}
			var historyStatusFilter = {
				'queued': 'Sending Email',
				'delivered': 'Email Sent',
				'opened': 'Email Opened',
				'responded': 'Payment Posted',
				'received': 'Payment Received',
			}

			return (typeof historyStatusFilter[historyStatus] !== "undefined") ? historyStatusFilter[historyStatus] : historyStatus;
		}
	}
]).

filter('friendComing', ['plan',
	function(plan) {
		return function(friends) {
			if (typeof friends === "undefined") {
				return friends;
			}
			var newList = [];
			for (var i = 0; i < friends.length; i++) {
				var f = friends[i];
				if (f.inviteStatus && f.rsvp.decision) {
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

			if (plan.getContext() === 'organizer') {
				return friends;
			}

			var newList = [];
			var p = plan.get();

			/* check plan preferences to figure out which friends show up
			 * p.preferences.guestList can be: full, rsvp, private
			 */

			 console.log('guestlist: '+ p.preferences.guestList);
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
]);
