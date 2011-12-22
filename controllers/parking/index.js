module.exports = function(app) {
    console.log('parking loaded...');
    app.get('/parking', function(req, res){
	res.render('parking.jade', {
	        session: req.session,
		    cssIncludes: [],
		    jsIncludes: [],
		    title: 'wembli.com - parking stuff.',
		    page:'parking',
		    globals:globalViewVars
	});
    });
};