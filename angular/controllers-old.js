/* Controllers */
angular.module('wembliApp.controllers-old', []).

/*
 * Confirm Email Controller
 */

controller('ConfirmCtrl', ['$scope', 'wembliRpc',
	function($scope, wembliRpc) {
		wembliRpc.fetch('confirm.init', {},
			function(err, result) {
				$scope.emailError = result.emailError;
				$scope.resent = result.resent;
				$scope.expiredToken = result.expiredToken;
			});
	}
]).

controller('LandingPageSearchCtrl', ['$rootScope', '$scope', '$location', 'wembliRpc', 'pixel',
	function($rootScope, $scope, $location, wembliRpc, pixel) {

		$rootScope.$broadcast('search-page-loaded', {});

		$scope.searchInProgress = false;

		$scope.$on('search-page-loaded', function() {
			$scope.searchInProgress = false;
		});

		$scope.submitSearch = function() {
			$scope.searchInProgress = true;
			$location.path('/search/events/' + $scope.search);
		}

	}
]).

controller('LandingPageCtrl', ['$rootScope', '$scope', '$location', 'wembliRpc', 'pixel',
	function($rootScope, $scope, $location, wembliRpc, pixel) {
		$scope.searchInProgress = false;
		$scope.signupInProgress = false;
		$scope.showSearch = false;

		$scope.listId = 'a55323395c';

		$scope.submitSearch = function() {
			$scope.searchInProgress = true;
			$location.path('/search/events/' + $scope.search);
		}


		$scope.submitSignup = function() {
			$scope.signupInProgress = true;

			if ($scope.landingPageSignupForm.$invalid) {
				$scope.signupInProgress = false;
				return;
			}

			wembliRpc.fetch('customer.signup', {
				firstName: $scope.firstName,
				lastName: $scope.lastName,
				email: $scope.email,
				promo: $scope.promo,
				listId: $scope.listId
			}, function(err, result) {
				console.log($scope.customer);
				$scope.signupInProgress = false;

				if (result.customer) {
					$rootScope.customer = result.customer;
				}

				if (result.loggedIn) {
					$rootScope.loggedIn = result.loggedIn;
				}

				$scope.signupError = false;
				$scope.formError = false;
				$scope.accountExists = false;
				$scope.showSearch = true;

				$rootScope.$broadcast('search-page-loaded', {});

				$scope.$on('search-page-loaded', function() {
					$scope.searchInProgress = false;
				});
				/* fire the san diego chargers conversion pixel */
				/* fire the facebook signup pixels */
				pixel.fire({
					type: 'signup',
					campaign: $scope.campaign,
					source: 'facebook',
					medium: 'cpc',
					term: '',
					content: $scope.pixelId
				});
				/*
				pixel.fire({
					type: 'test',
					campaign: 'Test 01',
					source: 'facebook',
					medium: 'cpc',
					term: '',
					content: '6012676009971',
				});

				pixel.fire({
					type: 'test',
					campaign: 'Test 02',
					source: 'facebook',
					medium: 'cpc',
					term: '',
					content: '6012676037771',
				});
				*/
			});
		}
	}
]);
