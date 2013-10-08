var http = require('http');
var xml2js = require('xml2js');
var base = '/tnwebservice/v3.1/tnwebservicestringinputs.asmx';
var method = '/GetHighSalesPerformers?';
//var method = '/GetCategories?';
var params = 'WebsiteConfigId=8582';
var foo = '2013-10-10T19:30:00';
var url = '/tnwebservice/v3.1/tnwebservicestringinputs.asmx/SearchEvents?WebsiteConfigId=8582&method=SearchEvents&searchTerms=San%20Diego';
var url = '/tnwebservice/v3.1/tnwebservicestringinputs.asmx/GetHighSalesPerformers?WebsiteConfigId=8582&method=GetHighSalesPerformers&ParentCategoryID=&numReturned=';
var url = '/tnwebservice/v3.1/tnwebservicestringinputs.asmx/GetCategoriesMasterList?WebsiteConfigId=8582&method=GetCategoriesMasterList';
var url = '/tnwebservice/v3.1/tnwebservicestringinputs.asmx/GetCategories?WebsiteConfigId=8582&method=GetCategories&ParentCategoryID=0';
//var url = '/tnwebservice/v3.2/tnwebservicestringinputs.asmx/GetHighSalesPerformers?WebsiteConfigId=8582&method=GetHighSalesPerformers&numReturned=10&parentCategoryID=3&childCategoryID=&grandchildCategoryID='
var url = '/tnwebservice/v3.1/tnwebservicestringinputs.asmx/GetPricingInfo?WebsiteConfigId=8582&method=GetPricingInfo&EventID=2077469';
var url = '/tnwebservice/v3.1/tnwebservicestringinputs.asmx/SearchEvents?WebsiteConfigId=8582&method=SearchEvents&searchTerms=San%20Diego&whereClause=WHERE%20date%3E"'+foo+'"&orderByClause=Date';

var options = {'host':'tn.wembli.com',
               'port':80,
               'path':url};

var XML = new xml2js.Parser(xml2js.defaults["0.1"]);
XML.addListener('end', function(err,result) {
    if (err) {
	console.log(err);
    } else {

    }
    console.log('Done.');
    console.log(result);

});

console.log(url);

http.get(options,function (res) {

    res.setEncoding('utf8');
    var str = '';
    res.on('data', function(d) {
        str = str+d;
    });

    res.on('end', function() {
    	XML.parseString(str);
    });
});
