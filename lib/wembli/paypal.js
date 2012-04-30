var wembliUtils = require('../wembli/utils');
var querystring = require('querystring');
var request = require('request');

/* this will be prod
var headers = {
    'X-PAYPAL-SECURITY-USERID'      : 'tomwalpole_api1.gmail.com',
    'X-PAYPAL-SECURITY-PASSWORD'    : '5A4C9RYCWS4CL25F',
    'X-PAYPAL-SECURITY-SIGNATURE'   : 'AFcWxV21C7fd0v3bYYYRCpSSRl31ALthnC.aTl6TrkiKfiGf09ONIkzh',
    "X-PAYPAL-REQUEST-DATA-FORMAT"  : "JSON",
    "X-PAYPAL-RESPONSE-DATA-FORMAT" : "JSON",
    "X-PAYPAL-APPLICATION-ID"       : 'TBD'
};
*/

//sandbox
var headers = {
    'X-PAYPAL-SECURITY-USERID'      : 'tom_1335745142_biz_api1.wembli.com',
    'X-PAYPAL-SECURITY-PASSWORD'    : '1335745175',
    'X-PAYPAL-SECURITY-SIGNATURE'   : 'AiPC9BjkCyDFQXbSkoZcgqH3hpacA-YI8WxKPtNEsIK87tcyyvdJQEkB',
    "X-PAYPAL-REQUEST-DATA-FORMAT"  : "JSON",
    "X-PAYPAL-RESPONSE-DATA-FORMAT" : "JSON",
    "X-PAYPAL-APPLICATION-ID"       : 'APP-80W284485P519543T'
};

var applicationId   = headers['X-PAYPAL-APPLICATION-ID'];

var errorLanguage   = 'en_US';
var detailLevel     = 'ReturnAll';
var requestEnvelope = {errorLanguage:errorLanguage,detailLevel:detailLevel};

var productionReturnUrl = 'http://www.wembli.com/callback/paypal/return';
var sandBoxReturnUrl    = 'http://tom.wembli.com/callback/paypal/return';
var returnUrl           = sandBoxReturnUrl;

var productionCancelUrl = 'http://www.wembli.com/callback/paypal/cancel';
var sandBoxCancelUrl    = 'http://tom.wembli.com/callback/paypal/cancel';
var cancelUrl           = sandBoxCancelUrl;

var productionEmail = 'tomwalpole@gmail.com';
var sandBoxEmail    = 'tom_1335745142_biz@wembli.com';
var senderEmail     = sandBoxEmail; //toggle on environment after initial testing

var productionUrl = 'https://svcs.sandbox.paypal.com/AdaptivePayments/';
var sandBoxUrl    = 'https://svcs.sandbox.paypal.com/AdaptivePayments/';
var baseUrl       = sandBoxUrl; //toggle on environment after initial testing is done

var productionRedirectUrl = '';
var sandBoxRedirectUrl = 'https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey=';
var redirectUrl = sandBoxRedirectUrl;

module.exports = {
    redirectUrl: function(key) {
	return redirectUrl+key;
    },
    Pay: function(args,callback) {
	var template = {
	    method          : 'Pay',
	    actionType      : 'PAY',
	    currencyCode    : 'USD',
	    receiverList    : null,
	    returnUrl       : returnUrl,
	    cancelUrl       : cancelUrl,
	    requestEnvelope : requestEnvelope,
	};
	var params = wembliUtils.merge(template,args);
	console.log(params);
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
	console.log('response from: '+url);
	console.log(body);
	callback(null, body);
    });
};

