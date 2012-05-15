(function($,window,undefined) {

    var init = function() {    
	$('#eventsPlanningContainer .event').each(function(idx,el) {
	    $(el).click(function(e) {
		e.preventDefault();
		var guid = null;
		$(el).find('.eventGuid').each(function(idx,guidHidden) {
		    guid = $(guidHidden).val();
		});
		console.log('removing: '+guid);
		wembli.eventPlan.remove({guid:guid},function(error,eventplan) {
		    if (error) {
			//set an error message
		    } else {
			$w.eventplan.data = eventplan;
			el.slideUp();
		    }
		});
	    });
	});
    };

    $(window.document).ready(function($) {
	wembli.eventPlan.get({},function(error,eventplan) {
	    $w.eventplan.data = eventplan; //store the event plan in the $w wembli global for use by other stuff
	    init();
	});
    });

})(jQuery,window);