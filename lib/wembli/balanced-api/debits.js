/* https://github.com/balanced/balanced-api/blob/master/resources/debits.rst */
/* https://docs.balancedpayments.com/current/api?language=bash#create-a-new-debit */

var d = function(context) {
	this.context = context || {};
	return this;
};

d.prototype.refund = function(uri, callback) {
	var me = this;
	var cb = function(uri, args, callback) {
		if (typeof me.context.refunds_uri !== "undefined") {
			uri = me.context.refunds_uri;
		}
		me._post(uri, args, callback);
	};
	this._coalesceInput(cb, uri, callback);
};

module.exports = d;

