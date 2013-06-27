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

/* this is not used but is a good example of calculating totals for when we support an array of tickets */
filter('ticketTotals', ['$filter',
	function($filter) {
		var fee = 0.15;
		return function(tickets) {
			var groupTotal = 0;
			var groupCount = 0;
			var groups = [];
			var groupTotalEach = {};
			for (var i = 0; i < tickets.length; i++) {
				var t = tickets[i]
				var groupNumber = i + 1;
				t.ticketGroup.serviceFee = parseFloat(t.ticketGroup.ActualPrice) * fee;
				t.ticketGroup.deliveryFee = 15.00;
				t.ticketGroup.totalEach = t.ticketGroup.serviceFee + parseFloat(t.ticketGroup.ActualPrice);
				t.ticketGroup.subTotal = t.ticketGroup.totalEach * parseInt(t.ticketGroup.selectedQty);
				t.ticketGroup.total = t.ticketGroup.subTotal + t.ticketGroup.deliveryFee;
				groupTotal += t.ticketGroup.total;
				groupCount += parseInt(t.ticketGroup.selectedQty);
				groups.push({value:i,label:'Ticket Group '+groupNumber});
				groupTotalEach[i] = t.ticketGroup.totalEach;
			};

			tickets.total = groupTotal;
			tickets.totalQty = groupCount;
			tickets.groups = groups;
			tickets.groupTotalEach = groupTotalEach;
			return tickets;
		};
	}
]).

/* yikes! this gets called for every digest */
filter('friendPonyUp', ['$filter','plan',
	function($filter,plan) {
		var fee = 0.15;
		var deliveryFee = 15;
		return function(friends) {
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
				cb.serviceFee = parseFloat(t.ticketGroup.ActualPrice) * fee;
				cb.deliveryFee = deliveryFee;
				cb.totalEach = cb.serviceFee + parseFloat(t.ticketGroup.ActualPrice) + parseFloat(cb.deliveryFee/t.ticketGroup.selectedQty);
				cb.subTotal = cb.totalEach * parseInt(t.ticketGroup.selectedQty);
				cb.total = cb.subTotal + cb.deliveryFee;
				groupTotal += cb.total;
				groupCount += parseInt(t.ticketGroup.selectedQty);
				groups.push({value:i,label:'Ticket Group '+groupNumber});
				groupTotalEach[i] = cb.totalEach;
				t.ticketGroup.costBreakdown = cb;
			};

			tickets.total = groupTotal;
			tickets.totalQty = groupCount;
			tickets.groups = groups;
			tickets.groupTotalEach = groupTotalEach;

			/* assuming there's only 1 ticketGroup for now */
			for (var i = 0; i < friends.length; i++) {
				if (typeof tickets[0] !== "undefined") {
					if (typeof friends[i].tickets == "undefined") {
						friends[i].tickets = {};
					}
					friends[i].tickets.group = tickets[0].ticketGroup;
					friends[i].tickets.suggestedPonyUpAmount = tickets[0].ticketGroup.costBreakdown.totalEach * friends[i].rsvp.guestCount;
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
