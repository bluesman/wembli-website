var pw = require('../lib/wembli/parkwhiz');
/*
 { location_name: 'Park & Go',
    location_id: 2193,
    parkwhiz_url: 'http://www.parkwhiz.com/p/san-diego-parking/2535-pacific-hwy/',
    address: '2535 Pacific Hwy.',
    city: 'San Diego',
    state: 'CA',
    zip: '92101',
    type: 'commercial-garage',
    timezone: 'America/Los_Angeles',
    lat: '32.730307',
    lng: '-117.1738699',
    eticket: 0,
    directions: 'This parking lot is on the northeast corner of W Laurel St and Pacific Highway. The entrance for the lot is on the east side of Pacific Highway. Look for a blue and white \'Park & Go\' sign near the entrance.',
    description: '24 hour, lit, secure outdoor paking facility serving San Diego Lindbergh Field and the Cruise Ship Terminal.<br />\r\n<br />\r\nARRIVAL INFO: Please arrive at Park & Go 15 minutes prior to the time you want to be at your airport or cruise ship terminal. <br />\r\n<br />\r\nAIRPORT/CRUISE SHIP TRANSPORTATION: The shuttle bus will pick you up at your car, assist with your luggage and drop you off at the terminal door. When you return back to the airport, please give us a call to let us to expect you for the shuttle service.',
    recommendations: 14 },

*/



pw.searchVenues({name:'US Cellular'},function(err,result) {
   console.log(result);
   pw.getVenue({method:result[0].url_fragment,start:Date.now()},function(err,venue) {
      console.log('venue for '+result[0].url_fragment);
        console.log(venue);
   });
});
/*
pw.getAllLocations({},function(err,results) {
    //console.log('all parking locations');
    //console.log(results);
});

console.log('san-diego-parking');
var tsStart = parseInt(Date.now() / 1000);
var tsEnd = parseInt(tsStart + (60*60*24));
pw.getLocation({method:'/san-diego-parking/2535-pacific-hwy/',start:tsStart,end:tsEnd},function(err,result) {
    console.log(result);
});


pw.search({destination:'San Diego',start:tsStart,end:tsEnd},function(err,result) {
    console.log(result);
})
*/
