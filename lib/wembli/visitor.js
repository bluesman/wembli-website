module.exports = function(req, res, next) {
	console.log('in visitor.js LOADING URL: '+req.url);

	if (req.param('redirectUrl')) {
		console.log('passed in a redirect url..');
		req.session.redirectUrl = req.param('redirectUrl');
	}

	//set up visitor
	if (typeof req.session.visitor === "undefined") {
		req.session.visitor = {context:'visitor'};
	} else {
		req.session.visitor.context = 'visitor';
	}
	console.log('visitor:');
	//console.log(req.session.visitor);
	next();
};
