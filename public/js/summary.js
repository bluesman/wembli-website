(function($,window,undefined) {

    var init = function() {
	$('#continue').click(function(e) {
	    e.preventDefault();
	    //pop a modal to collect respond by date
	    $('#voteByModal').modal('show');
	});


    };

    $(window.document).ready(function($) {
	var guid = $('#eventplanGuid').val();

	//find the $w global defined in wembli.js
	//wembli.js also contains some utilities for the event builder (aka eventplan)
	//utilities like: updating the summary, toggling a button and probably more

	//find the wembli object in jquery.wembli.js - this is the wembli jsonrpc api

	//get the eventplan from the server for this guid - then init the buttons and stuff
	wembli.eventPlan.get({guid:guid},function(error,eventplan) {
	    $w.eventplan.guid = guid;
	    $w.eventplan.data = eventplan[guid]; //store the event plan in the $w wembli global for use by other stuff
	    $w.eventplan.updateSummary();
	    init();
	});

    });

})(jQuery,window);