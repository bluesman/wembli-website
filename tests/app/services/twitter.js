var twitter = require('ntwitter');

var twit = new twitter({
		consumer_key: 'aGekerxvrd9RczHHEOLEw',
		consumer_secret: "PUdQVzslAATiRCFhTXetmjbaFGoWIM092bSkuulFdk",
		access_token_key: "179824893-7RXm9ID2yZcuKeWIkJj9RwEdoco0nBoSVq13BDkt",
		access_token_secret: "YKzjjJXn0Mcu2ol6hTdMm65BfXNUqbdGQ7hAiO1o0"
	});

twit.verifyCredentials(function(err,result) {
	console.log('verified twitter credentials:');
	console.log(err);
	console.log(result);

	twit.get('/friends/list.json',{},function(err,results) {
		console.log('results from get friends list' );
		console.log(results);
		console.log(err);
	});
});


