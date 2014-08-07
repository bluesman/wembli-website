/* Controllers */
angular.module('wembliApp.controllers.search', []).

/*
 * Event List Controller
 */

controller('EventListCtrl', ['$scope', '$location', 'wembliRpc', '$filter', '$rootScope', 'plan', '$timeout',
	function($scope, $location, wembliRpc, $filter, $rootScope, plan, $timeout) {

	}
]).


controller('SearchCtrl', ['$scope', '$rootScope', '$window', 'wembliRpc', 'googleAnalytics', 'overlay',
	function($scope, $rootScope, $window, wembliRpc, googleAnalytics, overlay) {
		$rootScope.$broadcast('search-page-loaded', {});

		$scope.submitInProgress = false;

		$scope.searchInProgress = false;

		$scope.showPaymentType = false;

		$scope.$on('search-page-loaded', function() {
			$scope.searchInProgress = false;
		});

		$scope.submitSearch = function() {
			$scope.searchInProgress = true;
			//$window.location.href = '/search/events/' + $scope.search;
		}

		$scope.openPaymentModal = function(eventData) {
			$scope.eventData = eventData;
			$scope.showPaymentType = true;
			overlay.show();
		}

		$scope.closePaymentModal = function() {
			$scope.showPaymentType = false;
			overlay.loading(false);
			overlay.hide();
		}

		$rootScope.$on('overlay-clicked', function() {
			console.log('overlay clicked');
			$rootScope.$apply(function() {
				$scope.closePaymentModal();
			});
		});

		$scope.splitAfter = function() {
			$scope.paymentType = 'split-after';
			$scope.startPlan();
		};

		$scope.splitFirst = function() {
			$scope.paymentType = 'split-first';
			$scope.startPlan();
		};

		$scope.startPlan = function() {
			$scope.showPaymentType = false;
			overlay.loading(true);
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
					$scope.closePaymentModal();
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
