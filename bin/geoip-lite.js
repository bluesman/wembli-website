var geoip = require('geoip-lite');
var ip = "207.97.227.239";
var ip = "72.197.109.178";
var geo = geoip.lookup(ip);
console.log(geo);