var sys = require('sys'),
http = require('http'),
beta = require('../models/beta');

exports.beta = {
    submit: function(email) {
	var me = this;
	var betaObj = new Beta();
	betaObj.upsertByEmail({email:email},function(error,betaCustomer) {
	    if (error) {
		me(error);
	    } else {
		//send an email
		var postalgone = http.createClient(80, 'www.postalgone.com');

		var emailBody = 'Thank you for your interest in phatseat.com.  Beta testing is closed at the moment but as soon as we\'re ready for another round, we\'ll let you know!  If you have any questions feel free to email info@phatseat.com.  Thanks!';
		var postBody = 'to='+email+'&subject=Phatseat.com Beta List&body='+emailBody;

		var request = postalgone.request('POST', '/mail',
						 {'host':'www.postalgone.com',
						  'content-type':'application/x-www-form-urlencoded'});
		request.write(postBody,encoding='utf8');
		request.end();

		betaCustomer.id = betaCustomer._id.toHexString();
		me(null,betaCustomer);
	    }
	});
    }
}
