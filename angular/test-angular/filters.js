/* Filters */
'use strict';

console.log('filters is executing');

angular.module('testApp.filters', []).

filter('test', ['$filter', 'stack',
	function($filter, stack) {
		console.log('in test filter');
		stack.push('in test filter');
		return function(model) {
			return 'filtered ' + model;
		};
	}
]);
