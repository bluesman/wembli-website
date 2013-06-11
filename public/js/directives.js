'use strict';

/* Directives */
angular.module('wembliApp.directives', []).

/*
  trigger partial - kind of a hack - but basically sets rootScope bool to let everyone know that
  the original page has loaded and partials will be loaded from now on
*/
directive('triggerPartial', ['$rootScope',
  function($rootScope) {
    return {
      restrict: 'C',
      link: function(scope, element, attr) {
        $rootScope.partial = true;
      }
    }
  }
]).

/* set selected class when clicked */
directive('toggleSelected', [
  function() {
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
  }
]).

/*
 * Generic Directives
 */
directive('multiselect', [
  function() {
    return {
      restrict: 'C',
      compile: function(element, attr, transculde) {
        return function(scope, element, attr, controller) {
          var header = attr.header === "false" ? false : true;
          console.log('noneselectedtext');
          console.log(attr.noneSelectedText)

          var ms = element.multiselect({
            appendTo: attr.appendTo,
            position: {
              my: "left top",
              at: "left bottom"
            },
            header: header,
            noneSelectedText: attr.noneSelectedText,
            minWidth: attr.minWidth
          });

          attr.$observe('ngModel', function(m) {
            var opts = scope.$eval(m);
            if (typeof opts !== "undefined") {
              console.log(opts);
              for (var i = 0; i < opts.length; i++) {
                element.multiselect("widget").find(":checkbox[value='" + opts[i] + "']").attr("checked", "checked");
                $("#" + attr.id + " option[value='" + opts[i] + "']").attr("selected", 1);
                console.log('setting option:' + opts[i]);
              };
              element.multiselect("refresh");
            }
          });

          attr.$observe('disable', function(disable) {
            console.log('disable is: ' + attr.disable);
            if (attr.disable === "true") {
              ms.multiselect("disable");
            }
          });

          attr.$observe('click', function() {
            var clickFn = scope.$eval(attr.click);
            console.log('clickFn:');
            console.log(clickFn);
            if (typeof clickFn !== "undefined") {
              console.log('setting up click event for multiselect');
              element.on('multiselectclick', function(event, ui) {
                scope.$apply(function() {
                  clickFn.call(clickFn, event, ui, scope, element, attr);
                });
              });
            }
          });

        };
      }
    };
  }
]).

/* Log feed activity:
 * Class directive
 * foo.log-activity(action="",meta="")
 */
directive('logActivity', ['wembliRpc',
  function(wembliRpc) {
    return {
      restrict: 'C',
      compile: function(element, attr, transclude) {
        element.click(function() {
          //get the tix and make the ticket list
          wembliRpc.fetch('feed.logActivity', {
            action: attr.action,
            meta: attr.meta || {}
          }, function(err, result) {});
        });
      }
    }
  }
]).

/* Log keen.io event:
 * Class directive
 * foo.log-event(collection="",event="click")
 */
directive('addEvent', ['wembliRpc',
  function(wembliRpc) {
    return {
      restrict: 'C',
      compile: function(element, attr, transclude) {
        var events = {
          'click': function() {
            element.click(function() {
              //get the tix and make the ticket list
              wembliRpc.fetch('analytics.addEvent', attr, function(err, result) {});
            });
          },
        };
        events[attr.event]();
      }
    }
  }
]).

/*
 * Display a twitter bootstrap popover
 * Class Directive
 *
 * foo.display-popover(placement="",trigger="",animation="",title="",content="")
 *
 * popover is not created until content attribute is $observed
 */
directive('displayPopover', [
  function() {
    return {
      restrict: 'C',
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          attr.$observe('content', function() {
            element.popover({
              placement: attr.placement,
              trigger: attr.trigger,
              animation: (attr.animation === 'true') ? true : false,
              title: attr.title,
              content: attr.content
            });
          });
        }
      }
    }
  }
]).

/*
 * Fade an element in/out
 * Class Directive
 *
 * foo.fade-in() - not used?
 */
/*
directive('fadeIn', function() {
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
}).
*/

/*
 * Call a function defined in the scope on key up
 * Class Directive
 *
 * foo.on-keyup(onKeyup="handleKeyup")
 *
 * Where:
 * scope.handleKeyup = function(scope, element, attrs, event) { }
 *
 */
directive('onKeyup', function() {
  return function(scope, elm, attrs) {
    //Evaluate the variable that was passed
    //In this case we're just passing a variable that points
    //to a function we'll call each keyup
    elm.bind('keyup', function(evt) {
      console.log(attrs.onKeyup);
      var keyupFn = scope.$eval(attrs.onKeyup);
      console.log('keyup');
      console.log(keyupFn);
      //$apply makes sure that angular knows
      //we're changing something
      scope.$apply(function() {
        keyupFn.call(keyupFn, scope, elm, attrs, evt);
      });
    });
  };
}).

/*
 * Call a function defined in the scope on key down
 * Class Directive (see onKeyup)
 */
directive('onKeydown', function() {
  return function(scope, elm, attrs) {
    //Evaluate the variable that was passed
    //In this case we're just passing a variable that points
    //to a function we'll call each keyup
    elm.bind('keydown', function(evt) {
      var e = evt;
      console.log('keydown');
      console.log(attrs.onKeydown);
      console.log(e);
      var keydownFn = scope.$eval(attrs.onKeydown);

      console.log(keydownFn);
      //$apply makes sure that angular knows
      //we're changing something
      scope.$apply(function() {
        console.log('calling keydown func');
        keydownFn.call(keydownFn, scope, elm, attrs, e);
      });
    });
  };
}).

/*
 * JQuery dropdown functionality
 * Class Directive - not really sure what this is...
 */
directive('dropdown', function() {
  return function(scope, elm, attrs) {
    $(elm).dropdown();
  };
}).

/*
 * Focus a form element when it is clicked.
 * Class Directive
 *
 * This is a bit of a hack - sometimes other form elements/directives steal the focus.
 * When this element is clicked, this directive will loop until focus is back on the element
 */
directive('focusOnClick', ['$timeout',
  function($timeout) {
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
  }
]).

/*
directive('friendTweetButton', ['$window','wembliRpc',function($window,wembliRpc) {
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
}]).
*/

/*
 * Cause a Google Map Marker to bounce when this element is mouseover
 * Class Directive
 *
 * foo.bounce-map-marker(lat="",lng="")
 *
 * on mouseover, find a marker on the map matching the attr lat & lon and set the animation to bounce
 * on mouseleave, find the marker matching attr.lat/lng and make the animation stop
 */
directive('bounceMapMarker', ['plan', 'googleMap',
  function(plan, googleMap) {
    return {
      restrict: 'C',
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          element.mouseleave(function() {
            console.log('stop bouncing marker');
            var marker = googleMap.findMarker(attr.lat, attr.lng);
            marker.setAnimation(null);
          });
          element.mouseover(function() {
            console.log('bounce marker');
            console.log(attr.lat);
            console.log(attr.lng);
            var marker = googleMap.findMarker(attr.lat, attr.lng);
            console.log('found marker');
            console.log(marker);
            marker.setAnimation(google.maps.Animation.BOUNCE);
          });
        }
      }
    }
  }
]).

/*
 * Using GoogleMaps instead
directive('leafletMap', ['plan',
  function(plan) {
    return {
      restrict: 'C',
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          plan.get(function(p) {
            var initLeaflet = function() {
              console.log('init leaflet!');
              var $el = element[0];
              var map = new L.Map($el, {
                zoom: attr.zoom
              });

              L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19
              }).addTo(map);


              //var googleLayer = new L.Google('ROADMAP');
              //map.addLayer(googleLayer);
              var point = new L.LatLng(attr.lat, attr.lon);
              map.setView(point, attr.zoom);

              var venueIcon = new L.Icon.Default();
              var marker = new L.marker([attr.lat, attr.lon], {
                icon: venueIcon
              });
              marker.bindPopup(p.event.eventVenue);
              console.log('adding marker to map');
              console.log(marker);
              marker.addTo(map);
              marker.openPopup();
              scope.$watch('markers', function(markers) {
                if (typeof markers === "undefined") {
                  return;
                };
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
              scope.$on('sequence-afterNextFrameAnimatesIn', function() {
                initLeaflet();
              })
            }
          });
        };
      }
    };
  }
]).
 */

directive('eventData', ['$rootScope', '$filter', 'wembliRpc', 'plan', 'sequence',
  function($rootScope, $filter, wembliRpc, plan, sequence) {
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
            console.log("PLAN");
            console.log(plan);
            scope.event = plan.event;
            scope.venue = plan.venue["data"];
            console.log(scope.venue.Street1);
          });
          //});
        }
      }
    }
  }
]).

directive('notifyEmail', ['$rootScope', '$filter', 'wembliRpc', 'plan', 'sequence',
  function($rootScope, $filter, wembliRpc, plan, sequence) {
    return {
      restrict: 'C',
      cache: false,
      transclude: true,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          scope.emailCollected = false;
          scope.collectEmail = function() {
            console.log('collecting email: ' + angular.element('#email').val());
            scope.emailCollected = true;
          }
        }
      }
    }
  }
]).

/*
 * show the tickets summary info popover for search results
 */
directive('eventWrapper', ['wembliRpc', '$window',
  function(wembliRpc, $window) {
    return {
      restrict: 'C',
      controller: function($scope, $element, $attrs, $transclude) {},
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
  }
]).

directive('twitterWidget', ['$window',
  function($window) {
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
  }
]).

directive('rsvpLoginModal', ['fetchModals', 'rsvpLoginModal',
  function(fetchModals, rsvpLoginModal) {
    return {
      restrict: 'EAC',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          rsvpLoginModal.set('guid', attr.guid);
          rsvpLoginModal.set('service', attr.service);
          rsvpLoginModal.set('serviceId', attr.serviceId);
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
  }
]).

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
  }
]).

directive('sendForgotPasswordEmail', ['wembliRpc',
  function(wembliRpc) {
    return {
      restrict: 'C',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          element.click(function(e) {
            var rpcArgs = {};
            attr.$observe('email', function() {
              rpcArgs.email = attr.email;
              if (attr.next) {
                rpcArgs.next = attr.next;
              }

              wembliRpc.fetch('customer.sendForgotPasswordEmail', rpcArgs, function(err, result) {
                console.log(result);
                /* display an email sent message */
                scope.forgotPasswordEmailSent = true;
                scope.$broadcast('forgot-password-email-sent');
              },
              /* transformRequest */function(data, headersGetter) {
                scope.accountExists = false; //will this work?
                scope.signupSpinner = true;
                return data;
              },

              /* transformResponse */function(data, headersGetter) {
                scope.signupSpinner = false;
                return JSON.parse(data);
              });
            });
          });
        };
      }
    }
  }
]).

directive('startPlan', ['$rootScope', 'fetchModals',
  function($rootScope, fetchModals) {
    return {
      restrict: 'C',
      compile: function(element, attr, transclude) {
        fetchModals.fetch('/partials/payment-type');

        return function(scope, element, attr) {
          element.click(function() {
            console.log('clicked event attr:');
            console.log(attr);
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
  }
]).

//directive to cause link click to go to next frame rather than fetch a new page
directive('wembliSequenceLink', ['$rootScope', '$window', '$templateCache', '$timeout', '$location', '$http', '$compile', 'footer', 'sequence', 'fetchModals', 'plan', 'wembliRpc',
  function($rootScope, $window, $templateCache, $timeout, $location, $http, $compile, footer, sequence, fetchModals, plan, wembliRpc) {

    return {
      restrict: 'EAC',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          element.click(function(e) {
            e.preventDefault();

            /* interactive-venue-map seems to disrespect template no-cache */
            $templateCache.removeAll();

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

                /* log this click in keen.io */
                wembliRpc.fetch('analytics.addEvent', {collection: 'view', url: $location.absUrl(), direction: direction, frame: nextFrameID}, function(err, result) {});

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
  }
]).

directive('appVersion', ['version',
  function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }
]);
