'use strict';

/* Directives */
angular.module('wembliApp.directives', []).
//trigger partial - kind of a hack - but basically sets rootScope bool to let everyone know that
//the original page has loaded and partials will be loaded from now on
directive('triggerPartial', ['$rootScope', function($rootScope) {
  return {
    restrict: 'C',
    link: function(scope, element, attr) {
      $rootScope.partial = true;
    }
  }
}])

.directive('interactiveVenueMap', ['interactiveMapDefaults', 'wembliRpc', '$window', '$templateCache', 'plan', function(interactiveMapDefaults, wembliRpc, $window, $templateCache, plan) {
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
          wembliRpc.fetch('event.getTickets', {eventID: plan.event.eventId}, function(err, result) {

            if (err) {
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
              var PriceRange = $("#price-slider").slider("option", "values");

              $("#map-container").tuMap("SetOptions", {
                TicketsFilter: {
                  MinPrice: PriceRange[0],
                  MaxPrice: PriceRange[1],
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
              $('#generic-loading-modal').modal("hide");
            };

            options.OnError = function(e, Error) {
              if (Error.Code === 1) {
                /* chart not found - display the tn chart */
                $('#map-container').css("background", 'url(' + scope.event.MapURL + ') no-repeat center center');
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
}])
/*
.directive('friendTweetButton', ['$window','wembliRpc',function($window,wembliRpc) {
  return {
    restrict: 'C',
    compile:function(element,attr,transclude) {

      return function(scope,element, attr) {
        var href = element.attr('href') + scope.friend.screen_name;
        element.attr('href',href);
        element.attr('data-url',scope.friend.rsvpUrl);
        element.attr('data-text',scope.friend.messageText);

        element.bind('click',function(e) {
          e.preventDefault();
          console.log('clicked on the button');

        });

        $window.twttr.ready(function(twttr) {
          twttr.events.bind('click',function(event) {
            console.log(event);
            wembliRpc.fetch('invite-friends.submit-step4', {friend:scope.friend}, function(err,result) {
              scope.$apply(function(){
                scope.friend.inviteStatus = true;
              });
            });
          });

          twttr.events.bind('tweet',function(event) {
            console.log('actually tweeted');
            console.log(event.data);
          });

          twttr.widgets.load();
        });

        $window.twttr.widgets.load();
      }
    },
  }
}])
*/
.directive('eventData', ['$rootScope', '$filter', 'wembliRpc', 'plan', 'sequence', function($rootScope, $filter, wembliRpc, plan, sequence) {
  return {
    restrict: 'C',
    templateUrl: '/partials/event-data',
    cache: false,
    scope: {
      eventId: '@eventId'
    },
    compile: function(element, attr, transclude) {

      return function(scope, element, attr) {
        /* why is this here?
        scope.direction = attr.direction;
        */
        /* do i need to wait for sequence.ready? */
        //sequence.ready(function() {
        plan.get(function(plan) {
          scope.event = plan.event;
        });
        //});
      }
    }
  }
}])

.directive('eventWrapper', ['wembliRpc', '$window', function(wembliRpc, $window) {
  return {
    restrict: 'C',
    compile: function(element, attr, transclude) {
      return function(scope, element, attr) {
        element.mouseover(function() {
          if (attr.noPopover) {
            return;
          }
          var elId = (typeof element.parents('li').attr('id') == "undefined") ? element.attr('id') : element.parents('li').attr('id');

          if (typeof scope.ticketSummaryData == "undefined") {
            scope.ticketSummaryData = {};
            scope.ticketSummaryData.locked = false;
          }

          /* if its locked that means we moused in while doing a fetch */
          if (scope.ticketSummaryData.locked) {
            return;
          }

          //we have a cache of the data - gtfo
          if (typeof scope.ticketSummaryData[elId.split('-')[0]] != "undefined") {
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

            scope.ticketSummaryData[elId.split('-')[0]] = result;
            /* we cached the result..lets unlock */
            scope.ticketSummaryData.locked = false;
            /* init the popover */
            var summaryContent = "";

            if (typeof result.ticketPricingInfo.ticketsAvailable !== "undefined") {
              if (result.ticketPricingInfo.ticketsAvailable === '0') {
                summaryContent = "Click for ticket information";
              } else {
                summaryContent = (result.ticketPricingInfo.ticketsAvailable === "1") ? result.ticketPricingInfo.ticketPricingInfo.ticketsAvailable + " ticket choice" : result.ticketPricingInfo.ticketsAvailable + " ticket choices";
                if (parseFloat(result.ticketPricingInfo.lowPrice) === parseFloat(result.ticketPricingInfo.highPrice)) {
                  summaryContent += " from $" + parseFloat(result.ticketPricingInfo.lowPrice).toFixed(0);
                } else {
                  summaryContent += " from $" + parseFloat(result.ticketPricingInfo.lowPrice).toFixed(0) + " to $" + parseFloat(result.ticketPricingInfo.highPrice).toFixed(0);
                }
              }
            } else {
              summaryContent = "Click for ticket information";
            }

            console.log('popver is going to the left of: ' + elId);
            $('#' + elId).popover({
              placement: "left",
              trigger: 'hover',
              animation: true,
              title: 'Tickets Summary',
              content: summaryContent
            });
            $('#' + elId).popover('show');
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
        })
      }
    }
  }
}])

/* this doesn't really seem to do much */
.directive('eventList', ['wembliRpc', '$window', function(wembliRpc, $window) {
  return {
    restrict: 'C',
    compile: function(element, attr, transclude) {
      console.log('show generic loading modal');
      //$('#generic-loading-modal').modal("show");
      return function(scope, element, attr) {
        //
        //$('#generic-loading-modal').modal("hide");
      }
    }
  }
}])

.directive('twitterWidget', ['$window', function($window) {
  return {
    restrict: 'C',
    compile: function(element, attr, transclude) {

      $window.twttr = (function(d, s, id) {
        var t, js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = "//platform.twitter.com/widgets.js";
        element.append(js);
        return $window.twttr || (t = {
          _e: [],
          ready: function(f) {
            t._e.push(f)
          }
        });
      }(document, "script", "twitter-wjs"));


      return function(scope, element, attr) {
        $window.twttr.ready(function(twttr) {
          //-twttr.widgets.load();
        });
      }
    }
  }
}])

.directive('ticketsLoginModal', ['$rootScope', '$window', '$location', '$http', '$timeout', 'fetchModals', 'plan', function($rootScope, $window, $location, $http, $timeout, fetchModals, plan) {

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
}])

.directive('buyTicketsOffsite', ['$rootScope', '$window', '$location', '$http', '$timeout', 'fetchModals', 'plan', function($rootScope, $window, $location, $http, $timeout, fetchModals, plan) {

  return {
    restrict: 'EAC',
    compile: function(element, attr, transclude) {
      return function(scope, element, attr) {

        attr.$observe('ticket', function(val) {
          if (typeof val === "undefined" || val === "") {
            return;
          }
          var ticket = JSON.parse(val);
          element.click(function(e) {
            var shipping = 15;
            var serviceCharge = (parseFloat(ticket.ActualPrice) * .15) * parseInt(ticket.selectedQty);
            var actualPrice = parseFloat(ticket.ActualPrice) * parseInt(ticket.selectedQty);
            var amountPaid = parseFloat(actualPrice) + parseFloat(serviceCharge) + parseFloat(shipping);

            $rootScope.$broadcast('tickets-offsite-clicked', {
              qty: ticket.selectedQty,
              amountPaid: amountPaid,
              ticketGroup: ticket,
              eventId: ticket.RventId,
              sessionId: ticket.sessionId
            });

            var Promise = $timeout(function() {
              $('#tickets-login-modal').modal('hide');
              $('#tickets-offsite-modal').modal('show');
            }, 1500);
          });
        });
      }
    }
  };
}])
.directive('sendForgotPasswordEmail', ['wembliRpc', function(wembliRpc) {

  return {
    restrict: 'C',
    compile: function(element, attr, transclude) {
      return function(scope, element, attr) {
          element.click(function(e) {

            wembliRpc.fetch('customer.sendForgotPasswordEmail',{email:scope.email},function(err,result) {
              console.log(result);
              /* display an email sent message */
              scope.forgotPasswordEmailSent = true;
            },
            /* transformRequest */
            function(data, headersGetter) {
              scope.accountExists = false; //will this work?
              scope.signupSpinner = true;
              return data;
            },

            /* transformResponse */
            function(data, headersGetter) {
              scope.signupSpinner = false;
              return JSON.parse(data);
            });

          });
        };
      }
    }
}])

.directive('focusOnClick', ['$timeout', function($timeout) {
  return {
    restrict: 'C',
    compile: function(element, attr, transclude) {
      return function(scope, element, attr) {
        var focus = function() {
          $timeout(function() {
            element.focus();
            if (!element.is(':focus')) {
              focus();
            }
          }, 100);
        };

        element.click(function(e) {
          focus();
        })
      }
    }
  }
}])

.directive('startPlan', ['$rootScope', 'fetchModals', function($rootScope, fetchModals) {
  return {
    restrict: 'C',
    compile: function(element, attr, transclude) {
      fetchModals.fetch('/partials/payment-type');

      return function(scope, element, attr) {
        element.click(function() {
          var nextLink = '';

          if (attr.href) {
            nextLink = attr.href;
          } else {
            nextLink = element.find('.next-link').attr('href');
          }

          $rootScope.$broadcast('payment-type-modal-clicked', {
            nextLink: nextLink,
            name: attr.name
          });
          /* show the popup to collect payment type */
          $('#payment-type-modal').modal('show');
        });
      }
    }
  }
}])

//directive to cause link click to go to next frame rather than fetch a new page
.directive('wembliSequenceLink', ['$rootScope', '$window', '$templateCache', '$timeout', '$location', '$http', '$compile', 'footer', 'sequence', 'fetchModals', 'plan', function($rootScope, $window, $templateCache, $timeout, $location, $http, $compile, footer, sequence, fetchModals, plan) {

  return {
    restrict: 'EAC',
    compile: function(element, attr, transclude) {
      return function(scope, element, attr) {

        element.click(function(e) {
          e.preventDefault();

          /* init some defaults */
          var path = ""; //defaulting to empty string for path will result in samePage on error
          var args = {
            method: 'get',
            cache: false
          }; //args for the http request
          var direction = 1; //default to slide right
          var samePage = true; //load the same page by default in case there are errors

          /* hide any modals right now */
          $(".modal").modal("hide");

          /* show the page loading modal */
          $('#page-loading-modal').modal("show");

          /*
            figure out where we're going next
            the directive may be attached to an a tag
            or a parent of an a tag
            or a button in a form
          */

          /* a tags will have href */
          if (element.is('a')) {
            path = element.attr('href');
          }

          /* if its a button */
          if (element.is('button')) {
            /* get the action of the form */
            path = element.closest('form').attr('action');

            args.method = element.closest('form').attr('method');
            args.headers = {
              "Content-Type": "application/x-www-form-urlencoded"
            };
            if (typeof element.closest('form').attr('enctype') !== "undefined") {
              args.headers['Content-Type'] = element.closest('form').attr('enctype');
            }
          }

          /* element is a parent of the thing with the href */
          if (path === "") {
            path = element.find('a').attr('href');
          }

          args.url = (path === "/") ? path + "index" : path;

          /* if we still don't know the path then make this the same page */
          if (path === "") {
            samePage = true
          };

          /* clear out the search args from the path */
          path = path.split('?')[0];

          /*
            if the path in the action is the same as the current location
            set a flag here to tell the success callback not to slide
          */
          if (path !== $rootScope.currentPath) {
            samePage = false;
          }

          /* ok all set lets start the transition */

          /* fetchModals for this new path */
          fetchModals.fetch(path);

          /* if its not a form submit then we'll be getting a partial to load in a sequence frame */
          if (/get/i.test(args.method)) {
            args.url = "/partials" + args.url;
          }
          /* if its a post put the post body together */
          if (/post/i.test(args.method)) {
            args.data = element.closest('form').serialize();
          }

          /* fetch the partial */
          $http(args).success(function(data, status, headers, config) {
            var headerFunc = headers;
            /* fetch the plan once we have the html */
            plan.fetch(function(planObj) {
              /* update the path */
              $location.path(path);

              /* do i need to do anything with the planObj? or just make sure it is fetched */

              var headers = headerFunc();

              /* if the server tells us explicitly what the location should be, set it here: */
              if (typeof headers['x-wembli-location'] !== "undefined") {
                /* if x-location comes back and its the same as $location.path() - don't slide */
                if ($rootScope.currentPath === headers['x-wembli-location']) {
                  samePage = true;
                } else {
                  samePage = false;
                  $location.path(headers['x-wembli-location']);
                }
              }

              if (samePage) {
                $(".modal").modal("hide");
                angular.element('#frame' + $rootScope.currentFrame).html($compile(data)($rootScope));
                scope.$emit('viewContentLoaded', {});
                return;
              }

              /* not on the same page so we're gonna slide to the other frame */
              var nextFrameID = ($rootScope.currentFrame === 1) ? 2 : 1;

              /*
                split location path on '/' to get the right framesMap key
                this is so we know where to slide the footer arrow to
              */
              var nextPath = '/' + $location.path().split('/')[1];
              var currentPath = '/' + $rootScope.currentPath.split('/')[1];

              /*
                if footer.framesMap[$location.path()] (where they are going) is undefined
                then don't move the arrow and slide to the right
                if footer.framesMap[$rootScope.currentPath] (where they are coming from) is undefined
                then move the arrow, but still slide to the right
              */

              /* if where they are coming from doesn't have an arrow location */
              if (typeof footer.framesMap[currentPath] === "undefined") {
                currentPath = nextPath;
                direction = 1;
                /* slide the arrow only if where they are coming from is undefined */
                footer.slideNavArrow();
              }

              /*
                if both are defined
                then move the arrow and figure out which way to slide
              */
              if ((typeof footer.framesMap[nextPath] !== "undefined") && (typeof footer.framesMap[currentPath] !== "undefined")) {
                var currNavIndex = footer.framesMap[currentPath];
                var nextNavIndex = footer.framesMap[nextPath];
                direction = (currNavIndex < nextNavIndex) ? 1 : -1;
                /* slide the nav arrow - this should be async with using sequence to transition to the next frame */
                footer.slideNavArrow();
              }

              /* find out what direction to go to we sliding in this element */
              direction = parseInt(attr.direction) || parseInt(scope.direction) || direction;

              /* compile the page we just fetched and link the scope */
              angular.element('#frame' + nextFrameID).html($compile(data)($rootScope));

              /* should this go before the compile? or after? */
              scope.$emit('viewContentLoaded', {});

              /* do the animations */
              sequence.goTo(nextFrameID, direction);

              /* dismiss any modals once the page loads */
              var loadingDuration = (attr.loadingDuration) ? parseInt(attr.loadingDuration) : 500;
              sequence.ready(function() {
                $timeout(function() {
                  $('#page-loading-modal').modal("hide");
                }, loadingDuration);
              });

              $('#content').scrollTop(0);
              $('#content').css('overflow', 'visible');
              $('#content').css('overflow-x', 'hidden');

              /* server can tell us to overflow hidden or not - this is for the venue map pages */
              if (typeof headers['x-wembli-overflow'] !== "undefined") {
                if (headers['x-wembli-overflow'] === 'hidden') {
                  $('#content').css('overflow', 'hidden');
                }
              }

              //update the currentPath and the currentFrame
              $rootScope.currentPath = $location.path();
              $rootScope.currentFrame = nextFrameID;

            });

          }).error(function() {
            console.log('error getting: ' + url);
          });
        });
      };
    }
  };
}])

.directive('popover', [function() {
  return {
    restrict: 'C',
    cache: false,
    compile: function(element, attr, transclude) {

      return function(scope, element, attr) {
        element.popover({
          placement: attr.placement,
          trigger: attr.trigger,
          animation: (attr.animation === 'true') ? true : false,
          title: attr.title,
          content: attr.content
        });
      }
    }
  }
}])

.directive('fadeElement', function() {
  return function(scope, element, attrs) {
    element.css('display', 'none');
    scope.$watch(attrs.fadeElement, function(value) {
      if (value) {
        element.fadeIn(400);
      } else {
        element.fadeOut(1000);
      }
    });
  }
})

.directive('onKeyup', function() {
  return function(scope, elm, attrs) {
    //Evaluate the variable that was passed
    //In this case we're just passing a variable that points
    //to a function we'll call each keyup
    var keyupFn = scope.$eval(attrs.onKeyup);
    elm.bind('keyup', function(evt) {
      //$apply makes sure that angular knows
      //we're changing something
      scope.$apply(function() {
        keyupFn.call(scope, elm, attrs);
      });
    });
  };
})

.directive('appVersion', ['version', function(version) {
  return function(scope, elm, attrs) {
    elm.text(version);
  };

}])

.directive('dropdown', function() {
  return function(scope, elm, attrs) {
    $(elm).dropdown();
  };
});
