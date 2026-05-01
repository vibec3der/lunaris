"use strict";

window.addEventListener("DOMContentLoaded", () => {
	const theme = localStorage.getItem("lunarisTheme") || "default";
	document.body.dataset.theme = theme === "default" ? "" : theme;

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

	document.querySelectorAll("[data-lunaris-path]").forEach((button) => {
		button.addEventListener("click", () => {
			window.parent.postMessage(
				{
					type: "lunaris:navigate",
					address: button.dataset.lunarisPath,
				},
				window.location.origin,
			);
		});
	});
});
