exports.facebook = {
	setAccessToken: function(args,req,res) {
		var me = this;

		if (typeof req.session.facebook === "undefined") {
			req.session.facebook = {};
		}

		if (typeof args.accessToken) {
			req.session.facebook.accessToken = args.accessToken;
		}

		me(null,{success:1});
	},

};
