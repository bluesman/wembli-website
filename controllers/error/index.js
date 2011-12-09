module.exports = function(app) {
    console.log('error loaded...');
    app.use(function(req,res) {
	    res.render('404', 
		       {
			   session:req.session,
			   'title':'In Development',
		       },
		       function(err,str) {
			   res.send(str,404);
		       }
		       );
	});

};

