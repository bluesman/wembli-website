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
  'wembliApp.directives.venueMap',
]).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
}])
.run(['initRootScope','$rootScope', '$location', '$route', '$window','fetchModals', 'facebook','twitter', 'plan', 'wembliRpc',function(initRootScope, $scope, $location, $route, $window, fetchModals, facebook, twitter, plan, wembliRpc) {
  /* init the balanced js api for payments */
  balanced.init($scope.balancedMarketplaceUri);

  $window.fbAsyncInit = function() {
    FB.init({
      appId      : fbAppId,
      channelUrl : fbChannelUrl,
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the req.session
      xfbml      : true,  // parse XFBML
      oauth      : true
    });
    facebook.getLoginStatus();
    $scope.facebook = facebook;
  };

  twitter.getLoginStatus();

  /* fetch the plan */
  plan.fetch(function(planObj) {
    fetchModals.fetch('/'+$location.path().split('/')[1].split('?')[0]);
  });

  /* log this click in keen.io */
  wembliRpc.fetch('analytics.addEvent', {collection: 'view', url: $location.absUrl(), direction: 0, frame: 1}, function(err, result) {});

  /* look for location changes */
  $scope.$on('$locationChangeStart', function(e,newUrl,oldUrl) {
    console.log('location changed started');
    console.log('new Url');
    console.log(newUrl);
    console.log('oldUrl');
    console.log(oldUrl);
    console.log('current path is');
    console.log($scope.currentPath);

  });
  $scope.$on('$locationChangeSuccess', function(e,newUrl,oldUrl) {
    console.log('window history');
    console.log($window.history);
    console.log('location changed sucessfully');
    console.log('new Url');
    console.log(newUrl);
    console.log('oldUrl');
    console.log(oldUrl);
    console.log('current path is');
    console.log($scope.currentPath);
  });

}]);
