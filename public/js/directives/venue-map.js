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
              var backToPlan = (typeof attr.backToPlan === "undefined") ? false : (attr.backToPlan === "true");
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
                $rootScope.$broadcast('tickets-offsite-clicked', {
                  qty: ticket.selectedQty,
                  amountPaid: amountPaid,
                  ticketGroup: ticket,
                  eventId: p.event.eventId,
                  eventName: p.event.eventName,
                  sessionId: ticket.sessionId,
                  ticketId: results.ticketGroup._id,
                  backToPlan: backToPlan
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

directive('ticketsPopover', ['plan', 'wembliRpc', '$compile',
  function(plan, wembliRpc, $compile) {
    return {
      scope: false,
      restrict: 'EAC',
      compile: function(element, attr, transclude) {
        var html = $('#static-popover-content').html();

        return function(scope, element, attr) {
          console.log(scope.tickets);

          var originalLeave = $.fn.popover.Constructor.prototype.leave;
          $.fn.popover.Constructor.prototype.leave = function(obj) {
            var self, container, timeout;
            if (obj instanceof this.constructor) {
              self = obj;
            } else {
              self = $(obj.currentTarget)[this.type](this._options).data(this.type);
            }
            originalLeave.call(this, obj);

            if (obj.currentTarget) {
              container = $(obj.currentTarget).siblings('.popover')
              timeout = self.timeout;
              container.one('mouseenter', function() {
                //We entered the actual popover – call off the dogs
                clearTimeout(timeout);
                //Let's monitor popover content instead
                container.one('mouseleave', function() {
                  $.fn.popover.Constructor.prototype.leave.call(self, obj);
                });
              })
            }
          };

          scope.$on('load-static-map', function() {

            var content = $compile(html)(scope);

            $('#static-map-image').popover({
              placement: 'left',
              trigger: 'hover',
              container: '#venue-map-container',
              delay: {
                show: 100,
                hide: 400
              },
              animation: false,
              content: function() {
                return content;
              },
              html: true
            });



          });
        }
      }
    };
  }
]).

directive('interactiveVenueMap', ['$timeout', '$rootScope', '$compile', 'interactiveMapDefaults', 'wembliRpc', '$window', '$templateCache', 'plan', '$location', 'loadingModal',
  function($timeout, $rootScope, $compile, interactiveMapDefaults, wembliRpc, $window, $templateCache, plan, $location, loadingModal) {
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
          scope.predicate = 'ActualPrice';
          scope.reverse = false;
          scope.showTicketsPopover = false;

          scope.$watch('tickets', function(newVal, oldVal) {
            if (newVal !== oldVal) {
              $('#venue-map-container').tuMap("Refresh", "Reset");
            }
          });

          scope.handlePriceRange = function() {
            /* post the updated preferences to the server */
            wembliRpc.fetch('plan.setTicketsPriceRange', {
                "low": scope.priceRange.low,
                "med": scope.priceRange.med,
                "high": scope.priceRange.high,
              },

              function(err, res) {

              });


            /* hide the tix they don't want to see */
            angular.forEach(scope.tickets, function(t) {
              /* if the price is <= 100 and priceRange.low filter is not checked then hide it*/
              t.hide = false;
              if ((parseInt(t.ActualPrice) <= 100)) {
                return t.hide = !scope.priceRange.low;
              }
              /* if the price is <= 300 and > 100 and priceRange.med filter is not checked then hide it*/
              if ((parseInt(t.ActualPrice) > 100) && (parseInt(t.ActualPrice) <= 300)) {
                return t.hide = !scope.priceRange.med;
              }
              /* if the price is > 300 and priceRange.high filter is not checked then hide it*/
              if (parseInt(t.ActualPrice) > 300) {
                return t.hide = !scope.priceRange.high;
              }
            });
          };

          scope.sortByPrice = function() {
            if (typeof scope.ticketSort === "undefined") {
              scope.ticketSort = 1;
            }
            scope.tickets.sort(function(a, b) {
              if (scope.ticketSort) {
                return a.ActualPrice - b.ActualPrice;
              } else {
                return b.ActualPrice - a.ActualPrice;
              }
            });
            scope.ticketSort = (scope.ticketSort) ? 0 : 1;
          }

          scope.sortBySection = function() {
            if (typeof scope.sectionSort === "undefined") {
              scope.sectionSort = 1;
            }

            scope.tickets.sort(function(a, b) {
              if (scope.sectionSort) {
                return a.Section.localeCompare(b.Section);
              } else {
                return b.Section.localeCompare(a.Section);
              }
            });

            scope.sectionSort = (scope.sectionSort) ? 0 : 1;
          }

          scope.sortByQty = function() {
            if (typeof scope.qtySort === "undefined") {
              scope.qtySort = 1;
            }

            scope.tickets.sort(function(a, b) {
              var cmpA = '';
              var cmpB = '';

              if (typeof a.ValidSplits.int === 'string') {
                cmpA = a.ValidSplits.int;
              } else {

                a.ValidSplits.int.sort();
                cmpA = a.ValidSplits.int[a.ValidSplits.int.length - 1];
              }


              if (typeof b.ValidSplits.int === 'string') {
                cmpB = b.ValidSplits.int;
              } else {

                b.ValidSplits.int.sort();
                cmpB = b.ValidSplits.int[b.ValidSplits.int.length - 1];
              }

              if (scope.qtySort) {
                return parseInt(cmpA) - parseInt(cmpB);
              } else {
                return parseInt(cmpB) - parseInt(cmpA);
              }
            });

            scope.qtySort = (scope.qtySort) ? 0 : 1;
          }

          scope.$watch('showTicketsPopover', function(newVal) {
            if (typeof newVal !== "undefined") {
              if (newVal) {
                angular.element('#static-popover-content').show();
              } else {
                angular.element('#static-popover-content').hide();
              }
            }
          });

          function initStaticMap() {
            if (!scope.event.MapURL) {
              scope.event.MapURL = "/images/no-seating-chart.jpg";
            }
            /* TODO: check if this is split first */
            console.log('payment:');
            console.log(scope.plan.preferences.payment);
            console.log(scope.plan.preferences.tickets.payment);

            var img = new Image();
            img.src = scope.event.MapURL;
            img.onload = function() {

              var w = img.width;
              var h = img.height;
              $('#venue-map-container').css("width", $($window).width() - 680);
              $('#venue-map-container').css("position","relative");
              $('#venue-map-container').empty().css('overflow-y', 'auto').css('float','right').prepend('<div id="static-map-image" style="overflow-y:auto;background:transparent url(\''+scope.event.MapURL+'\') no-repeat center center;margin:auto;padding:20px;height:'+h+'px;width:'+w+'px;" />');
              var h2 = $('#venue-map-container').height() - 220;
              $('.ticket-list-container').height(h2);
              $('#static-map-image').mouseenter(function() {
                console.log('enter mouse');
                scope.$apply(function(){
                  scope.showTicketsPopover = true;
                });
              });
              $('#static-map-image').mouseleave(function() {
                console.log('enter mouse');
                scope.$apply(function(){
                  scope.showTicketsPopover = false;
                });
              });


              var originalPlacement = $.fn.popover.Constructor.prototype.applyPlacement;
              $.fn.popover.Constructor.prototype.applyPlacement = function(offset, placement) {
                offset.top = 200;
                var $tip = this.tip(),
                  width = $tip[0].offsetWidth,
                  height = $tip[0].offsetHeight,
                  actualWidth, actualHeight, delta, replace

                  $tip
                    .offset(offset)
                    .addClass(placement)
                    .addClass('in')

                  actualWidth = $tip[0].offsetWidth
                  actualHeight = $tip[0].offsetHeight

                if (placement == 'top' && actualHeight != height) {
                  offset.top = offset.top + height - actualHeight
                  replace = true
                }

                if (placement == 'bottom' || placement == 'top') {
                  delta = 0

                  if (offset.left < 0) {
                    delta = offset.left * -2
                    offset.left = 0
                    $tip.offset(offset)
                    actualWidth = $tip[0].offsetWidth
                    actualHeight = $tip[0].offsetHeight
                  }

                  this.replaceArrow(delta - width + actualWidth, actualWidth, 'left')
                } else {
                  this.replaceArrow(actualHeight - height, actualHeight, 'top')
                }

                if (replace) $tip.offset(offset)
                $('.ticket-list-container').height(h);
              };


            };

          };



          plan.get(function(p) {
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
                  //$('#no-tickets').modal("show");
                  scope.noTickets = true;
                  scope.notFound = true;
                  //return;
                }

                scope.event = result.event;
                scope.tickets = result.tickets;
                /* get min and max tix price for this set of tix */
                scope.minTixPrice = 0;
                scope.maxTixPrice = 200;
                var newT = [];
                /* loop through tickets */
                angular.forEach(scope.tickets, function(el) {
                  /* filter out parking for now and TODO: add to parking page */
                  if (/parking/gi.test(el.Section)) {
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
                  el.maxSplit = 1;
                  /* better idea would be to sort desc and take the 1st one */
                  angular.forEach(el.ValidSplits.int, function(split) {
                    if (split > scope.maxSplit) {
                      scope.maxSplit = split;
                    }

                    if (split > el.maxSplit) {
                      el.maxSplit = split;
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
                      el.ticketsInPlan = true;
                      el._id = t[i]._id;
                    } else {}
                  };
                  newT.push(el);
                });
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
                  el.selectedQty = el.ValidSplits.int[0];
                  angular.forEach(el.ValidSplits.int, function(split) {
                    if (args.quantity) {
                      if (args.quantity == split) {
                        el.selectedQty = args.quantity;
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
                  $(".tuMapControl").parent("div").attr('style', "display:none;position:absolute;left:5px;top:120px;font-size:12px");
                  if (MapType == 'Interactive') {
                    /* check if the ticket utils url is general admission */
                    if (/ga_venue_tn/.test(scope.event.MapUrl)) {
                      initStaticMap();
                    } else {
                      $(".ZoomIn").html('+');
                      $(".ZoomOut").html('-');
                    }
                  } else {
                    initStaticMap();
                  }
                  loadingModal.hide()
                };

                options.OnError = function(e, Error) {
                  if (Error.Code === 1) {
                    if (typeof scope.event.MapURL === "undefined") {
                      scope.event.MapURL = "/images/no-seating-chart.jpg";
                    }
                    initStaticMap();
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
                $('#venue-map-container').css("height", $($window).height() - 172);
                $('#tickets').css("height", $($window).height() - 172);
                //width of the venue map container
                $('#venue-map-container').css("width", $($window).width() - 480);
                $('#venue-map-container').tuMap(options);

                if ($('.price-slider').length) {
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
