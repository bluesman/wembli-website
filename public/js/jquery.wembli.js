/*
  wembli.com JavaScipt API
    Version: 0.1 (alpha)
  
 */
(function($,window,undefined) {
    Wembli.prototype.requestUrl = "/";

    function Wembli(args) {
	//if (args.token === undefined) throw new Error("Wembli() requires a valid api key as the token argument");
	//this.token = args.token;
    }

    Wembli.prototype.setSession = function(args,callback) {
	$.ajax({
	    data: args,
	    success: function(data) {
		callback(null,data.result);
	    }
	});	
    };

    /* event builder methods */
    Wembli.prototype.eventPlan = {
	get: function(args,callback) {
	    var me = this;
	    $.ajax({
		url: "/",
		dataType:"json",
		global: false,
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify({
		    "jsonrpc":"2.0",
		    "method":"eventplan.getCurrentPlan",
		    "params":args,
		    "id":1
		}),
		success: function(data) {
		    callback(null,data.result.eventplan);
		}
	    });
	},
	addTicketGroup: function(args,callback) {
	    var me = this;
	    $.ajax({
		url: "/",
		dataType:"json",
		global: false,
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify({
		    "jsonrpc":"2.0",
		    "method":"eventplan.addTicketGroup",
		    "params":args,
		    "id":1
		}),
		success: function(data) {
		    callback(null,data.result.eventplan);
		}
	    });
	},

	removeTicketGroup: function(args,callback) {
	    var me = this;
	    $.ajax({
		url: "/",
		dataType:"json",
		global: false,
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify({
		    "jsonrpc":"2.0",
		    "method":"eventplan.removeTicketGroup",
		    "params":args,
		    "id":1
		}),
		success: function(data) {
		    callback(null,data.result.eventplan);
		}
	    });
	},

	addFriends: function(args, callback) {
	    var me = this;
	    $.ajax({
		url: "/",
		dataType:"json",
		global: false,
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify({
		    "jsonrpc":"2.0",
		    "method":"eventplan.addFriends",
		    "params":args,
		    "id":1
		}),
		success: function(data) {
		    callback(null,data.result.eventplan);
		}
	    });
	},

	removeFriend: function(args,callback) {
	    var me = this;
	    $.ajax({
		url: "/",
		dataType:"json",
		global: false,
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify({
		    "jsonrpc":"2.0",
		    "method":"eventplan.removeFriend",
		    "params":args,
		    "id":1
		}),
		success: function(data) {
		    callback(null,data.result.eventplan);
		}
	    });
	},

	rsvp: function(args,callback) {
	    var me = this;
	    $.ajax({
		url: "/",
		dataType:"json",
		global: false,
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify({
		    "jsonrpc":"2.0",
		    "method":"eventplan.rsvp",
		    "params":args,
		    "id":1
		}),
		success: function(data) {
		    callback(null,data.result.eventplan);
		}
	    });
	},


    };


    Wembli.prototype.search = function(args,callback) {
	if ((typeof args.q == "undefined")) {
	    return false;
	}
	//search
    };

    Wembli.prototype.category = {
	getAll: function(args,callback) {

	},
	
	getSubCategories: function(args,callback) {
	    //must have a category_id
	    if ((typeof args.categoryId == "undefined")) {
		throw new Error("getSubCategories() requires a category_id as its argument (str)");
	    }
	    //request the subcategories for this category
	    $.ajax({
		    data: JSON.stringify({
			"jsonrpc":"2.0",
			"method":"category.getSubCategories",
			"params":args,
			"id":3
			}),
		    success: function(data) {
			callback(null,data.result);
		    }
		});

	},
    };

    Wembli.prototype.venue = {
	/* wembli.venue.get({name:"Petco Park"},callback); */
	get: function(args,callback) {
	    //must have a name or id
	    if ((typeof args.id == "undefined") && (typeof args.name == "undefined")) {
		throw new Error("getVenue() requires an id or name");
	    }
	    //request the venue data and return a Venue Obj
	    $.ajax({
		    data: JSON.stringify({
			    "jsonrpc":"2.0",
			    "method":"venue.get",
			    "params":args,
			    "id":2
			}),
		    success: function(data) {
			v = new Venue(data.result);
			callback(v);
		    }
		});
	},

	search: function(args,callback) {
	    $.ajax({
		    data: JSON.stringify({
			    "jsonrpc":"2.0",
			    "method":"venue.search",
			    "params":args,
			    "id":1
			}),
		    success: function(data) {
			venues = [];
			$(data.result).each(function() {
				var venue = this;
				v = new Venue(venue);
				venues.push(v);
			    });
			callback(venues);
		    }
		});
	},
	
	gallery: function(args,callback) {
	    $.ajax({
		    data: JSON.stringify({
			    "jsonrpc":"2.0",
			    "method":"venue.gallery",
			    "params":args,
			    "id":1
			}),
		    success: function(data) {
			var g = new Gallery(data.result);
			callback(g);
		    }
		});
	}

    };
    
    Wembli.prototype.customer = {
	//potentially move validation stuff like this to a different plugin
	exists: function(args, callback) {
	    $.ajax({
		    data: JSON.stringify({
			    "jsonrpc":"2.0",
			    "method":"customer.exists",
			    "params":args,
			    "id":1
			}),
		    success: function(data) {
			callback(null,data.result);
		    }
		});
	}

    };

    //Venue Obj
    function Venue(venue) {
	$(this).extend(this,venue);
    }

    //Gallery Obj
    function Gallery(g) {
	var me = this;
	me.images = [];
	$(g).each(function() {
		me.images.push(this);
	    });
    }

    //wembli obj available globally
    wembli = new Wembli({});
})(jQuery,window);
