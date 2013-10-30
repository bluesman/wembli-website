var fs = require('fs');
var csv = require('csv');

var dir = '/Users/tom/Desktop/email-lists/';
var shortList = 'members_Wembli_Newsletter_Oct_28_2013.csv';
var longList = 'members_Wembli_Updates_Oct_29_2013.csv';

// opts is optional
var opts = {};

var filter = {};
csv()
	.from.path(dir + shortList, {
		delimiter: ','
	})
	.to.array(function(data) {

		for (var i = 0; i < data.length; i++) {
			var row = data[i];
			filter[row[0]] = true;
		};

		csv()
			.from.path(dir + longList, {
				delimiter: ','
			})
			.to(dir+'filtered.csv')
			.transform(function(row) {
				if (filter[row[0]]) {
					console.log('filtered: '+row[0]);
					//return false;
				} else {
					//console.log('unfiltered: '+row[0]);

					return row;
				}
			})
			.on('record', function(row, index) {
//				console.log('#' + index + ' ' + JSON.stringify(row));
			})
			.on('close', function(count) {
				// when writing to a file, use the 'close' event
				// the 'end' event may fire before the file has been written
				console.log('Number of lines: ' + count);
			})
			.on('error', function(error) {
				console.log(error.message);
			});
	});
