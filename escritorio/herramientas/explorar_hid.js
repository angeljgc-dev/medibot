/* Explorador HID de solo lectura: abre el dispositivo indicado (por defecto el sensor de mano del QRMA, 5608:0808),
   imprime sus colecciones/reportes y escucha los reportes de entrada durante unos segundos. No envía nada al aparato.
   Uso: npx electron herramientas/explorar_hid.js [vid_hex] [pid_hex] [segundos]   (desde MediBot/escritorio) */
"use strict";
const { app, BrowserWindow, session } = require("electron");
const VID = parseInt(process.argv[2] || "5608", 16), PID = parseInt(process.argv[3] || "0808", 16), SEG = parseInt(process.argv[4] || "20", 10);

app.whenReady().then(async () => {
  const ses = session.defaultSession;
  ses.setPermissionCheckHandler((_wc, p) => p === "hid");
  ses.setDevicePermissionHandler((d) => d.deviceType === "hid" && d.device && d.device.vendorId === VID && d.device.productId === PID);
  ses.on("select-hid-device", (event, details, callback) => { event.preventDefault(); const d = details.deviceList.find(x => x.vendorId === VID && x.productId === PID); callback(d ? d.deviceId : ""); });
  const win = new BrowserWindow({ show: false, webPreferences: { sandbox: true, contextIsolation: true } });
  win.webContents.on("console-message", (_e, _n, msg) => console.log(msg));
  await win.loadFile(require("path").join(__dirname, "hid.html"));
  const js = `(async () => {
    const hex = (dv) => Array.from(new Uint8Array(dv.buffer)).map(b => b.toString(16).padStart(2, "0")).join(" ");
    const devs = await navigator.hid.getDevices();
    console.log("DISPOSITIVOS HID concedidos: " + devs.length);
    const d = devs.find(x => x.vendorId === ${VID} && x.productId === ${PID});
    if (!d) { console.log("NO ENCONTRADO ${VID.toString(16)}:${PID.toString(16)}"); return; }
    console.log("Producto: " + d.productName);
    for (const c of d.collections) {
      console.log("Colección usagePage=0x" + c.usagePage.toString(16) + " usage=0x" + c.usage.toString(16) + " entradas=" + c.inputReports.length + " salidas=" + c.outputReports.length + " feature=" + c.featureReports.length);
      for (const r of c.inputReports) console.log("  inputReport id=" + r.reportId + " items=" + r.items.map(i => (i.reportSize + "b x" + i.reportCount)).join(","));
      for (const r of c.outputReports) console.log("  outputReport id=" + r.reportId + " items=" + r.items.map(i => (i.reportSize + "b x" + i.reportCount)).join(","));
      for (const r of c.featureReports) console.log("  featureReport id=" + r.reportId + " items=" + r.items.map(i => (i.reportSize + "b x" + i.reportCount)).join(","));
    }
    try { await d.open(); console.log("Abierto. Escuchando ${SEG} s..."); } catch (e) { console.log("No se pudo abrir: " + e.message); return; }
    let n = 0; const distintos = new Map(); const t0 = Date.now();
    d.addEventListener("inputreport", (e) => { n++; const k = hex(e.data); if (!distintos.has(k)) { distintos.set(k, { n: 0, primero: ((Date.now() - t0) / 1000).toFixed(1) }); console.log("NUEVO PATRÓN a los " + distintos.get(k).primero + " s: " + k); } distintos.get(k).n++; });
    await new Promise(r => setTimeout(r, ${SEG} * 1000));
    console.log("Reportes de entrada recibidos: " + n + " (" + (n / ${SEG}).toFixed(1) + " por segundo)");
    console.log("Patrones distintos: " + distintos.size);
    for (const [k, v] of distintos) console.log("  " + k + "  x" + v.n + "  (desde " + v.primero + " s)");
    try { await d.close(); } catch {}
  })()`;
  try { await win.webContents.executeJavaScript(js); } catch (e) { console.log("ERROR " + e.message); }
  app.exit(0);
});
