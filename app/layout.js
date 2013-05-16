define([
	'knockout',
	'core/system',
	'routes'
], function (ko, system, routes) {

	var AppViewModel = function() {
		var self = this;
		this.viewUrl = 'views/layouts/master';
		this.router = system.router;

		this.activate = function() {
			this.router
				.map(routes)
				.activate('login')
					.done(function() {
						system.log('App booted successfully.');
					})
					.fail(function() {
						system.log('The app failed to boot.');
					})
		}
	};

	return AppViewModel;

});
