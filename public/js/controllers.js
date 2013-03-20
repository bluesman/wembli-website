/*
* Main Controller
*/
function MainCtrl($scope, $location, $window, footer) {
	//$('#page-loading-modal').modal({backdrop:"static",keyboard:false,hide:true});
};




/*
* Index Controller
*/
function IndexCtrl($scope, $templateCache, wembliRpc) {

	//clear the cache when the home page loads to make sure we start fresh
	$templateCache.removeAll();

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
		$scope.guest_list = result.guestList;
		$scope.over_21 = result.over21;

		if(Object.keys(result.errors).length > 0) {
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
function EventListCtrl($scope, wembliRpc, $filter, $rootScope) {
	/* does nothing right now
	wembliRpc.fetch('eventlist.init', {},
	function(err, result) {

	});
	*/

	$scope.showTicketSummary = function(e) {

		var elId = (typeof $(e.target).parents('li').attr('id') == "undefined") ? $(e.target).attr('id') : $(e.target).parents('li').attr('id');

		if(typeof $scope.ticketSummaryData == "undefined") {
			$scope.ticketSummaryData = {};
			$scope.ticketSummaryData.locked = false;
		}

		//if its locked that means we moused in while doing a fetch
		if($scope.ticketSummaryData.locked) {	return;	}

		//fetch the event data
		var args = { "eventID": elId.split('-')[0]	};

		//we have a cache of the data - gtfo
		if(typeof $scope.ticketSummaryData[elId.split('-')[0]] != "undefined") { return; }

		//lock so we don't fetch more than once (we will unlock when the http req returns)
		$scope.ticketSummaryData.locked = true;

		wembliRpc.fetch('event.getPricingInfo', args,

		function(err, result) {
			if(err) {
				//handle err
				alert('error happened - contact help@wembli.com');
				return;
			}

			$scope.ticketSummaryData[elId.split('-')[0]] = result;
			//we cached the result..lets unlock
			$scope.ticketSummaryData.locked = false;
			//init the popover
			var summaryContent = "";
			if(typeof result.ticketPricingInfo.ticketsAvailable !== "undefined") {
				if(result.ticketPricingInfo.ticketsAvailable === '0') {
					summaryContent = "Click for ticket information";
				} else {
					summaryContent = (result.ticketPricingInfo.ticketsAvailable === "1") ? result.ticketPricingInfo.ticketPricingInfo.ticketsAvailable + " ticket choice" : result.ticketPricingInfo.ticketsAvailable + " ticket choices";
					if(parseFloat(result.ticketPricingInfo.lowPrice) === parseFloat(result.ticketPricingInfo.highPrice)) {
						summaryContent += " from $" + parseFloat(result.ticketPricingInfo.lowPrice).toFixed(0);
					} else {
						summaryContent += " from $" + parseFloat(result.ticketPricingInfo.lowPrice).toFixed(0) + " to $" + parseFloat(result.ticketPricingInfo.highPrice).toFixed(0);
					}
				}
			} else {
				summaryContent = "Click for ticket information";
			}

			$('#' + elId).popover({
				placement: "left",
				trigger: 'hover',
				animation: true,
				title: 'Tickets Summary',
				content: summaryContent
			});
			$('#' + elId).popover('show');
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
	};

	$scope.hideTicketSummary = function(e) {
		var elId = (typeof $(e.target).parents('li').attr('id') == "undefined") ? $(e.target).attr('id') : $(e.target).parents('li').attr('id');
		$('#' + elId).popover('hide');

	};

	$scope.moreEvents = function() {
		//fetch the upcoming events
		var args = {
			"beginDate": $scope.lastEventDate,
			"orderByClause": "Date",
			"lastEventId": $scope.lastEventId
		};

		if($scope.search) {
			args.searchTerms = $scope.search;
			var method = 'event.search';
		} else {
			args.nearZip = $scope.postalCode;
			var method = 'event.get';
		}

		wembliRpc.fetch(method, args,
		//response callback

		function(err, result) {
			if(err) {
				//handle err
				alert('error happened - contact help@wembli.com');
				return;
			}

			if(!$scope.events) {
				$scope.events = [];
			}
			$scope.events = $scope.events.concat(result['event']);
			var d = new Date($scope.events[$scope.events.length - 1].Date);
			$scope.lastEventDate = $filter('date')(d, "MM-dd-yy");
			$scope.lastEventId = $scope.events[$scope.events.length - 1].ID;
		},

		//transformrequest

		function(data, Headersgetter) {
			$('.loading-icon').show();
			return data;
		},

		//transformresponse

		function(data, Headersgetter) {
			$('.loading-icon').hide();
			return JSON.parse(data);
		});

	};

	if($rootScope.partial) {
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
*/
function InviteFriendsWizardCtrl($http, $scope, $filter, $window, $location, $timeout, sequence, wembliRpc, customer, plan, facebook, twitter) {

	if ($location.path() !== '/invitation') {
		return;
	}

	$scope.invitedFriends = [];

	$scope.selectedFriends = {
		'step3':{},
		'step4':{},
		'step5':{}
	}

	var addToInvitedFriends = function(friend) {
		/* detect this friend in the invitedFriends list - if not there, add it */
		var exists = false;
		var found = false;
		var newList = [];
		console.log('adding friend');
		console.log(friend.contactInfo.name);

		angular.forEach($scope.invitedFriends,function(f) {
			console.log('comparing to');
			console.log(f.contactInfo.name);
			/* if this friend in the loop is the same as the one passed in */
			if ((f.contactInfo.service === friend.contactInfo.service) &&
				  (f.contactInfo.serviceId === friend.contactInfo.serviceId)) {
				console.log('this friend exists '+f.contactInfo.name);
				/* this friend is in the list */
				exists = true;
				found = true;
				/* this friend is no longer invited */
				if (!friend.inviteStatus) {
					console.log('friend is no longer invited');
					exists = false;
					return; /* don't add this friend to the newList */
				}

			}

			if (exists) {
				console.log('friend exists so add the new one to the list')
				newList.unshift(friend); /* push the new one and skip the old one */
			} else {
				if (f.inviteStatus) {
					console.log('friend does not exist')
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
		console.log(newList);
		$scope.invitedFriends = newList;
	};
	/* set up the view scope for the wizard */
	/* set up locally scoped variables */
	var wizard = {};

	/* set up scoping for each specific step */
	wizard.step1 = {
		rpcArgs: function() {
			var rpcArgs = {
				'firstName':$scope.customer.firstName,
				'lastName':$scope.customer.lastName,
				'email':$scope.customer.email,
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
				$scope.step1.invalidCredentials = true;
			}

			if (result.exists) {
				$scope.step1.error = true;
				$scope.step1.accoutExists = true;
			}

			if (!$scope.step1.error) {
				/* success - go to next step */
				$scope.gotoStep('step2');
			}
		},
	};

	/* save rsvp date */
	wizard.step2 = {
		rpcArgs: function(args) {
			var rpcArgs = {
				rsvpDate : $scope.plan.rsvpDate,
			};
			if (typeof args.next !== "undefined") {
				rpcArgs.next = args.next;
			}
			console.log('submitform args:');
			console.log(rpcArgs);
			return rpcArgs;
		},
		formSubmitCallback: function(err, result) {
			$('#invitation-modal').modal('loading');
			/* If There's A No Cust Error Send Them Back To Step-1 With An Error */
			if (result.nocustomer) {
				$scope.step1.error = true;
				$scope.step1.nocustomer = true;
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
				inviteStatus : false,
				imageUrl: null,
				service:'wemblimail',
				serviceId: $scope.wemblimail.email,
			}
			console.log('wemblimail submit form');
			console.log(rpcArgs);
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

			var friend     = result.friend;
			friend.checked = friend.inviteStatus;
			/* if this friend is not in the list of step5 selected friends, push it on the the wemblimail friends scope cause its a new one */
			if (typeof $scope.selectedFriends['step5'][friend.contactInfo.serviceId] === "undefined") {
				$scope.wemblimail.friends.unshift(friend);
				/* in submit reponse, do the formStatus fade */
				$scope.wemblimail.formStatus = true; /* this will make the element fade in */
			}

			/* tihs should make it fade out */
			var Promise = $timeout(function() {
				$scope.wemblimail.name        = null;
				$scope.wemblimail.email       = null;
				$scope.wemblimail.messageText = null;
				$scope.wemblimail.formstatus  = false;
			},1500);

			/* add this friend to the selected friends hash */
			$scope.selectedFriends['step5'][friend.contactInfo.serviceId] = friend.checked;
			console.log('added wemblimail friend');
			/* add this friend to the list of invited friends */
			addToInvitedFriends(friend);
		},

	};

	/* view methods */
	$scope.submitForm = function(step,args) {
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
		var nextStep = 'step' + (parseInt(step.charAt(step.length-1)) + 1);
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

	/* done with view methods */

	/* functions that interface between the social network services and the view scope */

	//these are callbacks to handle responses form the various social network service friend api calls

	//facebook first
	wizard.facebook = {
		handleFriendsFetch : function(response) {

			var mergePlanFriends = function(fbFriends,planFriends) {

				/* optimize this... */
				angular.forEach(fbFriends, function(f) {
					var me = this;
					angular.forEach(planFriends, function(f2) {
						if (f2.contactInfo.service === 'facebook' && (f2.contactInfo.serviceId == f.id) ) {
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
				$scope.$on('plan-fetched',function(e,args) {
					planFriends = plan.getFriends();
					mergePlanFriends(fbFriends,planFriends);
				})
			} else {
				planFriends = plan.getFriends();
				mergePlanFriends(fbFriends,planFriends);
			}
		},
		handleProfileFetch : function(response) {

			if (typeof response != "undefined") {
				$scope.facebook.firstName = response.first_name;
				$scope.facebook.lastName  = response.last_name;
				$scope.facebook.email     = response.email;

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
		loginStatusLoaded : false,
		friendFilterKey   : null,
		filterFriends     : function() {
			facebook.filterFriends($scope.facebook.friendFilterKey);
			$scope.facebook.friends = facebook.getFriends();
		},

		handleFriendClick: function(friend,$event) {
			/* if the thing that was clicked is the input we don't need to set checked */
			if ($event.target.localName !== "input") {
				friend.checked = friend.checked ? false : true;
			}
			$('#invitation-modal').modal('loading');
			return plan.addFriend({
				name:friend.name,
				inviteStatus: false,
				imageUrl:'https://graph.facebook.com/' + friend.id + '/picture',
				service:'facebook',
				serviceId:friend.id
			}, function(err,result) {
				console.log('back from plan.addFriend')
				/* If There's A No Cust Error Send Them Back To Step-1 With An Error */
				if (result.noCustomer) {
					$scope.step1.error = True;
					$scope.step1.noCustomer = True;
					return $scope.gotoStep('step1');
				}

				console.log('add facebook friend to invited friends');
				addToInvitedFriends(result.friend);

				if (friend.checked) {
					/* display the feed dialog */
					facebook.feedDialog({
						guid:$scope.plan.guid,
						token:result.friend.inviteStatusConfirmation.token,
						to:result.friend.contactInfo.serviceId,
						eventName:$scope.plan.event.eventName,
						venue:$scope.plan.event.eventVenue,
						rsvpDate:$('#rsvp-date').val()
					},function(response) {
						$('#invitation-modal').modal('loading');
						console.log('back from posting to friends wall');
						console.log(response);
						if (response === null) {
							console.log('setting friend back to checked = false');
							$scope.$apply(function() {
								friend.checked = false;
							});
						} else {
							/* hit the callback to set the inviteStatus to true */
							$http.get('/callback/facebook/rsvp/'+$scope.plan.guid+'/'+result.friend.inviteStatusConfirmation.token);
							friend.rsvp = result.friend.rsvp;
							//friend.rsvp.decision = null;
						}
					});
				}
			});
		},
		service : facebook
	}

	//if getAuth is null then set a listener
	if (facebook.getAuth() === null) {

		$scope.$on('facebook-login-status',function(e,args) {
			$scope.$apply(function() {
				$scope.facebook.loginStatusLoaded = true;
			});
			if (facebook.getAuth()) {
				facebook.api('/me',wizard.facebook.handleProfileFetch);
				facebook.api('/me/friends', wizard.facebook.handleFriendsFetch);
			}
		});
	} else {
		//its already been loaded
		$scope.facebook.loginStatusLoaded = true;
		if (facebook.getAuth()) {
			facebook.api('/me',wizard.facebook.handleProfileFetch);
			facebook.api('/me/friends', wizard.facebook.handleFriendsFetch);
		}
	}

	$scope.$on('facebook-login', function(e, args) {
		if (facebook.getAuth()) {
			facebook.api('/me',wizard.facebook.handleProfileFetch);
			/* they just completed facebook login - get the friends list */
			facebook.api('/me/friends', wizard.facebook.handleFriendsFetch);
		}
	});
	/* done with facebook code */



	/* twtter code */
	wizard.twitter = {
		handleSearchUsers:	function(response) {
			var mergePlanFriends = function(twitFriends,planFriends) {
				/* optimize this... */
				angular.forEach(twitFriends, function(f) {
					var me = this;
					angular.forEach(planFriends, function(f2) {
						if (f2.contactInfo.service === 'twitter' && (f2.contactInfo.serviceId == f.id) ) {
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
			console.log(twitFriends);
			if (plan.getFriends() === null) {
				$scope.$on('plan-fetched',function(e,args) {
					planFriends = plan.getFriends();
					mergePlanFriends(twitFriends,planFriends);
				})
			} else {
				planFriends = plan.getFriends();
				mergePlanFriends(twitFriends,planFriends);
			}
		},

	};

	var timer;
	$scope.twitter = {
		loginStatusLoaded : false,
		friendFilterKey   : null,
		filterFriends     : function() {
			twitter.filterFriends($scope.twitter.friendFilterKey);
			$scope.twitter.friends = twitter.getFriends();
		},
		charCount: 140,
		countChars : function(scope,elm,attr) {
			/* if for every http:// in the textarea, subtract 20 */
			var urlCount = ($scope.twitter.messageText.split('http').length - 1) * 20;
			matchUrl = new RegExp("(^|[ \t\r\n])(http|https):([a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*)","g");
			var rpl = $scope.twitter.messageText.replace(matchUrl,'');
			$scope.twitter.charCount = 140 - rpl.length - urlCount;
		},
		searchUsers : function() {
			$scope.twitter.spinner = true;
			clearTimeout(timer);
			timer=setTimeout(function() {
				twitter.searchUsers($scope.twitter.friendFilterKey,{},wizard.twitter.handleSearchUsers);
			},1000);
		},

		tweet: function(friend,$event) {
			twitter.tweet({tweet:$scope.twitter.messageText},function(err,res) {
				$('#invitation-modal').modal('loading');
				console.log('back from tweeting to friend');
				console.log(res);
				if (res === null) {
					console.log('setting friend back to checked = false');
					$scope.$apply(function() {
						friend.checked = false;
					});
				} else {
					console.log(friend);
					$http.get('/callback/twitter/rsvp/'+$scope.plan.guid+'/'+friend.inviteStatusConfirmation.token);
					friend.rsvp.decision = null;
					friend.checked = true;
				}
				$('#modal-'+friend.screen_name).modal("hide");
			});
		},

		handleFriendClick: function(friend,$event) {
			console.log('friend clicked');
			console.log(friend);
			$('#invitation-modal').modal('loading');
			return plan.addFriend({
				name:friend.name,
				inviteStatus: false,
				imageUrl:friend.profile_image_url_https,
				service:'twitter',
				serviceId:friend.id
			}, function(err,result) {
				/* If There's A No Cust Error Send Them Back To Step-1 With An Error */
				if (result.noCustomer) {
					$scope.step1.error = True;
					$scope.step1.noCustomer = True;
					return $scope.gotoStep('step1');
				}

				console.log('add twitter friend to invited friends');
				addToInvitedFriends(result.friend);

				/* should i just overwrite friend completely here? */
				friend.inviteStatusConfirmation = result.friend.inviteStatusConfirmation;
				friend.rsvp = result.friend.rsvp;
				/* display the tweet dialog box */
				$('#modal-'+friend.screen_name).modal("show");
				/* reset the tweet form data */
				var rsvpUrl = 'http://tom.wembli.com/rsvp/'+$scope.plan.guid+'/'+result.friend.inviteStatusConfirmation.token;
				$scope.twitter.messageText = '@'+friend.screen_name+' You\'re invited to an outing I\'m planning with @wembli | RSVP By '+$filter('date')(result.friend.rsvp.date,'M/d/yy')+' | '+rsvpUrl;
				$scope.twitter.countChars();
			});
		},
		service : twitter
	};

	//if getAuth is null then set a listener
	if (twitter.getAuth() === null) {
		$scope.$on('twitter-login-status',function(e,args) {
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
		friends:[],
	};

	//finally, show the invite friends modal once the document is ready
	//controller runs before the modal actually gets attached to the DOM
	//so setting up a listener for the event that is triggered when the modal is attached
	$scope.$on('invitation-modal-fetched', function(e, args) {
		console.log('modal fetched');
		//make sure plan is also fetched
		plan.get(function(planData) {
			console.log('handling fetched plan');
			//display the modal if there's a plan
			console.log(plan.get());
			if (typeof plan.get().event.eventId === "undefined") {
				console.log('eventid is undefined');
				return;
			}

			var initialStep = 'step1';
			if (customer.get() && Object.keys(customer.get()).length > 0) {
				initialStep = $location.hash() ? $location.hash() : 'step2';
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
			console.log('initial step: '+initialStep);
			$scope.gotoStep(initialStep);

			/* put the plan in the scope for the view */
			$scope.plan = plan.get();

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
							console.log('pushing fetched plan friends into invitedFriends')
							$scope.invitedFriends.push(friend);
					}
				};
			}
			console.log('invited friends');
			console.log($scope.invitedFriends);

			var showModal = function(dereg) {
				console.log('showing modal');
				/*
				there's a race condition
				sometimes we get here before the location.path has been set by wembli-sequence-link
				we know this if $scope.currentPath !== location.path()
				if that happens we have to set a watcher for currentPath instead of just using location.path()
					*/
				var startDate = new Date();
				var endDate = new Date($scope.plan.event.eventDate);
				var defaultDate = endDate;
				/* if there's an rsvp date, set it in the datepicker */
				if (typeof $scope.plan.rsvpDate !== "undefined") {
					/* init the date picker */
					console.log('init datepicker with plan rsvpdate:');
					console.log($scope.plan.rsvpDate);
					var defaultDate = new Date($scope.plan.rsvpDate);
				}

				$('.datepicker').pikaday({
					bound:false,
					minDate: startDate,
					maxDate:endDate,
					defaultDate:defaultDate,
					setDefaultDate:true,
					onSelect: function() {
						$scope.plan.rsvpDate = this.getDate();
						wembliRpc.fetch('invite-friends.submit-step2',{rsvpDate : $scope.plan.rsvpDate}, function(err,res) {
							console.log('changed rsvpdate');
							console.log(res);
						});
					}
				});

				if ($location.path() !== $scope.currentPath) {
					console.log('location path is diff from current path');
					$scope.$watch('currentPath',function(newVal,oldVal) {
						console.log('currentPath changed from: '+newVal+' to '+oldVal);
						if (newVal === '/invitation') {
							/* show the modal */
							$('#invitation-modal').modal({
								'backdrop': 'static',
								'keyboard': false,
							});
							$('#invitation-modal').modal("show");
						} else {
							console.log('new location is not invitation');
						}
					});
				} else {
					console.log('location path is the same as current path');
					if ($location.path() === '/invitation') {
						$('#invitation-modal').modal({
							'backdrop': 'static',
							'keyboard': false,
						});
						$('#invitation-modal').modal("show");
					} else {
						console.log('locatino path is not /invitation its' + $location.path());
					}
				};
				if (typeof dereg !== "undefined") {
					dereg();
				}

			};

			//if the event already fired and I missed it
			if ($scope.beforeNextFrameAnimatesIn || $scope.afterNextFrameAnimatesIn) {
				console.log('before next frame or afternext frame?');
				console.log('before:'+$scope.beforeNextFrameAnimatesIn);
				console.log('after'+$scope.afterNextFrameAnimatesIn);

				//show the modal right now
				showModal();
				//unregisterListener();
			} else {
				console.log('watch for beforeNextFrameAnimatesIn');
				var dereg = $scope.$watch('beforeNextFrameAnimatesIn',function(newVal, oldVal) {
					console.log('beforeNextFrameAnimatesIn happened');
					console.log(newVal);
					console.log(oldVal);
					if (newVal) {
						showModal(dereg);
					}
				});
			}
		});
	});
};

/*
* Plan Controller
*/
function PlanCtrl($rootScope, $scope, wembliRpc, plan, customer) {
	console.log('get plan in PlanCtrl');
	plan.get(function(plan) {
		console.log('got plan')
	});
};

function SearchCtrl($scope) {
}

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
		if(typeof $scope.firstName === "undefined") {
			return false;
		}
		if(typeof $scope.lastName === "undefined") {
			return false;
		}
		if(typeof $scope.email === "undefined") {
			return false;
		}
		if(typeof $scope.password === "undefined") {
			return false;
		}
		if(typeof $scope.password2 === "undefined") {
			return false;
		}
		if($scope.password !== $scope.password2) {
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
		if((typeof $scope.password == "undefined") || ($scope.password !== $scope.password2)) {
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

	var updateTicketsLink = function() {
		console.log('plan.get to updateTicketsLink');
		console.log(plan.get());
		$scope.ticketsLink = plan.get() ? '/tickets/'+plan.get().event.eventId+'/'+plan.get().event.eventName : '/tickets';
	};

	$scope.$on('plan-fetched',updateTicketsLink);
	plan.get(function(plan) {
		updateTicketsLink();
	});
};

function TicketsCtrl($scope, wembliRpc) {

	$scope.handlePriceRange = function() {
		/* post the updated preferences to the server */
		wembliRpc.fetch('plan.setTicketsPriceRange',{
			"low":$scope.priceRange.low,
			"med":$scope.priceRange.med,
			"high":$scope.priceRange.high,
		},
		function(err,res) {
			console.log('back from setting price range');
			console.log(res);
		});


		/* hide the tix they don't want to see */
		angular.forEach($scope.tickets,function(t) {
			/* if the price is <= 100 and priceRange.low filter is not checked then hide it*/
			t.hide = false;
			if( (parseInt(t.ActualPrice) <= 100) ) {
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
		if(typeof $scope.ticketSort === "undefined") {
			$scope.ticketSort = 1;
		}

		$scope.tickets.sort(function(a, b) {
			if($scope.ticketSort) {
				return a.ActualPrice - b.ActualPrice;
			} else {
				return b.ActualPrice - a.ActualPrice;
			}
		});

		$scope.ticketSort = ($scope.ticketSort) ? 0 : 1;
	}

	$scope.sortBySection = function() {
		if(typeof $scope.sectionSort === "undefined") {
			$scope.sectionSort = 1;
		}

		$scope.tickets.sort(function(a, b) {
			if($scope.sectionSort) {
				return a.Section.localeCompare(b.Section);
			} else {
				return b.Section.localeCompare(a.Section);
			}
		});

		$scope.sectionSort = ($scope.sectionSort) ? 0 : 1;
	}

	$scope.sortByQty = function() {
		if(typeof $scope.qtySort === "undefined") {
			$scope.qtySort = 1;
		}

		$scope.tickets.sort(function(a, b) {
			var cmpA = '';
			var cmpB = '';

			if(typeof a.ValidSplits.int === 'string') {
				cmpA = a.ValidSplits.int;
			} else {

				a.ValidSplits.int.sort();
				cmpA = a.ValidSplits.int[a.ValidSplits.int.length - 1];
			}


			if(typeof b.ValidSplits.int === 'string') {
				cmpB = b.ValidSplits.int;
			} else {

				b.ValidSplits.int.sort();
				cmpB = b.ValidSplits.int[b.ValidSplits.int.length - 1];
			}

			if($scope.qtySort) {
				return parseInt(cmpA) - parseInt(cmpB);
			} else {
				return parseInt(cmpB) - parseInt(cmpA);
			}
		});

		$scope.qtySort = ($scope.qtySort) ? 0 : 1;
	}
}

function VenueMapCtrl($scope, interactiveMapDefaults, plan, $filter) {
	console.log('plan.get venuemapctrl');
	plan.get(function(plan) {
		$scope.priceRange       = {};
		$scope.eventOptionsLink = '/event-options/'+plan.event.eventId+'/'+plan.event.eventName;
		$scope.priceRange.low   = plan.preferences.tickets.priceRange.low  || true;
		$scope.priceRange.med   = plan.preferences.tickets.priceRange.med  || true;
		$scope.priceRange.high  = plan.preferences.tickets.priceRange.high || true;
	});

	$scope.determineRange = function(price) {
		/* hard coded price range for now */
		var i = parseInt(price);
		if (i <= 100) { return '$'; }
		if (i > 100 && i <= 300) { return '$$'; }
		if (i > 300) { return '$$$'; }
	}

	$scope.determineTixAvailable = function(tix) {
		var highest = tix[0];
		angular.forEach(tix,function(el) {
			if (el > highest) {
				highest = el;
			}
		});
		var str = 'up to '+highest+' tix available';
		return str;
	}

}
