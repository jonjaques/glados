requirejs.config({
	deps: ['./main'],
	paths: {
		'vendor'			: './vendor',
		'text' 				: './vendor/text',
		'knockout'		: './vendor/knockout',
		'knockback'		: './vendor/knockback',
		'backbone'		: './vendor/backbone',
		'underscore'	: './vendor/underscore',
		'jquery'			: './vendor/jquery',
		'sammy' 			: './vendor/sammy'
	},
	shim: {
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
	},
	config: {
		config: {
			env: 'development'
		}
	}
});
