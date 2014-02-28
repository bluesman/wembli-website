/* https://github.com/balanced/balanced-api/blob/master/resources/cards.rst */
/* https://docs.balancedpayments.com/current/api.html?language=bash#tokenize-a-card */

var d = function(context) {
	this.context = context || {};
	me = this;
	/* override methods go in here */
	this.create = function(args, callback) {
		var uri = this.marketplace_uri + '/' + this.resource;
		var cb = function(uri, args, callback) {
			me._post(uri, args, callback);
		};
		me._coalesceInput(cb, uri, args, callback);
	};

	this.list = function(callback) {
		var uri = this.marketplace_uri + '/' + this.resource;
		var cb = function(uri, args, callback) {
			me._get(uri, args, callback);
		};
		me._coalesceInput(cb, uri, callback);
	};

	return this;
};

d.prototype.invalidate = function(uri, callback) {
	var args = {
		is_valid: false
	};
	if (typeof uri !== "string") {
		callback = uri;
		this.update(args, callback);
	} else {
		this.update(uri, args, callback);
	}
};

d.prototype.delete = function(uri, args, callback) {
	var me = this;
	var cb = function(uri, args, callback) {
		me._delete(uri, args, callback);
	};
	this._coalesceInput(cb, uri, args, callback);
};

module.exports = d;
