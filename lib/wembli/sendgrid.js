var nodemailer = require("nodemailer");

nodemailer.SMTP = {
    host: "smtp.sendgrid.net",
    port: 465,
    ssl: true,
    use_authentication: true,
    user: "tom@phatseat.com",
    pass: "phatseat2010"
}

module.exports = nodemailer;
