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
	var me = this;
	var cb = function(uri, args, callback) {
		me._get(uri, args, callback);
	};
	this._coalesceInput(cb, uri, args, callback);
};

a.prototype.list = function(callback) {
	var me = this;
	var uri = this.marketplace_uri + '/' + this.resource;
	var cb = function(uri, args, callback) {
		me._get(uri, args, callback);
	};
	this._coalesceInput(cb, uri, callback);
};

var update = function(uri, args, callback) {
	var me = this;
	var cb = function(uri, args, callback) {
		me._put(uri, args, callback);
	};
	this._coalesceInput(cb, uri, callback);
};

a.prototype.update = update;
a.prototype.promote = update;

a.prototype.listBankAccounts = function(uri, callback) {
	var me = this;
	/* caller is assuming there is a context */
	if (typeof uri !== 'string') {
		callback = uri;
		if (typeof this.context.bank_accounts_uri !== "undefined") {
			uri = this.context.bank_accounts_uri;
		}
	}
	var cb = function(uri, args, callback) {
		me._get(uri, args, callback);
	};
	this._coalesceInput(cb, uri, callback);
};

a.prototype.delete = function(uri, args, callback) {
	var me = this;
	var cb = function(uri, args, callback) {
		me._delete(uri, args, callback);
	};
	this._coalesceInput(cb, uri, args, callback);
};

module.exports = a;

