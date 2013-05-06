define(['../system'], function(system) {
	var fadeOutDuration = 100;

	var entrance = function(parent, newChild, settings) {
		return system.defer(function(dfd) {
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

					$(newChild).fadeIn(duration, endTransition);
				}

				if ($previousView.length) {
					$previousView.fadeOut(fadeOutDuration, startTransition);
				} else {
					startTransition();
				}
			}
		}).promise();
	};

	return entrance;
});
