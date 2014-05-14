var redis = require('redis');

var argv = require('optimist')
	.usage('\nquery redis for a directory url.\n\nUsage: $0 <file>\n\n')
	.
default ('p', 6379)
	.describe('p', 'redis port')
	.alias('p', 'port')
	.
default ('h', 'localhost')
	.describe('h', 'redis host')
	.alias('h', 'host')
	.
default ('a', 'directory:')
	.describe('a', 'prefix redis key to namespace your data')
	.alias('a', 'prefix')
	.demand(1)
	.argv;

var client = redis.createClient(argv.p, argv.h, {});

client.on("error", function(err) {
	console.log("REDIS Error " + err);
});

client.on('ready', function() {
	client.get(argv._[0], function(err, data) {
		if (err) {
			console.log(err)
		} else {
			console.log(data);
		}
		client.end();
		process.exit();
	});
});
