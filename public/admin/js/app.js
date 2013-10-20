'use strict';

// Declare app level module which depends on filters, and services
angular.module('adminApp', [
  'adminApp.controllers',
  'adminApp.filters',
  'adminApp.services',
  'adminApp.directives'
]).config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
  }
]).run(['balancedApiConfig', '$timeout', '$rootScope', '$location', '$route', '$window',
  function(balancedApiConfig, $timeout, $scope, $location, $route, $window) {
    /* init the balanced js api for payments */
    $timeout(function() {
      balanced.init(balancedApiConfig.balancedMarketplaceUri);
    });
  }
]);
