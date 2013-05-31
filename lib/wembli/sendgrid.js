var nodemailer = require("nodemailer");
var transport = nodemailer.createTransport("SMTP",{
    service:"SendGrid",
    //host: "smtp.sendgrid.net",
    //port: 465,
    //secureConnection: true,
    name:'www',
    //debug:true,
    //ignoreTLS:true,
    auth: {
	user: "kwalpole@wembli.com",
	pass: "kimbernut"
    }
});

module.exports = transport;
