angular.module('wembliApp.services.ticket-utils', []).
/* ticket-utils */
factory('interactiveMapDefaults', [
	function() {
		return {
			ServiceUrl: "https://imap.ticketutils.net",
			MapSet: "tn",
			MapType: "Interactive",
			ZoomLevel: 1,
			ColorScheme: 1,
			//AutoSwitchToStatic: true,
			ControlsPosition: "Inside",
			FailOverMapUrl: "http://data.ticketutils.com/Charts/No-Seating-Chart.jpg",
			GroupsContainer: "#groups-container",
			RowSelector: ".ticket-row",
			RowNumberSelector: ".seat-row",
			SectionSelector: ".ticket-section",
			PriceSelector: ".actual-price",
			QuantitySelector: ".ticket-quantity",
			eTicketSelector: ".e-ticket",
			ResetButtonText: "Reset Map",
		};
	}
]);
