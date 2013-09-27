'use strict';

/* Directives */
angular.module('wembliApp.directives.plan', []).

directive('initPlanNav', ['$location', 'planNav', '$rootScope', '$timeout',
  function($location, planNav, $rootScope, $timeout) {
    return {
      restrict: 'C',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          planNav.init(attr.sections);
        };
      }
    }

  }
]).

directive('planNav', ['$location', 'planNav', '$rootScope', '$timeout', 'plan', 'customer',
  function($location, planNav, $rootScope, $timeout, plan, customer) {
    return {
      restrict: 'E',
      replace: true,
      scope: false,
      templateUrl: "/partials/plan/nav",
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          plan.get(function(p) {

            var scrollToSection = 1;
            if ($location.hash()) {
              var h = $location.hash();
              scrollToSection = parseInt(h.charAt(h.length - 1));
            } else {
              if ((typeof scope.customer !== "undefined") && (p.organizer.customerId === scope.customer.id)) {
                /* automatically go to the right section depending on what phase of the plan they are in */
                if (p && p.rsvpComplete) {
                  scrollToSection = 4; //cart

                  /* if tickets are chosen */
                  if (!p.tickets[0]) {
                    scrollToSection = 3;
                  }

                  /* parking is in plan but parking not chosen */
                  if (p.preferences.addOns.parking && !p.parking[0]) {
                    scrollToSection = 3;
                  }

                  /* restaurants in plan but not chosen */
                  if (p.preferences.addOns.restaurants && !p.restaurants[0]) {
                    scrollToSection = 3;
                  }
                  /* hotels are in the plan but not chosen */
                  if (p.preferences.addOns.hotels && !p.hotels[0]) {
                    scrollToSection = 3;
                  }
                }
              } else {
                /* i'm not the organizer */
                if (!p.rsvpComplete) {
                  scrollToSection = 2;
                } else {
                  scrollToSection = 5;
                }
              }
            }
            planNav.setScrollToSection(scrollToSection);
            $rootScope.$broadcast('section-loaded');
          });
        };
      }
    }
  }
]).

directive('scrollTo', ['$window', 'planNav',
  function($window, planNav) {
    return {
      restrict: 'EAC',
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          element.click(function() {
            var elId = '#' + element.attr('id').split('-')[1];
            var sectionNumber = parseInt(elId.charAt(elId.length - 1));
            planNav.scrollTo(sectionNumber);
          });
        };
      }
    }
  }
]).

directive('rsvpFor', ['$rootScope',
  function($rootScope) {
    return {
      restrict: 'C',
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          var d = scope.$watch('friend', function() {
            element.click(function() {
              var f = JSON.parse(attr.friend);
              f.rsvp.decision = true;
              $rootScope.$broadcast('rsvp-for-clicked', f);
              $('#rsvp-for-modal').modal('show');
            });

            d();
          });
        };
      }
    }
  }
]).

directive('resendRsvpEmail', ['wembliRpc',
  function(wembliRpc) {
    return {
      restrict: 'C',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          scope.rsvpEmailSent = false;
          scope.rsvpEmailInProgress = false;

          attr.$observe('friendId', function() {

            element.click(function(e) {
              scope.rsvpEmailInProgress = true;
              var rpcArgs = {
                friendId: attr.friendId
              };
              console.log('clicked to resend rsvp email');
              console.log(rpcArgs);
              wembliRpc.fetch('plan.resendRsvpEmail', rpcArgs, function(err, result) {
                console.log('sent rsvp email');
                console.log(err);
                /* display an email sent message */
                scope.rsvpEmailSent = true;
                scope.rsvpEmailInProgress = false;
                scope.$broadcast('rsvp-email-sent');
              });
            });
          });

        };
      }
    };
  }
]).

directive('createAccountModal', ['$rootScope', 'pluralize', 'wembliRpc', 'plan',
  function($rootScope, pluralize, wembliRpc, plan) {
    return {
      restrict: 'C',
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {

          scope.createBalancedAccount = function() {
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

            if (scope.createMerchantAccount.errorPhoneNumber || scope.createMerchantAccount.errorDob) {
              scope.createMerchantAccount.accountHolderError = true;
            } else {
              scope.createMerchantAccount.accountHolderError = false;
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

              $('#generic-loading-modal').modal("hide");
              $rootScope.$broadcast('bank-account-created', result);
              $('#create-account-modal').modal('hide');
            }, function(data, headersGetter) {

              $rootScope.genericLoadingModal.header = 'Securely saving your information...';
              $('#page-loading-modal').modal("hide");
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

directive('rsvpForModal', ['$rootScope', 'pluralize', 'wembliRpc', 'plan',
  function($rootScope, pluralize, wembliRpc, plan) {
    return {
      restrict: 'C',
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          $rootScope.$on('rsvp-for-clicked', function(e, friend) {
            scope.friend = friend;

            scope.$watch('friend.rsvp.guestCount', function(newVal, oldVal) {
              if (typeof scope.friend.rsvp.guestCount === "undefined") {
                return;
              }

            });

            scope.setRsvp = function(rsvp) {
              scope.friend.rsvp.decision = rsvp;
            };

            scope.saveRsvp = function() {
              if (scope.friend.rsvp.decision === false) {
                scope.friend.rsvp.guestCount = 0;
              }
              if (scope.friend.rsvp.decision === true) {
                if (scope.friend.rsvp.guestCount == 0) {
                  scope.friend.rsvp.guestCount = 1;
                }
              }

              var args = {
                friendId: scope.friend._id,
                decision: scope.friend.rsvp.decision,
                guestCount: scope.friend.rsvp.guestCount,
                tickets: scope.friend.rsvp.decision
              };

              if (typeof scope.friend.rsvp.parking.decision !== "undefined") {
                args.parking = scope.friend.rsvp.parking.decision;
              }

              if (typeof scope.friend.rsvp.restaurant.decision !== "undefined") {
                args.restaurant = scope.friend.rsvp.restaurant.decision;
              }

              if (typeof scope.friend.rsvp.hotel.decision !== "undefined") {
                args.hotel = scope.friend.rsvp.hotel.decision;
              }

              wembliRpc.fetch('plan.submitRsvpFor', args, function(err, result) {
                scope.friend = result.friend;
                plan.fetch(function(planObj) {
                  $rootScope.$broadcast('plan-friends-changed', plan.getFriends());
                });

              });
            }

            scope.guestCountKeyUp = function() {
              if (scope.friend.rsvp.guestCount === "") {
                return;
              }
              scope.friend.rsvp.decision = (scope.friend.rsvp.guestCount > 0);

              scope.guestCountPlural = pluralize(scope.friend.rsvp.guestCount);
            }

            scope.guestCountKeyDown = function(scope, elm, attr, e) {
              if (e.keyCode == 38) {
                scope.friend.rsvp.guestCount++;
              }
              if (e.keyCode == 40) {
                scope.friend.rsvp.guestCount--;
                if (scope.friend.rsvp.guestCount < 0) {
                  scope.friend.rsvp.guestCount = 0;
                }
              }
            }
          });
        };
      }
    }
  }
]).

directive('infoSlideDownLabel', [
  function() {
    return {
      restrict: 'C',
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function($scope, $element, $attrs, $transclude) {}
      ],
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {

          scope.toggle = false;
          attr.$observe('friendId', function(friendId) {
            if (!friendId) {
              return;
            }
            element.click(function() {
              scope.toggle = !scope.toggle;
              var slideKey = '#' + friendId + ' .' + attr.key;
              var caretKey = '#' + friendId + ' .' + attr.key + '-caret';
              if (scope.toggle) {
                $(slideKey).slideDown(200);
                $(caretKey).addClass('icon-caret-down').removeClass('icon-caret-right');
              } else {
                $(slideKey).slideUp(100);
                $(caretKey).addClass('icon-caret-right').removeClass('icon-caret-down');
              }
            });
          });
        };
      }
    }
  }
]).

directive('planDashboard', ['$timeout', '$rootScope', '$window', '$location', 'wembliRpc', 'cart', 'plan', 'customer', 'pluralize', 'fetchModals', 'planNav', 'slidePage',
  function($timeout, $rootScope, $window, $location, wembliRpc, cart, plan, customer, pluralize, fetchModals, planNav, slidePage) {
    return {
      restrict: 'C',
      replace: true,
      scope: false, //this has to be false so that the plan is shared among all the child directives
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function($scope, $element, $attrs, $transclude) {
          slidePage.directionOverride = -1;

          $scope.friendsPonyUp = function(friends) {

            var tickets = plan.getTickets();
            var parking = plan.getParking();
            var restaurants = plan.getRestaurants();

            /* assuming there's only 1 ticketGroup for now */
            /* kim and ash say guests don't count for a delivery fee */
            var totalPoniedUp = 0;
            for (var i = 0; i < friends.length; i++) {
              friends[i].suggestedPonyUpAmount = 0;


              if ((typeof tickets[0] !== "undefined") && (typeof tickets[0].costBreakdown !== "undefined")) {
                if (typeof friends[i].tickets == "undefined") {
                  friends[i].tickets = {};
                }
                friends[i].tickets = tickets[0];
                var suggested = friends[i].tickets.costBreakdown.totalEach * friends[i].rsvp.guestCount + friends[i].tickets.costBreakdown.deliveryFeeEach;
                friends[i].tickets.suggestedPonyUpAmount = suggested.toFixed(2);
                friends[i].suggestedPonyUpAmount += parseFloat(suggested);
              } else {
                friends[i].tickets = [];
              }

              if ((typeof parking[0] !== "undefined") && (typeof parking[0].costBreakdown !== "undefined")) {
                friends[i].parking = parking[0];
                var suggested = friends[i].parking.costBreakdown.totalEach * friends[i].rsvp.guestCount;
                friends[i].parking.suggestedPonyUpAmount = suggested.toFixed(2);
                friends[i].suggestedPonyUpAmount += parseFloat(suggested);
              } else {
                friends[i].parking = [];
              }

              console.log('RESTAURANTS PONYUP');
              console.log(restaurants);
              if ((typeof restaurants[0] !== "undefined") && (typeof restaurants[0].costBreakdown !== "undefined")) {
                friends[i].restaurants = restaurants[0];
                var suggested = friends[i].restaurants.costBreakdown.totalEach * friends[i].rsvp.guestCount;
                friends[i].restaurants.suggestedPonyUpAmount = suggested.toFixed(2);
                friends[i].suggestedPonyUpAmount += parseFloat(suggested);
              } else {
                friends[i].restaurants = [];
              }
              console.log(friends[i]);
              friends[i].suggestedPonyUpAmount = parseFloat(friends[i].suggestedPonyUpAmount).toFixed(2);
            };
            return friends;
          };


          $scope.calcTotalComing = function() {
            $scope.totalComing = 0;
            $scope.friendsComing = [];
            $scope.totalPoniedUp = 0;
            if (!$scope.friends) {
              return;
            }
            /* get the friend that is this customer */
            for (var i = 0; i < $scope.friends.length; i++) {
              if ($scope.friends[i].customerId === customer.get().id) {
                if ($scope.me.rsvp.decision) {
                  $scope.totalComing = parseInt($scope.totalComing) + parseInt($scope.me.rsvp.guestCount);
                  $scope.friendsComing.push($scope.me);
                  $scope.friends[i] = $scope.me;
                }
                continue;
              }

              if ($scope.friends[i].rsvp.decision && $scope.friends[i].inviteStatus) {
                $scope.totalComing = parseInt($scope.totalComing) + parseInt($scope.friends[i].rsvp.guestCount);
                $scope.friendsComing.push($scope.friends[i]);

                /* sum the total ponied up for this friend */
                $scope.friends[i].totalPoniedUp = 0;
                for (var j = 0; j < $scope.friends[i].payment.length; j++) {
                  var p = $scope.friends[i].payment[j];
                  if (p.type !== 'request') {
                    $scope.friends[i].totalPoniedUp += p.amount;
                  }
                };
                $scope.totalPoniedUp += parseFloat($scope.friends[i].totalPoniedUp).toFixed(2);
              }
            };

            /* count the organizer */
            if ($scope.plan.organizer.rsvp.decision) {
              $scope.totalComing = parseInt($scope.totalComing) + parseInt($scope.plan.organizer.rsvp.guestCount);
              $scope.friendsComing.push()
            }
          };


          $scope.reconcileTicketQty = function() {
            if (typeof $scope.tickets === "undefined") {
              return;
            }
            /* if there are tickets, see if there is the right number of tickets for the number of people confirmed */
            var sum = 0;
            for (var i = 0; i < $scope.tickets.length; i++) {
              var t = $scope.tickets[i];
              sum += parseInt(t.ticketGroup.selectedQty);
            };

            /* if they have more than 0 tickets, check to see if they have more than the number of people coming */
            if (sum > 0) {
              $scope.ticketCountMismatch = true;
              if (sum >= $scope.totalComing) {
                $scope.ticketCountMismatch = false;
              }
            }
          };

          /* update the invitees when the list changes */
          $scope.$on('plan-friends-changed', function(e, friends) {
            $scope.plan = plan.get();
            $scope.friends = plan.getFriends();
            $scope.calcTotalComing();
          });

          /* update the rsvp date when it changes */
          $scope.$on('plan-rsvp-changed', function(e, rsvpDate) {
            $scope.plan.rsvpDate = rsvpDate;
          });

          /*
          $scope.$on('plan-tickets-changed', function(e, ticketGroup) {
            plan.fetch(function(result) {
              $rootScope.$broadcast('foo-test');
            });
          });
          */

          /* get the plan */
          plan.fetch(function(results) {
            plan.get(function(p) {

              /* artificially delay this for testing */
              $timeout(function() {
                $rootScope.plan = p;
                $scope.organizer = plan.getOrganizer();
                $scope.tickets = plan.getTickets();
                $scope.parking = plan.getParking();
                $scope.hotels = plan.getHotels();
                $scope.restaurants = plan.getRestaurants();
                $scope.friends = plan.getFriends();
                $scope.context = plan.getContext();

                /* debug stuff */
                console.log('GETTING PLAN INFO:');
                console.log('plan:');
                console.log($scope.plan);
                console.log('organizer');
                console.log($scope.organizer);
                console.log('tickets');
                console.log($scope.tickets);
                console.log('friends');
                console.log($scope.friends);
                console.log('parking');
                console.log($scope.parking);
                console.log('restaurants');
                console.log($scope.restaurants);
                console.log('hotels');
                console.log($scope.hotels);
                console.log('context');
                console.log($scope.context);

                /* get the friend that is this customer */
                for (var i = 0; i < $scope.friends.length; i++) {
                  if ($scope.friends[i].customerId === customer.get().id) {
                    $scope.me = $scope.friends[i];
                    console.log('scope.me set');
                    console.log($scope.me);
                  }

                  /* get the pony up totals for each friend */

                };

                $scope.calcTotalComing();

                $scope.friendsPonyUp($scope.friends);

              }, 0);

            });
          });
        }
      ],
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          scope.serviceFee = function(price) {
            return price * 0.15;
          }

          // TODO - make this a filter?
          scope.showEllipses = function(ary, len) {
            if (typeof ary !== "undefined") {
              return (ary.join(', ').length > len);
            }
          };

          scope.$watch('restaurants', function(newVal, oldVal) {
            if (typeof newVal === "undefined") {
              return;
            }
            if (oldVal === newVal) {
              return;
            }
            console.log('calc totals for restaurants');
            cart.totals('restaurants');
            scope.friendsPonyUp(scope.friends);
          });

          scope.$watch('hotels', function(newVal, oldVal) {
            if (typeof newVal === "undefined") {
              return;
            }
            if (oldVal === newVal) {
              return;
            }
            cart.totals('hotels');
            scope.friendsPonyUp(scope.friends);
          });

          scope.$watch('parking', function(newVal, oldVal) {
            if (typeof newVal === "undefined") {
              return;
            }
            if (oldVal === newVal) {
              return;
            }
            scope.friendsPonyUp(scope.friends);
            cart.totals('parking');
          });

          scope.$watch('tickets', function(newVal, oldVal) {
            if (typeof newVal === "undefined") {
              return;
            }
            if (oldVal === newVal) {
              return;
            }
            cart.totals('tickets');
            scope.friendsPonyUp(scope.friends);
          });


          /* pluralize the people coming list header */
          scope.$watch('totalComing', function(val) {
            if (typeof val !== "undefined") {
              scope.totalComingPlural = pluralize(scope.totalComing);
              scope.reconcileTicketQty();
            }
          });

          scope.$watch('me', function(val) {
            if (typeof val !== "undefined") {
              /* find me in scope friends and replace it with scope.me */
              var f = [];
              for (var i = 0; i < scope.friends.length; i++) {
                var friend = scope.friends[i]
                if (friend._id === scope.me._id) {
                  f.push(scope.me);
                } else {
                  f.push(friend);
                }
              };
              scope.friends = f;
              scope.friendsPonyUp(scope.friends);
              scope.guestCountPlural = pluralize(scope.me.rsvp.guestCount);
              scope.calcTotalComing();
            }
          });

        }
      }
    };
  }
]).

directive('organizerPlanDashboard', ['$rootScope', '$window', '$location', 'wembliRpc', 'cart', 'plan', 'customer', 'pluralize', 'fetchModals', 'planNav',
  function($rootScope, $window, $location, wembliRpc, cart, plan, customer, pluralize, fetchModals, planNav) {
    return {
      restrict: 'C',
      scope: false,
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function($scope, $element, $attrs, $transclude, $timeout) {
          /* display a modal when they click to go off and buy tickets */
          fetchModals.fetch('/partials/tickets-offsite', function(err) {
            if (err) {
              return console.log('no modal for buy tickets offsite');
            }
          });

          $scope.$watch('plan.tickets[0].ticketGroup.selectedQty', function() {
            $scope.reconcileTicketQty();
          })

          $scope.savePrefs = function() {
            plan.savePreferences({
              preferences: $scope.plan.preferences
            }, function(err, result) {
              $scope.plan = result.plan;
              $scope.calcTotalComing();
            });
          };

          $scope.setPayment = function(addOn, value) {
            $scope.plan.preferences[addOn].payment = value;
            $scope.savePrefs();
          }

          /* key bindings for up and down arrows for guestCount */
          $scope.guestCountKeyUp = function() {
            if ($scope.plan.organizer.rsvp.guestCount === "") {
              return;
            }
            $scope.plan.organizer.rsvp.decision = ($scope.plan.organizer.rsvp.guestCount > 0);

            $scope.guestCountPlural = pluralize($scope.plan.organizer.rsvp.guestCount);
            $scope.calcTotalComing();

            wembliRpc.fetch('plan.submitOrganizerRsvp', {
              decision: $scope.plan.organizer.rsvp.decision,
              guestCount: $scope.plan.organizer.rsvp.guestCount
            }, function(err, result) {

            });
          }

          $scope.guestCountKeyDown = function(scope, elm, attr, e) {
            if (e.keyCode == 38) {
              $scope.plan.organizer.rsvp.guestCount++;
            }
            if (e.keyCode == 40) {
              $scope.plan.organizer.rsvp.guestCount--;
              if ($scope.plan.organizer.rsvp.guestCount < 0) {
                $scope.plan.organizer.rsvp.guestCount = 0;
              }
            }
          }

          $scope.setRsvp = function(rsvp) {
            $scope.plan.organizer.rsvp.decision = rsvp;

            if ($scope.plan.organizer.rsvp.decision === false) {
              $scope.plan.organizer.rsvp.guestCount = 0;
            }
            if ($scope.plan.organizer.rsvp.decision === true) {
              if ($scope.plan.organizer.rsvp.guestCount == 0) {
                $scope.plan.organizer.rsvp.guestCount = 1;
              }
            }

            $scope.calcTotalComing();

            wembliRpc.fetch('plan.submitOrganizerRsvp', {
              decision: $scope.plan.organizer.rsvp.decision,
              guestCount: $scope.plan.organizer.rsvp.guestCount
            }, function(err, result) {

            });
          }

          $scope.removeTicketGroup = function(ticketId) {
            wembliRpc.fetch('plan.removeTicketGroup', {
              ticketId: ticketId
            }, function(err, result) {
              $scope.tickets = plan.setTickets(result.tickets);
              $scope.plan = result.plan;
            });
          };

          var initDirective = function() {
            $scope.guestCountPlural = pluralize($scope.plan.organizer.rsvp.guestCount);

            if ($scope.plan.organizer.rsvp.decision === null) {
              $scope.setRsvp(true);
            }

            $scope.calcTotalComing();
          };

          if ($scope.plan) {
            initDirective();
          } else {
            var d = $scope.$watch('plan', function(newVal, oldVal) {
              if (newVal) {
                initDirective();
                d();
              }
            });
          }
          /* start polling for changes */
          /* took this out because it causes expanded sections get collapsed
          plan.poll(function(plan) {
            $scope.plan = plan.get();
            $scope.friends = plan.getFriends();
            $scope.tickets = plan.getTickets();
            $scope.feed = plan.getFeed();
            $scope.context = plan.getContext();
            $scope.organizer = plan.getOrganizer();
          });
          */

        }
      ],
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {

          /* fetch the invitation wizard modal */
          fetchModals.fetch('/partials/invite-friends-wizard', function() {
            var options = {
              'backdrop': 'static',
              'keyboard': false,
            };
            /* if the url is the invitation url then show the modal */
            if (/^\/invitation/.test($location.path())) {
              $('#invitation-modal').modal(options);
            }
          });

          /* fetch the organizer plan modals */
          fetchModals.fetch('/partials/modals/organizer-dashboard', function() {
            plan.get(function(p) {
              /* deal with transitioning to rsvpcomplete only if rsvp is not already completed */
              if (!p.rsvpComplete) {
                var handleRsvpComplete = function() {
                  if (p.rsvpComplete) {

                  } else {
                    $('#rsvp-complete-modal').modal('show');
                    wembliRpc.fetch('plan.submitRsvpComplete', {
                      rsvpComplete: true,
                    }, function(err, result) {
                      plan.set(result.plan);
                      scope.plan = result.plan;
                      $rootScope.$broadcast('plan-changed', {});
                      $rootScope.$broadcast('rsvp-complete', {});
                    });
                  }
                }

                /* check right now if the plan has become rsvpComplete */
                if (plan.rsvpComplete()) {
                  handleRsvpComplete();
                } else {
                  var deregRsvpComplete = scope.$watch('plan', function(newVal, oldVal) {
                    if (newVal) {
                      if (plan.rsvpComplete()) {
                        handleRsvpComplete();
                        deregRsvpComplete();
                      }
                    }
                  });
                }
              }
            });
          });
        };
      }
    };
  }
]).

directive('organizerItinerarySection', ['$rootScope', 'wembliRpc',
  function($rootScope, wembliRpc) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: false,
      templateUrl: '/partials/plan/itinerary-section',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          $rootScope.$broadcast('section-loaded');
          var timer;
          scope.submitNotes = function() {
            clearTimeout(timer);
            timer = setTimeout(function() {
              wembliRpc.fetch('plan.submitNotes', {
                notes: scope.plan.notes
              }, function(err, result) {
                /* handle error */
              });
            }, 2000);

          };
        };
      }
    };
  }
]).

directive('organizerRsvpSection', ['$rootScope', 'planNav', 'plan',
  function($rootScope, planNav, plan) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: false,
      templateUrl: '/partials/plan/rsvp-section',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          $rootScope.$broadcast('section-loaded');
          var makeRsvpDays = function() {
            var rsvpTime = new Date(scope.plan.rsvpDate).getTime();
            var now = new Date().getTime();
            var difference = rsvpTime - now;
            var hour = 3600 * 1000;
            var day = hour * 24;
            if (difference > 0) {
              if (difference < day) {
                scope.rsvpDays = "That's today!";
              } else {
                var days = difference / day;
                if (days < 14) {
                  var d = (parseInt(days) == 1) ? 'day' : 'days';
                  scope.rsvpDays = "That's in " + parseInt(days) + " " + d + "!";
                }
              }
            } else {
              if (scope.plan.rsvpComplete) {
                scope.rsvpDays = "RSVP Date has passed.";
              }
            }
          }
          plan.get(function(p) {
            makeRsvpDays();
          });
          scope.$watch("plan.rsvpDate", function(newVal, oldVal) {
            if (newVal && (newVal !== oldVal)) {
              makeRsvpDays();
            }
          });
        };
      }
    };
  }
]).

directive('organizerCartSection', ['$rootScope', 'ticketPurchaseUrls', 'plan', 'cart',
  function($rootScope, ticketPurchaseUrls, plan, cart) {
    return {
      restrict: 'E',
      replace: true,
      scope: false,
      templateUrl: '/partials/plan/cart-section',
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function($scope, $element, $attrs, $transclude, $timeout) {}
      ],
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          scope.tnUrl = ticketPurchaseUrls.tn;
          $rootScope.$broadcast('section-loaded');

          var d = scope.$on('rsvp-complete', function() {
            scope.plan.rsvpComplete = true;
            scope.rsvpComplete = true;
            d();
          });

        };
      }
    };
  }
]).

directive('organizerPonyUpSection', ['$rootScope', 'plan', 'wembliRpc', '$timeout', 'customer',
  function($rootScope, plan, wembliRpc, $timeout, customer) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: false,
      templateUrl: '/partials/plan/pony-up-section',
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function($scope, $element, $attrs, $transclude, $timeout) {

          $scope.submitOutsidePayment = function(friendId) {
            var friends;
            angular.forEach($scope.friends, function(f) {
              if (f._id == friendId) {
                if (!f.ponyUp.outsideSourceAmount || (parseFloat(f.ponyUp.outsideSourceAmount) == 0)) {
                  return;
                }
                f.ponyUp.submitInProgress = true;
                wembliRpc.fetch('plan.submitOutsidePayment', {
                  friendId: friendId,
                  amount: f.ponyUp.outsideSourceAmount,
                  method: f.ponyUp.outsideSourcePaymentMethod,
                  status: 'logged'
                }, function(err, result) {
                  if (err) {
                    console.log('error');
                    console.log(err);
                    return;
                  }

                  if (!result.success) {
                    f.error = true;
                    return;
                  }
                  /* friend changed this does nto work*/
                  //$scope.friends[i] = result.friend;
                  //$scope.friends[i].ponyUp = f.ponyUp;
                  //$scope.friends[i].ponyUp.submitInProgress = false;
                  f.ponyUp.submitInProgress = false;
                  f.payment = result.friend.payment;
                  $rootScope.$broadcast('plan-friends-changed', plan.getFriends());
                  $scope.paymentTotals();

                });
              }
            });
          };

          $scope.removeOutsidePayment = function(friendId, paymentId) {
            for (var i = 0; i < $scope.friends.length; i++) {
              var f = $scope.friends[i]
              if (f._id === friendId) {
                var l = f.payment.length;
                for (var j = 0; j < l; j++) {
                  var p = f.payment.shift();
                  if (p._id === paymentId) {
                    p.removeOutsidePaymentInProgress = true;

                    wembliRpc.fetch('plan.removeOutsidePayment', {
                      'friendId': f._id,
                      'paymentId': p._id,
                    }, function(err, result) {

                      if (err) {
                        console.log('error');
                        console.log(err);
                        p.error = true;
                        f.payment.push(p);
                        return;
                      }

                      if (!result.success) {
                        p.error = true;
                        f.payment.push(p);
                        return;
                      }

                      p.removeOutsidePaymentInProgress = false;
                      $scope.paymentTotals();
                    });
                  } else {
                    f.payment.push(p);
                  }
                }
              }
            }
          };

          $scope.cancelPonyUpRequest = function(friendId, paymentId) {
            for (var i = 0; i < $scope.friends.length; i++) {
              var f = $scope.friends[i]
              if (f._id === friendId) {
                var l = f.payment.length;
                for (var j = 0; j < l; j++) {
                  var p = f.payment.shift();
                  if (p._id === paymentId) {
                    p.cancelPonyUpRequestInProgress = true;

                    wembliRpc.fetch('plan.cancelPonyUpRequest', {
                      'friendId': f._id,
                      'paymentId': p._id,
                    }, function(err, result) {


                      if (err) {
                        console.log('error');
                        console.log(err);
                        p.error = true;
                        f.payment.push(p);
                        return;
                      }

                      if (!result.success) {
                        p.error = true;
                        f.payment.push(p);
                        return;
                      }

                      f.payment.push(result.payment);
                      p.cancelPonyUpRequestInProgress = false;
                      $scope.paymentTotals();

                    });
                  } else {
                    f.payment.push(p);
                  }
                }
              }
            }
          };

          $scope.resendPonyUp = function(friendId, paymentId) {

            for (var i = 0; i < $scope.friends.length; i++) {
              var f = $scope.friends[i]
              if (f._id === friendId) {
                angular.forEach(f.payment, function(p) {
                  if (p._id === paymentId) {
                    p.resendPonyUpInProgress = true;

                    wembliRpc.fetch('plan.resendPonyUpEmail', {
                      'friendId': f._id,
                      'paymentId': p._id,
                      'amount': parseInt(p.amount * 100),
                    }, function(err, result) {

                      if (err) {
                        console.log('error');
                        console.log(err);
                        p.error = true;
                        return;
                      }

                      if (!result.success) {
                        p.error = true;
                        return;
                      }

                      p.status = result.payment.status;
                      p.date = result.payment.date;
                      p.resendPonyUpInProgress = false;
                      p.resent = true;
                    });
                  }
                });
              }
            }
          };

          $scope.sendPonyUpEmail = function() {

            /* check if they have an account - if not throw a modal to collect account info */
            if ((typeof customer.get().balancedAPI === "undefined") || (typeof customer.get().balancedAPI.bankAccounts === "undefined")) {
              $('#create-account-modal').modal('show');
              return;
            }

            $scope.sendPonyUpInProgress = true;
            $scope.error = $scope.formError = $scope.success = false;
            /* get all the friends that have sendponyup checked and get the amounts */
            var ponyUpRequests = [];
            for (var i = 0; i < $scope.friends.length; i++) {
              var f = $scope.friends[i];
              if ((typeof f.ponyUp.amount !== "undefined") && f.ponyUp.request) {
                if (parseFloat(f.ponyUp.amount) > 0) {
                  var d = {
                    'friendId': f._id,
                    'amount': parseInt(parseFloat(f.ponyUp.amount) * 100)
                  };
                  ponyUpRequests.push(d);
                } else {
                  $scope.error = false;
                  $scope.success = false;
                  $scope.formError = true;
                  $scope.sendPonyUpInProgress = false;
                  return;
                }
              }
            };
            if (!ponyUpRequests[0]) {
              $scope.error = false;
              $scope.success = false;
              $scope.formError = true;
              $scope.sendPonyUpInProgress = false;
              return;
            }

            wembliRpc.fetch('plan.sendPonyUpEmail', {
              ponyUpRequests: ponyUpRequests
            }, function(err, result) {
              $scope.sendPonyUpInProgress = false;

              if (err) {
                console.log('error');
                console.log(err);
                $scope.error = true;
                return;
              }

              if (!result.success) {
                $scope.error = true;
                return;
              }

              $scope.success = true;

              for (var i = 0; i < $scope.friends.length; i++) {
                var f = $scope.friends[i]
                for (var j = 0; j < result.friends.length; j++) {
                  var f2 = result.friends[j];
                  if (f2._id === f._id) {
                    f.payment = f2.payment;
                  }
                };
              };
              $rootScope.$broadcast('plan-friends-changed', plan.getFriends());
              $scope.paymentTotals();
            });
          };

          var dereg = $scope.$on('bank-account-created', function(e) {
            $scope.sendPonyUpEmail();
            dereg();
          });

          /*
            sum all the type: requests
            sum all the others
            subtract requests from others and get balance
          */
          $scope.paymentTotals = function() {
            for (var i = 0; i < $scope.friends.length; i++) {
              var requested = 0;
              var received = 0;
              var balance = 0;
              var f = $scope.friends[i];
              f.ponyUp = (typeof f.ponyUp === "undefined") ? {} : f.ponyUp;
              f.ponyUp.open = false;
              f.ponyUp.request = true;

              for (var j = 0; j < f.payment.length; j++) {
                var p = f.payment[j];
                if (p.type == 'request') {
                  if (p.open) {
                    f.ponyUp.open = true;
                    f.ponyUp.request = false;
                  }
                  if (p.status !== 'canceled') {
                    requested += parseInt(p.amount);
                    p.amount = parseInt(p.amount);

                  }
                } else {
                  received += parseInt(p.amount);
                }
              }
              var reqFloat = requested;
              var recFloat = received;
              var balFloat = requested - received;
              f.payment.requested = requested;
              f.payment.received = received;
              f.payment.balance = balance;

            }
          }

          $scope.$watch('friends', function(newVal, oldVal) {
            if (newVal) {
              $scope.paymentTotals();
            }
          });


        }
      ],

      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          $rootScope.$broadcast('section-loaded');
        }
      }
    }
  }
]).

directive('itineraryMap', ['$rootScope', 'googleMap', 'plan', 'mapInfoWindowContent', 'mapVenue', 'mapMarker',
  function($rootScope, googleMap, plan, mapInfoWindowContent, mapVenue, mapMarker) {
    return {
      restrict: 'EC',
      cache: false,
      replace: true,
      scope: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {

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
            if (attr.draggable === 'true') {
              mapOpts.draggable = true;
            } else {
              mapOpts.draggable = false;
            }
          }

          mapOpts.scrollwheel = true;
          if (attr.scrollwheel) {
            if (attr.scrollwheel === 'true') {
              mapOpts.scrollwheel = true;
            } else {
              mapOpts.scrollwheel = false;
            }
          }

          googleMap.draw(element, mapOpts);

          plan.get(function(p) {
            /* reset the map */
            googleMap.isDrawn(false);

            var lat = p.venue.data.geocode.geometry.location.lat;
            var lng = p.venue.data.geocode.geometry.location.lng;

            /* make a marker for the venue */
            mapVenue.create(googleMap, {
              lat: lat,
              lng: lng,
              name: p.event.eventVenue,
              street: p.venue.data.Street1,
              city: p.event.eventCity,
              state: p.event.eventState
            });

            /* marker for the parking if there is parking chosen */
            var parking = plan.getParking();
            if (typeof parking[0] !== "undefined") {
              if (parking[0].service === "google") {
                var ll = new google.maps.LatLng(parking[0].parking.geometry.location.ob, parking[0].parking.geometry.location.pb);
                mapMarker.create(googleMap, {
                  icon: "/images/icons/map-icons/transportation/parkinggarage.png",
                  lat: ll.lat(),
                  lng: ll.lng(),
                  name: parking[0].parking.name,
                  body: parking[0].parking.vicinity
                });
              }

              if (parking[0].service === "pw") {
                mapMarker.create(googleMap, {
                  icon: "/images/icons/map-icons/transportation/parkinggarage.png",
                  lat: parking[0].parking.lat,
                  lng: parking[0].parking.lng,
                  name: parking[0].parking.location_name,
                  body: parking[0].parking.address + ', ' + parking[0].parking.city
                });
              }
            }

            /* marker for the restaurant if there is a deal chosen */
            var restaurants = plan.getRestaurants();
            if (typeof restaurants[0] !== "undefined") {
              if (restaurants[0].service === "google") {
                mapMarker.create(googleMap, {
                  icon: "/images/icons/map-icons/entertainment/restaurant.png",
                  lat: restaurants[0].restaurant.geometry.location.lat(),
                  lng: restaurants[0].restaurant.geometry.location.lng(),
                  name: restaurants[0].restaurant.name,
                  body: restaurants[0].restaurant.vicinity
                });
              }

              if (restaurants[0].service === "yipit") {
                mapMarker.create(googleMap, {
                  icon: "/images/icons/map-icons/entertainment/restaurant.png",
                  lat: restaurants[0].restaurant.business.locations[0].lat,
                  lng: restaurants[0].restaurant.business.locations[0].lon,
                  name: restaurants[0].restaurant.title,
                  body: restaurants[0].restaurant.business.name
                });
              }
            }

            if (scope.sequenceCompleted) {
              //googleMap.draw(element, mapOpts);
            } else {
              var dereg = scope.$watch('sequenceCompleted', function(complete) {
                if (complete) {
                  //googleMap.draw(element, mapOpts);
                  dereg();
                }
              })
            }
          });
        };
      }
    };
  }
]).

directive('friendPlanDashboard', ['$window', '$location', 'wembliRpc', 'plan', 'customer', 'pluralize', 'fetchModals',
  function($window, $location, wembliRpc, plan, customer, pluralize, fetchModals) {
    return {
      restrict: 'C',
      cache: false,
      replace: false,
      scope: false,
      compile: function(element, attr, transclude) {

        return function(scope, element, attr, controller) {
          var height = angular.element($window).height();
          $('#section6').css('min-height', height);

          fetchModals.fetch('/partials/modals/friend-dashboard', function() {

            plan.get(function(p) {

              var watchMe = function() {
                scope.guestCountPlural = pluralize(scope.me.rsvp.guestCount);

                if (scope.me.rsvp.decision === null) {
                  /* if they have not set the rsvp default to yes */
                  scope.setRsvp('decision', true);
                }

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

              if (scope.me) {
                watchMe();
              } else {
                var d = scope.$watch('me', function(newVal) {
                  if (typeof newVal !== "undefined") {
                    watchMe();
                    d();
                  }
                });
              }
            });
          });
          /* start polling for changes */
          /* took this out because it causes expanded sections get collapsed
          plan.poll(function(plan) {
            scope.plan = plan.get();
            scope.friends = plan.getFriends();
            scope.tickets = plan.getTickets();
            scope.feed = plan.getFeed();
            scope.context = plan.getContext();
            scope.organizer = plan.getOrganizer();
          });
          */

        };
      }
    };
  }
]).

directive('friendItinerarySection', ['$rootScope', 'wembliRpc',
  function($rootScope, wembliRpc) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: false,
      templateUrl: '/partials/plan/itinerary-section',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          $rootScope.$broadcast('section-loaded');
        };
      }
    };
  }
]).

directive('friendRsvpSection', ['$rootScope', 'wembliRpc', 'pluralize',
  function($rootScope, wembliRpc, pluralize) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: false,
      templateUrl: '/partials/plan/rsvp-section',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          $rootScope.$broadcast('section-loaded');

          /* handle the main plan rsvp */
          scope.setRsvp = function(rsvp) {
            scope.me.rsvp.decision = rsvp;
            if (scope.me.rsvp.decision === false) {
              scope.me.rsvp.guestCount = 0;
            }
            if (scope.me.rsvp.decision === true) {
              if (scope.me.rsvp.guestCount == 0) {
                scope.me.rsvp.guestCount = 1;
              }
            }

            wembliRpc.fetch('friend.submitRsvp', {
              decision: scope.me.rsvp.decision,
              guestCount: scope.me.rsvp.guestCount
            }, function(err, result) {
              scope.me = result.friend;
            });
          };

          /* key bindings for up and down arrows for guestCount */
          scope.guestCountKeyUp = function() {
            if (scope.me.rsvp.guestCount === "") {
              return;
            }
            scope.me.rsvp.decision = (scope.me.rsvp.guestCount > 0);

            scope.guestCountPlural = pluralize(scope.me.rsvp.guestCount);
            scope.calcTotalComing();

            wembliRpc.fetch('friend.submitRsvp', {
              decision: scope.me.rsvp.decision,
              guestCount: scope.me.rsvp.guestCount
            }, function(err, result) {
              scope.me = result.friend;
            });
          };

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
          };

        };
      }
    };
  }
]).

directive('friendVoteSection', ['$rootScope', 'wembliRpc',
  function($rootScope, wembliRpc) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: false,
      templateUrl: '/partials/plan/vote-section',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          $rootScope.$broadcast('section-loaded');


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
              scope.me = result.friend;
            });
          };

          var calcVotePriceTotal = function() {
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

          var toggleSlider = function(id, val) {
            if (val) {
              $(id).slider("enable");
            } else {
              $(id).slider("disable");
            }
          }

          var toggleMultiselect = function(id, val) {
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
            /* when they stop we save it */
            submitVote();
          }
          scope.parkingPriceSlide = function(event, ui) {
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
            submitVote();
          }
          scope.restaurantPriceSlide = function(event, ui) {
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
            submitVote();
          }

          scope.hotelPriceSlide = function(event, ui) {
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
            submitVote();
          }


          /* init the section */
          var watchMe = function() {
            scope.toggleInputs('parking', scope.me.rsvp.parking.decision);
            scope.toggleInputs('restaurant', scope.me.rsvp.restaurant.decision);
            scope.toggleInputs('hotel', scope.me.rsvp.hotel.decision);
          };

          if (scope.me) {
            watchMe();
          } else {
            var d = scope.$watch('me', function(newVal) {
              if (typeof newVal !== "undefined") {
                watchMe();
                d();
              }
            });
          }
        };
      }
    };
  }
]).

directive('friendInviteesSection', ['$rootScope', 'wembliRpc',
  function($rootScope, wembliRpc) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: false,
      templateUrl: '/partials/plan/invitees-section',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          $rootScope.$broadcast('section-loaded');
        };
      }
    };
  }
]).

directive('friendPonyUpSection', ['$rootScope', 'wembliRpc',
  function($rootScope, wembliRpc) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: false,
      templateUrl: '/partials/plan/pony-up-section',
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function($scope, $element, $attrs, $transclude, $timeout) {

          $scope.$watch('ponyUp.amountFormatted', function(newVal) {
            if (typeof newVal !== "undefined") {
              var amount = parseInt(parseFloat(newVal) * 100);
              $scope.ponyUp.transactionFee = .029 * parseFloat(amount) + 250;
              $scope.ponyUp.total = $scope.ponyUp.transactionFee + amount;
            }
          });


          function handlePonyUp(newValue) {
            if (typeof newValue !== "undefined") {
              var requested = 0;
              var received = 0;
              var balance = 0;

              /* evaluate what phase the pony-up section is in */
              /* check for any pony up requets from the organizer and grab the most recent one */
              for (var i = 0; i < newValue.payment.length; i++) {

                var p = newValue.payment[i];

                $scope.ponyUp = {
                  expirationDateMonth: '01',
                  expirationDateYear: '2014',
                  amount: 0,
                  amountFormatted: 0.00,
                  transactionFee:0,
                  total:0
                };

                if (p.type === 'request' && p.open) {
                  /* found a pony up request */
                  $scope.ponyUpRequest = p;
                  if (!$scope.ponyUp || !$scope.ponyUp.amount) {
                    $scope.ponyUp.amount = parseInt(p.amount) || 0;
                    $scope.ponyUp.amountFormatted = parseFloat($scope.ponyUp.amount / 100).toFixed(2);

                    $scope.ponyUp.cardHolderName = $scope.customer.firstName + ' ' + $scope.customer.lastName;
                    $scope.ponyUp.organizerFirstName = $scope.organizer.firstName;
                    console.log('ponyUp');
                    console.log($scope.ponyUp);
                  }
                }

                if (p.type == 'request') {

                  if (p.status !== 'canceled') {
                    requested += parseInt(p.amount);
                    p.amount = parseInt(p.amount);
                  }
                } else {
                  received += parseInt(p.amount);
                }



              };
              newValue.payment.requested = parseFloat(requested);
              newValue.payment.received = parseFloat(received);
              newValue.payment.balance = parseFloat((requested - received));
            }
          }

          handlePonyUp($scope.me);

          $rootScope.$on('pony-up-success', function(e, friend) {
            //$scope.me = JSON.parse(friend);
            $scope.me = friend;
            $scope.paymentTotals();
          });

          $scope.$watch('me', function(newValue, oldValue) {
            console.log('me changed');

            console.log(newValue);

            handlePonyUp(newValue);
          });

          $scope.showPonyUpModal = function() {
            $('#pony-up-modal').modal('show');
            $rootScope.$broadcast('pony-up-clicked', $scope.ponyUp);
          }
        }
      ],
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          $rootScope.$broadcast('section-loaded');
        };
      }
    };
  }
]).

directive('ponyUpModal', ['$rootScope', 'wembliRpc', 'plan',
  function($rootScope, wembliRpc, plan) {
    return {
      restrict: 'C',
      cache: false,
      scope: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          $rootScope.$on('pony-up-clicked', function(e, ponyUp) {
            //$scope.ponyUp = JSON.parse(ponyUp);
            scope.ponyUp = ponyUp;
          });
          scope.sendPonyUp = function() {
            scope.sendPonyUpInProgress = true;
            scope.error = scope.formError = scope.success = false;
            var args = {};
            args.total = scope.ponyUp.total;
            args.amount = parseInt(parseFloat(scope.ponyUp.amountFormatted) * 100);
            args.transactionFee = parseInt(scope.ponyUp.transactionFee);
            args.cardHolderName = scope.ponyUp.cardHolderName;
            args.creditCardNumber = scope.ponyUp.creditCardNumber;
            args.expirationDateMonth = scope.ponyUp.expirationDateMonth;
            args.expirationDateYear = scope.ponyUp.expirationDateYear;
            args.cvv = scope.ponyUp.cvv;
            args.postalCode = scope.ponyUp.postalCode;
            wembliRpc.fetch('plan.sendPonyUp', args, function(err, result) {
              scope.sendPonyUpInProgress = false;
              if (err) {
                console.log('error');
                console.log(err);
                scope.error = true;
                scope.errorMessage = err;
                scope.success = false;
                return;
              }

              if (!result.success) {
                scope.error = true;
                scope.success = false;
                scope.errorMessage = result.error;
                return;
              }
              scope.success = true;
              $rootScope.$broadcast('pony-up-success', result.friend);
            });
          };
        };
      }
    }
  }
]).


directive('jquerySlider', [
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

            var sliderArgs = {
              range: range,
              min: parseInt(attr.min),
              max: parseInt(attr.max),
              step: parseFloat(attr.step),
              create: function(event, ui) {
                if (typeof attr.enable !== "undefined") {
                  scope.$watch(attr.enable, function(newVal) {
                    if (typeof newVal !== "undefined") {
                      if (newVal) {
                        element.slider("enable");
                      } else {
                        element.slider("disable");
                      }
                    }
                  });
                }
              },
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
            }

            if (typeof attr.value !== "undefined") {
              sliderArgs.value = parseInt(val);
            }

            if (typeof attr.values !== "undefined") {
              sliderArgs.values = scope.$eval(attr.values);
            }

            element.slider(sliderArgs);

          });
        };
      }
    };
  }
]).


/*
 * this is the feed that was on the right - it has been removed - 20130614
 * this code can probably be deleted safely
 */

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
          /*
          (function tick() {
            wembliRpc.fetch('feed.get', {}, function(err, result) {
              scope.feed = result.feed;
              console.log('polled for feed');
              $timeout(tick, 5000);
            });
          })();
          */
        };
      }
    }
  }
]).


/*
    What can you do?
    - view all chatter + their comments
    - create a new chatter
    - reply on a chatter and create a comment
    - upVote a chatter
    - upVote a comment
    - edit the body of a chatter
    - delete a comment
 */

directive('planChatter', ['$timeout', 'wembliRpc', '$rootScope',
  function($timeout, wembliRpc, $rootScope) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: "/partials/plan/chatter",
      controller: function($scope, $element, $attrs, $transclude) {
        $scope.createChatter = function() {
          if ($scope.chatter.$valid) {
            $scope.createChatterInProgress = true;
            wembliRpc.fetch('chatter.create', {
              body: $scope.chatter.body
            }, function(err, results) {
              $scope.chatters = results.chatters;
              $scope.createChatterInProgress = false;
            });
          }
        };

      },
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {

          scope.chatterLoading = true;
          wembliRpc.fetch('chatter.get', {}, function(err, results) {
            scope.chatters = results.chatters;
            scope.chatterLoading = false;
            $rootScope.$broadcast('section-loaded');
          });



        };
      }
    }
  }
]).

directive('chatter', ['wembliRpc',
  function(wembliRpc) {
    return {
      restrict: 'C',
      controller: function($scope, $element, $attrs, $transclude) {
        $scope.upVoteChatter = function() {};

        $scope.toggleNewChatterComment = function() {
          $scope.newChatterComment = $scope.newChatterComment ? false : true;
        };

        $scope.createChatterComment = function() {
          if ($scope.comment.$valid) {
            $scope.createChatterCommentInProgress = true;
            var args = {
              body: $scope.comment.body,
              chatterId: $scope.chatter._id
            };
            wembliRpc.fetch('chatter.addComment', args, function(err, results) {
              $scope.chatter.comments = results.comments;
              $scope.createChatterCommentInProgress = false;
            });
          }
        }
      },
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {

        };
      }
    }
  }
]).

directive('newChatterComment', ['wembliRpc', '$timeout',
  function(wembliRpc, $timeout) {
    return {
      restrict: 'C',
      controller: function($scope, $element, $attrs, $transclude) {
        $scope.createChatterComment = function() {
          if ($scope.comment.$valid) {
            $scope.createChatterCommentInProgress = true;
            var args = {
              body: $scope.comment.body,
              chatterId: $scope.chatter._id
            };
            wembliRpc.fetch('chatter.addComment', args, function(err, results) {
              $scope.chatter.comments = results.comments;
              $scope.createChatterCommentInProgress = false;
              /* this will make the comment box go away after they post a comment */
              //$scope.newChatterComment = false;
            });
          }
        }
      },
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          scope.$watch('newChatterComment', function(val, old) {
            if (val) {
              element.slideDown(500);
            }
            if (val === false) {
              element.slideUp(500);
            }
          })
        };
      }
    }
  }
]);
