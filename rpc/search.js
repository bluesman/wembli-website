var ticketNetwork = require('phatseat/ticketnetwork');
var googleMaps = require('phatseat/googlemaps');
var psUtils = require('phatseat/utils');

exports.search = {

	search: function(q, date, postalCode) {
		var me = this;

		var args = {
			searchTerms: q
		};

		var daysPadding = 4; //how many days from today for the beginDate
		var d1 = Date.today();
		var d = new Date(d1);
		d.setDate(d1.getDate() + daysPadding);

		dateFmt = d.format("isoDateTime")
		req.syslog.notice('search date > '+dateFmt);

		args.whereClause = "Date > DateTime(\"" + dateFmt + "\")";
		args.orderByClause = 'Date';
		//if there's a postal code, get the city for it
		if(typeof postalCode != "undefined" && postalCode != '') {
			googleMaps.getAddressByZip({
				address: postalCode
			}, function(err, results) {
				args.searchTerms += ' ' + results.results[0].address_components[1].long_name;
				searchEvents(args, me);
			});
		} else {
			searchEvents(args, me);
		}
	}
}

function searchEvents(args, callback) {
	var searchResults = [];
	console.log(args);
	var f = function(err, eventResults) {
			if(typeof eventResults.Event != "undefined") {
				searchResults = psUtils.sort(eventResults.Event, 'Date', 'asc');
			}
			var results = (typeof searchResults != "undefined") ? searchResults : [];
			callback(null, {
				docs: results
			});
		};

	if(args.searchTerms == '') {
		delete args.searchTerms;
		ticketNetwork.GetEvents(args, f);
	} else {
		ticketNetwork.SearchEvents(args, f);
	}
}

function merge(o1, o2) {
	for(var i in o2) {
		o1[i] = o2[i];
	}
	return o1;
}
