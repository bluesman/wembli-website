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

  .directive('toggleSelected', [function() {
  return {
    restrict: 'C',
    link: function(scope, element, attr) {
      $(document).click(function() {
        element.removeClass('selected');
      });
      element.click(function() {
        if (element.hasClass('selected')) {
          element.removeClass('selected');
        } else {
          element.addClass('selected');
        }
      })
    }
  }
}])

  .directive('dashboard', ['customer', 'fetchModals', '$rootScope', 'wembliRpc', function(customer, fetchModals, $rootScope, wembliRpc) {
  return {
    restrict: 'E',
    replace: true,
    cache: false,
    templateUrl: "/partials/dashboard-app",
    controller: function($scope, $element, $attrs, $transclude) {
      console.log('init controller in dashboard');

    },
    compile: function(element, attr, transclude) {
      return function(scope, element, attr, controller) {
        console.log('dashboard linking');
        /* show the generic loading modal */
        $rootScope.genericLoadingModal.header = 'Fetching Your Plans...';
        $('#page-loading-modal').modal("hide");
        console.log('show generic modal');
        $('#generic-loading-modal').modal("show");

        fetchModals.fetch('/partials/modals/dashboard', function() {
          console.log('fetched dashboard modals');

          var args = {

          };

          wembliRpc.fetch('dashboard.init', args,

          function(err, result) {
            if (err) {
              alert('error happened - contact help@wembli.com');
              return;
            }

            var c = result.customer;
            scope.welcomeMessage = "Welcome, " + c.firstName + '!';

            console.log(result);
            $rootScope.$broadcast('dashboard-fetched', result);
          });
        });
      };
    },
  }
}])



.directive('dashboardModal', ['customer', 'wembliRpc', function(customer, wembliRpc) {
  return {
    restrict: 'C',
    replace: false,
    cache: false,
    controller: function($scope, $element, $attrs, $transclude) {
      console.log('init dashboard modal controller');
      $scope.$on('dashboard-fetched', function(e, args) {
        $scope.dashboard = {};
        $scope.dashboard.organizer = args.organizer;
        $scope.dashboard.archived = args.archived;
        $scope.dashboard.invited = args.invited;
        $scope.dashboard.friends = args.friends;

        console.log('plans-fetched');
        console.log($scope.dashboard);
        $('#generic-loading-modal').modal("hide");

      });

    },
    compile: function(element, attr, transclude) {
      return function(scope, element, attr, controller) {
        console.log('dashboard modal linking');
      };
    }
  }
}])

  .directive('planNav', ['$location', function($location) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: "/partials/plan/nav",
    compile: function(element, attr, transclude) {
      return function(scope, element, attr, controller) {
        var elId = '#' + element.attr('id').split('-')[1];

        /* this had to wait for dashboard to load */
        var sectionNumber = 1;

        /* scroll down to the section denoted by hash */
        if ($location.hash()) {
          var h = $location.hash();
          sectionNumber = parseInt(h.charAt(h.length - 1));
          console.log('scroll down to '+sectionNumber);
        }

        /* get the heights of all the sections */
        var height = 0;
        for (var i = 1; i < sectionNumber; i++) {
          height += parseInt($('#section' + i).height()) + 20;
          console.log('height after section' + i + ' ' + height);
        };

        $('#content').animate({
          scrollTop: height
        });
        $('.plan-section-nav').removeClass('active');
        $('#nav-section' + (sectionNumber)).addClass('active');
      };
    }
  }
}])

.directive('scrollTo', ['$window', function($window) {
  return {
    restrict: 'EAC',
    cache: false,
    compile: function(element, attr, transclude) {
      return function(scope, element, attr, controller) {
        element.click(function() {
          var elId = '#' + element.attr('id').split('-')[1];
          var sectionNumber = parseInt(elId.charAt(elId.length - 1));
          /* get the heights of all the sections */
          var height = 20;
          for (var i = 1; i < sectionNumber; i++) {
            height += parseInt($('#section' + i).height());
            console.log('height after section' + i + ' ' + height);
          };

          //console.log('scroll to: ' + elId + ' - ' + height);
          $('#content').animate({
            scrollTop: height
          });
        });
      };
    }
  }
}])


.directive('planDashboard', ['$window','plan','customer', function($window, plan, customer) {
  return {
    restrict: 'E',
    replace: true,
    cache: false,
    templateUrl: "/partials/plan/dashboard",
    compile: function(element, attr, transclude) {
      return function(scope, element, attr, controller) {
        console.log('window height');
        console.log(angular.element($window).height());
        var height = angular.element($window).height();
        $('#section6').css('min-height', height);

        /* init some scope */
        scope.ticketCount = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
        scope.rsvpTickets = 1;
        scope.changeRsvpStatus = false;

        scope.plan = plan.get();
        if (typeof plan.getFriends() !== "undefined") {
          scope.friends   = plan.getFriends();
          /* get the friend that is this customer */
          for (var i = 0; i < scope.friends.length; i++) {
            if (scope.friends[i].customerId === customer.get().id) {
              scope.me = scope.friends[i];
              break;
            }
          };
        }

        if (typeof plan.getOrganizer() !== "undefined") {
          scope.organizer = plan.getOrganizer();
        }

        /* handle the main plan rsvp */
        scope.submitRsvp = function(rsvpFor,rsvp) {
          var funcs = {
            'tickets' : function(rsvp) {
              /* get tickets rsvp data from the scope */
              var a = {rsvp:rsvp};
              if (rsvp === 'yes') {
                a.headCount = scope.rsvpTickets;
              }
              plan.submitRsvp(rsvpFor,a,function(err,result) {
                scope.changeRsvpStatus = false;
                scope.me = result.friend;

              });
            }
          };
          funcs[rsvpFor](rsvp);
        }
      };
    }
  }
}])

.directive('inviteFriendsWizard', ['fetchModals', 'plan', '$location', function(fetchModals, plan, $location) {
  return {
    restrict: 'C',
    compile: function(element, attr, transclude) {
      return function(scope, element, attr, controller) {
        fetchModals.fetch('/partials/invite-friends-wizard', function() {
          console.log('fetched invite friends wizard in directive');
          plan.get(function(plan) {

            var startDate = new Date();
            var endDate = new Date(plan.event.eventDate);
            var defaultDate = endDate;
            /* if there's an rsvp date, set it in the datepicker */
            if (typeof plan.rsvpDate !== "undefined") {
              /* init the date picker */
              console.log('init datepicker with plan rsvpdate:');
              console.log(plan.rsvpDate);
              var defaultDate = new Date(plan.rsvpDate);
            }

            $('.datepicker').pikaday({
              bound: false,
              minDate: startDate,
              maxDate: endDate,
              defaultDate: defaultDate,
              setDefaultDate: true,
              onSelect: function() {
                plan.rsvpDate = this.getDate();
                wembliRpc.fetch('invite-friends.submit-step2', {
                  rsvpDate: plan.rsvpDate
                }, function(err, res) {
                  console.log('changed rsvpdate');
                  console.log(res);
                });
              }
            });

            console.log('location path is:');
            console.log($location.path());

            var options = {
              'backdrop': 'static',
              'keyboard': false,
            };

            if ($location.path() === '/invitation') {
              $('#invitation-modal').modal(options);
            }

            /* click the button shows the modal */
            element.click(function() {
              options.backdrop = true;
              options.keyboard = true;
              console.log(options);
              $('#invitation-modal').modal(options);
            });

          });
        });
      };
    }
  }
}])



  .directive('planSection', ['$window', function($window) {
  return {
    restrict: 'EAC',
    replace: true,
    cache: false,
    compile: function(element, attr, transclude) {
      return function(scope, element, attr, controller) {


        angular.element('#content').on('scroll', function() {
          scope.$apply(function() {
            if (element.offset().top <= 0 && element.offset().top > -element.height()) {
              if ($('.plan-section-nav').hasClass('active')) {
                $('.plan-section-nav').removeClass('active');
              }
              $('#nav-' + element.attr('id')).addClass('active');
            }
          });
        });
      };
    }
  }
}])


  .directive('planFeed', [function() {
  return {
    restrict: 'E',
    replace: true,
    cache: false,
    templateUrl: "/partials/plan/feed",
    compile: function(element, attr, transclude) {
      return function(scope, element, attr, controller) {

      };
    }
  }
}])


  .directive('activityFeed', [function() {
  return {
    restrict: 'E',
    replace: true,
    cache: false,
    templateUrl: "/partials/activity-feed",
    compile: function(element, attr, transclude) {
      console.log('in dashboard');
    }
  }
}])

.directive('interactiveVenueMap', ['$rootScope', 'interactiveMapDefaults', 'wembliRpc', '$window', '$templateCache', 'plan', function($rootScope, interactiveMapDefaults, wembliRpc, $window, $templateCache, plan) {
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

.directive('parkingMap',['googleMap',function(googleMap) {
  return {
    restrict:'EC',
    cache:false,
    replace:true,
    compile: function(element, attr, transclude) {
      return function(scope, element, attr) {
        var mapTypeId = (attr.mapTypeId) ? google.maps.MapTypeId[attr.mapTypeId] : google.maps.MapTypeId.ROADMAP;

        /* draw the map */
        var mapOpts = {mapTypeId:mapTypeId};
        mapOpts.center = new google.maps.LatLng(attr.lat,attr.lng);
        googleMap.draw(element,mapOpts);
      };
    }
  };
}])

.directive('bounceMapMarker',['plan','googleMap',function(plan,googleMap) {

  return {
    restrict:'C',
    cache:false,
    compile: function(element, attr, transclude) {
      return function(scope, element, attr) {
        element.mouseleave(function() {
          console.log('stop bouncing marker');
          var marker = googleMap.findMarker(attr.lat,attr.lng);
          marker.setAnimation(null);
        });
        element.mouseover(function() {
          console.log('bounce marker');
          console.log(attr.lat);
          console.log(attr.lng);
          var marker = googleMap.findMarker(attr.lat,attr.lng);
          console.log('found marker');
          console.log(marker);
          marker.setAnimation(google.maps.Animation.BOUNCE);
        });
      }
    }
  }
}])
.directive('leafletMap',['plan',function(plan) {
  return {
    restrict:'C',
    cache:false,
    compile: function(element, attr, transclude) {
      return function(scope, element, attr) {
        plan.get(function(p) {
          var initLeaflet = function() {
            console.log('init leaflet!');
            var $el = element[0];
            var map = new L.Map($el, {zoom:attr.zoom});
            /* uncomment this to use openstreet map for map */
              L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

            /* uncomment this to use google maps layer */
            //var googleLayer = new L.Google('ROADMAP');
            //map.addLayer(googleLayer);
            var point = new L.LatLng(attr.lat, attr.lon);
            map.setView(point, attr.zoom);
            /* make a marker for the venue */
            var venueIcon = new L.Icon.Default();
            var marker = new L.marker([attr.lat,attr.lon],{icon:venueIcon});
            marker.bindPopup(p.event.eventVenue);
            console.log('adding marker to map');
            console.log(marker);
            marker.addTo(map);
            marker.openPopup();
            scope.$watch('markers',function(markers) {
              if (typeof markers === "undefined") { return; };
              console.log('adding markers');
              console.log(markers);
              map.addLayer(markers);
            });

          };

          console.log(p.event);
          if (scope.sequenceCompleted) {
            console.log('sequence completed already');
            initLeaflet();
          } else {
            console.log('wait for sequence to complete');
            scope.$on('sequence-afterNextFrameAnimatesIn',function() {
              initLeaflet();
            })
          }
        });
      };
    }
  };
}])

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
    controller: function($scope, $element, $attrs, $transclude) {


    },
    compile: function(element, attr, transclude) {
      return function(scope, element, attr) {
        element.mouseleave(function() {
          var elId = (typeof element.parents('li').attr('id') == "undefined") ? element.attr('id') : element.parents('li').attr('id');
          $(".event-wrapper").popover("hide");
        });

        element.mouseover(function() {
          var elId = (typeof element.parents('li').attr('id') == "undefined") ? element.attr('id') : element.parents('li').attr('id');

          //console.log('mouseover happened');
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

  .directive('rsvpLoginModal', ['fetchModals', 'rsvpLoginModal', function(fetchModals, rsvpLoginModal) {
  return {
    restrict: 'EAC',
    compile: function(element, attr, transclude) {
      return function(scope, element, attr) {
        rsvpLoginModal.set('guid', attr.guid);
        rsvpLoginModal.set('service', attr.service);
        rsvpLoginModal.set('token', attr.token);
        rsvpLoginModal.set('friend', attr.friend);
        rsvpLoginModal.set('event', attr.event);
        rsvpLoginModal.set('confirmSocial', attr.confirmSocial);
        console.log(rsvpLoginModal.get('event'));
        fetchModals.fetch('/partials/modals/rsvp-login', function() {
          $('#rsvp-login-modal').modal("show");
        });
      };
    }
  };
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

          wembliRpc.fetch('customer.sendForgotPasswordEmail', {
            email: attr.email || scope.email
          }, function(err, result) {
            console.log(result);
            /* display an email sent message */
            scope.forgotPasswordEmailSent = true;
            scope.$broadcast('forgot-password-email-sent');
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
          $rootScope.sequenceCompleted = false;
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
              console.log('NEXT FRAME: ' + nextFrameID);

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
              console.log('GOTO FRAME');
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

  .directive('displayPopover', [function() {
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
