module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt, {
    pattern: ['grunt-*', '!grunt-template-jasmine-istanbul']
  });

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bannerTpl: grunt.file.read('banner.jst'),
    meta: {
      version: '<%= pkg.version %>',
      banner: grunt.template.process(grunt.file.read('banner.jst'), {
        data: { grunt: grunt, includeSubBanner: true, pkg: { version: '<%= pkg.version %>' }}}),        
    },
    assets: {
      babysitter:   'bower_components/backbone.babysitter/lib/backbone.babysitter.js',
      underscore:   'bower_components/underscore/underscore.js',
      backbone:     'bower_components/backbone/backbone.js',
      jquery:       'bower_components/jquery/dist/jquery.js',
      sinon:        'bower_components/sinonjs/sinon.js',
      jasmineSinon: 'bower_components/jasmine-sinon/lib/jasmine-sinon.js',
      wreqr:        'bower_components/backbone.wreqr/lib/backbone.wreqr.js',
    },

    clean: ['tmp'],

    preprocess: {
      core_build: {
        src: 'src/build/marionette.core.js',
        dest: 'lib/core/backbone.marionette.js'
      },
      core_amd: {
        src: 'src/build/amd.core.js',
        dest: 'lib/core/amd/backbone.marionette.js'
      },
      tmp: {
        src: '<%= preprocess.core_build.src %>',
        dest: 'tmp/backbone.marionette.js'
      }
    },

    concat: {
      options: {
        banner: "<%= meta.banner %>"
      },
      build: {
        src: [
          '<%= assets.babysitter %>',
          '<%= assets.wreqr %>',
          '<%= preprocess.core_build.dest %>',
        ],
        dest: 'lib/backbone.marionette.js'
      },
      amd_banner: {
        // Intentionally overwrites itself to preprend the banner
        src: '<%= preprocess.core_amd.dest %>',
        dest: '<%= preprocess.core_amd.dest %>'
      }
    },

    uglify : {
      options: {
        banner: "<%= meta.banner %>"
      },
      amd : {
        src : '<%= preprocess.core_amd.dest %>',
        dest : 'lib/core/amd/backbone.marionette.min.js',
      },
      core : {
        src : '<%= preprocess.core_build.dest %>',
        dest : 'lib/core/backbone.marionette.min.js',
        options : {
          sourceMap : 'lib/core/backbone.marionette.map',
          sourceMappingURL : 'backbone.marionette.map',
          sourceMapPrefix : 2,
        }
      },
      bundle : {
        src : '<%= concat.build.dest %>',
        dest : 'lib/backbone.marionette.min.js',
        options : {
          sourceMap : 'lib/backbone.marionette.map',
          sourceMappingURL : '<%= uglify.core.options.sourceMappingURL %>',
          sourceMapPrefix : 1
        }
      }
    },

    jasmine : {
      options : {
        helpers : [
          '<%= assets.sinon %>',
          '<%= assets.jasmineSinon %>',
          'spec/javascripts/helpers/*.js'
        ],
        specs : 'spec/javascripts/**/*.spec.js',
        vendor : [
          '<%= assets.jquery %>',
          '<%= assets.underscore %>',
          '<%= assets.backbone %>',
          '<%= assets.babysitter %>',
          '<%= assets.wreqr %>',
        ],
      },
      marionette : {
        src : [
          '<%= preprocess.tmp.dest %>',
          'spec/javascripts/support/marionette.support.js'
        ],
      }
    },

    jshint: {
      options: {
        jshintrc : '.jshintrc'
      },
      marionette : [ 'src/*.js' ]
    },

    watch: {
      marionette : {
        files : ['src/**/*.js', 'spec/**/*.js'],
        tasks : ['jshint', 'jasmine:marionette']
      },
      server : {
        files : ['src/**/*.js', 'spec/**/*.js'],
        tasks : ['jasmine:marionette:build']
      }
    },

    connect: {
      server: {
        options: {
          port: 8888
        }
      }
    }
  });

  // Simply an alias of test
  grunt.registerTask('default', ['test']);

  // Run tests
  grunt.registerTask('test', ['jshint', 'preprocess:tmp', 'jasmine:marionette', 'clean']);

  // Auto-lints and tests while developing
  grunt.registerTask('dev', ['test', 'watch:marionette']);

  // Build the core
  grunt.registerTask('build', ['jshint', 'preprocess:tmp', 'preprocess', 'concat', 'uglify', 'clean']);

};
