var querystring = require('querystring');
var http = require('http');
var xml2js = require('xml2js');
var psUtils = require('wembli/utils');

module.exports = {
    SearchEvents: function(args,callback) {
	var template = {
	    method:'SearchEvents',
	    searchTerms:'*',
	    whereClause:null,
	    orderByClause:null
	};
	var params = merge(template,args);
	makeRequest(params,callback);
    },
    SearchPerformers: function(args,callback) {
	var template = {
	    method:'SearchPerformers',
	    searchTerms:null,
	    whereClause:null,
	    orderByClause:null
	};
	var params = merge(template,args);
	makeRequest(params,callback);
    },
    GetEventPerformers: function(args,callback) {
	var template = {
	    method: 'GetEventPerformers',
	};
	var params = psUtils.merge(template,args);
	makeRequest(params,callback);
    },
    GetHighSalesPerformers: function(args,callback) {
	var template = {
	    method: 'GetHighSalesPerformers',
	    numReturned: null,
	    parentCategoryID:null,
	    childCategoryID:null,
	    grandchildCategoryID:null	    
	};
	var params = psUtils.merge(template,args);
	makeRequest(params,callback);
    },
    GetCategories: function(args,callback) {
	var template = {
	    method:'GetCategories'
	};
	var params = merge(template,args);
	makeRequest(params,callback);
    },
    GetVenue: function(args,callback) {
	console.log(args);
	var template = {
	    method:'GetVenue',
	    VenueID:null
	};
	var params = merge(template,args);
	makeRequest(params,callback);
    },
    GetVenueConfigurations: function(args,callback) {
	var template = {
	    method:'GetVenueConfigurations',
	    VenueID:null
	};
	var params = merge(template,args);
	makeRequest(params,callback);
    },
    GetTickets: function(args,callback) {
	var template = {
	    method:'GetTickets',
	    numberOfRecords:20,
	    eventID:null,
	    lowPrice:null,
	    highPrice:null,
	    ticketGroupID:null,
	    requestedTixSplit:null,
	    whereClause:null,
	    orderByClause:null	    
	};
	var params = merge(template,args);
	makeRequest(params,callback);
    },
    GetPerformerByCategory: function(args,callback) {
	var template = {
	    method:'GetPerformerByCategory',
	    hasEvent:true,
	    parentCategoryID:1,
	    childCategoryID:null,
	    grandchildCategoryID:null,
	};
	var params = merge(template,args);
	makeRequest(params,callback);
	
    },
    GetEvents: function(args,callback) {
	var template = {
	    method:'GetEvents',
	    numberOfEvents:100,
	    parentCategoryID:null,
	    childCategoryID:null,
	    grandchildCategoryID:null,
	    eventID:null,
	    eventName:null,
	    eventDate:null,
	    beginDate:null,
	    endDate:null,
	    venueID:null,
	    venueName:null,
	    stateProvDesc:null,
	    stateID:null,
	    cityZip:null,
	    nearZip:null,
	    performerID:null,
	    performerName:null,
	    noPerformers:null,
	    lowPrice:null,
	    highPrice:null,
	    modificationDate:null,
	    onlyMine:null,
	    whereClause:null,
	    orderByClause:'Date'
	};
	var params = merge(template,args);
	makeRequest(params,callback);
    },
}

function merge(o1,o2) {
    for(var i in o2) { o1[i] = o2[i]; }
    return o1;
}

function makeRequest(args,callback) {
    var params = querystring.stringify(args, sep='&', eq='=');
    var base = '/tnwebservice/v3.1/tnwebservicestringinputs.asmx';
    var uri = base + '/'+args.method+'?WebsiteConfigId=8582&'+params;
    var host = 'tnwebservices.ticketnetwork.com';
    //var host = 'tnwebservices-test.ticketnetwork.com';
    var options = {'host':host,
		   'port':80,
		   'path':uri};

    console.log(uri);
    var XML = new xml2js.Parser();
    XML.addListener('end', function(result) {
	callback(null,result);
    });

    http.get(options,function (res) {
	res.setEncoding('utf8');
	var str = '';
	res.on('data', function(d) {
            str = str+d;
	});
	res.on('end', function() {
	    console.log(res.statusCode);
	    if (res.statusCode == '200') {
		XML.parseString(str);
	    } else {
		callback(str);
	    }
	});
    });
}

