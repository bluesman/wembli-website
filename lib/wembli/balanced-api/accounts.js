/* https://github.com/balanced/balanced-api/blob/master/resources/accounts.rst */

var a = function(context) {
	this.context = context || {};
	return this;
};

/*
	can be used to create buyer, person merchant or business merchant
	depending on args passed in.
*/
a.prototype.create = function(accountInfo, callback) {
	var uri = this.marketplace_uri + '/' + this.resource;
	this._post(uri, accountInfo, callback);
};

a.prototype.get = function(uri, args, callback) {

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

a.prototype.list = function(args,callback) {
	if (typeof callback === "undefined") {
		callback = args;
		args = {};
	}
	var uri = this.options.marketplace_uri + '/' + this.resource;
	this._get(uri, args, callback);
};

a.prototype.update = function(uri, args, callback) {
	if (typeof uri !== 'string') {
		callback = args;
		args     = uri;
		if (typeof this.context.bank_accounts_uri !== "undefined") {
			uri = this.context.uri;
		}
	}

	this._put(uri, args, callback);
};

a.prototype.promote = a.update;

a.prototype.listBankAccounts = function(uri, args, callback) {

	/* caller is assuming there is a context */
	if (typeof uri !== 'string') {
		callback = args;
		args     = uri;
		if (typeof this.context.bank_accounts_uri !== "undefined") {
			uri = this.context.bank_accounts_uri;
		}
	}

	this._get(uri, args, callback);
};

module.exports = a;

