'use strict';

/* Directives */
angular.module('wembliApp.directives.header', []).

directive('wembliHeader', ['header',
  function(header) {
    return {
      restrict: 'C',
      replace: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          attr.header = attr.header || '#header';
          attr.scroll = attr.scroll || 'window';

          header.init(attr.header, attr.scroll);
        }
      }
    }
  }
]).
directive('slidepanel', [
  function() {
    return {
      restrict: 'C',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          var sp = $('[data-slidepanel]').slidepanel({
            "static": false,
            "mode": 'overlay'
          });

          /* put this in a service? */
          $('#overlay').click(function() {
            if (angular.element('#slidepanel').is(':visible')) {
              angular.element('#slidepanel .close').click();
            }
          });

          $('#slidepanel .close').click(function() {
            $('#overlay').removeClass('overlay');
          });

          element.click(function() {
            $('#overlay').toggleClass('overlay');
          });
        }
      }
    }
  }
]);

