'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('wembliApp.services', [])

.factory('initRootScope', ['$window', '$rootScope', function($window, $rootScope) {
	$rootScope.tnUrl = 'https://tickettransaction2.com/Checkout.aspx?brokerid=5006&sitenumber=0';

	$rootScope.partial = false; //partial starts as false, indicating the the full page was loaded from server without any ajax partials
	//init some scope vars
	$rootScope.currentPath = $window.location.pathname;
	//if there is a class 'animate-in' in the doc,then set currentFrame = 2 which will make the frame animate in
	$rootScope.currentFrame = ($('#content').find('.animate-in')[0]) ? 2 : 1;

	//templates can't make a date for some reason
	$rootScope.getDate = function(d) {
		return new Date(d);
		//return $filter('date')(d, "MM-dd-yy");
	}

}])

.factory('interactiveMapDefaults', [function() {
	return {
		ServiceUrl:"https://imap.ticketutils.com",
		MapSet:"tn",
		ZoomLevel:2,
		ColorScheme:1,
		//AutoSwitchToStatic: true,
		ControlsPosition: "Outside",
		FailOverMapUrl:"http://data.ticketutils.com/Charts/No-Seating-Chart.jpg",
		GroupsContainer: "#groups-container",
		RowSelector: ".ticket-row",
		SectionSelector: ".ticket-section",
		PriceSelector: ".actual-price",
		QuantitySelector: ".ticket-quantity",
		eTicketSelector: ".e-ticket"
	};
}])

.factory('wembliRpc',['$rootScope','$http', function($rootScope,$http) {
	var wembliRpc = {};

	var jsonRpc = {
		"jsonrpc": "2.0",
		"id": 1,
		"params":{}
	};


	wembliRpc.fetch = function(method,args,callback,transformRequest,transformResponse) {
		jsonRpc.method = method;
		jsonRpc.params.args = args;
		var data = JSON.stringify(jsonRpc);

		var cb = function(err,data) {
			var eventName = 'wembliRpc:';
			$rootScope.$broadcast(eventName+'success',{'method':method});
			var ret = callback(err,data);
			$rootScope.$broadcast(eventName+'callbackComplete',{'method':method});
		}

		if (typeof transformRequest === "undefined") {
			transformRequest = function(data) {	return data; }
		}

		if (typeof transformResponse === "undefined") {
			transformResponse = function(data) {	return JSON.parse(data); }
		}

		return $http.post('/', data, {
			headers: {"Content-Type": "application/json"},
			transformRequest: transformRequest,
			transformResponse: transformResponse
		}).success(function(data,status) {
			var result = {};
			result.data = data;
			result.status = status;
			return cb(null,result.data.result);
		}).error(function(err) {
			callback(err);
		});
	};

	return wembliRpc;
}])

//this is the order of the frames so sequence knows which direction to slide the frame
.factory('footer', ['initRootScope', '$rootScope', '$location', function(initRootScope, $scope, $location) {
	var footer = {};
	//get the class names of the li elements in the #nav
	footer.framesMap = {};
	angular.element('#nav').children().each(function(i, e) {
		//hack for index
		if (e.id == 'index') {
			footer.framesMap['/'] = i;
		} else {
			footer.framesMap['/' + e.id] = i;
		}
	});

	footer.slideNavArrow = function() {
		footer.currentPath = $location.path();
		//append a fake element to #footer to get the left css property of end
		var startClass = 'center-' + $scope.currentPath.split('/')[1];
		var endClass = 'center-' + $location.path().split('/')[1];

		if (startClass == endClass) {
			startClass = 'center-';
		}

		//activate/deactivate the search button
		if ($location.path() === '/search') {
			$('#nav-search').addClass('active');
		} else {
			$('#nav-search').removeClass('active');
		}

		//if there already is a footer-left-position element, just update the class, else make a new hidden div
		if ($('#footer #footer-left-position').length > 0) {
			$('#footer #footer-left-position').attr('class', endClass);
		} else {
			$('#footer').append('<div id="footer-left-position" class="' + endClass + '"" style="display:none;position:absolute;height:0;width:0;"/>');
		}
		var moveTo = $('#footer #footer-left-position').css('left');

		if (moveTo == 'auto') {
			//hide the nav arrow
			$('#nav-arrow').hide();
		} else {
			$('#nav-arrow').show();
			$('#nav-arrow').animate({
				left: moveTo
			}, 1000, function() {
				$('#nav-arrow').removeClass(startClass)
				$('#nav-arrow').addClass(endClass);
			});
		}
	}
	return footer;
}])

//wrap the jquery sequence plugin
.factory('sequence', ['initRootScope', '$rootScope', '$window', 'footer', function(initRootScope, $scope, $window, footer) {

	var options = {
		startingFrameID: 1,
		preloader: false,
		animateStartingFrameIn: false,
		transitionThreshold: false,
		autoPlay: false,
		cycle: true,
		keyNavigation: false,
		swipeNavigation: false
	};

	//make the page animate in
	if ($scope.currentFrame == 2) {
		options.animateStartingFrameIn = true;
		options.startingFrameID = 2;
	}

	footer.slideNavArrow();

	//init the sequence (page slider)
	return angular.element("#content").sequence(options).data("sequence");
}]).value('version', '0.0.1');
