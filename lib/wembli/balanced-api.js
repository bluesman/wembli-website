var querystring = require('querystring');
var request     = require('request');
var urlLib      = require('url');
var async       = require('async');
/*
require it like this:
	var balancedApi = require('balanced-api')({
		marketplace_uri:mUri,
		secret: secret
	});
*/
module.exports = function(opts) {
	return new bApi(opts);
};

var resources = [
	'accounts',
//	'bank_account_verifications',
	'bank_accounts',
//	'cards',
//	'credits',
	'customers',
//	'debits',
//	'events',
//	'holds',
//	'refunds',
//	'transactions'
];

function bApi(opts) {
	var me = this;

	opts.proto   = opts.proto || 'https';
	opts.host    = opts.host  || 'api.balancedpayments.com';
	this.options = opts;

	this.request = request.defaults({
		json: true,
		encoding: 'utf8',
	});

	/* intended to be protected methods */
	var _get = function(uri, args, callback) {
		var url = urlLib.format({protocol: me.options.proto, host: me.options.host, auth: me.options.secret+":", pathname: uri});
		me.request({
			method:'GET',
			uri:url,
			qs:args,
		},callback);
	};

	var _put = function(uri, args, callback) {
		var url = urlLib.format({protocol: me.options.proto, host: me.options.host, auth: me.options.secret+":", pathname: uri});
		me.request({
			method:'PUT',
			uri:url,
			json:args
		},callback);
	};

	var _post = function(uri, args, callback) {
		var url = urlLib.format({protocol: me.options.proto, host: me.options.host, auth: me.options.secret+":", pathname: uri});
		me.request({
			method:'POST',
			uri:url,
			json:args
		},callback);
	};

	var _delete = function(uri, callback) {
		var url = urlLib.format({protocol: me.options.proto, host: me.options.host, auth: me.options.secret+":", pathname: uri});
		me.request({
			method:'DELETE',
			uri:url,
			json:true
		},callback);
	};

	/* public methods */
	var setContext = function(context) {
		this.context = context;
	};

	/* load the resources and extend them */
	resources.forEach(function(resource) {
		obj = require('./balanced-api/'+resource);
		obj.prototype.marketplace_uri = me.options.marketplace_uri;
		obj.prototype.resource        = resource;
		obj.prototype._get            = _get;
		obj.prototype._put            = _put;
		obj.prototype._post           = _post;
		obj.prototype._delete         = _delete;
		obj.prototype.setContext      = setContext;
		me[resource]                  = obj;
	});
}
