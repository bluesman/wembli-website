/* Filters */
angular.module('wembliApp.filters.invitation-wizard', []).

//- invite wizard
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
