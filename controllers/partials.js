module.exports = function(app) {
	app.get('/partials/:name', function(req, res) {
		res.render('partials/'+req.params.name,{partial:true});
	});
}
