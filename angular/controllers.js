/* Controllers */
angular.module('wembliApp.controllers', []).

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
			/* start the plan */
			wembliRpc.fetch('plan.startPlan', {
				payment: $scope.paymentType,
				eventId: $scope.eventId,
				eventName: $scope.eventName
			}, function(err, result) {

				ga.trackEvent('Plan', 'start', $scope.eventName);

				plan.fetch(function() {
					$scope.submitInProgress = false;
					$location.path($scope.nextLink);
				});
			})
		};
	}
]).


controller('TestCtrl', ['$scope',
	function($scope) {}
]);

