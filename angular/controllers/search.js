/* Controllers */
angular.module('wembliApp.controllers.search', []).

/*
 * Event List Controller
 */

controller('EventListCtrl', ['$scope', '$location', 'wembliRpc', '$filter', '$rootScope', 'plan', 'fetchModals', 'loadingModal', '$timeout',
	function($scope, $location, wembliRpc, $filter, $rootScope, plan, fetchModals, loadingModal, $timeout) {

	}
]).


controller('SearchCtrl', ['$scope', '$rootScope', '$window',
	function($scope, $rootScope, $window) {
		$rootScope.$broadcast('search-page-loaded', {});

		$scope.searchInProgress = false;

		$scope.$on('search-page-loaded', function() {
			$scope.searchInProgress = false;
		});

		$scope.submitSearch = function() {
			$scope.searchInProgress = true;
			//$window.location.href = '/search/events/' + $scope.search;
		}

	}
]);

