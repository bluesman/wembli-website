/* Controllers */
angular.module('wembliApp.controllers.index', []).
/*
 * Index Controller
 */
controller('IndexCtrl', ['$scope', '$rootScope', '$window', 'googleAnalytics',
	function($scope, $rootScope, $window, googleAnalytics) {

		$rootScope.$broadcast('search-page-loaded', {});

		$scope.searchInProgress = false;

		$scope.$on('search-page-loaded', function() {
			$scope.searchInProgress = false;
		});


		$scope.submitSearch = function() {
			$scope.searchInProgress = true;
      googleAnalytics.trackEvent('Search', 'submit', 'index', $scope.search, function(err, result) {
				$window.location.href = '/search/events/' + $scope.search;
      });

		}
	}
]);
