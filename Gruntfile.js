/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

var module = module ? module : {};

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      src: [
        'Gruntfile.js',
        'app/**/*.js',
        '!app/core/amd/**/*.js'
      ],
      options: {
        // stricter warnings
        camelcase: false,
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        nonew: true,
        noarg: true,
        undef: true,
        strict: false,
        trailing: true,

        // suppress warnings
        boss: true,
        expr: true,
        eqnull: true,
        laxcomma: true,
        sub: true,
        browser: true,
        globals: {
          'define': true,
          'require': true,
          'alert': true,
          'confirm': true,
          'ko': true,
          'sammy': true,
          'Backbone': true,
          '_': true,
          '$': true,
          'jQuery': true
        }
      }
    },

    requirejs: {
      release: {
        options: {
        	appDir: 'app',
        	baseUrl: './',
        	dir: 'build',
        	name: 'main',
        	removeCombined: true
        }
      }
    },

    clean: {
      release: ['./build']
    }

  });


  // Register Actions.
  grunt.registerTask('default', ['lint']);

  grunt.registerTask('lint', ['jshint:src']);

  grunt.registerTask('build', ['build:release']);

  grunt.registerTask('build:release', ['lint', 'clean:release', 'requirejs:release']);

};
