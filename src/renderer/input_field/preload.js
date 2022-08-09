const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  send: (channel, data) => {
    let whitelist = ["text-to-translate"];
    if (whitelist.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
});
