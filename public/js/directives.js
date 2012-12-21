'use strict';

/* Directives */
angular.module('wembliApp.directives', []).
//trigger partial - kind of a hack - but basically sets rootScope bool to let everyone know that
//the original page has loaded and partials will be loaded from now on
directive('triggerPartial', ['$rootScope', function($rootScope) {
  return {
    restrict: 'C',
    link: function($scope, element, attr) {
      $rootScope.partial = true;
    }
  }
}])

.directive('interactiveVenueMap', ['interactiveMapDefaults','wembliRpc','$window', function(interactiveMapDefaults,wembliRpc,$window) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: "/partials/interactive-venue-map",
    compile: function(element, attr, transclude) {
      console.log('compile func');

      //return linking function
      return function(scope, element, attr) {

        scope.$watch('tickets', function(newVal, oldVal) {
          console.log('tickets watch expression');
          console.log('new:' + newVal);
          console.log('old:' + oldVal);
          if (newVal !== oldVal) {
            $('#map-container').tuMap("Refresh", "Reset");
          }
        });

        //get the tix and make the ticket list
        wembliRpc.fetch('event.getTickets', {
          eventID: attr.eventId
        },

        //response callback
        function(err, result) {
          if(err) {
            //handle err
            alert('error happened - contact help@wembli.com');
            return;
          }
          console.log('updating tickets');
          scope.event = result.event;
          scope.tickets = result.tickets;
          console.log('map for: '+scope.event.VenueConfigurationID);
          //$scope.$broadcast('TicketsCtrl-ticketsLoaded',{});
          /* get min and max tix price for this set of tix */
          var minTixPrice = 100;
          var maxTixPrice = 200;
          angular.forEach(scope.tickets,function(el) {
            if (parseInt(el.ActualPrice) < minTixPrice) {
              minTixPrice = parseInt(el.ActualPrice);
            }
            if (parseInt(el.ActualPrice) > maxTixPrice) {
              maxTixPrice = parseInt(el.ActualPrice);
            }
          });


          var initSlider = function () {

            /*Set Minimum and Maximum Price from your Dataset*/
            $("#price-slider").slider("option","min", minTixPrice);
            $("#price-slider").slider("option","max", maxTixPrice);
            $("#price-slider").slider("option","values", [minTixPrice,maxTixPrice]);
            $("#amount").val("$" + minTixPrice + " - $" + maxTixPrice );
          }

          var filterTickets = function() {
            var PriceRange = $("#price-slider").slider("option", "values");

            $("#map-container").tuMap("SetOptions",{
              TicketsFilter:{
                MinPrice: PriceRange[0],
                MaxPrice: PriceRange[1],
                Quantity: $("#quantity-filter").val(),
                eTicket:$("#e-ticket-filter").is(":checked")
              }
            }).tuMap("Refresh");
          };


          var options = interactiveMapDefaults;
          options.MapId = scope.event.VenueConfigurationID;

          options.OnInit = function(e,MapType) {
            console.log('in init mapType: '+MapType);
            $(".ZoomIn").html('+');
            $(".ZoomOut").html('-');

          };

          options.OnError = function(e,Error) {
            console.log('error: ');
            console.log(Error);
            if (Error.Code === 1) {
              /* chart not found - display the tn chart */
              console.log('setting map background to: '+$('#tnMapUrl').val());
              $('#map-container').css("background",'url('+$('#tnMapUrl').val()+') no-repeat center center');
            }
          };

          options.ToolTipFormatter = function(Data) {
            console.log('tooltip formatteR: ');
            console.log(data);
          };

          options.OnMouseover = function(e, Section) {
            console.log(Section);
            if(Section.Active) {
              console.log("Section " + Section.Name + " in Group " + Section.Group.Name);
            } else {
              console.log('no tickets');
            }
          };

          options.OnMouseout = function(e, Section) {
            if(Section.Active) {
              console.log("Section " + Section.Name + " in Group " + Section.Group.Name);
            }
          };

          options.OnClick = function(e, Section) {
            if(Section.Active && Section.Selected) {
              console.log("Selected Section " + Section.Name + " in Group " + Section.Group.Name);
            }
          };

          options.OnControlClick = function(e, Data) {
            if(Section.Selected) {
              console.log("Selected Button " + Data.Name);
            }
          };

          options.OnGroupClick = function(e, Group) {
            if(Group.Selected) {
              console.log("Selected Group " + Group.Name);
            }
          };

          options.OnTicketSelected = function(e, Ticket) {
            console.log("TicketId:" + Ticket.Id + ", Quantity:" + Ticket.Quantity);
          }

          options.OnReset = function(e) {
            //Write Code Here
            console.log('they want to reset');
          };

          //set the height of the map-container to the window height
          $('#map-container').css("height",$($window).height()-60);
          $('#tickets').css("height",$($window).height()-60);
          $('#map-container').css("width",$($window).width()-480);
          $('#map-container').tuMap(options);

          $('#price-slider').slider({
            range: true,
            min: minTixPrice,
            max: maxTixPrice,
            step:5,
            values: [ minTixPrice, maxTixPrice ],
            slide: function( event, ui ) {
              $( "#amount" ).val( "$" + ui.values[0] + " - $" +  ui.values[1]);
            },
            stop: function(event, ui) {
              filterTickets();
            }

          });

          var amtVal = "$" + $( "#price-slider" ).slider( "values", 0 ) + " - $" + $( "#price-slider" ).slider( "values", 1 );
          $( "#amount" ).val(amtVal);

          /* filter tix when the drop down changes */
          $("#quantity-filter").change(function(){ filterTickets(); });

        },

        //transformRequest
        function(data, headersGetter) {
          console.log('showing modal');
          $('#page-loading-modal').modal("show");
          return data;
        },

        //transformResponse
        function(data, headersGetter) {
          $('#page-loading-modal').modal("hide");
          return JSON.parse(data);
        });
      }
    }
  }
}])

.directive('eventData', ['$filter', 'wembliRpc', function($filter, wembliRpc) {
  return {
    restrict: 'C',
    templateUrl: '/partials/event-data',
    compile: function(element, attr, transclude) {

      return function(scope, element, attr) {
        //fetch the event data
        var args = {"eventID": scope.eventId};

        wembliRpc.fetch('event.get', args,

        //response callback
        function(err, result) {
          if(err) {
            //handle err
            alert('error happened - contact help@wembli.com');
            return;
          }

          scope.event = result['event'][0];
        },

        //transformRequest
        function(data, headersGetter) {
          //$('#more-events .spinner').show();
          return data;
        },

        //transformResponse
        function(data, headersGetter) {
          //$('#more-events .spinner').hide();
          return JSON.parse(data);
        });
      }
    }
  }
}])

//directive to cause link click to go to next frame rather than fetch a new page
.directive('wembliSequenceLink', ['$rootScope', '$window', '$location', '$http', '$compile', 'footer', 'sequence', function($rootScope, $window, $location, $http, $compile, footer, sequence) {
  return {
    restrict: 'EAC',
    compile: function(element, attr, transclude) {

      //return linking function
      return function($scope, element, attr) {
        element.click(function(e) {
          e.preventDefault();

          var path = "";
          var method = "get";
          var url = "";
          var samePage = false;

          //a tags will have href
          if(element.is('a')) {
            path = element.attr('href');
          }

          //if its a button
          if(element.is('button')) {
            //get the action of the form
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
            path = element.children('a').attr('href');
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
            //if the server tells us explicitly what the location should be, set it here:
            if(typeof headers()['x-wembli-location'] !== "undefined") {
              //if x-location comes back and its the same as $location.path() - don't slide
              if($location.path() === headers()['x-wembli-location']) {
                samePage = true;
              } else {
                samePage = false;
                $location.path(headers()['x-wembli-location']);
              }
            }

            if(samePage) {
              return angular.element('#frame' + $rootScope.currentFrame).html($compile(data)($rootScope));
            }

            //what frame to go to:
            var nextFrameID = ($rootScope.currentFrame === 1) ? 2 : 1;

            console.log('next frame'+nextFrameID);

            //compile the page we just fetched and link the scope
            angular.element('#frame' + nextFrameID).html($compile(data)($rootScope));

            //find out what direction to go to we sliding in this element
            var direction = 1; //default to go to the right

            //split location path on '/' to get the right framesMap key
            var nextPath = '/'+$location.path().split('/')[1];
            console.log('next path is: '+nextPath);
            console.log(footer.framesMap[nextPath]);
            //if footer.framesMap[$location.path()] (where they are going) is undefined
            //then don't move the arrow and slide to the right
            //if footer.framesMap[$rootScope.currentPath] (where they are coming from) is undefined
            //then move the arrow, but still slide to the right
            console.log('currentpath: '+$rootScope.currentPath);
            if(typeof footer.framesMap[$rootScope.currentPath] == "undefined") {
              if(typeof footer.framesMap[footer.currentPath] !== "undefined") {
                //direction depends on where the arrow is compared to where they are going
                var currNavIndex = footer.framesMap[footer.currentPath];
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

            //do the animations
            sequence.goTo(nextFrameID, direction);

            //update the currentPath and the currentFrame
            $rootScope.currentPath = $location.path();
            $rootScope.currentFrame = nextFrameID;
          }).error(function() {
            console.log('error getting: ' + url);
          });
        });
      };
    }
  };
}]).directive('appVersion', ['version', function(version) {
  return function(scope, elm, attrs) {
    elm.text(version);
  };
}]).directive('dropdown', function() {
  return function(scope, elm, attrs) {
    $(elm).dropdown();
  };
});
