module.exports = function(app) {
    console.log('index loaded...');
    app.get('/', function(req, res){
	if (typeof req.session.customer == "undefined" || (req.session.customer.confirmed == false)) {
	    delete req.session.signedUp;
	}
	res.render('index.jade', {
	        session: req.session,
		    cssIncludes: [],
		    jsIncludes: [],
		    title: 'wembli.com - home stuff.',
		    page:'index',
		    globals:globalViewVars
	});
    });
};