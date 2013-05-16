define([
	'sammy',
	'knockout',
	'../../system',
	'../../viewModel',
	'../../app'
], function (Sammy, ko, system, viewModel, app) {

	// Note: Sammy.js is not required by the core of Glados.
	// However, this plugin leverages it to enable navigation.

	var routesByPath = {},
		allRoutes = ko.observableArray([]),
		visibleRoutes = ko.observableArray([]),
		ready = ko.observable(false),
		isNavigating = ko.observable(false),
		sammy,
		router,
		previousRoute,
		previousModule,
		cancelling = false,
		activeItem = viewModel.activator(),
		activeRoute = ko.observable(),
		navigationDefaultRoute,
		queue = [],
		skipRouteUrl;

	var tryActivateRouter = function () {
		system.log('router#tryActivateRouter', arguments);
		tryActivateRouter = system.noop;
		ready(true);
		router.dfd.resolve();
		delete router.dfd;
	};

	activeItem.settings.areSameItem = function (currentItem, newItem, activationData) {
		return false;
	};

	function redirect(url) {
		system.log('router#redirect', arguments);
		isNavigating(false);
		system.log('Redirecting');
		router.navigateTo(url);
	}

	function cancelNavigation() {
		cancelling = true;
		system.log('router#cancelNavigation', arguments);

		if (previousRoute) {
			sammy.setLocation(previousRoute);
		}

		cancelling = false;
		isNavigating(false);

		var routeAttempted = sammy.last_location[1].split('#/')[1];

		if (previousRoute || !routeAttempted) {
			tryActivateRouter();
		} else if (routeAttempted !== navigationDefaultRoute) {
			window.location.replace("#/" + navigationDefaultRoute);
		} else {
			tryActivateRouter();
		}
	}

	function completeNavigation(routeInfo, params, module) {
		system.log('router#completeNavigation', arguments);
		activeRoute(routeInfo);
		router.onNavigationComplete(routeInfo, params, module);
		previousModule = module;
		previousRoute = sammy.last_location[1].replace('/', '');
		tryActivateRouter();
	}

	function activateRoute(routeInfo, params, module) {
		system.log('router#activateRoute', arguments);
		activeItem.activateItem(module, params).then(function (succeeded) {
			if (succeeded) {
				completeNavigation(routeInfo, params, module);
			} else {
				cancelNavigation();
			}
		});
	}

	function shouldStopNavigation() {
		system.log('router#shouldStopNavigation', arguments);
		return cancelling || (sammy.last_location[1].replace('/', '') === previousRoute);
	}

	function handleGuardedRoute(routeInfo, params, instance) {
		system.log('router#handleGuardedRoute', arguments);
		var resultOrPromise = router.guardRoute(routeInfo, params, instance);
		if (resultOrPromise) {
			if (resultOrPromise.then) {
				resultOrPromise.then(function(result) {
					if (result) {
						if (typeof result === 'string') {
							redirect(result);
						} else {
							activateRoute(routeInfo, params, instance);
						}
					} else {
						cancelNavigation();
					}
				});
			} else {
				if (typeof resultOrPromise === 'string') {
					redirect(resultOrPromise);
				} else {
					activateRoute(routeInfo, params, instance);
				}
			}
		} else {
			cancelNavigation();
		}
	}

	function dequeueRoute() {
		if (isNavigating()) {
			return;
		}
		system.log('router#dequeueRoute.isNavigating', !!isNavigating());

		var next = queue.shift();
		queue = [];

		system.log('router#dequeueRoute.next', !!next);

		if (!next) {
			return;
		}

		isNavigating(true);

		system.acquire(next.routeInfo.moduleId).then(function(module) {
			next.params.routeInfo = next.routeInfo;
			next.params.router = router;

			var instance = router.getActivatableInstance(next.routeInfo, next.params, module);

			if (router.guardRoute) {
				handleGuardedRoute(next.routeInfo, next.params, instance);
			} else {
				activateRoute(next.routeInfo, next.params, instance);
			}
		});
	}

	function queueRoute(routeInfo, params) {
		system.log('router#queueRoute', arguments);
		queue.unshift({
			routeInfo: routeInfo,
			params: params
		});

		dequeueRoute();
	}

	function ensureRoute(route, params) {
		system.log('router#ensureRoute', arguments);
		var routeInfo = routesByPath[route];

		if (shouldStopNavigation()) {
			return;
		}

		if (!routeInfo) {
			if (!router.autoConvertRouteToModuleId) {
				router.handleInvalidRoute(route, params);
				return;
			}

			var routeName = router.convertRouteToName(route);
			routeInfo = {
				moduleId: router.autoConvertRouteToModuleId(route, params),
				name: routeName,
				caption: routeName
			};
		}

		queueRoute(routeInfo, params);
	}

	function handleDefaultRoute() {
		system.log('router#handleDefaultRoute', arguments);
		ensureRoute(navigationDefaultRoute, this.params || {});
	}

	function handleMappedRoute() {
		system.log('router#handleMappedRoute', arguments);
		ensureRoute(this.app.last_route.path.toString(), this.params || {});
	}

	function handleWildCardRoute() {
		system.log('router#handleWildCardRoute', arguments);
		var params = this.params || {}, route;

		if (router.autoConvertRouteToModuleId) {
			var fragment = this.path.split('#/');

			if (fragment.length === 2) {
				var parts = fragment[1].split('/');
				route = parts[0];
				params.splat = parts.splice(1);
				ensureRoute(route, params);
				return;
			}
		}

		router.handleInvalidRoute(this.app.last_location[1], params);
	}

	function configureRoute(routeInfo) {
		system.log('router#configureRoute', arguments);
		router.prepareRouteInfo(routeInfo);

		routesByPath[routeInfo.url.toString()] = routeInfo;
		allRoutes.push(routeInfo);

		if (routeInfo.visible) {
			routeInfo.isActive = ko.computed(function () {
				return ready() && activeItem() && activeItem().__moduleId__ === routeInfo.moduleId;
			});

			visibleRoutes.push(routeInfo);
		}

		return routeInfo;
	}

	return window.Router = router = {
		ready: ready,
		allRoutes: allRoutes,
		visibleRoutes: visibleRoutes,
		isNavigating: isNavigating,
		activeItem: activeItem,
		activeRoute: activeRoute,
		afterCompose: function () {
			system.log('router#afterCompose', arguments);
			setTimeout(function () {
				isNavigating(false);
				dequeueRoute();
				router.onRouteComposed && router.onRouteComposed(router.activeRoute());
			}, 10);
		},
		getActivatableInstance: function (routeInfo, params, module) {
			system.log('router#getActivatableInstance', arguments);
			var Module = typeof module === 'function' ? module : false;
			if (Module) {
				return new Module();
			} else {
				return module;
			}
		},
		useConvention: function (rootPath) {
			system.log('router#useConvention', arguments);
			rootPath = rootPath === null ? 'viewmodels' : rootPath;
			if (rootPath) {
				rootPath += '/';
			}
			router.convertRouteToModuleId = function (url) {
				return rootPath + router.stripParameter(url);
			};
		},
		stripParameter: function (val) {
			system.log('router#stripParameter', arguments);
			var colonIndex = val.indexOf(':');
			var length = colonIndex > 0 ? colonIndex - 1 : val.length;
			return val.substring(0, length);
		},
		handleInvalidRoute: function (route, params) {
			system.log('router#handleInvalidRoute', arguments);
			system.log('No Route Found', route, params);
		},
		onNavigationComplete: function (routeInfo, params, module) {
			system.log('router#onNavigationComplete', arguments);
			if (app.title) {
				document.title = routeInfo.caption + " | " + app.title;
			} else {
				document.title = routeInfo.caption;
			}
		},
		navigateBack: function () {
			system.log('router#navigateBack', arguments);
			window.history.back();
		},
		navigateTo: function (url, option) {
			system.log('router#navigateTo', arguments);
			option = option || 'trigger';

			switch (option.toLowerCase()) {
				case 'skip':
					skipRouteUrl = url;
					sammy.setLocation(url);
					break;
				case 'replace':
					window.location.replace(url);
					break;
				default:
					if (sammy.lookupRoute('get', url) && url.indexOf("http") !== 0) {
						sammy.setLocation(url);
					} else {
						window.location.href = url;
					}
					break;
			}
		},
		navigateToRoute: function (url, data) {
			system.log('router#navigateToRoute', arguments);
			var newUrl = url;
			// find the hash using the url with parameters stripped
			for (var route in routesByPath) {
				if (router.stripParameter(routesByPath[route].url) === url) {
					newUrl = routesByPath[route].hash;
					break;
				}
			}

			// if this is an url with parameters, add data.property for these parameters to the url
			var colonIndex = newUrl.indexOf(':');
			if (colonIndex > 0) {
				var paramstring = newUrl.substring(colonIndex - 1, newUrl.length);
				var params = paramstring.split('/:');
				newUrl = router.stripParameter(newUrl);
				for (var i = 0; i < params.length; i++) {
					if (params[i]) {
						newUrl += '/' + data[params[i]];
					}
				}
			}

			sammy.setLocation(newUrl);
		},
		replaceLocation: function (url) {
			system.log('router#replaceLocation', arguments);
			this.navigateTo(url, 'replace');
		},
		convertRouteToName: function (route) {
			system.log('router#convertRouteToName', arguments);
			var value = router.stripParameter(route);
			return value.substring(0, 1).toUpperCase() + value.substring(1);
		},
		convertRouteToModuleId: function (route) {
			system.log('router#convertRouteToModuleId', arguments);
			return router.stripParameter(route);
		},
		prepareRouteInfo: function (info) {
			system.log('router#prepareRouteInfo', arguments);
			if (!(info.url instanceof RegExp)) {
				info.name = info.name || router.convertRouteToName(info.url);
				info.moduleId = info.moduleId || router.convertRouteToModuleId(info.url);
				info.hash = info.hash || '#/' + info.url;
			}

			info.caption = info.caption || info.name;
			info.settings = info.settings || {};
		},
		mapAuto: function (path) {
			system.log('router#mapAuto', arguments);
			path = path || 'viewmodels';
			path += '/';

			router.autoConvertRouteToModuleId = function (url, params) {
				return path + router.stripParameter(url);
			};
		},
		mapNav: function (urlOrConfig, moduleId, name) {
			system.log('router#mapNav', arguments);
			if (typeof urlOrConfig === "string") {
				return this.mapRoute(urlOrConfig, moduleId, name, true);
			}

			urlOrConfig.visible = true;
			return configureRoute(urlOrConfig);
		},
		mapRoute: function (urlOrConfig, moduleId, name, visible) {
			system.log('router#mapRoute', arguments);
			if (typeof urlOrConfig === "string") {
					return configureRoute({
						url: urlOrConfig,
						moduleId: moduleId,
						name: name,
						visible: visible
					});
			} else {
				return configureRoute(urlOrConfig);
			}
		},
		map: function (routeOrRouteArray) {
			system.log('router#map', arguments);
			if (!system.isArray(routeOrRouteArray)) {
				return configureRoute(routeOrRouteArray);
			}

			var configured = [];
			for (var i = 0; i < routeOrRouteArray.length; i++) {
				configured.push(configureRoute(routeOrRouteArray[i]));
			}
			return configured;
		},
		deactivate: function () {
			system.log('router#deactivate', arguments);
			router.allRoutes.removeAll();
			router.visibleRoutes.removeAll();
			sammy && sammy.destroy();
		},
		activate: function (defaultRoute) {
			system.log('router#activate', arguments);
			return system.defer(function (dfd) {
				var processedRoute;

				router.dfd = dfd;
				navigationDefaultRoute = defaultRoute;

				sammy = new Sammy(function (route) {
					var unwrapped = allRoutes();
					system.log(unwrapped);

					for (var i = 0; i < unwrapped.length; i++) {
						var current = unwrapped[i];
						route.get(current.url, handleMappedRoute);
						processedRoute = this.routes.get[i];
						routesByPath[processedRoute.path.toString()] = current;
					}

					route.get('#/', handleDefaultRoute);
					route.get(/\#\/(.*)/, handleWildCardRoute);
				});

				sammy._checkFormSubmission = function () {
					return false;
				};

				sammy.before(null, function(context) {
					if (!skipRouteUrl) {
						return true;
					} else if (context.path === "/" + skipRouteUrl) {
						skipRouteUrl = null;
						return false;
					} else {
						system.error(new Error("Expected to skip url '" + skipRouteUrl + "', but found url '" + context.path + "'"));
					}
				});

				sammy.log = function () {
					var args = Array.prototype.slice.call(arguments, 0);
					args.unshift('Sammy');
					system.log.apply(system, args);
				};

				sammy.run('#/');
			}).promise();
		}
	};
});
