/* Puente mínimo entre Electron y la app web. No expone Node: solo datos de contexto y la salida del operador. */
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("medibotEscritorio", {
  esApp: true,
  version: "0.3.0",
  salida: "Ctrl+Alt+Shift+Q",
  salir: () => ipcRenderer.send("medibot:salir")
});
