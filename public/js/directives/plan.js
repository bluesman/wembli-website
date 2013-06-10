'use strict';

/* Directives */
angular.module('wembliApp.directives.plan', []).

directive('planNav', ['$location', 'planNav',
  function($location, planNav) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: "/partials/plan/nav",
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {};
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
          $rootScope.$on('rsvp-for-clicked', function(e, f) {
            var friend = JSON.parse(f);
            console.log(friend);
            scope.friend = friend;

            /* toggle decision when guest cound goes above 0 */
            scope.$watch('friend.rsvp.guestCount', function(newVal, oldVal) {
              console.log('guest count is: ');
              console.log(newVal);
              console.log(scope.friend.rsvp.guestCount);

              if (typeof scope.friend.rsvp.guestCount === "undefined") {
                return;
              }

            });

            /* handle the main plan rsvp */
            scope.setRsvp = function(rsvp) {
              console.log('setting decision to: ' + rsvp);
              scope.friend.rsvp.decision = rsvp;
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
              console.log(args);
              wembliRpc.fetch('plan.submitRsvpFor', args, function(err, result) {
                console.log(result);
                scope.friend = result.friend;
                plan.fetch(function() {
                  console.log('force friends change');
                  $rootScope.$broadcast('plan-friends-changed', plan.getFriends());
                });

              });
            }

            /* key bindings for up and down arrows for guestCount */
            scope.guestCountKeyUp = function() {
              if (scope.friend.rsvp.guestCount === "") {
                return;
              }
              console.log('guestcount in keyup');
              console.log(scope.friend.rsvp.guestCount);
              scope.friend.rsvp.decision = (scope.friend.rsvp.guestCount > 0);

              scope.guestCountPlural = pluralize(scope.friend.rsvp.guestCount);

              wembliRpc.fetch('friend.submitRsvp', {
                decision: scope.friend.rsvp.decision,
                guestCount: scope.friend.rsvp.guestCount
              }, function(err, result) {
                console.log(result);
                scope.friend = result.friend;
              });
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

directive('organizerPlanDashboard', ['$window', '$location', 'wembliRpc', 'plan', 'customer', 'pluralize', 'fetchModals',
  function($window, $location, wembliRpc, plan, customer, pluralize, fetchModals) {
    return {
      restrict: 'C',
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          var height = angular.element($window).height();
          $('#section9').css('min-height', height);

          /* fetch the invitation wizard modal */
          fetchModals.fetch('/partials/invite-friends-wizard', function() {
            var options = {
              'backdrop': 'static',
              'keyboard': false,
            };
            console.log('path is:' + $location.path());
            if (/^\/invitation/.test($location.path())) {
              $('#invitation-modal').modal(options);
            }
          });

          /* fetch the organizer plan modals */
          fetchModals.fetch('/partials/modals/organizer-dashboard');

          scope.savePrefs = function() {
            console.log('save prefs');
            console.log(scope.plan.preferences);
            plan.savePreferences({
              preferences: scope.plan.preferences
            }, function(err, result) {
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

          /*
          scope.$watch('plan.preferences.addOns.parking', savePrefs);
          scope.$watch('plan.preferences.addOns.restaurants', savePrefs);
          scope.$watch('plan.preferences.addOns.hotels', savePrefs);
          scope.$watch('plan.preferences.inviteOptions.guestFriends', savePrefs);
          scope.$watch('plan.preferences.inviteOptions.over21', savePrefs);
          scope.$watch('plan.preferences.guestList', savePrefs);
          */

          /* make sure we have a plan */
          scope.plan = plan.get();
          console.log(scope.plan);

          scope.friends = plan.getFriends();

          /* update the invitees when the list changes */
          scope.$on('plan-friends-changed', function(e, friends) {
            scope.friends = plan.getFriends();
          });

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

directive('planDashboard', ['$window', 'plan', 'customer', 'pluralize', '$location', 'planNav',
  function($window, plan, customer, pluralize, $location, planNav) {
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

          /* this had to wait for dashboard to load */
          var sectionNumber = 1;

          /* scroll down to the section denoted by hash */
          if ($location.hash()) {
            var h = $location.hash();
            sectionNumber = parseInt(h.charAt(h.length - 1));
            console.log('scroll down to ' + sectionNumber);
          }

          planNav.scrollTo(sectionNumber);
          $('.plan-section-nav').removeClass('active');
          $('#nav-section' + (sectionNumber)).addClass('active');

        };
      }
    }
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

directive('planChatter', ['wembliRpc',
  function(wembliRpc) {
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
              console.log('chatter.create');
              console.log(err);
              console.log(results);
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
            console.log('chatter.get');
            console.log(err);
            console.log(results);
            scope.chatters = results.chatters;
            scope.chatterLoading = false;
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
            console.log('createChatterComment');
            console.log($scope.chatter);
            var args = {
              body: $scope.comment.body,
              chatterId: $scope.chatter._id
            };
            console.log(args);
            wembliRpc.fetch('chatter.addComment', args, function(err, results) {
              console.log('chatter.addComment');
              console.log(err);
              console.log(results);
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
            console.log('createChatterComment');
            console.log($scope.chatter);
            var args = {
              body: $scope.comment.body,
              chatterId: $scope.chatter._id
            };
            console.log(args);
            wembliRpc.fetch('chatter.addComment', args, function(err, results) {
              console.log('chatter.addComment');
              console.log(err);
              console.log(results);
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
