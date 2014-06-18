'use strict';

/* Directives */
angular.module('wembliApp.directives.plan', []).

directive('notification', ['$timeout', 'notifications',
  function($timeout, notifications) {
    return {
      restrict: 'EAC',
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          element.click(function() {
            notifications.update();
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
              wembliRpc.fetch('plan.resendRsvpEmail', rpcArgs, function(err, result) {
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
              scope.$apply(function() {
                scope.toggle = !scope.toggle;
              });
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

directive('planDashboardOff', ['$templateCache','$timeout', '$rootScope', '$window', '$location', 'wembliRpc', 'cart', 'plan', 'customer', 'pluralize', 'fetchModals', 'planNav',
  function($templateCache, $timeout, $rootScope, $window, $location, wembliRpc, cart, plan, customer, pluralize, fetchModals, planNav) {
    return {
      restrict: 'C',
      replace: true,
      scope: false, //this has to be false so that the plan is shared among all the child directives
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function($scope, $element, $attrs, $transclude) {

          /* update the invitees when the list changes */
          /* don't think this is necessary anymore
          $scope.$on('plan-friends-changed', function(e, friends) {
            $scope.plan = plan.get();
            $scope.friends = plan.getFriends();
            $scope.calcTotalComing();
          });

          $scope.$on('plan-rsvp-changed', function(e, rsvpDate) {
            $scope.plan.rsvpDate = rsvpDate;
          });

          $scope.$on('tickets-changed', function(e, data) {
            $scope.tickets = data.tickets;
          });

          $scope.$on('restaurants-changed', function(e, data) {
            $scope.restaurants = data.restaurants;
          });

          $scope.$on('parking-changed', function(e, data) {
            $scope.parking = data.parking;
          });
          */

        }
      ],
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          /* clear the template cache because switching between organizer and friend is the same template - refactor this */
          $templateCache.removeAll();

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
              //scope.guestCountPlural = pluralize(scope.me.rsvp.guestCount);
              scope.calcTotalComing();
            }
          });

        }
      }
    };
  }
]).

/* this has been replaced by controllers/plan.js OrganizerPlanCtrl */
directive('organizerPlanDashboardOff', ['$rootScope', '$window', '$location', 'wembliRpc', 'cart', 'plan', 'customer', 'pluralize', 'fetchModals', 'planNav',
  function($rootScope, $window, $location, wembliRpc, cart, plan, customer, pluralize, fetchModals, planNav) {
    return {
      restrict: 'C',
      scope: false,
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function($scope, $element, $attrs, $transclude, $timeout) {
          /* display a modal when they click to go off and buy tickets */
          fetchModals.fetch('/partials/tickets-offsite', function(err) {
            if (err) {}
          });
        }
      ],
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {

          /* fetch the organizer plan modals */
          fetchModals.fetch('/partials/modals/organizer-dashboard', function() {
            plan.get(function(p) {

            });
          });
        };
      }
    };
  }
]).

directive('organizerItinerarySectionOff', ['wembliRpc', 'planNav',
  function(wembliRpc, planNav) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: false,
      templateUrl: '/partials/plan/itinerary-section/organizer',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          console.log('organize itinerary loaded');
          planNav.registerSection();
          //$rootScope.$broadcast('section-loaded');
        };
      }
    };
  }
]).

/* replaced by controllers/plan.js OrganizerRsvpCtrl */
directive('organizerRsvpSectionOff', ['planNav', 'plan',
  function(planNav, plan) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: false,
      templateUrl: '/partials/plan/rsvp-section/organizer',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          console.log('organize rsvp loaded');
          planNav.registerSection();
          //$rootScope.$broadcast('section-loaded');
        };
      }
    };
  }
]).

directive('organizerCartSectionOff', ['ticketPurchaseUrls', 'plan', 'cart', 'planNav',
  function(ticketPurchaseUrls, plan, cart, planNav) {
    return {
      restrict: 'E',
      replace: true,
      scope: false,
      templateUrl: '/partials/plan/cart-section/organizer',
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function($scope, $element, $attrs, $transclude, $timeout) {}
      ],
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          scope.tnUrl = ticketPurchaseUrls.tn;
          console.log('organize cart loaded');
          planNav.registerSection();
          //$rootScope.$broadcast('section-loaded');

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

directive('organizerPonyUpSectionOff', ['$rootScope', 'plan', 'wembliRpc', '$timeout', 'customer', 'planNav',
  function($rootScope, plan, wembliRpc, $timeout, customer, planNav) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: false,
      templateUrl: '/partials/plan/pony-up-section/organizer',
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function($scope, $element, $attrs, $transclude, $timeout) {

        }
      ],

      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          console.log('organize pony up loaded');
          planNav.registerSection();
          //$rootScope.$broadcast('section-loaded');
        }
      }
    }
  }
]).

directive('itineraryMap', ['$rootScope', 'googleMap', 'plan', 'mapInfoWindowContent', 'mapVenue', 'mapMarker', '$timeout',
  function($rootScope, googleMap, plan, mapInfoWindowContent, mapVenue, mapMarker, $timeout) {
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

          /* google map is drawing before the div width is defined and screwing everything up */
          googleMap.draw(element, mapOpts);

          var placeMarkers = function(p) {

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
          };

          plan.get(function(p) {
            scope.$on('google-map-resize', function() {
              googleMap.init();
              googleMap.draw(element, mapOpts);
              placeMarkers(p);
            });

            var dereg = scope.$on('google-map-drawn',function() {
              placeMarkers(p);
            });
            if (googleMap.isDrawn()) {
              dereg();
              placeMarkers(p);
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

directive('friendItinerarySection', ['wembliRpc', 'planNav',
  function(wembliRpc, planNav) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: false,
      templateUrl: '/partials/plan/itinerary-section/friend',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          planNav.registerSection();
          //$rootScope.$broadcast('section-loaded');
        };
      }
    };
  }
]).

directive('friendRsvpSection', ['planNav', 'wembliRpc', 'pluralize',
  function(planNav, wembliRpc, pluralize) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: false,
      templateUrl: '/partials/plan/rsvp-section/friend',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          planNav.registerSection();
          //$rootScope.$broadcast('section-loaded');

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

directive('friendVoteSection', ['planNav', 'wembliRpc',
  function(planNav, wembliRpc) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: false,
      templateUrl: '/partials/plan/vote-section/friend',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          planNav.registerSection();
          //$rootScope.$broadcast('section-loaded');


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

directive('friendInviteesSection', ['planNav', 'wembliRpc',
  function(planNav, wembliRpc) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: false,
      templateUrl: '/partials/plan/invitees-section/friend',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          planNav.registerSection();
          //$rootScope.$broadcast('section-loaded');
        };
      }
    };
  }
]).

directive('friendPonyUpSection', ['$rootScope', 'wembliRpc', 'planNav',
  function($rootScope, wembliRpc, planNav) {
    return {
      restrict: 'E',
      cache: false,
      replace: true,
      scope: false,
      templateUrl: '/partials/plan/pony-up-section/friend',
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
                  transactionFee: 0,
                  total: 0
                };

                if (p.type === 'request' && p.open) {
                  console.log('pony up request is open');
                  console.log(p);
                  /* found a pony up request */
                  $scope.ponyUpRequest = p;
                  if (!$scope.ponyUp || !$scope.ponyUp.amount) {
                    $scope.ponyUp.amount = parseInt(p.amount) || 0;
                    $scope.ponyUp.amountFormatted = parseFloat($scope.ponyUp.amount / 100).toFixed(2);
                    $scope.ponyUp.transactionFee = ($scope.ponyUp.amount * .029) + 250; //tx fee %2.9 + 250
                    $scope.ponyUp.total = $scope.ponyUp.transactionFee + $scope.ponyUp.amount;

                    $scope.ponyUp.cardHolderName = $scope.customer.firstName + ' ' + $scope.customer.lastName;
                    $scope.ponyUp.organizerFirstName = $scope.organizer.firstName;
                  }
                  console.log($scope.ponyUp);
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
          planNav.registerSection();
          //$rootScope.$broadcast('section-loaded');
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
            if (scope.sendPonyUpInProgress) {
              return;
            }
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

directive('planChatter', ['$timeout', 'wembliRpc', 'planNav',
  function($timeout, wembliRpc, planNav) {
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
            $timeout(function() {
              console.log('organize chatter loaded');
              planNav.registerSection();
              //$rootScope.$broadcast('section-loaded');
            }, 500);

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
