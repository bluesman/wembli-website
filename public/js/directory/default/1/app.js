'use strict';

// Declare app level module which depends on filters, and services
angular.module('wembliDirectoryApp', [
	'wembliDirectoryApp.controllers',
	'wembliApp.services.header',
	'wembliApp.directives.header',
//	'wembliDirectoryApp.filters',
//	'wembliDirectoryApp.services',
//	'wembliDirectoryApp.directives',
]).run(['$rootScope','$window',
	function($scope, $window) {
	}
]);
