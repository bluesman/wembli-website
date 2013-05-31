/* https://github.com/balanced/balanced-api/blob/master/resources/bank_accounts.rst */

var ba = function() {
	console.log('making new bank_accounts obj');
	return this;
};

ba.prototype.create = function(accountInfo, callback) {
	var uri = '/v1/'+this.resource;
	this._post(uri, accountInfo, callback);
};

ba.prototype.get = function(uri, args, callback) {
	/* caller is assuming there is a context */
	if (typeof uri !== 'string') {
		if (typeof args === "undefined") {
			callback = uri;
			args = {};
		} else {
			callback = args;
			args = uri;
		}
		if (typeof this.context.uri !== "undefined") {
			uri = this.context.uri;
		}
	} else {
		if (typeof callback === "undefined") {
			callback = args;
		}
	}

	this._get(uri, args, callback);
};

ba.prototype.list = function(args,callback) {
	if (typeof callback === "undefined") {
		callback = args;
		args = {};
	}
	var uri = '/v1/' + this.resource;
	this._get(uri, args, callback);
};

ba.prototype.delete = function(uri, callback) {
	/* caller is assuming there is a context */
	if (typeof uri !== 'string') {
		callback = uri;
		if (typeof this.context.uri !== "undefined") {
			uri = this.context.uri;
		}
	}
	var callbackWrapper = function(err, res, body) {
		/* destroy the context if this was successful */
		if (res.statusCode == 204) {
			this.context = {};
		}
		callback(err, res, body);
	}
	this._delete(uri,callbackWrapper);
};

/*
	associate a bank account with an account in a marketplace
*/
ba.prototype.associateToAccount = function(uri, args, callback) {
	/* caller is assuming there is a context */
	if (typeof uri !== 'string') {
		callback = args;
		args     = uri;
		if (typeof this.context.uri !== "undefined") {
			uri = this.context.uri;
		}
	}
	/*
		docs say uri should be something like: /v1/marketplaces/:marketplace_id/bank_accounts/:bank_account_id
		afaict, that doesn't work - the uri should be something like this: /v1/bank_accounts/BA3rmBwJ8D4euBmr95MZxnKw
	*/
	this._put(uri, args, callback);
};

module.exports = ba;

