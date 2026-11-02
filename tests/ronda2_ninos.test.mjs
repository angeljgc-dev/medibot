// Ronda de correcciones, criterio 40: contenido para niños.
// En pruebas, la consulta de Juana para su hijo de 2 a 5 años mostraba «Si roncas fuerte…», «Si tienes los
// riñones mal…», la Línea de la Vida en Sueño, tarjetas de ashwagandha y toloache, y la sección «Presión y corazón».
// Corte de edad: «menor» = la persona tiene menos de 12 años (grupos «bebe» y «nino»), el mismo corte que ya usa el motor
// (dosis para niños, rasgo «nino» de «Cuidado con esto»). De 12 a 17 sí se muestran (criterio 40).
// Campos nuevos: `cuando_ir.edad_minima` (franja entera de adulto), `cuando_ir.texto_no_ninos` (frases exactas del texto
// que no van a menores), `edad_minima` en tarjetas de cuidado y `aviso_no_ninos` (frases exactas del `aviso` que no se
// muestran a menores de 12). requiereLeyenda(entrada).
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { cargar, sesionBase, valida } from "./cargar.mjs";

const plano = (x) => JSON.parse(JSON.stringify(x));
const igual = (a, b, m) => assert.deepEqual(plano(a), plano(b), m);
const medidas = (fc, spo2, temp = null) => ({ fc: valida(fc), spo2: valida(spo2), temp: temp == null ? { valor: null, estado: null } : valida(temp) });

const ctx = cargar(["data/cuidado.js"]);
const M = ctx.MediBotRecomendaciones; const R = ctx.MediBotReglas; const D = ctx.MediBotData;
const C = D.corpus;
const nino = (edadNino, cambios = {}) => sesionBase(ctx, { paraQuien: "nino", grupo: "nino", edadNino, embarazoOpcion: null, medicinas: ["ninguna"], medidas: medidas(100, 98), ...cambios });
const bebe = () => sesionBase(ctx, { paraQuien: "nino", grupo: "bebe", edadNino: null, embarazoOpcion: null, medicinas: ["ninguna"], medidas: medidas(130, 98) });
const adolescente = (cambios = {}) => sesionBase(ctx, { paraQuien: "nino", grupo: "12a17", embarazoOpcion: "no", medicinas: ["ninguna"], medidas: medidas(80, 98), ...cambios });
const adulto = (cambios = {}) => sesionBase(ctx, { grupo: "18a59", embarazoOpcion: "no", medicinas: ["ninguna"], medidas: medidas(72, 97), ...cambios });
const rec = (s, temas) => M.recomendar(s, R.evaluar(s), temas);
const per = (s) => M.perfil(s, R.evaluar(s));
const NINOS = ["menos2", "2a5", "6a11"];
const TODOS_TEMAS = C.temas.map(t => t.id);
// Textos que solo aplican a adultos y adolescentes (lista del criterio 40)
const ADULTO_AVISO = /riñ[oó]n|roncas|hacerte daño|no estar vivo|L[ií]nea de la Vida|tomes poca agua|presi[oó]n alta|tu pastilla/i;
const ADULTO = new RegExp(ADULTO_AVISO.source + "|si estás embarazada|te ca[ií]ste|la regla|el pecho que puede pasar al brazo|herida en el pie", "i"); // franjas
const porId = (id) => C.entradas.find(e => e.id === id);

describe("40.1 · `cuando_ir` y avisos de adultos no salen a menores de 12", () => {
  test("40.1a: consulta de Juana (2 a 5 años, Niños + Sueño + Diarrea): Sueño sin ideación suicida ni Línea de la Vida", () => {
    const r = rec(nino("2a5"), ["ninos", "sueno", "diarrea"]);
    igual(r.franjas.map(f => f.tema), ["ninos", "sueno", "diarrea"]);
    for (const f of r.franjas) assert.doesNotMatch(f.texto, ADULTO, f.tema);
    // lo que sí aplica a un niño se queda: dormir mal semanas o andar triste → centro de salud
    assert.equal(r.franjas[1].texto, "Si llevas semanas durmiendo mal y no mejoras al cambiar tus hábitos, o si llevas 2 semanas o más triste, sin ganas de nada o muy preocupado, ve a tu centro de salud: ahí te pueden orientar y apoyar. Si hay peligro inmediato, llama al 911."); // decisión de diseño: el 911 se queda para todas las edades
  });

  test("40.1b: a ningún menor de 12 le sale texto de adulto en ninguna franja; Corazón, Embarazo, Mayores y Cólicos no salen", () => {
    for (const s of [...NINOS.map(n => nino(n)), bebe()]) {
      const r = rec(s, TODOS_TEMAS);
      igual(r.franjas.map(f => f.tema).sort(), ["azucar_peso", "boca", "diarrea", "dolor_cabeza", "ninos", "piel", "sueno"], s.grupo + " " + s.edadNino);
      for (const f of r.franjas) assert.doesNotMatch(f.texto, ADULTO, `${s.edadNino} ${f.tema}: ${f.texto}`);
      for (const f of r.franjas) assert.ok(f.texto.length > 40 && /[.!?]$/.test(f.texto), "sin quedar vacía ni cortada: " + f.tema);
    }
  });

  test("40.1c: de 12 a 17 y en adultos las franjas no cambian (Sueño con la Línea de la Vida, Embarazo, Corazón)", () => {
    for (const s of [adolescente(), adulto()]) {
      const r = rec(s, ["sueno", "embarazo", "corazon", "mayores", "colicos"]);
      igual(r.franjas.map(f => f.tema), ["sueno", "embarazo", "corazon", "mayores", "colicos"], s.grupo);
      for (const f of r.franjas) assert.equal(f.texto, C.temas.find(t => t.id === f.tema).cuando_ir.texto, "texto completo, sin recortar");
    }
    assert.match(rec(adolescente(), ["sueno"]).franjas[0].texto, /Línea de la Vida/);
  });

  test("40.1d: J30: en las ideas del niño no sale «Si roncas…» ni «Si tienes los riñones mal…»", () => {
    const r = rec(nino("2a5"), ["ninos", "sueno", "diarrea"]);
    const todos = [...r.tarjetas.flatMap(t => t.avisos), ...Object.values(r.cuidados).flat().flatMap(x => x.alternativas.flatMap(a => a.avisos))];
    for (const a of todos) assert.doesNotMatch(a, ADULTO_AVISO, a);
    const suero = r.tarjetas.find(t => t.entrada.id === "suero_oral");
    assert.ok(suero, "el suero oral sí sale");
    assert.ok(suero.avisos.some(a => /no lo sustituyen/.test(a) && /es un bebé/.test(a)), "lo que sí aplica al niño se queda: " + suero.avisos.join(" | "));
  });

  test("40.1e: a ningún menor de 12 le sale un aviso de adulto en ninguna entrada apta (ideas, «No lo encuentro», «En su lugar»)", () => {
    for (const s of [...NINOS.map(n => nino(n)), bebe()]) {
      const p = per(s);
      const fallas = [];
      for (const e of C.entradas.filter(e => M.apta(e, p))) for (const a of M.avisosPara(e, p)) if (ADULTO_AVISO.test(a)) fallas.push(`${e.id}: ${a}`);
      igual(fallas, [], s.grupo + " " + s.edadNino);
    }
  });

  test("40.1f: adultos y adolescentes ven el aviso completo, igual que antes (el texto curado no se borra)", () => {
    for (const s of [adulto(), adolescente()]) {
      const p = per(s);
      for (const id of ["suero_oral", "dormir_misma_hora", "agua", "caldo", "platano", "descanso_liquidos", "calor_cuidado"]) {
        const e = porId(id);
        assert.ok(M.avisosPara(e, p).includes(e.aviso), `${s.grupo} ${id}`);
      }
    }
  });

  test("40.1g: datos: cada frase de `aviso_no_ninos` está tal cual en su `aviso` (si no, la marca quedó vieja)", () => {
    const marcadas = C.entradas.filter(e => e.aviso_no_ninos !== undefined);
    assert.ok(marcadas.length >= 5, "hay entradas marcadas");
    for (const e of marcadas) {
      assert.ok(Array.isArray(e.aviso_no_ninos) && e.aviso_no_ninos.length, e.id);
      for (const frase of e.aviso_no_ninos) assert.ok(typeof frase === "string" && frase && (e.aviso || "").includes(frase), `${e.id}: «${frase}»`);
    }
    for (const t of C.temas.filter(t => t.cuando_ir && t.cuando_ir.edad_minima !== undefined)) assert.equal(typeof t.cuando_ir.edad_minima, "number", t.id);
    const conFrases = C.temas.filter(t => t.cuando_ir && t.cuando_ir.texto_no_ninos !== undefined);
    assert.ok(conFrases.length >= 3, "hay franjas con frases marcadas");
    for (const t of conFrases) {
      assert.ok(Array.isArray(t.cuando_ir.texto_no_ninos) && t.cuando_ir.texto_no_ninos.length, t.id);
      for (const frase of t.cuando_ir.texto_no_ninos) assert.ok(typeof frase === "string" && frase && t.cuando_ir.texto.includes(frase), `${t.id}: «${frase}»`);
    }
  });

  test("40.1h: «Cuidado con esto»: ni ashwagandha ni toloache ni ruda a menores de 12; sí de 12 a 17 y adultos", () => {
    const SOLO_12 = ["ashwagandha", "toloache", "ruda_te"];
    for (const s of [...NINOS.map(n => nino(n)), bebe()]) {
      const r = rec(s, ["sueno", "energia", "embarazo"]);
      const ids = Object.values(r.cuidados).flat().map(x => x.tarjeta.id);
      for (const id of SOLO_12) assert.ok(!ids.includes(id), `${s.grupo} ${s.edadNino}: ${ids.join(",")}`);
    }
    const ids = (s, temas) => Object.values(rec(s, temas).cuidados).flat().map(x => x.tarjeta.id);
    assert.ok(ids(adolescente(), ["sueno"]).includes("toloache"));
    assert.ok(ids(adolescente(), ["energia"]).includes("ashwagandha"));
    igual(ids(adulto(), ["sueno"]), ["toloache", "ashwagandha"], "adulto: igual que antes");
    // lo que sí aplica al niño se queda (greta, epazote, ayuno con diarrea)
    const r = rec(nino("2a5"), ["digestion", "diarrea"]).cuidados;
    igual({ digestion: r.digestion.map(x => x.tarjeta.id), diarrea: r.diarrea.map(x => x.tarjeta.id) }, { digestion: ["greta_azarcon", "epazote_te"], diarrea: ["ayuno_diarrea"] });
  });
});

describe("40.2 · plantas y suplementos con edad_minima mayor que la del niño", () => {
  test("40.2a: ni como alternativa («No lo encuentro», alternativas()) ni en «En su lugar»: nada por debajo de su edad_minima", () => {
    for (const n of NINOS) {
      const p = per(nino(n));
      const fallas = [];
      const revisa = (donde, e) => { const min = (e.excluir || {}).edad_minima; if (typeof min === "number" && p.edad < min) fallas.push(`${donde}: ${e.id} (${min})`); };
      for (const e of C.entradas) {
        for (const t of [null, ...(e.temas || [])]) {
          for (const a of M.alternativas(e.id, p, t)) revisa("alternativas " + e.id, a);
          for (const a of M.noLoEncuentro(e.id, p, t).alternativas) revisa("noLoEncuentro " + e.id, a.entrada);
        }
      }
      for (const x of Object.values(rec(nino(n), TODOS_TEMAS).cuidados).flat()) for (const a of x.alternativas) revisa("en su lugar " + x.tarjeta.id, a.entrada);
      igual(fallas, [], n);
    }
  });

  test("40.2b: tarjetas de cuidado con `edad_minima` (datos armados): no salen por debajo; la siguiente toma su lugar", () => {
    const c = cargar(["data/cuidado.js"]);
    const tarjeta = (id, extra = {}) => ({ id, nombre: id, que_es: "q", por_que_cuidado: "p", en_su_lugar: [], texto_en_su_lugar: "t", secciones: ["sueno"], perfiles: [], fuentes: [], ...extra });
    c.MediBotData.cuidado = { version: "t", fecha: "2026-11-02", tarjetas: [tarjeta("de_adulto", { edad_minima: 12 }), tarjeta("para_todos")] };
    const Mc = c.MediBotRecomendaciones;
    const p = (s) => Mc.perfil(s, null);
    const s6 = sesionBase(c, { paraQuien: "nino", grupo: "nino", edadNino: "6a11", medicinas: ["ninguna"] });
    const s12 = sesionBase(c, { paraQuien: "nino", grupo: "12a17", medicinas: ["ninguna"] });
    igual(Mc.cuidadoSecciones(["sueno"], p(s6)).sueno.map(x => x.tarjeta.id), ["para_todos"]);
    igual(Mc.cuidadoSecciones(["sueno"], p(s12)).sueno.map(x => x.tarjeta.id), ["de_adulto", "para_todos"]);
  });
});

describe("40.3 · leyenda COFEPRIS de suplementos: requiereLeyenda(entrada)", () => {
  test("40.3a: lo que se pide en el centro de salud no la lleva (suero oral, ácido fólico, hierro del control prenatal)", () => {
    assert.equal(typeof M.requiereLeyenda, "function");
    for (const id of ["suero_oral", "acido_folico", "hierro"]) {
      assert.equal(porId(id).donde, "centro_salud", id);
      assert.equal(M.requiereLeyenda(porId(id)), false, id);
    }
  });
  test("40.3b: los demás suplementos sí; comida, hábitos, plantas y nada, no", () => {
    for (const e of C.entradas.filter(e => e.tipo === "suplemento" && e.donde !== "centro_salud")) assert.equal(M.requiereLeyenda(e), true, e.id);
    for (const e of C.entradas.filter(e => e.tipo !== "suplemento")) assert.equal(M.requiereLeyenda(e), false, e.id);
    assert.equal(M.requiereLeyenda({ tipo: "suplemento", donde: "farmacia" }), true);
    assert.equal(M.requiereLeyenda({ tipo: "suplemento", donde: "centro_salud" }), false);
    for (const x of [null, undefined, {}, "suero_oral"]) assert.equal(M.requiereLeyenda(x), false, String(x));
  });
});

describe("40.4 · «Presión y corazón» oculta para niños", () => {
  test("40.4a: no se ve ni se sugiere a menores de 12 (bebé y niño, aunque tome medicina para la presión)", () => {
    assert.ok(C.temas.find(t => t.id === "corazon").ocultar_grupos.includes("nino"));
    for (const s of [...NINOS.map(n => nino(n)), nino("6a11", { medicinas: ["presion"] }), bebe()]) {
      const p = per(s);
      assert.equal(M.visible(M.temaDe("corazon"), p), false, s.grupo + " " + s.edadNino);
      assert.ok(!M.seccionesVisibles(p).some(t => t.id === "corazon"));
      assert.ok(!M.sugeridas(p).includes("corazon"));
    }
  });
  test("40.4b: de 12 a 17 y en adultos sí se ve (decisión: la presión alta también se revisa en adolescentes)", () => {
    for (const s of [adolescente(), adulto()]) assert.equal(M.visible(M.temaDe("corazon"), per(s)), true, s.grupo);
    assert.ok(M.sugeridas(per(adolescente({ medicinas: ["presion"] }))).includes("corazon"));
  });
});

describe("40 · decisión de diseño: en Sueño, el 911 se queda para todas las edades", () => {
  test("40.1i: un perfil de 6 a 11 años con Sueño ve «Si hay peligro inmediato, llama al 911.» y no la frase de ideación", () => {
    const r = rec(nino("6a11"), ["sueno"]);
    const f = r.franjas.find(x => x.tema === "sueno");
    assert.ok(f, "la franja de Sueño sale");
    assert.match(f.texto, /Si hay peligro inmediato, llama al 911\./);
    assert.doesNotMatch(f.texto, /hacerte daño|no estar vivo|L[ií]nea de la Vida/);
  });
});
