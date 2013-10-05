var syslog = require('node-syslog');
module.exports = function(req, res, next) {

	var logger = {
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
			var msg = new Date() + ' | ' + this._getSession().visitor.visitorId + ' | ' + this._getSession().visitor.visitId + ' | ' + m;

			if (process.env.NODE_ENV === 'production') {
				syslog.init("wembli-syslog", syslog.LOG_PID | syslog.LOG_ODELAY, syslog.LOG_LOCAL0);
				syslog.log(l, m);
				syslog.close();
			} else {
				console.log(msg);
			}
		}
	};
	req.syslog = logger;
	next();
};
