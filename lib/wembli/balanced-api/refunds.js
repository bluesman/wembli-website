/* https://github.com/balanced/balanced-api/blob/master/resources/debits.rst */
/* https://docs.balancedpayments.com/current/api?language=bash#create-a-new-debit */

var r = function(context) {
	this.context = context || {};
	return this;
};

module.exports = r;
