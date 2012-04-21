var wembliModel   = require('wembli-model');
var Customer      = wembliModel.load('customer');

module.exports = function(app) {
    app.post("/callback/sendgrid/email",function(req,res) {
	console.log(req.body);
	//get the event for this organizer
	if (typeof req.body.organizer == "undefined") {
	    return res.send(200);
	}

	Customer.findOne({email:req.body.organizer},function(err,c) {	

	    //get the event
	    for (var i in c.eventplan) {
		if (typeof c.eventplan[i] == "undefined") {
		    continue;
		}
		if (typeof c.eventplan[i].config == "undefined") {
		    return res.send(200);
		}

		if (c.eventplan[i].config.guid == req.body.guid) {
		    //update the friend for this event
		    for (email in c.eventplan[i].friends) {
			if (email == req.body.email) {
			    console.log('sendgrid callback for: '+email);
			    if (typeof c.eventplan[i].friends[email][req.body.category] == "undefined") {
				c.eventplan[i].friends[email][req.body.category] = {};
				c.eventplan[i].friends[email][req.body.category][req.body.event] = 1;
			    } else {
				if (typeof c.eventplan[i].friends[email][req.body.category][req.body.event] == "undefined") {
				    c.eventplan[i].friends[email][req.body.category][req.body.event] = 1;
				} else {
				    c.eventplan[i].friends[email][req.body.category][req.body.event]++;
				}
			    }
			    var eventDate = req.body.event+'LastDate';
			    c.eventplan[i].friends[email][req.body.category][eventDate] = new Date(req.body.timestamp * 1000).format("m/d/yy h:MM TT Z");
			    console.log(c.eventplan[i].friends[email]);
			    c.markModified('eventplan');
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