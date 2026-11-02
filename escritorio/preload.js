/* Puente mínimo entre Electron y la app web. No expone Node: solo datos de contexto, la salida del operador
   y la impresión silenciosa (sin diálogo del sistema). */
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("medibotEscritorio", {
  esApp: true,
  version: "0.5.0",
  salida: "Ctrl+Alt+Shift+Q",
  salir: () => ipcRenderer.send("medibot:salir"),
  // Imprime la página actual en la impresora predeterminada. Resuelve { ok: boolean, motivo: string }; nunca rechaza.
  imprimir: () => ipcRenderer.invoke("medibot:imprimir")
});
