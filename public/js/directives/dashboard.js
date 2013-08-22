'use strict';

/* Directives */
angular.module('wembliApp.directives.dashboard', []).

directive('dashboard', ['customer', 'fetchModals', '$rootScope', 'wembliRpc', '$location',
  function(customer, fetchModals, $rootScope, wembliRpc, $location) {
    return {
      restrict: 'E',
      replace: true,
      cache: false,
      templateUrl: "/partials/dashboard-app",
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {

          /* watch for the customer updated event and update scope.customer */
          scope.$on('customer-changed', function(e, args) {
            scope.customer = customer.get();
            console.log('customer scope changed:');
            console.log(scope.customer);
            scope.noValidBankAccounts = true;
            /* check for a valid bank account */
            if (scope.customer.balancedAPI.customerAccount) {
              angular.forEach(scope.customer.balancedAPI.bankAccounts.items, function(bank) {
                if (bank.is_valid) {
                  console.log('bank is valid: ' + bank.account_number);
                  scope.noValidBankAccounts = false;
                }
              });
            }
          });

          /* show the generic loading modal */
          $rootScope.genericLoadingModal.header = 'Fetching Your Plans...';
          $('#page-loading-modal').modal("hide");
          $('#generic-loading-modal').modal("show");

          fetchModals.fetch('/partials/modals/dashboard', function() {

            wembliRpc.fetch('dashboard.init', {}, function(err, result) {
              if (err) {
                alert('error happened - contact help@wembli.com');
                return;
              }
              /*
              if they do not have bank info and they have at least 1 plan they are organizing,
              then we need to alert them for the payment info
            */
              if (result.organizer.length && !result.customer.balancedAPI.merchantAccount) {
                scope.needPaymentInfo = true; //show an alert telling them to enter bank info
              }

              scope.welcomeMessage = "Welcome, " + result.customer.firstName + '!';

              /* let the modals know that the dashboard has been initialized */
              $rootScope.$broadcast('dashboard-fetched', result);
            });

          });


          scope.changePassword = function() {
            /* form must be valid */
            if (scope.changePasswordForm.$valid) {

              var args = {
                password: scope.changePassword.password,
                password2: scope.changePassword.password2
              };

              wembliRpc.fetch('customer.changePassword', args,

                function(err, result) {
                  console.log(result);
                  scope.changePasswordForm.error = result.formError;
                  scope.changePasswordForm.mismatch = result.passwordMismatch;
                  scope.changePasswordForm.tooShort = result.passwordTooShort;
                  if (!scope.changePasswordForm.error) {
                    scope.changePasswordForm.success = true;
                  }
                });
            }
          };

          scope.createMerchantAccount = function() {
            /* validate dob */
            var error = false;
            if (!/^\d{2}[-\/]\d{2}[-\/]\d{4}$/.test(scope.createMerchantAccount.dob)) {
              scope.createMerchantAccount.errorDob = true;
              error = true;
            } else {
              scope.createMerchantAccount.errorDob = false;
            }
            if (!/^\d{10}$/.test(scope.createMerchantAccount.phoneNumber)) {
              scope.createMerchantAccount.errorPhoneNumber = true;
              error = true;
            } else {
              scope.createMerchantAccount.errorPhoneNumber = false;
            }
            /* validate routing number */
            if (!balanced.bankAccount.validateRoutingNumber(scope.createMerchantAccount.routingNumber)) {
              scope.createMerchantAccount.errorRoutingNumber = true;
              error = true;
            } else {
              scope.createMerchantAccount.errorRoutingNumber = false;
            }

            if (error) {
              return;
            }

            /* reformat dob form MM-DD-YYYY to YYYY-MM-DD */
            var dobAry = scope.createMerchantAccount.dob.split(/[-\/]/);
            var dob = dobAry[2] + '-' + dobAry[0] + '-' + dobAry[1];

            var accountInfo = {
              name: scope.createMerchantAccount.accountHolderName,
              dob: dob,
              phoneNumber: scope.createMerchantAccount.phoneNumber,
              streetAddress: scope.createMerchantAccount.streetAddress,
              postalCode: scope.createMerchantAccount.postalCode,
              bankAccount: {
                name: scope.createMerchantAccount.accountName,
                accountNumber: scope.createMerchantAccount.accountNumber,
                routingNumber: scope.createMerchantAccount.routingNumber,
                type: scope.createMerchantAccount.accountType
              }
            }
            console.log('accountinfo for createMerchantAccount');
            console.log(accountInfo);
            /*
              this is the balanced js client lib - it doesn't let you do much..we don't want to just create a bank account
              we want to create a merchant account..for that we have to do it server side
              balanced.bankAccount.create(bankAccountData, handleCreateMerchant);
            */

            wembliRpc.fetch('customer.createMerchantAccount', accountInfo, function(err, result) {
              if (err) {
                alert('something bad happened contact help@wembli.com');
              }
              /* back from creating merchant account */
              console.log('created merchant account');
              console.log(result);
              /* TODO: handle the merchant underwrite flow
                  - if there was not enough info to underwrite (300 code), ask for more info
              */


              $('#generic-loading-modal').modal("hide");

            }, function(data, headersGetter) {

              $rootScope.genericLoadingModal.header = 'Securely saving your information...';
              $('#page-loading-modal').modal("hide");
              console.log('show generic modal');
              $('#generic-loading-modal').modal("show");
              return data;

            }, function(data, headersGetter) {
              return JSON.parse(data);
            });

          };

          /* ghetto routing for dashboard submenus */
          scope.routeDashboard = function(h) {
            console.log(h);
            console.log('hash is: ' + h)
            if (/^#/.test(h)) {
              h = h.split('#')[1];
            }
            var routes = {
              'preferences': 'showPreferences',
              'settings': 'showSettings',
              'payment-information': 'showPaymentInformation',
            };
            angular.forEach(routes, function(value, key) {
              /*default to dashboard*/
              if (typeof routes[h] === "undefined") {
                scope[value] = false;
                scope.showDashboard = true;
              } else {
                scope.showDashboard = false;
                scope[value] = (key === h);
              }
            });
            if (h === 'pony-up-info') {
              scope.showDashboard = false;
              scope.showPaymentInformation = true;
            }

          };

          scope.routeDashboard($location.hash());
        };
      },
    }
  }
]).

directive('dashboardLink', [
  function() {
    return {
      restrict: 'C',
      replace: false,
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          element.click(function() {
            scope.routeDashboard(attr.modal);
          });
        };
      }
    }
  }
]).

directive('dashboardModal', ['customer', 'wembliRpc',
  function(customer, wembliRpc) {
    return {
      restrict: 'C',
      replace: false,
      cache: false,
      controller: function($scope, $element, $attrs, $transclude) {
        console.log('init dashboard modal controller');
        $scope.$on('dashboard-fetched', function(e, args) {
          $scope.dashboard = {};
          $scope.dashboard.organizer = args.organizer;
          $scope.dashboard.archived = args.archived;
          $scope.dashboard.invited = args.invited;
          $scope.dashboard.friends = args.friends;

          console.log('plans-fetched');
          console.log($scope.dashboard);
          $('#generic-loading-modal').modal("hide");

        });

      },
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          console.log('dashboard modal linking');
        };
      }
    }
  }
]).

directive('updateCustomerInfoButton', ['$rootScope',
  function($rootScope) {
    return {
      restrict: 'C',
      replace: false,
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          element.click(function() {
            $rootScope.$broadcast('dashboard-updateCustomerInfo', {});
          });
        };
      }
    }
  }
]).

directive('updateCustomerInfo', ['customer', 'wembliRpc', '$rootScope', '$location',
  function(customer, wembliRpc, $rootScope, $location) {
    return {
      restrict: 'C',
      replace: false,
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          scope.$on('dashboard-updateCustomerInfo', function(e, args) {
            scope.customer = customer.get();
          });
          scope.updateCustomerInfo = function() {
            var accountInfo = {
              name: scope.customer.balancedAPI.customerAccount.name,
              email: scope.customer.balancedAPI.customerAccount.email,
              meta: scope.customer.balancedAPI.customerAccount.meta,
              ssn_last4: scope.customer.balancedAPI.customerAccount.ssn_last4,
              business_name: scope.customer.balancedAPI.customerAccount.business_name,
              address: scope.customer.balancedAPI.customerAccount.address,
              phone: scope.customer.balancedAPI.customerAccount.phone,
              dob: scope.customer.balancedAPI.customerAccount.dob,
              ein: scope.customer.balancedAPI.customerAccount.ein,
              facebook: scope.customer.balancedAPI.customerAccount.facebook,
              twitter: scope.customer.balancedAPI.customerAccount.twitter
            }
            console.log(accountInfo);
            wembliRpc.fetch('customer.updateAccountHolderInfo', accountInfo, function(err, result) {
              if (err) {
                alert('something bad happened contact help@wembli.com');
              }
              /* back from creating merchant account */
              console.log('updated account holder info');
              console.log(result);
              $location.hash('#payment-information');
              $('#edit-customer-account').modal("hide");
              $('#generic-loading-modal').modal("hide");

            }, function(data, headersGetter) {

              $rootScope.genericLoadingModal.header = 'Securely saving your information...';
              $('#page-loading-modal').modal("hide");
              console.log('show generic modal');
              $('#generic-loading-modal').modal("show");
              return data;

            }, function(data, headersGetter) {
              return JSON.parse(data);
            });

          };
        };
      }
    }
  }
]).

directive('addBankAccount', ['customer', 'wembliRpc', '$rootScope', '$location',
  function(customer, wembliRpc, $rootScope, $location) {
    return {
      restrict: 'C',
      replace: false,
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          scope.addBankAccount = function() {
            var accountInfo = {
              name: scope.addBankAccount.accountName,
              accountNumber: scope.addBankAccount.accountNumber,
              routingNumber: scope.addBankAccount.routingNumber,
              type: scope.addBankAccount.accountType
            }

            wembliRpc.fetch('customer.addBankAccount', accountInfo, function(err, result) {
              if (err) {
                alert('something bad happened contact help@wembli.com');
              }
              /* back from creating merchant account */
              console.log('added bank account account');
              console.log(result);
              $location.hash('#payment-information');
              $('#add-bank-account').modal("hide");
              $('#generic-loading-modal').modal("hide");

            }, function(data, headersGetter) {

              $rootScope.genericLoadingModal.header = 'Securely saving your information...';
              $('#page-loading-modal').modal("hide");
              console.log('show generic modal');
              $('#generic-loading-modal').modal("show");
              return data;

            }, function(data, headersGetter) {
              return JSON.parse(data);
            });

          };
        };
      }
    }
  }
]).

directive('deleteBankAccountButton', ['$rootScope',
  function($rootScope) {
    return {
      restrict: 'C',
      replace: false,
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          attr.$observe('uri', function(uri) {
            element.click(function() {
              $rootScope.$broadcast('dashboard-setBankAccountUri', {
                uri: uri
              });
            });
          });
        };
      }
    }
  }
]).

directive('activityFeed', [
  function() {
    return {
      restrict: 'E',
      replace: true,
      cache: false,
      templateUrl: "/partials/activity-feed",
      compile: function(element, attr, transclude) {
        console.log('in dashboard');
      }
    }
  }
]).

directive('deleteBankAccount', ['customer', 'wembliRpc', '$rootScope', '$location',
  function(customer, wembliRpc, $rootScope, $location) {
    return {
      restrict: 'C',
      replace: false,
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          scope.$on('dashboard-setBankAccountUri', function(e, args) {
            console.log('on dashboard-setBankAccountUri');
            scope.bankAccountUri = args.uri;
          });
          scope.deleteBankAccount = function() {
            console.log('delete bank account:');
            console.log(scope.bankAccountUri);

            wembliRpc.fetch('customer.deleteBankAccount', {
              uri: scope.bankAccountUri
            }, function(err, result) {
              if (err) {
                alert('something bad happened contact help@wembli.com');
              }

              $location.hash('#payment-information');
              $('#delete-bank-account').modal("hide");
              $('#generic-loading-modal').modal("hide");

            }, function(data, headersGetter) {

              $rootScope.genericLoadingModal.header = 'Securely saving your information...';
              $('#page-loading-modal').modal("hide");
              console.log('show generic modal');
              $('#generic-loading-modal').modal("show");
              return data;

            }, function(data, headersGetter) {
              return JSON.parse(data);
            });

          };
        };
      }
    }
  }
]);
