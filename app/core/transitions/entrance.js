﻿define([
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

				var startValues = {
					marginLeft: fadeOnly ? '0' : '20px',
					marginRight: fadeOnly ? '0' : '-20px',
					opacity: 0,
					display: 'block'
				};

				var endValues = {
					marginRight: 0,
					marginLeft: 0,
					opacity: 1
				};

				$(newChild).css(startValues);
				$(newChild).animate(endValues, duration, 'swing', endTransition);
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
					$previousView.fadeOut(fadeOutDuration, startTransition);
				} else {
					startTransition();
				}
			}
		}).promise();
	};

	return entrance;
});
