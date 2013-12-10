/* Controllers */
angular.module('wembliApp.controllers.index', []).
/*
 * Index Controller
 */
controller('IndexCtrl', ['$scope', '$rootScope', '$window',
	function($scope, $rootScope, $window) {

		$rootScope.$broadcast('search-page-loaded', {});

		$scope.searchInProgress = false;

		$scope.$on('search-page-loaded', function() {
			$scope.searchInProgress = false;
		});

		$scope.submitSearch = function() {
			$scope.searchInProgress = true;
			$window.location.href = '/search/events/' + $scope.search;
		}
	}
]);
