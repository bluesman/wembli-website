'use strict';

angular.module('adminApp.services', []).

factory('environment', ['$location',
	function($location) {
		var env = 'development';
		if (/www/.test($location.host())) {
			env = 'production';
		}
		return env;
	}
]).

/* BALANCED API config settings */
factory('balancedApiConfig', ['environment',
	function(environment) {
		var config = {
			'development': {
				'balancedMarketplace': 'TEST-MPlx4ZJIAbA85beTs7q2Omz',
			},
			'production': {
				'balancedMarketplace': 'MP22BmXshSp7Q8DjgBYnKJmi',
			}
		};

		var envConfig = config[environment];
		envConfig.balancedMarketplaceUri = '/v1/marketplaces/' + envConfig.balancedMarketplace;
		return envConfig;
	}
]);
