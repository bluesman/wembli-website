/* Controllers */
angular.module('wembliApp.controllers.tickets', []).

controller('TicketsCtrl', ['$scope', 'wembliRpc', 'plan', 'customer', 'ticketPurchaseUrls', 'tuMap', '$location', '$window', '$timeout',
	function($scope, wembliRpc, plan, customer, ticketPurchaseUrls, tuMap, $location, $window, $timeout) {
		$scope.tnUrl = ticketPurchaseUrls.tn;
		console.log('running tix ctrl');


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

    $scope.predicate = 'ActualPrice';
    $scope.reverse = false;
    $scope.showTicketsPopover = false;

    $scope.$watch('tickets', function(newVal, oldVal) {
      if (newVal !== oldVal) {
        //console.log('refresh reset map');
        //$('#venue-map-container').tuMap("Refresh", "ProcessTickets");
      }
    });

    $scope.handlePriceRange = function() {
      /* post the updated preferences to the server */
      wembliRpc.fetch('plan.setTicketsPriceRange', {
          "low": $scope.priceRange.low,
          "med": $scope.priceRange.med,
          "high": $scope.priceRange.high,
        },

        function(err, res) {

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
        if (scope.ticketSort) {
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

    $scope.$watch('showTicketsPopover', function(newVal) {
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
        $scope.event.MapURL = "/images/no-seating-chart.jpg";
      }
      /* TODO: check if this is split first */

      var img = new Image();
      img.src = $scope.event.MapURL;
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
          $scope.$apply(function(){
            $scope.showTicketsPopover = true;
          });
        });
        $('#static-map-image').mouseleave(function() {
          console.log('enter mouse');
          $scope.$apply(function(){
            $scope.showTicketsPopover = false;
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
			console.log($scope.plan);
			$scope.organizer = plan.getOrganizer();

			/* todo find out if this person is a friend invited to the plan */
			$scope.context = plan.getContext() || 'visitor';

			$scope.backToPlan = true;
			if (plan.getFriends().length == 0) {
				$scope.backToPlan = false;
			}
			if ($scope.context === 'friend') {
				$scope.backToPlan = true;
			}


      //get the tix and make the ticket list
      wembliRpc.fetch('event.getTickets', {
          eventID: p.event.eventId
        }, function(err, result) {
          console.log('fetched tix');
          if (err) {
            //handle err
            alert('error happened - contact help@wembli.com');
            return;
          }

          if (typeof result.tickets[0] === "undefined") {
            //$('#no-tickets').modal("show");
            $scope.noTickets = true;
            $scope.notFound = true;
            //return;
          }

          $scope.event = result.event;
          $scope.tickets = result.tickets;
          /* get min and max tix price for this set of tix */
          $scope.minTixPrice = 0;
          $scope.maxTixPrice = 200;
          var newT = [];
          /* loop through tickets */
          angular.forEach($scope.tickets, function(el) {
            /* filter out parking for now and TODO: add to parking page */
            if (/parking/gi.test(el.Section)) {
              return;
            }
            if (parseInt(el.ActualPrice) < $scope.minTixPrice) {
              $scope.minTixPrice = parseInt(el.ActualPrice);
            }
            if (parseInt(el.ActualPrice) > $scope.maxTixPrice) {
              $scope.maxTixPrice = parseInt(el.ActualPrice);
            }

            el.selectedQty = el.ValidSplits.int[0];
            /* how high to count in the qty filter */
            $scope.maxSplit = 1;
            el.maxSplit = 1;
            /* better idea would be to sort desc and take the 1st one */
            angular.forEach(el.ValidSplits.int, function(split) {
              if (split > $scope.maxSplit) {
                $scope.maxSplit = split;
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
          $scope.tickets = newT;

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

					/* init the tuMap */
					var options = {};
		      options.MapId = $scope.plan.event.data.VenueConfigurationID;
		      options.ControlsPosition = "Inside";
		      options.SingleSectionSelection = true;

		      /* don't need this if I have a mapId
		      options.EventInfo = {
		      	'Venue': $scope.plan.venue.data.Name,
		      	'EventName': $scope.plan.event.eventName,
		      	'EventDate': $scope.plan.event.eventDate
		      };
					*/

			    options.OnInit = function(e, data) {
			    	console.log('maptype: ');
			      console.log(data.MapType);
			      //$(".tuMapControl").parent("div").attr('style', "display:none;position:absolute;left:5px;top:120px;font-size:12px");
			      if (data.MapType === 'Interactive') {
			        /* check if the ticket utils url is general admission */
			        if (/ga_venue_tn/.test($scope.plan.event.data.MapUrl)) {
			          //initStaticMap();
			        } else {
			          $(".ZoomIn").html('+');
			          $(".ZoomOut").html('-');
			        }
			      } else {
			        //initStaticMap();
			      }

			      /* make the map fit better in the screen */
			      var zl = $('#venue-map-container').tuMap("ConvertZoom");
			      /* hack: if zoom level > 3 knock it down by 50% */
			      if (zl > 3) {
			      	zl = parseInt(zl/2);
			      }
		      	$('#venue-map-container').tuMap("SetOptions", {"ZoomLevel":zl});
			    };

			    options.OnError = function(e, Error) {
			    	console.log('error with map');
			      console.log(Error);
			      if (Error.Code === 1) {
			        if (typeof $scope.plan.event.data.MapURL === "undefined") {
			          $scope.plan.event.data.MapURL = "/images/no-seating-chart.jpg";
			        }
			        //initStaticMap();
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

          //set the height of the containers to the window height 60 is the header - only if not mobile
          if ($($window).width() > 992) {
	          $('.addons-content-container').css("height", $($window).height() - 60);
	          $('.addons-list-container').css("height", $($window).height() - 60);
	        }
					tuMap.init('#venue-map-container', options);
				});
		});
	}
]).

controller('TicketsLoginCtrl', ['$rootScope', '$scope', '$location', 'plan', 'customer', 'wembliRpc', 'ticketPurchaseUrls', 'pixel', 'googleAnalytics',
	function($rootScope, $scope, $location, plan, customer, wembliRpc, ticketPurchaseUrls, pixel, googleAnalytics) {
		$scope.tnUrl = ticketPurchaseUrls.tn;
		$scope.listId = 'a55323395c';

		plan.get(function(p) {
			$scope.$on('tickets-login-clicked', function(e, args) {
				$scope.redirectUrl = '/tickets/' + $scope.plan.event.eventId + '/' + $scope.plan.event.eventName + '/login/' + args.ticket.ID;
				$scope.ticket = args.ticket;
			});
		});

		$scope.authActions = {
			signup: function() {
				wembliRpc.fetch('customer.signup', {
						firstName: $scope.firstName,
						lastName: $scope.lastName,
						email: $scope.email,
						listId: $scope.listId
					}, function(err, result) {
						if (result.customer) {
							/* hide this modal and display the tickets offsite modal */
							//$scope.customer = result.customer;
							customer.set(result.customer);
						}

						if (result.loggedIn) {
							$rootScope.loggedIn = result.loggedIn;
						}

						if (result.exists) {
							$scope.formError = false;
							$scope.signupError = true;
							$scope.accountExists = result.exists;
							return;
						}
						if (result.formError) {
							$scope.signupError = true;
							$scope.formError = true;
							$scope.accountExists = false;
							return;
						}
						$scope.signupError = false;
						$scope.formError = false;
						$scope.accountExists = false;

						/* fire the signup pixels */
						var gCookie = googleAnalytics.getCookie();

						pixel.fire({
							type: 'signup',
							campaign: gCookie.__utmz.utmccn,
							source: 'google',
							medium: gCookie.__utmz.utmcmd,
							term: gCookie.__utmz.utmctr,
							content: '1070734106',
						});

						/* fire the facebook signup pixels */
			      pixel.fire({
			        type: 'signup',
			        campaign: 'Signup Conversion Pixel Facebook Ad',
			        source: 'facebook',
			        medium: 'cpc',
			        term: '',
			        content: '6013588786171',
			      });

					},
					/* transformRequest */

					function(data, headersGetter) {
						$scope.continueSpinner = true;
						return data;
					},

					/* transformResponse */

					function(data, headersGetter) {
						$scope.continueSpinner = false;
						return JSON.parse(data);
					});
			},
			login: function() {
				wembliRpc.fetch('customer.login', {
					email: $scope.email,
					password: $scope.password
				}, function(err, result) {
					if (result.error) {
						$scope.loginError = result.error;

						if (typeof result.noPassword !== "undefined") {
							$scope.noPassword = result.noPassword;
						} else if (result.invalidCredentials) {
							$scope.invalidCredentials = result.invalidCredentials;
						}
					}
					if (result.customer) {
						/* hide this modal and display the tickets offsite modal */
						customer.set(result.customer);
					}

					if (result.loggedIn) {
						$rootScope.loggedIn = result.loggedIn;
					}

				})
			}
		};
	}
]).

controller('TicketsOffsiteCtrl', ['$scope', 'plan', '$http', '$location', '$rootScope',
	function($scope, plan, $http, $location, $rootScope) {
		plan.get(function(p) {
			$scope.plan = p;
		});

		$scope.$on('tickets-offsite-clicked', function(e, args) {
			$scope.qty = args.qty;
			$scope.amountPaid = args.amountPaid;
			$scope.eventId = args.eventId,
			$scope.eventName = args.eventName,
			$scope.sessionId = args.sessionId,
			$scope.ticketGroup = args.ticketGroup,
			$scope.ticketId = args.ticketId
			$scope.backToPlan = (typeof args.backToPlan === "undefined" || args.backToPlan == 'false') ? false : args.backToPlan;
			if ($scope.backToPlan) {
				$scope.continueLink = '/plan';
			} else {
				$scope.continueLink = '/event-options/' + args.eventId + '/' + args.eventName;
			}
		})

		$scope.showButton = function() {
			return ($scope.ticketsOffsite === 'bought');
		};

		$scope.submitForm = function() {
			/* update the tickets to have a receipt */
			plan.addTicketGroupReceipt({
				ticketId: $scope.ticketId,
				service: 'tn',
				receipt: {
					qty: $scope.qty,
					amountPaid: $scope.amountPaid
				}
			}, function(err, result) {
				$('#tickets-offsite-modal').modal('hide');

				/* for testing, fire the ticketnetwork pixel which will set the payment.receipt value */
				//$http.get('http://tom.wembli.com/callback/tn/checkout?request_id=' + $scope.sessionId + '&event_id=' + $scope.eventId);

				/* have to back to plan so they don't have a chance to buy more */
				if ($scope.continueLink) {
					$location.path($scope.continueLink);
				} else {
					$location.path("/plan");
				}

				var t = plan.getTickets();

				var newT = [];

				if (typeof t[0] === "undefined") {
					newT.push(result.ticket);
				} else {
					for (var i = 0; i < t.length; i++) {
						if (t[i]._id = result.ticket._id) {
							newT.push(result.ticket);
						} else {
							newT.push(t[i]);
						}
					};
				}
				plan.setTickets(newT);
				$rootScope.$broadcast('tickets-changed', {
					restaurants: newT
				});



			});

		};

		$scope.cancelForm = function() {
			/* remove the ticketgroup and close the modal */
			plan.removeTicketGroup({
				ticketId: $scope.ticketId
			}, function(err, results) {
				$('#tickets-offsite-modal').modal('hide');
				$rootScope.$broadcast('tickets-changed', {
					tickets: results.tickets
				});

			});

		};

	}
]).

controller('VenueMapCtrl', ['$rootScope', '$scope', 'interactiveMapDefaults', 'plan', '$filter', 'customer', 'wembliRpc',
	function($rootScope, $scope, interactiveMapDefaults, plan, $filter, customer, wembliRpc) {
		plan.get(function(p) {
			//var p = result.plan;
			$scope.plan = p;
			$scope.priceRange = {};
			$scope.eventOptionsLink = '/event-options/' + p.event.eventId + '/' + p.event.eventName;
			$scope.priceRange.low = p.preferences.tickets.priceRange.low || true;
			$scope.priceRange.med = p.preferences.tickets.priceRange.med || true;
			$scope.priceRange.high = p.preferences.tickets.priceRange.high || true;
		});

		$scope.determineRange = function(price) {
			/* hard coded price range for now */
			var i = parseInt(price);
			if (i <= 100) {
				return '$';
			}
			if (i > 100 && i <= 300) {
				return '$$';
			}
			if (i > 300) {
				return '$$$';
			}
		}

		$scope.removeTicketGroup = function(ticketId) {
			wembliRpc.fetch('plan.removeTicketGroup', {
				ticketId: ticketId
			}, function(err, result) {
				plan.setTickets(result.tickets);
			});

		};


		$scope.determineTixAvailable = function(tix) {
			if (typeof tix[0] === "undefined") {
				tix = [tix];
			}
			var highest = tix[0];
			angular.forEach(tix, function(el) {
				if (el > highest) {
					highest = el;
				}
			});
			var str = 'up to ' + highest + ' tix available';
			return str;
		}

	}
]);
