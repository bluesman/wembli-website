'use strict';

/* Directives */
angular.module('wembliApp.directives.invitationWizard', []).

directive('inviteFriendsWizard', ['$rootScope', '$http', '$filter', '$window', '$timeout', 'sequence', 'fetchModals', 'plan', '$location', 'wembliRpc', 'customer', 'facebook', 'twitter',
  function($rootScope, $http, $filter, $window, $timeout, sequence, fetchModals, plan, $location, wembliRpc, customer, facebook, twitter) {
    return {
      restrict: 'C',
      controller: function($scope, $element, $attrs, $transclude) {
        $scope.planFriends = [];

        $scope.selectedFriends = {
          'step3': {},
          'step4': {},
          'step5': {}
        }

        /* view methods */
        $scope.getEventDate = function() {
          if (plan.get()) {
            return plan.get().event.eventDate;
          }
        };

        $scope.gotoStep = function(step) {
          $scope.currentStep = 'nav-' + step;
          $scope.showStep = step;
        };

        $scope.skipStep = function(step) {
          var nextStep = 'step' + (parseInt(step.charAt(step.length - 1)) + 1);
          $scope.gotoStep(nextStep);
        };

        $scope.rsvpUninvited = function(friend) {
          if (typeof friend.rsvp === "undefined") {
            return true;
          }
          return false;
        };

        $scope.rsvpInvited = function(friend) {
          if (typeof friend.rsvp === "undefined") {
            return false;
          }
          return true;
        };

        $scope.rsvpDeclined = function(friend) {
          if (typeof friend.rsvp === "undefined") {
            return false;
          }
          return (friend.rsvp.decision === false) ? true : false;
        };

        $scope.rsvpAccepted = function(friend) {
          if (typeof friend.rsvp === "undefined") {
            return false;
          }
          return (friend.rsvp.decision === true) ? true : false;
        };

        $scope.rsvpUndecided = function(friend) {
          if (typeof friend.rsvp === "undefined") {
            return false;
          }
          return (friend.rsvp.decision === null) ? true : false;
        };

        $scope.finished = function() {
          $location.hash('');
          $location.path('/plan');
        };


        /* put the plan in the scope for the view */
        $scope.plan = plan.get();

        //display the modal if there's a plan
        if ($scope.plan && typeof $scope.plan.event.eventId === "undefined") {
          return;
        }

        /* figure out which step to go to */
        var initialStep = 'step1';
        $scope.step1 = {};
        if (customer.get() && Object.keys(customer.get()).length > 0) {
          var hash = $location.hash();
          initialStep = /^step/.test(hash) ? hash : 'step2';
          /* hack to deal with everyauth weirdness */
          if (initialStep === "_=_") {
            /* it means they logged in */
            initialStep = 'step2';
          }
          $scope.customer = customer.get();
        } else {
          $scope.customer = {};
          customer.set($scope.customer);
        }
        $scope.gotoStep(initialStep);

      },
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {};
      }
    }
  }
]).

directive('inviteFriendsWizardButton', [
  function() {
    return {
      restrict: 'EAC',
      replace: true,
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          /* click the button shows the modal */
          element.click(function() {
            var options = {
              'backdrop': true,
              'keyboard': true,
            };
            $('#invitation-modal').modal(options);
          });
        };
      }
    };
  }
]).

directive('pikaday', ['wembliRpc',
  function(wembliRpc) {
    return {
      restrict: 'EAC',
      replace: true,
      cache: false,
      compile: function(element, attr, transclude) {
        return function(scope, element, attr, controller) {
          var startDate = new Date();
          var endDate = new Date(scope.plan.event.eventDate);
          var defaultDate = endDate;
          /* if there's an rsvp date, set it in the datepicker */
          if (typeof scope.plan.rsvpDate !== "undefined") {
            /* init the date picker */
            var defaultDate = new Date(scope.plan.rsvpDate);
          }

          element.pikaday({
            bound: false,
            minDate: startDate,
            maxDate: endDate,
            defaultDate: defaultDate,
            setDefaultDate: true,
            onSelect: function() {
              scope.plan.rsvpDate = this.getDate();
              wembliRpc.fetch('invite-friends.submit-rsvp', {
                rsvpDate: scope.plan.rsvpDate
              }, function(err, res) {

              });
            }
          });
        };
      }
    };
  }
]).

directive('invitationWizardStep1', ['wembliRpc', '$window', 'customer',
  function(wembliRpc, $window, customer) {
    return {
      restrict: 'E',
      controller: function($scope, $element, $attrs, $transclude) {

        $scope.$on('forgot-password-email-sent', function() {
          $scope.forgotPasswordEmailSent = true;
        });

        $scope.initSignupForm = function() {
          $scope.next = '/invitation/' + $scope.plan.event.eventId + '/' + $scope.plan.event.eventName + '#step2'

          /* check if there's a customer already - if so just display the customer info */
          if ($scope.customer.email) {
            $scope.showSignupView = true;
          } else {
            $scope.showSignupForm = true;
          }
        };

        $scope.showForm = function(show, hide) {
          $scope[show] = true;
          $scope[hide] = false;
        }

        $scope.submitSignup = function() {
          if ($scope.signup.$valid) {
            $('#invitation-modal').modal('loading');

            var rpcArgs = {
              'firstName': $scope.customer.firstName,
              'lastName': $scope.customer.lastName,
              'email': $scope.customer.email,
              'next': $scope.next
            };

            wembliRpc.fetch('invite-friends.submit-signup', rpcArgs, function(err, result) {
              /* toggle loading */
              $('#invitation-modal').modal('loading');

              if (result.exists && !result.noPassword) {
                $scope.login.accountExists = true;
                return $scope.showForm('showLoginForm', 'showSignupForm');
              }

              if (result.noPassword) {
                return $scope.showForm('showLoginUnconfirmedForm', 'showSignupForm');
              }

              if (result.formError) {
                $scope.signup.formError = true;
                return;
              }
              $scope.customer = customer.get();
              $scope.signup.success = true;
              $scope.showForm('showSignupView', 'showSignupForm');
              return $scope.gotoStep('step2');

            });
          } else {
          }
        };

        $scope.submitLogin = function() {
          if ($scope.login.$valid) {
            $('#invitation-modal').modal('loading');

            var rpcArgs = {
              'email': $scope.customer.email,
              'password': $scope.customer.password,
            };

            wembliRpc.fetch('invite-friends.submit-login', rpcArgs, function(err, result) {
              /* toggle loading */
              $('#invitation-modal').modal('loading');

              if (result.noPassword) {
                return $scope.showForm('showLoginUnconfirmedForm', 'showLoginForm');
              }

              if (result.invalidCredentials) {
                $scope.login.invalidCredentials = true;
                return;
              }

              $scope.login.success = true;
              $scope.showForm('showSignupView', 'showLoginForm');
              return $scope.gotoStep('step2');

            });
          } else {
            console.log('form not valid');
          }
        };

        $scope.customer = customer.get();
      },
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {

        };
      }
    }
  }
]).

directive('invitationWizardStep2', ['wembliRpc', '$window',
  function(wembliRpc, $window) {
    return {
      restrict: 'E',
      controller: function($scope, $element, $attrs, $transclude) {

        $scope.submitRsvp = function() {
          if (!$scope.customer.email) {
            $scope.signup.noContinue = true;
            return $scope.gotoStep('step1');
          }

          $('#invitation-modal').modal('loading');

          var rpcArgs = {
            rsvpDate: $scope.plan.rsvpDate,
          };

          wembliRpc.fetch('invite-friends.submit-rsvp', rpcArgs, function(err, result) {
            /* toggle loading */
            $('#invitation-modal').modal('loading');

            /* If There's A No Cust Error Send Them Back To Step-1 With An Error */
            if (result.noCustomer) {
              $scope.signup.noContinue = true;
              return $scope.gotoStep('step1');
            }

            return $scope.gotoStep('step3');

          });
        };


      },
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {

        };
      }
    }
  }
]).

directive('invitationWizardStep3', ['wembliRpc', '$window', 'facebook', 'plan', '$http', '$rootScope',
  function(wembliRpc, $window, facebook, plan, $http, $rootScope) {
    return {
      restrict: 'E',
      controller: function($scope, $element, $attrs, $transclude) {

        $scope.handleFriendsFetch = function(response) {

          /* find all the facebook friends that are in the planFriends list and set some attributes */
          var mergePlanFriends = function(fbFriends, planFriends) {

            /* optimize this... */
            angular.forEach(fbFriends, function(ff) {
              var me = this;
              angular.forEach(planFriends, function(pf) {
                /* check if this plan friend is the facebook friend */
                if (pf.contactInfo.service === 'facebook' && (pf.contactInfo.serviceId == ff.id)) {
                  ff.inviteStatus = pf.inviteStatus;
                  ff.checked = pf.inviteStatus;
                  ff.rsvp = pf.rsvp;
                }
              });
            });

            /* update the scope to display the fbFriends list */
            $scope.$apply(function() {
              $scope.facebook.friends = fbFriends;
            });

          };

          /* get the friends in the plan (if any) to know who is already invited */
          var fbFriends = facebook.getFriends();
          $scope.planFriends = plan.getFriends();
          mergePlanFriends(fbFriends, $scope.planFriends);

        };

        /* load the scope with the profile data */
        $scope.handleProfileFetch = function(response) {

          if (typeof response != "undefined") {
            $scope.facebook.firstName = response.first_name;
            $scope.facebook.lastName = response.last_name;
            $scope.facebook.email = response.email;

            if (typeof $scope.customer !== "undefined") {
              if (typeof $scope.customer.firstName === "undefined") {
                $scope.customer.firstName = response.first_name;
              }
              if (typeof $scope.customer.lastName === "undefined") {
                $scope.customer.lastName = response.last_name;
              }
              if (typeof $scope.customer.email === "undefined") {
                $scope.customer.email = response.email;
              }
            }
          }
        };

        $scope.addFacebookFriend = function(friend, $event) {
          if ($event.target.localName !== 'input') {
            return;
          }

          var addFriendArgs = {
            name: friend.name,
            inviteStatus: false,
            imageUrl: 'https://graph.facebook.com/' + friend.id + '/picture',
            service: 'facebook',
            serviceId: friend.id
          };

          $('#invitation-modal').modal('loading');

          plan.addFriend(addFriendArgs, function(err, result) {
            $('#invitation-modal').modal('loading');

            /* If There's A No Cust Error Send Them Back To Step-1 With An Error */
            if (result.noCustomer) {
              $scope.signup.noContinue = true;
              return $scope.gotoStep('step1');
            }


            if ($event.currentTarget.control.checked) {
              /* display the feed dialog */
              facebook.feedDialog({
                guid: $scope.plan.guid,
                token: result.friend.inviteStatusConfirmation.token,
                to: result.friend.contactInfo.serviceId,
                eventName: $scope.plan.event.eventName,
                venue: $scope.plan.event.eventVenue,
                rsvpDate: $('#rsvp-date').val()
              }, function(response) {
                if (response === null) {
                  /* they hit cancel */
                  $scope.handleFriendsFetch();
                } else {
                  /* hit the callback to set the inviteStatus to true */
                  $http.get('/callback/facebook/rsvp/' + $scope.plan.guid + '/' + result.friend.inviteStatusConfirmation.token)
                    .success(function(data, status, headers, config) {
                    plan.fetch(function() {
                      $rootScope.$broadcast('plan-friends-changed', plan.getFriends());
                    });

                  });

                }
              });
            }
          });
        }

        $scope.facebook = {

          loginStatusLoaded: false,

          friendFilterKey: null,

          service: facebook
        }

        /* if getAuth is null then set a listener */
        if (facebook.getAuth() === null) {

          $scope.$on('facebook-login-status', function(e, args) {
            $scope.$apply(function() {
              $scope.facebook.loginStatusLoaded = true;
            });
            if (facebook.getAuth()) {
              facebook.api('/me', $scope.handleProfileFetch);
              facebook.api('/me/friends', $scope.handleFriendsFetch);
            }
          });

        } else {

          /* its already been loaded */
          $scope.facebook.loginStatusLoaded = true;
          if (facebook.getAuth()) {
            facebook.api('/me', $scope.handleProfileFetch);
            facebook.api('/me/friends', $scope.handleFriendsFetch);
          }
        }

        $scope.$on('facebook-login', function(e, args) {
          if (facebook.getAuth()) {
            facebook.api('/me', $scope.handleProfileFetch);
            /* they just completed facebook login - get the friends list */
            facebook.api('/me/friends', $scope.handleFriendsFetch);
          }
        });
      },
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {

        };
      }
    }
  }
]).

directive('invitationWizardStep4', ['wembliRpc', '$window', 'twitter', 'plan', '$http', '$rootScope', '$location', '$filter',
  function(wembliRpc, $window, twitter, plan, $http, $rootScope, $location, $filter) {
    return {
      restrict: 'E',
      controller: function($scope, $element, $attrs, $transclude) {

        $scope.handleSearchUsers = function() {

          var mergePlanFriends = function(twitFriends, planFriends) {
            /* optimize this... */
            angular.forEach(twitFriends, function(tf) {
              var me = this;
              angular.forEach(planFriends, function(pf) {
                if (pf.contactInfo.service === 'twitter' && (pf.contactInfo.serviceId == tf.id)) {
                  tf.inviteStatus = pf.inviteStatus;
                  tf.checked = pf.inviteStatus;
                  tf.rsvp = pf.rsvp;
                }
              });
            });
            $scope.twitter.spinner = false;
            $scope.twitter.friends = twitFriends;
          };

          /* get the friends in the plan (if any) to know who is already invited */
          var twitFriends = twitter.getFriends();
          $scope.planFriends = plan.getFriends();
          mergePlanFriends(twitFriends, $scope.planFriends);
        };

        $scope.addTwitterFriend = function(friend, $event) {
          var addFriendArgs = {
            name: friend.name,
            inviteStatus: false,
            imageUrl: friend.profile_image_url_https,
            service: 'twitter',
            serviceId: friend.id
          };

          $('#invitation-modal').modal('loading');
          /*
            initially add the friend to the plan with an inviteStatus of false
            once the post callback indicates a successful post, then we'll set invite status to true
          */
          plan.addFriend(addFriendArgs, function(err, result) {
            $('#invitation-modal').modal('loading');

            /* If There's A No Cust Error Send Them Back To Step-1 With An Error */
            if (result.noCustomer) {
              $scope.signup.noContinue = true;
              $('#invitation-modal').modal('loading');
              return $scope.gotoStep('step1');
            }

            $scope.twitter.token = result.friend.inviteStatusConfirmation.token;

            /* display the tweet dialog box */
            $('#modal-' + friend.screen_name).modal("show");
            /* reset the tweet form data */
            var rsvpUrl = 'http://' + $location.host() + '/rsvp/' + $scope.plan.guid + '/' + $scope.twitter.token + '/twitter';
            $scope.twitter.messageText = '@' + friend.screen_name + ' You are invited to an outing I am planning with @wembli | RSVP By ' + $filter('date')($scope.plan.rsvpDate, 'M/d/yy') + ' | ' + rsvpUrl;
            $scope.twitter.countChars();
          });

        };

        var timer;
        $scope.twitter = {
          token: null,
          loginStatusLoaded: false,
          friendFilterKey: null,
          charCount: 140,
          countChars: function(scope, elm, attr) {
            /* if for every http:// in the textarea, subtract 20 */
            var urlCount = ($scope.twitter.messageText.split('http').length - 1) * 20;
            var matchUrl = new RegExp("(^|[ \t\r\n])(http|https):([a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*)", "g");
            var rpl = $scope.twitter.messageText.replace(matchUrl, '');
            $scope.twitter.charCount = 140 - rpl.length - urlCount;
          },
          searchUsers: function() {
            $scope.twitter.spinner = true;
            clearTimeout(timer);
            timer = setTimeout(function() {
              twitter.searchUsers($scope.twitter.friendFilterKey, {}, $scope.handleSearchUsers);
            }, 1000);
          },

          tweet: function(friend, $event) {
            twitter.tweet({
              tweet: $scope.twitter.messageText
            }, function(err, res) {
              if (res === null) {
                $scope.handleFriendsFetch();
              } else {
                friend.rsvp.decision = null;
                friend.checked = true;
                $http.get('/callback/twitter/rsvp/' + $scope.plan.guid + '/' + $scope.twitter.token)
                  .success(function(data, status, headers, config) {
                  plan.fetch(function() {
                    $rootScope.$broadcast('plan-friends-changed', plan.getFriends());
                  });

                });
              }
              $('#modal-' + friend.screen_name).modal("hide");
            });
          },

          service: twitter
        };

        //if getAuth is null then set a listener
        if (twitter.getAuth() === null) {
          $scope.$on('twitter-login-status', function(e, args) {
            $scope.twitter.loginStatusLoaded = true;
            if (twitter.getAuth()) {
              twitter.fetchProfile($scope.handleProfileFetch);
            }
          });
        } else {
          //its already been loaded
          $scope.twitter.loginStatusLoaded = true;
          if (twitter.getAuth()) {
            twitter.fetchProfile($scope.handleProfileFetch);
          }
        }

        $scope.$on('twitter-login', function(e, args) {
          if (twitter.getAuth()) {
            twitter.fetchProfile($scope.handleProfileFetch);
          }
        });


      },
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {

        };
      }
    }
  }
]).

directive('invitationWizardStep5', ['wembliRpc', '$window', 'plan', '$timeout', '$rootScope',
  function(wembliRpc, $window, plan, $timeout, $rootScope) {
    return {
      restrict: 'E',
      controller: function($scope, $element, $attrs, $transclude) {

        $scope.selectedFriends = [];
        $scope.wemblimail = {
          friends: [],
        };

        /* set up the wemblimail friends array with friends in the plan */
        if (typeof plan.getFriends() !== "undefined") {
          for (var i = plan.getFriends().length - 1; i >= 0; i--) {
            var friend = plan.getFriends()[i];
            friend.checked = friend.inviteStatus;
            if (friend.contactInfo.service === 'wemblimail') {
              $scope.wemblimail.friends.push(friend);
              $scope.selectedFriends[friend.contactInfo.serviceId] = friend.inviteStatus;
            }
          };
        }

        $scope.sendWemblimail = function() {
          if (!$scope.wemblimailForm.$valid) {
            return;
          }

          $('#invitation-modal').modal('loading');

          var addFriendArgs = {
            name: $scope.wemblimail.name,
            message: $scope.wemblimail.messageText,
            inviteStatus: false,
            imageUrl: null,
            service: 'wemblimail',
            serviceId: $scope.wemblimail.email,
          };

          wembliRpc.fetch('invite-friends.sendWemblimail', addFriendArgs, function(err, result) {
            $('#invitation-modal').modal('loading');

            if (!$scope.customer.email) {
              $scope.signup.noContinue = true;
              return $scope.gotoStep('step1');
            }

            /* If There's A No Cust Error Send Them Back To Step-1 With An Error */
            if (result.noCustomer) {
              $scope.signup.noContinue = true;
              return $scope.gotoStep('step1');
            }

            /* edge case - organizer tries to invite themself! */
            if (result.isOrganizer) {
              $scope.isOrganizer = true;
              return;
            }

            var friend = result.friend;
            friend.checked = friend.inviteStatus;

            /* if this friend is not in the list of step5 selected friends, push it on the the wemblimail friends scope cause its a new one */
            if (typeof $scope.selectedFriends[friend.contactInfo.serviceId] === "undefined") {
              $scope.wemblimail.friends.unshift(friend);
              /* in submit reponse, do the formStatus fade */
              $scope.wemblimail.formStatus = true; /* this will make the element fade in */
            }
            $scope.wemblimail.lastSentEmail = $scope.wemblimail.email;

            if (friend.rsvp.status === 'queued') {
              $scope.successUnconfirmed = true;
            } else {
              $scope.successConfirmed = true;
            }

            /* tihs should make it fade out */
            var Promise = $timeout(function() {
              $scope.wemblimail.name = null;
              $scope.wemblimail.email = null;
              $scope.wemblimail.messageText = null;
              $scope.wemblimail.formstatus = false;
            }, 1500);

            /* add this friend to the selected friends hash */
            $scope.selectedFriends[friend.contactInfo.serviceId] = friend.checked;
            /* add this friend to the list of invited friends */

            plan.fetch(function() {
              $rootScope.$broadcast('plan-friends-changed', plan.getFriends());
            });

          });
        };
      },
      compile: function(element, attr, transclude) {
        return function(scope, element, attr) {

        };
      }
    }
  }
]);
