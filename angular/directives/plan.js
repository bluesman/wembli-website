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
          planNav.registerSection();
          //$rootScope.$broadcast('section-loaded');
        }
      }
    }
  }
]).

directive('itineraryMap', ['$rootScope', 'googleMap', 'googlePlaces', 'plan', 'mapInfoWindowContent', 'mapVenue', 'mapMarker', '$timeout',
  function($rootScope, googleMap, googlePlaces, plan, mapInfoWindowContent, mapVenue, mapMarker, $timeout) {
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
            angular.forEach(parking, function(p) {
              if (p.service === "google") {
                googlePlaces.getDetails(p.parking.reference, function(place, status) {
                  mapMarker.create(googleMap, {
                    icon: "/images/icons/map-icons/transportation/parkinggarage.png",
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    name: place.name,
                    body: place.vicinity
                  });

                });
              }

              if (p.service === "pw") {
                mapMarker.create(googleMap, {
                  icon: "/images/icons/map-icons/transportation/parkinggarage.png",
                  lat: p.parking.lat,
                  lng: p.parking.lng,
                  name: p.parking.location_name,
                  body: p.parking.address + ', ' + p.parking.city
                });
              }

            });

            /* marker for the restaurant if there is a deal chosen */
            var restaurants = plan.getRestaurants();
            angular.forEach(restaurants, function(r) {
              if (r.service === "google") {
                googlePlaces.getDetails(r.restaurant.reference, function(place, status) {
                  mapMarker.create(googleMap, {
                    icon: "/images/icons/map-icons/entertainment/restaurant.png",
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    name: place.name,
                    body: place.vicinity
                  });
                });
              }

              if (r.service === "yipit") {
                mapMarker.create(googleMap, {
                  icon: "/images/icons/map-icons/entertainment/restaurant.png",
                  lat: r.restaurant.business.locations[0].lat,
                  lng: r.restaurant.business.locations[0].lon,
                  name: r.restaurant.title,
                  body: r.restaurant.business.name
                });
              }

            });

            /* marker for the hotels if there is a hotel chosen */
            var hotels = plan.getHotels();
            angular.forEach(hotels, function(h) {
              if (h.service === "google") {
                googlePlaces.getDetails(h.hotel.reference, function(place, status) {
                  mapMarker.create(googleMap, {
                    icon: "/images/icons/map-icons/entertainment/hotel_0star.png",
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    name: place.name,
                    body: place.vicinity
                  });
                });
              }

            });

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

directive('friendPlanDashboardOff', ['$window', '$location', 'wembliRpc', 'plan', 'customer', 'pluralize', 'fetchModals',
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

directive('friendRsvpSectionOff', ['planNav', 'wembliRpc', 'pluralize',
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


        };
      }
    };
  }
]).

directive('friendVoteSectionOff', ['planNav', 'wembliRpc',
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
]);
