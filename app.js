require.paths.unshift('/home/phatseat/node/lib/node_modules');

require('./public/js/lib/date.format');

//globals
//some configs here - maybe move this out to a config file some day
fbAppId  = '121644174563555';
fbSecret = 'afd240a17fd5cf34a5089ebe213db589';


/* DOCUMENTATION FOR HOW SESSION IS ORGANIZED: this should go in unfuddled

every controller will have a req.session
if you are logged in you will have:

req.session.loggedIn == true
req.session.remember == (true|false)
req.session.customer == phatseat's customer data (not a customer model!!)



*/


var sys = require('sys'),
fs      = require('fs'),
express = require('express'),
connect = require('connect');

console.log('started in '+process.env.NODE_ENV+' mode...');

var app = module.exports = express.createServer();
app.set('views', __dirname + '/views');
app.set('controllers', __dirname + '/controllers');
app.set('view engine', 'jade');

app.configure('production',function() {
    app.use(connect.logger());
    app.use(connect.static(__dirname + '/public'),{maxAge:31557600000});
    app.use(connect.errorHandler()); 

});

app.configure('development',function() {
    app.use(connect.logger());
    app.use(connect.static(__dirname + '/public'));
    app.use(connect.errorHandler({ dumpExceptions: true, showStack: true })); 
});


app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
    app.use(app.router);
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.helpers({
    environment: function() {
        return process.env.NODE_ENV;
    }
});

// Controllers
require('./controllers/index')(app);
require('./controllers/error')(app);

var port = 80;
if (process.env.NODE_ENV == 'development') {
    port = 8000;
}
console.log('listening on port: '+port);
if (!module.parent) app.listen(port);
