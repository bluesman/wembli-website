/* Controllers */
angular.module('wembliApp.controllers.search', []).

/*
 * Event List Controller
 */

controller('EventListCtrl', ['$scope', '$location', 'wembliRpc', '$filter', '$rootScope', 'plan', 'fetchModals', 'loadingModal', '$timeout',
	function($scope, $location, wembliRpc, $filter, $rootScope, plan, fetchModals, loadingModal, $timeout) {
		/* does nothing right now
	wembliRpc.fetch('eventlist.init', {},
	function(err, result) {

	});
	*/
		$scope.noMoreEvents = true;

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

					if (err) {
						//handle err
						alert('error happened - contact help@wembli.com');
						return;
					}

					if (!$scope.events) {
						$scope.events = [];
					}

					if (result.event.length < 1) {

						$scope.noMoreEvents = true;
					} else {
						$scope.noMoreEvents = false;
						$scope.events = $scope.events.concat(result['event']);
						var d = new Date($scope.events[$scope.events.length - 1].Date);
						$scope.lastEventDate = $filter('date')(d, "MM-dd-yy");
						$scope.lastEventId = $scope.events[$scope.events.length - 1].ID;
					}
					$timeout(function() {
						loadingModal.hide();
					}, 500);
				},

				function(data, headersGetter) {
					loadingModal.show('Loading Event Search...');
					return data;
				},

				function(data, headersGetter) {
					return JSON.parse(data);
				});

		};

		if ($rootScope.partial) {
			if ($location.search().search) {
				$scope.search = $location.search().search.replace(/\+/g, ' ');
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
	}
]).

/*
 * Event Controller
 */

controller('EventCtrl', ['$scope',
	function($scope) {}
]).


controller('SearchCtrl', ['$scope', '$rootScope',
	function($scope, $rootScope) {
		$rootScope.$broadcast('search-page-loaded', {});
	}
]);

