module.exports = function(app) {
    console.log('hotels loaded...');
    app.get('/hotels', function(req, res){
	res.render('hotels.jade', {
	        session: req.session,
		    cssIncludes: [],
		    jsIncludes: [],
		    title: 'wembli.com - hotels stuff.',
		    page:'hotels',
		    globals:globalViewVars
	});
    });
};