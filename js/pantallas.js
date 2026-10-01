/* Pantallas de MediBot v0.2. Cada función recibe ctx = { sesion, ir, atras, terminar, datos, sensores, resultado, actividad, config } y devuelve un nodo. */
(function () {
  "use strict";
  const { h, icono, fmt, fuenteEl } = window.U;
  const NIVEL_ICONO = { verde: "i-check", ambar: "i-circle", rojo: "i-triangle" };
  const MENORES = ["bebe", "nino", "12a17"];

  function cabecera(kicker, titulo, ayuda) {
    return h("div.cabecera", h("div.kicker", kicker), h("h1", titulo), ayuda ? h("p", ayuda) : null);
  }
  function nivelTag(nivel, texto) {
    if (!nivel) return h("span.nivel-tag.nivel-tag--nd", icono("i-info"), texto || "Sin clasificar");
    const n = window.MediBotData.textos.niveles[nivel];
    return h("span.nivel-tag.nivel-tag--" + nivel, icono(NIVEL_ICONO[nivel]), texto || n.nombre);
  }
  /** Etiqueta para UNA medición (no el nivel global). */
  function medTag(fila) {
    const E = window.MediBotData.textos.etiquetas_medicion;
    if (fila.estado === "invalida") return nivelTag(null, E.invalida);
    if (fila.fuera_semaforo && fila.etiqueta && !fila.nivel) return nivelTag(null, `${fila.etiqueta} · no cambia el semáforo`);
    if (!fila.clasificado || !fila.nivel) return nivelTag(null, fila.etiqueta ? `${fila.etiqueta} · ${E.nd}` : E.nd);
    const base = fila.etiqueta ? `${fila.etiqueta} · ${E[fila.nivel]}` : E[fila.nivel];
    return nivelTag(fila.nivel, fila.prisa === "hoy" ? base + " hoy" : base);
  }
  function botonesNav(ctx, { siguiente = "Continuar", puedeSeguir = true, onSiguiente, atras = true } = {}) {
    return h("div.acciones",
      atras ? h("button.btn.btn--secundario", { type: "button", onclick: ctx.atras }, icono("i-back"), "Atrás") : null,
      h("button.btn.btn--primario.btn--xl", { type: "button", disabled: !puedeSeguir, onclick: onSiguiente || (() => ctx.ir()) }, siguiente, icono("i-next"))
    );
  }
  function telefonoEl(t) {
    return h("div.telefono", icono("i-phone"), h("div", h("div.num", t.numero), h("div", h("b", t.nombre), " · ", t.nota)));
  }
  function leyendaEl(T) {
    const L = T.leyenda_cofepris;
    return h("div.leyenda", L.mayusculas.map(l => h("p.leyenda__mayus", l)), h("p", L.linea), h("p.fuente", "Fundamento: ", L.fuentes.map((f, i) => h("span", i ? " · " : null, h("a", { href: f.url, target: "_blank", rel: "noopener" }, f.nombre)))));
  }

  /* ---------- 0. Reposo ---------- */
  function reposo(ctx) {
    return h("section.pantalla.reposo", { role: "button", tabindex: 0, "aria-label": "Toca para empezar", onclick: () => ctx.ir(), onkeydown: e => { if (e.key === "Enter" || e.key === " ") ctx.ir(); } },
      h("div",
        h("h1", "Medi", h("b", "Bot")),
        h("p.lema", "Orientación en salud con sensores que se pueden comprobar y fuentes que puedes revisar. No es un diagnóstico."),
        h("div.formas", { "aria-hidden": "true" },
          h("span", { style: "background:var(--verde)" }, icono("i-check")),
          h("span", { style: "background:var(--ambar)" }, icono("i-circle")),
          h("span", { style: "background:var(--rojo)" }, icono("i-triangle"))),
        h("div.toque", icono("i-hand"), "Toca la pantalla para empezar")
      )
    );
  }

  /* ---------- 1. Bienvenida ---------- */
  function bienvenida(ctx) {
    const B = ctx.datos.textos.bienvenida;
    return h("section.pantalla",
      cabecera("Antes de empezar", B.titulo),
      h("div.dos",
        h("div.tarjeta", h("h2", "Lo que sí hago"), h("ul", B.que_es.map(t => h("li", t)))),
        h("div.tarjeta", h("h2", "Lo que no hago"), h("ul", B.que_no_es.map(t => h("li", t))))),
      h("p.nota-limite", { style: "margin-top:1rem;font-size:1.05rem" }, icono("i-phone"), " ", B.urgencia),
      h("div.tarjeta.tarjeta--plana", { style: "margin-top:1rem" }, h("h3", B.privacidad_titulo), B.privacidad.map(p => h("p", { style: "font-size:.95rem" }, p))),
      botonesNav(ctx, { siguiente: B.boton, atras: false })
    );
  }

  /* ---------- 2. Sobre ti ---------- */
  function sobreTi(ctx) {
    const s = ctx.sesion; const R = ctx.datos.rangos; const T = ctx.datos.textos;
    const grupoBtns = R.grupos.map(g => h("button.opcion", { type: "button", "aria-pressed": String(s.grupo === g.id), onclick: () => { s.grupo = g.id; refrescar(); } }, h("b", g.nombre), h("small", g.sub)));
    const embOpc = [[true, "Sí"], [false, "No"], [null, "Prefiero no decir"]];
    const embBtns = embOpc.map(([v, n]) => h("button.opcion", { type: "button", "aria-pressed": String(s.embarazo === v && s.embarazoRespondido), onclick: () => { s.embarazo = v; s.embarazoRespondido = true; refrescar(); } }, h("b", n)));
    const embCard = h("div.tarjeta", { style: "margin-top:1rem", hidden: true }, h("h2", T.embarazo.pregunta, " ", h("small", { style: "font-weight:400;color:var(--tinta-2)" }, "(opcional)")), h("p.ayuda", T.embarazo.ayuda), h("div.opciones", { role: "group", "aria-label": T.embarazo.pregunta }, embBtns));
    const peso = h("input", { type: "number", id: "peso", inputmode: "decimal", min: 2, max: 300, step: "0.1", placeholder: "kg", value: s.peso.valor ?? "", oninput: e => { s.peso = { valor: parseFloat(e.target.value) || null, origen: "manual" }; refrescar(); } });
    const talla = h("input", { type: "number", id: "talla", inputmode: "numeric", min: 40, max: 250, step: "1", placeholder: "cm", value: s.talla.valor ?? "", oninput: e => { s.talla = { valor: parseFloat(e.target.value) || null, origen: "manual" }; refrescar(); } });
    const imcOut = h("p.ayuda", { "aria-live": "polite" });
    const btnSiguiente = h("button.btn.btn--primario.btn--xl", { type: "button", onclick: () => ctx.ir(s.grupo === "bebe" ? "bebe" : undefined) }, "Continuar", icono("i-next"));
    const pesoSensor = h("button.btn.btn--secundario", { type: "button", onclick: medirPeso }, icono("i-scale"), "Pesar con la báscula");
    const estadoPeso = h("span.medida__estado");
    const pesoCard = h("div.tarjeta", { style: "margin-top:1rem" },
      h("h2", "Peso y estatura ", h("small", { style: "font-weight:400;color:var(--tinta-2)" }, "(opcional)")),
      h("div.dos", h("div.campo", h("label", { for: "peso" }, "Peso en kilos"), peso), h("div.campo", h("label", { for: "talla" }, "Estatura en centímetros"), talla)),
      h("div.medida__acciones", { style: "margin-top:.8rem" }, pesoSensor, estadoPeso), imcOut);

    let pesando = false;
    async function medirPeso() {
      if (ctx.sensores.modo === "desconectado") { estadoPeso.textContent = "No hay báscula conectada. Escribe tu peso o déjalo vacío."; return; }
      if (pesando) return; pesando = true;
      pesoSensor.disabled = true; estadoPeso.textContent = "Te estamos pesando: quédate quieto…";
      try {
        const r = await ctx.sensores.medir("peso", 12, m => { estadoPeso.textContent = `${m.estable ? "Casi" : "Leyendo"}… ${fmt(m.valor, 1)} kg`; ctx.actividad(); });
        s.peso = { valor: r.valor, origen: "sensor" }; peso.value = r.valor; estadoPeso.textContent = r.calidad >= 1 ? "Listo (± 0.5 kg)." : "Listo, pero te moviste; si puedes, vuelve a subirte."; refrescar();
      } catch (e) { estadoPeso.textContent = "No se pudo leer la báscula. Escribe tu peso o déjalo vacío."; }
      pesoSensor.disabled = false; pesando = false;
    }
    // Pesado automático: si hay báscula, en cuanto alguien se sube (≥ 5 kg) se mide sin tocar nada. El botón queda de respaldo.
    const alSubirse = (e) => {
      if (!document.contains(estadoPeso)) { ctx.sensores.removeEventListener("muestra", alSubirse); return; } // ya salimos de esta pantalla
      const m = e.detail; if (m.t !== "peso" || pesando || s.peso.origen === "sensor") return;
      if (typeof m.kg === "number" && m.kg >= 5) medirPeso();
    };
    if (ctx.sensores.modo !== "desconectado") { ctx.sensores.addEventListener("muestra", alSubirse); estadoPeso.textContent = "Súbete a la báscula: te peso solo."; }
    function refrescar() {
      grupoBtns.forEach((b, i) => b.setAttribute("aria-pressed", String(s.grupo === R.grupos[i].id)));
      embBtns.forEach((b, i) => b.setAttribute("aria-pressed", String(s.embarazoRespondido && s.embarazo === embOpc[i][0])));
      embCard.hidden = !(s.grupo === "12a17" || s.grupo === "18a59");
      pesoCard.hidden = s.grupo === "bebe";
      const imc = window.MediBotReglas.imcDe(s.peso.valor, s.talla.valor);
      imcOut.textContent = imc ? `Tu índice de masa corporal (IMC) sería ${fmt(imc, 1)}. Es solo una pista; lo explicamos al final, fuera del semáforo.` : "Si no sabes tu peso o talla, puedes dejarlo vacío.";
      btnSiguiente.disabled = !s.grupo;
    }
    refrescar();
    return h("section.pantalla",
      cabecera("Paso 1 de 7", "Cuéntame un poco de ti", "Solo lo necesario para comparar tus mediciones con el rango de tu edad. No pedimos tu nombre."),
      h("div.tarjeta", h("h2", "¿Cuántos años tienes?"), h("div.opciones", { role: "group", "aria-label": "Grupo de edad" }, grupoBtns)),
      embCard, pesoCard,
      h("div.acciones", h("button.btn.btn--secundario", { type: "button", onclick: ctx.atras }, icono("i-back"), "Atrás"), btnSiguiente)
    );
  }

  /* ---------- 2b. Bebé menor de 3 meses ---------- */
  function bebe(ctx) {
    const T = ctx.datos.textos; const R = ctx.datos.rangos;
    return h("section.pantalla",
      cabecera("Bebés menores de 3 meses", "Aquí no medimos a bebés tan pequeños"),
      h("div.nivel-hero.nivel-hero--ambar", { role: "status" }, h("div.nivel-hero__forma", icono("i-circle")), h("div", h("h1", "Que lo revise personal de salud"), h("p", R.mensaje_bebe))),
      h("div.tarjeta", { style: "margin-top:1rem" }, h("h2", "Teléfonos"), h("div", { style: "display:grid;gap:.6rem" }, T.telefonos.map(telefonoEl)), h("p.fuente", { style: "margin-top:.6rem" }, "Fuente: ", h("a", { href: "https://medlineplus.gov/spanish/ency/patientinstructions/000319.htm", target: "_blank", rel: "noopener" }, "MedlinePlus (NIH), Cuando su bebé o lactante tenga fiebre"))),
      h("div.acciones", h("button.btn.btn--secundario", { type: "button", onclick: () => ctx.ir("sobreTi") }, icono("i-back"), "Cambiar edad"), h("button.btn.btn--primario.btn--xl", { type: "button", onclick: ctx.terminar }, "Terminar", icono("i-check")))
    );
  }

  /* ---------- 3. Señales de alarma (antes de medir) ---------- */
  function alarma(ctx) {
    const s = ctx.sesion; const A = ctx.datos.alarma;
    const preguntas = A.preguntas.filter(p => window.MediBotReglas.aplicaPregunta(p, s));
    const btnSig = h("button.btn.btn--primario.btn--xl", { type: "button", onclick: () => ctx.ir() }, "Continuar a medir", icono("i-next"));
    const faltan = h("p.ayuda", { "aria-live": "polite" });
    const bannerRojo = h("div.aviso-rojo", { role: "alert", hidden: true },
      h("div", h("h2", icono("i-triangle"), " Señal de urgencia"), h("p", "No necesitas seguir con las preguntas ni medir. Te decimos qué hacer ahora.")),
      h("button.btn.btn--rojo.btn--xl", { type: "button", onclick: () => ctx.ir("resultado") }, "Ver qué hacer ahora", icono("i-next")));
    function refrescar() {
      const n = preguntas.filter(p => s.alarma[p.id] !== true && s.alarma[p.id] !== false).length;
      const hayRojo = preguntas.some(p => p.nivel === "rojo" && s.alarma[p.id] === true);
      bannerRojo.hidden = !hayRojo;
      btnSig.disabled = n > 0; faltan.textContent = n > 0 ? `Faltan ${n} por responder.` : hayRojo ? "Puedes ir directo al resultado o seguir midiendo si quieres." : "Gracias. Puedes continuar.";
    }
    const lista = preguntas.map(p => {
      const si = h("button", { type: "button", "data-v": "si", "aria-pressed": String(s.alarma[p.id] === true), onclick: () => { s.alarma[p.id] = true; pinta(); } }, "Sí");
      const no = h("button", { type: "button", "data-v": "no", "aria-pressed": String(s.alarma[p.id] === false), onclick: () => { s.alarma[p.id] = false; pinta(); } }, "No");
      const avisoTel = p.telefono ? h("div.aviso-linea", { hidden: s.alarma[p.id] !== true }, icono("i-phone"), " Puedes llamar ahora a la ", h("b", "Línea de la Vida: " + p.telefono), ". Es gratis, confidencial y las 24 horas. Si quieres, avísale a la persona del quiosco.") : null;
      function pinta() { si.setAttribute("aria-pressed", String(s.alarma[p.id] === true)); no.setAttribute("aria-pressed", String(s.alarma[p.id] === false)); if (avisoTel) avisoTel.hidden = s.alarma[p.id] !== true; refrescar(); }
      return h("div.pregunta", { class: p.nivel === "ambar" ? "pregunta--ambar" : p.nivel === "apoyo" ? "pregunta--apoyo" : "" },
        h("div", h("div.pregunta__texto", p.texto), p.ayuda ? h("div.pregunta__ayuda", p.ayuda) : null, avisoTel),
        h("div.sino", { role: "group", "aria-label": p.texto }, si, no));
    });
    refrescar();
    return h("section.pantalla",
      cabecera("Paso 2 de 7", "Señales de alarma", A.intro),
      bannerRojo,
      h("div.tarjeta", lista),
      faltan,
      h("div.acciones", h("button.btn.btn--secundario", { type: "button", onclick: ctx.atras }, icono("i-back"), "Atrás"), btnSig)
    );
  }

  /* ---------- 4. Mediciones ---------- */
  function mediciones(ctx) {
    const s = ctx.sesion;
    const tarjetas = [
      tarjetaMedida(ctx, { id: "fc", tipo: "pulso", titulo: "Pulso y oxígeno", segundos: 30, instruccion: "Pon el dedo índice en el sensor, sin apretar, y no te muevas 30 segundos. Manos tibias, sin esmalte.", campos: [{ id: "fc", etiqueta: "Pulso (latidos por minuto)", min: 30, max: 220, step: 1, unidad: " lpm" }, { id: "spo2", etiqueta: "Oxígeno (%)", min: 70, max: 100, step: 1, unidad: " %" }] }),
      tarjetaMedida(ctx, { id: "temp", tipo: "temp", titulo: "Temperatura axilar", segundos: 20, instruccion: "Coloca el sensor bajo el brazo (axila), pegado a la piel, y sostenlo quieto. Es una medida aproximada.", campos: [{ id: "temp", etiqueta: "Temperatura (°C)", min: 34, max: 41.5, step: 0.1, unidad: " °C" }] })
    ];
    const ninoNota = s.grupo === "nino" ? h("p.nota-limite", "En niñas y niños mostramos los valores con su rango de edad, sin semáforo. Solo avisamos si algo está muy fuera de rango.") : null;
    const avisoPendiente = h("p.aviso-incompleto", { role: "alert", hidden: true }, icono("i-info"), h("span", "Hay una medición fuera de lo esperado que falta confirmar. Repítela una vez más, escríbela a mano u omítela."));
    return h("section.pantalla",
      cabecera("Paso 3 de 7", "Vamos a medir", "Puedes medir con el sensor, escribir el valor si ya lo sabes, u omitirlo. Si omites, el resultado no podrá ser verde: te lo diremos con honestidad."),
      ninoNota,
      h("div.rejilla", tarjetas),
      avisoPendiente,
      botonesNav(ctx, { puedeSeguir: true, onSiguiente: () => { if (hayPendientes(s)) { avisoPendiente.hidden = false; avisoPendiente.scrollIntoView({ block: "center" }); return; } ctx.ir(); } })
    );
  }
  function hayPendientes(s) { return ["fc", "spo2", "temp"].some(k => s.medidas[k].estado === "confirmar"); }

  function tarjetaMedida(ctx, cfg) {
    const s = ctx.sesion; const T = ctx.datos.textos; const R = ctx.datos.rangos.parametros; const Reg = window.MediBotReglas;
    const valorEl = h("div.medida__valor", { "aria-live": "polite" }, "—");
    const estado = h("div.medida__estado", cfg.instruccion);
    const barra = h("div.calidad", { role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": 0, "aria-label": "Calidad de la señal", hidden: true }, h("span"));
    const manual = h("div.manual", { hidden: true });
    const btnMedir = h("button.btn.btn--primario", { type: "button", onclick: medir }, icono("i-usb"), "Medir con sensor");
    const btnManual = h("button.btn.btn--secundario", { type: "button", onclick: () => { manual.hidden = !manual.hidden; if (!manual.hidden) manual.querySelector("input").focus(); } }, icono("i-text"), "Escribir a mano");
    const btnOmitir = h("button.btn.btn--fantasma", { type: "button", onclick: omitir }, "Omitir");
    const tags = h("div");
    const intentos = { n: 0, lecturas: [] };

    for (const c of cfg.campos) {
      const inp = h("input", { type: "number", id: "m-" + c.id, inputmode: "decimal", min: c.min, max: c.max, step: c.step, value: s.medidas[c.id].valor ?? "", oninput: e => { const v = parseFloat(e.target.value); s.medidas[c.id] = { valor: Number.isFinite(v) ? v : null, origen: "manual", calidad: null, estado: Number.isFinite(v) ? "valida" : null, intentos: 1 }; pintar(); } });
      manual.appendChild(h("div.campo", h("label", { for: "m-" + c.id }, c.etiqueta), inp));
    }

    function omitir() { for (const c of cfg.campos) s.medidas[c.id] = { valor: null, origen: null, calidad: null, estado: null }; manual.querySelectorAll("input").forEach(i => i.value = ""); estado.textContent = "Omitido. Lo diremos en el resultado: sin esta medición el resultado no puede ser verde."; pintar(); }

    function pintar() {
      const partes = []; tags.replaceChildren();
      for (const c of cfg.campos) {
        const m = s.medidas[c.id];
        if (m.estado === "invalida") { partes.push("—"); tags.appendChild(h("div", { style: "margin-top:.3rem" }, R[c.id].nombre + ": ", medTag({ estado: "invalida" }))); continue; }
        if (m.valor === null || m.valor === undefined) { partes.push("—"); continue; }
        partes.push(fmt(m.valor, c.step < 1 ? 1 : 0) + c.unidad);
        const cl = Reg.clasificar(c.id, m.valor, s.grupo);
        tags.appendChild(h("div", { style: "margin-top:.3rem" }, R[c.id].nombre + ": ", medTag({ nivel: cl.nivel, clasificado: cl.clasificado, etiqueta: cl.etiqueta, prisa: cl.prisa, estado: m.estado })));
      }
      valorEl.replaceChildren(partes.join("  ·  "));
    }

    /** Aplica la política de repetición: fuera de rango → confirmar; discordante → repetir; 3 intentos máx.; se conserva la peor válida. */
    function registrar(lectura) {
      intentos.n++; intentos.lecturas.push(lectura);
      const ids = cfg.campos.map(c => c.id);
      const nivelDe = (l) => ids.reduce((peor, id) => Reg.peorNivel(peor, Reg.clasificar(id, l[id], s.grupo).nivel), null);
      const fueraDeRango = ids.some(id => { const c = Reg.clasificar(id, lectura[id], s.grupo); return c.clasificado && c.nivel !== "verde"; });
      const prev = intentos.lecturas.length > 1 ? intentos.lecturas[intentos.lecturas.length - 2] : null;
      let msg = "Listo.";
      if (prev) {
        const discordante = ids.some(id => Math.abs(lectura[id] - prev[id]) > (R[id].discordancia || Infinity));
        if (discordante) {
          if (intentos.n >= 3) { ids.forEach(id => { s.medidas[id] = { valor: null, origen: "sensor", calidad: null, estado: "invalida", nota: "Tres lecturas que no coincidieron.", intentos: intentos.n }; }); estado.textContent = "Las lecturas no coincidieron tres veces. La medición no es válida; lo diremos en el resultado. Puedes escribirla a mano si la conoces."; pintar(); return; }
          ids.forEach(id => { s.medidas[id] = { valor: lectura[id], origen: "sensor", calidad: lectura.calidad, estado: "confirmar", intentos: intentos.n }; });
          estado.textContent = `Las dos lecturas no coincidieron. Descansa un momento y mide una vez más (intento ${intentos.n} de 3).`; pintar(); return;
        }
        // concordantes: conservar la peor
        const peor = window.MediBotReglas.ORDEN[nivelDe(lectura) || "verde"] >= window.MediBotReglas.ORDEN[nivelDe(prev) || "verde"] ? lectura : prev;
        ids.forEach(id => { s.medidas[id] = { valor: peor[id], origen: "sensor", calidad: peor.calidad, estado: "valida", intentos: intentos.n }; });
        msg = "Confirmado con dos lecturas.";
      } else {
        ids.forEach(id => { s.medidas[id] = { valor: lectura[id], origen: "sensor", calidad: lectura.calidad, estado: fueraDeRango ? "confirmar" : "valida", intentos: intentos.n }; });
        if (fueraDeRango) msg = "Salió fuera de lo esperado. Para estar seguros, descansa un momento y vuelve a medir.";
      }
      if (lectura.calidad < .8 && msg === "Listo.") msg = "Listo, pero la señal fue regular. Si puedes, repite.";
      estado.textContent = msg;
      manual.querySelectorAll("input").forEach(i => { const id = i.id.replace("m-", ""); if (s.medidas[id].valor != null) i.value = s.medidas[id].valor; });
      pintar();
    }

    async function medir() {
      if (ctx.sensores.modo === "desconectado") {
        estado.textContent = ctx.sensores.disponibleSerial ? "No hay sensor conectado. Pide a la persona del quiosco conectar el ESP32, o escribe el valor a mano." : "Este navegador no puede leer el USB: usa la aplicación de escritorio MediBot.exe. Mientras, escribe el valor a mano.";
        manual.hidden = false; return;
      }
      if (intentos.n >= 3) { estado.textContent = "Ya se hicieron 3 intentos. Escribe el valor a mano u omítelo."; return; }
      btnMedir.disabled = true; barra.hidden = false; barra.classList.remove("mala");
      let restante = cfg.segundos;
      estado.replaceChildren("Midiendo… ", h("span.contador", String(restante)), " s. No te muevas.");
      const cuenta = setInterval(() => { restante--; const c = estado.querySelector(".contador"); if (c) c.textContent = String(Math.max(0, restante)); }, 1000);
      try {
        const r = await ctx.sensores.medir(cfg.tipo, cfg.segundos, m => {
          ctx.actividad();
          const pct = Math.round(m.calidad * 100);
          barra.firstChild.style.width = pct + "%"; barra.setAttribute("aria-valuenow", pct); barra.classList.toggle("mala", m.calidad < .6);
          if (cfg.tipo === "pulso") valorEl.replaceChildren(fmt(m.valor, 0), h("small", "lpm"), "  ", fmt(m.valor2, 0), h("small", "%"));
          else valorEl.replaceChildren(fmt(m.valor, 1), h("small", "°C"));
        });
        const lectura = cfg.tipo === "pulso" ? { fc: Math.round(r.valor), spo2: r.valor2, calidad: r.calidad } : { temp: Math.round(r.valor * 10) / 10, calidad: r.calidad };
        registrar(lectura);
      } catch (e) {
        estado.textContent = "No pude leer bien. Revisa que el sensor esté bien puesto y vuelve a intentar, o escribe el valor a mano.";
        barra.classList.add("mala");
      }
      clearInterval(cuenta); btnMedir.disabled = false; btnMedir.replaceChildren(icono("i-usb"), "Repetir medición");
    }
    pintar();
    const limit = T.limitaciones_medicion[cfg.id === "fc" ? "spo2" : cfg.id] + (cfg.id === "fc" && ctx.config.altitud >= 1500 ? " " + R.spo2.nota_altitud : "");
    return h("div.tarjeta.medida",
      h("div.medida__icono", icono(R[cfg.id].icono)),
      h("div", h("h2", cfg.titulo), valorEl, estado, tags),
      barra,
      h("div.medida__acciones", btnMedir, btnManual, btnOmitir),
      manual,
      h("p.nota-limite", { style: "grid-column:1/-1" }, limit)
    );
  }

  /* ---------- 5. ¿Qué te gustaría cuidar? ---------- */
  function cuidar(ctx) {
    const s = ctx.sesion; const F = ctx.datos.fichas; const T = ctx.datos.textos; const MAX = 3;
    const chips = F.categorias.map(c => h("button.chip", { type: "button", "aria-pressed": String(s.categorias.includes(c.id)), onclick: () => { const i = s.categorias.indexOf(c.id); if (i >= 0) s.categorias.splice(i, 1); else if (s.categorias.length < MAX) s.categorias.push(c.id); pinta(); } }, icono(c.icono), c.nombre));
    const cuenta = h("p.ayuda", { "aria-live": "polite" });
    function pinta() { chips.forEach((ch, i) => { const on = s.categorias.includes(F.categorias[i].id); ch.setAttribute("aria-pressed", String(on)); ch.disabled = !on && s.categorias.length >= MAX; }); cuenta.textContent = s.categorias.length ? `Elegiste ${s.categorias.length} de ${MAX}.` : "Puedes no elegir ninguno."; }
    pinta();
    return h("section.pantalla",
      cabecera("Paso 4 de 7", T.categorias_titulo, T.categorias_ayuda),
      h("div.tarjeta", h("div.chips", { role: "group", "aria-label": "Temas" }, chips), cuenta),
      botonesNav(ctx)
    );
  }

  /* ---------- 6. Confirmar (teach-back) ---------- */
  function confirmar(ctx) {
    const s = ctx.sesion; const R = ctx.datos.rangos; const F = ctx.datos.fichas;
    const grupo = R.grupos.find(g => g.id === s.grupo);
    const dato = (t, v) => h("div.dato", h("small", t), h("b", v));
    const m = (id, dec, u) => s.medidas[id].estado === "invalida" ? "No válida" : s.medidas[id].valor != null ? fmt(s.medidas[id].valor, dec) + " " + u : "No se midió";
    const alarmasSi = ctx.datos.alarma.preguntas.filter(p => p.nivel !== "apoyo" && s.alarma[p.id] === true);
    return h("section.pantalla",
      cabecera("Paso 5 de 7", "¿Está bien esto?", "Revisa que los datos sean correctos. Si algo está mal, regresa y corrígelo."),
      h("div.resumen-datos",
        dato("Edad", grupo ? grupo.nombre : "—"),
        dato("Peso / estatura", s.peso.valor ? `${fmt(s.peso.valor, 1)} kg / ${fmt(s.talla.valor || 0, 0)} cm` : "No se dio"),
        dato("Pulso", m("fc", 0, "lpm")), dato("Oxígeno", m("spo2", 0, "%")), dato("Temperatura axilar", m("temp", 1, "°C")),
        dato("Señales de alarma", alarmasSi.length ? `${alarmasSi.length} con "sí"` : "Ninguna"),
        dato("Temas", s.categorias.length ? s.categorias.map(id => F.categorias.find(c => c.id === id).nombre).join(", ") : "Ninguno")),
      h("div.acciones",
        h("button.btn.btn--secundario", { type: "button", onclick: () => ctx.ir("sobreTi") }, "Corregir datos"),
        h("button.btn.btn--secundario", { type: "button", onclick: () => ctx.ir("alarma") }, "Corregir respuestas"),
        h("button.btn.btn--secundario", { type: "button", onclick: () => ctx.ir("mediciones") }, "Corregir mediciones"),
        h("button.btn.btn--primario.btn--xl", { type: "button", onclick: () => ctx.ir() }, "Sí, ver mi orientación", icono("i-next")))
    );
  }

  /* ---------- 7. Resultado ---------- */
  function resultado(ctx) {
    const s = ctx.sesion; const T = ctx.datos.textos; const r = ctx.resultado; const R = ctx.datos.rangos;
    const N = T.niveles[r.nivel];
    const hoy = r.nivel === "ambar" && r.prisa === "hoy";
    const acciones = hoy ? N.acciones_hoy : N.acciones;
    const semaforo = r.mediciones.filter(f => !f.fuera_semaforo);
    const aparte = r.mediciones.filter(f => f.fuera_semaforo);
    const omitSem = r.omitidas.filter(n => n !== R.parametros.imc.nombre);
    const fila = f => h("tr",
      h("td", f.nombre, h("div.fuente", f.origen === "sensor" ? "Con sensor" + (f.intentos > 1 ? ` (${f.intentos} lecturas)` : "") : f.origen === "manual" ? "Escrito a mano" : f.origen === "calculado" ? "Calculado con peso y estatura" : "")),
      h("td.valor", f.valor == null ? "—" : [fmt(f.valor, f.decimales), " ", h("small", f.unidad)]),
      h("td", medTag(f), f.rango ? h("div.fuente", f.rango) : null, f.nota ? h("div.fuente", f.nota) : null),
      h("td", fuenteEl(f.fuente), f.fuente_2 ? [" ", fuenteEl(f.fuente_2)] : null)
    );
    return h("section.pantalla",
      h("div.cabecera", h("div.kicker", "Paso 6 de 7 · Tu orientación de hoy")),
      h("div.nivel-hero", { class: "nivel-hero--" + r.nivel, role: "status" },
        h("div.nivel-hero__forma", icono(NIVEL_ICONO[r.nivel])),
        h("div", h("div.kicker", "Nivel: " + N.nombre), h("h1", hoy ? N.frase_hoy : N.frase), h("p", N.explica))),
      r.datosIncompletos ? (s.grupo === "nino" && !r.omitidas.filter(n => n !== R.parametros.imc.nombre).length && !r.invalidas.length
        ? h("div.aviso-incompleto", { role: "status" }, icono("i-info"), h("div", h("b", T.datos_incompletos_nino.titulo), " ", T.datos_incompletos_nino.texto))
        : h("div.aviso-incompleto", { role: "status" }, icono("i-info"), h("div", h("b", T.datos_incompletos.titulo), " ", T.datos_incompletos.texto, r.omitidas.length ? ` No se midió: ${r.omitidas.filter(n => n !== R.parametros.imc.nombre).join(", ")}.` : "", r.invalidas.length ? ` No fue válida: ${r.invalidas.join(", ")}.` : "", s.grupo === "nino" ? " " + T.datos_incompletos_nino.titulo : ""))) : null,
      r.motivos.length ? h("div.tarjeta.tarjeta--plana", { style: "margin-top:1rem" }, h("h2", "Por qué"), h("ul.motivos", r.motivos.map(m => h("li", m.texto, " ", m.fuente ? fuenteEl(m.fuente) : null)))) : null,
      h("div.dos", { style: "margin-top:1rem" },
        h("div.tarjeta", h("h2", "Qué hacer ahora"), h("ol.pasos-lista", acciones.map(a => h("li", a))), h("p.nota-limite", N.no_esperes), r.nivel === "verde" && s.grupo === "60mas" ? h("p.nota-limite", N.nota_60mas) : null, r.embarazo ? h("p.nota-limite", T.embarazo.linea) : null),
        h("div.tarjeta", h("h2", T.safety_netting.titulo), h("ul", T.safety_netting.puntos.map(p => h("li", p))), fuenteEl(T.safety_netting.fuente),
          h("div", { style: "display:grid;gap:.6rem;margin-top:1rem" }, T.telefonos.map(t => { const el = telefonoEl(t); if (r.apoyo && t.numero !== "911") el.classList.add("telefono--destacado"); return el; })))),
      h("div.tarjeta", { style: "margin-top:1rem" },
        h("h2", "Tus mediciones"),
        semaforo.length ? h("table.tabla", h("thead", h("tr", h("th", "Medición"), h("th", "Valor"), h("th", "Cómo salió"), h("th", "Fuente del rango"))), h("tbody", semaforo.map(fila))) : h("p", "No se registró ninguna medición."),
        omitSem.length ? h("p.nota-limite", "No se midió: " + omitSem.join(", ") + ". Por eso no se tomó en cuenta.") : null,
        h("details", { style: "margin-top:.8rem" }, h("summary", "Límites de estas mediciones"), h("ul", semaforo.filter(f => f.limitacion).map(f => h("li", h("b", f.nombre + ": "), f.limitacion))))),
      aparte.length ? h("div.tarjeta.tarjeta--plana", { style: "margin-top:1rem" },
        h("h2", "Peso y estatura (fuera del semáforo)"),
        h("table.tabla", h("tbody", aparte.map(fila))),
        h("p.nota-limite", R.parametros.imc.nota_general + " " + T.limitaciones_medicion.imc)) : null,
      botonesNav(ctx, { siguiente: s.categorias.length ? "Ver ideas de alimentación" : "Ver resumen", onSiguiente: () => ctx.ir(s.categorias.length ? "fichas" : "resumen") })
    );
  }

  /* ---------- 8. Fichas ---------- */
  function fichas(ctx) {
    const s = ctx.sesion; const F = ctx.datos.fichas; const T = ctx.datos.textos;
    const cats = F.categorias.filter(c => s.categorias.includes(c.id));
    const menor = MENORES.includes(s.grupo);
    const alimentoEl = a => h("div.ficha.ficha--alimento", h("h3", h("span.tipo", "Alimento"), a.nombre), h("p", a.nota), a.advertencia ? h("div.advertencia", icono("i-triangle"), h("span", a.advertencia)) : null, fuenteEl(a.fuente));
    return h("section.pantalla",
      cabecera("Paso 7 de 7", "Ideas para cuidarte", "Primero la comida de aquí, que es lo más barato y seguro. Los suplementos solo si hacen falta, y con su fuente."),
      h("p.nota-limite", icono("i-triangle"), " ", F.advertencia_universal, " ", fuenteEl(F.marco)),
      F.nota_si_no_hay ? h("p.nota-limite", { style: "border-left-color:var(--nopal)" }, F.nota_si_no_hay) : null,
      cats.map(c => {
        const sups = c.suplementos.filter(x => !(menor && x.solo_mayores));
        return h("div.ficha-cat",
          h("h2", icono(c.icono), c.nombre),
          c.bandera_roja ? h("div.bandera", icono("i-triangle"), " ", c.bandera_roja) : null,
          c.destacado ? h("div.ficha.ficha--destacado", h("h3", h("span.tipo", "Lo primero"), c.destacado.nombre), h("p", c.destacado.nota), fuenteEl(c.destacado.fuente)) : null,
          h("div.rejilla",
            c.alimentos.map(alimentoEl),
            c.habito ? h("div.ficha.ficha--habito", h("h3", h("span.tipo", "Hábito"), "Qué hacer hoy"), h("p", c.habito)) : null,
            sups.map(sup => h("div.ficha.ficha--suplemento",
              h("h3", h("span.tipo", "Suplemento"), sup.nombre),
              h("p", sup.que_hace),
              h("p.evidencia", h("b", "Evidencia (" + sup.nivel_evidencia + "): "), sup.evidencia),
              h("div.advertencia", icono("i-triangle"), h("span", sup.advertencia)),
              sup.si_no_hay ? h("p.si-no-hay", h("b", "Si no lo consigues: "), sup.si_no_hay) : null,
              fuenteEl(sup.fuente)))),
          sups.length ? leyendaEl(T) : null);
      }),
      s.embarazo ? h("p.nota-limite", T.embarazo.linea) : null,
      botonesNav(ctx, { siguiente: "Ver resumen" })
    );
  }

  /* ---------- 9. Resumen ---------- */
  function resumen(ctx) {
    const s = ctx.sesion; const T = ctx.datos.textos; const r = ctx.resultado; const F = ctx.datos.fichas; const R = ctx.datos.rangos;
    const N = T.niveles[r.nivel]; const grupo = R.grupos.find(g => g.id === s.grupo);
    const hoy = r.nivel === "ambar" && r.prisa === "hoy";
    const fecha = new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
    const cats = F.categorias.filter(c => s.categorias.includes(c.id));
    const menor = MENORES.includes(s.grupo);
    return h("section.pantalla",
      h("div.no-imprimir", cabecera("Listo", "Tu hoja de hoy", T.imprimir_nota)),
      h("div.tarjeta.hoja", { style: "margin-bottom:1rem" },
        h("h1.hoja__titulo", T.imprimir_titulo),
        h("p", "MediBot es un proyecto escolar de orientación. No da diagnósticos. Fecha: " + fecha + " · Edad: " + (grupo ? grupo.nombre : "—") + " · Nombre (opcional, a mano): ______________________"),
        h("div.hoja__nivel", { class: "hoja__nivel--" + r.nivel }, icono(NIVEL_ICONO[r.nivel]), h("div", h("b", "Nivel: " + N.nombre), h("div", hoy ? N.frase_hoy : N.frase))),
        r.datosIncompletos ? h("p", h("b", T.datos_incompletos.titulo + " "), T.datos_incompletos.texto) : null,
        h("h2", { style: "margin-top:1rem" }, "Qué hacer ahora"), h("ol", (hoy ? N.acciones_hoy : N.acciones).map(a => h("li", a))),
        r.embarazo ? h("p", T.embarazo.linea) : null,
        h("p", h("b", T.safety_netting.titulo + " "), T.safety_netting.puntos.join(" ")),
        h("p", T.telefonos.map((t, i) => h("span", i ? " · " : null, h("b", t.nombre + ": " + t.numero))))),
      h("div.tarjeta", { style: "margin-bottom:1rem" },
        h("h2", "Mediciones de hoy (aproximadas, con sensores sencillos)"),
        h("table.tabla", h("thead", h("tr", h("th", "Medición"), h("th", "Valor"), h("th", "Cómo salió"), h("th", "Fuente"))),
          h("tbody", r.mediciones.map(f => h("tr", h("td", f.nombre), h("td.valor", f.valor == null ? "—" : [fmt(f.valor, f.decimales), " ", h("small", f.unidad)]), h("td", medTag(f), h("div.fuente", f.rango || "")), h("td", fuenteEl(f.fuente)))))),
        r.omitidas.length ? h("p.fuente", "No se midió: " + r.omitidas.join(", ")) : null,
        r.motivos.length ? h("div", h("h3", "Motivos"), h("ul", r.motivos.map(m => h("li", m.texto)))) : null),
      cats.length ? h("div.tarjeta", { style: "margin-bottom:1rem" },
        h("h2", "Ideas de alimentación"),
        cats.map(c => {
          const sups = c.suplementos.filter(x => !(menor && x.solo_mayores));
          return h("div", h("h3", c.nombre),
            c.destacado ? h("p", h("b", c.destacado.nombre + ": "), c.destacado.nota) : null,
            h("ul", c.alimentos.map(a => h("li", h("b", a.nombre + ": "), a.nota, " ", fuenteEl(a.fuente))), c.habito ? h("li", h("b", "Hábito: "), c.habito) : null,
              sups.map(sp => h("li", h("b", sp.nombre + " (suplemento): "), sp.evidencia, " Precaución: ", sp.advertencia, sp.si_no_hay ? " Si no lo consigues: " + sp.si_no_hay : "", " ", fuenteEl(sp.fuente)))));
        }),
        cats.some(c => c.suplementos.some(x => !(menor && x.solo_mayores))) ? leyendaEl(T) : null) : null,
      h("p.fuente", T.descargo_corto + " Proyecto escolar MediBot, grupo 301 TSU Automatización. Rangos consultados el " + R.consultado + ". Código y fuentes abiertos."),
      h("div.acciones",
        h("button.btn.btn--secundario", { type: "button", onclick: ctx.atras }, icono("i-back"), "Atrás"),
        h("button.btn.btn--secundario", { type: "button", onclick: () => window.print() }, icono("i-print"), "Imprimir"),
        h("button.btn.btn--primario.btn--xl", { type: "button", onclick: ctx.terminar }, "Terminar y borrar todo", icono("i-check")))
    );
  }

  /* ---------- Operador: verificación de sensores (modo comprobable) ---------- */
  function verificacion(ctx) {
    const S = ctx.sensores; const bit = ctx.config.bitacora || [];
    const vivo = { pulso: h("b", "—"), temp: h("b", "—"), peso: h("b", "—") };
    const oyente = e => { const m = e.detail; if (m.t === "pulso") vivo.pulso.textContent = `${m.bpm} lpm · ${m.spo2} % · q ${Math.round((m.q || 0) * 100)} %`; if (m.t === "temp") vivo.temp.textContent = `${m.c} °C`; if (m.t === "peso") vivo.peso.textContent = `${m.kg} kg${m.estable === false ? " (inestable)" : ""}`; };
    S.addEventListener("muestra", oyente);
    const ref = { peso: h("input", { type: "number", step: "0.01", placeholder: "kg de la pesa patrón" }), temp: h("input", { type: "number", step: "0.1", placeholder: "°C del termómetro" }) };
    const lista = h("ul");
    const pintaBit = () => { lista.replaceChildren(...bit.slice(-10).reverse().map(b => h("li", `${b.fecha} · ${b.sensor}: quiosco ${b.medido} vs referencia ${b.referencia} → diferencia ${b.dif}${b.decision ? " · " + b.decision : ""}`))); if (!bit.length) lista.appendChild(h("li", "Sin registros aún.")); };
    const aviso = h("p.ayuda", { "aria-live": "polite" });
    async function comprobar(sensor) {
      const referencia = parseFloat(ref[sensor].value); if (!Number.isFinite(referencia)) { aviso.textContent = "Escribe el valor de referencia."; return; }
      if (S.modo === "desconectado") { aviso.textContent = "Conecta el ESP32 o activa la simulación."; return; }
      aviso.textContent = "Midiendo…";
      try {
        const r = await S.medir(sensor, sensor === "peso" ? 12 : 20, () => ctx.actividad());
        const dif = Math.round((r.valor - referencia) * 100) / 100;
        const decision = sensor === "peso" ? (Math.abs(dif) > 0.5 ? "error > 0.5 kg: hacer TARA y repetir; si persiste, recalibrar" : "dentro de ±0.5 kg") : (Math.abs(dif) > 0.5 ? "error > 0.5 °C: revisar colocación del sensor" : "dentro de ±0.5 °C");
        bit.push({ fecha: new Date().toISOString().slice(0, 16).replace("T", " "), sensor, medido: r.valor, referencia, dif, decision });
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
    return h("section.pantalla",
      cabecera("Operador", "Verificación de sensores", "Aquí se comprueba que la báscula y el termómetro miden lo que dicen. Es la diferencia honesta con un aparato que no se puede comprobar."),
      h("div.rejilla",
        h("div.tarjeta", h("h2", "Lecturas en vivo"), h("p", "Pulso/oxígeno: ", vivo.pulso), h("p", "Temperatura: ", vivo.temp), h("p", "Báscula: ", vivo.peso), h("p.ayuda", "Modo: " + S.modo)),
        h("div.tarjeta", h("h2", "Báscula vs pesa patrón"), h("div.campo", h("label", "Peso conocido (kg)"), ref.peso),
          h("div.medida__acciones", { style: "margin-top:.6rem" },
            h("button.btn.btn--secundario", { type: "button", onclick: () => comprobar("peso") }, "Comparar"),
            h("button.btn.btn--fantasma", { type: "button", onclick: () => comando("TARA") }, "Tara (plataforma vacía)"),
            h("button.btn.btn--fantasma", { type: "button", onclick: () => { const kg = parseFloat(ref.peso.value); if (Number.isFinite(kg) && kg > 0) comando("CAL " + kg); else aviso.textContent = "Escribe el peso patrón que está sobre la báscula."; } }, "Calibrar con esta pesa"))),
        h("div.tarjeta", h("h2", "Termómetro vs termómetro comercial"), h("div.campo", h("label", "Lectura del termómetro (°C)"), ref.temp), h("button.btn.btn--secundario", { type: "button", style: "margin-top:.6rem", onclick: () => comprobar("temp") }, "Comparar"))),
      aviso,
      h("div.tarjeta", { style: "margin-top:1rem" }, h("h2", "Bitácora de calibración (últimas 10)"), lista, h("p.ayuda", "Se guarda solo en este equipo. No contiene datos de personas. Procedimiento completo: docs/bascula.md."), h("button.btn.btn--secundario", { type: "button", onclick: () => window.print() }, icono("i-print"), "Imprimir bitácora")),
      h("div.acciones", h("button.btn.btn--secundario", { type: "button", onclick: () => { S.removeEventListener("muestra", oyente); S.removeEventListener("muestra", oyenteAck); ctx.terminar(); } }, icono("i-back"), "Volver al inicio"))
    );
  }

  window.MediBotPantallas = { reposo, bienvenida, sobreTi, bebe, alarma, mediciones, cuidar, confirmar, resultado, fichas, resumen, verificacion, nivelTag, medTag };
})();
