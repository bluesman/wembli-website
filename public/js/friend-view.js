(function($,window,undefined) {

    var init = function() {    
	$('#rsvpYes').click(function(e) {
	    console.log('clicked yes');
	    e.preventDefault();
	    wembli.eventPlan.rsvp({rsvp:'YES'},function(error,eventplan) {
		console.log(eventplan);
	    });
	});
	$('#rsvpNo').click(function(e) {
	    e.preventDefault();
	    wembli.eventPlan.rsvp({rsvp:'NO'},function(error,eventplan) {
		console.log(eventplan);
	    });
	});

    };

    $(window.document).ready(function($) {
	wembli.eventPlan.getFriendPlan({},function(error,eventplan) {
	    $w.eventplan.data = eventplan; //store the event plan in the $w wembli global for use by other stuff
	    init();
	});
    });

})(jQuery,window);