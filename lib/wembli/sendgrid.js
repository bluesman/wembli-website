var nodemailer = require("nodemailer");

nodemailer.SMTP = {
    host: "smtp.sendgrid.net",
    port: 465,
    ssl: true,
    use_authentication: true,
    user: "tom@wembli.com",
    pass: "W@lp0l31"
}

module.exports = nodemailer;
