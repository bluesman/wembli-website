'use strict';

/* Directives */
angular.module('wembliApp.directives', []).

/*
 * Generic Directives
 *
 */

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

/* multiselect: http://www.erichynds.com/blog/jquery-ui-multiselect-widget */
directive('multiselect', [
  function() {
    return {
      restrict: 'C',
      compile: function(element, attr, transculde) {
        return function(scope, element, attr, controller) {
          var header = attr.header === "false" ? false : true;

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
              for (var i = 0; i < opts.length; i++) {
                element.multiselect("widget").find(":checkbox[value='" + opts[i] + "']").attr("checked", "checked");
                $("#" + attr.id + " option[value='" + opts[i] + "']").attr("selected", 1);
              };
              element.multiselect("refresh");
            }
          });

          scope.$watch(attr.enable, function(newVal) {
            if (typeof newVal !== "undefined") {
              if (newVal) {
                ms.multiselect("enable");
              } else {
                ms.multiselect("disable");
              }
            }
          });

          attr.$observe('click', function() {
            var clickFn = scope.$eval(attr.click);
            if (typeof clickFn !== "undefined") {
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

directive('formatPhoneNumber', [
  function() {
    return {
      restrict: 'C',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          element.bind('keydown', function(evt) {
            if (document.activeElement.name === 'phoneNumber') {
              if (evt.keyCode != 8 &&
                evt.keyCode != 9 &&
                (evt.keyCode < 48 ||
                  evt.keyCode > 57)) {
                /* cancel the event */
                evt.preventDefault();
              }
            }
          });
        };
      }
    }
  }
]).

directive('formatPostalCode', [
  function() {
    return {
      restrict: 'C',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          element.bind('keydown', function(evt) {
            if (document.activeElement.name === 'postalCode') {
              if (evt.keyCode != 8 &&
                evt.keyCode != 9 &&
                evt.keyCode != 173 &&
                (evt.keyCode < 48 ||
                  evt.keyCode > 57)) {
                /* cancel the event */
                evt.preventDefault();
              }
            }
          });
        };
      }
    }
  }
]).

/* might need to get rid of this */
directive('loadingModal', [
  function() {
    return {
      restrict: 'E',
      controller: ['$scope', '$element', '$attrs', '$transclude', 'loadingModal',
        function($scope, $element, $attrs, $transclude, loadingModal) {
          $scope.loadingModal = {};
          $scope.$on('loading-modal-show', function() {
            $scope.loadingModal.title = loadingModal.title;
            $scope.loadingModal.body = loadingModal.body;
          });
        }
      ],
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
 * Display a twitter bootstrap nver
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
          var content = '';
          var contentId = '';
          if (("contentId" in attr)) {
            attr.$observe('contentId', function(c) {
              if (typeof c === "undefined") {
                return;
              }
              if (contentId === c) {
                return;
              }
              contentId = c;
              element.popover({
                placement: attr.placement,
                trigger: attr.trigger,
                animation: (attr.animation === 'true') ? true : false,
                title: attr.title,
                content: function() {
                  return $('#' + contentId).html()
                },
                html: (attr.html === 'true') ? true : false
              });
            });

          } else {
            attr.$observe('content', function(c) {
              if (content === c) {
                return;
              }
              content = c;
              element.popover({
                placement: attr.placement,
                trigger: attr.trigger,
                animation: (attr.animation === 'true') ? true : false,
                title: attr.title,
                content: attr.content,
                html: (attr.html === 'true') ? true : false
              });
            });

          }
        }
      }
    }
  }
]).

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
      var keyupFn = scope.$eval(attrs.onKeyup);
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
      var keydownFn = scope.$eval(attrs.onKeydown);

      //$apply makes sure that angular knows
      //we're changing something
      scope.$apply(function() {
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
            var marker = googleMap.findMarker(attr.lat, attr.lng);
            if (marker) {
              marker.setAnimation(null);
            }
          });
          element.mouseover(function() {
            var marker = googleMap.findMarker(attr.lat, attr.lng);
            if (marker) {
              marker.setAnimation(google.maps.Animation.BOUNCE);
            }
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

directive('carousel', [
  function() {
    return {
      restrict: 'C',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          $('#carousel').carousel({
            interval: 5000,
            pause: "hover"
          });
        }
      }
    }
  }
]).


directive('eventData', ['$rootScope', '$filter', 'wembliRpc', 'plan',
  function($rootScope, $filter, wembliRpc, plan) {
    return {
      restrict: 'C',
      templateUrl: '/partials/event-data',
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          plan.get(function(plan) {
            scope.event = plan.event;
            scope.venue = plan.venue["data"];
          });
        }
      }
    }
  }
]).

/* store customer info when we don't have what they ar elooking for */
directive('notifyEmail', ['$rootScope', '$filter', 'wembliRpc', 'plan', 'sequence',
  function($rootScope, $filter, wembliRpc, plan, sequence) {
    return {
      restrict: 'C',
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          scope.emailCollected = false;
          scope.notifyEmail = '';

          scope.collectEmail = function() {
            wembliRpc.fetch('customer.notify', {
              addOn: attr.addOn,
              email: scope.notifyEmail
            }, function(err, result) {

            });
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
      controller: ['$scope', '$element', '$attrs', '$transclude',
        function($scope, $element, $attrs, $transclude) {}
      ],
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          element.mouseleave(function() {
            var elId = (typeof element.parents('li').attr('id') == "undefined") ? element.attr('id') : element.parents('li').attr('id');
            $(".event-wrapper").popover("hide");
          });

          element.mouseover(function() {
            var elId = (typeof element.parents('li').attr('id') == "undefined") ? element.attr('id') : element.parents('li').attr('id');

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
                    summaryContent = (result.ticketPricingInfo.ticketsAvailable === "1") ? result.ticketPricingInfo.ticketsAvailable + " ticket choice" : result.ticketPricingInfo.ticketsAvailable + " ticket choices";
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

/* twitter */
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

/* this is when people click an rsvp link */
directive('rsvpLoginModal', ['fetchModals', 'rsvpLoginModal',
  function(fetchModals, rsvpLoginModal) {
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
          fetchModals.fetch('/partials/modals/rsvp-login', function() {
            $('#rsvp-login-modal').modal("show");
          });
        };
      }
    };
  }
]).

directive('sendConfirmationEmail', ['wembliRpc',
  function(wembliRpc) {
    return {
      restrict: 'C',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          scope.confirmationEmailSent = false;
          scope.confirmationEmailInProgress = false;

          attr.$observe('next', function() {
            element.click(function(e) {
              scope.confirmationEmailInProgress = true;
              var rpcArgs = {};
              if (attr.next) {
                rpcArgs.next = attr.next;
              }
              wembliRpc.fetch('customer.sendConfirmationEmail', rpcArgs, function(err, result) {
                /* display an email sent message */
                scope.confirmationEmailSent = true;
                scope.confirmationEmailInProgress = false;
                scope.$broadcast('confirmation-email-sent');
              });
            });
          });
        };
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
          attr.$observe('email', function(email) {
            element.click(function(e) {
              var rpcArgs = {};
              rpcArgs.email = attr.email;

              if (attr.next) {
                rpcArgs.next = attr.next;
              }
              wembliRpc.fetch('customer.sendForgotPasswordEmail', rpcArgs, function(err, result) {
                  /* display an email sent message */
                  scope.forgotPasswordEmailSent = true;
                  if (err) {
                    scope.$broadcast('forgot-password-email-sent', err);
                  }
                  if (result.error === true) {
                    scope.$broadcast('forgot-password-email-sent', {
                      error: true
                    });
                  } else {
                    scope.$broadcast('forgot-password-email-sent');
                  }
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
          });
        };
      }
    }
  }
]).

directive('preventDefault', [
  function() {
    return {
      restrict: 'C',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          element.click(function(event) {
            event.preventDefault();
            event.stopPropagation();
          });
        }
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
            var nextLink = '';
            if (attr.href) {
              nextLink = attr.href;
            } else {
              nextLink = element.find('.next-link').attr('href');
            }
            $rootScope.$broadcast('payment-type-modal-clicked', {
              nextLink: nextLink,
              name: attr.name,
              eventId: attr.eventId,
              eventName: attr.eventName
            });
            /* show the popup to collect payment type */
            $('#payment-type-modal').modal('show');
          });
        }
      }
    }
  }
]).

/* index */
directive('highSalesPerformers', ['wembliRpc',
  function(wembliRpc) {
    return {
      restrict: 'E',
      compile: function(element, attr, transclude) {
        var lookup = {
          1: 'sports',
          2: 'concert',
          3: 'theater'
        };
        return function(scope, element, attr) {
          //get the tix and make the ticket list
          wembliRpc.fetch('index.getHighSalesPerformers', {
            parentCategoryID: attr.parentCategoryId,
            numReturned: attr.numReturned
          }, function(err, result) {
            var key = lookup[attr.parentCategoryId] + 'Performers';
            scope[key] = result.performers;
          });
        }
      }
    }
  }
]).

directive('showEllipses', [
  function() {
    return {
      restrict: 'C',
      compile: function(element, attr, transclude) {
        return function(scope, elm, attrs) {
          var shorten = function(t) {
            if (t.length > attrs.characters) {
              var shortened = t.substr(attrs.start, attrs.characters);
              var shortened = shortened + '...';
              elm.text(shortened);
            }
          };
          if (attrs.interpolate) {
            attrs.$observe('text', function() {
              shorten(attrs.text);
            });
          } else {
            shorten(elm.text());
          }
        };
      }
    };
  }
]).

/* hide an element with id specified s an attr when this element is clicked */
directive('wembliHide', [
  function() {
    return {
      restrict: 'EAC',
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {
          element.click(function(e) {
            angular.element(attr.wembliHide).hide();
          });
        }
      }
    }
  }
]).

directive('appVersion', ['version',
  function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }
]);
