'use strict';

/* Services */
console.log('services is executing');

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('testApp.services', []).

factory('unused', ['$rootScope', function($rootScope) {
	console.log('unused service');
	$rootScope.stack.push('unused service');
}]).

factory('usedlater', ['$rootScope', function($rootScope) {
	console.log('service used later');
	$rootScope.stack.push('service used later');
	return {};
}]).

factory('stack', ['$rootScope', function($rootScope) {
 	$rootScope.stack = [];
    console.log('started big loop in service factory');
    for (var i = 0; i < 99999; i++) {
    	for (var j = 0; j < 9999; j++) {
    		continue;
    	};
    };
    console.log('finished big loop in service factory');

	console.log('pushing stack in service factory');
	$rootScope.stack.push('in service factory');

	return {
		push: function(msg) {
			$rootScope.stack.push(msg);
		}
	}
}]);
