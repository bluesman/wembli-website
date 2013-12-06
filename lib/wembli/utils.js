var querystring = require('querystring'),
	async = require('async'),
	crypto = require('crypto'),
	http = require('http');

module.exports = {
	inArray: function(el, a) {
		for (i in a) {
			if (el === a[i]) {
				return true;
			}
		}
		return false;
	},
	deepCopy: function(p, c) {
		return _deepCopy(p, c);
	},
	sort: function(ary, key, order) {
		//make sure our ary is an ary
		if (!(Array.isArray(ary))) {
			ary = [ary];
		}
		order = ((typeof order == "undefined") || (order == 'asc')) ? 'asc' : 'desc';
		var greaterThan = 1;
		var lessThan = -1;
		if (order == 'desc') {
			greaterThan = -1;
			lessThan = 1;
		}
		ary.sort(function(a, b) {
			if (a[key] > b[key]) return greaterThan;
			if (a[key] < b[key]) return lessThan;
			return 0;
		});
		return ary;
	},

	/*
	 o2 stomps on o1
	 */
	merge: function(o1, o2) {
		for (var i in o2) {
			o1[i] = o2[i];
		}
		return o1;
	},
	mergeRecursive: function(obj1, obj2) {
		for (var p in obj2) {
			try {
				if (obj2[p].constructor == Object) {
					obj1[p] = mergeRecursive(obj1[p], obj2[p]);
				}
				// Property in destination object set; update its value.
				else if (Array.isArray(obj2[p])) {
					// obj1[p] = [];
					if (obj2[p].length < 1) {
						obj1[p] = obj2[p];
					} else {
						obj1[p] = mergeRecursive(obj1[p], obj2[p]);
					}

				} else {
					obj1[p] = obj2[p];
				}
			} catch (e) {
				// Property in destination object not set; create it and set its value.
				obj1[p] = obj2[p];
			}
		}
		return obj1;

	},
	digest: function(string) {
		var hash = crypto.createHash('sha512');
		hash.update(string);
		var digest = hash.digest(encoding = 'base64');
		return digest.replace(/[\/\+]/g, '');
	},

	slugify: function(string) {
		/* lowercase, sub spaces for dash, no more than 1 dash in a row,  */
		var slug = string.toLowerCase().replace(/\W/g, ' ');
		slug = slug.replace(/\s\s*/g, '-');
		/* no - at beginning or end */
		slug = slug.replace(/^-/, '');
		slug = slug.replace(/-$/, '');
		return slug;
	},

	searchBeginDate: function() {
		var daysPadding = 4; //how many days from today for the beginDate
		var d = Date.today();
		d2 = new Date(d);
		d2.setDate(d.getDate() + daysPadding);
		//format the beginDate for the tn query
		return d2.format("shortDate");
	},

	md5: function(string) {
		hash = crypto.createHash('md5');
		hash.update(string);
		token = hash.digest(encoding = 'base64');
		token = token.replace(/[\/\+]/g, '');
		return token;
	},

	makeRequest: function(args, callback) {
		var options = {};
		options.host = args.host;
		delete args['host'];
		options.port = args.port;
		delete args['port'];
		options.path = args.path;
		delete args['path'];

		var uri = querystring.stringify(args, sep = '&', eq = '=');
		options.path += '?' + uri;
		var req = http.request(options, function(res) {
			res.setEncoding('utf8');
			var str = '';
			res.on('data', function(d) {
				str = str + d;
			});

			res.on('end', function() {
				callback(null, JSON.parse(str));
			});

		});

		req.end();

		req.on('error', function(e) {
			callback(e);
		});
	}

}

function _deepCopy(p, c) {
	var c = c || {};
	for (var i in p) {
		if (typeof p[i] === 'object') {
			c[i] = (p[i].constructor === Array) ? [] : {};
			_deepCopy(p[i], c[i]);
		} else {
			c[i] = p[i];
		}
	}
	return c;
}
