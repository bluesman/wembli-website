(function($,window,undefined) {

    var init = function() {    
	$('.ticketOption').each(function(idx,el) {
	    $(this).popover({animation:true,
			     title:'Price Per Person:',
			     content: $(this).children('.costBreakdown').html(),
			     delay:{show:300,hide:100}
			    });

	    $(el).click(function(e) {
		e.preventDefault();
		$(this).children('input').attr('checked',true);
	    });
	});
	$('#rsvpYes').click(function(e) {
	    console.log('clicked yes');
	    e.preventDefault();
	    wembli.eventPlan.rsvp({rsvp:'YES'},function(error,eventplan) {
		//mark label for this friend to 'attending'
		var emailAsId = $('#friendEmail').val().replace(/\W+/g,'-');
		console.log(emailAsId);
		var key = '#'+emailAsId+' .info .status';
		var label = '<span class="label label-success"><i class="icon-white icon-ok-sign"/><span>attending</span></span>';
		$(key).html(label);
		//close the alert
		$('#rsvpContainer').slideUp();
		console.log(eventplan);
	    });
	});
	$('#rsvpNo').click(function(e) {
	    e.preventDefault();
	    wembli.eventPlan.rsvp({rsvp:'NO'},function(error,eventplan) {
		var emailAsId = $('#friendEmail').val().replace(/\W+/g,'-');
		console.log(emailAsId);
		var key = '#'+emailAsId+' .info .status';
		var label = '<span class="label label-important"><i class="icon-white icon-remove-sign"/><span>declined</span></span>';
		$(key).html(label);
		$('#rsvpContainer').slideUp();
		console.log(eventplan);
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