var express          = require('express'),
    date             = require('./public/js/lib/date.format'),
    redis            = require('connect-redis')(express),
    everyauth        = require('everyauth'),
    wembliEveryauth  = require('./lib/wembli/everyauth.js'),
    wemblirpc        = require('./lib/wembli/jsonrpc');


console.log('started in '+process.env.NODE_ENV+' mode...');

app = module.exports = express.createServer();
//dynamic helpers
app.dynamicHelpers(require('./controllers/helpers/dynamic-view-helpers'));
//static helper functions
app.helpers(require('./controllers/helpers/static-view-helpers'));

globalViewVars   = require('./controllers/helpers/global-view-vars');

//init the openauth thing
wembliEveryauth.init(everyauth);

//app globals
app.set('fbAppId',wembliEveryauth.conf.fb.appId);
app.set('fbAppSecret',wembliEveryauth.conf.fb.appSecret);
app.set('host','beta');

app.configure(function(){
    app.use(express.cookieParser());
    app.use(express.static(__dirname + '/public'));
    app.use(express.session({ key: 'wembli.sid',secret: '@$!#SCDFdsa',store: new redis }));
    app.use(everyauth.middleware());
    app.use(wemblirpc.server(wemblirpc.rpcDispatchHooks));
    app.set('views', __dirname + '/views');
    app.set('controllers', __dirname + '/controllers');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(require('./lib/wembli/eventplan'));
    app.use(require('./lib/wembli/geoip'));
    app.use(require('./lib/wembli/top-performers'));
    app.use(app.router);
});


everyauth.helpExpress(app);


var production = function() {
    app.use(express.logger());
    app.use(express.errorHandler()); 
};

app.configure('production1',production);
app.configure('production2',production);
app.configure('development',function() {
    app.use(express.logger());
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});



// Controllers
require('./controllers/plan')(app);
require('./controllers/style-guide')(app);
require('./controllers/more-info')(app);
require('./controllers/index')(app);
require('./controllers/dashboard')(app);
require('./controllers/login')(app);
require('./controllers/forgot-password')(app);
require('./controllers/signup')(app);
require('./controllers/logout')(app);
require('./controllers/research')(app);
require('./controllers/events')(app);
require('./controllers/event-builder')(app);
require('./controllers/friends')(app);
require('./controllers/hotels')(app);
require('./controllers/parking')(app);
require('./controllers/restaurants')(app);
require('./controllers/test')(app);
require('./controllers/beta-signup')(app);
require('./controllers/fanvenues')(app);
require('./controllers/callback/sendgrid')(app);
require('./controllers/callback/paypal')(app);

var port = 8001;
if (process.env.NODE_ENV == 'development') {
    port = 8000;
    //tom.wembli.com fb app
    app.set('fbAppId','364157406939543');
    app.set('fbAppSecret','ce9779873babc764c3e07efb24a34e69');
    app.set('host','tom');
}
if (process.env.NODE_ENV == 'rob') {
    port = 8888;
}
if (process.env.NODE_ENV == 'production2') {
    port = 8002;
}
if (process.env.NODE_ENV == 'secure') {
    port = 8010;
}

console.log('listening on port: '+port);
if (!module.parent) app.listen(port);
