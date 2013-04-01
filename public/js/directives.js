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
    templateUrl: "/partials/interactive-venue-map",
    compile: function(element, attr, transclude) {
      //return linking function
      return function(scope, element, attr) {

        scope.$watch('tickets', function(newVal, oldVal) {
          if(newVal !== oldVal) {
            $('#map-container').tuMap("Refresh", "Reset");
          }
        });

        plan.get(function(plan) {
          //get the tix and make the ticket list
          wembliRpc.fetch('event.getTickets', {
            eventID: plan.event.eventId
          },

          function(err, result) {
            if(err) {
              //handle err
              alert('error happened - contact help@wembli.com');
              return;
            }

            scope.event   = result.event;
            scope.tickets = result.tickets;

            //scope.$broadcast('TicketsCtrl-ticketsLoaded',{});
            /* get min and max tix price for this set of tix */
            var minTixPrice = 0;
            var maxTixPrice = 200;
            angular.forEach(scope.tickets, function(el) {
              if(parseInt(el.ActualPrice) < minTixPrice) {
                minTixPrice = parseInt(el.ActualPrice);
              }
              if(parseInt(el.ActualPrice) > maxTixPrice) {
                maxTixPrice = parseInt(el.ActualPrice);
              }
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

            options.OnInit = function(e, MapType) {
              $(".ZoomIn").html('+');
              $(".ZoomOut").html('-');
              $(".tuMapControl").parent("div").attr('style',"position:absolute;left:5px;top:5px;font-size:12px");
            };

            options.OnError = function(e, Error) {
              if(Error.Code === 1) { /* chart not found - display the tn chart */
                $('#map-container').css("background", 'url(' + $('#tnMapUrl').val() + ') no-repeat center center');
              }
            };

            options.ToolTipFormatter = function(Data) {

            };

            options.OnMouseover = function(e, Section) {
              if(Section.Active) {
              } else {
              }
            };

            options.OnMouseout = function(e, Section) {
              if(Section.Active) {
              }
            };

            options.OnClick = function(e, Section) {
              if(Section.Active && Section.Selected) {
              }
            };

            options.OnControlClick = function(e, Data) {
              if(Section.Selected) {
              }
            };

            options.OnGroupClick = function(e, Group) {
              if(Group.Selected) {

              }
            };

            options.OnTicketSelected = function(e, Ticket) {
            }

            options.OnReset = function(e) {
              //Write Code Here
            };

            //set the height of the map-container to the window height
            $('#map-container').css("height", $($window).height() - 60);
            $('#tickets').css("height", $($window).height() - 60);
            $('#map-container').css("width", $($window).width() - 480);
            $('#map-container').tuMap(options);

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
            //$('#page-loading-modal').modal("show");
            return data;
          },

          function(data, headersGetter) {
/*            setTimeout(function() {
              $('#page-loading-modal').modal("hide");
            }, 3000);
*/            return JSON.parse(data);
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
.directive('eventData', ['$rootScope','$filter', 'wembliRpc', 'plan', function($rootScope, $filter, wembliRpc, plan) {
  return {
    restrict: 'C',
    templateUrl: '/partials/event-data',
    cache:false,
    scope:{eventId:'@eventId'},
    compile: function(element, attr, transclude) {

      return function(scope, element, attr) {
        scope.direction = attr.direction;
        plan.get(function(plan) {
          scope.event = plan.event;
        });
      }
    }
  }
}])

.directive('twitterWidget',['$window',function($window) {
  return {
    restrict: 'C',
    compile: function(element, attr, transclude) {

      $window.twttr = (function (d,s,id) {
        var t, js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return; js=d.createElement(s); js.id=id;
        js.src="//platform.twitter.com/widgets.js"; element.append(js);
        return $window.twttr || (t = { _e: [], ready: function(f){ t._e.push(f) } });
      }(document, "script", "twitter-wjs"));


      return function(scope, element, attr) {
        console.log('twitter timeline');
        $window.twttr.ready(function(twttr) {
          //-twttr.widgets.load();
        });
      }
    }
  }
}])

.directive('buyTicketsOffsite',
  ['$rootScope', '$window', '$location', '$http', '$timeout','fetchModals', 'plan',
  function($rootScope, $window, $location, $http, $timeout, fetchModals, plan) {


  return {
    restrict:'EAC',
    compile: function(element, attr, transclude) {
      return function(scope, element, attr) {

        element.click(function(e) {
          var qty = $('#qty-'+attr.ticketId).val();
          var shipping = 15;
          var serviceCharge = (parseFloat(attr.ticketPrice) * .15) * parseInt(qty);
          var actualPrice = attr.ticketPrice * parseInt(qty);
          var amountPaid = parseFloat(actualPrice) + parseFloat(serviceCharge) + parseFloat(shipping);
          $('#amount-paid').val(parseFloat(amountPaid).toFixed(2));
          $('#qty').val(parseInt(qty));

          var Promise = $timeout(function() {
            $('#tickets-offsite-modal').modal('show');
          },1500);
        });
      }
    }
  };
}])

.directive('focusOnClick',['$timeout', function($timeout) {
  return {
    restrict:'C',
    compile: function(element, attr, transclude) {
      return function(scope, element, attr) {
        var focus = function() {
          console.log('trying to set focus');
          $timeout(function() {
            element.focus();
            if (!element.is(':focus')) {
              focus();
            }
          },100);
        };

        element.click(function(e) {
          focus();
        })
      }
    }
  }
}])

.directive('startPlan',['$rootScope','fetchModals',function($rootScope, fetchModals) {
  return {
    restrict:'C',
    compile: function(element, attr, transclude) {
      fetchModals.fetch('/partials/payment-type');

      return function(scope,element,attr) {
        element.click(function() {
          var nextLink = '';

          if (attr.href) {
            nextLink = attr.href;
          } else {
            nextLink = element.find('.next-link').attr('href');
          }

          $rootScope.$broadcast('payment-type-modal-clicked',{nextLink:nextLink,name:attr.name});
          /* show the popup to collect payment type */
          $('#payment-type-modal').modal('show');
        });
      }
    }
  }
}])

//directive to cause link click to go to next frame rather than fetch a new page
.directive('wembliSequenceLink',
  ['$rootScope', '$window', '$templateCache', '$timeout','$location', '$http', '$compile', 'footer', 'sequence', 'fetchModals', 'plan',
  function($rootScope, $window, $templateCache, $timeout,$location, $http, $compile, footer, sequence, fetchModals, plan) {

  return {
    restrict: 'EAC',
    compile: function(element, attr, transclude) {
      //return linking function
      return function(scope, element, attr) {
        element.click(function(e) {
          var loadingDuration = 500;

          if (attr.loadingDuration) {
            loadingDuration = parseInt(attr.loadingDuration);
          }

          /* hide any modals right now */
          $(".modal").modal("hide");
          /* show the page loading modal */
          $('#page-loading-modal').modal("show");
          console.log('loading duration');
          console.log(loadingDuration);
          $rootScope.$on('sequence-afterNextFrameAnimatesIn', function() {
            //dismiss any modals
            $timeout(function() {
              $('#page-loading-modal').modal("hide");
            },loadingDuration);
          });

          e.preventDefault();

          var direction = 1;

          var path = "";
          var method = "get";
          var url = "";
          var samePage = false;

          //a tags will have href
          if(element.is('a')) {
            console.log('path is href in a tag');
            path = element.attr('href');
          }

          //if its a button
          if(element.is('button')) {
            //get the action of the form
            console.log('path is action of a form button');
            path = element.closest('form').attr('action');
            method = element.closest('form').attr('method');

            var headers = {
              "Content-Type": "application/x-www-form-urlencoded"
            };
            if(typeof element.closest('form').attr('enctype') !== "undefined") {
              headers['Content-Type'] = element.closest('form').attr('enctype');
            }
          }

          if(path === "") {
            console.log('path is child');
            path = element.find('a').attr('href');
          }

          if(path === "/") {
            url = path + "index";
          } else {
            url = path;
          }

          //if the path in the action is the same as the current location
          //set a flag here to tell the success callback not to slide
          samePage = (path === $rootScope.currentPath) ? true : false;

          $location.path(path);

          //fetchModals
          fetchModals.fetch(path);

          if(method === "get") {
            url = "/partials" + url;
          }

          var args = {
            method: method,
            url: url,
            cache: false,
          };

          if(typeof headers !== "undefined") {
            args.headers = headers;
          }

          //if its a post put the post body together
          if(method === "post") {
            args.data = element.closest('form').serialize();
          }

          //fetch the partial
          $http(args).success(function(data, status, headers, config) {
            var headers = headers();
            console.log(headers);

            //if the server tells us explicitly what the location should be, set it here:
            if(typeof headers['x-wembli-location'] !== "undefined") {
              //if x-location comes back and its the same as $location.path() - don't slide
              if($location.path() === headers['x-wembli-location']) {
                samePage = true;
              } else {
                samePage = false;
                $location.path(headers['x-wembli-location']);
              }
            }

            if(samePage) {
              $(".modal").modal("hide");
              return angular.element('#frame' + $rootScope.currentFrame).html($compile(data)($rootScope));
            }

            scope.$emit('viewContentLoaded',{});

            //what frame to go to:
            var nextFrameID = ($rootScope.currentFrame === 1) ? 2 : 1;

            //split location path on '/' to get the right framesMap key
            var nextPath = '/' + $location.path().split('/')[1];
            //if footer.framesMap[$location.path()] (where they are going) is undefined
            //then don't move the arrow and slide to the right
            //if footer.framesMap[$rootScope.currentPath] (where they are coming from) is undefined
            //then move the arrow, but still slide to the right
            if(typeof footer.framesMap[$rootScope.currentPath] == "undefined") {
              var currentPath = '/' + footer.currentPath.split('/')[1];
              if(typeof footer.framesMap[currentPath] !== "undefined") {
                //direction depends on where the arrow is compared to where they are going
                var currNavIndex = footer.framesMap[currentPath];
                var nextNavIndex = footer.framesMap[nextPath];
                direction = (currNavIndex < nextNavIndex) ? 1 : -1;
              }
              footer.slideNavArrow();
            }

            //if both are defined
            //then move the arrow and figure out which way to slide
            if((typeof footer.framesMap[nextPath] !== "undefined") && (typeof footer.framesMap[$rootScope.currentPath] !== "undefined")) {
              var currNavIndex = footer.framesMap[$rootScope.currentPath];
              var nextNavIndex = footer.framesMap[nextPath];
              direction = (currNavIndex < nextNavIndex) ? 1 : -1;
              //slide the nav arrow - this should be async with using sequence to transition to the next frame
              footer.slideNavArrow();
            }

            //find out what direction to go to we sliding in this element
            direction = parseInt(attr.direction)  || parseInt(scope.direction) || direction;

            //fetch the plan
            plan.fetch(function() {
              //compile the page we just fetched and link the scope
              angular.element('#frame' + nextFrameID).html($compile(data)($rootScope));

              //do the animations
              sequence.goTo(nextFrameID, direction);

              $('#content').scrollTop(0);
              $('#content').css('overflow', 'visible');
              $('#content').css('overflow-x', 'hidden');

              //server can tell us to overflow hidden or not - this is for the venue map pages
              if(typeof headers['x-wembli-overflow'] !== "undefined") {
                if(headers['x-wembli-overflow'] === 'hidden') {
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
    cache:false,
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

.directive('fadeElement', function () {
    return function (scope, element, attrs) {
        element.css('display', 'none');
        scope.$watch(attrs.fadeElement, function (value) {
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
                keyupFn.call(scope,elm,attrs);
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
