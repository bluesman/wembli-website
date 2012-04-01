module.exports = function(app) {
    console.log('test loaded...');
    app.get('/test', function(req, res){
	console.log('here');
	res.render('email-templates/signup', {
	    layout:'email-templates/layout',
	    confirmLink:'',
	    resendLink:''
	});
    });
};