module.exports = function(app) {
    console.log('test loaded...');
    app.get('/test', function(req, res){
	console.log('here');
	res.render('test', {
		    cssIncludes: [],
		    jsIncludes: [],
		    title: 'wembli.com - coming soon.'
	});
    });
};