module.exports = function(app) {
    console.log('tickets loaded...');
    app.get('/tickets', function(req, res){
	res.render('tickets.jade', {
	        session: req.session,
		    cssIncludes: [],
		    jsIncludes: [],
		    title: 'wembli.com - tickets.',
		    page:'tickets',
		    globals:globalViewVars
	});
    });
};