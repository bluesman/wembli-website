/* Filters */
angular.module('wembliApp.filters.plan', []).

//- plan
filter('chatterDateString', ['$filter',
	function($filter) {
		return function(date) {
			return createdAgoString(date, $filter);
		};
	}
]).

//- plan
filter('historyStatus', [
	function() {
		return function(historyStatus) {
			if (typeof historyStatus === "undefined") {
				return 'logged';
			}
			var historyStatusFilter = {
				'queued': 'Sending Email',
				'delivered': 'Email Sent',
				'opened': 'Email Opened',
				'responded': 'Payment Posted',
				'received': 'Payment Received',
			}

			return (typeof historyStatusFilter[historyStatus] !== "undefined") ? historyStatusFilter[historyStatus] : historyStatus;
		}
	}
]);
