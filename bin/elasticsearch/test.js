var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'es01.wembli.com:9200',
    log:"trace"
});

/*

client.cluster.health(function (err, resp) {
  if (err) {
    console.error(err.message);
  } else {
    console.dir(resp);
  }
});

client.indices.getMapping({
	index: 'ticket_network',
	type:'events'
}, function(err, res) {
	console.log(res);
});

client.search({
  index: 'ticket_network',
  type:'events',
  size: 5,
  body: {
	  sort: [{"DateTime":{order:"asc"}}],
  	query: {
	  	filtered: {
		    query: {
		      match: {
		        Event: 'shpongle',
		      },
		    },
		    filter: {
		      range: {
		        DateTime: {gte: "2014-03-05T00:00:00"}
		      }
		    }
		  }
		}
  }
}).then(function (resp) {
	console.log(resp.body)
}, function (error) {
  console.trace(error.message);
});

*/


/* events in san diego selling the most tickets */
client.search({
  index: 'ticket_network',
  type:'events',
  size:3,
  body: {
    "sort":[{"NumTicketsSold":{"order":"desc"}}],
    "query": {
      "filtered": {
        "query": {
          "match": {
            "City":"Diego"
          },
        },
        "filter": {
          "range": {
            "DateTime": {"gte":"2014-08-10T00:00:00"}
          }
        }
      }
    },
  }
}).then(function (resp) {
  console.log(resp.body)

}, function (error) {
  console.trace(error.message);

});
/*
client.search({
  index: 'ticket_network',
  type:'performers',
  body: {
  	"aggs":{
  		"max_tickets_sold":{
  			"max":{"field": "NumTicketsSold"}
  		}
  	}
  }
}).then(function (resp) {
	console.log(resp.body)

}, function (error) {
  console.trace(error.message);

});


*/
