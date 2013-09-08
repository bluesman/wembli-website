'use strict';

/* Directives */
angular.module('wembliApp.directives.parkingMap', []).


directive('parkingLoginModal', ['$rootScope', '$window', '$location', '$http', '$timeout', 'fetchModals', 'plan',
  function($rootScope, $window, $location, $http, $timeout, fetchModals, plan) {
    return {
      restrict: 'EAC',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          attr.$observe('parking', function(val) {
            var parking = JSON.parse(val);
            var displayParkingLoginModal = function(e) {
              console.log('display parking login modal with parking:');
              console.log(parking);
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
              console.log('service:' + service);
              console.log('id' + id);

              if (service === 'google') {
                if (parking.id == id) {
                  displayParkingLoginModal();

                }
              }
              if (service === 'pw') {
                console.log('parking login is in hash and service is pw');
                console.log(parking);
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
          console.log('SETTING CLICK FOR OFFSITE');
          element.click(function(e) {
            $location.hash('');
            var parking = JSON.parse(attr.parking);
            var amountPaid = parseFloat(parking.price);
            console.log('clicked buy parking offsite button');
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
              console.log('results form adding parking to plan');
              console.log(results);

              var p = plan.getParking();
              console.log('existing parking');
              console.log(p);

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
              console.log('new parking');
              console.log(newP);
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
            console.log('clicked add parking');
            console.log(attr.parking);
            var parkingToAdd = JSON.parse(attr.parking);
            console.log(parkingToAdd);
            console.log('service');
            console.log(attr.service);

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
              eventId: p.event.eventId,
              parking: parkingToAdd,
              total: 0,
              payment: JSON.stringify(payment)
            }, function(err, result) {
              console.log('back from adding parking');
              console.log(result);

              var p = plan.getParking();
              console.log('existing parking');
              console.log(p);

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
              console.log('new parking');
              console.log(newP);
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
]);
