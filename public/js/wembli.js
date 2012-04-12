doc = document;

// Global Wembli Object
$w = {
	// Properties
	defaultText:{},
	// Methods
	initDefaultText:function(){
		$('.default').each(function(){
			$w.defaultText[this.name] = this.value;
		});
		
		$('.example').on('focus', function(){
			if($(this).hasClass('default')){
				$(this).removeClass('default').val('');
			}
		});
		
		$('.example').on('focusout', function(){
			if(this.value == ''){
				$(this).addClass('default').val($w.defaultText[this.name]);
			}
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
	loadScripts:function(){
	},
	init:function(){
		$('input.date').datepicker({minDate:0});
		$('input.time').timepicker({ampm:true, stepHour:1, stepMinute:5});
		$w.initDefaultText();
		$w.initStarRatings();
		//$w.loadScripts();
	}
}

// Kick it on load
$(document).ready(function(){
    $w.init();
});

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

$(document).ready(function(){
	$w.stepInfo();
});

$w.searchBox = function(){

    function init() {
	$('#q').click(function(e) {
	    if ($('#q').val() == "Enter an event, team, performer, city, venue") {
		$('#q').val('');
	    }
	});

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

$(document).ready(function(){
	$w.searchBox();
});


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
    toggleButton:function(action,el) {
	if (action == 'add') {
	    $(el).attr('class','btn btn-primary');
	    $(el).html('Add To Plan');
	} 

	if (action == 'remove') {
	    $(el).attr('class','btn btn-success');
	    $(el).html('Remove');
	}

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
    updateSummary:function() {
	//update the eventplan summary
	if (typeof this.data != "undefined") {
	    var summaryMsg = '';
	    if (typeof this.data.friends != "undefined") {
		var count = Object.keys(this.data.friends).length;
		var addS = (count == 1) ? '' : 's';
		summaryMsg = count+' friend'+addS;
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
    }
};

$(document).ready(function(){
	$w.eventplan.init();
});


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
	$w.sideNav.init();
});
