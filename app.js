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


var express = require('express'),
redis = require('connect-redis')(express);

console.log('started in '+process.env.NODE_ENV+' mode...');

var app = module.exports = express.createServer();

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('controllers', __dirname + '/controllers');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret: '@$!#SCDFdsa',store: new redis }));
    app.use(app.router);
    app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
    app.use(express.static(__dirname + '/public'));
});


app.configure('production',function() {
    app.use(express.logger());
    app.use(express.errorHandler()); 

});

app.configure('development',function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});


app.helpers({
    environment: function() {
        return process.env.NODE_ENV;
    }
});

// Controllers
require('./controllers/index')(app);
require('./controllers/test')(app);
require('./controllers/error')(app);

var port = 80;
if (process.env.NODE_ENV == 'development') {
    port = 8000;
}
console.log('listening on port: '+port);
if (!module.parent) app.listen(port);
