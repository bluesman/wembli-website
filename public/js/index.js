$w.stepInfo = function() {

	function init() {
		//show the info boxen on their respective mouseover
		$('#step1Circle').hover(

		function(e) {
			$('#step1Circle').css('background-position', '0px 0px');
			$('#step1Info').show();
		}, function(e) {
			$('#step1Circle').css('background-position', '0px -266px');
			$('#step1Info').hide();
		});
		$('#step2Circle').hover(

		function(e) {
			$('#step2Circle').css('background-position', '0px 0px');
			$('#step2Info').show();
		}, function(e) {
			$('#step2Circle').css('background-position', '0px -266px');
			$('#step2Info').hide();
		});
		$('#step3Circle').hover(

		function(e) {
			$('#step3Circle').css('background-position', '0px 0px');
			$('#step3Info').show();
		}, function(e) {
			$('#step3Circle').css('background-position', '0px -266px');
			$('#step3Info').hide();
		});
		$('#step4Circle').hover(

		function(e) {
			$('#step4Circle').css('background-position', '0px 0px');
			$('#step4Info').show();
		}, function(e) {
			$('#step4Circle').css('background-position', '0px -266px');
			$('#step4Info').hide();
		});
	}

	return function() {
		init();
	}

}();

$w.searchBox = function() {

	function init() {

		$('#go').click(function(e) {
			e.preventDefault();
			$('#searchForm').submit();
		});

		$('#searchForm').submit(function(e) {
			//append the query to the url and submit
			var q = $('#q').val();
			var action = $('#searchForm').attr('action');
			$('#searchForm').attr('action', action + q);
		});



	}

	return function() {
		init();
	}

}();

$w.moreEvents = function() {

	function init() {

		$('#moreEvents').click(function(e) {
			e.preventDefault();
			$('#moreEvents img.spinner').show();
			var zip = $('#moreEventsZipCode').val();
			var beginDate = $('#moreEventsBeginDate').val();
			wembli.event.get({
				beginDate: beginDate,
				nearZip: zip
			}, function(error, events) {
				$('#moreEvents img.spinner').hide();
				if (events.length > 0) {
					for (var idx in events) {
						var template = $('#belowFold ul li:first').clone(true, true);
						var event = events[idx];
						console.log(event);
						var href = '/event/' + event.ID + '/' + event.Name + '#eventBuilder';
						console.log(href);
						template.find('.info .choose-event').attr('href', href);
						template.find('.info .choose-event').html(event.Name);
						template.find('.info .venue').html(event.Venue);
						var location = event.City + ', ' + event.State;
						template.find('.info .location').html(location);
						template.find('.cta .choose-event').attr('href', href);
						var date = new Date(Date.parse(event.Date));
						var day = date.format("ddd");
						var eventDate = date.format("mmm d");
						var time = date.format("h:MM TT");
						template.find('.event-date-box .day').html(day);
						template.find('.event-date-box .event-date').html(eventDate);
						template.find('.event-date-box .time').html(time);
						var tixAvail = event.TicketPricingInfo.ticketsAvailable + ' tickets';
						template.find('.cta .ticketsAvailable').html(tixAvail);
						if (event.TicketPricingInfo.lowPrice == event.TicketPricingInfo.highPrice) {
							var priceRange = 'from $' + parseFloat(event.TicketPricingInfo.lowPrice).toFixed(0);
						} else {
							var priceRange = '($' + parseFloat(event.TicketPricingInfo.lowPrice).toFixed(0) + ' - $' + parseFloat(event.TicketPricingInfo.highPrice).toFixed(0) + ')';
						}
						template.find('.cta .priceRange').html(priceRange);

						$('#belowFold ul').append(template);
					}
					//update the last date hidden field
					var d = new Date(Date.parse(events[events.length - 1].Date))
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

