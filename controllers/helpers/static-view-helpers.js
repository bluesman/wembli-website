module.exports = {
    getAppSettings: function() { return app.settings; },
    ticketSessionId: function() {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
        var sid_length = 5;
        var sid = '';
        for (var i=0; i<sid_length; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            sid += chars.substring(rnum,rnum+1);
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
	    var fvTicket = {id:ticket.ID,
			    section:ticket.Section,
			    row:ticket.Row,
			    price:'$'+ticket.ActualPrice,
			    notes:(ticket.Notes ? ticket.Notes : 'n/a'),
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


};