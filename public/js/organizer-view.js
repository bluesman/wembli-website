(function($,window,undefined) {

    var init = function() {    
	$('#collectMoney').click(function(e) {
	    e.preventDefault();
	    //get the ticket option that is selected and put it in the modal
	    var selectedOption = $('.ticketOption input[name=ticketChoice]:radio:checked').parent()[0];
	    var alert = $($(selectedOption).find('.alert')[0]).clone();
	    var info = $($(selectedOption).find('.info')[0]).clone();
	    var ticketPriceBox = $($(selectedOption).find('.ticket-price-box')[0]).clone();
	    $('#finalTicketOption').html('');	    
	    $('#finalTicketOption').append(alert);
	    $('#finalTicketOption').append(info);
	    $('#finalTicketOption').append(ticketPriceBox);
	    $('#collectPaymentModal').modal('show');	    
	});

	$('#noButton').click(function(e) {
	    e.preventDefault();
	    $('#collectPaymentModal').modal('hide');  
	});

	$('.ticketOption').each(function(idx,el) {
	    $(this).popover({animation:true,
			     title:'Price Per Person:',
			     content: $(this).children('.costBreakdown').html(),
			     delay:{show:300,hide:100}
			    });

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