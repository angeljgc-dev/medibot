/* «¿A dónde voy?» (criterio 17): lógica pura, sin DOM. Datos: data/lugares.js (líneas nacionales y plantilla de la unidad)
   y, solo en la pantalla del operador, data/clues_oaxaca.js.
   Pruebas: tests/fase3.test.mjs (L1–L7).

   Reglas de visualización (pantalla, voz y hoja usan las mismas funciones):
   - Un campo vacío, con marcador («[nombre]») o con un teléfono inválido (no son 10 dígitos o todos iguales) no se muestra.
   - Sin nombre corto no hay unidad: solo salen las líneas nacionales.
   - Rojo: el 911 primero y destacado; la ambulancia local si está configurada; la unidad solo si atiende urgencias las 24 h.
   - Ámbar (y franjas «cuándo ir» y hoja): la unidad con todos sus campos, más las líneas nacionales.
   - Voz: números en grupos (las líneas nacionales como dice su `voz` en data/lugares.js; los de 10 dígitos, cifra por cifra en grupos 3-3-2-2).
   - La configuración se guarda en el equipo (localStorage «medibot.lugar», que en Electron persiste). Es configuración del
     quiosco, no un dato personal: solo se guardan los campos de la plantilla, nunca nada de la consulta. */
(function () {
  "use strict";
  const CLAVE = "medibot.lugar";
  const CAMPOS_VISIBLES = ["como_llegar", "horario", "telefono", "ambulancia", "vacunacion"];
  const TELEFONOS = ["telefono", "ambulancia"];
  const DIAS = { L: "lunes", M: "martes", X: "miércoles", J: "jueves", V: "viernes", S: "sábado", D: "domingo" };
  const ORDEN_DIAS = "LMXJVSD";
  // No son para el público de un quiosco (consultorios de reclusorios y de empresas)
  const NO_PUBLICAS = /RECLUSORIO|REINSERCI|PENITENCI|ANEXO PSIQUI|CENTRO DE TRABAJO/i;
  const MOVIL = /M[OÓ]VIL|BRIGADA/i;

  const D = () => (window.MediBotData && window.MediBotData.lugares) || { nacionales: [], unidad: {}, etiquetas: {}, textos: {} };
  const plantilla = () => D().unidad || {};
  const T = () => D().textos || {};
  const etiqueta = (k) => (D().etiquetas || {})[k] || k;
  const punto = (t) => (!t ? "" : /[.!?…:]$/.test(t.trim()) ? t.trim() : t.trim() + ".");

  /* ---------- Limpieza ---------- */
  /** Texto de un campo, o "" si está vacío o es un marcador («[nombre]», «xxx», «---», «n/a», «pendiente»). */
  // Marcadores comunes en vez de dato (se comparan sin acentos, signos ni espacios: «N.A.», «S/N», «Sin horario»…)
  const MARCADORES = new Set(["na", "sn", "nd", "tbd", "pendiente", "pordefinir", "porconfirmar", "sindato", "sindatos", "sintelefono",
    "sinnumero", "sinhorario", "sinnombre", "noaplica", "ninguno", "ninguna", "nose", "nohay", "desconocido"]);
  function texto(v) {
    if (typeof v !== "string") return "";
    const t = v.replace(/\s+/g, " ").trim();
    const llano = t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!t || /[[\]{}<>]/.test(t) || !llano || /^0+$/.test(llano) || /^x+$/.test(llano) || MARCADORES.has(llano)) return "";
    return t;
  }
  /** 10 dígitos que no son todos iguales (en México se marcan 10 dígitos desde 2019), o "". */
  function telefono(v) {
    if (typeof v !== "string" && typeof v !== "number") return "";
    const crudo = String(v).trim();
    if (!/^[\d\s().-]+$/.test(crudo)) return "";
    const d = crudo.replace(/\D/g, "");
    return d.length === 10 && new Set(d).size > 1 ? d : "";
  }
  /** Solo los campos de la plantilla, ya limpios. */
  function normalizar(cfg) {
    const c = cfg && typeof cfg === "object" ? cfg : {};
    const out = {};
    for (const k of Object.keys(plantilla())) {
      if (k === "urgencias_24h") out[k] = c[k] === true;
      else if (TELEFONOS.includes(k)) out[k] = telefono(c[k]);
      else if (k === "fecha_confirmacion") out[k] = fechaValida(c[k]);
      else out[k] = texto(c[k]);
    }
    return out;
  }
  const configurada = (cfg) => !!normalizar(cfg).nombre_corto;
  /** «AAAA-MM-DD» de una fecha que existe (no 2024-13-45 ni 2026-02-30), o "". */
  function fechaValida(v) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof v === "string" ? v.trim() : "");
    if (!m) return "";
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return d.getFullYear() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3]) ? m[0] : "";
  }
  /** Fecha local de hoy en «AAAA-MM-DD» (toISOString es UTC: en México, después de las 18:00 daría el día siguiente). */
  function hoyLocal(d = new Date()) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }

  /* ---------- Números ---------- */
  function formatoTelefono(d) { return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : d; }
  /** «9711790898» → «9 7 1, 1 7 9, 0 8, 9 8» (cifra por cifra, en grupos). */
  function vozNumero(d) {
    const g = d.length === 10 ? [d.slice(0, 3), d.slice(3, 6), d.slice(6, 8), d.slice(8)] : [d];
    return g.map(x => x.split("").join(" ")).join(", ");
  }

  /* ---------- Qué se muestra ---------- */
  function nacionales() { return (D().nacionales || []).map(x => Object.assign({}, x)); }
  /** Campos visibles de la unidad (sin el nombre): [{ clave, etiqueta, texto, voz }]. Nunca uno vacío. */
  function campos(cfg) {
    const u = normalizar(cfg);
    if (!u.nombre_corto) return [];
    return CAMPOS_VISIBLES.filter(k => u[k]).map(k => {
      const tel = TELEFONOS.includes(k);
      return { clave: k, etiqueta: etiqueta(k), texto: tel ? formatoTelefono(u[k]) : u[k], voz: tel ? vozNumero(u[k]) : u[k] };
    });
  }
  /** La unidad que toca mostrar en este nivel, o null (sin nombre, o rojo sin urgencias las 24 h). */
  function unidadPara(nivel, cfg) {
    const u = normalizar(cfg);
    if (!u.nombre_corto) return null;
    if (nivel === "rojo" && !u.urgencias_24h) return null;
    return u;
  }
  /** Líneas para llamar: [{ id, nombre, numero, voz, nota, destacado, fuente }]. En rojo el 911 va primero y destacado y,
      si la unidad no se muestra, la ambulancia local va después del 911. */
  function lineas(nivel, cfg) {
    const nac = nacionales().map(x => Object.assign(x, { destacado: false }));
    if (nivel !== "rojo") return nac;
    const i = nac.findIndex(x => x.numero === "911");
    const l911 = i >= 0 ? nac.splice(i, 1)[0] : null;
    const out = l911 ? [Object.assign(l911, { destacado: true })] : [];
    const u = normalizar(cfg);
    if (u.nombre_corto && u.ambulancia && !unidadPara(nivel, cfg)) {
      out.push({ id: "ambulancia_local", nombre: etiqueta("ambulancia"), numero: formatoTelefono(u.ambulancia), voz: vozNumero(u.ambulancia), nota: "", destacado: false });
    }
    return out.concat(nac);
  }
  const lineaTexto = (l) => `${l.nombre}: ${l.numero}` + (l.nota ? `. ${l.nota}` : "");
  const lineaVoz = (l) => punto(`${l.nombre}: ${l.voz}`);
  const unidadTexto = (u, cs) => [punto(`${T().unidad_titulo || "Tu centro de salud"}: ${u.nombre_corto}`), ...cs.map(c => punto(`${c.etiqueta}: ${c.texto}`))].join(" ");
  const unidadVoz = (u, cs) => [punto(`${T().unidad_titulo || "Tu centro de salud"}: ${u.nombre_corto}`), ...cs.map(c => punto(`${c.etiqueta}: ${c.voz}`))].join(" ");

  /** Solo la unidad (para las franjas «cuándo ir»): "pantalla" o "voz"; "" si no está configurada. */
  function textoUnidad(cfg, modo) {
    const u = unidadPara("ambar", cfg);
    return u ? (modo === "voz" ? unidadVoz(u, campos(cfg)) : unidadTexto(u, campos(cfg))) : "";
  }
  /** Lo mismo que se ve en pantalla, como texto (para revisar y para las pruebas). */
  function textoPantalla(nivel, cfg) {
    const u = unidadPara(nivel, cfg);
    return [u ? unidadTexto(u, campos(cfg)) : "", ...lineas(nivel, cfg).map(l => punto(lineaTexto(l)))].filter(Boolean).join(" ");
  }
  /** Lo que dice la voz. En rojo empieza con «Si es urgente, llama ya al 911: nueve, uno, uno.». */
  function textoVoz(nivel, cfg) {
    const u = unidadPara(nivel, cfg); const ls = lineas(nivel, cfg);
    const partes = [];
    if (nivel === "rojo" && ls[0] && ls[0].destacado) partes.push(punto(`${T().rojo_llama || "Si es urgente, llama ya al"} ${ls[0].numero}: ${ls[0].voz}`));
    if (u) partes.push(unidadVoz(u, campos(cfg)));
    for (const l of ls) if (!(nivel === "rojo" && l.destacado)) partes.push(lineaVoz(l));
    return partes.join(" ");
  }
  /** Línea corta de la hoja impresa: la unidad (si toca, sin «cómo llegar») y los números, sin notas largas. */
  function textoHoja(nivel, cfg) {
    const u = unidadPara(nivel, cfg);
    // En la hoja no va «cómo llegar» (sí en pantalla y en voz): con él, el caso más largo ya no cabe en una carta
    const unidad = u ? [`${T().unidad_titulo || "Tu centro de salud"}: ${u.nombre_corto}`, ...campos(cfg).filter(c => c.clave !== "como_llegar").map(c => `${c.etiqueta}: ${c.texto}`)].join(" · ") : "";
    return punto([unidad, ...lineas(nivel, cfg).map(l => `${l.nombre}: ${l.numero}`)].filter(Boolean).join(" · "));
  }

  /* ---------- Catálogo CLUES (solo pantalla del operador) ---------- */
  const sinAcentos = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  /** Municipios (los 570 de INEGI) cuyo nombre contiene la búsqueda, sin distinguir acentos ni mayúsculas. */
  function buscarMunicipios(cat, q, max = 40) {
    const b = sinAcentos(q);
    return Object.entries((cat && cat.municipios) || {}).map(([k, n]) => ({ clave: Number(k), nombre: n }))
      .filter(m => !b || sinAcentos(m.nombre).includes(b))
      .sort((a, z) => (sinAcentos(a.nombre).startsWith(b) ? 0 : 1) - (sinAcentos(z.nombre).startsWith(b) ? 0 : 1) || a.nombre.localeCompare(z.nombre, "es"))
      .slice(0, max);
  }
  const fila = (cat, u) => ({ clues: u[0], nombre: u[1], institucion: u[2], tipologia: cat.tipologias[u[3]] || "", municipio: u[4], localidad: u[5], telefono: u[6], lat: u[7], lon: u[8], horario: u[9] || [] });
  /** Unidades públicas del municipio: fijas primero (centros de salud antes que hospitales), móviles al final y marcadas. */
  function unidadesDe(cat, clave) {
    const rango = (f) => (f.movil ? 3 : /CENTRO DE SALUD|N[UÚ]CLEO|RURAL|URBANO|MEDICINA FAMILIAR/i.test(f.tipologia + " " + f.nombre) ? 0 : /HOSPITAL/i.test(f.tipologia) ? 1 : 2);
    return ((cat && cat.unidades) || []).filter(u => u[4] === Number(clave)).map(u => fila(cat, u))
      .filter(f => !NO_PUBLICAS.test(f.nombre + " " + f.tipologia))
      .map(f => Object.assign(f, { movil: MOVIL.test(f.tipologia) }))
      .map(f => Object.assign(f, { etiqueta: f.tipologia.toLowerCase() + (f.movil ? " · unidad móvil, no siempre está" : "") }))
      .sort((a, z) => rango(a) - rango(z) || a.nombre.localeCompare(z.nombre, "es"));
  }
  /** Teléfono del CLUES que se puede prellenar: propio (10 dígitos, no todos iguales y en 3 unidades o menos), o "". */
  function telefonoPrellenable(tel, cat) {
    const t = telefono(tel || "");
    if (!t) return "";
    const veces = ((cat && cat.unidades) || []).filter(u => telefono(u[6] || "") === t).length;
    return veces <= 3 ? t : "";
  }
  function hora(hhmm) {
    const [h, m] = String(hhmm).split(":").map(Number);
    if (!Number.isFinite(h)) return "";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const min = m === 30 ? " y media" : m ? `:${String(m).padStart(2, "0")}` : "";
    const parte = h < 6 ? " de la madrugada" : h < 12 ? " de la mañana" : h === 12 ? " del día" : h < 20 ? " de la tarde" : " de la noche";
    return `${h12}${min}${parte}`;
  }
  function dias(letras) {
    const l = ORDEN_DIAS.split("").filter(d => letras.includes(d));
    if (l.length === 7) return "todos los días";
    const idx = l.map(d => ORDEN_DIAS.indexOf(d));
    const seguidos = l.length >= 3 && idx.every((x, i) => !i || x === idx[i - 1] + 1);
    if (seguidos) return `${DIAS[l[0]]} a ${DIAS[l[l.length - 1]]}`;
    const n = l.map(d => DIAS[d]);
    return n.length > 1 ? n.slice(0, -1).join(", ") + " y " + n[n.length - 1] : (n[0] || "");
  }
  /** ["LMXJV 08:00-16:00"] → «Lunes a viernes, de 8 de la mañana a 4 de la tarde». */
  function horarioLegible(bloques) {
    const out = (bloques || []).map(b => {
      const m = /^([DLMXJVS]+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/.exec(String(b).trim());
      if (!m || m[2] === m[3]) return ""; // sin días o con inicio = fin («00:00-00:00» en el CLUES): no se adivina
      const rango = m[2] === "00:00" && /^23:5\d$/.test(m[3]) ? "las 24 horas" : `de ${hora(m[2])} a ${hora(m[3])}`;
      return `${dias(m[1])}, ${rango}`;
    }).filter(Boolean).join("; ");
    return out ? out[0].toUpperCase() + out.slice(1) : "";
  }
  const MINUSCULAS = new Set(["de", "del", "la", "las", "los", "el", "y", "en", "a"]);
  /** «CENTRO DE SALUD URBANO DE 03 N.B. PALOMARES» → «Centro de Salud Urbano de 03 N.B. Palomares» (el operador lo acorta). */
  function nombreCorto(n) {
    return String(n || "").toLowerCase().split(/\s+/).filter(Boolean)
      .map((w, i) => (i && MINUSCULAS.has(w) ? w : /^[a-z]\.[a-z]\.?$/i.test(w) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1))).join(" ");
  }
  /** Borrador de configuración desde una fila del CLUES (todo se confirma antes de guardar; cómo llegar, ambulancia y
      vacunación son siempre manuales). */
  function prellenar(cat, u) {
    const f = Array.isArray(u) ? fila(cat, u) : u;
    const veinticuatro = (f.horario || []).some(b => /^DLMXJVS 00:00-23:5\d$/.test(String(b).trim()));
    return normalizar(Object.assign({}, plantilla(), {
      nombre_corto: nombreCorto(f.nombre), horario: horarioLegible(f.horario), telefono: telefonoPrellenable(f.telefono, cat),
      urgencias_24h: veinticuatro, clues: f.clues || "", municipio: (cat.municipios || {})[f.municipio] || ""
    }));
  }

  /* ---------- Guardar, exportar, importar ---------- */
  function exportar(cfg) { return JSON.stringify({ tipo: "medibot-lugar", version: 1, unidad: normalizar(cfg) }, null, 2); }
  function importar(txt) {
    let o;
    try { o = JSON.parse(txt); } catch { throw new Error("El archivo no es JSON válido."); }
    if (!o || o.tipo !== "medibot-lugar" || !o.unidad || typeof o.unidad !== "object") throw new Error("No es una configuración de «¿A dónde voy?» de MediBot.");
    return normalizar(o.unidad);
  }
  function almacen() { try { return window.localStorage || null; } catch { return null; } }
  function leer() {
    const ls = almacen(); if (!ls) return null;
    try { const v = ls.getItem(CLAVE); return v ? normalizar(JSON.parse(v)) : null; } catch { return null; } // dañado: como si no hubiera
  }
  function guardar(cfg) { const ls = almacen(); const u = normalizar(cfg); if (ls) ls.setItem(CLAVE, JSON.stringify(u)); return u; }
  function borrar() { const ls = almacen(); if (ls) ls.removeItem(CLAVE); }
  /** La configuración vigente: la guardada en el equipo o, si no hay, la plantilla de data/lugares.js. */
  function actual() { return leer() || normalizar(plantilla()); }
  /** ¿Hay que avisar al operador que revise los datos? (configurada y confirmada hace más de 12 meses, sin fecha o con fecha futura). */
  function vencida(cfg, hoy = new Date()) {
    const u = normalizar(cfg);
    if (!u.nombre_corto) return false;
    if (!u.fecha_confirmacion) return true;
    const f = new Date(u.fecha_confirmacion + "T00:00:00");
    const limite = new Date(hoy); limite.setFullYear(limite.getFullYear() - 1);
    return f < limite || f > hoy; // una fecha en el futuro es un error de dedo: también se avisa
  }

  window.MediBotLugares = {
    CLAVE, normalizar, configurada, nacionales, campos, unidadPara, lineas, textoPantalla, textoVoz, textoHoja, textoUnidad, telefono,
    formatoTelefono, vozNumero, horarioLegible, sinAcentos, buscarMunicipios, unidadesDe, telefonoPrellenable, prellenar,
    nombreCorto, exportar, importar, leer, guardar, borrar, actual, vencida, etiqueta, fechaValida, hoyLocal, textos: T
  };
})();
