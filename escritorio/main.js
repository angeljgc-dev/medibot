/* MediBot · proceso principal de Electron (v0.3.1).
   - Abre la misma app web (../index.html o resources/web/index.html cuando está empaquetada).
   - Concede el permiso del puerto serie sin diálogo y elige el ESP32 por fabricante (Espressif, CP210x, CH340, FTDI, Arduino).
   - Pantalla completa tipo quiosco, sin menú, sin navegación externa, pantalla siempre encendida; se recupera si el contenido se cae.
   - Salida para el operador: Ctrl+Alt+Shift+Q (atajo global y respaldo dentro de la ventana).
   - Ventana normal para desarrollo: MEDIBOT_VENTANA=1. Autoprueba: MEDIBOT_PRUEBA=1. Sin aceleración de GPU: MEDIBOT_SIN_GPU=1 */
"use strict";
const { app, BrowserWindow, session, Menu, globalShortcut, shell, powerSaveBlocker, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const RUTA_WEB = app.isPackaged ? path.join(process.resourcesPath, "web") : path.join(__dirname, "..");
const INDEX = path.join(RUTA_WEB, "index.html");
const MODO_VENTANA = process.env.MEDIBOT_VENTANA === "1";
const VENDEDORES = [0x303a /* Espressif */, 0x10c4 /* Silicon Labs CP210x */, 0x1a86 /* WCH CH340 */, 0x0403 /* FTDI */, 0x2341 /* Arduino */];
const ORIGENES_OK = new Set(["file://", "null"]); // algunos builds reportan "null" para documentos file://

let win = null;
let permitirCerrar = false;
let recargas = []; // marcas de tiempo de recargas por caída del render

if (process.env.MEDIBOT_SIN_GPU === "1") app.disableHardwareAcceleration();

if (!app.requestSingleInstanceLock()) { app.quit(); }
else {
  app.on("second-instance", () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
}

function elegirPuerto(lista) {
  const rango = (p) => { const i = VENDEDORES.indexOf(parseInt(p.vendorId || "0", 16)); return i < 0 ? 99 : i; };
  return [...lista].sort((a, b) => rango(a) - rango(b))[0] || null;
}

function configurarPermisos(ses) {
  const esQRMA = (d) => d && d.vendorId === 0x5608 && d.productId === 0x0808; // sensor de mano del QRMA (modo evidencia, solo lectura)
  ses.setPermissionCheckHandler((_wc, permission) => permission === "serial" || permission === "hid");
  ses.setPermissionRequestHandler((_wc, permission, callback) => callback(permission === "serial" || permission === "hid"));
  ses.on("select-hid-device", (event, details, callback) => { event.preventDefault(); const d = details.deviceList.find(esQRMA); callback(d ? d.deviceId : ""); });
  ses.setDevicePermissionHandler((details) => {
    const ok = ORIGENES_OK.has(details.origin) && (details.deviceType === "serial" || (details.deviceType === "hid" && esQRMA(details.device)));
    if (!ok) console.log("Permiso de dispositivo denegado:", details.deviceType, "origen:", details.origin);
    return ok;
  });
  // Si la app llama requestPort() (botón del operador), elegimos nosotros sin diálogo.
  ses.on("select-serial-port", (event, portList, _wc, callback) => {
    event.preventDefault();
    const p = elegirPuerto(portList);
    console.log("Puertos disponibles:", portList.map(x => `${x.portName} ${x.vendorId || "?"}:${x.productId || "?"}`).join(", "), "→", p ? p.portName : "ninguno");
    callback(p ? p.portId : "");
  });
  // Nota: los eventos serial-port-added/removed de Electron solo se emiten mientras hay una selección pendiente;
  // la detección al enchufar la hace la app web con el evento "connect" de navigator.serial.
}

function recargarConLimite(motivo) {
  const ahora = Date.now();
  recargas = recargas.filter(t => ahora - t < 120_000);
  recargas.push(ahora);
  if (recargas.length > 3) { console.error(`Demasiadas recargas (${motivo}); relanzando la aplicación`); permitirCerrar = true; app.relaunch(); app.exit(0); return; }
  console.error(`Recargando por: ${motivo} (${recargas.length}/3 en 2 min)`);
  if (win) win.reload();
}

function crearVentana() {
  win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 800, minHeight: 600,
    show: false, backgroundColor: "#F6EFE3", autoHideMenuBar: true,
    kiosk: !MODO_VENTANA, fullscreen: !MODO_VENTANA, frame: MODO_VENTANA,
    icon: path.join(__dirname, "icono.ico"),
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, sandbox: true, nodeIntegration: false, spellcheck: false }
  });
  Menu.setApplicationMenu(null);
  win.once("ready-to-show", () => win.show());
  win.loadFile(INDEX);

  // Respaldo del atajo de salida dentro de la ventana (no depende del registro global)
  win.webContents.on("before-input-event", (_e, input) => {
    if (input.type === "keyDown" && input.control && input.alt && input.shift && (input.key || "").toLowerCase() === "q") { permitirCerrar = true; app.quit(); }
  });

  // Nada de navegación fuera de la app (las fuentes se muestran como texto en la hoja impresa)
  win.webContents.setWindowOpenHandler(({ url }) => { if (MODO_VENTANA && /^https?:/.test(url)) shell.openExternal(url); return { action: "deny" }; });
  win.webContents.on("will-navigate", (e, url) => { if (!url.startsWith("file://")) e.preventDefault(); });

  // Recuperación: si el contenido se cae, recarga con límite; si se congela, espera 10 s y reconfirma (no aborta una medición)
  win.webContents.on("render-process-gone", (_e, d) => setTimeout(() => recargarConLimite("render " + d.reason), 1000));
  let sinRespuestaDesde = 0;
  win.on("unresponsive", () => { sinRespuestaDesde = Date.now(); setTimeout(() => { if (sinRespuestaDesde && Date.now() - sinRespuestaDesde >= 10_000) recargarConLimite("ventana sin respuesta"); }, 10_500); });
  win.on("responsive", () => { sinRespuestaDesde = 0; });
  win.on("close", (e) => { if (!permitirCerrar && !MODO_VENTANA) e.preventDefault(); });
  win.on("closed", () => { win = null; });

  if (process.env.MEDIBOT_PRUEBA === "1") autoprueba();
}

function autoprueba() {
  win.webContents.on("console-message", (_e, nivel, msg) => console.log(`[web:${nivel}] ${msg}`));
  win.webContents.on("did-finish-load", async () => {
    try {
      const r = await win.webContents.executeJavaScript(`(async () => ({
        app: !!window.MediBot, pantalla: window.MediBot && window.MediBot.pantalla, esApp: !!window.medibotEscritorio,
        serial: "serial" in navigator, seguro: window.isSecureContext, origen: location.origin,
        puertosAutorizados: "serial" in navigator ? (await navigator.serial.getPorts()).length : -1,
        modoSensores: window.MediBotSensores && window.MediBotSensores.modo,
        version: window.MediBotData && window.MediBotData.textos.version
      }))()`);
      console.log("AUTOPRUEBA " + JSON.stringify(r));
      if (process.env.MEDIBOT_PRUEBA_HID === "1") {
        await win.webContents.executeJavaScript(`window.MediBot.ir("evidencia")`);
        await new Promise(r => setTimeout(r, 6000));
        const ev = await win.webContents.executeJavaScript(`({ conectado: !!window.MediBotEvidencia.device, total: window.MediBotEvidencia.total, distintos: window.MediBotEvidencia.patrones.size, ultimo: window.MediBotEvidencia.ultimo, estado: document.querySelector(".medida__estado") && document.querySelector(".medida__estado").textContent })`);
        console.log("AUTOPRUEBA_HID " + JSON.stringify(ev));
      }
    } catch (e) { console.log("AUTOPRUEBA ERROR " + e.message); }
    setTimeout(() => { permitirCerrar = true; app.exit(0); }, 6000);
  });
}

ipcMain.on("medibot:salir", () => { permitirCerrar = true; app.quit(); }); // botón "Salir" del panel de operador

app.whenReady().then(() => {
  if (!fs.existsSync(INDEX)) { console.error("No encuentro la app web en", INDEX); app.quit(); return; }
  configurarPermisos(session.defaultSession);
  crearVentana();
  const bloqueo = powerSaveBlocker.start("prevent-display-sleep"); // quiosco: la pantalla no se apaga sola
  console.log("Bloqueo de suspensión de pantalla:", powerSaveBlocker.isStarted(bloqueo));
  const ok = globalShortcut.register("Control+Alt+Shift+Q", () => { permitirCerrar = true; app.quit(); });
  if (!ok) console.warn("No se pudo registrar el atajo global de salida; queda el respaldo dentro de la ventana.");
  if (MODO_VENTANA) globalShortcut.register("F12", () => win && win.webContents.toggleDevTools());
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) crearVentana(); });
});

app.on("child-process-gone", (_e, d) => { if (d.type === "GPU") console.error("Proceso de GPU caído:", d.reason, "(prueba MEDIBOT_SIN_GPU=1)"); });
app.on("before-quit", () => { permitirCerrar = true; }); // deja que Windows apague o cierre sesión
app.on("will-quit", () => globalShortcut.unregisterAll());
app.on("window-all-closed", () => app.quit());
