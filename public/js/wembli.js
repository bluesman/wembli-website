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

