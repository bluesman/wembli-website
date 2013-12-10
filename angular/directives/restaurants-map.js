'use strict';

/* Directives */
angular.module('wembliApp.directives.restaurantsMap', []).


directive('restaurantsMoreInfo', ['$rootScope', '$window', '$location', '$http', '$timeout', 'fetchModals', 'plan',
  function($rootScope, $window, $location, $http, $timeout, fetchModals, plan) {
    return {
      restrict: 'EAC',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          attr.$observe('restaurant', function(val) {
            if (typeof val === "undefined") {
              return;
            }
            var restaurant = JSON.parse(val);

            element.click(function() {

              $rootScope.$broadcast('restaurants-info-clicked', {
                restaurant: restaurant
              });

              if ($('#restaurants-info-modal').length > 0) {
                $('#restaurants-info-modal').modal('show');
              }
            });
          });
        }
      }
    }
  }
]).

directive('restaurantsLoginModal', ['$rootScope', '$window', '$location', '$http', '$timeout', 'fetchModals', 'plan',
  function($rootScope, $window, $location, $http, $timeout, fetchModals, plan) {
    return {
      restrict: 'EAC',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          attr.$observe('restaurant', function(val) {
            var restaurant = JSON.parse(val);
            var displayRestaurantsLoginModal = function(e) {
              $rootScope.$broadcast('restaurants-login-clicked', {
                restaurant: restaurant
              });

              if ($('#restaurants-login-modal').length > 0) {
                $('#restaurants-login-modal').modal('show');
              } else {
                $rootScope.$on('restaurants-login-modal-fetched', function() {
                  $('#restaurants-login-modal').modal('show');
                });
              }
            };

            if (/restaurants-login-modal/.test($location.hash())) {
              /* if this button is the right one */
              var h = $location.hash();
              var service = h.split('-')[3];
              var id = h.split('-')[4];

              if (service === 'google') {
                if (restaurant.id == id) {
                  displayRestaurantsLoginModal();

                }
              }
              if (service === 'yipit') {
                if (restaurant.id == id) {
                  displayRestaurantsLoginModal();
                }
              }
            }

            element.click(displayRestaurantsLoginModal);

          });
        }
      }
    };
  }
]).

directive('buyRestaurantsOffsite', ['$rootScope', '$window', '$location', '$http', '$timeout', 'fetchModals', 'plan',
  function($rootScope, $window, $location, $http, $timeout, fetchModals, plan) {

    return {
      restrict: 'EAC',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          element.click(function(e) {
            $location.hash('');
            var restaurant = JSON.parse(attr.restaurant);
            var amountPaid = parseFloat(restaurant.price.raw);
            /* add this ticket group - it will be removed if they later say they did not buy it */
            plan.addRestaurant({
              service: 'yipit',
              eventId: plan.get().event.eventId,
              restaurant: restaurant,
              total: amountPaid,
              payment: JSON.stringify({
                amount: amountPaid,
              })
            }, function(err, results) {

              var restaurants = plan.getRestaurants();

              var newR = [];

              if (typeof restaurants[0] === "undefined") {
                newR.push(results.restaurant);
              } else {
                for (var i = 0; i < restaurants.length; i++) {
                  if (restaurants[i]._id = results.restaurant._id) {
                    newR.push(results.restaurant);
                  } else {
                    newR.push(restaurants[i]);
                  }
                };
              }
              plan.setRestaurants(newR);
              $rootScope.$broadcast('restaurants-changed', {
                restaurants: newR
              });

              $rootScope.$broadcast('restaurants-offsite-clicked', {
                amountPaid: amountPaid,
                qty: 1,
                restaurant: results.restaurant,
                eventId: plan.get().event.eventId,
                eventName: plan.get().event.eventName,
                restaurantId: results.restaurant._id
              });
              var Promise = $timeout(function() {
                $('#restaurants-login-modal').modal('hide');
                $('#restaurants-offsite-modal').modal('show');
              }, 1500);
            });
          });
        }
      }
    };
  }
]).

directive('addDealToPlan', ['$rootScope', '$window', '$location', '$http', '$timeout', 'fetchModals', 'plan', 'wembliRpc', 'restaurants',
  function($rootScope, $window, $location, $http, $timeout, fetchModals, plan, wembliRpc, restaurants) {

    return {
      restrict: 'EAC',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          element.click(function(e) {
            var restaurantToAdd = JSON.parse(attr.restaurant);
            var payment = {};

            /*
              if service is not yipit then its not something the will ever have a receipt for
              still need to set a receipt though cause many views depend on the receipt to know
              if this is the end of the process or not
            */
            if (attr.service !== 'yipit') {
              payment.receipt = {
                "not-available": true
              };
            }

            wembliRpc.fetch('plan.addRestaurant', {
              service: attr.service,
              eventId: plan.get().event.eventId,
              restaurant: restaurantToAdd,
              total: 0,
              payment: JSON.stringify(payment)
            }, function(err, result) {
              var r = plan.getRestaurants();

              var newR = [];

              if (typeof r[0] === "undefined") {
                newR.push(result.restaurant);
              } else {
                for (var i = 0; i < r.length; i++) {
                  if (r[i]._id = result.restaurant._id) {
                    newR.push(result.restaurant);
                  } else {
                    newR.push(r[i]);
                  }
                };
              }
              plan.setRestaurants(newR);
              $rootScope.$broadcast('restaurants-changed', {
                restaurants: newR
              });
            });
          });
        }
      }
    };
  }
]).

directive('restaurantsMap', ['$rootScope', 'googleMap',
  function($rootScope, googleMap) {
    return {
      restrict: 'EC',
      cache: false,
      replace: true,
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
            mapOpts.draggable = attr.draggable;
          }

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
]);
