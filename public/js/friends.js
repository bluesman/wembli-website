(function($,window,undefined) {
    var friendStack = {
	add: function(friend) {
	    //make html from the data passed in
	    var removeId = friend.email.replace(/\W+/g,'-');
	    console.log('remove id: '+removeId);
	    var key = 'container-'+removeId;
	    var removeBtn = $('<a id="'+removeId+'" class="btn btn-warning pull-right" href="#">Remove</a>');
	    removeBtn.click(function(e) {
		e.preventDefault();
		var removeKey = '#container-'+removeId;
		console.log('removing: '+removeKey);
		var args = {friendId:friend.email};
		wembli.eventPlan.removeFriend(args,function(error,eventplan) {
		    if (eventplan) {
			//show the friend on top of the stack of friends
			console.log('removed friend: '+removeKey+' from friendstack');

			$(removeKey).slideUp(500,function() {$(this).remove()});
			
			//make it global
			$w.eventplan.data = eventplan;
			$w.eventplan.updateSummary();
			$w.eventplan.alertMsg('success','Successfully removed '+friend.email+' from your plan.');
		    } else {
			$w.eventplan.alertMsg('error','Error: Unable to remove '+friend.email+' at this time. Try logging in.');
		    }
		});
	    });
	    var friendData = $('<div class="data"><strong>'+friend.firstName+' '+friend.lastName+'</strong><div class="email">'+friend.email+'</div></div>');
	    var friendEl = $('<div id="'+key+'" class="hide friend "></div>');
	    $('#friendStack').append(friendEl);
	    friendEl.append(friendData,removeBtn).slideDown();
	}

    }

    var init = function() {
	//manual
	//preload the friendStack with existing friends and update the summary
	if (typeof $w.eventplan.data.friends != "undefined") {
	    for (email in $w.eventplan.data.friends) {
		friendStack.add($w.eventplan.data.friends[email]);
	    }
	}


	//intercept the form submit and add friend via rpc
	$('#manualForm').submit(function(e) {
	    e.preventDefault();
	    var email = $('#manualForm #email').val();
	    $('#manualForm .control-group').removeClass('error');
	    $('#manualForm #error').hide();

	    console.log('email: '+email);
	    if (!$('#manualForm #firstName').val() || !$('#manualForm #lastName').val()) {

		if (!$('#manualForm #firstName').val()) {
		    $('#manualForm #firstName').parent().addClass('error');
		}
		if (!$('#manualForm #lastName').val()) {
		    $('#manualForm #lastName').parent().addClass('error');
		}
		$('#manualForm #error').show().html('Please provide a first and last name.');
		return;		
	    }		

	    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	    if ((typeof email == "undefined") || !email || !re.test(email)) {
		//already in plan display an error
		$('#manualForm #email').parent().addClass('error');
		$('#manualForm #error').show().html('Please provide an email address.');
		return;		
	    }

	    //check if this email is in the event plan already
	    if ((typeof $w.eventplan.data.friends != "undefined") && (typeof $w.eventplan.data.friends[email] != "undefined")) {
		//already in plan display an error
		$('#manualForm #email').parent().addClass('error');
		$('#manualForm #error').show().html(email+' is already in the plan.');
		return;
	    }

	    var friend = {
		firstName: $('#manualForm #firstName').val(),
		lastName:  $('#manualForm #lastName').val(),
		email:     $('#manualForm #email').val()
	    };
	    
	    

	    var args = {friends:{}};
	    args.friends[email] = friend;
	    //make wembli rpc call to add friends
	    wembli.eventPlan.addFriends(args,function(error,eventplan) {
		if (eventplan) {
		    //show the friend on top of the stack of friends
		    friendStack.add(friend);

		    //make it global
		    $w.eventplan.data = eventplan;
		    $w.eventplan.updateSummary();
		    $('#manualForm #firstName').val(''),
		    $('#manualForm #lastName').val(''),
		    $('#manualForm #email').val('')

		    $w.eventplan.alertMsg('success','Successfully added '+email+' to your plan.');
		} else {
		    $w.eventplan.alertMsg('error','Error: Unable to add'+email+' at this time. Try logging in.');
		}
	    });
	    
	});


	//connect to gmail

	//connect to facebook
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
