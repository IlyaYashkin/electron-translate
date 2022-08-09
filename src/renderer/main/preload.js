const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  send: (channel, data) => {
    let whitelist = [
      "get-params",
      "set-params",
      "save-params",
      "text-to-translate",
      "enable-clipboard",
      "enable-notifications",
      "enable-proxy",
    ];
    if (whitelist.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  receive: (channel, callback) => {
    let whitelist = ["translated-text", "text-is-translating"];
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
