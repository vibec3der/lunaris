"use strict";

window.addEventListener("DOMContentLoaded", () => {
	if (window.lucide) {
		window.lucide.createIcons();
	}

	document.querySelectorAll("[data-open]").forEach((button) => {
		button.addEventListener("click", () => {
			window.parent.postMessage(
				{
					type: "lunaris:navigate",
					address: button.dataset.open,
				},
				window.location.origin,
			);
		});
	});
});
