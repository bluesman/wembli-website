'use strict';

/* Directives */
angular.module('wembliApp.directives.search', []).

/*
 * fetch more events on scroll
 */
directive('eventListWaypoint', ['wembliRpc', '$filter', '$timeout',
  function(wembliRpc, $filter, $timeout) {
    return {
      restrict: 'C',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          scope.events = [];
          scope.loadingMoreEvents = false;

          /* set a waypoint to fetch events when bottom is in view */
          var opts = {
            offset: 'bottom-in-view',
          };

          var handler = function(direction) {
            var $this = $(this);

            if (direction === 'down') {
              $this.waypoint('disable');
              scope.loadingMoreEvents = true;

              var args = {
                "beginDate": scope.lastEventDate,
                "orderByClause": "Date",
                "lastEventId": scope.lastEventId
              };

              if (scope.search) {
                args.searchTerms = scope.search;
                var method = 'event.search';
              } else {
                args.nearZip = scope.postalCode;
                var method = 'event.get';
              }

              wembliRpc.fetch(method, args, function(err, result) {
                scope.loadingMoreEvents = false;
                if (err) {
                  scope.noMoreEvents = true;
                  $this.waypoint('destroy');
                  return;
                }

                $timeout(function() {
                  console.log(result);
                  if (result.event.length < 1) {
                    scope.noMoreEvents = true;
                    $this.waypoint('destroy');
                  } else {
                    scope.noMoreEvents = false;
                    scope.events = scope.events.concat(result['event']);
                    var d = new Date(scope.events[scope.events.length - 1].Date);
                    scope.lastEventDate = $filter('date')(d, "MM-dd-yy");
                    scope.lastEventId = scope.events[scope.events.length - 1].ID;
                    scope.$digest();
                  }
                  $this.waypoint('enable');
                });

              });
            }
          };

          $('.event-list-waypoint').waypoint(handler, opts);
        }
      }
    }
  }
]).


/*
 * show the tickets summary info popover for search results
 */
directive('showTicketRange', ['wembliRpc', '$window',
  function(wembliRpc, $window) {
    return {
      restrict: 'C',
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function($scope, $element, $attrs, $transclude) {}
      ],
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          element.mouseover(function() {

            if (typeof scope.ticketSummaryData == "undefined") {
              scope.ticketSummaryData = {};
            }

            //we have already fetched and displayed this one
            if (typeof scope.ticketSummaryData[attr.eventId] != "undefined") {
              console.log('already fetched');
              return;
            }

            scope.ticketSummaryData[attr.eventId] = {};

            /* if its locked that means we moused in while doing a fetch */
            if (scope.ticketSummaryData[attr.eventId].locked) {
              console.log('locked');
              return;
            }

            /* lock so we don't fetch more than once (we will unlock when the http req returns) */
            scope.ticketSummaryData[attr.eventId].locked = true;

            /* fetch the event data */
            var args = {
              "eventID": attr.eventId
            };

              console.log('getpricing info');
              console.log(args);

            wembliRpc.fetch('event.getPricingInfo', args, function(err, result) {
                var summaryContent = 'Click for ticket pricing';

                if (err) {
                  $('#' + attr.id + ' .ticket-range').html(summaryContent).fadeIn();
                  return;
                }

                /* we cached the result..lets unlock */
                scope.ticketSummaryData[attr.eventId].locked = false;

                /* init the popover */
                if (typeof result.ticketPricingInfo.ticketsAvailable !== "undefined") {
                  if (result.ticketPricingInfo.ticketsAvailable !== '0') {
                    summaryContent = (result.ticketPricingInfo.ticketsAvailable === "1") ? result.ticketPricingInfo.ticketsAvailable + " ticket" : result.ticketPricingInfo.ticketsAvailable + " tickets";
                    if (parseFloat(result.ticketPricingInfo.lowPrice) === parseFloat(result.ticketPricingInfo.highPrice)) {
                      summaryContent += "<br/> $" + parseFloat(result.ticketPricingInfo.lowPrice).toFixed(0);
                    } else {
                      summaryContent += "<br/> $" + parseFloat(result.ticketPricingInfo.lowPrice).toFixed(0) + " - $" + parseFloat(result.ticketPricingInfo.highPrice).toFixed(0);
                    }
                  }
                }

                scope.ticketSummaryData[attr.eventId] = summaryContent;

                if (summaryContent) {
                  $('#' + attr.id + ' .ticket-range').html(summaryContent).fadeIn();
                }
              });
          });

        };
      }
    }
  }
]);
