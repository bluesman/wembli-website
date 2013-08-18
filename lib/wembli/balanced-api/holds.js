/* https://github.com/balanced/balanced-api/blob/master/resources/debits.rst */
/* https://docs.balancedpayments.com/current/api?language=bash#create-a-new-debit */

var h = function(context) {
	this.context = context || {};
	return this;
};

h.prototype.capture = function(uri, args, callback) {
	var me = this;
	var cb = function(uri, args, callback) {
		if (typeof args.amount === "undefined") {
			if (typeof me.context.amount !== "undefined") {
				args.amount = me.context.amount;
			}
		}
		if (!/debits$/.test(uri)) {
			if (typeof me.context.customer !== "undefined" && typeof me.context.customer.debits_uri !== "undefined") {
				uri = me.context.customer.debits_uri;
			} else {
				throw "Invalid Arguments: uri must be a debits_uri";
			}
		}
		if (typeof args.hold_uri === "undefined") {
			if (typeof me.context.uri !== "undefined") {
				args.holds_uri = me.context.uri;
			} else {
				throw "Invalid Arguments: args must contain hold_uri";
			}
		}
		me._post(uri, args, callback);
	};
	this._coalesceInput(cb, uri, callback);

};

h.prototype.void = function(uri, callback) {
	var args = {
		is_void: true
	};
	if (typeof uri !== "string") {
		callback = uri;
		this.update(args, callback);
	} else {
		this.update(uri, args, callback);
	}
};

module.exports = h;
