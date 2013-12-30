'use strict';

// Declare app level module which depends on filters, and services
angular.module('wembliApp', [
  'ngRoute',
  'wembliApp.controllers',
  'wembliApp.controllers.login',
  'wembliApp.controllers.header',
  'wembliApp.filters',
  'wembliApp.services',
  'wembliApp.services.header',
  'wembliApp.services.facebook',
  'wembliApp.services.twitter',
  'wembliApp.services.pixel',
  'wembliApp.directives',
  'wembliApp.directives.header',
  'wembliApp.directives.login',
]).config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    //$locationProvider.html5Mode(true);
  }
]).run(['$timeout', 'initRootScope', '$rootScope', '$location', '$route', '$window', 'facebook', 'twitter', 'plan', 'wembliRpc',
  function($timeout, initRootScope, $scope, $location, $route, $window, facebook, twitter, plan, wembliRpc) {
    console.log('run login angular app');
    $timeout(function() {
      plan.fetch(function() {});
    });

    $window.fbAsyncInit = function() {
      facebook.getLoginStatus();
      $scope.facebook = facebook;
    };

    twitter.getLoginStatus();
  }
]);



