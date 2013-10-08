var wembliUtils = require('wembli/utils');
  var wembliModel = require('wembli-model');
  var Plan = wembliModel.load('plan');
  var Customer = wembliModel.load('customer');
  var Feed = wembliModel.load('feed');

  Customer.findOne({"$or":[{"email":"tomwalpole@gmail.com"},{"socialProfiles.facebook.id":"27223964"}]},function(err,c) {
  	console.log(c.socialProfiles.facebook);
  	 wembliModel.close();
  });

