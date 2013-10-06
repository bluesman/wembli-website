var syslog = require('node-syslog');
module.exports = function(req, res, next) {

	var logger = {
		_logLevel: function(l) {
			var levels = {
				0:'emerg',
				1:'alert',
				2: 'crit',
				3:'err',
				4:'warn',
				5:'notice',
				6:'info',
				7:'debug'
			};
			return levels[l];
		},
		_getSession: function() {
			return req.session;
		},
		err: function(m) {
			this._log(syslog.LOG_ERR, m);
		},
		warn: function(m) {
			this._log(syslog.LOG_WARN, m);
		},
		notice: function(m) {
			this._log(syslog.LOG_NOTICE, m);
		},
		info: function(m) {
			this._log(syslog.LOG_INFO, m);
		},
		debug: function(m) {
			this._log(syslog.LOG_DEBUG, m);
		},
		_log: function(l, m) {

			var msg = this._logLevel(l) + ' | ' + new Date() + ' | '
			var customerId = (typeof this._getSession().customer !== "undefined" && typeof this._getSession().customer._id !== "undefined") ? this._getSession().customer._id : '';
			msg = msg + customerId + ' | ';
			msg = msg + this._getSession().visitor.visitorId + ' | ' + this._getSession().visitor.visitId + ' | ' + m;

			if (process.env.NODE_ENV === 'production') {
				syslog.init("wembli-syslog", syslog.LOG_PID | syslog.LOG_ODELAY, syslog.LOG_LOCAL0);
				syslog.log(l, msg);
				syslog.close();
			} else {
				console.log(msg);
			}
		}
	};
	req.syslog = logger;
	next();
};
