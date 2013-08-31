'use strict';

// Declare app level module which depends on filters, and services
angular.module('wembliApp', [
    'wembliApp.filters',
    'wembliApp.services',
    'wembliApp.directives',
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
]).run(['balancedApiConfig', '$timeout', 'initRootScope', '$rootScope', '$location', '$route', '$window', 'fetchModals', 'slidePage', 'facebook', 'twitter', 'plan', 'wembliRpc',
  function(balancedApiConfig, $timeout, initRootScope, $scope, $location, $route, $window, fetchModals, slidePage, facebook, twitter, plan, wembliRpc) {
    /* just fetch the plan right away */
    plan.fetch(function() {});

    /* slide pages using sequence when location changes */
    $scope.$on('$locationChangeSuccess', function(e, newUrl, oldUrl) {
      if (newUrl === oldUrl) {
        return;
      }
      console.log('loation hash: ');
      console.log($location.hash());
      if ($location.hash() === '#no-slide') {
        $location.hash('');
        return;
      }
      /* slide the page in if necessary */
      $timeout(function() {
        slidePage.slide(e, newUrl, oldUrl, function() {
          /* log this click in keen.io */
          wembliRpc.fetch('analytics.addEvent', {
            collection: 'view',
            url: newUrl,
            direction: slidePage.getDirection(),
            frame: slidePage.getFrame()
          });
        });
      });
    });

    /* init the balanced js api for payments */
    $timeout(function() {
      balanced.init(balancedApiConfig.balancedMarketplaceUri);
    });

    $window.fbAsyncInit = function() {
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
