module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    less: {
      options: {
        paths: ['bower_components/bootstrap/less','bower_components/components-font-awesome/less'],
        compress: true,
        yuicompress: true,
        optimization: 2
      },
      "style":{
        "files": {
          'public/css/style.css':'less/style.less'
        }
      },
      "directory-default-1": {
        "files": {
          'public/css/directory-default-1-style.css':'less/directory/default/1/style.less'
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        /*
        mangle: {
        	except: ['jQuery']
        },
        */
        mangle:false,
        beautify: true
      },
      "global": {
      	"files": {
      		'public/js/wembli.min.js':[
            'bower_components/jquery/jquery.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/bootstrap/js/transition.js',
            'bower_components/bootstrap/js/collapse.js',
            'bower_components/bootstrap/js/alert.js',
            'bower_components/bootstrap/js/carousel.js',
            'bower_components/bootstrap/js/tooltip.js',
            'bower_components/bootstrap/js/dropdown.js',
            'bower_components/bootstrap/js/popover.js',
            'bower_components/bootstrap/js/tab.js',
            'bower_components/bootstrap-modal/js/bootstrap-modalmanager.js',
            'bower_components/bootstrap-modal/js/bootstrap-modal.js',
            'bower_components/angular-animate/angular-animate.js',
            'bower_components/angular-strap/dist/angular-strap.js',
            'bower_components/angular-strap/dist/angular-strap.tpl.js',
            'plugins/balanced/v1/balanced.js',
            'angular/controllers.js',
            'angular/directives.js',
            'angular/services.js',
            'angular/filters.js',
            'angular/controllers/header.js',
            'angular/services/header.js',
            'angular/services/facebook.js',
            'angular/services/twitter.js',
            'angular/services/pixel.js',
            'angular/directives/header.js'
          ]
      	}
      },
      "directory-default-1": {
      	"files": {
      		'public/js/directory-default-1.min.js':[
            'bower_components/jquery/jquery.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/bootstrap/js/transition.js',
            'bower_components/bootstrap/js/collapse.js',
            'bower_components/bootstrap/js/alert.js',
            'bower_components/bootstrap/js/carousel.js',
            'bower_components/bootstrap/js/tooltip.js',
            'bower_components/bootstrap/js/dropdown.js',
            'bower_components/bootstrap/js/popover.js',
            'bower_components/bootstrap/js/tab.js',
            'bower_components/bootstrap-modal/js/bootstrap-modalmanager.js',
            'bower_components/bootstrap-modal/js/bootstrap-modal.js',
            'bower_components/angular-strap/dist/angular-strap.js',
            'bower_components/angular-strap/dist/angular-strap.tpl.js',
            'angular/directory/default/1/controllers.js',
            'angular/directory/default/1/services.js',
            'angular/services/header.js',
            'angular/directory/default/1/directives.js',
            'angular/directives/header.js',
            'angular/directory/default/1/filters.js',
            'angular/directory/default/1/app.js'
          ]
      	}
      },
      "index": {
        "files": {
          'public/js/index.min.js':[
            'bower_components/typeahead.js/dist/typeahead.js',
            'angular/apps/index.js',
            'angular/controllers/index.js',
            'angular/directives/typeahead.js'
          ]
        }
      },
      "search": {
        "files": {
          'public/js/search.min.js':[
            'bower_components/typeahead.js/dist/typeahead.js',
            'bower_components/jquery-waypoints/waypoints.js',
            'angular/apps/search.js',
            'angular/controllers/search.js',
            'angular/directives/search.js',
            'angular/directives/typeahead.js'
          ]
        }
      },
      "login": {
        "files": {
          'public/js/login.min.js':[
            'angular/apps/login.js',
            'angular/controllers/login.js',
          ]
        }
      },
      "dashboard": {
        "files": {
          'public/js/dashboard.min.js':[
            'angular/apps/dashboard.js',
            'angular/controllers/dashboard.js',
            'angular/directives/dashboard.js',
          ]
        }
      },
      "event-options": {
        "files": {
          'public/js/event-options.min.js':[
            'angular/apps/event-options.js',
            'angular/controllers/event-options.js',
          ]
        }
      },
      "tickets": {
        "files": {
          'public/js/tickets.min.js':[
            'plugins/jquery-ui-1.10.4.custom/js/jquery-ui-1.10.4.custom.js',
            'plugins/jquery.tuMap.demo.3.1.11/Lib/jquery.hammer.min.js',
            'plugins/jquery.tuMap.demo.3.1.11/Lib/excanvas-min.js',
            'plugins/jquery.tuMap.demo.3.1.11/Lib/jquery.tuMap-min.js',
            'angular/apps/tickets.js',
            'angular/controllers/tickets.js',
            'angular/directives/venue-map.js',
            'angular/services/venue-map.js'
          ]
        }
      },
      "add-ons": {
        "files": {
          'public/js/add-ons.min.js':[
            'angular/apps/add-ons.js',
            'angular/controllers/add-ons.js',
            'angular/directives/add-ons.js',
            'angular/directives/parking-map.js',
            'angular/directives/restaurants-map.js',
            'angular/directives/hotels-map.js',
            'angular/services/add-ons.js',
            'angular/services/google.js'
          ]
        }
      },
      "invitation": {
        "files": {
          'public/js/invitation.min.js':[
            'bower_components/pikaday/pikaday.js',
            'bower_components/pikaday/plugins/pikaday.jquery.js',
            'angular/apps/invitation.js',
            'angular/controllers/invitation.js',
            'angular/directives/invitation-wizard.js'
          ]
        }
      },
      "plan": {
        "files": {
          'public/js/plan.min.js':[
            'plugins/jquery-ui-1.10.4.custom/js/jquery-ui-1.10.4.custom.js',
            'plugins/jquery.multiselect/jquery.multiselect.js',
            'angular/apps/plan.js',
            'angular/controllers/plan.js',
            'angular/directives/plan.js',
            'angular/filters/plan.js',
            'angular/services/plan.js',
            'angular/services/google.js'
          ]
        }
      }
    },
    watch: {
      styles: {
        files: ['less/**/*.less'],
        tasks:['less'],
        options: {
          spawn: false
        }
      },
      js: {
        files: ['angular/**/*.js'],
        tasks:['uglify'],
        options: {
          spawn: false
        }
      },
      invitation: {
        files: ['less/**/*.less','angular/**/invitation.js','angular/**/invitation-wizard*'],
        tasks:['less:style','uglify:invitation'],
        options: {
          spawn: false
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['watch']);
  grunt.registerTask('watch-invitation',['watch:invitation']);

};
