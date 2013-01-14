var ticketNetwork = require('phatseat/ticketnetwork');
var googleMaps = require('phatseat/googlemaps');
var psUtils = require('phatseat/utils');

exports.search = {

	search: function(q, date, postalCode) {
		var me = this;
		console.log(q);
		console.log(date);
		console.log(postalCode);
		var args = {
			searchTerms: q
		};
		var d = new Date();
		if(typeof date != "undefined" && date != '') {
			d = new Date(date);
		}
		dateFmt = d.format("isoDateTime")
		args.whereClause = "Date > DateTime(\"" + dateFmt + "\")";
		args.orderByClause = 'Date';
		console.log(dateFmt);
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
