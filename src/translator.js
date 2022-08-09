const cp = require("child_process");
const EventEmitter = require("events");

class Translator extends EventEmitter {
  start() {
    this.translator = cp.spawn("translator.exe");
    this.translator.stdout.on("data", (data) => {
      this.emit("translate-success", data.toString().trim());
    });
    this.translator.stderr.on("data", (data) => {
      this.emit("translate-error", data.toString().trim());
    });
  }

  translate(text, engine = "google", from = "auto", to = "en", proxies = {}) {
    console.log(
      JSON.stringify({
        text: Buffer.from(text).toString("base64"),
        engine: engine,
        from: from,
        to: to,
        proxies: proxies,
      })
    );
    this.translator.stdin.cork();
    this.translator.stdin.write(
      JSON.stringify({
        text: Buffer.from(text).toString("base64"),
        engine: engine,
        from: from,
        to: to,
        proxies: proxies,
      }) + "\n"
    );
    this.translator.stdin.uncork();
  }
}

module.exports = new Translator();
