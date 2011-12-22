module.exports = function(app) {
    console.log('restaurants loaded...');
    app.get('/restaurants', function(req, res){
	res.render('restaurants.jade', {
	        session: req.session,
		    cssIncludes: [],
		    jsIncludes: [],
		    title: 'wembli.com - restaurants stuff.',
		    page:'restaurants',
		    globals:globalViewVars
	});
    });
};