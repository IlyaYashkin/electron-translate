const selectEngine = document.getElementById("engine");
const fromLanguage = document.getElementById("from");
const toLanguage = document.getElementById("to");
const inputText = document.getElementById("input-text");
const outputText = document.getElementById("output-text");
const translateButton = document.getElementById("translate-button");
const shortcutButton = document.getElementById("set-shortcut-button");
const clipboardCheckbox = document.getElementById("clipboard-checkbox");
const notificationsCheckbox = document.getElementById("notifications-checkbox");
const proxyCheckbox = document.getElementById("proxy-checkbox");
const proxyField = document.getElementById("proxy-field");
const saveButton = document.getElementById("save-button");
const swapButton = document.getElementById("swap-button");

const setParams = () => {
  console.log(1);
  window.api.send("set-params", {
    engine: selectEngine.value,
    from: fromLanguage.value,
    to: toLanguage.value,
  });
};

window.api.receiveOnce("params", (params) => {
  selectEngine.value = params.translationEngine;
  fromLanguage.value = params.fromLanguage;
  toLanguage.value = params.toLanguage;
  clipboardCheckbox.checked = params.isWriteToClipboardEnabled;
  notificationsCheckbox.checked = params.isNotificationsEnabled;
  proxyCheckbox.checked = params.isProxyEnabled;
  proxyField.value = params.proxies.http;
  shortcutButton.innerText = `${
    params.inputFieldShortcut.ctrl ? "CTRL + " : ""
  }${params.inputFieldShortcut.shift ? "SHIFT + " : ""}${
    params.inputFieldShortcut.alt ? "ALT + " : ""
  }${params.inputFieldShortcut.key}`;

  switch (proxyCheckbox.checked) {
    case true:
      proxyField.disabled = false;
      proxyField.style.color = "#41b2ff";
      break;
    case false:
      proxyField.disabled = true;
      proxyField.style.color = "#757575";
      break;
  }
});

window.api.receive("translated-text", (string) => {
  translateButton.innerText = "TRANSLATE";
  outputText.value = string;
});

window.api.receive("text-is-translating", () => {
  translateButton.innerText = "TRANSLATING...";
});

window.api.receive("setting-input-field-shortcut", (shortcut) => {
  shortcutButton.innerText = `${shortcut.ctrl ? "CTRL + " : ""}${
    shortcut.shift ? "SHIFT + " : ""
  }${shortcut.alt ? "ALT + " : ""}${shortcut.key}`;
  shortcutButton.classList.remove("set-shortcut-button-pressed");
});

shortcutButton.onclick = (e) => {
  shortcutButton.innerText = "...";
  shortcutButton.classList.add("set-shortcut-button-pressed");
  window.api.send("set-input-field-shortcut");
};

swapButton.onclick = (e) => {
  const from = fromLanguage.value;
  fromLanguage.value = toLanguage.value;
  toLanguage.value = from;
  setParams();
};

clipboardCheckbox.onchange = (e) => {
  window.api.send("enable-clipboard", e.target.checked);
};

notificationsCheckbox.onchange = (e) => {
  window.api.send("enable-notifications", e.target.checked);
};

proxyCheckbox.onchange = () => {
  switch (proxyCheckbox.checked) {
    case true:
      proxyField.disabled = false;
      proxyField.style.color = "#41b2ff";
      window.api.send("enable-proxy", {
        isEnabled: proxyCheckbox.checked,
        URL: proxyField.value,
      });
      break;
    case false:
      proxyField.disabled = true;
      proxyField.style.color = "#757575";
      window.api.send("enable-proxy", {
        isEnabled: proxyCheckbox.checked,
        URL: proxyField.value,
      });
      break;
  }
};

proxyField.oninput = (e) => {
  window.api.send("enable-proxy", e.target.value);
};

saveButton.onclick = () => {
  window.api.send("save-params");
};

translateButton.onclick = () => {
  window.api.send("text-to-translate", inputText.value);
};

selectEngine.onchange = setParams;
fromLanguage.onchange = setParams;
toLanguage.onchange = setParams;
