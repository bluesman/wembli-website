doc = document;

// Global Wembli Object
$w = {
    initEventPlanOptionsModal:function() {
	$('.planOption').each(function(idx,el) {
		$(el).click(function(e) {
		    $(el).find('input').each(function(idx,i) {
			$(i).attr('checked',true);
		    });
		});
	    });
    },

    initStarRatings:function(){
	// get and parse the rating
	var rating;
	var nums;
	var whole;
	var frac;
	
	// I'll need this
	var span;
	var halfUsed;
	var me;	
	
	$('.stars').each(function(){
	    // get and parse the rating
	    rating 	= $(this).html();
	    nums 	= rating.split('.');
	    whole	= parseInt(nums[0]);
	    frac	= parseInt(nums[1]);
	    
	    // save these now
	    halfUsed = false;
	    me = this;
	    
	    //this.html('');
	    // build the stars
	    for(var i = 1; i < 6; i++){
		span = doc.createElement('span');
		
		if(i <= whole){
		    span.className = 'whole-star';
		} else if(frac > 2 && !halfUsed){
		    span.className = 'half-star';
		    halfUsed = true;
		} else {
		    span.className = 'empty-star';
		}
		
		$(span).appendTo(me);
	    }
	});
    },
    init:function(){
	$('input.date').datepicker({minDate:0});
	$('input.time').timepicker({ampm:true, stepHour:1, stepMinute:5});
	if ($('#eventplanOptionsModal').length > 0) {
	    $w.initEventPlanOptionsModal();
	}
	$w.initStarRatings();
    }
}

$w.stepInfo = function(){

    function init() {
	//show the info boxen on their respective mouseover
	$('#step1Circle').hover(
	    function(e) {
		$('#step1Circle').css('background-position','0px 0px');
		$('#step1Info').show();
	    },
	    function(e) {
		$('#step1Circle').css('background-position','0px -266px');
		$('#step1Info').hide();
	    }
	);
	$('#step2Circle').hover(
	    function(e) {
		$('#step2Circle').css('background-position','0px 0px');
		$('#step2Info').show();
	    },
	    function(e) {
		$('#step2Circle').css('background-position','0px -266px');
		$('#step2Info').hide();
	    }
	);
	$('#step3Circle').hover(
	    function(e) {
		$('#step3Circle').css('background-position','0px 0px');
		$('#step3Info').show();
	    },
	    function(e) {
		$('#step3Circle').css('background-position','0px -266px');
		$('#step3Info').hide();
	    }
	);
	$('#step4Circle').hover(
	    function(e) {
		$('#step4Circle').css('background-position','0px 0px');
		$('#step4Info').show();
	    },
	    function(e) {
		$('#step4Circle').css('background-position','0px -266px');
		$('#step4Info').hide();
	    }
	);
    }

    return function() {
	init();
    }

}();

$w.searchBox = function(){

    function init() {

	$('#go').click(function(e) {
	    e.preventDefault();
	    $('#searchForm').submit();
	});

	$('#searchForm').submit(function(e) {
	    //append the query to the url and submit
	    var q = $('#q').val();
	    var action = $('#searchForm').attr('action');
	    $('#searchForm').attr('action',action+q);
	});

	

    }

    return function() {
	init();
    }

}();

$w.moreEvents = function(){

    function init() {

	$('#moreEvents').click(function(e) {
	    e.preventDefault();
	    $('#moreEvents img.spinner').show();
	    var zip = $('#moreEventsZipCode').val();
	    var beginDate = $('#moreEventsBeginDate').val();
	    console.log('begin: '+beginDate);
	    wembli.event.get({beginDate:beginDate,nearZip:zip},function(error,events) {
		$('#moreEvents img.spinner').hide();		
		if (events.length > 0) {
		    for (var idx in events) {
			var template = $('#belowFold ul li:first').clone(true,true);
			var event = events[idx];
			console.log(event);
			var href = '/event/'+event.ID+'/'+event.Name+'#eventBuilder';
			console.log(href);
			template.find('.info .choose-event').attr('href',href);
			template.find('.info .choose-event').html(event.Name);
			template.find('.info .venue').html(event.Venue);
			var location = event.City+', '+event.State;
			template.find('.info .location').html(location);
			template.find('.cta .choose-event').attr('href',href);
			var date = new Date(Date.parse(event.Date));
			var day  = date.format("ddd");
			var eventDate = date.format("mmm d");
			var time = date.format("h:MM TT");
			template.find('.event-date-box .day').html(day);
			template.find('.event-date-box .event-date').html(eventDate);
			template.find('.event-date-box .time').html(time);
			$('#belowFold ul').append(template);
		    }
		    //update the last date hidden field
		    var d = new Date(Date.parse(events[events.length-1].Date))
		    var lastDate = d.format("mm-dd-yy")
		    $('#moreEventsBeginDate').val(lastDate);

		}
		


	    });
	});
	

    }

    return function() {
	init();
    }

}();


/* eventPlan widget utilities */
$w.eventplan = {
    init: function() {
	

	//every I'm Going button gets caught to display options overlay
	$('.choose-event').click(function(e) {
	    e.preventDefault();
	    //prepare the modal form action
	    $('form#wembliOptions').attr('action',$(this).attr('href'));
	    $('#eventplanOptionsModal').modal('show');
	});

	$('button.more-info').click(function(e) {
	    e.preventDefault();
	    window.location.href= '/more-info';
	});

	//set signup/login redirect url when they click save for later
	$('.saveForLater').each(function(idx,el) {
	    $(el).click(function(e) {
		$('.redirect-url').each(function(idx,el) {
		    console.log(location.pathname);
		    $(el).val(location.pathname);
		});
	    });
	});

    },
    toggleButton:function(args,el) {
	console.log(args);
	var c = 'btn btn-'+args.action;
	if (typeof args.appendClass != "undefined") {
	    c+= ' '+args.appendClass;
	}
	$(el).attr('class',c);
	$(el).html(args.text);
    },
    alertMsg:function(status,msg) {
	//use header flash msg?
	$('.flash-info').each(function(idx,el) {
	    console.log(idx);
	    if (idx > 1) {
		return;
	    }
	    $(el).html(msg).addClass('alert-'+status).fadeIn(800).delay(1000).fadeOut(600);
	});
    },
    friendsNotDeclined: function() {
	var friendCnt = 1;
	if (typeof this.data != "undefined") {
	    for (email in this.data.friends) {
		var friend = this.data.friends[email];
		if (typeof friend.decision != "undefined" && !friend.decision) {
		    continue;
		} else {
		    friendCnt++;
		}
	    }
	} 
	return friendCnt;
    },
    updateSummary:function() {
	
	//update the eventplan summary
	if (typeof this.data != "undefined") {
	    var summaryMsg = '';
	    if (typeof this.data.friends != "undefined") {
		var count = this.friendsNotDeclined();
		var peopleStr = (count > 1) ? ' people' : ' person';
		summaryMsg = count+peopleStr+' going';
	    }

	    if (typeof this.data.tickets != "undefined") {
		var count = Object.keys(this.data.tickets).length;
		var addS = (count == 1) ? '' : 's';
		if (summaryMsg != '') {
		    summaryMsg += ', ';
		}
		summaryMsg += count+' ticket option'+addS;
	    }
	    summaryMsg += ' in your plan.';
	    if (summaryMsg == ' in your plan.') {
		summaryMsg = 'Nothing added yet.';
	    }
	    $('#summaryContent').html(summaryMsg);
	}
    },
};

$w.sideNav = function(){
	
	/* Properties */
	
	/* Methods */
	function change(toggler){
		var current = $($('#sideNav .active a:first').attr('href'));
		var target 	= $($(toggler).attr('href'));
		
		$(current).fadeOut('fast', function(){
			$(target).fadeIn('fast');
		});
		
		$('#sideNav .active').removeClass('active');
		$(toggler).parent().addClass('active');
		
	}
	
	function init(){
		$('#sideNav a').on('click', function(e){
			e.preventDefault();
			
			if(!$(this).hasClass('active')){
				change(this);
			}
		});
		
		$('.navTrigger').live('click', function(e){
			e.preventDefault();
			change($($(this).attr('href')));
		});
	}
	/* Return */
	return {
		init:init,
		change:change
	}
}();

$(document).ready(function(){
    $w.init();
    $w.eventplan.init();

    if ($('#homeContent .mobileAd').length > 0) {
	$('#homeContent .mobileAd').click(function(e) {
	    e.preventDefault();
	});
    }

    if ($('#searchBox').length > 0) {
	$w.searchBox();
    }
    
    if ($('#moreEvents').length > 0) {
	$w.moreEvents();
    }

    if ($('#organizerSidebar').length > 0) {
	$w.sideNav.init();
    }

    if ($('#homeContent').length > 0) {
	$w.stepInfo();
    }


});
