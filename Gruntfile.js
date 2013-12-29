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
        mangle: {
        	except: ['jQuery']
        }
      },
      "global": {
      	"files": {
      		'public/js/wembli.min.js':[
            'bower_components/jquery/jquery.js',
            'plugins/jquery.slidepanel.js',
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
            'plugins/jquery.slidepanel.js',
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
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['watch']);

};
