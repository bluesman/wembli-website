(function($,window,undefined) {

    var init = function() {    
	console.log('init dashboard');
	$('#eventSearchForm').submit(function(e) {
	    var action = $(this).attr('action');
	    var q = $('#eventSearch').val();
	    var url = action+'/'+q;
	    $(this).attr('action',url);
	});
	$('#searchButton').click(function(e) {
	    e.preventDefault();
	    $('#eventSearchForm').submit();
	});
	$('#eventsPlanningContainer .event').each(function(idx,el) {
	    $(el).find('.removePlan').click(function(e) {
		e.preventDefault();
		var guid = null;
		$(el).find('.eventGuid').each(function(idx,guidHidden) {
		    console.log(guidHidden);
		    guid = $(guidHidden).val();
		});
		console.log('removing: '+guid);
		wembli.eventPlan.remove({guid:guid},function(error,eventplan) {
		    if (error) {
			//set an error message
		    } else {
			$w.eventplan.data = eventplan;
			$(el).slideUp();
		    }
		});
	    });
	    $(el).find('.viewPlan').click(function(e) {
		e.preventDefault();
		console.log('clicked view');
		var guid = null;
		$(el).find('.eventGuid').each(function(idx,guidHidden) {
		    console.log(guidHidden);
		    guid = $(guidHidden).val();
		});
		console.log('viewing: '+guid);
		location.replace('/plan/view/'+guid);
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