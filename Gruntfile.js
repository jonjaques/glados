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
				'src/**/*.js',
				'!src/core/samples/**/*.js'
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
					'requirejs': true
				}
			}
		},

		requirejs: {
			release: {
				options: {
					appDir: 'src',
					mainConfigFile: './src/bootstrap.js',
					baseUrl: './',
					dir: 'dist',
					name: 'main',
					removeCombined: true
				}
			}
		},

		clean: {
			release: ['./dist']
		}

	});


	// Register Actions.
	grunt.registerTask('default', ['lint']);

	grunt.registerTask('lint', ['jshint:src']);

	grunt.registerTask('build', ['build:release']);

	grunt.registerTask('build:release', ['lint', 'clean:release', 'requirejs:release']);

};
