/* Controllers */
angular.module('wembliApp.controllers.login', []).

/* this function should eventually replace the individual login and signup controllers below */
controller('RsvpLoginCtrl', ['$scope', 'plan', 'customer', 'wembliRpc', 'pixel', 'googleAnalytics', '$window',
	function($scope, plan, customer, wembliRpc, pixel, googleAnalytics, $window) {
		$scope.listId = 'a55323395c';

		$scope.$watch('service', function(n, o) {
			if (n !== "undefined") {
				console.log(n);
				if (n === 'wemblimail') {
					wembliRpc.fetch('friend.getServiceId', {
						token: $scope.token
					}, function(err, result) {
						if (result.serviceId) {
							$scope.email = result.serviceId;
						}
					});
				} else {
					if ($scope.customer && (n === 'twitter') || (n === 'facebook')) {
						$scope.confirmSocial = n;
						console.log('confirmSocial: '+$scope.confirmSocial);
					}
				}
			}
		});

		$scope.$watch('guid', function(n, o) {
			$scope.next = '/rsvp/' + $scope.guid + '/' + $scope.token + '/' + $scope.service;
			console.log('next: '+$scope.next);
		})

		$scope.confirm = function(social) {
			if (typeof social === "undefined") {
				if ($scope.customer && ($scope.service !== 'twitter') && ($scope.service !== 'facebook')) {
					return true;
				} else {
					return false;
				}
			}

			return (social === $scope.service) ? true : false;
		};

    $scope.$on('forgot-password-email-sent', function(e, err) {
      if (err) {
        $scope.forgotPasswordEmailError = true;
      } else {
        $scope.forgotPasswordEmailError = false;
        $scope.forgotPasswordEmailSent = true;
      }
    });

    /* default to show the signup form */
    $scope.showSignupForm = true;
    $scope.inProgress = false;

    $scope.showForm = function(show, hide) {
      $scope[show] = true;
      $scope[hide] = false;
    }

    /* this should be in a service cause it happens in a few diff places */
    $scope.submitSignup = function() {
      $scope.forgotPasswordEmailError = false;
      $scope.forgotPasswordEmailSent = false;

      if ($scope.signup.$valid) {

	      $scope.inProgress = true;

        var rpcArgs = {
          'firstName': $scope.firstName,
          'lastName': $scope.lastName,
          'email': $scope.email,
          'next': $scope.next,
          'listId': $scope.listId
        };

        wembliRpc.fetch('customer.signup', rpcArgs, function(err, result) {
        	console.log('back from customer signup');
        	console.log(result);
          if (result.exists && !result.noPassword) {
          	console.log('account exists and has password');
            $scope.login.accountExists = true;
            return $scope.showForm('showLoginForm', 'showSignupForm');
          }

          if (result.noPassword) {
          	console.log('no password');
            return $scope.showForm('showLoginUnconfirmedForm', 'showSignupForm');
          }

          if (result.formError) {
            $scope.signup.formError = true;
            return;
          }

          /* no error */
          $scope.customer = customer.get();

					var confirmSocialMap = {
						facebook: true,
						twitter: true
					};

					/* if the service is facebook or twitter they need to confirm social */
					if ((typeof confirmSocialMap[$scope.service] !== "undefined") && confirmSocialMap[$scope.service]) {
						$scope.confirmSocial = $scope.service;
					}

          $scope.signup.success = true;
          console.log('submit signup succes - fire pixel');

          /* fire the signup pixels */
          var gCookie = googleAnalytics.getCookie();

          googleAnalytics.trackEvent('Customer', 'signup', 'signup', '', function(err, result) {});

          pixel.fire({
            type: 'signup',
            campaign: gCookie.__utmz.utmccn,
            source: 'google',
            medium: gCookie.__utmz.utmcmd,
            term: gCookie.__utmz.utmctr,
            content: '1070734106',
          });

          /* fire the facebook signup pixels */
          pixel.fire({
            type: 'signup',
            campaign: 'Signup Conversion Pixel Facebook Ad',
            source: 'facebook',
            medium: 'cpc',
            term: '',
            content: '6013588786171',
          });

          /*
          pixel.fire({
            type: 'purchase',
            campaign: 'Purchase Conversion Pixel Facebook Ad',
            source: 'facebook',
            medium: 'cpc',
            term: '',
            content: '6013588780171',
          });
          */
          /* load next page */
          if (!$scope.confirmSocial) {
	          console.log('navigate to: '+ $scope.next);
						return $window.location.href = $scope.next;
					}
        });
      } else {}
    };

    $scope.submitLogin = function() {
      $scope.forgotPasswordEmailError = false;
      $scope.forgotPasswordEmailSent = false;

      if ($scope.login.$valid) {

        var rpcArgs = {
          'email': $scope.email,
          'password': $scope.password,
        };

        wembliRpc.fetch('customer.login', rpcArgs, function(err, result) {

          if (result.noPassword) {
            return $scope.showForm('showLoginUnconfirmedForm', 'showLoginForm');
          }

          if (result.invalidCredentials) {
            $scope.login.invalidCredentials = true;
            return;
          }

          $scope.login.success = true;
					return $window.location.href = $scope.next;
        });
      } else {}
    };
	}
]).

controller('SupplyPasswordCtrl', ['$scope', 'wembliRpc', '$window',
	function($scope, wembliRpc, $window) {
		$scope.confirmPasswordForm = {};
		$scope.confirmPasswordForm.passwordMismatch = false;
		$scope.confirmPasswordForm.fatalError = false;
		$scope.confirmPasswordInProgress = false;

		$scope.email = $('#email').val();
		$scope.token = $('#token').val();
		$scope.redirectUrl = $('#redirectUrl').val();
		console.log('redirecturl: '+$scope.redirectUrl);
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
					console.log('supplied password - redirect to: '+$scope.redirectUrl);
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
					$scope.forgotPasswordForm.success = true;
				}
			});
		};

	}
]);

