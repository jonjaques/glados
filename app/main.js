requirejs.config({
	paths: {
		'text': 'core/amd/text',
		'vendor': '../vendor',
		'knockout': '../vendor/knockout',
		'backbone': '../vendor/backbone',
		'underscore': '../vendor/underscore',
		'jquery': '../vendor/jquery',
		'sammy': '../vendor/sammy'
	},
	shim: {
		'knockout': {
			deps: ['jquery'],
			exports: 'ko'
		},
		'backbone': {
			deps: ['jquery', 'underscore'],
			exports: 'Backbone'
		},
		'underscore': {
			exports: '_'
		},
		'jquery': {
			exports: '$'
		},
		'sammy': {
			exports: 'Sammy'
		}
	}
});

define(['core/app', 'core/system', 'core/viewLocator'],
function (app, system, viewLocator) {
	system.debug(true);

	var MyApp = {
		app: app,
		system: system
	};

	window.MyApp = window.MyApp || MyApp;

	app.title = 'Durandal Samples';
	app.start().then(function () {
		viewLocator.useConvention();
		app.adaptToDevice();
		app.setRoot('../layout');
	});
});
