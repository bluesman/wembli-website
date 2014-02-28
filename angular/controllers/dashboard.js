/* Controllers */
angular.module('wembliApp.controllers.dashboard', []).


controller('DashboardMainCtrl', ['$rootScope', '$scope', '$location', 'plan',
	function($rootScope, $scope, $location, plan) {
		$scope.showList = $location.url();
		console.log($scope.showList);
		/*
		$rootScope.$on('dashboard-fetched', function() {
			console.log($scope.dashboard);
		});
		*/

		$scope.deletePlan = function(guid) {
			console.log('delete plan: '+ guid);
			plan.deactivate({guid:guid}, function(err, result) {
				console.log(result);
				$scope.dashboard['organizer'].map(function(plan) {
					console.log('plan in map: ');
					console.log(plan);
				});
				var newAry = [];
				for (var i = 0; i < $scope.dashboard['organizer'].length; i++) {
					if ($scope.dashboard['organizer'][i].guid === guid) {
						continue;
					}
					newAry.push($scope.dashboard['organizer'][i]);
				};
				$scope.dashboard['organizer'] = newAry;
				console.log($scope.dashboard['organizer']);

			});
		};

	}
]).
controller('DashboardSettingsCtrl', ['$rootScope', '$scope', '$location', 'wembliRpc','plan',
	function($rootScope, $scope, $location, wembliRpc, plan) {
		$scope.showDetail = $location.url();
		$scope.submitInProgress = false;

	  $scope.changePassword = function() {
	    /* form must be valid */
	    if ($scope.changePasswordForm.$valid) {
		  	$scope.submitInProgress = true;

	      var args = {
	        password: $scope.changePassword.password,
	        password2: $scope.changePassword.password2
	      };

	      wembliRpc.fetch('customer.changePassword', args, function(err, result) {
					console.log(result);
					$scope.submitInProgress = false;
          $scope.changePasswordForm.error = result.formError;
          $scope.changePasswordForm.mismatch = result.passwordMismatch;
          $scope.changePasswordForm.tooShort = result.passwordTooShort;
          if (!$scope.changePasswordForm.error) {
            $scope.changePasswordForm.success = true;
          }
      	});
	    }
	  };
	}
]).

controller('DashboardPaymentsCtrl', ['$rootScope', '$scope', '$window', '$location', 'plan', 'customer', 'wembliRpc',
	function($rootScope, $scope, $window, $location, plan, customer, wembliRpc) {
		$scope.showDetail = $location.url();
		$scope.submitInProgress = false;

		console.log($scope.showDetail);

		$scope.$on('bank-account-created', function(e, result) {
			$window.location.href = '/dashboard/payment-information';
		});

		$scope.addCreditCard = function() {
      if ($scope.submitInProgress) {
        return;
      }
      $scope.submitInProgress = true;
      $scope.error = $scope.formError = $scope.success = false;
      var args = {};
      args.cardHolderName = $scope.creditCard.cardHolderName;
      args.creditCardNumber = $scope.creditCard.creditCardNumber;
      args.expirationDateMonth = $scope.creditCard.expirationDateMonth;
      args.expirationDateYear = $scope.creditCard.expirationDateYear;
      args.cvv = $scope.creditCard.cvv;
      args.postalCode = $scope.creditCard.postalCode;
      wembliRpc.fetch('customer.createCreditCard', args, function(err, result) {
      	console.log(result);
        $scope.submitInProgress = false;
        if (err) {
          $scope.error = true;
          $scope.errorMessage = err;
          $scope.success = false;
          return;
        }

        if (!result.success) {
          $scope.error = true;
          $scope.success = false;
          $scope.errorMessage = result.error;
          return;
        }

        $scope.success = true;
        $rootScope.$broadcast('credit-card-created', result.friend);
				$window.location.href = '/dashboard/payment-information';
      });
		};

    $scope.deleteAccount = function() {
    	$scope.submitInProgress = true;
      wembliRpc.fetch('customer.deleteBankAccount', {}, function(err, result) {
      	console.log(result);

        if (err) {
          alert('something bad happened contact help@wembli.com');
        }
				$window.location.href = '/dashboard/payment-information';
      });

    };

    $scope.deleteCard = function() {
    	$scope.submitInProgress = true;
      wembliRpc.fetch('customer.deleteCreditCard', {}, function(err, result) {
      	console.log(result);

        if (err) {
          alert('something bad happened contact help@wembli.com');
        }
				$window.location.href = '/dashboard/payment-information';
      });

    };

	}
]);
