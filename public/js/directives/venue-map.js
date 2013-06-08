'use strict';

/* Directives */
angular.module('wembliApp.directives.venueMap', []).

directive('interactiveVenueMap', ['$rootScope', 'interactiveMapDefaults', 'wembliRpc', '$window', '$templateCache', 'plan',
  function($rootScope, interactiveMapDefaults, wembliRpc, $window, $templateCache, plan) {
    return {
      restrict: 'E',
      replace: true,
      cache: false,
      templateUrl: "/partials/interactive-venue-map",
      compile: function(element, attr, transclude) {

        var generateTnSessionId = function() {
          var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
          var sid_length = 5;
          var sid = '';
          for (var i = 0; i < sid_length; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            sid += chars.substring(rnum, rnum + 1);
          }
          return sid;
        };

        return function(scope, element, attr) {

          scope.$watch('tickets', function(newVal, oldVal) {
            if (newVal !== oldVal) {
              $('#map-container').tuMap("Refresh", "Reset");
            }
          });

          plan.get(function(plan) {
            //get the tix and make the ticket list
            wembliRpc.fetch('event.getTickets', {
              eventID: plan.event.eventId
            }, function(err, result) {

              if (err) {
                console.log('error getting tix');
                console.log(err);
                //handle err
                alert('error happened - contact help@wembli.com');
                return;
              }

              scope.event = result.event;
              scope.tickets = result.tickets;

              /* get min and max tix price for this set of tix */
              var minTixPrice = 0;
              var maxTixPrice = 200;
              angular.forEach(scope.tickets, function(el) {
                if (parseInt(el.ActualPrice) < minTixPrice) {
                  minTixPrice = parseInt(el.ActualPrice);
                }
                if (parseInt(el.ActualPrice) > maxTixPrice) {
                  maxTixPrice = parseInt(el.ActualPrice);
                }

                el.selectedQty = el.ValidSplits.int[0];
                el.sessionId = generateTnSessionId();
              });

              var initSlider = function() {
                /*Set Minimum and Maximum Price from your Dataset*/
                $("#price-slider").slider("option", "min", minTixPrice);
                $("#price-slider").slider("option", "max", maxTixPrice);
                $("#price-slider").slider("option", "values", [minTixPrice, maxTixPrice]);
                $("#amount").val("$" + minTixPrice + " - $" + maxTixPrice);
              };

              var filterTickets = function() {
                var priceRange = $("#price-slider").slider("option", "values");

                $("#map-container").tuMap("SetOptions", {
                  TicketsFilter: {
                    MinPrice: priceRange[0],
                    MaxPrice: priceRange[1],
                    Quantity: $("#quantity-filter").val(),
                    eTicket: $("#e-ticket-filter").is(":checked")
                  }
                }).tuMap("Refresh");
              };

              var options = interactiveMapDefaults;
              options.MapId = scope.event.VenueConfigurationID;
              options.EventId = scope.event.ID;

              options.OnInit = function(e, MapType) {
                $(".ZoomIn").html('+');
                $(".ZoomOut").html('-');
                $(".tuMapControl").parent("div").attr('style', "position:absolute;left:5px;top:5px;font-size:12px");
                console.log('hide generic modal');
                $('#generic-loading-modal').modal("hide");
              };

              options.OnError = function(e, Error) {
                if (Error.Code === 1) {
                  /* chart not found - display the tn chart */
                  $('#map-container').css("background", 'url(' + scope.event.MapURL + ') no-repeat center center');
                  console.log('hide generic modal');
                  $('#generic-loading-modal').modal("hide");

                }
              };

              options.ToolTipFormatter = function(Data) {

              };

              options.OnMouseover = function(e, Section) {
                if (Section.Active) {} else {}
              };

              options.OnMouseout = function(e, Section) {
                if (Section.Active) {}
              };

              options.OnClick = function(e, Section) {
                if (Section.Active && Section.Selected) {}
              };

              options.OnControlClick = function(e, Data) {
                if (Section.Selected) {}
              };

              options.OnGroupClick = function(e, Group) {
                if (Group.Selected) {

                }
              };

              options.OnTicketSelected = function(e, Ticket) {}

              options.OnReset = function(e) {
                //Write Code Here
              };

              //set the height of the map-container to the window height
              $('#map-container').css("height", $($window).height() - 60);
              $('#tickets').css("height", $($window).height() - 60);
              $('#map-container').css("width", $($window).width() - 480);
              $('#map-container').tuMap(options);
              $('#map-container').tuMap("Refresh", "Reset");

              $('#price-slider').slider({
                range: true,
                min: minTixPrice,
                max: maxTixPrice,
                step: 5,
                values: [minTixPrice, maxTixPrice],
                slide: function(event, ui) {
                  $("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
                },
                stop: function(event, ui) {
                  filterTickets();
                }

              });

              var amtVal = "$" + $("#price-slider").slider("values", 0) + " - $" + $("#price-slider").slider("values", 1);
              $("#amount").val(amtVal);

              /* filter tix when the drop down changes */
              $("#quantity-filter").change(function() {
                filterTickets();
              });
            },
            /* transformRequest */

            function(data, headersGetter) {

              $rootScope.genericLoadingModal.header = 'Finding Tickets...';
              $('#page-loading-modal').modal("hide");
              console.log('show generic modal');
              $('#generic-loading-modal').modal("show");
              return data;
            },

            /* transformResponse */

            function(data, headersGetter) {
              return JSON.parse(data);
            });
          });
        }
      }
    }
  }
]);
