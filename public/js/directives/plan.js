'use strict';

/* Directives */
angular.module('wembliApp.directives.plan', []).

directive('planNav', ['$location', 'planNav', '$rootScope', '$timeout',
  function($location, planNav, $rootScope, $timeout) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: "/partials/plan/nav",
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          console.log('calling planNav directive');
          //$('#page-loading-modal').modal("hide");
          //$rootScope.genericLoadingModal.header = 'Getting your plan...';
          //$('#generic-loading-modal').modal("show");

          scope.sectionsLoaded = 0;
          console.log('watch for section-loaded event');
          var dereg = scope.$on('section-loaded', function(e, data) {
            scope.sectionsLoaded++;
            if (scope.sectionsLoaded == attr.sections) {
              scope.sectionsLoaded = 0;
              var sectionNumber = 1;


              if ($location.hash()) {
                var h = $location.hash();
                sectionNumber = parseInt(h.charAt(h.length - 1));
              }

              planNav.scrollTo(sectionNumber);
              $('.plan-section-nav').removeClass('active');
              $('#nav-section' + (sectionNumber)).addClass('active');

              $timeout(function() {
                $('#page-loading-modal').modal("hide");
              }, 1000);

              dereg();
            }
          });

          /* setup the scroll handler for each of the sections */
          angular.element('#content').on('scroll', function() {

            for (var i = 1; i <= parseInt(attr.sections); i++) {
              /* if the previous section has scrolled halfway
               * and this section is not more off the screen than half the height of the section
               * then highlight the left nav for this element
               */
              var sectionNum = i;
              var currentId = '#section' + sectionNum;
              var prevId = '#section' + sectionNum--;
              var h = $(currentId).height();
              var prevHeight = ($(prevId).height() / 2);
              var t = $(currentId).offset().top;
              if (t <= prevHeight && t > -(h / 2)) {
                /*
                 * if the section nav that is active is not the one that should be active
                 * then make that section in active
                 */
                if ($('.plan-section-nav.active').attr('id') !== 'nav-section' + i) {
                  $('.plan-section-nav.active').removeClass('active');
                  $('#nav-section' + i).addClass('active');
                }
              }
            }
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
                plan.fetch(function() {
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


directive('organizerPlanDashboard', ['$rootScope', '$window', '$location', 'wembliRpc', 'plan', 'customer', 'pluralize', 'fetchModals', 'planNav',
  function($rootScope, $window, $location, wembliRpc, plan, customer, pluralize, fetchModals, planNav) {
    return {
      restrict: 'E',
      replace: true,
      cache: true,
      scope: true,
      templateUrl: "/partials/plan/dashboard",
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function($scope, $element, $attrs, $transclude, $timeout) {
          console.log('controller running for organizer plan dashboard');

          $scope.plan = plan.get();
          $scope.organizer = plan.getOrganizer();
          $scope.tickets = plan.getTickets();
          $scope.friends = plan.getFriends();

          console.log($scope.tickets);
          $scope.serviceFee = function(price) {
            return price * 0.15;
          }

          // TODO - make this a filter?
          $scope.showEllipses = function(ary, len) {
            if (typeof ary !== "undefined") {
              return (ary.join(', ').length > len);
            }
          };


          $scope.calcTotalComing = function() {
            $scope.totalComing = 0;
            $scope.friendsComing = [];
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

              if ($scope.friends[i].rsvp.decision) {
                $scope.totalComing = parseInt($scope.totalComing) + parseInt($scope.friends[i].rsvp.guestCount);
                $scope.friendsComing.push($scope.friends[i]);
              }
            };
            /* count the organizer */
            if ($scope.plan.organizer.rsvp.decision) {
              $scope.totalComing = parseInt($scope.totalComing) + parseInt($scope.plan.organizer.rsvp.guestCount);
              $scope.friendsComing.push()
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

          /* pluralize the people coming list header */
          $scope.$watch('totalComing', function() {
            $scope.totalComingPlural = pluralize($scope.totalComing);
          });


          $scope.savePrefs = function() {
            plan.savePreferences({
              preferences: $scope.plan.preferences
            }, function(err, result) {});
          };

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
            });
          };

          $scope.guestCountPlural = pluralize($scope.plan.organizer.rsvp.guestCount);

          if ($scope.plan.organizer.rsvp.decision === null) {
            $scope.setRsvp(true);
          }

          /* update the invitees when the list changes */
          console.log('watching for plan-friends-changed event');
          $scope.$on('plan-friends-changed', function(e, friends) {
            console.log('plan friends changed event');
            $scope.friends = plan.getFriends();
            $scope.calcTotalComing();
          });

          $scope.calcTotalComing();

          /* start polling for changes */
          plan.poll(function(plan) {
            $scope.plan = plan.get();
            $scope.friends = plan.getFriends();
            $scope.tickets = plan.getTickets();
            $scope.feed = plan.getFeed();
            $scope.context = plan.getContext();
            $scope.organizer = plan.getOrganizer();
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
            if (/^\/invitation/.test($location.path())) {
              $('#invitation-modal').modal(options);
            }
          });


          /* fetch the organizer plan modals */
          fetchModals.fetch('/partials/modals/organizer-dashboard', function() {
            console.log('fetched organizer dashboard modal');
            var p = plan.get();
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
                      console.log('deregRsvpComplete')
                      handleRsvpComplete();
                      deregRsvpComplete();
                    }
                  }
                });
              }
            }
          });
        };
      }
    };
  }
]).

directive('organizerEventSection', ['$rootScope',
  function($rootScope) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: true,
      templateUrl: '/partials/plan/event-section',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          $rootScope.$broadcast('section-loaded');
        };
      }
    };
  }
]).

directive('organizerInviteesSection', ['$rootScope',
  function($rootScope) {
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

directive('organizerTicketsSection', ['$rootScope',
  function($rootScope) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: true,
      templateUrl: '/partials/plan/tickets-section',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          $rootScope.$broadcast('section-loaded');
        };
      }
    };
  }
]).

directive('organizerParkingSection', ['$rootScope',
  function($rootScope) {
    return {
      restrict: 'E',
      cache: false,
      scope: true,
      replace: true,
      templateUrl: '/partials/plan/parking-section',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          $rootScope.$broadcast('section-loaded');
        };
      }
    };
  }
]).

directive('organizerRestaurantsSection', ['$rootScope',
  function($rootScope) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: true,
      templateUrl: '/partials/plan/restaurants-section',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          $rootScope.$broadcast('section-loaded');
        };
      }
    };
  }
]).

directive('organizerHotelsSection', ['$rootScope',
  function($rootScope) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: true,
      templateUrl: '/partials/plan/hotels-section',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          $rootScope.$broadcast('section-loaded');
        };
      }
    };
  }
]).

directive('organizerMoneySection', ['$rootScope',
  function($rootScope) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: true,
      templateUrl: '/partials/plan/money-section',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          $rootScope.$broadcast('section-loaded');
        };
      }
    };
  }
]).

directive('organizerItinerarySection', ['$rootScope',
  function($rootScope) {
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


directive('friendPlanDashboard', ['$window', '$location', 'wembliRpc', 'plan', 'customer', 'pluralize',
  function($window, $location, wembliRpc, plan, customer, pluralize) {
    return {
      restrict: 'E',
      cache: false,
      scope: true,
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

          /* toggle decision when guest cound goes above 0 */
          scope.$watch('me.rsvp.guestCount', function(newVal, oldVal) {

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

                scope.calcTotalComing();

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

          if (typeof plan.getFriends() !== "undefined") {
            scope.friends = plan.getFriends();

            /* get the friend that is this customer */
            for (var i = 0; i < scope.friends.length; i++) {
              if (scope.friends[i].customerId === customer.get().id) {
                scope.me = scope.friends[i];
                scope.guestCountPlural = pluralize(scope.me.rsvp.guestCount);

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

directive('planSection', ['$window',
  function($window) {
    return {
      restrict: 'EAC',
      replace: true,
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {

        };
      }
    }
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
