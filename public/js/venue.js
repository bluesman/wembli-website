$(document).ready(function() {
    $('#fvmap').fanvenues({
	mapSet:'fv',
	mapId:'6630',	// new meadowlands stadium - football
	interactWithTicketList: false,
	priceFilter: true,
	ticketList:{
	    'items':[
		{id:'1231',section:'201',row:'10',price:'110.00',notes:'n/a'},
		{id:'1232',section:'201',row:'12',price:'24.00',notes:'n/a'},
		{id:'1232',section:'201',row:'11',price:'12.00',notes:'n/a'},
		{id:'1233',section:'202',row:'4',price:'150.00',notes:'n/a'},
		{id:'1234',section:'117',row:'4',price:'210.00',notes:'n/a'},
		{id:'1235',section:'223',row:'4',price:'110.00',notes:'n/a'},
		{id:'1236',section:'316',row:'4',price:'115.00',notes:'n/a'},
		{id:'1237',section:'107',row:'4',price:'300.00',notes:'n/a'},
		{id:'1238',section:'101',row:'4',price:'320.00',notes:'n/a'},
		{id:'1239',section:'213',row:'4',price:'80.00',notes:'n/a'},
		{id:'1240',section:'307',row:'4',price:'100.00',notes:'n/a'},
		{id:'1241',section:'318',row:'4',price:'130.00',notes:'n/a'},
		{id:'1242',section:'112',row:'4',price:'510.00',notes:'n/a'},
		{id:'1243',section:'203',row:'4',price:'110.00',notes:'n/a'},
		{id:'1244',section:'9',row:'4',price:'31.00',notes:'n/a'},
		{id:'1245',section:'09',row:'4',price:'31.00',notes:'n/a'}
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
