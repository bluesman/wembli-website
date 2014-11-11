/* Controllers */
angular.module('wembliApp.controllers.header', []).

controller('HeaderCtrl', ['$scope', '$aside',
	function($scope, $aside) {
		/*
		var myAside = $aside({title: 'My Title', content: 'My Content', show: true});

		*/
		$scope.aside = {
			"title": "Title",
			"content": "Content"
		}

	}
]);
