var wembliModel = require('../../lib/wembli-model');
var Friend = wembliModel.load('friend');

module.exports = function(app) {
	app.all("/callback/twitter/rsvp/:guid/:token", function(req, res) {
		console.log('finding friend for guid and token: '+req.param('guid')+' - '+ req.param('token'));
		/* find the friend with this inviteStatusConfirmation token and guid */
		Friend.findOne({planGuid: req.param('guid'),"inviteStatusConfirmation.token":req.param('token')}, function(err, f) {
			/* no plan in the db */
			if (!f) { return;	}
			console.log('found friend - updating invite status to true');
			console.log(f);
			/* got a friend, set inviteStatus to true */
			f.inviteStatus = true;
			/* clear out the token it is no longer valid - so nothing fishy can happen */
			f.inviteStatusConfirmation = {token:'',timestamp:Date.now()};

			/* this is used on the event plan view */
			f.rsvp.initiated = true;
			f.rsvp.initiatedLastDate = Date.now();

			f.save();
		});
		return res.send(200);
	});
}
