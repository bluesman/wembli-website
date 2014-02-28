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
]);

