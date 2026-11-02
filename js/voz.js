/* Voz de MediBot v0.5: lee la pantalla en voz alta con las voces de Windows (es-MX, sin internet)
   y acepta respuestas por botones físicos o teclado (para personas que no leen).
   No usa ningún asistente ni servicio en línea: solo speechSynthesis del sistema.
   Entradas aceptadas (todas equivalen a tocar la pantalla):
     - Teclado / botonera USB: S o + = sí · N o - = no · Enter o → = siguiente · ← = atrás · R o espacio = repetir · E = escuchar
       (Enter y Espacio NO se interceptan si el foco está en un botón, un campo o un [role=button]; escribiendo en un
       campo ninguna tecla es atajo).
     - ESP32: {"t":"boton","id":"si"|"no"|"siguiente"|"atras"|"repetir"} (verde = sí, rojo = no, azul = repetir).
   Cada pantalla puede traer un guion y su propio manejo de botones en nodo._voz = { guion(), accion(id) → true si lo atendió };
   app.js lo coloca en Voz.pantalla al pintar. Con un diálogo abierto, los botones solo contestan el diálogo. */
(function () {
  "use strict";
  const { $ } = window.U;
  const pref = (k, d) => { try { return localStorage.getItem("medibot." + k) ?? d; } catch { return d; } };

  const SINO = "Aprieta el botón verde para sí, o el rojo para no.";
  const SINO_CORTO = "Verde sí, rojo no."; // la instrucción completa una vez por pantalla; después, la corta
  const MAX_FRASE = 220;

  /** Texto apto para la voz: sin rayas para escribir, sin separadores, números de teléfono dictados en grupos, unidades dichas. */
  function paraVoz(t) {
    return String(t || "")
      .replace(/_{2,}/g, " ")
      .replace(/\s*[—–]\s*/g, ", ")
      .replace(/\s*·\s*/g, ", ")
      .replace(/\b800\s?911\s?2000\b/g, "ochocientos, novecientos once, dos mil") // criterio 48: agrupado, sin sonar a «9 1 1» ni a «nueve once»
      .replace(/\b911\b/g, "9 1 1")
      .replace(/(\d)\s?°C/g, "$1 grados")
      .replace(/(\d)\s?%/g, "$1 por ciento")
      .replace(/\blpm\b/g, "latidos por minuto")
      .replace(/kg\/m²/g, "")
      .replace(/(\d)\s?kg\b/g, "$1 kilos")
      .replace(/(\d)\s?cm\b/g, "$1 centímetros")
      .replace(/[✓✗✔✖☐]/g, " ") // permitido-emoji: quita estos signos antes de leer en voz
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, " ")
      .replace(/\s+/g, " ")
      .replace(/\s+([,.;:!?])/g, "$1")
      .replace(/([,.;:!?…])(\s*[,.;:])+/g, "$1")
      .replace(/^[,.;:\s]+/, "")
      .trim();
  }
  /** Divide en frases cortas (la voz de Windows corta las muy largas) sin perder texto. */
  function frases(texto) {
    const out = [];
    for (const f of paraVoz(texto).split(/(?<=[.!?…:])\s+/)) {
      let resto = f.trim();
      while (resto.length > MAX_FRASE) {
        let i = resto.lastIndexOf(", ", MAX_FRASE);
        if (i < 60) i = resto.lastIndexOf(" ", MAX_FRASE);
        if (i < 1) i = MAX_FRASE;
        out.push(resto.slice(0, i + 1).trim());
        resto = resto.slice(i + 1).trim();
      }
      if (resto) out.push(resto);
    }
    return out;
  }
  /** textContent sin fuentes, leyendas, iconos ni partes ocultas. */
  function textoDe(el) {
    if (!el) return "";
    if (el.dataset && el.dataset.voz) return el.dataset.voz;
    const c = el.cloneNode(true);
    c.querySelectorAll(".fuente, .leyenda, .no-voz, [hidden], svg, .kicker").forEach(n => n.remove());
    // Cada bloque, su pausa antes y después (si no, «Autocuidado» y «Hoy no…» se pegan: «AutocuidadoHoy»); paraVoz
    // junta los signos repetidos. Lo que va en línea (b, small, span) lleva al menos un espacio.
    c.querySelectorAll("div, p, li, h1, h2, h3, td, tr").forEach(n => { n.prepend(". "); n.append(". "); });
    c.querySelectorAll("b, strong, small, span, a").forEach(n => n.append(" "));
    return c.textContent.replace(/\s+/g, " ").trim();
  }
  const conPunto = (t) => (!t ? "" : /[.!?…:]$/.test(t) ? t : t + ".");
  /** prefijo + texto sin decir dos veces lo mismo («Listo. Listo. Si quieres…»). */
  function sinRepetir(prefijo, texto) {
    const pre = String(prefijo || "").trim(); const resto = String(texto || "").trim();
    if (!pre) return resto;
    return resto.startsWith(pre) ? resto : `${pre} ${resto}`.trim();
  }
  // En la app de escritorio (quiosco) la voz viene encendida: quien no sabe leer necesita oír cada pantalla.
  // Si el operador la apagó a propósito, se respeta lo que guardó.
  const enEscritorio = !!(window.medibotEscritorio && window.medibotEscritorio.esApp);

  const Voz = {
    disponible: "speechSynthesis" in window,
    siempre: pref("voz", enEscritorio ? "1" : "0") === "1", // leer cada pantalla al entrar
    pantalla: null,                        // manejador de la pantalla actual (lo pone app.js)
    alActividad: null,                     // reinicia la inactividad (lo pone app.js)
    ultimoTexto: "",                       // lo último que se mandó a la voz (para revisar sin bocinas)
    paraVoz, frases, textoDe, sinRepetir, SINO, SINO_CORTO,

    _actividad() { if (typeof this.alActividad === "function") this.alActividad(); },
    elegirVoz() {
      if (!this.disponible) return null;
      const vs = speechSynthesis.getVoices();
      return vs.find(v => /es-MX/i.test(v.lang) && /sabina/i.test(v.name)) || vs.find(v => /es-MX/i.test(v.lang)) || vs.find(v => /^es/i.test(v.lang)) || null;
    },
    detener() { if (this.disponible) speechSynthesis.cancel(); },
    /** Lee un texto (o una lista de textos) en varias frases, sin cortar. Leer cuenta como actividad. */
    leer(texto) {
      const lista = (Array.isArray(texto) ? texto : [texto]).flatMap(t => frases(t));
      this.ultimoTexto = lista.join(" ");
      this._actividad();
      if (!this.disponible) return;
      speechSynthesis.cancel();
      const v = this.elegirVoz();
      for (const f of lista) {
        const u = new SpeechSynthesisUtterance(f);
        u.lang = "es-MX"; u.rate = 0.95; u.pitch = 1;
        if (v) u.voice = v;
        u.onstart = () => this._actividad();
        u.onend = () => this._actividad();
        speechSynthesis.speak(u);
      }
    },

    /* ---------- Qué se lee ---------- */
    textoPantalla() {
      const dlg = document.querySelector("dialog[open]");
      if (dlg) return this.textoDialogo(dlg);
      const app = $("#app"); if (!app) return "";
      if (this.pantalla && typeof this.pantalla.guion === "function") return this.pantalla.guion();
      return this.textoGenerico(app) + " " + this.instruccion();
    },
    /** Lectura genérica: títulos, párrafos, listas, opciones, valores, avisos, banderas y celdas; sin fuentes. */
    textoGenerico(raiz) {
      const SEL = "h1, h2, h3, p, li, .opcion, .datos__fila, .medicion__valor, .medicion__estado, .medida__valor, .medida__estado, .aviso-incompleto, .aviso-rojo, .heroe, .caja-911, .telefono, .advertencia, .cuidado, .hoja__nivel, td, [data-voz]";
      const tomados = []; const partes = [];
      raiz.querySelectorAll(SEL).forEach(el => {
        if (el.closest("[hidden], .operador, .fuente, .leyenda, .no-voz, details:not([open])")) return;
        if (tomados.some(t => t.contains(el))) return; // ya se leyó con su contenedor
        const t = textoDe(el);
        if (!t || t.length < 2 || (partes.includes(t) && !el.matches("td"))) return; // en tablas el estado se repite a propósito
        tomados.push(el); partes.push(t);
      });
      return partes.map(conPunto).join(" ");
    },
    /** Qué hace cada botón en esta pantalla: se dice cuando se aprieta uno que aquí no hace nada. */
    instruccion() {
      const b = this.botones;
      if (!b) return "Para empezar, aprieta el verde.";
      const partes = [];
      if (b.verde && !b.verde.deshabilitado) partes.push(`Para ${b.verde.voz || "seguir"}, aprieta el verde.`);
      partes.push("Para oír otra vez, el azul.");
      if (b.rojo && b.rojo.id === "atras") partes.push("Para regresar, deja apretado el rojo.");
      else if (b.rojo) partes.push(`Para ${b.rojo.voz || b.rojo.texto.toLowerCase()}, el rojo.`);
      return partes.join(" ");
    },
    textoDialogo(dlg) {
      const cuerpo = [...dlg.querySelectorAll("h2, p, .telefono")].map(textoDe).map(conPunto).join(" ");
      if (dlg.id === "dlg-borrar") return cuerpo + " Verde: sí, seguir. Rojo: no, borrar todo.";
      if (dlg.id === "dlg-cerrar") return cuerpo + " Verde: no, seguir. Para cerrar MediBot, toca «Sí, cerrar» en la pantalla."; // criterio 76
      return cuerpo + " Para cerrar, aprieta el botón verde.";
    },
    leerPantalla() { this.leer(this.textoPantalla()); },

    /* ---------- Recorrido opción por opción (para elegir sin leer) ----------
       pasos(): [{ pregunta?, multiple?, respondido?(), opciones: [{ el, voz, nombre, exclusiva?, saltar?(), alSi?(), alNo?() }] }] (se recalcula
       siempre, así aparecen los pasos que dependen de otra respuesta). Sí elige la opción (o llama alSi); No pasa a la siguiente. */
    crearRecorrido({ intro, pasos, final, alFinal }) {
      const voz = this;
      let iPaso = 0, iOpc = 0, vuelta = false, dijoSino = false, pausado = false;
      const sino = () => { if (dijoSino) return SINO_CORTO; dijoSino = true; return SINO; };
      const visibles = (p) => p.opciones.filter(o => o.el && document.contains(o.el) && !o.el.disabled && !o.el.closest("[hidden]") && !(o.saltar && o.saltar()));
      // Un paso de opción única que ya tiene una opción elegida (tocada) se salta: la voz no contesta por la persona
      // (`respondido()`, opcional: el paso decide, p. ej. si se tocó una opción de la pregunta que la voz no lee una por una)
      const contestado = (p) => !p.multiple && !p.siempre && (typeof p.respondido === "function" ? p.respondido() : p.opciones.some(o => o.el && o.el.getAttribute("aria-pressed") === "true"));
      function normalizar() {
        const ps = pasos().filter(Boolean);
        while (iPaso < ps.length) {
          const ops = visibles(ps[iPaso]);
          if (!ops.length || (iOpc === 0 && contestado(ps[iPaso]))) { iPaso++; iOpc = 0; continue; }
          if (iOpc < ops.length) return { paso: ps[iPaso], op: ops[iOpc] };
          if (ps[iPaso].multiple) { iPaso++; iOpc = 0; continue; }
          iOpc = 0; vuelta = true; return { paso: ps[iPaso], op: ops[0] };
        }
        return null;
      }
      // La opción de la que habla la voz se marca (contorno añil) y se trae a la vista
      function marcar(el) {
        document.querySelectorAll(".opcion--preguntando").forEach(x => { if (x !== el) x.classList.remove("opcion--preguntando"); });
        if (!el) return;
        el.classList.add("opcion--preguntando");
        const quieto = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
        // Criterio 61: la opción siempre a la vista y el título de su pregunta completo (o fuera de la vista), nunca a la
        // mitad. Se calcula el desplazamiento de #contenido; el área visible termina donde empieza la botonera.
        const cont = document.getElementById("contenido");
        if (!cont || typeof cont.scrollTo !== "function") { if (el.scrollIntoView) el.scrollIntoView({ block: "nearest" }); return; }
        const c = cont.getBoundingClientRect(); const bot = document.getElementById("botonera");
        const abajo = bot && bot.getClientRects().length ? Math.min(c.bottom, bot.getBoundingClientRect().top) : c.bottom;
        const alto = abajo - c.top; const M = 8; const y0 = cont.scrollTop;
        const caja = (x) => { const r = x.getBoundingClientRect(); return { top: r.top - c.top + y0, bottom: r.bottom - c.top + y0 }; };
        const o = caja(el); const bloque = el.closest(".bloque"); const tit = bloque && bloque.querySelector("h2, h3");
        const verAmbos = (a, b) => { let y = y0; if (b.bottom + M > y + alto) y = b.bottom + M - alto; if (a.top - M < y) y = a.top - M; return y; };
        let y = verAmbos(o, o);
        if (tit) {
          const tt = caja(tit); const b = bloque ? caja(bloque) : null;
          if (b && b.bottom - b.top + 2 * M <= alto) y = verAmbos(b, b);               // cabe la pregunta entera
          else if (o.bottom - tt.top + 2 * M <= alto) y = verAmbos(tt, o);             // cabe del título a la opción
          else if (tt.top < y && tt.bottom > y) y = Math.min(tt.bottom, o.top);        // no cabe: el título queda arriba, fuera
        }
        y = Math.max(0, Math.min(y, cont.scrollHeight - cont.clientHeight));
        if (Math.abs(y - y0) > 0.5) cont.scrollTo({ top: y, behavior: quieto ? "auto" : "smooth" });
      }
      function pregunta(prefijo) {
        const a = normalizar();
        const pre = prefijo ? prefijo + " " : "";
        marcar(a ? a.op.el : null);
        if (!a) return sinRepetir(prefijo, final());
        const otra = vuelta ? "No elegiste ninguna; vamos otra vez. " : ""; vuelta = false;
        return `${pre}${otra}${a.paso.pregunta && iOpc === 0 ? a.paso.pregunta + " " : ""}${a.op.voz} ${sino()}`;
      }
      return {
        guion: () => { dijoSino = false; return `${intro ? conPunto(intro()) + " " : ""}${pregunta("")}`; },
        /** Con la voz encendida, al tocar una opción se dice lo elegido y la voz sigue con la siguiente pregunta. */
        // Criterio 42: tocar una opción la elige y detiene la voz (no salta ni marca otra); el siguiente botón físico retoma
        tocado(nombre) { pausado = true; marcar(null); if (voz.siempre) voz.leer(nombre ? `Elegiste: ${nombre}.` : ""); },
        accion(id) {
          if (id !== "si" && id !== "no") return false;
          if (pausado) { pausado = false; voz.leer(pregunta("")); return true; }
          const a = normalizar();
          if (!a) {
            if (id === "si") alFinal();
            else { iPaso = 0; iOpc = 0; voz.leer(pregunta("Bien, lo revisamos otra vez.")); }
            return true;
          }
          const elegida = a.op.el.getAttribute("aria-pressed") === "true";
          if (id === "si") {
            if (a.op.alSi) a.op.alSi(); // p. ej. abrir un grupo (sin alternar si ya estaba abierto)
            else if (!(a.paso.multiple && elegida)) a.op.el.click();
            if (!a.paso.multiple || a.op.exclusiva) { iPaso++; iOpc = 0; } else iOpc++;
            voz.leer(pregunta(a.op.dichoSi || (a.op.nombre ? `Elegiste: ${a.op.nombre}.` : "Listo.")));
          } else if (a.op.alNo) {
            a.op.alNo(); iPaso++; iOpc = 0;
            voz.leer(pregunta(a.op.dichoNo || "")); // después de un «no», la voz no empieza con «Listo.»
          } else {
            if (a.paso.multiple && elegida) a.op.el.click();
            iOpc++;
            voz.leer(pregunta(""));
          }
          return true;
        }
      };
    },

    /* ---------- Acciones por botón físico / teclado ---------- */
    accion(id) {
      this._actividad(); // un botón físico también es actividad
      if (typeof this.cancelarLecturaAuto === "function") this.cancelarLecturaAuto();
      const dlg = document.querySelector("dialog[open]");
      if (dlg) return this.accionDialogo(dlg, id);
      const app = $("#app"); if (!app) return;
      // (El teclado ya no manda atajos mientras se escribe en un campo: lo filtra instalar(). Los botones físicos del ESP32
      //  sí cuentan aunque el foco esté en un campo: la persona que escribió un valor sigue con el verde.)
      // El azul repite; en algunas pantallas lee algo más completo (la bienvenida, el aviso entero; la hoja, toda la hoja)
      if (id === "repetir") { const az = this.botones && this.botones.azul; return az && typeof az.fn === "function" ? az.fn() : this.leerPantalla(); }
      if (this.pantalla && typeof this.pantalla.accion === "function" && this.pantalla.accion(id)) return;
      // Lo que no atiende la pantalla lo hace el botón de ese color de la botonera (la pantalla es el retrato de la consola)
      const b = this.botones || {};
      const listo = (s) => s && !s.deshabilitado && typeof s.fn === "function";
      if ((id === "si" || id === "siguiente") && listo(b.verde)) return b.verde.fn();
      if (id === "atras") {
        if (b.rojo && b.rojo.id === "atras" && listo(b.rojo)) return b.rojo.fn();
        if ((b.azul || b.verde) && typeof this.alAtras === "function") return this.alAtras();
        return this.leer(this.instruccion());
      }
      if (id === "no" && b.rojo && b.rojo.id === "no" && listo(b.rojo)) return b.rojo.fn();
      // El rojo ya no regresa callado; un botón o una tecla sin acción dice qué hace cada botón aquí
      this.leer(this.instruccion());
    },
    /** Con un diálogo abierto solo se contesta el diálogo (nunca las preguntas de atrás). */
    accionDialogo(dlg, id) {
      if (id === "repetir") return this.leer(this.textoDialogo(dlg));
      if (dlg.id === "dlg-borrar") {
        if (id === "si" || id === "siguiente") dlg.querySelector('[data-accion="seguir"]').click();
        else if (id === "no") dlg.querySelector('[data-accion="borrar"]').click();
        else this.leer(this.textoDialogo(dlg));
        return;
      }
      if (id === "si" || id === "siguiente" || id === "no") { const cerrar = dlg.querySelector(".dialogo__acciones .btn--primario"); if (cerrar) cerrar.click(); }
      else this.leer(this.textoDialogo(dlg));
    },

    instalar() {
      if (this.disponible) speechSynthesis.getVoices(); // precarga
      // Teclado / botonera USB (un codificador de botones arcade envía teclas)
      document.addEventListener("keydown", e => {
        if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
        const k = e.key; const ae = document.activeElement;
        const enTexto = ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName);
        const enControl = ae && ae !== document.body && ae.matches('button, [role="button"], a[href], summary, input, select, textarea');
        // Criterio 68: Enter siempre hace lo del verde, aunque el foco haya quedado en un botón tocado (Espacio sí lo activa)
        if (k === " " && enControl) return;
        if (k === "Enter" && enControl && (enTexto || ae.closest("dialog, .operador, .lugar-config, [role=button]") || ae.matches("summary, a[href]"))) return;
        if (enTexto) return; // escribiendo: ninguna tecla es un atajo
        const mapa = { s: "si", S: "si", "+": "si", n: "no", N: "no", "-": "no", Enter: "siguiente", ArrowRight: "siguiente", ArrowLeft: "atras", r: "repetir", R: "repetir", " ": "repetir", e: "escuchar", E: "escuchar" };
        const id = mapa[k] || (k.length === 1 ? "otra" : null); if (!id) return; // una tecla sin acción también se contesta
        e.preventDefault();
        if (id === "escuchar") { this._actividad(); this.leerPantalla(); return; }
        this.accion(id);
      });
      // Botones físicos del ESP32
      window.MediBotSensores.addEventListener("muestra", e => { const m = e.detail; if (m.t === "boton" && m.id) this.accion(m.id); });
    }
  };
  window.MediBotVoz = Voz;
})();
