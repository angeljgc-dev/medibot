// Ronda 3 (2026-11-02): parte del motor de los criterios 58, 64 y 73.
// Casos encontrados en pruebas (Juana embarazada: la hoja traía «Caminar o moverte» de adultos y dejaba fuera
// «Moverte en el embarazo»; suero oral en ámbar con «Antes de tomarlo, pregúntalo en tu centro de salud»; «Tés o agua al
// bebé antes de los 6 meses» a un niño de 2 a 5 años; «Té de ruda» en Embarazo con calor en la panza y baño tibio, que
// son de cólicos).
//   58: paraHoja(rec, categorias, { omitir, aceptadas }) recorta dejando primero las ideas de la situación de la persona
//       (embarazo, niño, persona mayor) y las que aceptó; en el embarazo, la actividad del embarazo va antes que la
//       genérica de adultos. vaEnHoja(tarjeta, rec, categorias, opciones) dice si una idea va en la hoja.
//   64: suero oral (entradas con `rehidratacion: true`): ningún aviso que retrase tomarlo (ámbar, «No sé», embarazo);
//       en su aviso, las señales para ir hoy.
//   73: «Cuidado con esto»: te_agua_bebe a menores de 2 años y a quien da pecho; ruda en Embarazo con alternativas del
//       embarazo.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { cargar, sesionBase, valida } from "./cargar.mjs";

const plano = (x) => JSON.parse(JSON.stringify(x));
const igual = (a, b, m) => assert.deepEqual(plano(a), plano(b), m);
const medidas = (fc, spo2, temp = null) => ({ fc: valida(fc), spo2: valida(spo2), temp: temp == null ? { valor: null, estado: null } : valida(temp) });

const ctx = cargar(["data/cuidado.js"]);
const M = ctx.MediBotRecomendaciones; const R = ctx.MediBotReglas; const D = ctx.MediBotData;
const C = D.corpus;
const porId = (id) => C.entradas.find(e => e.id === id);
const ses = (cambios = {}) => sesionBase(ctx, { grupo: "18a59", embarazoOpcion: "no", medicinas: ["ninguna"], medidas: medidas(75, 98, 36.8), ...cambios });
const juana = (cats) => ses({ embarazo: true, embarazoOpcion: "si", embarazoRespondido: true, categorias: cats });
const nino = (edadNino, cats = []) => ses({ paraQuien: "nino", grupo: "nino", edadNino, embarazoOpcion: null, medidas: medidas(100, 98), categorias: cats });
const rec = (s, temas = s.categorias) => M.recomendar(s, R.evaluar(s), temas);
const ids = (lista) => lista.map(t => t.entrada.id);
const AMBAR = { nivel: "ambar", prisa: null };

/* ================= 58 · la hoja recorta dejando primero la situación y lo aceptado ================= */
// Ideas «de la situación» para la prueba (la misma regla que documenta paraHoja): las de una sección-situación que se le
// sugiere a ESTA persona por embarazo/lactancia, niño o persona mayor, y las que son solo para el embarazo.
const SITUACION = ["embarazo", "lactancia", "nino", "mayor60"];
function deSituacion(t, p) {
  const r = M.rasgos(p); const tema = t.tema ? M.temaDe(t.tema) : null;
  const porTema = !!tema && tema.clase === "situacion" && (tema.sugerir_si || []).some(k => SITUACION.includes(k) && r.has(k));
  return porTema || (p.embarazo && !!t.entrada.solo_embarazo);
}
const clave = (t) => t.entrada.id + "@" + (t.tema || "");

describe("58 · paraHoja: al recortar se quedan primero la situación y lo aceptado", () => {
  test("58a: Juana (embarazada; Embarazo + Cansancio y sangre): «Moverte en el embarazo» va en la hoja y «Caminar o moverte» no", () => {
    for (const cats of [["embarazo", "energia"], ["energia", "embarazo"]]) {
      const s = juana(cats); const r = rec(s);
      assert.ok(ids(r.tarjetas).includes("caminar") && ids(r.tarjetas).includes("mover_embarazo"), "las dos actividades salen en pantalla");
      for (const omitir of [[], ["senal_prenatal"]]) {
        const hoja = M.paraHoja(r, cats, { omitir });
        const lista = ids(hoja).join(",");
        assert.ok(ids(hoja).includes("mover_embarazo"), `${cats} omitir=${omitir}: falta mover_embarazo (${lista})`);
        assert.ok(!ids(hoja).includes("caminar"), `${cats} omitir=${omitir}: la actividad genérica de adultos no va (${lista})`);
        for (const tm of cats) assert.ok(hoja.some(t => t.tema === tm), `${tm} tiene al menos una idea (${lista})`);
        assert.ok(hoja.length <= M.MAX_HOJA && new Set(hoja.map(clave)).size === hoja.length);
      }
    }
  });

  test("58b: Juana: sin el control prenatal, la hoja trae las 3 ideas del embarazo + la mejor de Cansancio y sangre", () => {
    const cats = ["embarazo", "energia"]; const r = rec(juana(cats));
    const hoja = M.paraHoja(r, cats, { omitir: ["senal_prenatal"] });
    igual(ids(hoja).sort(), ["acido_folico", "hierro", "lactancia_6m", "mover_embarazo"]);
    assert.equal(hoja[0].tema, "energia", "el orden de impresión no cambia: primero las molestias, luego las situaciones");
  });

  test("58c: propiedad — si una idea de la situación quedó fuera, todo lo que entró es señal, de la situación o la única de su sección", () => {
    const casos = [
      [juana(["embarazo", "energia"]), {}], [juana(["energia", "diarrea", "embarazo"]), {}],
      [juana(["dolor_cabeza", "diarrea", "embarazo"]), {}],
      [nino("2a5", ["diarrea", "ninos"]), {}], [nino("menos2", ["defensas", "ninos"]), {}], [nino("6a11", ["piel", "ninos"]), {}],
      [ses({ grupo: "60mas", categorias: ["sueno", "mayores"] }), {}], [ses({ grupo: "60mas", categorias: ["huesos_articulaciones", "energia", "mayores"] }), {}],
      [ses({ embarazoOpcion: "lactancia", lactancia: true, categorias: ["digestion", "embarazo"] }), {}]
    ];
    const fallas = [];
    for (const [s, op] of casos) {
      const r = rec(s); const p = r.perfil; const hoja = M.paraHoja(r, s.categorias, op);
      const fuera = r.tarjetas.filter(t => deSituacion(t, p) && !hoja.includes(t));
      if (!fuera.length) continue;
      for (const t of hoja) {
        const unica = hoja.filter(x => x.tema === t.tema).length === 1;
        if (t.tema && !deSituacion(t, p) && !unica) fallas.push(`${s.grupo}/${s.edadNino || ""} ${s.categorias}: entró ${clave(t)} y quedó fuera ${fuera.map(clave)}`);
      }
    }
    igual(fallas, []);
  });

  test("58d: niño de 2 a 5 años (Diarrea + Niñas y niños): las ideas de «Niñas y niños» se quedan antes que las de más de Diarrea", () => {
    const s = nino("2a5", ["diarrea", "ninos"]); const r = rec(s);
    const hoja = M.paraHoja(r, s.categorias);
    const deNinos = r.tarjetas.filter(t => t.tema === "ninos");
    const cupo = M.MAX_HOJA - hoja.filter(t => !t.tema).length - 1; // menos la mejor de Diarrea
    igual(hoja.filter(t => t.tema === "ninos").map(clave), deNinos.slice(0, cupo).map(clave), ids(hoja).join(","));
    assert.equal(hoja.filter(t => t.tema === "diarrea").length, 1, "Diarrea queda con su mejor idea");
  });

  test("58e: persona mayor (Sueño + Persona mayor): las de «Persona mayor» se quedan antes que las de más de Sueño", () => {
    const s = ses({ grupo: "60mas", categorias: ["sueno", "mayores"] }); const r = rec(s);
    const hoja = M.paraHoja(r, s.categorias);
    const deMayores = r.tarjetas.filter(t => t.tema === "mayores");
    assert.equal(hoja.filter(t => t.tema === "sueno").length, 1, ids(hoja).join(","));
    igual(hoja.filter(t => t.tema === "mayores").map(clave), deMayores.slice(0, M.MAX_HOJA - 1).map(clave));
  });

  test("58f: `aceptadas`: una idea que la persona aceptó y que antes quedaba fuera, ahora entra (sin dejar una sección sin idea)", () => {
    const cats = ["diarrea", "digestion", "sueno"]; const s = ses({ categorias: cats }); const r = rec(s);
    const antes = M.paraHoja(r, cats);
    const fuera = r.tarjetas.filter(t => t.tema && !antes.includes(t));
    assert.ok(fuera.length >= 2, "el caso recorta: " + ids(r.tarjetas).join(","));
    const ultima = fuera[fuera.length - 1];
    const con = M.paraHoja(r, cats, { aceptadas: [ultima.entrada.id] });
    assert.ok(con.includes(ultima), `entra la aceptada ${clave(ultima)}: ${ids(con).join(",")}`);
    for (const tm of cats) assert.ok(con.some(t => t.tema === tm), tm);
    assert.ok(con.length <= M.MAX_HOJA);
    igual(M.paraHoja(r, cats, { aceptadas: [] }).map(clave), antes.map(clave), "sin aceptadas = igual que antes");
    // aceptó varias: entran las aceptadas antes que las no aceptadas
    const varias = fuera.slice(-2).map(t => t.entrada.id);
    const hoja2 = M.paraHoja(r, cats, { aceptadas: varias });
    for (const id of varias) assert.ok(ids(hoja2).includes(id), id + ": " + ids(hoja2).join(","));
  });

  test("58g: sin situación ni aceptadas, la hoja es la de siempre (la mejor de cada sección, primero las molestias)", () => {
    const cats = ["diarrea", "digestion", "sueno"]; const r = rec(ses({ categorias: cats }));
    const hoja = M.paraHoja(r, cats);
    igual(hoja.map(t => t.tema), ["diarrea", "digestion", "sueno", "diarrea"]);
    for (const tm of cats) assert.equal(hoja.find(t => t.tema === tm), r.tarjetas.find(t => t.tema === tm), "la primera de " + tm);
  });

  test("58h: vaEnHoja(tarjeta, rec, categorias, opciones) = está en paraHoja (aunque la pantalla recalcule rec)", () => {
    assert.equal(typeof M.vaEnHoja, "function");
    for (const [s, op] of [[juana(["embarazo", "energia"]), { omitir: ["senal_prenatal"] }], [juana(["embarazo", "energia"]), {}],
      [ses({ categorias: ["diarrea", "digestion", "sueno"] }), { aceptadas: ["agua_segura"] }], [nino("2a5", ["diarrea", "ninos"]), {}]]) {
      const r1 = rec(s); const r2 = rec(s); // la pantalla de ideas y la hoja calculan cada una su rec
      const hoja = M.paraHoja(r1, s.categorias, op).map(clave);
      for (const t of r2.tarjetas) assert.equal(M.vaEnHoja(t, r1, s.categorias, op), hoja.includes(clave(t)), clave(t));
      assert.equal(r2.tarjetas.filter(t => M.vaEnHoja(t, r2, s.categorias, op)).length, hoja.length, "cuántas dicen «Va en tu hoja» = las de la hoja");
    }
    assert.equal(M.vaEnHoja(null, rec(ses()), []), false);
    const rojo = { bloqueado: true, tarjetas: [] };
    assert.equal(M.vaEnHoja({ entrada: { id: "x" }, tema: null }, rojo, []), false);
  });

  test("58i: recorteHoja = las mismas ideas de paraHoja en orden de prioridad (la hoja impresa quita desde la última)", () => {
    assert.equal(typeof M.recorteHoja, "function");
    const casos = [[juana(["embarazo", "energia"]), { omitir: ["senal_prenatal"] }], [juana(["embarazo", "energia", "diarrea"]), { omitir: ["senal_prenatal"] }],
      [nino("2a5", ["diarrea", "ninos"]), {}], [ses({ grupo: "60mas", embarazoOpcion: "no_aplica", categorias: ["sueno", "mayor"] }), {}],
      [ses({ categorias: ["diarrea", "digestion", "sueno"] }), { aceptadas: ["agua_segura"] }]];
    for (const [s, op] of casos) {
      const r = rec(s); const p = r.perfil; const hoja = M.paraHoja(r, s.categorias, op); const orden = M.recorteHoja(r, s.categorias, op);
      igual(orden.map(clave).sort(), hoja.map(clave).sort(), "mismas ideas: " + s.categorias);
      // la primera de cada sección va antes que cualquier idea de más
      const primeras = new Set(s.categorias.map(tm => hoja.find(t => t.tema === tm)).filter(Boolean));
      const ultPrimera = Math.max(...orden.map((t, k) => (primeras.has(t) ? k : -1)));
      const priExtra = orden.findIndex(t => t.tema && !primeras.has(t));
      assert.ok(priExtra < 0 || ultPrimera < priExtra, `primeras antes que las de más: ${orden.map(clave)}`);
      // entre las de más, las de la situación antes que las demás
      const extras = orden.filter(t => t.tema && !primeras.has(t));
      const k = extras.findIndex(t => !deSituacion(t, p));
      assert.ok(k < 0 || extras.slice(k).every(t => !deSituacion(t, p)), `de la situación primero: ${extras.map(clave)}`);
    }
    igual(M.recorteHoja({ bloqueado: true, tarjetas: [] }, []), []);
  });
});

/* ================= 64 · suero oral: nada que retrase la rehidratación ================= */
const RETRASA = /antes de tomarlo|pregúntalo|pregunta antes/i;
describe("64 · suero oral sin «pregúntalo antes de tomarlo»; con las señales para ir hoy", () => {
  const perfiles = {
    adulto: ses(), no_se: ses({ medicinas: ["no_se"] }), sin_contestar: ses({ medicinas: [] }),
    embarazada: ses({ embarazo: true, embarazoOpcion: "si" }), prefiero: ses({ embarazoOpcion: "prefiero_no" }),
    lactancia: ses({ embarazoOpcion: "lactancia", lactancia: true }), mayor: ses({ grupo: "60mas", medicinas: ["presion", "corazon"] }),
    nino_2a5: nino("2a5"), bebe: sesionBase(ctx, { paraQuien: "nino", grupo: "bebe", medicinas: ["ninguna"], medidas: medidas(130, 98) }),
    todas_medicinas: ses({ medicinas: M.CLAVES_MEDICINA.slice() })
  };
  // las marcadas y, aunque faltara la marca, el suero oral (la prueba no pasa en vacío)
  const rehidratacion = [...new Set([...C.entradas.filter(e => e.rehidratacion === true), porId("suero_oral")])];

  test("64a: datos: el suero oral está marcado como rehidratación", () => {
    assert.equal(porId("suero_oral").rehidratacion, true, "suero_oral con `rehidratacion: true`");
  });

  test("64b: en verde y en ámbar, con «No sé», sin contestar, embarazo o lactancia: ningún aviso que retrase tomarlo", () => {
    const fallas = [];
    for (const e of rehidratacion) for (const [n, s] of Object.entries(perfiles)) for (const res of [null, AMBAR]) {
      const p = M.perfil(s, res || R.evaluar(s));
      if (!M.apta(e, p)) { fallas.push(`${e.id} no es apta para ${n}`); continue; }
      for (const a of M.avisosPara(e, p)) if (RETRASA.test(a)) fallas.push(`${e.id} ${n} ${res ? "ámbar" : "verde"}: «${a}»`);
    }
    igual(fallas, []);
  });

  test("64c: en su lugar, las señales para ir hoy: vomita, no orina, muy decaído (adulto, niño y bebé)", () => {
    for (const n of ["adulto", "nino_2a5", "bebe", "no_se"]) {
      const p = M.perfil(perfiles[n], AMBAR);
      const t = M.avisosPara(porId("suero_oral"), p).join(" ");
      assert.match(t, /Ve hoy al centro de salud/, n);
      assert.match(t, /vomita/i, n); assert.match(t, /orina muy poco/i, n); assert.match(t, /muy decaído/i, n);
    }
  });

  test("64d: consulta en ámbar (Diarrea): la tarjeta del suero y su «En su lugar» de «Dejar de comer con diarrea» no lo retrasan", () => {
    for (const s of [ses({ medicinas: ["no_se"], categorias: ["diarrea"] }), nino("2a5", ["diarrea"])]) {
      const r = M.recomendar(s, AMBAR, ["diarrea"]);
      const suero = r.tarjetas.find(t => t.entrada.id === "suero_oral");
      assert.ok(suero, "el suero oral sale");
      for (const a of suero.avisos) assert.doesNotMatch(a, RETRASA, a);
      const ayuno = (r.cuidados.diarrea || []).find(x => x.tarjeta.id === "ayuno_diarrea");
      assert.ok(ayuno, "sale «Dejar de comer con diarrea»");
      for (const modo of ["voz", "pantalla", "hoja"]) assert.doesNotMatch(M.textoCuidado(ayuno, modo), RETRASA, modo);
    }
  });

  test("64e: lo demás no cambia: otro suplemento en ámbar sí lleva «pregúntalo en tu centro de salud»", () => {
    const p = M.perfil(perfiles.adulto, AMBAR);
    const otro = C.entradas.find(e => e.tipo === "suplemento" && !e.rehidratacion && M.apta(e, p));
    assert.ok(otro);
    assert.ok(M.avisosPara(otro, p).includes(D.textos.recomendaciones.ambar_suplemento), otro.id);
  });
});

/* ================= 73 · «Cuidado con esto» ================= */
const ninosCuidado = (s) => (rec(s, ["ninos"]).cuidados.ninos || []).map(x => x.tarjeta.id);
describe("73 · «Cuidado con esto»: té y agua al bebé y la ruda en el embarazo", () => {
  test("73a: te_agua_bebe solo a menores de 2 años (y a quien da pecho); no a niños de 2 a 11, adolescentes ni adultos", () => {
    assert.ok(ninosCuidado(nino("menos2")).includes("te_agua_bebe"), "menos de 2 años");
    assert.ok(ninosCuidado(sesionBase(ctx, { paraQuien: "nino", grupo: "bebe", medicinas: ["ninguna"], medidas: medidas(130, 98) })).includes("te_agua_bebe"), "bebé");
    assert.ok(ninosCuidado(ses({ embarazoOpcion: "lactancia", lactancia: true })).includes("te_agua_bebe"), "quien da pecho (decisión: sí)");
    for (const [n, s] of [["2a5", nino("2a5")], ["6a11", nino("6a11")], ["12a17", ses({ paraQuien: "nino", grupo: "12a17" })], ["adulto", ses()], ["mayor", ses({ grupo: "60mas" })]])
      assert.ok(!ninosCuidado(s).includes("te_agua_bebe"), n + ": " + ninosCuidado(s));
  });

  test("73b: caso de prueba (niño de 2 a 5 años en Niñas y niños + Diarrea): no sale «Tés o agua al bebé antes de los 6 meses»", () => {
    const r = rec(nino("2a5"), ["ninos", "diarrea"]);
    const todas = Object.values(r.cuidados).flat().map(x => x.tarjeta.id);
    assert.ok(!todas.includes("te_agua_bebe"), todas.join(","));
  });

  test("73c: ruda para una embarazada (Embarazo): «En su lugar» propio del embarazo, nada de cólicos ni de la regla", () => {
    const r = rec(juana(["embarazo"]));
    const ruda = (r.cuidados.embarazo || []).find(x => x.tarjeta.id === "ruda_te");
    assert.ok(ruda, "sale la ruda en Embarazo");
    assert.ok(ruda.alternativas.length >= 1, "tiene «En su lugar»");
    for (const a of ruda.alternativas) {
      assert.ok((a.entrada.temas || []).includes("embarazo"), "alternativa del embarazo: " + a.entrada.id);
      assert.ok(!["calor_panza", "bano_tibio", "masaje_panza"].includes(a.entrada.id), a.entrada.id);
    }
    for (const modo of ["voz", "pantalla", "hoja"]) {
      const t = M.textoCuidado(ruda, modo);
      assert.doesNotMatch(t, /calor tibio|baño tibio|sobarte|dolor de la regla/i, modo + ": " + t);
    }
  });

  test("73e: datos: `en_su_lugar_por_seccion` nombra secciones de la tarjeta e ids que existen; `edad_maxima_nino` es número", () => {
    for (const c of D.cuidado.tarjetas) {
      for (const [tema, x] of Object.entries(c.en_su_lugar_por_seccion || {})) {
        assert.ok(c.secciones.includes(tema), `${c.id}: ${tema} no es una de sus secciones`);
        assert.ok(Array.isArray(x.en_su_lugar) && x.en_su_lugar.length, `${c.id}.${tema}: en_su_lugar vacío`);
        for (const id of x.en_su_lugar) assert.ok(porId(id), `${c.id}.${tema}: ${id} no existe en el corpus`);
      }
      if ("edad_maxima_nino" in c) assert.equal(typeof c.edad_maxima_nino, "number", c.id);
    }
  });

  test("73d: lo demás no cambia: en Cólicos de la regla la ruda sigue con calor, baño tibio y sobarse", () => {
    const r = rec(ses(), ["colicos"]);
    const ruda = (r.cuidados.colicos || []).find(x => x.tarjeta.id === "ruda_te");
    assert.ok(ruda);
    igual(ruda.alternativas.map(a => a.entrada.id), ["calor_panza", "bano_tibio", "masaje_panza"]);
  });
});
