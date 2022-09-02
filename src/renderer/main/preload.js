const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  send: (channel, data) => {
    let whitelist = [
      "set-params",
      "save-params",
      "text-to-translate",
      "enable-clipboard",
      "enable-notifications",
      "enable-autolaunch",
      "enable-proxy",
      "set-input-field-shortcut",
    ];
    if (whitelist.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  receive: (channel, callback) => {
    let whitelist = [
      "translated-text",
      "text-is-translating",
      "setting-input-field-shortcut",
    ];
    if (whitelist.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => {
        callback(...args);
      });
    }
  },

  receiveOnce: (channel, callback) => {
    let whitelist = ["params"];
    if (whitelist.includes(channel)) {
      ipcRenderer.once(channel, (_event, ...args) => {
        callback(...args);
      });
    }
  },
});
