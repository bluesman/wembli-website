/* Controllers */
angular.module('wembliApp.controllers.tickets', []).

controller('TicketsCtrl', ['$scope', 'wembliRpc', 'plan', 'customer', 'ticketPurchaseUrls', 'tnConfig', 'tuMap', '$location', '$window', '$timeout', '$rootScope', 'overlay', 'googleAnalytics', 'header',
	function($scope, wembliRpc, plan, customer, ticketPurchaseUrls, tnConfig, tuMap, $location, $window, $timeout, $rootScope, overlay, googleAnalytics, header) {
    /* tell the header not to disappear on scroll */
    header.fixed();

    /*
     * scope variables for the template
     *
    */

    /* where to send them if they click buy */
    $scope.tnUrl = ticketPurchaseUrls.tn;

    /* list of all possible ticket split combinations for the qty filter */
    $scope.distinctSplits = [1];

    /* display toggle for whether tickets are found */
    $scope.notFound = false;

    /* min and max ticket price for slider */
    $scope.minTixPrice = 0;
    $scope.maxTixPrice = 200;

    /* if there are tickets already in the plan display extra navigation on the page */
    $scope.ticketsChosen = false;

    /*
     * scope functions
     *
     */
    /* replaced by price slider filter
        TODO: set price range when slider updates
    */
    $scope.handlePriceRange = function() {
      /* post the updated preferences to the server */
      wembliRpc.fetch('plan.setTicketsPriceRange', {
          "low": $scope.priceRange.low,
          "med": $scope.priceRange.med,
          "high": $scope.priceRange.high,
        }, function(err, res) {

      });


      /* hide the tix they don't want to see */
      angular.forEach($scope.tickets, function(t) {
        /* if the price is <= 100 and priceRange.low filter is not checked then hide it*/
        t.hide = false;
        if ((parseInt(t.ActualPrice) <= 100)) {
          return t.hide = !$scope.priceRange.low;
        }
        /* if the price is <= 300 and > 100 and priceRange.med filter is not checked then hide it*/
        if ((parseInt(t.ActualPrice) > 100) && (parseInt(t.ActualPrice) <= 300)) {
          return t.hide = !$scope.priceRange.med;
        }
        /* if the price is > 300 and priceRange.high filter is not checked then hide it*/
        if (parseInt(t.ActualPrice) > 300) {
          return t.hide = !$scope.priceRange.high;
        }
      });
    };

    $scope.sortByPrice = function() {
      if (typeof $scope.ticketSort === "undefined") {
        $scope.ticketSort = 1;
      }
      $scope.tickets.sort(function(a, b) {
        if ($scope.ticketSort) {
          return a.ActualPrice - b.ActualPrice;
        } else {
          return b.ActualPrice - a.ActualPrice;
        }
      });
      $scope.ticketSort = ($scope.ticketSort) ? 0 : 1;
    }

    $scope.sortBySection = function() {
      if (typeof $scope.sectionSort === "undefined") {
        $scope.sectionSort = 1;
      }

      $scope.tickets.sort(function(a, b) {
        if ($scope.sectionSort) {
          return a.Section.localeCompare(b.Section);
        } else {
          return b.Section.localeCompare(a.Section);
        }
      });

      $scope.sectionSort = ($scope.sectionSort) ? 0 : 1;
    }

    $scope.sortByQty = function() {
      if (typeof $scope.qtySort === "undefined") {
        $scope.qtySort = 1;
      }

      $scope.tickets.sort(function(a, b) {
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

        if ($scope.qtySort) {
          return parseInt(cmpA) - parseInt(cmpB);
        } else {
          return parseInt(cmpB) - parseInt(cmpA);
        }
      });

      $scope.qtySort = ($scope.qtySort) ? 0 : 1;
    }

    /*
     * watch functions
     *
     */
    $scope.$watch('tickets', function(newVal, oldVal) {
      if (newVal !== oldVal) {
        $('#venue-map-container').tuMap("Refresh", "ProcessTickets");
      }
    });

    /* watch selectedQty and initialize amountPaid */
    $scope.$watch('currentTicket.selectedQty', function(newVal, oldVal) {
      console.log('currentTicket selectedqty changed');
      console.log(newVal);
      if (newVal) {
        $scope.currentTicket = $scope.tickets[$scope.currentTicketIdx];
        if ($scope.currentTicket) {
          $scope.currentTicket.selectedQty = parseInt(newVal);
          var shipping                     = 15;
          var serviceCharge                = (parseFloat($scope.currentTicket.ActualPrice) * .15) * parseInt($scope.currentTicket.selectedQty);
          var actualPrice                  = parseFloat($scope.currentTicket.ActualPrice) * parseInt($scope.currentTicket.selectedQty);
          var amountPaid                   = parseFloat(actualPrice) + parseFloat(serviceCharge) + parseFloat(shipping);
          $scope.currentTicket.amountPaid  = amountPaid.toFixed(2);
        }
      }
    });

    $scope.$watch('confirmPriceQty', function(newVal, oldVal) {
      $('#bought-tickets-button').prop('disabled',!newVal);
    });

		plan.get(function(p) {
      $scope.backToPlan = false;
      /* if organizer rsvp not null then go back to plan */
      if (p.organizer.rsvp.decision !== null) {
        $scope.backToPlan = true;
      }

      $scope.nextLink = $scope.backToPlan ? "/plan/cart" : "/event-options/" + p.event.eventId + '/' + p.event.eventName;
      $scope.nextText = $scope.backToPlan ? "Ok, Back To Plan Dashboard" : "Continue To Plan Preferences";
      if ($scope.nextLink === '/plan/cart' && plan.getContext() !== "organizer") {
        $scope.nextLink = '/plan/vote';
      }
      /* click handler for buy tix button
       * - adds tix to plan
       * - display a popup asking if they really did buy the tix
      */
      $scope.buyTicket = function(idx) {
        $scope.currentTicketIdx = idx;
        var ticket              = $scope.tickets[idx];
        $scope.currentTicket    = ticket;
        $scope.currentTicket.selectedQty = ticket.selectedQty || ticket.maxSplit;
        $scope.currentTicket.selectedQty = $scope.currentTicket.selectedQty.toString();
        console.log($scope.currentTicket);

        var sections = $('#venue-map-container').tuMap("GetSections");
        for (var i = sections.length - 1; i >= 0; i--) {
          if (sections[i].Name === ticket.Section) {
            $scope.activeSection = sections[i];
            ticket.url = $scope.activeSection.SectionViewUrl;
            break;
          }
        };

        /* angularjs hack */
        delete ticket["$$hashKey"];

        /* add this ticket group - it will be removed if they later say they did not buy it */
        var ticketGroup = {
          service: 'tn',
          eventId: p.event.eventId,
          ticketGroup: ticket,
        };

        console.log('add ticketgroup');
        console.log(ticketGroup);
        plan.addTicketGroup(ticketGroup, function(err, results) {
          console.log(results);
          ticket.ticketsInPlan = true;
          if (results.ticketGroup._id) {
            ticket._id = results.ticketGroup._id;
          }

          /* find this ticket in the tickets list and update it so the button changes */
          $scope.tickets[idx] = ticket;

          /* if payment type is split-first just go straight to the options page */
          if ($scope.plan.preferences.payment === 'split-first') {

            $scope.ticketsConfirm = true;
            overlay.show();
          } else {
            /* wait then show the slidedown */
            var Promise = $timeout(function() {
              $rootScope.$apply(function() {
                console.log('showbuytixoffsite');
                $scope.buyTicketsOffsite = true;
                overlay.show();
              });
            }, 1500);
          }
        });
      }

      $scope.removeTicketGroup = function(idx) {
        var index = (typeof idx !== "undefined") ? idx : $scope.currentTicketIdx;

        if (typeof index == "undefined") {
          $scope.buyTicketsOffsite = false;
          $scope.ticketsConfirm = false;
          overlay.hide();
          return;
        }

        /* if there's _id then there's a db record to modify, else its just stored in the session and no db id */
        var id = $scope.tickets[index]._id ? $scope.tickets[index]._id : $scope.tickets[index].ID;
        console.log('removing ticket id: '+id);

        /* remove the ticketgroup and close the modal */
        plan.removeTicketGroup({ticketId: id}, function(err, results) {
          /* cause the button to change */
          $scope.tickets[index].ticketsInPlan = false;

          /* no longer interested in this ticket */
          if ($scope.currentTicketIdx) {
            delete $scope.currentTicketIdx;
          }
          if ($scope.currentTicket) {
            delete $scope.currentTicket;
          }

          /* hide the slide down popover */
          if ($scope.buyTicketsOffsite) {
            $scope.buyTicketsOffsite = false;
            overlay.hide();
          }
          if ($scope.ticketsConfirm) {
            $scope.ticketsConfirm = false;
            overlay.hide();
          }
        });
      }

      $scope.boughtTickets = function() {
        console.log('set receipt for tix with idx: '+$scope.currentTicketIdx);

        if (typeof $scope.currentTicketIdx == "undefined") {
          console.log('no currenttixid');
          $window.location.href = $scope.nextLink;
          return;
        }

        var ticket = $scope.tickets[$scope.currentTicketIdx];
        console.log(ticket);
        var id = ticket._id ? ticket._id : ticket.ID;
        /* update the tickets to have a receipt */
        plan.addTicketGroupReceipt({
          ticketId: id,
          service: 'tn',
          receipt: {
            transactionToken: ticket.sessionId,
            amountPaid: $scope.currentTicket.amountPaid,
            qty: $scope.currentTicket.selectedQty
          }
        }, function(err, result) {
          console.log('receipt added');
          console.log(err, result);
          /* for testing, fire the ticketnetwork pixel which will set the payment.receipt value */
          //$http.get('http://tom.wembli.com/callback/tn/checkout?request_id=' + $scope.sessionId + '&event_id=' + $scope.eventId);

          googleAnalytics.trackEvent('Plan', 'boughtTickets', $scope.plan.event.eventName, '', function(err, result) {
            /* go to the next page which depends on whether they are splitting with friends or paying themself */
            console.log('going to next page: '+ $scope.nextLink);
            $window.location.href = $scope.nextLink;
          });
        });
      }

      $rootScope.$on('overlay-clicked', function() {
        $scope.removeTicketGroup();
        console.log('overlay clicked');
      });

			console.log($scope.plan);
			$scope.organizer = plan.getOrganizer();

			/* todo find out if this person is a friend invited to the plan */
			$scope.context = plan.getContext() || 'visitor';

      /* get the tix and make the ticket list */
      wembliRpc.fetch('event.getTickets', {eventID: p.event.eventId}, function(err, result) {

          if (err) {
            alert('error happened - contact help@wembli.com');
            return;
          }

          if (typeof result.tickets[0] === "undefined") {
            //$scope.noTickets = true;
            $scope.notFound = true;
          }

          var filteredTicketsList = [];

          /* loop through all tickets */
          angular.forEach(result.tickets, function(el) {
            /* filter out parking for now and TODO: add to parking page */
            if (/parking/gi.test(el.Section)) {
              return;
            }
            /* console.log(el); */

            /* session id for the ticketNetwork purchase link */
            el.sessionId = tnConfig.generateSessionId();



            /* determine the lower bound for the tickets price */
            if (parseInt(el.ActualPrice) < $scope.minTixPrice) {
              $scope.minTixPrice = parseInt(el.ActualPrice);
            }
            /* determine the upper bound for the tix price */
            if (parseInt(el.ActualPrice) > $scope.maxTixPrice) {
              $scope.maxTixPrice = parseInt(el.ActualPrice);
            }



            /* initialize selectedQty */
            el.selectedQty = el.ValidSplits.int[0];

            /* configure the qty dropdown for the tickets list */
            el.maxSplit = 1;

            /* if there's only 1 then its not an array - thanks tn */
            if (typeof el.ValidSplits.int === 'string') {
              el.ValidSplits.int = [el.ValidSplits.int]
            }

            /* sort the splits ascending */
            el.ValidSplits.int.sort(function(a, b){return a-b});
            el.maxSplit = el.ValidSplits.int[el.ValidSplits.int.length-1];
            /* update the global max split if necessary */
            if (el.maxSplit > $scope.maxSplit) {
              $scope.maxSplit = el.maxSplit;
            }
            /* if the passed in qty as one of the valid splits, set it to the selectedQty of the dropdown */
            if ($location.search().qty && (el.ValidSplits.int.indexOf($location.search().qty))) {
              el.selectedQty = $location.search().qty;
            }

            /* check for tickets already chosen */
            el.ticketsInPlan = false;
            angular.forEach(plan.getTickets(), function(ticketInPlan) {
              if (ticketInPlan.ticketGroup.ID === el.ID) {
                el.ticketsInPlan = true;
                $scope.ticketsChosen = true;
                if (typeof ticketInPlan._id !== "undefined") {
                  el._id = ticketInPlan._id;
                }
                if (typeof ticketInPlan.purchased !== "undefined") {
                  el.purchased = ticketInPlan.purchased;
                }
              }
            });
            filteredTicketsList.push(el);
          });

          $scope.tickets = filteredTicketsList;
          /* default to sort by price asc */
          $scope.sortByPrice();

          var initSlider = function() {
            /*Set Minimum and Maximum Price from your Dataset*/
            $(".price-slider").slider("option", "min", $scope.minTixPrice);
            $(".price-slider").slider("option", "max", $scope.maxTixPrice);
            $(".price-slider").slider("option", "values", [$scope.minTixPrice, $scope.maxTixPrice]);
            $(".amount").val("$" + $scope.minTixPrice + " - $" + $scope.maxTixPrice);
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
          };

					/* init the tuMap */
					var options = {};
		      options.MapId = $scope.plan.event.data.VenueConfigurationID;
		      options.SingleSectionSelection = true;
          options.ServiceUrl = "//imap.ticketutils.net";
			    options.OnInit = function(e, data) {
            $('#venue-map-loading').hide();
            overlay.hide();
            console.log(data);
            tuMap.mapType = data.MapType;

            /* display the static map if ticket utils map is not interactive */
			      if (tuMap.mapType === 'Interactive') {
			        /* check if the ticket utils url is general admission */
			        if (/ga_venue_tn/.test($scope.plan.event.data.MapUrl)) {
			          tuMap.displayStaticMap($scope.plan.event.data.MapUrl);
			        } else {
                /* move the controls to the column to the left */
                $(".ZoomControls").appendTo("#venue-map-row");
                $(".ZoomControls + div").appendTo("#venue-map-row");
			        }
			      } else {
			        tuMap.displayStaticMap($scope.plan.event.data.MapUrl);
			      }
			    };

			    options.OnError = function(e, Error) {
			    	console.log('error with map');
			      console.log(Error);
			      if (Error.Code === 1) {
			        if (typeof $scope.plan.event.data.MapURL === "undefined") {
			          $scope.plan.event.data.MapURL = "/images/no-seating-chart.jpg";
			        }
			        tuMap.displayStaticMap();
			      }
			    };

          /* make this tickets list fill up the whole height of the page
             TODO: make this reevaluate when the window size changes
          */
          $('#tickets-list > div').css("height", $($window).height() - 188);
					tuMap.init('#venue-map-container', options);

          /* init the price slider in the tickets list header */
          if ($('.price-slider').length) {
            $('.price-slider').slider({
              range: true,
              min: $scope.minTixPrice,
              max: $scope.maxTixPrice,
              step: 5,
              values: [$scope.minTixPrice, $scope.maxTixPrice],
              slide: function(event, ui) {
                $(".amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
              },
              stop: function(event, ui) {
                var q = $(this).val();
                console.log('quantity in price slider stop: '+q);
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
				});
		});
	}
]);
