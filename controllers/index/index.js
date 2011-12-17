module.exports = function(app) {
    console.log('index loaded...');
    app.get('/', function(req, res){
	res.render('index.jade', {
	            session: req.session,
		    cssIncludes: [],
		    jsIncludes: [],
		    title: 'wembli.com - coming soon.'
	});
    });
};