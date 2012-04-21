(function($,window,undefined) {

    var init = function() {    
	$('.ticketOption').each(function(idx,el) {
	    $(this).popover({animation:true,
			     title:'Price Per Person:',
			     content: $(this).children('.costBreakdown').html(),
			     delay:{show:300,hide:100}
			    });

	    //if this is a ticket you voted for make it say that
	    if (typeof $w.eventplan.data.friends[$('#friendEmail').val()].votes != "undefined") {
		if (typeof $w.eventplan.data.friends[$('#friendEmail').val()].votes.tickets != "undefined") {
		    var tixId = $w.eventplan.data.friends[$('#friendEmail').val()].votes.tickets;
		    if (tixId == el.id) {
			$('#'+el.id+' button').attr('class','btn btn-success');
			$('#'+el.id+' button').html('You Voted For This');
		    }
		}
	    }			    

	    $(el).click(function(e) {
		e.preventDefault();
		/*
		  check the button:
		  - if its the one i've already voted for, do nothing
		  - if its not one i voted for then vote for it and unvote the other (if there is one)
		*/
		wembli.eventPlan.vote({voteType:'tickets',voteId:el.id},function(error,eventplan) {
		    //all the others change to blue
		    $('.ticketOption').each(function(idx,option) {
			//find the ticketgroup in the event plan matching this option.id
			var ticket     = eventplan.tickets[option.id];
			var votePct    = (typeof ticket.votePct != "undefined") ? ticket.votePct : 0
			var voteCnt    = (typeof ticket.voteCnt != "undefined") ? ticket.voteCnt : 0
			var voteCntStr = voteCnt + ' Vote'
			voteCntStr    += (ticket.voteCnt == 1) ? '' : 's';
			voteCntStr    += ' ('+votePct+'%)';
			//update the progress bars and vote counts
			$(option).find('.bar').each(function(i,bar) {
			    $(bar).attr('style','width:'+votePct+'%');
			});

			$(option).find('.voteCnt').each(function(i,cnt) {
			    $(cnt).html('<em>'+voteCntStr+'</em>');
			});

			if (el.id == option.id) {
			    //turn this button green and change the text
			    $('#'+option.id+' button').attr('class','btn btn-success');
			    $('#'+option.id+' button').html('You Voted For This');
			} else {
			    $('#'+option.id+' button').attr('class','btn btn-primary');
			    $('#'+option.id+' button').html('Vote For This Option')
			}
		    });
		});
	    });
	});
	$('#rsvpYes').click(function(e) {
	    e.preventDefault();
	    wembli.eventPlan.rsvp({rsvp:'YES'},function(error,eventplan) {
		//mark label for this friend to 'attending'
		var emailAsId = $('#friendEmail').val().replace(/\W+/g,'-');
		var key = '#'+emailAsId+' .info .status';
		var label = '<span class="label label-success"><i class="icon-white icon-ok-sign"/><span>attending</span></span>';
		$(key).html(label);
		//close the alert
		$('#rsvpContainer').slideUp();
	    });
	});
	$('#rsvpNo').click(function(e) {
	    e.preventDefault();
	    wembli.eventPlan.rsvp({rsvp:'NO'},function(error,eventplan) {
		var emailAsId = $('#friendEmail').val().replace(/\W+/g,'-');
		var key = '#'+emailAsId+' .info .status';
		var label = '<span class="label label-important"><i class="icon-white icon-remove-sign"/><span>declined</span></span>';
		$(key).html(label);
		$('#rsvpContainer').slideUp();
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