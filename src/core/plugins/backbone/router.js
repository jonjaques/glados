define([
	'backbone',
	'knockout',
	'underscore',
	'jquery',
	'config',
	'../../system',
	'../../viewModel'
],
function (Backbone, ko, _, $, config, system, viewModel) {

	var Router = Backbone.Router.extend({

		initialize: function(options) {
			system.log('Router::initialize', arguments);
			this.activeRoute = ko.observable();
			this.allRoutes = ko.observableArray();
		},

		pluginInit: function(system, plugins) {
			system.router = plugins.router = this;
		},

		map: function(routes) {
			system.log('Router::map', arguments);
			var routes_ = _(routes);
			if (routes_.isArray()) {
				routes_.each(this.route, this);
			} else if (routes_.isObject()) {
				routes_.map(function(settings, route) {
					return this.route(route, settings);
				}, this);
			} else {
				throw new Error('Must provide an array or object of routes');
			}
			return this;
		},

		route: function(route, settings) {
			system.log('Router::route', arguments);
			var route_ = _(route);
			if (route_.isString()) {
				settings = _.extend(settings, { route: route });
			} else {
				settings = route;
			}
			Backbone.Router.prototype.route.apply(this,
				[ settings.route, this._configureRoute(settings) ]);
		},

		activate: function(defaultRoute) {
			system.log('Router::activate', arguments);
			return system.defer(function(dfd) {
				$(function() {
					Backbone.history.start();
					system.log('Backbone.history::start')
					dfd.resolve();
				});
			}).promise();
		},

		afterCompose: function() {
			system.log('Router::afterCompose', arguments);

		},

		beforeCompose: function() {
			system.log('Router::beforeCompose', arguments);
		},

		_configureRoute: function(settings) {

			// return this._handleMappedRoute()
		}

	});

	var router = window.Router = new Router(config.routing);

	return router;

});
