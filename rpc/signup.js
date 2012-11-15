exports.signup = {
	init: function(args,req,res) {
		var me = this;
		var data = {
			success:1,
			firstName:null,
			lastName:null,
			password:null,
			password2:null,
			email: null,
			formError: false,
			exists: false
		};

		if (typeof req.session.signupForm != "undefined") {
			data.firstName  = req.session.signupForm.firstName ? req.session.signupForm.firstName : data.firstName;
			data.lastName   = req.session.signupForm.lastName  ? req.session.signupForm.lastName  : data.lastName;
			data.email      = req.session.signupForm.email     ? req.session.signupForm.email     : data.email;
			//data.password   = req.session.signupForm.password  ? req.session.signupForm.password  : data.password;
			//data.password2  = req.session.signupForm.password2 ? req.session.signupForm.password2 : data.password2;
			data.formError  = req.session.signupForm.error     ? req.session.signupForm.error     : data.formError;
			data.exists     = req.session.signupForm.exists    ? req.session.signupForm.exists    : data.exists;
		}

		me(null,data);
	}
}
