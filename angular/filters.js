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

//- shared
filter('pluralize', ['$filter', 'pluralizeWords',
	function($filter, pluralizeWords) {
		return function(number, word) {
			return pluralizeWords[word](number);
		};
	}
]).

//- shared
filter('sortNumeric', [
	function() {
		return function(elements, predicate, reverse) {
			if (typeof elements === 'undefined') {
				return;
			}
			elements.sort(function(a, b) {
				if (reverse) {
					return a[predicate] - b[predicate];
				} else {
					return b[predicate] - a[predicate];
				}
			});
			return elements;
		}
	}
]);

