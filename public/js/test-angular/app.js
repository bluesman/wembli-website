'use strict';

// Declare app level module which depends on filters, and services
angular.module('testApp', [
    'testApp.filters',
    'testApp.directives',
    'testApp.services',
]).config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
  	console.log('in app config');
    $locationProvider.html5Mode(true);
    console.log('started big loop in config');
    for (var i = 0; i < 99999; i++) {
    	for (var j = 0; j < 9999; j++) {
    		continue;
    	};
    };
    console.log('finished big loop in config');

  }
]).run(['$rootScope', '$location', '$route', '$window', 'stack', '$timeout',
  function($scope, $location, $route, $window, stack, $timeout) {
    console.log('started big loop in run');
    for (var i = 0; i < 99999; i++) {
    	for (var j = 0; j < 9999; j++) {
    		continue;
    	};
    };
    console.log('finished big loop in run');



  	console.log('pushing stack in app.run');
  	stack.push('in app.run');


  	$timeout(function() {
  		console.log('waited 5 seconds:');
  		console.log($scope.stack);
  	},5000);
  }
]);

