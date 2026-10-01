/* Control general: estado de sesión, navegación, inactividad, tema, sensores, operador, diálogos. */
(function () {
  "use strict";
  const { h, icono, $, $$ } = window.U;
  const D = window.MediBotData;
  const P = window.MediBotPantallas;
  const sensores = window.MediBotSensores;

  // Orden del flujo. Las señales de alarma van ANTES de medir: quien tiene una urgencia no debe completar la demo.
  const ORDEN = ["reposo", "bienvenida", "sobreTi", "alarma", "mediciones", "cuidar", "confirmar", "resultado", "fichas", "resumen"];
  const PASOS = ORDEN.slice(2);
  const FUERA_DE_FLUJO = ["bebe", "verificacion", "evidencia"];
  const INACTIVO_AVISO_MS = 60_000, INACTIVO_FIN_MS = 90_000;

  let sesion = nuevaSesion();
  let actual = "reposo";
  let resultado = null;
  let tAviso = null, tFin = null, tCuenta = null;
  const config = { altitud: leerPref("altitud", 0, Number), bitacora: leerPref("bitacora", [], JSON.parse) };

  function nuevaSesion() {
    return {
      grupo: null, embarazo: null, embarazoRespondido: false,
      peso: { valor: null, origen: null }, talla: { valor: null, origen: null },
      medidas: { fc: { valor: null, origen: null, calidad: null, estado: null }, spo2: { valor: null, origen: null, calidad: null, estado: null }, temp: { valor: null, origen: null, calidad: null, estado: null } },
      alarma: {}, categorias: [], inicio: Date.now()
    };
  }

  /* ---------- Navegación ---------- */
  function ir(destino) {
    const i = ORDEN.indexOf(actual);
    let siguiente = destino || ORDEN[Math.min(Math.max(i, 0) + 1, ORDEN.length - 1)];
    if (siguiente === "fichas" && !sesion.categorias.length) siguiente = "resumen";
    if (["resultado", "fichas", "resumen"].includes(siguiente)) resultado = window.MediBotReglas.evaluar(sesion);
    actual = siguiente;
    render();
  }
  function atras() {
    const i = ORDEN.indexOf(actual);
    let prev = i > 0 ? ORDEN[i - 1] : "bienvenida";
    if (prev === "fichas" && !sesion.categorias.length) prev = "resultado";
    if (prev === "reposo") prev = "bienvenida";
    actual = prev; render();
  }
  function terminar() {
    sesion = nuevaSesion(); resultado = null; actual = "reposo";
    cerrarDialogos(); detenerInactividad(); render();
  }

  function render() {
    const app = $("#app");
    const ctx = { sesion, ir, atras, terminar, datos: D, sensores, resultado, actividad, config, guardarBitacora: b => { config.bitacora = b; guardarPref("bitacora", JSON.stringify(b)); } };
    const nodo = P[actual](ctx);
    app.replaceChildren(nodo);
    if (actual !== "reposo") { app.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "instant" }); }
    pintarPasos();
    $(".btn--terminar").hidden = actual === "reposo";
    if (actual === "reposo" || actual === "verificacion" || actual === "evidencia") detenerInactividad(); else reiniciarInactividad();
    if (actual === "reposo") app.appendChild(panelOperador());
    if (window.MediBotVoz) { window.MediBotVoz.detener(); if (window.MediBotVoz.siempre && actual !== "reposo") setTimeout(() => window.MediBotVoz.leerPantalla(), 400); }
  }

  function pintarPasos() {
    const ol = $("#pasos"); ol.replaceChildren();
    const idx = PASOS.indexOf(actual);
    PASOS.forEach((p, i) => {
      const li = h("li", { "aria-label": "Paso " + (i + 1) });
      if (i < idx) li.classList.add("hecho");
      if (i === idx) li.setAttribute("aria-current", "step");
      ol.appendChild(li);
    });
    ol.hidden = idx < 0;
  }

  /* ---------- Inactividad (privacidad) ---------- */
  function actividad() { if (!["reposo", "verificacion", "evidencia"].includes(actual)) reiniciarInactividad(); }
  function reiniciarInactividad() {
    detenerInactividad();
    tAviso = setTimeout(mostrarAviso, INACTIVO_AVISO_MS);
    tFin = setTimeout(terminar, INACTIVO_FIN_MS);
  }
  function detenerInactividad() { clearTimeout(tAviso); clearTimeout(tFin); clearInterval(tCuenta); const d = $("#dlg-inactivo"); if (d.open) d.close(); }
  function mostrarAviso() {
    const d = $("#dlg-inactivo"); const c = $("#cuenta-regresiva");
    let s = Math.round((INACTIVO_FIN_MS - INACTIVO_AVISO_MS) / 1000); c.textContent = s;
    if (!d.open) d.showModal();
    tCuenta = setInterval(() => { s--; c.textContent = Math.max(0, s); }, 1000);
  }
  ["pointerdown", "keydown", "touchstart", "wheel"].forEach(ev => document.addEventListener(ev, () => {
    if ($("#dlg-inactivo").open) return;
    actividad();
  }, { passive: true }));

  function cerrarDialogos() { $$("dialog").forEach(d => { if (d.open) d.close(); }); }

  /* ---------- Panel de operador (solo en reposo) ---------- */
  function panelOperador() {
    const estado = h("span");
    const pinta = () => { estado.textContent = sensores.modo === "serial" ? "ESP32 conectado" : sensores.modo === "sim" ? "Modo simulación" : "Sin sensores"; };
    pinta(); sensores.addEventListener("estado", pinta);
    const btnSerial = h("button.btn.btn--secundario", { type: "button", onclick: async () => { try { await sensores.conectarSerial(); } catch (err) { alert(err.message); } } }, icono("i-usb"), "Conectar ESP32 por USB");
    if (!sensores.disponibleSerial) { btnSerial.disabled = true; btnSerial.title = "Requiere la aplicación de escritorio MediBot.exe (o Edge/Chrome)"; }
    const altitud = h("input", { type: "number", min: 0, max: 4000, step: 50, value: config.altitud || 0, style: "width:7em", "aria-label": "Altitud del sitio en metros", onchange: e => { config.altitud = Number(e.target.value) || 0; guardarPref("altitud", String(config.altitud)); } });
    return h("div.operador", { onclick: e => e.stopPropagation(), onkeydown: e => e.stopPropagation() },
      h("b", "Operador:"), estado,
      btnSerial,
      h("label", { style: "display:inline-flex;gap:.4rem;align-items:center" }, "Simulación:",
        h("select", { "aria-label": "Escenario de simulación", style: "font:inherit;min-height:44px;border-radius:10px;padding:.2rem .5rem;background:var(--papel);color:var(--tinta);border:2px solid var(--linea)", onchange: e => { if (e.target.value) sensores.conectarSim(e.target.value); } },
          h("option", { value: "" }, "elige un escenario…"),
          h("option", { value: "normal" }, "normal"),
          h("option", { value: "oxigeno_bajo" }, "oxígeno bajo (91 %)"),
          h("option", { value: "fiebre" }, "fiebre (38.7 °C)"),
          h("option", { value: "pulso_alto" }, "pulso alto (126)"),
          h("option", { value: "inestable" }, "lecturas inestables"))),
      h("button.btn.btn--fantasma", { type: "button", onclick: () => sensores.desconectar() }, "Desconectar"),
      h("button.btn.btn--fantasma", { type: "button", onclick: () => ir("verificacion") }, "Verificación de sensores"),
      h("button.btn.btn--fantasma", { type: "button", onclick: () => ir("evidencia") }, "Evidencia QRMA"),
      window.medibotEscritorio ? h("button.btn.btn--fantasma", { type: "button", onclick: () => { if (confirm("¿Cerrar MediBot? (también puedes usar " + window.medibotEscritorio.salida + ")")) window.medibotEscritorio.salir(); } }, icono("i-x"), "Salir de la aplicación") : null,
      h("label", { style: "display:inline-flex;gap:.4rem;align-items:center" }, "Altitud (m):", altitud),
      h("label", { style: "display:inline-flex;gap:.4rem;align-items:center" }, h("input", { type: "checkbox", checked: window.MediBotVoz && window.MediBotVoz.siempre, style: "width:1.4em;height:1.4em", onchange: e => { window.MediBotVoz.siempre = e.target.checked; guardarPref("voz", e.target.checked ? "1" : "0"); } }), "Leer en voz alta cada pantalla"),
      !sensores.disponibleSerial ? h("span", "· Para el USB usa la aplicación de escritorio MediBot.exe") : null
    );
  }

  sensores.addEventListener("estado", e => {
    const el = $("#estado-sensores"); const m = e.detail.modo;
    el.className = "pie__estado " + (m === "serial" ? "ok" : m === "sim" ? "sim" : "");
    el.textContent = "Sensores: " + (m === "serial" ? "ESP32 conectado" : m === "sim" ? "simulación" : "sin conectar");
  });

  /* ---------- Barra y pie: tema, letra, terminar, acerca, apoyo ---------- */
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-accion]"); if (!b) return;
    const a = b.dataset.accion;
    if (a === "inicio") { if (actual !== "reposo" && !confirm("¿Volver al inicio? Se borrará lo capturado.")) return; terminar(); }
    else if (a === "terminar") terminar();
    else if (a === "seguir") { $("#dlg-inactivo").close(); reiniciarInactividad(); }
    else if (a === "letra") { const on = document.documentElement.dataset.scale !== "lg"; document.documentElement.dataset.scale = on ? "lg" : "md"; b.setAttribute("aria-pressed", String(on)); guardarPref("scale", on ? "lg" : "md"); }
    else if (a === "tema") { const html = document.documentElement; const oscuro = html.dataset.theme === "dark" || (html.dataset.theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches); html.dataset.theme = oscuro ? "light" : "dark"; guardarPref("theme", html.dataset.theme); }
    else if (a === "escuchar") { window.MediBotVoz.leerPantalla(); }
    else if (a === "acerca") { $("#acerca-cuerpo").replaceChildren(...D.textos.acerca.parrafos.map(p => h("p", p))); $("#dlg-acerca").showModal(); }
    else if (a === "cerrar-acerca") $("#dlg-acerca").close();
    else if (a === "apoyo") { const t = D.textos.telefonos.find(x => x.numero !== "911"); $("#apoyo-cuerpo").replaceChildren(h("p", "No estás solo ni sola. Hay una línea gratuita donde te escuchan las 24 horas, sin juzgar."), h("div.telefono.telefono--destacado", icono("i-phone"), h("div", h("div.num", t.numero), h("div", h("b", t.nombre), " · ", t.nota))), h("p", { style: "margin-top:.8rem" }, "Si prefieres hablar con alguien aquí, avísale a la persona encargada del quiosco.")); $("#dlg-apoyo").showModal(); }
    else if (a === "cerrar-apoyo") $("#dlg-apoyo").close();
  });

  // Preferencias del equipo (no son datos personales): tema, tamaño de letra, altitud del sitio, bitácora de calibración
  function guardarPref(k, v) { try { localStorage.setItem("medibot." + k, v); } catch {} }
  function leerPref(k, def, parse) { try { const v = localStorage.getItem("medibot." + k); return v === null ? def : (parse ? parse(v) : v); } catch { return def; } }
  function cargarPrefs() {
    const t = leerPref("theme", null); if (t) document.documentElement.dataset.theme = t;
    const s = leerPref("scale", null); if (s) { document.documentElement.dataset.scale = s; $('[data-accion="letra"]').setAttribute("aria-pressed", String(s === "lg")); }
  }

  /* ---------- Arranque ---------- */
  cargarPrefs();
  $("#pie-apoyo").textContent = D.textos.pie_apoyo;
  if (window.MediBotVoz) window.MediBotVoz.instalar();
  render();
  sensores.vigilarUSB();
  sensores.reconectarSerial().catch(() => {});
  window.MediBot = { get sesion() { return sesion; }, get pantalla() { return actual; }, ir, terminar, sensores, config, evaluar: () => window.MediBotReglas.evaluar(sesion) };
})();
