const selectEngine = document.getElementById("engine");
const fromLanguage = document.getElementById("from");
const toLanguage = document.getElementById("to");
const inputText = document.getElementById("input-text");
const outputText = document.getElementById("output-text");
const translateButton = document.getElementById("translate-button");
const clipboardCheckbox = document.getElementById("clipboard-checkbox");
const notificationsCheckbox = document.getElementById("notifications-checkbox");
const proxyCheckbox = document.getElementById("proxy-checkbox");
const proxyField = document.getElementById("proxy-field");
const saveButton = document.getElementById("save-button");

window.api.receiveOnce("params", (params) => {
  selectEngine.value = params.translationEngine;
  fromLanguage.value = params.fromLanguage;
  toLanguage.value = params.toLanguage;
  clipboardCheckbox.checked = params.isWriteToClipboardEnabled;
  notificationsCheckbox.checked = params.isNotificationsEnabled;
  proxyCheckbox.checked = params.isProxyEnabled;
  proxyField.value = params.proxies.http;

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

window.api.send("get-params");

window.api.receive("translated-text", (string) => {
  translateButton.innerText = "TRANSLATE";
  outputText.value = string;
});

window.api.receive("text-is-translating", () => {
  translateButton.innerText = "TRANSLATING...";
});

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

const setParams = () => {
  window.api.send("set-params", {
    engine: selectEngine.value,
    from: fromLanguage.value,
    to: toLanguage.value,
  });
};

selectEngine.onchange = setParams;
fromLanguage.onchange = setParams;
toLanguage.onchange = setParams;
