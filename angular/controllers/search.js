/* Controllers */
angular.module('wembliApp.controllers.search', []).

/*
 * Event List Controller
 */

controller('EventListCtrl', ['$scope', '$location', 'wembliRpc', '$filter', '$rootScope', 'plan', 'fetchModals', 'loadingModal', '$timeout',
	function($scope, $location, wembliRpc, $filter, $rootScope, plan, fetchModals, loadingModal, $timeout) {

	}
]).


controller('SearchCtrl', ['$scope', '$rootScope', '$window', 'wembliRpc', 'googleAnalytics',
	function($scope, $rootScope, $window, wembliRpc, googleAnalytics) {
		$rootScope.$broadcast('search-page-loaded', {});

		$scope.submitInProgress = false;

		$scope.searchInProgress = false;

		$scope.$on('search-page-loaded', function() {
			$scope.searchInProgress = false;
		});

		$scope.submitSearch = function() {
			$scope.searchInProgress = true;
			//$window.location.href = '/search/events/' + $scope.search;
		}

		$scope.openPaymentModal = function(eventData) {
			console.log(eventData);
			$scope.eventData = eventData;
			$('#payment-type-modal').modal('show');
		}

		$scope.startPlan = function() {
			console.log('clicked startPlan');
			console.log($scope.eventData);
			$scope.submitInProgress = true;
			if ($scope.paymentType === 'split-first') {
				$scope.nextLink = '/event-options/' + $scope.eventData.ID + '/' + $scope.eventData.Name;
			}

			if (typeof $scope.nextLink === 'undefined') {
				$scope.nextLink = '/tickets/' + $scope.eventData.ID + '/' + $scope.eventData.Name;
			}

			/* start the plan */
			wembliRpc.fetch('plan.startPlan', {
				payment: $scope.paymentType,
				eventId: $scope.eventData.ID,
				eventName: $scope.eventData.Name
			}, function(err, result) {
				console.log(result);
				if (!result.success) {
					$('#no-event-modal').modal('show');
					$('#payment-type-modal').modal('hide');
					return;
				}

				googleAnalytics.trackEvent('Plan', 'start', $scope.eventName, '', function(err, result) {
					$scope.submitInProgress = false;
					/* go to the next page which depends on whether they are splitting with friends or paying themself */
					$window.location.href = $scope.nextLink;
				});
			})
		};

	}
]);
