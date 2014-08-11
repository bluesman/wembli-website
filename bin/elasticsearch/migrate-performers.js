var elasticsearch = require('elasticsearch');

var client01 = new elasticsearch.Client({
		host: 'es01.wembli.com:9200',
});

var client02 = new elasticsearch.Client({
		host: 'es02.wembli.com:9200',
});

var venueMap = {
	"venueid": "VenueID",
	"venuename": "Venue",
	"venueurl":"Url",
	"venuestreet1":"StreetAddress",
	"venuestreet2":"StreetAddress2",
	"venuecity":"City",
	"venuestateprovince":"State",
	"venuezip":"Zip",
	"venuecapacity":"Capacity",
	"venuedirections":"Directions",
	"venueparking":"Parking",
	"venuepublictrans":"PublicTrans",
	"venuewillcall":"WillCall",
	"venuerules":"Rules",
	"venuechildrules":"ChildRules",
	"venuecountry":"Country",

}

var mappings = {
	'venues': {
		"_id": {
			"path":"VenueID",
		},
    "properties" : {
      "Country" : {
        "type" : "string"
      },
      "State" : {
        "type" : "string"
      },
      "StreetAddress" : {
        "type" : "string"
      },
      "Venue" : {
        "type" : "string"
      },
      "VenueID" : {
        "type" : "integer"
      },
      "Zip" : {
        "type" : "string"
      },
    }
	},
	'performers': {
		"_id": {
			"path":"PerformerID",
		},
		"properties": {
      "ChildCategory" : {
        "type" : "string"
      },
      "ChildCategoryID" : {
        "type" : "integer"
      },
      "GrandChildCategory" : {
        "type" : "string"
      },
      "GrandChildCategoryID" : {
        "type" : "integer"
      },
      "NumOrders" : {
        "type" : "integer"
      },
      "NumTicketsSold" : {
        "type" : "integer"
      },
      "ParentCategory" : {
        "type" : "string"
      },
      "ParentCategoryID" : {
        "type" : "integer"
      },
      "PeformerName" : {
        "type" : "string"
      },
      "PerformerID" : {
        "type" : "integer"
      }
		}
	},
	'events': {
		"_id": {
			"path":"EventID",
		},
		"properties": {
      "CCat" : {
        "type" : "string"
      },
      "CCatID" : {
        "type" : "integer"
      },
      "City" : {
        "type" : "string"
      },
      "Country" : {
        "type" : "string"
      },
      "CountryID" : {
        "type" : "integer"
      },
      "DateTime" : {
        "type" : "date",
        "format": "MM/dd/yyyy HH:mm||dateOptionalTime"
      },
      "Event" : {
        "type" : "string"
      },
      "EventID" : {
        "type" : "integer"
      },
      "EventUpdateDate" : {
        "type" : "date",
        "format":"dateOptionalTime||yyyy-MM-dd HH:mm:ss.SSSSSSSSS||yyyy-MM-dd HH:mm:ss"
      },
      "GCat" : {
        "type" : "string"
      },
      "GCatID" : {
        "type" : "integer"
      },
      "HasInteractiveMap" : {
        "type" : "boolean"
      },
      "IMAGEURL" : {
        "type" : "string"
      },
      "MaxPrice" : {
        "type" : "float"
      },
      "MinPrice" : {
        "type" : "float"
      },
      "NumOrders" : {
        "type" : "integer"
      },
      "NumTicketsSold" : {
        "type" : "integer"
      },
      "PCat" : {
        "type" : "string"
      },
      "PCatID" : {
        "type" : "integer"
      },
      "Performer" : {
        "type" : "string"
      },
      "PerformerID" : {
        "type" : "integer"
      },
      "State" : {
        "type" : "string"
      },
      "StateID" : {
        "type" : "integer"
      },
      "TicketsYN" : {
        "type" : "string"
      },
      "URLLink" : {
        "type" : "string"
      },
      "Venue" : {
        "type" : "string"
      },
      "VenueID" : {
        "type" : "integer"
      },
      "VenueStreetAddress" : {
        "type" : "string"
      },
      "Zip" : {
        "type" : "string"
      }
    }
	}
};

var handleType = function(type) {
	console.log('type: '+type);

	var nextType = false;
	var mapping = {};
	mapping[type] = mappings[type];

	/* set the mapping for the indices */
	client01.indices.putMapping({
		index:'ticket_network',
		type: type,
		body: mapping
	}, function(err, resp) {

		var cnt = 0;
		// first we do a search, and specify a scroll timeout
		client02.search({
			index:'ticket_network',
			type:type,
		  searchType: 'scan',
		  query: {match_all:{}},
		  scroll: '1m',
		  size:100
		}, function getMoreUntilDone(error, response) {
			if (error) {
				console.log(error);
				process.exit(0);
			}

			if (nextType) {
				console.log('next type');
				return;
			}

			if (response.hits.total !== cnt && !response.hits.hits[0]) {
				console.log('getting more');
		    // now we can call scroll over and over
		    client02.scroll({
		      scrollId: response._scroll_id,
		      scroll: '1m'
		    }, getMoreUntilDone);
		    return;
			}

			var cnt2 = 0;
		  response.hits.hits.forEach(function (hit) {
		  	var l = response.hits.hits.length;
			  var b = hit._source;
		  	if (type === "venues") {
		  		b = {};
		  		for (var key in hit._source) {
		  			var newKey = venueMap[key] || key;
		  			b[newKey] = hit._source[key];
		  		};
		  	}

				client01.index({
					index: 'ticket_network',
					type: type,
					body: b
				}, function(err, res) {
		  		cnt++;
			  	cnt2++;
					if (err) {
						console.log('err creating index');
						console.log(err);
					}

					if (l === cnt2) {
					  if (response.hits.total !== cnt) {
					  	console.log('not finished scroll again');
					    // now we can call scroll over and over
					    client02.scroll({
					      scrollId: response._scroll_id,
					      scroll: '1m'
					    }, getMoreUntilDone);

					  } else {
					    console.log('done with '+type);
					    process.exit(0);
					  }
					}
				});
		  });
		});
	});
};
handleType('performers');
