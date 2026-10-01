const { app, BrowserWindow } = require("electron");
app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, webPreferences: { sandbox: true } });
  await win.loadFile(require("path").join(__dirname, "hid.html"));
  const r = await win.webContents.executeJavaScript(`new Promise(res => { const f = () => { const v = speechSynthesis.getVoices(); if (v.length) res(v.map(x => x.name + " | " + x.lang + (x.localService ? " | local" : " | remota"))); }; f(); speechSynthesis.onvoiceschanged = f; setTimeout(() => res(speechSynthesis.getVoices().map(x => x.name + " | " + x.lang)), 3000); })`);
  console.log("VOCES:\n" + r.join("\n")); console.log("RECONOCIMIENTO: " + await win.webContents.executeJavaScript(`("webkitSpeechRecognition" in window) + ""`));
  app.exit(0);
});
