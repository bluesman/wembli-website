'use strict';

/* Directives */
angular.module('wembliApp.directives.venueMap', []).


directive('ticketsLoginModal', ['$rootScope', '$window', '$location', '$http', '$timeout', 'fetchModals', 'plan',
  function($rootScope, $window, $location, $http, $timeout, fetchModals, plan) {
    return {
      restrict: 'EAC',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          attr.$observe('ticket', function(val) {
            var ticket = JSON.parse(val);

            var displayTicketsLoginModal = function(e) {
              $rootScope.$broadcast('tickets-login-clicked', {
                ticket: ticket
              });
              if ($('#tickets-login-modal').length > 0) {
                $('#tickets-login-modal').modal('show');
              } else {
                $rootScope.$on('tickets-login-modal-fetched', function() {
                  $('#tickets-login-modal').modal('show');
                });
              }
            };

            if (/tickets-login-modal/.test($location.hash())) {
              /* if this button is the right one */
              var h = $location.hash();
              if (ticket.ID === h.split('-')[3]) {
                displayTicketsLoginModal();
              }
            }

            element.click(displayTicketsLoginModal);

          });
        }
      }
    };
  }
]).

directive('buyTicketsOffsite', ['$rootScope', '$window', '$location', '$http', '$timeout', 'fetchModals', 'plan',
  function($rootScope, $window, $location, $http, $timeout, fetchModals, plan) {

    return {
      restrict: 'EAC',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          attr.$observe('ticket', function(val) {
            if (typeof val === "undefined" || val === "") {
              return;
            }
            var ticket = JSON.parse(val);
            var p = plan.get();

            element.click(function(e) {
              var shipping = 15;
              var serviceCharge = (parseFloat(ticket.ActualPrice) * .15) * parseInt(ticket.selectedQty);
              var actualPrice = parseFloat(ticket.ActualPrice) * parseInt(ticket.selectedQty);
              var amountPaid = parseFloat(actualPrice) + parseFloat(serviceCharge) + parseFloat(shipping);
              amountPaid = amountPaid.toFixed(2);
              console.log(ticket);
              /* add this ticket group - it will be removed if they later say they did not buy it */
              plan.addTicketGroup({
                service: 'tn',
                eventId: p.event.eventId,
                ticketGroup: ticket,
                qty: ticket.selectedQty,
                total: amountPaid,
                payment: JSON.stringify({
                  transactionToken: ticket.sessionId,
                  amount: amountPaid,
                  qty: ticket.selectedQty
                })
              }, function(err, results) {
                console.log(results);
                $rootScope.$broadcast('tickets-offsite-clicked', {
                  qty: ticket.selectedQty,
                  amountPaid: amountPaid,
                  ticketGroup: ticket,
                  eventId: p.event.eventId,
                  eventName: p.event.eventName,
                  sessionId: ticket.sessionId,
                  ticketId: results.ticketGroup._id
                });
                var Promise = $timeout(function() {
                  $('#tickets-login-modal').modal('hide');
                  $('#tickets-offsite-modal').modal('show');
                }, 1500);
              });
            });
          });
        }
      }
    };
  }
]).


directive('addTicketsToPlan', ['$rootScope', '$window', '$location', '$http', '$timeout', 'fetchModals', 'plan', 'wembliRpc',
  function($rootScope, $window, $location, $http, $timeout, fetchModals, plan, wembliRpc) {

    return {
      restrict: 'EAC',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          element.click(function(e) {
            var ticket = JSON.parse(attr.ticket);
            ticket.selectedQty = attr.quantity;
            wembliRpc.fetch('plan.addTicketGroup', {
              ticketGroup: ticket,
            }, function(err, result) {

            });
          });
        }
      }
    };
  }
]).

directive('interactiveVenueMap', ['$rootScope', 'interactiveMapDefaults', 'wembliRpc', '$window', '$templateCache', 'plan', '$location', 'loadingModal',
  function($rootScope, interactiveMapDefaults, wembliRpc, $window, $templateCache, plan, $location, loadingModal) {
    return {
      restrict: 'E',
      replace: true,
      cache: false,
      templateUrl: "/partials/interactive-venue-map",
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function($scope, $element, $attrs, $transclude, $timeout) {

        }
      ],
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
          /* don't cache this partial - cache:false doesn't do it */
          $templateCache.remove("/partials/interactive-venue-map");
          scope.$watch('tickets', function(newVal, oldVal) {
            if (newVal !== oldVal) {
              console.log('refresh map');
              $('#venue-map-container').tuMap("Refresh", "Reset");
            }
          });
          plan.get(function(p) {
            console.log('plan before get tickets');
            console.log(p);
            //get the tix and make the ticket list
            wembliRpc.fetch('event.getTickets', {
                eventID: p.event.eventId
              }, function(err, result) {
                if (err) {
                  //handle err
                  alert('error happened - contact help@wembli.com');
                  return;
                }

                if (typeof result.tickets[0] === "undefined") {
                  loadingModal.hide();
                  $('#no-tickets').modal("show");
                  scope.noTickets = true;
                  return;
                }

                scope.event = result.event;
                scope.tickets = result.tickets;
                console.log(scope.tickets);
                /* get min and max tix price for this set of tix */
                scope.minTixPrice = 0;
                scope.maxTixPrice = 200;
                var newT = [];
                angular.forEach(scope.tickets, function(el) {
                  /* filter out parking for now and TODO: add to parking page */
                  if (/parking/gi.test(el.Section)) {
                    console.log('got parking in tickets!');
                    return;
                  }
                  if (parseInt(el.ActualPrice) < scope.minTixPrice) {
                    scope.minTixPrice = parseInt(el.ActualPrice);
                  }
                  if (parseInt(el.ActualPrice) > scope.maxTixPrice) {
                    scope.maxTixPrice = parseInt(el.ActualPrice);
                  }

                  el.selectedQty = el.ValidSplits.int[0];
                  /* how high to count in the qty filter */
                  scope.maxSplit = 1;
                  /* better idea would be to sort desc and take the 1st one */
                  angular.forEach(el.ValidSplits.int, function(split) {
                    if (split > scope.maxSplit) {
                      scope.maxSplit = split;
                    }
                    if ($location.search().qty) {
                      if ($location.search().qty == split) {
                        el.selectedQty = $location.search().qty;
                      }
                    }

                  });


                  el.ticketsInPlan = false;
                  el.sessionId = generateTnSessionId();

                  var t = plan.getTickets();
                  for (var i = 0; i < t.length; i++) {
                    if (t[i].ticketGroup.ID == el.ID) {
                      console.log('IN PLAN');
                      el.ticketsInPlan = true;
                      el._id = t[i]._id;
                    } else {
                      console.log('session: '+el.sessionId);
                    }
                  };
                  newT.push(el);
                });
                console.log("NEWT");
                console.log(newT);
                scope.tickets = newT;

                var initSlider = function() {
                  /*Set Minimum and Maximum Price from your Dataset*/
                  $(".price-slider").slider("option", "min", scope.minTixPrice);
                  $(".price-slider").slider("option", "max", scope.maxTixPrice);
                  $(".price-slider").slider("option", "values", [scope.minTixPrice, scope.maxTixPrice]);
                  $(".amount").val("$" + scope.minTixPrice + " - $" + scope.maxTixPrice);
                };

                var filterTickets = function(args) {
                  var priceRange = $(".price-slider").slider("option", "values");

                  console.log('priceRange');
                  console.log(priceRange);
                  console.log('qty');
                  console.log(args);
                  $("#venue-map-container").tuMap("SetOptions", {
                    TicketsFilter: {
                      MinPrice: priceRange[0],
                      MaxPrice: priceRange[1],
                      Quantity: args.quantity,
                      eTicket: $("#e-ticket-filter").is(":checked")
                    }
                  }).tuMap("Refresh");

                  /* this is supposed to update selected Qty when the filter changes but its not working */
                  /*
                angular.forEach(scope.tickets, function(el) {
                  console.log(el);
                  el.selectedQty = el.ValidSplits.int[0];
                  angular.forEach(el.ValidSplits.int, function(split) {
                    if (args.quantity) {
                      if (args.quantity == split) {
                        console.log('match!')
                        el.selectedQty = args.quantity;
                        console.log('el selected qty');
                        console.log(el.selectedQty);
                      }
                    }
                  });
                });
                */
                };

                var options = interactiveMapDefaults;
                options.MapId = scope.event.VenueConfigurationID;
                options.EventId = scope.event.ID;

                options.OnInit = function(e, MapType) {
                  $(".ZoomIn").html('+');
                  $(".ZoomOut").html('-');
                  $(".tuMapControl").parent("div").attr('style', "display:none;position:absolute;left:5px;top:120px;font-size:12px");
                  loadingModal.hide()
                };

                options.OnError = function(e, Error) {
                  if (Error.Code === 1) {
                    if (typeof scope.event.MapUrl === "undefined") {
                      scope.event.MapUrl = "/images/no-seating-chart.jpg";
                    }
                    /* chart not found - display the tn chart */
                    $('#venue-map-container').css("background", 'url(' + scope.event.MapUrl + ') no-repeat center center');
                    loadingModal.hide()
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

                //set the height of the map-container to the window height 174 is the header + the footer
                $('#venue-map-container').css("height", $($window).height() - 174);
                $('#tickets').css("height", $($window).height() - 174);
                $('#venue-map-container').css("width", $($window).width() - 480);
                $('#venue-map-container').tuMap(options);

                if ($('.price-slider').length) {
                  console.log('price slider exuists');
                  $('.price-slider').slider({
                    range: true,
                    min: scope.minTixPrice,
                    max: scope.maxTixPrice,
                    step: 5,
                    values: [scope.minTixPrice, scope.maxTixPrice],
                    slide: function(event, ui) {
                      $(".amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
                    },
                    stop: function(event, ui) {
                      var q = $(this).val();
                      filterTickets({
                        quantity: q
                      });
                    }

                  });

                  var amtVal = "$" + $(".price-slider").slider("values", 0) + " - $" + $(".price-slider").slider("values", 1);
                  $(".amount").val(amtVal);
                }

                if ($(".quantity-filter").length) {
                  console.log('qty filter exists');
                  /* filter tix when the drop down changes */
                  $(".quantity-filter").change(function() {
                    var q = $(this).val();
                    filterTickets({
                      quantity: q
                    });
                  });

                  /* default value for quantity-filter? */
                  var s = $location.search();
                  if (s.qty) {
                    console.log('qty exists');
                    $(".quantity-filter").val(s.qty);
                    filterTickets({
                      quantity: s.qty
                    });
                  }
                }

              },
              /* transformRequest */
              function(data, headersGetter) {
                $rootScope.genericLoadingModal.header = 'Finding Tickets...';
                loadingModal.show('Finding Tickets...', 'We\'re scouring the internet for ' + p.event.eventName + ' tickets!');
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
