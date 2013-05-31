'use strict';

/* Directives */
angular.module('wembliApp.directives', []).
//trigger partial - kind of a hack - but basically sets rootScope bool to let everyone know that
//the original page has loaded and partials will be loaded from now on
directive('triggerPartial', ['$rootScope',
  function($rootScope) {
    return {
      restrict: 'C',
      link: function(scope, element, attr) {
        $rootScope.partial = true;
      }
    }
  }
]).

directive('toggleSelected', [
  function() {
    return {
      restrict: 'C',
      link: function(scope, element, attr) {
        $(document).click(function() {
          element.removeClass('selected');
        });
        element.click(function() {
          if (element.hasClass('selected')) {
            element.removeClass('selected');
          } else {
            element.addClass('selected');
          }
        })
      }
    }
  }
]).

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
              angular.forEach(scope.customer.balancedAPI.customerAccount.bank_accounts.items, function(bank) {
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
            /* reformat dob form MM-DD-YYYY to YYYY-MM-DD */
            var dobAry = scope.createMerchantAccount.dob.split('-');
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
            console.log('hash is: ' + h);
            scope.showDashboard = (h === '' || /dashboard/.test(h));
            scope.showPreferences = /preferences/.test(h);
            scope.showSettings = /settings/.test(h);
            scope.showPaymentInformation = /payment-information/.test(h);
            if (/pony-up-info/.test(h)) {
              scope.showPaymentInformation = true;
              $('#pony-up-info').modal("show");
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
            scope.routeDashboard(attr.href);
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
]).

directive('planNav', ['$location',
  function($location) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: "/partials/plan/nav",
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          var elId = '#' + element.attr('id').split('-')[1];

          /* this had to wait for dashboard to load */
          var sectionNumber = 1;

          /* scroll down to the section denoted by hash */
          if ($location.hash()) {
            var h = $location.hash();
            sectionNumber = parseInt(h.charAt(h.length - 1));
            console.log('scroll down to ' + sectionNumber);
          }

          /* get the heights of all the sections */
          var height = 0;
          for (var i = 1; i < sectionNumber; i++) {
            height += parseInt($('#section' + i).height()) + 20;
            console.log('height after section' + i + ' ' + height);
          };

          $('#content').animate({
            scrollTop: height
          });
          $('.plan-section-nav').removeClass('active');
          $('#nav-section' + (sectionNumber)).addClass('active');
        };
      }
    }
  }
]).

directive('scrollTo', ['$window',
  function($window) {
    return {
      restrict: 'EAC',
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          element.click(function() {
            var elId = '#' + element.attr('id').split('-')[1];
            var sectionNumber = parseInt(elId.charAt(elId.length - 1));
            /* get the heights of all the sections */
            var height = 20;
            for (var i = 1; i < sectionNumber; i++) {
              height += parseInt($('#section' + i).height());
              console.log('height after section' + i + ' ' + height);
            };

            //console.log('scroll to: ' + elId + ' - ' + height);
            $('#content').animate({
              scrollTop: height
            });
          });
        };
      }
    }
  }
]).

directive('friendPlanDashboard', ['$window', '$location', 'wembliRpc', 'plan', 'customer', 'pluralize',
  function($window, $location, wembliRpc, plan, customer, pluralize) {
    return {
      restrict: 'C',
      cache: false,
      compile: function(element, attr, transclude) {

        return function(scope, element, attr, controller) {
          var height = angular.element($window).height();
          $('#section6').css('min-height', height);

          var submitVote = function() {
            wembliRpc.fetch('friend.submitVote', {
              tickets: {
                number: scope.me.rsvp.guestCount,
                decision: scope.me.rsvp.decision,
                price: scope.me.rsvp.tickets.price,
                priceGroup: scope.me.rsvp.tickets.priceGroup,
              },
              parking: {
                number: scope.me.rsvp.guestCount,
                decision: scope.me.rsvp.parking.decision,
                price: scope.me.rsvp.parking.price,
                priceGroup: scope.me.rsvp.parking.priceGroup
              },
              restaurant: {
                number: scope.me.rsvp.guestCount,
                decision: scope.me.rsvp.restaurant.decision,
                price: scope.me.rsvp.restaurant.price,
                priceGroup: scope.me.rsvp.restaurant.priceGroup,
                preference: scope.me.rsvp.restaurant.preference
              },
              hotel: {
                number: scope.me.rsvp.guestCount,
                decision: scope.me.rsvp.hotel.decision,
                price: scope.me.rsvp.hotel.price,
                priceGroup: scope.me.rsvp.hotel.priceGroup,
                preference: scope.me.rsvp.hotel.preference
              },
            }, function(err, result) {
              console.log(result);
              scope.me = result.friend;
              /* update scope friends too */
              var f = [];
              angular.forEach(scope.friends, function(friend) {
                if (friend._id === result.friend._id) {
                  f.push(result.friend);
                } else {
                  f.push(friend);
                }
              }, f);
              scope.friends = f;
            });
          };

          var calcVotePriceTotal = function() {
            console.log('calc vote price total');
            var total = 0;
            if (parseInt(scope.me.rsvp.tickets.price) > 0) {
              total += parseInt(scope.me.rsvp.tickets.price);
            }

            if (scope.plan.preferences.addOns.parking) {
              if (parseInt(scope.me.rsvp.parking.price) > 0) {
                total += parseInt(scope.me.rsvp.parking.price);
              }
            }

            if (scope.plan.preferences.addOns.restaurants) {
              if (parseInt(scope.me.rsvp.restaurant.price) > 0) {
                total += parseInt(scope.me.rsvp.restaurant.price);
              }
            }

            if (scope.plan.preferences.addOns.hotels) {
              if (parseInt(scope.me.rsvp.hotel.price) > 0) {
                total += parseInt(scope.me.rsvp.hotel.price);
              }
            }

            scope.votePriceTotalPerPerson = total;
            scope.votePriceTotal = total * scope.me.rsvp.tickets.number;
          }

          /* toggle decision when guest cound goes above 0 */
          scope.$watch('me.rsvp.guestCount', function(newVal, oldVal) {
            console.log('guest count is: ');
            console.log(newVal);
            console.log(scope.me.rsvp.guestCount);

            if (typeof scope.me.rsvp.guestCount === "undefined") {
              return;
            }

          });

          /* watch the rsvp checkboxes */
          scope.$watch('me.rsvp.parking.decision', function(val) {
            if (typeof val === "undefined") {
              return;
            }
            submitVote();
          });
          scope.$watch('me.rsvp.restaurant.decision', function(val) {
            if (typeof val === "undefined") {
              return;
            }
            submitVote();
          });
          scope.$watch('me.rsvp.hotel.decision', function(val) {
            if (typeof val === "undefined") {
              return;
            }
            submitVote();
          });

          /* watch the price values to update the total */
          scope.$watch('me.rsvp.tickets.price', function(val) {
            if (typeof val === "undefined") {
              return;
            }

            calcVotePriceTotal();
          });
          scope.$watch('me.rsvp.parking.price', function(val) {
            if (typeof val === "undefined") {
              return;
            }
            calcVotePriceTotal();
          });
          scope.$watch('me.rsvp.restaurant.price', function(val) {
            if (typeof val === "undefined") {
              return;
            }
            calcVotePriceTotal();
          });
          scope.$watch('me.rsvp.hotel.price', function(val) {
            if (typeof val === "undefined") {
              return;
            }
            calcVotePriceTotal();
          });

          /* watch the checkboxes and toggle muted class */
          /*
        scope.$watch('me.rsvp.parking.decision',function(value) {
          console.log('parking-slider-containers muted: '+value);
          if (value) {
            $('.parking-slider-container').removeClass('muted');
          } else {
            $('.parking-slider-container').addClass('muted');
          }
        });
        */

          var toggleSlider = function(id, val) {
            console.log('toggle ' + id + ' val ' + val);
            if (val) {
              $(id).slider("enable");
            } else {
              $(id).slider("disable");
            }
          }

          var toggleMultiselect = function(id, val) {
            console.log('toggle ' + id + ' val ' + val);
            if (val) {
              $(id).multiselect("enable");
            } else {
              $(id).multiselect("disable");
            }
          }

          scope.toggleInputs = function(category, val) {
            var categories = {
              'restaurant': function(val) {
                toggleSlider('#restaurant-price-slider', val);
                toggleMultiselect('#food-preference', val)
              },
              'parking': function(val) {
                toggleSlider('#parking-price-slider', val);
              },
              'hotel': function(val) {
                toggleSlider('#hotel-price-slider', val);
                toggleMultiselect('#hotel-preference', val)
              },
            };
            categories[category](val);

          };

          /*multiselect events */
          scope.foodPreferenceClick = function(event, ui) {
            console.log('clicked on a food pref option:' + ui.value);
            if (typeof scope.me.rsvp.restaurant.preference === "undefined") {
              scope.me.rsvp.restaurant.preference = [];
            }
            if (ui.checked) {
              scope.me.rsvp.restaurant.preference.push(ui.value);
            } else {
              /* find the value in the model and remove it */
              var n = [];
              for (var i = 0; i < scope.me.rsvp.restaurant.preference.length; i++) {
                var p = scope.me.rsvp.restaurant.preference[i];
                if (p !== ui.value) {
                  n.push(p);
                }
              }
              scope.me.rsvp.restaurant.preference = n;
            }

            submitVote();
          }
          scope.hotelPreferenceClick = function(event, ui) {
            console.log('clicked on a hotel pref option:' + ui.value);
            if (typeof scope.me.rsvp.hotel.preference === "undefined") {
              scope.me.rsvp.hotel.preference = [];
            }
            if (ui.checked) {
              scope.me.rsvp.hotel.preference.push(ui.value);
            } else {
              /* find the value in the model and remove it */
              var n = [];
              for (var i = 0; i < scope.me.rsvp.hotel.preference.length; i++) {
                var p = scope.me.rsvp.hotel.preference[i];
                if (p !== ui.value) {
                  n.push(p);
                }
              }
              scope.me.rsvp.hotel.preference = n;
            }

            submitVote();
          }

          /* vote sliders */
          scope.ticketsPriceSlide = function(event, ui) {
            console.log('ticket price is sliding');
            console.log(ui.value);
            scope.me.rsvp.tickets.price = ui.value;

            if (ui.value > 0) {
              scope.me.rsvp.tickets.priceGroup.low = true;
            }
            if (ui.value > 100) {
              scope.me.rsvp.tickets.priceGroup.med = true;
            }
            if (ui.value > 300) {
              scope.me.rsvp.tickets.priceGroup.high = true;
            }
            if (ui.value <= 100) {
              scope.me.rsvp.tickets.priceGroup.med = false;
            }
            if (ui.value <= 300) {
              scope.me.rsvp.tickets.priceGroup.high = false;
            }
          }
          scope.ticketsPriceStop = function(event, ui) {
            console.log('price slider is stopped');
            /* when they stop we save it */
            submitVote();
          }

          scope.parkingPriceSlide = function(event, ui) {
            console.log('parking price is sliding');
            scope.me.rsvp.parking.price = ui.value;

            if (ui.value > 0) {
              scope.me.rsvp.parking.priceGroup.low = true;
            }
            if (ui.value > 25) {
              scope.me.rsvp.parking.priceGroup.med = true;
            }
            if (ui.value > 50) {
              scope.me.rsvp.parking.priceGroup.high = true;
            }
            if (ui.value <= 25) {
              scope.me.rsvp.parking.priceGroup.med = false;
            }
            if (ui.value <= 50) {
              scope.me.rsvp.parking.priceGroup.high = false;
            }


          }
          scope.parkingPriceStop = function(event, ui) {
            console.log('parking price is sliding');
            submitVote();
          }

          scope.restaurantPriceSlide = function(event, ui) {
            console.log('restaurant price is sliding');
            console.log(ui.value);
            scope.me.rsvp.restaurant.price = ui.value;

            if (ui.value > 0) {
              scope.me.rsvp.restaurant.priceGroup.low = true;
            }
            if (ui.value > 25) {
              scope.me.rsvp.restaurant.priceGroup.med = true;
            }
            if (ui.value > 50) {
              scope.me.rsvp.restaurant.priceGroup.high = true;
            }
            if (ui.value <= 25) {
              scope.me.rsvp.restaurant.priceGroup.med = false;
            }
            if (ui.value <= 50) {
              scope.me.rsvp.restaurant.priceGroup.high = false;
            }
          }
          scope.restaurantPriceStop = function(event, ui) {
            console.log('price slider is stopped');
            submitVote();
          }

          scope.hotelPriceSlide = function(event, ui) {
            console.log('hotel price is sliding');
            console.log(ui.value);
            scope.me.rsvp.hotel.price = ui.value;

            if (ui.value > 0) {
              scope.me.rsvp.hotel.priceGroup.low = true;
            }
            if (ui.value > 100) {
              scope.me.rsvp.hotel.priceGroup.med = true;
            }
            if (ui.value > 300) {
              scope.me.rsvp.hotel.priceGroup.high = true;
            }
            if (ui.value <= 100) {
              scope.me.rsvp.hotel.priceGroup.med = false;
            }
            if (ui.value <= 300) {
              scope.me.rsvp.hotel.priceGroup.high = false;
            }
          }

          scope.hotelPriceStop = function(event, ui) {
            console.log('price slider is stopped');
            submitVote();
          }

          /* handle the main plan rsvp */
          scope.setRsvp = function(rsvpFor, rsvp) {
            var funcs = {
              'decision': function(rsvp) {
                console.log('setting decision to: ' + rsvp);
                scope.me.rsvp.decision = rsvp;
                if (scope.me.rsvp.decision === false) {
                  scope.me.rsvp.guestCount = 0;
                }
                if (scope.me.rsvp.decision === true) {
                  if (scope.me.rsvp.guestCount == 0) {
                    scope.me.rsvp.guestCount = 1;
                  }
                }

                scope.calcTotalComing();

                wembliRpc.fetch('friend.submitRsvp', {
                  decision: scope.me.rsvp.decision,
                  guestCount: scope.me.rsvp.guestCount
                }, function(err, result) {
                  console.log(result);
                  scope.me = result.friend;
                  /* update scope friends too */
                  var f = [];
                  angular.forEach(scope.friends, function(friend) {
                    if (friend._id === result.friend._id) {
                      f.push(result.friend);
                    } else {
                      f.push(friend);
                    }
                  }, f);
                  scope.friends = f;

                });

              },

            };
            funcs[rsvpFor](rsvp);
          }

          /* key bindings for up and down arrows for guestCount */
          scope.guestCountKeyUp = function() {
            if (scope.me.rsvp.guestCount === "") {
              return;
            }
            console.log('guestcount in keyup');
            console.log(scope.me.rsvp.guestCount);
            scope.me.rsvp.decision = (scope.me.rsvp.guestCount > 0);

            scope.guestCountPlural = pluralize(scope.me.rsvp.guestCount);
            scope.calcTotalComing();

            wembliRpc.fetch('friend.submitRsvp', {
              decision: scope.me.rsvp.decision,
              guestCount: scope.me.rsvp.guestCount
            }, function(err, result) {
              console.log(result);
              scope.me = result.friend;
            });
          }


          scope.guestCountKeyDown = function(scope, elm, attr, e) {
            if (e.keyCode == 38) {
              scope.me.rsvp.guestCount++;
            }
            if (e.keyCode == 40) {
              scope.me.rsvp.guestCount--;
              if (scope.me.rsvp.guestCount < 0) {
                scope.me.rsvp.guestCount = 0;
              }
            }
          }

          if (typeof plan.getFriends() !== "undefined") {
            scope.friends = plan.getFriends();

            /* get the friend that is this customer */
            for (var i = 0; i < scope.friends.length; i++) {
              if (scope.friends[i].customerId === customer.get().id) {
                scope.me = scope.friends[i];
                scope.guestCountPlural = pluralize(scope.me.rsvp.guestCount);

                console.log('got a friend!!');
                console.log(scope.me);
              }
            };
          }

          /* safety check - if scope.me is undefined then they are not invited to this plan and shoudl not be viewing it */
          if (typeof scope.me === "undefined") {
            $location.path('/logout');
          }

          scope.calcTotalComing();

          if (scope.me.rsvp.decision === null) {
            /* if they have not set the rsvp default to yes */
            scope.setRsvp('decision', true);
          }

          console.log('parking rsvp: ' + scope.me.rsvp.parking.decision);
          if (typeof scope.me.rsvp.parking.decision === "undefined") {
            scope.me.rsvp.parking.decision = true;
          }

          if (typeof scope.me.rsvp.restaurant.decision === "undefined") {
            scope.me.rsvp.restaurant.decision = true;
          }

          if (typeof scope.me.rsvp.hotel.decision === "undefined") {
            scope.me.rsvp.hotel.decision = false;
          }
        };
      }
    };
  }
]).

directive('organizerPlanDashboard', ['$window', '$location', 'wembliRpc', 'plan', 'customer', 'pluralize',
  function($window, $location, wembliRpc, plan, customer, pluralize) {
    return {
      restrict: 'C',
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          var height = angular.element($window).height();
          $('#section9').css('min-height', height);

          var savePrefs = function(val) {
            console.log('val in save prefs');
            console.log(val);
            if (typeof val === "undefined") { return; }
            plan.savePreferences({preferences: scope.plan.preferences}, function(err, result) {
              console.log('saved prefs');
              console.log(result);
            });
          };

          /* key bindings for up and down arrows for guestCount */
          scope.guestCountKeyUp = function() {
            if (scope.plan.organizer.rsvp.guestCount === "") {
              return;
            }
            console.log('guestcount in keyup');
            console.log(scope.plan.organizer.rsvp.guestCount);
            scope.plan.organizer.rsvp.decision = (scope.plan.organizer.rsvp.guestCount > 0);

            scope.guestCountPlural = pluralize(scope.plan.organizer.rsvp.guestCount);
            scope.calcTotalComing();

            wembliRpc.fetch('plan.submitOrganizerRsvp', {
              decision: scope.plan.organizer.rsvp.decision,
              guestCount: scope.plan.organizer.rsvp.guestCount
            }, function(err, result) {
              console.log(result);
            });
          }

          scope.guestCountKeyDown = function(scope, elm, attr, e) {
            if (e.keyCode == 38) {
              scope.plan.organizer.rsvp.guestCount++;
            }
            if (e.keyCode == 40) {
              scope.plan.organizer.rsvp.guestCount--;
              if (scope.plan.organizer.rsvp.guestCount < 0) {
                scope.plan.organizer.rsvp.guestCount = 0;
              }
            }
          }

          scope.setRsvp = function(rsvp) {
            console.log('setting decision to: ' + rsvp);
            scope.plan.organizer.rsvp.decision = rsvp;

            if (scope.plan.organizer.rsvp.decision === false) {
              scope.plan.organizer.rsvp.guestCount = 0;
            }
            if (scope.plan.organizer.rsvp.decision === true) {
              if (scope.plan.organizer.rsvp.guestCount == 0) {
                scope.plan.organizer.rsvp.guestCount = 1;
              }
            }

            scope.calcTotalComing();

            wembliRpc.fetch('plan.submitOrganizerRsvp', {
              decision: scope.plan.organizer.rsvp.decision,
              guestCount: scope.plan.organizer.rsvp.guestCount
            }, function(err, result) {
              console.log(result);
            });
          }

          scope.$watch('plan.preferences.addOns.parking', savePrefs);
          scope.$watch('plan.preferences.addOns.restaurants', savePrefs);
          scope.$watch('plan.preferences.addOns.hotels', savePrefs);
          scope.$watch('plan.preferences.inviteOptions.guestFriends', savePrefs);
          scope.$watch('plan.preferences.inviteOptions.over21', savePrefs);
          scope.$watch('plan.preferences.guestList', savePrefs);

          /* make sure we have a plan */
          scope.plan = plan.get();
          console.log(scope.plan);

          scope.friends = plan.getFriends();

          scope.guestCountPlural = pluralize(scope.plan.organizer.rsvp.guestCount);

          scope.calcTotalComing();

          if (scope.plan.organizer.rsvp.decision === null) {
            scope.setRsvp(true);
          }

        };
      }
    };
  }
]).

directive('planDashboard', ['$window', 'plan', 'customer', 'pluralize',
  function($window, plan, customer, pluralize) {
    return {
      restrict: 'E',
      replace: true,
      cache: false,
      templateUrl: "/partials/plan/dashboard",
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          scope.plan = plan.get();

          scope.organizer = plan.getOrganizer();
          // TODO - make this a filter?
          scope.showEllipses = function(ary, len) {
            return (ary.join(', ').length > len);
          };

          scope.calcTotalComing = function() {
            scope.totalComing = 0;
            scope.friendsComing = [];
            console.log('calctotalcoming');
            /* get the friend that is this customer */
            for (var i = 0; i < scope.friends.length; i++) {
              if (scope.friends[i].customerId === customer.get().id) {
                if (scope.me.rsvp.decision) {
                  scope.totalComing = parseInt(scope.totalComing) + parseInt(scope.me.rsvp.guestCount);
                  scope.friendsComing.push(scope.me);
                  scope.friends[i] = scope.me;
                }
                continue;
              }

              if (scope.friends[i].rsvp.decision) {
                scope.totalComing = parseInt(scope.totalComing) + parseInt(scope.friends[i].rsvp.guestCount);
                scope.friendsComing.push(scope.friends[i]);
              }
            };
            console.log('count the organizer');
            console.log(scope.plan.organizer);
            /* count the organizer */
            if (scope.plan.organizer.rsvp.decision) {
              scope.totalComing = parseInt(scope.totalComing) + parseInt(scope.plan.organizer.rsvp.guestCount);
              scope.friendsComing.push()
            }
          };

          /* pluralize the people coming list header */
          scope.$watch('totalComing', function() {
            scope.totalComingPlural = pluralize(scope.totalComing);
          });
        };
      }
    }
  }
]).

directive('multiselect', [
  function() {
    return {
      restrict: 'C',
      compile: function(element, attr, transculde) {
        return function(scope, element, attr, controller) {
          var header = attr.header === "false" ? false : true;
          console.log('noneselectedtext');
          console.log(attr.noneSelectedText)

          var ms = element.multiselect({
            appendTo: attr.appendTo,
            position: {
              my: "left top",
              at: "left bottom"
            },
            header: header,
            noneSelectedText: attr.noneSelectedText,
            minWidth: attr.minWidth
          });

          attr.$observe('ngModel', function(m) {
            var opts = scope.$eval(m);
            if (typeof opts !== "undefined") {
              console.log(opts);
              for (var i = 0; i < opts.length; i++) {
                element.multiselect("widget").find(":checkbox[value='" + opts[i] + "']").attr("checked", "checked");
                $("#" + attr.id + " option[value='" + opts[i] + "']").attr("selected", 1);
                console.log('setting option:' + opts[i]);
              };
              element.multiselect("refresh");
            }
          });

          attr.$observe('disable', function(disable) {
            console.log('disable is: ' + attr.disable);
            if (attr.disable === "true") {
              ms.multiselect("disable");
            }
          });

          attr.$observe('click', function() {
            var clickFn = scope.$eval(attr.click);
            console.log('clickFn:');
            console.log(clickFn);
            if (typeof clickFn !== "undefined") {
              console.log('setting up click event for multiselect');
              element.on('multiselectclick', function(event, ui) {
                scope.$apply(function() {
                  clickFn.call(clickFn, event, ui, scope, element, attr);
                });
              });
            }
          });

        };
      }
    };
  }
]).

directive('priceSlider', [
  function() {
    return {
      restrict: 'C',
      compile: function(element, attr, transculde) {
        return function(scope, element, attr, controller) {
          attr.$observe('value', function(val) {

            /* figure out the slide function to call */
            var slideFn = scope.$eval(attr.slide);
            var stopFn = scope.$eval(attr.stop);

            var range = attr.range;

            if (attr.range === "true") {
              range = true;
            }
            if (attr.range === "false") {
              range = false;
            }

            element.slider({
              range: range,
              min: parseInt(attr.min),
              max: parseInt(attr.max),
              step: parseFloat(attr.step),
              value: parseInt(val),
              slide: function(event, ui) {
                scope.$apply(function() {
                  slideFn.call(slideFn, event, ui, scope, element, attr)
                });
              },
              stop: function(event, ui) {
                scope.$apply(function() {
                  stopFn.call(stopFn, event, ui, scope, element, attr)
                });
              }
            });

            attr.$observe('disable', function(disable) {
              console.log('disable is: ' + attr.disable);
              if (attr.disable === "true") {
                element.slider("disable");
              }
            });

          });

        };
      }
    };
  }
]).

directive('inviteFriendsWizard', ['fetchModals', 'plan', '$location', 'wembliRpc',
  function(fetchModals, plan, $location, wembliRpc) {
    return {
      restrict: 'C',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          fetchModals.fetch('/partials/invite-friends-wizard', function() {
            plan.get(function(plan) {

              var startDate = new Date();
              var endDate = new Date(plan.event.eventDate);
              var defaultDate = endDate;
              /* if there's an rsvp date, set it in the datepicker */
              if (typeof plan.rsvpDate !== "undefined") {
                /* init the date picker */
                var defaultDate = new Date(plan.rsvpDate);
              }

              $('.datepicker').pikaday({
                bound: false,
                minDate: startDate,
                maxDate: endDate,
                defaultDate: defaultDate,
                setDefaultDate: true,
                onSelect: function() {
                  plan.rsvpDate = this.getDate();
                  wembliRpc.fetch('invite-friends.submit-step2', {
                    rsvpDate: plan.rsvpDate
                  }, function(err, res) {
                    console.log('changed rsvpdate');
                    console.log(res);
                  });
                }
              });

              var options = {
                'backdrop': 'static',
                'keyboard': false,
              };

              if (/^\/invitation/.test($location.path())) {
                $('#invitation-modal').modal(options);
              }

              /* click the button shows the modal */
              element.click(function() {
                options.backdrop = true;
                options.keyboard = true;
                console.log(options);
                $('#invitation-modal').modal(options);
              });

            });
          });
        };
      }
    }
  }
]).

directive('planSection', ['$window',
  function($window) {
    return {
      restrict: 'EAC',
      replace: true,
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {


          angular.element('#content').on('scroll', function() {
            scope.$apply(function() {
              if (element.offset().top <= 0 && element.offset().top > -element.height()) {
                if ($('.plan-section-nav').hasClass('active')) {
                  $('.plan-section-nav').removeClass('active');
                }
                $('#nav-' + element.attr('id')).addClass('active');
              }
            });
          });
        };
      }
    }
  }
]).

directive('planFeed', ['plan', '$timeout', 'wembliRpc',
  function(plan, $timeout, wembliRpc) {
    return {
      restrict: 'E',
      replace: true,
      cache: false,
      templateUrl: "/partials/plan/feed",
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          plan.get(function(p) {
            scope.feed = plan.getFeed();
          });

          //poll for feed updates every 2 seconds
          (function tick() {
            /*
            wembliRpc.fetch('feed.get', {}, function(err, result) {
              scope.feed = result.feed;
              console.log('polled for feed');
              $timeout(tick, 5000);
            });
*/
          })();

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

directive('logActivity', ['wembliRpc',
  function(wembliRpc) {
    return {
      restrict: 'C',
      compile: function(element, attr, transclude) {
        element.click(function() {
          //get the tix and make the ticket list
          wembliRpc.fetch('feed.logActivity', {
            action: attr.action,
            meta: attr.meta || {}
          }, function(err, result) {});
        });
      }
    }
  }
]).

directive('interactiveVenueMap', ['$rootScope', 'interactiveMapDefaults', 'wembliRpc', '$window', '$templateCache', 'plan',
  function($rootScope, interactiveMapDefaults, wembliRpc, $window, $templateCache, plan) {
    return {
      restrict: 'E',
      replace: true,
      cache: false,
      templateUrl: "/partials/interactive-venue-map",
      compile: function(element, attr, transclude) {

        var generateTnSessionId = function() {
          var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
          var sid_length = 5;
          var sid = '';
          for (var i = 0; i < sid_length; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            sid += chars.substring(rnum, rnum + 1);
          }
          return sid;
        };

        return function(scope, element, attr) {

          scope.$watch('tickets', function(newVal, oldVal) {
            if (newVal !== oldVal) {
              $('#map-container').tuMap("Refresh", "Reset");
            }
          });

          plan.get(function(plan) {
            //get the tix and make the ticket list
            wembliRpc.fetch('event.getTickets', {
              eventID: plan.event.eventId
            }, function(err, result) {

              if (err) {
                //handle err
                alert('error happened - contact help@wembli.com');
                return;
              }

              scope.event = result.event;
              scope.tickets = result.tickets;

              /* get min and max tix price for this set of tix */
              var minTixPrice = 0;
              var maxTixPrice = 200;
              angular.forEach(scope.tickets, function(el) {
                if (parseInt(el.ActualPrice) < minTixPrice) {
                  minTixPrice = parseInt(el.ActualPrice);
                }
                if (parseInt(el.ActualPrice) > maxTixPrice) {
                  maxTixPrice = parseInt(el.ActualPrice);
                }

                el.selectedQty = el.ValidSplits.int[0];
                el.sessionId = generateTnSessionId();
              });

              var initSlider = function() {
                /*Set Minimum and Maximum Price from your Dataset*/
                $("#price-slider").slider("option", "min", minTixPrice);
                $("#price-slider").slider("option", "max", maxTixPrice);
                $("#price-slider").slider("option", "values", [minTixPrice, maxTixPrice]);
                $("#amount").val("$" + minTixPrice + " - $" + maxTixPrice);
              };

              var filterTickets = function() {
                var priceRange = $("#price-slider").slider("option", "values");

                $("#map-container").tuMap("SetOptions", {
                  TicketsFilter: {
                    MinPrice: priceRange[0],
                    MaxPrice: priceRange[1],
                    Quantity: $("#quantity-filter").val(),
                    eTicket: $("#e-ticket-filter").is(":checked")
                  }
                }).tuMap("Refresh");
              };

              var options = interactiveMapDefaults;
              options.MapId = scope.event.VenueConfigurationID;
              options.EventId = scope.event.ID;

              options.OnInit = function(e, MapType) {
                $(".ZoomIn").html('+');
                $(".ZoomOut").html('-');
                $(".tuMapControl").parent("div").attr('style', "position:absolute;left:5px;top:5px;font-size:12px");
                console.log('hide generic modal');
                $('#generic-loading-modal').modal("hide");
              };

              options.OnError = function(e, Error) {
                if (Error.Code === 1) {
                  /* chart not found - display the tn chart */
                  $('#map-container').css("background", 'url(' + scope.event.MapURL + ') no-repeat center center');
                  console.log('hide generic modal');
                  $('#generic-loading-modal').modal("hide");

                }
              };

              options.ToolTipFormatter = function(Data) {

              };

              options.OnMouseover = function(e, Section) {
                if (Section.Active) {} else {}
              };

              options.OnMouseout = function(e, Section) {
                if (Section.Active) {}
              };

              options.OnClick = function(e, Section) {
                if (Section.Active && Section.Selected) {}
              };

              options.OnControlClick = function(e, Data) {
                if (Section.Selected) {}
              };

              options.OnGroupClick = function(e, Group) {
                if (Group.Selected) {

                }
              };

              options.OnTicketSelected = function(e, Ticket) {}

              options.OnReset = function(e) {
                //Write Code Here
              };

              //set the height of the map-container to the window height
              $('#map-container').css("height", $($window).height() - 60);
              $('#tickets').css("height", $($window).height() - 60);
              $('#map-container').css("width", $($window).width() - 480);
              $('#map-container').tuMap(options);
              $('#map-container').tuMap("Refresh", "Reset");

              $('#price-slider').slider({
                range: true,
                min: minTixPrice,
                max: maxTixPrice,
                step: 5,
                values: [minTixPrice, maxTixPrice],
                slide: function(event, ui) {
                  $("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
                },
                stop: function(event, ui) {
                  filterTickets();
                }

              });

              var amtVal = "$" + $("#price-slider").slider("values", 0) + " - $" + $("#price-slider").slider("values", 1);
              $("#amount").val(amtVal);

              /* filter tix when the drop down changes */
              $("#quantity-filter").change(function() {
                filterTickets();
              });
            },
            /* transformRequest */

            function(data, headersGetter) {

              $rootScope.genericLoadingModal.header = 'Finding Tickets...';
              $('#page-loading-modal').modal("hide");
              console.log('show generic modal');
              $('#generic-loading-modal').modal("show");
              return data;
            },

            /* transformResponse */

            function(data, headersGetter) {
              return JSON.parse(data);
            });
          });
        }
      }
    }
  }
]).

/*
directive('friendTweetButton', ['$window','wembliRpc',function($window,wembliRpc) {
  return {
    restrict: 'C',
    compile:function(element,attr,transclude) {

      return function(scope,element, attr) {
        var href = element.attr('href') + scope.friend.screen_name;
        element.attr('href',href);
        element.attr('data-url',scope.friend.rsvpUrl);
        element.attr('data-text',scope.friend.messageText);

        element.bind('click',function(e) {
          e.preventDefault();
          console.log('clicked on the button');

        });

        $window.twttr.ready(function(twttr) {
          twttr.events.bind('click',function(event) {
            console.log(event);
            wembliRpc.fetch('invite-friends.submit-step4', {friend:scope.friend}, function(err,result) {
              scope.$apply(function(){
                scope.friend.inviteStatus = true;
              });
            });
          });

          twttr.events.bind('tweet',function(event) {
            console.log('actually tweeted');
            console.log(event.data);
          });

          twttr.widgets.load();
        });

        $window.twttr.widgets.load();
      }
    },
  }
}]).
*/

directive('parkingMap', ['$rootScope', 'googleMap',
  function($rootScope, googleMap) {
    return {
      restrict: 'EC',
      cache: false,
      replace: true,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          console.log('link parking map!');

          var mapTypeId = (attr.mapTypeId) ? google.maps.MapTypeId[attr.mapTypeId] : google.maps.MapTypeId.ROADMAP;

          /* draw the map */
          var mapOpts = {
            mapTypeId: mapTypeId
          };
          mapOpts.center = new google.maps.LatLng(attr.lat, attr.lng);

          if (attr.zoom) {
            mapOpts.zoom = parseInt(attr.zoom);
          }
          if (attr.draggable) {
            mapOpts.draggable = attr.draggable;
          }
          console.log('mapopts');
          console.log(mapOpts);
          if (scope.sequenceCompleted) {
            googleMap.draw(element, mapOpts);
          } else {
            var dereg = scope.$watch('sequenceCompleted', function(complete) {
              if (complete) {
                googleMap.draw(element, mapOpts);
                dereg();
              }
            })
          }
        };
      }
    };
  }
]).

directive('bounceMapMarker', ['plan', 'googleMap',
  function(plan, googleMap) {

    return {
      restrict: 'C',
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          element.mouseleave(function() {
            console.log('stop bouncing marker');
            var marker = googleMap.findMarker(attr.lat, attr.lng);
            marker.setAnimation(null);
          });
          element.mouseover(function() {
            console.log('bounce marker');
            console.log(attr.lat);
            console.log(attr.lng);
            var marker = googleMap.findMarker(attr.lat, attr.lng);
            console.log('found marker');
            console.log(marker);
            marker.setAnimation(google.maps.Animation.BOUNCE);
          });
        }
      }
    }
  }
]).

directive('leafletMap', ['plan',
  function(plan) {
    return {
      restrict: 'C',
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          plan.get(function(p) {
            var initLeaflet = function() {
              console.log('init leaflet!');
              var $el = element[0];
              var map = new L.Map($el, {
                zoom: attr.zoom
              });
              /* uncomment this to use openstreet map for map */
              L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19
              }).addTo(map);

              /* uncomment this to use google maps layer */
              //var googleLayer = new L.Google('ROADMAP');
              //map.addLayer(googleLayer);
              var point = new L.LatLng(attr.lat, attr.lon);
              map.setView(point, attr.zoom);
              /* make a marker for the venue */
              var venueIcon = new L.Icon.Default();
              var marker = new L.marker([attr.lat, attr.lon], {
                icon: venueIcon
              });
              marker.bindPopup(p.event.eventVenue);
              console.log('adding marker to map');
              console.log(marker);
              marker.addTo(map);
              marker.openPopup();
              scope.$watch('markers', function(markers) {
                if (typeof markers === "undefined") {
                  return;
                };
                console.log('adding markers');
                console.log(markers);
                map.addLayer(markers);
              });

            };

            console.log(p.event);
            if (scope.sequenceCompleted) {
              console.log('sequence completed already');
              initLeaflet();
            } else {
              console.log('wait for sequence to complete');
              scope.$on('sequence-afterNextFrameAnimatesIn', function() {
                initLeaflet();
              })
            }
          });
        };
      }
    };
  }
]).

directive('eventData', ['$rootScope', '$filter', 'wembliRpc', 'plan', 'sequence',
  function($rootScope, $filter, wembliRpc, plan, sequence) {
    return {
      restrict: 'C',
      templateUrl: '/partials/event-data',
      cache: false,
      scope: {
        eventId: '@eventId'
      },
      compile: function(element, attr, transclude) {

        return function(scope, element, attr) {
          /* why is this here?
        scope.direction = attr.direction;
        */
          /* do i need to wait for sequence.ready? */
          //sequence.ready(function() {
          plan.get(function(plan) {
            console.log("PLAN");
            console.log(plan);
            scope.event = plan.event;
            scope.venue = plan.venue["data"];
            console.log(scope.venue.Street1);
          });
          //});
        }
      }
    }
  }
]).

directive('notifyEmail', ['$rootScope', '$filter', 'wembliRpc', 'plan', 'sequence',
  function($rootScope, $filter, wembliRpc, plan, sequence) {
    return {
      restrict: 'C',
      cache: false,
      transclude: true,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          scope.emailCollected = false;
          scope.collectEmail = function() {
            console.log('collecting email: ' + angular.element('#email').val());
            scope.emailCollected = true;
          }
        }
      }
    }
  }
]).

directive('eventWrapper', ['wembliRpc', '$window',
  function(wembliRpc, $window) {
    return {
      restrict: 'C',
      controller: function($scope, $element, $attrs, $transclude) {


      },
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          element.mouseleave(function() {
            var elId = (typeof element.parents('li').attr('id') == "undefined") ? element.attr('id') : element.parents('li').attr('id');
            $(".event-wrapper").popover("hide");
          });

          element.mouseover(function() {
            var elId = (typeof element.parents('li').attr('id') == "undefined") ? element.attr('id') : element.parents('li').attr('id');

            //console.log('mouseover happened');
            if (attr.noPopover) {
              return;
            }

            if (typeof scope.ticketSummaryData == "undefined") {
              scope.ticketSummaryData = {};
              scope.ticketSummaryData.locked = false;
            }

            /* if its locked that means we moused in while doing a fetch */
            if (scope.ticketSummaryData.locked) {
              return;
            }

            //we have a cache of the data - gtfo
            $(".event-wrapper").popover("destroy");
            if (typeof scope.ticketSummaryData[elId.split('-')[0]] != "undefined") {
              $('#' + elId).popover({
                placement: "left",
                trigger: 'hover',
                animation: false,
                title: 'Tickets Summary',
                content: scope.ticketSummaryData[elId.split('-')[0]],
              });
              $('#' + elId).popover("show");
              return;
            }

            /* lock so we don't fetch more than once (we will unlock when the http req returns) */
            scope.ticketSummaryData.locked = true;

            /* fetch the event data */
            var args = {
              "eventID": elId.split('-')[0]
            };

            wembliRpc.fetch('event.getPricingInfo', args,

            function(err, result) {
              if (err) {
                alert('error happened - contact help@wembli.com');
                return;
              }

              /* we cached the result..lets unlock */
              scope.ticketSummaryData.locked = false;
              /* init the popover */
              var summaryContent = "";

              if (typeof result.ticketPricingInfo.ticketsAvailable !== "undefined") {
                if (result.ticketPricingInfo.ticketsAvailable === '0') {
                  summaryContent = "Click for ticket information";
                } else {
                  summaryContent = (result.ticketPricingInfo.ticketsAvailable === "1") ? result.ticketPricingInfo.ticketPricingInfo.ticketsAvailable + " ticket choice" : result.ticketPricingInfo.ticketsAvailable + " ticket choices";
                  if (parseFloat(result.ticketPricingInfo.lowPrice) === parseFloat(result.ticketPricingInfo.highPrice)) {
                    summaryContent += " from $" + parseFloat(result.ticketPricingInfo.lowPrice).toFixed(0);
                  } else {
                    summaryContent += " from $" + parseFloat(result.ticketPricingInfo.lowPrice).toFixed(0) + " to $" + parseFloat(result.ticketPricingInfo.highPrice).toFixed(0);
                  }
                }
              } else {
                summaryContent = "Click for ticket information";
              }
              scope.ticketSummaryData[elId.split('-')[0]] = summaryContent;

              $('#' + elId).popover({
                placement: "left",
                trigger: 'manual',
                animation: false,
                title: 'Tickets Summary',
                content: summaryContent,
              });
              $('#' + elId).popover("show");

            },

            /* transformRequest */

            function(data, headersGetter) {
              //$('#more-events .spinner').show();
              return data;
            },

            /* transformResponse */

            function(data, headersGetter) {
              //$('#more-events .spinner').hide();
              return JSON.parse(data);
            });
          });

        };
      }
    }
  }
]).

directive('twitterWidget', ['$window',
  function($window) {
    return {
      restrict: 'C',
      compile: function(element, attr, transclude) {

        $window.twttr = (function(d, s, id) {
          var t, js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) return;
          js = d.createElement(s);
          js.id = id;
          js.src = "//platform.twitter.com/widgets.js";
          element.append(js);
          return $window.twttr || (t = {
            _e: [],
            ready: function(f) {
              t._e.push(f)
            }
          });
        }(document, "script", "twitter-wjs"));


        return function(scope, element, attr) {
          $window.twttr.ready(function(twttr) {
            //-twttr.widgets.load();
          });
        }
      }
    }
  }
]).

directive('rsvpLoginModal', ['fetchModals', 'rsvpLoginModal',
  function(fetchModals, rsvpLoginModal) {
    return {
      restrict: 'EAC',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          rsvpLoginModal.set('guid', attr.guid);
          rsvpLoginModal.set('service', attr.service);
          rsvpLoginModal.set('token', attr.token);
          rsvpLoginModal.set('friend', attr.friend);
          rsvpLoginModal.set('event', attr.event);
          rsvpLoginModal.set('confirmSocial', attr.confirmSocial);
          console.log(rsvpLoginModal.get('event'));
          fetchModals.fetch('/partials/modals/rsvp-login', function() {
            $('#rsvp-login-modal').modal("show");
          });
        };
      }
    };
  }
]).

directive('ticketsLoginModal', ['$rootScope', '$window', '$location', '$http', '$timeout', 'fetchModals', 'plan',
  function($rootScope, $window, $location, $http, $timeout, fetchModals, plan) {
    return {
      restrict: 'EAC',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          attr.$observe('ticket', function(val) {
            var ticket = JSON.parse(val);

            var displayTicketsLoginModal = function(e) {
              $rootScope.$broadcast('tickets-login-clicked', {
                ticket: ticket
              });
              if ($('#tickets-login-modal').length > 0) {
                $('#tickets-login-modal').modal('show');
              } else {
                $rootScope.$on('tickets-login-modal-fetched', function() {
                  $('#tickets-login-modal').modal('show');
                });
              }
            };

            if (/tickets-login-modal/.test($location.hash())) {
              /* if this button is the right one */
              var h = $location.hash();
              if (ticket.ID === h.split('-')[3]) {
                displayTicketsLoginModal();
              }
            }

            element.click(displayTicketsLoginModal);

          });
        }
      }
    };
  }
]).

directive('buyTicketsOffsite', ['$rootScope', '$window', '$location', '$http', '$timeout', 'fetchModals', 'plan',
  function($rootScope, $window, $location, $http, $timeout, fetchModals, plan) {

    return {
      restrict: 'EAC',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {

          attr.$observe('ticket', function(val) {
            if (typeof val === "undefined" || val === "") {
              return;
            }
            var ticket = JSON.parse(val);
            element.click(function(e) {
              var shipping = 15;
              var serviceCharge = (parseFloat(ticket.ActualPrice) * .15) * parseInt(ticket.selectedQty);
              var actualPrice = parseFloat(ticket.ActualPrice) * parseInt(ticket.selectedQty);
              var amountPaid = parseFloat(actualPrice) + parseFloat(serviceCharge) + parseFloat(shipping);

              $rootScope.$broadcast('tickets-offsite-clicked', {
                qty: ticket.selectedQty,
                amountPaid: amountPaid,
                ticketGroup: ticket,
                eventId: ticket.RventId,
                sessionId: ticket.sessionId
              });

              var Promise = $timeout(function() {
                $('#tickets-login-modal').modal('hide');
                $('#tickets-offsite-modal').modal('show');
              }, 1500);
            });
          });
        }
      }
    };
  }
]).

directive('sendForgotPasswordEmail', ['wembliRpc',
  function(wembliRpc) {

    return {
      restrict: 'C',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          element.click(function(e) {

            wembliRpc.fetch('customer.sendForgotPasswordEmail', {
              email: attr.email || scope.email
            }, function(err, result) {
              console.log(result);
              /* display an email sent message */
              scope.forgotPasswordEmailSent = true;
              scope.$broadcast('forgot-password-email-sent');
            },
            /* transformRequest */

            function(data, headersGetter) {
              scope.accountExists = false; //will this work?
              scope.signupSpinner = true;
              return data;
            },

            /* transformResponse */

            function(data, headersGetter) {
              scope.signupSpinner = false;
              return JSON.parse(data);
            });

          });
        };
      }
    }
  }
]).

directive('focusOnClick', ['$timeout',
  function($timeout) {
    return {
      restrict: 'C',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          var focus = function() {
            $timeout(function() {
              element.focus();
              if (!element.is(':focus')) {
                focus();
              }
            }, 100);
          };

          element.click(function(e) {
            focus();
          })
        }
      }
    }
  }
]).

directive('startPlan', ['$rootScope', 'fetchModals',
  function($rootScope, fetchModals) {
    return {
      restrict: 'C',
      compile: function(element, attr, transclude) {
        fetchModals.fetch('/partials/payment-type');

        return function(scope, element, attr) {
          element.click(function() {
            console.log('clicked event attr:');
            console.log(attr);
            var nextLink = '';
            if (attr.href) {
              nextLink = attr.href;
            } else {
              nextLink = element.find('.next-link').attr('href');
            }
            $rootScope.$broadcast('payment-type-modal-clicked', {
              nextLink: nextLink,
              name: attr.name
            });
            /* show the popup to collect payment type */
            $('#payment-type-modal').modal('show');
          });
        }
      }
    }
  }
]).

//directive to cause link click to go to next frame rather than fetch a new page
directive('wembliSequenceLink', ['$rootScope', '$window', '$templateCache', '$timeout', '$location', '$http', '$compile', 'footer', 'sequence', 'fetchModals', 'plan',
  function($rootScope, $window, $templateCache, $timeout, $location, $http, $compile, footer, sequence, fetchModals, plan) {

    return {
      restrict: 'EAC',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {

          element.click(function(e) {
            e.preventDefault();
            $rootScope.sequenceCompleted = false;
            /* init some defaults */
            var path = ""; //defaulting to empty string for path will result in samePage on error
            var args = {
              method: 'get',
              cache: false
            }; //args for the http request
            var direction = 1; //default to slide right
            var samePage = true; //load the same page by default in case there are errors

            /* hide any modals right now */
            $(".modal").modal("hide");

            /* show the page loading modal */
            $('#page-loading-modal').modal("show");

            /*
            figure out where we're going next
            the directive may be attached to an a tag
            or a parent of an a tag
            or a button in a form
          */

            /* a tags will have href */
            if (element.is('a')) {
              path = element.attr('href');
            }

            /* if its a button */
            if (element.is('button')) {
              /* get the action of the form */
              path = element.closest('form').attr('action');

              args.method = element.closest('form').attr('method');
              args.headers = {
                "Content-Type": "application/x-www-form-urlencoded"
              };
              if (typeof element.closest('form').attr('enctype') !== "undefined") {
                args.headers['Content-Type'] = element.closest('form').attr('enctype');
              }
            }

            /* element is a parent of the thing with the href */
            if (path === "") {
              path = element.find('a').attr('href');
            }

            args.url = (path === "/") ? path + "index" : path;

            /* if we still don't know the path then make this the same page */
            if (path === "") {
              samePage = true
            };

            /* clear out the search args from the path */
            path = path.split('?')[0];

            /*
            if the path in the action is the same as the current location
            set a flag here to tell the success callback not to slide
          */
            if (path !== $rootScope.currentPath) {
              samePage = false;
            }

            /* ok all set lets start the transition */

            /* fetchModals for this new path */
            fetchModals.fetch(path);

            /* if its not a form submit then we'll be getting a partial to load in a sequence frame */
            if (/get/i.test(args.method)) {
              args.url = "/partials" + args.url;
            }
            /* if its a post put the post body together */
            if (/post/i.test(args.method)) {
              args.data = element.closest('form').serialize();
            }

            /* fetch the partial */
            $http(args).success(function(data, status, headers, config) {
              var headerFunc = headers;
              /* fetch the plan once we have the html */
              plan.fetch(function(planObj) {
                /* update the path */
                $location.path(path);

                /* do i need to do anything with the planObj? or just make sure it is fetched */

                var headers = headerFunc();

                /* if the server tells us explicitly what the location should be, set it here: */
                if (typeof headers['x-wembli-location'] !== "undefined") {
                  /* if x-location comes back and its the same as $location.path() - don't slide */
                  if ($rootScope.currentPath === headers['x-wembli-location']) {
                    samePage = true;
                  } else {
                    samePage = false;
                    $location.path(headers['x-wembli-location']);
                  }
                }

                if (samePage) {
                  $(".modal").modal("hide");
                  angular.element('#frame' + $rootScope.currentFrame).html($compile(data)($rootScope));
                  scope.$emit('viewContentLoaded', {});
                  return;
                }

                /* not on the same page so we're gonna slide to the other frame */
                var nextFrameID = ($rootScope.currentFrame === 1) ? 2 : 1;
                console.log('NEXT FRAME: ' + nextFrameID);

                /*
                split location path on '/' to get the right framesMap key
                this is so we know where to slide the footer arrow to
              */
                var nextPath = '/' + $location.path().split('/')[1];
                var currentPath = '/' + $rootScope.currentPath.split('/')[1];

                /*
                if footer.framesMap[$location.path()] (where they are going) is undefined
                then don't move the arrow and slide to the right
                if footer.framesMap[$rootScope.currentPath] (where they are coming from) is undefined
                then move the arrow, but still slide to the right
              */

                /* if where they are coming from doesn't have an arrow location */
                if (typeof footer.framesMap[currentPath] === "undefined") {
                  currentPath = nextPath;
                  direction = 1;
                  /* slide the arrow only if where they are coming from is undefined */
                  footer.slideNavArrow();
                }

                /*
                if both are defined
                then move the arrow and figure out which way to slide
              */
                if ((typeof footer.framesMap[nextPath] !== "undefined") && (typeof footer.framesMap[currentPath] !== "undefined")) {
                  var currNavIndex = footer.framesMap[currentPath];
                  var nextNavIndex = footer.framesMap[nextPath];
                  direction = (currNavIndex < nextNavIndex) ? 1 : -1;
                  /* slide the nav arrow - this should be async with using sequence to transition to the next frame */
                  footer.slideNavArrow();
                }

                /* find out what direction to go to we sliding in this element */
                direction = parseInt(attr.direction) || parseInt(scope.direction) || direction;

                /* compile the page we just fetched and link the scope */
                angular.element('#frame' + nextFrameID).html($compile(data)($rootScope));

                /* should this go before the compile? or after? */
                scope.$emit('viewContentLoaded', {});

                /* do the animations */
                console.log('GOTO FRAME');
                sequence.goTo(nextFrameID, direction);

                /* dismiss any modals once the page loads */
                var loadingDuration = (attr.loadingDuration) ? parseInt(attr.loadingDuration) : 500;
                sequence.ready(function() {
                  $timeout(function() {
                    $('#page-loading-modal').modal("hide");
                  }, loadingDuration);
                });

                $('#content').scrollTop(0);
                $('#content').css('overflow', 'visible');
                $('#content').css('overflow-x', 'hidden');

                /* server can tell us to overflow hidden or not - this is for the venue map pages */
                if (typeof headers['x-wembli-overflow'] !== "undefined") {
                  if (headers['x-wembli-overflow'] === 'hidden') {
                    $('#content').css('overflow', 'hidden');
                  }
                }

                //update the currentPath and the currentFrame
                $rootScope.currentPath = $location.path();
                $rootScope.currentFrame = nextFrameID;

              });

            }).error(function() {
              console.log('error getting: ' + url);
            });
          });
        };
      }
    };
  }
]).

directive('displayPopover', [
  function() {
    return {
      restrict: 'C',
      cache: false,
      compile: function(element, attr, transclude) {

        return function(scope, element, attr) {
          attr.$observe('content', function() {
            element.popover({
              placement: attr.placement,
              trigger: attr.trigger,
              animation: (attr.animation === 'true') ? true : false,
              title: attr.title,
              content: attr.content
            });
          });
        }
      }
    }
  }
]).

directive('fadeElement', function() {
  return function(scope, element, attrs) {
    element.css('display', 'none');
    scope.$watch(attrs.fadeElement, function(value) {
      if (value) {
        element.fadeIn(400);
      } else {
        element.fadeOut(1000);
      }
    });
  }
}).

directive('onKeyup', function() {
  return function(scope, elm, attrs) {
    //Evaluate the variable that was passed
    //In this case we're just passing a variable that points
    //to a function we'll call each keyup
    elm.bind('keyup', function(evt) {
      console.log(attrs.onKeyup);
      var keyupFn = scope.$eval(attrs.onKeyup);
      console.log('keyup');
      console.log(keyupFn);
      //$apply makes sure that angular knows
      //we're changing something
      scope.$apply(function() {
        keyupFn.call(keyupFn, scope, elm, attrs, evt);
      });
    });
  };
}).

directive('onKeydown', function() {
  return function(scope, elm, attrs) {
    //Evaluate the variable that was passed
    //In this case we're just passing a variable that points
    //to a function we'll call each keyup
    elm.bind('keydown', function(evt) {
      var e = evt;
      console.log('keydown');
      console.log(attrs.onKeydown);
      console.log(e);
      var keydownFn = scope.$eval(attrs.onKeydown);

      console.log(keydownFn);
      //$apply makes sure that angular knows
      //we're changing something
      scope.$apply(function() {
        console.log('calling keydown func');
        keydownFn.call(keydownFn, scope, elm, attrs, e);
      });
    });
  };
}).

directive('appVersion', ['version',
  function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }
]).

directive('dropdown', function() {
  return function(scope, elm, attrs) {
    $(elm).dropdown();
  };
});
