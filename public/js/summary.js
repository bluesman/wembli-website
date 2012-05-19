(function($,window,undefined) {

    var init = function() {
	$('.ticketOption').each(function(idx,el) {
	    var title = ($w.eventplan.data.config.payment) == 'group' ? 'Price Per Person:' : 'Cost Breakdown:';
	    $(this).popover({animation:true,
			     title:title,
			     content: $(this).children('.costBreakdown').html(),
			     delay:{show:300,hide:100}
			    });

	    $(el).click(function(e) {
		e.preventDefault();
		$(this).children('input').attr('checked',true);
	    });
	});

	$('#sendRSVP').attr('checked',true);
	$('#respondByCheckbox').attr('checked',true);

	$('#respondByCheckbox').click(function(e) {
	    if ($(this).is(':checked')) {	    
		$('#respondBy').find('.controls').slideDown();
	    } else {
		$('#respondBy').find('.controls').slideUp();
	    }
	});

	$('#sendRSVP').click(function(e) {
	    //e.preventDefault();
	    if ($(this).is(':checked')) {
		$('#respondBy').slideDown();
	    } else {
		$('#respondBy').slideUp();		
	    }
	});
	
	$('#continue').click(function(e) {
	    e.preventDefault();
	    //pop a modal to collect respond by date
	    $('#datepicker').datepicker({altField:'#voteBy',
					 minDate: new Date(),
					 maxDate:new Date($w.eventplan.data.event.Date),
					 onSelect: function(d,i) {
					     $('#respondByDate').html(d);
					 }
					 });
	    $('#voteByModal').modal('show');
	});


    };

    $(window.document).ready(function($) {
	//find the $w global defined in wembli.js
	//wembli.js also contains some utilities for the event builder (aka eventplan)
	//utilities like: updating the summary, toggling a button and probably more

	//find the wembli object in jquery.wembli.js - this is the wembli jsonrpc api

	//get the eventplan from the server for this session - then init the buttons and stuff
	console.log('document ready');
	wembli.eventPlan.get({},function(error,eventplan) {
	    console.log('getting eventplan');
	    $w.eventplan.data = eventplan; //store the event plan in the $w wembli global for use by other stuff
	    console.log('calling update summary');
	    $w.eventplan.updateSummary();
	    console.log('called update summary');
	    init();
	});

    });

})(jQuery,window);