define([
	'config',
	'core/app',
	'core/system',
	'core/viewLocator',
	'core/plugins/backbone/router',
	'core/plugins/orm'
],
function (config, app, system, viewLocator, router, orm) {

	system.debug(config.debug);
	system.use(router, orm);

	window.Glados = {};
	Glados.app = app;
	Glados.system = system;

	app.title = 'Glados';
	app.start()
		.done(function () {
			viewLocator.useConvention();
			app.adaptToDevice();
			app.setRoot('layout');
		}).fail(function() {
			app.recover();
		});

});
