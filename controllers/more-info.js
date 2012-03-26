module.exports = function(app) {
    app.get('/more-info', function(req, res){
	res.render('more-info', {
	    cssIncludes: [],
	    jsIncludes: [],
	    title: 'wembli.com - More Info.',
	    page:'more-info',
	    layoutContainer: true	    
	});
	
    });
};