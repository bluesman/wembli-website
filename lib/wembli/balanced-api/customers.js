/* https://github.com/balanced/balanced-api/blob/master/resources/customers.rst */

var c = function() {
	return this;
};

c.prototype.create = function(accountInfo, callback) {
	var uri = '/v1/'+this.resource;
	this._post(uri, accountInfo, callback);
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
		if (typeof this.context !== "undefined") {
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
	var uri = '/v1/' + this.resource;
	this._get(uri, args, callback);
};

c.prototype.delete = function(uri, callback) {
	/* caller is assuming there is a context */
	if (typeof uri !== 'string') {
		callback = uri;
		if (typeof this.context !== "undefined") {
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

c.prototype.update = function(uri, args, callback) {
	if (typeof uri !== 'string') {
		callback = args;
		args     = uri;
		if (typeof this.context !== "undefined") {
			uri = this.context.uri;
		}
	}

	this._put(uri, args, callback);
};

module.exports = c;

