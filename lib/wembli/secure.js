
module.exports = function(req,res,next) {
    return next();
    //default to https unless its one of the whitelisted urls
    console.log('fetched '+req.url);
    var whitelist = ['/','/index'];
    //if this url is not secure 
    if (!app.settings.secure) {
	//and it is not in the insecure url whitelist
	if (!whitelist.hasObject(req.url)) {
	    //then redirect to secure
	    var r = 'https://'+app.settings.host+'.wembli.com'+req.url;
	    console.log(req.url+' can not be insecure, redirecting to: '+r);
	    return res.redirect(r);
	}
    }
    next();
}