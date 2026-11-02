// Fase 3 (2026-11-02): «Cuidado con esto» (criterio 16) y «¿A dónde voy?» (criterio 17, L1–L7).
// Motor: js/recomendaciones.js → cuidado(); directorio: js/lugares.js. Datos: data/cuidado.js, data/lugares.js,
// data/clues_oaxaca.js. Las pruebas de comportamiento usan datos armados aquí; las de cobertura, los datos reales.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { cargar, sesionBase, valida } from "./cargar.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const plano = (x) => JSON.parse(JSON.stringify(x));
const igual = (a, b, m) => assert.deepEqual(plano(a), plano(b), m);
const EXTRA = ["data/cuidado.js", "data/lugares.js", "js/lugares.js"];
const medidas = (fc, spo2, temp = null) => ({ fc: valida(fc), spo2: valida(spo2), temp: temp == null ? { valor: null, estado: null } : valida(temp) });

/* ================= A. «Cuidado con esto» ================= */
const ctx = cargar(EXTRA);
const M = ctx.MediBotRecomendaciones; const R = ctx.MediBotReglas; const D = ctx.MediBotData;
const ses = (cambios = {}) => sesionBase(ctx, { grupo: "18a59", embarazoOpcion: "no", medicinas: ["ninguna"], medidas: medidas(72, 97), ...cambios });
const rec = (s, temas) => M.recomendar(s, R.evaluar(s), temas);
const idDe = (c) => (c ? c.tarjeta.id : null);

describe("A · Cuidado con esto (criterio 16)", () => {
  test("A1: data/cuidado.js trae 14 tarjetas con versión y fecha, y ya no trae arnica_tomada", () => {
    const C = D.cuidado;
    assert.ok(C.version && /^\d{4}-\d{2}-\d{2}$/.test(C.fecha), "versión y fecha");
    assert.equal(C.tarjetas.length, 14);
    assert.ok(!C.tarjetas.some(t => t.id === "arnica_tomada"), "árnica quitada (decisión de diseño)");
  });

  test("A2: recomendar() devuelve, por sección elegida, una tarjeta o ninguna (null)", () => {
    const r = rec(ses(), ["diarrea", "vista"]);
    igual(Object.keys(r.cuidado).sort(), ["diarrea", "vista"]);
    assert.equal(idDe(r.cuidado.diarrea), "ayuno_diarrea");
    assert.equal(r.cuidado.vista, null, "vista no tiene tarjeta");
  });

  test("A3: la más grave que le toca al perfil = la primera del arreglo; nunca 2 iguales en la misma consulta", () => {
    const adulto = rec(ses(), ["digestion", "diarrea"]);
    assert.equal(idDe(adulto.cuidado.digestion), "greta_azarcon");
    assert.equal(idDe(adulto.cuidado.diarrea), "ayuno_diarrea");
    // greta sale en digestión; en niños ya no se repite: le toca la siguiente que aplique al perfil
    const mama = rec(ses({ embarazoOpcion: "lactancia", lactancia: true }), ["digestion", "ninos"]);
    assert.equal(idDe(mama.cuidado.digestion), "greta_azarcon");
    assert.equal(idDe(mama.cuidado.ninos), "te_agua_bebe");
    // al revés: niños se queda con greta y digestión toma la siguiente (epazote)
    const alReves = rec(ses({ embarazoOpcion: "lactancia", lactancia: true }), ["ninos", "digestion"]);
    assert.equal(idDe(alReves.cuidado.ninos), "greta_azarcon");
    assert.equal(idDe(alReves.cuidado.digestion), "epazote_te");
  });

  test("A4: respeta `perfiles`: te_agua_bebe solo a quien da pecho o consulta por un niño", () => {
    const sinNino = rec(ses(), ["digestion", "ninos"]);
    assert.equal(sinNino.cuidado.ninos, null, "adulto sin niño ni lactancia: greta ya salió y te_agua_bebe no le toca");
    const porNino = rec(ses({ paraQuien: "nino", grupo: "nino", edadNino: "menos2", embarazoOpcion: null }), ["digestion", "ninos"]);
    assert.equal(idDe(porNino.cuidado.ninos), "te_agua_bebe");
  });

  test("A5: perfiles con datos armados: embarazo, mayor60 y vacío = todos", () => {
    const c = cargar(EXTRA);
    const tarjeta = (id, perfiles, secciones = ["s"]) => ({ id, nombre: id, que_es: "q", por_que_cuidado: "p", en_su_lugar: [], texto_en_su_lugar: "t", secciones, perfiles, fuentes: [] });
    c.MediBotData.cuidado = { version: "t", fecha: "2026-11-02", tarjetas: [tarjeta("solo_emb", ["embarazo"]), tarjeta("solo_mayor", ["mayor60"]), tarjeta("todos", [])] };
    const Mc = c.MediBotRecomendaciones;
    const p = (cambios) => Mc.perfil(sesionBase(c, { medicinas: ["ninguna"], ...cambios }), null);
    assert.equal(idDe(Mc.cuidado(["s"], p({ grupo: "18a59", embarazo: true, embarazoOpcion: "si" })).s), "solo_emb");
    assert.equal(idDe(Mc.cuidado(["s"], p({ grupo: "60mas" })).s), "solo_mayor");
    assert.equal(idDe(Mc.cuidado(["s"], p({ grupo: "18a59", embarazoOpcion: "no" })).s), "todos");
    assert.equal(idDe(Mc.cuidado(["s"], p({ grupo: "18a59" })).s), "todos", "«Prefiero no decir» no cuenta como embarazo");
  });

  test("A6: en nivel rojo no sale ninguna tarjeta (ahí solo va la urgencia)", () => {
    const s = ses({ medidas: medidas(72, 84) });
    const r = rec(s, ["digestion", "diarrea"]);
    assert.equal(R.evaluar(s).nivel, "rojo");
    assert.equal(r.bloqueado, true);
    assert.ok(Object.values(r.cuidado).every(x => x === null), JSON.stringify(plano(r.cuidado)));
    igual(M.cuidado(["digestion"], r.perfil), { digestion: null });
  });

  test("A7: «En su lugar» solo con entradas aptas (apta()); el texto curado solo si TODAS son aptas y sin avisos", () => {
    const c = cargar(EXTRA, { corpus: "fixture" });
    const Mc = c.MediBotRecomendaciones;
    const libre = { embarazo: false, lactancia: false, edad_minima: 0, medicinas: [], condiciones: [] };
    const E = (id, tipo, extra = {}) => ({ id, tipo, nombre: "Nombre " + id, temas: ["s"], para: "para " + id, como: "como " + id, ayuda: 2, excluir: { ...libre }, alternativas: [], fuentes: [], ...extra });
    c.MediBotData.corpus = { version: "t", temas: [{ id: "s", nombre: "S" }], entradas: [
      E("comida", "alimento"), E("habito", "habito"),
      E("planta_adulto", "planta", { nombre_cientifico: "X y", excluir: { ...libre, edad_minima: 18 } }),
      E("con_aviso", "alimento", { aviso: "Aviso general.", avisos_medicina: { presion: "Con cuidado." } })
    ] };
    const tarjeta = (id, alts) => ({ id, nombre: id, que_es: "q", por_que_cuidado: "p", en_su_lugar: alts, texto_en_su_lugar: "Texto curado.", secciones: ["s"], perfiles: [], fuentes: [] });
    const usar = (t) => { c.MediBotData.cuidado = { version: "t", fecha: "x", tarjetas: [t] }; };
    const adulto = Mc.perfil(sesionBase(c, { grupo: "18a59", embarazoOpcion: "no", medicinas: ["ninguna"] }), null);
    const nino = Mc.perfil(sesionBase(c, { paraQuien: "nino", grupo: "nino", edadNino: "2a5", medicinas: ["ninguna"] }), null);

    usar(tarjeta("todas", ["comida", "habito", "planta_adulto"]));
    let x = Mc.cuidado(["s"], adulto).s;
    assert.equal(x.texto, "Texto curado.", "todas aptas: el texto curado");
    igual(x.alternativas.map(a => a.entrada.id), ["comida", "habito", "planta_adulto"]);
    x = Mc.cuidado(["s"], nino).s;
    assert.equal(x.texto, "", "una no es apta para el niño: no se usa el texto curado (podría nombrarla)");
    igual(x.alternativas.map(a => a.entrada.id), ["comida", "habito"]);
    for (const a of x.alternativas) assert.ok(Mc.apta(a.entrada, nino), a.entrada.id);

    usar(tarjeta("ninguna", ["planta_adulto", "no_existe"]));
    x = Mc.cuidado(["s"], nino).s;
    assert.equal(x.tarjeta.id, "ninguna", "la tarjeta sigue saliendo");
    igual([x.texto, x.alternativas], ["", []], "sin alternativas aptas no hay «En su lugar»");
    for (const modo of ["voz", "hoja", "pantalla"]) assert.doesNotMatch(Mc.textoCuidado(x, modo), /En su lugar/, modo);

    usar(tarjeta("aviso", ["comida", "con_aviso"]));
    x = Mc.cuidado(["s"], adulto).s;
    assert.equal(x.texto, "Texto curado.", "el aviso general (el que ve todo el mundo) no cambia el texto curado");
    const conPresion = Mc.perfil(sesionBase(c, { grupo: "18a59", embarazoOpcion: "no", medicinas: ["presion"] }), null);
    x = Mc.cuidado(["s"], conPresion).s;
    assert.equal(x.texto, "", "una alternativa trae un aviso PERSONAL: se lista con sus avisos, no el texto curado");
    igual(x.alternativas.find(a => a.entrada.id === "con_aviso").avisos, ["Aviso general.", "Con cuidado."]);
    assert.match(Mc.textoCuidado(x, "voz"), /Con cuidado\./);
  });

  test("A8: textos de voz y hoja: nombre, por qué, en su lugar y «si ya pasó»", () => {
    const r = rec(ses(), ["diarrea"]);
    const x = r.cuidado.diarrea; const t = x.tarjeta;
    const voz = M.textoCuidado(x, "voz");
    assert.match(voz, /^Cuidado con esto: Dejar de comer con diarrea\./);
    for (const parte of [t.por_que_cuidado, "En su lugar: " + t.texto_en_su_lugar, t.urgente_si]) assert.ok(voz.includes(parte), parte);
    const hoja = M.textoCuidado(x, "hoja");
    assert.ok(hoja.length < voz.length, "la hoja es más corta que la voz");
    assert.ok(hoja.startsWith("Dejar de comer con diarrea (en su lugar: ") && hoja.endsWith(")"), "la hoja: nombre y, entre paréntesis, las alternativas: " + hoja);
    for (const a of x.alternativas) assert.ok(hoja.includes(a.entrada.nombre), a.entrada.nombre);
    // con «No sé» en medicinas, las alternativas con aviso personal no van en la hoja (sí en pantalla y voz, con su aviso)
    const noSe = rec(ses({ medicinas: ["no_se"] }), ["diarrea"]).cuidado.diarrea;
    // criterio 64 (ronda 3): el suero oral ya no trae aviso personal con «No sé» (no se retrasa la rehidratación)…
    assert.ok(!noSe.alternativas.some(a => a.entrada.id === "suero_oral" && a.avisos.some(v => v !== a.entrada.aviso)), "el suero oral, sin aviso personal con «No sé»");
    // …y la regla de la v0.4 se sigue probando con datos armados (como A7): un suplemento con «No sé» sí trae aviso personal
    const c = cargar(EXTRA, { corpus: "fixture" }); const Mc = c.MediBotRecomendaciones;
    const libre = { embarazo: false, lactancia: false, edad_minima: 0, medicinas: [], condiciones: [] };
    const E = (id, tipo) => ({ id, tipo, nombre: "Nombre " + id, temas: ["s"], para: "para " + id, como: "como " + id, ayuda: 2, excluir: { ...libre }, alternativas: [], fuentes: [] });
    c.MediBotData.corpus = { version: "t", temas: [{ id: "s", nombre: "S" }], entradas: [E("comida", "alimento"), E("pastilla", "suplemento")] };
    c.MediBotData.cuidado = { version: "t", fecha: "x", tarjetas: [{ id: "t", nombre: "t", que_es: "q", por_que_cuidado: "p", en_su_lugar: ["comida", "pastilla"], texto_en_su_lugar: "Texto curado.", secciones: ["s"], perfiles: [], fuentes: [] }] };
    const xs = Mc.cuidado(["s"], Mc.perfil(sesionBase(c, { grupo: "18a59", embarazoOpcion: "no", medicinas: ["no_se"] }), null)).s;
    const conAviso = xs.alternativas.filter(a => a.avisos.some(v => v !== a.entrada.aviso));
    igual(conAviso.map(a => a.entrada.id), ["pastilla"], "el suplemento trae aviso personal con «No sé»");
    for (const a of conAviso) {
      assert.ok(!Mc.textoCuidado(xs, "hoja").includes(a.entrada.nombre), a.entrada.nombre);
      assert.ok(Mc.textoCuidado(xs, "voz").includes(a.entrada.nombre), "en la voz sí: " + a.entrada.nombre);
    }
    assert.ok(Mc.textoCuidado(xs, "hoja").includes("Nombre comida"), "la que no trae aviso personal sí va en la hoja");
  });

  test("A10 (revisión): «En su lugar» respeta los tipos que permite la sección (Niños: solo comida y hábitos) y las plantas llevan su pie", () => {
    const nino = ses({ paraQuien: "nino", grupo: "nino", edadNino: "2a5", embarazoOpcion: null });
    const x = rec(nino, ["ninos"]).cuidado.ninos;
    assert.equal(x.tarjeta.id, "greta_azarcon");
    const permitidos = M.temaDe("ninos").tipos_permitidos;
    assert.ok(x.alternativas.length >= 1 && x.alternativas.every(a => permitidos.includes(a.entrada.tipo)), x.alternativas.map(a => a.entrada.tipo).join());
    assert.equal(x.texto, "", "el texto curado nombra la manzanilla: no se usa si la sección no permite plantas");
    assert.doesNotMatch(M.textoCuidado(x, "voz") + M.textoCuidado(x, "hoja"), /manzanilla|suero oral/i);
    // en Digestión (sin restricción de tipos) sí entra la manzanilla, con el pie de planta de uso tradicional
    const d = rec(ses(), ["digestion"]).cuidado.digestion;
    assert.ok(d.alternativas.some(a => a.entrada.tipo === "planta"));
    assert.ok(M.textoCuidado(d, "voz").includes(D.textos.recomendaciones.planta_pie), "pie de planta en la voz");
    const plantas = d.alternativas.filter(a => a.entrada.tipo === "planta").map(a => a.entrada.nombre);
    for (const n of plantas) assert.ok(!M.textoCuidado(d, "hoja").includes(n), "en la hoja no van plantas (no cabe su pie): " + n);
  });

  test("A11 (revisión): «nino» en `perfiles` es menor de 12; quien consulta por un adolescente no recibe tarjetas de bebé", () => {
    const teen = ses({ paraQuien: "nino", grupo: "12a17", embarazoOpcion: "no" });
    const r = rec(teen, ["digestion", "ninos"]);
    assert.equal(idDe(r.cuidado.digestion), "greta_azarcon");
    assert.equal(r.cuidado.ninos, null, "te_agua_bebe es para quien da pecho o consulta por un niño menor de 12");
  });

  test("A9: corpus real, matriz de perfiles × secciones: ≤1 por sección, nunca repetida, perfil respetado y alternativas aptas", () => {
    const perfiles = [
      ses(), ses({ grupo: "60mas" }), ses({ embarazo: true, embarazoOpcion: "si" }), ses({ embarazoOpcion: "lactancia", lactancia: true }),
      ses({ paraQuien: "nino", grupo: "nino", edadNino: "menos2", embarazoOpcion: null }), ses({ paraQuien: "nino", grupo: "nino", edadNino: "6a11", embarazoOpcion: null }),
      ses({ grupo: "12a17" }), ses({ medicinas: ["no_se"] }), ses({ condiciones: ["alergia_asteraceas"] })
    ];
    const ids = D.corpus.temas.map(t => t.id);
    const fallas = [];
    for (const s of perfiles) {
      const p = M.perfil(s, R.evaluar(s)); const rasgos = M.rasgos(p);
      for (let i = 0; i < ids.length; i++) {
        const temas = [ids[i], ids[(i + 3) % ids.length], ids[(i + 7) % ids.length]];
        const c = rec(s, temas).cuidado;
        const vistos = Object.values(c).filter(Boolean).map(x => x.tarjeta.id);
        if (new Set(vistos).size !== vistos.length) fallas.push(`repetida ${vistos} en ${temas}`);
        for (const [tema, x] of Object.entries(c)) {
          if (!x) continue;
          if (!x.tarjeta.secciones.includes(tema)) fallas.push(`${x.tarjeta.id} no es de ${tema}`);
          if (x.tarjeta.perfiles.length && !x.tarjeta.perfiles.some(k => rasgos.has(k))) fallas.push(`${x.tarjeta.id} no toca a ${[...rasgos]}`);
          for (const a of x.alternativas) if (!M.apta(a.entrada, p)) fallas.push(`${x.tarjeta.id}: alternativa no apta ${a.entrada.id}`);
          // la más grave: ninguna tarjeta anterior del arreglo aplicaba y estaba libre
          const antes = D.cuidado.tarjetas.slice(0, D.cuidado.tarjetas.indexOf(x.tarjeta));
          const libre = antes.find(t => t.secciones.includes(tema) && (!t.perfiles.length || t.perfiles.some(k => rasgos.has(k))) && !vistos.includes(t.id));
          if (libre) fallas.push(`${tema}: salió ${x.tarjeta.id} y antes estaba ${libre.id}`);
        }
      }
    }
    igual(fallas.slice(0, 10), []);
  });
});

/* ================= B. «¿A dónde voy?» ================= */
const L = ctx.MediBotLugares;
const LLENA = { nombre_corto: "Centro de Salud de Palomares", como_llegar: "Frente al parque, junto a la escuela", horario: "Todos los días, de 8 de la mañana a 8 de la noche",
  telefono: "9711790898", ambulancia: "9727221183", vacunacion: "Martes y jueves", urgencias_24h: false, clues: "OCIMB000123", municipio: "Matías Romero Avendaño",
  confirmo: "Ana, promotora", fecha_confirmacion: "2026-11-01" };
const NIVELES = ["verde", "ambar", "rojo"];
const salidas = (nivel, cfg) => [L.textoPantalla(nivel, cfg), L.textoVoz(nivel, cfg), L.textoHoja(nivel, cfg)];

describe("B · ¿A dónde voy? (criterio 17, L1–L7)", () => {
  test("L1: sin configuración solo salen 911, 800 911 2000 y «079, opción 1» (en pantalla, voz y hoja)", () => {
    igual(L.nacionales().map(x => x.numero), ["911", "800 911 2000", "079, opción 1"]);
    for (const nivel of NIVELES) {
      assert.equal(L.unidadPara(nivel, null), null);
      igual(L.lineas(nivel, null).map(x => x.numero), ["911", "800 911 2000", "079, opción 1"], nivel);
      const [pant, voz, hoja] = salidas(nivel, {});
      for (const t of [pant, hoja]) {
        assert.match(t, /911/); assert.match(t, /800 911 2000/); assert.match(t, /079, opción 1/);
        assert.doesNotMatch(t, /Tu centro de salud|Teléfono|Horario/, t);
      }
      assert.match(voz, /nueve, uno, uno/);
    }
  });

  test("L1b: el CAT de IMSS-Bienestar (horario contradictorio) no sale en ningún nivel", () => {
    for (const nivel of NIVELES) for (const cfg of [null, LLENA, { ...LLENA, urgencias_24h: true }]) {
      for (const t of salidas(nivel, cfg)) assert.doesNotMatch(t, /298|IMSS-Bienestar/, nivel);
    }
  });

  test("L2: un campo vacío no produce texto en pantalla, voz ni hoja (uno por uno)", () => {
    const etiquetas = D.lugares.etiquetas;
    for (const campo of Object.keys(etiquetas)) {
      for (const vacio of ["", "   ", "[nombre]", "[teléfono]", null, "—", "s/n", "0", "TBD", "Por definir", "Sin teléfono", "?", "N.A.", "S/N.", "Sin horario", "No aplica", "xxx-xxx", "--/--"]) {
        const cfg = { ...LLENA, [campo]: vacio };
        assert.ok(!L.campos(cfg).some(c => c.clave === campo), `${campo}=${JSON.stringify(vacio)} en campos()`);
        for (const t of salidas("ambar", cfg)) {
          assert.ok(!t.includes(etiquetas[campo]), `${campo}: «${etiquetas[campo]}» aparece en «${t.slice(0, 120)}»`);
          assert.doesNotMatch(t, /\[|\]|undefined|null/, t);
        }
      }
    }
    // sin nombre corto la unidad no se muestra (nunca una unidad sin nombre)
    for (const vacio of ["", "[nombre]", "  "]) assert.equal(L.unidadPara("ambar", { ...LLENA, nombre_corto: vacio }), null);
    for (const t of salidas("ambar", { ...LLENA, nombre_corto: "" })) assert.doesNotMatch(t, /Tu centro de salud|Palomares|Frente al parque/);
    // con todo lleno sí aparece todo
    const t = L.textoPantalla("ambar", LLENA);
    for (const etiqueta of Object.values(etiquetas)) assert.ok(t.includes(etiqueta), etiqueta);
  });

  test("L2b: teléfonos inválidos (en ceros, cortos o con letras) no se muestran", () => {
    for (const tel of ["0000000000", "1111111111", "12345", "97117908981", "971-ABC-0898"]) {
      const cfg = { ...LLENA, telefono: tel, ambulancia: tel };
      assert.ok(!L.campos(cfg).some(c => c.clave === "telefono" || c.clave === "ambulancia"), tel);
    }
    assert.equal(L.normalizar({ ...LLENA, telefono: "971 179 08 98" }).telefono, "9711790898", "los espacios se aceptan");
  });

  test("L3: un teléfono del CLUES compartido por más de 3 unidades o en ceros nunca se prellena", () => {
    const fila = (clues, tel, muni = 1) => [clues, "CENTRO DE SALUD " + clues, "IMB", 0, muni, "LOCALIDAD", tel, 16.5, -95.0, ["LMXJV 08:00-16:00"]];
    const cat = { tipologias: ["RURAL DE 01 NÚCLEO BÁSICO"], municipios: { 1: "Abejones" },
      unidades: [fila("A", "9535520218"), fila("B", "9535520218"), fila("C", "9535520218"), fila("D", "9535520218"), fila("E", "0000000000"), fila("F", "9711790898"), fila("G", "")] };
    for (const c of ["A", "B", "C", "D", "E", "G"]) assert.equal(L.prellenar(cat, cat.unidades.find(u => u[0] === c)).telefono, "", c);
    assert.equal(L.prellenar(cat, cat.unidades.find(u => u[0] === "F")).telefono, "9711790898");
    // el extracto real ya no trae teléfonos compartidos ni en ceros
    const real = cargar(["data/clues_oaxaca.js", ...EXTRA]).MediBotData.clues;
    const frec = {}; for (const u of real.unidades) if (u[6]) frec[u[6]] = (frec[u[6]] || 0) + 1;
    igual(Object.entries(frec).filter(([t, n]) => n > 3 || new Set(t).size === 1), []);
  });

  test("L3b: prellenar arma horario legible, nombre corto, municipio (INEGI) y urgencias 24 h solo si el CLUES dice 24 h todos los días", () => {
    const cat = { tipologias: ["URBANO DE 03 NÚCLEOS BÁSICOS"], municipios: { 57: "Matías Romero Avendaño" },
      unidades: [["X1", "CENTRO DE SALUD URBANO DE 03 N.B. PALOMARES", "IMB", 0, 57, "PALOMARES", "9711790898", 17, -95, ["DLMXJVS 08:00-20:00"]],
        ["X2", "HOSPITAL", "IMB", 0, 57, "MATÍAS ROMERO", "", 17, -95, ["DLMXJVS 00:00-23:59"]]] };
    const a = L.prellenar(cat, cat.unidades[0]);
    assert.equal(a.horario, "Todos los días, de 8 de la mañana a 8 de la noche");
    assert.equal(a.municipio, "Matías Romero Avendaño");
    assert.equal(a.clues, "X1");
    assert.equal(a.urgencias_24h, false);
    assert.ok(a.nombre_corto && !/[A-ZÁÉÍÓÚ]{4}/.test(a.nombre_corto), "nombre corto sin MAYÚSCULAS sostenidas: " + a.nombre_corto);
    assert.equal(a.como_llegar, "", "cómo llegar siempre es manual");
    assert.equal(L.prellenar(cat, cat.unidades[1]).urgencias_24h, true);
    assert.equal(L.prellenar(cat, cat.unidades[1]).horario, "Todos los días, las 24 horas");
  });

  test("horarioLegible: días y horas en palabras", () => {
    igual(L.horarioLegible(["LMXJV 08:00-16:00"]), "Lunes a viernes, de 8 de la mañana a 4 de la tarde");
    igual(L.horarioLegible(["LMXJVS 08:00-15:30"]), "Lunes a sábado, de 8 de la mañana a 3 y media de la tarde");
    igual(L.horarioLegible(["LXV 09:00-13:00", "S 09:00-12:00"]), "Lunes, miércoles y viernes, de 9 de la mañana a 1 de la tarde; sábado, de 9 de la mañana a 12 del día");
    igual(L.horarioLegible([]), "");
    igual(L.horarioLegible(["DLMXJVS 00:00-00:00"]), "", "inicio = fin (dato raro del CLUES): no se prellena");
    igual(L.horarioLegible(["DLMXJVS 00:00-00:00", "LMXJV 08:00-16:00"]), "Lunes a viernes, de 8 de la mañana a 4 de la tarde");
  });

  test("L4: la búsqueda de municipio no distingue acentos y lista los 570 municipios (INEGI)", () => {
    const cat = cargar(["data/clues_oaxaca.js", ...EXTRA]).MediBotData.clues;
    assert.equal(Object.keys(cat.municipios).length, 570);
    assert.equal(L.buscarMunicipios(cat, "", 1000).length, 570);
    for (const q of ["Matias", "matías", "MATIAS ROMERO", "matias romero avendano"]) {
      assert.ok(L.buscarMunicipios(cat, q).some(m => m.nombre === "Matías Romero Avendaño"), q);
    }
    assert.ok(L.buscarMunicipios(cat, "tlaxiaco").some(m => m.nombre === "Heroica Ciudad de Tlaxiaco"));
    // municipios sin unidad pública también aparecen (vienen de INEGI, no del CLUES)
    const sinUnidad = Object.keys(cat.municipios).map(Number).filter(k => !cat.unidades.some(u => u[4] === k));
    assert.ok(sinUnidad.length >= 15, "hay municipios sin unidad pública: " + sinUnidad.length);
    for (const k of sinUnidad) assert.equal(L.unidadesDe(cat, k).length, 0);
  });

  test("L4b: unidades del municipio: móviles al final y marcadas; sin reclusorios ni consultorios de empresa", () => {
    const cat = cargar(["data/clues_oaxaca.js", ...EXTRA]).MediBotData.clues;
    const todas = Object.keys(cat.municipios).flatMap(k => L.unidadesDe(cat, Number(k)));
    assert.ok(!todas.some(u => /RECLUSORIO|REINSERCI|CENTRO DE TRABAJO/i.test(u.nombre + " " + u.tipologia)));
    for (const k of Object.keys(cat.municipios)) {
      const lista = L.unidadesDe(cat, Number(k));
      const iMovil = lista.findIndex(u => u.movil);
      if (iMovil >= 0) assert.ok(lista.slice(iMovil).every(u => u.movil), "móviles al final en " + k);
    }
    assert.ok(todas.filter(u => u.movil).every(u => /no siempre está/.test(u.etiqueta)));
    const matias = L.unidadesDe(cat, 57);
    assert.ok(matias.some(u => /PALOMARES/.test(u.nombre)), "Matías Romero trae Palomares");
  });

  test("L5: la voz agrupa los números en grupos y el 079 siempre dice «opción uno»", () => {
    const v = L.textoVoz("ambar", LLENA);
    assert.match(v, /Emergencias: nueve, uno, uno\./);
    assert.match(v, /Línea de la Vida: ochocientos, novecientos once, dos mil\./); // v0.5: «nueve once» sonaba a 911 (decisión de diseño)
    assert.match(v, /marca cero, siete, nueve\. Cuando te contesten, elige la opción uno\./);
    assert.match(v, /Teléfono: 9 7 1, 1 7 9, 0 8, 9 8\./);
    assert.match(v, /Ambulancia o traslado: 9 7 2, 7 2 2, 1 1, 8 3\./);
    assert.doesNotMatch(v, /9711790898|9727221183|\b079\b|800 911/, "ningún número de corrido");
    assert.equal(L.vozNumero("9711790898"), "9 7 1, 1 7 9, 0 8, 9 8");
    assert.equal(L.formatoTelefono("9711790898"), "971 179 0898");
    // la voz de la app (paraVoz) no estropea lo que ya viene agrupado
    const V = cargar(["js/voz.js", ...EXTRA]).MediBotVoz;
    assert.equal(V.paraVoz("Teléfono: 9 7 1, 1 7 9, 0 8, 9 8."), "Teléfono: 9 7 1, 1 7 9, 0 8, 9 8.");
  });

  test("L6: una configuración exportada e importada en otro equipo es idéntica", () => {
    const texto = L.exportar(LLENA);
    const otro = cargar(EXTRA).MediBotLugares;
    igual(otro.importar(texto), L.normalizar(LLENA));
    assert.equal(otro.exportar(otro.importar(texto)), texto, "exportar(importar(x)) = x");
    assert.throws(() => otro.importar("no es json"), /JSON/);
    assert.throws(() => otro.importar(JSON.stringify({ tipo: "otra-cosa" })), /MediBot/);
    // lo importado pasa por las mismas reglas: un teléfono en ceros no entra
    const raro = JSON.parse(texto); raro.unidad.telefono = "0000000000"; raro.unidad.extra = "x";
    const imp = otro.importar(JSON.stringify(raro));
    assert.equal(imp.telefono, "");
    assert.ok(!("extra" in imp), "solo campos conocidos");
  });

  test("L6b: se guarda en el equipo (localStorage) solo la configuración, nunca datos de la consulta", () => {
    const guardado = {};
    const c = cargar(EXTRA, { antes: (x) => { x.localStorage = { getItem: (k) => (k in guardado ? guardado[k] : null), setItem: (k, v) => { guardado[k] = String(v); }, removeItem: (k) => { delete guardado[k]; } }; } });
    const Lc = c.MediBotLugares;
    assert.equal(Lc.leer(), null);
    Lc.guardar({ ...LLENA, sesion: { grupo: "18a59" }, medicinas: ["presion"] });
    igual(Object.keys(guardado), ["medibot.lugar"]);
    const crudo = JSON.parse(guardado["medibot.lugar"]);
    igual(Object.keys(crudo).sort(), Object.keys(c.MediBotData.lugares.unidad).sort());
    igual(Lc.leer(), Lc.normalizar(LLENA));
    igual(Lc.actual(), Lc.normalizar(LLENA), "la guardada se superpone a la plantilla");
    Lc.borrar();
    assert.equal(Lc.leer(), null);
    igual(Lc.actual(), Lc.normalizar(c.MediBotData.lugares.unidad), "sin guardada, la plantilla de data/lugares.js");
  });

  test("rojo: el 911 va primero y destacado; la unidad solo si atiende urgencias las 24 h; la ambulancia sí sale", () => {
    const l = L.lineas("rojo", LLENA);
    assert.equal(l[0].numero, "911"); assert.equal(l[0].destacado, true);
    assert.ok(l.slice(1).every(x => !x.destacado));
    assert.equal(L.unidadPara("rojo", LLENA), null);
    assert.ok(l.some(x => x.numero === "972 722 1183"), "la ambulancia local sale en rojo");
    assert.match(L.textoVoz("rojo", LLENA), /^Si es urgente, llama ya al 911: nueve, uno, uno\./);
    assert.doesNotMatch(L.textoPantalla("rojo", LLENA), /Palomares/);
    const urg = { ...LLENA, urgencias_24h: true };
    assert.equal(L.unidadPara("rojo", urg).nombre_corto, "Centro de Salud de Palomares");
    assert.match(L.textoPantalla("rojo", urg), /Palomares/);
    // ámbar: la unidad con su horario y las líneas; verde: solo las líneas en pantalla de resultado
    assert.match(L.textoPantalla("ambar", LLENA), /Palomares.*Horario/s);
    assert.equal(L.lineas("ambar", LLENA)[0].destacado, false);
  });

  test("vencida: la configuración confirmada hace más de 12 meses se avisa al operador", () => {
    const hoy = new Date("2026-11-02T12:00:00");
    assert.equal(L.vencida({ ...LLENA, fecha_confirmacion: "2026-01-15" }, hoy), false);
    assert.equal(L.vencida({ ...LLENA, fecha_confirmacion: "2025-10-30" }, hoy), true);
    assert.equal(L.vencida({ ...LLENA, fecha_confirmacion: "" }, hoy), true, "configurada sin fecha: se avisa");
    assert.equal(L.vencida({}, hoy), false, "sin configurar no hay nada que revisar");
    assert.equal(L.vencida({ ...LLENA, fecha_confirmacion: "2024-13-45" }, hoy), true, "fecha imposible = sin fecha");
    assert.equal(L.normalizar({ fecha_confirmacion: "2026-02-30" }).fecha_confirmacion, "");
    assert.equal(L.vencida({ ...LLENA, fecha_confirmacion: "2062-11-01" }, hoy), true, "fecha en el futuro (error de dedo): se avisa");
    assert.equal(L.hoyLocal(new Date(2026, 10, 2, 20, 30)), "2026-11-02", "la fecha de hoy es la local, no la UTC (20:30 en México ya es otro día en UTC)");
  });

  test("L7: el semáforo no cambia con los datos de la fase 3 cargados", () => {
    const sin = cargar([]); const con = cargar(EXTRA);
    for (const m of [medidas(72, 97), medidas(72, 84), medidas(112, 96, 38.6), medidas(130, 93)]) {
      const s1 = sesionBase(sin, { medidas: m }); const s2 = sesionBase(con, { medidas: m });
      igual(con.MediBotReglas.evaluar(s2), sin.MediBotReglas.evaluar(s1));
    }
  });
});

/* ================= C. Lint de data/cuidado.js y data/lugares.js ================= */
describe("C · lint de los datos de la fase 3", () => {
  const tmp = mkdtempSync(join(tmpdir(), "medibot-f3-"));
  const lintCon = (args) => {
    const r = spawnSync("python", [join(RAIZ, "tools/lint_contenido.py"), ...args], { encoding: "utf8", env: { ...process.env, PYTHONUTF8: "1" } });
    return { codigo: r.status, salida: (r.stdout || "") + (r.stderr || "") };
  };
  const base = () => JSON.parse(JSON.stringify(D.cuidado));
  const conCuidado = (obj, extra = []) => {
    const ruta = join(tmp, "cuidado.js");
    writeFileSync(ruta, "window.MediBotData = window.MediBotData || {};\nwindow.MediBotData.cuidado = " + JSON.stringify(obj, null, 1) + ";\n", "utf8");
    return lintCon(["--cuidado", ruta, ...extra]);
  };
  const conLugares = (obj) => {
    const ruta = join(tmp, "lugares.js");
    writeFileSync(ruta, "window.MediBotData = window.MediBotData || {};\nwindow.MediBotData.lugares = " + JSON.stringify(obj, null, 1) + ";\n", "utf8");
    return lintCon(["--lugares", ruta]);
  };

  test("C1: los datos reales pasan el lint", () => { const r = lintCon([]); assert.equal(r.codigo, 0, r.salida); assert.match(r.salida, /cuidado: 14 tarjetas/); });
  test("C2: id inexistente, fuente sin https, palabra prohibida y perfil desconocido se detectan", () => {
    const casos = [
      [(c) => c.tarjetas[0].en_su_lugar.push("no_existe"), /no_existe.*no existe/],
      [(c) => { c.tarjetas[1].fuentes[0].url = "http://stacks.cdc.gov/x"; }, /https/],
      [(c) => { c.tarjetas[2].texto_en_su_lugar = "El suero cura todo."; }, /prohibid/],
      [(c) => { c.tarjetas[3].urgente_si = "Si toma anticoagulante, ve hoy."; }, /anticoagulante/],
      [(c) => c.tarjetas[4].perfiles.push("adolescente"), /perfil desconocido/],
      [(c) => c.tarjetas[5].secciones.push("no_es_seccion"), /no_es_seccion/],
      [(c) => { c.tarjetas[6].fuentes = []; }, /sin fuentes/],
      [(c) => { c.tarjetas[7].id = c.tarjetas[0].id; }, /repetid/],
      [(c) => { c.tarjetas.push({ ...c.tarjetas[0], id: "arnica_tomada" }); }, /arnica_tomada/]
    ];
    for (const [mutar, patron] of casos) {
      const c = base(); mutar(c);
      const r = conCuidado(c);
      assert.equal(r.codigo, 1, String(mutar));
      assert.match(r.salida, patron, r.salida);
    }
  });
  test("C3: una alternativa que es planta del Art. PRIMERO se detecta", () => {
    const fixture = readFileSync(join(RAIZ, "tests/fixtures/corpus_min.js"), "utf8");
    const c = JSON.parse(fixture.match(/window\.MediBotData\.corpus\s*=\s*(\{[\s\S]*\})\s*;\s*$/)[1]);
    const otra = c.entradas.find(e => e.tipo === "planta");
    const ashw = { ...otra, id: "ashw_alt", nombre: "Ashwagandha", nombre_cientifico: "Withania somnifera" };
    c.entradas.push(ashw);
    const rutaCorpus = join(tmp, "corpus.js");
    writeFileSync(rutaCorpus, "window.MediBotData = window.MediBotData || {};\nwindow.MediBotData.corpus = " + JSON.stringify(c) + ";\n", "utf8");
    const tarjeta = { ...base().tarjetas[0], secciones: [c.temas[0].id], en_su_lugar: ["ashw_alt"] };
    const r = conCuidado({ ...base(), tarjetas: [tarjeta] }, ["--corpus", rutaCorpus]);
    assert.match(r.salida, /\[cuidado\].*ashw_alt.*Art\. PRIMERO/, r.salida);
  });
  test("C4: lugares: «[nombre]», teléfono en ceros, línea sin https y el CAT en las líneas visibles se detectan", () => {
    const L0 = () => JSON.parse(JSON.stringify(D.lugares));
    const casos = [
      [(l) => { l.unidad.nombre_corto = "[nombre]"; }, /marcador/],
      [(l) => { l.unidad.telefono = "0000000000"; }, /teléfono/],
      [(l) => { l.nacionales[0].fuente.url = "http://www.gob.mx/911"; }, /https/],
      [(l) => { l.nacionales.push({ ...l.no_mostrar[0], voz: "x", nota: "x" }); }, /298/],
      [(l) => { l.nacionales[1].nota = "Te cura la tristeza."; }, /prohibid/],
      [(l) => { l.nacionales[2].numero = "079"; }, /opción 1/]
    ];
    for (const [mutar, patron] of casos) {
      const l = L0(); mutar(l);
      const r = conLugares(l);
      assert.equal(r.codigo, 1, String(mutar) + "\n" + r.salida);
      assert.match(r.salida, patron, r.salida);
    }
  });
  test("cleanup", () => { rmSync(tmp, { recursive: true, force: true }); });
});
