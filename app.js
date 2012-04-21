require('./public/js/lib/date.format');

//globals
//some configs here - maybe move this out to a config file some day

/* DOCUMENTATION FOR HOW SESSION IS ORGANIZED: this should go in unfuddled

every controller will have a req.session
if you are logged in you will have:

req.session.loggedIn == true
req.session.remember == (true|false)
req.session.customer == phatseat's customer data (not a customer model!!)



*/


var express   = require('express'),
    redis     = require('connect-redis')(express)
    wemblirpc = require('./lib/wembli/jsonrpc');

console.log('started in '+process.env.NODE_ENV+' mode...');

var app = module.exports = express.createServer();

//app globals
app.set('fbAppId','314732478586428');
app.set('fbAppSecret','68b80c2adfd5421b6c9df85751264d4e');
app.set('host','beta');

app.configure(function(){
    app.use(express.cookieParser());
    app.use(express.static(__dirname + '/public'));
    app.use(express.session({ key: 'wembli.sid',secret: '@$!#SCDFdsa',store: new redis }));
    app.use(wemblirpc.server(wemblirpc.rpcDispatchHooks));
    app.set('views', __dirname + '/views');
    app.set('controllers', __dirname + '/controllers');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(require('./lib/wembli/auth'));
    app.use(require('./lib/wembli/geoip'));
    app.use(require('./lib/wembli/top-performers'));
    app.use(app.router);
});


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


// Helpers
globalViewVars = require('./controllers/helpers/global-view-vars');

//dynamic helpers
app.dynamicHelpers(require('./controllers/helpers/dynamic-view-helpers'));

//static helper functions
app.helpers({
    getAppSettings: function() { return app.settings; },
    ticketSessionId: function() {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
        var sid_length = 5;
        var sid = '';
        for (var i=0; i<sid_length; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            sid += chars.substring(rnum,rnum+1);
        }
        return sid;
    },

    environment: function() {
        return process.env.NODE_ENV;
    },

    //turn a regular list of tickets into the fanvenues list for the map
    fanvenuesTicketList: function(tickets) {
	var ticketsList = [];
	for (var i = 0; i < tickets.length; i++) {
	    var ticket = tickets[i];
	    var fvTicket = {id:ticket.ID,
			    section:ticket.Section,
			    row:ticket.Row,
			    price:'$'+ticket.ActualPrice,
			    notes:(ticket.Notes ? ticket.Notes : 'n/a'),
			   };
	    ticketsList.push(fvTicket);
	}
	return JSON.stringify(ticketsList);
    },

    fbCredentials: function() {
	var credentials = {};
	credentials.appId = app.settings.fbAppId;
	credentials.appSecret = app.settings.fbAppSecret;
	credentials.host = app.settings.host;
	//console.log(credentials);
	return credentials;
    },

    

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
