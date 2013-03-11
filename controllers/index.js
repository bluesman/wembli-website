
module.exports = function(app) {

	app.get('/', function(req, res) {

		res.render('index', {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
		});

	});

	app.get('/terms-policies', function(req, res) {
		res.render('terms-policies.jade', {
			title: 'wembli.com - Terms & Policies.'
		});

	});


	app.get('/style-guide', function(req, res) {
		res.render('style-guide.jade', {
			title: 'wembli.com - we got style yo!'
		});
	});

	app.get('/email/:template', function(req,res) {
		var argsMap = {
			'welcome': {

			},
			'signup' : {
				confirmLink:'#',
			},
			'rsvp': {
				rsvpDate: Date.today(),
				rsvpLink:'#',
				message: "hey man come join me at this event - it'll be a blast",
			}

		};

		return res.render('email-templates/'+req.param('template'),argsMap[req.param('template')]);

	});

};

