'use strict';

    console.log('started big loop in directives');
    for (var i = 0; i < 99999; i++) {
    	for (var j = 0; j < 9999; j++) {
    		continue;
    	};
    };
    console.log('finished big loop in directives');

console.log('directives are executing');
/* Directives */
angular.module('testApp.directives', []).

directive('testDirective', ['$rootScope', 'stack', '$timeout',
	function($rootScope, stack, $timeout) {
		console.log('pushing stack in testDirective outer func');
		stack.push('in testDirective outer func');

		return {
			restrict: 'E',
			controller: ['stack',
				function(stack2) {
					$timeout(function() {
						console.log('started big loop in testDirective controller');
						for (var i = 0; i < 99999; i++) {
							for (var j = 0; j < 9999; j++) {
								continue;
							};
						};
						console.log('finished big loop in testDirective controller');

					});
						console.log('pushing stack in testDirective controller');
						stack.push('in testDirective controller');
						console.log('pushing stack2 in testDirective controller');
						stack2.push('stack2 in testDirective controller');
				}
			],
			compile: function(element, attr, transclude) {
				console.log('pushing stack in testDirective compile');
				stack.push('in testDirective compile');
				return function(scope, element, attr) {
					console.log('pushing stack in testDirective link');
					stack.push('in testDirective link');
				}
			}
		}
	}
]).
directive('testBodyDirective', ['$rootScope', 'stack', '$timeout', 'usedlater',
	function($rootScope, stack, $timeout, usedlater) {
		console.log('pushing stack in testBodyDirective outer func');
		stack.push('in testBodyDirective outer func');
		return {
			restrict: 'C',
			controller: ['stack',
				function(stack2) {

					$timeout(function() {
						console.log('started big loop in testBodyDirective controller');
						for (var i = 0; i < 99999; i++) {
							for (var j = 0; j < 9999; j++) {
								continue;
							};
						};
						console.log('finished big loop in testBodyDirective controller');
					});

					console.log('pushing stack in testBodyDirective controller');
					stack.push('in testBodyDirective controller');
					console.log('pushing stack2 in testBodyDirective controller');
					stack2.push('stack2 in testBodyDirective controller');
				}
			],
			compile: function(element, attr, transculde) {
				console.log('pushing stack in testBodyDirective compile');
				stack.push('in testBodyDirective compile');
				return function(scope, element, attr, controller) {
					scope.test = {};
					console.log('pushing stack in testBodyDirective link');
					stack.push('in testBodyDirective link');
					scope.test.model = 'test.model';
				}
			},
		}
	}
]);
