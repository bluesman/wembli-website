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
      templateUrl: "/partials/plan/nav",
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          console.log('calling planNav directive');
          plan.get(function(p) {

            var scrollToSection = 1;
            if ($location.hash()) {
              console.log('navigating to hash: ' + $location.hash());
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
          element.click(function() {
            $rootScope.$broadcast('rsvp-for-clicked', attr.friend);
            $('#rsvp-for-modal').modal('show');
          });
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
          console.log('setting up watcher for rsvp-clicked event');
          $rootScope.$on('rsvp-for-clicked', function(e, f) {
            var friend = JSON.parse(f);
            scope.friend = friend;

            console.log('watching friend.rsvp.guestCount');
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
      scope: true,
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
              console.log('slideKey ' + slideKey);
              console.log('caretKey ' + caretKey);
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

directive('planDashboard', ['$rootScope', '$window', '$location', 'wembliRpc', 'plan', 'customer', 'pluralize', 'fetchModals', 'planNav',
  function($rootScope, $window, $location, wembliRpc, plan, customer, pluralize, fetchModals, planNav) {
    return {
      restrict: 'C',
      replace: true,
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function($scope, $element, $attrs, $transclude, $timeout) {
          console.log('start plan dashboard controller');
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
                    $scope.friends[i].totalPoniedUp += parseFloat(p.amount);
                  }
                };
                $scope.totalPoniedUp += $scope.friends[i].totalPoniedUp;
              }
            };

            /* count the organizer */
            if ($scope.plan.organizer.rsvp.decision) {
              $scope.totalComing = parseInt($scope.totalComing) + parseInt($scope.plan.organizer.rsvp.guestCount);
              $scope.friendsComing.push()
            }
          };

          plan.fetch(function(results) {
            plan.get(function(p) {
              $scope.plan = p;
              $scope.organizer = plan.getOrganizer();
              $scope.tickets = plan.getTickets();
              $scope.friends = plan.getFriends();

              /* get the friend that is this customer */
              for (var i = 0; i < $scope.friends.length; i++) {
                if ($scope.friends[i].customerId === customer.get().id) {
                  $scope.me = $scope.friends[i];
                  console.log('scope.me set');
                }
              };
              console.log($scope.tickets);
            });
          });
          /*
          $scope.$on('plan-tickets-changed', function(e, ticketGroup) {
            plan.fetch(function(result) {
              reloadPlan();
              $rootScope.$broadcast('foo-test');
            });
          });
          */
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
        }
      }
    };
  }
]).

directive('organizerPlanDashboard', ['$rootScope', '$window', '$location', 'wembliRpc', 'plan', 'customer', 'pluralize', 'fetchModals', 'planNav',
  function($rootScope, $window, $location, wembliRpc, plan, customer, pluralize, fetchModals, planNav) {
    return {
      restrict: 'C',
      replace: true,
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function($scope, $element, $attrs, $transclude, $timeout) {
          console.log('controller running for organizer plan dashboard');

          /* display a modal when they click to go off and buy tickets */
          fetchModals.fetch('/partials/tickets-offsite', function(err) {
            if (err) {
              return console.log('no modal for buy tickets offsite');
            }
          });

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
            console.log('tickets qty:' + sum);
            console.log('total coming: ' + $scope.totalComing);
            /* if they have more than 0 tickets, check to see if they have more than the number of people coming */
            if (sum > 0) {
              $scope.ticketCountMismatch = true;
              if (sum >= $scope.totalComing) {
                console.log('mismatch is false');
                $scope.ticketCountMismatch = false;
              }
            }
          };

          /* pluralize the people coming list header */
          $scope.$watch('totalComing', function() {
            $scope.totalComingPlural = pluralize($scope.totalComing);
            $scope.reconcileTicketQty();
          });

          $scope.$watch('plan.tickets[0].ticketGroup.selectedQty', function() {
            $scope.reconcileTicketQty();
          })

          $scope.savePrefs = function() {
            console.log('savePrefs');
            console.log($scope.plan.preferences);
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

          if ($scope.plan) {
            $scope.guestCountPlural = pluralize($scope.plan.organizer.rsvp.guestCount);

            if ($scope.plan.organizer.rsvp.decision === null) {
              $scope.setRsvp(true);
            }

            $scope.calcTotalComing();
          } else {
            var d = $scope.$watch('plan', function(newVal, oldVal) {
              if (newVal) {
                $scope.guestCountPlural = pluralize($scope.plan.organizer.rsvp.guestCount);

                if ($scope.plan.organizer.rsvp.decision === null) {
                  $scope.setRsvp(true);
                }

                $scope.calcTotalComing();
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

          /* update the invitees when the list changes */
          console.log('watching for plan-friends-changed event');
          $scope.$on('plan-friends-changed', function(e, friends) {
            console.log('plan friends changed event');
            $scope.friends = plan.getFriends();
            console.log($scope.friends);
            $scope.plan = plan.get();
            $scope.calcTotalComing();
          });

          /* update the rsvp date when it changes */
          $scope.$on('plan-rsvp-changed', function(e, rsvpDate) {
            $scope.plan.rsvpDate = rsvpDate;
          });
        }
      ],
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          console.log('running organizer-plan-dashboard');

          /* fetch the invitation wizard modal */
          fetchModals.fetch('/partials/invite-friends-wizard', function() {
            console.log('fetched invitation wizard modal');
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
            console.log('fetched organizer dashboard modal');
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
                      scope.plan = result.plan;
                    });
                  }
                }


                /* check right now if the plan has become rsvpComplete */
                if (plan.rsvpComplete()) {
                  handleRsvpComplete();
                } else {
                  console.log('set watcher on plan for rsvpcomplete');
                  var deregRsvpComplete = scope.$watch('plan', function(newVal, oldVal) {
                    console.log('called rsvpcomplete watcher callback');
                    if (newVal) {
                      if (plan.rsvpComplete()) {
                        console.log('and rsvp is complete');
                        console.log('deregRsvpComplete')
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
      scope: true,
      templateUrl: '/partials/plan/itinerary-section',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          $rootScope.$broadcast('section-loaded');
          var timer;
          scope.submitNotes = function() {
            clearTimeout(timer);
            timer = setTimeout(function() {
              console.log('saving notes');
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
      scope: true,
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

directive('organizerCartSection', ['$rootScope', 'ticketPurchaseUrls', 'plan',
  function($rootScope, ticketPurchaseUrls, plan) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/partials/plan/cart-section',
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function($scope, $element, $attrs, $transclude, $timeout) {
          console.log('SETTING SCOPE ON FOO TEST');
          $scope.$on('foo-test', function(e) {
            console.log('foo-test called');
            console.log($scope.tickets);
          });
        }
      ],
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          console.log('init cart section');
          scope.tnUrl = ticketPurchaseUrls.tn;
          $rootScope.$broadcast('section-loaded');
        };
      }
    };
  }
]).

directive('organizerPonyUpSection', ['$rootScope', 'plan', 'wembliRpc', '$timeout',
  function($rootScope, plan, wembliRpc, $timeout) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: true,
      templateUrl: '/partials/plan/pony-up-section',
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function($scope, $element, $attrs, $transclude, $timeout) {

          $scope.submitOutsidePayment = function(friendId) {
            console.log('submitted outside payment');
            console.log('for: ' + friendId);
            var friends;
            angular.forEach($scope.friends, function(f) {
              if (f._id == friendId) {
                if (!f.ponyUp.outsideSourceAmount || (parseFloat(f.ponyUp.outsideSourceAmount) == 0)) {
                  console.log('no outside source amount');
                  return;
                }
                console.log('saving outside payment for friend: ' + friendId);
                f.ponyUp.submitInProgress = true;
                console.log(f.ponyUp);
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
                  console.log('result from outside payment')
                  console.log(f.payment);
                  $scope.paymentTotals();

                });
              }
            });
          };

          $scope.removeOutsidePayment = function(friendId, paymentId) {
            console.log('removing outside payment');
            console.log('for: ' + friendId);
            console.log('for: ' + paymentId);

            for (var i = 0; i < $scope.friends.length; i++) {
              var f = $scope.friends[i]
              if (f._id === friendId) {
                var l = f.payment.length;
                for (var j = 0; j < l; j++) {
                  var p = f.payment.shift();
                  if (p._id === paymentId) {
                    console.log('found a matching payment to remove outside payment');
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

                      console.log('result from remove outside payment');
                      console.log(result);
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
            console.log('cancel pony up request');
            console.log('for: ' + friendId);
            console.log('for: ' + paymentId);

            for (var i = 0; i < $scope.friends.length; i++) {
              var f = $scope.friends[i]
              if (f._id === friendId) {
                var l = f.payment.length;
                for (var j = 0; j < l; j++) {
                  var p = f.payment.shift();
                  if (p._id === paymentId) {
                    console.log('found a matching payment to cancel pony up request');
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

                      console.log('result from cancel pony up request');
                      console.log(result);
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
            console.log('resend pony up email');
            console.log('for: ' + friendId);
            console.log('for: ' + paymentId);
            for (var i = 0; i < $scope.friends.length; i++) {
              var f = $scope.friends[i]
              if (f._id === friendId) {
                angular.forEach(f.payment, function(p) {
                  if (p._id === paymentId) {
                    console.log('found a matching payment to resent pony up for');
                    p.resendPonyUpInProgress = true;

                    wembliRpc.fetch('plan.resendPonyUpEmail', {
                      'friendId': f._id,
                      'paymentId': p._id,
                      'amount': p.amount
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

                      console.log('result from resend ponyup email');
                      console.log(result);
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
            console.log('trying to send pony up email');
            $scope.sendPonyUpInProgress = true;
            $scope.error = $scope.formError = $scope.success = false;
            /* get all the friends that have sendponyup checked and get the amounts */
            var ponyUpRequests = [];
            for (var i = 0; i < $scope.friends.length; i++) {
              var f = $scope.friends[i];
              if (f.ponyUp.request) {
                if (f.ponyUp.amount > 0) {
                  var d = {
                    'friendId': f._id,
                    'amount': parseFloat(f.ponyUp.amount).toFixed(2)
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
              console.log('result from send ponyup email');
              console.log(result);
              for (var i = 0; i < $scope.friends.length; i++) {
                var f = $scope.friends[i]
                for (var j = 0; j < result.friends.length; j++) {
                  var f2 = result.friends[j];
                  if (f2._id === f._id) {
                    f.payment = f2.payment;
                  }
                };
              };
              console.log('updating scope friends');
              console.log($scope.friends);
              $rootScope.$broadcast('plan-friends-changed', plan.getFriends());
              $scope.paymentTotals();
            });
          };

          /*
            sum all the type: requests
            sum all the others
            subtract requests from others and get balance
          */
          $scope.paymentTotals = function() {
            console.log('calc payment totals');
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
                    requested += parseFloat(p.amount);
                  }
                } else {
                  received += parseFloat(p.amount);
                }
              }
              f.payment.requested = requested;
              f.payment.received = received;
              f.payment.balance = requested - received;
              console.log(f);
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

directive('itineraryMap', ['$rootScope', 'googleMap', 'plan', 'mapInfoWindowContent',
  function($rootScope, googleMap, plan, mapInfoWindowContent) {
    return {
      restrict: 'EC',
      cache: false,
      replace: true,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          console.log('link itinerary map!');

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
          console.log('mapopts');
          console.log(mapOpts);

          googleMap.draw(element, mapOpts);
          console.log('after map draw');

          plan.get(function(p) {
            /* reset the map */
            googleMap.isDrawn(false);

            var lat = p.venue.data.geocode.geometry.location.lat;
            var lng = p.venue.data.geocode.geometry.location.lng;

            /* make a marker for the venue */
            var marker = new google.maps.Marker({
              map: googleMap.getMap(),
              position: new google.maps.LatLng(lat, lng),
            });
            marker.setIcon("/images/icons/map-icons/sports/stadium.png");
            marker.setAnimation(google.maps.Animation.DROP);

            /* infoWindow for the venue marker */
            var win = new google.maps.InfoWindow({
              content: mapInfoWindowContent.create({
                header: p.event.eventVenue,
                body: p.venue.data.Street1 + ', ' + p.event.eventCity + ', ' + p.event.eventState
              }),
              pixelOffset: new google.maps.Size(10, 0),
            });

            google.maps.event.addListener(marker, 'click', function() {
              console.log('clicked infowindow')
              if (googleMap.isInfoWindowOpen(marker)) {
                googleMap.closeInfoWindow(marker);
              } else {
                googleMap.openInfoWindow(marker);
              }
            });
            /* put the marker on the map */
            googleMap.addMarker(marker);
            /* put the infoWindow on the map */
            googleMap.addInfoWindow(win, marker);
            /* open the infowindow for the venue by default */
            googleMap.openInfoWindow(marker);

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
      compile: function(element, attr, transclude) {

        return function(scope, element, attr, controller) {
          var height = angular.element($window).height();
          $('#section6').css('min-height', height);

          /* pluralize the people coming list header */
          scope.$watch('totalComing', function() {
            console.log('totalcoming changes');
            scope.totalComingPlural = pluralize(scope.totalComing);
          });


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

          /* handle the main plan rsvp */
          scope.setRsvp = function(rsvpFor, rsvp) {
            var funcs = {
              'decision': function(rsvp) {
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
                  scope.calcTotalComing();

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
            scope.me.rsvp.decision = (scope.me.rsvp.guestCount > 0);

            scope.guestCountPlural = pluralize(scope.me.rsvp.guestCount);
            scope.calcTotalComing();

            wembliRpc.fetch('friend.submitRsvp', {
              decision: scope.me.rsvp.decision,
              guestCount: scope.me.rsvp.guestCount
            }, function(err, result) {
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

          var initDirective = function() {
            scope.guestCountPlural = pluralize(scope.plan.organizer.rsvp.guestCount);

            scope.calcTotalComing();

            scope.guestCountPlural = pluralize(scope.me.rsvp.guestCount);

            /* safety check - if scope.me is undefined then they are not invited to this plan and shoudl not be viewing it */
            if (typeof scope.me === "undefined") {
              $location.path('/logout');
            }

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

            console.log('toggle inputs!!!');
            scope.toggleInputs('parking', scope.me.rsvp.parking.decision);
            scope.toggleInputs('restaurant', scope.me.rsvp.restaurant.decision);
            scope.toggleInputs('hotel', scope.me.rsvp.hotel.decision);


          }

          fetchModals.fetch('/partials/modals/friend-dashboard', function() {
            console.log('fetched friend dashboard modals');

            if (scope.plan) {
              initDirective();
            } else {
              var d = scope.$watch('plan', function(newVal, oldVal) {
                if (newVal) {
                  initDirective();
                  d();
                }
              });
            }
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
      scope: true,
      templateUrl: '/partials/plan/itinerary-section',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          $rootScope.$broadcast('section-loaded');
        };
      }
    };
  }
]).

directive('friendRsvpSection', ['$rootScope', 'wembliRpc',
  function($rootScope, wembliRpc) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: true,
      templateUrl: '/partials/plan/rsvp-section',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          $rootScope.$broadcast('section-loaded');
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
      scope: true,
      templateUrl: '/partials/plan/vote-section',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          $rootScope.$broadcast('section-loaded');
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
      scope: true,
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
      templateUrl: '/partials/plan/pony-up-section',
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function($scope, $element, $attrs, $transclude, $timeout) {

          $rootScope.$on('pony-up-success', function(e, friend) {
            //$scope.me = JSON.parse(friend);
            $scope.me = friend;
            $scope.paymentTotals();
          });

          $scope.$watch('me', function(scope, newValue, oldValue) {
            if (typeof newValue !== "undefined") {
              console.log(newValue);
              /* evaluate what phase the pony-up section is in */
              /* check for any pony up requets from the organizer and grab the most recent one */
              for (var i = 0; i < newValue.payment.length; i++) {
                var p = newValue.payment[i];
                if (p.type === 'request' && p.open) {
                  /* found a pony up request */
                  $scope.ponyUpRequest = p;
                  if (!$scope.ponyUp.amount) {
                    $scope.ponyUp = {};
                    $scope.ponyUp.amount = p.amount;
                    $scope.ponyUp.cardHolderName = $scope.customer.firstName + ' ' + $scope.customer.lastName;
                  }
                  console.log('ponyUp Scope');
                  console.log($scope.ponyUp);
                }
              };
            }
          });

          $scope.showPonyUpModal = function() {
            $('#pony-up-modal').modal('show');
            $rootScope.$broadcast('pony-up-clicked', $scope.ponyUp);
          }

          /*
            sum all the type: requests
            sum all the others
            subtract requests from others and get balance
          */
          $scope.paymentTotals = function() {
            console.log('calc payment totals');
            var requested = 0;
            var received = 0;
            var balance = 0;
            var me = $scope.me;
            for (var j = 0; j < me.payment.length; j++) {
              var p = me.payment[j];
              if (p.type == 'request') {
                if (p.status !== 'canceled') {
                  requested += parseFloat(p.amount);
                }
              } else {
                paid += parseFloat(p.amount);
              }
            }
            me.payment.requested = requested;
            me.payment.received = received;
            me.payment.balance = requested - received;
            console.log(me);

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
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          console.log('setting up watcher for ponyup-clicked event');
          $rootScope.$on('pony-up-clicked', function(e, ponyUp) {
            console.log(ponyUp);
            //$scope.ponyUp = JSON.parse(ponyUp);
            scope.ponyUp = ponyUp;

            scope.sendPonyUp = function() {
              console.log('trying to send pony up');
              scope.sendPonyUpInProgress = true;
              scope.error = scope.formError = scope.success = false;
              scope.sendPonyUpInProgress = false;

              wembliRpc.fetch('plan.sendPonyUp', scope.ponyUp, function(err, result) {
                if (err) {
                  console.log('error');
                  console.log(err);
                  scope.error = true;
                  return;
                }

                if (!result.success) {
                  scope.error = true;
                  return;
                }
                scope.success = true;
                console.log('result from send ponyup');
                console.log(result);
                $rootScope.$broadcast('pony-up-success', result.friend);
              });
            };
          });
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

            attr.$observe('disable', function(disable) {
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

directive('planChatter', ['wembliRpc', '$rootScope',
  function(wembliRpc, $rootScope) {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
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
        }
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
