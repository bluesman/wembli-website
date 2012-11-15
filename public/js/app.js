'use strict';

// Declare app level module which depends on filters, and services
angular.module('wembliApp', ['wembliApp.filters', 'wembliApp.services', 'wembliApp.directives'])
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
}])
.run(['initRootScope','$rootScope',function(initRootScope,$scope) {

}]);
