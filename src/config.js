define(['module', 'underscore'], function(module, _){
	var env = 'development';
	if (module.config() && module.config().env) { env = module.config().env; }
	if (window.APP_CONFIG_ENV) { env = APP_CONFIG_ENV; }

	var config = {
		common: {
			stuff: 'things'
		},
		development: {
			debug: true
		},
		stage: {
			debug: false
		},
		production: {
			debug: false
		}
	}

	return _.extend(config.common, config[env]);
})
