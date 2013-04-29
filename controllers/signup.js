var customerRpc      = require('../rpc/customer').customer;

module.exports = function(app) {

	app.get('/signup', function(req, res) {
		res.render('signup', {
			title: 'wembli.com - Signup now.',
		});
	});

	app.post(/\/signup\/?/, function(req, res) {

		customerRpc['signup'].apply(function(err,results) {
			if (err) {	return res.redirect('/signup');	}

			console.log('results from customerRpc signup');
			console.log(results);

			if (results.exists) {
				return res.redirect('/signup');
			}

			if (results.error) {
				return res.redirect('/signup');
			}

			/* not exists and no error - woohoo */
			/* if there is a redirectUrl, show a flash message indicating successful signup */
			var redirectUrl = '/dashboard';
			if (req.param('redirectUrl')) {
				redirectUrl = req.param('redirectUrl');
			}
			return res.redirect(redirectUrl);

		},[{email:req.param('email'),
				firstName:req.param('firstName'),
				lastName:req.param('lastName'),
				next:req.param('next')},req,res]);

	});

};
