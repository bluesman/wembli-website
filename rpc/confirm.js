exports.confirm = {
	init: function(args,req,res) {
		var me = this;
		var data = {
			success:1,
		};

		if (typeof req.session.confirmEmailSent != "undefined") {
			data.expiredToken = req.session.confirmEmailSent.expiredToken ? true : false;
			data.resent       = req.session.confirmEmailSent.resent       ? true : false;
			data.emailError   = req.session.confirmEmailSent.emailError   ? true : false;
		}

		me(null,data);
	}
}
