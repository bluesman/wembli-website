cd /wembli/website/public;
uglifyjs js/plugins/excanvas.js js/plugins/jquery.tuMap.js js/plugins/sequence.jquery-min.js js/lib/angular/angular.min.js js/app.js js/controllers.js js/services.js js/directives.js js/filters.js js/plugins/angular-google-maps.js js/twitter-bootstrap/bootstrap-alert.js js/twitter-bootstrap/bootstrap-transition.js js/twitter-bootstrap/bootstrap-tooltip.js js/twitter-bootstrap/bootstrap-dropdown.js js/twitter-bootstrap/bootstrap-popover.js js/twitter-bootstrap/bootstrap-scrollspy.js js/plugins/pikaday.jquery.js js/bootstrap-modal/bootstrap-modalmanager.js js/bootstrap-modal/bootstrap-modal.js -o js/wembli.min.js
echo "uglified...
";
