'use strict';

// Declare app level module which depends on filters, and services
angular.module('wembliApp', [
  'ngRoute',
  'mgcrea.ngStrap',
  'wembliApp.controllers',
  'wembliApp.controllers.plan',
  'wembliApp.controllers.header',
  'wembliApp.filters',
  'wembliApp.filters.plan',
  'wembliApp.filters.invitation-wizard',
  'wembliApp.services',
  'wembliApp.services.header',
  'wembliApp.services.facebook',
  'wembliApp.services.twitter',
  'wembliApp.services.pixel',
  'wembliApp.services.plan',
  'wembliApp.services.google',
  'wembliApp.directives',
  'wembliApp.directives.header',
  'wembliApp.directives.plan'
]).config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    //$locationProvider.html5Mode(true);
  }
]).run(['$timeout', '$rootScope', 'initRootScope', '$window', 'facebook', 'twitter', 'plan', 'overlay', 'planNav',
  function($timeout, $scope, initRootScope, $window, facebook, twitter, plan, overlay, planNav) {
    console.log('run plan angular app');

    overlay.loading(true);
    overlay.show();
    planNav.onActivate(function() {
      overlay.loading(false);
      overlay.hide();
    });


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



