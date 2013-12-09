var http = require('http');
var xml2js = require('xml2js');
var url2 = '/tnwebservice/v3.2/tnwebservicestringinputs.asmx/GetHighInventoryPerformers?WebsiteConfigId=8582&method=GetHighInventoryPerformers&numReturned=500&parentCategoryID=&childCategoryID=&grandchildCategoryID=';

var url = '/tnwebservice/v3.2/tnwebservicestringinputs.asmx/GetHighSalesPerformers?WebsiteConfigId=8582&method=GetHighSalesPerformers&numReturned=500&parentCategoryID=&childCategoryID=&grandchildCategoryID=';

var options = {'host':'tn.wembli.com',
               'port':80,
               'path':url};

var XML = new xml2js.Parser(xml2js.defaults["0.1"]);
var XML2 = new xml2js.Parser(xml2js.defaults["0.1"]);

var inventory = {};
var sales = {};
XML.addListener('end', function(result) {
	for(var i=0; i<result.PerformerPercent.length; i++) {
	    var el = result.PerformerPercent[i];
	    sales[el.ID] = el;
	}

	XML2.addListener('end', function(result2) {
		for(var i=0; i<result2.PerformerPercent.length; i++) {
		    var el2 = result2.PerformerPercent[i];
		    var sale = sales[el2.ID];
		    var line = el2.ID+"\t"+el2.Description+"\t"+el2.Percent+"\t";

		    if (typeof sale !== "undefined") {
			line += sale.Percent;
		    } else {
			line += 0;
		    }
		    console.log(line);
		}

	});

	options.path = url2;
	http.get(options,function (res2) {

		res2.setEncoding('utf8');
		var str2 = '';
		res2.on('data', function(d2) {
			str2 = str2+d2;
		    });

		res2.on('end', function() {

			XML2.parseString(str2);
		    });
	    });


});

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
