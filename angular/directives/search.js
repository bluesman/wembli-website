'use strict';

/* Directives */
angular.module('wembliApp.directives.search', []).


/*
 * show the tickets summary info popover for search results
 */
directive('eventWrapper', ['wembliRpc', '$window',
  function(wembliRpc, $window) {
    return {
      restrict: 'C',
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function($scope, $element, $attrs, $transclude) {}
      ],
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          element.mouseleave(function() {
            var elId = (typeof element.parents('li').attr('id') == "undefined") ? element.attr('id') : element.parents('li').attr('id');
            $(".event-wrapper").popover("hide");
          });

          element.mouseover(function() {
            var elId = (typeof element.parents('li').attr('id') == "undefined") ? element.attr('id') : element.parents('li').attr('id');

            if (attr.noPopover) {
              return;
            }

            if (typeof scope.ticketSummaryData == "undefined") {
              scope.ticketSummaryData = {};
              scope.ticketSummaryData.locked = false;
            }

            /* if its locked that means we moused in while doing a fetch */
            if (scope.ticketSummaryData.locked) {
              return;
            }

            //we have a cache of the data - gtfo
            $(".event-wrapper").popover("destroy");
            if (typeof scope.ticketSummaryData[elId.split('-')[0]] != "undefined") {
              $('#' + elId).popover({
                placement: "left",
                trigger: 'hover',
                animation: false,
                title: 'Tickets Summary',
                content: scope.ticketSummaryData[elId.split('-')[0]],
              });
              $('#' + elId).popover("show");
              return;
            }

            /* lock so we don't fetch more than once (we will unlock when the http req returns) */
            scope.ticketSummaryData.locked = true;

            /* fetch the event data */
            var args = {
              "eventID": elId.split('-')[0]
            };

            wembliRpc.fetch('event.getPricingInfo', args,

              function(err, result) {
                if (err) {
                  alert('error happened - contact help@wembli.com');
                  return;
                }

                /* we cached the result..lets unlock */
                scope.ticketSummaryData.locked = false;
                /* init the popover */
                var summaryContent = "";
                if (typeof result.ticketPricingInfo.ticketsAvailable !== "undefined") {
                  if (result.ticketPricingInfo.ticketsAvailable === '0') {
                    summaryContent = "Click for ticket information";
                  } else {
                    summaryContent = (result.ticketPricingInfo.ticketsAvailable === "1") ? result.ticketPricingInfo.ticketsAvailable + " ticket choice" : result.ticketPricingInfo.ticketsAvailable + " ticket choices";
                    if (parseFloat(result.ticketPricingInfo.lowPrice) === parseFloat(result.ticketPricingInfo.highPrice)) {
                      summaryContent += " from $" + parseFloat(result.ticketPricingInfo.lowPrice).toFixed(0);
                    } else {
                      summaryContent += " from $" + parseFloat(result.ticketPricingInfo.lowPrice).toFixed(0) + " to $" + parseFloat(result.ticketPricingInfo.highPrice).toFixed(0);
                    }
                  }
                } else {
                  summaryContent = "Click for ticket information";
                }
                scope.ticketSummaryData[elId.split('-')[0]] = summaryContent;

                $('#' + elId).popover({
                  placement: "left",
                  trigger: 'manual',
                  animation: false,
                  title: 'Tickets Summary',
                  content: summaryContent,
                });
                $('#' + elId).popover("show");

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

