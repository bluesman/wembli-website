var querystring = require('querystring');
var request = require('request');
var urlLib = require('url');
var async = require('async');
/*
require it like this:
	var balancedApi = require('balanced-api')({
		marketplace_uri:mUri,
		secret: secret
	});
*/
var api;

module.exports = function(opts) {
 return new bApi(opts);
};


var resources = [
	//'accounts', //deprecated
	'verifications',
	'bank_accounts',
	'cards',
	'credits',
	'customers',
	'debits',
	//	'events',
	'holds',
	'refunds',
	//	'transactions'
];

function bApi(opts) {
	var me = this;

	opts.proto = opts.proto || 'https';
	opts.host = opts.host || 'api.balancedpayments.com';
	this.options = opts;
	this.version = 'v1';

	this.request = request.defaults({
		json: true,
		encoding: 'utf8',
	});

	/* intended to be protected methods */
	var _get = function(uri, args, callback) {
		var url = urlLib.format({
			protocol: me.options.proto,
			host: me.options.host,
			auth: me.options.secret + ":",
			pathname: uri
		});
		me.request({
			method: 'GET',
			uri: url,
			qs: args,
		}, callback);
	};

	var _put = function(uri, args, callback) {
		var url = urlLib.format({
			protocol: me.options.proto,
			host: me.options.host,
			auth: me.options.secret + ":",
			pathname: uri
		});
		me.request({
			method: 'PUT',
			uri: url,
			json: args
		}, callback);
	};

	var _post = function(uri, args, callback) {
		var url = urlLib.format({
			protocol: me.options.proto,
			host: me.options.host,
			auth: me.options.secret + ":",
			pathname: uri
		});

		me.request({
			method: 'POST',
			uri: url,
			json: args
		}, callback);
	};

	var _delete = function(uri, args, callback) {
		var url = urlLib.format({
			protocol: me.options.proto,
			host: me.options.host,
			auth: me.options.secret + ":",
			pathname: uri
		});

		me.request({
			method: 'DELETE',
			uri: url,
			json: true
		}, callback);
	};

	var _coalesceInput = function(cb, uri, args, callback) {
		/* if uri is not a string the caller is assuming there is already a context set */
		if (typeof uri !== 'string') {
			/* if args is undefined it means uri is a callback and there are no args */
			if (typeof args === "undefined") {
				callback = uri;
				args = {};
				/* else uri is args and args is callback */
			} else {
				callback = args;
				args = uri;
			}
			/* grab the uri from the context */
			if (typeof this.context.uri !== "undefined") {
				uri = this.context.uri;
			}
			/* uri is a string, check for presence of args */
		} else {
			/* if callback is undefined, then args must be the callback */
			if (typeof callback === "undefined") {
				callback = args;
				args = {};
			}
		}
		if (typeof uri !== 'string') {
			throw "Invalid Arguments: could not determine uri, make sure a uri is passed in or a context is set.";
		}

		if (typeof args !== 'object') {
			throw "Invalid Arguments: could not determine arguments, make sure a uri is passed in or a context is set.";
		}

		if (typeof callback !== 'function') {
			throw "Invalid Arguments: could not determine callback, make sure a uri is passed in or a context is set and a callback method is passed in.";
		}
		cb(uri, args, callback);
	}

	/* public methods */
	var setContext = function(context) {
		this.context = context;
	};

	var create = function(accountInfo, callback) {
		var uri = '/' + this.version + '/' + this.resource;
		console.log('create' + uri);
		console.log(accountInfo);
		this._post(uri, accountInfo, callback);
	};

	var get = function(uri, args, callback) {
		this._coalesceInput(_get, uri, args, callback);
	};

	var list = function(callback) {
		var uri = '/' + this.version + '/' + this.resource;
		this._coalesceInput(_get, uri, callback);
	};

	var update = function(uri, args, callback) {
		this._coalesceInput(_put, uri, args, callback);
	};

	var deleteFunc = function(uri, args, callback) {
		this._coalesceInput(_delete, uri, args, callback);
	};

	/* load the resources and extend them */
	for (var i = 0; i < resources.length; i++) {
		var resource = resources[i];
		obj = require('./balanced-api/' + resource);
		obj.prototype.marketplace_uri = me.options.marketplace_uri;
		obj.prototype.resource = resource;
		obj.prototype.version = me.version;

		obj.prototype._get = _get;
		obj.prototype.get = get;
		obj.prototype.list = list;

		obj.prototype._put = _put;
		obj.prototype.update = update;

		obj.prototype._post = _post;

		obj.prototype.create = create;

		obj.prototype._delete = _delete;
		obj.prototype.delete = deleteFunc;

		obj.prototype._coalesceInput = _coalesceInput;
		obj.prototype.setContext = setContext;

		obj.prototype.parent = me;
		me[resource] = obj;
	};

}
