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

$w.searchWidget = function(){
	
	/* Varaibles */
	var container = doc.getElementById('searchWidget');
	var search = doc.getElementById('searchContainer');
	var tabs = $('.widget-tabs', container)[0];
	
	/* Methods */
	// Switch which form is displayed
	function switchForms(toggler){
		if($(toggler).hasClass('active')) return;
		
		var index	= $(tabs).find('li').index(toggler);
		var target	= $(search).find('form:eq(' + index + ')');
		var pos		= index > 0 ? '137px' : '1px';
		
		// update the blue highlight
		$(search).animate({backgroundPosition: pos});
		
		// update the active tab
		$('li.active', tabs).removeClass('active');
		$(toggler).addClass('active');
		
		// update which form is showing
		$('form.active', search).fadeOut('slow').removeClass('active');
		$(target).fadeIn('slow').addClass('active');
		$('.marker', search).animate({left: pos});
		
	}
	 
	// init
	function init(){
		$('.widget-tabs li', container).on('click', function(){
			switchForms(this);
		});

	    // make all the datepickers use dash insteal of slash
	    $('#date1').datepicker('option','dateFormat','mm-dd-yy');
	    $('#date1').val('Start Date');
	    $('#date2').datepicker('option','dateFormat','mm-dd-yy');
	    $('#date2').val('End Date');

	    $('#findTickets input.btn.primary').click(function(e) {
		e.preventDefault();

		// if the term, dates, adults or children have the default text, change it to legit defaults
		if ($('#term').val() == 'Event Name, venue, team, performer or city') {
		    $('#term').val('');
		}
		
		var today = new Date();
		if ($('#date1').val() == 'Start Date') {
		    $('#date1').datepicker('setDate',today);
		}
		if ($('#date2').val() == 'End Date') {
		    $('#date2').val('');

		    /* 
		    // add 1 week
		    var todayTime = today.getTime();
		    //add the number of milliseconds in 1 week
		    var nextWeekTime = todayTime + 604800000;
		    var nextWeek = new Date(nextWeekTime);
		    $('#date2').datepicker('setDate',nextWeek);
                    */

		}

		//if no adults, set it to 1
		if ($('#adults').val() == '') {
		    $('#adults').val(1);
		}

		//if no children, set it to 0
		if ($('#children').val() == '') {
		    $('#children').val(0);
		}

		
		// get the form elements and build a get url 
		var url = '/tickets/search';

		$.each(['#term','#date1','#date2','#adults option:selected','#children option:selected'],function(idx,el) {
		    url += '/'+$(el).val();
		});

		// load the url
		window.location.href = url;
	    });
	    
	}
	
	/* Return */
	return function(){
		init();
	}
	
}();

//Kick it on load
$(document).ready(function(){
	$w.searchWidget();
});

