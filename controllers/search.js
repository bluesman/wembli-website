var querystring = require('querystring');
var eventRpc      = require('../rpc/event').event;

module.exports = function(app) {

	//these come from the more events button
	app.get('/search/:city/:from', function(req,res) {

		var whereClause = '';
		if (req.param('from')) {
			whereClause = 'Date > DateTime("' + req.param('from') + '")';
		}

		var args = {
				searchTerms: req.param('city'),
				whereClause: whereClause,
				orderByClause: 'Date'
		};

		eventRpc['search'].apply(function(err,results) {
			console.log('results from eventrpc: ');
			console.log(results);

			res.render('index', {
				search: req.param('city'),
				events: results.event,
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			});
		},[args,req,res]);
	});


	app.get('/search/:query?', function(req, res) {
		console.log(req.param('search'));

		var title = 'Wembli Search';

		var query = req.param('query') ? querystring.unescape(req.param('query')).replace(/\+/g,' ') : querystring.unescape(req.param('search')).replace(/\+/g,' ');
		console.log('query: '+query);
		if (!query) {
			return res.redirect('/');
		}

		query.replace('+',' ');

		var args = {
			searchTerms: query,
			orderByClause: 'Date'
		};

		eventRpc['search'].apply(function(err,results) {
			console.log('results from eventrpc: ');
			console.log(results);

			res.render('index', {
				search: query,
				events: results.event,
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			});
		},[args,req,res]);
	});
}
