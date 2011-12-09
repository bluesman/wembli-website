module.exports = function(app) {
    console.log('index loaded...');
    app.get('/', function(req, res){
	console.log('here');
	res.render('index', {
		    cssIncludes: [],
		    jsIncludes: [],
		    title: 'wembli.com - coming soon.'
	});
    });
};