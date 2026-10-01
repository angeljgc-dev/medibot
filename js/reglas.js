/* Motor de orientación v0.2: convierte mediciones + respuestas en un nivel (verde / ámbar / rojo).
   Determinista; usa exclusivamente data/rangos.js y data/alarma.js. Documentado en docs/reglas_orientacion.md.

   1. nivel := VERDE
   2. Cualquier pregunta ROJA con "sí"  → ROJO (el número nunca lo baja: regla antirrebaja).
   3. Medición con calidad baja, fuera del rango físico o con lecturas discordantes → NO VÁLIDA (no "neutra").
   4. nivel := max(nivel, niveles de mediciones válidas, preguntas ÁMBAR con "sí").
   5. Coherencia: síntoma ámbar con medición relacionada no válida → al menos ÁMBAR.
   6. Suficiencia: VERDE solo si pulso y oxígeno son válidos y están en rango y ninguna pregunta salió "sí";
      si no, ÁMBAR con banner "datos incompletos".
   7. El IMC va fuera del semáforo (panel aparte) salvo las bandas marcadas como ámbar (delgadez).
   8. Máximo 3 intentos por sensor; se conserva la PEOR lectura válida (la gestiona la pantalla de mediciones). */
(function () {
  "use strict";

  const ORDEN = { verde: 0, ambar: 1, rojo: 2 };

  function grupoDe(param, grupoId) {
    const pg = param.por_grupo || {};
    return pg[grupoId] || pg.todos || null;
  }

  /** Clasifica un valor. Devuelve { nivel: "verde"|"ambar"|"rojo"|null, clasificado, invalido, banda, fuente, fuente_2, nota, etiqueta, prisa }. */
  function clasificar(paramId, valor, grupoId) {
    const rangos = window.MediBotData.rangos;
    const param = rangos.parametros[paramId];
    if (!param || valor === null || valor === undefined || Number.isNaN(valor)) return { nivel: null, clasificado: false };
    if (valor < param.min_valido || valor > param.max_valido) {
      return { nivel: null, clasificado: false, invalido: true, nota: "Valor fuera de lo que el sensor puede medir. Repite la medición." };
    }
    const g = grupoDe(param, grupoId);
    if (!g) return { nivel: null, clasificado: false, nota: "Sin rango para este grupo de edad." };
    const base = { fuente: g.fuente, fuente_2: g.fuente_2 || null, nota: g.nota || null };
    if (g.clasificar === false) return { ...base, nivel: null, clasificado: false };
    const banda = (g.bandas || []).find(b => valor >= b.min && valor <= b.max);
    if (!banda) return { ...base, nivel: null, clasificado: false, nota: "Valor fuera de tabla." };
    if (banda.nivel === "nd") return { ...base, nivel: null, clasificado: false, banda, etiqueta: banda.etiqueta || null };
    return { ...base, nivel: banda.nivel, banda, clasificado: true, etiqueta: banda.etiqueta || null, prisa: banda.prisa || null };
  }

  function textoRango(paramId, grupoId) {
    const param = window.MediBotData.rangos.parametros[paramId];
    const g = grupoDe(param, grupoId);
    if (!g) return "";
    if (g.rango_texto) return g.rango_texto;
    if (g.clasificar === false) return "sin rango fijo para esta edad";
    const verdes = (g.bandas || []).filter(b => b.nivel === "verde");
    if (!verdes.length) return "";
    const dec = paramId === "temp" ? 1 : 0;
    return `esperado ${U.fmt(Math.min(...verdes.map(b => b.min)), dec)} a ${U.fmt(Math.max(...verdes.map(b => b.max)), dec)} ${param.unidad}`;
  }

  function imcDe(pesoKg, tallaCm) {
    if (!pesoKg || !tallaCm) return null;
    const m = tallaCm / 100;
    return Math.round((pesoKg / (m * m)) * 10) / 10;
  }

  /** Peor de dos niveles (para conservar la peor lectura válida). */
  function peorNivel(a, b) {
    if (!a) return b; if (!b) return a;
    return ORDEN[a] >= ORDEN[b] ? a : b;
  }

  /** Evalúa la sesión completa. */
  function evaluar(sesion) {
    const D = window.MediBotData;
    const textos = D.textos;
    const mediciones = [];
    const omitidas = [];
    const invalidas = [];
    const motivos = [];
    let nivel = "verde";
    let prisa = null; // "hoy" | "semana" | null
    const subir = (n, p) => { if (n && ORDEN[n] > ORDEN[nivel]) nivel = n; if (p === "hoy") prisa = "hoy"; else if (p === "semana" && !prisa) prisa = "semana"; };

    // 2. Señales de alarma rojas primero (antirrebaja: nada de abajo las baja)
    for (const p of D.alarma.preguntas) {
      if (!aplicaPregunta(p, sesion) || sesion.alarma[p.id] !== true) continue;
      if (p.nivel === "rojo") { subir("rojo"); motivos.push({ texto: "Respondiste sí a: " + p.texto, fuente: p.fuente, pregunta: p }); }
    }

    // 3-4. Mediciones
    const imc = imcDe(sesion.peso && sesion.peso.valor, sesion.talla && sesion.talla.valor);
    const medidas = { fc: sesion.medidas.fc, spo2: sesion.medidas.spo2, temp: sesion.medidas.temp, imc: { valor: imc, origen: imc ? "calculado" : null, estado: imc ? "valida" : null } };
    const validez = {};

    for (const id of ["fc", "spo2", "temp", "imc"]) {
      const param = D.rangos.parametros[id];
      const m = medidas[id] || {};
      const v = m.valor;
      if (m.estado === "invalida") { invalidas.push(param.nombre); validez[id] = "invalida"; mediciones.push({ id, nombre: param.nombre, unidad: param.unidad, valor: null, estado: "invalida", nota: m.nota || "Las lecturas no coincidieron o la señal fue mala.", limitacion: textos.limitaciones_medicion[id] || null, fuera_semaforo: !!param.fuera_semaforo, origen: m.origen }); continue; }
      if (v === null || v === undefined) { omitidas.push(param.nombre); validez[id] = "omitida"; continue; }
      const c = clasificar(id, v, sesion.grupo);
      if (c.invalido) { invalidas.push(param.nombre); validez[id] = "invalida"; }
      else validez[id] = "valida";
      const fila = {
        id, nombre: param.nombre, unidad: param.unidad, valor: v, decimales: id === "temp" || id === "imc" ? 1 : 0,
        nivel: c.nivel, clasificado: c.clasificado, etiqueta: c.etiqueta || null, prisa: c.prisa || null, estado: c.invalido ? "invalida" : "valida",
        rango: textoRango(id, sesion.grupo), fuente: c.fuente || null, fuente_2: c.fuente_2 || null, nota: c.nota || null,
        limitacion: textos.limitaciones_medicion[id] || null, fuera_semaforo: !!param.fuera_semaforo,
        origen: m.origen || "manual", calidad: m.calidad ?? null, intentos: m.intentos || null
      };
      mediciones.push(fila);
      if (c.clasificado && c.nivel && c.nivel !== "verde") {
        subir(c.nivel, c.prisa);
        motivos.push({ texto: `${param.nombre}: ${U.fmt(v, fila.decimales)} ${param.unidad} (${fila.rango})`, fuente: c.fuente });
      }
    }

    // 4-5. Preguntas ámbar y coherencia
    for (const p of D.alarma.preguntas) {
      if (!aplicaPregunta(p, sesion) || sesion.alarma[p.id] !== true) continue;
      if (p.nivel === "ambar") {
        subir("ambar");
        motivos.push({ texto: "Respondiste sí a: " + p.texto, fuente: p.fuente, pregunta: p });
        if (p.relacionada && validez[p.relacionada] !== "valida") motivos.push({ texto: `Además no pudimos medir bien: ${D.rangos.parametros[p.relacionada].nombre}.`, fuente: null });
      }
    }

    // 6. Suficiencia: verde exige pulso y oxígeno válidos y en rango
    let datosIncompletos = false;
    if (nivel === "verde") {
      const requeridos = Object.entries(D.rangos.parametros).filter(([, p]) => p.requerido_para_verde || false).map(([k]) => k);
      if (!requeridos.includes("fc")) requeridos.push("fc");
      const grupoSinSemaforo = sesion.grupo === "nino";
      const faltan = requeridos.filter(k => validez[k] !== "valida");
      if (faltan.length || grupoSinSemaforo) { nivel = "ambar"; datosIncompletos = true; }
    }

    const apoyo = D.alarma.preguntas.some(p => p.nivel === "apoyo" && sesion.alarma[p.id] === true);
    const sinContestar = D.alarma.preguntas.filter(p => aplicaPregunta(p, sesion) && sesion.alarma[p.id] !== true && sesion.alarma[p.id] !== false).length;

    return { nivel, prisa, motivos, mediciones, omitidas, invalidas, imc, sinContestar, datosIncompletos, apoyo, embarazo: !!sesion.embarazo, grupo: sesion.grupo };
  }

  function aplicaPregunta(p, sesion) {
    if (!p.solo_grupo || !p.solo_grupo.length) return true;
    return p.solo_grupo.includes(sesion.grupo);
  }

  window.MediBotReglas = { clasificar, evaluar, imcDe, textoRango, aplicaPregunta, peorNivel, ORDEN };
})();
