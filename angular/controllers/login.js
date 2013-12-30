/* Controllers */
angular.module('wembliApp.controllers.login', []).


controller('SupplyPasswordCtrl', ['$scope', 'wembliRpc', '$window',
	function($scope, wembliRpc, $window) {
		$scope.confirmPasswordForm = {};
		$scope.confirmPasswordForm.passwordMismatch = false;
		$scope.confirmPasswordForm.fatalError = false;
		$scope.confirmPasswordInProgress = false;

		$scope.email = $('#email').val();
		$scope.token = $('#token').val();
		$scope.redirectUrl = $('#redirectUrl').val();

		$scope.submitConfirmPasswordForm = function() {
			if ($scope.confirmPasswordForm.$invalid) {
				return;
			}

			$scope.confirmPasswordInProgress = true;
			console.log($scope.email);
			wembliRpc.fetch('customer.resetPassword', {
				email: $scope.email,
				token: $scope.token,
				password: $scope.password,
				password2: $scope.password2
			}, function(err, results) {
				console.log(err);
				console.log(results);

				if (err) {
					console.log('fatal err');
					$scope.confirmPasswordForm.fatalError = err;
					$scope.confirmPasswordInProgress = false;
					return;
				}

				if (results.passwordMismatch) {
					$scope.confirmPasswordForm.passwordMismatch = results.passwordMismatch;
					$scope.confirmPasswordInProgress = false;
				} else {
					$scope.confirmPasswordInProgress = false;
					$window.location.href = ($scope.redirectUrl) ? $scope.redirectUrl : '/dashboard';
				}

			});
		}
	}
]).

controller('SignupCtrl', ['$scope', '$window', 'wembliRpc', 'pixel', 'googleAnalytics',
	function($scope, $window, wembliRpc, pixel, googleAnalytics) {
		$scope.signupForm = {};
		$scope.signupForm.exists = false;
		$scope.signupForm.fatalError = false;
		$scope.signupInProgress = false;

		$scope.submitSignupForm = function() {

			if ($scope.signupForm.$invalid) {
				return;
			}

			$scope.signupInProgress = true;

			wembliRpc.fetch('customer.signup', {
				firstName: $scope.firstName,
				lastName: $scope.lastName,
				email: $scope.email,
			}, function(err, results) {

				if (err) {
					console.log('fatal err');
					$scope.signupForm.fatalError = err;
					$scope.signupInProgress = false;
					return;
				}

				if (results.exists) {
					$scope.signupForm.exists = results.exists;
					$scope.signupInProgress = false;
				} else {

					/* fire the signup pixels */
					var gCookie = googleAnalytics.getCookie();

					pixel.fire({
						type: 'signup',
						campaign: gCookie.__utmz.utmccn,
						source: 'google',
						medium: gCookie.__utmz.utmcmd,
						term: gCookie.__utmz.utmctr,
						content: '1070734106',
					});

		      pixel.fire({
		        type: 'signup',
		        campaign: 'Signup Conversion Pixel Facebook Ad',
		        source: 'facebook',
		        medium: 'cpc',
		        term: '',
		        content: '6013588786171',
		      });

					$scope.signupInProgress = false;
					$window.location.href = ($scope.redirectUrl) ? $scope.redirectUrl : '/dashboard';
				}



			});
		}
	}
]).


/*
 * Login Controller
 */

controller('LoginCtrl', ['$scope', '$window', 'wembliRpc',
	function($scope, $window, wembliRpc) {
		$scope.loginForm = {};
		$scope.loginForm.invalidCredentials = false;

		$scope.forgotPasswordForm = {};
		$scope.forgotPasswordForm.noCustomer = false;
		$scope.forgotPasswordForm.success = false;

		$scope.forgotPasswordInProgress = false;
		$scope.loginInProgress = false;


		if ($scope.rememberEmail) {
			$scope.loginForm.email = $scope.rememberEmail;
			$scope.loginForm.remember = true;
		}

		/* need to handle redirectUrl */
		$scope.submitLoginForm = function() {
			if ($scope.loginForm.$invalid) {
				console.log('login form is not valid');
				return;
			}

			$scope.loginInProgress = true;

			if ($scope.loginForm.remember) {
				/* set cookie with email address in it */
			}

			wembliRpc.fetch('customer.login', {
				email: $scope.email,
				password: $scope.password,
			}, function(err, results) {
				$scope.loginInProgress = false;

				if (err) {
					console.log('fatal err');
					$scope.loginForm.fatalError = err;
					return;
				}

				if (results.error) {
					$scope.loginForm.invalidCredentials = true;
				} else {
					$window.location.href = ($scope.redirectUrl) ? $scope.redirectUrl : '/dashboard';
				}
			});
		};

		$scope.submitForgotPasswordForm = function() {

			if ($scope.forgotPasswordForm.$invalid) {
				return;
			}

			$scope.forgotPasswordInProgress = true;

			wembliRpc.fetch('customer.sendForgotPasswordEmail', {
				email: $scope.email,
			}, function(err, results) {
				$scope.forgotPasswordInProgress = false;

				if (err) {
					$scope.forgotPasswordForm.fatalError = err;
					return;
				}
				if (results.error) {
					$scope.forgotPasswordForm.noCustomer = true;
				} else {
					$scope.submitForgotPasswordForm.success = true;
				}
			});
		};

	}
]);

