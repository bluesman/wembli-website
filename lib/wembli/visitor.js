module.exports = function(req, res, next) {
	//set up visitor
	if (typeof req.session.visitor === "undefined") {
		req.session.visitor = {context:'visitor'};
	} else {
		req.session.visitor.context = 'visitor';
	}
	console.log('visitor:');
	console.log(req.session.visitor);
	next();
};
