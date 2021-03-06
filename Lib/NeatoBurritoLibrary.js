var NeatoLib = {};

var Metalloriff = NeatoLib;

NeatoLib.version = "0.4.16";

NeatoLib.parseVersion = function(version) {

	let numbers = Array.from(version.split("."), n => parseInt(n)), major = numbers[0], minor = numbers[1], patch = numbers[2];

	return {
		major : major,
		minor : minor,
		patch : patch,
		compareTo : otherVersion => {
			if(patch > otherVersion.patch || minor > otherVersion.minor || major > otherVersion.major) return "newer";
			if(patch < otherVersion.patch || minor < otherVersion.minor || major < otherVersion.major) return "older";
			return "equal";
		}
	};

};

NeatoLib.hasRequiredLibVersion = function(plugin, requiredVersion) {

	if(NeatoLib.parseVersion(NeatoLib.version).compareTo(NeatoLib.parseVersion(requiredVersion)) == "older") {

		if(plugin.ready) plugin.ready = false;

		let updateLibrary = () => {

			let req = require("request"), vm = require("vm");

			setTimeout(() => {

				let libLoadedEvent = () => {
					try{ this.onLibLoaded(); }
					catch(err) { console.error(this.getName(), "fatal error, plugin could not be started!", err); try { this.stop(); } catch(err) { console.error(this.getName() + ".stop()", err); } }
				};
		
				req("https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js", (err, res, data) => {

					let lib = new vm.Script(data, { filename : "NeatoBurritoLibrary.js", displayErrors : true });

					new Promise(exec => exec(lib.runInThisContext())).then(() => {
						NeatoLib.showToast(`[${plugin.getName()}]: Library updated!`, "success");
						setTimeout(() => plugin.start(), 1000);
					});

				});

			}, 500);

		};

		NeatoLib.showToast(`[${plugin.getName()}]: Library update required! Click this notification to update it.`, "error", { timeout : 30000, onClick : updateLibrary, destroyOnClick : true });

		return false;

	}

	return true;

};

NeatoLib.Changelog = {};

NeatoLib.Changelog.compareVersions = function(name, changes) {

	var spacelessName = name.split(" ").join(""),
	updateData = NeatoLib.Data.load("MetalloriffUpdateData", spacelessName, {}),
	unreadChanges = [],
	thisUpdateData = updateData[spacelessName],
	first = false;

	if(thisUpdateData != undefined){

		if(thisUpdateData.readChanges == undefined) thisUpdateData.readChanges = [];

		for(var i in changes){
			
			if(!thisUpdateData.readChanges.includes(i)){

				unreadChanges.push(i);
				thisUpdateData.readChanges.push(i);

			}

		}

	}else{

		updateData[spacelessName] = { readChanges : Object.keys(changes) }; 
		first = true;

	}

	if(unreadChanges.length > 0 || first){ NeatoLib.Changelog.createChangeWindow(name, unreadChanges, changes, updateData); }

};

NeatoLib.Changelog.createChangeWindow = function(name, changes, allChanges, newUpdateData) {

	let changeKeys = Object.keys(allChanges);

	if(changeKeys.length == 0) {
		NeatoLib.showToast("There are no updates notes for this plugin yet!", "error");
		return;
	}

	let spacelessName = name.split(" ").join("");

	if(document.getElementById(spacelessName + "-changelog")) document.getElementById(spacelessName + "-changelog").remove();

	document.getElementsByClassName("app")[0].insertAdjacentHTML("beforeend", `

		<div id="${spacelessName}-changelog">

		<style>

		.metalloriff-update-item {
			padding: 10px;
		}

		.metalloriff-update-label {
			color: white;
			font-size: 35px;
		}
		
		.metalloriff-update-note {
			color: white;
			font-size: 25px;
			opacity: 0.75;
			line-height: 25px;
		}

		.metalloriff-changelog-backdrop {
			opacity: 0.85;
			background-color: black;
			z-index: 1000;
			position: fixed;
			contain: strict;
			bottom: 0;
			left: 0;
			top: 0;
			right: 0;
		}

		.metalloriff-changelog-scroller {
			width: 800px;
			min-height: 800px;
			max-height: 800px;
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			overflow-y: scroll;
			background: #2f3136;
			border-radius: 5px;
			z-index: 10000;
		}

		#${spacelessName}-changelog *::-webkit-scrollbar {
			max-width: 10px;
		}
		
		#${spacelessName}-changelog *::-webkit-scrollbar-track-piece {
			background: transparent;
			border: none;
			border-radius: 5px;
		}
		
		#${spacelessName}-changelog *:hover::-webkit-scrollbar-track-piece {
			background: #2F3136;
			border-radius: 5px;
		}
		
		#${spacelessName}-changelog *::-webkit-scrollbar-thumb {
			background: #1E2124;
			border: none;
			border-radius: 5px;
		}
		
		#${spacelessName}-changelog *::-webkit-scrollbar-button {
			display: none;
		}

		.metalloriff-changelog-label {
			flex: 1 1 auto;
			text-align: center;
			color: white;
			padding-top: 10px;
			font-size: 20px;
		}

		</style>

		<div class="metalloriff-changelog-backdrop"></div>
			<div class="metalloriff-changelog-scroller">
				<div class="metalloriff-changelog-label">
					<h2>${name} Update Notes</h2>
					<br>
				</div>
				<div id="${spacelessName}-changelog-scroller"></div>
			</div>
		</div>

		</div>

	`);

	document.getElementsByClassName("metalloriff-changelog-backdrop")[0].addEventListener("click", () => {
		if(newUpdateData != undefined) NeatoLib.Data.save("MetalloriffUpdateData", spacelessName, newUpdateData);
		document.getElementById(spacelessName + "-changelog").remove();
	});

	let scroller = document.getElementById(spacelessName + "-changelog-scroller");

	if(changes.length == 0) changes = changeKeys;

	for(let i = 0; i < changes.length; i++){
		scroller.insertAdjacentHTML("afterbegin", `
			<div class="metalloriff-update-item">
				<p class="metalloriff-update-label">` + changes[i] + `</p><p class="metalloriff-update-note">`
					+ allChanges[changes[i]].split("\n").join("<br><br>") +
				`</p>
			</div>
		`);
	}

};

NeatoLib.Settings = {};

NeatoLib.Settings.Styles = {};

NeatoLib.Settings.Styles.textField = `color: white; background-color: rgba(0, 0, 0, 0.2); border: none; border-radius: 5px; height: 40px; padding: 10px; width: 100%;`;

NeatoLib.Settings.Elements = {};

NeatoLib.Settings.Elements.pluginNameLabel = function(name) {
	return `
		<style>
			#bd-settingspane-container *::-webkit-scrollbar {
				max-width: 10px;
			}
			
			#bd-settingspane-container *::-webkit-scrollbar-track-piece {
				background: transparent;
				border: none;
				border-radius: 5px;
			}
			
			#bd-settingspane-container *:hover::-webkit-scrollbar-track-piece {
				background: #2F3136;
				border-radius: 5px;
			}
			
			#bd-settingspane-container *::-webkit-scrollbar-thumb {
				background: #1E2124;
				border: none;
				border-radius: 5px;
			}
			
			#bd-settingspane-container *::-webkit-scrollbar-button {
				display: none;
			}
		</style>
		<h style="color: white;font-size: 30px;font-weight: bold;">${name.replace(/([A-Z])/g, ' $1').trim()} by Metalloriff</h>`;
}

NeatoLib.Settings.Elements.createRadioGroup = function(id, label, choices, selectedChoice, callback, description = "") {

	let element = document.createElement("div");

	element.style.paddingTop = "20px";

	element.innerHTML = `
	<h5 style="color:white;padding-bottom:10px;">${label}</h5>
	<h5 style="Color:white;padding-bottom:10px;opacity:0.5;">${description}<h5>
	<div id="${id}" style="color:white;"></div>`;

	for(let i = 0; i < choices.length; i++) {

		if(choices[i].description == undefined) choices[i].description = "";

		let choiceButton = document.createElement("div");

		choiceButton.setAttribute("id", `${id}-${i}`);
		choiceButton.setAttribute("data-value", choices[i].value);
		choiceButton.setAttribute("data-index", i);
		choiceButton.setAttribute("class", "metalloriff-checkbox-item");
		choiceButton.setAttribute("style", `padding:10px;border-radius:5px !important;background-color:rgba(0, 0, 0, 0.3);cursor:pointer;position:relative;margin-bottom:10px;display:flex;`);

		choiceButton.innerHTML = 
		`<label>
			<div style="width:24px;height:24px;border:3px solid white;border-radius:100%;"></div>
		</label>
		<div style="margin: 0 8px;color:white;">
			<div style="display:inline;padding-right:10px;line-height:24px;">${choices[i].title}</div>
			<div style="display:inline;line-height:24px;opacity:0.5;">${choices[i].description}</div>
		</div>`;

		element.insertAdjacentElement("beforeend", choiceButton);

		if(selectedChoice != undefined && choices[i].value == selectedChoice) choiceButton.querySelector(`label > div`).style.backgroundColor = "white";

		choiceButton.addEventListener("click", e => {

			let i = e.currentTarget.getAttribute("data-index");

			let checkboxes = e.currentTarget.parentElement.querySelectorAll(`.metalloriff-checkbox-item > label > div`);

			for(let ii = 0; ii < checkboxes.length; ii++) checkboxes[ii].style.backgroundColor = "";

			element.querySelector(`#${id}-${i} > label > div`).style.backgroundColor = "white";

			callback(choiceButton, choices[i]);

		});

	}

	return element;

};

NeatoLib.Settings.Elements.createToggleGroup = function(id, label, choices, callback, description = "") {

	let element = document.createElement("div");

	element.style.paddingTop = "10px";

	element.insertAdjacentHTML("beforeend", `
		<h5 style="color:white;padding-bottom:5px;">${label}</h5>
		<h5 style="Color:white;padding-bottom:5px;opacity:0.5;">${description}<h5>
		<div id="${id}" style="color:white;"></div>
	`);

	for(let i = 0; i < choices.length; i++) {

		let choiceButton = NeatoLib.Settings.Elements.createToggleSwitch(choices[i].title, choices[i].setValue, e => {
			callback(choices[i], e);
		});

		choiceButton.setAttribute("id", `${id}-${i}`);
		choiceButton.setAttribute("data-value", choices[i].value);
		choiceButton.setAttribute("data-index", i);

		element.insertAdjacentElement("beforeend", choiceButton);

	}

	return element;

};

NeatoLib.Settings.Elements.createTextField = function(label, type, value, callback, options = {}) {

	let element = document.createElement("div");

	element.style.paddingTop = options.spacing || "20px";

	element.insertAdjacentHTML("beforeend", `
		<p style="color:white;font-size:20px;">${label}</p>
		<input value="${value}" type="${type}" class="inputDefault-_djjkz input-cIJ7To size16-14cGz5">
	`);

	if(options.tooltip) NeatoLib.Tooltip.attach(options.tooltip, element, { side : "left" });

	element.querySelector("input").addEventListener(options.callbackType || "focusout", e => callback(e));

	return element;

};

NeatoLib.Settings.Elements.createNewTextField = function(label, value, callback, options = {}) {

	let element = document.createElement("div");

	element.style.paddingTop = options.spacing || "20px";

	element.insertAdjacentHTML("beforeend", `
		<style>
			.neato-text-field-p {
				color: white;
				font-size: 20px;
			}
		</style>
		<p class="neato-text-field-p">${label}</p>
		<p class="neato-text-field-p" style="opacity:0.5;font-size:17px;">${options.description || ""}</p>
		<input value="${value}" type="${options.type || "text"}" style="${NeatoLib.Settings.Styles.textField}">
	`);

	element.querySelector("input").addEventListener(options.callbackType || "focusout", e => callback(e));

	return element;

};

NeatoLib.Settings.Elements.createHint = function(text, options = {}) {

	let element = document.createElement("p");

	element.style.color = options.color || "white";
	element.style.fontSize = options.fontSize || "17px";

	element.innerText = text;

	return element;

};

NeatoLib.Settings.Elements.createButton = function(label, callback, style = "", attributes = {}) {
	
	let element = document.createElement("button");

	element.setAttribute("style", `display:inline-block;${style}`);
	element.setAttribute("class", "button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN");

	for(let key in attributes) element.setAttribute(key, attributes[key]);

	element.innerText = label;

	element.addEventListener("click", e => callback(e));
	
	return element;

};

NeatoLib.Settings.Elements.createToggleSwitch = function(label, value, callback, spacing = "20px") {

	var element = document.createElement("div");

	element.style.paddingTop = spacing;

	element.innerHTML = 
	`<div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStart-H-X2h- noWrap-3jynv6" style="flex: 1 1 auto;">
		<h3 class="titleDefault-a8-ZSr title-31JmR4 marginReset-236NPn weightMedium-2iZe9B size16-14cGz5 height24-3XzeJx flexChild-faoVW3" style="flex: 1 1 auto;">${label}</h3>
		<div class="flexChild-faoVW3 switchEnabled-V2WDBB switch-3wwwcV ${value == true ? "valueChecked-m-4IJZ" : "valueUnchecked-2lU_20"} value-2hFrkk sizeDefault-2YlOZr size-3rFEHg themeDefault-24hCdX" style="flex: 0 0 auto;">
			<input class="checkboxEnabled-CtinEn checkbox-2tyjJg" type="checkbox">
		</div>
	</div>`;

	element.querySelector("input").addEventListener("click", e => {

		var b = e.currentTarget.parentElement;

		if(b.classList.contains("valueChecked-m-4IJZ")) {
			b.classList.add("valueUnchecked-2lU_20");
			b.classList.remove("valueChecked-m-4IJZ");
		} else {
			b.classList.add("valueChecked-m-4IJZ");
			b.classList.remove("valueUnchecked-2lU_20");
		}

		callback(e);

	});

	return element;

};

NeatoLib.Settings.Elements.createLabel = function(title, spacing = "20px", style = "") {

	return `<div style="color:white;margin: ${spacing} 0px;${style}">${title}</div>`;

};

NeatoLib.Settings.Elements.createGroup = function(title, options = {}) {

	let element = document.createElement("div");

	element.setAttribute("style", `color:white;margin:${options.spacing || "20px"};${options.style || ""}`);

	element.insertAdjacentHTML("beforeend", `<div style="margin: ${options.spacing || "20px"} 0px;">${title}</div><div></div>`);

	return element;

};

NeatoLib.Settings.Elements.createKeybindInput = function(title, value, callback, options = {}) {

	let element = document.createElement("div"), v = value.primaryKey || "", oldValue = value;

	if(value.modifiers && value.modifiers[0]) v = (value.modifiers.join(" + ") || "") + " + " + (value.primaryKey || "");

	if(options.global) v = value;

	element.insertAdjacentHTML("beforeend", `
		<style>
			#app-mount .card-FDVird.active-nvdKfC:before, .card-FDVird:before {
				opacity: 0.5 !important;
			}
		</style>
		<div class="row-2okwlC">
			<div class="flex-1xMQg5 flex-1O1GKY vertical-V37hAW flex-1O1GKY directionColumn-35P_nr justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 keybindGroup-JQs9x_ card-FDVird" style="flex: 1 1 auto; margin: 10px 25px">
				<div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 marginBottom8-AtZOdT" style="flex: 1 1 auto;">
					<div class="item-rJ_Cmt flexChild-faoVW3" style="flex: 1 1 50%;">
						<h5 class="h5-18_1nd title-3sZWYQ size12-3R0845 height16-2Lv3qA weightSemiBold-NJexzi defaultMarginh5-2mL-bP marginBottom8-AtZOdT">${title}</h5>
						<div class="container-CpszHS container-1nZlH6 hasValue-3pdcdm">
							<div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 layout-FSaTy9 layout-eEMo5y" style="flex: 1 1 auto;"><input placeholder="No Keybind Set" type="text" readonly="" class="input-1G2o7i input-1UhAnY base-96ewKC" value="${v.replace("Key", "")}" style="flex: 1 1 auto;">
								<div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6"
									style="flex: 0 1 auto; margin: 0px;">
									<button type="button" class="button-34kXw5 button-3tQuzi button-38aScr lookGhost-2Fn_0- colorGrey-2DXtkV sizeMin-1mJd1x grow-q77ONN nbl-keybind-button">
										<div class="contents-18-Yxp nbl-keybind-button">
											<span class="text-2sI5Sd nbl-keybind-button">Edit Keybind</span>
												<span class="editIcon-13gaox nbl-keybind-button">
											</span>
										</div>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="description-3_Ncsb formText-3fs7AJ keybindMessage-20JT9A flexChild-faoVW3 modeDefault-3a2Ph1 primary-jw0I4K" style="flex: 1 1 auto;">${options.description || ""}</div>
			</div>
		</div>
	`);

	let isRecording = false, primaryKey = "", modifiers = [], globalKeys = [];

	let keyEvent = e => {

		e.preventDefault();

		if(options.global) {

			let key = e.key;

			if(key.length == 1) key = key.toUpperCase();

			if(globalKeys.indexOf(key) == -1) globalKeys.push(key);
			if(globalKeys[0] == "") globalKeys.splice(0, 1);
			input.value = globalKeys.join(" + ");

			if(e.location == 0 && globalKeys.length > 1) button.click();
			else input.value += " + ...";

		} else {

			if(e.location == 0) primaryKey = e.code;
			else if(modifiers.indexOf(e.code) == -1) modifiers.push(e.code);

			if(primaryKey && modifiers[0]) {
				input.value = `${modifiers.join(" + ")} + ${primaryKey}`;
				button.click();
			} else if(primaryKey) input.value = primaryKey;
			else if(modifiers[0]) input.value = modifiers.join(" + ") + " + ...";
			else input.value = "";

			input.value = input.value.replace("Key", "");

		}
		
	};

	let keyUpEvent = e => {

		e.preventDefault();

		if(options.global) {

			let key = e.key;

			if(key.length == 1) key = key.toUpperCase();

			if(globalKeys.indexOf(key) != -1) globalKeys.splice(globalKeys.indexOf(key), 1);
			if(globalKeys[0] == "") globalKeys.splice(0, 1);
			input.value = globalKeys.join(" + ");

		} else {

			if(e.location == 0) primaryKey = undefined;
			else if(modifiers.indexOf(e.code) != -1) modifiers.splice(modifiers.indexOf(e.code), 1);

			if(primaryKey && modifiers[0]) input.value = `${modifiers.join(" + ")} + ${primaryKey}`;
			else if(primaryKey) input.value = primaryKey;
			else if(modifiers[0]) input.value = modifiers.join(" + ") + " + ...";
			else input.value = "";

			input.value = input.value.replace("Key", "");

		}

	};

	let toggleRecording = () => {

		isRecording = !isRecording;

		if(isRecording) {
			if(options.global) NeatoLib.Keybinds.unregisterGlobal(oldValue);
			document.addEventListener("keydown", keyEvent);
			document.addEventListener("keyup", keyUpEvent);
			document.addEventListener("click", documentClick);
			container.classList.add("recording-1H2dS7");
			label.innerText = "Save Keybind";
		} else {
			oldValue = globalKeys.join(" + ");
			if(options.global) callback(oldValue);
			else callback({ primaryKey : primaryKey, modifiers : modifiers });
			primaryKey = undefined;
			modifiers = [];
			globalKeys = [];
			document.removeEventListener("keydown", keyEvent);
			document.removeEventListener("keyup", keyUpEvent);
			document.removeEventListener("click", documentClick);
			container.classList.remove("recording-1H2dS7");
			label.innerText = "Edit Keybind";
		}

	};

	let documentClick = e => {
		if(!e.target.classList.contains("nbl-keybind-button")) toggleRecording();
	};

	let input = element.getElementsByTagName("input")[0],
	container = element.getElementsByClassName("container-CpszHS")[0],
	button = element.getElementsByTagName("button")[0],
	label = element.getElementsByClassName("text-2sI5Sd")[0];

	button.addEventListener("click", toggleRecording);

	return element;

};

NeatoLib.Settings.pushChangelogElements = function(plugin) {

	var element = document.createElement("div");

	element.style.padding = "10px";
	element.style.marginTop = "10px";
	element.style.backgroundColor = "rgba(0,0,0,0.2)";
	element.style.borderRadius = "5px";

	element.insertAdjacentHTML("beforeend", `<div style="text-align:center;color:white;">Other</div>`);

	element.insertAdjacentElement("beforeend", NeatoLib.Settings.Elements.createToggleSwitch("Display changes for every update", plugin.settings.displayUpdateNotes, () => {
		plugin.settings.displayUpdateNotes = !plugin.settings.displayUpdateNotes;
		plugin.saveSettings();
	}));

	var right = document.createElement("div");

	right.style.textAlign = "right";

	right.style.paddingTop = "20px";

	right.insertAdjacentElement("beforeend", NeatoLib.Settings.Elements.createButton("View Changelog", () => {
		NeatoLib.Changelog.createChangeWindow(plugin.getName(), [], plugin.getChanges());
	}));

	right.insertAdjacentElement("afterbegin", NeatoLib.Settings.Elements.createButton("Join Support Server", () => {
		window.open("https://discord.gg/yNqzuJa");
	}, "float:left"));

	element.insertAdjacentElement("beforeend", right);

	NeatoLib.Settings.pushElement(element, plugin.getName());

};

NeatoLib.Settings.pushElement = function(element, name, options = {}) {

	const { tooltip, tooltipSide } = options;

	document.getElementById(`plugin-settings-${name}`).appendChild(element);

	if(tooltip) NeatoLib.Tooltip.attach(tooltip, element, { side : tooltipSide || "left" });

};

NeatoLib.Settings.pushElements = function(elements, name) {
	let panel = document.getElementById(`plugin-settings-${name}`);
	for(let i = 0; i < elements.length; i++) panel.appendChild(elements[i]);
};

NeatoLib.Settings.pushHTML = function(html, name) { document.getElementById(`plugin-settings-${name}`).insertAdjacentHTML("beforeend", html); };

NeatoLib.Settings.showPluginSettings = function(name) {

	document.querySelector(".button-2b6hmh:nth-child(3)").click();

	setTimeout(() => {

		var bdActions = document.querySelectorAll("#bd-settings-sidebar .ui-tab-bar-item");

		for(var i = 0; i < bdActions.length; i++) { if(bdActions[i].textContent == "Plugins") bdActions[i].click(); }

		setTimeout(() => {

			var settingsBox = document.querySelector(`li[data-name="${name}"]`), settingsButton = settingsBox.getElementsByClassName("bda-settings-button")[0];

			settingsBox.scrollIntoView();

			if(settingsButton != undefined) settingsButton.click();

		}, 100);

	}, 100);

};

NeatoLib.Settings.save = function(plugin) {
	NeatoLib.Data.save(plugin.getName().split(" ").join(""), "settings", plugin.settings);
};

NeatoLib.Settings.load = function(plugin, defaultSettings) {
	return NeatoLib.Data.load(plugin.getName().split(" ").join(""), "settings", defaultSettings);
};

NeatoLib.UI = {};

NeatoLib.UI.createPrompt = function(id, title, description, yesCallback, noCallback = "close", options = {}) {

	document.getElementsByClassName("app")[0].insertAdjacentHTML("beforeend", `
	
	<div id="neato-prompt-${id}" style="z-index:10000;">
		<div class="backdrop-1wrmKB" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);"></div>
		<div class="modal-1UGdnR" style="opacity: 1; transform: scale(1) translateZ(0px);">
			<div class="inner-1JeGVc">
				<div class="modal-3HD5ck sizeSmall-Sf4iOi">
					<div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6 header-1R_AjF" style="flex: 0 0 auto;">
						<h4 class="h4-AQvcAz title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi defaultColor-1_ajX0 defaultMarginh4-2vWMG5 marginReset-236NPn">${title}</h4>
					</div>
					<div class="scrollerWrap-2lJEkd content-2BXhLs scrollerThemed-2oenus themeGhostHairline-DBD-2d">
						<div class="scroller-2FKFPG inner-3wn6Q5">
							<div class="card-1SJYqw marginBottom20-32qID7 card-3Qj_Yx" style="background-color:${options.color || "transparent"};border:none;">
								<div class="medium-zmzTW- size16-14cGz5 height20-mO2eIN white-2qwKC7">${description}</div>
							</div>
						</div>
					</div>
					<div class="flex-1xMQg5 flex-1O1GKY horizontalReverse-2eTKWD horizontalReverse-3tRjY7 flex-1O1GKY directionRowReverse-m8IjIq justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 footer-2yfCgX" style="flex: 0 0 auto;"><button type="submit" class="button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN prompt-yes"><div class="contents-18-Yxp">${options.yesText || "Yes"}</div></button><button type="button" class="button-38aScr lookLink-9FtZy- colorPrimary-3b3xI6 sizeMedium-1AC_Sl grow-q77ONN prompt-no"><div class="contents-18-Yxp">${options.noText || "No"}</div></button></div>
				</div>
			</div>
		</div>
	</div>
	
	`);

	let prompt = document.getElementById("neato-prompt-" + id),
	backdrop = prompt.getElementsByClassName("backdrop-1wrmKB")[0],
	yesButton = prompt.getElementsByClassName("prompt-yes")[0],
	noButton = prompt.getElementsByClassName("prompt-no")[0];

	prompt.close = () => prompt.outerHTML = "";

	backdrop.addEventListener("click", () => prompt.close());

	yesButton.addEventListener("click", () => yesCallback(prompt));
	noButton.addEventListener("click", noCallback == "close" ? () => prompt.close() : () => noCallback(prompt));

	prompt.addEventListener("keydown", e => {
	if(e.key == "Escape") prompt.close();
	if(e.key == "Enter") yesButton.click();
	});

	return prompt;

};

NeatoLib.UI.createTextPrompt = function(id, title, callback, value = "", options = {}) {

	document.getElementsByClassName("app")[0].insertAdjacentHTML("beforeend", `
			
	<div id="neato-text-prompt-${id}" style="z-index:10000;">
		<div class="backdrop-1wrmKB" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);"></div>
		<div class="modal-1UGdnR" style="opacity: 1; transform: scale(1) translateZ(0px);">
			<div class="inner-1JeGVc">
				<div class="modal-3HD5ck sizeSmall-Sf4iOi">
					<div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6 header-1R_AjF" style="flex: 0 0 auto;">
						<h4 class="h4-AQvcAz title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi defaultColor-1_ajX0 defaultMarginh4-2vWMG5 marginReset-236NPn">${title}</h4>
					</div>
					<div class="content-2BXhLs">
						<div class="inner-3wn6Q5" style="flex:1;-webkit-box-flex:1;padding-right:20px;">
							<div class="input-2JOcvO marginBottom8-AtZOdT">
								<h5 class="h5-18_1nd title-3sZWYQ size12-3R0845 height16-2Lv3qA weightSemiBold-NJexzi defaultMarginh5-2mL-bP marginBottom8-AtZOdT">${options.description || ""}</h5>
								<div class="inputWrapper-31_8H8 vertical-V37hAW flex-1O1GKY directionColumn-35P_nr"><input placeholder="${options.placeholder || ""}" value="${value.split("\"").join("&quot;")}" class="inputDefault-_djjkz input-cIJ7To size16-14cGz5" type="text"></div>
							</div>
							<div class="reset-2ikQ30 marginBottom20-32qID7 small-29zrCQ size12-3R0845 height16-2Lv3qA primary-jw0I4K weightSemiBold-NJexzi prompt-second-option">${options.secondOptionText || ""}</div>
						</div>
					</div>
					<div class="flex-1xMQg5 flex-1O1GKY horizontalReverse-2eTKWD horizontalReverse-3tRjY7 flex-1O1GKY directionRowReverse-m8IjIq justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 footer-2yfCgX" style="flex: 0 0 auto;"><button class="button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN prompt-confirm"><div class="contents-18-Yxp">${options.confirmText || "Save"}</div></button><button type="button" class="button-38aScr lookLink-9FtZy- colorPrimary-3b3xI6 sizeMedium-1AC_Sl grow-q77ONN prompt-cancel"><div class="contents-18-Yxp">Cancel</div></button></div>
				</div>
			</div>
		</div>
	</div>

	`);
	
	let prompt = document.getElementById("neato-text-prompt-" + id),
	backdrop = prompt.getElementsByClassName("backdrop-1wrmKB")[0],
	confirmButton = prompt.getElementsByClassName("prompt-confirm")[0],
	cancelButton = prompt.getElementsByClassName("prompt-cancel")[0],
	secondOption = prompt.getElementsByClassName("prompt-second-option")[0],
	field = prompt.getElementsByTagName("input")[0];

	field.focus();
	field.selectionStart = field.selectionEnd = field.value.length;

	prompt.close = () => prompt.outerHTML = "";

	backdrop.addEventListener("click", () => prompt.close());

	confirmButton.addEventListener("click", () => callback(field.value, prompt));
	cancelButton.addEventListener("click", () => prompt.close());

	if(options.secondOptionCallback != undefined) secondOption.addEventListener("click", () => options.secondOptionCallback(prompt));

	prompt.addEventListener("keydown", e => {
	if(e.key == "Escape") prompt.close();
	if(e.key == "Enter") confirmButton.click();
	});

	return prompt;

};

NeatoLib.UI.createBasicScrollList = function(id, title, options = {}) {

	document.getElementsByClassName("app")[0].insertAdjacentHTML("beforeend", `
	
	<div id="${id}">

	<style>

		${options.style || ""}

		.${id}-item {
			padding: 10px;
		}

		.${id}-backdrop {
			opacity: 0.85;
			background-color: black;
			z-index: 1000;
			position: fixed;
			contain: strict;
			bottom: 0;
			left: 0;
			top: 0;
			right: 0;
		}

		.${id}-scroller-wrapper {
			width: ${options.width || 800}px;
			min-height: ${options.height || 800}px;
			max-height: ${options.height || 800}px;
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background: #2f3136;
			border-radius: 5px;
			z-index: 10000;
		}

		.${id}-scroller {
			width: 100%;
			max-height: ${(options.height || 800) - 30}px;
			overflow-y: scroll;
			overflow-x: hidden;
		}

		#${id} *::-webkit-scrollbar {
			max-width: 10px;
		}
		
		#${id} *::-webkit-scrollbar-track-piece {
			background: transparent;
			border: none;
			border-radius: 5px;
		}
		
		#${id} *:hover::-webkit-scrollbar-track-piece {
			background: #2F3136;
			border-radius: 5px;
		}
		
		#${id} *::-webkit-scrollbar-thumb {
			background: #1E2124;
			border: none;
			border-radius: 5px;
		}
		
		#${id} *::-webkit-scrollbar-button {
			display: none;
		}

		.${id}-label {
			color: white;
			font-size: 35px;
			flex: 1 1 auto;
			text-align: center;
			padding-top: 10px;
			font-size: 20px;
		}

		.${id}-label span {
			vertical-align: middle;
			marign-left: 10px;
		}

		.${id}-scroller > :last-child {
			margin-bottom: 10px;
		}
		
	</style>

	<div class="${id}-backdrop"></div>
		<div class="${id}-scroller-wrapper">
			<div class="${id}-label">
				<h2>${title}</h2>
			</div>
			<div class="${id}-scroller"></div>
		</div>
	</div>

	</div>

	`);

	let window = document.getElementById(id), scroller = window.getElementsByClassName(`${id}-scroller`)[0], backdrop = window.getElementsByClassName(`${id}-backdrop`)[0];

	backdrop.addEventListener("click", () => window.outerHTML = "");
	window.addEventListener("keydown", e => { if(key == "Escape") backdrop.click(); });

	return { window : window, scroller : scroller, backdrop : backdrop };

};

NeatoLib.Keybinds = {};

NeatoLib.Keybinds.globalShortcut = require("electron").remote.globalShortcut;

NeatoLib.Keybinds.attachListener = function(id, key, event, options = {}) {

	if(key == undefined) return console.warn(id, "The passed key object is null!", key);

	if(window.activeNeatoKeyListeners == undefined) window.activeNeatoKeyListeners = {};

	let node = options.node || document;

	if(window.activeNeatoKeyListeners[id]) {
		console.warn("There is already a keybind listener with the id '" + id + "'!");
		return;
	}

	window.activeNeatoKeyListeners[id] = {
		heldKeys : [],
		keydown : e => {
			if(window.activeNeatoKeyListeners[id].heldKeys.indexOf(e.code) == -1) window.activeNeatoKeyListeners[id].heldKeys.push(e.code);
			if(window.activeNeatoKeyListeners[id].heldKeys.indexOf(key.primaryKey) != -1) {
				let heldModifiers = 0;
				for(let i = 0; i < key.modifiers.length; i++) if(window.activeNeatoKeyListeners[id].heldKeys.indexOf(key.modifiers[i]) != -1) heldModifiers++;
				if(key.modifiers.length == heldModifiers) event(e);
			}
		},
		keyup : e => {
			if(window.activeNeatoKeyListeners[id].heldKeys.indexOf(e.code) != -1) window.activeNeatoKeyListeners[id].heldKeys.splice(window.activeNeatoKeyListeners[id].heldKeys.indexOf(e.code), 1);
		}
	};

	node.addEventListener("keydown", window.activeNeatoKeyListeners[id].keydown);
	node.addEventListener("keyup", window.activeNeatoKeyListeners[id].keyup);

	return window.activeNeatoKeyListeners[id];

};

NeatoLib.Keybinds.detachListener = function(id, node = document) {

	if(window.activeNeatoKeyListeners == undefined) window.activeNeatoKeyListeners = {};
	
	if(!window.activeNeatoKeyListeners[id]) {
		console.warn("There is no keybind listener with the id '" + id + "'!");
		return;
	}

	node.removeEventListener("keydown", window.activeNeatoKeyListeners[id].keydown);
	node.removeEventListener("keyup", window.activeNeatoKeyListeners[id].keyup);

	delete window.activeNeatoKeyListeners[id];

};

NeatoLib.Keybinds.registerGlobal = function(key, event, debug = false) {
	try { this.globalShortcut.register(key, event); }
	catch(e) { if(debug) console.error(e); }
};

NeatoLib.Keybinds.unregisterGlobal = function(key, debug = false) {
	try { this.globalShortcut.unregister(key); }
	catch(e) { if(debug) console.error(e); }
};

NeatoLib.Chatbox = {};

NeatoLib.Chatbox.get = function() {
	let chat = document.getElementsByClassName("chat")[0];
	return chat ? chat.getElementsByTagName("textarea")[0] : null;
};

NeatoLib.Chatbox.setText = function(newText) {
	NeatoLib.Chatbox.get().select();
	document.execCommand("insertText", false, newText);
};

NeatoLib.Chatbox.appendText = function(text) {
	let chatbox = NeatoLib.Chatbox.get();
	if(!chatbox) return;
	chatbox.select();
	document.execCommand("insertText", false, chatbox.value + text);
};

NeatoLib.Modules = {}; //Based off of Zerebos' PluginLibrary. https://rauenzi.github.io/BetterDiscordAddons/docs/PluginLibrary.js

NeatoLib.Modules.req = webpackJsonp.push([[], { "__extra_id__" : (m, e, r) => m.exports = r }, [["__extra_id__"]]]);

NeatoLib.Modules.find = function(filter) {
	
	for(let i in this.req.c) {

		if(this.req.c.hasOwnProperty(i)) {
			let m = this.req.c[i].exports;
			if(m && m.__esModule && m.default && filter(m.default)) return m.default;
			if(m && filter(m)) return m;
		}

	}

	console.warn("No module found with this filter!", filter);

	return null;

};

NeatoLib.Modules.findIndex = function(filter) {
	
	for(let i in this.req.c) {

		if(this.req.c.hasOwnProperty(i)) {
			let m = this.req.c[i].exports;
			if(m && m.__esModule && m.default && filter(m.default)) return i;
			if(m && filter(m)) return i;
		}

	}

	console.warn("No module found with this filter!", filter);

	return null;

};

NeatoLib.Modules.get = function(props) {
	return typeof(props) == "string" ? this.find(module => module[props] != undefined) : this.find(module => props.every(prop => module[prop] != undefined));
};

NeatoLib.Modules.getById = function(id) {
	return this.find(x => x._dispatchToken == "ID_" + id);
};

NeatoLib.Modules.Stores = {};

NeatoLib.Modules.Stores.Guilds = NeatoLib.Modules.get(["getGuild", "getGuilds"]);
NeatoLib.Modules.Stores.Channels = NeatoLib.Modules.get(["getChannel", "getChannels"]);
NeatoLib.Modules.Stores.SelectedChannels = NeatoLib.Modules.get(["getChannelId", "getVoiceChannelId"]);
NeatoLib.Modules.Stores.Users = NeatoLib.Modules.get(["getUser", "getUsers"]);
NeatoLib.Modules.Stores.Members = NeatoLib.Modules.get(["getMember", "getMembers"]);
NeatoLib.Modules.Stores.Activities = NeatoLib.Modules.get(["getActivity", "getActivities"]);

NeatoLib.Updates = {}; //Based off of Zerebos' PluginLibrary. https://rauenzi.github.io/BetterDiscordAddons/docs/PluginLibrary.js

NeatoLib.Updates.requestUpdateCheck = function(pluginName, url) {

	require("request")(url, (err, response, res) => {

		if(err) return console.error(pluginName, "Failed to check for updates!", err);

		let latestVersion = res.match(/['"][0-9]+\.[0-9]+\.[0-9]+['"]/i);
		if(!latestVersion) return;
		latestVersion = latestVersion.toString().replace(/['"]/g, "").trim();

		if(window.PluginUpdates.plugins[url] && window.PluginUpdates.plugins[url].version != latestVersion) NeatoLib.Updates.displayNotice(pluginName, url);
		else NeatoLib.Updates.hideNotice(pluginName);

	});

};

NeatoLib.Updates.displayNotice = function(pluginName, url) {

	if(document.getElementById("pluginNotice") == undefined) {

		let classes = NeatoLib.Modules.get("noticeInfo");

		document.getElementsByClassName("app")[0].insertAdjacentHTML("afterbegin", `<div class="${classes.notice} ${classes.noticeInfo}" id="pluginNotice"><div class="${classes.dismiss}" id="pluginNoticeDismiss"></div><span class="notice-message">The following plugins have updates:</span>&nbsp;&nbsp;<strong id="outdatedPlugins"></strong></div>`);

		document.getElementById("pluginNoticeDismiss").addEventListener("click", () => document.getElementById("pluginNotice").outerHTML = "");

	}

	if(document.getElementById(pluginName + "-notice") == undefined) {

		let element = document.createElement("span"), outdated = document.getElementById("outdatedPlugins");

		element.setAttribute("id", pluginName + "-notice");
		element.innerText = pluginName;

		element.addEventListener("click", () => NeatoLib.Updates.download(pluginName, url));

		if(outdated.getElementsByTagName("span")[0] != undefined) outdated.insertAdjacentHTML("beforeend", "<span class='separator'>, </span>");
		outdated.appendChild(element);

	}

};

NeatoLib.Updates.hideNotice = function(pluginName) {

	let notice = document.getElementById(pluginName + "-notice");

	if(notice) {
		if(notice.nextSibling.classList.contains("separator")) notice.nextSibling.remove();
		else if(notice.previousSibling.classList.contains("separator")) notice.previousSibling.remove();
		notice.remove();
	} else if(!document.querySelector("#outdatedPluings > span") && document.querySelector("#pluginNotice > .btn-reload") && document.querySelector("#pluginNotice .notice-message")) document.querySelector("#pluginNotice .notice-message").innerText = "To finish updating you need to reload.";

};

NeatoLib.Updates.download = function(pluginName, url) {
	
	let req = require("request"), fs = require("fs"), path = require("path");

	req(url, (err, response, res) => {

		if(err) return console.error(pluginName, "Failed to download update!", err);

		let latestVersion = res.match(/['"][0-9]+\.[0-9]+\.[0-9]+['"]/i).toString().replace(/['"]/g, "").trim(), fileName = url.split("/");
		fileName = fileName[fileName.length - 1];

		let file = path.join(NeatoLib.getPluginsFolderPath(), fileName);

		fs.writeFileSync(file, res);

		NeatoLib.showToast(`${pluginName} was updated to v${latestVersion}.`, "success");

		let rnm = (window.bdplugins["Restart-No-More"] && window.pluginCookie["Restart-No-More"]) || (window.bdplugins["Restart No More"] && window.pluginCookie["Restart No More"]);

		if(!rnm) {

			if(!window.PluginUpdates.downloaded) {
				
				window.PluginUpdates.downloaded = [];

				let button = document.createElement("button");
				
				button.className = "btn btn-reload btn-2o56RF button-1MICoQ size14-3iUx6q weightMedium-2iZe9B";
				button.innerText = "Reload";

				button.addEventListener("click", e => {
					e.preventDefault();
					window.location.reload(false);
				});

				let tooltip = document.createElement("div");
				tooltip.className = "tooltip tooltip-bottom tooltip-black";

				tooltip.style.maxWidth = "400px";
				
				button.addEventListener("mouseenter", () => {
					document.getElementsByClassName("tooltips")[0].appendChild(tooltip);
					tooltip.innerText = window.PluginUpdates.downloaded.join(", ");
					tooltip.style.left = button.getBoundingClientRect().left + (button.offsetWidth / 2) - (tooltip.offsetWidth / 2) + "px";
					tooltip.style.top = button.getBoundingClientRect().top + button.offsetHeight + "px";
				});

				button.addEventListener("mouseleave", () => tooltip.remove());

				document.getElementById("pluginNotice").appendChild(button);

			}

			window.PluginUpdates.plugins[url].version = latestVersion;
			window.PluginUpdates.downloaded.push(pluginName);
			NeatoLib.Updates.hideNotice(pluginName);

		}

	});

};

NeatoLib.Updates.check = function(plugin, path) {

	let url = path ? path : "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/" + plugin.getName().split(" ").join("") + ".plugin.js";

	if(typeof window.PluginUpdates == "undefined") window.PluginUpdates = { plugins : {} };
	window.PluginUpdates.plugins[url] = { name : plugin.getName(), raw : url, version : plugin.getVersion() };

	NeatoLib.Updates.requestUpdateCheck(plugin.getName(), url);

	if(typeof window.PluginUpdates.interval == "undefined") {
		window.PluginUpdates.interval = setInterval(() => {
			window.PluginUpdates.checkAll();
		}, 7200000);
	}

	if(typeof window.PluginUpdates.checkAll == "undefined") {
		window.PluginUpdates.checkAll = function() {
			for(let key in this.plugins) {
				NeatoLib.Updates.requestUpdateCheck(this.plugins[key].name, this.plugins[key].raw);
			}
		};
	}

};

NeatoLib.Data = {};

NeatoLib.Data.save = function(name, key, data) {
	try { bdPluginStorage.set(name, key, data); }
	catch(err) { console.warn(name, "failed to save data.", err); }
};

NeatoLib.Data.load = function(name, key, fallback) {
	try { return $.extend(true, fallback ? fallback : {}, bdPluginStorage.get(name, key)); }
	catch(err) { console.warn(name, "failed to load data.", err); }
	return {};
};

NeatoLib.Events = {};

NeatoLib.Events.onPluginLoaded = function(plugin) {

	NeatoLib.showToast(`[${plugin.getName()}]: Plugin loaded.`, "success");
	console.log(plugin.getName(), "loaded.");

	plugin.ready = true;

	if(plugin.forceLoadTimeout) {
		clearTimeout(plugin.forceLoadTimeout);
		plugin.forceLoadTimeout = null;
		delete plugin.forceLoadTimeout;
	}

};

NeatoLib.Events.classes = {
	activityFeed : NeatoLib.Modules.get("activityFeed").activityFeed.split(" ")[0],
	layer : NeatoLib.Modules.get("layer").layer.split(" ")[0],
	socialLinks : NeatoLib.Modules.get("socialLinks").socialLinks.split(" ")[0]
};

if(window.activeNeatoEvents == undefined) window.activeNeatoEvents = [];

if(window.neatoObserver) window.neatoObserver.disconnect();
window.neatoObserver = new MutationObserver(mutations => {

	let call = type => {
		for(let i = 0; i < window.activeNeatoEvents.length; i++) {
			if(window.activeNeatoEvents[i].type == type) {
				if(typeof(window.activeNeatoEvents[i].callback) == "function") {
					try { window.activeNeatoEvents[i].callback(); }
					catch(err) { console.warn("Unable to call " + window.activeNeatoEvents[i].type + " event.", window.activeNeatoEvents[i].callback, err); }
				}
			}
		}
	};

	for(let i = 0; i < mutations.length; i++) {

		if(mutations[i].removedNodes[0] != undefined && mutations[i].removedNodes[0] instanceof Element) {
			if(mutations[i].removedNodes[0].classList.contains(NeatoLib.Events.classes.activityFeed) || mutations[i].removedNodes[0].id == "friends") {
				call("switch");
			}
		}

		let added = mutations[i].addedNodes[0];

		if(added == undefined || !(added instanceof Element)) continue;

		if(added.classList.contains(NeatoLib.Events.classes.layer)) call("settings");

		if(added.classList.contains(NeatoLib.Events.classes.activityFeed) || added.id == "friends") call("switch");

		if(added.classList.contains("messages-wrapper") || added.getElementsByClassName("messages-wrapper")[0] != undefined) call("switch");

		if((added.classList.contains("message") && !added.classList.contains("message-sending")) || added.classList.contains("message-group")) call("message");

	}

});
window.neatoObserver.observe(document, { childList : true, subtree : true });

NeatoLib.Events.attach = function(eventType, event, options = {}) {
	window.activeNeatoEvents.push({ callback : event, type : eventType, options : options });
};

NeatoLib.Events.detach = function(eventType, event) {
	let idx = window.activeNeatoEvents.findIndex(e => e.callback == event && e.type == eventType);
	if(idx != -1) window.activeNeatoEvents.splice(idx, 1);
	else console.warn("Event could not be found.", event);
};

NeatoLib.ReactData = {}; //Based off of Zerebos' PluginLibrary. https://rauenzi.github.io/BetterDiscordAddons/docs/PluginLibrary.js

NeatoLib.ReactData.get = function(element) {

	if(!(element instanceof Element)) return null;

	return element[Object.keys(element).find(key => key.startsWith("__reactInternalInstance"))];

};

NeatoLib.ReactData.getEvents = function(element) {

	if(!(element instanceof Element)) return null;

	return element[Object.keys(element).find(key => key.startsWith("__reactEventHandlers"))];

};

NeatoLib.ReactData.getOwner = function(element) {

	if(!(element instanceof Element)) return null;
	
	let reactData = this.get(element);

	if(reactData == undefined) return null;

	for(let c = reactData.return; !_.isNil(c); c = c.return) {
		if(_.isNil(c)) continue;
		let owner = c.stateNode;
		if(!_.isNil(owner) && !(owner instanceof HTMLElement)) return owner;
	}

};

NeatoLib.ReactData.getProps = function(element) {

	if(!(element instanceof Element)) return null;

	let owner = this.getOwner(element);

	return owner ? owner.props : null;

};

NeatoLib.ReactData.getProp = function(element, propKey) {
	
	if(!(element instanceof Element)) return null;

	let owner = this.getOwner(element);

	if(!owner || !owner.props) return null;

	let split = propKey.split("."), obj = owner.props;

	for(let i = 0; i < split.length; i++) {
		obj = obj[split[i]];
		if(!obj) return null;
	}

	return obj;

}

NeatoLib.ContextMenu = {};

NeatoLib.ContextMenu.classes = NeatoLib.Modules.get("contextMenu");

NeatoLib.ContextMenu.create = function(items, event, options = {}) {

	this.close();
	
	let menu = document.createElement("div");

	menu.classList.add(this.classes.contextMenu.split(" ")[0], document.getElementsByClassName("theme-dark")[0] != undefined ? "theme-dark" : "theme-light");

	for(let i = 0; i < items.length; i++) menu.appendChild(items[i]);

	if(options.style) menu.style = options.style;

	menu.style.zIndex = 10000;
	menu.style.top = event.clientY + "px";
	menu.style.left = event.clientX + "px";

	let close = () => {
		menu.remove();
		document.removeEventListener("click", onClick);
		document.removeEventListener("contextmenu", onClick);
		document.removeEventListener("keyup", onKeyUp);
	};

	let onClick = e => {
		if(!menu.contains(e.target)) close();
	};

	let onKeyUp = e => {
		if(e.key == "Escape") close();
	};

	document.addEventListener("click", onClick);
	setTimeout(() => {
		document.addEventListener("contextmenu", onClick);
	}, 0);
	document.addEventListener("keyup", onKeyUp);

	document.getElementById("app-mount").appendChild(menu);

	return menu;

};

NeatoLib.ContextMenu.createGroup = function(items, options = {}) {

	let element = document.createElement("div");

	element.classList.add(this.classes.itemGroup.split(" ")[0]);

	for(let i = 0; i < items.length; i++) element.appendChild(items[i]);

	return element;

};

NeatoLib.ContextMenu.createItem = function(label, callback, options = {}) {

	let element = document.createElement("div");

	element.classList.add(this.classes.item.split(" ")[0]);

	element.innerHTML = "<span>" + label + "</span>";

	if(options.color) element.firstChild.style.color = options.color;

	if(options.hint) NeatoLib.Tooltip.attach(options.hint, element);

	if(options.description) element.innerHTML += `<div class="${this.classes.hint}">${options.description}</div>`;

	if(callback) element.addEventListener("click", callback);

	return element;

};

NeatoLib.ContextMenu.createSubMenu = function(label, items, options = {}) {
	
	let element = document.createElement("div");

	element.classList.add(this.classes.item.split(" ")[0], this.classes.itemSubMenu.split(" ")[0]);

	element.innerText = label;

	if(options.color) element.style.color = options.color;

	if(options.hint) element.innerHTML += `<div class="${this.classes.hint}">${options.hint}</div>`;

	if(options.callback) element.addEventListener("click", e => {
		if(e.target == element) options.callback(e);
	});

	element.addEventListener("mouseenter", () => {
		if(element.getElementsByTagName("div")[0]) return element.getElementsByTagName("div")[0].style.display = "inline-block";
		let menu = document.createElement("div");
		menu.style.left = element.parentElement.getBoundingClientRect().left + "px";
		menu.style.top = element.getBoundingClientRect().top + "px";
		menu.classList.add(this.classes.contextMenu.split(" ")[0], document.getElementsByClassName("theme-dark")[0] != undefined ? "theme-dark" : "theme-light");
		for(let i = 0; i < items.length; i++) menu.appendChild(items[i]);
		element.appendChild(menu);
	});

	element.addEventListener("mouseleave", () => {
		if(element.getElementsByTagName("div")[0]) element.getElementsByTagName("div")[0].style.display = "none";
	});

	return element;

};

NeatoLib.ContextMenu.createToggle = function(label, value, callback, options = {}) {

	let element = document.createElement("div");

	element.classList.add(this.classes.item.split(" ")[0], this.classes.itemToggle.split(" ")[0]);

	element.innerHTML = `
		<div class="${this.classes.label}">${label}</div>
		<div class="checkbox">
			<div class="checkbox-inner">
				<input type="checkbox">
				<span></span>
			</div>
		</div>
	`;

	let checkbox = element.getElementsByTagName("input")[0];
	
	checkbox.checked = value;

	if(options.color) element.style.color = options.color;

	if(callback) element.addEventListener("click", () => {
		checkbox.checked = !checkbox.checked;
		callback(checkbox.checked);
	});

	return element;

};

NeatoLib.ContextMenu.get = function() {
	return Array.filter(document.getElementsByClassName(this.classes.contextMenu), x => x.style.display != "none")[0];
};

NeatoLib.ContextMenu.close = function() {
	let cm = NeatoLib.ContextMenu.get();
	if(cm) cm.style.display = "none";
};

NeatoLib.Tooltip = {};

NeatoLib.Tooltip.attach = function(content, element, options = {}) {

	if(element.tooltip != undefined) element.tooltip.detach();

	const { side = "top", color = undefined, onShow = undefined, onHide = undefined } = options;

	let domChecker;

	element.tooltip = {
		tooltip : undefined,
		node : element,
		event : {
			mouseenter : () => {
				let tooltip = document.createElement("div");
				tooltip.classList.add("tooltip", "tooltip-" + side, "tooltip-black");
				tooltip.innerText = content;
				tooltip.style.pointerEvents = "none";
				tooltip.style.zIndex = 15000;
				if(color) tooltip.style.backgroundColor = color;
				document.getElementsByClassName("tooltips")[0].appendChild(tooltip);
				element.tooltip.tooltip = tooltip;
				let elementRect = element.getBoundingClientRect();
				switch(side) {
					case "top" : {
						tooltip.style.top = (elementRect.top - tooltip.offsetHeight) + "px";
						tooltip.style.left = ((elementRect.left + (element.offsetWidth / 2)) - (tooltip.offsetWidth / 2)) + "px";
						break;
					}
					case "bottom" : {
						tooltip.style.top = (elementRect.top + element.offsetHeight) + "px";
						tooltip.style.left = ((elementRect.left + (element.offsetWidth / 2)) - (tooltip.offsetWidth / 2)) + "px";
						break;
					}
					case "right" : {
						tooltip.style.left = (elementRect.left + element.offsetWidth) + "px";
						tooltip.style.top = ((elementRect.top + (element.offsetHeight / 2)) - (tooltip.offsetHeight / 2)) + "px";
						break;
					}
					case "left" : {
						tooltip.style.left = (elementRect.left - tooltip.offsetWidth) + "px";
						tooltip.style.top = ((elementRect.top + (element.offsetHeight / 2)) - (tooltip.offsetHeight / 2)) + "px";
						break;
					}
				}
				if(typeof onShow == "function") onShow(element.tooltip);
				domChecker = setInterval(() => {
					if(!document.contains(element)) {
						tooltip.remove();
						clearInterval(domChecker);
					}
				}, 200);
			},
			mouseleave : () => {
				if(element.tooltip.tooltip) {
					element.tooltip.tooltip.remove();
					if(typeof onHide == "function") onHide(element.tooltip);
				}
				clearInterval(domChecker);
			}
		},
		detach : () => {
			element.tooltip.event.mouseleave();
			element.removeEventListener("mouseenter", element.tooltip.event.mouseenter);
			element.removeEventListener("mouseleave", element.tooltip.event.mouseleave);
			delete element.tooltip;
		}
	};

	element.addEventListener("mouseenter", element.tooltip.event.mouseenter);
	element.addEventListener("mouseleave", element.tooltip.event.mouseleave);

	return element.tooltip;

};

NeatoLib.Colors = {};

NeatoLib.Colors.hexToRGB = function(hex, format = "R, G, B") {
	return format.replace("R", parseInt(hex.substring(1, 7).substring(0, 2), 16)).replace("G", parseInt(hex.substring(1, 7).substring(2, 4), 16)).replace("B", parseInt(parseInt(hex.substring(1, 7).substring(4, 6), 16)));
};

NeatoLib.Colors.getBrightness = function(color) {
	if(!color) return 0;
	let c = Array.from(color.split(","), n => parseInt(n.replace(/[^0-9]/g, "")));
	return Math.sqrt(c[0] * c[0] * 0.241 + c[1] * c[1] * 0.691 + c[2] * c[2] * 0.068) / 255;
};

NeatoLib.DOM = {};

NeatoLib.DOM.searchForParentElementByClassName = function(e, className) {

	if(!e) return null;

	if(e.classList.contains(className)) return e;

	let element = e;

	while(element && element.parentElement && element.parentElement != document) {

		element = element.parentElement;

		if(element.classList.contains(className)) return element;

		for(let i = 0; i < element.children.length; i++) if(element.children[i].classList.contains(className)) return element.children[i];

	}

	return null;

};

NeatoLib.DOM.createElement = function(values, options = {}) {

	let element = document.createElement(options.type || "div");

	for(let key in values) element[key] = values[key];

	return element;

};

NeatoLib.DOM.sortChildren = function(element, sortFunc) {

	let children = Array.from(element.children).sort(sortFunc || function(a, b) {
		let x = a.innerText.toLowerCase(), y = b.innerText.toLowerCase();
		if(x < y) return -1;
		else if(x > y) return 1;
		return 0;
	});

	for(let i = 0; i < children.length; i++) element.appendChild(children[i]);

};

NeatoLib.DOM.insertHTMLBefore = function(element, html) {

	let e = document.createElement("div");

	element.parentElement.insertBefore(e, element);

	e.outerHTML = html;

	return e;

};

NeatoLib.DOM.insertAtIndex = function(idx, element, parent) {
	if(idx >= parent.children.length) parent.appendChild(element);
	else parent.insertBefore(element, parent.children[idx]);
};

NeatoLib.DOM.insertHTMLAtIndex = function(idx, html, parent) {

	let e = document.createElement("div");

	this.insertAtIndex(idx, e, parent);

	e.outerHTML = html;

	return e;

};

NeatoLib.downloadFile = function(url, path, fileName, onCompleted) {

	let fileSys = require("fs"), http = require("https");

	if(!path.endsWith("/")) path += "/";

	path += fileName;

	if(path.lastIndexOf("?") != -1) path = path.substring(0, path.lastIndexOf("?"));

	NeatoLib.showToast("Download started...");

	if(fileSys.existsSync(path)) {

		NeatoLib.showToast("File already exists, random characters will be appended to the file name!", "error");

		let fileExtension = path.substring(path.lastIndexOf("."), path.length);

		path = path.split(fileExtension).join(` ${Math.random().toString(36).substring(10)}${fileExtension}`);

	}

	let request = http.request(url, x => {

		let data = [];

		x.on("data", d => { data.push(d); });

		x.on("end", () => {

			fileSys.writeFile(path, Buffer.concat(data), error => {
				if(error) NeatoLib.showToast("Failed to save file! Error: " + error.message, "error");
				else NeatoLib.showToast("File saved successfully!", "success");
			});

			if(onCompleted != undefined) onCompleted(path);

		});

	});

	request.on("error", error => { NeatoLib.showToast("Failed to save file! Error: " + error.message, "error"); });

	request.end();

};

NeatoLib.requestFile = function(url, name = "unknown.png", onCompleted) {

	var http = require("https");

	var request = http.request(url, x => {

		var data = [];

		x.on("data", d => { data.push(d); });

		x.on("end", () => {

			if(onCompleted != undefined) onCompleted(new File([Buffer.concat(data)], name));

		});

	});

	request.on("error", error => { NeatoLib.showToast("Failed to request file! Error: " + error.message, "error"); });

	request.end();

};

NeatoLib.getClasses = function(classes, returnAll = true) {

	var found = {};

	for(var i = 0; i < classes.length; i++) {

		var module = NeatoLib.Modules.get(classes[i]);

		if(module != undefined) {

			for(var ii in module) {

				if(!returnAll && classes[i] != ii) continue;

				found[ii] = module[ii];

			}

		}

	}

	return found;

};

NeatoLib.getSelectedServer = function() {
	let selected = document.getElementsByClassName("guild selected");
	return selected ? NeatoLib.Modules.Stores.Guilds.getGuild(NeatoLib.getSelectedServerId()) : null;
};

NeatoLib.getSelectedGuild = NeatoLib.getSelectedServer;

NeatoLib.getSelectedServerId = function() {
	let selected = document.getElementsByClassName("guild selected");
	return selected.length ? (selected[0].getElementsByTagName("a")[0].href.match(/\d+/) || [])[0] : null;
};

NeatoLib.getSelectedGuildId = NeatoLib.getSelectedServerId;

NeatoLib.getSelectedTextChannel = function() {
	return NeatoLib.Modules.Stores.Channels.getChannel(NeatoLib.Modules.Stores.SelectedChannels.getChannelId());
};

NeatoLib.getSelectedVoiceChannel = function() {
	return NeatoLib.Modules.Stores.Channels.getChannel(NeatoLib.Modules.Stores.SelectedChannels.getVoiceChannelId());
};

NeatoLib.monkeyPatchInternal = function(module, funcName, newFunc) {

	let unpatched = module[funcName];

	module[funcName] = function() {
		let d = {
			module : this,
			args : arguments,
			unpatch : () => module[funcName] = unpatched,
			unpatched : unpatched,
			callDefault : () => d.unpatched.apply(d.module, d.args),
			callDefaultWithArgs : function() { d.unpatched.apply(d.module, arguments); }
		};
		return newFunc(d);
	};

	module[funcName].unpatch = () => module[funcName] = unpatched;

	return module[funcName];

};

NeatoLib.patchInternalFunction = function(functionName, newFunction, pluginName, replace = false) {

	let module = NeatoLib.Modules.get(functionName);

	if(module == undefined) return console.warn("No module with function '" + functionName + "' found!");

	if(module[functionName + "_unpatched_" + pluginName] != undefined) return console.warn("This function is already patched by this plugin!");

	module[functionName + "_unpatched_" + pluginName] = module[functionName];
	
	module[functionName] = replace ? newFunction : function() {
		newFunction.apply(module, arguments);
		return module[functionName + "_unpatched_" + pluginName].apply(module, arguments);
	};

};

NeatoLib.patchReturnedVariableOfInternal = function(functionName, replacers, pluginName) {
	
	let module = NeatoLib.Modules.get(functionName);

	if(module == undefined) return console.warn("No module with function '" + functionName + "' found!");

	module[functionName + "_unpatched_" + pluginName] = module[functionName];

	module[functionName] = function() {
		let newReturn = module[functionName + "_unpatched_" + pluginName].apply(module, arguments);
		if(!newReturn) return null;
		for(let key in replacers) newReturn[key] = replacers[key];
		return newReturn;
	};

};

NeatoLib.unpatchInternalFunction = function(functionName, pluginName) {

	let module = NeatoLib.Modules.get(functionName);

	if(module == undefined) {

		console.log("There are no modules that contain this function!");

		return;

	}

	if(module[functionName + "_unpatched_" + pluginName] == undefined) {

		console.log("This function is not patched!");

		return;

	}

	module[functionName] = module[functionName + "_unpatched_" + pluginName];
	delete module[functionName + "_unpatched_" + pluginName];

};

NeatoLib.internalFunctionIsPatched = function(functionName, pluginName) {

	let module = NeatoLib.Modules.get(functionName);

	if(module == undefined) {

		console.log("There are no modules that contain this function!");

		return;

	}

	return module[functionName + "_unpatched_" + pluginName] != undefined;

};

NeatoLib.patchInternalFunctions = function(functionNames, newFunction, pluginName, replace = false) {
	for(let i = 0; i < functionNames.length; i++) NeatoLib.patchInternalFunction(functionNames[i], newFunction, pluginName, replace);
};

NeatoLib.unpatchInternalFunctions = function(functionNames, pluginName) {
	for(let i = 0; i < functionNames.length; i++) NeatoLib.unpatchInternalFunction(functionNames[i], pluginName);
};

NeatoLib.getLocalUser = function() {
	return NeatoLib.Modules.Stores.Users.getCurrentUser();
};

NeatoLib.getLocalStatus = function() {
	return NeatoLib.Modules.Stores.Activities.getStatus(NeatoLib.getLocalUser().id);
};

NeatoLib.browseForFile = function(callback, options = {}) {

	let fileBrowser = document.createElement("input");

	fileBrowser.type = "file";
	fileBrowser.style.display = "none";

	if(options.directory == true) {
		fileBrowser.setAttribute("webkitdirectory", true);
		fileBrowser.setAttribute("directory", true);
	}

	if(options.multiple == true) fileBrowser.setAttribute("multiple", true);

	document.head.appendChild(fileBrowser);

	fileBrowser.click();

	fileBrowser.addEventListener("change", () => {

		callback(options.multiple == true ? fileBrowser.files : fileBrowser.files[0]);

		fileBrowser.outerHTML = "";

	});

};

NeatoLib.shuffleArray = function(array) {

	let idx = array.length, temp, random;

	while(idx != 0) {
		random = Math.floor(Math.random() * idx);
		idx--;
		temp = array[idx];
		array[idx] = array[random];
		array[random] = temp;
	}

	return array;

};

NeatoLib.getPluginsFolderPath = function() {

	let proc = require("process"), path = require("path");

	switch(proc.platform) {
		case "win32" : return path.resolve(proc.env.appdata, "BetterDiscord/plugins/");
		case "darwin" : return path.resolve(proc.env.HOME, "Library/Preferences/", "BetterDiscord/plugins/");
		default : path.resolve(proc.env.HOME, ".config/", "BetterDiscord/plugins/");
	}

};

NeatoLib.getThemesFolderPath = function() {

	let proc = require("process"), path = require("path");

	switch(proc.platform) {
		case "win32" : return path.resolve(proc.env.appdata, "BetterDiscord/themes/");
		case "darwin" : return path.resolve(proc.env.HOME, "Library/Preferences/", "BetterDiscord/themes/");
		default : path.resolve(proc.env.HOME, ".config/", "BetterDiscord/themes/");
	}

};

NeatoLib.showToast = function(text, type, options = {}) {

	if(document.getElementsByClassName("toasts")[0] == undefined) {
		
		let container = document.querySelector(".channels-3g2vYe + div, .channels-Ie2l6A + div"),
		memberlist = container.getElementsByClassName("membersWrap-2h-GB4")[0],
		form = container ? container.getElementsByTagName("form")[0] : undefined,
		left = container ? container.getBoundingClientRect().left : 310,
		right = memberlist ? memberlist.getBoundingClientRect().left : 0,
		width = right ? right - container.getBoundingClientRect().left : container.offsetWidth,
		bottom = form ? form.offsetHeight : 80,
		toastWrapper = document.createElement("div");

		toastWrapper.classList.add("toasts");

		toastWrapper.style.setProperty("left", left + "px");
		toastWrapper.style.setProperty("width", width + "px");
		toastWrapper.style.setProperty("bottom", bottom + "px");

		document.getElementsByClassName("app")[0].appendChild(toastWrapper);

	}

	let toast = document.createElement("div");

	toast.classList.add("toast");
	if(typeof type == "string") toast.classList.add("toast-" + type);
	if(options.icon) toast.classList.add("icon");
	if(options.color) toast.style.backgroundColor = options.color;

	let destroy = () => {
		toast.classList.add("closing");
		setTimeout(() => {
			toast.remove();
			if(document.getElementsByClassName("toast")[0] == undefined) document.getElementsByClassName("toasts")[0].remove();
		}, 300);
	};

	if(options.onClick) toast.addEventListener("click", options.onClick);
	if(options.destroyOnClick) toast.addEventListener("click", destroy);

	toast.innerText = text;

	document.getElementsByClassName("toasts")[0].appendChild(toast);

	setTimeout(destroy, options.timeout || 3000);

	return toast;

};

NeatoLib.injectCSS = function(css) {
	
	let element = document.createElement("style");

	element.type = "text/css";

	element.innerText = css;

	document.head.appendChild(element);

	return {
		element : element,
		getStyle : selector => {
			let selectorIDX = css.indexOf(selector);
			if(selectorIDX == -1) return null;
			return css.substring(selectorIDX, selectorIDX + css.substring(selectorIDX, css.length).indexOf("}")).split("{")[1].trim();
		},
		append : toAppend => {
			css += toAppend;
			element.innerText = css;
		},
		destroy : () => {
			element.remove();
		}
	};

};

NeatoLib.getSnowflakeCreationDate = function(id) {

	let epoch = 1420070400000;

	let toBinary = sf => {

		let binary = "", high = parseInt(sf.slice(0, -10)) || 0, low = parseInt(sf.slice(-10));

		while(low > 0 || high > 0) {

			binary = String(low & 1) + binary;

			low = Math.floor(low / 2);

			if(high > 0) {
				low += 5000000000 * (high % 2);
				high = Math.floor(high / 2);
			}

		}

		return binary;

	};

	return new Date(parseInt(toBinary(id).padStart(64).substring(0, 42), 2) + epoch);

};

for(let pluginName in window.bdplugins) {
	if(typeof window.bdplugins[pluginName].plugin.onLibLoaded == "function" && !window.bdplugins[pluginName].plugin.ready) {
		setTimeout(() => {
			if(window.bdplugins[pluginName].plugin.onLibLoaded.toString().indexOf("NeatoLib.Events.onPluginLoaded") == -1) NeatoLib.Events.onPluginLoaded(window.bdplugins[pluginName].plugin);
		}, 100);
	}
}
