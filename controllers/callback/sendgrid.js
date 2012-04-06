var wembliModel   = require('wembli-model');
var Customer      = wembliModel.load('customer');

module.exports = function(app) {
    app.post("/callback/sendgrid/email",function(req,res) {
	console.log(req.body);
	console.log(req.body.organizer);
	//get the event for this organizer
	if (typeof req.body.organizer == "undefined") {
	    return res.send(200);
	}
	Customer.findOne({email:req.body.organizer},function(err,c) {	
	    //get the event
	    for (var i=0; i<=c.eventplan.length;i++) {
		if (c.eventplan[i].config.guid == req.body.guid) {
		    console.log('found matching event: '+req.body.guid);
		    //update the friend for this event
		    console.log(c.eventplan[i].friends);
		    for (var j=0;j<=c.eventplan[i].friends.length;j++) {
			console.log(c.eventplan[i].friends);
			if (c.eventplan[i].friends[j].email == req.body.email) {
			    console.log('found matching friend: '+req.body.email);
			    c.eventplan[i].friends[j][req.body.category][req.body.event]++;
			    c.save();
			    break;
			}
		    }
		    break;
		}
	    }
	});
	res.send(200);
    });
}