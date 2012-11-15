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

.directive('interactiveVenueMap', ['wembliRpc', function(wembliRpc) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: "/partials/interactive-venue-map",
    compile: function(element, attr, transclude) {
      console.log('compile func');
      //return linking function
      return function(scope, element, attr) {
        $('#refresh').click(function(e) {
          e.preventDefault();
          console.log('refreshing map');
          $('#map-container').tuMap("Refresh", "Reset");
        });

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
          console.log('map for: '+scope.event.VenueConfigurationID);
          console.log('updating tickets');
          scope.event = result.event;
          scope.tickets = result.tickets;
          //$scope.$broadcast('TicketsCtrl-ticketsLoaded',{});
          $('#map-container').tuMap({
            ServiceUrl: "https://imap.ticketutils.com",
            //MapId:"05f64774-adfc-4950-a892-2cff9b5f8f92", //qualcomm
            MapId: scope.event.VenueConfigurationID,
            MapSet: "tn",
            ColorScheme: 1,
            AutoSwitchToStatic: true,
            ControlsPosition: "Outside",
            //FailOverMapUrl:$('#failOverMapUrl').val(), //set this to tn mapUrl
            ZoomLevel: 2,
            GroupsContainer: "#groups-container",
            RowSelector: ".ticketRow",
            SectionSelector: ".ticketSection",
            PriceSelector: ".ticketPrice",
            QuantitySelector: ".ticketQuantity",
            eTicketSelector: ".eTicket",

            OnMouseover: function(e, Section) {
              console.log(Section);
              if(Section.Active) {
                console.log("Section " + Section.Name + " in Group " + Section.Group.Name);
              } else {
                console.log('no tickets');
              }
            },

            OnMouseout: function(e, Section) {
              if(Section.Active) {
                console.log("Section " + Section.Name + " in Group " + Section.Group.Name);
              }
            },

            OnClick: function(e, Section) {
              if(Section.Active && Section.Selected) {
                console.log("Selected Section " + Section.Name + " in Group " + Section.Group.Name);
              }
            },

            OnControlClick: function(e, Data) {
              if(Section.Selected) {
                console.log("Selected Button " + Data.Name);
              }
            },

            OnGroupClick: function(e, Group) {
              if(Group.Selected) {
                console.log("Selected Group " + Group.Name);
              }
            },

            OnTicketSelected: function(e, Ticket) {
              console.log("TicketId:" + Ticket.Id + ", Quantity:" + Ticket.Quantity);
            },

            OnReset: function(e) {
              //Write Code Here
              console.log('they want to reset');
            },
          });

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

.directive('eventData', ['$filter', 'wembliRpc', function($filter, wembliRpc) {
  return {
    restrict: 'C',
    templateUrl: '/partials/includes/event/hero',
    scope: {
      eventId: '@eventId',
    },
    compile: function(element, attr, transclude) {

      return function(scope, element, attr) {
        //fetch the event data
        var args = {
          "eventID": element.attr('event-id')
        };

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

            //compile the page we just fetched and link the scope
            angular.element('#frame' + nextFrameID).html($compile(data)($rootScope));

            //find out what direction to go to we sliding in this element
            var direction = 1; //default to go to the right
            //if footer.framesMap[$location.path()] (where they are going) is undefined
            //then don't move the arrow and slide to the right
            //if footer.framesMap[$rootScope.currentPath] (where they are coming from) is undefined
            //then move the arrow, but still slide to the right
            if(typeof footer.framesMap[$rootScope.currentPath] == "undefined") {
              if(typeof footer.framesMap[footer.currentPath] !== "undefined") {
                //direction depends on where the arrow is compared to where they are going
                var currNavIndex = footer.framesMap[footer.currentPath];
                var nextNavIndex = footer.framesMap[$location.path()];
                direction = (currNavIndex < nextNavIndex) ? 1 : -1;
              }
              footer.slideNavArrow();
            }

            //if both are defined
            //then move the arrow and figure out which way to slide
            if((typeof footer.framesMap[$location.path()] !== "undefined") && (typeof footer.framesMap[$rootScope.currentPath] !== "undefined")) {
              var currNavIndex = footer.framesMap[$rootScope.currentPath];
              var nextNavIndex = footer.framesMap[$location.path()];
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
