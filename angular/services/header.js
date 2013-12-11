'use strict';

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('wembliApp.services.header', []).

factory('header', [
	function() {
		var self = this;

		return {
			init: function(header, scroll) {
				header = header || '#header';
				scroll = scroll || 'window';
				/* window is a special case - use the window obj */
				if (scroll === 'window') {
					scroll = window;
				}

				self.prevScroll = angular.element(scroll).scrollTop();

				angular.element(header).show();
				angular.element(scroll).on('scroll', function() {
					/* at the top? */
					if (angular.element(scroll).scrollTop() < 1) {
						angular.element(header).show();
						return;
					}

					/* at the bottom? */
					if (angular.element(scroll).height() < angular.element(scroll).scrollTop()) {
						angular.element(header).hide();
						return;
					}

					/* are we scrolling up or down? */
					if (angular.element(scroll).scrollTop() > self.prevScroll) {
						if (angular.element(header).is(':visible')) {
							angular.element(header).fadeOut(250);
						}
					} else {
						if (!angular.element(header).is(':visible')) {
							angular.element(header).fadeIn(250);
						}
					}

					self.prevScroll = angular.element(scroll).scrollTop();
				});
			},
			fixed: function() {
				angular.element(scroll).off('scroll');
			}
		}
	}
]);
