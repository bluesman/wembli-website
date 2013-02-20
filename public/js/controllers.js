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
	//console.log($templateCache.info());
	//clear the cache when the home page loads to make sure we start fresh
	$templateCache.removeAll();
	//console.log($templateCache.info());
	wembliRpc.fetch('index.init', {},
	//response

	function(err, result) {
		console.log(result);
	});
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
	//response

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

	wembliRpc.fetch('eventlist.init', {},
	//response

	function(err, result) {
		console.log(result);
	});


	$scope.showTicketSummary = function(e) {

		var elId = (typeof $(e.target).parents('li').attr('id') == "undefined") ? $(e.target).attr('id') : $(e.target).parents('li').attr('id');

		if(typeof $scope.ticketSummaryData == "undefined") {
			$scope.ticketSummaryData = {};
			$scope.ticketSummaryData.locked = false;
		}

		//if its locked that means we moused in while doing a fetch
		if($scope.ticketSummaryData.locked) {
			return;
		}

		//fetch the event data
		var args = {
			"eventID": elId.split('-')[0]
		};

		//we have a cache of the data - gtfo
		if(typeof $scope.ticketSummaryData[elId.split('-')[0]] != "undefined") {
			return;
		}

		//lock so we don't fetch more than once (we will unlock when the http req returns)
		$scope.ticketSummaryData.locked = true;

		wembliRpc.fetch('event.getPricingInfo', args,

		//response callback

		function(err, result) {
			if(err) {
				//handle err
				alert('error happened - contact help@wembli.com');
				return;
			}

			$scope.ticketSummaryData[elId.split('-')[0]] = result;
			//we cached the result..lets unlock
			$scope.ticketSummaryData.locked = false;
			//console.log('result for:'+elId);
			//console.log(result);
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
		//console.log('mouseout: '+elId);
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

		//transformRequest

		function(data, headersGetter) {
			$('.loading-icon').show();
			return data;
		},

		//transformResponse

		function(data, headersGetter) {
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
function InviteFriendsWizardCtrl($scope, $window, $location, sequence, wembliRpc, customer, plan, facebook, twitter) {
	console.log('invite friends wizard controller running');
	if ($location.path() !== '/invitation') {
		return;
	}

	/* initialize step view scopes */
	$scope.step1 = {readonly : false};

	/* set up the view scope for the wizard */
	/* set up locally scoped variables */
	var wizard = {};

	/* set up scoping for each specific step */
	wizard.step1 = {
		rpcArgs: function() {
			return {
				'firstName':$scope.customer.firstName,
				'lastName':$scope.customer.lastName,
				'password':$scope.customer.password,
				'password2':$scope.customer.password2,
				'email':$scope.customer.email
			};
		},

		formSubmitCallback: function(err, result) {
			console.log('back from submit step1')
			console.log(result);
			$scope.step1.formError = false;
			$scope.step1.error = false;
			//error checking
			$scope.step1.accountExists = (result.exists) ? true : false;

			if(result.formError) {
				console.log('formError is true');
				$scope.step1.error = true;
				$scope.step1.formError = true;
			}

			if (!$scope.step1.error) {
				$scope.step1.readonly = true;
				$scope.gotoStep('step2');
			}
		},
	};

	//facebook friends
	wizard.step2 = {
		rpcArgs: function(args) {
			var rpcArgs = {
				message : $scope.facebook.messageText,
			};
			if (args.friend) {
				rpcArgs.friend = args.friend;
			}
			if (typeof args.next !== "undefined") {
				rpcArgs.next = args.next;
			}
			return rpcArgs;
		},
		formSubmitCallback: function(err, result) {
			console.log(result);
			/* if there's a no cust error send them back to step-1 with an error */
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



	/* view methods */
	$scope.submitForm = function(step,args) {
		console.log('submitForm for ' + step);
		console.log($scope[step]);
		if ($scope[step].$valid) {
			wembliRpc.fetch('invite-friends.submit-' + step, wizard[step].rpcArgs(args), wizard[step].formSubmitCallback);
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
			return true;
		}
		return (friend.rsvp.decision === null) ? true : false;
	};

	$scope.handleFriendClick = function(step,friend) {
		friend.checked = friend.checked ? false : true;
		return $scope.submitForm(step,{friend:friend});
	};


	//done with view methods

	/* functions that interface between the social network services and the view scope */

	//these are callbacks to handle responses form the various social network service friend api calls

	//facebook first
	wizard.facebook = {
		handleFriendsFetch : function(response) {
			console.log('got friends');

			var mergePlanFriends = function(fbFriends,planFriends) {
				console.log('merging friends');
				console.log(planFriends);

				/* optimize this... */
				angular.forEach(fbFriends, function(f) {
					var me = this;
					angular.forEach(planFriends, function(f2) {
						if (f2.contactInfo.service === 'facebook' && (f2.contactInfo.serviceId == f.id) ) {
							f.inviteStatus = f2.inviteStatus;
							f.checked = f2.inviteStatus;
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
					console.log('registering listener for plan-fetched')
					planFriends = plan.getFriends();
					mergePlanFriends(fbFriends,planFriends);
				})
			} else {
				planFriends = plan.getFriends();
				mergePlanFriends(fbFriends,planFriends);
			}
		},
		handleProfileFetch : function(response) {
			console.log('facebook profile response');
			console.log(response);

			if (typeof response != "undefined") {
				$scope.facebook.firstName = response.first_name;
				$scope.facebook.lastName  = response.last_name;
				$scope.facebook.email     = response.email;

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

	$scope.facebook = {
		loginStatusLoaded : false,
		friendFilterKey   : null,
		filterFriends     : function() {
			facebook.filterFriends($scope.facebook.friendFilterKey);
			$scope.facebook.friends = facebook.getFriends();
		},
		service : facebook
	}

	//if getAuth is null then set a listener
	if (facebook.getAuth() === null) {
		console.log('facebook auth is null - set a listener');
		$scope.$on('facebook-login-status',function(e,args) {
			$scope.$apply(function() {
				$scope.facebook.loginStatusLoaded = true;
			});
			if (facebook.getAuth()) {
				facebook.api('/me',wizard.facebook.handleProfileFetch);
			}
			facebook.api('/me/friends', wizard.facebook.handleFriendsFetch);
		});
	} else {
		//its already been loaded
		console.log('facebook auth is not null - update scope now');
		$scope.facebook.loginStatusLoaded = true;
		if (facebook.getAuth()) {
			facebook.api('/me',wizard.facebook.handleProfileFetch);
		}
		facebook.api('/me/friends', wizard.facebook.handleFriendsFetch);
	}

	$scope.$on('facebook-login', function(e, args) {
		if (facebook.getAuth()) {
			facebook.api('/me',wizard.facebook.handleProfileFetch);
		}
		//they just completed facebook login - get the friends list
		facebook.api('/me/friends', wizard.facebook.handleFriendsFetch);
	});
	/* done with facebook code */



	/* twtter code */
	wizard.twitter = {
		handleFriendsfetch:	function(response) {
			$scope.twitter.friends = twitter.getFriends();
		},
	};

	$scope.twitter = {
		loginStatusLoaded : false,
		friendFilterKey   : null,
		filterFriends     : function() {
			twitter.filterFriends($scope.twitter.friendFilterKey);
			$scope.twitter.friends = twitter.getFriends();
		},
		service : twitter
	};

	$scope.$on('twitter-login-status', function(e, args) {
		//the twitter step can't load until we check the login status (should happen real quick)
		//hide the loader and show the page
		$scope.twitterLoginStatusLoaded = true;

	});

	/* done with twitter code */


	/* now we can try to display the wizard */
	//make sure customer is fetched
	var handleCustomerFetched = function(e,args) {
		var initialStep = 'step1';
		if (customer.get()) {
			initialStep = 'step2';
			$scope.customer = customer.get();
		} else {
			$scope.customer = {};
		}
		console.log('starting on '+initialStep);
		$scope.gotoStep(initialStep);
	};

	//decide which step to start on depending on if they are logged in or not
	if (typeof customer.get() === null) {
		console.log('customer has not been fetched');
		//customer has not been fetched yet set up a listener
		$scope.$on('customer-fetched', handleCustomerFetched);
	} else {
		console.log('customer has been fetched');
		//customer has already been fetched
		handleCustomerFetched();
	}


	//finally, show the invite friends modal once the document is ready
	//controller runs before the modal actually gets attached to the DOM
	//so setting up a listener for the event that is triggered when the modal is attached
	$scope.$on('invitation-modal-fetched', function(e, args) {
		console.log('invitation-modal-fetched');

		//make sure plan is also fetched
		var handlePlanFetched = function(e, args) {
			console.log('plan has been fetched');
			console.log('plan is:');
			console.log(plan.get());

			//display the modal if there's a plan
			if(plan.get()) {
				console.log('already have a plan');

				/* seems like the right place to add our messaging to the scope */
				if (typeof plan.get().messaging !== "undefined") {
					$scope.facebook.messageText = plan.get().messaging.facebook;
				}

				var showModal = function() {

					console.log('location path is: '+$location.path())
					if ($location.path() === '/invitation') {
						console.log('showing the modal');
            //show the modal
            $('#invitation-modal').modal({
            	'backdrop': 'static',
            	'keyboard': false,
            });
            $('#invitation-modal').modal("show");
          }
				};

				//if the event already fired and I missed it
				if ($scope.beforeNextFrameAnimatesIn || $scope.afterNextFrameAnimatesIn) {
					console.log('after nextframe animates in');
					//show the modal right now
					showModal();
					//unregisterListener();
				} else {
					$scope.$watch('beforeNextFrameAnimatesIn',function(newVal, oldVal) {
						if (newVal) {
							showModal();
						}
					});
				}
	    } else {
	    	console.log("no plan :( don't display the wizard modal");
		    //no plan - reload the invitation page
		    //$window.location.reload();
		  }

		};

		//check if plan is already fetched
		if (plan.get() === null) {
			//not fetched yet, set a watcher
		  //dont do anything until the plan is loaded
		  $scope.$on('plan-fetched', handlePlanFetched)
		} else {
			//plan has already been fetched
			handlePlanFetched();
		}
	});
}

/*
* Plan Controller
*/
function PlanCtrl($rootScope, $scope, wembliRpc, plan, customer) {
	//init vars
	var args = {};

	wembliRpc.fetch('plan.init', {},

	//response
	function(err, result) {
		console.log(result);

		if(typeof result.plan !== "undefined") {
			plan.set(result.plan,result.friends);
			$rootScope.$broadcast('plan-fetched',{});
		}

		if(typeof result.customer !== "undefined") {
			customer.set(result.customer);
			$rootScope.$broadcast('customer-fetched',{});
		}

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
			console.log('no match');
			$('#error .error-text').show();
			return false;
		}
	});
};

function FooterCtrl($scope, $location, $window) {
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
};

function TicketsCtrl($scope, wembliRpc) {
	//console.log('eventId:' + $scope.eventId);
	//console.log($scope.eventName);
	console.log('tickets controller');
	$('#page-loading-modal').modal({
		backdrop: "static",
		keyboard: false,
		hide: true
	});

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

function VenueMapCtrl($scope, interactiveMapDefaults) {}
