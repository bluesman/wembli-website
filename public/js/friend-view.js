(function($,window,undefined) {

    var init = function() {    
	if ($('#amountQty').length > 0) {
	    $("#amountQty")[0].selectedIndex = 0;
	    $('#byPerson').attr('checked',true);
	    $('#arbitraryAmount').val(null);
	    $('#arbitraryAmount').keyup(function(e) {
		var str = '$'+$(this).val();
		$('#contribution').val(parseFloat($(this).val()).toFixed(2));
		$('#contributionValue').html('$'+parseFloat($(this).val()).toFixed(2));
	    });

	    $('#arbitraryAmount').focus(function(e) {
		$('#arbitrary').attr('checked',true);		
		var val = 0;
		if ($(this).val()) {
		    val = $(this).val(0);
		}

		var str = '$'+val;
		$('#contribution').val(parseFloat(val).toFixed(2));
		$('#contributionValue').html('$'+parseFloat(val).toFixed(2));
	    });


	    $('#amountQty').click(function(e) {
		$('#byPerson').attr('checked',true);
	    });

	    $('#amountQty').change(function(e) {
		var qty = $(this).val();
		//recalc the totals
		//get the cound of friends going
		var friendCnt = 1;
		for (var idx in $w.eventplan.data.friends) {
		    var friend = $w.eventplan.data.friends[idx];
		    if (typeof friend.decision != "undefined" && !friend.decision) {
			continue;
		    } else {
			friendCnt++;
		    }
		}
		
		//get the final ticket
		for (var tixId in $w.eventplan.data.tickets) {
		    if ((typeof $w.eventplan.data.tickets[tixId].finalChoice != "undefined") && ($w.eventplan.data.tickets[tixId].finalChoice)) {
			var ticket = $w.eventplan.data.tickets[tixId];
			break;
		    }
		}
		//this should be an api call
		var shipping      = (15/friendCnt) * qty;
		var serviceCharge = ((ticket.ActualPrice * .15)/friendCnt) * qty;
		var actualPrice   = (ticket.ActualPrice) * qty;
		var total = parseFloat(actualPrice) + parseFloat(serviceCharge) + parseFloat(shipping) + parseFloat((actualPrice * 0.029));
		
		$('#ticketPrice').html('$'+parseFloat(actualPrice).toFixed(2));
		$('#serviceCharge').html('$'+parseFloat(serviceCharge).toFixed(2));
		$('#delivery').html('$'+parseFloat(shipping).toFixed(2));
		$('#transactionFee').html('$' + parseFloat((actualPrice * 0.029)).toFixed(2));
		$('#estimatedTotal').html('$'+total.toFixed(2));
		$('#contributionValue').html('$'+total.toFixed(2));
		$('#contribution').val(total.toFixed(2));

	    });
	}

	$('.ticketOption').each(function(idx,el) {
	    var title = ($w.eventplan.data.config.payment) == 'group' ? 'Price Per Person:' : 'Cost Breakdown:';	    
	    $(this).popover({animation:true,
			     title:title,
			     content: $(this).children('.costBreakdown').html(),
			     delay:{show:300,hide:100}
			    });

	    //if this is a ticket you voted for make it say that
	    var friendEmail = $('#friendEmail').val();
	    for (var idx in $w.eventplan.data.friends) {
		var friendId = ((typeof $w.eventplan.data.friends[idx].addMethod != "undefined") && ($w.eventplan.data.friends[idx].addMethod == 'facebook')) ? $w.eventplan.data.friends[idx].fbId : $w.eventplan.data.friends[idx].email;
		if (typeof $w.eventplan.data.friends[idx].votes != "undefined") {
		    if (friendEmail == friendId) {
			if (typeof $w.eventplan.data.friends[idx].votes.tickets != "undefined") {
			    var tixId = $w.eventplan.data.friends[idx].votes.tickets;
			    if (tixId == el.id) {
				$('#'+el.id+' button').attr('class','btn btn-success');
				$('#'+el.id+' button').html('You Voted For This');
			    }
			}
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