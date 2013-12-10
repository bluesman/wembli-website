/* Controllers */
angular.module('wembliApp.controllers.header', []).

controller('HeaderCtrl', ['$scope',
	function($scope) {
		$scope.searchInProgress = false;
		$scope.hideHeaderSearch = false;
		$scope.$on('search-page-loaded', function() {
			$scope.searchInProgress = false;
			$scope.hideHeaderSearch = true;
		});

		$scope.submitSearch = function() {
			$scope.searchInProgress = true;
		}
	}
]);
