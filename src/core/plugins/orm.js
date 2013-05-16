define(['backbone', 'underscore', 'knockback'], function(Backbone, _, kb) {

	var methods = ['Collection', 'Model', 'sync', 'ajax', 'emulateHTTP', 'emulateJSON'];

	var orm = {
		pluginInit: function(system, plugins) {
			plugins.orm = orm;
			_(methods).each(function(method) {
				system[method] = orm[method];
			}, this);
		},
		Collection: Backbone.Collection,
		Model: Backbone.Model,
		ViewModel: kb.ViewModel,
		sync: Backbone.sync,
		ajax: Backbone.ajax,
		emulateHTTP: Backbone.emulateHTTP,
		emulateJSON: Backbone.emulateJSON
	};

	orm.Collection.prototype.observable = function(settings) {
		return kb.collectionObservable.call(kb, this, settings);
	}

	return orm;
});
