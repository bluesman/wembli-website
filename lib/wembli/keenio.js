var querystring = require('querystring');
var request = require('request');
var urlLib = require('url');
var async = require('async');
var keen = require('keen.io');
var utils = require('./utils');

/* wembli-prod */
var keenio = keen.configure({
    projectId: "51818c9d897a2c51e2000003",
    writeKey: "9713902be2e9989f8e8163c0d6320ad9ce1749d1265fb72ed99254678c7e330df4a7ce8f11caac26a9841de834da4c534729a44ae673097c63126683787aeb5026943f4202cde777af834a332387e9db3232b8b4c7dc292197b2057f93d7661520de599dcabaeb2292d80eb642506b61",
    readKey: "b1028a5b11fa349ea9240249145e97cf4ca552c1e03875b955c51f960189b833f566ecf98b4260aa98a2fe1119720477a8614ac44807545eb897a94762dce9ea3bc34a515dcfbd3d2138f15543e47a3e57c07fc2209b77b8dc469cd164117fa6a11907662b2647f4faa1d7d323c70097",
    masterKey: "D28D2BA7B145845EBAA6B4AF864D65E1"
});

if (app.settings.host === 'tom') {
    /* wembli-dev */
    keenio = keen.configure({
        projectId: "51819841897a2c5208000003",
        writeKey: "817ecaf77d065bab27ea5560ed8494572e68f878c6ec24654d1d4fbf433fbed3ed5eef8224aff676e019d4bce237882bf9b05394964edef3a525b2199c8b842582f217b5d3923aa3f7b1e34ab704ea038e33953a552c4a8ea55d1968151e8b1b6a4947bb5d70df595f2cd342af135cbd",
        readKey: "93815011ebc526753f04f303611cadcae41c6a155f874616a090a7a8208b9f027c2ccb1b540ad82846d7e351934baa4c3d202255e2ef3ac4225729b2acd80d66c7b571f6754124b96a0300005d771710212202c568399a4d60643d6317a68d063ddce1cb1cec4b3e2b218e00c53e51c9",
        masterKey: "81B2E157A447393B0AAFD1AAF910329F"
    });
}

module.exports = {
    addEvent: function(collection, trackingData, req, res, cb) {
        var d = req.session.visitor.tracking;
        d = utils.merge(d,trackingData);
        keenio.addEvent(collection, d, function(err, result) {
            if (err) {
                console.log("Error adding event for: " + collection);
                cb(err);
            } else {
                console.log('added event to' + collection);
                cb(null, result);
            }
        });
    },
};
