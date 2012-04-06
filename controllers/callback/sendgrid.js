module.exports = function(app) {
    app.post("/callback/sendgrid/email",function(req,res) {
	console.log(req.body);
	res.send(200);
    });
}