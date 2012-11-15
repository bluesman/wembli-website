(function($,window,undefined) {

    var init = function() {

	$('#ticketsContent .ticket-list li').each(function(idx,el) { 
	    var li = el;
	    var ticketId = li.id.split('-')[2];

	    //if this ticketgroup is already in the plan, toggle the button
	    if (typeof $w.eventplan.data != "undefined" &&
		typeof $w.eventplan.data.tickets != "undefined" &&
		typeof $w.eventplan.data.tickets[ticketId] != "undefined") {
		$w.eventplan.toggleButton({action:'success',text:'Remove'},$('#'+li.id+' .cta > a'));
		//update the summary
		$w.eventplan.updateSummary();
	    }


	    //click event for ticketgroup items
	    $('#'+li.id+' .cta > a').click(function(e) {
		var me = this;
		e.preventDefault();
		//if class is btn btn-primary then add the tickets 
		//else remove the tickets
		
		//hold the ticket info
		var qty = $(li).find('select option:selected').val()
		var args = {ticketId: ticketId,
			    qty: qty};

		var addTicketGroup = function() {
		    //add tix to the eventplan and change class and text on success
		    wembli.eventPlan.addTicketGroup(args,function(error,eventplan) {
			if (eventplan) {
			    //make it global
			    $w.eventplan.data = eventplan;
			    $w.eventplan.updateSummary();
			    //toggle the button
			    $w.eventplan.toggleButton({action:'success',text:'Remove'},me);
			    //$w.eventplan.alertMsg('success','Successfully added tickets to your plan.');
			} else {
			    $w.eventplan.alertMsg('error','Error: Unable to remove tickets at this time. Try logging in.');
			}
		    });

		};
		
		//if they clicked on a btn-primary, it means they are adding
		if ($(me).attr('class') == 'btn btn-primary') {

		    if ($w.eventplan.data.config.payment == 'self') {
			//if they are paying for it - they can only choose 1 ticket group
			//so, anthing that is currently in the plan needs to come out
			//remove the tix from eventplan and change class and text on success


			//check to see if we have any tix to remove
			var totalToRemove = $('#ticketsContent .ticket-list li').find('.btn-success').length;
			if (totalToRemove > 0) {
			    $('#ticketsContent .ticket-list li').find('.btn-success').each(function(idx2,el2) {
				//get the parent li.id from this el2
				var idStr = $(el2).closest('li').attr('id');
				var removeId = idStr.split('-')[2];
				wembli.eventPlan.removeTicketGroup({ticketId:removeId},function(error,eventplan) {
				    if (eventplan) {
					$w.eventplan.data = eventplan;
					//update the eventplan summary
					$w.eventplan.updateSummary();
					//toggle the button
					$w.eventplan.toggleButton({action:'primary',text:'Add To Plan'},el2);
					
					//now its ok to add the new ticket group
					if (idx2 == totalToRemove-1) {
					    addTicketGroup();
					}
					
				    } else {
					$w.eventplan.alertMsg('Error: Unable to remove tickets at this time. Try logging in.');
				    }
				});
			    });
			} else {
			    addTicketGroup();
			}
		    } else {
			addTicketGroup();
		    }
		
		}
		
		//if they clicked on a btn-success it means they are removing
		if ($(me).attr('class') == 'btn btn-success') {
		    //remove the tix from eventplan and change class and text on success
		    wembli.eventPlan.removeTicketGroup(args,function(error,eventplan) {
			if (eventplan) {
			    $w.eventplan.data = eventplan;
			    //update the eventplan summary
			    $w.eventplan.updateSummary();
			    //toggle the button
			    $w.eventplan.toggleButton({action:'primary',text:'Add To Plan'},me);
			    //$w.eventplan.alertMsg('success','Successfully removed tickets from your plan.');
			} else {
			    $w.eventplan.alertMsg('Error: Unable to remove tickets at this time. Try logging in.');
			}
		    });
		}
	    });
	});
    };

    $(window.document).ready(function($) {
	//find the $w global defined in wembli.js
	//wembli.js also contains some utilities for the event builder (aka eventplan)
	//utilities like: updating the summary, toggling a button and probably more

	//find the wembli object in jquery.wembli.js - this is the wembli jsonrpc api

	//get the eventplan from the server for this session - then init the buttons and stuff
	wembli.eventPlan.get({},function(error,eventplan) {
	    $w.eventplan.data = eventplan; //store the event plan in the $w wembli global for use by other stuff
	    $w.eventplan.updateSummary();
	    init();
	});

    });
})(jQuery,window);
