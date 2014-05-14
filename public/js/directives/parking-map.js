'use strict';

/* Directives */
angular.module('wembliApp.directives.parkingMap', []).

directive('parkingMoreInfo', ['$rootScope', '$window', '$location', '$http', '$timeout', 'fetchModals', 'plan',
  function($rootScope, $window, $location, $http, $timeout, fetchModals, plan) {
    return {
      restrict: 'EAC',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          attr.$observe('parking', function(val) {
            if (typeof val === "undefined") {
              return;
            }
            var parking = JSON.parse(val);

            element.click(function() {
              $rootScope.$broadcast('parking-info-clicked', {
                parking: parking
              });

              if ($('#parking-info-modal').length > 0) {
                $('#parking-info-modal').modal('show');
              }
            });
          });
        }
      }
    }
  }
]).

directive('parkingLoginModal', ['$rootScope', '$window', '$location', '$http', '$timeout', 'fetchModals', 'plan',
  function($rootScope, $window, $location, $http, $timeout, fetchModals, plan) {
    return {
      restrict: 'EAC',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          attr.$observe('parking', function(val) {
            var parking = JSON.parse(val);
            var displayParkingLoginModal = function(e) {
              $rootScope.$broadcast('parking-login-clicked', {
                parking: parking
              });

              if ($('#parking-login-modal').length > 0) {
                $('#parking-login-modal').modal('show');
              } else {
                $rootScope.$on('parking-login-modal-fetched', function() {
                  $('#parking-login-modal').modal('show');
                });
              }
            };

            if (/parking-login-modal/.test($location.hash())) {
              /* if this button is the right one */
              var h = $location.hash();
              var service = h.split('-')[3];
              var id = h.split('-')[4];

              if (service === 'google') {
                if (parking.id == id) {
                  displayParkingLoginModal();

                }
              }
              if (service === 'pw') {
                if (parking.listing_id == id) {
                  displayParkingLoginModal();
                }
              }
            }

            element.click(displayParkingLoginModal);

          });
        }
      }
    };
  }
]).

directive('buyParkingOffsite', ['$rootScope', '$window', '$location', '$http', '$timeout', 'fetchModals', 'plan',
  function($rootScope, $window, $location, $http, $timeout, fetchModals, plan) {

    return {
      restrict: 'EAC',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          element.click(function(e) {
            $location.hash('');
            var parking = JSON.parse(attr.parking);
            var amountPaid = parseFloat(parking.price);
            /* add this ticket group - it will be removed if they later say they did not buy it */
            plan.addParking({
              service: 'pw',
              eventId: plan.get().event.eventId,
              parking: parking,
              total: amountPaid,
              payment: JSON.stringify({
                amount: amountPaid,
              })
            }, function(err, results) {
              var p = plan.getParking();

              var newP = [];

              if (typeof p[0] === "undefined") {
                newP.push(results.parking);
              } else {
                for (var i = 0; i < p.length; i++) {
                  if (p[i]._id = results.parking._id) {
                    newP.push(results.parking);
                  } else {
                    newP.push(p[i]);
                  }
                };
              }
              plan.setParking(newP);
              $rootScope.$broadcast('parking-changed', {
                parking: newP
              });

              $rootScope.$broadcast('parking-offsite-clicked', {
                amountPaid: amountPaid,
                qty: 1,
                parking: results.parking,
                eventId: plan.get().event.eventId,
                eventName: plan.get().event.eventName,
                parkingId: results.parking._id
              });
              var Promise = $timeout(function() {
                $('#parking-login-modal').modal('hide');
                $('#parking-offsite-modal').modal('show');
              }, 1500);
            });
          });
        }
      }
    };
  }
]).

directive('addParkingToPlan', ['$rootScope', '$window', '$location', '$http', '$timeout', 'fetchModals', 'plan', 'wembliRpc', 'parking',
  function($rootScope, $window, $location, $http, $timeout, fetchModals, plan, wembliRpc, parking) {

    return {
      restrict: 'EAC',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          element.click(function(e) {
            var parkingToAdd = JSON.parse(attr.parking);
            var payment = {};

            /*
              if service is not pw then its not something the will ever have a receipt for
              still need to set a receipt though cause many views depend on the receipt to know
              if this is the end of the process or not
            */
            if (attr.service !== 'pw') {
              payment.receipt = {
                "not-available": true
              };
            }

            wembliRpc.fetch('plan.addParking', {
              service: attr.service,
              eventId: plan.get().event.eventId,
              parking: parkingToAdd,
              total: 0,
              payment: JSON.stringify(payment)
            }, function(err, result) {
              var p = plan.getParking();

              var newP = [];

              if (typeof p[0] === "undefined") {
                newP.push(result.parking);
              } else {
                for (var i = 0; i < p.length; i++) {
                  if (p[i]._id = result.parking._id) {
                    newP.push(result.parking);
                  } else {
                    newP.push(p[i]);
                  }
                };
              }
              plan.setParking(newP);
              $rootScope.$broadcast('parking-changed', {
                parking: newP
              });
            });
          });
        }
      }
    };
  }
]).

directive('parkingMap', ['$rootScope', 'googleMap',
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