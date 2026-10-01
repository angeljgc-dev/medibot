/* Autoprueba de voz: carga la app, comprueba la voz elegida, el texto que leería y las respuestas por tecla. */
const { app, BrowserWindow, session } = require("electron");
const path = require("path");
app.whenReady().then(async () => {
  session.defaultSession.setPermissionCheckHandler(() => false);
  const win = new BrowserWindow({ show: false, webPreferences: { preload: path.join(__dirname, "..", "preload.js"), sandbox: true, contextIsolation: true } });
  await win.loadFile(path.join(__dirname, "..", "..", "index.html"));
  await new Promise(r => setTimeout(r, 1500));
  const r = await win.webContents.executeJavaScript(`(async () => {
    const V = window.MediBotVoz; const out = { disponible: V.disponible };
    await new Promise(r => setTimeout(r, 500));
    const v = V.elegirVoz(); out.voz = v ? v.name + " (" + v.lang + ")" : null;
    MediBot.ir("bienvenida"); out.bienvenida = V.textoPantalla().slice(0, 160);
    MediBot.ir("sobreTi"); MediBot.sesion.grupo = "18a59"; MediBot.ir("alarma");
    out.pregunta1 = V.textoPregunta(true).slice(0, 200);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "n", bubbles: true }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "s", bubbles: true }));
    out.respuestas = Object.entries(MediBot.sesion.alarma);
    out.pregunta3 = V.textoPregunta(false).slice(0, 80);
    const btnEscuchar = document.querySelector('[data-accion="escuchar"]'); out.botonEscuchar = btnEscuchar && !btnEscuchar.hidden;
    // sustitutos en fichas
    MediBot.sesion.categorias = ["defensas"]; MediBotData.alarma.preguntas.forEach(p => MediBot.sesion.alarma[p.id] = false); MediBot.ir("fichas");
    out.siNoHay = [...document.querySelectorAll(".si-no-hay")].map(e => e.innerText.slice(0, 70));
    return out;
  })()`);
  console.log("PRUEBA_VOZ " + JSON.stringify(r, null, 1));
  app.exit(0);
});
