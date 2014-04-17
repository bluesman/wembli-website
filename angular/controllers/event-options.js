/* Controllers */
angular.module('wembliApp.controllers.eventOptions', []).

controller('EventOptionsCtrl', ['$scope', 'wembliRpc', '$window', 'plan',
	function($scope, wembliRpc, $window, plan) {

		//init login vars
		var args = {};
		//$scope.paymentOptionsError = false;
		$scope.addOnsError = false;
		$scope.inviteOptionsError = false;
		$scope.guestListOptionsError = false;
		$scope.submitInProgress = false;

		plan.get(function(p) {

			if (typeof $scope.next === "undefined") {
				$scope.next = '/invitation/' + p.event.eventId + '/' + p.event.eventName;
			}

			wembliRpc.fetch('event-options.init', {}, function(err, result) {

				//$scope.payment = result.payment;
				$scope.parking = result.parking;
				$scope.restaurant = result.restaurant;
				$scope.hotel = result.hotel;
				$scope.guest_friends = result.guestFriends;
				$scope.organizer_not_attending = result.organizerNotAttending;
				$scope.guest_list = result.guestList;
				$scope.over_21 = result.over21;

				if (Object.keys(result.errors).length > 0) {
					//$scope.paymentOptionsError = (result.errors.payment) ? true : false;
					$scope.addOnsError = (result.errors.addOns) ? true : false;
					$scope.inviteOptionsError = (result.errors.inviteOptions) ? true : false;
					$scope.guestListOptionsError = (result.errors.guestList) ? true : false;
				}
			});
		});

		$scope.submitForm = function() {
			var eventOptions = {};
			eventOptions.parking = $scope.parking;
			eventOptions.restaurant = $scope.restaurant;
			eventOptions.hotel = $scope.hotel;
			eventOptions.guest_friends = $scope.guest_friends;
			eventOptions.organizer_not_attending = $scope.organizer_not_attending;
			eventOptions.guest_list = $scope.guest_list;
			eventOptions.over_21 = $scope.over_21;

			//fetchModals.fetch('/invitation');
			$scope.submitInProgress = true;
			wembliRpc.fetch('event-options.submit', eventOptions,	function(err, result) {
					$scope.submitInProgress = false;
					if (err) {
						$scope.error = true;
						$scope.errorMessage = err;
					}

					if (!result.success) {
						$scope.error = true;
						$scope.errorMessage = result.errorMessage;
					}

					if (result.success) {
						$window.location.href = $scope.next;
					}

			});
		}
	}

]);
