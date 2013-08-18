/* https://github.com/balanced/balanced-api/blob/master/resources/bank_accounts.rst */
/* https://docs.balancedpayments.com/current/api.html?language=bash#creating-a-new-bank-account */

var ba = function(context) {
	this.context = context || {};
	return this;
};

ba.prototype.verify = function(uri, callback) {
	var me = this;
	var cb = function(uri, args, callback) {
		if (typeof me.context.verifications_uri !== "undefined") {
			uri = me.context.verifications_uri;
		}
		me._post(uri, args, callback);
	};
	this._coalesceInput(cb, uri, callback);
};

ba.prototype.getVerification = function(uri, callback) {
	var me = this;
	if (typeof uri !== 'string') {
		throw "Invalid Arguments: uri must be a string";
	}
	var cb = function(uri, args, callback) {
		me._get(uri, args, callback);
	};
	this._coalesceInput(cb, uri, callback);
};

ba.prototype.confirm = function(uri, args, callback) {
	var me = this;
	if (typeof uri !== 'string') {
		throw "Invalid Arguments: uri must be a string";
	}
	var cb = function(uri, args, callback) {
		me._put(uri, args, callback);
	};
	this._coalesceInput(cb, uri, args, callback);
};

ba.prototype.credit = function(uri, args, callback) {
	var me = this;
	var cb = function(uri, args, callback) {
		if (typeof me.context.credits_uri !== "undefined") {
			uri = me.context.credits_uri;
		}
		me._post(uri, args, callback);
	};
	this._coalesceInput(cb, uri, args, callback);
};

ba.prototype.listCredits = function(uri, args, callback) {
	var me = this;
	var cb = function(uri, args, callback) {
		if (typeof me.context.credits_uri !== "undefined") {
			uri = me.context.credits_uri;
		}
		me._get(uri, args, callback);
	};
	this._coalesceInput(cb, uri, args, callback);
};


module.exports = ba;

