var util = require('wembli/utils');

module.exports = function(req, res, next) {
    return next();
    //default to https unless its one of the whitelisted urls
    var whitelist = ['/', '/index'];
    //if this url is not secure
    if(!app.settings.secure) {
        //and it is not in the insecure url whitelist
        if(!util.inArray(req.url, whitelist)) {
            //then redirect to secure
            var r = 'https://' + app.settings.host + '.wembli.com' + req.url;
            return res.redirect(r);
        }
    }
    next();
}
