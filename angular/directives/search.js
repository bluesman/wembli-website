'use strict';

/* Directives */
angular.module('wembliApp.directives.search', []).


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
              return;
            }

            scope.ticketSummaryData[attr.eventId] = {};

            /* if its locked that means we moused in while doing a fetch */
            if (scope.ticketSummaryData[attr.eventId].locked) {
              return;
            }

            /* lock so we don't fetch more than once (we will unlock when the http req returns) */
            scope.ticketSummaryData[attr.eventId].locked = true;

            /* fetch the event data */
            var args = {
              "eventID": attr.eventId
            };

            wembliRpc.fetch('event.getPricingInfo', args,

              function(err, result) {
                if (err) {
                  alert('error happened - contact help@wembli.com');
                  return;
                }

                /* we cached the result..lets unlock */
                scope.ticketSummaryData[attr.eventId].locked = false;

                /* init the popover */
                var summaryContent = null;
                if (typeof result.ticketPricingInfo.ticketsAvailable !== "undefined") {
                  if (result.ticketPricingInfo.ticketsAvailable === '0') {
                    summaryContent = null;
                  } else {
                    summaryContent = (result.ticketPricingInfo.ticketsAvailable === "1") ? result.ticketPricingInfo.ticketsAvailable + " ticket" : result.ticketPricingInfo.ticketsAvailable + " tickets";
                    if (parseFloat(result.ticketPricingInfo.lowPrice) === parseFloat(result.ticketPricingInfo.highPrice)) {
                      summaryContent += "<br/> $" + parseFloat(result.ticketPricingInfo.lowPrice).toFixed(0);
                    } else {
                      summaryContent += "<br/> $" + parseFloat(result.ticketPricingInfo.lowPrice).toFixed(0) + " - $" + parseFloat(result.ticketPricingInfo.highPrice).toFixed(0);
                    }
                  }
                } else {
                  summaryContent = null;
                }
                console.log(summaryContent);
                scope.ticketSummaryData[attr.eventId] = summaryContent;

                if (summaryContent) {
                  $('#' + attr.id + ' .ticket-range').html(summaryContent).fadeIn();
                }
              },

              /* transformRequest */

              function(data, headersGetter) {
                //$('#more-events .spinner').show();
                return data;
              },

              /* transformResponse */

              function(data, headersGetter) {
                //$('#more-events .spinner').hide();
                return JSON.parse(data);
              });
          });

        };
      }
    }
  }
]);

