/* https://github.com/balanced/balanced-api/blob/master/resources/customers.rst */
/* https://docs.balancedpayments.com/current/api.html#creating-a-customer */

var c = function(context) {
	this.context = context || {};
	return this;
};

c.prototype.addCard = function(uri, args, callback) {
	this.update(uri, args, callback);
};

c.prototype.listCards = function(uri, args, callback) {
	var me = this;
	var cb = function(uri, args, callback) {
		if (typeof me.context.cards_uri !== "undefined") {
			uri = me.context.cards_uri;
		}
		me._get(uri, args, callback);
	};
	this._coalesceInput(cb, uri, args, callback);
};

c.prototype.addBankAccount = function(uri, args, callback) {
	this.update(uri, args, callback);
};

c.prototype.listBankAccounts = function(uri, args, callback) {
	var me = this;
	var cb = function(uri, args, callback) {
		if (typeof me.context.bank_accounts_uri !== "undefined") {
			uri = me.context.bank_accounts_uri;
		}
		me._get(uri, args, callback);
	};
	this._coalesceInput(cb, uri, args, callback);
};

c.prototype.refund = function(uri, args, callback) {
	var me = this;
	var cb = function(uri, args, callback) {
		if (typeof me.context.refunds_uri !== "undefined") {
			uri = me.context.refunds_uri;
		}
		me._post(uri, args, callback);
	};
	this._coalesceInput(cb, uri, args, callback);
};

c.prototype.hold = function(uri, args, callback) {
	var me = this;
	var cb = function(uri, args, callback) {
		if (typeof me.context.holds_uri !== "undefined") {
			uri = me.context.holds_uri;
		}
		me._post(uri, args, callback);
	};
	this._coalesceInput(cb, uri, args, callback);
};

c.prototype.debit = function(uri, args, callback) {
	var me = this;
	var cb = function(uri, args, callback) {
		if (typeof me.context.debits_uri !== "undefined") {
			uri = me.context.debits_uri;
		}

		me._post(uri, args, callback);
	};
	this._coalesceInput(cb, uri, args, callback);
};

c.prototype.listDebits = function(uri, args, callback) {
	var me = this;
	var cb = function(uri, args, callback) {
		if (typeof me.context.debits_uri !== "undefined") {
			uri = me.context.debits_uri;
		}
		me._get(uri, args, callback);
	};
	this._coalesceInput(cb, uri, args, callback);
}

c.prototype.listRefunds = function(uri, args, callback) {
	var me = this;
	var cb = function(uri, args, callback) {
		if (typeof me.context.refunds !== "undefined") {
			uri = me.context.refunds;
		}
		me._get(uri, args, callback);
	};
	this._coalesceInput(cb, uri, args, callback);
}

c.prototype.listHolds = function(uri, args, callback) {
	var me = this;
	var cb = function(uri, args, callback) {
		if (typeof me.context.holds_uri !== "undefined") {
			uri = me.context.holds_uri;
		}
		me._get(uri, args, callback);
	};
	this._coalesceInput(cb, uri, args, callback);
}


module.exports = c;

