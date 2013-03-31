var http = require('http');
var xml2js = require('xml2js');
var base = '/tnwebservice/v3.1/tnwebservicestringinputs.asmx';
var method = '/SearchEvents?searchTerms=San Diego&';
//var method = '/GetCategories?';
var params = 'WebsiteConfigId=8582';
var foo = '2012-05-05T19:30:00';
var url = '/tnwebservice/v3.1/tnwebservicestringinputs.asmx/SearchEvents?WebsiteConfigId=8582&method=SearchEvents&searchTerms=San%20Diego&whereClause=WHERE%20date%3E"'+foo+'"&orderByClause=Date';
var url = '/tnwebservice/v3.1/tnwebservicestringinputs.asmx/SearchEvents?WebsiteConfigId=8582&method=SearchEvents&searchTerms=San%20Diego';

var options = {'host':'tn.wembli.com',
               'port':80,
               'path':url};

console.log(options);

var XML = new xml2js.Parser(xml2js.defaults["0.1"]);
XML.addListener('end', function(err,result) {
    if (err) {
	console.log(err);
    } else {
	console.log(result);
    }
    console.log('Done.');
});

http.get(options,function (res) {

    res.setEncoding('utf8');
    var str = '';
    res.on('data', function(d) {
        str = str+d;
        console.log(d);                                                                                                                                   
    });

    res.on('end', function() {
	XML.parseString(str);
    });
});
