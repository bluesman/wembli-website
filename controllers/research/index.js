module.exports = function(app) {
    console.log('research loaded...');
    app.get('/research', function(req, res){
	res.render('research.jade', {
	        session: req.session,
		    cssIncludes: [],
		    jsIncludes: [],
		    title: 'wembli.com - Research.',
		    page:'research',
		    globals:globalViewVars
	});
    });
};