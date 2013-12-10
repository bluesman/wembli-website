angular.module('wembliApp.services.pixel', []).

/* pixel */
factory('pixel', ['$http', 'wembliRpc',
	function($http, wembliRpc) {
		var self = this;
		self.pixelsFired = {};

		return {
			/*
				EXAMPLE:
					pixel.fire({
						type: 'signup',
						campaign: 'Chargers Fans',
						source: 'facebook',
						medium: 'cpc',
						term: '',
						content: '603245683921'
					});

				content is used as the unique identifier for the pixel
				source corresponds to a directory with the pixel partial
				content is the filename of the pixel partial

			*/
			fire: function(args, cb) {
				if (typeof self.pixelsFired[args.content] === "undefined") {

					console.log('pixel args: ');
					console.log(args);

					/* fetch the facebook conversion snippet and add the pixel id to it - then compile it */
					var getArgs = {
						method: 'get',
						cache: false,
						url: '/partials/pixel/' + args.source + '/' + args.content
					}; //args for the http request

					/* fetch the partial */
					$http(getArgs).success(function(data, status, headers, config) {
						$(data).insertBefore($('script')[0]);

						self.pixelsFired[args.content] = true;

						wembliRpc.fetch('analytics.addEvent', {
							collection: "conversion",
							type: args.type,
							source: args.source,
							medium: args.medium,
							term: args.term,
							campaign: args.campaign,
							content: args.content
						}, function(err, result) {
							if (typeof cb !== "undefined") {
								cb(err, result);
							}
						});

					});
				}
			}
		}
	}
]);
