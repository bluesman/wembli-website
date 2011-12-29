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
	loadScripts:function(){
		$.getScript('/js/plugins/jquery.background-position.js');
	},
	init:function(){
		$('.date').datepicker({minDate:0});
		
		$w.initDefaultText();
		
		$w.loadScripts();
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
		var pos		= index > 0 ? '137px -12px' : '1px -12px';
		
		// update the blue highlight
		$(search).animate({backgroundPosition: pos});
		
		// update the active tab
		$('li.active', tabs).removeClass('active');
		$(toggler).addClass('active');
		
		// update which form is showing
		$('form.active', search).fadeOut('slow').removeClass('active');
		$(target).fadeIn('slow').addClass('active');
		
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

