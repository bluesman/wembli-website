(function($,window,undefined) {

    var init = function() {    
	$('.ticketOption').each(function(idx,el) {
	    $(el).click(function(e) {
		e.preventDefault();
		$(this).children('input').attr('checked',true);
	    });
	});
	//email resend button clicks
	$('.emailAction').each(function(idx,el) {
	    $(el).click(function(e) {
		e.preventDefault();
		var elements = el.id.split('-');
		var ary = [];
		ary[0] = elements.shift();
		console.log(elements);
		ary[1] = elements.join('-');
		console.log(ary);
		var functions = {
		    'invitation': function() {
			//pop a modal to collect respond by date
			$('#datepicker').datepicker({altField:'#voteBy',
						     onSelect: function(d,i) {
							 $('#respondByDate').html(d);
						     }
						    });
			$('#voteByModal').modal('show');
		    },
		    'payment': function() {
			//pop a modal to collect respond by date
			$('#datepicker').datepicker({altField:'#collectBy',
						     onSelect: function(d,i) {
							 $('#respondByDate').html(d);
						     }
						    });
			$('#collectByModal').modal('show');
		    }
		};
		$('#friendEmailId').val(ary[1]);
		//pop the datepicker overlay
		functions[ary[0]]();
	    });
	});
    };

    $(window.document).ready(function($) {
	init();
    });

})(jQuery,window);