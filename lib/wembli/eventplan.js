module.exports = function(req,res,next) {
    //new eventplan if there isn't one already
    if (typeof req.session.currentPlan == "undefined") {
	req.session.currentPlan = {};
    }
    
    //default to them not being an organizer
    if (typeof req.session.isOrganizer == "undefined") {
	req.session.isOrganizer = false;
    }

    next();
};