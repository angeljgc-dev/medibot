/* Pantallas de MediBot v0.5 (rediseño, docs/diseno/sistema.md §10).
   Cada función recibe ctx = { sesion, ir, atras, terminar, datos, sensores, resultado, actividad, config, opciones, impreso,
   imprimir, pedirBorrar, botonera, abrirOperador, tema, … } y devuelve un nodo con:
     _titulo   nombre de la pantalla en la cabecera;
     _botones  la botonera fija { azul, rojo, verde } (cada uno { texto, corto, rotulo, pic, id, fn, voz }): el botón de la
               pantalla hace lo mismo que el botón físico de su color (verde = si/siguiente, rojo = no o «rojo largo» = atras);
     _voz      { guion(), accion(id) → true si lo atendió } para la voz y los botones físicos (js/voz.js).
   Todo el contenido se arma con nodos (U.h), nunca con HTML. Dibujos: pictogramas del sprite (U.pic), nunca emoji. */
(function () {
  "use strict";
  const { h, icono, pic, fmt, fuenteEl } = window.U;
  const NIVEL_PIC = { verde: "p-nivel-verde", ambar: "p-nivel-ambar", rojo: "p-nivel-rojo" };
  const Rec = () => window.MediBotRecomendaciones;
  const Voz = () => window.MediBotVoz;
  const PIC = () => (window.MediBotData && window.MediBotData.pictos) || { secciones: {}, grupos: {}, tipos: {}, entradas: {}, alarma: {}, para_quien: {}, edades: {}, embarazo: {}, mediciones: {} };
  const hablar = (t) => { if (Voz()) Voz().leer(t); };
  const SINO = "Aprieta el botón verde para sí, o el rojo para no.";
  const enQuiosco = () => !!(window.medibotEscritorio && window.medibotEscritorio.esApp);

  /* ---------- Persona: "tú", "la persona" o "el niño o la niña" ---------- */
  function persona(s) {
    const q = s.paraQuien || "yo";
    return {
      q, yo: q === "yo",
      tercera: (t) => q === "yo" ? t : t.replace(/¿No tomas\b/g, "¿No toma").replace(/¿Tomas\b/g, "¿Toma").replace(/¿Usas\b/g, "¿Usa")
        .replace(/¿No sabes\b/g, "¿No sabe").replace(/no sabes\b/g, "no sabe").replace(/embarazarte\b/g, "embarazarse").replace(/¿Estás\b/g, "¿Está").replace(/¿estás\b/g, "¿está").replace(/Si eres mujer/g, "Si es mujer").replace(/crees que puedes\b/g, "cree que puede")
        .replace(/¿Tienes\b/g, q === "nino" ? "¿El niño o la niña tiene" : "¿La persona tiene").replace(/¿No estás\b/g, "¿No está").replace(/eres hombre/g, "es hombre")
        .replace(/¿Te han dicho que tienes\b/g, q === "nino" ? "¿Al niño o la niña le han dicho que tiene" : "¿A la persona le han dicho que tiene").replace(/que tomes poca agua/g, "que tome poca agua")
    };
  }
  const ETIQUETA_GRUPO_VOZ = { bebe: "menos de 3 meses", nino: "de 3 meses a 11 años", "12a17": "de 12 a 17 años", "18a59": "de 18 a 59 años", "60mas": "60 años o más" };
  const GRUPOS_POR_PERSONA = { yo: ["12a17", "18a59", "60mas"], nino: ["bebe", "nino", "12a17"], otra: null };
  // Peso creíble para la edad, como validación de entrada (docs/reglas_orientacion.md §«Peso de la báscula»)
  const RANGO_PESO = { menos2: [2, 20], "2a5": [8, 30], "6a11": [14, 80], "12a17": [25, 150], "18a59": [30, 250], "60mas": [30, 250], bebe: [1, 10] };

  /* ---------- Piezas comunes ---------- */
  const vista = (clase, ...hijos) => h("section.vista" + (clase || ""), ...hijos);
  const titulo = (t, ayuda) => h("div.titulo-pantalla", h("h1", t), ayuda ? h("p", ayuda) : null);
  const leerTodo = (nodo) => () => hablar(Voz() ? Voz().textoGenerico(nodo) : "");
  const AZUL = (extra) => Object.assign({ texto: "Escuchar", corto: "Oír", rotulo: "botón azul", pic: "p-escuchar", id: "repetir", fn: () => Voz() && Voz().leerPantalla() }, extra || {});
  const ATRAS = (ctx, extra) => Object.assign({ texto: "Atrás", corto: "Atrás", rotulo: "rojo largo", pic: "p-anterior", id: "atras", fn: ctx.atras, voz: "regresar" }, extra || {});
  const SIGUE = (texto, fn, extra) => Object.assign({ texto, corto: "Seguir", rotulo: "botón verde", pic: "p-siguiente", id: "siguiente", fn, voz: "seguir" }, extra || {});
  const SI = (fn, extra) => Object.assign({ texto: "Sí", corto: "Sí", rotulo: "botón verde", pic: "p-si", id: "si", fn, voz: "decir que sí" }, extra || {});
  const NO = (fn, extra) => Object.assign({ texto: "No", corto: "No", rotulo: "botón rojo", pic: "p-no", id: "no", fn, voz: "decir que no" }, extra || {});
  const origenSensor = (ctx) => (ctx.sensores.modo === "sim" ? "simulado" : "sensor"); // origen de la lectura

  function nivelTag(nivel, texto) {
    const largo = (t) => (String(t || "").length > 26 ? ".nivel--largo" : "");
    if (!nivel) { const t = texto || "Sin color"; return h("span.nivel.nivel--nd.nivel-tag--nd" + largo(t), h("span", { "aria-hidden": "true" }, "–"), t); }
    const n = window.MediBotData.textos.niveles[nivel]; const t = texto || n.nombre;
    return h("span.nivel.nivel--" + nivel + largo(t), pic(NIVEL_PIC[nivel]), t);
  }
  /** Texto de la etiqueta de UNA medición (no el nivel global); el mismo en pantalla, voz y hoja. */
  function textoMed(fila) {
    const E = window.MediBotData.textos.etiquetas_medicion;
    if (fila.estado === "invalida") return E.invalida;
    if (fila.fuera_semaforo && fila.etiqueta && !fila.nivel) return `${fila.etiqueta} · no cambia el semáforo`;
    if (!fila.clasificado || !fila.nivel) return fila.etiqueta ? `${fila.etiqueta} · ${E.nd}` : E.nd;
    const base = fila.etiqueta ? `${fila.etiqueta} · ${E[fila.nivel]}` : E[fila.nivel];
    return fila.prisa === "hoy" ? base + " hoy" : base;
  }
  const CORTO = { verde: "Esperado", ambar: "Revisar", rojo: "Urgente" };
  function medTag(fila, corto) {
    const clasificada = fila.estado !== "invalida" && fila.clasificado && fila.nivel;
    if (corto) return nivelTag(clasificada ? fila.nivel : null, fila.estado === "invalida" ? "No válida" : clasificada ? CORTO[fila.nivel] + (fila.prisa === "hoy" ? " hoy" : "") : "Sin semáforo"); // criterio 63
    return nivelTag(clasificada ? fila.nivel : null, textoMed(fila));
  }
  /** En voz, la misma etiqueta («Pulso 79: dentro de lo esperado»); sin clasificar, «sin color: lo revisa tu centro de salud». */
  function vozMed(nombre, valorTxt, fila) {
    if (fila.estado === "invalida") return `${nombre}: no válida.`;
    const sinColor = !fila.clasificado || !fila.nivel;
    // Criterio 39: sin «sin color» en la voz; en niñas y niños el valor se compara con el rango de su edad
    const t = sinColor ? "lo comparan en el centro de salud con el rango de su edad" : textoMed(fila).replace(/^./, c => c.toLowerCase());
    return `${nombre} ${valorTxt}: ${t}.`;
  }
  /* ---------- «¿A dónde voy?» (js/lugares.js): las mismas reglas en pantalla, voz y hoja ---------- */
  const Lug = () => window.MediBotLugares;
  function lineaEl(l, apoyo) {
    const el = h("div.telefono", { "data-voz": `${l.nombre}: ${l.voz}. ${l.nota || ""}`.trim(), "data-linea": l.id },
      pic("p-llamar-911"), h("div", h("div.num", l.numero), h("div", h("b", l.nombre), l.nota ? ["\u00a0· ", l.nota] : null)));
    if (l.destacado) el.classList.add("telefono--urgente");
    else if (apoyo && l.numero !== "911") el.classList.add("telefono--destacado");
    return el;
  }
  function unidadEl(nivel, cfg) {
    const L = Lug(); const u = L.unidadPara(nivel, cfg);
    if (!u) return null;
    const TL = L.textos();
    return h("div.tarjeta.lugar", { "data-voz": L.textoUnidad(cfg, "voz") },
      h("h2", h("span.etiqueta", pic("p-centro-salud"), TL.titulo)), h("p", h("b", TL.unidad_titulo + ": "), u.nombre_corto),
      h("ul", L.campos(cfg).map(c => h("li", { "data-campo": c.clave }, h("b", c.etiqueta + ": "), c.texto))));
  }
  const nombresFuentes = (fs) => (fs || []).map((f, j) => h("span", j ? "\u00a0· " : null, f.url && !enQuiosco() ? h("a", { href: f.url, target: "_blank", rel: "noopener" }, f.nombre) : f.nombre));
  function leyendaEl(T) {
    const L = T.leyenda_cofepris;
    return h("div.leyenda", L.mayusculas.map(l => h("p.leyenda__mayus", l)), h("p", L.linea), h("p.fuente", "Fundamento: ", nombresFuentes(L.fuentes)));
  }
  /** Recorrido de voz de la pantalla (opción por opción). Al tocar una opción, la voz dice lo elegido y sigue. */
  let recActivo = null;
  function recorrido(cfg) { recActivo = Voz() ? Voz().crearRecorrido(cfg) : null; return recActivo; }
  /** Botón de opción grande con dibujo opcional y cuadro de marca. */
  function opcionBtn(nombre, { dibujo, sub, pulsado, onclick, clase, marca = true }) {
    const b = h("button.opcion" + (clase || ""), { type: "button", "aria-pressed": String(!!pulsado), onclick: (e) => {
      onclick(e);
      const rec = recActivo; if (e && e.isTrusted && rec && typeof rec.tocado === "function" && b.getAttribute("aria-pressed") === "true") rec.tocado(nombre);
    } },
      dibujo ? pic(dibujo) : null,
      h("span.opcion__texto", h("b", nombre), sub ? h("small", sub) : null),
      marca ? h("span.opcion__marca", { "aria-hidden": "true" }, pic("p-si")) : null);
    return b;
  }
  /** Botones Sí / No dentro de una pregunta (forma y color fijos, como los botones físicos). */
  function sinoBtns(valor, alElegir) {
    const si = h("button.sn__si", { type: "button", "data-v": "si", "aria-pressed": String(valor === true), onclick: () => alElegir(true) }, pic("p-si"), "Sí");
    const no = h("button.sn__no", { type: "button", "data-v": "no", "aria-pressed": String(valor === false), onclick: () => alElegir(false) }, pic("p-no"), "No");
    return { si, no };
  }
  /** Acciones de «Qué hacer ahora» según el nivel y si la persona sigue un control de azúcar o presión. */
  function accionesPara(T, r, p) {
    const N = T.niveles[r.nivel];
    const hoy = r.nivel === "ambar" && r.prisa === "hoy";
    let acciones = (hoy ? N.acciones_hoy : N.acciones).slice();
    const cron = p && (p.cronico.azucar && p.cronico.presion ? T.cronico.ambos : p.cronico.azucar ? T.cronico.azucar : p.cronico.presion ? T.cronico.presion : null);
    if (cron && r.nivel === "verde") acciones = acciones.map(a => /una vez al año/.test(a) ? cron : a);
    else if (cron && r.nivel === "ambar") acciones.splice(2, 0, cron);
    return acciones.map(tratoPara(T, p));
  }
  /** Criterio 59: en la consulta para un niño, el texto le habla al adulto (data/textos.js, trato_nino). */
  function tratoPara(T, p) {
    const pares = p && (p.persona === "nino" || p.grupo === "nino") && Array.isArray(T.trato_nino) ? T.trato_nino : [];
    return (x) => pares.reduce((txt, [a, b]) => txt.split(a).join(b), String(x == null ? "" : x));
  }
  function lineaEmbarazo(T, s, p) {
    if (!p.embarazo) return null;
    const yo = persona(s).yo;
    if (p.senales.fiebre) return yo ? T.embarazo.linea_fiebre : T.embarazo.linea_fiebre_otra;
    return yo ? T.embarazo.linea : T.embarazo.linea_otra;
  }
  function motivosExtra(s, r) {
    if (s.grupo !== "nino") return [];
    const f = r.mediciones.find(m => m.id === "spo2" && m.estado === "valida" && m.valor != null);
    if (!f || f.valor >= 95 || f.valor < 90) return [];
    return [{ texto: `Oxígeno en la sangre: ${fmt(f.valor, 0)} %. En niñas y niños lo esperado es 95 % o más. Que lo revise personal de salud.`, fuente: f.fuente }];
  }
  /** El porqué del rojo en una línea corta (criterio 32): la frase corta de la pregunta, o la medición sin el rango. */
  function porqueCorto(T, motivos, N) {
    const m = motivos[0]; if (!m) return N.frase;
    if (m.pregunta) return (T.motivo_corto && T.motivo_corto[m.pregunta.id]) || "Dijiste que sí a una señal de urgencia";
    return String(m.texto).split(" (")[0];
  }
  /** Texto de una pregunta de alarma para quien contesta por otra persona (criterio 39): se le habla al adulto. */
  function textoAlarma(T, p, q) {
    const v = q === "nino" ? (T.alarma_nino_textos || {})[p.id] : null;
    if (q === "nino" && v) return v;
    if (q === "otra" && (T.alarma_nino_textos || {})[p.id]) {
      const conv = (x) => x && x.replace(/Al niño o la niña/g, "A la persona").replace(/al niño o la niña/g, "a la persona").replace(/el niño o la niña/g, "la persona").replace(/El niño o la niña/g, "La persona").replace(/\blo ves\b/g, "la ves").replace(/\blo escuche\b/g, "la escuche");
      return { texto: conv(T.alarma_nino_textos[p.id].texto), ayuda: conv(T.alarma_nino_textos[p.id].ayuda) };
    }
    return { texto: p.texto, ayuda: p.ayuda };
  }
  const sinFuentesLargas = (f) => (f && f.nombre ? f.nombre.split(/[,(]/)[0].trim() : "");
  const picPaso = (t) => /911/.test(t) ? "p-llamar-911" : /hoja/.test(t) ? "p-imprimir" : /embaraz|prenatal/.test(t) ? "p-embarazada" : /centro de salud|control|unidad|revisi/.test(t) ? "p-centro-salud" : "p-tipo-habito";

  /* ---------- 0. Reposo ---------- */
  function reposo(ctx) {
    const V = ctx.datos.textos.voz_corta;
    const nodo = vista(".reposo", { role: "button", tabindex: 0, "aria-label": "Toca para empezar", onclick: () => ctx.ir(), onkeydown: e => { if ((e.key === "Enter" || e.key === " ") && !e.repeat) { e.preventDefault(); e.stopPropagation(); ctx.ir(); } } }, // ya atendida: el atajo global no la repite
      h("div.reposo__dentro",
        h("h1", "MediBot"),
        h("ul.reposo__medidas", [["p-medir-oximetro", "Pulso y oxígeno"], ["p-medir-termometro", "Temperatura"], ["p-medir-bascula", "Peso"]].map(([id, t]) => h("li", pic(id), t))),
        h("p.reposo__lema", "Te medimos y te damos ideas para cuidarte. No es una consulta."),
        // el 911 siempre a la vista: si alguien borra un resultado rojo sin querer, el número sigue aquí
        h("p.reposo__urgencia", pic("p-llamar-911"), h("span", "¿Es urgente? Llama al ", h("b.num", "911"), ".")),
        h("div.consola", { "aria-hidden": "true" }, h("div.consola__teclas", h("span.consola__azul"), h("span.consola__rojo"), h("span.consola__verde")), h("p", "Aprieta el verde o toca la pantalla"))),
      window.medibotEscritorio ? cerrarApp(ctx) : null); // criterio 76: solo en la app de escritorio
    nodo._alMostrar = () => colocarCerrarApp(); // criterio 76
    // Cualquier botón que no sea el verde dice cómo empezar
    nodo._voz = { guion: () => V.reposo, accion(id) { if (id === "si" || id === "siguiente") { ctx.ir(); return true; } hablar(V.reposo); return true; } };
    return nodo;
  }

  /* ---------- Criterio 76: «Cerrar MediBot» en el reposo (mantenimiento de la PC; solo la app de escritorio) ----------
     Discreto, abajo a la derecha, fuera de la voz (.no-voz). Para que un niño no lo cierre sin querer: mantener apretado
     3 s (la barra se llena) y luego confirmar en un diálogo (js/app.js, pedirCerrarApp). Un toque corto no hace nada más
     que decir «Mantén apretado para cerrar». El clic nunca llega al reposo (que empieza la consulta); el teclado sí: con
     el foco aquí, Enter sigue siendo el verde y empieza la consulta. */
  const CERRAR_MS = 3000;
  function cerrarApp(ctx) {
    const lleno = h("span.cerrar-app__lleno");
    const aviso = h("span.cerrar-app__aviso", { role: "status", hidden: true }, "Mantén apretado para cerrar");
    const b = h("button.fantasma.cerrar-app.no-voz", { type: "button", "data-cerrar-app": "1", "aria-label": "Cerrar MediBot: mantén apretado 3 segundos" },
      icono("i-x"), h("span.cerrar-app__texto", h("span", "Cerrar MediBot"), h("small", "mantén apretado 3 segundos")),
      h("span.cerrar-app__barra", { "aria-hidden": "true" }, lleno));
    let inicio = 0, cuadro = 0, tAviso = 0;
    const pintar = (f) => { lleno.style.width = Math.round(Math.max(0, Math.min(1, f)) * 100) + "%"; };
    const parar = () => { cancelAnimationFrame(cuadro); cuadro = 0; inicio = 0; pintar(0); b.classList.remove("cerrar-app--apretando"); };
    const avisar = () => { aviso.hidden = false; clearTimeout(tAviso); tAviso = setTimeout(() => { aviso.hidden = true; }, 3000); };
    function paso() {
      if (!inicio) return;
      const f = (performance.now() - inicio) / CERRAR_MS; pintar(f);
      if (f >= 1) { parar(); if (document.contains(b)) ctx.pedirCerrarApp(); return; }
      cuadro = requestAnimationFrame(paso);
    }
    b.addEventListener("pointerdown", e => {
      e.stopPropagation();
      if (e.button !== 0) return;
      // Con el dedo, el navegador «captura» el toque en el botón y pointerleave no llegaría al deslizarlo fuera: se suelta
      if (b.hasPointerCapture && b.hasPointerCapture(e.pointerId)) b.releasePointerCapture(e.pointerId);
      parar(); aviso.hidden = true; b.classList.add("cerrar-app--apretando"); inicio = performance.now(); cuadro = requestAnimationFrame(paso);
    });
    // Respaldo: si el punto ya no está sobre el botón, se cancela (también con el dedo)
    b.addEventListener("pointermove", e => { if (!inicio) return; const r = b.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) parar(); });
    b.addEventListener("pointerup", e => { e.stopPropagation(); if (inicio) { parar(); avisar(); } });
    b.addEventListener("pointerleave", parar);
    b.addEventListener("pointercancel", parar);
    b.addEventListener("contextmenu", e => e.preventDefault()); // en pantalla táctil, mantener apretado no abre el menú
    // El clic (de un toque) no empieza la consulta ni cierra nada; el de teclado (Espacio) solo dice cómo se usa
    b.addEventListener("click", e => { e.stopPropagation(); e.preventDefault(); if (e.detail === 0) avisar(); });
    return h("div.cerrar-app__lugar", b, aviso);
  }
  /** Dónde va (sin tapar ni mover nada del reposo), en este orden: fijo en la esquina de abajo a la derecha; fijo en la
      esquina en su forma compacta (ícono arriba, texto angosto); al final del reposo, abajo a la derecha, si el reposo ya
      se desplazaba sin el botón (pantalla chica) o si ahí cabe sin hacer que se desplace (una barra nueva movería todo).
      Último recurso: al final del reposo aunque aparezca la barra (mejor que tapar el lema, el 911 o la consola). */
  function colocarCerrarApp() {
    const lugar = document.querySelector(".cerrar-app__lugar"); if (!lugar) return;
    const cont = document.getElementById("contenido");
    lugar.classList.remove("cerrar-app__lugar--compacto"); lugar.classList.add("cerrar-app__lugar--fijo"); // fuera del flujo
    const yaDesplaza = !!cont && cont.scrollHeight > cont.clientHeight + 1;
    // Se mide con el aviso «Mantén apretado para cerrar» puesto (invisible): tampoco él puede tapar nada cuando aparezca
    const aviso = lugar.querySelector(".cerrar-app__aviso"); const avisoOculto = aviso ? aviso.hidden : true;
    if (aviso) { aviso.style.visibility = "hidden"; aviso.hidden = false; }
    const cabe = () => [lugar.querySelector(".cerrar-app"), aviso].filter(Boolean).every(el => {
      const r = el.getBoundingClientRect();
      const tapa = [...document.querySelectorAll(".reposo__dentro > *")].some(e => { const x = e.getBoundingClientRect(); return !(r.right <= x.left || x.right <= r.left || r.bottom <= x.top || x.bottom <= r.top); });
      return !tapa && r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= document.documentElement.clientWidth;
    });
    const elegir = () => {
      if (cabe()) return;
      lugar.classList.add("cerrar-app__lugar--compacto"); if (cabe()) return;
      lugar.classList.remove("cerrar-app__lugar--fijo", "cerrar-app__lugar--compacto"); // al final del reposo
      if (yaDesplaza || !cont || cont.scrollHeight <= cont.clientHeight + 1) return;
      lugar.classList.add("cerrar-app__lugar--compacto"); if (cont.scrollHeight <= cont.clientHeight + 1) return;
      lugar.classList.remove("cerrar-app__lugar--compacto");
    };
    elegir();
    if (aviso) { aviso.hidden = avisoOculto; aviso.style.visibility = ""; }
  }
  window.addEventListener("resize", colocarCerrarApp);

  /* ---------- 1. Bienvenida ---------- */
  function bienvenida(ctx) {
    const B = ctx.datos.textos.bienvenida; const V = ctx.datos.textos.voz_corta;
    const cuerpo = h("div.bienvenida",
      titulo(B.titulo),
      h("p.gratis", pic("p-si"), B.gratis),
      h("div.dos",
        h("div.tarjeta", h("h2", "Lo que sí hago"), h("ul", B.que_es.map(t => h("li", t)))),
        h("div.tarjeta", h("h2", "Lo que no hago"), h("ul", B.que_no_es.map(t => h("li", t))))),
      h("p.aviso-incompleto", pic("p-llamar-911"), h("span", B.urgencia)),
      h("div.tarjeta.tarjeta--plana.privacidad", h("h2", B.privacidad_titulo), B.privacidad.map(p => h("p.ayuda", p))));
    const nodo = vista(".bienvenida-vista", cuerpo);
    nodo._titulo = "Antes de empezar";
    nodo._botones = {
      azul: AZUL({ texto: "Escuchar el aviso", fn: leerTodo(cuerpo) }), // el aviso completo se oye con el azul
      rojo: ATRAS(ctx, { texto: "Salir", corto: "Salir", fn: ctx.terminar, voz: "salir" }),
      verde: SIGUE(B.boton, () => ctx.ir(), { pic: "p-si", corto: "Empezar", voz: "empezar" })
    };
    nodo._voz = { guion: () => V.bienvenida, accion: () => false };
    return nodo;
  }

  /* ---------- 2. Sobre ti: para quién, edad y embarazo. El peso y la estatura van en «Te medimos» (criterio 41) ---------- */
  function sobreTi(ctx) {
    const s = ctx.sesion; const R = ctx.datos.rangos; const T = ctx.datos.textos; const PI = PIC();
    const gruposVisibles = () => { const ids = GRUPOS_POR_PERSONA[s.paraQuien || "otra"]; return ids ? R.grupos.filter(g => ids.includes(g.id)) : R.grupos; };

    const pqBtns = T.para_quien.opciones.map(o => opcionBtn(o.nombre, { dibujo: PI.para_quien[o.id], pulsado: s.paraQuien === o.id, onclick: () => {
      // Criterio 41: si cambia la persona, el peso y la estatura de la otra ya no sirven
      if (s.paraQuien && s.paraQuien !== o.id) { s.peso = { valor: null, origen: null }; s.talla = { valor: null, origen: null }; s.alarma = {}; } // criterio 54
      s.paraQuien = o.id;
      if (s.grupo && !gruposVisibles().some(g => g.id === s.grupo)) { s.grupo = null; s.edadNino = null; }
      refrescar();
    } }));
    const grupoBtns = R.grupos.map(g => opcionBtn(g.nombre, { dibujo: PI.edades[g.id], sub: g.sub, pulsado: s.grupo === g.id, onclick: () => { s.grupo = g.id; if (g.id !== "nino") s.edadNino = null; refrescar(); } }));
    const ninoBtns = T.edad_nino.opciones.map(o => opcionBtn(o.nombre, { pulsado: s.edadNino === o.id, onclick: () => { s.edadNino = o.id; refrescar(); } }));
    const embBtns = T.embarazo.opciones.map(o => opcionBtn(o.nombre, { dibujo: PI.embarazo[o.id], pulsado: s.embarazoOpcion === o.id, onclick: () => {
      s.embarazoOpcion = o.id; s.embarazoRespondido = true; s.embarazo = o.id === "si" ? true : o.id === "no_decir" ? null : false; s.lactancia = o.id === "lactancia"; refrescar();
    } }));

    const tituloEdad = h("h2"); const tituloEmb = h("h2");
    const ninoCard = h("div.bloque", { hidden: true }, h("h2", "¿De qué edad, más o menos?"), h("div.opciones", { role: "group", "aria-label": T.edad_nino.titulo }, ninoBtns));
    const embCard = h("div.bloque", { hidden: true }, tituloEmb, h("p.ayuda", T.embarazo.ayuda), h("div.opciones", { role: "group", "aria-label": T.embarazo.pregunta }, embBtns));

    const verde = () => SIGUE("Siguiente", () => ctx.ir(s.grupo === "bebe" ? "bebe" : undefined), { rotulo: "verde largo", deshabilitado: !s.grupo || (s.grupo === "nino" && !s.edadNino) });
    const botones = () => ({ azul: AZUL(), rojo: ATRAS(ctx), verde: verde() });
    let montado = false;
    function refrescar() {
      const P = persona(s);
      embCard.hidden = !(s.grupo === "12a17" || s.grupo === "18a59");
      if (embCard.hidden) { s.embarazo = null; s.embarazoOpcion = null; s.embarazoRespondido = false; s.lactancia = false; }
      pqBtns.forEach((b, i) => b.setAttribute("aria-pressed", String(s.paraQuien === T.para_quien.opciones[i].id)));
      const vis = gruposVisibles().map(g => g.id);
      grupoBtns.forEach((b, i) => { b.setAttribute("aria-pressed", String(s.grupo === R.grupos[i].id)); b.hidden = !vis.includes(R.grupos[i].id); });
      ninoBtns.forEach((b, i) => b.setAttribute("aria-pressed", String(s.edadNino === T.edad_nino.opciones[i].id)));
      embBtns.forEach((b, i) => b.setAttribute("aria-pressed", String(s.embarazoOpcion === T.embarazo.opciones[i].id)));
      tituloEdad.textContent = P.q === "nino" ? "¿Qué edad tiene el niño o la niña?" : P.q === "otra" ? "¿Cuántos años tiene la persona?" : "¿Cuántos años tienes?";
      tituloEmb.replaceChildren(P.yo ? T.embarazo.pregunta : T.embarazo.pregunta_otra, " ", h("small.ayuda", "(opcional)"));
      const abrioNino = ninoCard.hidden && s.grupo === "nino";
      ninoCard.hidden = s.grupo !== "nino";
      if (montado && abrioNino) ninoCard.scrollIntoView({ block: "nearest" }); // criterio 60
      if (montado) ctx.botonera(botones());
    }
    refrescar();

    const nodo = vista("",
      titulo("Cuéntame un poco de ti", "Solo lo necesario para comparar las mediciones con el rango de la edad. No pedimos tu nombre."),
      h("div.bloque", h("h2", T.para_quien.titulo), h("div.opciones", { role: "group", "aria-label": T.para_quien.titulo }, pqBtns)),
      h("div.bloque", tituloEdad, h("div.opciones", { role: "group", "aria-label": "Grupo de edad" }, grupoBtns)),
      ninoCard, embCard);
    nodo._titulo = "Sobre ti";
    nodo._botones = botones();
    nodo._alMostrar = () => { montado = true; };
    const listo = () => !(!s.grupo || (s.grupo === "nino" && !s.edadNino));
    nodo._voz = recorrido({
      intro: () => ctx.datos.textos.voz_corta.sobreTi,
      pasos: () => {
        const P = persona(s);
        const pasos = [
          { pregunta: T.para_quien.titulo, opciones: pqBtns.map((el, i) => ({ el, voz: T.para_quien.opciones[i].voz, nombre: T.para_quien.opciones[i].nombre })) },
          { opciones: grupoBtns.map((el, i) => ({ el, voz: P.tercera("¿Tienes " + ETIQUETA_GRUPO_VOZ[R.grupos[i].id] + "?"), nombre: R.grupos[i].nombre })) }
        ];
        if (s.grupo === "nino") pasos.push({ opciones: ninoBtns.map((el, i) => ({ el, voz: T.edad_nino.opciones[i].voz, nombre: T.edad_nino.opciones[i].nombre })) });
        if (!embCard.hidden) {
          const ix = (id) => T.embarazo.opciones.findIndex(o => o.id === id);
          const [si, no, lac] = [ix("si"), ix("no"), ix("lactancia")];
          // Criterio 43: la voz dice lo mismo que la pantalla, «Si eres mujer: …». El paso cuenta como contestado si se tocó
          // cualquier opción (criterio 67: tras tocar «No / soy hombre», el verde no vuelve a preguntar ni elige «Sí»).
          pasos.push({ respondido: () => !!s.embarazoOpcion, opciones: [{ el: embBtns[si], voz: P.tercera(T.embarazo.opciones[si].voz), nombre: "embarazo sí", alNo: () => {} }] });
          // Un rojo a «¿estás embarazada?» no dice si da pecho: se pregunta «Si eres mujer, ¿estás dando pecho?» (una mujer que da
          // pecho debe poder decirlo); el rojo ahí deja «No / soy hombre». Con «No / soy hombre» tocado no se pregunta (67).
          if (s.embarazoOpcion !== "si" && s.embarazoOpcion !== "no" && s.embarazoOpcion !== "no_decir") pasos.push({ siempre: true, opciones: [{ el: embBtns[lac], voz: P.tercera(T.embarazo.opciones[lac].voz_tras_no || T.embarazo.opciones[lac].voz), nombre: "dando pecho", alNo: () => { if (s.embarazoOpcion !== "lactancia") embBtns[no].click(); } }] });
        }
        return pasos;
      },
      final: () => listo() ? "Listo. ¿Seguimos? Aprieta el botón verde para continuar, o el rojo para revisar otra vez." : "Falta elegir la edad. Aprieta el botón rojo para revisar otra vez.",
      alFinal: () => { if (listo()) ctx.ir(s.grupo === "bebe" ? "bebe" : undefined); else hablar("Falta elegir la edad. Aprieta el botón rojo para revisar otra vez."); }
    });
    return nodo;
  }

  /* ---------- 2b. Medicinas de todos los días (no se guardan). Primero «¿Tomas alguna medicina?» ---------- */
  function medicinas(ctx) {
    const s = ctx.sesion; const T = ctx.datos.textos; const M = T.medicinas; const P = persona(s);
    if (!Array.isArray(s.medicinas)) s.medicinas = [];
    const pregunta = P.q === "nino" ? M.titulo_nino : P.q === "otra" ? M.titulo_otra : M.titulo;
    const ayuda = P.yo ? M.ayuda : M.ayuda_otra;
    const vozDe = (o) => (!P.yo && o.voz_otra ? o.voz_otra : P.tercera(o.voz));
    const nombreDe = (o) => (!P.yo && o.nombre_otra ? o.nombre_otra : o.nombre);
    const ops = M.opciones.filter(o => !o.solo_grupos || o.solo_grupos.includes(s.grupo));
    const exclusivas = ops.filter(o => o.exclusiva).map(o => o.id);
    const btns = ops.map(o => opcionBtn(o.nombre, { dibujo: o.id === "ninguna" ? "p-no" : null, pulsado: s.medicinas.includes(o.id), onclick: () => {
      if (o.exclusiva) s.medicinas = s.medicinas.includes(o.id) ? [] : [o.id];
      else { s.medicinas = s.medicinas.filter(m => !exclusivas.includes(m)); const i = s.medicinas.indexOf(o.id); if (i >= 0) s.medicinas.splice(i, 1); else s.medicinas.push(o.id); }
      pinta();
    } }));
    const cuenta = h("p.ayuda", { "aria-live": "polite" });
    const elegidas = () => ops.filter(o => s.medicinas.includes(o.id) && o.id !== "ninguna").map(o => o.nombre.toLowerCase());
    function pinta() {
      btns.forEach((b, i) => b.setAttribute("aria-pressed", String(s.medicinas.includes(ops[i].id))));
      const n = elegidas();
      cuenta.textContent = n.length ? "Elegiste: " + n.join(", ") + "." : s.medicinas.includes("ninguna") ? "Elegiste: ninguna." : M.nota;
    }
    pinta();
    const C = M.condiciones;
    if (!Array.isArray(s.condiciones)) s.condiciones = [];
    const tituloCond = P.q === "nino" ? C.titulo_nino : P.q === "otra" ? C.titulo_otra : C.titulo;
    const condBtns = C.opciones.map(o => opcionBtn(nombreDe(o), { pulsado: s.condiciones.includes(o.id), onclick: () => {
      const i = s.condiciones.indexOf(o.id); if (i >= 0) s.condiciones.splice(i, 1); else s.condiciones.push(o.id);
      pintaCond();
    } }));
    const cuentaCond = h("p.ayuda", { "aria-live": "polite" });
    function pintaCond() {
      condBtns.forEach((b, i) => b.setAttribute("aria-pressed", String(s.condiciones.includes(C.opciones[i].id))));
      const nombres = C.opciones.filter(o => s.condiciones.includes(o.id)).map(o => nombreDe(o).toLowerCase());
      cuentaCond.textContent = nombres.length ? "También: " + nombres.join(", ") + "." : C.ayuda;
    }
    pintaCond();

    let modo = s.medicinas.length || ctx.opciones.lista ? "lista" : "pregunta";
    const vistaPregunta = h("div.pregunta", pic("p-tipo-suplemento"), h("div", h("h2", pregunta), h("p.pregunta__ayuda", ayuda)));
    const vistaLista = h("div.medicinas-lista",
      h("div.bloque", h("h2", pregunta), h("p.ayuda", ayuda), h("div.opciones.opciones--med", { role: "group", "aria-label": pregunta }, btns), cuenta),
      h("div.bloque.condiciones", h("h2", tituloCond, " ", h("small.ayuda", "(opcional)")),
        h("div.opciones.opciones--med", { role: "group", "aria-label": tituloCond }, condBtns), cuentaCond));
    const caja = h("div");
    const rec = recorrido({
      intro: null,
      pasos: () => [
        { multiple: true, opciones: btns.map((el, i) => ({ el, voz: vozDe(ops[i]), nombre: ops[i].nombre, exclusiva: !!ops[i].exclusiva,
          // «Ninguna» ya se preguntó al principio; «No sé» se salta si ya marcó una medicina; con «Ninguna», nada de la lista
          saltar: () => ops[i].id === "ninguna" || s.medicinas.includes("ninguna") || (ops[i].exclusiva && s.medicinas.some(m => !exclusivas.includes(m)) ) })) },
        { multiple: true, pregunta: C.voz_intro, opciones: condBtns.map((el, i) => ({ el, voz: vozDe(C.opciones[i]), nombre: nombreDe(C.opciones[i]) })) }
      ],
      final: () => {
        const n = elegidas();
        const med = n.length ? `Elegiste: ${n.join(" y ")}.` : s.medicinas.includes("no_se") ? "Elegiste: no sé." : "No elegiste ninguna medicina.";
        const cond = s.condiciones.length ? cuentaCond.textContent : ""; // sin condiciones no se repite la ayuda
        return `${med} ${cond} ¿Seguimos? Verde: continuar. Rojo: revisar otra vez.`;
      },
      alFinal: () => ctx.ir()
    });
    function pintarModo() {
      caja.replaceChildren(modo === "pregunta" ? vistaPregunta : vistaLista);
      ctx.botonera(botones());
    }
    const botones = () => modo === "pregunta"
      ? { azul: AZUL(), rojo: NO(() => elegir(false)), verde: SI(() => elegir(true)) }
      : { azul: AZUL(), rojo: ATRAS(ctx), verde: SIGUE("Siguiente", () => ctx.ir(), { rotulo: "verde largo" }) };
    function elegir(toma) {
      if (!toma) { s.medicinas = ["ninguna"]; pinta(); }
      modo = "lista"; pintarModo();
      hablar(rec ? rec.guion() : "");
    }
    caja.replaceChildren(modo === "pregunta" ? vistaPregunta : vistaLista);
    const nodo = vista("", caja);
    nodo._titulo = "Tus medicinas";
    nodo._botones = botones();
    nodo._voz = {
      guion: () => modo === "pregunta" ? `${ayuda} ${pregunta} ${SINO}` : rec ? rec.guion() : "",
      accion(id) {
        if (modo === "pregunta") { if (id === "si" || id === "no") { elegir(id === "si"); return true; } return false; }
        return rec ? rec.accion(id) : false;
      },
      tocado: (n) => rec && rec.tocado(n)
    };
    recActivo = nodo._voz;
    return nodo;
  }

  /* ---------- 2c. Bebé menor de 3 meses ---------- */
  function bebe(ctx) {
    const R = ctx.datos.rangos;
    const nodo = vista("",
      h("div.heroe.heroe--ambar", { role: "status" }, h("span.heroe__forma", pic("p-nivel-ambar")), h("div", h("h1", "Que lo revise personal de salud"), h("p", R.mensaje_bebe))),
      unidadEl("ambar", Lug().actual()),
      h("div.bloque", h("h2", "Teléfonos"), h("div.lineas", Lug().lineas("ambar", Lug().actual()).map(l => lineaEl(l))),
        h("p.fuente", "Fuente: MedlinePlus (NIH), Cuando su bebé o lactante tenga fiebre")));
    nodo._titulo = "Bebés menores de 3 meses";
    nodo._botones = { azul: AZUL(), rojo: ATRAS(ctx, { texto: "Cambiar edad", corto: "Edad", fn: () => ctx.ir("sobreTi") }), verde: SIGUE("Terminar", ctx.terminar, { pic: "p-terminar", corto: "Fin", voz: "terminar" }) };
    nodo._voz = { guion: () => `${ctx.datos.textos.voz_corta.bebe} ${R.mensaje_bebe} ${Lug().textoVoz("ambar", Lug().actual())}`, accion: () => false };
    return nodo;
  }

  /* ---------- 3. Señales de alarma: una pregunta por pantalla ---------- */
  function alarma(ctx) {
    const s = ctx.sesion; const A = ctx.datos.alarma; const P = persona(s); const PI = PIC();
    const preguntas = A.preguntas.filter(p => window.MediBotReglas.aplicaPregunta(p, s));
    const n = preguntas.length;
    const contestada = (p) => s.alarma[p.id] === true || s.alarma[p.id] === false;
    const hayRojo = () => preguntas.some(p => p.nivel === "rojo" && s.alarma[p.id] === true);
    const corrigiendo = !!ctx.opciones.corregir;
    const primeraPendiente = (desde = 0) => { for (let k = desde; k < n; k++) if (!contestada(preguntas[k])) return k; for (let k = 0; k < desde; k++) if (!contestada(preguntas[k])) return k; return n; };
    let i = corrigiendo ? Math.max(0, preguntas.findIndex(p => s.alarma[p.id] === true)) : primeraPendiente();
    let ultimaRoja = preguntas.filter(p => p.nivel === "rojo" && s.alarma[p.id] === true).map(p => p.id).pop() || null;

    const intro = P.yo || P.q === "nino" ? A.intro : A.intro + " Responde por la persona que vamos a revisar.";
    const lineaNino = P.q === "nino" ? ctx.datos.textos.alarma_nino : "";
    const banner = h("div.aviso-rojo", { role: "alert", hidden: true }, pic("p-nivel-rojo"),
      h("div", h("h2", "Señal de urgencia"), h("p", "No necesitas seguir con las preguntas ni medir. Te decimos qué hacer ahora.")));
    const cuerpo = h("div.alarma__cuerpo");
    const corta = (p) => ((ctx.datos.textos.motivo_corto || {})[p.id] || p.texto).replace(/^¿|\?.*$/g, "").replace(/^(Ahorita|Hoy|De repente)\s+/i, "").toLowerCase();
    // La instrucción completa solo en la primera pregunta que se oye; después, «Verde sí, rojo no.»
    let dijoSino = false;
    const tx = (p) => textoAlarma(ctx.datos.textos, p, P.q);
    const textoPregunta = (k) => { const p = preguntas[k]; const sn = dijoSino ? "Verde sí, rojo no." : SINO; dijoSino = true; return `Pregunta ${k + 1} de ${n}. ${tx(p).texto} ${tx(p).ayuda || ""} ${sn}`; };
    // Criterio 54: si se llegó aquí desde «¿Está bien esto?» (preguntas nuevas tras cambiar a la persona), el verde regresa a revisar
    const aRevisar = ctx.volverA === "confirmar";
    const siguienteTexto = () => i < n ? textoPregunta(i) : `Ya respondiste todas las preguntas. Aprieta el botón verde para ${aRevisar ? "volver a revisar tus datos" : "continuar a medir"}.`;
    const textoUrgencia = () => { const p = preguntas.find(x => x.id === ultimaRoja) || preguntas.find(x => x.nivel === "rojo" && s.alarma[x.id] === true); return `Dijiste que sí a: ${p ? corta(p) : "una señal de urgencia"}. Verde: ver qué hacer ahora. Rojo: me equivoqué, era no.`; };
    function pinta() {
      banner.hidden = !hayRojo();
      if (i < n) {
        const p = preguntas[i];
        const resp = s.alarma[p.id];
        const avisoTel = p.telefono && resp === true ? h("p.aviso-linea", pic("p-llamar-911"), h("span", "Puedes llamar ahora a la ", h("b", "Línea de la Vida: " + p.telefono), ". Es gratis, confidencial y las 24 horas.")) : null;
        cuerpo.replaceChildren(h("div.pregunta", { class: "pregunta--" + p.nivel, "data-pregunta": p.id },
          pic(PI.alarma[p.id] || "p-grupo-cuerpo"),
          h("div", h("p.pregunta__n", `Pregunta ${i + 1} de ${n}`), h("h2", tx(p).texto), tx(p).ayuda ? h("p.pregunta__ayuda", tx(p).ayuda) : null,
            contestada(p) ? h("p.ayuda", "Contestaste: ", h("b", resp ? "Sí" : "No")) : null, avisoTel)));
      } else {
        const si = preguntas.filter(p => s.alarma[p.id] === true && p.nivel !== "apoyo");
        cuerpo.replaceChildren(h("div.pregunta", pic("p-si"), h("div", h("h2", "Ya contestaste las preguntas"),
          h("p.pregunta__ayuda", si.length ? "Dijiste que sí a: " + si.map(corta).join("; ") + "." : "Dijiste que no a todas."))));
      }
      ctx.botonera(botones());
      if (montadoA && !hayRojo()) { const q = cuerpo.querySelector("h2"); if (q) q.scrollIntoView({ block: "nearest" }); } // criterio 37
    }
    let montadoA = false;
    const botones = () => hayRojo()
      ? { azul: AZUL(), rojo: NO(() => quitarRoja(), { texto: "Me equivoqué", corto: "Era no", voz: "decir que te equivocaste" }),
          verde: SIGUE("Ver qué hacer ahora", () => ctx.ir("resultado"), { pic: "p-nivel-rojo", corto: "Qué hacer", id: "si", voz: "ver qué hacer ahora" }) }
      : i < n ? { azul: AZUL(), rojo: NO(() => responder(false)), verde: SI(() => responder(true)) }
        : { azul: AZUL(), rojo: ATRAS(ctx, { fn: () => { i = n - 1; pinta(); hablar(siguienteTexto()); } }), verde: aRevisar ? SIGUE("Volver a revisar", () => ctx.ir(), { corto: "Revisar", voz: "volver a revisar tus datos" }) : SIGUE("Continuar a medir", () => ctx.ir()) };
    function responder(v) {
      if (i >= n) return;
      const p = preguntas[i];
      s.alarma[p.id] = v;
      if (v && p.nivel === "rojo") {
        ultimaRoja = p.id; pinta();
        banner.scrollIntoView({ block: "center" });
        hablar(textoUrgencia()); return;
      }
      i = corrigiendo ? (i + 1 <= n ? i + 1 : n) : primeraPendiente(i + 1);
      if (corrigiendo && i < n && contestada(preguntas[i]) && preguntas.slice(i).every(contestada) && !preguntas.slice(i).some(x => s.alarma[x.id] === true)) i = n;
      pinta(); hablar(siguienteTexto());
    }
    function quitarRoja() {
      const p = preguntas.find(x => x.id === ultimaRoja) || preguntas.find(x => x.nivel === "rojo" && s.alarma[x.id] === true);
      if (!p) return;
      s.alarma[p.id] = false; ultimaRoja = preguntas.filter(x => x.nivel === "rojo" && s.alarma[x.id] === true).map(x => x.id).pop() || null;
      i = hayRojo() ? i : primeraPendiente(preguntas.indexOf(p) + 1);
      pinta();
      hablar(`Lo quitamos. Si te llega a pasar, llama al 9 1 1. ${hayRojo() ? textoUrgencia() : siguienteTexto()}`);
    }
    const nodo = vista(".alarma", titulo("Preguntas importantes", intro), banner,
      lineaNino ? h("p.contesta-por", { role: "note" }, pic("p-nino"), h("span", lineaNino)) : null, cuerpo);
    pinta();
    nodo._titulo = "Preguntas importantes";
    nodo._botones = botones();
    nodo._alMostrar = () => { montadoA = true; if (hayRojo()) banner.scrollIntoView({ block: "nearest" }); else { const q = cuerpo.querySelector("h2"); if (q) q.scrollIntoView({ block: "nearest" }); } };
    nodo._voz = {
      guion: () => {
        if (hayRojo()) return textoUrgencia();
        if (corrigiendo) {
          const si = preguntas.filter(p => s.alarma[p.id] === true);
          return `Revisa tus respuestas. ${si.length ? "Dijiste que sí a: " + si.map(corta).join(". ") + "." : "Dijiste que no a todas."} ${i < n ? textoPregunta(i) : "Aprieta el verde para seguir."}`;
        }
        dijoSino = false; // la intro de la pantalla (en pantalla sigue completa) se dice corta: la voz corta y la primera pregunta
        return `${ctx.datos.textos.voz_corta.alarma} ${P.yo || P.q === "nino" ? "" : "Responde por la persona que vamos a revisar. "}${lineaNino ? lineaNino + " " : ""}${siguienteTexto()}`;
      },
      accion(id) {
        if (hayRojo()) {
          if (id === "si" || id === "siguiente") { ctx.ir("resultado"); return true; }
          if (id === "no") { quitarRoja(); return true; }
          return false;
        }
        if (i < n && (id === "si" || id === "no")) { responder(id === "si"); return true; }
        if (id === "atras" && i > 0) { i = Math.min(i, n) - 1; pinta(); hablar(textoPregunta(i)); return true; }
        return false;
      }
    };
    return nodo;
  }

  /* ---------- 4. Mediciones: una a la vez (§6.9): pulso y oxígeno, temperatura y peso (criterio 41: la báscula solo pesa aquí) ---------- */
  function mediciones(ctx) {
    const s = ctx.sesion; const P = persona(s);
    const PREG = [P.yo ? "¿Medimos tu pulso y tu oxígeno? Pon el dedo índice en el sensor, sin apretar." : "¿Medimos el pulso y el oxígeno? Pon el dedo índice en el sensor, sin apretar.",
      P.yo ? "¿Medimos tu temperatura? Pon el sensor bajo el brazo, pegado a la piel." : "¿Medimos la temperatura? Pon el sensor bajo el brazo, pegado a la piel.",
      P.yo ? "¿Te pesamos? Súbete a la báscula, sin zapatos, y quédate quieto." : P.q === "nino" ? "¿Pesamos al niño o la niña? Que se suba solo a la báscula, sin zapatos." : "¿Pesamos a la persona? Que se suba sola a la báscula, sin zapatos."];
    let iVoz = Number.isInteger(ctx.opciones.medicion) ? ctx.opciones.medicion : 0;
    const avisoPendiente = h("p.aviso-incompleto", { role: "alert", hidden: true }, pic("p-alerta"), h("span", "Hay una medición fuera de lo esperado que falta confirmar. Mídela otra vez o sáltala con el rojo."));
    const bannerRojo = h("div.aviso-rojo", { role: "alert", hidden: true }, pic("p-nivel-rojo"),
      h("div", h("h2", "Señal de urgencia"), h("p", "Ya no necesitas medir más. Verde: ver qué hacer ahora.")));
    // Criterio 35: una medición urgente YA CONFIRMADA (estado «valida») lleva directo al resultado, como un «sí» en alarma
    const rojoAhora = () => {
      const medidas = Object.fromEntries(Object.entries(s.medidas).map(([k, m]) => [k, m && m.estado === "valida" ? m : { valor: null, origen: null, calidad: null, estado: null }]));
      return window.MediBotReglas.evaluar(Object.assign({}, s, { medidas })).nivel === "rojo";
    };
    const URGENTE = "Señal de urgencia. Ya no necesitas medir más. Verde: ver qué hacer ahora."; // = la franja (criterio 53)
    const vozTras = (k) => {
      if (rojoAhora()) return URGENTE;
      const api = tarjetas[k]._api;
      if (api.pendiente()) return "¿Medimos otra vez? Verde: medir otra vez. Rojo: saltar.";
      if (api.medida()) return "Verde: seguir. Rojo: medir otra vez.";
      return "Verde: medir. Rojo: saltar."; // no se pudo leer: la botonera dice Medir / Saltar (criterio 45)
    };
    const alTerminar = (k, mensaje, valores) => { pintar(); hablar(`${mensaje} ${valores} ${vozTras(k)}`); };
    const alCambiar = () => { if (montado && document.contains(nodo)) pintar(); }; // criterios 50 y 52
    const alMuestra = () => { if (montado && document.contains(nodo)) mostrarActivo(); };
    const tarjetas = [
      tarjetaMedida(ctx, { id: "fc", tipo: "pulso", n: 1, titulo: "Pulso y oxígeno", segundos: 30, instruccion: "Pon el dedo índice en el sensor, sin apretar, y no te muevas 30 segundos. Manos tibias, sin esmalte.", alMuestra, campos: [{ id: "fc", etiqueta: "Pulso (latidos por minuto)", min: 30, max: 220, step: 1, unidad: "latidos por minuto", voz: "Pulso", vozUnidad: "" }, { id: "spo2", etiqueta: "Oxígeno (%)", min: 70, max: 100, step: 1, unidad: "%", voz: "Oxígeno", vozUnidad: " %" }], alCambiar, alTerminar: (m, v) => alTerminar(0, m, v) }),
      tarjetaMedida(ctx, { id: "temp", tipo: "temp", n: 2, titulo: "Temperatura axilar", instruccion: "Coloca el sensor bajo el brazo (axila), pegado a la piel, y quédate quieto hasta que termine la cuenta. Es una medida aproximada.", alMuestra, campos: [{ id: "temp", etiqueta: "Temperatura (°C)", min: 34, max: 41.5, step: 0.1, unidad: "°C", voz: "Temperatura", vozUnidad: " °C" }], alCambiar, alTerminar: (m, v) => alTerminar(1, m, v) }),
      tarjetaPeso(ctx, { n: 3, alCambiar, alTerminar: (m, v) => alTerminar(2, m, v), activa: () => iVoz === 2 && document.contains(nodo) })
    ];
    const ninoNota = s.grupo === "nino" ? h("p.nota-limite", pic("p-alerta"), h("span", "En niñas y niños mostramos los valores con su rango de edad, sin semáforo. Solo avisamos si algo está muy fuera de lo esperado.")) : null;
    const resumenEl = h("div.bloque");
    const midiendo = () => tarjetas.some(t => t._api.midiendo);
    let montado = false;
    function pintar() {
      tarjetas.forEach((t, k) => { t.hidden = k !== iVoz; });
      resumenEl.hidden = iVoz < tarjetas.length;
      const rojo = rojoAhora() && !midiendo();
      if (montado && rojo && bannerRojo.hidden) hablar(URGENTE); // criterio 53: la voz lo dice en cuanto aparece la franja
      bannerRojo.hidden = !rojo;
      if (!hayPendientes(s)) avisoPendiente.hidden = true;
      if (iVoz >= tarjetas.length) {
        const R = ctx.datos.rangos.parametros; const Reg = window.MediBotReglas;
        const fila = (id, nombre, valor, tag) => h("div.medidas__fila", pic(PIC().mediciones[id]), h("div", h("span", nombre), h("b", valor)), tag);
        resumenEl.replaceChildren(h("h2", "Lo que medimos"), h("div.medidas", ["fc", "spo2", "temp"].map(id => {
          const m = s.medidas[id]; const cl = m.valor != null ? Reg.clasificar(id, m.valor, s.grupo) : null;
          return fila(id, R[id].nombre, m.estado === "invalida" ? "No válida" : m.valor != null ? fmt(m.valor, id === "temp" ? 1 : 0) + (id === "fc" ? " latidos por minuto" : id === "spo2" ? " %" : " °C") : "Sin medir",
            m.valor != null || m.estado === "invalida" ? medTag(Object.assign({ estado: m.estado }, cl || {})) : null);
        }), fila("peso", "Peso", s.peso.valor ? fmt(s.peso.valor, 1) + " kg" : "Sin pesar", null)));
      }
      ctx.botonera(botones());
      if (montado && document.contains(nodo)) { mostrarActivo(); requestAnimationFrame(() => { if (document.contains(nodo)) mostrarActivo(); }); } // criterio 62: otra vez cuando ya se acomodó
    }
    // Criterio 37: si no cabe, la pantalla se desplaza sola a lo que importa (la medición activa, o la franja roja)
    function mostrarActivo() {
      if (!bannerRojo.hidden) { bannerRojo.scrollIntoView({ block: "nearest" }); return; }
      const t = tarjetas[iVoz]; if (!t) return;
      const v = t.querySelector(".medicion__valor"); const e = t.querySelector(".medicion__etiquetas");
      const est = t.querySelector(".medicion__estado");
      if (midiendo() && est) est.scrollIntoView({ block: "nearest" }); // midiendo: la cuenta y el estado a la vista (criterio 62)
      else if (e && e.childNodes.length) e.scrollIntoView({ block: "nearest" });
      if (v) v.scrollIntoView({ block: "nearest" });
    }
    const verdeUrgente = () => SIGUE("Ver qué hacer ahora", () => ctx.ir("resultado"), { pic: "p-nivel-rojo", corto: "Qué hacer", id: "si", voz: "ver qué hacer ahora" });
    const botones = () => {
      if (!midiendo() && rojoAhora()) return { azul: AZUL(), rojo: iVoz < tarjetas.length ? NO(() => medirAhora(), { texto: "Medir otra vez", corto: "Otra", voz: "medir otra vez" }) : ATRAS(ctx, { fn: () => { iVoz = tarjetas.length - 1; pintar(); hablar(preguntaVoz()); } }), verde: verdeUrgente() };
      if (iVoz >= tarjetas.length) return { azul: AZUL(), rojo: ATRAS(ctx, { fn: () => { iVoz = tarjetas.length - 1; pintar(); hablar(preguntaVoz()); } }), verde: SIGUE("Continuar", continuar) };
      const api = tarjetas[iVoz]._api;
      if (api.borrador && api.borrador()) return { azul: AZUL(), rojo: NO(() => { api.descartar(); pintar(); }, { texto: "Borrar", corto: "Borrar", voz: "borrar lo escrito" }),
        verde: SIGUE("Usar este valor", () => { api.confirmarManual(); pintar(); hablar(preguntaVoz()); }, { pic: "p-si", corto: "Usar", id: "si", voz: "usar el valor escrito" }) }; // criterio 56
      const saltar = NO(() => { api.cancelar(); api.omitir(); avanzar(); }, { texto: "Saltar", corto: "Saltar", voz: "saltar esta medición" }); // criterio 36: saltar omite de verdad
      if (midiendo()) return { azul: AZUL(), rojo: saltar, verde: SIGUE("Midiendo…", () => hablar(api.faltaTexto()), { pic: "p-si", corto: "Midiendo", id: "si" }) };
      if (api.medida() && !api.pendiente()) return { azul: AZUL(), rojo: NO(() => medirAhora(), { texto: "Medir otra vez", corto: "Otra", voz: "medir otra vez" }), verde: SIGUE("Siguiente", () => avanzar()) };
      return { azul: AZUL(), rojo: saltar, verde: SIGUE(api.medida() ? "Medir otra vez" : "Medir", () => medirAhora(), { pic: "p-si", corto: "Medir", id: "si", voz: "medir" }) };
    };
    // La voz dice lo mismo que la botonera (criterio 45)
    const preguntaVoz = () => {
      if (!midiendo() && rojoAhora()) return URGENTE;
      if (iVoz >= tarjetas.length) return "Listo. ¿Seguimos? Aprieta el botón verde para continuar, o el rojo para regresar.";
      const api = tarjetas[iVoz]._api;
      if (api.pendiente()) return `${api.valoresVoz()} ¿Medimos otra vez? Verde: medir otra vez. Rojo: saltar.`;
      if (api.medida()) return `Ya tenemos: ${api.valoresVoz()} Verde: seguir. Rojo: medir otra vez.`;
      return `${PREG[iVoz]} ${SINO}`;
    };
    function avanzar() { iVoz = Math.min(iVoz + 1, tarjetas.length); pintar(); hablar(preguntaVoz()); }
    function medirAhora() {
      if (!document.contains(nodo)) return; hablar("Midiendo. No te muevas."); tarjetas[iVoz]._api.medir().then(pintar); setTimeout(pintar, 0); }
    function continuar() {
      if (rojoAhora()) { ctx.ir("resultado"); return; }
      if (hayPendientes(s)) { avisoPendiente.hidden = false; avisoPendiente.scrollIntoView({ block: "center" }); hablar(avisoPendiente.textContent); return; }
      ctx.ir();
    }
    const nodo = vista(".mediciones", titulo("Vamos a medir", s.grupo === "nino" ? "Puedes medir con el sensor, escribir el valor si ya lo sabes, u omitirlo. En niñas y niños los valores se comparan con el rango de su edad." : P.yo ? "Puedes medir con el sensor, escribir el valor si ya lo sabes, u omitirlo. Si omites, el resultado no podrá ser verde: te lo diremos con honestidad." : "Puedes medir con el sensor, escribir el valor si ya lo sabes, u omitirlo. Si omites, el resultado no podrá ser verde."),
      bannerRojo, ninoNota, tarjetas, resumenEl, avisoPendiente);
    pintar();
    nodo._titulo = "Te medimos";
    nodo._botones = botones();
    nodo._alMostrar = () => { montado = true; mostrarActivo(); };
    nodo._voz = {
      guion: () => `${ctx.datos.textos.voz_corta.mediciones} ${preguntaVoz()}`,
      accion(id) {
        if (midiendo()) {
          const t = tarjetas.find(x => x._api.midiendo);
          if (id === "no" && t) { t._api.cancelar(); t._api.omitir(); avanzar(); return true; } // el rojo dice «Saltar»: salta
          if (id === "si" || id === "siguiente") { hablar(t ? t._api.faltaTexto() : "Estamos midiendo. No te muevas."); return true; }
          return false;
        }
        if (id === "atras" && iVoz > 0) { iVoz--; pintar(); hablar(preguntaVoz()); return true; }
        return false; // sí / no = los botones de la botonera
      }
    };
    return nodo;
  }
  function hayPendientes(s) { return ["fc", "spo2", "temp"].some(k => s.medidas[k].estado === "confirmar"); }
  /** Cuenta de la temperatura en palabras y con unidad (criterio 47): «hasta 3 minutos», «menos de un minuto». */
  const cuentaLarga = (seg) => seg > 60 ? `hasta ${Math.ceil(seg / 60)} minutos` : seg > 0 ? "menos de un minuto" : "unos segundos";

  function tarjetaMedida(ctx, cfg) {
    const s = ctx.sesion; const T = ctx.datos.textos; const R = ctx.datos.rangos.parametros; const Reg = window.MediBotReglas;
    const valorEl = h("div.medicion__valor.num", { "aria-live": "polite" }, "—");
    const estado = h("p.medicion__estado", cfg.instruccion);
    const barra = h("div.progreso", { role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": 0, "aria-label": "Avance de la medición", hidden: true }, h("span"));
    const manual = h("div.manual", { hidden: true });
    const btnManual = h("button.fantasma", { type: "button", onclick: () => { manual.hidden = !manual.hidden; if (!manual.hidden) manual.querySelector("input").focus(); } }, icono("i-text"), "Escribir a mano");
    const btnOmitir = h("button.fantasma", { type: "button", onclick: () => { omitir(); if (cfg.alCambiar) cfg.alCambiar(); } }, "Omitir");
    const tags = h("div.medicion__etiquetas");
    const intentos = { n: 0, lecturas: [] };
    let midiendo = false; let faltan = null; let cancelada = false; let borrador = false;
    function confirmarManual() { manual.querySelectorAll("input").forEach(i => { if (i._confirmar) i._confirmar(); }); borrador = false; pintar(); }
    function descartar() { borrador = false; manual.querySelectorAll("input").forEach(i => { const m = s.medidas[i.id.replace("m-", "")]; i.value = m && m.valor != null ? m.valor : ""; }); estado.textContent = cfg.instruccion; }

    for (const c of cfg.campos) {
      const inp = h("input", { type: "number", id: "m-" + c.id, inputmode: "decimal", min: c.min, max: c.max, step: c.step, value: s.medidas[c.id].valor ?? "",
        oninput: () => { borrador = true; estado.textContent = "Para usar este valor, aprieta el verde (o Enter)."; if (cfg.alCambiar) cfg.alCambiar(); },
        onkeydown: e => { if (e.key === "Enter") { e.preventDefault(); confirmarManual(); if (cfg.alCambiar) cfg.alCambiar(); } } });
      inp._confirmar = () => { const v = parseFloat(inp.value); const ok = Number.isFinite(v) && v >= c.min && v <= c.max;
        s.medidas[c.id] = Number.isFinite(v) ? (ok ? { valor: v, origen: "manual", calidad: null, estado: "valida", intentos: 1 } : { valor: null, origen: "manual", calidad: null, estado: "invalida", nota: `Fuera de lo que puede medir el aparato (${c.min} a ${c.max}).`, intentos: 1 })
          : { valor: null, origen: null, calidad: null, estado: null };
        estado.textContent = Number.isFinite(v) ? "Escrito a mano." : cfg.instruccion; // criterio 37: el estado corto, cerca del número
      };
      manual.appendChild(h("div.campo", h("label", { for: "m-" + c.id }, c.etiqueta), inp));
    }
    function omitir() {
      for (const c of cfg.campos) {
        const m = s.medidas[c.id];
        const urgente = m && m.estado === "confirmar" && m.valor != null && Reg.clasificar(c.id, m.valor, s.grupo).nivel === "rojo";
        // Una lectura urgente que no se confirmó no se borra sin rastro: queda «no válida» y el resultado lo dice
        s.medidas[c.id] = urgente ? { valor: null, origen: m.origen, calidad: null, estado: "invalida", nota: `Salió ${fmt(m.valor, c.step < 1 ? 1 : 0)} ${c.unidad}, fuera de lo esperado, y no se confirmó.`, intentos: m.intentos }
          : { valor: null, origen: null, calidad: null, estado: null };
      }
      manual.querySelectorAll("input").forEach(i => { i.value = ""; }); estado.textContent = s.grupo === "nino" ? "Omitido. Lo diremos en su hoja." : "Omitido. Lo diremos en el resultado: sin esta medición el resultado no puede ser verde."; pintar();
    }
    const fila = (c) => { const m = s.medidas[c.id]; const cl = m.valor != null ? Reg.clasificar(c.id, m.valor, s.grupo) : {}; return Object.assign({ estado: m.estado }, cl); };
    function valoresVoz() {
      return cfg.campos.map(c => { const m = s.medidas[c.id]; if (m.estado === "invalida") return `${c.voz}: no válida.`; if (m.valor == null) return ""; return vozMed(c.voz, fmt(m.valor, c.step < 1 ? 1 : 0) + c.vozUnidad, fila(c), s); }).filter(Boolean).join(" ");
    }
    function pintar() {
      tags.replaceChildren();
      const partes = [];
      for (const c of cfg.campos) {
        const m = s.medidas[c.id];
        if (m.estado === "invalida") { tags.appendChild(h("span", R[c.id].nombre + ": ", medTag({ estado: "invalida" }))); continue; }
        if (m.valor === null || m.valor === undefined) continue;
        partes.push([fmt(m.valor, c.step < 1 ? 1 : 0), h("small", c.unidad)]);
        tags.appendChild(h("span", c.voz + ": ", medTag(fila(c)))); // nombre corto: la etiqueta cabe a 375 con letra grande
      }
      valorEl.classList.toggle("medicion__valor--vacio", !partes.length);
      valorEl.replaceChildren(...(partes.length ? partes.flatMap((x, i) => i ? ["  ·  ", ...x] : x) : ["Sin medir"]));
      valorEl.dataset.voz = valoresVoz() || "Sin medir.";
    }
    function registrar(lectura) {
      intentos.n++; intentos.lecturas.push(lectura);
      const ids = cfg.campos.map(c => c.id); const origen = origenSensor(ctx);
      const nivelDe = (l) => ids.reduce((peor, id) => Reg.peorNivel(peor, Reg.clasificar(id, l[id], s.grupo).nivel), null);
      const fueraDeRango = ids.some(id => { const c = Reg.clasificar(id, lectura[id], s.grupo); return c.clasificado && c.nivel !== "verde"; });
      const prev = intentos.lecturas.length > 1 ? intentos.lecturas[intentos.lecturas.length - 2] : null;
      let msg = "Listo.";
      if (prev) {
        const discordante = ids.some(id => Math.abs(lectura[id] - prev[id]) > (R[id].discordancia || Infinity));
        if (discordante) {
          if (intentos.n >= 3) { ids.forEach(id => { s.medidas[id] = { valor: null, origen, calidad: null, estado: "invalida", nota: "Tres lecturas que no coincidieron.", intentos: intentos.n }; }); estado.textContent = "Las lecturas no coincidieron tres veces. La medición no es válida; lo diremos en el resultado. Puedes escribirla a mano si la conoces."; pintar(); return; }
          ids.forEach(id => { s.medidas[id] = { valor: lectura[id], origen, calidad: lectura.calidad, estado: "confirmar", intentos: intentos.n }; });
          estado.textContent = `Las dos lecturas no coincidieron. Descansa un momento y mide una vez más (intento ${intentos.n} de 3).`; pintar(); return;
        }
        const peor = window.MediBotReglas.ORDEN[nivelDe(lectura) || "verde"] >= window.MediBotReglas.ORDEN[nivelDe(prev) || "verde"] ? lectura : prev;
        ids.forEach(id => { s.medidas[id] = { valor: peor[id], origen, calidad: peor.calidad, estado: "valida", intentos: intentos.n }; });
        msg = "Confirmado con dos lecturas.";
      } else {
        ids.forEach(id => { s.medidas[id] = { valor: lectura[id], origen, calidad: lectura.calidad, estado: fueraDeRango ? "confirmar" : "valida", intentos: intentos.n }; });
        if (fueraDeRango) msg = "Salió fuera de lo esperado. Para estar seguros, descansa un momento y vuelve a medir.";
      }
      if (lectura.calidad < .8 && msg === "Listo.") msg = "Listo, pero la señal fue regular. Si puedes, repite.";
      estado.textContent = msg;
      manual.querySelectorAll("input").forEach(i => { const id = i.id.replace("m-", ""); if (s.medidas[id].valor != null) i.value = s.medidas[id].valor; });
      pintar();
    }
    const avisar = () => { if (cfg.alTerminar && document.contains(nodo)) cfg.alTerminar(estado.textContent, valoresVoz()); }; // criterio 52
    const cuentaTxt = () => cfg.tipo === "temp" ? `Midiendo. No te muevas. Falta poco: ${cuentaLarga(faltan)}.` : `Midiendo. No te muevas. Faltan ${faltan} segundos.`;
    async function medir() {
      if (midiendo) return;
      if (ctx.sensores.modo === "desconectado") {
        estado.textContent = ctx.sensores.disponibleSerial ? "No hay sensor conectado. Pide ayuda a alguien que esté cerca, o escribe el valor a mano." : "Este navegador no puede leer el USB: usa la aplicación de escritorio MediBot.exe. Mientras, escribe el valor a mano.";
        manual.hidden = false; avisar(); return;
      }
      if (intentos.n >= 3) { estado.textContent = "Ya se hicieron 3 intentos. Escribe el valor a mano o sáltala."; avisar(); return; }
      midiendo = true; barra.hidden = false; faltan = cfg.segundos || 180;
      estado.textContent = cuentaTxt();
      const cuenta = cfg.tipo === "temp" ? null : setInterval(() => { if (!midiendo) return; faltan = Math.max(0, faltan - 1); estado.textContent = cuentaTxt(); }, 1000);
      try {
        const r = await ctx.sensores.medir(cfg.tipo, cfg.tipo === "temp" ? 180 : cfg.segundos, m => {
          if (!midiendo) return;
          ctx.actividad();
          const pct = cfg.tipo === "temp" ? Math.round((m.progreso || 0) * 100) : Math.round((m.calidad || 0) * 100);
          barra.firstChild.style.width = pct + "%"; barra.setAttribute("aria-valuenow", pct);
          if (cfg.tipo === "temp") { if (Number.isFinite(m.faltan)) faltan = m.faltan; estado.textContent = m.estable ? "Ya casi." : cuentaTxt(); valorEl.replaceChildren(fmt(m.valor, 1), h("small", "°C")); }
          else valorEl.replaceChildren(fmt(m.valor, 0), h("small", "latidos por minuto"), "  ", fmt(m.valor2, 0), h("small", "%"));
          if (cfg.alMuestra) cfg.alMuestra(); // criterio 62: mientras mide, el número y la cuenta siguen a la vista
        });
        if (cancelada) { /* la persona saltó la medición: lo que llegue después no se guarda */ }
        else if (r && r.estado === "invalida") {
          s.medidas.temp = { valor: null, origen: origenSensor(ctx), calidad: 0, estado: "invalida", nota: "La temperatura no se estabilizó.", intentos: ++intentos.n };
          estado.textContent = "La temperatura no se estabilizó. La medición no es válida; lo diremos en el resultado. Puedes medir otra vez o escribirla a mano.";
          pintar();
        } else {
          const lectura = cfg.tipo === "pulso" ? { fc: Math.round(r.valor), spo2: r.valor2, calidad: r.calidad } : { temp: Math.round(r.valor * 10) / 10, calidad: r.calidad };
          registrar(lectura);
        }
      } catch (e) {
        if (!cancelada) estado.textContent = "No pude leer bien. Revisa que el sensor esté bien puesto y vuelve a intentar, o escribe el valor a mano.";
      }
      if (cuenta) clearInterval(cuenta);
      if (cancelada) { cancelada = false; return; }
      midiendo = false; barra.hidden = true;
      avisar();
    }
    function cancelar() {
      if (!midiendo) return;
      cancelada = true; midiendo = false; barra.hidden = true;
      estado.textContent = "Saltaste esta medición. Puedes volver a ella con el rojo largo.";
    }
    pintar();
    const limit = T.limitaciones_medicion[cfg.id === "fc" ? "spo2" : cfg.id] + (cfg.id === "fc" && ctx.config.altitud >= 1500 ? " " + R.spo2.nota_altitud : "");
    const nodo = h("div.medicion", { "data-medicion": cfg.id },
      pic(PIC().mediciones[cfg.id]),
      h("div.medicion__cuerpo", h("p.medicion__n", `Medición ${cfg.n} de 3`), h("h2.medicion__nombre", cfg.titulo), valorEl, estado, barra, tags),
      h("div.medicion__extra", h("div.medicion__acciones", btnManual, btnOmitir), manual, h("p.nota-limite", pic("p-alerta"), h("span", limit))));
    nodo._api = {
      medir, cancelar, omitir, confirmarManual, descartar, borrador: () => borrador, get midiendo() { return midiendo; }, ids: cfg.campos.map(c => c.id),
      medida: () => cfg.campos.some(c => s.medidas[c.id].valor != null || s.medidas[c.id].estado === "invalida"),
      pendiente: () => cfg.campos.some(c => s.medidas[c.id].estado === "confirmar"),
      valoresVoz,
      faltaTexto: () => cfg.tipo === "temp" ? `Estamos midiendo; faltan como máximo ${Math.ceil((faltan ?? 180) / 60)} minutos. No te muevas.` : `Estamos midiendo; faltan ${faltan ?? 0} segundos. No te muevas.`
    };
    return nodo;
  }

  /** Peso y estatura (criterio 41): la báscula solo pesa aquí, solo si es la medición activa, si nadie escribió el peso y
      nunca a un niño o niña sola (lo pesa quien lo acompaña con el botón); fuera del rango creíble para la edad no se guarda. */
  function tarjetaPeso(ctx, cfg) {
    const s = ctx.sesion;
    const valorEl = h("div.medicion__valor.num", { "aria-live": "polite" });
    const P2 = persona(s);
    const estado = h("p.medicion__estado", P2.yo ? "Súbete a la báscula, sin zapatos, y quédate quieto. Si ya sabes tu peso, escríbelo." : P2.q === "nino" ? "Que se suba el niño o la niña a la báscula, sin zapatos, y se quede quieto. Si ya sabes su peso, escríbelo." : "Que se suba la persona a la báscula, sin zapatos. Si ya sabes su peso, escríbelo.");
    const tags = h("div.medicion__etiquetas");
    const imcOut = h("p.ayuda", { "aria-live": "polite" });
    const peso = h("input", { type: "number", id: "peso", inputmode: "decimal", min: 2, max: 300, step: "0.1", placeholder: "kg", value: s.peso.valor ?? "", oninput: e => { s.peso = { valor: parseFloat(e.target.value) || null, origen: "manual" }; pintar(); if (cfg.alCambiar) cfg.alCambiar(); } });
    const talla = h("input", { type: "number", id: "talla", inputmode: "numeric", min: 40, max: 250, step: "1", placeholder: "cm", value: s.talla.valor ?? "", oninput: e => { s.talla = { valor: parseFloat(e.target.value) || null, origen: "manual" }; pintar(); } });
    const manual = h("div.formulario",
      h("div.campo", h("label", { for: "peso" }, "Peso en kilos"), peso, h("span.ayuda", "Si lo sabes, escríbelo."), h("span.error")),
      h("div.campo", h("label", { for: "talla" }, "Estatura en centímetros"), talla, h("span.ayuda", "Si no la sabes, déjala vacía."), h("span.error")));
    let midiendo = false; let cancelada = false;
    const rangoPeso = () => RANGO_PESO[s.grupo === "nino" ? s.edadNino : s.grupo] || [2, 300];
    function pintar() {
      valorEl.classList.toggle("medicion__valor--vacio", !s.peso.valor);
      valorEl.replaceChildren(...(s.peso.valor ? [fmt(s.peso.valor, 1), h("small", "kg")] : ["Sin pesar"]));
      valorEl.dataset.voz = s.peso.valor ? `Peso: ${fmt(s.peso.valor, 1)} kilos.` : "Sin pesar.";
      const imc = window.MediBotReglas.imcDe(s.peso.valor, s.talla.valor);
      imcOut.textContent = imc ? `El índice de masa corporal (IMC) sería ${fmt(imc, 1)}. Es solo una pista; lo explicamos al final, fuera del semáforo.` : s.peso.valor ? "Para el IMC falta la estatura (es opcional)." : "";
      if (document.activeElement !== peso && s.peso.valor != null && String(peso.value) !== String(s.peso.valor)) peso.value = s.peso.valor;
    }
    async function medir() {
      if (ctx.sensores.modo === "desconectado") { estado.textContent = "No hay báscula conectada. Escribe el peso o sáltalo."; if (cfg.alTerminar) cfg.alTerminar(estado.textContent, ""); return; }
      if (midiendo) return; midiendo = true; cancelada = false;
      estado.textContent = "Pesando: quédate quieto…";
      try {
        const r = await ctx.sensores.medir("peso", 12, m => { if (!midiendo) return; estado.textContent = `${m.estable ? "Casi" : "Leyendo"}… ${fmt(m.valor, 1)} kg`; ctx.actividad(); });
        const [min, max] = rangoPeso();
        if (cancelada) { /* saltada */ }
        else if (s.peso.origen === "manual") estado.textContent = "Se queda el peso que escribiste."; // lo escrito a mano manda
        else if (!(r.valor >= min && r.valor <= max)) { const t = "¿Se subió alguien más? Deja solo a la persona en la báscula y vuelve a pesar."; estado.textContent = t; hablar(t); }
        else { s.peso = { valor: r.valor, origen: origenSensor(ctx) }; estado.textContent = r.calidad >= 1 ? "Listo." : "Listo, pero hubo movimiento; si puedes, vuelve a subirte."; }
      } catch (e) { if (!cancelada) estado.textContent = "No se pudo leer la báscula. Escribe el peso o sáltalo."; }
      const eraCancelada = cancelada; midiendo = false; cancelada = false;
      pintar();
      if (!eraCancelada && cfg.alTerminar) cfg.alTerminar(estado.textContent, valorEl.dataset.voz);
    }
    // Pesado automático: solo con esta tarjeta en pantalla, sin peso escrito y nunca con un niño o niña
    const alSubirse = (e) => {
      if (!document.contains(nodo)) { ctx.sensores.removeEventListener("muestra", alSubirse); return; }
      const m = e.detail; if (m.t !== "peso" || midiendo || s.peso.origen || s.grupo === "nino" || !s.paraQuien || !cfg.activa()) return;
      if (typeof m.kg === "number" && m.kg >= 5) { medir().then(() => cfg.alCambiar && cfg.alCambiar()); if (cfg.alCambiar) cfg.alCambiar(); }
    };
    ctx.sensores.addEventListener("muestra", alSubirse);
    if (ctx.sensores.modo === "sim" && typeof ctx.sensores.pesoSimulado === "function") { const [a, b] = rangoPeso(); ctx.sensores.pesoSimulado(Math.min(b, Math.max(a, s.grupo === "nino" ? (a + b) / 3 : 70))); }
    pintar();
    const nodo = h("div.medicion", { "data-medicion": "peso" },
      pic(PIC().mediciones.peso),
      h("div.medicion__cuerpo", h("p.medicion__n", `Medición ${cfg.n} de 3`), h("h2.medicion__nombre", "Peso y estatura ", h("small.ayuda", "(opcional)")), valorEl, estado, tags, imcOut),
      h("div.medicion__extra", manual, h("p.nota-limite", pic("p-alerta"), h("span", ctx.datos.textos.limitaciones_medicion.imc))));
    nodo._api = {
      medir, get midiendo() { return midiendo; }, ids: [],
      cancelar() { if (midiendo) { cancelada = true; midiendo = false; estado.textContent = "Saltaste el peso."; } },
      omitir() { if (s.peso.origen !== "manual") s.peso = { valor: null, origen: null }; pintar(); },
      medida: () => !!s.peso.valor, pendiente: () => false,
      valoresVoz: () => valorEl.dataset.voz, faltaTexto: () => "Estamos pesando. Quédate quieto."
    };
    return nodo;
  }

  /* ---------- 5. ¿Qué te gustaría cuidar? (temas del corpus) ---------- */
  function cuidar(ctx) {
    const s = ctx.sesion; const T = ctx.datos.textos; const TC = T.cuidar; const MAX = 3; const M = Rec(); const PI = PIC();
    const p = M.perfil(s, null);
    const visibles = M.seccionesVisibles(p); const visIds = visibles.map(t => t.id);
    const sug = M.sugeridas(p); const clave = sug.join(",");
    if ((s.situaciones ? s.situaciones.clave : "") !== clave) {
      const viejas = s.situaciones ? s.situaciones.clave.split(",").filter(Boolean) : [];
      s.categorias = s.categorias.filter(id => !viejas.includes(id));
      for (const id of sug) if (!s.categorias.includes(id) && s.categorias.length < MAX) s.categorias.push(id);
      s.situaciones = sug.length ? { clave, respuestas: Object.fromEntries(sug.map(id => [id, null])) } : null;
    }
    s.categorias = s.categorias.filter(id => visIds.includes(id));
    const lleno = () => s.categorias.length >= MAX;
    const alterna = (id) => { const i = s.categorias.indexOf(id); if (i >= 0) s.categorias.splice(i, 1); else if (!lleno()) s.categorias.push(id); };

    const tituloSug = persona(s).yo ? TC.sugerencia_titulo : TC.sugerencia_titulo_otra;
    const respuesta = (id) => (s.situaciones && s.situaciones.respuestas ? s.situaciones.respuestas[id] ?? null : null);
    const preguntaSug = (id) => TC.sugerencia_una.replace("{nombre}", M.nombreTema(id));
    const sinoSug = new Map(sug.map(id => [id, sinoBtns(respuesta(id), v => {
      s.situaciones.respuestas[id] = v;
      if (v) { if (!s.categorias.includes(id) && !lleno()) s.categorias.push(id); }
      else s.categorias = s.categorias.filter(x => x !== id);
      pinta();
    })]));
    const tarjetaSug = sug.length ? h("div.bloque.sugerencia",
      h("h2", tituloSug),
      sug.map(id => { const b = sinoSug.get(id);
        return h("div.pregunta.pregunta--chica", { "data-tema": id }, pic(PI.secciones[id] || "p-hojita"),
          h("div", h("h3", preguntaSug(id)), h("div.sn", { role: "group", "aria-label": preguntaSug(id) }, b.si, b.no))); })) : null;

    const chipDe = new Map();
    const chip = (t) => { const el = opcionBtn(t.nombre, { clase: ".chip", dibujo: PI.secciones[t.id] || "p-hojita", pulsado: s.categorias.includes(t.id), onclick: () => { alterna(t.id); pinta(); } }); chipDe.set(t.id, el); return el; };
    const abiertos = new Set();
    const grupos = M.grupos().map(g => ({ g, secciones: visibles.filter(t => t.grupo === g.id) })).filter(x => x.secciones.length);
    for (const x of grupos) if (x.secciones.some(t => s.categorias.includes(t.id) && !sug.includes(t.id))) abiertos.add(x.g.id);
    for (const x of grupos) {
      x.panel = h("div.grupo__secciones", { id: "grupo-" + x.g.id, role: "group", "aria-label": x.g.nombre, hidden: !abiertos.has(x.g.id) }, x.secciones.map(chip));
      x.btn = h("button.opcion.grupo", { type: "button", "aria-expanded": String(abiertos.has(x.g.id)), "aria-controls": "grupo-" + x.g.id, onclick: () => (abiertos.has(x.g.id) ? cerrar(x) : abrir(x)) },
        pic(PI.grupos[x.g.id] || "p-grupo-cuerpo"), h("span.opcion__texto", h("b", x.g.nombre), h("small", x.secciones.map(t => t.nombre).join("\u00a0· "))));
    }
    function abrir(x) { abiertos.add(x.g.id); x.panel.hidden = false; x.btn.setAttribute("aria-expanded", "true"); }
    function cerrar(x) { abiertos.delete(x.g.id); x.panel.hidden = true; x.btn.setAttribute("aria-expanded", "false"); }

    const cuenta = h("p.ayuda", { "aria-live": "polite" });
    function pinta() {
      for (const [id, el] of chipDe) { const on = s.categorias.includes(id); el.setAttribute("aria-pressed", String(on)); el.disabled = !on && lleno(); }
      for (const [id, b] of sinoSug) { b.si.setAttribute("aria-pressed", String(respuesta(id) === true)); b.no.setAttribute("aria-pressed", String(respuesta(id) === false)); }
      cuenta.textContent = s.categorias.length ? `Elegiste ${s.categorias.length} de ${MAX}: ${s.categorias.map(M.nombreTema).join(", ")}.${lleno() ? " " + TC.lleno : ""}` : "Elegir es opcional.";
    }
    pinta();
    const nodo = vista("", titulo(T.categorias_titulo, T.categorias_ayuda), tarjetaSug,
      h("div.bloque", h("h2", TC.grupos_titulo), h("p.ayuda", TC.grupos_ayuda), h("div.grupos", grupos.map(x => h("div.grupo__bloque", x.btn, x.panel))), cuenta));
    nodo._titulo = "Qué cuidar";
    nodo._botones = { azul: AZUL(), rojo: ATRAS(ctx), verde: SIGUE("Siguiente", () => ctx.ir(), { rotulo: "verde largo" }) };
    const yaSugerida = (id) => sug.includes(id) && respuesta(id) === true;
    const y = (l) => l.length > 1 ? l.slice(0, -1).join(", ") + " y " + l[l.length - 1] : l[0] || "";
    nodo._voz = recorrido({
      intro: () => ctx.datos.textos.voz_corta.cuidar,
      pasos: () => {
        const ps = [];
        sug.forEach((id, i) => { const b = sinoSug.get(id);
          ps.push({ siempre: true, opciones: [{ el: b.si, voz: `${i === 0 ? tituloSug + " " : ""}${preguntaSug(id)}`, nombre: M.nombreTema(id), alNo: () => b.no.click(),
            saltar: () => respuesta(id) !== null }] }); });
        for (const x of grupos) {
          ps.push({ siempre: true, opciones: [{ el: x.btn, voz: `¿Quieres ideas de: ${x.g.nombre}? Ahí hay ${x.secciones.length} ${x.secciones.length === 1 ? "tema" : "temas"}: ${y(x.secciones.map(t => t.nombre))}.`, nombre: x.g.nombre,
            dichoSi: `Abrimos: ${x.g.nombre}.`, alSi: () => abrir(x), alNo: () => cerrar(x), saltar: lleno }] });
          if (abiertos.has(x.g.id)) ps.push({ multiple: true, opciones: x.secciones.map(t => ({ el: chipDe.get(t.id), voz: `¿Quieres ideas para: ${t.nombre}?`, nombre: t.nombre, saltar: () => yaSugerida(t.id) })) });
        }
        return ps;
      },
      final: () => `${cuenta.textContent} ¿Seguimos? Aprieta el botón verde para continuar, o el rojo para revisar otra vez.`,
      alFinal: () => ctx.ir()
    });
    return nodo;
  }

  /* ---------- 6. ¿Está bien esto? (teach-back) ---------- */
  function confirmar(ctx) {
    const s = ctx.sesion; const R = ctx.datos.rangos; const T = ctx.datos.textos; const PI = PIC();
    const grupo = R.grupos.find(g => g.id === s.grupo);
    const ninoSub = s.grupo === "nino" ? T.edad_nino.opciones.find(o => o.id === s.edadNino) : null;
    const pq = T.para_quien.opciones.find(o => o.id === (s.paraQuien || "yo"));
    const meds = (s.medicinas || []).map(id => (T.medicinas.opciones.find(o => o.id === id) || {}).nombre).filter(Boolean);
    const m = (id, dec, u) => s.medidas[id].estado === "invalida" ? "No válida" : s.medidas[id].valor != null ? fmt(s.medidas[id].valor, dec) + " " + u : "No se midió";
    const alarmasSi = ctx.datos.alarma.preguntas.filter(p => p.nivel !== "apoyo" && s.alarma[p.id] === true);
    const pesoTalla = s.peso.valor ? `${fmt(s.peso.valor, 1)} kg` + (s.talla.valor ? ` / ${fmt(s.talla.valor, 0)} cm` : " (sin estatura)") : s.talla.valor ? `${fmt(s.talla.valor, 0)} cm (sin peso)` : "No se dio";
    const volver = { volverA: "confirmar" };
    const filas = [];
    const dato = (dibujo, t, v, ir, preguntaVoz) => {
      const cambiar = h("button.fantasma", { type: "button", onclick: ir }, "Cambiar");
      const el = h("div.datos__fila.dato", { "data-voz": `${t.replace(" / ", " y ")}: ${v}.` }, pic(dibujo), h("div", h("small", t), h("b", v)), cambiar);
      filas.push({ el, cambiar, voz: preguntaVoz || `¿Quieres corregir: ${t.toLowerCase()}?` });
      return el;
    };
    const aSobreTi = () => ctx.ir("sobreTi", volver);
    const lista = h("div.datos",
      dato(PI.para_quien[s.paraQuien || "yo"], "Para quién", pq ? pq.nombre : "—", aSobreTi, "¿Quieres corregir la edad o para quién es?"),
      dato(PI.edades[s.grupo] || "p-adulto", "Edad", grupo ? grupo.nombre + (ninoSub ? ` (${ninoSub.nombre.toLowerCase()})` : "") : "—", aSobreTi),
      s.embarazo === true ? dato("p-embarazada", "Embarazo", "Sí", aSobreTi) : null,
      s.embarazo !== true && Rec().perfil(s, null).lactancia ? dato("p-lactancia", "Embarazo o pecho", "Dando pecho", aSobreTi) : null,
      dato("p-tipo-suplemento", "Medicinas de todos los días", meds.length ? meds.map((x, k) => k ? x.toLowerCase() : x).join(", ") : "No sé (no se eligió)", () => ctx.ir("medicinas", { volverA: "confirmar", lista: true })),
      (s.condiciones || []).length ? dato("p-centro-salud", persona(s).yo ? "También te han dicho" : "También le han dicho", T.medicinas.condiciones.opciones.filter(o => s.condiciones.includes(o.id)).map(o => (!persona(s).yo && o.nombre_otra) || o.nombre).join(", "), () => ctx.ir("medicinas", { volverA: "confirmar", lista: true })) : null,
      dato("p-medir-bascula", "Peso / estatura", pesoTalla, () => ctx.ir("mediciones", { volverA: "confirmar", medicion: 2 })),
      dato("p-medir-oximetro", "Pulso", m("fc", 0, "latidos por minuto"), () => ctx.ir("mediciones", volver), "¿Quieres corregir las mediciones?"),
      dato("p-medir-oximetro", "Oxígeno", m("spo2", 0, "%"), () => ctx.ir("mediciones", volver)),
      dato("p-medir-termometro", "Temperatura axilar", m("temp", 1, "°C"), () => ctx.ir("mediciones", { volverA: "confirmar", medicion: 1 })),
      dato("p-alerta", "Preguntas importantes", alarmasSi.length ? `${alarmasSi.length} con «sí»` : "Ninguna con «sí»", () => ctx.ir("alarma", { volverA: "confirmar", corregir: true }), "¿Quieres corregir las respuestas de las preguntas importantes?"),
      dato("p-hojita", "Temas", s.categorias.length ? s.categorias.map(Rec().nombreTema).join(", ") : "Ninguno", () => ctx.ir("cuidar", volver)));
    const nodo = vista("", titulo("¿Está bien esto?", "Revisa que los datos sean correctos. Si algo está mal, toca «Cambiar»."), lista);
    nodo._titulo = "Revisa tus datos";
    let iCorr = -1; // -1: preguntando «¿Está bien esto?»; 0..n: qué corregir
    const marcar = () => filas.forEach((f, k) => f.el.classList.toggle("datos__fila--preguntando", k === iCorr));
    const pregunta = () => iCorr < 0 ? "¿Está bien esto? Aprieta el botón verde para sí, o el rojo para corregir." : `${filas[iCorr].voz} ${SINO}`;
    function corregir() { iCorr = 0; marcar(); filas[0].el.scrollIntoView({ block: "center" }); hablar(pregunta()); }
    nodo._botones = { azul: AZUL(), rojo: NO(corregir, { texto: "Corregir", corto: "No", voz: "corregir" }), verde: SIGUE("Está bien", () => ctx.ir(), { pic: "p-si", corto: "Está bien", id: "si", voz: "decir que está bien" }) };
    nodo._voz = {
      guion: () => `${ctx.datos.textos.voz_corta.confirmar} ${Voz().textoGenerico(lista)} ${pregunta()}`,
      accion(id) {
        if (iCorr < 0) { if (id === "no") { corregir(); return true; } return false; }
        if (id === "si") { filas[iCorr].cambiar.click(); return true; }
        if (id === "no") { iCorr++; if (iCorr >= filas.length) { iCorr = -1; marcar(); hablar("Bien, no corregimos nada. " + pregunta()); } else { marcar(); filas[iCorr].el.scrollIntoView({ block: "center" }); hablar(pregunta()); } return true; }
        return false;
      }
    };
    return nodo;
  }

  /* ---------- 7. Resultado ---------- */
  function resultado(ctx) {
    const s = ctx.sesion; const T = ctx.datos.textos; const r = ctx.resultado; const R = ctx.datos.rangos; const PI = PIC();
    const p = Rec().perfil(s, r);
    const N = T.niveles[r.nivel]; const tr = tratoPara(T, p);
    const hoy = r.nivel === "ambar" && r.prisa === "hoy";
    const linEmb = lineaEmbarazo(T, s, p);
    let acciones = accionesPara(T, r, p);
    if (linEmb && p.senales.fiebre && r.nivel !== "rojo") acciones = [linEmb, ...acciones]; // embarazo con fiebre, paso 1
    const semaforo = r.mediciones.filter(f => !f.fuera_semaforo);
    const aparte = r.mediciones.filter(f => f.fuera_semaforo);
    const omitSem = r.omitidas.filter(n => n !== R.parametros.imc.nombre);
    const motivos = [...r.motivos, ...motivosExtra(s, r)];
    const rojo = r.nivel === "rojo";
    document.body.classList.remove("es-rojo");
    const conIdeas = !rojo && s.categorias.length > 0;
    const lugar = Lug().actual();
    const PERS = p.persona === "nino" ? "para el niño o la niña" : p.persona === "otra" ? "para la persona" : "para ti";
    const origenTxt = (f) => f.origen === "simulado" ? "Simulado (demostración)" : f.origen === "sensor" ? "Con sensor" + (f.intentos > 1 ? ` (${f.intentos} lecturas)` : "") : f.origen === "manual" ? "Escrito a mano" : f.origen === "calculado" ? "Calculado con peso y estatura" : "";
    const filaMed = (f) => h("div.medidas__fila", { "data-medida": f.id }, pic(PI.mediciones[f.id] || "p-medir-bascula"),
      h("div", h("span", f.nombre), h("b", f.valor == null ? "Sin valor" : [fmt(f.valor, f.decimales), " ", h("small", f.unidad)])), medTag(f),
      f.nota ? h("p.medidas__nota", f.nota) : null,
      h("p.fuente", [origenTxt(f), f.rango, f.fuente ? "Fuente: " + sinFuentesLargas(f.fuente) : ""].filter(Boolean).join("\u00a0· ")));
    const incompleto = r.datosIncompletos ? (s.grupo === "nino" && !omitSem.length && !r.invalidas.length
      ? h("p.aviso-incompleto", { role: "status" }, pic("p-alerta"), h("span", h("b", T.datos_incompletos_nino.titulo), " ", T.datos_incompletos_nino.texto))
      : h("p.aviso-incompleto", { role: "status" }, pic("p-alerta"), h("span", h("b", tr(T.datos_incompletos.titulo)), " ", tr(T.datos_incompletos.texto), omitSem.length ? ` No se midió: ${omitSem.join(", ")}.` : "", r.invalidas.length ? ` No fue válida: ${r.invalidas.join(", ")}.` : ""))) : null;

    let nodo;
    if (rojo) {
      const lineas = Lug().lineas("rojo", lugar);
      const l911 = lineas.find(l => l.id === "emergencias_911") || lineas[0];
      const vida = lineas.find(l => l.id === "linea_vida");
      const otras = lineas.filter(l => l !== l911 && (l !== vida || r.apoyo));
      const caja = h("section.caja-911.telefono.telefono--urgente", { "data-linea": l911.id, "data-voz": `Llama ya al 911: ${l911.voz}.`, "aria-labelledby": "t911" },
        pic("p-llamar-911"), h("h2.caja-911__numero.num", { id: "t911" }, h("small", "Llama ya al"), l911.numero),
        h("div", h("p", tr("Pide que te lleven al hospital.") + " No manejes tú.")));
      document.body.classList.add("es-rojo");
      nodo = vista(".resultado.resultado--rojo",
        h("section.heroe.heroe--rojo.heroe--compacto", { role: "status" }, h("span.heroe__forma", pic(NIVEL_PIC.rojo)),
          h("div", h("h1", N.nombre), h("p.heroe__porque", porqueCorto(T, motivos, N)))),
        h("div.lugar-urgente", { role: "region", "aria-label": "A quién llamar" }, caja,
          h("p.caja-911__mas", tr("Si puedes, lleva tus medicinas o sus cajas.") + " ", T.niveles.rojo.acciones[1]),
          otras.map(l => lineaEl(l, r.apoyo)), unidadEl("rojo", lugar)),
        vida && !r.apoyo ? h("p.apoyo-chico", pic("p-escuchar"), h("span", `Si te sientes muy triste o con angustia: ${vida.nombre}, ${vida.numero}.`)) : null);
      nodo._sinTerminar = true; // la cabecera no lleva Terminar: está en la botonera (rojo)
      nodo._botones = { azul: AZUL({ texto: "Repetir", corto: "Oír" }), rojo: NO(() => ctx.pedirBorrar(), { texto: "Terminar", corto: "Salir", pic: "p-terminar", voz: "terminar" }),
        verde: SIGUE("Imprimir hoja para llevar", () => ctx.ir("resumen", { imprimir: true }), { pic: "p-imprimir", corto: "Imprimir", id: "si", voz: "imprimir tu hoja" }) };
    } else {
      nodo = vista(".resultado",
        h("section.heroe.heroe--" + r.nivel, { role: "status" }, h("span.heroe__forma", pic(NIVEL_PIC[r.nivel])),
          h("div", h("h1", N.nombre), h("p", tr(hoy ? N.frase_hoy : N.frase)))),
        incompleto,
        h("div.columnas",
          h("section.bloque", h("h2", "Qué hacer ahora"), h("ol.pasos", acciones.map(a => h("li", pic(picPaso(a)), h("span", a)))),
            r.nivel === "verde" && s.grupo === "60mas" ? h("p.nota-limite", pic("p-alerta"), h("span", N.nota_60mas)) : null,
            linEmb && !p.senales.fiebre ? h("p.nota-limite", pic("p-embarazada"), h("span", linEmb)) : null,
            r.nivel === "ambar" ? unidadEl("ambar", lugar) : null,
            h("h3", "A quién llamar"), h("div.lineas", Lug().lineas(r.nivel, lugar).map(l => lineaEl(l, r.apoyo)))),
          h("section.bloque", h("h2", "Lo que medimos"),
            semaforo.length ? h("div.medidas", semaforo.map(filaMed)) : h("p", "No se registró ninguna medición."),
            omitSem.length ? h("p.ayuda", "No se midió: " + omitSem.join(", ") + ". Por eso no se tomó en cuenta.") : null,
            s.peso.valor || aparte.length ? h("div.medidas.aparte", h("h3", "Peso y estatura (fuera del semáforo)"),
              s.peso.valor ? h("div.medidas__fila", { "data-medida": "peso" }, pic(PI.mediciones.peso), h("div", h("span", "Peso"), h("b", fmt(s.peso.valor, 1), " ", h("small", "kg")))) : null,
              aparte.map(filaMed), s.peso.valor && !s.talla.valor ? h("p.ayuda", "IMC: falta la talla.") : null, h("p.ayuda", R.parametros.imc.nota_general)) : null,
            motivos.length ? h("details.mas", h("summary", "Por qué salió así"), h("ul.motivos", motivos.map(m => h("li", m.texto)))) : null,
            h("details.mas", h("summary", T.safety_netting.titulo), h("ul", T.safety_netting.puntos.map(x => h("li", tr(x))))),
            h("details.mas", h("summary", "Límites de estas mediciones"), h("ul", semaforo.filter(f => f.limitacion).map(f => h("li", h("b", f.nombre + ": "), f.limitacion)))))));
      const textoVerde = conIdeas ? (p.persona === "nino" ? "Ver ideas para el niño o la niña" : "Ver ideas para ti") : "Ver tu hoja";
      nodo._botones = { azul: AZUL({ texto: "Repetir", corto: "Oír" }), rojo: ATRAS(ctx, { texto: "Anterior" }),
        verde: SIGUE(textoVerde, () => ctx.ir(conIdeas ? "fichas" : "resumen"), { corto: conIdeas ? "Ideas" : "Tu hoja", voz: conIdeas ? "ver ideas " + PERS : "ver tu hoja" }) };
    }
    nodo._titulo = "Tu resultado";
    const NOMBRE_VOZ = { fc: "Pulso", spo2: "Oxígeno", temp: "Temperatura" }; // «Pulso 79: dentro de lo esperado»
    const valores = semaforo.map(f => (f.valor == null ? `${NOMBRE_VOZ[f.id] || f.nombre}: no válida.` : vozMed(NOMBRE_VOZ[f.id] || f.nombre, fmt(f.valor, f.decimales) + (f.unidad === "%" ? " %" : f.unidad === "°C" ? " °C" : ""), f)) + (f.nota ? " " + f.nota : "")).join(" "); // criterio 55
    const vozRojo = (() => { const t = rojo ? Lug().textoVoz("rojo", lugar) : ""; const k = t.indexOf("uno, uno."); return k < 0 ? { primera: t, resto: "" } : { primera: t.slice(0, k + 9), resto: t.slice(k + 9).trim() }; })();
    const inicio = { verde: "Salió verde, como el semáforo: hoy no encontramos señales de alarma.", ambar: hoy ? "Salió amarillo: ve hoy a tu centro de salud." : "Salió amarillo: ve a tu centro de salud.", rojo: "Salió rojo: llama ya al 9 1 1." }[r.nivel];
    nodo._voz = {
      guion: () => [
        tr(inicio),
        rojo ? vozRojo.primera : "",
        r.datosIncompletos ? (s.grupo === "nino" && !omitSem.length && !r.invalidas.length ? T.datos_incompletos_nino.texto : tr(T.datos_incompletos.texto)) : "",
        "Qué hacer ahora: " + acciones.join(" "),
        linEmb && !acciones.includes(linEmb) ? linEmb : "",
        !rojo && r.nivel === "verde" && s.grupo === "60mas" ? N.nota_60mas : "", // criterio 57
        rojo && motivos.length ? "Por qué: " + porqueCorto(T, motivos, N) + "." : "",
        rojo ? vozRojo.resto : "",
        r.nivel === "ambar" ? Lug().textoVoz("ambar", lugar) : "",
        !rojo && valores ? tr("Tus mediciones: ") + valores : "",
        rojo ? "Si te da tiempo, aprieta el verde para tu hoja. Si no, vete ya." : `${T.voz_corta.resultado} Para seguir, aprieta el verde.`
      ].filter(Boolean).join(" "),
      accion: () => false
    };
    return nodo;
  }

  /* ---------- 8. Lo que te toca a ti: una idea por pantalla (docs/diseno/sistema.md §6.4) ---------- */
  function fichas(ctx) {
    const s = ctx.sesion; const T = ctx.datos.textos; const TR = T.recomendaciones; const M = Rec(); const PI = PIC();
    const rec = M.recomendar(s, ctx.resultado, s.categorias);
    const p = rec.perfil;
    const lugar = Lug().actual(); const unidadTxt = Lug().textoUnidad(lugar, "pantalla"); const unidadVoz = Lug().textoUnidad(lugar, "voz");
    const comoDe = (e) => M.comoPara(e, p);
    const temaDe = (id) => M.temas().find(t => t.id === id);
    const noEncuentro = (t) => M.noLoEncuentro(t.entrada, p, t.tema);
    const textoAlt = (t) => M.textoNoLoEncuentro(noEncuentro(t), "voz");
    const ayudaDe = (t) => (t.tema ? M.ayudaEn(t.entrada, t.tema) : t.entrada.ayuda || 1);
    const dibujoDe = (e) => PI.entradas[e.id] || PI.tipos[e.tipo] || "p-hojita";
    const linEmbF = lineaEmbarazo(T, s, p);
    const vaEnHoja = (t) => typeof M.vaEnHoja === "function" ? M.vaEnHoja(t, rec, s.categorias, { omitir: linEmbF ? ["senal_prenatal"] : [], aceptadas: s.aceptadas || [] }) : true; // criterio 58
    const franjaDe = (tema) => (rec.franjas || []).find(f => f.tema === tema) || null;
    // La secuencia: cada idea; al terminar las ideas de una sección, sus «Cuidado con esto» (hasta 2) y su «Cuándo ir»
    const items = [];
    if (!rec.bloqueado) rec.tarjetas.forEach((t, i) => {
      items.push({ tipo: "idea", t, i });
      const ultima = t.tema && !rec.tarjetas.some((x, j) => j > i && x.tema === t.tema);
      if (!ultima) return;
      for (const info of ((rec.cuidados || {})[t.tema] || [])) items.push({ tipo: "cuidado", info });
      const f = franjaDe(t.tema); if (f) items.push({ tipo: "cuando", f });
    });
    const total = rec.tarjetas.length;
    const abiertas = new Set();
    let foco = 0; let dichoTitulo = false;

    function ideaEl(t, i) {
      const e = t.entrada; const ne = noEncuentro(t); const tema = t.tema ? temaDe(t.tema) : null; const como = comoDe(e);
      const habito = e.tipo === "habito";
      const panel = h("div.alternativas", { id: "alt-" + i, hidden: !abiertas.has(i) },
        h("h3", pic("p-no"), ne.intro),
        ne.sinCambio ? (ne.texto ? h("p", ne.texto) : null)
          : h("ul", ne.alternativas.map(a => h("li", pic(dibujoDe(a.entrada)), h("div", h("b", a.entrada.nombre), h("span", a.como),
            a.avisos.map(av => h("p.advertencia.advertencia--chica", pic("p-alerta"), h("span", av))), a.pie ? h("span", a.pie) : null)))));
      const ayuda = ayudaDe(t);
      return h("article.idea", { class: "idea--" + e.tipo, "data-i": i, "data-item": "idea", "data-habito": habito ? "1" : null },
        h("div.idea__lamina", pic(dibujoDe(e))),
        h("div.idea__cuerpo",
          h("span.etiqueta", pic(PI.tipos[e.tipo] || "p-hojita"), [M.TIPO_TEXTO[e.tipo] || e.tipo, tema ? tema.nombre : null].filter(Boolean).join("\u00a0· ")),
          h("h2", e.nombre, e.nombre_cientifico ? h("span.idea__cientifico", e.nombre_cientifico) : null),
          !t.tema || t.porque === TR.sin_tema ? h("p.idea__porque", t.porque) : null,
          h("p.idea__para", e.para),
          h("div.idea__fila",
            como ? h("div.cuanto", h("span.cuanto__texto", h("b", "Cómo y cuánto: "), como)) : null,
            h("p.ayuda-hojas", { role: "img", "aria-label": M.textoAyuda(ayuda) }, [1, 2, 3].map(n => pic("p-hojita", { clase: n <= ayuda ? "" : "hojita--vacia" })), h("span", { "aria-hidden": "true" }, M.textoAyuda(ayuda)))),
          t.avisos.map(a => h("div.cuidado", pic("p-alerta"), h("p", h("strong", "Cuidado: "), a))),
          e.tipo === "planta" ? h("p.idea__tradicion", TR.planta_pie) : null,
          M.requiereLeyenda ? (M.requiereLeyenda(e) ? leyendaEl(T) : null) : e.tipo === "suplemento" ? leyendaEl(T) : null,
          panel,
          (e.fuentes || []).length ? h("p.fuente", "Fuente: ", nombresFuentes(e.fuentes), h("span.idea__va", { "data-entrada": e.id, "data-tema": t.tema || "" }, vaEnHoja(t) ? ". Va en tu hoja." : ".")) : null));
    }
    function cuidadoEl(info) {
      const c = info.tarjeta; const TC = (window.MediBotData.cuidado && window.MediBotData.cuidado.textos) || {};
      const tema = M.temaDe(info.tema);
      return h("article.idea.idea--cuidado", { "data-cuidado": c.id, "data-tema": info.tema, "data-item": "cuidado" },
        h("div.idea__lamina", pic("p-alerta")),
        h("div.idea__cuerpo",
          h("span.etiqueta", pic(PI.secciones[info.tema] || "p-hojita"), [TC.titulo || "Cuidado con esto", tema ? tema.nombre : null].filter(Boolean).join("\u00a0· ")),
          h("h2", c.nombre), h("p.idea__para", c.que_es),
          h("div.cuidado", pic("p-alerta"), h("p", h("strong", "Cuidado: "), c.por_que_cuidado)),
          info.texto ? h("p", h("b", (TC.en_su_lugar || "En su lugar") + ": "), info.texto)
            : info.alternativas.length ? h("div.alternativas", h("h3", pic("p-si"), (TC.en_su_lugar || "En su lugar") + ":"), h("ul", info.alternativas.map(a => h("li", pic(dibujoDe(a.entrada)), h("div", h("b", a.entrada.nombre), h("span", a.como),
              a.avisos.map(av => h("p.advertencia.advertencia--chica", pic("p-alerta"), h("span", av)))))))) : null,
          info.alternativas.some(a => a.entrada.tipo === "planta") ? h("p.idea__tradicion", TR.planta_pie) : null,
          c.urgente_si ? h("p.idea__porque", h("b", (TC.si_ya || "Si ya pasó") + ": "), c.urgente_si) : null,
          (c.fuentes || []).length ? h("p.fuente", "Fuente: ", nombresFuentes(c.fuentes)) : null));
    }
    function cuandoEl(f) {
      return h("section.cuando-ir", { role: "note", "data-tema": f.tema, "data-item": "cuando" },
        h("section.cuando-ir__pronto", h("h3", pic("p-centro-salud"), T.cuidar.cuando_ir_titulo + "\u00a0· " + M.nombreTema(f.tema)), h("p", f.texto),
          unidadTxt ? h("p.cuando-ir__lugar", { "data-voz": unidadVoz }, unidadTxt) : null,
          h("p.fuente", "Fuente: ", nombresFuentes(f.fuentes))),
        h("section.cuando-ir__ya", h("h3", pic("p-llamar-911"), "Si es urgente"), h("p", "Si sientes que es urgente, no esperes: llama al 911 o ve al hospital.")));
    }
    const nodosItems = items.map(it => it.tipo === "idea" ? ideaEl(it.t, it.i) : it.tipo === "cuidado" ? cuidadoEl(it.info) : cuandoEl(it.f));
    const ideasDe = items.map((it, k) => ({ it, k })).filter(x => x.it.tipo === "idea");
    const miniaturas = h("ol.miniaturas", { "aria-label": "Tus ideas" }, ideasDe.map(x => h("li", pic(dibujoDe(x.it.t.entrada), { etiqueta: x.it.t.entrada.nombre }))));
    const contador = h("p.ideas-arriba__n");
    const arriba = h("div.ideas-arriba", contador, miniaturas, h("p.ideas-arriba__para.encabezado-personal", rec.encabezado));
    const cont = h("div.ideas", nodosItems);
    const final = () => foco >= items.length - 1;
    const ideaNum = (k) => items.slice(0, k + 1).filter(x => x.tipo === "idea").length;

    // Al entrar, la voz es corta (nombre, para qué y cómo en una frase cada uno) y los avisos van SIEMPRE completos;
    // el detalle completo se oye con el azul («Escuchar esta»).
    const primera = (x) => String(x || "").split(/(?<=[.!?])\s+/)[0];
    function vozItem(k, completa) {
      const it = items[k]; if (!it) return "";
      if (it.tipo === "idea") {
        const t = it.t; const e = t.entrada; const como = comoDe(e);
        const pre = !dichoTitulo ? `${p.persona === "nino" ? "Lo que le toca a tu niño o niña." : T.voz_corta.fichas} ${rec.encabezado} ` : "";
        const ultima = k >= items.length - 1;
        const sigue = ultima ? `${abiertas.has(it.i) ? textoAlt(t) + " " : ""}Verde: ver tu hoja.${abiertas.has(it.i) ? "" : ` Si ${e.tipo === "habito" ? "no puedes hacerlo" : "no lo encuentras"}, el rojo.`}` : abiertas.has(it.i) ? `${textoAlt(t)} Verde: siguiente idea.` : e.tipo === "habito" ? `Si puedes hacerlo, aprieta el verde. Si no puedes, el rojo.${completa ? "" : " Para oír más, el azul."}` : `Si ya lo tienes, aprieta el verde. Si no lo encuentras, el rojo.${completa ? "" : " Para oír más, el azul."}`;
        return [pre, `Idea ${ideaNum(k)} de ${total}. ${M.TIPO_TEXTO[e.tipo] || ""}: ${e.nombre}.`, completa ? e.para : primera(e.para),
          como ? "Cómo y cuánto: " + como : "", // criterio 33: la cantidad nunca se recorta
          t.avisos.length ? "Cuidado: " + t.avisos.join(" ") : "", e.tipo === "planta" ? TR.planta_pie : "", completa ? M.textoAyuda(ayudaDe(t)) + "." : "",
          sigue].filter(Boolean).join(" ");
      }
      if (it.tipo === "cuidado") {
        if (completa) return `${M.textoCuidado(it.info, "voz")} Para seguir, aprieta el verde.`;
        const c = it.info.tarjeta; const TC = (window.MediBotData.cuidado && window.MediBotData.cuidado.textos) || {};
        const alts = it.info.alternativas.map(x => x.entrada.nombre);
        return [`${TC.titulo || "Cuidado con esto"}: ${c.nombre}.`, c.por_que_cuidado, alts.length ? `${TC.en_su_lugar || "En su lugar"}: ${alts.join(", ")}.` : "",
          c.urgente_si ? `${TC.si_ya || "Si ya pasó"}: ${c.urgente_si}` : "", "Para oír todo, el azul. Para seguir, el verde."].filter(Boolean).join(" ");
      }
      return `Y recuerda: ${T.cuidar.cuando_ir_titulo}: ${it.f.texto} ${unidadVoz} Para seguir, aprieta el verde.`;
    }
    // Criterio 58: «Va en tu hoja» sale de la hoja que de verdad se imprimiría ahora (ya ajustada a una carta), no de una
    // cuenta aparte; se recalcula en cada idea porque lo aceptado cambia qué ideas se quedan
    function marcarVa() {
      // Se cuenta como aceptada la idea en turno y las que faltan (salvo las ya rechazadas): así «Va en tu hoja» nunca promete
      // de más. Lo que la persona acepte después ya está contado; lo que rechace después solo le deja más lugar a las demás.
      const acept = (s.aceptadas || []).slice(); const rech = s.rechazadas || [];
      items.forEach((x, k) => { if (k >= foco && x.tipo === "idea" && !abiertas.has(x.i) && !rech.includes(x.t.entrada.id) && !acept.includes(x.t.entrada.id)) acept.push(x.t.entrada.id); });
      const imp = ideasImpresas(Object.assign({}, ctx, { sesion: Object.assign({}, s, { aceptadas: acept }) }), nodo); if (!imp) return;
      cont.querySelectorAll(".idea__va").forEach(sp => { sp.textContent = imp.some(x => x.entrada === sp.dataset.entrada && (x.tema || "") === sp.dataset.tema) ? ". Va en tu hoja." : "."; });
    }
    function pintar() {
      nodosItems.forEach((n, k) => { n.hidden = k !== foco; });
      const it = items[foco];
      [...miniaturas.children].forEach((li, j) => { if (ideasDe[j].k === foco) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current"); });
      contador.textContent = !it ? "" : it.tipo === "idea" ? `Idea ${ideaNum(foco)} de ${total}` : it.tipo === "cuidado" ? "Cuidado con esto" : "Cuándo ir";
      ctx.botonera(botones());
      if (nodo && document.contains(nodo)) marcarVa();
    }
    const sigTexto = () => final() ? "Ver mi hoja" : null;
    function botones() {
      const it = items[foco];
      if (!it) return { azul: AZUL(), rojo: ATRAS(ctx), verde: SIGUE("Ver mi hoja", () => ctx.ir("resumen"), { pic: "p-imprimir", corto: "Tu hoja", voz: "ver tu hoja" }) };
      const verde = SIGUE(sigTexto() || (it.tipo === "idea" ? "Sí lo tengo" : "Siguiente"), siguiente, { pic: it.tipo === "idea" ? "p-si" : "p-siguiente", corto: it.tipo === "idea" ? "Lo tengo" : "Seguir", id: "si",
        rotulo: final() ? "botón verde · tu hoja" : it.tipo === "idea" ? "botón verde · siguiente idea" : "botón verde", voz: final() ? "ver tu hoja" : "seguir" });
      if (it.tipo === "idea") {
        const habito = it.t.entrada.tipo === "habito";
        // En hábitos, «No puedo hacerlo» (y el verde, «Sí puedo»)
        if (habito && !final()) Object.assign(verde, { texto: "Sí puedo", corto: "Puedo" });
        if (abiertas.has(it.i) && !final()) Object.assign(verde, { texto: "Siguiente idea", corto: "Seguir", pic: "p-siguiente", voz: "ir a la siguiente idea" }); // criterio 45
        return { azul: AZUL({ texto: "Escuchar esta", fn: () => hablar(vozItem(foco, true)) }), rojo: NO(() => noLo(), { texto: habito ? "No puedo hacerlo" : "No lo encuentro", corto: habito ? "No" : "No hay", rotulo: "botón rojo: te doy otra", voz: habito ? "decir que no puedes" : "decir que no lo encuentras" }), verde };
      }
      return { azul: AZUL({ fn: () => hablar(vozItem(foco, true)) }), rojo: ATRAS(ctx, { fn: () => anterior() }), verde };
    }
    function irA(k) { foco = Math.max(0, Math.min(k, items.length - 1)); pintar(); $contenido().scrollTop = 0; }
    const $contenido = () => document.getElementById("contenido") || { scrollTop: 0 };
    function siguiente() {
      const it = items[foco];
      if (it && it.tipo === "idea" && !abiertas.has(it.i)) { if (!Array.isArray(s.aceptadas)) s.aceptadas = []; if (!s.aceptadas.includes(it.t.entrada.id)) s.aceptadas.push(it.t.entrada.id); } // «Sí lo tengo»
      if (final()) { ctx.ir("resumen"); return; }
      dichoTitulo = true; irA(foco + 1); hablar(vozItem(foco));
    }
    function anterior() { if (foco === 0) { ctx.atras(); return; } irA(foco - 1); hablar(vozItem(foco)); }
    function noLo() {
      const it = items[foco]; if (!it || it.tipo !== "idea") return;
      const i = it.i;
      if (!abiertas.has(i)) { abiertas.add(i); const pan = nodosItems[foco].querySelector("#alt-" + i); if (pan) pan.hidden = false; ctx.botonera(botones()); }
      if (!Array.isArray(s.rechazadas)) s.rechazadas = [];
      if (!s.rechazadas.includes(it.t.entrada.id)) s.rechazadas.push(it.t.entrada.id); // criterio 46: la hoja solo dice «sin cambio» de lo rechazado
      marcarVa(); // criterio 58: rechazada, quizá ya no va en la hoja
      const pan = nodosItems[foco].querySelector("#alt-" + i); if (pan && pan.scrollIntoView) pan.scrollIntoView({ block: "nearest" });
      hablar(textoAlt(it.t) + (final() ? " Verde: ver tu hoja." : " Aprieta el botón verde para la siguiente idea."));
    }
    const bloqueado = rec.bloqueado || !items.length;
    const nodo = vista(".fichas", bloqueado ? h("p.ideas-arriba__para.encabezado-personal", rec.encabezado) : arriba, bloqueado ? null : cont);
    nodo._titulo = p.persona === "nino" ? "Lo que le toca a tu niño o niña" : p.persona === "otra" ? "Lo que le toca a la persona" : T.recomendaciones.titulo; // criterio 39
    if (!bloqueado) pintar();
    nodo._botones = bloqueado ? { azul: AZUL(), rojo: ATRAS(ctx), verde: SIGUE("Ver mi hoja", () => ctx.ir("resumen"), { pic: "p-imprimir", voz: "ver tu hoja" }) } : botones();
    nodo._voz = {
      guion: () => bloqueado ? `${rec.encabezado} Aprieta el botón verde para ver tu hoja.` : vozItem(foco),
      accion(id) {
        if (bloqueado) return false;
        if (id === "atras") { anterior(); return true; }
        return false; // sí / no: los botones de la botonera (siguiente / «No lo encuentro»)
      }
    };
    nodo._alMostrar = () => { dichoTitulo = false; if (!bloqueado) marcarVa(); };
    return nodo;
  }

  /* ---------- 9. Tu hoja de hoy ---------- */
  function resumen(ctx) {
    const s = ctx.sesion; const T = ctx.datos.textos; const r = ctx.resultado; const R = ctx.datos.rangos; const M = Rec(); const PI = PIC();
    const N = T.niveles[r.nivel]; const grupo = R.grupos.find(g => g.id === s.grupo);
    const hoy = r.nivel === "ambar" && r.prisa === "hoy";
    const fecha = new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
    const rec = M.recomendar(s, r, s.categorias);
    const p = rec.perfil; const tr = tratoPara(T, p);
    const acciones = accionesPara(T, r, p);
    const linEmb = lineaEmbarazo(T, s, p);
    const opcHoja = { omitir: linEmb ? ["senal_prenatal"] : [], aceptadas: s.aceptadas || [] };
    const ideas = M.paraHoja(rec, s.categorias, opcHoja);
    // Criterio 58: si no cabe, ajustarHoja quita las ideas de más empezando por la de menos prioridad (data-recorte más alto)
    const prioridad = typeof M.recorteHoja === "function" ? M.recorteHoja(rec, s.categorias, opcHoja) : ideas;
    const recorteDe = (t) => { const k = prioridad.findIndex(x => x.entrada.id === t.entrada.id && (x.tema || null) === (t.tema || null)); return String(k < 0 ? prioridad.length : k); };
    const franjas = rec.bloqueado ? [] : (rec.franjas || []);
    const lugar = Lug().actual();
    const cuidados = (s.categorias || []).flatMap(id => ((rec.cuidados || {})[id] || [])); // hasta 2 por sección; en rojo, ninguna
    const TC = (ctx.datos.cuidado && ctx.datos.cuidado.textos) || {};
    const ninoSub = s.grupo === "nino" ? T.edad_nino.opciones.find(o => o.id === s.edadNino) : null;
    const para = p.persona === "nino" ? " · Para: el niño o la niña" : p.persona === "otra" ? " · Para: otra persona" : "";
    const motivos = [...r.motivos, ...motivosExtra(s, r)];
    const comoDe = (e) => M.comoPara(e, p) || e.para;
    const fuentes = [...new Set([...r.mediciones.map(f => sinFuentesLargas(f.fuente)), ...ideas.flatMap(t => (t.entrada.fuentes || []).map(sinFuentesLargas))].filter(Boolean))];
    const L = T.leyenda_cofepris;
    const dibujoDe = (e) => PI.entradas[e.id] || PI.tipos[e.tipo] || "p-hojita";
    const avisosComunes = ideas.length > 1 ? [...new Set(ideas.flatMap(t => t.avisos))].filter(a => ideas.filter(t => t.avisos.includes(a)).length >= 2) : [];
    const hoja = h("div.hoja" + (r.nivel === "rojo" ? ".hoja--rojo" : ""),
      h("div.hoja__nivel", { class: "hoja__nivel--" + r.nivel }, pic(NIVEL_PIC[r.nivel]), h("div", h("b", N.nombre), h("div", tr(hoy ? N.frase_hoy : N.frase)))),
      h("p.hoja__titulo", T.imprimir_titulo),
      h("p.hoja__meta", "Proyecto escolar MediBot, gratis. " + fecha + para + " · Edad: " + (grupo ? grupo.nombre : "—") + (ninoSub ? ` (${ninoSub.nombre.toLowerCase()})` : "")),
      r.datosIncompletos ? (s.grupo === "nino" && !r.omitidas.filter(n => n !== R.parametros.imc.nombre).length && !r.invalidas.length
        ? h("p", h("b", T.datos_incompletos_nino.titulo + " "), T.datos_incompletos_nino.texto)
        : h("p", h("b", tr(T.datos_incompletos.titulo) + " "), tr(T.datos_incompletos.texto))) : null,
      h("div.hoja__dos",
        h("div", h("h2", "Qué hacer ahora"), h("ol", acciones.map(a => h("li", a))), linEmb ? h("p", linEmb) : null,
          r.nivel === "rojo" ? null : h("p.hoja__vuelve", h("b", T.safety_netting.titulo + " "), T.safety_netting.puntos.map(tr).join(" "))),
        h("div", h("h2", "Mediciones de hoy"),
          h("table.tabla.tabla--hoja", h("tbody", r.mediciones.map(f => h("tr", h("td", f.nombre), h("td.valor", f.valor == null ? "Sin valor" : [fmt(f.valor, f.decimales), " ", h("small", f.unidad)]), h("td", medTag(f, true)))))),
          s.peso.valor ? h("p", h("b", "Peso: "), fmt(s.peso.valor, 1) + " kg" + (s.talla.valor ? "" : ". IMC: falta la talla.")) : null,
          r.omitidas.filter(n => !(s.peso.valor && n === R.parametros.imc.nombre)).length ? h("p.fuente", "No se midió: " + r.omitidas.filter(n => !(s.peso.valor && n === R.parametros.imc.nombre)).join(", ")) : null,
          motivos.length ? h("div", h("h3", "Por qué"), h("ul", motivos.map(m => h("li", m.texto)))) : null)),
      // Criterio 55: las notas de las mediciones, a todo lo ancho (en la columna angosta no cabían en una carta)
      r.mediciones.some(f => f.nota) ? h("p.hoja__notas-med", h("b", "Notas de las mediciones: "), r.mediciones.filter(f => f.nota).map(f => `${f.nombre}: ${f.nota}`).join(" ")) : null,
      h("p.hoja__lugares", { "data-voz": Lug().textoVoz(r.nivel, lugar) }, h("b", Lug().textos().titulo + " "), Lug().textoHoja(r.nivel, lugar)),
      ideas.length ? h("div.hoja__ideas", h("h2", M.tituloHoja(ideas.length)),
        avisosComunes.length ? h("p.hoja__avisos-comunes", h("b", "Cuidado, para todas estas ideas: "), avisosComunes.join(" ")) : null,
        h("ul.ideas-hoja", ideas.map((t, k) => h("li", { "data-tema": t.tema || "", "data-entrada": t.entrada.id, "data-recorte": recorteDe(t), "data-extra": ideas.findIndex(x => x.tema === t.tema) !== k ? "1" : null }, pic(dibujoDe(t.entrada)),
          h("div", h("b", t.entrada.nombre + ": "), comoDe(t.entrada), t.avisos.filter(a => !avisosComunes.includes(a)).length ? " Cuidado: " + t.avisos.filter(a => !avisosComunes.includes(a)).join(" ") : "",
            t.entrada.tipo === "planta" ? " " + T.recomendaciones.planta_pie : ""),
          (() => { const ne = M.noLoEncuentro(t.entrada, p, t.tema); return ne.sinCambio && !(s.rechazadas || []).includes(t.entrada.id) ? null : h("div.ideas-hoja__alt", M.textoNoLoEncuentro(ne, "hoja")); })())))) : null,
      cuidados.length ? h("p.hoja__cuidado", h("b", (TC.titulo || "Cuidado con esto") + ": "),
        cuidados.map((x, i) => h("span", { "data-tema": x.tema, "data-cuidado": x.tarjeta.id }, i ? "\u00a0· " : "", M.textoCuidado(x, "hoja"))), ".") : null,
      franjas.length ? h("div.hoja__cuando-ir", h("h2", T.cuidar.cuando_ir_titulo),
        h("ul", franjas.map(f => h("li", { "data-tema": f.tema }, h("b", M.nombreTema(f.tema) + ": "), f.texto)))) : null,
      ideas.some(t => (M.requiereLeyenda ? M.requiereLeyenda(t.entrada) : t.entrada.tipo === "suplemento")) ? h("div.leyenda.leyenda--hoja", L.mayusculas.map(l => h("p.leyenda__mayus", l)), h("p", L.linea)) : null,
      h("p.hoja__no-dejes", "No dejes esta hoja aquí."),
      h("p.fuente.hoja__fuentes", (fuentes.length ? "Fuentes: " + fuentes.join("\u00a0· ") + ". " : "") + T.descargo_corto + " Proyecto escolar MediBot. Rangos consultados el " + R.consultado + "."));
    const nodo = vista(".resumen", titulo("Tu hoja de hoy", T.imprimir_nota), hoja);
    nodo._titulo = "Tu hoja de hoy";
    const botones = () => ({
      azul: AZUL({ fn: leerTodo(hoja) }), // la lectura completa de la hoja va en el azul
      rojo: NO(() => ctx.pedirBorrar(), { texto: "Terminar", corto: "Salir", pic: "p-terminar", voz: "terminar" }),
      verde: ctx.impreso ? SIGUE("Terminar y borrar todo", ctx.terminar, { pic: "p-terminar", corto: "Borrar", id: "si", voz: "terminar y borrar todo" })
        : SIGUE("Imprimir mi hoja", imprimir, { pic: "p-imprimir", corto: "Imprimir", id: "si", voz: "imprimir tu hoja" })
    });
    async function imprimir() {
      const r2 = await ctx.imprimir();
      ctx.botonera(botones());
      hablar(r2.ok ? "Toma tu hoja de la impresora. Verde: terminar y borrar todo." : "No salió la hoja. Pide ayuda a alguien que esté cerca.");
    }
    nodo._botones = botones();
    nodo._voz = { guion: () => (ctx.impreso ? "Toma tu hoja de la impresora. Verde: terminar y borrar todo. Rojo: terminar." : T.voz_corta.resumen), accion: () => false };
    nodo._alMostrar = () => { if (ctx.opciones.imprimir) setTimeout(imprimir, 300); }; // desde el resultado rojo: «Imprimir hoja para llevar»
    return nodo;
  }

  /* ---------- Hoja impresa: «Cuidado con esto» va «si cabe» (criterio 16) ----------
     Antes de imprimir se mide la hoja con las reglas de css/print.css aplicadas un instante y al ancho de una carta. Si no cabe,
     la línea «Cuidado con esto» no se imprime (se vio y se oyó en pantalla); si aun así no cabe, la hoja se achica lo justo
     (mínimo 91 %, 10 pt). tools/e2e_pantallas.py (E3b, E10, E10c) imprime a PDF los casos más largos y exige 1 página. */
  const CARTA = { ancho: 763, alto: 980 }; // carta con márgenes de 7 mm (css/print.css): 8.5 × 11 in ≈ 763 × 1003 px útiles; 11 px de holgura
  function altoImpreso(hoja) {
    const link = document.querySelector('link[rel="stylesheet"][media="print"]');
    const hojaCss = link && link.sheet;
    if (!hojaCss) return 0;
    const html = document.documentElement; const ancho = html.style.width;
    hojaCss.media.mediaText = "all"; html.style.width = CARTA.ancho + "px";
    try { return Math.ceil(hoja.getBoundingClientRect().bottom + window.scrollY); } // desde el borde de arriba de la hoja impresa (incluye la franja DEMOSTRACIÓN)
    finally { hojaCss.media.mediaText = "print"; html.style.width = ancho; }
  }
  const IDEA_FUERA = "data-fuera"; // css/print.css: .ideas-hoja li[data-fuera] no se imprime
  /** ajustarHoja(hoja = la .hoja de la pantalla) → [{ entrada, tema }] de las ideas que SÍ salen impresas. */
  function ajustarHoja(hoja = document.querySelector(".hoja")) {
    if (!hoja) return [];
    const ANTES = ["hoja--sin-vuelve", "hoja--sin-alternativas", "hoja--sin-dibujos", "hoja--compacta"];
    const DESPUES = ["hoja--sin-cuidado", "hoja--sin-fuentes"];
    const lis = [...hoja.querySelectorAll(".ideas-hoja > li")];
    hoja.classList.remove(...ANTES, ...DESPUES, "hoja--sin-extras"); hoja.style.zoom = ""; lis.forEach(l => l.removeAttribute(IDEA_FUERA));
    let alto = altoImpreso(hoja);
    // Criterios 38, 58 y 65: antes de achicar se quitan, en este orden, el «Vuelve si…», las alternativas y los dibujos de
    // las ideas, y se aprieta el interlineado (la letra no cambia); luego las ideas de más UNA POR UNA, empezando por la de
    // menos prioridad (queda al menos una por sección, y primero se quedan las de la situación y las aceptadas); al final
    // «Cuidado con esto» y las fuentes. Los avisos, «Cuándo ir», «¿A dónde voy?» y el 911 nunca se quitan.
    const extras = lis.filter(l => l.dataset.extra).sort((a, b) => Number(b.dataset.recorte) - Number(a.dataset.recorte));
    const pasos = [...ANTES.map(c => () => hoja.classList.add(c)), ...extras.map(l => () => l.setAttribute(IDEA_FUERA, "1")), ...DESPUES.map(c => () => hoja.classList.add(c))];
    for (const paso of pasos) { if (alto <= CARTA.alto) break; paso(); alto = altoImpreso(hoja); }
    // Solo si aun quitando todo eso no cabe, se achica lo justo (último recurso). Criterio 65: piso real de 10 pt
    // (base de 11 pt × 0.91 = 10.01 pt)
    if (alto > CARTA.alto) { hoja.style.zoom = String(Math.max(0.91, Math.floor((CARTA.alto / alto) * 100) / 100)); alto = altoImpreso(hoja); }
    // Criterio 58: el título dice cuántas ideas salen de verdad impresas
    const quedan = lis.filter(l => !l.hasAttribute(IDEA_FUERA));
    const h2 = hoja.querySelector(".hoja__ideas h2"); const MR = window.MediBotRecomendaciones;
    if (h2 && MR && MR.tituloHoja) h2.textContent = MR.tituloHoja(quedan.length);
    hoja.dataset.altoCarta = String(alto);
    return quedan.map(l => ({ entrada: l.dataset.entrada, tema: l.dataset.tema || null }));
  }
  /** Criterio 58: qué ideas saldrían impresas si la hoja se armara ahora. Arma la hoja de verdad (resumen) un instante en el
      lugar de la pantalla actual, la ajusta a una carta como al imprimir y la quita; null si no se puede medir. */
  function ideasImpresas(ctx, actual) {
    const app = document.getElementById("app"); const cont = document.getElementById("contenido");
    if (!app || !actual || !document.contains(actual) || !document.querySelector('link[rel="stylesheet"][media="print"]')) return null;
    const arriba = cont ? cont.scrollTop : 0; const display = actual.style.display;
    const prueba = resumen(Object.assign({}, ctx, { opciones: {}, botonera: () => {} }));
    actual.style.display = "none"; app.appendChild(prueba);
    try { return ajustarHoja(prueba.querySelector(".hoja")); }
    finally { prueba.remove(); actual.style.display = display; if (cont) cont.scrollTop = arriba; }
  }
  function soltarHoja() { const hoja = document.querySelector(".hoja"); if (hoja) hoja.style.zoom = ""; }
  window.addEventListener("beforeprint", () => ajustarHoja()); // sin el evento como argumento
  window.addEventListener("afterprint", soltarHoja);

  /* ---------- Panel del operador (solo con el gesto; aquí va el tema) ---------- */
  function operador(ctx) {
    const S = ctx.sensores;
    const estado = h("b");
    const pinta = () => { estado.textContent = S.modo === "serial" ? "ESP32 conectado" : S.modo === "sim" ? "Simulación (franja DEMOSTRACIÓN visible)" : "Sin sensores"; };
    pinta(); S.addEventListener("estado", pinta);
    const aviso = h("p.ayuda", { "aria-live": "polite" });
    const btnSerial = h("button.btn.btn--secundario", { type: "button", onclick: async () => { try { await S.conectarSerial(); } catch (err) { aviso.textContent = err.message; } } }, icono("i-usb"), "Conectar ESP32 por USB");
    if (!S.disponibleSerial) { btnSerial.disabled = true; btnSerial.title = "Requiere la aplicación de escritorio MediBot.exe (o Edge/Chrome)"; }
    const altitud = h("input", { type: "number", min: 0, max: 4000, step: 50, value: ctx.config.altitud || 0, "aria-label": "Altitud del sitio en metros", onchange: e => { ctx.config.altitud = Number(e.target.value) || 0; ctx.guardarPref("altitud", String(ctx.config.altitud)); } });
    const sim = h("select", { "aria-label": "Escenario de simulación", onchange: e => { if (e.target.value) { try { S.conectarSim(e.target.value); } catch (err) { aviso.textContent = err.message; } } } },
      h("option", { value: "" }, "elige un escenario…"), h("option", { value: "normal" }, "normal"), h("option", { value: "oxigeno_bajo" }, "oxígeno bajo (91 %)"),
      h("option", { value: "fiebre" }, "fiebre (38.7 °C)"), h("option", { value: "pulso_alto" }, "pulso alto (126)"), h("option", { value: "inestable" }, "lecturas inestables"));
    const Lg = window.MediBotLugares;
    const nodo = vista(".operador",
      titulo("Panel del operador", "Solo para quien atiende el quiosco. La simulación se apaga sola al terminar cada consulta."),
      aviso,
      h("div.operador__rejilla",
        h("section.operador__grupo", h("h2", "Sensores"), h("p", "Estado: ", estado),
          h("div.operador__fila", btnSerial, h("button.btn.btn--fantasma", { type: "button", onclick: () => S.desconectar() }, "Desconectar")),
          h("div.operador__fila", h("label", "Simulación:", sim)),
          !S.disponibleSerial ? h("p.ayuda", "Para el USB usa la aplicación de escritorio MediBot.exe.") : null),
        h("section.operador__grupo", h("h2", "Pantallas del operador"),
          h("div.operador__fila",
            h("button.btn.btn--secundario", { type: "button", onclick: () => ctx.ir("verificacion") }, "Verificación de sensores"),
            h("button.btn.btn--secundario", { type: "button", onclick: () => ctx.ir("evidencia") }, "Evidencia QRMA"),
            h("button.btn.btn--secundario.btn--lugar", { type: "button", onclick: () => ctx.ir("lugar") }, "¿A dónde voy? (centro de salud)")),
          Lg && Lg.vencida(Lg.actual()) ? h("p.error", { role: "alert" }, Lg.textos().revisar) : null),
        h("section.operador__grupo", h("h2", "Equipo"),
          h("div.operador__fila", h("label", h("input", { type: "checkbox", checked: Voz() && Voz().siempre, onchange: e => { Voz().siempre = e.target.checked; ctx.guardarPref("voz", e.target.checked ? "1" : "0"); } }), "Leer en voz alta cada pantalla")),
          h("div.operador__fila", h("button.btn.btn--secundario", { type: "button", onclick: () => ctx.tema() }, icono("i-moon"), "Cambiar entre claro y oscuro"),
            h("label", "Altitud (m):", altitud)),
          window.medibotEscritorio ? h("div.operador__fila", h("button.btn.btn--fantasma", { type: "button", onclick: () => { if (window.confirm("¿Cerrar MediBot? (también puedes usar " + window.medibotEscritorio.salida + ")")) window.medibotEscritorio.salir(); } }, icono("i-x"), "Salir de la aplicación")) : null)),
      h("div.acciones", h("button.btn.btn--primario.btn--xl", { type: "button", onclick: () => { S.removeEventListener("estado", pinta); ctx.cerrarPanel(); } }, icono("i-check"), "Cerrar panel")));
    nodo._titulo = "Panel del operador";
    return nodo;
  }

  /* ---------- Operador: «¿A dónde voy?» (criterio 17) ----------
     Pasos: municipio → unidad (CLUES o a mano) → datos prellenados («confírmalo») → vista previa leída en voz → guardar en el
     equipo. Exportar e importar en JSON. El catálogo (data/clues_oaxaca.js) se carga SOLO aquí. */
  function lugar(ctx) {
    const L = Lug(); const TL = L.textos(); const ET = window.MediBotData.lugares.etiquetas;
    let paso = 1; let muni = null; let borrador = L.actual(); let prellenado = false;
    const cuerpo = h("div.lugar-pasos"); const aviso = h("p.ayuda", { "aria-live": "polite" });
    const cat = () => window.MediBotData.clues || null;
    function cargarCatalogo() {
      if (cat()) return pintar();
      cuerpo.replaceChildren(h("p", "Cargando el catálogo de unidades de salud…"));
      const sc = document.createElement("script");
      sc.src = "data/clues_oaxaca.js?v=0.5.0";
      sc.onload = pintar;
      sc.onerror = () => { aviso.textContent = "No se pudo cargar el catálogo. Puedes escribir la unidad a mano."; paso = 3; pintar(); };
      document.head.appendChild(sc);
    }
    const resumenActual = () => {
      const g = L.leer();
      return h("div.tarjeta.tarjeta--plana", h("h2", "Configuración guardada en este equipo"),
        g && g.nombre_corto ? [h("p", h("b", g.nombre_corto), g.municipio ? "\u00a0· " + g.municipio : "", g.fecha_confirmacion ? " · confirmado el " + g.fecha_confirmacion : "", g.confirmo ? " por " + g.confirmo : ""),
          L.vencida(g) ? h("p.error", { role: "alert" }, TL.revisar) : null]
          : h("p", "No hay configuración: la consulta solo muestra las líneas nacionales (911, Línea de la Vida y 079, opción 1)."));
    };
    function paso1() {
      const q = h("input", { type: "text", id: "lugar-municipio", "aria-label": "Buscar municipio", placeholder: "Escribe el municipio, por ejemplo Matias Romero", autocomplete: "off" });
      const lista = h("div.opciones.lugar__municipios");
      const filtrar = () => {
        const ms = L.buscarMunicipios(cat(), q.value, 40);
        lista.replaceChildren(...ms.map(m => opcionBtn(m.nombre, { marca: false, sub: `${L.unidadesDe(cat(), m.clave).length} unidades públicas en el catálogo`, onclick: () => { muni = m; paso = 2; pintar(); } })));
        if (!ms.length) lista.replaceChildren(h("p", "No encontré ese municipio."));
      };
      q.addEventListener("input", filtrar); filtrar();
      setTimeout(() => q.focus(), 0);
      return [h("h2", "Paso 1 de 4 · Municipio"), h("div.campo", h("label", { for: "lugar-municipio" }, "Municipio (570 municipios de Oaxaca, INEGI)"), q), lista];
    }
    function paso2() {
      const us = L.unidadesDe(cat(), muni.clave);
      const sub = (u) => [u.etiqueta, u.localidad, L.horarioLegible(u.horario)].filter(Boolean).join("\u00a0· ");
      return [h("h2", "Paso 2 de 4 · Unidad de salud en " + muni.nombre),
        us.length ? null : h("p", "El catálogo no tiene unidades públicas en este municipio. Escribe a mano la que usa la comunidad (puede estar en un municipio vecino)."),
        h("div.opciones.lugar__unidades",
          us.map(u => opcionBtn(L.nombreCorto(u.nombre), { marca: false, sub: sub(u), onclick: () => { borrador = L.prellenar(cat(), u); prellenado = true; paso = 3; pintar(); } })),
          opcionBtn("Otra unidad (escribirla a mano)", { marca: false, sub: "Para una unidad que no está en la lista o está en otro municipio", onclick: () => { borrador = L.normalizar({ municipio: muni.nombre }); prellenado = false; paso = 3; pintar(); } })),
        h("div.acciones", h("button.btn.btn--secundario", { type: "button", onclick: () => { paso = 1; pintar(); } }, icono("i-back"), "Otro municipio"))];
    }
    function paso3() {
      const inputs = {};
      const campo = (k, etiqueta, ayuda, tipo = "text") => {
        const el = h("input", { type: tipo, name: k, id: "lugar-" + k, value: borrador[k] || "", inputmode: k === "telefono" || k === "ambulancia" ? "tel" : null });
        inputs[k] = el;
        // Cada campo: etiqueta / caja / ayuda / error, en una subrejilla de 4 filas (css/app.css .formulario): así campos de
        // la misma fila quedan alineados aunque una etiqueta o una ayuda sea más larga.
        return h("div.campo", h("label", { for: "lugar-" + k }, etiqueta), el, h("span.ayuda", ayuda || ""), h("span.error", { "data-error": k }));
      };
      const urg = h("input", { type: "checkbox", name: "urgencias_24h", checked: borrador.urgencias_24h });
      if (!borrador.fecha_confirmacion) borrador.fecha_confirmacion = L.hoyLocal();
      const leerForm = () => { const crudo = Object.fromEntries(Object.entries(inputs).map(([k, el]) => [k, el.value])); crudo.urgencias_24h = urg.checked; return Object.assign({}, borrador, crudo); };
      const validar = (crudo) => {
        let ok = true;
        for (const k of ["telefono", "ambulancia"]) {
          const malo = String(crudo[k] || "").trim() && !L.telefono(crudo[k]);
          cuerpo.querySelector(`[data-error="${k}"]`).textContent = malo ? "Escribe 10 dígitos (lada y número), o déjalo vacío." : "";
          if (malo) ok = false;
        }
        const fecha = L.normalizar(crudo).fecha_confirmacion;
        const fechaMala = !fecha || fecha > L.hoyLocal();
        cuerpo.querySelector('[data-error="fecha_confirmacion"]').textContent = fechaMala ? "Pon la fecha en que confirmaste los datos (no una futura)." : "";
        if (fechaMala) ok = false;
        const sinNombre = !L.normalizar(crudo).nombre_corto;
        cuerpo.querySelector('[data-error="nombre_corto"]').textContent = sinNombre ? "Sin nombre corto la consulta no muestra la unidad." : "";
        return ok && !sinNombre;
      };
      return [h("h2", "Paso 3 de 4 · Datos de la unidad"),
        prellenado ? h("p.aviso-incompleto", pic("p-alerta"), h("span", TL.prellenado + (borrador.telefono ? "" : " El catálogo no trae un teléfono propio de esta unidad: escríbelo solo si lo confirmaste."))) : null,
        h("div.formulario",
          campo("nombre_corto", "Nombre corto (así lo dice la voz)", "Por ejemplo: Centro de Salud de Palomares"),
          campo("como_llegar", ET.como_llegar, "Referencias: frente a qué está, en qué calle"),
          campo("horario", ET.horario, "Por ejemplo: Lunes a viernes, de 8 de la mañana a 4 de la tarde"),
          campo("telefono", ET.telefono, "Solo si llamaste y contestó la unidad. Nunca uno de oficina regional.", "tel"),
          campo("ambulancia", ET.ambulancia, "Número local de ambulancia o traslado", "tel"),
          campo("vacunacion", ET.vacunacion, "Por ejemplo: martes y jueves"),
          campo("confirmo", "Quién confirmó los datos", "No se muestra al público"),
          campo("fecha_confirmacion", "Fecha de confirmación", "Si pasan 12 meses, el panel lo avisa", "date")),
        h("label.casilla-linea", urg, "Atiende urgencias las 24 horas, todos los días (confirmado). Solo así sale en el resultado rojo."),
        h("div.acciones",
          h("button.btn.btn--secundario", { type: "button", onclick: () => { paso = muni ? 2 : 1; pintar(); } }, icono("i-back"), "Atrás"),
          h("button.btn.btn--primario.btn--xl", { type: "button", onclick: () => { const c = leerForm(); if (!validar(c)) return; borrador = L.normalizar(c); paso = 4; pintar(); } }, "Vista previa", icono("i-next")))];
    }
    function paso4() {
      const voz = () => L.textoVoz("ambar", borrador);
      return [h("h2", "Paso 4 de 4 · Vista previa"),
        h("p", "Así lo verá la persona en el resultado ámbar, en «cuándo ir» y en la hoja impresa:"),
        h("div.lugar__vista", unidadEl("ambar", borrador), h("div.lineas", L.lineas("ambar", borrador).map(l => lineaEl(l)))),
        h("p.ayuda", borrador.urgencias_24h ? "En el resultado rojo sale debajo del 911." : "En el resultado rojo no sale (solo el 911" + (borrador.ambulancia ? " y la ambulancia" : "") + "), porque no atiende urgencias las 24 horas."),
        h("div.acciones",
          h("button.btn.btn--secundario", { type: "button", onclick: () => { paso = 3; pintar(); } }, icono("i-back"), "Corregir"),
          h("button.btn.btn--secundario.lugar__escuchar", { type: "button", onclick: () => hablar(voz()) }, icono("i-voz"), "Escuchar"),
          h("button.btn.btn--primario.btn--xl.lugar__guardar", { type: "button", onclick: () => { L.guardar(borrador); aviso.textContent = "Guardado en este equipo."; paso = 1; muni = null; pintar(); } }, "Guardar", icono("i-check")))];
    }
    function compartir() {
      const caja = h("textarea", { "aria-label": "Configuración en JSON", rows: 6 });
      const archivo = h("input", { type: "file", id: "lugar-archivo", accept: "application/json,.json" });
      const importarTexto = (txt) => { try { const u = L.importar(txt); L.guardar(u); borrador = u; aviso.textContent = "Importado y guardado: " + (u.nombre_corto || "sin nombre (no se mostrará)"); pintar(); } catch (e) { aviso.textContent = e.message; } };
      archivo.addEventListener("change", () => { const f = archivo.files && archivo.files[0]; if (f) f.text().then(importarTexto); });
      return h("details.tarjeta.tarjeta--plana", h("summary", "Copiar a otro quiosco (exportar o importar)"),
        h("div.medida__acciones",
          h("button.btn.btn--secundario.lugar__exportar", { type: "button", onclick: () => {
            const txt = L.exportar(L.actual()); caja.value = txt;
            const a = h("a", { href: URL.createObjectURL(new Blob([txt], { type: "application/json" })), download: "medibot_a_donde_voy.json" });
            document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
            aviso.textContent = "Exportado: medibot_a_donde_voy.json (también está abajo para copiarlo).";
          } }, "Exportar"),
          h("button.btn.btn--secundario.lugar__importar", { type: "button", onclick: () => importarTexto(caja.value) }, "Importar lo pegado abajo"),
          h("button.btn.btn--fantasma", { type: "button", onclick: () => { if (window.confirm("¿Borrar la configuración de este equipo?")) { L.borrar(); borrador = L.actual(); aviso.textContent = "Borrada: solo se mostrarán las líneas nacionales."; pintar(); } } }, "Borrar configuración")),
        h("div.campo", h("label", { for: "lugar-archivo" }, "O elige un archivo .json"), archivo), h("div.campo", caja));
    }
    function pintar() {
      const partes = !cat() && paso < 3 ? [h("p", "Cargando el catálogo…")] : paso === 1 ? paso1() : paso === 2 ? paso2() : paso === 3 ? paso3() : paso4();
      cuerpo.replaceChildren(resumenActual(), h("div.tarjeta", { "data-paso": paso }, partes), compartir());
    }
    const nodo = vista(".lugar-config",
      titulo(TL.titulo + " · centro de salud de esta comunidad", "El catálogo CLUES propone y tú confirmas: nada sale en pantalla sin que lo hayas visto. Fuente: DGIS, catálogo CLUES (septiembre de 2026), municipios de INEGI."),
      aviso, cuerpo,
      h("div.acciones", h("button.btn.btn--secundario", { type: "button", onclick: ctx.abrirOperador }, icono("i-back"), "Volver al panel")));
    nodo._titulo = "Panel del operador · ¿A dónde voy?";
    cargarCatalogo();
    return nodo;
  }

  /* ---------- Operador: verificación de sensores (modo comprobable) ---------- */
  function verificacion(ctx) {
    const S = ctx.sensores; const bit = ctx.config.bitacora || [];
    const vivo = { pulso: h("b", "—"), temp: h("b", "—"), peso: h("b", "—") };
    const oyente = e => { const m = e.detail; if (m.t === "pulso") vivo.pulso.textContent = `${m.bpm} lpm · ${m.spo2} % · q ${Math.round((m.q || 0) * 100)} %`; if (m.t === "temp") vivo.temp.textContent = `${m.c} °C`; if (m.t === "peso") vivo.peso.textContent = `${m.kg} kg${m.estable === false ? " (inestable)" : ""}`; };
    S.addEventListener("muestra", oyente);
    const ref = { peso: h("input", { type: "number", id: "ref-peso", step: "0.01", placeholder: "kg de la pesa patrón" }), temp: h("input", { type: "number", id: "ref-temp", step: "0.1", placeholder: "°C del termómetro" }) };
    const lista = h("ul");
    const pintaBit = () => { lista.replaceChildren(...bit.slice(-10).reverse().map(b => h("li", `${b.fecha} · ${b.sensor}: quiosco ${b.medido ?? "no válida"} vs referencia ${b.referencia} → diferencia ${b.dif ?? "—"}${b.decision ? "\u00a0· " + b.decision : ""}`))); if (!bit.length) lista.appendChild(h("li", "Sin registros aún.")); };
    const aviso = h("p.ayuda", { "aria-live": "polite" });
    async function comprobar(sensor) {
      const referencia = parseFloat(ref[sensor].value); if (!Number.isFinite(referencia)) { aviso.textContent = "Escribe el valor de referencia."; return; }
      if (S.modo === "desconectado") { aviso.textContent = "Conecta el ESP32 o activa la simulación."; return; }
      aviso.textContent = sensor === "temp" ? "Midiendo hasta que se estabilice (máximo 3 minutos)…" : "Midiendo…";
      try {
        const r = await S.medir(sensor, sensor === "peso" ? 12 : 180, (m) => { ctx.actividad(); if (sensor === "temp" && Number.isFinite(m.faltan)) aviso.textContent = `Midiendo: faltan como máximo ${m.faltan} s.`; });
        const fecha = new Date().toISOString().slice(0, 16).replace("T", " ");
        if (r.estado === "invalida" || r.valor == null) {
          bit.push({ fecha, sensor, medido: null, referencia, dif: null, decision: "no se estabilizó: revisar colocación y repetir" });
          ctx.guardarBitacora(bit); pintaBit(); aviso.textContent = "La lectura no se estabilizó. Revisa la colocación del sensor y repite."; return;
        }
        const dif = Math.round((r.valor - referencia) * 100) / 100;
        const decision = sensor === "peso" ? (Math.abs(dif) > 0.5 ? "error > 0.5 kg: hacer TARA y repetir; si persiste, recalibrar" : "dentro de 0.5 kg") : (Math.abs(dif) > 0.5 ? "error > 0.5 °C: revisar colocación del sensor" : "dentro de 0.5 °C");
        bit.push({ fecha, sensor, medido: r.valor, referencia, dif, decision });
        ctx.guardarBitacora(bit); pintaBit(); aviso.textContent = `Quiosco ${r.valor} vs referencia ${referencia}: diferencia ${dif} (${decision}).`;
      } catch (e) { aviso.textContent = "No se pudo medir: " + e.message; }
    }
    async function comando(cmd) {
      try { await S.enviar(cmd); aviso.textContent = "Enviado: " + cmd + ". Espera la confirmación del ESP32 en las lecturas en vivo."; }
      catch (e) { aviso.textContent = e.message; }
    }
    const oyenteAck = e => { const m = e.detail; if (m.t === "ack") aviso.textContent = `ESP32 respondió a ${m.cmd}: ${m.ok ? "OK" : "error"}${m.factor ? ` (factor ${m.factor})` : ""}`; if (m.t === "cal") { bit.push({ fecha: new Date().toISOString().slice(0, 16).replace("T", " "), sensor: "cal", medido: m.factor, referencia: m.cero, dif: 0, decision: "calibración guardada en el ESP32" }); ctx.guardarBitacora(bit); pintaBit(); } };
    S.addEventListener("muestra", oyenteAck);
    pintaBit();
    const salir = () => { S.removeEventListener("muestra", oyente); S.removeEventListener("muestra", oyenteAck); ctx.abrirOperador(); };
    const nodo = vista("",
      titulo("Verificación de sensores", "Aquí se comprueba que la báscula y el termómetro miden lo que dicen. Es la diferencia honesta con un aparato que no se puede comprobar."),
      h("div.rejilla",
        h("div.tarjeta", h("h2", "Lecturas en vivo"), h("p", "Pulso/oxígeno: ", vivo.pulso), h("p", "Temperatura: ", vivo.temp), h("p", "Báscula: ", vivo.peso), h("p.ayuda", "Modo: " + S.modo)),
        h("div.tarjeta", h("h2", "Báscula vs pesa patrón"), h("div.campo", h("label", { for: "ref-peso" }, "Peso conocido (kg)"), ref.peso),
          h("div.medida__acciones",
            h("button.btn.btn--secundario", { type: "button", onclick: () => comprobar("peso") }, "Comparar"),
            h("button.btn.btn--fantasma", { type: "button", onclick: () => comando("TARA") }, "Tara (plataforma vacía)"),
            h("button.btn.btn--fantasma", { type: "button", onclick: () => { const kg = parseFloat(ref.peso.value); if (Number.isFinite(kg) && kg > 0) comando("CAL " + kg); else aviso.textContent = "Escribe el peso patrón que está sobre la báscula."; } }, "Calibrar con esta pesa"))),
        h("div.tarjeta", h("h2", "Termómetro vs termómetro comercial"), h("div.campo", h("label", { for: "ref-temp" }, "Lectura del termómetro (°C)"), ref.temp), h("div.medida__acciones", h("button.btn.btn--secundario", { type: "button", onclick: () => comprobar("temp") }, "Comparar")))),
      aviso,
      h("div.tarjeta", h("h2", "Bitácora de calibración (últimas 10)"), lista, h("p.ayuda", "Se guarda solo en este equipo. No contiene datos de personas. Cómo calibrar: con la plataforma vacía, «Tara»; con una pesa de peso conocido, «Calibrar con esta pesa»; luego comprueba con 20, 50 y 80 kg en las cuatro esquinas."), h("div.medida__acciones", h("button.btn.btn--secundario", { type: "button", onclick: () => window.print() }, icono("i-print"), "Imprimir bitácora"))),
      h("div.acciones", h("button.btn.btn--secundario", { type: "button", onclick: salir }, icono("i-back"), "Volver al panel")));
    nodo._titulo = "Panel del operador · Verificación";
    return nodo;
  }

  window.MediBotPantallas = { reposo, bienvenida, sobreTi, medicinas, bebe, alarma, mediciones, cuidar, confirmar, resultado, fichas, resumen, operador, verificacion, lugar, nivelTag, medTag, ajustarHoja, soltarHoja };
})();
