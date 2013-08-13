/* https://github.com/balanced/balanced-api/blob/master/resources/debits.rst */

var c = function(context) {
	this.context = context || {};
	return this;
};


c.prototype.create = function(uri, args, callback) {
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
	this._post(uri, args, callback);
};

c.prototype.get = function(uri, args, callback) {
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

c.prototype.list = function(args,callback) {
	if (typeof callback === "undefined") {
		callback = args;
		args = {};
	}
	var uri = this.marketplace_uri + '/' + this.resource;
	this._get(uri, args, callback);
};

c.prototype.update = function(uri, args, callback) {
	if (typeof uri !== 'string') {
		callback = args;
		args     = uri;
		if (typeof this.context.bank_accounts_uri !== "undefined") {
			uri = this.context.uri;
		}
	}

	this._put(uri, args, callback);
};

module.exports = c;

