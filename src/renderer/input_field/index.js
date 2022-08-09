const input = document.getElementById("input");

input.addEventListener("keydown", (e) => {
  if (e.code === "Enter") {
    window.api.send("text-to-translate", e.target.value);
  }
});
