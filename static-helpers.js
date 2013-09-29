var wembliModel = require('wembli-model'),
	Customer = wembliModel.load('customer');

module.exports = {
	/* STATIC */
	planNav: function(mode, payment) {
		console.log('plan nav for: '+mode);
		var nav = {
			'organizer': [{
				'name': "itinerary",
				'icon': "icon-file-alt",
				'text': "Itinerary",
			}, {
				'name': "rsvp",
				'icon': "icon-envelope",
				'text': "RSVP's",
			}, {
				'name': "cart",
				'icon': "icon-shopping-cart",
				'text': "Cart",
			}, {
				'name': "pony-up",
				'icon': "icon-money",
				'text': "Pony Up!",
			}, {
				'name': "chatter",
				'icon': "icon-comments-alt",
				'text': "Chatter",
			}],
			'friend': [{
				'name': "itinerary",
				'icon': "icon-file-alt",
				'text': "Itinerary",
			}, {
				'name': "rsvp",
				'icon': "icon-envelope",
				'text': "RSVP",
			}, {
				'name': "vote",
				'icon': "icon-bar-chart",
				'text': "Vote",
			}, {
				'name': "invitees",
				'icon': "icon-group",
				'text': "Invitees",
			}, {
				'name': "pony-up",
				'icon': "icon-money",
				'text': "Pony Up!",
			}, {
				'name': "chatter",
				'icon': "icon-comments-alt",
				'text': "Chatter",
			}]
		};
		var thisNav = nav[mode];
		var newNav = [];
		var num = 0;
		for (var i = 0; i < thisNav.length; i++) {
			if ((payment === 'no-split') && thisNav[i]['name'] === 'pony-up') {
				continue;
			}
			num++;
			thisNav[i]['section'] = "section" + num;
			thisNav[i]['id']      = "nav-" + thisNav[i]['section'];
			thisNav[i]['href']    = "#" + thisNav[i]['section'];
			newNav.push(thisNav[i]);
		}
		return newNav;

	},

	initInviteFriendsWizard: function() {
		var nav = [{
			'icon': "icon-share-alt",
			'text': "Who's It From",
		}, {
			'icon': "icon-calendar",
			'text': "Choose RSVP Date",
		}, {
			'icon': "icon-facebook",
			'text': "Facebook",
		}, {
			'icon': "icon-twitter",
			'text': "Twitter",
		}, {
			'icon': "icon-envelope",
			'text': "Send Email",
		}];

		for (var i = 0; i < 5; i++) {
			nav[i]['step'] = "step" + (i + 1);
			nav[i]['id'] = "nav-" + nav[i]['step'];
			nav[i]['href'] = "#" + nav[i]['step'];
		}
		return nav;
	},

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
