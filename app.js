console.log('started in ' + process.env.NODE_ENV + ' mode...');

var express = require('express'),
	date = require('./public/js/lib/date.format'),
	redis = require('connect-redis')(express),
	everyauth = require('everyauth'),
	wemblirpc = require('./lib/wembli/jsonrpc'),
	fs = require('fs');

//init the log file
var access_logfile = fs.createWriteStream('./logs/access.log', {
	flags: 'a'
});
//init the app
app = module.exports = express();

//static helper functions
//app.helpers(require('./controllers/helpers/static-view-helpers'));
globals = require('./globals');
app.locals = require('./locals');

//app globals
app.set('host', 'beta');
app.set('secure', false);
var port = 8001;

if (process.env.NODE_ENV == 'development') {
	port = 8000;
	//tom.wembli.com fb app
	app.set('fbAppId', '364157406939543');
	app.set('fbAppSecret', 'ce9779873babc764c3e07efb24a34e69');
	app.set('host', 'tom');
	app.set('tnUrl', 'tn.wembli.com');
}

if (process.env.NODE_ENV == 'secure') {
	port = 8010;
	app.set('secure', true);
	app.set('host', 'beta');

}

//init the openauth thing
var wembliEveryauth = require('./lib/wembli/everyauth.js');
wembliEveryauth.init(everyauth);
app.set('fbAppId', wembliEveryauth.conf.fb.appId);
app.set('fbAppSecret', wembliEveryauth.conf.fb.appSecret);

app.use(require('./controllers/helpers/dynamic-view-helpers'));

//redirect to https if not development
app.use(function(req, res, next) {
	if (process.env.NODE_ENV != 'development') {
		var schema = req.headers["x-forwarded-for"];
		// --- Do nothing if schema is already https
		if (schema === "https") return next();

		// --- Redirect to https
		var host = 'beta.wembli.com'; //use req.headers.host eventually
		res.redirect("https://" + host + req.url);
	} else {
		next();
	}
});



app.use(express.logger({
	stream: access_logfile
}));
app.use(express.cookieParser());
app.use(express.static(__dirname + '/public'));
app.use(express.session({
	key: 'wembli.sid',
	secret: '@$!#SCDFdsa',
	store: new redis
}));
app.use(everyauth.middleware());
app.use(wemblirpc.server(wemblirpc.rpcDispatchHooks));
app.set('views', __dirname + '/views');
app.set('controllers', __dirname + '/controllers');
app.set('view engine', 'jade');
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(require('./lib/wembli/secure'));
app.use(require('./lib/wembli/eventplan'));
app.use(require('./lib/wembli/ipinfodb'));
app.use(app.router);

if (process.env.NODE_ENV === 'development') {
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}));
}

// Controllers
require('./controllers/index')(app);
require('./controllers/search')(app);
require('./controllers/events')(app);
require('./controllers/invitation')(app);
require('./controllers/tickets')(app);
require('./controllers/parking')(app);
require('./controllers/restaurants')(app);
require('./controllers/hotels')(app);
require('./controllers/login')(app);
require('./controllers/forgot-password')(app);
require('./controllers/signup')(app);
require('./controllers/logout')(app);
require('./controllers/callback/sendgrid')(app);
require('./controllers/callback/paypal')(app);
require('./controllers/dashboard')(app);
require('./controllers/confirm')(app);

//this is last so individual controllers can override
require('./controllers/partials')(app);

/* going to rewrite these
require('./controllers/plan')(app);
require('./controllers/dashboard')(app);
require('./controllers/events')(app);
require('./controllers/event-builder')(app);
require('./controllers/friends')(app);
require('./controllers/hotels')(app);
require('./controllers/parking')(app);
require('./controllers/restaurants')(app);
require('./controllers/callback/sendgrid')(app);
require('./controllers/callback/paypal')(app);
*/

console.log('listening on port: ' + port);
if (!module.parent) app.listen(port);
