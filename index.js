"use strict";

const tabsEl = document.getElementById("tabs");
const newTabButton = document.getElementById("new-tab");
const addressForm = document.getElementById("address-form");
const topAddress = document.getElementById("top-address");
const homeForm = document.getElementById("home-form");
const homeAddress = document.getElementById("sj-address");
const subtitle = document.querySelector(".subtitle");
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
const loadingBar = document.getElementById("loading-bar");
const loaderTarget = document.getElementById("loader-target");

// Use the default wisp from wisps.js if available, otherwise fallback to a placeholder
const DEFAULT_WISP_URL = typeof __WISPS !== "undefined" && __WISPS.length > 0 ? __WISPS[0].url : "wss://fallback.wisp.com/wisp/";

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
	"lunaris://e2e": { title: "E2E", path: "tools/e2e.html", icon: "workflow", documentTitle: "Lunaris: E2E" },
	"lunaris://webretro": { title: "WebRetro", path: "tools/webretro.html", icon: "gamepad", documentTitle: "Lunaris: WebRetro" },
	"lunaris://wificracker": { title: "WiFi Cracker", path: "tools/wifi-password-extractor.html", icon: "wifi", documentTitle: "Lunaris: WiFi Cracker" },
};

const quotes = [
	"Andrew Hu, I know you're trying to ragebait us with dates.",
	  "Yo yo yo - drdonutt",
	  "don't ever give up - a wise guy",
	  "If you see a scammer scamming, go and scam the scammer with their own scammer technique",
      "Learning is a treasure that will follow its owner everywhere.",
      "coded by the skids, for the skids",
      "Classroom.lol but it's actually good",
      "This is what you call.. a vibecoded site.",
      "Teachers hate this one simple trick to get free games",
      "I type all ts on ARCH BTW",
      "trust me bro.. it's not a virus.💀",
      "ctrl+s your life bro",
      "this site runs on hopes and bad javascript",
      "99% of coding is googling",
      "Curiosity is the wick in the candle of learning.",
	  "Knowledge speaks, but wisdom listens.",
	  "coded by the skids, for the skids", 
	  "Why Unenroll when you have this?",
	  "Classroom.lol but it's actually good",
	  "This is what you call.. a vibecoded site.",
	  "Vibecoded by Claude",
	  "This site is so good, even MOJANG is jealous",
	  "This site is so good, even the IRS is jealous",
	  "The FBI is definitely not watching you use this, nope.",
	  "This site is so good, even NASA is jealous",
	  "Jeffrey Epstein definitely did not use this site, no way.",
	  "This site is so good, even Elon Musk is jealous",
	  "Bro github copilot the quotes that u are making are so cringe [ROFL emoji]",
	  "Parrotx2 approved!",
	  "Finally beat soulmaster [pray emoji]",
	  "Daddy hu!!",
	  "daddy au is my daddy",
	  "fuck you, im not adding shell shockers [rofl emoji]",
	  "nothing.",
	  "This site is so good, even Andrew Hu is jealous",
	  "Teachers hate this one simple trick to get free games and tools on school chromebooks",
	  "This site is so good, even the SEC is jealous",
	  "This site is so good, even the WHO is jealous",
	  "This site is so good, even the CDC is jealous",
	  "This site is so good, even the UN is jealous",
	  "This site is so good, even the World Bank is jealous",
	  "This site is so good, even the IMF is jealous",
	  "This site is so good, even the US Government is jealous",
	  // github copilot ahh comments above ^
	  "Dont remove MENDING.. MOJANG PLS",
	  "I type all ts on ARCH BTW",
	  "Hndrew Au could never..",
	  "The IRS CANNOT TOUCH ME!!",
	  "67.world for more!",
	  "Andewwww huuuu is . gay!!!",
	  "teachers hate ts", 
	  "what's Nasa-dude doing, idk prob hacking on mc",
	  "effry jepstien",
	  "Have you ever played blox fruits with your life on line? while having A BUNCH of mangoes in your mouth? heh... well… this is called DARK MANGO PSYCHOLOGY 💀. Now in dark mango psychology you realize.. they arent just normal mangoes, they are DARK!",
	  "and hu, and hu, andu you",
	  "RHYMES WITH GRUG",
	  "67",
	  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
	  "get scammedddddd!!!",
	  "If you paid money for this u got scammed, edulearn and all of its services are FREE!!",
	  "UGS FILES VERY SOON!!",
	  "Frogiee1 please please please partner with us 🙏",
	  "MOTD: LOGI",
	  "Most Underrated shit ever",
	  "D- Daddy?",
	  "https://the-demonz.github.io (MOST VIBECODED SHIT EVER)",
	  "Arorua aRorua arOrua aroRua arorUa aroruA",
	  "UwU :333",
	  "Nonchalanttttt :D",
	  "Mrbeast Scam [Insert fire emoji]",
	  "pickle pickle pickle",
	  "alvin the walnut",
	  "Hello wsg mr mail",
	  "Fastify it, act smooth, make a discord bot, and caddy!",
	  "dont do frugs",
	  "That's racially motivated..",
	  "Interesting site u got there..",
	  "This is what you call.. Diddable material.",
	  "ADS ARE NOT MY FAULT (F*CK YOU BREADBB)",
	  "Shock my shells",
	  "mrbeast > mrbeast???",
	  "How many have you counted so far?",
	  "eat this!",
	  "woahh, thats a lot of quotes!",
	  "1167 effrey jepstein drive",
	  "your mom.. j20",
	  "furry femboy catgirl pls ride me uwu - my pronouns (ah)",
	  "Imagine using this when you literally told everyone it SUCKS HAHAHAHA",
	  "https://betadispensertest.vercel.app",
	  "https://chessisfornerds.netlify.app",
	  "Dylanmc math vibes",
	  "luminal LIGHTSPEED BYPASSES!!!",
	  "SOAP PHIAAAA MY GOATTTT",
	  "Keep Onn.. 20gb usb contains massive movie files.. I wonder who it belongs to..",
	  "Redragon gaming mouse, kawaii pack :3",
	  "Earthquakes? Must be daddy ash again :333",
	  "thefakesydney is BACKKKKKKKKKKKKK!!! 676767",
	  "When I was 1 year old.. I thought of edulearn",
	  "When faced when hndrew au, take him out - sun tzu",
	  "I see chungus. I slime him out - wise guy",
	  "Szvy I'm sorry you got doxxed..",
	  "Wsg therealfour",
	  "https://femboy.world :3",
	  "SLIME HIM OUT GUYSSS",
	  "20% ai slop",
	  "VIBE CODEEERR SUPREMEEEE",
	  "Wait... I don't have the VIBE CODER SUPREME ROLE?? YESSS!!!!!",
	  "Why do you vibecode? - A gong bell that I could ring",
	  "ring me daddy",
	  "This video is sponsored by Genshin Impact-",
	  "Oh fuhh naww",
	  "skibidi.men for more!",
	  "Every 5 year old has a story behind them!",
	  "unblocked and unlocked", 
	  "running on pure caffeine", 
	  "if you're reading this, do your homework",
	  "no admins allowed", 
	  ":333333333",
	  "Femboys 3DDDDDD",
	  "You are NEVER finding out what PROXIES are.. hahaha - Matthew guy whos black",
	  "Why tf do u have so many apps on a cb - Conall Sadako",
	  "It's.. soo.. cold - guy",
	  "4167💀💀",
	  "trust me bro.. it's not a virus.💀",
	  "Bro thinks this is a virus 💀",
	  "oh nah bro 💀💀💀💀💀💀 ",
	  "Skull emoji virus 💀",
	  "Skull emojis have hit this sector unfortunately..💀💀💀💀💀💀",
	  "I'm not taken over by the skull virus.. yet 💀💀",
	  "We are still safe-💀",
	  "Oops i js closed a tab💀💀",
	  "Montagem NO ONE CARES",
	  "💀💀💀💀💀💀💀💀💀💀💀💀💀💀💀💀 back from 42",
	  "Control + Shift + T to reopen a tab",
	  "Github copilot being suchhh a goooood boy..",
	  "fcking NI-",
	  "security through obscurity", 
	  "ctrl + w to win instantly", 
	  "made with <3 and spaghetti code", 
	  "Set this up in alt tab to quickly escape",
	  "decode this: aHR0cHM6Ly9hbmRyZXdodWlzLmdheQ==", 
	  "If you don't use this, go-",
	  "I'm sorry j20, I can't fix the hk bugs (That's breadbb [aka genizy's] fault.)",
	  "need more blahaj", 
	  "typing this while going to class lol",
	  "How are you playing Hollow Knight at school bro?", 
	  "originally just a webview kajig", 
	  "frogiesarcade vibes", 
	  "This is where the fun begins! - Obi Wan Kenobi",
	  "vibecoded but it WORKS!", 
	  "Monkey find computer. Monkey type.", 
	  "goguardian is trash", 
	  "lightsped sytems", 
	  "go get the milk - therealfour, milk lover 67", 
	  "No matter how much it feels like it, I'm not gay I swear! - A random", 
	  "Wait.. I can have MULTIPLE TABS?!? HOLY SHI*", 
	  "If you use this and I know you're a skid, screw you lmfao",
	  "you're dumb", 
	  "I'm depressed typing this", 
	  "dont cry.. just.. cry", 
	  "gaming freedom!", 
	  "Go back of this ripoff by AH (https://bebby.w3spaces.com) [vibecoded by claude ofc] HAHAHAHAA [insert wemmbu laugh]",
	  "yall ready to play TS ALL DAY!?", 
	  "MF did not js say [It's down for maintainance]",
	  "Fun fact: This doesn't break your fast for Ramadan! :O",
	  "The ogs know of classroom.lol", 
	  "tyrone's stupid games", 
	  "I have securly for breakfast, gogaurdian for lunch, and lightsped for dinner", 
	  "educational.sbs", 
	  "I'm jobless fr", 
	  "Jobless for using AI? Really?",
	  "THIS SITE IS NOT FOR DEGENERATES. GO AWAY!!", 
	  "I should ring Alvin's gong - wise guy", 
	  "If you want to humiliate your enemies, do it in a way that doesn't waste your own time. Use AI - Sun Zu",
	  "albie was here", 
	  "UNBLOCKED GAMES IN DA BIG 26!", 
	  "If you made it this far, join the discord!", 
	  "skids being skids", 
	  "Dont slime me out..daddy",
	  "your a skid buddy", 
	  "toggle off particles for better performance", 
	  "I'll steal your code hahaha - J20", 
	  "Hella sick while typing this", 
	  "bro wtf - guy", 
	  "wow these are so old messages",
	  "There are some funny easter eggs!",
	  "Look for some!",
	  "1527 asterbell drive",
	  "I-put-a-random-quote-in-the-code-to-make-it-look-cool",
	  "Some of these quotes are real, and some maybe did not happen ;)",
	  "MANGO MANGO MANGO",
	  "tung tung sahur",
	  "I use arch btw",
	  "Tf you mean it sucks?",
	  "We beat bebby.w3spaces.com!!!",
	  "last message so far.. consider yourself lucky.",
	  "I bet you're here for the geo grind.",
	  "Hollow knight in the big 2026?",
	  "most recent update: Stuff to make Andrew Hu jealous 3/29/2026",
	  "the wifi knows what you did last night",
	  "this tab knows too much",
	  "if this loads your wifi is valid",
	  "404 motivation not found",
	  "someone somewhere is procrastinating harder than you",
	  "your teacher probably uses this site too",
	  "this page is watching you scroll",
	  "if you see this you owe me 5 dollars",
	  "every refresh creates a new timeline",
	  "your future self is judging this tab",
	  "ctrl+s your life bro",
	  "why tf this many quotes?",
	  "this site runs on hopes and bad javascript",
	  "another day another tab",
	  "if it works don't touch it",
	  "half the internet is duct tape and dreams",
	  "99% of coding is googling",
	  "the other 1% is suffering",
	  "your ram is crying right now",
	  "every bug has a developer somewhere crying",
	  "the server hamster is tired",
	  "please stop opening 400 tabs",
	  "this site runs on a potato",
	  "if this breaks pretend it didn't",
	  "congratulations you found another quote",
	  "somewhere someone is counting these",
	  "how long have you been scrolling",
	  "bro go drink water",
	  "touch grass challenge: impossible",
	  "achievement unlocked: reading random quotes",
	  "this message will self destruct eventually",
	  "the internet never forgets",
	  "except when the cache clears",
	  "history will remember this tab",
	  "or maybe not",
	  "loading existential crisis...",
	  "life is just a series of loading screens",
	  "respawning in 3... 2... 1...",
	  "main character energy",
	  "side quest detected",
	  "you have discovered a useless quote",
	  "the dev definitely forgot this existed",
	  "this line of text traveled thousands of miles to reach you",
	  "meanwhile you are still procrastinating",
	  "if you read this you are legally cool",
	  "your cpu approves",
	  "your gpu disagrees",
	  "your battery fears you",
	  "low battery anxiety moment",
	  "the scroll never ends",
	  "there are always more quotes",
	  "infinite quotes glitch",
	  "someone add a quote counter",
	  "someone else will fix the bugs",
	  "future me problem",
	  "ship it and pray",
	  "works on my machine",
	  "the code compiles so it's fine",
	  "do not question the code",
	  "the code questions you",
	  "if it breaks blame the intern",
	  "there is no intern",
	  "the intern is you",
	  "congrats you're hired",
	  "your salary is 0 dollars",
	  "paid in experience",
	  "experience not included",
	  "this message was typed at 3am",
	  "sleep is optional",
	  "debugging is just detective work",
	  "except the detective is stupid",
	  "every line of code is a gamble",
	  "we gambling with the production server",
	  "please dont ddos the quote generator",
	  "or do idk",
	  "this is definitely production code",
	  "totally not spaghetti",
	  "100% professional engineering",
	  "trust me bro it works",
	  "never test in production",
	  "unless you do",
	  "this quote generator has lore",
	  "someone write the lore",
	  "the lore is lost",
	  "the lore never existed",
	  "the lore is just vibes",
	  "vibes based development",
	  "powered by vibes",
	  "vibes > documentation",
	  "documentation coming soon",
	  "soon since 2022",
	  "still soon",
	  "maybe tomorrow",
	  "definitely tomorrow",
	  "ok maybe next update",
	  "update coming soon™",
	  "soon™",
	  "tm symbol intensifies",
	  "the scroll continues",
	  "you are still reading",
	  "why are you still reading",
	  "go do homework bro",
	  "seriously",
	  "close the tab",
	  "no actually close it",
	  "ok one more quote",
	  "just one more",
	  "this is the last one",
	  "just kidding",
	  "there are more",
	  "infinite scrolling technology",
	  "this quote escaped containment",
	  "if found return to developer",
	  "developer missing since last commit",
	  "last commit: 3am",
	  "commit message: fixed stuff",
	  "nothing was fixed",
	  "the bug is now a feature",
	  "feature not documented",
	  "users discovered it anyway",
	  "accidental innovation",
	  "this is peak engineering",
	  "this quote does nothing",
	  "but it looks cool",
	  "style over substance",
	  "but mostly chaos",
	  "chaos driven development",
	  "we vibecoding today",
	  "we vibecoding tomorrow",
	  "we vibecoding forever",
	  "vibecode never dies",
	  "the vibe is strong",
	  "the vibe is unstable",
	  "vibes detected",
	  "maximum vibes reached",
	  "vibe overload",
	  "too many vibes",
	  "calm the vibes",
	  "ok vibes restored",
	  "system stable",
	  "system unstable",
	  "system vibing",
	  "system confused",
	  "system thinking",
	  "system procrastinating",
	  "system scrolling",
	  "system reading quotes",
	  "system still reading quotes",
	  "bro seriously go do homework",
	  "this message is a distraction",
	  "and it worked",
	  "congrats",
	  "achievement unlocked: procrastination",
	  "new speedrun category: quote reading",
	  "wr pace",
	  "someone submit this to speedrun.com",
	  "quote percent any%",
	  "quote percent 100%",
	  "imagine reading all of these",
	  "someone probably will",
	  "that someone might be you",
	  "this quote believes in you",
	  "maybe",
	  "probably not",
	  "ok maybe a little",
	  "never give up",
	  "unless the wifi dies",
	  "then it's over",
	  "wifi down bad",
	  "router crying",
	  "packet lost",
	  "lag detected",
	  "ping 999",
	  "skill issue",
	  "massive skill issue",
	  "internet skill issue",
	  "coding skill issue",
	  "quote writing skill issue",
	  "ok that one was rude",
	  "sorry about that",
	  "anyways",
	  "Last updated: 4/07/2026",
	  "back to quotes",
	  "the quotes never end",
	  "this might be the last one",
	  "or maybe not",
	  "ok now it's the last one",
	  "final quote maybe",
	  "sad milk uses this!",
	  "this time fr",
	  "no more quotes after this",
	  "unless someone adds more",
	  "they probably will",
	  "and the cycle continues",
	"Wa Wa Wa Wa",
	"The sky is not the limit, it's just the view.",
	"Advanced calculus for high school and above.",
	"Browse the web freely.",
	"Education is the most powerful weapon.",
	"Explore the cosmos of information.",
	"Your gateway to the unblocked web.",
	"Privacy is a human right.",
	"Stay curious, stay free.",
];

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
	// If no saved URL or it's an old default, set to the new default from wisps.js
	if (!savedWispUrl) {
		localStorage.setItem("wispUrl", DEFAULT_WISP_URL);
	}

	const transport = localStorage.getItem("transport");
	if (transport !== "libcurl" && transport !== "epoxy") {
		localStorage.setItem("transport", "epoxy");
	}

	const savedSearchEngine = localStorage.getItem("lunarisSearchEngine");
	if (savedSearchEngine) {
		searchEngine.value = savedSearchEngine;
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
	setRandomQuote();
	launchAboutBlankIfNeeded();
	addTab("lunaris://home");
	wireEvents();
	refreshIcons();
}

function setRandomQuote() {
	if (!subtitle) return;
	const quote = quotes[Math.floor(Math.random() * quotes.length)];
	subtitle.textContent = quote;
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
	setRandomQuote();
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
		if (prefix === "lunaris://home") setRandomQuote();
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
	tab.address = url;
	tab.title = titleFromInput(url);
	tab.icon = "globe";
	document.title = currentDocumentTitle();
	topAddress.value = url;
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
		tab.scramFrame.frame.addEventListener("load", () => {
			queueProxyLoaderHide();
			try {
				const frameDocument = tab.scramFrame.frame.contentDocument;
				if (frameDocument && frameDocument.title && frameDocument.title !== "Lunaris") {
					tab.title = frameDocument.title;
					renderTabs();
					saveSearchHistory(tab);
				}
			} catch (err) {
				// Cross-origin fallback
			}
		});
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

	if (transportType !== "libcurl" && transportType !== "epoxy") {
		transportType = "epoxy";
		localStorage.setItem("transport", transportType);
	}

	const transportPath = transportType === "epoxy" ? "/epoxy/index.mjs" : "/libcurl/index.mjs";
	const transportConfig = transportType === "epoxy" ? [{ wisp: wispUrl }] : [{ websocket: wispUrl }];

	if ((await connection.getTransport()) !== transportPath || localStorage.getItem("lunarisLastWisp") !== wispUrl) {
		await connection.setTransport(transportPath, transportConfig);
		localStorage.setItem("lunarisLastWisp", wispUrl);
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

	if (document.activeElement !== topAddress) {
		topAddress.value = tab.address;
	}
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
		<html>
		<head>
			<title>${currentDocumentTitle()}</title>
			<style>html,body,iframe{width:100%;height:100%;margin:0;border:0;overflow:hidden;background:#111}</style>
		</head>
		<body>
			<iframe src="${escapedUrl}"></iframe>
		</body>
		</html>
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
		const url = new URL(input);
		const searchParams = url.searchParams;
		if (searchParams.has("q")) {
			return `Search: ${searchParams.get("q")}`;
		}
		return url.hostname.replace(/^www\./, "") || "Search";
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
	if (loadingBar) {
		loadingBar.classList.add("active");
		loadingBar.style.width = "0%";
		setTimeout(() => {
			if (loadingBar.classList.contains("active")) {
				loadingBar.style.width = "30%";
			}
		}, 10);
		setTimeout(() => {
			if (loadingBar.classList.contains("active")) {
				loadingBar.style.width = "60%";
			}
		}, 400);
		setTimeout(() => {
			if (loadingBar.classList.contains("active")) {
				loadingBar.style.width = "85%";
			}
		}, 800);
	}

	loaderTarget.textContent = target ? "Lunaris is searching for your course.. (sorry for slop loading)" : "Preparing..";
	proxyLoader.hidden = false;
	clearTimeout(loaderTimer);
	loaderTimer = setTimeout(hideProxyLoader, 15000);
}

function queueProxyLoaderHide() {
	const elapsed = performance.now() - loaderStartedAt;
	const remaining = Math.max(1000 - elapsed, 0);
	clearTimeout(loaderTimer);
	loaderTimer = setTimeout(hideProxyLoader, remaining);
}

function hideProxyLoader() {
	clearTimeout(loaderTimer);
	if (loadingBar) {
		loadingBar.style.width = "100%";
		setTimeout(() => {
			loadingBar.classList.remove("active");
			setTimeout(() => {
				loadingBar.style.width = "0%";
			}, 300);
		}, 300);
	}
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
