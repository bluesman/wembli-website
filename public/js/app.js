'use strict';

// Declare app level module which depends on filters, and services
angular.module('wembliApp', ['wembliApp.filters', 'wembliApp.services', 'wembliApp.directives'])
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
}])
.run(['initRootScope','$rootScope', '$location', '$route', '$window','fetchModals', 'facebook', function(initRootScope, $scope, $location, $route, $window, fetchModals, facebook) {
	fetchModals.fetch($location.path());

	console.log('location hash:');
	console.log($location.hash());

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

}]);
