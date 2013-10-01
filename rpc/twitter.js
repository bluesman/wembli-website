var twitter = require('ntwitter');

var getTwit = function(req,me) {
	if (typeof req.session.twitter === "undefined") {
		return;
	}
	return new twitter({
		consumer_key: app.settings.twitAppId,
		consumer_secret: app.settings.twitAppSecret,
		access_token_key: req.session.twitter.accessToken,
		access_token_secret: req.session.twitter.accessSecret
	});
}

exports.twitter = {
	tweet: function(args,req,res) {
		var me = this;
		var twit = getTwit(req,me);
		if (typeof twit === "undefined") {
			return me(null,{success:0});
		}
		var twit = getTwit(req,me);
		twit.verifyCredentials(function(err,result) {

			if (err) {
				return me(null,{success:0,error:err});
			}
			twit.updateStatus(args.tweet,function(err,data) {
				if (err) {
					return me(null,{success:0,error:err});
				}
				return me(null,{success:1});
			});
		});
	},
	getLoginStatus: function(args,req,res) {
		var me = this;
		var twit = getTwit(req,me);
		if (typeof twit === "undefined") {
			return me(null,{success:1,loginStatus:false});
		}
		if (typeof req.session.twitter.accessToken === "undefined") {
			return me(null,{success:1,loginStatus:false});
		}
		var twit = getTwit(req,me);
		twit.verifyCredentials(function(err,result) {
			req.session.twitter.profile = result;
			/* TODO - sync this with our db */
			var loginStatus = err ? false : true;
			return me(null,{success:1,loginStatus:loginStatus});
		});
	},

	searchUsers: function(args,req,res) {
		var me = this;
		var twit = getTwit(req,me);
		if (typeof twit === "undefined") {
			return me(null,{success:1});
		}
		twit.searchUsers(args.q,args.args,function(err,results) {

			return me(null,{success:1,friends:results});
		});
	},

	getFriends: function(args,req,res) {
		var me = this;
		var twit = getTwit(req,me);
		if (typeof twit === "undefined") {
			return me(null,{success:1});
		}

		var params = {
			user_id: data.id,
			key:'friends',
			skip_status:true,
			include_user_entities: false,
		}
	  /* this works it just gets rate limited too fast */
	  twit._getUsingCursor('/friends/list.json',params,function(err,results) {
	  	return me(null,{
	  		success:1,
	  		friends:results
	  	})
	  });
	}
}
