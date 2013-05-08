define([
	'jquery',
	'knockout',
	'../system'
],
function($, ko, system) {
	var fadeOutDuration = 100;

	var entrance = function(parent, newChild, settings) {
		return system.defer(function(dfd) {

			var $previousView = $(settings.activeView);
			var duration = settings.duration || 500;
			var fadeOnly = !!settings.fadeOnly;

			function startTransition() {
				scrollIfNeeded();

				if (settings.cacheViews) {
					if (settings.composingNewView) {
						ko.virtualElements.prepend(parent, newChild);
					}
				} else {
					ko.virtualElements.emptyNode(parent);
					ko.virtualElements.prepend(parent, newChild);
				}

				$(newChild).show();
				endTransition();
			}

			function endTransition() {
				dfd.resolve();
			}

			function scrollIfNeeded() {
				if (!settings.keepScrollPosition) {
					$(document).scrollTop(0);
				}
			}

			if (!newChild) {
				scrollIfNeeded();

				if (settings.activeView) {
					$(settings.activeView).fadeOut(fadeOutDuration, function () {
						if (!settings.cacheViews) {
							ko.virtualElements.emptyNode(parent);
						}
						endTransition();
					});
				} else {
					if (!settings.cacheViews) {
						ko.virtualElements.emptyNode(parent);
					}
					endTransition();
				}
			} else {
				if ($previousView.length) {
					$previousView.hide();
					startTransition();
				} else {
					startTransition();
				}
			}
		}).promise();
	};

	return entrance;
});
