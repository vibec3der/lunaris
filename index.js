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
const bookmarkButton = document.getElementById("bookmark-button");
const fullscreenButton = document.getElementById("fullscreen-button");
const menuButton = document.getElementById("menu-button");
const browserMenu = document.getElementById("browser-menu");
const bookmarkList = document.getElementById("bookmark-list");
const historyList = document.getElementById("history-list");
const clearHistoryButton = document.getElementById("clear-history");
const proxyLoader = document.getElementById("proxy-loader");
const loaderTarget = document.getElementById("loader-target");
const DEFAULT_WISP_URL = "wss://wisp.bostoncareercounselor.com/wisp/";
const OLD_DEFAULT_WISP_URL = "wss://gointospace.app/wisp/";

const internalPages = {
	"lunaris://home": { title: "Lunaris", path: null, icon: "orbit", documentTitle: "Lunaris" },
	"lunaris://games": { title: "Games", path: "games.html", icon: "gamepad-2", documentTitle: "Lunaris: Games" },
	"lunaris://ai": { title: "Edulearn AI", path: "ai.html", icon: "bot", documentTitle: "Lunaris: AI" },
	"lunaris://apps": { title: "Apps", path: "apps.html", icon: "layout-grid", documentTitle: "Lunaris: Apps" },
	"lunaris://tools": { title: "Tools", path: "tools.html", icon: "wrench", documentTitle: "Lunaris: Tools" },
	"lunaris://settings": { title: "Settings", path: "settings.html", icon: "settings", documentTitle: "Lunaris: Settings" },
	"lunaris://credits": { title: "Credits", path: "credits.html", icon: "ellipsis-vertical", documentTitle: "Lunaris: Credits" },
	"lunaris://privacy": { title: "Privacy", path: "privacy.html", icon: "shield", documentTitle: "Lunaris: Privacy" },
	"lunaris://terms": { title: "Terms", path: "terms.html", icon: "scroll-text", documentTitle: "Lunaris: Terms" },
};

const cloakPresets = {
	none: { title: "", icon: "" },
	classroom: { title: "Home", icon: "https://ssl.gstatic.com/classroom/favicon.png" },
	iready: { title: "i-Ready", icon: "https://login.i-ready.com/favicon.ico" },
	docs: { title: "Google Docs", icon: "https://ssl.gstatic.com/docs/documents/images/kix-favicon-2023q4.ico" },
	gmail: { title: "Gmail", icon: "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" },
	drive: { title: "My Drive - Google Drive", icon: "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png" },
};

let scramjet;
let connection;
let activeTabId = null;
let nextTabId = 1;
let loaderTimer = null;
let loaderStartedAt = 0;
const tabs = [];

function boot() {
	const savedWispUrl = localStorage.getItem("wispUrl");
	if (!savedWispUrl || savedWispUrl === OLD_DEFAULT_WISP_URL) {
		localStorage.setItem("wispUrl", DEFAULT_WISP_URL);
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

	applyCloak();
	applyTheme();
	launchAboutBlankIfNeeded();
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
	bookmarkButton.addEventListener("click", toggleBookmark);
	fullscreenButton.addEventListener("click", fullscreenActiveFrame);
	menuButton.addEventListener("click", toggleMenu);
	browserMenu.addEventListener("click", handleMenuClick);
	clearHistoryButton.addEventListener("click", clearSearchHistory);

	document.querySelectorAll("[data-prefix]").forEach((button) => {
		button.addEventListener("click", () => navigateActive(button.dataset.prefix));
	});

	document.addEventListener("click", (event) => {
		if (browserMenu.hidden) return;
		if (browserMenu.contains(event.target) || menuButton.contains(event.target)) return;
		closeMenu();
	});

	window.addEventListener("message", (event) => {
		if (event.origin !== window.location.origin) return;

		if (event.data?.type === "lunaris:navigate") {
			navigateActive(event.data.address);
		}

		if (event.data?.type === "lunaris:data-updated") {
			applyCloak();
			applyTheme();
			renderMenu();
			setActiveView();
		}
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
		hideProxyLoader();
		openInternal(tab, prefix);
	} else {
		await openWeb(tab, input);
	}

	if (pushHistory) {
		tab.history = tab.history.slice(0, tab.historyIndex + 1);
		tab.history.push(tab.address);
		tab.historyIndex = tab.history.length - 1;
		saveSearchHistory(tab);
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
	document.title = currentDocumentTitle(page.documentTitle);
	topAddress.value = prefix;

	if (!page.path) return;

	if (!tab.frame) {
		tab.frame = document.createElement("iframe");
		tab.frame.className = "content-frame";
		tab.frame.title = page.title;
		tab.frame.allow = "fullscreen";
		frameStage.appendChild(tab.frame);
	}

	tab.frame.src = page.path;
	tab.frame.title = page.title;
}

async function openWeb(tab, input) {
	const url = search(input, searchEngine.value);
	tab.type = "web";
	tab.address = input;
	tab.title = "Lunaris | Advanced Calculus Courses For High School And Above";
	tab.icon = "globe";
	document.title = currentDocumentTitle(); // budda we dont need to know the tab title
	topAddress.value = input;
	showProxyLoader(tab.title);

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
		tab.scramFrame.frame.allow = "fullscreen";
		tab.scramFrame.frame.addEventListener("load", queueProxyLoaderHide);
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
	updateBookmarkButton();
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
	fullscreenButton.disabled = tab.type === "home";
	updateBookmarkButton();
	const page = internalPages[tab.address];
	document.title = currentDocumentTitle(page?.documentTitle || `Lunaris: ${tab.title}`);
}

function toggleBookmark() {
	const tab = getActiveTab();
	if (!tab || tab.type === "home") return;

	const bookmarks = readJson("lunarisBookmarks", []);
	const index = bookmarks.findIndex((bookmark) => bookmark.address === tab.address);

	if (index >= 0) {
		bookmarks.splice(index, 1);
	} else {
		bookmarks.unshift({
			address: tab.address,
			title: tab.title,
			icon: tab.icon,
			createdAt: new Date().toISOString(),
		});
	}

	localStorage.setItem("lunarisBookmarks", JSON.stringify(bookmarks.slice(0, 100)));
	updateBookmarkButton();
	renderMenu();
}

function updateBookmarkButton() {
	const tab = getActiveTab();
	const bookmarks = readJson("lunarisBookmarks", []);
	const isBookmarked = Boolean(tab && bookmarks.some((bookmark) => bookmark.address === tab.address));
	bookmarkButton.classList.toggle("active", isBookmarked);
	bookmarkButton.disabled = !tab || tab.type === "home";
	bookmarkButton.title = isBookmarked ? "Remove bookmark" : "Bookmark this page";
}

function saveSearchHistory(tab) {
	if (!tab || tab.type !== "web") return;

	const history = readJson("lunarisSearchHistory", []);
	const item = {
		address: tab.address,
		title: tab.title,
		icon: tab.icon,
		visitedAt: new Date().toISOString(),
	};
	const filtered = history.filter((entry) => entry.address !== item.address);
	localStorage.setItem("lunarisSearchHistory", JSON.stringify([item, ...filtered].slice(0, 75)));
}

function toggleMenu(event) {
	event.stopPropagation();
	browserMenu.hidden = !browserMenu.hidden;
	menuButton.setAttribute("aria-expanded", String(!browserMenu.hidden));
	if (!browserMenu.hidden) renderMenu();
}

function closeMenu() {
	browserMenu.hidden = true;
	menuButton.setAttribute("aria-expanded", "false");
}

function handleMenuClick(event) {
	const actionButton = event.target.closest("[data-menu-action]");
	const item = event.target.closest("[data-address]");

	if (actionButton?.dataset.menuAction === "settings") {
		closeMenu();
		navigateActive("lunaris://settings");
		return;
	}

	if (actionButton?.dataset.menuAction === "tools") {
		closeMenu();
		navigateActive("lunaris://tools");
		return;
	}

	if (actionButton?.dataset.menuAction === "eruda") {
		closeMenu();
		injectEruda();
		return;
	}

	if (item) {
		closeMenu();
		navigateActive(item.dataset.address);
	}
}

function renderMenu() {
	renderMenuList(bookmarkList, readJson("lunarisBookmarks", []), "No bookmarks yet");
	renderMenuList(historyList, readSearchHistory(), "No history yet");
	refreshIcons();
}

function readSearchHistory() {
	const history = readJson("lunarisSearchHistory", []);
	const filtered = history.filter((entry) => !String(entry.address || "").startsWith("lunaris://"));
	if (filtered.length !== history.length) {
		localStorage.setItem("lunarisSearchHistory", JSON.stringify(filtered));
	}
	return filtered;
}

function renderMenuList(container, items, emptyText) {
	container.innerHTML = "";

	if (!items.length) {
		const empty = document.createElement("div");
		empty.className = "menu-empty";
		empty.textContent = emptyText;
		container.appendChild(empty);
		return;
	}

	items.forEach((item) => {
		const button = document.createElement("button");
		button.type = "button";
		button.className = "menu-item";
		button.dataset.address = item.address;
		button.title = item.address;
		button.innerHTML = `<i data-lucide="${item.icon || "globe"}"></i><span>${escapeHtml(item.title || item.address)}</span>`;
		container.appendChild(button);
	});
}

function clearSearchHistory(event) {
	event.stopPropagation();
	localStorage.removeItem("lunarisSearchHistory");
	renderMenu();
}

function fullscreenActiveFrame() {
	const tab = getActiveTab();
	const frame = tab?.type === "internal" ? tab.frame : tab?.scramFrame?.frame;
	if (!frame) return;

	if (document.fullscreenElement) {
		document.exitFullscreen();
		return;
	}

	frame.requestFullscreen?.();
}

function injectEruda() {
	const tab = getActiveTab();
	if (!tab?.scramFrame?.frame) {
		error.textContent = "Load a Scramjet website before opening Eruda DevTools.";
		return;
	}

	try {
		const frameDocument = tab.scramFrame.frame.contentDocument;
		if (!frameDocument) throw new Error("The active frame is not ready.");
		if (frameDocument.getElementById("lunaris-eruda")) {
			tab.scramFrame.frame.contentWindow.eruda?.show?.();
			return;
		}

		const script = frameDocument.createElement("script");
		script.id = "lunaris-eruda";
		script.src = "https://cdn.jsdelivr.net/npm/eruda";
		script.onload = () => tab.scramFrame.frame.contentWindow.eruda?.init?.();
		frameDocument.documentElement.appendChild(script);
	} catch (err) {
		error.textContent = "Eruda can only be injected after a Scramjet page is loaded.";
		errorCode.textContent = err.toString();
	}
}

function applyCloak() {
	const cloak = cloakPresets[localStorage.getItem("lunarisCloak") || "none"] || cloakPresets.none;
	const favicon = document.querySelector("link[rel='shortcut icon']") || document.createElement("link");
	favicon.rel = "shortcut icon";
	favicon.href = cloak.icon || "favicon.ico";
	document.head.appendChild(favicon);
}

function applyTheme() {
	const theme = localStorage.getItem("lunarisTheme") || "default";
	document.body.dataset.theme = theme === "default" ? "" : theme;
}

function currentDocumentTitle() {
	const cloak = cloakPresets[localStorage.getItem("lunarisCloak") || "none"] || cloakPresets.none;
	return cloak.title || "Lunaris";
}

function launchAboutBlankIfNeeded() {
	if (localStorage.getItem("lunarisAutoAboutBlank") !== "true") return;
	if (window.top !== window.self || sessionStorage.getItem("lunarisAboutBlankLaunched") === "true") return;

	const blank = window.open("about:blank", "_blank");
	if (!blank) return;

	sessionStorage.setItem("lunarisAboutBlankLaunched", "true");
	const escapedUrl = location.href.replace(/"/g, "&quot;");
	blank.document.write(`
		<!doctype html>
		<title>${escapeHtml(currentDocumentTitle("Lunaris"))}</title>
		<style>html,body,iframe{width:100%;height:100%;margin:0;border:0;overflow:hidden;background:#111}</style>
		<iframe src="${escapedUrl}"></iframe>
	`);
	blank.document.close();
}

function readJson(key, fallback) {
	try {
		return JSON.parse(localStorage.getItem(key)) || fallback;
	} catch (err) {
		return fallback;
	}
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

function showProxyLoader(target) {
	loaderStartedAt = performance.now();
	loaderTarget.textContent = target ? "Lunaris is searching for your course.. (sorry for slop loading)" : "Preparing..";
	proxyLoader.hidden = false;
	clearTimeout(loaderTimer);
	loaderTimer = setTimeout(hideProxyLoader, 12000);
}

function queueProxyLoaderHide() {
	const elapsed = performance.now() - loaderStartedAt;
	const remaining = Math.max(1500 - elapsed, 0);
	clearTimeout(loaderTimer);
	loaderTimer = setTimeout(hideProxyLoader, remaining);
}

function hideProxyLoader() {
	clearTimeout(loaderTimer);
	proxyLoader.hidden = true;
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
