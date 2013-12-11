var http = require('http'),
	qs = require('querystring'),
	ESClient = require('elasticsearchclient');

var es = new ESClient({
	hosts: [{
		host: 'es01.wembli.com',
		port: 9200
	}]
});

exports.autocomplete = {
	events: function(args, req, res) {
		var me = this;
		var query = {
			"fields": ["EventID", "CCat", "TicketsYN", "Event", "Performer", "City", "State", "DateTime"],
			"query": {
				"bool": {
					"must": [{
						"fuzzy": {
							"events.Event": {
								"value": formData.q + "*",
								"max_expansions": "2"
							}
						}
					}]
				}
			},
			"from": 0,
			"size": 20,
			"sort": [{
					"events.NumOrders": {
						"order": "desc"
					}
				}, {
					"events.DateTime": {
						"order": "asc"
					}
				},
				"_score"
			]
		};

		es.search('ticket_network', 'events', query, function(err, data) {
			var d = JSON.parse(data);
			if (typeof d.hits !== "undefined") {
				d.hits.hits.map(function(obj) {
					console.log(obj);
				});
				me(null, d.hits.hits);

			} else {
				me(null);
			}
		});

	}
};
