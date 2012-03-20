module.exports = function(app) {
    app.get("/friends",function(req,res) {
	res.render('friends', {
	    event:req.session.eventplan.event,
            session:req.session,
	    title: 'wembli.com - friends.',
	    page:'friends',
	    globals:globalViewVars,
	    cssIncludes: [],
            jsIncludes: []
	});

    });
}