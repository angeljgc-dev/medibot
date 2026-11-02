/* Orquestador v0.5: sesión, navegación, botonera fija, inactividad por pantalla, diálogo de borrar, impresión, panel del
   operador (solo con el gesto), simulación que nunca pasa a la siguiente persona, tema, letra y voz.
   Diseño: docs/diseno/sistema.md. */
(function () {
  "use strict";
  const { h, $, $$ } = window.U;
  const D = window.MediBotData;
  const P = window.MediBotPantallas;
  const sensores = window.MediBotSensores;
  const Voz = () => window.MediBotVoz;

  // Orden del flujo (no cambia en el rediseño). Las señales de alarma van ANTES de medir.
  const ORDEN = ["reposo", "bienvenida", "sobreTi", "medicinas", "alarma", "mediciones", "cuidar", "confirmar", "resultado", "fichas", "resumen"];
  const OPERADOR = ["operador", "verificacion", "evidencia", "lugar"]; // sin datos de una persona: sin aviso de inactividad
  const SIN_INACTIVIDAD = ["reposo", ...OPERADOR];
  // Tiempos por pantalla (ms). Resultado, ideas y hoja: más tiempo mientras no se imprime; después de imprimir, menos.
  const TIEMPOS = { normal: [60_000, 90_000], leer: [120_000, 150_000], impreso: [30_000, 60_000] };
  const LEER = ["resultado", "fichas", "resumen"];
  const GESTO_LOGO_MS = 5000;

  let sesion = nuevaSesion();
  let actual = "reposo";
  let resultado = null;
  let impreso = false;      // ya salió la hoja (cambia los tiempos y el verde del resumen)
  let opciones = {};        // opciones de la navegación (volverA, corregir, imprimir)
  let volverA = null;       // después de corregir, «Continuar» regresa a revisar
  let botones = null;       // botonera de la pantalla actual
  let turnoActual = null;   // identifica la pantalla pintada (criterio 52)
  let tAviso = null, tFin = null, tCuenta = null, tLectura = null;
  const config = { altitud: leerPref("altitud", 0, Number), bitacora: leerPref("bitacora", [], JSON.parse) };

  function nuevaSesion() {
    return {
      paraQuien: null, grupo: null, edadNino: null, embarazo: null, embarazoRespondido: false, embarazoOpcion: null,
      medicinas: [], // no se guarda: vive solo en esta sesión y se borra al terminar
      condiciones: [],
      situaciones: null,
      peso: { valor: null, origen: null }, talla: { valor: null, origen: null },
      medidas: { fc: { valor: null, origen: null, calidad: null, estado: null }, spo2: { valor: null, origen: null, calidad: null, estado: null }, temp: { valor: null, origen: null, calidad: null, estado: null } },
      alarma: {}, categorias: [], inicio: Date.now()
    };
  }

  /* ---------- Navegación ---------- */
  function ir(destino, opc) {
    const i = ORDEN.indexOf(actual);
    let siguiente = destino || ORDEN[Math.min(Math.max(i, 0) + 1, ORDEN.length - 1)];
    if (!destino && volverA) {
      // Después de corregir, de vuelta a revisar; pero si el perfil nuevo tiene preguntas de alarma sin contestar
      // (p. ej. al cambiar a un niño), primero esas (criterio 54)
      const pendientes = D.alarma.preguntas.some(p => window.MediBotReglas.aplicaPregunta(p, sesion) && sesion.alarma[p.id] !== true && sesion.alarma[p.id] !== false);
      if (ORDEN.indexOf(actual) < ORDEN.indexOf("alarma") && pendientes) siguiente = "alarma";
      else { siguiente = volverA; volverA = null; }
    }
    if (opc && opc.volverA) volverA = opc.volverA;
    if (["resultado", "fichas", "resumen"].includes(siguiente)) resultado = window.MediBotReglas.evaluar(sesion);
    if (siguiente === "fichas" && sinIdeas()) siguiente = "resumen"; // en rojo no se ofrecen ideas
    opciones = opc || {};
    actual = siguiente;
    render();
  }
  function anteriorDe(id) {
    const i = ORDEN.indexOf(id);
    let prev = i > 0 ? ORDEN[i - 1] : "bienvenida";
    if (prev === "fichas" && sinIdeas()) prev = "resultado";
    if (prev === "reposo") prev = "bienvenida";
    if (OPERADOR.includes(id) || id === "bebe") prev = id === "bebe" ? "sobreTi" : "reposo";
    return prev;
  }
  /** Regresar solo con ArrowLeft, el rojo largo o «Atrás», y la voz avisa a dónde. */
  function atras() {
    const prev = anteriorDe(actual);
    actual = prev; opciones = {}; render();
    const titulo = $("#titulo-pantalla").textContent;
    if (Voz()) Voz().leer(`Regresamos a: ${titulo || "la pantalla anterior"}. ${Voz().textoPantalla()}`);
  }
  function letraNormal() { document.documentElement.dataset.scale = "md"; const b = $('[data-accion="letra"]'); if (b) b.setAttribute("aria-pressed", "false"); }
  function sinIdeas() { return !sesion.categorias.length || (resultado && resultado.nivel === "rojo"); }
  function terminar() {
    if (sensores.modo === "sim") sensores.desconectar(); // una lectura simulada nunca pasa a la siguiente persona
    sesion = nuevaSesion(); resultado = null; actual = "reposo"; impreso = false; opciones = {}; volverA = null;
    letraNormal(); // criterio 49: la siguiente persona empieza con letra normal
    cerrarDialogos(); detenerInactividad(); render();
  }

  /* ---------- Pintar ---------- */
  function render() {
    const app = $("#app");
    const turno = {}; turnoActual = turno; // criterio 52: una pantalla ya cerrada no pinta la botonera de otra
    const ctx = {
      sesion, ir, atras, terminar, datos: D, sensores, resultado, actividad, config, opciones, volverA, // criterio 54: a dónde lleva el verde
      get impreso() { return impreso; }, imprimir, pedirBorrar, pedirCerrarApp, botonera: (b) => { if (turnoActual === turno) pintarBotonera(b); }, vigente: () => turnoActual === turno, titulo: (t) => { $("#titulo-pantalla").textContent = t || ""; },
      abrirOperador, cerrarPanel, tema: alternarTema,
      guardarBitacora: b => { config.bitacora = b; guardarPref("bitacora", JSON.stringify(b)); }, guardarPref
    };
    const nodo = P[actual](ctx);
    if (Voz()) Voz().pantalla = nodo._voz || null;
    app.replaceChildren(nodo);
    document.body.classList.toggle("es-reposo", actual === "reposo");
    if (actual !== "resultado") document.body.classList.remove("es-rojo");
    document.body.classList.toggle("es-operador", OPERADOR.includes(actual));
    $("#titulo-pantalla").textContent = nodo._titulo || "";
    $(".fantasma--terminar").hidden = actual === "reposo" || OPERADOR.includes(actual) || !!nodo._sinTerminar;
    pintarBotonera(nodo._botones || null);
    pintarDemo();
    if (actual !== "reposo") app.focus({ preventScroll: true });
    $("#contenido").scrollTop = 0;
    if (SIN_INACTIVIDAD.includes(actual)) detenerInactividad(); else reiniciarInactividad();
    clearTimeout(tLectura);
    if (Voz()) { Voz().detener(); if (Voz().siempre && actual !== "reposo") tLectura = setTimeout(() => Voz().leerPantalla(), 400); }
    if (typeof nodo._alMostrar === "function") nodo._alMostrar();
  }

  /** Botonera: { azul, rojo, verde }, cada uno { texto, corto, rotulo, pic, id, fn, deshabilitado }.
      El botón en pantalla hace lo mismo que el botón físico de su color (pasa por la voz: la pantalla decide primero). */
  function pintarBotonera(b) {
    botones = b || null;
    if (Voz()) Voz().botones = botones;
    const nav = $("#botonera"); nav.replaceChildren();
    nav.hidden = !b;
    if (!b) return;
    for (const color of ["azul", "rojo", "verde"]) {
      const s = b[color];
      if (!s) { nav.appendChild(h("span.fisico.fisico--vacio", { "aria-hidden": "true" })); continue; }
      const svg = window.U.pic(s.pic || { azul: "p-escuchar", rojo: "p-no", verde: "p-siguiente" }[color]);
      nav.appendChild(h("button.fisico.fisico--" + color + (color === "verde" ? ".btn--primario" : ""), {
        type: "button", "data-boton": color, "data-id": s.id, disabled: !!s.deshabilitado,
        onclick: () => pulsar(color)
      }, h("span.fisico__tecla", svg), h("span.fisico__texto", h("span.largo", s.texto), h("span.corto", { "aria-hidden": "true" }, s.corto || s.texto), h("small", s.rotulo || ROTULO[color]))));
    }
  }
  const ROTULO = { azul: "botón azul", rojo: "botón rojo", verde: "botón verde" };
  function pulsar(color) {
    const s = botones && botones[color]; if (!s || s.deshabilitado) return;
    if (Voz()) Voz().accion(s.id, { color }); else s.fn && s.fn();
  }

  function pintarDemo() {
    const demo = $("#demo"); demo.hidden = sensores.modo !== "sim";
  }

  /* ---------- Inactividad (privacidad) y diálogo de borrar ---------- */
  function tiempos() { return LEER.includes(actual) ? (impreso ? TIEMPOS.impreso : TIEMPOS.leer) : TIEMPOS.normal; }
  function actividad() { if (!SIN_INACTIVIDAD.includes(actual) && !$("#dlg-borrar").open) reiniciarInactividad(); }
  function reiniciarInactividad() {
    detenerInactividad();
    const [aviso, fin] = tiempos();
    tAviso = setTimeout(() => pedirBorrar({ segundos: Math.round((fin - aviso) / 1000) }), aviso);
  }
  function detenerInactividad() { clearTimeout(tAviso); clearTimeout(tFin); clearInterval(tCuenta); }
  /** «¿Quieres seguir con tu consulta?»: verde y Enter = seguir; rojo = borrar todo; sin respuesta en 30 s, se borra. */
  function pedirBorrar({ segundos = 30 } = {}) {
    if (actual === "reposo") return;
    const d = $("#dlg-borrar"); const c = $("#cuenta-regresiva");
    detenerInactividad();
    let s = segundos; c.textContent = s;
    if (!d.open) d.showModal();
    tFin = setTimeout(terminar, segundos * 1000);
    tCuenta = setInterval(() => { s--; c.textContent = Math.max(0, s); if (s === 10 && Voz()) Voz().leer("Quedan 10 segundos. Para seguir, aprieta el verde."); }, 1000);
    if (Voz()) Voz().leer(Voz().textoDialogo(d));
  }
  function seguir() {
    const d = $("#dlg-borrar"); if (d.open) d.close();
    reiniciarInactividad();
    if (Voz()) Voz().leerPantalla(); // vuelve a leer la pregunta que tiene la persona enfrente
  }
  ["pointerdown", "keydown", "touchstart", "wheel"].forEach(ev => document.addEventListener(ev, () => actividad(), { passive: true }));
  // Escape cerraría el diálogo con la cuenta corriendo (y se borraría todo sin aviso a la vista): Escape = «Sí, seguir»
  $("#dlg-borrar").addEventListener("cancel", e => { e.preventDefault(); seguir(); });
  function cerrarDialogos() { $$("dialog").forEach(d => { if (d.open) d.close(); }); }

  /* ---------- Criterio 76: cerrar la app desde el reposo (js/pantallas.js, cerrarApp) ---------- */
  let tCerrarApp = 0;
  function pedirCerrarApp() {
    const d = $("#dlg-cerrar");
    if (!window.medibotEscritorio || actual !== "reposo" || d.open) return;
    d.showModal(); $('#dlg-cerrar [data-accion="cerrar-app-no"]').focus();
    clearTimeout(tCerrarApp); tCerrarApp = setTimeout(() => { if (d.open) d.close(); }, 15000); // nadie contesta: la app sigue
  }
  $("#dlg-cerrar").addEventListener("close", () => clearTimeout(tCerrarApp));
  // Enter nunca cierra la app: con el foco donde sea dentro del diálogo, Enter = «No, seguir»
  $("#dlg-cerrar").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); $("#dlg-cerrar").close(); } });

  /* ---------- Imprimir: en el quiosco, en silencio por el puente de Electron; en el navegador, window.print() ---------- */
  async function imprimir() {
    if (typeof P.ajustarHoja === "function") P.ajustarHoja();
    let ok = true, motivo = "";
    try {
      const E = window.medibotEscritorio;
      if (E && typeof E.imprimir === "function") { const r = await E.imprimir(); ok = !!(r && r.ok); motivo = (r && r.motivo) || ""; }
      else window.print();
    } catch (e) { ok = false; motivo = e.message; }
    if (typeof P.soltarHoja === "function") P.soltarHoja();
    if (ok) impreso = true;
    reiniciarInactividad();
    return { ok, motivo };
  }

  /* ---------- Panel del operador: solo con el gesto ---------- */
  function abrirOperador() { cerrarDialogos(); actual = "operador"; opciones = {}; render(); }
  /** Cerrar el panel: reposo con una sesión nueva, SIN apagar la simulación que el operador acaba de encender. */
  function cerrarPanel() { sesion = nuevaSesion(); resultado = null; impreso = false; opciones = {}; volverA = null; actual = "reposo"; letraNormal(); cerrarDialogos(); detenerInactividad(); render(); } // criterio 49 también al cerrar el panel
  let tGesto = null, gestoHecho = false;
  const marca = $(".marca");
  marca.addEventListener("pointerdown", () => { gestoHecho = false; clearTimeout(tGesto); tGesto = setTimeout(() => { gestoHecho = true; abrirOperador(); }, GESTO_LOGO_MS); });
  ["pointerup", "pointerleave", "pointercancel"].forEach(ev => marca.addEventListener(ev, () => clearTimeout(tGesto)));
  document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.altKey && e.shiftKey && (e.code === "KeyO" || e.key === "O" || e.key === "o")) { e.preventDefault(); abrirOperador(); }
  });
  // En el quiosco, la simulación solo se enciende desde el panel abierto
  const conectarSim = sensores.conectarSim.bind(sensores);
  sensores.conectarSim = function (escenario) {
    if (window.medibotEscritorio && !OPERADOR.includes(actual)) throw new Error("La simulación solo se enciende desde el panel del operador.");
    return conectarSim(escenario);
  };

  sensores.addEventListener("estado", e => {
    const el = $("#estado-sensores"); const m = e.detail.modo;
    el.textContent = "Sensores: " + (m === "desconectado" ? "sin conectar" : "listos"); // sin «simulación» ni versión
    pintarDemo();
  });

  /* ---------- Cabecera, pie y diálogos ---------- */
  function alternarTema() {
    const html = document.documentElement;
    const oscuro = html.dataset.theme === "dark" || (html.dataset.theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
    html.dataset.theme = oscuro ? "light" : "dark"; guardarPref("theme", html.dataset.theme);
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-accion]"); if (!b) return;
    const a = b.dataset.accion;
    if (a === "inicio") { if (gestoHecho) { gestoHecho = false; return; } if (actual === "reposo") return; if (OPERADOR.includes(actual)) cerrarPanel(); else pedirBorrar(); }
    else if (a === "terminar") pedirBorrar();
    else if (a === "seguir") seguir();
    else if (a === "borrar") terminar();
    else if (a === "letra") { const on = document.documentElement.dataset.scale !== "lg"; document.documentElement.dataset.scale = on ? "lg" : "md"; b.setAttribute("aria-pressed", String(on)); b.blur(); $("#app").focus({ preventScroll: true }); } // criterio 49: Enter después no la apaga
    else if (a === "acerca") { $("#acerca-cuerpo").replaceChildren(...D.textos.acerca.parrafos.map(p => h("p", p))); $("#dlg-acerca").showModal(); if (Voz()) Voz().leer(Voz().textoDialogo($("#dlg-acerca"))); }
    else if (a === "cerrar-acerca") $("#dlg-acerca").close();
    else if (a === "apoyo") {
      const t = D.textos.telefonos.find(x => x.numero !== "911");
      $("#apoyo-cuerpo").replaceChildren(h("p", "No estás solo ni sola. Hay una línea gratuita donde te escuchan las 24 horas, sin juzgar."),
        h("div.telefono.telefono--destacado", window.U.pic("p-llamar-911"), h("div", h("div.num", t.numero), h("div", h("b", t.nombre), " · ", t.nota))),
        h("p", "Si prefieres hablar con alguien aquí, pide a alguien que esté cerca que te acompañe."));
      $("#dlg-apoyo").showModal(); if (Voz()) Voz().leer(Voz().textoDialogo($("#dlg-apoyo")));
    }
    else if (a === "cerrar-apoyo") $("#dlg-apoyo").close();
    else if (a === "cerrar-app-no") $("#dlg-cerrar").close();
    else if (a === "cerrar-app-si") { $("#dlg-cerrar").close(); if (window.medibotEscritorio && typeof window.medibotEscritorio.salir === "function") window.medibotEscritorio.salir(); } // mismo IPC que el panel
  });

  // Preferencias del equipo (no son datos personales): tema, tamaño de letra, altitud, bitácora de calibración, voz
  function guardarPref(k, v) { try { localStorage.setItem("medibot." + k, v); } catch (e) { console.warn("No se pudo guardar la preferencia " + k + ":", e.message); } }
  function leerPref(k, def, parse) { try { const v = localStorage.getItem("medibot." + k); return v === null ? def : (parse ? parse(v) : v); } catch (e) { console.warn("No se pudo leer la preferencia " + k + ":", e.message); return def; } }
  function cargarPrefs() {
    // Criterio 79: de fábrica, claro (se lee mejor con luz de día); si el operador eligió tema en el panel, el suyo
    const t = leerPref("theme", null); document.documentElement.dataset.theme = t === "dark" || t === "light" ? t : "light";
    try { localStorage.removeItem("medibot.scale"); } catch (e) { console.warn(e.message); } // la letra grande ya no se guarda: es de cada consulta
  }

  /* ---------- Arranque ---------- */
  cargarPrefs();
  $("#pie-apoyo").textContent = D.textos.pie_apoyo;
  if (Voz()) {
    Voz().alActividad = () => actividad();
    Voz().cancelarLecturaAuto = () => clearTimeout(tLectura);
    Voz().alAtras = () => atras();
    Voz().alSeguir = () => seguir();
    Voz().alBorrar = () => terminar();
    Voz().instalar();
  }
  render();
  sensores.vigilarUSB();
  sensores.reconectarSerial().catch(e => console.warn("No se reconectó el ESP32:", e.message));
  window.MediBot = {
    get sesion() { return sesion; }, get pantalla() { return actual; }, get impreso() { return impreso; }, get botones() { return botones; },
    ir, atras, terminar, sensores, config, imprimir, abrirOperador, pedirBorrar, pedirCerrarApp,
    evaluar: () => window.MediBotReglas.evaluar(sesion),
    recomendar: () => window.MediBotRecomendaciones.recomendar(sesion, window.MediBotReglas.evaluar(sesion), sesion.categorias)
  };
})();
