'use strict';

/* Directives */
angular.module('wembliApp.directives.typeahead', []).

directive('typeahead', [

  function() {
    /* opts for typeahead are to complex for attr so have to hack here to map a key to preset opts */
    var config = {
      /* opts for the index search typeahead */
      'index': [
      {
        name: 'events',
        remote: '/typeahead/events/%QUERY',
        header: '<h3 class="typeahead-header">Events</h3>',
      },
      {
        name: 'performers',
        remote: '/typeahead/performers/%QUERY',
        header: '<h3 class="typeahead-header">Performers</h3>',
      },
      {
        name: 'venues',
        remote: '/typeahead/venues/%QUERY',
        header: '<h3 class="typeahead-header">Venues</h3>',
      },
      ],
    };

    return {
      restrict: 'C',
      replace: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          console.log(config[attr.config]);
          element.typeahead(config[attr.config]);
        }
      }
    }
  }
]);
