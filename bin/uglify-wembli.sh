cd public;

#global js
uglifyjs ../plugins/jquery-1.10.2.js ../plugins/jquery.slidepanel.js ../plugins/angular-1.2.4/angular.min.js ../plugins/angular-1.2.4/angular-route.min.js ../angular/controllers.js ../angular/directives.js ../angular/services.js ../angular/filters.js ../angular/controllers/header.js ../angular/services/header.js ../angular/services/facebook.js ../angular/services/twitter.js ../angular/services/pixel.js ../angular/directives/header.js ../plugins/bootstrap-3.0.2/js/transition.js ../plugins/bootstrap-3.0.2/js/collapse.js ../plugins/bootstrap-3.0.2/js/alert.js ../plugins/bootstrap-3.0.2/js/carousel.js ../plugins/bootstrap-3.0.2/js/tooltip.js ../plugins/bootstrap-3.0.2/js/dropdown.js ../plugins/bootstrap-3.0.2/js/popover.js ../plugins/bootstrap-3.0.2/js/tab.js ../plugins/bootstrap-modal/bootstrap-modalmanager.js ../plugins/bootstrap-modal/bootstrap-modal.js -o js/wembli.min.js

#minified js for index page
uglifyjs ../plugins/typeahead.js ../angular/apps/index.js ../angular/controllers/index.js ../angular/directives/typeahead.js -o js/index.min.js
#minified for search
uglifyjs ../plugins/typeahead.js ../angular/controllers/search.js ../angular/directives/search.js ../angular/directives/typeahead.js ../angular/apps/search.js -o js/search.min.js

#../plugins/pikaday.jquery.js
#old wembli.min.js for entire site
#uglifyjs js/lib/balanced/v1/balanced.js ../plugins/jquery.multiselect/jquery.multiselect.filter.js js/plugins/jquery.slidepanel.js ../plugins/jquery.multiselect/jquery.multiselect.js ../plugins/jquery.tuMap.demo-3.0.1/jquery.tuMap-3.0.1.js js/plugins/sequence.jquery-min.js js/lib/angular/angular.min.js js/controllers.js js/services.js js/services/header.js js/directives.js js/directives/header.js js/directives/dashboard.js js/directives/plan.js js/directives/parking-map.js js/directives/hotels-map.js js/directives/restaurants-map.js js/directives/venue-map.js js/directives/invitation-wizard.js js/filters.js js/app.js js/twitter-bootstrap/bootstrap-alert.js js/twitter-bootstrap/bootstrap-transition.js js/twitter-bootstrap/bootstrap-carousel.js js/twitter-bootstrap/bootstrap-tooltip.js js/twitter-bootstrap/bootstrap-dropdown.js js/twitter-bootstrap/bootstrap-popover.js js/twitter-bootstrap/bootstrap-scrollspy.js js/plugins/pikaday.jquery.js js/bootstrap-modal/bootstrap-modalmanager.js js/bootstrap-modal/bootstrap-modal.js -o js/wembli.min.js

#directories
uglifyjs ../plugins/jquery-1.10.2.js ../plugins/jquery.slidepanel.js ../plugins/angular-1.2.4/angular.min.js ../angular/directory/default/1/controllers.js ../angular//directory/default/1/services.js ../angular/services/header.js ../angular/directory/default/1/directives.js ../angular/directives/header.js ../angular/directory/default/1/filters.js ../angular/directory/default/1/app.js ../plugins/bootstrap-3.0.2/js/transition.js ../plugins/bootstrap-3.0.2/js/collapse.js ../plugins/bootstrap-3.0.2/js/alert.js ../plugins/bootstrap-3.0.2/js/carousel.js ../plugins/bootstrap-3.0.2/js/tooltip.js ../plugins/bootstrap-3.0.2/js/dropdown.js ../plugins/bootstrap-3.0.2/js/popover.js ../plugins/bootstrap-3.0.2/js/tab.js ../plugins/bootstrap-modal/bootstrap-modalmanager.js ../plugins/bootstrap-modal/bootstrap-modal.js -o js/directory-default-1.min.js

echo "uglified...
";
