(function($,window,undefined) {
    var friendStack = {
	add: function(friend) {
	    var guid = $w.eventplan.guid;
	    
	    //make html from the data passed in
	    var removeId = friend.email.replace(/\W+/g,'-');
	    console.log(removeId);
	    var key = 'container-'+removeId;
	    var removeBtn = $('<a id="'+removeId+'" class="btn btn-success" href="#">Remove</a>');
	    removeBtn.click(function(e) {
		e.preventDefault();
		var removeKey = '#container-'+removeId;
		console.log('removing: '+removeKey);
		var args = {friendId:friend.email};
		wembli.eventPlan.removeFriend({guid:guid,args:args},function(error,eventplan) {
		    if (eventplan) {
			//show the friend on top of the stack of friends
			console.log('removed friend: '+removeKey+' from friendstack');

			$(removeKey).slideUp(500,function() {$(this).remove()});
			
			//make it global
			$w.eventplan.data = eventplan[guid];
			$w.eventplan.updateSummary();
			$w.eventplan.alertMsg('success','Successfully removed '+friend.email+' from your plan.');
		    } else {
			$w.eventplan.alertMsg('error','Error: Unable to remove '+friend.email+' at this time. Try logging in.');
		    }
		});
	    });
	    var friendData = $('<div class="data"><div class="name">'+friend.firstName+' '+friend.lastName+'</div><div class="email">'+friend.email+'</div></div>');
	    var friendEl = $('<div id="'+key+'" class="hide friend"></div>');
	    $('#friendStack').prepend(friendEl);
	    friendEl.append(friendData,removeBtn).slideDown();
	}

    }

    var init = function() {
	var guid = $w.eventplan.guid;
	//manual
	//intercept the form submit and add friend via rpc
	$('#manualForm').submit(function(e) {
	    e.preventDefault();
	    var email = $('#manualForm #email').val();
	    var friend = {
		firstName: $('#manualForm #firstName').val(),
		lastName:  $('#manualForm #lastName').val(),
		email:     $('#manualForm #email').val()
	    };
	    
	    var args = {friends:{}};
	    args.friends[email] = friend;
	    //make wembli rpc call to add friends
	    wembli.eventPlan.addFriends({guid:guid,args:args},function(error,eventplan) {
		if (eventplan) {
		    //show the friend on top of the stack of friends
		    console.log('adding friend to friendstack');
		    friendStack.add(friend);

		    //make it global
		    $w.eventplan.data = eventplan[guid];
		    $w.eventplan.updateSummary();
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
	var guid = $('#eventplanGuid').val();

	//find the $w global defined in wembli.js
	//wembli.js also contains some utilities for the event builder (aka eventplan)
	//utilities like: updating the summary, toggling a button and probably more

	//find the wembli object in jquery.wembli.js - this is the wembli jsonrpc api

	//get the eventplan from the server for this guid - then init the buttons and stuff
	wembli.eventPlan.get({guid:guid},function(error,eventplan) {
	    $w.eventplan.guid = guid;
	    $w.eventplan.data = eventplan[guid]; //store the event plan in the $w wembli global for use by other stuff
	    init();
	});

    });
})(jQuery,window);
