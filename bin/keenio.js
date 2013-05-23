var keen = require('keen.io');
/* wembli-prod */
/*
var keen = keen.configure({
	projectId:"51818c9d897a2c51e2000003",
	writeKey:"9713902be2e9989f8e8163c0d6320ad9ce1749d1265fb72ed99254678c7e330df4a7ce8f11caac26a9841de834da4c534729a44ae673097c63126683787aeb5026943f4202cde777af834a332387e9db3232b8b4c7dc292197b2057f93d7661520de599dcabaeb2292d80eb642506b61",
	readKey:"9713902be2e9989f8e8163c0d6320ad9ce1749d1265fb72ed99254678c7e330df4a7ce8f11caac26a9841de834da4c534729a44ae673097c63126683787aeb5026943f4202cde777af834a332387e9db3232b8b4c7dc292197b2057f93d7661520de599dcabaeb2292d80eb642506b61",
	masterKey:"D28D2BA7B145845EBAA6B4AF864D65E1"
    });
*/

/* wembli-dev */
var keen = keen.configure({
	projectId:"51819841897a2c5208000003",
	writeKey:"817ecaf77d065bab27ea5560ed8494572e68f878c6ec24654d1d4fbf433fbed3ed5eef8224aff676e019d4bce237882bf9b05394964edef3a525b2199c8b842582f217b5d3923aa3f7b1e34ab704ea038e33953a552c4a8ea55d1968151e8b1b6a4947bb5d70df595f2cd342af135cbd",
	readKey:"93815011ebc526753f04f303611cadcae41c6a155f874616a090a7a8208b9f027c2ccb1b540ad82846d7e351934baa4c3d202255e2ef3ac4225729b2acd80d66c7b571f6754124b96a0300005d771710212202c568399a4d60643d6317a68d063ddce1cb1cec4b3e2b218e00c53e51c9",
	masterKey:"81B2E157A447393B0AAFD1AAF910329F"
});


// send single event to Keen IO
keen.addEvent("my event collection", {"property name": "property value"}, function(err, res) {
	if (err) {
	    console.log("Oh no, an error!");
	} else {
	    console.log("Hooray, it worked!");
	}
});

// send multiple events to Keen IO
keen.addEvents({
	"my first event collection": [{"property name": "property value"}, ...],
	    "my second event collection": [{"property name2": "property value 2"}]
	    }, function(err, res) {
	if (err) {
	    console.log("Oh no, an error!");
	} else {
	    console.log("Hooray, it worked!");
	}
});
