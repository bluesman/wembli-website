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

    if ($location.path() === '/') {
      $location.path('/index');
    }

   $scope.$on('$locationChangeSuccess', function() {
        $scope.actualLocation = $location.path();
    });

   /* check if back button was pressed */
   $scope.$watch(function () {return $location.path()}, function (newLocation, oldLocation) {
        if($scope.actualLocation === newLocation) {
          slidePage.setDirection(-1);
        } else {
          if (slidePage.directionOverride !== 0) {
            slidePage.setDirection(slidePage.directionOverride);
            slidePage.directionOverride = 0;
          } else {
            slidePage.setDirection(1);
          }
        }
    });

    /* slide pages using sequence when location changes */
    $scope.$on('$locationChangeSuccess', function(e, newUrl, oldUrl) {
      $scope.actualLocation = $location.path();
      if ((oldUrl.split('/')[3] === '') && (newUrl.split('/')[3] === 'index')) {
        return;
      }

      if ((oldUrl.split('/')[3] === 'index') && (newUrl.split('/')[3] === '')) {
        return;
      }

      if (newUrl === oldUrl) {
        return;
      }

      if ($location.hash() === 'no-slide') {
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
