var wembliUtils = require('../wembli/utils');
var querystring = require('querystring');
var request = require('request');


var headers = {
    'X-PAYPAL-SECURITY-USERID'      : 'tom_api1.wembli.com',
    'X-PAYPAL-SECURITY-PASSWORD'    : 'AFZA4EWYCF53P7W8',
    'X-PAYPAL-SECURITY-SIGNATURE'   : 'AFcWxV21C7fd0v3bYYYRCpSSRl31AK0GAY8LboD4gv2r0uqIjQVQp.Gt',
    "X-PAYPAL-REQUEST-DATA-FORMAT"  : "JSON",
    "X-PAYPAL-RESPONSE-DATA-FORMAT" : "JSON",
    "X-PAYPAL-APPLICATION-ID"       : 'APP-19R67754B03489355'
};


//sandbox
/*
var headers = {
    'X-PAYPAL-SECURITY-USERID'      : 'tom_1335745142_biz_api1.wembli.com',
    'X-PAYPAL-SECURITY-PASSWORD'    : '1335745175',
    'X-PAYPAL-SECURITY-SIGNATURE'   : 'AiPC9BjkCyDFQXbSkoZcgqH3hpacA-YI8WxKPtNEsIK87tcyyvdJQEkB',
    "X-PAYPAL-REQUEST-DATA-FORMAT"  : "JSON",
    "X-PAYPAL-RESPONSE-DATA-FORMAT" : "JSON",
    "X-PAYPAL-APPLICATION-ID"       : 'APP-80W284485P519543T'
};
*/
var applicationId   = headers['X-PAYPAL-APPLICATION-ID'];

var errorLanguage   = 'en_US';
var detailLevel     = 'ReturnAll';
var requestEnvelope = {errorLanguage:errorLanguage,detailLevel:detailLevel};

var productionReturnUrl = 'https://www.wembli.com/callback/paypal/return/';
var sandBoxReturnUrl    = 'https://beta.wembli.com/callback/paypal/return/';
var returnUrl           = sandBoxReturnUrl;

var productionIpnNotificationUrl = 'https://www.wembli.com/callback/paypal/payment/';
var sandBoxIpnNotificationUrl    = 'https://beta.wembli.com/callback/paypal/payment/';
var ipnNotificationUrl           = sandBoxIpnNotificationUrl;

var productionCancelUrl = 'https://www.wembli.com/callback/paypal/cancel/';
var sandBoxCancelUrl    = 'https://beta.wembli.com/callback/paypal/cancel/';
var cancelUrl           = sandBoxCancelUrl;

var productionEmail = 'tom@wembli.com';
var sandBoxEmail    = 'tom_1335745142_biz@wembli.com';
var senderEmail     = productionEmail; //toggle on environment after initial testing

var productionUrl = 'https://svcs.paypal.com/AdaptivePayments/';
var sandBoxUrl    = 'https://svcs.sandbox.paypal.com/AdaptivePayments/';
var baseUrl       = productionUrl; //toggle on environment after initial testing is done

var productionRedirectUrl = 'https://www.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey=';
var sandBoxRedirectUrl = 'https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey=';
var redirectUrl = productionRedirectUrl;

module.exports = {
    redirectUrl: function(key) {
	return redirectUrl+key;
    },
    Pay: function(args,callback) {
	//grab the token and append the urls
	var token = args.token;
	var guid  = args.guid;
	delete args.guid;
	delete args.token;

	var append = guid+'/'+token;

	var template = {
	    method          : 'Pay',
	    actionType      : 'PAY',
	    currencyCode    : 'USD',
	    receiverList    : null,
	    ipnNotificationUrl : ipnNotificationUrl+append,
	    returnUrl       : returnUrl+append,
	    cancelUrl       : cancelUrl+append,
	    requestEnvelope : requestEnvelope,
	};
	var params = wembliUtils.merge(template,args);
	makeRequest(params,callback);
    },
    PaymentDetails: function(args,callback) {
	var template = {
	    method          : 'PaymentDetails',
	    payKey          : null,
	    requestEnvelope : requestEnvelope,
	};
	var params = wembliUtils.merge(template,args);
	makeRequest(params,callback);
    },
};


makeRequest = function(args, callback){
    var url = baseUrl+args.method;
    delete args.method;
    request({
	method  : 'POST',
	headers : headers,
	json    : args,
	url     : url
    }, function (error, response, body) {
	if(error) return callback(error);
	callback(null, body);
    });
};

