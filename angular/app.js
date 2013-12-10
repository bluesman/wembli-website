'use strict';

// Declare app level module which depends on filters, and services
angular.module('wembliApp', [
  'wembliApp.controllers',
  'wembliApp.filters',
  'wembliApp.services',
  'wembliApp.services.header',
  'wembliApp.directives',
  'wembliApp.directives.header',
  'wembliApp.directives.dashboard',
  'wembliApp.directives.plan',
  'wembliApp.directives.invitationWizard',
  'wembliApp.directives.parkingMap',
  'wembliApp.directives.restaurantsMap',
  'wembliApp.directives.hotelsMap',
  'wembliApp.directives.venueMap',
]).config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
  }
]).run(['balancedApiConfig', '$timeout', 'initRootScope', '$rootScope', '$location', '$route', '$window', 'fetchModals', 'facebook', 'twitter', 'plan', 'wembliRpc',
  function(sequence, balancedApiConfig, $timeout, initRootScope, $scope, $location, $route, $window, fetchModals, slidePage, facebook, twitter, plan, wembliRpc) {
    /* just fetch the plan right away */
    $timeout(function() {
      plan.fetch(function() {});
    });

    $scope.$on('$locationChangeStart', function(e, newUrl, oldUrl) {
      if ($location.protocol() === 'http') {
        if (/^\/(plan|login|dashboard|confirm|rsvp)/.test($location.path())) {
          $window.location.href = 'https://'+ $location.host() + $location.path();
        }
      }
    });

    /* init the balanced js api for payments */
    $timeout(function() {
      balanced.init(balancedApiConfig.balancedMarketplaceUri);
    });

    $window.fbAsyncInit = function() {
      console.log('call fb init');
      FB.init({
        appId: fbAppId,
        channelUrl: fbChannelUrl,
        status: true, // check login status
        cookie: true, // enable cookies to allow the server to access the req.session
        xfbml: true, // parse XFBML
        oauth: true
      });
      facebook.getLoginStatus();
      $scope.facebook = facebook;
    };

    twitter.getLoginStatus();
  }
]);
