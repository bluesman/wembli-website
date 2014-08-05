'use strict';

/* Directives */
angular.module('wembliApp.directives.dashboard', []).

/* do i need to fetch modals? i don't think so */
directive('dashboard', ['customer', '$rootScope', 'wembliRpc', '$location',
  function(customer, $rootScope, wembliRpc, $location) {
    return {
      restrict: 'C',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {

          /* watch for the customer updated event and update scope.customer */
          scope.$on('customer-changed', function(e, args) {
            scope.customer = customer.get();
            scope.noValidBankAccounts = true;
            /* check for a valid bank account */
            if (typeof scope.customer.balancedAPI !== "undefined" &&
                typeof scope.customer.balancedAPI.bankAccounts !== "undefined") {
              angular.forEach(scope.customer.balancedAPI.bankAccounts.items, function(bank) {
                if (bank.is_valid) {
                  scope.needBankAccountInfo = false;
                }
              });
            }
            if (typeof scope.customer.balancedAPI !== "undefined" &&
                typeof scope.customer.balancedAPI.creditCards !== "undefined") {
              angular.forEach(scope.customer.balancedAPI.creditCards.items, function(bank) {
                if (bank.is_valid) {
                  scope.needCreditCardInfo = false;
                }
              });
            }
          });

          wembliRpc.fetch('dashboard.init', {}, function(err, result) {
            if (err) {
              alert('error happened - contact help@wembli.com');
              return;
            }
            /* is there a credit card? */
            if (typeof result.customer.balancedAPI === "undefined" ||
                typeof result.customer.balancedAPI.creditCards == "undefined" ||
                typeof result.customer.balancedAPI.creditCards.items[0] === "undefined") {
              scope.needCreditCardInfo = true;
            }

            /* is there a bank account? */
            if (typeof result.customer.balancedAPI === "undefined" ||
                typeof result.customer.balancedAPI.bankAccounts == "undefined" ||
                typeof result.customer.balancedAPI.bankAccounts.items[0] === "undefined") {
              scope.needBankAccountInfo = true;
            }


            /* put the result in the scope for the children scopes */
            scope.dashboard = result;
            customer.set(result.customer);
            console.log(result);
            /* let the modals know that the dashboard has been initialized */
            $rootScope.$broadcast('dashboard-fetched', result);
          });
        };
      },
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
            wembliRpc.fetch('customer.updateAccountHolderInfo', accountInfo, function(err, result) {
              if (err) {
                alert('something bad happened contact help@wembli.com');
              }
              /* back from creating merchant account */
              $location.hash('#payment-information');
              $('#edit-customer-account').modal("hide");

            }, function(data, headersGetter) {

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
              $location.hash('#payment-information');
              $('#add-bank-account').modal("hide");

            }, function(data, headersGetter) {
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
            scope.bankAccountUri = args.uri;
          });
        };
      }
    }
  }
]);
