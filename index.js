"use strict";

/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("sj-form");
/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("sj-address");
/**
 * @type {HTMLInputElement}
 */
const searchEngine = document.getElementById("sj-search-engine");
/**
 * @type {HTMLParagraphElement}
 */
const error = document.getElementById("sj-error");
/**
 * @type {HTMLPreElement}
 */
const errorCode = document.getElementById("sj-error-code");

const tabsWrapper = document.getElementById("tabs-wrapper");
const tabAddBtn = document.getElementById("tab-add");
const homeForm = document.getElementById("sj-home-form");
const homeAddress = document.getElementById("sj-home-address");
const homeWrapper = document.getElementById("sj-home");

const { ScramjetController } = $scramjetLoadController();
const scramjet = new ScramjetController({
    files: {
        wasm: "/scram/scramjet.wasm.wasm",
        all: "/scram/scramjet.all.js",
        sync: "/scram/scramjet.sync.js",
    },
});
scramjet.init();

const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

let tabs = [];
let activeTabId = null;
let nextTabId = 0;
let ready = false;

async function init() {
    try {
        await registerSW();
    } catch (err) {
        error.textContent = "Failed to register service worker.";
        errorCode.textContent = err.toString();
        return;
    }

    const wispUrl = localStorage.getItem("wispUrl");
    await connection.setTransport("/libcurl/index.mjs", [
        { websocket: wispUrl },
    ]);

    ready = true;
}

init();

function showHomeScreen() {
    tabs.forEach(t => t.frameEl.style.display = "none");
    homeWrapper.style.display = "flex";
    homeAddress.value = "";
}

function setActiveTab(id) {
    tabs.forEach(t => {
        const isActive = t.id === id;
        t.frameEl.style.display = isActive ? "block" : "none";
        t.tabEl.classList.toggle("tab-active", isActive);
    });
    activeTabId = id;
    const tab = tabs.find(t => t.id === id);
    if (tab && !tab.url) {
        showHomeScreen();
    } else if (tab) {
        homeWrapper.style.display = "none";
        address.value = tab.url;
    }
}

function closeTab(id) {
    const idx = tabs.findIndex(t => t.id === id);
    if (idx === -1) return;
    const tab = tabs[idx];
    tab.frameEl.remove();
    tab.tabEl.remove();
    tabs.splice(idx, 1);
    if (activeTabId === id) {
        if (tabs.length > 0) {
            setActiveTab(tabs[Math.min(idx, tabs.length - 1)].id);
        } else {
            activeTabId = null;
            createTab();
        }
    }
}

function createTab(url = null) {
    const id = nextTabId++;

    const frameEl = document.createElement("iframe");
    frameEl.id = `sj-frame-${id}`;
    frameEl.style.cssText = `
        border: none; position: absolute;
        bottom: 0; left: 0;
        width: 100vw; height: 90vh;
        background-color: #111; z-index: 1; display: none;
    `;
    document.body.appendChild(frameEl);

    const tabEl = document.createElement("div");
    tabEl.className = "tabs";
    tabEl.innerHTML = `<span class="tab-title">New Tab</span><span class="tab-close">×</span>`;
    tabEl.querySelector(".tab-title").addEventListener("click", () => setActiveTab(id));
    tabEl.querySelector(".tab-close").addEventListener("click", (e) => {
        e.stopPropagation();
        closeTab(id);
    });
    tabsWrapper.insertBefore(tabEl, tabAddBtn);

    const tab = { id, frameEl, tabEl, url: null };
    tabs.push(tab);
    setActiveTab(id);

    if (url !== null) {
        address.value = url;
        form.dispatchEvent(new Event("submit"));
    }

    return tab;
}

homeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    address.value = homeAddress.value;
    form.dispatchEvent(new Event("submit"));
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!ready) return;

    if (activeTabId === null) createTab();
    const tab = tabs.find(t => t.id === activeTabId);

    const url = search(address.value, searchEngine.value);
    tab.url = url;

    homeWrapper.style.display = "none";

    const frame = scramjet.createFrame(tab.frameEl);
    tab.frameEl.style.display = "block";
    frame.go(url);

    tab.frameEl.addEventListener("load", () => {
        try {
            const title = tab.frameEl.contentDocument?.title;
            if (title) tab.tabEl.querySelector(".tab-title").textContent = title;
        } catch (_) {}
        if (activeTabId === tab.id) address.value = tab.url;
    }, { once: true });
});

tabAddBtn.addEventListener("click", () => createTab());

window.addEventListener("message", (e) => {
    if (e.data?.type !== "internal-navigate") return;
    const href = e.data.href;
    const label = href.replace(".html", "").replace("/", "") || "home";

    if (href === "/") {
        const tab = tabs.find(t => t.id === activeTabId);
        if (tab) {
            tab.url = null;
            tab.tabEl.querySelector(".tab-title").textContent = "New Tab";
            tab.frameEl.style.display = "none";
            tab.frameEl.src = "";
        }
        showHomeScreen();
        return;
    }

    if (activeTabId === null) createTab();
    const tab = tabs.find(t => t.id === activeTabId);
    tab.url = href;
    tab.tabEl.querySelector(".tab-title").textContent = label;
    tab.frameEl.src = href;
    tab.frameEl.style.display = "block";

    homeWrapper.style.display = "none";
    address.value = href;
});

createTab();