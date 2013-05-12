/*
 * Main Controller
 */

function MainCtrl($scope, $location, $window, footer, plan) {

};



/*
 * Index Controller
 */

function IndexCtrl($scope, $location, $window, $templateCache, wembliRpc, fetchModals) {
	//clear the cache when the home page loads to make sure we start fresh
	$templateCache.removeAll();

	/*
	$scope.startPlan = function() {
			if ($location.path() !== '/index') {
				$location.path('/index');
			}
		$('#payment-type-modal').modal('show');
	}

	$scope.$on('payment-type-modal-fetched', function(e, args) {
		if ($location.hash() === "payment-type-modal") {
			console.log('path'+$location.path());
			$('#payment-type-modal').modal('show');
		}
	});
	*/

	/* this doesn't do anything right now
	wembliRpc.fetch('index.init', {},
	function(err, result) {

	});
	*/
};

/*
 * Confirm Email Controller
 */

function ConfirmCtrl($scope, wembliRpc) {
	wembliRpc.fetch('confirm.init', {},
	//response

	function(err, result) {
		$scope.emailError = result.emailError;
		$scope.resent = result.resent;
		$scope.expiredToken = result.expiredToken;
	});
};



/*
 * Event Options Controller
 */

function EventOptionsCtrl($scope, $http, $compile, wembliRpc, fetchModals) {
	//init login vars
	var args = {};
	//$scope.paymentOptionsError = false;
	$scope.addOnsError = false;
	$scope.inviteOptionsError = false;
	$scope.guestListOptionsError = false;

	wembliRpc.fetch('event-options.init', {},

	function(err, result) {
		//$scope.payment = result.payment;
		$scope.parking = result.parking;
		$scope.restaurant = result.restaurant;
		$scope.hotel = result.hotel;
		$scope.guest_friends = result.guestFriends;
		$scope.organizer_not_attending = result.organizerNotAttending;
		$scope.guest_list = result.guestList;
		$scope.over_21 = result.over21;

		if (Object.keys(result.errors).length > 0) {
			//$scope.paymentOptionsError = (result.errors.payment) ? true : false;
			$scope.addOnsError = (result.errors.addOns) ? true : false;
			$scope.inviteOptionsError = (result.errors.inviteOptions) ? true : false;
			$scope.guestListOptionsError = (result.errors.guestList) ? true : false;
		}
	});

	//putting an action in the form causes angular to post the form

	//put fetchModals in the scope so we can call fetch from the view when they hit continue
	$scope.fetchModals = fetchModals;

};



/*
 * Event List Controller
 */

function EventListCtrl($scope, $location, wembliRpc, $filter, $rootScope, plan, fetchModals) {
	/* does nothing right now
	wembliRpc.fetch('eventlist.init', {},
	function(err, result) {

	});
	*/

	plan.get(function(planData) {
		$scope.plan = planData;
		if ((planData === null) || ($scope.plan.preferences.payment === "undefined")) {
			/* fetch the payment-type-modal  */
			fetchModals.fetch('/partials/payment-type');
		}
	});

	$scope.moreEvents = function() {
		//fetch the upcoming events
		var args = {
			"beginDate": $scope.lastEventDate,
			"orderByClause": "Date",
			"lastEventId": $scope.lastEventId
		};

		if ($scope.search) {
			args.searchTerms = $scope.search;
			var method = 'event.search';
		} else {
			args.nearZip = $scope.postalCode;
			var method = 'event.get';
		}

		wembliRpc.fetch(method, args,
		//response callback

		function(err, result) {
			console.log('back from event.search');
			if (err) {
				//handle err
				alert('error happened - contact help@wembli.com');
				return;
			}

			if (!$scope.events) {
				$scope.events = [];
			}
			$scope.events = $scope.events.concat(result['event']);
			var d = new Date($scope.events[$scope.events.length - 1].Date);
			$scope.lastEventDate = $filter('date')(d, "MM-dd-yy");
			$scope.lastEventId = $scope.events[$scope.events.length - 1].ID;
		},

		function(data, headersGetter) {
			$('#page-loading-modal').modal("hide");
			$rootScope.genericLoadingModal.header = 'Loading Event Search...';
			$('#generic-loading-modal').modal("show");
			return data;
		},

		function(data, headersGetter) {
			console.log('hide generic loading modal');
			$('#generic-loading-modal').modal("hide");
			return JSON.parse(data);
		});

	};

	if ($rootScope.partial) {
		if ($location.search().search) {
			$scope.search = $location.search().search;
		}
		//begin date for event list
		var daysPadding = 2; //how many days from today for the beginDate
		var d = new Date();
		d2 = new Date(d);
		d2.setDate(d.getDate() + daysPadding);
		$scope.lastEventDate = $filter('date')(d2, "MM-dd-yy");
		$scope.moreEvents();
	}

	//hack so that after the 1st page load, we will render this page using ajax
	$rootScope.partial = true;
};



/*
 * Event Controller
 */

function EventCtrl($scope) {};



/*
 * Invite Friends Wizard Controller
 * this should be done as a directive
 */

function InviteFriendsWizardCtrl($rootScope, $http, $scope, $filter, $window, $location, $timeout, fetchModals, sequence, wembliRpc, customer, plan, facebook, twitter) {

	$scope.invitedFriends = [];

	$scope.selectedFriends = {
		'step3': {},
		'step4': {},
		'step5': {}
	}

	var addToInvitedFriends = function(friend) {
		/* detect this friend in the invitedFriends list - if not there, add it */
		var exists = false;
		var found = false;
		var newList = [];

		angular.forEach($scope.invitedFriends, function(f) {
			/* if this friend in the loop is the same as the one passed in */
			if ((f.contactInfo.service === friend.contactInfo.service) && (f.contactInfo.serviceId === friend.contactInfo.serviceId)) {
				/* this friend is in the list */
				exists = true;
				found = true;
				/* this friend is no longer invited */
				if (!friend.inviteStatus) {
					exists = false;
					return; /* don't add this friend to the newList */
				}

			}

			if (exists) {
				newList.unshift(friend); /* push the new one and skip the old one */
			} else {
				if (f.inviteStatus) {
					/* this friend can stay in the list */
					newList.unshift(f);
				}
			}
			exists = false;
		});
		/* this friend wasn't already in the list so add it */
		if (!found && friend.inviteStatus) {
			newList.unshift(friend);
		}
		$scope.invitedFriends = newList;
	};
	/* set up the view scope for the wizard */
	/* set up locally scoped variables */
	var wizard = {};

	/* set up scoping for each specific step */
	wizard.step1 = {
		rpcArgs: function() {
			var rpcArgs = {
				'firstName': $scope.customer.firstName,
				'lastName': $scope.customer.lastName,
				'email': $scope.customer.email,
				'next': '/invitation/'+plan.get().event.eventId+'/'+plan.get().event.eventName+'#step2'
			};
			if ($scope.customer.id) {
				rpcArgs.customerId = $scope.customer.id;
			}
			if ($scope.customer.password) {
				rpcArgs.password = $scope.customer.password;
			}
			return rpcArgs;
		},

		formSubmitCallback: function(err, result) {
			$('#invitation-modal').modal('loading');
			$scope.step1.formError = false;
			$scope.step1.error = false;
			//error checking
			$scope.step1.accountExists = (result.exists) ? true : false;

			if (result.formError) {
				$scope.step1.error = true;
				$scope.step1.formError = true;
			}

			if (result.invalidCredentials) {
				$scope.step1.error = true;
				$scope.step1.invalidCredentials = true;
				$scope.step1.loginForm = true;
			}

			if (result.exists && !$scope.loginForm) {
				$scope.step1.error = true;
				$scope.step1.accountExists = true;
				$scope.step1.loginForm = true;
			}

			if (typeof result.noPassword !== "undefined") {
				$scope.step1.error = true;
				$scope.step1.noPassword = result.noPassword;
				$scope.step1.loginForm = true;
			}

			if (!$scope.step1.error) {
				/* success - go to next step */
				$scope.step1.loginForm = false;
				delete $scope.step1.password;
				$scope.gotoStep('step2');
			}

			if (result.customer) {
				$rootScope.customer = result.customer;
				$rootScope.loggedIn = result.loggedIn;
				if (typeof $scope.step1.customer === "undefined") {
					$scope.step1.customer = {};
				}
				console.log(result.customer);
				/* this isn't working for some reason */
				$scope.step1.customer.email = result.customer.email;
				$scope.step1.customer.firstName = result.customer.firstName;
				$scope.step1.customer.email = result.customer.lastName;

			}
		},
	};

	/* save rsvp date */
	wizard.step2 = {
		rpcArgs: function(args) {
			var rpcArgs = {
				rsvpDate: $scope.plan.rsvpDate,
			};
			if (typeof args.next !== "undefined") {
				rpcArgs.next = args.next;
			}
			return rpcArgs;
		},
		formSubmitCallback: function(err, result) {
			$('#invitation-modal').modal('loading');
			/* If There's A No Cust Error Send Them Back To Step-1 With An Error */
			if (result.noCustomer) {
				$scope.step1.error = true;
				$scope.step1.noCustomer = true;
				return $scope.gotoStep('step1');
			}

			if (result.next) {
				return $scope.gotoStep('step3');
			}
		}
	};

	wizard.step5 = {
		rpcArgs: function(args) {
			var rpcArgs = {
				name: $scope.wemblimail.name,
				message: $scope.wemblimail.messageText,
				inviteStatus: false,
				imageUrl: null,
				service: 'wemblimail',
				serviceId: $scope.wemblimail.email,
			}
			return rpcArgs;
		},
		formSubmitCallback: function(err, result) {
			$('#invitation-modal').modal('loading');
			/* if there's a no cust error send them back to step-1 with an error */
			if (result.noCustomer) {
				$scope.step1.error = true;
				$scope.step1.noCustomer = true;
				return $scope.gotoStep('step1');
			}

			/* edge case - organizer tries to invite themself! */
			if (result.isOrganizer) {
				$scope.step5.isOrganizer = true;
				return;
			}

			var friend = result.friend;
			friend.checked = friend.inviteStatus;
			/* if this friend is not in the list of step5 selected friends, push it on the the wemblimail friends scope cause its a new one */
			if (typeof $scope.selectedFriends['step5'][friend.contactInfo.serviceId] === "undefined") {
				$scope.wemblimail.friends.unshift(friend);
				/* in submit reponse, do the formStatus fade */
				$scope.wemblimail.formStatus = true; /* this will make the element fade in */
			}
			$scope.wemblimail.lastSentEmail = $scope.wemblimail.email;

			if (friend.rsvp.status === 'queued') {
				$scope.step5.successUnconfirmed = true;
			} else {
				$scope.step5.successConfirmed = true;
			}

			/* tihs should make it fade out */
			var Promise = $timeout(function() {

				$scope.wemblimail.name = null;
				$scope.wemblimail.email = null;
				$scope.wemblimail.messageText = null;
				$scope.wemblimail.formstatus = false;
			}, 1500);

			/* add this friend to the selected friends hash */
			$scope.selectedFriends['step5'][friend.contactInfo.serviceId] = friend.checked;
			/* add this friend to the list of invited friends */
			addToInvitedFriends(friend);
		},

	};

	/* view methods */
	$scope.$on('forgot-password-email-sent', function() {
		console.log('forgot password email sent');
		$scope.step1.forgotPasswordEmailSent = true;
	});

	$scope.submitForm = function(step, args) {
		if ($scope[step].$valid) {
			$('#invitation-modal').modal('loading');
			wembliRpc.fetch('invite-friends.submit-' + step, wizard[step].rpcArgs(args), wizard[step].formSubmitCallback);
		} else {
			console.log('form not valid');
		}
	};

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

	$scope.initSignupForm = function() {
		console.log('init signup form');
		$scope.step1.loginForm = false;
		delete $scope.customer.password;
	}

	/* done with view methods */

	/* functions that interface between the social network services and the view scope */

	//these are callbacks to handle responses form the various social network service friend api calls

	//facebook first
	wizard.facebook = {
		handleFriendsFetch: function(response) {

			var mergePlanFriends = function(fbFriends, planFriends) {

				/* optimize this... */
				angular.forEach(fbFriends, function(f) {
					var me = this;
					angular.forEach(planFriends, function(f2) {
						if (f2.contactInfo.service === 'facebook' && (f2.contactInfo.serviceId == f.id)) {
							f.inviteStatus = f2.inviteStatus;
							f.checked = f2.inviteStatus;
							f.rsvp = f2.rsvp;
						}
					});
				});
				$scope.$apply(function() {
					$scope.facebook.friends = fbFriends;
				});
			};

			/* get the friends in the plan (if any) to know who is already invited */
			var fbFriends = facebook.getFriends();

			if (plan.getFriends() === null) {
				$scope.$on('plan-fetched', function(e, args) {
					planFriends = plan.getFriends();
					mergePlanFriends(fbFriends, planFriends);
				})
			} else {
				planFriends = plan.getFriends();
				mergePlanFriends(fbFriends, planFriends);
			}
		},
		handleProfileFetch: function(response) {

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
		}
	};

	$scope.facebook = {
		loginStatusLoaded: false,
		friendFilterKey: null,
		filterFriends: function() {
			facebook.filterFriends($scope.facebook.friendFilterKey);
			$scope.facebook.friends = facebook.getFriends();
			$scope.facebook.noResults = false;
			if (typeof $scope.facebook.friends[0] === "undefined") {
				$scope.facebook.friends = facebook.getAllFriends();
				$scope.facebook.noResults = true;
			}
		},

		handleFriendClick: function(friend, $event) {
			/* if the thing that was clicked is the input we don't need to set checked */
			if ($event.target.localName !== "input") {
				friend.checked = friend.checked ? false : true;
			}
			$('#invitation-modal').modal('loading');
			return plan.addFriend({
				name: friend.name,
				inviteStatus: false,
				imageUrl: 'https://graph.facebook.com/' + friend.id + '/picture',
				service: 'facebook',
				serviceId: friend.id
			}, function(err, result) {
				/* If There's A No Cust Error Send Them Back To Step-1 With An Error */
				if (result.noCustomer) {
					$scope.step1.error = true;
					$scope.step1.noCustomer = true;
					$('#invitation-modal').modal('loading');
					return $scope.gotoStep('step1');
				}

				addToInvitedFriends(result.friend);

				if (friend.checked) {
					/* display the feed dialog */
					facebook.feedDialog({
						guid: $scope.plan.guid,
						token: result.friend.inviteStatusConfirmation.token,
						to: result.friend.contactInfo.serviceId,
						eventName: $scope.plan.event.eventName,
						venue: $scope.plan.event.eventVenue,
						rsvpDate: $('#rsvp-date').val()
					}, function(response) {
						$('#invitation-modal').modal('loading');
						if (response === null) {
							$scope.$apply(function() {
								friend.checked = false;
							});
						} else {
							/* hit the callback to set the inviteStatus to true */
							$http.get('/callback/facebook/rsvp/' + $scope.plan.guid + '/' + result.friend.inviteStatusConfirmation.token);
							friend.rsvp = result.friend.rsvp;
							//friend.rsvp.decision = null;
						}
					});
				}
			});
		},
		service: facebook
	}

	//if getAuth is null then set a listener
	if (facebook.getAuth() === null) {

		$scope.$on('facebook-login-status', function(e, args) {
			$scope.$apply(function() {
				$scope.facebook.loginStatusLoaded = true;
			});
			if (facebook.getAuth()) {
				facebook.api('/me', wizard.facebook.handleProfileFetch);
				facebook.api('/me/friends', wizard.facebook.handleFriendsFetch);
			}
		});
	} else {
		//its already been loaded
		$scope.facebook.loginStatusLoaded = true;
		if (facebook.getAuth()) {
			facebook.api('/me', wizard.facebook.handleProfileFetch);
			facebook.api('/me/friends', wizard.facebook.handleFriendsFetch);
		}
	}

	$scope.$on('facebook-login', function(e, args) {
		if (facebook.getAuth()) {
			facebook.api('/me', wizard.facebook.handleProfileFetch);
			/* they just completed facebook login - get the friends list */
			facebook.api('/me/friends', wizard.facebook.handleFriendsFetch);
		}
	});
	/* done with facebook code */



	/* twtter code */
	wizard.twitter = {
		handleSearchUsers: function(response) {
			var mergePlanFriends = function(twitFriends, planFriends) {
				/* optimize this... */
				angular.forEach(twitFriends, function(f) {
					var me = this;
					angular.forEach(planFriends, function(f2) {
						if (f2.contactInfo.service === 'twitter' && (f2.contactInfo.serviceId == f.id)) {
							f.inviteStatus = f2.inviteStatus;
							f.checked = f2.inviteStatus;
							f.rsvp = f2.rsvp;
						}
					});
				});
				$scope.twitter.spinner = false;
				$scope.twitter.friends = twitFriends;
			};

			/* get the friends in the plan (if any) to know who is already invited */
			var twitFriends = twitter.getFriends();
			if (plan.getFriends() === null) {
				$scope.$on('plan-fetched', function(e, args) {
					planFriends = plan.getFriends();
					mergePlanFriends(twitFriends, planFriends);
				})
			} else {
				planFriends = plan.getFriends();
				mergePlanFriends(twitFriends, planFriends);
			}
		},

	};

	var timer;
	$scope.twitter = {
		loginStatusLoaded: false,
		friendFilterKey: null,
		filterFriends: function() {
			twitter.filterFriends($scope.twitter.friendFilterKey);
			$scope.twitter.friends = twitter.getFriends();
		},
		charCount: 140,
		countChars: function(scope, elm, attr) {
			/* if for every http:// in the textarea, subtract 20 */
			var urlCount = ($scope.twitter.messageText.split('http').length - 1) * 20;
			matchUrl = new RegExp("(^|[ \t\r\n])(http|https):([a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*)", "g");
			var rpl = $scope.twitter.messageText.replace(matchUrl, '');
			$scope.twitter.charCount = 140 - rpl.length - urlCount;
		},
		searchUsers: function() {
			$scope.twitter.spinner = true;
			clearTimeout(timer);
			timer = setTimeout(function() {
				twitter.searchUsers($scope.twitter.friendFilterKey, {}, wizard.twitter.handleSearchUsers);
			}, 1000);
		},

		tweet: function(friend, $event) {
			twitter.tweet({
				tweet: $scope.twitter.messageText
			}, function(err, res) {
				$('#invitation-modal').modal('loading');
				if (res === null) {
					$scope.$apply(function() {
						friend.checked = false;
					});
				} else {
					$http.get('/callback/twitter/rsvp/' + $scope.plan.guid + '/' + friend.inviteStatusConfirmation.token);
					friend.rsvp.decision = null;
					friend.checked = true;
				}
				$('#modal-' + friend.screen_name).modal("hide");
			});
		},

		handleFriendClick: function(friend, $event) {
			$('#invitation-modal').modal('loading');
			return plan.addFriend({
				name: friend.name,
				inviteStatus: false,
				imageUrl: friend.profile_image_url_https,
				service: 'twitter',
				serviceId: friend.id
			}, function(err, result) {
				/* If There's A No Cust Error Send Them Back To Step-1 With An Error */
				if (result.noCustomer) {
					$scope.step1.error = True;
					$scope.step1.noCustomer = True;
					return $scope.gotoStep('step1');
				}

				addToInvitedFriends(result.friend);

				/* should i just overwrite friend completely here? */
				friend.inviteStatusConfirmation = result.friend.inviteStatusConfirmation;
				friend.rsvp = result.friend.rsvp;
				console.log('friend rsvp is: ');
				console.log(friend.rsvp);
				/* display the tweet dialog box */
				$('#modal-' + friend.screen_name).modal("show");
				/* reset the tweet form data */
				var rsvpUrl = 'http://'+$location.host()+'/rsvp/' + $scope.plan.guid + '/' + friend.rsvp.token + '/twitter';
				$scope.twitter.messageText = '@' + friend.screen_name + ' You are invited to an outing I am planning with @wembli | RSVP By ' + $filter('date')($scope.plan.rsvpDate, 'M/d/yy') + ' | ' + rsvpUrl;
				$scope.twitter.countChars();
			});
		},
		service: twitter
	};

	//if getAuth is null then set a listener
	if (twitter.getAuth() === null) {
		$scope.$on('twitter-login-status', function(e, args) {
			$scope.twitter.loginStatusLoaded = true;
			if (twitter.getAuth()) {
				twitter.fetchProfile(wizard.twitter.handleProfileFetch);
			}
		});
	} else {
		//its already been loaded
		$scope.twitter.loginStatusLoaded = true;
		if (twitter.getAuth()) {
			twitter.fetchProfile(wizard.twitter.handleProfileFetch);
		}
	}

	$scope.$on('twitter-login', function(e, args) {
		if (twitter.getAuth()) {
			twitter.fetchProfile(wizard.twitter.handleProfileFetch);
		}
	});

	/* done with twitter code */
	$scope.wemblimail = {
		friends: [],
	};

	/* put the plan in the scope for the view */
	$scope.plan = plan.get();

	//display the modal if there's a plan
	if ($scope.plan && typeof $scope.plan.event.eventId === "undefined") {
		console.log('log this - it should never happen');
		return;
	}

	/* figure out which step to go to */
	var initialStep = 'step1';
	$scope.step1 = {};
	if (customer.get() && Object.keys(customer.get()).length > 0) {
		$scope.step1.loginForm = false;
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
	console.log('go to step: ' + initialStep);
	$scope.gotoStep(initialStep);

	/* set up the wemblimail friends array with friends in the plan */
	if (typeof plan.getFriends() !== "undefined") {
		$scope.invitedFriends = [];
		for (var i = plan.getFriends().length - 1; i >= 0; i--) {
			var friend = plan.getFriends()[i];
			friend.checked = friend.inviteStatus;
			if (friend.contactInfo.service === 'facebook') {
				$scope.selectedFriends['step3'][friend.contactInfo.serviceId] = friend.inviteStatus;
			}
			if (friend.contactInfo.service === 'twitter') {
				$scope.selectedFriends['step4'][friend.contactInfo.serviceId] = friend.inviteStatus;
			}
			if (friend.contactInfo.service === 'wemblimail') {
				$scope.wemblimail.friends.push(friend);
				$scope.selectedFriends['step5'][friend.contactInfo.serviceId] = friend.inviteStatus;
			}
			if (friend.inviteStatus) {
				$scope.invitedFriends.push(friend);
			}
		};
	}

};

function ParkingCtrl($rootScope, $scope, $timeout, plan, wembliRpc, googleMap, mapInfoWindowContent) {
	/* get the spots for this lat long and display them as markers */
	/*
	var markers = new L.MarkerClusterGroup({ spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: false });
	markers.addLayer(new L.marker([30.269218,-97.735557]));
	console.log('setting markers in ctrl');
	console.log(markers);
	$scope.markers = markers;
	*/

	$scope.determineRange = function(price) {
		/* hard coded price range for now */
		var i = parseFloat(price);
		if (i <= 20) {
			return '$';
		}
		if (i > 20 && i <= 50) {
			return '$$';
		}
		if (i > 50) {
			return '$$$';
		}
	};

	$scope.determineDistance = function(feet) {
		return parseFloat(feet / 5280).toFixed(2);
	}

	$scope.notFound = true;

	console.log('setting watch for parkingReservations');
	/* watch for parkingReservations (right now its just parkwhiz) */
	$scope.$watch('parkingReservations', function(parking) {
		/* make markers & infoWindows for these and add them to the map */
		if (!parking) {
			return;
		};

		$scope.notFound = false;

		$timeout(function() {
			angular.forEach(parking.parking_listings, function(v, i) {
				console.log('parking reservation listing:');
				console.log(v);

				if (!googleMap.hasMarker(v.lat, v.lng)) {

					var marker = new google.maps.Marker({
						position: new google.maps.LatLng(v.lat, v.lng),
						map: googleMap.getMap(),
					});
					marker.setIcon("/images/icons/map-icons/transportation/parkinggarage.png");
					marker.setAnimation(google.maps.Animation.DROP);

					var win = new google.maps.InfoWindow({
						content: mapInfoWindowContent.create({
							header: v.location_name,
							body: v.address + ', ' + v.city
						}),
						pixelOffset: new google.maps.Size(10, 0),
					});
					google.maps.event.addListener(marker, 'click', function() {
						console.log('clicked infowindow')
						if (googleMap.isInfoWindowOpen(marker)) {
							googleMap.closeInfoWindow(marker);
						} else {
							googleMap.openInfoWindow(marker);
						}
					});

					/* put the marker on the map */
					googleMap.addMarker(marker);
					/* put the infoWindow on the map */
					googleMap.addInfoWindow(win, marker);
				}
			});
		});
	});

	console.log('setting watch for googleParking');
	var deregGP = $scope.$watch('googleParking', function(parking) {
		console.log('googleParking changed: ');
		console.log(parking);
		/* make markers & infoWindows for these and add them to the map */
		if (!parking) {
			console.log('googleParking outa here');
			return;
		};

		console.log('notfound is false');
		$scope.notFound = false;

		$timeout(function() {
			angular.forEach(parking, function(place, i) {
				console.log('google parking item:');
				console.log(place);


				//if (!googleMap.hasMarker(place.geometry.location.lat(), place.geometry.location.lng())) {
					console.log(place);
					var marker = new google.maps.Marker({
						map: googleMap.getMap(),
						position: place.geometry.location,
					});
					marker.setIcon("/images/icons/map-icons/transportation/parkinggarage.png");
					marker.setAnimation(google.maps.Animation.DROP);

					var win = new google.maps.InfoWindow({
						content: mapInfoWindowContent.create({
							header: place.name,
							body: place.vicinity
						}),
						pixelOffset: new google.maps.Size(10, 0),
					});

					google.maps.event.addListener(marker, 'click', function() {
						console.log('clicked infowindow')
						if (googleMap.isInfoWindowOpen(marker)) {
							googleMap.closeInfoWindow(marker);
						} else {
							googleMap.openInfoWindow(marker);
						}
					});

					/* put the marker on the map */
					googleMap.addMarker(marker);
					/* put the infoWindow on the map */
					googleMap.addInfoWindow(win, marker);
				//}
			});
			deregGP();

		});

	});

	function getParking(p) {
		console.log('plan');
		console.log(p);

		/* reset the map */
		googleMap.isDrawn(false);

		var lat = p.venue.data.geocode.geometry.location.lat;
		var lng = p.venue.data.geocode.geometry.location.lng;

		/* make a marker for the venue */
		var marker = new google.maps.Marker({
			map: googleMap.getMap(),
			position: new google.maps.LatLng(lat, lng),
		});
		marker.setIcon("/images/icons/map-icons/sports/stadium.png");
		marker.setAnimation(google.maps.Animation.DROP);

		/* infoWindow for the venue marker */
		var win = new google.maps.InfoWindow({
			content: mapInfoWindowContent.create({
				header: p.event.eventVenue,
				body: p.venue.data.Street1 + ', ' + p.event.eventCity + ', ' + p.event.eventState
			}),
			pixelOffset: new google.maps.Size(10, 0),
		});

		google.maps.event.addListener(marker, 'click', function() {
			console.log('clicked infowindow')
			if (googleMap.isInfoWindowOpen(marker)) {
				googleMap.closeInfoWindow(marker);
			} else {
				googleMap.openInfoWindow(marker);
			}
		});

		/* put the marker on the map */
		googleMap.addMarker(marker);
		/* put the infoWindow on the map */
		googleMap.addInfoWindow(win, marker);
		/* open the infowindow for the venue by default */
		googleMap.openInfoWindow(marker);

		/* get all the google parking nearby and add it to the scope */
		var request = {
			location: new google.maps.LatLng(lat, lng),
			radius: 1500,
			types: ['parking']
		};
		var service = new google.maps.places.PlacesService(googleMap.getMap());
		service.nearbySearch(request, function(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				console.log('got googleParking results');
				console.log(results);
				$scope.$apply(function() {
					$scope.googleParking = results;
				});
			}
		});

		/* get parking from parkwhiz and update scope */
		wembliRpc.fetch('event.getParking', {
			lat: lat,
			lng: lng,
			//start: start, //optional
			//end: end //optional
		}, function(err, result) {

			if (err) {
				//handle err
				alert('error happened - contact help@wembli.com');
				return;
			}

			$('#generic-loading-modal').modal("hide");

			console.log('results from event.getParking');
			$timeout(function() {
				$scope.$apply(function() {
					$scope.parkingReservations = result.parking;
				});
			});
			var minParkingPrice = result.parking.min_price;
			var maxParkingPrice = result.parking.max_price;

			var initSlider = function() {
				/*Set Minimum and Maximum Price from your Dataset*/
				$("#price-slider").slider("option", "min", minParkingPrice);
				$("#price-slider").slider("option", "max", maxParkingPrice);
				$("#price-slider").slider("option", "values", [minParkingPrice, maxParkingPrice]);
				$("#amount").val("$" + minParkingPrice + " - $" + maxParkingPrice);
			};

			var filterParking = function() {
				var priceRange = $("#price-slider").slider("option", "values");

				/* hide parking locations that are out of range */
				console.log('filtering parking');
			};

			//set the height of the map-container to the window height
			//$('#map-container').css("height", $($window).height() - 60);
			//$('#parking').css("height", $($window).height() - 60);
			//$('#map-container').css("width", $($window).width() - 480);

			$('#price-slider').slider({
				range: true,
				min: minParkingPrice,
				max: maxParkingPrice,
				step: 5,
				values: [minParkingPrice, maxParkingPrice],
				slide: function(event, ui) {
					$("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
				},
				stop: function(event, ui) {
					filterParking();
				}

			});

			var amtVal = "$" + $("#price-slider").slider("values", 0) + " - $" + $("#price-slider").slider("values", 1);
			$("#amount").val(amtVal);

			/* filter tix when the drop down changes */
			$("#quantity-filter").change(function() {
				filterParking();
			});
		},
		/* transformRequest */

		function(data, headersGetter) {

			$rootScope.genericLoadingModal.header = 'Finding Parking...';
			$('#page-loading-modal').modal("hide");
			console.log('show generic modal');
			$('#generic-loading-modal').modal("show");
			return data;
		},

		/* transformResponse */

		function(data, headersGetter) {
			return JSON.parse(data);
		});
	};


	plan.get(function(p) {
		$scope.context = plan.getContext() || 'visitor';
		$scope.backToPlan = false;
		if ($scope.context === 'friend') {
			$scope.backToPlan = true;
		}
		if (plan.getFriends().length > 0) {
			$scope.backToPlan = true;
		}

		if (googleMap.isDrawn()) {
			console.log('google map is draen');
			getParking(p);
		} else {
			console.log('google map is not drawn');
			var dereg = $rootScope.$on('google-map-drawn', function() {
				console.log('google map is draen now');
				getParking(p);
				dereg();
			});
		}
	});
};

function PaymentTypeModalCtrl($scope) {
	$scope.$on('payment-type-modal-clicked', function(e, args) {
		$scope.$apply(function() {
			$scope.name = args.name;
			$scope.nextLink = args.nextLink;
		});
	});
};

/*
 * Plan Controller
 */

function PlanCtrl($rootScope, $scope, wembliRpc, plan, customer, fetchModals) {
	/* fetch the invite friends wizard modal */

};

function SearchCtrl($scope) {};

function SignupCtrl($scope, $http, wembliRpc) {
	//init login vars
	var args = {};
	$scope.error = false;

	wembliRpc.fetch('signup.init', {},
	//response

	function(err, result) {
		$scope.firstName = result.firstName;
		$scope.lastName = result.lastName;
		$scope.email = result.email;
		$scope.error = result.formError ? result.formError : false;
		$scope.exists = result.exists ? result.exists : false;
	});


	$('#signup-form').submit(function(e) {
		//don't allow submit unless all fields are supplied and passwords match
		if (typeof $scope.firstName === "undefined") {
			return false;
		}
		if (typeof $scope.lastName === "undefined") {
			return false;
		}
		if (typeof $scope.email === "undefined") {
			return false;
		}
	});
};

function LoginCtrl($scope, $http, wembliRpc) {
	//init login vars
	var args = {};
	$scope.error = false;

	wembliRpc.fetch('login.init', {},
	//response

	function(err, result) {
		$scope.remember = result.remember;
		$scope.email = result.email;
		$scope.error = result.formError ? result.formError : false;
		$scope.redirectUrl = result.redirectUrl;
	});

	$scope.forgotPassword = function() {
		$http.get('/partials/forgot-password', {
			cache: true
		}).success(function(data, status, headers, config) {
			$('#login-form fieldset').fadeOut(function() {
				$('#login-form fieldset').html(data);
				$('#login-form fieldset').fadeIn();
				$('#arrow .arrow-text').html('Reset');
				$('#login-form').attr('action', '/forgot-password');
			});
		}).error();

	}
};

function SupplyPasswordCtrl($scope) {
	$('#confirm-password-form').submit(function(e) {
		if ((typeof $scope.password == "undefined") || ($scope.password !== $scope.password2)) {
			$('#error .error-text').show();
			return false;
		}
	});
};

function FooterCtrl($scope, $location, $window, facebook, plan) {
	//this is how high they can drag it
	var y = $("#footer").offset().top - $("#footer").height() + ($("#nav").offset().top - $("#footer").offset().top) + $("#nav").height();
	$('#footer').draggable({
		snap: "#footerContainer",
		snapTolerance: 30,
		snapMode: "inner",
		cursor: "move",
		axis: "y",
		containment: [0, y, 0, $("#footer").offset().top],
		handle: "#handle"
	});

	$scope.facebook = facebook;

	var updateLinks = function() {
		$scope.eventLink = plan.get() ? '/' + plan.get().event.eventId + '/' + plan.get().event.eventName : '';
	};

	$scope.$on('plan-fetched', updateLinks);
	plan.get(function(plan) {
		updateLinks();
	});
};

function RsvpLoginCtrl($rootScope, $scope, $location, plan, customer, wembliRpc, rsvpLoginModal) {
	$scope.plan = plan.get();
	console.log('rsvp login ctrl');
	$scope.guid = rsvpLoginModal.get('guid');
	$scope.service = rsvpLoginModal.get('service');
	$scope.token = rsvpLoginModal.get('token');
	$scope.friend = rsvpLoginModal.get('friend');
	$scope.event = JSON.parse(rsvpLoginModal.get('event'));

	console.log($scope.event);
	$scope.confirmSocial = rsvpLoginModal.get('confirmSocial');
	$scope.next = '/rsvp/' + $scope.guid + '/' + $scope.token + '/' + $scope.service;

	$scope.confirm = function(social) {
		if (typeof social === "undefined") {
			if ($scope.customer && ($scope.service !== 'twitter') && ($scope.service !== 'facebook')) {
				return true;
			} else {
				return false;
			}
		}

		/* ghetto - bools become strings */
		if ($scope.confirmSocial === 'false') {
			return false;
		}
		return (social === $scope.service) ? true : false;
	}

	$scope.$on('rsvp-login-modal-init', function(e, args) {
		console.log('rsvp-login-modal-init happened');
		$scope.guid = rsvpLoginModal.get('guid');
		$scope.service = rsvpLoginModal.get('service');
		$scope.token = rsvpLoginModal.get('token');
		$scope.confirmSocial = rsvpLoginModal.get('confirmSocial');
	});


	$scope.authActions = {
		signup: function() {
			wembliRpc.fetch('customer.signup', {
				firstName: $scope.firstName,
				lastName: $scope.lastName,
				email: $scope.email,
				next: $scope.next
			}, function(err, result) {
				console.log(result);

				if (result.customer) {
					console.log('returned a customer - im logged in!');
					/* hide this modal and display the tickets offsite modal */
					$scope.customer = result.customer;
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

				var confirmSocialMap = {
					facebook: true,
					twitter: true
				};
				/* if the service is facebook or twitter they need to confirm social */
				if ((typeof confirmSocialMap[$scope.service] !== "undefined") && confirmSocialMap[$scope.service]) {
					$scope.confirmSocial = 'true';
				}

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
				password: $scope.password,
				next: $scope.next
			}, function(err, result) {
				console.log(result);
				if (result.error) {
					$scope.loginError = result.error;

					if (typeof result.noPassword !== "undefined") {
						$scope.noPassword = result.noPassword;
					} else if (result.invalidCredentials) {
						$scope.invalidCredentials = result.invalidCredentials;
					}
				}
				if (result.customer) {
					console.log('returned a customer im logged in!');
					/* hide this modal and display the tickets offsite modal */
					$scope.customer = result.customer;
				}

				if (result.loggedIn) {
					$rootScope.loggedIn = result.loggedIn;
				}

			})
		}
	};
};



function TicketsCtrl($scope, wembliRpc, fetchModals, plan, customer) {
	/* get the login modal */
	fetchModals.fetch('/partials/tickets-login-modal');

	/* display a modal when they click to go off and buy tickets */
	fetchModals.fetch('/partials/tickets-offsite', function(err) {
		if (err) {
			return console.log('no modal for buy tickets offsite');
		}
		plan.get(function(p) {
			$scope.plan = p;
			$scope.organizer = plan.getOrganizer();

			/* todo find out if this person is a friend invited to the plan */
			$scope.context = plan.getContext() || 'visitor';
			$scope.backToPlan = false;
			if ($scope.context === 'friend') {
				$scope.backToPlan = true;
			}
			if (plan.getFriends().length > 0) {
				$scope.backToPlan = true;
			}
		});
	});

	$scope.handlePriceRange = function() {
		/* post the updated preferences to the server */
		wembliRpc.fetch('plan.setTicketsPriceRange', {
			"low": $scope.priceRange.low,
			"med": $scope.priceRange.med,
			"high": $scope.priceRange.high,
		},

		function(err, res) {
			console.log('back from setting price range');
			console.log(res);
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

};

function TicketsLoginCtrl($rootScope, $scope, $location, plan, customer, wembliRpc) {
	$scope.plan = plan.get();
	$scope.$on('tickets-login-clicked', function(e, args) {
		$scope.redirectUrl = '/tickets/' + $scope.plan.event.eventId + '/' + $scope.plan.event.eventName + '/login/' + args.ticket.ID;
		$scope.ticket = args.ticket;
	});

	$scope.authActions = {
		signup: function() {
			wembliRpc.fetch('customer.signup', {
				firstName: $scope.firstName,
				lastName: $scope.lastName,
				email: $scope.email
			}, function(err, result) {
				console.log(result);

				if (result.customer) {
					console.log('returned a customer - im logged in!');
					/* hide this modal and display the tickets offsite modal */
					$scope.customer = result.customer;
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
				console.log(result);
				if (result.error) {
					$scope.loginError = result.error;

					if (typeof result.noPassword !== "undefined") {
						$scope.noPassword = result.noPassword;
					} else if (result.invalidCredentials) {
						$scope.invalidCredentials = result.invalidCredentials;
					}
				}
				if (result.customer) {
					console.log('returned a customer im logged in!');
					/* hide this modal and display the tickets offsite modal */
					$scope.customer = result.customer;
				}

				if (result.loggedIn) {
					$rootScope.loggedIn = result.loggedIn;
				}

			})
		}
	};
};

function TicketsOffsiteCtrl($scope, plan) {
	$scope.plan = plan.get();
	$scope.$on('tickets-offsite-clicked', function(e, args) {
		$scope.qty = args.qty;
		$scope.amountPaid = args.amountPaid;
		$scope.eventId = args.eventId,
		$scope.sessionId = args.sessionId,
		$scope.ticketGroup = args.ticketGroup;
	})

	$scope.showButton = function() {
		return ($scope.ticketsOffsite === 'bought');
	};

	$scope.submitForm = function() {
		if ($scope.ticketGroup === null) {
			console.log('no ticket group :(');
			return;
		}

		plan.addTicketGroup({
			service: 'tn',
			ticketGroup: $scope.ticketGroup,
			qty: $scope.qty,
			total: $scope.amountPaid,
			payment: JSON.stringify({
				transactionToken: $scope.sessionId,
				amount: $scope.amountPaid,
				qty: $scope.qty
			})
		}, function(err, results) {
			console.log(results);
		});
	};

	$scope.cancelForm = function() {
		$('#tickets-offsite-modal').modal('hide');
	};

};

function VenueMapCtrl($scope, interactiveMapDefaults, plan, $filter, customer) {
	plan.get(function(plan) {
		$scope.priceRange = {};
		$scope.eventOptionsLink = '/event-options/' + plan.event.eventId + '/' + plan.event.eventName;
		$scope.priceRange.low = plan.preferences.tickets.priceRange.low || true;
		$scope.priceRange.med = plan.preferences.tickets.priceRange.med || true;
		$scope.priceRange.high = plan.preferences.tickets.priceRange.high || true;
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

	$scope.determineTixAvailable = function(tix) {
		var highest = tix[0];
		angular.forEach(tix, function(el) {
			if (el > highest) {
				highest = el;
			}
		});
		var str = 'up to ' + highest + ' tix available';
		return str;
	}

};
