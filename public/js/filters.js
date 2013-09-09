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

filter('hotelsTotals', ['$filter','plan',
	function($filter,plan) {
		return function(hotels) {
			return hotels;
		};
	}
]).

filter('restaurantsTotals', ['$filter','plan',
	function($filter,plan) {
		return function(restaurants) {
			return restaurants;
		};
	}
]).


/* yikes! this gets called for every digest */
filter('friendPonyUp', ['$filter', 'plan',
	function($filter, plan) {
		return function(friends) {
			if (typeof friends === "undefined") {
				return;
			}
			var fee = 0.15;
			var deliveryFee = 15;
			var deliverySplitBy = 0;
			if (plan.get().organizer.rsvp.decision) {
				deliverySplitBy++;
			}
			deliverySplitBy += friends.length;
			/* this should probably be in its own function */
			var groupTotal = 0;
			var groupCount = 0;
			var groups = [];
			var groupTotalEach = {};
			var tickets = plan.getTickets();

			for (var i = 0; i < tickets.length; i++) {
				var t = tickets[i]
				var groupNumber = i + 1;
				var cb = {};
				cb.ticketPrice = parseFloat(t.ticketGroup.ActualPrice);
				cb.serviceFee = parseFloat(t.ticketGroup.ActualPrice) * fee;
				cb.deliveryFee = deliveryFee;

				cb.deliveryFeeEach = cb.deliveryFee / deliverySplitBy;

				cb.totalEach = cb.ticketPrice + cb.serviceFee;
				cb.total = cb.totalEach * parseInt(t.ticketGroup.selectedQty) + cb.deliveryFeeEach;

				groupTotal += cb.total;
				groupCount += parseInt(t.ticketGroup.selectedQty);
				groups.push({
					value: i,
					label: 'Ticket Group ' + groupNumber
				});
				groupTotalEach[i] = cb.totalEach;
				t.ticketGroup.costBreakdown = cb;
			};

			tickets.total = groupTotal;
			tickets.totalQty = groupCount;
			tickets.groups = groups;
			tickets.groupTotalEach = groupTotalEach;

			/* assuming there's only 1 ticketGroup for now */
			/* kim and ash say guests don't count for a delivery fee */
			var totalPoniedUp = 0;
			for (var i = 0; i < friends.length; i++) {
				if (typeof tickets[0] !== "undefined") {
					if (typeof friends[i].tickets == "undefined") {
						friends[i].tickets = {};
					}
					friends[i].tickets.group = tickets[0].ticketGroup;
					var suggested = friends[i].tickets.group.costBreakdown.totalEach * friends[i].rsvp.guestCount + friends[i].tickets.group.costBreakdown.deliveryFeeEach;
					friends[i].tickets.suggestedPonyUpAmount = suggested.toFixed(2);
				} else {
					friends[i].tickets = [];
				}
			};
 			return friends;
		};
	}
]).

filter('interpolate', ['version',
	function(version) {
		return function(text) {
			return String(text).replace(/\%VERSION\%/mg, version);
		}
	}
]);
