const path = require("path");
const fs = require("fs");
const {
  app,
  ipcMain,
  BrowserWindow,
  clipboard,
  Tray,
  Menu,
  Notification,
} = require("electron");
const robot = require("robotjs");
const { uIOhook, UiohookKey } = require("uiohook-napi");
const translator = require("./translator.js");

if (process.platform === "win32") {
  app.setAppUserModelId(app.name);
}

let translationEngine = "google";
let fromLanguage = "auto";
let toLanguage = "en";
let isWriteToClipboardEnabled = false;
let isNotificationsEnabled = false;
let isProxyEnabled = false;
let proxies = {
  http: "",
  https: "",
};

(() => {
  try {
    const params = JSON.parse(fs.readFileSync("config.json").toString());
    translationEngine = params.translationEngine;
    fromLanguage = params.fromLanguage;
    toLanguage = params.toLanguage;
    isWriteToClipboardEnabled = params.isWriteToClipboardEnabled;
    isNotificationsEnabled = params.isNotificationsEnabled;
    isProxyEnabled = params.isProxyEnabled;
    proxies.http = params.proxies.http;
    proxies.https = params.proxies.https;
  } catch (e) {}
})();

let mainWindow;
let inputFieldWindow;
let tray;
let openInputFieldPressed = false;
let textIsTranslating = false;

const isNotificationsSupported = Notification.isSupported();

// Глобальные шорткаты из доп. библы (работают в лоле)
uIOhook.on("keydown", (e) => {
  if (
    e.keycode === UiohookKey.X &&
    e.altKey === true &&
    !openInputFieldPressed
  ) {
    openInputFieldPressed = true;
    openInputField();
  }
});
uIOhook.on("keyup", (e) => {
  if (e.keycode === UiohookKey.X || e.altKey === false) {
    openInputFieldPressed = false;
  }
});

translator.on("translate-success", (string) => {
  if (isWriteToClipboardEnabled) clipboard.writeText(string);
  mainWindow.webContents.send("translated-text", string);
  textIsTranslating = false;
  if (!isNotificationsSupported || !isNotificationsEnabled) return;
  new Notification({
    title: "Text translated and writed to clipboard!",
    body: string,
  }).show();
});
translator.on("translate-error", (err) => {
  console.log(err);
  mainWindow.webContents.send("translated-text", err);
  textIsTranslating = false;
  if (!isNotificationsSupported || !isNotificationsEnabled) return;
  new Notification({
    title: "Translation error",
    // body: err,
  }).show();
});

ipcMain.once("get-params", () => {
  mainWindow.webContents.send("params", {
    translationEngine,
    fromLanguage,
    toLanguage,
    isWriteToClipboardEnabled,
    isNotificationsEnabled,
    isProxyEnabled,
    proxies,
  });
});
ipcMain.on("set-params", (_evt, params) => {
  translationEngine = params.engine;
  fromLanguage = params.from;
  toLanguage = params.to;
});
ipcMain.on("save-params", () => {
  fs.writeFileSync(
    "config.json",
    JSON.stringify({
      translationEngine,
      fromLanguage,
      toLanguage,
      isWriteToClipboardEnabled,
      isNotificationsEnabled,
      isProxyEnabled,
      proxies,
    })
  );
});
ipcMain.on("enable-clipboard", (_evt, bool) => {
  isWriteToClipboardEnabled = bool;
});
ipcMain.on("enable-notifications", (_evt, bool) => {
  isNotificationsEnabled = bool;
});
ipcMain.on("enable-proxy", (_evt, proxy) => {
  isProxyEnabled = proxy.isEnabled;
  proxies.http = proxy.URL;
  proxies.https = proxy.URL;
});
ipcMain.on("text-to-translate", async (_evt, string) => {
  if (inputFieldWindow && !inputFieldWindow.isDestroyed()) {
    inputFieldWindow.close();
  }
  if (string === "" || textIsTranslating) return;
  textIsTranslating = true;
  mainWindow.webContents.send("text-is-translating");
  translator.translate(
    string,
    translationEngine,
    fromLanguage,
    toLanguage,
    isProxyEnabled ? proxies : { http: "", https: "" }
  );
});

uIOhook.start();
translator.start();

app.on("ready", createWindow);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 640,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "/renderer/main/preload.js"),
      contextIsolation: true,
    },
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#30363d",
      symbolColor: "#74b1be",
      height: 20,
    },
  });
  mainWindow.loadFile(path.join(__dirname, "/renderer/main/index.html"));
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("close", (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  tray = new Tray("icon.png");
  tray.setToolTip("Electron translate");
  tray.on("double-click", () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Quit",
        click: () => {
          app.exit(0);
        },
      },
    ])
  );
}

function openInputField() {
  let width = 200;
  let height = 40;
  if (inputFieldWindow && !inputFieldWindow.isDestroyed()) {
    inputFieldWindow.close();
    return;
  }
  inputFieldWindow = new BrowserWindow({
    width: width,
    height: height,
    minWidth: 200,
    minHeight: 40,
    webPreferences: {
      preload: path.join(__dirname, "/renderer/input_field/preload.js"),
      contextIsolation: true,
    },
    show: false,
    frame: false,
    // resizable: false,
    skipTaskbar: true,
  });
  inputFieldWindow.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true,
  });
  inputFieldWindow.setAlwaysOnTop(true, "screen-saver", 1);
  inputFieldWindow.loadFile(
    path.join(__dirname, "/renderer/input_field/index.html")
  );
  const mousePosition = robot.getMousePos();
  inputFieldWindow.setPosition(
    mousePosition.x - width / 2,
    mousePosition.y - height / 2
  );

  inputFieldWindow.on("blur", (event) => {
    event.preventDefault();
    inputFieldWindow.close();
  });
  inputFieldWindow.on("ready-to-show", () => {
    inputFieldWindow.show();
    robot.mouseClick();
  });
}
