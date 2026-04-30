"use strict";

const tabsEl = document.getElementById("tabs");
const newTabButton = document.getElementById("new-tab");
const addressForm = document.getElementById("address-form");
const topAddress = document.getElementById("top-address");
const homeForm = document.getElementById("home-form");
const homeAddress = document.getElementById("sj-address");
const searchEngine = document.getElementById("sj-search-engine");
const homeView = document.getElementById("home-view");
const frameStage = document.getElementById("frame-stage");
const error = document.getElementById("sj-error");
const errorCode = document.getElementById("sj-error-code");
const backButton = document.getElementById("back-button");
const forwardButton = document.getElementById("forward-button");
const reloadButton = document.getElementById("reload-button");

const internalPages = {
	"lunaris://home": { title: "Lunaris", path: null, icon: "orbit" },
	"lunaris://games": { title: "Games", path: "games.html", icon: "gamepad-2" },
	"lunaris://apps": { title: "Apps", path: "apps.html", icon: "bot" },
	"lunaris://settings": { title: "Settings", path: "settings.html", icon: "settings" },
	"lunaris://credits": { title: "Credits", path: "credits.html", icon: "ellipsis-vertical" },
};

let scramjet;
let connection;
let activeTabId = null;
let nextTabId = 1;
const tabs = [];

function boot() {
	if (!localStorage.getItem("wispUrl")) {
		localStorage.setItem("wispUrl", "wss://gointospace.app/wisp/");
	}

	const transport = localStorage.getItem("transport");
	if (transport !== "epoxy" && transport !== "libcurl") {
		localStorage.setItem("transport", "libcurl");
	}

	const controller = $scramjetLoadController();
	scramjet = new controller.ScramjetController({
		files: {
			wasm: "/scram/scramjet.wasm.wasm",
			all: "/scram/scramjet.all.js",
			sync: "/scram/scramjet.sync.js",
		},
	});
	scramjet.init();
	connection = new BareMux.BareMuxConnection("/baremux/worker.js");

	addTab("lunaris://home");
	wireEvents();
	refreshIcons();
}

function wireEvents() {
	newTabButton.addEventListener("click", () => addTab("lunaris://home"));
	addressForm.addEventListener("submit", (event) => {
		event.preventDefault();
		navigateActive(topAddress.value);
	});
	topAddress.addEventListener("keydown", (event) => {
		if (event.key !== "Enter") return;
		event.preventDefault();
		navigateActive(topAddress.value);
	});
	homeForm.addEventListener("submit", (event) => {
		event.preventDefault();
		topAddress.value = homeAddress.value;
		navigateActive(homeAddress.value);
	});
	homeAddress.addEventListener("keydown", (event) => {
		if (event.key !== "Enter") return;
		event.preventDefault();
		topAddress.value = homeAddress.value;
		navigateActive(homeAddress.value);
	});
	backButton.addEventListener("click", () => moveHistory(-1));
	forwardButton.addEventListener("click", () => moveHistory(1));
	reloadButton.addEventListener("click", reloadActive);

	document.querySelectorAll("[data-prefix]").forEach((button) => {
		button.addEventListener("click", () => navigateActive(button.dataset.prefix));
	});

	window.addEventListener("message", (event) => {
		if (event.origin !== window.location.origin || event.data?.type !== "lunaris:navigate") return;
		navigateActive(event.data.address);
	});
}

function addTab(address) {
	const tab = {
		id: nextTabId++,
		title: "Lunaris",
		address: "lunaris://home",
		icon: "orbit",
		type: "home",
		history: [],
		historyIndex: -1,
		frame: null,
		scramFrame: null,
	};

	tabs.push(tab);
	activeTabId = tab.id;
	navigate(tab, address, true);
	renderTabs();
	setActiveView();
	return tab;
}

function closeTab(id) {
	const index = tabs.findIndex((tab) => tab.id === id);
	if (index === -1) return;

	const [tab] = tabs.splice(index, 1);
	if (tab.frame) tab.frame.remove();
	if (tab.scramFrame) tab.scramFrame.frame.remove();

	if (!tabs.length) {
		addTab("lunaris://home");
		return;
	}

	if (activeTabId === id) {
		activeTabId = tabs[Math.max(0, index - 1)].id;
	}

	renderTabs();
	setActiveView();
}

function getActiveTab() {
	return tabs.find((tab) => tab.id === activeTabId);
}

function navigateActive(input) {
	const tab = getActiveTab();
	if (tab) navigate(tab, input, true);
}

async function navigate(tab, rawInput, pushHistory) {
	const input = (rawInput || "").trim();
	if (!input) return;

	clearError();
	const prefix = normalizeInternalPrefix(input);

	if (prefix) {
		openInternal(tab, prefix);
	} else {
		await openWeb(tab, input);
	}

	if (pushHistory) {
		tab.history = tab.history.slice(0, tab.historyIndex + 1);
		tab.history.push(tab.address);
		tab.historyIndex = tab.history.length - 1;
	}

	renderTabs();
	setActiveView();
}

function normalizeInternalPrefix(input) {
	const lower = input.toLowerCase();
	if (internalPages[lower]) return lower;
	if (lower.startsWith("lunaris://")) return null;
	return null;
}

function openInternal(tab, prefix) {
	const page = internalPages[prefix];
	tab.type = page.path ? "internal" : "home";
	tab.address = prefix;
	tab.title = page.title;
	tab.icon = page.icon;
	topAddress.value = prefix;

	if (!page.path) return;

	if (!tab.frame) {
		tab.frame = document.createElement("iframe");
		tab.frame.className = "content-frame";
		tab.frame.title = page.title;
		frameStage.appendChild(tab.frame);
	}

	tab.frame.src = page.path;
	tab.frame.title = page.title;
}

async function openWeb(tab, input) {
	const url = search(input, searchEngine.value);
	tab.type = "web";
	tab.address = input;
	tab.title = titleFromInput(input);
	tab.icon = "globe";
	topAddress.value = input;

	try {
		await ensureTransport();
	} catch (err) {
		error.textContent = "Failed to prepare the proxy.";
		errorCode.textContent = err.toString();
		throw err;
	}

	if (!tab.scramFrame) {
		tab.scramFrame = scramjet.createFrame();
		tab.scramFrame.frame.id = `sj-frame-${tab.id}`;
		tab.scramFrame.frame.className = "content-frame";
		frameStage.appendChild(tab.scramFrame.frame);
	}

	tab.scramFrame.go(url);
}

async function ensureTransport() {
	try {
		await registerSW();
	} catch (err) {
		error.textContent = "Failed to register service worker.";
		errorCode.textContent = err.toString();
		throw err;
	}

	let wispUrl = localStorage.getItem("wispUrl");
	let transportType = localStorage.getItem("transport");

	if (transportType !== "epoxy" && transportType !== "libcurl") {
		transportType = "libcurl";
		localStorage.setItem("transport", transportType);
	}

	const transportPath = transportType === "epoxy" ? "/epoxy/index.mjs" : "/libcurl/index.mjs";
	const transportConfig = transportType === "epoxy" ? [{ wisp: wispUrl }] : [{ websocket: wispUrl }];

	if ((await connection.getTransport()) !== transportPath) {
		await connection.setTransport(transportPath, transportConfig);
	}
}

function moveHistory(direction) {
	const tab = getActiveTab();
	if (!tab) return;

	const nextIndex = tab.historyIndex + direction;
	if (nextIndex < 0 || nextIndex >= tab.history.length) return;

	tab.historyIndex = nextIndex;
	navigate(tab, tab.history[nextIndex], false);
}

function reloadActive() {
	const tab = getActiveTab();
	if (!tab) return;

	if (tab.type === "internal" && tab.frame) {
		tab.frame.contentWindow.location.reload();
		return;
	}

	if (tab.type === "web" && tab.address) {
		navigate(tab, tab.address, false);
	}
}

function renderTabs() {
	tabsEl.innerHTML = "";

	tabs.forEach((tab) => {
		const tabButton = document.createElement("button");
		tabButton.type = "button";
		tabButton.className = `tab${tab.id === activeTabId ? " active" : ""}`;
		tabButton.dataset.tabId = tab.id;
		tabButton.title = tab.address;
		tabButton.innerHTML = `
			<i data-lucide="${tab.icon}"></i>
			<span class="tab-title">${escapeHtml(tab.title)}</span>
			<span class="tab-close" aria-label="Close tab" title="Close tab"><i data-lucide="x"></i></span>
		`;

		tabButton.addEventListener("click", (event) => {
			if (event.target.closest(".tab-close")) {
				event.stopPropagation();
				closeTab(tab.id);
				return;
			}

			activeTabId = tab.id;
			renderTabs();
			setActiveView();
		});

		tabsEl.appendChild(tabButton);
	});

	refreshIcons();
}

function setActiveView() {
	const tab = getActiveTab();
	if (!tab) return;

	topAddress.value = tab.address;
	homeAddress.value = "";
	homeView.classList.toggle("hidden", tab.type !== "home");
	frameStage.classList.toggle("active", tab.type !== "home");

	document.querySelectorAll(".content-frame").forEach((frame) => {
		frame.classList.remove("active");
	});

	if (tab.type === "internal" && tab.frame) {
		tab.frame.classList.add("active");
	}

	if (tab.type === "web" && tab.scramFrame) {
		tab.scramFrame.frame.classList.add("active");
	}

	backButton.disabled = tab.historyIndex <= 0;
	forwardButton.disabled = tab.historyIndex >= tab.history.length - 1;
}

function titleFromInput(input) {
	try {
		return new URL(input).hostname.replace(/^www\./, "") || "Search";
	} catch (err) {
		return input.length > 18 ? `${input.slice(0, 18)}...` : input || "Search";
	}
}

function clearError() {
	error.textContent = "";
	errorCode.textContent = "";
}

function refreshIcons() {
	if (window.lucide) {
		window.lucide.createIcons();
	}
}

function escapeHtml(value) {
	return value.replace(/[&<>"']/g, (char) => {
		return {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
		}[char];
	});
}

window.addEventListener("DOMContentLoaded", boot);
