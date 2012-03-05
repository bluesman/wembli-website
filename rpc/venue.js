var sys = require('sys'),
    venue = require('../models/venue'),
    venue = require('../models/media');

exports.venue = {

    get: function(id,name) {
	var me = this;
	//get the matching mongo row for this
	var venueObj = new Venue();

	if ("undefined" !== typeof id) {
	    //have an id? use it
	    venueObj.findById(id,function(err,venue) {
		    if(venue){venue.id = venue._id.toHexString();}
		    me(null,venue);
		});

	} else if("undefined" !== typeof name) {
	    venueObj.findByName(name,function(err,venue) {
		    if(venue != null){venue.id = venue._id.toHexString();}
		    me(null,venue);
		});

	} else {
	    me("Invalid parameters supplied to venue.get(): id or name is required");
	}
    },


    search: function(name,event_type,address,ip,lat,lon,proximity) {
	var me = this;
	//get the matching mongo row for this
	var venueObj = new Venue();


	if ("undefined" !== typeof name) {
	    //have an id? use it
	    venueObj.findAll(name.toLowerCase(),function(error,venues) {
		    if( error ) {
			me(error);
		    } else {
			venues.forEach(function(venue) {
			    sys.log(venue.name);
			    venue.id = venue._id.toHexString();
			});
			me(null,venues);

		    }
		});

	} else {
	    me("Invalid parameters supplied to venue.search(): id or name is required");
	}
	
    },

    upsertByName: function(venue) {
	var me = this;
	var venueObj = new Venue();
	venueObj.upsertByName(venue,function(error,venue) {
		if (error) {
		    me(error);
		} else {
		    venue.id = venue._id.toHexString();
		    me(null,venue);
		}
	    });
    },
    
    gallery: function(venue_id) {
	var me = this;
	var mediaObj = new Media();
	mediaObj.find({venue_id:venue_id},function(error,gallery) {
		if (error) {
		    me(error);
		} else {
		    gallery.forEach(function(media) {
			    media.id = media._id.toHexString();
			});
		    me(null,gallery);
		}
		
	    });
    }

}
