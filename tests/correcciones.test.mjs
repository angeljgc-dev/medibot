// Ronda de correcciones (2026-11-02): lo que las pruebas y la revisión encontraron en la fase 2.
// Campos nuevos: docs/corpus_esquema.md «Campos de la ronda de correcciones» (sin_cambio, avisos_perfil, actividad)
// y `ocultar_si` en temas. Las pruebas de comportamiento usan corpus armados aquí (no dependen del corpus real);
// al final, criterio 11 contra el corpus real.
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
const medidas = (fc, spo2, temp = null) => ({ fc: valida(fc), spo2: valida(spo2), temp: temp == null ? { valor: null, estado: null } : valida(temp) });

const c2 = cargar([], { corpus: "fixture" });
const M = c2.MediBotRecomendaciones; const R = c2.MediBotReglas; const TR = c2.MediBotData.textos.recomendaciones;
const libre = (extra = {}) => ({ embarazo: false, lactancia: false, edad_minima: 0, medicinas: [], condiciones: [], ...extra });
const E = (id, tipo, temas, ayuda, extra = {}) => ({ id, tipo, nombre: id, temas, ayuda, para: "para " + id, como: "como " + id, donde: "mercado", costo: 1, excluir: libre(), alternativas: [], fuentes: [], ...extra });
const usar = (temas, entradas) => { c2.MediBotData.corpus = { version: "t", temas, entradas }; };
const ses = (cambios = {}) => sesionBase(c2, { grupo: "18a59", embarazoOpcion: "no", medicinas: ["ninguna"], medidas: medidas(72, 97), ...cambios });
const per = (cambios = {}) => M.perfil(ses(cambios), null);
const ids = (s, temas) => M.recomendar(s, R.evaluar(s), temas).tarjetas.map(t => t.entrada.id);

describe("1 · «No lo encuentro»", () => {
  test("1a: el texto ya no promete «sirve igual»; dice «Si no consigues…, puedes probar con:»", () => {
    assert.doesNotMatch(TR.si_no_hay, /sirve igual/i);
    usar([{ id: "a", nombre: "A" }], [E("guayaba", "alimento", ["a"], 2, { nombre: "Guayaba", alternativas: ["naranja", "lavar"] }),
      E("naranja", "alimento", ["a"], 2, { nombre: "Naranja" }), E("lavar", "habito", ["a"], 2, { nombre: "Lavarse las manos" })]);
    const info = M.noLoEncuentro("guayaba", per(), "a");
    assert.equal(info.sinCambio, false);
    assert.equal(info.intro, "Si no consigues Guayaba, puedes probar con:", "el nombre va como está escrito (decisión 2026-11-02: sin toLowerCase)");
    igual(info.alternativas.map(a => a.entrada.id), ["naranja", "lavar"]);
  });

  test("1b: un hábito no se lee «Si no consigues no aguantarte…»", () => {
    usar([{ id: "a", nombre: "A" }], [E("no_aguantar", "habito", ["a"], 2, { nombre: "No aguantarte las ganas de orinar", alternativas: ["agua", "otra"] }),
      E("agua", "habito", ["a"], 2, { nombre: "Agua" }), E("otra", "alimento", ["a"], 2, { nombre: "Otra" })]);
    const intro = M.noLoEncuentro("no_aguantar", per(), "a").intro;
    assert.doesNotMatch(intro, /no consigues no|si no hay no/i, intro);
    assert.match(intro, /puedes probar con:$/);
  });

  test("1c: sin_cambio: no ofrece alternativas, dice «Esta no tiene cambio» y lee si_no_hay", () => {
    usar([{ id: "a", nombre: "A" }], [E("vacunas", "habito", ["a"], 3, { sin_cambio: true, si_no_hay: "Si perdiste la cartilla, pide otra en tu centro de salud.", alternativas: ["lavar", "agua"] }),
      E("lavar", "habito", ["a"], 2), E("agua", "habito", ["a"], 2)]);
    const p = per();
    igual(M.alternativas("vacunas", p).map(a => a.id), [], "aunque los datos traigan alternativas, sin_cambio no las ofrece");
    const info = M.noLoEncuentro("vacunas", p, "a");
    assert.equal(info.sinCambio, true);
    igual(info.alternativas, []);
    for (const modo of ["voz", "hoja"]) {
      const t = M.textoNoLoEncuentro(info, modo);
      assert.match(t, /Esta no tiene cambio/, modo);
      assert.match(t, /Si perdiste la cartilla, pide otra en tu centro de salud\./, modo);
    }
  });

  test("1d: las alternativas respetan tipos_permitidos de la sección de la tarjeta, aunque los datos se equivoquen", () => {
    usar([{ id: "sit", nombre: "Sit", clase: "situacion", tipos_permitidos: ["alimento", "habito"] }, { id: "mol", nombre: "Mol", clase: "molestia" }],
      [E("comida", "alimento", ["sit", "mol"], 2, { alternativas: ["planta", "sup", "otra_comida", "habito"] }),
        E("planta", "planta", ["sit", "mol"], 2, { excluir: libre({ edad_minima: 12 }) }), E("sup", "suplemento", ["sit", "mol"], 2, { excluir: libre({ edad_minima: 18 }) }),
        E("otra_comida", "alimento", ["sit"], 2), E("habito", "habito", ["sit"], 2)]);
    const p = per();
    const enSit = M.alternativas("comida", p, "sit").map(a => a.id);
    assert.ok(!enSit.includes("planta") && !enSit.includes("sup"), enSit.join(","));
    assert.equal(enSit.length, 2, enSit.join(","));
    assert.ok(M.alternativas("comida", p, "mol").some(a => a.id === "planta"), "en la molestia sí se permite la planta");
    const sinTema = M.alternativas("comida", p).map(a => a.id);
    assert.ok(!sinTema.includes("planta"), "sin tema: lo que alguna de sus secciones no permite, no se ofrece: " + sinTema.join(","));
  });
});

describe("2 · avisos_perfil y avisos de la tarjeta de hidratación", () => {
  test("2a: avisos_perfil solo los ve quien tiene ese rasgo", () => {
    usar([{ id: "a", nombre: "A" }], [E("x", "alimento", ["a"], 2, { aviso: "Para todos.", avisos_perfil: {
      embarazo: "En el embarazo, cocida.", lactancia: "Dando pecho, con medida.", nino: "Al niño, en trozos chicos.", mayor60: "Mayores: despacio." } })]);
    const e = M.porId("x");
    const av = (c) => M.avisosPara(e, per(c));
    igual(av(), ["Para todos."]);
    igual(av({ embarazo: true, embarazoOpcion: "si" }), ["Para todos.", "En el embarazo, cocida."]);
    igual(av({ embarazoOpcion: "lactancia", lactancia: true }), ["Para todos.", "Dando pecho, con medida."]);
    igual(av({ paraQuien: "nino", grupo: "nino", edadNino: "6a11", embarazoOpcion: null }), ["Para todos.", "Al niño, en trozos chicos."]);
    igual(av({ grupo: "60mas", embarazoOpcion: null }), ["Para todos.", "Mayores: despacio."]);
    igual(av({ embarazoOpcion: "no_decir" }), ["Para todos."], "«Prefiero no decir» no recibe el aviso del embarazo (no se le dice que está embarazada)");
  });

  test("2b: con fiebre, la tarjeta de hidratación da el aviso de riñones o poca agua y el de medicina del corazón", () => {
    usar([{ id: "a", nombre: "A" }], ["h1", "h2", "h3"].map(id => E(id, "habito", ["a"], 2)));
    const hid = (c) => { const s = ses({ medidas: medidas(80, 97, 37.8), ...c }); return M.recomendar(s, R.evaluar(s), ["a"]).tarjetas.find(t => t.entrada.id === "senal_hidratacion"); };
    assert.ok(hid(), "con fiebre sale la hidratación");
    igual(hid().avisos, [], "sin condición ni medicina, sin aviso");
    assert.ok(hid({ condiciones: ["rinon_poca_agua"] }).avisos.some(a => /poca agua/i.test(a) && /centro de salud/i.test(a) && /cuánto/i.test(a)), JSON.stringify(hid({ condiciones: ["rinon_poca_agua"] }).avisos));
    assert.ok(hid({ medicinas: ["corazon"] }).avisos.some(a => /corazón/i.test(a) && /cuánto/i.test(a)));
    assert.ok(!hid({ medicinas: ["presion"] }).avisos.some(a => /corazón/i.test(a)));
  });

  test("2c: la tarjeta de hidratación no tiene cambio (dice qué hacer si no hay suero)", () => {
    usar([{ id: "a", nombre: "A" }], ["h1", "h2", "h3"].map(id => E(id, "habito", ["a"], 2)));
    const s = ses({ medidas: medidas(80, 97, 37.8) });
    const t = M.recomendar(s, R.evaluar(s), ["a"]).tarjetas[0];
    const info = M.noLoEncuentro(t.entrada, M.perfil(s, null), null);
    assert.equal(info.sinCambio, true);
    assert.match(M.textoNoLoEncuentro(info, "voz"), /suero/i);
  });
});

describe("3 · la voz y la hoja dicen los avisos de las alternativas", () => {
  test("3a: voz y hoja: avisos de cada alternativa y el pie de planta", () => {
    usar([{ id: "a", nombre: "A" }], [
      E("te", "planta", ["a"], 1, { nombre: "Té de manzanilla", alternativas: ["menta", "comer"], excluir: libre({ edad_minima: 12 }) }),
      E("menta", "planta", ["a"], 1, { nombre: "Hierbabuena", aviso: "No es el poleo.", excluir: libre({ edad_minima: 12 }) }),
      E("comer", "habito", ["a"], 2, { nombre: "Comer despacio", avisos_medicina: { presion: "No la tomes con tu pastilla." } })]);
    const p = per({ medicinas: ["presion"] });
    const info = M.noLoEncuentro("te", p, "a");
    const voz = M.textoNoLoEncuentro(info, "voz"); const hoja = M.textoNoLoEncuentro(info, "hoja");
    for (const [modo, t] of [["voz", voz], ["hoja", hoja]]) {
      assert.match(t, /No es el poleo\./, modo);
      assert.match(t, /No la tomes con tu pastilla\./, modo);
      assert.match(t, /Si no consigues Té de manzanilla, puedes probar con:/, modo);
    }
    assert.ok(voz.includes(TR.planta_pie), "la voz dice el pie de planta de la alternativa");
    assert.match(voz, /Hierbabuena: como menta/);
  });
});

describe("4 · hoja impresa (M2)", () => {
  const temas = [
    { id: "sit1", nombre: "Sit 1", clase: "situacion" }, { id: "sit2", nombre: "Sit 2", clase: "situacion" }, { id: "mol", nombre: "Mol", clase: "molestia" }
  ];
  const ent = () => [...["s1a", "s1b", "s1c"].map(id => E(id, "habito", ["sit1"], 3)), ...["s2a", "s2b", "s2c"].map(id => E(id, "alimento", ["sit2"], 2)),
    ...["m1", "m2", "m3"].map(id => E(id, "habito", ["mol"], 2))];
  test("4a: al menos la mejor tarjeta de CADA sección elegida; primero las molestias", () => {
    usar(temas, ent());
    const s = ses({ categorias: ["sit1", "sit2", "mol"] });
    const rec = M.recomendar(s, R.evaluar(s), s.categorias);
    const hoja = M.paraHoja(rec, s.categorias);
    for (const tm of ["sit1", "sit2", "mol"]) assert.ok(hoja.some(t => t.tema === tm), tm + ": " + hoja.map(t => t.entrada.id).join(","));
    assert.equal(hoja[0].tema, "mol", "primero la molestia elegida");
    assert.ok(hoja.length <= M.MAX_HOJA);
    assert.equal(hoja.length, new Set(hoja.map(t => t.entrada.id)).size);
  });
  test("4b: con fiebre, la hidratación va en la hoja junto con una de cada sección", () => {
    usar(temas, ent());
    const s = ses({ categorias: ["sit1", "sit2", "mol"], medidas: medidas(80, 97, 38) });
    const hoja = M.paraHoja(M.recomendar(s, R.evaluar(s), s.categorias), s.categorias);
    assert.equal(hoja[0].entrada.id, "senal_hidratacion");
    for (const tm of ["sit1", "sit2", "mol"]) assert.ok(hoja.some(t => t.tema === tm), tm);
  });
  test("4d: la hoja puede omitir una tarjeta de señal que ya dice otra línea (el control prenatal)", () => {
    usar(temas, ent());
    const s = ses({ embarazo: true, embarazoOpcion: "si", categorias: ["mol"] });
    const rec = M.recomendar(s, R.evaluar(s), s.categorias);
    assert.ok(M.paraHoja(rec, s.categorias).some(t => t.entrada.id === "senal_prenatal"));
    const sin = M.paraHoja(rec, s.categorias, { omitir: ["senal_prenatal"] });
    assert.ok(!sin.some(t => t.entrada.id === "senal_prenatal") && sin.some(t => t.tema === "mol"));
  });
  test("4c: el título dice el número real", () => {
    assert.equal(M.tituloHoja(2), "Tus 2 ideas");
    assert.equal(M.tituloHoja(1), "Tu idea");
    assert.equal(M.tituloHoja(5), "Tus 5 ideas");
  });
});

describe("5 · actividad física (criterio 11)", () => {
  test("5a: si hay actividad apta, la selección la incluye aunque ya haya 2 hábitos (cambia el último hábito que no es ancla)", () => {
    usar([{ id: "a", nombre: "A", clase: "molestia" }], [
      E("h1", "habito", ["a"], 3), E("h2", "habito", ["a"], 3), E("c1", "alimento", ["a"], 2), E("c2", "alimento", ["a"], 2),
      E("mover", "habito", ["a"], 1, { actividad: true })]);
    const v = ids(ses(), ["a"]);
    assert.ok(v.includes("mover"), v.join(","));
    assert.equal(v[0], "h1", "la primera (mejor evidencia) no se toca");
    assert.ok(!v.includes("h2"), "cambia el último hábito: " + v.join(","));
    assert.equal(v.length, 4);
  });
  test("5b: no cambia un ancla de seguridad (lavarse las manos, agua segura, vacunas, suero oral) ni la primera", () => {
    usar([{ id: "a", nombre: "A", clase: "situacion" }], [
      E("vacunas_cartilla", "habito", ["a"], 3, { sin_cambio: true }), E("lavar_manos", "habito", ["a"], 3, { sin_cambio: true }), E("c1", "alimento", ["a"], 2),
      E("mover", "habito", ["a"], 1, { actividad: true })]);
    const v = ids(ses(), ["a"]);
    assert.ok(v.includes("vacunas_cartilla") && v.includes("lavar_manos") && v.includes("mover"), v.join(","));
    assert.equal(v.length, 3);
  });
  test("5e: un hábito sin_cambio que NO es ancla de seguridad sí se puede cambiar por la actividad", () => {
    usar([{ id: "a", nombre: "A", clase: "molestia" }], [
      E("h1", "habito", ["a"], 3), E("menos_sal", "habito", ["a"], 3, { sin_cambio: true }), E("c1", "alimento", ["a"], 2), E("c2", "alimento", ["a"], 2),
      E("mover", "habito", ["a"], 1, { actividad: true })]);
    const v = ids(ses(), ["a"]);
    assert.ok(v.includes("mover") && !v.includes("menos_sal"), v.join(","));
  });
  test("5c: si la sección no tiene actividad apta para la edad, no se fuerza nada", () => {
    usar([{ id: "a", nombre: "A" }], [E("h1", "habito", ["a"], 3), E("h2", "habito", ["a"], 3), E("mover", "habito", ["a"], 1, { actividad: true, excluir: libre({ edad_minima: 60 }) })]);
    igual(ids(ses(), ["a"]), ["h1", "h2"]);
  });
  test("5d: si cabe, la actividad se agrega sin quitar nada", () => {
    usar([{ id: "a", nombre: "A" }], [E("h1", "habito", ["a"], 3), E("c1", "alimento", ["a"], 2), E("mover", "habito", ["a"], 1, { actividad: true })]);
    igual(ids(ses(), ["a"]), ["h1", "c1", "mover"]);
  });
});

describe("decisiones de diseño (2026-11-02)", () => {
  test("D2: las alternativas salen SOLO de la lista `alternativas` (sin relleno del mismo tema)", () => {
    usar([{ id: "a", nombre: "A" }], [E("juego", "habito", ["a"], 3, { alternativas: ["caminar", "planta_x"] }), E("caminar", "habito", ["a"], 2),
      E("planta_x", "planta", ["a"], 2, { excluir: libre({ edad_minima: 18 }) }), E("tortilla", "alimento", ["a"], 3), E("lavar", "habito", ["a"], 3)]);
    igual(M.alternativas("juego", per()).map(a => a.id), ["caminar", "planta_x"]);
    igual(M.alternativas("juego", per({ paraQuien: "nino", grupo: "nino", edadNino: "6a11", embarazoOpcion: null })).map(a => a.id), ["caminar"], "la planta no es apta y no se rellena con tortilla ni lavar");
    const info = M.noLoEncuentro("juego", per({ paraQuien: "nino", grupo: "nino", edadNino: "6a11", embarazoOpcion: null }), "a");
    assert.equal(info.sinCambio, false);
    usar([{ id: "a", nombre: "A" }], [E("solo", "alimento", ["a"], 2, { alternativas: ["p"], si_no_hay: "Si no hay, usa la planta p." }), E("p", "planta", ["a"], 2, { excluir: libre({ edad_minima: 18 }) }), E("otra", "alimento", ["a"], 2)]);
    const sin = M.noLoEncuentro("solo", per({ paraQuien: "nino", grupo: "nino", edadNino: "6a11", embarazoOpcion: null }), "a");
    assert.equal(sin.sinCambio, true);
    assert.doesNotMatch(M.textoNoLoEncuentro(sin, "voz"), /planta p|lo que más ayuda/, "sin alternativas aptas no lee un si_no_hay que nombra algo que no le toca");
  });
  test("D3: «mismo remedio» por nombre científico o lista explícita, no por prefijo del id", () => {
    usar([{ id: "a", nombre: "A" }], [E("agua", "habito", ["a"], 2, { alternativas: ["agua_segura", "otra"] }), E("agua_segura", "habito", ["a"], 3), E("otra", "alimento", ["a"], 2),
      E("manzanilla", "planta", ["a"], 1, { excluir: libre({ edad_minima: 12 }) }), E("manzanilla_piel", "planta", ["a"], 1, { excluir: libre({ edad_minima: 12 }) })]);
    assert.equal(M.mismoRemedio(M.porId("agua"), M.porId("agua_segura")), false);
    assert.equal(M.mismoRemedio(M.porId("manzanilla"), M.porId("manzanilla_piel")), true);
    assert.ok(M.alternativas("agua", per()).some(a => a.id === "agua_segura"));
  });
  test("D5: sin aviso automático del control prenatal en el suero oral, ni repetido si el «cómo» ya lo dice", () => {
    usar([{ id: "a", nombre: "A" }], [E("suero_oral", "suplemento", ["a"], 3, { excluir: libre({ edad_minima: 0 }), cuanto_ninos: "x" }),
      E("acido", "suplemento", ["a"], 3, { como: "Tómalo como te lo indiquen en tu control prenatal.", excluir: libre({ edad_minima: 12 }) }),
      E("otro_sup", "suplemento", ["a"], 2, { excluir: libre({ edad_minima: 18 }) })]);
    const emb = per({ embarazo: true, embarazoOpcion: "si" });
    const prenatal = (id) => M.avisosPara(M.porId(id), emb).some(a => /control prenatal/.test(a));
    assert.equal(prenatal("suero_oral"), false);
    assert.equal(prenatal("acido"), false);
    assert.equal(prenatal("otro_sup"), true);
  });
  test("D7: en una sección de un solo tipo (Dolor de cabeza: solo hábitos) el tope es el de la sección, no 2 por tipo", () => {
    usar([{ id: "cabeza", nombre: "Cabeza", clase: "molestia", tipos_permitidos: ["habito"] }], ["h1", "h2", "h3", "h4", "h5"].map(id => E(id, "habito", ["cabeza"], 2)));
    assert.equal(ids(ses(), ["cabeza"]).length, 4);
    usar([{ id: "m", nombre: "M", clase: "molestia" }], ["h1", "h2", "h3", "h4", "h5"].map(id => E(id, "habito", ["m"], 2)));
    assert.equal(ids(ses(), ["m"]).length, 2, "con varios tipos permitidos sigue el tope de 2 por tipo");
  });
});

describe("6 · edad por grupo (M1)", () => {
  test("6a: edad_minima con el límite inferior y edad_maxima con el superior del grupo", () => {
    usar([{ id: "a", nombre: "A" }], [
      E("pasta_3a6", "habito", ["a"], 2, { excluir: libre({ edad_minima: 3, edad_maxima: 7 }) }),
      E("juego_1a5", "habito", ["a"], 2, { excluir: libre({ edad_minima: 1, edad_maxima: 6 }) }),
      E("bebe_0a1", "habito", ["a"], 2, { excluir: libre({ edad_minima: 0, edad_maxima: 1 }) }),
      E("bebe_0a2", "habito", ["a"], 2, { excluir: libre({ edad_minima: 0, edad_maxima: 2 }) }),
      E("joven", "habito", ["a"], 2, { excluir: libre({ edad_minima: 12, edad_maxima: 18 }) })]);
    const nino = (en) => per({ paraQuien: "nino", grupo: "nino", edadNino: en, embarazoOpcion: null });
    const apta = (id, p) => M.apta(M.porId(id), p);
    assert.equal(apta("pasta_3a6", nino("6a11")), false, "a un niño de 11 años no le sale algo para 3 a 6");
    assert.equal(apta("pasta_3a6", nino("2a5")), false, "a uno de 2 tampoco (límite inferior)");
    assert.equal(apta("juego_1a5", nino("2a5")), true);
    assert.equal(apta("juego_1a5", nino("6a11")), false);
    assert.equal(apta("bebe_0a1", nino("menos2")), false, "«menos de 2 años» incluye al de 1 año y medio");
    assert.equal(apta("bebe_0a2", nino("menos2")), true);
    assert.equal(apta("joven", per({ grupo: "12a17" })), true);
    assert.equal(apta("joven", per({ grupo: "18a59" })), false);
    assert.equal(nino("6a11").edad, 6, "edad sigue siendo el límite inferior");
    assert.equal(nino("6a11").edadMax, 11.99);
    assert.equal(per({ grupo: "60mas", embarazoOpcion: null }).edadMax, Infinity);
  });
});

describe("7 · secciones que no tocan y «dando pecho»", () => {
  test("7a: ocultar_si: [\"embarazo\"] oculta la sección a la embarazada (y no la sugiere)", () => {
    const tres = (tm) => ["1", "2", "3"].map(n => E(tm + n, "habito", [tm], 2));
    usar([{ id: "colicos", nombre: "Cólicos", clase: "molestia", grupo: "g", ocultar_si: ["embarazo"] }, { id: "otra", nombre: "Otra", clase: "molestia", grupo: "g" }],
      [...tres("colicos"), ...tres("otra")]);
    const vis = (c) => M.seccionesVisibles(per(c)).map(t => t.id);
    assert.ok(vis().includes("colicos"));
    assert.ok(!vis({ embarazo: true, embarazoOpcion: "si" }).includes("colicos"));
    assert.ok(vis({ embarazo: true, embarazoOpcion: "si" }).includes("otra"));
    assert.ok(vis({ embarazoOpcion: "lactancia", lactancia: true }).includes("colicos"));
  });
  test("7b: el encabezado de las ideas dice «dando pecho»", () => {
    usar([{ id: "a", nombre: "A" }], ["1", "2", "3"].map(n => E("a" + n, "habito", ["a"], 2)));
    assert.match(M.encabezado(M.perfil(ses({ embarazoOpcion: "lactancia", lactancia: true }), R.evaluar(ses()))), /estás dando pecho/);
    assert.match(M.encabezado(M.perfil(ses({ paraQuien: "otra", embarazoOpcion: "lactancia", lactancia: true }), R.evaluar(ses()))), /está dando pecho/);
    assert.doesNotMatch(M.encabezado(M.perfil(ses(), R.evaluar(ses()))), /pecho/);
  });
});

describe("10 · quiosco: «Leer cada pantalla» encendido por defecto en Electron", () => {
  const voz = (antes) => cargar(["js/voz.js"], { corpus: "fixture", antes }).MediBotVoz;
  test("10a: en el navegador queda apagado; en la app de escritorio, encendido", () => {
    assert.equal(voz().siempre, false);
    assert.equal(voz((ctx) => { ctx.medibotEscritorio = { esApp: true }; }).siempre, true);
  });
  test("10b: si el operador lo apagó a propósito, se respeta", () => {
    const guardado = { "medibot.voz": "0" };
    const ls = { getItem: (k) => (k in guardado ? guardado[k] : null), setItem: () => {} };
    assert.equal(voz((ctx) => { ctx.medibotEscritorio = { esApp: true }; ctx.localStorage = ls; }).siempre, false);
  });
  test("10c: la voz no repite «Listo. Listo.»", () => {
    const V = voz();
    assert.equal(V.sinRepetir("Listo.", "Listo. Si quieres, súbete a la báscula."), "Listo. Si quieres, súbete a la báscula.");
    assert.equal(V.sinRepetir("Elegiste: Para mí.", "¿Tienes 60 años o más?"), "Elegiste: Para mí. ¿Tienes 60 años o más?");
  });
});

describe("11 · lint (criterio 14)", () => {
  const PRIMERO = [
    ["Withania somnifera (L.) Dunal", "Ashwagandha", "suplemento"], ["Digitalis purpurea", "Digital", "planta"],
    ["Aconitum napellus", "Acónito", "planta"], ["Atropa belladonna", "Belladona", "planta"], ["Pausinystalia yohimbe", "Yohimbe", "suplemento"],
    ["Conium maculatum", "Cicuta", "planta"], ["Mandragora officinarum", "Mandrágora", "planta"], ["Thuja occidentalis", "Tuya", "planta"]
  ];
  const tmp = mkdtempSync(join(tmpdir(), "medibot-lint-"));
  const lint = (entradasExtra, temasExtra = []) => {
    const base = readFileSync(join(RAIZ, "tests/fixtures/corpus_min.js"), "utf8");
    const m = base.match(/window\.MediBotData\.corpus\s*=\s*(\{[\s\S]*\})\s*;\s*$/);
    const c = JSON.parse(m[1]);
    // La salvia del fixture es una trampa a propósito para el motor (leyenda_embarazo sin excluir.embarazo); aquí se corrige
    for (const e of c.entradas) if (e.id === "salvia") e.excluir.embarazo = true;
    c.entradas.push(...entradasExtra); c.temas.push(...temasExtra);
    const ruta = join(tmp, "corpus.js");
    writeFileSync(ruta, "window.MediBotData = window.MediBotData || {};\nwindow.MediBotData.corpus = " + JSON.stringify(c, null, 1) + ";\n", "utf8");
    const r = spawnSync("python", [join(RAIZ, "tools/lint_contenido.py"), "--corpus", ruta], { encoding: "utf8", env: { ...process.env, PYTHONUTF8: "1" } });
    return { codigo: r.status, salida: (r.stdout || "") + (r.stderr || "") };
  };
  const planta = (id, cientifico, nombre, tipo, extra = {}) => ({ id, tipo, nombre, nombre_cientifico: cientifico, temas: ["digestion"], para: "Se usa tradicionalmente para molestias leves.",
    como: "Té.", cuanto_ninos: "No.", ayuda: 1, evidencia: "Uso tradicional.", aviso: "Pregunta antes.", excluir: { embarazo: true, lactancia: true, edad_minima: 18, medicinas: [], condiciones: [] },
    donde: "mercado", costo: 1, alternativas: ["papaya", "comer_despacio"], si_no_hay: "Si no hay, come despacio.", fuentes: [{ nombre: "x", url: "https://example.org" }], ...extra });

  test("11a: el fixture (con la salvia corregida) pasa el lint", () => { const r = lint([]); assert.equal(r.codigo, 0, r.salida); });
  test("11b: la lista del Art. PRIMERO tiene sus 76 fracciones y detecta Withania, Digitalis y otras", () => {
    const fuente = readFileSync(join(RAIZ, "tools/lint_contenido.py"), "utf8");
    assert.match(fuente, /ART_PRIMERO\s*=/);
    for (const [ci, nombre, tipo] of PRIMERO) {
      const r = lint([planta("p_" + nombre.toLowerCase().replace(/\W/g, ""), ci, nombre, tipo)]);
      assert.equal(r.codigo, 1, ci);
      assert.match(r.salida, /Art\. PRIMERO/, ci + "\n" + r.salida);
    }
    const nombreSolo = lint([planta("ashw", "", "Ashwagandha en cápsula", "suplemento")]);
    assert.match(nombreSolo.salida, /Art\. PRIMERO/, "por nombre común aunque falte el científico");
    const conteo = spawnSync("python", [join(RAIZ, "tools/lint_contenido.py"), "--contar-primero"], { encoding: "utf8", env: { ...process.env, PYTHONUTF8: "1" } });
    assert.match(conteo.stdout, /Art\. PRIMERO: 76 fracciones/, conteo.stdout + conteo.stderr);
  });
  test("11c: la manzanilla (Matricaria chamomilla) no es la «matricaria» del Art. PRIMERO", () => {
    const r = lint([]); assert.doesNotMatch(r.salida, /manzanilla: planta prohibida/);
  });
  test("11d: sin_cambio va con alternativas vacía; avisos_perfil, actividad y ocultar_si se revisan", () => {
    const habito = (id, extra) => ({ id, tipo: "habito", nombre: id, temas: ["defensas"], para: "Para todos.", como: "Así.", ayuda: 3, evidencia: "OMS.",
      excluir: { embarazo: false, lactancia: false, edad_minima: 0, medicinas: [], condiciones: [] }, donde: "casa", costo: 1, alternativas: [], si_no_hay: "Pregunta en tu centro de salud.",
      fuentes: [{ nombre: "x", url: "https://example.org" }], ...extra });
    assert.equal(lint([habito("bien", { sin_cambio: true })]).codigo, 0, lint([habito("bien", { sin_cambio: true })]).salida);
    assert.match(lint([habito("mal", { sin_cambio: true, alternativas: ["tomar_agua", "lavarse_manos"] })]).salida, /mal: sin_cambio.*alternativas/);
    assert.match(lint([habito("sin_nada", {})]).salida, /sin_nada: necesita al menos 2 alternativas/);
    assert.match(lint([habito("sc", { sin_cambio: "si" })]).salida, /sc: `sin_cambio` debe ser true o false/);
    assert.match(lint([habito("act", { sin_cambio: true, actividad: 1 })]).salida, /act: `actividad` debe ser true o false/);
    assert.match(lint([habito("ap", { sin_cambio: true, avisos_perfil: { abuelo: "x" } })]).salida, /ap: avisos_perfil con rasgo desconocido 'abuelo'/);
    assert.match(lint([habito("ap2", { sin_cambio: true, avisos_perfil: { nino: "Con anticoagulante." } })]).salida, /ap2\.avisos_perfil\.nino: palabra difícil/);
    assert.match(lint([], [{ id: "t_mal", nombre: "T", dibujo: "🧪", ocultar_si: ["embarazada"] }]).salida, /t_mal: ocultar_si con valor desconocido 'embarazada'/);
    assert.equal(lint([], [{ id: "t_bien", nombre: "T", dibujo: "🧪", ocultar_si: ["embarazo"] }]).codigo, 0);
  });
  test("cleanup", () => { rmSync(tmp, { recursive: true, force: true }); });
});

describe("criterio 11 · corpus real: la actividad por edad sale en su sección", () => {
  const ctx = cargar([], { corpus: "real" });
  const MR = ctx.MediBotRecomendaciones; const RR = ctx.MediBotReglas;
  const casos = [
    ["niño de 2 a 5 años en Niñas y niños", { paraQuien: "nino", grupo: "nino", edadNino: "2a5" }, "ninos", ["jugar_1a4"]],
    ["bebé (menos de 2 años) en Niñas y niños", { paraQuien: "nino", grupo: "nino", edadNino: "menos2" }, "ninos", ["mover_bebe"]],
    ["persona mayor en Persona mayor", { grupo: "60mas" }, "mayores", ["equilibrio_mayores", "moverse_sentado"]],
    ["embarazada en Embarazo y dar pecho", { grupo: "18a59", embarazo: true, embarazoRespondido: true, embarazoOpcion: "si" }, "embarazo", ["mover_embarazo"]]
  ];
  for (const [nombre, c, tema, esperadas] of casos) test(`C11: ${nombre} recibe ${esperadas.join(" o ")}`, () => {
    const s = sesionBase(ctx, { medicinas: ["ninguna"], ...c, medidas: medidas(80, 97) });
    const lista = MR.recomendar(s, RR.evaluar(s), [tema]).tarjetas.filter(t => t.tema === tema).map(t => t.entrada.id);
    assert.ok(esperadas.some(id => lista.includes(id)), lista.join(","));
  });
});
