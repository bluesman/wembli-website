exports.login = {
	init: function(args,req,res) {
		var me = this;
		var data = {
			success:1,
			remember: false,
			email: null,
			formError: false
		};

		if (typeof req.session.loginForm != "undefined") {
			data.remember  = req.session.loginForm.remember ? true : data.remember;
			data.email     = req.session.loginForm.email    ? req.session.loginForm.email : data.email;
			data.formError = req.session.loginForm.error    ? req.session.loginForm.error : data.formError;
		}

		//if they've logged in before and wanted to be remembered then check the remember box
		data.remember = req.session.remember ? true : data.remember;

		//if they wanted to be remembered - use the email from the sesion.customer
		if (req.session.remember && (typeof req.session.rememberEmail != "undefined")) {
			data.email = req.session.rememberEmail;
		}

		me(null,data);
	}
}
