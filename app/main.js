requirejs.config({
	paths: {
		'text': 'core/amd/text'
	}
});

define([
	'core/app',
	'core/system',
	'core/viewLocator'
], function (app, system, viewLocator) {

	system.debug(true);

	var MyApp = {
		app: app,
		system: system
	};

	window.MyApp = window.MyApp || MyApp;

	app.title = 'Durandal Samples';
	app.start().then(function () {
		//Replace 'viewmodels' in the moduleId with 'views' to locate the view.
		//Look for partial views in a 'views' folder in the root.
		viewLocator.useConvention();

		app.adaptToDevice();
		app.setRoot('../samples/shell');
	});
});
