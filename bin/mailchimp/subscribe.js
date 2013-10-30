var mcapi = require('mailchimp-api');
var mc = new mcapi.Mailchimp('a70be54f752f1b3ce3ccd4116d0e470c-us5');

var testListId = '1dffb68f9a';
var email = 'email-test08@tomwalpole.com';

mc.lists.subscribe({
		id: testListId,
		email: {
			email: email
		},
		merge_vars: {
			fname: 'Test',
			lname:'LastName',
			optin_ip:'192.168.1.1',
			optin_time: new Date(),
		},
		double_optin: false,
		send_welcome: false
	}, function(data) {
		console.log('subscribed');
		console.log(data);
	},
	function(error) {
		if (error.error) {
			var error_flash = error.code + ": " + error.error;
		} else {
			var error_flash = 'There was an error subscribing that user';
		}
		console.log('error');
		console.log(error_flash);
	});
