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
app.locals = require('./static-helpers.js');

//app.settings
app.set('host', 'beta');
app.set('secure', false);
app.set('autoIndex', false); //tell mongoose not to do autoIndex in produciton

var port = 8001;

if (process.env.NODE_ENV == 'development') {
	app.set('host', 'tom');
}

if (process.env.NODE_ENV == 'www2') {
	app.set('host', 'www2');
	process.env.NODE_ENV = 'development';
}

if (process.env.NODE_ENV == 'development') {
	port = 8000;
	//tom.wembli.com fb app
	app.set('fbAppId', '364157406939543');
	app.set('fbAppSecret', 'ce9779873babc764c3e07efb24a34e69');
	app.set('twitAppId', 'aGekerxvrd9RczHHEOLEw');
	app.set('twitAppSecret', 'PUdQVzslAATiRCFhTXetmjbaFGoWIM092bSkuulFdk');
	app.set('tnUrl', 'tn.wembli.com');
	app.set('autoIndex', true);
	app.set('balancedSecret','0b50f03cb15a11e28537026ba7d31e6f');
	app.set('balancedMarketplace','Test-mplx4zjiaba85bets7q2omz');
	app.set('balancedMarketplaceUri','/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz');
}

if (process.env.NODE_ENV == 'secure-www2') {
	port = 8001;
	app.set('secure', true);
	app.set('host', 'www2');
	app.set('tnUrl', 'tn.wembli.com');
	app.set('balancedSecret','42e01b00b15e11e29523026ba7c1aba6');
	app.set('balancedMarketplace','MP22BmXshSp7Q8DjgBYnKJmi');
	app.set('balancedMarketplaceUri','/v1/marketplaces/MP22BmXshSp7Q8DjgBYnKJmi');

}
console.log(app.settings);
//init the openauth thing
var wembliEveryauth = require('./lib/wembli/everyauth.js');
wembliEveryauth.init(everyauth);
app.set('fbAppId', wembliEveryauth.conf.fb.appId);
app.set('fbAppSecret', wembliEveryauth.conf.fb.appSecret);
app.set('twitAppId', wembliEveryauth.conf.twit.appId);
app.set('twitAppSecret', wembliEveryauth.conf.twit.appSecret);

//redirect to https if not development
app.use(function(req, res, next) {
	if (process.env.NODE_ENV != 'development') {
		var proto = req.headers["x-forwarded-proto"];
		// --- Do nothing if schema is already https
		if (proto === "https") return next();

		// --- Redirect to https
		var host = 'www2.wembli.com'; //use req.headers.host eventually
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
/* session expires in 7 days */
app.use(express.session({
	key: 'wembli.sid',
	secret: '@$!#SCDFdsa',
	store: new redis,
	cookie: { expires: new Date(Date.now() + 86400000 * 7) }
}));
app.use(express.bodyParser());
app.use(require('./lib/wembli/ipinfodb'));
app.use(require('./lib/wembli/visitor'));
app.use(require('./lib/wembli/customer'));
app.use(require('./lib/wembli/plan'));
app.use(everyauth.middleware());
app.use(wemblirpc.server(wemblirpc.rpcDispatchHooks));
app.set('views', __dirname + '/views');
app.set('controllers', __dirname + '/controllers');
app.set('view engine', 'jade');
app.use(express.methodOverride());
app.use(require('./lib/wembli/secure'));
/* remember this happens before the controller runs :( */
app.use(function(req, res, next) {
	res.locals.req      = req;
	res.locals.res      = res;
	res.locals.params   = req.params;
	res.locals.session  = req.session;
	res.locals.ipinfo   = req.session.ipinfo;
	res.locals.visitor  = req.session.visitor;
	res.locals.customer = req.session.customer;
	next();
});
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
require('./controllers/plan')(app);
require('./controllers/rsvp')(app);
require('./controllers/tickets')(app);
require('./controllers/parking')(app);
require('./controllers/restaurants')(app);
require('./controllers/hotels')(app);
require('./controllers/login')(app);
require('./controllers/forgot-password')(app);
require('./controllers/signup')(app);
require('./controllers/logout')(app);
require('./controllers/callback/facebook')(app);
require('./controllers/callback/twitter')(app);
require('./controllers/callback/sendgrid')(app);
require('./controllers/callback/paypal')(app);
require('./controllers/callback/tn')(app);
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
