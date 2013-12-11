var http = require('http'),
	qs = require('querystring'),
	ESClient = require('elasticsearchclient');

var es = new ESClient({
	hosts: [{
		host: 'es01.wembli.com',
		port: 9200
	}]
});

module.exports = function(app) {
	app.get('/typeahead/:index/:query', function(req, res) {
		console.log(req.params.query);
		console.log(req.params.index);

		var queryMap = {
			'events': 'Event',
			'performers': 'PerformerName',
			'venues':'venuename'
		};

		var fields = ["CCat", "City", "State", "DateTime"];
		fields.push(queryMap[req.params.index]);

		var query = {
			"fields": fields,
			"query": {
				"bool": {
					"must": [{
						"fuzzy": {}
					}]
				}
			},
			"from": 0,
			"size": 5,
			"sort": [{}, {},"_score"]
		};

		var str = req.params.index + '.' + queryMap[req.params.index];
		query.query.bool.must[0].fuzzy[str] = {
			"value": req.params.query+'*',
			"max_expansions": "2"
		};

		if (req.params.index === 'events') {
			var numOrders = req.params.index + '.NumOrders';
			query.sort[0][numOrders] = {
				"order":"desc"
			};

			var dateTime = req.params.index + '.DateTime';
			query.sort[1][dateTime] = {
				"order":"asc"
			}
		}

		console.log(query.query.bool.must);

		es.search('ticket_network', req.param.index, query, function(err, data) {
			var d = JSON.parse(data);
			console.log(d.hits.hits);
			if (typeof d.hits.hits[0] !== "undefined") {
				var j = [];
				d.hits.hits.map(function(obj) {
					obj.value = obj.fields[queryMap[req.params.index]];
					obj.tokens = obj.fields[queryMap[req.params.index]].split(' ');
					j.push(obj);
					console.log(obj);
				});
				return res.json(j);
			} else {
				return res.json('');
			}
		});
	});
};
