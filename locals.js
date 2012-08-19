var wembliModel = require('wembli-model'),
	Customer = wembliModel.load('customer');

module.exports = {
	req: function(req, res) {
		return req;
	},
	res: function(req, res) {
		return res;
	},
	session: function(req, res) {
		console.log('here');
		return req.session
	},

	/* STATIC */
	getAppSettings: function() {
		return app.settings;
	},
	ticketSessionId: function() {
		var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
		var sid_length = 5;
		var sid = '';
		for (var i = 0; i < sid_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			sid += chars.substring(rnum, rnum + 1);
		}
		return sid;
	},

	environment: function() {
		return process.env.NODE_ENV;
	},

	//turn a regular list of tickets into the fanvenues list for the map
	fanvenuesTicketList: function(tickets) {
		var ticketsList = [];
		for (var i = 0; i < tickets.length; i++) {
			var ticket = tickets[i];
			var fvTicket = {
				id: ticket.ID,
				section: ticket.Section,
				row: ticket.Row,
				price: '$' + ticket.ActualPrice,
				notes: (ticket.Notes ? ticket.Notes : 'n/a'),
			};
			ticketsList.push(fvTicket);
		}
		return JSON.stringify(ticketsList);
	},

	fbCredentials: function() {
		var credentials = {};
		credentials.appId = app.settings.fbAppId;
		credentials.appSecret = app.settings.fbAppSecret;
		credentials.host = app.settings.host;
		//console.log(credentials);
		return credentials;
	},

	makeFeedString: function(f) {
		var now = new Date().getTime();
		now = parseInt(now / 1000);
		var then = new Date(f.date_created);
		var t = then.getTime();
		t = parseInt(t / 1000);

		/*
	  subtract t from now
	  - if <= 60 : xx seconds ago
	  - if <= 3600 : xx minutes ago
	  - if <= 86400 : xx hours ago
	  - else 12/05/2012
	*/
		var s = parseInt(now - t);

		var dateStr = 'on ' + then.format('shortDate') + '.';

		if (s <= 86400) {
			var dd = parseInt(s / 3600);
			var sString = (dd == 1) ? '' : 's';
			dateStr = dd + ' hour' + sString + ' ago.';
		}

		if (s <= 3600) {
			var m = parseInt(s / 60);
			var sString = (m == 1) ? '' : 's';
			dateStr = m + ' minute' + sString + ' ago.';
		}

		if (s <= 60) {
			var sString = (s == 1) ? '' : 's';
			dateStr = parseInt(s) + ' second' + sString + ' ago.';
		}
		console.log('feed: ' + f.action.name);
		switch (f.action.name) {
		case 'initPlan':
			return 'created a new plan ' + dateStr;
			break;
		case 'updatePlan':
			return 'updated a plan ' + dateStr;
			break;
		case 'removePlan':
			return 'removed a plan ' + dateStr;
			break;
		case 'friendsCompleted':
			return 'changed an invite list ' + dateStr;
			break;
		}
		return '';

	},


};
