cd /wembli/website/public;
#wembli
uglifyjs js/lib/balanced/v1/balanced.js js/plugins/jquery.multiselect.filter.js js/plugins/jquery.slidepanel.js js/plugins/jquery.multiselect.js js/plugins/jquery.tuMap.js js/plugins/sequence.jquery-min.js js/lib/angular/angular.min.js js/controllers.js js/services.js js/services/header.js js/directives.js js/directives/header.js js/directives/dashboard.js js/directives/plan.js js/directives/parking-map.js js/directives/hotels-map.js js/directives/restaurants-map.js js/directives/venue-map.js js/directives/invitation-wizard.js js/filters.js js/app.js js/twitter-bootstrap/bootstrap-alert.js js/twitter-bootstrap/bootstrap-transition.js js/twitter-bootstrap/bootstrap-carousel.js js/twitter-bootstrap/bootstrap-tooltip.js js/twitter-bootstrap/bootstrap-dropdown.js js/twitter-bootstrap/bootstrap-popover.js js/twitter-bootstrap/bootstrap-scrollspy.js js/plugins/pikaday.jquery.js js/bootstrap-modal/bootstrap-modalmanager.js js/bootstrap-modal/bootstrap-modal.js -o js/wembli.min.js

#directories
uglifyjs ../plugins/jquery-1.10.2.js js/lib/angular/angular.min.js js/directory/default/1/controllers.js js/directory/default/1/services.js js/services/header.js js/directory/default/1/directives.js js/directives/header.js js/directory/default/1/filters.js js/directory/default/1/app.js ../plugins/bootstrap-3.0.2/js/transition.js ../plugins/bootstrap-3.0.2/js/collapse.js ../plugins/bootstrap-3.0.2/js/alert.js ../plugins/bootstrap-3.0.2/js/carousel.js ../plugins/bootstrap-3.0.2/js/tooltip.js ../plugins/bootstrap-3.0.2/js/dropdown.js ../plugins/bootstrap-3.0.2/js/popover.js js/bootstrap-modal/bootstrap-modalmanager.js js/bootstrap-modal/bootstrap-modal.js js/plugins/jquery.slidepanel.js -o js/directory/default/1/directory.min.js

echo "uglified...
";
