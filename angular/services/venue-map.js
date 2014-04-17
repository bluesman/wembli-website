'use strict';
angular.module('wembliApp.services.venueMap', []).

factory('tuMap', [
  function() {
    var self = this;

    self.options = {
      MapSet: "tn",
      MapType: "Interactive",
      ZoomLevel: 8,
      ColorScheme: 1,
      //AutoSwitchToStatic: true,
      //ControlsPosition: "Outside",
      //AdaptiveThreshold:1.2,
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

    return {
      options: self.options,
      init: function(el, options, callback) {
        var opts = angular.extend(self.options, options);
        console.log(opts);
        console.log('tumap for '+el);
        return $(el).tuMap(opts);
      }
    };
  }
]);
