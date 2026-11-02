// Fase 2: secciones, orden «lo más adecuado primero» y alternativas (criterios F1–F9, T9, T12, T13 y T15;
// esquema en docs/corpus_esquema.md). La matriz de perfiles corre contra el corpus REAL.
// Las comprobaciones de evidencia y de «mismo remedio» están escritas aquí, sin llamar a la función que ordena.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { cargar, sesionBase, valida } from "./cargar.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const medidas = (fc, spo2, temp = null) => ({ fc: valida(fc), spo2: valida(spo2), temp: temp == null ? { valor: null, estado: null } : valida(temp) });
const ayudaEn = (e, tema) => (e.ayuda_por_tema && typeof e.ayuda_por_tema[tema] === "number" ? e.ayuda_por_tema[tema] : e.ayuda);
// Lo que sale del motor vive en otro «realm» (vm): se compara como datos planos.
const plano = (x) => JSON.parse(JSON.stringify(x));
const igual = (a, b, m) => assert.deepEqual(plano(a), plano(b), m);
const comidaOHabito = (e) => e.tipo === "alimento" || e.tipo === "habito";
const permitido = (tema, e) => !Array.isArray(tema.tipos_permitidos) || tema.tipos_permitidos.includes(e.tipo);
/** Mismo remedio con otro id (manzanilla y manzanilla_piel): mismo nombre científico (género y especie) o una pareja de la
    lista explícita. (decisión de diseño del 2026-11-02: ya no por prefijo del id; agua_segura no es el mismo remedio que agua.) */
const MISMO_REMEDIO = [["manzanilla", "manzanilla_piel"], ["llanten", "llanten_piel"]];
function mismoRemedio(a, b) {
  const bin = (e) => String(e.nombre_cientifico || "").toLowerCase().replace(/\(.*?\)/g, " ").trim().split(/\s+/).slice(0, 2).join(" ");
  if (a.nombre_cientifico && b.nombre_cientifico && bin(a) === bin(b)) return true;
  return MISMO_REMEDIO.some(par => par.includes(a.id) && par.includes(b.id));
}

/* ---------- Matriz de perfiles (§4.4): ~260 perfiles ---------- */
const GRUPOS = [
  { paraQuien: "nino", grupo: "nino", edadNino: "menos2" }, { paraQuien: "nino", grupo: "nino", edadNino: "2a5" },
  { paraQuien: "nino", grupo: "nino", edadNino: "6a11" }, { grupo: "12a17" }, { grupo: "18a59" }, { grupo: "60mas" }
];
const EMBARAZO = {
  si: { embarazo: true, embarazoRespondido: true, embarazoOpcion: "si" },
  no: { embarazo: false, embarazoRespondido: true, embarazoOpcion: "no" },
  no_decir: { embarazo: null, embarazoRespondido: true, embarazoOpcion: "no_decir" },
  lactancia: { embarazo: false, embarazoRespondido: true, embarazoOpcion: "lactancia", lactancia: true }
};
const CLAVES = ["presion", "azucar", "anticoagulante", "corazon", "tiroides", "nervios_sueno", "convulsiones", "anticonceptivo"];
const MEDICINAS = [["ninguna"], ["no_se"], ...CLAVES.map(c => [c]), ["presion", "azucar", "anticoagulante"]];
const NIVELES = { verde: [72, 97], ambar: [72, 92] };
function matriz() {
  const out = [];
  for (const g of GRUPOS) {
    const fertil = g.grupo === "12a17" || g.grupo === "18a59";
    for (const [ek, ev] of fertil ? Object.entries(EMBARAZO) : [["-", {}]]) {
      for (const meds of MEDICINAS) for (const [nk, nv] of Object.entries(NIVELES)) {
        out.push({ nombre: `${g.grupo}${g.edadNino ? "/" + g.edadNino : ""} · emb ${ek} · ${meds.join("+")} · ${nk}`, cambios: { ...g, ...ev, medicinas: meds }, sp: nv });
      }
    }
  }
  return out;
}

const ctx = cargar([], { corpus: "real" });
const M = ctx.MediBotRecomendaciones; const R = ctx.MediBotReglas;
const corpus = ctx.MediBotData.corpus;
const PERFILES = matriz().map(c => {
  const s = sesionBase(ctx, { ...structuredClone(c.cambios), medidas: medidas(...c.sp) });
  const r = R.evaluar(s);
  return { ...c, s, r, p: M.perfil(s, r) };
});
const temaPorId = (id) => corpus.temas.find(t => t.id === id);
const aptasDe = (tema, p) => corpus.entradas.filter(e => (e.temas || []).includes(tema.id) && permitido(tema, e) && M.apta(e, p));
const unico = (fallas) => [...new Set(fallas)];

describe("fase 2 · secciones (data/corpus.js)", () => {
  const SECCIONES = {
    embarazo: ["Embarazo y dar pecho", "situacion", null], ninos: ["Niñas y niños", "situacion", null], mayores: ["Persona mayor: caídas y memoria", "situacion", null],
    azucar_peso: ["Azúcar y peso", "situacion", "cuerpo"], corazon: ["Presión y corazón", "situacion", "pecho"],
    defensas: ["Defensas", "molestia", "cuerpo"], digestion: ["Estómago y digestión", "molestia", "panza"], diarrea: ["Diarrea y agua limpia", "molestia", "panza"],
    tos_garganta: ["Tos y garganta", "molestia", "pecho"], dolor_cabeza: ["Dolor de cabeza", "molestia", "cabeza"], sueno: ["Sueño, nervios y tristeza", "molestia", "cabeza"],
    energia: ["Cansancio y sangre", "molestia", "cuerpo"], huesos_articulaciones: ["Huesos y articulaciones", "molestia", "piel_huesos"],
    piel: ["Piel, raspones y piquetes", "molestia", "piel_huesos"], vista: ["Vista", "molestia", "cabeza"], boca: ["Boca y dientes", "molestia", "cabeza"],
    orina: ["Orina", "molestia", "panza"], colicos: ["Cólicos de la regla", "molestia", "panza"]
  };
  test("F1: 18 secciones con nombre, clase y grupo; 5 grupos del cuerpo", () => {
    igual(corpus.temas.map(t => t.id).sort(), Object.keys(SECCIONES).sort());
    for (const [id, [nombre, clase, grupo]] of Object.entries(SECCIONES)) {
      const t = temaPorId(id);
      assert.equal(t.nombre, nombre, id); assert.equal(t.clase, clase, id); assert.equal(t.grupo ?? null, grupo, id);
      assert.ok(t.dibujo, id);
    }
    assert.equal(new Set(corpus.temas.map(t => t.dibujo)).size, corpus.temas.length, "cada sección con un dibujo distinto");
    igual(corpus.grupos.map(g => [g.id, g.nombre]), [["cabeza", "Cabeza y ánimo"], ["pecho", "Pecho y garganta"], ["panza", "Panza"], ["piel_huesos", "Piel y huesos"], ["cuerpo", "Todo el cuerpo"]]);
    for (const g of corpus.grupos) assert.ok(g.dibujo, g.id);
  });
  test("F1: tipos permitidos, ocultar_grupos y sugerencias", () => {
    const tipos = (id) => (temaPorId(id).tipos_permitidos || null);
    igual(tipos("embarazo"), ["alimento", "habito", "suplemento"]);
    for (const id of ["ninos", "mayores", "azucar_peso", "boca"]) igual(tipos(id), ["alimento", "habito"], id);
    igual(tipos("dolor_cabeza"), ["habito"]);
    igual(tipos("diarrea"), ["alimento", "habito", "suplemento"]);
    igual(tipos("colicos"), ["alimento", "habito", "planta"]);
    igual(temaPorId("colicos").ocultar_grupos, ["nino", "60mas"]);
    const orden = corpus.temas.filter(t => t.sugerir_si).sort((a, b) => a.prioridad - b.prioridad).map(t => t.id);
    igual(orden, ["embarazo", "ninos", "azucar_peso", "corazon", "mayores"]);
    // En diarrea el único suplemento que cabe es el suero oral
    const supDiarrea = corpus.entradas.filter(e => e.temas.includes("diarrea") && e.tipo === "suplemento").map(e => e.id);
    igual(supDiarrea, ["suero_oral"]);
    const supEmbarazo = corpus.entradas.filter(e => e.temas.includes("embarazo") && e.tipo === "suplemento");
    assert.ok(supEmbarazo.every(e => e.solo_embarazo), "en Embarazo solo los suplementos del control prenatal");
  });
  test("§7.1 (a): si una entrada excluye una condición, su aviso la dice con palabras (para quien no contesta las casillas)", () => {
    const PALABRAS = { vesicula: /vesícula/i, higado: /hígado/i, rinon_poca_agua: /riñ[oó]n|poca agua/i, acidez: /agruras|acidez/i, alergia_asteraceas: /alergia/i };
    const fallas = [];
    for (const e of corpus.entradas) for (const c of (e.excluir && e.excluir.condiciones) || []) if (!PALABRAS[c].test(e.aviso || "")) fallas.push(`${e.id}: el aviso no menciona ${c}`);
    igual(fallas, []);
  });

  test("F9: cuando_ir es una franja con fuente; sale arriba de su sección y no cuenta como tarjeta", () => {
    const conFranja = corpus.temas.filter(t => t.cuando_ir);
    assert.ok(conFranja.length > 0);
    for (const t of conFranja) { assert.match(t.cuando_ir.texto, /\S/); assert.ok(t.cuando_ir.fuentes.length && t.cuando_ir.fuentes.every(f => /^https:\/\//.test(f.url)), t.id); }
    const t = conFranja[0];
    const s = sesionBase(ctx, { grupo: "18a59", embarazoOpcion: "no", medicinas: ["ninguna"], medidas: medidas(72, 97) });
    const rec = M.recomendar(s, R.evaluar(s), [t.id]);
    igual(rec.franjas.map(f => f.tema), [t.id]);
    assert.equal(rec.franjas[0].texto, t.cuando_ir.texto);
    assert.ok(!rec.tarjetas.some(x => x.entrada.texto === t.cuando_ir.texto));
  });
});

describe("fase 2 · campos nuevos del motor (corpus de prueba armado aquí)", () => {
  const c2 = cargar([], { corpus: "fixture" });
  const M2 = c2.MediBotRecomendaciones; const R2 = c2.MediBotReglas;
  const libre = (extra = {}) => ({ embarazo: false, lactancia: false, edad_minima: 0, medicinas: [], condiciones: [], ...extra });
  const E = (id, tipo, temas, ayuda, extra = {}) => ({ id, tipo, nombre: id, temas, ayuda, donde: "mercado", costo: 1, excluir: libre(), alternativas: [], fuentes: [], ...extra });
  const usar = (temas, entradas) => { c2.MediBotData.corpus = { version: "t", temas, entradas }; };
  const ses = (cambios = {}) => sesionBase(c2, { grupo: "18a59", embarazoOpcion: "no", medicinas: ["ninguna"], medidas: medidas(72, 97), ...cambios });
  const ids = (s, temas) => M2.recomendar(s, R2.evaluar(s), temas).tarjetas.map(t => t.entrada.id);

  test("F2: edad_maxima es exclusiva (quien tiene esa edad o más no la ve)", () => {
    const e = E("juego", "habito", ["a"], 2, { excluir: libre({ edad_minima: 1, edad_maxima: 6 }) });
    const p = (c) => M2.perfil(sesionBase(c2, c), null);
    assert.equal(M2.apta(e, p({ paraQuien: "nino", grupo: "nino", edadNino: "2a5" })), true);
    assert.equal(M2.apta(e, p({ paraQuien: "nino", grupo: "nino", edadNino: "6a11" })), false, "6 años con edad_maxima 6");
    const joven = E("joven", "habito", ["a"], 2, { excluir: libre({ edad_minima: 5, edad_maxima: 18 }) });
    assert.equal(M2.apta(joven, p({ grupo: "12a17" })), true);
    assert.equal(M2.apta(joven, p({ grupo: "18a59" })), false);
    assert.equal(M2.apta(E("sin_max", "habito", ["a"], 2), p({ grupo: "60mas" })), true);
  });

  test("F3: la evidencia manda; ayuda_por_tema cambia la evidencia solo en ese tema", () => {
    usar([{ id: "a", nombre: "A" }, { id: "b", nombre: "B" }], [
      E("planta3", "planta", ["b", "a"], 3, { donde: "farmacia", costo: 3, excluir: libre({ edad_minima: 18 }) }),
      E("comida2", "alimento", ["a"], 2, { donde: "casa" }),
      E("por_tema", "habito", ["b", "a"], 1, { ayuda_por_tema: { a: 3 } })
    ]);
    igual(ids(ses(), ["a"]).slice(0, 3), ["por_tema", "planta3", "comida2"], "ayuda 3 (por tema) > ayuda 3 planta lejana > ayuda 2");
    assert.equal(ids(ses(), ["b"])[0], "planta3", "en b, por_tema vuelve a ayuda 1");
  });

  test("F3: a igual evidencia, tema principal, señal del perfil (prioriza_si), tipo, acceso y avisos personales", () => {
    usar([{ id: "a", nombre: "A" }, { id: "z", nombre: "Z" }], [
      E("secundaria", "habito", ["z", "a"], 2),
      E("principal", "habito", ["a"], 2)
    ]);
    igual(ids(ses(), ["a"]), ["principal", "secundaria"], "pertinencia");
    usar([{ id: "a", nombre: "A" }], [E("normal", "habito", ["a"], 2, { donde: "casa" }), E("peso", "habito", ["a"], 2, { prioriza_si: ["imc_alto"] })]);
    igual(ids(ses(), ["a"]), ["normal", "peso"], "sin IMC alto gana el acceso");
    igual(ids(ses({ peso: { valor: 95, origen: "manual" }, talla: { valor: 160, origen: "manual" } }), ["a"]), ["peso", "normal"], "IMC 37: prioriza_si");
    usar([{ id: "a", nombre: "A" }], [E("planta", "planta", ["a"], 2, { donde: "casa", excluir: libre({ edad_minima: 18 }) }), E("comida", "alimento", ["a"], 2)]);
    assert.equal(ids(ses(), ["a"])[0], "comida", "alimento antes que planta");
    usar([{ id: "a", nombre: "A" }], [E("con_aviso", "habito", ["a"], 2, { donde: "casa", avisos_medicina: { presion: "Cuidado con la presión." } }), E("sin_aviso", "habito", ["a"], 2)]);
    assert.equal(ids(ses(), ["a"])[0], "con_aviso", "sin la medicina, el aviso no cuenta");
    assert.equal(ids(ses({ medicinas: ["presion"] }), ["a"])[0], "sin_aviso", "con la medicina, el aviso personal resta");
    // donde = "centro_salud" (decisión de diseño, 2026-11-01): acceso 1, igual que mercado; más que farmacia (0)
    usar([{ id: "a", nombre: "A" }], [E("cs", "habito", ["a"], 2, { donde: "centro_salud", costo: 2 }), E("mer", "habito", ["a"], 2, { donde: "mercado", costo: 2 }), E("far", "habito", ["a"], 2, { donde: "farmacia", costo: 2 })]);
    const pc = M2.perfil(ses(), null);
    assert.equal(M2.puntaje(M2.porId("cs"), "a", pc), M2.puntaje(M2.porId("mer"), "a", pc), "centro de salud = mercado");
    assert.equal(M2.puntaje(M2.porId("cs"), "a", pc) - M2.puntaje(M2.porId("far"), "a", pc), 4, "centro de salud = farmacia + 1 de acceso");
  });

  test("F4: máx. 4 por molestia y 3 por situación, 2 por tipo, 1 planta, 1 suplemento, ≥1 alimento o hábito; tipos permitidos", () => {
    const ent = [
      ...["h1", "h2", "h3"].map(id => E(id, "habito", ["m", "s"], 3)),
      ...["a1", "a2", "a3"].map(id => E(id, "alimento", ["m", "s"], 2)),
      ...["p1", "p2"].map(id => E(id, "planta", ["m", "s"], 3, { excluir: libre({ edad_minima: 12 }) })),
      ...["s1", "s2"].map(id => E(id, "suplemento", ["m", "s"], 3, { excluir: libre({ edad_minima: 18 }) }))
    ];
    usar([{ id: "m", nombre: "M", clase: "molestia" }, { id: "s", nombre: "S", clase: "situacion", tipos_permitidos: ["alimento", "habito"] }], ent);
    const m = ids(ses(), ["m"]);
    assert.equal(m.length, 4, m.join(","));
    const tipoDe = (id) => ent.find(e => e.id === id).tipo;
    const cuenta = (lista, tipo) => lista.filter(id => tipoDe(id) === tipo).length;
    assert.ok(cuenta(m, "planta") <= 1 && cuenta(m, "suplemento") <= 1 && cuenta(m, "habito") <= 2, m.join(","));
    const s = ids(ses(), ["s"]);
    assert.equal(s.length, 3, s.join(","));
    assert.ok(s.every(id => ["habito", "alimento"].includes(tipoDe(id))), "situación sin plantas ni suplementos: " + s.join(","));
    // Si las mejores no son comida ni hábito, la última se cambia por la mejor comida o hábito
    usar([{ id: "m", nombre: "M" }], [
      E("p", "planta", ["m"], 3, { excluir: libre({ edad_minima: 12 }) }), E("s", "suplemento", ["m"], 3, { excluir: libre({ edad_minima: 18 }) }),
      E("comida_floja", "alimento", ["m"], 1)
    ]);
    const v = ids(ses(), ["m"]);
    assert.ok(v.includes("comida_floja"), v.join(","));
    // Sin repetir entre secciones
    usar([{ id: "m", nombre: "M" }, { id: "n", nombre: "N" }], ["x1", "x2", "x3"].map(id => E(id, "habito", ["m", "n"], 2)).concat(["y1", "y2"].map(id => E(id, "alimento", ["n"], 1))));
    const dos = M2.recomendar(ses(), null, ["m", "n"]).tarjetas;
    assert.equal(new Set(dos.map(t => t.entrada.id)).size, dos.length);
  });

  test("F5: sección oculta con menos de 3 opciones o por ocultar_grupos; situaciones sugeridas (máx. 2, por prioridad)", () => {
    const tres = (tema) => ["1", "2", "3"].map(n => E(tema + n, "habito", [tema], 2));
    usar([
      { id: "pocas", nombre: "Pocas", clase: "molestia", grupo: "g" }, { id: "regla", nombre: "Regla", clase: "molestia", grupo: "g", ocultar_grupos: ["nino", "60mas"] },
      { id: "emb", nombre: "Emb", clase: "situacion", sugerir_si: ["embarazo", "lactancia"], prioridad: 1 },
      { id: "az", nombre: "Az", clase: "situacion", grupo: "g", sugerir_si: ["azucar", "imc_alto"], prioridad: 3 },
      { id: "pr", nombre: "Pr", clase: "situacion", grupo: "g", sugerir_si: ["presion", "corazon"], prioridad: 4 },
      { id: "may", nombre: "May", clase: "situacion", sugerir_si: ["mayor60"], prioridad: 5 }
    ], [E("pocas1", "habito", ["pocas"], 2), E("pocas2", "habito", ["pocas"], 2), ...tres("regla"), ...tres("emb"), ...tres("az"), ...tres("pr"), ...tres("may")]);
    const vis = (c) => M2.seccionesVisibles(M2.perfil(ses(c), null)).map(t => t.id);
    assert.ok(!vis().includes("pocas"), "2 opciones: oculta");
    assert.ok(vis().includes("regla"));
    assert.ok(!vis({ grupo: "60mas" }).includes("regla"), "ocultar_grupos");
    const sug = (c) => M2.sugeridas(M2.perfil(ses(c), null));
    igual(sug(), []);
    igual(sug({ grupo: "60mas", medicinas: ["presion"] }), ["pr", "may"]);
    igual(sug({ embarazo: true, embarazoOpcion: "si", medicinas: ["presion", "azucar"] }), ["emb", "az"], "máximo 2, por prioridad");
    igual(sug({ embarazoOpcion: "lactancia", lactancia: true }), ["emb"]);
    igual(sug({ medicinas: ["no_se"] }), [], "«No sé» no sugiere secciones por medicina");
    igual(sug({ peso: { valor: 95, origen: "manual" }, talla: { valor: 160, origen: "manual" } }), ["az"], "IMC ≥ 30 en adulto");
    igual(sug({ grupo: "12a17", peso: { valor: 95, origen: "manual" }, talla: { valor: 160, origen: "manual" } }), [], "IMC alto solo de 18 años en adelante");
  });

  test("F6: alternativas: ≥1 comida o hábito y nunca el mismo remedio con otro id", () => {
    usar([{ id: "a", nombre: "A" }], [
      E("te", "planta", ["a"], 1, { nombre_cientifico: "Matricaria chamomilla", alternativas: ["te_piel", "otra_planta", "otra_planta2", "comida"], excluir: libre({ edad_minima: 12 }) }),
      E("te_piel", "planta", ["a"], 1, { nombre_cientifico: "Matricaria chamomilla (flor), uso en la piel", alternativas: ["te", "comida"], excluir: libre({ edad_minima: 12 }) }),
      E("otra_planta", "planta", ["a"], 1, { nombre_cientifico: "Mentha x piperita", alternativas: ["te", "comida"], excluir: libre({ edad_minima: 12 }) }),
      E("otra_planta2", "planta", ["a"], 1, { nombre_cientifico: "Malva sylvestris", alternativas: ["te", "comida"], excluir: libre({ edad_minima: 12 }) }),
      E("comida", "alimento", ["a"], 1, { alternativas: ["te", "otra_planta"] })
    ]);
    const alts = M2.alternativas("te", M2.perfil(ses(), null)).map(a => a.id);
    assert.ok(!alts.includes("te_piel"), alts.join(","));
    assert.ok(alts.includes("comida"), alts.join(","));
    assert.ok(alts.length >= 2, alts.join(","));
  });

  test("F7: condiciones sin contestar = ninguna (no «todas»); marcadas, excluyen", () => {
    usar([{ id: "a", nombre: "A" }], [E("boldo", "planta", ["a"], 1, { excluir: libre({ edad_minima: 18, condiciones: ["vesicula", "higado"] }) })]);
    const e = M2.porId("boldo");
    const sinContestar = sesionBase(c2, { grupo: "18a59", embarazoOpcion: "no", medicinas: ["ninguna"] });
    delete sinContestar.condiciones;
    igual([...M2.perfil(sinContestar, null).condiciones], []);
    assert.equal(M2.apta(e, M2.perfil(sinContestar, null)), true);
    assert.equal(M2.apta(e, M2.perfil(ses({ condiciones: [] }), null)), true);
    assert.equal(M2.apta(e, M2.perfil(ses({ condiciones: ["vesicula"] }), null)), false);
    assert.equal(M2.apta(e, M2.perfil(ses({ condiciones: ["acidez"] }), null)), true);
    // La pantalla pregunta exactamente las 5 condiciones que el corpus sabe excluir
    const ops = c2.MediBotData.textos.medicinas.condiciones.opciones.map(o => o.id);
    igual(ops, ["vesicula", "higado", "rinon_poca_agua", "acidez", "alergia_asteraceas"]);
  });
});

describe("fase 2 · orden y alternativas con la matriz de perfiles (corpus real)", () => {
  test(`matriz de perfiles armada (${PERFILES.length} perfiles)`, () => { assert.ok(PERFILES.length >= 250); });

  test("T12-a: la primera tarjeta de cada sección visible tiene la evidencia más alta entre las aptas", () => {
    const fallas = [];
    for (const P of PERFILES) for (const tema of M.seccionesVisibles(P.p)) {
      const rec = M.recomendar(P.s, P.r, [tema.id]);
      const primera = rec.tarjetas.find(t => t.tema === tema.id);
      const max = Math.max(...aptasDe(tema, P.p).map(e => ayudaEn(e, tema.id)));
      if (!primera) { fallas.push(`${P.nombre} · ${tema.id}: sin tarjetas`); continue; }
      if (ayudaEn(primera.entrada, tema.id) !== max) fallas.push(`${tema.id}: primera ${primera.entrada.id} (${ayudaEn(primera.entrada, tema.id)}) y hay ${max} · ${P.nombre}`);
    }
    igual(unico(fallas).slice(0, 15), []);
  });

  test("T12-b: a igual evidencia, la primera no es planta ni suplemento si hay comida o hábito apto con esa evidencia", () => {
    const fallas = [];
    for (const P of PERFILES) for (const tema of M.seccionesVisibles(P.p)) {
      const primera = M.recomendar(P.s, P.r, [tema.id]).tarjetas.find(t => t.tema === tema.id);
      if (!primera || comidaOHabito(primera.entrada)) continue;
      const a = ayudaEn(primera.entrada, tema.id);
      const mejor = aptasDe(tema, P.p).find(e => comidaOHabito(e) && ayudaEn(e, tema.id) === a);
      if (mejor) fallas.push(`${tema.id}: primera ${primera.entrada.id} (${primera.entrada.tipo}) y ${mejor.id} tiene la misma evidencia`);
    }
    igual(unico(fallas), []);
  });

  test("T12-c: el mismo perfil da siempre el mismo orden", () => {
    for (const P of PERFILES) {
      const temas = M.seccionesVisibles(P.p).map(t => t.id);
      const una = M.recomendar(structuredClone(P.s), P.r, temas).tarjetas.map(t => t.entrada.id).join(",");
      const otra = M.recomendar(structuredClone(P.s), P.r, temas).tarjetas.map(t => t.entrada.id).join(",");
      assert.equal(una, otra, P.nombre);
    }
  });

  test("T12-d: adulto con IMC ≥ 30 en Azúcar y peso recibe primero caminar o menos dulce y refresco (y se le sugiere la sección)", () => {
    const s = sesionBase(ctx, { grupo: "18a59", embarazoOpcion: "no", medicinas: ["ninguna"], peso: { valor: 95, origen: "manual" }, talla: { valor: 160, origen: "manual" }, medidas: medidas(72, 97) });
    const r = R.evaluar(s);
    assert.ok(M.sugeridas(M.perfil(s, r)).includes("azucar_peso"));
    const primera = M.recomendar(s, r, ["azucar_peso"]).tarjetas.find(t => t.tema === "azucar_peso");
    assert.ok(primera && ["caminar", "menos_dulce_refresco"].includes(primera.entrada.id), primera && primera.entrada.id);
  });

  test("T12-e: variedad por sección: ≥1 comida o hábito, máx. 1 planta y 1 suplemento (sola y en grupos de 3 secciones)", () => {
    const fallas = [];
    const revisar = (P, temas) => {
      const rec = M.recomendar(P.s, P.r, temas);
      for (const id of temas) {
        const ts = rec.tarjetas.filter(t => t.tema === id).map(t => t.entrada);
        if (!ts.some(comidaOHabito)) fallas.push(`${id} sin comida ni hábito (${temas.join("+")}) · ${P.nombre}`);
        if (ts.filter(e => e.tipo === "planta").length > 1) fallas.push(`${id}: más de 1 planta`);
        if (ts.filter(e => e.tipo === "suplemento").length > 1) fallas.push(`${id}: más de 1 suplemento`);
      }
    };
    for (const P of PERFILES) {
      const vis = M.seccionesVisibles(P.p).map(t => t.id);
      for (const id of vis) revisar(P, [id]);
      for (const a of vis) for (const b of vis) if (a !== b) revisar(P, [a, b]); // todos los pares, en los dos órdenes
      for (let i = 0; i + 2 < vis.length; i++) revisar(P, vis.slice(i, i + 3));
    }
    igual(unico(fallas).slice(0, 15), []);
  });

  test("F4 (corpus real): una tarjeta solo se repite entre secciones cuando esa sección ya no tiene ninguna opción nueva", () => {
    const fallas = [];
    for (const P of PERFILES) {
      const vis = M.seccionesVisibles(P.p).map(t => t.id);
      for (let i = 0; i + 2 < vis.length; i++) for (const temas of [vis.slice(i, i + 3), [vis[i + 2], vis[i + 1], vis[i]]]) {
        const rec = M.recomendar(P.s, P.r, temas); const vistas = new Set();
        for (const id of temas) {
          const ts = rec.tarjetas.filter(t => t.tema === id).map(t => t.entrada.id);
          const repetidas = ts.filter(x => vistas.has(x));
          if (repetidas.length && aptasDe(temaPorId(id), P.p).some(e => !vistas.has(e.id))) fallas.push(`${id} repite ${repetidas} y tenía opciones nuevas (${temas.join("+")}) · ${P.nombre}`);
          ts.forEach(x => vistas.add(x));
        }
      }
    }
    igual(unico(fallas).slice(0, 10), []);
  });

  const mayorPresion = () => { const s = sesionBase(ctx, { grupo: "60mas", medicinas: ["presion"], medidas: medidas(72, 97) }); return { s, r: R.evaluar(s) }; };
  test("T12-f (corazón): con 60 años o más y presión, en Presión y corazón la primera es menos_sal o caminar", () => {
    const { s, r } = mayorPresion();
    const primera = M.recomendar(s, r, ["corazon"]).tarjetas.find(t => t.tema === "corazon");
    assert.ok(["menos_sal", "caminar"].includes(primera.entrada.id), primera.entrada.id);
  });
  test("T12-f (diarrea): con 60 años o más y presión, en Diarrea y agua limpia la primera es suero_oral", () => {
    const { s, r } = mayorPresion();
    const lista = M.recomendar(s, r, ["diarrea"]).tarjetas.filter(t => t.tema === "diarrea").map(t => t.entrada.id);
    assert.equal(lista[0], "suero_oral", lista.join(","));
  });

  // T13-a — especificación cambiada el 2026-11-02 (decisión de diseño, campo nuevo `sin_cambio`): una opción con
  // sin_cambio: true da 0 alternativas y dice «Esta no tiene cambio» + su si_no_hay; toda opción SIN sin_cambio sigue
  // exigiendo ≥ 2 alternativas aptas (≥ 1 comida o hábito). Las alternativas salen solo de su lista `alternativas`.
  test("T13-a: sin_cambio → 0 alternativas y «Esta no tiene cambio» + si_no_hay; las demás, ≥2 alternativas aptas de su lista, ≥1 comida o hábito, sin ella misma ni el mismo remedio", () => {
    const fallas = [];
    for (const P of PERFILES) {
      const vistas = new Set();
      for (const tema of M.seccionesVisibles(P.p)) for (const e of aptasDe(tema, P.p)) vistas.add(e);
      for (const e of vistas) {
        const alts = M.alternativas(e.id, P.p);
        if (e.sin_cambio) {
          if (alts.length) fallas.push(`${e.id}: sin_cambio con ${alts.length} alternativas · ${P.nombre}`);
          const texto = M.textoNoLoEncuentro(M.noLoEncuentro(e.id, P.p), "voz");
          if (!/Esta no tiene cambio/.test(texto) || !texto.includes(String(e.si_no_hay || "").trim().replace(/\.$/, ""))) fallas.push(`${e.id}: no dice «Esta no tiene cambio» + si_no_hay`);
          continue;
        }
        for (const a of alts) if (!(e.alternativas || []).includes(a.id)) fallas.push(`${e.id}: alternativa ${a.id} no está en su lista`);
        if (alts.length < 2) fallas.push(`${e.id}: ${alts.length} alternativas · ${P.nombre}`);
        if (!alts.some(comidaOHabito)) fallas.push(`${e.id}: ninguna alternativa es comida o hábito · ${P.nombre}`);
        for (const a of alts) {
          if (!M.apta(a, P.p)) fallas.push(`${e.id}: alternativa ${a.id} no apta · ${P.nombre}`);
          if (a.id === e.id || mismoRemedio(a, e)) fallas.push(`${e.id}: alternativa ${a.id} es el mismo remedio`);
        }
      }
    }
    igual(unico(fallas).slice(0, 20), []);
  });

  test("T13-b: cada sección tiene ≥2 anclas (comida o hábito sin exclusiones, para la edad más baja que ve la sección)", () => {
    const BASE = { embarazo: 12, ninos: 0.25, mayores: 60 };
    const fallas = [];
    for (const tema of corpus.temas) {
      const edades = PERFILES.filter(P => M.seccionesVisibles(P.p).some(t => t.id === tema.id)).map(P => P.p.edad);
      const oculta = tema.ocultar_grupos || [];
      const edadMin = edades.length ? Math.min(...edades) : (BASE[tema.id] ?? (oculta.includes("nino") ? 12 : 0.25));
      const anclas = corpus.entradas.filter(e => e.temas.includes(tema.id) && comidaOHabito(e) && permitido(tema, e) && !e.solo_embarazo && !e.leyenda_embarazo
        && e.excluir && !e.excluir.embarazo && !e.excluir.lactancia && !(e.excluir.medicinas || []).length && !(e.excluir.condiciones || []).length
        && (e.excluir.edad_minima || 0) <= edadMin && !(typeof e.excluir.edad_maxima === "number" && e.excluir.edad_maxima <= edadMin));
      if (anclas.length < 2) fallas.push(`${tema.id}: ${anclas.length} anclas (${anclas.map(e => e.id).join(",") || "ninguna"}) para ${edadMin} años`);
    }
    igual(fallas, []);
  });

  test("T13-c: toda sección visible tiene ≥3 opciones aptas; ocultar_grupos y situaciones de perfil fuera de los grupos", () => {
    const fallas = [];
    for (const P of PERFILES) {
      const vis = M.seccionesVisibles(P.p);
      for (const t of vis) if (aptasDe(t, P.p).length < 3) fallas.push(`${t.id} visible con ${aptasDe(t, P.p).length} · ${P.nombre}`);
      for (const t of corpus.temas) if ((t.ocultar_grupos || []).includes(P.p.grupo) && vis.includes(t)) fallas.push(`${t.id} visible para ${P.p.grupo}`);
      for (const id of M.sugeridas(P.p)) if (!vis.some(t => t.id === id)) fallas.push(`sugiere ${id} y no es visible · ${P.nombre}`);
    }
    for (const id of ["embarazo", "ninos", "mayores"]) if (temaPorId(id).grupo) fallas.push(`${id} aparece en un grupo`);
    igual(unico(fallas).slice(0, 15), []);
  });
});

describe("fase 2 · tamaño del corpus (criterio 9)", () => {
  const perfilDe = (c) => M.perfil(sesionBase(ctx, { medicinas: ["ninguna"], ...c }), null);
  const PERFIL_SECCION = {
    embarazo: perfilDe({ grupo: "18a59", embarazo: true, embarazoOpcion: "si" }),
    ninos: perfilDe({ paraQuien: "nino", grupo: "nino", edadNino: "2a5" }),
    mayores: perfilDe({ grupo: "60mas", medicinas: ["presion"] })
  };
  const sano = perfilDe({ grupo: "18a59", embarazoOpcion: "no" });

  test("T9-a: ≥120 entradas y ≥8 aptas por sección para el adulto sano (las situaciones, con su perfil) — se cumple al integrar el lote 3", () => {
    const cortas = corpus.temas.map(t => [t.id, aptasDe(t, PERFIL_SECCION[t.id] || sano).length]).filter(([, n]) => n < 8);
    igual({ entradas: corpus.entradas.length >= 120 ? "ok" : corpus.entradas.length, secciones_con_menos_de_8: cortas }, { entradas: "ok", secciones_con_menos_de_8: [] });
  });

  test("T9-b (meta interna ≥ 5): aptas para quien contesta «No sé» por sección de molestia — reporta el conteo", (t) => {
    const noSe = perfilDe({ grupo: "18a59", embarazoOpcion: "no", medicinas: ["no_se"] });
    const conteo = corpus.temas.filter(x => x.clase === "molestia").map(x => [x.id, aptasDe(x, noSe).length]);
    const debajo = conteo.filter(([, n]) => n < 5);
    t.diagnostic(`T9-b conteo «No sé»: ${conteo.map(([id, n]) => id + " " + n).join(", ")}`);
    t.diagnostic(debajo.length ? `T9-b por debajo de la meta: menos de 5 en ${debajo.map(([id, n]) => id + " " + n).join(", ")}` : "T9-b: meta cumplida (≥5 en todas)");
    assert.equal(conteo.length, corpus.temas.filter(x => x.clase === "molestia").length);
  });
});

describe("fase 2 · T15: el semáforo protegido no cambia", () => {
  // SHA-256 (saltos de línea normalizados a \n) tomados el 2026-11-01 antes de la fase 2. Si se cambia
  // a propósito el semáforo, se actualiza aquí junto con docs/reglas_orientacion.md.
  const HUELLAS = {
    "js/reglas.js": "9c1fdc390ea696617e8d7253451ef8d430023e6394c687451ce24f91bfafa0a0",
    // data/rangos.js: huella actualizada el 2026-11-02 porque cambió solo el comentario de la línea 2 (la cabecera
    // publicada); los rangos, la lógica y las demás huellas no cambian.
    "data/rangos.js": "bf9a7508a2dc7e80c4c86c33d42c40ea110874585b07782cb45cea603f08e9a1",
    "data/alarma.js": "95c11db893a411a12d6953ea6b31b433c4b5862efd0da5be901c0450b7e385db",
    "tests/reglas.test.mjs": "6e90535cab637ee37dc00a4b9d147cf330aec1b0c55b7933b166b81dea01b0f7"
  };
  test("T15: js/reglas.js, data/rangos.js, data/alarma.js y tests/reglas.test.mjs sin cambios", () => {
    const actual = Object.fromEntries(Object.keys(HUELLAS).map(f => [f, createHash("sha256").update(readFileSync(join(RAIZ, f), "utf8").replace(/\r\n/g, "\n")).digest("hex")]));
    igual(actual, HUELLAS);
  });
});
