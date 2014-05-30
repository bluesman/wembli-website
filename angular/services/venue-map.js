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

    self.mapUrl = "/images/no-seating-chart.jpg";

    return {
      mapType: "",
      mapUrl: self.mapUrl,
      options: self.options,
      init: function(el, options, callback) {
        this.container = el;

        var opts = angular.extend(self.options, options);
        return $(el).tuMap(opts);
      },
      displayStaticMap: function(mapUrl) {
        /* TODO: check if this is split first */
        console.log('init static map - container is: '+this.container);
        var img = new Image();
        img.src = mapUrl;
        img.onload = function() {

          var w = img.width;
          var h = img.height;
          $(this.container).css("width", $($window).width() - 680);
          $(this.container).css("position","relative");
          $(this.container)
            .empty()
            .css('overflow-y', 'auto')
            .css('float','right')
            .prepend('<div id="static-map-image" style="overflow-y:auto;background:transparent url(\''+mapUrl+'\') no-repeat center center;margin:auto;padding:20px;height:'+h+'px;width:'+w+'px;" />');
          var h2 = $(this.container).height() - 170;

          $('.ticket-list-container').height(h2);

          $('#static-map-image').mouseenter(function() {
            angular.element('#static-popover-content').show();
          });

          $('#static-map-image').mouseleave(function() {
            angular.element('#static-popover-content').hide();
          });

          /* override the popover functionality */
          var originalPlacement = $.fn.popover.Constructor.prototype.applyPlacement;
          $.fn.popover.Constructor.prototype.applyPlacement = function(offset, placement) {
            offset.top = 200;
            var $tip = this.tip(),
              width = $tip[0].offsetWidth,
              height = $tip[0].offsetHeight,
              actualWidth, actualHeight, delta, replace

              $tip
                .offset(offset)
                .addClass(placement)
                .addClass('in')

              actualWidth = $tip[0].offsetWidth
              actualHeight = $tip[0].offsetHeight

            if (placement == 'top' && actualHeight != height) {
              offset.top = offset.top + height - actualHeight
              replace = true
            }

            if (placement == 'bottom' || placement == 'top') {
              delta = 0

              if (offset.left < 0) {
                delta = offset.left * -2
                offset.left = 0
                $tip.offset(offset)
                actualWidth = $tip[0].offsetWidth
                actualHeight = $tip[0].offsetHeight
              }

              this.replaceArrow(delta - width + actualWidth, actualWidth, 'left')
            } else {
              this.replaceArrow(actualHeight - height, actualHeight, 'top')
            }

            if (replace) $tip.offset(offset)
            $('.ticket-list-container').height(h);
          };
        };
      }
    };
  }
]);
