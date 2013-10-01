'use strict';

/* Directives */
angular.module('wembliApp.directives.hotelsMap', []).

directive('hotelsMap', ['$rootScope', 'googleMap',
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
