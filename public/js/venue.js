$(document).ready(function() {
    var mapId = $('#venueId').val()+','+$('#eventName').val();
    $('#fvmap').fanvenues({
	mapSet:'tn1',
	mapId:mapId,
	defaultZoom: 1,
	fullscreenMapButton: false,
	interactWithTicketList: false,
	priceFilter: false,
	resetMapButton: false,
	printMapButton: false,
	ssize: '340x183',
	ticketList:{
	    'items':[
		{id:'1231',section:'201',row:'10',price:'110.00',notes:'n/a'}
	    ]
	}
    })
	.bind('fvmapReady', function() {
	    // fvmap is now loaded and ready to use
	})
	.bind('fvmapNotAvailable', function() {
	    $(this).replaceWith('Sorry! Map could not be found.');
	})
	.bind('fvmapEnlargeImage', function(obj, largeImageUrl, section) {
	    // implement large image viewing
	})
	.bind('fvmapSectionFocus', function(obj, smallImageUrl, section) {
	    console.log('smallimage:'+smallImageUrl);
	    $('#thumbnail').html('<img src="'+smallImageUrl+'" />');
	})
	.bind('fvmapSectionBlur', function(obj, smallImageUrl, section) {
	    // implement section blur event
	})
	.bind('fvmapSectionSelect', function(obj, smallImageUrl, sectionName, sectionId, ticketsInSection) {
	    // implement section select event
	    // ticketsInSection is returned only if option 'interactWithTicketList' is true.
	    console.log('fvmapSectionSelect', sectionName, sectionId);
	})
	.bind('fvmapSectionDeselect', function(obj, smallImageUrl, sectionName, sectionId) {
	    // implement section deselect event
	});
});
