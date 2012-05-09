(function($,window,undefined) {
    var fbFriendStack = {
	init: function(fbFriends) {
	    //clear out the existing stuff
	    $('#facebook .footer').slideUp(100);
	    $('#facebook .footer').promise().done(function() {
		$('#facebook .body').slideUp(100);
		$('#facebook .body').promise().done(function() {
		    
		    //make a scrolable div
		    var fbFriendContainer = $('<div id="fbFriendStack"></div>');
		    //set up the friend search filter
		    var searchContainer = $('<div class="input-append"><input id="fbFilter" placeholder="Enter friend name to filter" style="width:273px;" type="text" size="16"><span class="add-on"><i class="icon-search" style="margin-top:2px;"></i></span></div>');
		    fbFriendContainer.append(searchContainer);
		    var fbFriendList = $('<div id="fbFriendList" class="hide" style="height:300px;overflow:auto;"></div>');
		    fbFriendContainer.append(fbFriendList);
		    $(fbFriends.data).each(function(idx) {
			var friend = this;
			friend.addMethod = 'facebook';

			var fbFriendEl = $('<div id="fb-container-'+friend.id+'" class=" friend "></div>');
			$('<div class="data"><strong>'+friend.name+'</strong></div>').appendTo(fbFriendEl);

			//if this friend is in the plan already make it a remove button
			if ((typeof $w.eventplan.data.friends != "undefined") && (typeof $w.eventplan.data.friends[friend.id] != "undefined")) {
			    var button = $('<a id="fb-'+friend.id+'" class="btn btn-warning pull-right" href="#">Remove</a>');			    
			} else {
			    var button = $('<a id="fb-'+friend.id+'" class="btn btn-primary pull-right" href="#">Add To Plan</a>');
			}
			//click event for the add to plan button
			button.click(function(e) {
			    console.log('clicked add to plan');
			    e.preventDefault();
			    //get firstName and lastName from name
			    var i = friend.name.indexOf(' ');
			    friend.firstName = friend.name.slice(0,i);
			    friend.lastName = friend.name.slice(i+1);
			    fbFriendStack.add(friend);
			});
			//append to the fbfriendel
			fbFriendEl.append(button);
			fbFriendEl.appendTo(fbFriendList);
		    });
		    $('#facebook .body').html(fbFriendContainer).slideDown(200);
		    $('#facebook .body').promise().done(function() {
			fbFriendContainer.append(fbFriendList);
			fbFriendList.slideDown(100);
		    });
		    //add the filter function
		    $('#fbFilter').keyup(function(e) {
			var val = $(this).val();
			var r = new RegExp("^"+val,"i");
			var show = [];
			var hide = [];
			$(fbFriends.data).each(function(idx) {
			    var f = this;
			    
			    var show = false;
			    //fullname
			    if (r.test(f.name)) {
				show = true;
			    }
			    //check name parts
			    if (!show) {
				var ary = f.name.split(' ');
				$(ary).each(function(idx) {
				    if (r.test(this)) {
					show = true;
					return false;
				    }
				});
			    }
			    
			    var k = '#fb-container-'+this.id;
			    if (show) {
				$(k).show();
			    } else {
				$(k).hide();
			    }
			});
		    });
		});
	    });


	    
	    //fbFriendList.fadeIn();
	    console.log('here2');
	}
    };
    fbFriendStack.add = function(friend) {
	console.log(friend);
	//toggle this button to be a remove button
	var k = '#fb-'+friend.id;

	var args = {friends:{}};
	args.friends[friend.id] = friend;
	//make wembli rpc call to add friends
	wembli.eventPlan.addFriends(args,function(error,eventplan) {
	    if (eventplan) {
		$w.eventplan.toggleButton({action:'warning',text:'Remove',appendClass:' pull-right'},$(k));
		//show the friend on top of the stack of friends
		friendStack.add(friend);

		//make it global
		$w.eventplan.data = eventplan;
		$w.eventplan.updateSummary();
		//$w.eventplan.alertMsg('success','Successfully added '+friend.firstName+' to your plan.');
	    } else {
		$w.eventplan.alertMsg('error','Error: Unable to add'+friend.firstName+' at this time. Try logging in.');
	    }
	});
    };

    fbFriendStack.remove = function(fbFriendId) {
	//just toggle the button
	var k = '#fb-'+fbFriendId;
	$w.eventplan.toggleButton({action:'primary',text:'Add To Plan',appendClass:' pull-right'},$(k));
    }


    var friendStack = {
	add: function(friend) {
	    //make html from the data passed in
	    var removeId = false;
	    if (typeof friend.email != "undefined") {
		removeId = friend.email.replace(/\W+/g,'-');
	    }
	    if (typeof friend.id != "undefined") {
		removeId = friend.id;
	    }
	    if (!removeId) {
		return false;
	    }

	    console.log('remove id: '+removeId);
	    var key = 'container-'+removeId;
	    var removeBtn = $('<a id="'+removeId+'" class="btn btn-warning pull-right" href="#">Remove</a>');
	    removeBtn.click(function(e) {
		e.preventDefault();
		var removeKey = '#container-'+removeId;
		console.log('removing: '+removeId);
		var args = {friendId:friend.id};
		console.log(args);
		wembli.eventPlan.removeFriend(args,function(error,eventplan) {
		    if (eventplan) {
			//show the friend on top of the stack of friends
			console.log('removed friend: '+removeKey+' from friendstack');

			$(removeKey).slideUp(500,function() {$(this).remove()});
			if (friend.addMethod == 'facebook') {
			    fbFriendStack.remove(removeId);
			}
			//make it global
			$w.eventplan.data = eventplan;
			$w.eventplan.updateSummary();
			//$w.eventplan.alertMsg('success','Successfully removed '+friend.firstName+' from your plan.');
		    } else {
			$w.eventplan.alertMsg('error','Error: Unable to remove '+friend.firstName+' at this time. Try logging in.');
		    }
		});
	    });
	    var htmlStr = '<div class="data"><strong>'+friend.firstName+' '+friend.lastName+'</strong>';

	    if (friend.addMethod == 'manual') {
		htmlStr += '<div class="email">'+friend.email+'</div>';
	    }
	    if (friend.addMethod == 'facebook') {
		htmlStr += '<div class="email">(Facebook)</div>';
	    }

	    htmlStr += '</div>';
	
	    var friendData = $(htmlStr);
	    var friendEl = $('<div id="'+key+'" class="hide friend "></div>');
	    $('#friendStack').append(friendEl);
	    friendEl.append(friendData,removeBtn).slideDown();
	}

    }

    //global so it can be called after the FB sdk is loaded
    initFacebookFriendStack = function() {
	//facebook
	var getFbFriends = function() {
	    //fetch friends from fb and build the fb friends widget
	    FB.api('/me/friends?limit=10000', {fields: "name,id,email"}, function(response) {
		console.log('got friends');
		fbFriendStack.init(response);
	    });
	};
	    
	console.log('called init');
	FB.getLoginStatus(function(response) {
	    console.log('getloginstatus: ');
	    console.log(response);
	    if (response.status === 'connected') {
		// the user is logged in and has authenticated your
		// app, and response.authResponse supplies
		// the user's ID, a valid access token, a signed
		// request, and the time the access token 
		// and signed request each expire
		var uid = response.authResponse.userID;
		var accessToken = response.authResponse.accessToken;
		getFbFriends();
	    }
	});

	$('#facebook a').click(function(e) {
	    console.log('clicked button');
	    FB.getLoginStatus(function(response) {
		console.log('getloginstatus: ');
		console.log(response);
		if (response.status === 'connected') {
		    // the user is logged in and has authenticated your
		    // app, and response.authResponse supplies
		    // the user's ID, a valid access token, a signed
		    // request, and the time the access token 
		    // and signed request each expire
		    var uid = response.authResponse.userID;
		    var accessToken = response.authResponse.accessToken;
		    getFbFriends();
		} else if (response.status === 'not_authorized') {
		    // the user is logged in to Facebook, 
		    // but has not authenticated your app
		    FB.login(function(loginRes) {
			getFbFriends();
		    },{scope:'user_events,friends_events,user_location,friends_location,read_friendlists,create_event,manage_friendlists,publish_checkins,publish_stream,rsvp_event'});
		} else {
		    // the user isn't logged in to Facebook.
		    FB.login(function(loginRes) {
			getFbFriends();
		    },{scope:'user_events,friends_events,user_location,friends_location,read_friendlists,create_event,manage_friendlists,publish_checkins,publish_stream,rsvp_event'});
		}
	    });
	});

    };

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
		addMethod: 'manual',
		firstName: $('#manualForm #firstName').val(),
		lastName:  $('#manualForm #lastName').val(),
		email:     $('#manualForm #email').val(),
		id:        $('#manualForm #email').val(),
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

		    //$w.eventplan.alertMsg('success','Successfully removed '+friend.firstName+' from your plan.');
		} else {
		    $w.eventplan.alertMsg('error','Error: Unable to remove '+friend.firstName+' at this time. Try logging in.');
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
