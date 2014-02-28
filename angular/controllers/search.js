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

		$scope.openPaymentModal = function(event) {
			console.log(event);
			$scope.event = event;
			$('#payment-type-modal').modal('show');
		}

	}
]).

controller('PaymentTypeModalCtrl', ['$scope', '$location', 'plan', 'wembliRpc', '$rootScope', 'googleAnalytics',
	function($scope, $location, plan, wembliRpc, $rootScope, ga) {
		$scope.$on('payment-type-modal-clicked', function(e, args) {
			$scope.$apply(function() {
				$scope.name = args.name;
				$scope.eventId = args.eventId;
				$scope.eventName = args.eventName;
				$scope.nextLink = args.nextLink;
			});
		});
		$scope.submitInProgress = false;

		$scope.startPlan = function() {
			$scope.submitInProgress = true;
			if ($scope.paymentType === 'split-first') {
				$scope.nextLink = '/event-options/' + $scope.eventId + '/' + $scope.eventName;
			}

			if (typeof $scope.nextLink === 'undefined') {
				$scope.nextLink = '/tickets/' + $scope.eventId + '/' + $scope.eventName;
			}
			/* start the plan */
			wembliRpc.fetch('plan.startPlan', {
				payment: $scope.paymentType,
				eventId: $scope.eventId,
				eventName: $scope.eventName
			}, function(err, result) {
				console.log(result);
				ga.trackEvent('Plan', 'start', $scope.eventName);

				plan.fetch(function() {
					$scope.submitInProgress = false;
					/* go to the next page which depends on whether they are splitting with friends or paying themself */

					$location.path($scope.nextLink);
				});
			})
		};
	}
]);

