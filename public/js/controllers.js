function MainCtrl($scope, $window, footer) {};

function IndexCtrl($scope) {};

function ConfirmCtrl($scope, wembliRpc) {
	wembliRpc.fetch('confirm.init', {},
	//response

	function(err, result) {
		$scope.emailError = result.emailError;
		$scope.resent = result.resent;
		$scope.expiredToken = result.expiredToken;
	});
};

function EventOptionsCtrl($scope, $http, $compile, wembliRpc) {
	//init login vars
	var args = {};
	$scope.paymentOptionsError = false;
	$scope.addOnsError = false;
	$scope.inviteOptionsError = false;
	$scope.guestListOptionsError = false;

	wembliRpc.fetch('event.init', {},
	//response

	function(err, result) {
		$scope.payment = result.payment;
		$scope.parking = result.parking;
		$scope.restaurant = result.restaurant;
		$scope.hotel = result.hotel;
		$scope.guest_friends = result.guestFriends;
		$scope.guest_list = result.guestList;
		$scope.over_21 = result.over21;

		if(Object.keys(result.errors).length > 0) {
			$scope.paymentOptionsError = (result.errors.payment) ? true : false;
			$scope.addOnsError = (result.errors.addOns) ? true : false;
			$scope.inviteOptionsError = (result.errors.inviteOptions) ? true : false;
			$scope.guestListOptionsError = (result.errors.guestList) ? true : false;
		}
	});

	//putting the action in the form tells angular to submit it - se we have to prevent it here
	$('#event-options-form').submit(function(e) {
		e.preventDefault();
		return false;
	});

};

function EventListCtrl($scope, wembliRpc, $filter, $rootScope) {

	$scope.moreEvents = function() {
		//fetch the upcoming events
		var args = {
			"beginDate": $scope.lastEventDate,
			"nearZip": $scope.postalCode,
			"orderByClause": "Date",
			"lastEventId": $scope.lastEventId
		};

		wembliRpc.fetch('event.get', args,
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
			$('#more-events .spinner').show();
			return data;
		},

		//transformResponse

		function(data, headersGetter) {
			$('#more-events .spinner').hide();
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

function EventCtrl($scope) {};

function InviteCtrl($scope) {};

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

function FooterCtrl($scope, $location, $window) {};

function TicketsCtrl($scope, wembliRpc) {
	//console.log('eventId:' + $scope.eventId);
	//console.log($scope.eventName);
	console.log('tickets controller');

}
