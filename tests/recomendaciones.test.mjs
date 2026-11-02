// Pruebas del motor de recomendaciones (js/recomendaciones.js) contra el corpus.
// Se corren contra el fixture (tests/fixtures/corpus_min.js) y, si ya existe, contra el corpus real (data/corpus.js).
// La comprobación de seguridad está escrita aquí de forma independiente al motor (no llama a esSegura).
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { cargar, sesionBase, valida, HAY_CORPUS_REAL } from "./cargar.mjs";

const CORPUS = ["fixture", ...(HAY_CORPUS_REAL ? ["real"] : [])];
const medidas = (fc, spo2, temp = null) => ({ fc: valida(fc), spo2: valida(spo2), temp: temp == null ? { valor: null, estado: null } : valida(temp) });

/** Perfiles de la prueba B1. `edad` y `meds` son lo que la prueba espera que el motor entienda.
    De 12 a 59 años, quien contesta "No" al embarazo lo dice explícito; "Prefiero no decir" (o no contestar) se trata
    como posible embarazo para excluir (igual que "No sé" en medicinas). */
const PERFILES = {
  adulto_sano:    { s: { grupo: "18a59", embarazoOpcion: "no", medicinas: ["ninguna"] }, edad: 18, meds: [] },
  embarazada:     { s: { grupo: "18a59", embarazo: true, embarazoRespondido: true, embarazoOpcion: "si", medicinas: ["ninguna"] }, edad: 18, meds: [], embarazo: true },
  nino_2:         { s: { paraQuien: "nino", grupo: "nino", edadNino: "2a5", medicinas: ["ninguna"] }, edad: 2, meds: [] },
  nino_6:         { s: { paraQuien: "nino", grupo: "nino", edadNino: "6a11", medicinas: ["ninguna"] }, edad: 6, meds: [] },
  adolescente_15: { s: { grupo: "12a17", embarazoOpcion: "no", medicinas: ["ninguna"] }, edad: 12, meds: [] },
  presion:        { s: { grupo: "18a59", embarazoOpcion: "no_aplica", medicinas: ["presion"] }, edad: 18, meds: ["presion"] },
  azucar:         { s: { grupo: "18a59", embarazoOpcion: "no_aplica", medicinas: ["azucar"] }, edad: 18, meds: ["azucar"] },
  anticoagulante: { s: { grupo: "18a59", embarazoOpcion: "no", medicinas: ["anticoagulante"] }, edad: 18, meds: ["anticoagulante"] },
  tiroides:       { s: { grupo: "18a59", embarazoOpcion: "no", medicinas: ["tiroides"] }, edad: 18, meds: ["tiroides"] },
  nervios_sueno:  { s: { grupo: "18a59", embarazoOpcion: "no", medicinas: ["nervios_sueno"] }, edad: 18, meds: ["nervios_sueno"] },
  no_se:          { s: { grupo: "18a59", embarazoOpcion: "no", medicinas: ["no_se"] }, edad: 18, meds: "todas" },
  no_decir:       { s: { grupo: "18a59", embarazoOpcion: "no_decir", medicinas: ["ninguna"] }, edad: 18, meds: [], posible: true },
  lactancia:      { s: { grupo: "18a59", embarazoOpcion: "lactancia", medicinas: ["ninguna"] }, edad: 18, meds: [], lactancia: true },
  adulto_mayor:   { s: { grupo: "60mas", medicinas: ["ninguna"] }, edad: 60, meds: [] }
};
const RESTRINGIDOS = Object.keys(PERFILES).filter(k => k !== "adulto_sano");

/** Comprobación independiente: ¿esta entrada es insegura para este perfil? Devuelve el motivo o null. */
function motivoInseguro(e, p) {
  const ex = e.excluir || {};
  const tipoRiesgo = e.tipo === "planta" || e.tipo === "suplemento";
  if (tipoRiesgo && !e.excluir) return "planta o suplemento sin excluir";
  if ((p.embarazo || p.posible) && (ex.embarazo || e.leyenda_embarazo)) return "embarazo";
  if (p.lactancia && ex.lactancia) return "lactancia";
  if (e.solo_embarazo && !p.embarazo) return "solo embarazo";
  const minima = ex.edad_minima ?? (tipoRiesgo ? 18 : 0);
  if (p.edad < minima) return `edad ${p.edad} < ${minima}`;
  const choca = ex.medicinas || [];
  if (p.meds === "todas" ? choca.length > 0 : choca.some(m => p.meds.includes(m))) return "medicina " + choca.join(",");
  if (p.edad < 12 && tipoRiesgo && !e.cuanto_ninos) return "planta o suplemento sin dosis para niños";
  return null;
}

const resultadoDe = (R, s) => R.evaluar(s);

for (const cual of CORPUS) {
  describe(`motor de recomendaciones · corpus ${cual}`, () => {
    const ctx = cargar([], { corpus: cual });
    const M = ctx.MediBotRecomendaciones;
    const R = ctx.MediBotReglas;
    const corpus = ctx.MediBotData.corpus;
    const temas = corpus ? corpus.temas.map(t => t.id) : [];
    const sesion = (k, extra = {}) => sesionBase(ctx, { ...structuredClone(PERFILES[k].s), categorias: temas, ...extra });
    const enVerde = (k) => { const s = sesion(k, { medidas: medidas(72, 97) }); return { s, r: resultadoDe(R, s) }; };
    const enAmbar = (k) => { const s = sesion(k, { medidas: medidas(72, 92) }); return { s, r: resultadoDe(R, s) }; };

    test("el motor existe y el corpus tiene temas y entradas", () => {
      assert.ok(M, "falta window.MediBotRecomendaciones");
      for (const f of ["perfil", "esSegura", "recomendar", "alternativas", "avisosPara"]) assert.equal(typeof M[f], "function", "falta " + f);
      assert.ok(corpus && corpus.entradas.length > 0 && temas.length > 0);
    });

    test("perfil: edad por grupo, subgrupo de niño, No sé, fiebre desde 37.2", () => {
      assert.equal(M.perfil(sesion("adulto_sano"), null).edad, 18);
      assert.equal(M.perfil(sesion("adulto_mayor"), null).edad, 60);
      assert.equal(M.perfil(sesion("adolescente_15"), null).edad, 12);
      assert.equal(M.perfil(sesion("nino_2"), null).edad, 2);
      assert.equal(M.perfil(sesion("nino_6"), null).edad, 6);
      assert.ok(M.perfil(sesionBase(ctx, { grupo: "nino", edadNino: "menos2" }), null).edad < 2);
      assert.equal(M.perfil(sesion("embarazada"), null).embarazo, true);
      assert.equal(M.perfil(sesion("lactancia"), null).lactancia, true, "«Estoy dando pecho» activa lactancia");
      assert.equal(M.perfil(sesion("no_decir"), null).embarazoPosible, true);
      assert.equal(M.perfil(sesion("adulto_mayor"), null).embarazoPosible, false);
      assert.equal(M.perfil(sesion("no_se"), null).medicinasDesconocidas, true);
      const conFiebre = sesion("adulto_sano", { medidas: medidas(80, 97, 37.2) });
      assert.equal(M.perfil(conFiebre, R.evaluar(conFiebre)).senales.fiebre, true);
      const sinFiebre = sesion("adulto_sano", { medidas: medidas(80, 97, 37.1) });
      assert.equal(M.perfil(sinFiebre, R.evaluar(sinFiebre)).senales.fiebre, false);
    });

    test("B1: ninguna tarjeta ni alternativa insegura para ningún perfil (todo el corpus)", () => {
      const fallas = [];
      for (const [k, p] of Object.entries(PERFILES)) {
        for (const caso of [enVerde(k), enAmbar(k)]) {
          const rec = M.recomendar(caso.s, caso.r, temas);
          for (const t of rec.tarjetas) {
            if (!t.entrada || String(t.entrada.id).startsWith("senal_") || String(t.entrada.id).startsWith("base_")) continue; // tarjetas propias del motor (hidratación, control prenatal)
            const m = motivoInseguro(t.entrada, p);
            if (m) fallas.push(`${k} · tarjeta ${t.entrada.id}: ${m}`);
          }
        }
        const perfil = M.perfil(enVerde(k).s, enVerde(k).r);
        for (const e of corpus.entradas) {
          // el motor y la comprobación independiente deben coincidir en lo inseguro
          if (motivoInseguro(e, p) && M.esSegura(e, perfil) && motivoInseguro(e, p) !== "planta o suplemento sin dosis para niños") fallas.push(`${k} · esSegura(${e.id}) = true y es insegura: ${motivoInseguro(e, p)}`);
          for (const a of M.alternativas(e.id, perfil)) {
            const m = motivoInseguro(a, p);
            if (m) fallas.push(`${k} · alternativa ${a.id} de ${e.id}: ${m}`);
          }
        }
      }
      assert.deepEqual(fallas, []);
    });

    test("B1: a una embarazada nunca le salen plantas con leyenda de embarazo", () => {
      const { s, r } = enVerde("embarazada");
      const ids = M.recomendar(s, r, temas).tarjetas.map(t => t.entrada);
      assert.ok(!ids.some(e => e.leyenda_embarazo || (e.excluir && e.excluir.embarazo)));
    });

    test("B2: dos perfiles con el mismo tema reciben listas distintas", () => {
      const lista = (k, tema) => { const { s, r } = enVerde(k); return M.recomendar(s, r, [tema]).tarjetas.map(t => t.entrada.id).join(","); };
      if (temas.includes("sueno")) assert.notEqual(lista("adulto_sano", "sueno"), lista("embarazada", "sueno"));
      if (temas.includes("defensas")) assert.notEqual(lista("adulto_sano", "defensas"), lista("nino_6", "defensas"));
    });

    test("B3: nivel rojo bloquea: sin plantas ni suplementos", () => {
      const s = sesion("adulto_sano", { medidas: medidas(72, 97) }); s.alarma.pecho = true;
      const r = R.evaluar(s);
      assert.equal(r.nivel, "rojo");
      const rec = M.recomendar(s, r, temas);
      assert.equal(rec.bloqueado, true);
      assert.ok(!rec.tarjetas.some(t => t.entrada.tipo === "planta" || t.entrada.tipo === "suplemento"));
      assert.match(rec.encabezado, /\S/);
    });

    // B4 — especificación cambiada el 2026-11-02 (decisión de diseño, campo nuevo `sin_cambio`, docs/corpus_esquema.md):
    // una entrada con sin_cambio: true da 0 alternativas y «No lo encuentro» dice «Esta no tiene cambio» + su si_no_hay;
    // toda entrada SIN sin_cambio sigue exigiendo ≥ 2 alternativas seguras para el adulto sano (el mínimo no baja).
    test("B4: sin_cambio → 0 alternativas y «Esta no tiene cambio» + si_no_hay; las demás, ≥ 2 alternativas seguras (adulto sano) y ≥ 1 en perfiles restringidos (o mensaje)", () => {
      const fallas = [];
      const sano = M.perfil(enVerde("adulto_sano").s, enVerde("adulto_sano").r);
      for (const e of corpus.entradas) {
        if (motivoInseguro(e, PERFILES.adulto_sano)) continue;
        if (e.sin_cambio) {
          if (M.alternativas(e.id, sano).length) fallas.push(`${e.id}: sin_cambio con alternativas`);
          const texto = M.textoNoLoEncuentro(M.noLoEncuentro(e.id, sano), "voz");
          if (!/Esta no tiene cambio/.test(texto) || !texto.includes(String(e.si_no_hay || "").trim().replace(/\.$/, ""))) fallas.push(`${e.id}: no dice «Esta no tiene cambio» + si_no_hay`);
          continue;
        }
        const alts = M.alternativas(e.id, sano);
        if (alts.length < 2) fallas.push(`adulto_sano · ${e.id}: ${alts.length} alternativas`);
        if (alts.some(a => a.id === e.id)) fallas.push(`${e.id} se recomienda a sí misma`);
      }
      for (const k of RESTRINGIDOS) {
        const p = PERFILES[k];
        const perfil = M.perfil(enVerde(k).s, enVerde(k).r);
        for (const e of corpus.entradas) {
          if (motivoInseguro(e, p) || e.sin_cambio) continue; // no es recomendable para este perfil, o no tiene cambio
          const alts = M.alternativas(e.id, perfil);
          const haySeguroEnTema = corpus.entradas.some(o => o.id !== e.id && (o.tipo === "alimento" || o.tipo === "habito") && o.temas.some(t => e.temas.includes(t)) && !motivoInseguro(o, p));
          if (!alts.length && haySeguroEnTema) fallas.push(`${k} · ${e.id}: sin alternativas aunque hay alimentos o hábitos seguros en su tema`);
        }
      }
      assert.deepEqual(fallas, []);
    });

    test("B5: con fiebre la primera tarjeta es hidratación o suero oral (adulto, embarazada y niño)", () => {
      for (const k of ["adulto_sano", "embarazada", "nino_6"]) {
        const s = sesion(k, { medidas: medidas(88, 97, 38.0), categorias: ["defensas"] });
        const rec = M.recomendar(s, R.evaluar(s), ["defensas"]);
        assert.ok(rec.tarjetas.length > 0, k);
        assert.match(rec.tarjetas[0].entrada.id + " " + rec.tarjetas[0].entrada.nombre, /hidrat|suero/i, k);
      }
    });

    test("embarazo: tarjeta de control prenatal con ácido fólico y hierro de tu control", () => {
      const { s, r } = enVerde("embarazada");
      const rec = M.recomendar(s, r, ["sueno"]);
      const prenatal = rec.tarjetas.find(t => /prenatal/i.test(t.entrada.nombre));
      assert.ok(prenatal, "falta tarjeta prenatal");
      assert.match(prenatal.entrada.como, /ácido fólico/i);
      assert.match(prenatal.entrada.como, /los que te da tu control/i);
      assert.equal(rec.tarjetas[0], prenatal, "la etapa va antes que los temas");
      assert.match(rec.encabezado, /embarazada/);
    });

    // Decisión de diseño (2026-11-01): se quitó la regla vieja «el suplemento siempre al
    // final»; ahora dentro de cada tema manda la evidencia para ESE tema (ayuda_por_tema, o ayuda).
    test("orden por tema: la de más evidencia primero (sin la regla vieja del suplemento al final)", () => {
      const ayudaEn = (e, tema) => (e.ayuda_por_tema && typeof e.ayuda_por_tema[tema] === "number" ? e.ayuda_por_tema[tema] : e.ayuda);
      for (const k of ["adulto_sano", "adulto_mayor"]) {
        const { s, r } = enVerde(k);
        for (const tema of temas) {
          const ayudas = M.recomendar(s, r, [tema]).tarjetas.filter(t => t.tema === tema && !String(t.entrada.id).startsWith("base_")).map(t => ayudaEn(t.entrada, tema));
          assert.deepEqual([...ayudas], [...ayudas].sort((a, b) => b - a), `${k} · ${tema}: ${ayudas}`); // [...] = mismo "realm" que la prueba
        }
      }
    });

    test("nunca devuelve un tema vacío", () => {
      const fallas = [];
      for (const k of Object.keys(PERFILES)) for (const caso of [enVerde(k), enAmbar(k)]) {
        const rec = M.recomendar(caso.s, caso.r, temas);
        for (const tema of temas) if (!rec.tarjetas.some(t => t.tema === tema)) fallas.push(`${k} · ${tema}`);
      }
      assert.deepEqual(fallas, []);
    });

    // Especificación cambiada el 2026-11-02 (decisión de diseño): el «control prenatal» puede venir en el aviso o en el
    // «cómo» de la entrada (ácido fólico y hierro ya lo dicen; no se duplica), y el suero oral no lo lleva (OMS y NHS no lo
    // restringen en el embarazo).
    test("embarazo: los suplementos permitidos dicen 'control prenatal' (en su aviso o en su cómo), salvo el suero oral", () => {
      const { s, r } = enVerde("embarazada");
      for (const t of M.recomendar(s, r, temas).tarjetas.filter(t => t.entrada.tipo === "suplemento" && t.entrada.id !== "suero_oral")) {
        assert.ok(t.avisos.some(a => /control prenatal/i.test(a)) || /control prenatal/i.test(t.entrada.como || ""), t.entrada.id);
        assert.ok(!(t.avisos.some(a => /control prenatal/i.test(a)) && /control prenatal/i.test(t.entrada.como || "")), t.entrada.id + ": el aviso repite lo que ya dice su cómo");
      }
    });

    test("niños: nunca una planta o suplemento sin dosis para niños", () => {
      for (const k of ["nino_2", "nino_6"]) {
        const { s, r } = enAmbar(k);
        for (const t of M.recomendar(s, r, temas).tarjetas) if (t.entrada.tipo === "planta" || t.entrada.tipo === "suplemento") assert.ok(t.entrada.cuanto_ninos, `${k} · ${t.entrada.id}`);
      }
    });

    test("ámbar: los suplementos llevan 'pregúntalo en tu centro de salud'", () => {
      const { s, r } = enAmbar("adulto_sano");
      assert.equal(r.nivel, "ambar");
      // criterio 64: la rehidratación (suero oral) no lleva nada que la retrase
      const sups = M.recomendar(s, r, temas).tarjetas.filter(t => t.entrada.tipo === "suplemento" && !t.entrada.rehidratacion);
      for (const t of sups) assert.ok(t.avisos.some(a => /pregúntalo en tu centro de salud/i.test(a)), t.entrada.id);
    });

    test("avisosPara: nopal con medicina del azúcar avisa en lenguaje simple", () => {
      const nopal = corpus.entradas.find(e => /nopal/i.test(e.id));
      if (!nopal) return;
      const { s, r } = enVerde("azucar");
      const avisos = M.avisosPara(nopal, M.perfil(s, r));
      assert.ok(avisos.some(a => /Puede bajar más el azúcar junto con tu pastilla/.test(a)), avisos.join(" | "));
      const sano = M.avisosPara(nopal, M.perfil(enVerde("adulto_sano").s, enVerde("adulto_sano").r));
      assert.ok(!sano.some(a => /azúcar/.test(a)), "el aviso del azúcar solo aplica a quien toma la pastilla");
    });
  });
}

describe("motor de recomendaciones · respaldo con data/fichas.js (sin corpus)", () => {
  const ctx = cargar([], { corpus: "ninguno" });
  const M = ctx.MediBotRecomendaciones; const R = ctx.MediBotReglas;
  test("respaldo: los tés de fichas.js son plantas con exclusiones (embarazo, niños, anticoagulante, No sé)", () => {
    const tes = M.corpus().entradas.filter(e => /^t[eé]\s/i.test(e.nombre));
    assert.ok(tes.length >= 2, "fichas.js trae tés");
    for (const e of tes) assert.equal(e.tipo, "planta", e.nombre);
    const temas = M.temas().map(t => t.id);
    for (const cambios of [{ embarazo: true, embarazoOpcion: "si" }, { paraQuien: "nino", grupo: "nino", edadNino: "2a5" }, { medicinas: ["anticoagulante"] }, { medicinas: ["no_se"] }]) {
      const s = sesionBase(ctx, { medicinas: ["ninguna"], embarazoOpcion: "no", medidas: medidas(72, 97), categorias: temas, ...cambios });
      const ids = M.recomendar(s, R.evaluar(s), temas).tarjetas.map(t => t.entrada.nombre);
      assert.ok(!ids.some(n => /^t[eé]\s/i.test(n)), JSON.stringify(cambios) + " → " + ids.join(" | "));
    }
  });
  test("sin corpus el motor no se rompe y no da suplementos a una embarazada", () => {
    assert.ok(M);
    const temas = M.temas().map(t => t.id);
    assert.ok(temas.length >= 8);
    assert.equal(new Set(M.temas().map(t => t.dibujo)).size, temas.length, "cada tema con un dibujo distinto");
    const s = sesionBase(ctx, { embarazo: true, embarazoRespondido: true, medicinas: ["ninguna"], medidas: medidas(72, 97), categorias: temas });
    const rec = M.recomendar(s, R.evaluar(s), temas);
    assert.ok(rec.tarjetas.length > 0);
    assert.ok(!rec.tarjetas.some(t => t.entrada.tipo === "suplemento" || t.entrada.tipo === "planta"));
  });
});

/* ---------- Campos opcionales y tablas de exclusión de la curaduría (corpus real) ---------- */
describe("corpus real · decisiones de curaduría", { skip: !HAY_CORPUS_REAL && "todavía no existe data/corpus.js" }, () => {
  const ctx = cargar([], { corpus: "real" });
  const M = ctx.MediBotRecomendaciones; const R = ctx.MediBotReglas;
  const corpus = ctx.MediBotData.corpus;
  const temas = corpus ? corpus.temas.map(t => t.id) : [];
  const caso = (cambios, sp = [72, 97]) => { const s = sesionBase(ctx, { medicinas: ["ninguna"], categorias: temas, medidas: medidas(...sp), ...cambios }); return { s, r: R.evaluar(s) }; };
  /** Ids que el perfil ve: tarjetas + alternativas de todas las entradas. */
  function visibles({ s, r }) {
    const rec = M.recomendar(s, r, temas);
    const ids = new Set(rec.tarjetas.map(t => t.entrada.id));
    for (const e of corpus.entradas) for (const a of M.alternativas(e.id, rec.perfil)) ids.add(a.id);
    return { ids, rec };
  }
  const NO_EMBARAZADOS = {
    hombre_60_aspirina: { grupo: "60mas", medicinas: ["anticoagulante"] },
    metformina: { grupo: "18a59", medicinas: ["azucar"], embarazoOpcion: "no_aplica" },
    adulto_sano: { grupo: "18a59", embarazoOpcion: "no" },
    no_decir: { grupo: "18a59", embarazoOpcion: "no_decir" },
    adolescente: { grupo: "12a17", embarazoOpcion: "no" },
    no_se: { grupo: "18a59", medicinas: ["no_se"] }
  };

  test("solo_embarazo: ningún perfil no embarazado recibe ácido fólico ni hierro del control prenatal", () => {
    const solo = corpus.entradas.filter(e => e.solo_embarazo).map(e => e.id);
    assert.ok(solo.length > 0, "el corpus real marca solo_embarazo");
    const fallas = [];
    for (const [k, c] of Object.entries(NO_EMBARAZADOS)) { const { ids } = visibles(caso(c)); for (const id of solo) if (ids.has(id)) fallas.push(`${k} ve ${id}`); }
    assert.deepEqual(fallas, []);
  });

  test("solo_embarazo: en Energía, a quien toma metformina le sale la vitamina B12 y no el ácido fólico", () => {
    const { s, r } = caso({ grupo: "18a59", medicinas: ["azucar"], embarazoOpcion: "no_aplica" });
    const ids = M.recomendar(s, r, ["energia"]).tarjetas.map(t => t.entrada.id);
    assert.ok(!ids.includes("acido_folico") && !ids.includes("hierro"), ids.join(","));
    assert.ok(ids.includes("vitamina_b12"), ids.join(","));
  });

  test("solo_embarazo: la embarazada sí recibe la tarjeta prenatal y las entradas de su control (con aviso del control)", () => {
    const { s, r } = caso({ grupo: "18a59", embarazo: true, embarazoOpcion: "si" });
    const rec = M.recomendar(s, r, ["energia"]);
    assert.ok(rec.tarjetas.some(t => t.entrada.id === "senal_prenatal"));
    const prenatales = rec.tarjetas.filter(t => t.entrada.solo_embarazo);
    assert.ok(prenatales.length > 0, rec.tarjetas.map(t => t.entrada.id).join(","));
    // (decisión de diseño del 2026-11-02) el control prenatal puede venir en el «cómo» de la entrada; no se repite en el aviso
    for (const t of prenatales) assert.ok(t.avisos.some(a => /control prenatal/i.test(a)) || /control prenatal/i.test(t.entrada.como || ""), t.entrada.id);
    // Si en la sesión quedó "embarazo: sí" y luego se cambió a un niño, el motor no lo trata como embarazo
    const nino = caso({ paraQuien: "nino", grupo: "nino", edadNino: "6a11", embarazo: true, embarazoOpcion: "si" });
    const vn = visibles(nino);
    assert.ok(!vn.ids.has("acido_folico") && !vn.ids.has("senal_prenatal"), [...vn.ids].join(","));
    assert.equal(vn.rec.perfil.embarazo, false);
    assert.doesNotMatch(vn.rec.encabezado, /embarazada/);
  });

  test("avisos_medicina del corpus: solo para quien marcó esa medicina y sin repetir el aviso", () => {
    const nopal = M.porId("nopal"); const hierro = M.porId("hierro"); const fibra = M.porId("fibra");
    const p = (meds) => M.perfil(sesionBase(ctx, { medicinas: meds }), null);
    const azucar = M.avisosPara(nopal, p(["azucar"]));
    assert.equal(azucar.filter(a => /Puede bajar más el azúcar/.test(a)).length, 1, azucar.join(" | "));
    assert.ok(!M.avisosPara(nopal, p(["presion"])).some(a => /azúcar/.test(a)));
    assert.ok(M.avisosPara(hierro, p(["tiroides"])).some(a => /4 horas/.test(a)));
    assert.ok(!M.avisosPara(hierro, p(["ninguna"])).some(a => /4 horas/.test(a)));
    assert.ok(M.avisosPara(fibra, p(["corazon"])).some(a => /digoxina/.test(a)));
    assert.ok(!M.avisosPara(fibra, p(["azucar"])).some(a => /digoxina/.test(a)));
  });

  // Tabla 8.2: entradas que NO debe ver quien toma cada medicina
  const T82 = {
    presion: "cola_caballo ortiga diente_leon vitamina_d calcio magnesio",
    azucar: "diente_leon miel",
    anticoagulante: "manzanilla menta toronjil hinojo anis jengibre eucalipto tomillo gordolobo ajo canela valeriana pasiflora cola_caballo ortiga diente_leon boldo romero omega3 melatonina chia",
    corazon: "cola_caballo ortiga diente_leon",
    nervios_sueno: "toronjil valeriana pasiflora melatonina",
    convulsiones: "acido_folico melatonina"
  };
  // Tabla 8.3: por perfil (embarazo, lactancia, edad, condición)
  const T83 = {
    embarazo: [{ grupo: "18a59", embarazo: true, embarazoOpcion: "si" }, "menta toronjil hinojo anis jengibre eucalipto tomillo gordolobo ajo canela valeriana pasiflora cola_caballo ortiga diente_leon boldo romero sabila vitamina_c vitamina_d vitamina_b12 complejo_b calcio magnesio zinc omega3 probioticos melatonina fibra"],
    lactancia: [{ grupo: "18a59", lactancia: true, embarazoOpcion: "no" }, "menta toronjil hinojo anis jengibre eucalipto tomillo gordolobo ajo canela valeriana pasiflora cola_caballo ortiga diente_leon boldo romero sabila complejo_b probioticos melatonina"],
    edad_menos2: [{ paraQuien: "nino", grupo: "nino", edadNino: "menos2" }, "menta toronjil hinojo anis jengibre eucalipto tomillo gordolobo ajo canela valeriana pasiflora cola_caballo ortiga diente_leon boldo romero sabila acido_folico hierro vitamina_c vitamina_d vitamina_b12 complejo_b calcio magnesio zinc omega3 probioticos melatonina fibra tortilla nopal chia sardina guayaba naranja_limon quelites amaranto pepitas miel caminar sin_cafe_tarde menos_sal"],
    edad_2: [{ paraQuien: "nino", grupo: "nino", edadNino: "2a5" }, "menta toronjil hinojo anis jengibre eucalipto tomillo gordolobo ajo canela valeriana pasiflora cola_caballo ortiga diente_leon boldo romero sabila acido_folico hierro vitamina_c vitamina_d vitamina_b12 complejo_b calcio magnesio zinc omega3 probioticos melatonina fibra chia sin_cafe_tarde"],
    edad_6: [{ paraQuien: "nino", grupo: "nino", edadNino: "6a11" }, "toronjil hinojo anis jengibre eucalipto tomillo gordolobo ajo canela valeriana pasiflora cola_caballo ortiga diente_leon boldo romero sabila acido_folico hierro vitamina_c vitamina_d vitamina_b12 complejo_b calcio magnesio zinc omega3 probioticos melatonina fibra sin_cafe_tarde"],
    edad_12_15: [{ grupo: "12a17", embarazoOpcion: "no" }, "jengibre canela boldo vitamina_c vitamina_d vitamina_b12 complejo_b calcio magnesio zinc omega3 probioticos melatonina fibra"],
    vesicula: [{ grupo: "18a59", condiciones: ["vesicula"] }, "menta diente_leon boldo romero"],
    higado: [{ grupo: "18a59", condiciones: ["higado"] }, "gordolobo valeriana diente_leon boldo romero"],
    rinon_poca_agua: [{ grupo: "18a59", condiciones: ["rinon_poca_agua"] }, "cola_caballo ortiga diente_leon magnesio fibra agua caldo"],
    acidez: [{ grupo: "18a59", condiciones: ["acidez"] }, "menta jengibre"],
    alergia_asteraceas: [{ grupo: "18a59", condiciones: ["alergia_asteraceas"] }, "manzanilla diente_leon"]
  };

  test("tabla 8.2: por medicina, ninguna tarjeta ni alternativa prohibida (y No sé = unión de todas)", () => {
    const fallas = []; const union = new Set();
    for (const [med, lista] of Object.entries(T82)) {
      const { ids } = visibles(caso({ grupo: "18a59", medicinas: [med], embarazoOpcion: "no" }));
      for (const id of lista.split(" ")) { union.add(id); if (ids.has(id)) fallas.push(`${med} ve ${id}`); }
    }
    const { ids } = visibles(caso({ grupo: "18a59", medicinas: ["no_se"], embarazoOpcion: "no" }));
    for (const id of union) if (ids.has(id)) fallas.push(`no_se ve ${id}`);
    assert.deepEqual(fallas, []);
  });

  test("tabla 8.3: por embarazo, lactancia, edad y condición, ninguna tarjeta ni alternativa prohibida", () => {
    const fallas = [];
    for (const [k, [cambios, lista]] of Object.entries(T83)) {
      for (const sp of [[72, 97], [72, 92]]) {
        const { ids } = visibles(caso(cambios, sp));
        for (const id of lista.split(" ")) if (ids.has(id)) fallas.push(`${k} ve ${id}`);
      }
    }
    assert.deepEqual([...new Set(fallas)], []);
  });
});
