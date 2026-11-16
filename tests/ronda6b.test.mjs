// Ronda 6, lote de cierre (88–106): parte del motor y de los datos. Lo de pantalla, voz y
// hoja está en tools/e2e_ronda6b.py.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { cargar, sesionBase, valida } from "./cargar.mjs";

const medidas = (fc, spo2, temp = null) => ({ fc: valida(fc), spo2: valida(spo2), temp: temp == null ? { valor: null, estado: null } : valida(temp) });
const ctx = cargar(["data/cuidado.js"]);
const M = ctx.MediBotRecomendaciones; const R = ctx.MediBotReglas; const T = ctx.MediBotData.textos;
const ses = (c = {}) => sesionBase(ctx, { grupo: "18a59", medicinas: ["ninguna"], medidas: medidas(75, 98, 36.8), ...c });
const EMB = { embarazo: true, embarazoOpcion: "si", embarazoRespondido: true, sexo: "mujer" };
const NO_DECIR = { embarazo: null, embarazoOpcion: "no_decir", embarazoRespondido: true, sexo: "mujer" };
const nina = (c = {}) => ses({ paraQuien: "nino", grupo: "nino", edadNino: "9a11", medidas: medidas(100, 98), ...c });
const rec = (s, temas) => M.recomendar(s, R.evaluar(s), temas);
const texto = (r) => JSON.stringify([r.tarjetas.map(t => [t.entrada.nombre, t.entrada.para, t.entrada.como, t.entrada.si_no_hay, t.avisos, (t.entrada.fuentes || []).map(f => f.nombre)]),
  (r.franjas || []).map(f => [f.texto, (f.fuentes || []).map(x => x.nombre)]), Object.values(r.cuidados || {}).flat().map(x => [x.tarjeta.nombre, x.tarjeta.que_es, x.tarjeta.por_que_cuidado, x.texto, (x.alternativas || []).map(a => [a.entrada.nombre, a.como])])]);
const fichaDe = (r, id) => r.tarjetas.find(t => t.entrada.id === id);

describe("88 / 95 · ruda, comida segura y señales de alarma del embarazo desde los 9", () => {
  for (const [nombre, s] of [["9 a 11 «Sí»", nina(EMB)], ["9 a 11 «Prefiero no decir»", nina(NO_DECIR)]]) {
    test(`${nombre}: «Cuándo ir · Embarazo», la tarjeta de la ruda y «Comida segura en el embarazo»`, () => {
      const r = rec(s, ["embarazo"]);
      assert.ok((r.franjas || []).some(f => f.tema === "embarazo"), "franja «Cuándo ir» del embarazo: " + (r.franjas || []).map(f => f.tema));
      assert.ok((r.cuidados.embarazo || []).some(x => x.tarjeta.id === "ruda_te"), "ruda_te: " + (r.cuidados.embarazo || []).map(x => x.tarjeta.id));
      // «Comida segura» es `solo_embarazo` (como a una adulta): con «Sí»; con «Prefiero no decir» no sale a nadie
      if (s.embarazo) assert.ok(M.opciones("embarazo", M.perfil(s, R.evaluar(s))).some(e => e.id === "comer_seguro_embarazo"), "comer_seguro_embarazo entre las opciones");
    });
  }
  test("«Comida segura en el embarazo» ya no dice «tu bebé» (para todas las edades)", () => {
    const e = M.porId("comer_seguro_embarazo");
    assert.doesNotMatch(JSON.stringify([e.nombre, e.para, e.como]), /tu beb[eé]/i);
  });
});

describe("97 y decisión de diseño (2026-11-15) · mensaje protector: trato de tú y prisa de 15 a 17 igual que el semáforo", () => {
  const E = T.embarazo_menor;
  test("97: ningún «usted» en los textos del mensaje protector (pantalla, voz y hoja)", () => {
    assert.doesNotMatch(JSON.stringify(E), /(?<!\p{L})usted(?!\p{L})|Llévela|(?<!\p{L})llame(?!\p{L})|marquen|les contesten|elijan/iu);
    assert.ok(E.adulto.parrafos.some(x => x.startsWith("Una niña embarazada necesita revisión médica desde ya. Llévala hoy al centro de salud.")), "«Llévala hoy»");
    assert.ok(E.adulto.parrafos.some(x => x.startsWith("Si ella o tú necesitan orientación")), "«Si ella o tú necesitan»");
    assert.ok(E.adulto.parrafos.some(x => x.endsWith("llama ya al 911.")), "«llama ya al 911»");
  });
  test("15a17_hoy: el texto del 85b con «hoy» (sin «pronto» ni «esta semana»); lo demás, igual", () => {
    for (const k of ["nina", "adulto"]) {
      const h = E["15a17_hoy"][k], b = E["15a17"][k];
      const todo = [h.titulo, ...h.parrafos, h.voz, ...h.hoja].join(" ");
      assert.match(h.titulo, /hoy/i, k); assert.match(h.parrafos.join(" "), /\bhoy\b/i, k); assert.match(h.hoja[0], /HOY/, k);
      assert.doesNotMatch(todo, /pronto|esta semana|niña embarazada/i, k);
      const sinPrisa = (xs) => xs.filter(x => !/pronto|\bhoy\b/i.test(x));
      assert.deepEqual(sinPrisa(h.parrafos), sinPrisa(b.parrafos), "solo cambia el párrafo de la prisa: " + k);
      assert.equal(h.parrafos.length, b.parrafos.length, k);
      assert.deepEqual(h.hoja.slice(1), b.hoja.slice(1), "en la hoja, solo la primera línea: " + k);
    }
  });
});

describe("98 · ideas de embarazo cuando consulta un adulto por una niña o adolescente", () => {
  test("«su control prenatal», «que no tome otros», «la niña»; nada de «tu control prenatal»", () => {
    for (const s of [nina({ ...EMB, paraQuien: "nino" }), ses({ grupo: "12a17", edadAdol: "15a17", paraQuien: "otra", ...EMB })]) {
      const r = rec(s, ["embarazo"]); const tx = texto(r);
      assert.doesNotMatch(tx, /tu control prenatal|te da tu control|No tomes otros|tienes cita|te lo han dado/i, s.paraQuien + "/" + s.grupo); // también el «si no hay»
      const pre = fichaDe(r, "senal_prenatal");
      assert.ok(pre && /su control/i.test(pre.entrada.nombre + pre.entrada.como) && /que no tome otros/i.test(pre.entrada.como), "tarjeta prenatal en tercera persona: " + (pre && pre.entrada.nombre + " | " + pre.entrada.como));
      if (s.paraQuien === "nino") assert.match(pre.entrada.para, /la niña/, "por una niña: «la niña»");
    }
    const yo = rec(ses({ grupo: "12a17", edadAdol: "15a17", ...EMB }), ["embarazo"]);
    assert.match(fichaDe(yo, "senal_prenatal").entrada.nombre, /Tu control prenatal/, "ella misma: sigue en tú");
  });
});

describe("99 · nada que dé por hecho el parto ni la lactancia a una menor embarazada", () => {
  for (const [nombre, s] of [["9 a 11", nina(EMB)], ["12 a 14", ses({ grupo: "12a17", edadAdol: "12a14", ...EMB })], ["15 a 17", ses({ grupo: "12a17", edadAdol: "15a17", ...EMB })], ["9 a 11 «Prefiero no decir»", nina(NO_DECIR)]]) {
    test(`${nombre}: sin «Si quieres embarazarte», «para el bebé», «después del parto» ni fuentes de lactancia`, () => {
      const r = rec(s, ["embarazo", "diarrea"]);
      assert.doesNotMatch(texto(r), /embarazarte|para el beb[eé]|despu[eé]s del parto|ces[aá]rea|lactancia|breastfeeding|\b(dar|dando|das|darle|dándole) (el )?pecho/i); // p. ej. «Seguir comiendo y dando pecho» (diarrea)
    });
  }
  test("la sección se llama «Embarazo» (sin «y dar pecho») para menores de 12; para las demás, igual que antes", () => {
    assert.equal(M.nombreTema("embarazo", M.perfil(nina(EMB), null)), "Embarazo");
    assert.equal(M.nombreTema("embarazo", M.perfil(ses(EMB), null)), "Embarazo y dar pecho");
    assert.equal(M.nombreTema("embarazo"), "Embarazo y dar pecho");
  });
  test("a una adulta embarazada no se le quita nada (sigue «Si quieres embarazarte» del ácido fólico)", () => {
    const r = rec(ses(EMB), ["embarazo"]);
    assert.match(texto(r), /Ácido fólico/);
  });
});

describe("100 · alcohol en el embarazo: solo «No tomes nada de alcohol»", () => {
  test("ni en las ideas ni en «Cuidado con esto» dice «toma menos» o «tomar menos» (cualquier edad)", () => {
    for (const s of [ses(EMB), ses({ grupo: "12a17", edadAdol: "15a17", ...EMB })]) {
      const r = rec(s, ["embarazo", "sueno", "dolor_cabeza"]); const tx = texto(r);
      assert.doesNotMatch(tx, /toma menos|tomar menos|Si tomas, toma/i, s.grupo);
      const c = (r.cuidados.embarazo || []).find(x => x.tarjeta.id === "alcohol_tabaco_embarazo");
      assert.ok(c, "sale la tarjeta de alcohol");
      assert.match([c.texto, ...(c.alternativas || []).map(a => a.entrada.nombre + " " + a.como)].join(" "), /No tomes nada de alcohol/);
    }
    // con «Prefiero no decir» tampoco (la ayuda promete «no te damos nada que no sea para el embarazo»)
    assert.doesNotMatch(texto(rec(ses(NO_DECIR), ["dolor_cabeza", "sueno"])), /toma menos|Si tomas, toma/i, "adulta «Prefiero no decir»");
    const sinEmb = rec(ses({ sexo: "mujer", embarazoOpcion: "no" }), ["dolor_cabeza"]);
    const al = fichaDe(sinEmb, "menos_alcohol");
    if (al) assert.match(al.entrada.como, /Si tomas, toma menos/, "sin embarazo, el texto de siempre");
  });
});

describe("101 · dosis de actividad de 12 a 17", () => {
  test("«De 5 a 17 años: una hora al día», no la de adultos", () => {
    const r = rec(ses({ grupo: "12a17", sexo: "mujer", embarazoOpcion: "no" }), ["sueno", "energia", "huesos_articulaciones", "azucar_peso"]);
    const c = r.tarjetas.find(t => t.entrada.id === "caminar") || { entrada: M.adaptar(M.porId("caminar"), M.perfil(ses({ grupo: "12a17" }), null)) };
    assert.match(c.entrada.como, /De 5 a 17 años: una hora al día/);
    assert.doesNotMatch(c.entrada.como, /Adultos: de 150 a 300/);
    assert.match(M.adaptar(M.porId("caminar"), M.perfil(ses(), null)).como, /Adultos: de 150 a 300/, "adultos igual que antes");
  });
});

describe("102 · nada de regla a «Hombre»", () => {
  test("«Tomar menos alcohol» no menciona los cólicos de la regla", () => {
    const h = M.adaptar(M.porId("menos_alcohol"), M.perfil(ses({ sexo: "hombre" }), null));
    assert.doesNotMatch(JSON.stringify([h.nombre, h.para, h.como]), /regla|c[oó]licos/i);
    const m = M.adaptar(M.porId("menos_alcohol"), M.perfil(ses({ sexo: "mujer", embarazoOpcion: "no" }), null));
    assert.match(m.para, /cólicos de la regla/, "a una mujer, igual que antes");
  });
});

describe("105 · las fuentes que se muestran corresponden a la persona", () => {
  const nombres = (s, id) => (M.adaptar(M.porId(id), M.perfil(s, null)).fuentes || []).map(f => f.nombre).join(" | ");
  test("sin «Period pain» a un hombre, a menores de 9 ni a mayores; sin guías de mayores a menores de 60; sin cartilla de 20 a 59 a menores", () => {
    assert.doesNotMatch(nombres(ses({ sexo: "hombre" }), "caminar"), /Period pain/);
    assert.doesNotMatch(nombres(ses({ grupo: "60mas" }), "caminar"), /Period pain/);
    assert.doesNotMatch(nombres(ses({ paraQuien: "nino", grupo: "nino", edadNino: "2a5" }), "caminar"), /Period pain|older adults/i);
    assert.doesNotMatch(nombres(ses({ grupo: "12a17" }), "caminar"), /older adults/i);
    assert.match(nombres(ses({ grupo: "60mas" }), "caminar"), /older adults/i, "a una persona mayor sí");
    assert.match(nombres(ses({ sexo: "mujer", embarazoOpcion: "no" }), "caminar"), /Period pain/, "a una mujer adulta sí");
    const fr = (s) => (rec(s, ["embarazo"]).franjas || []).filter(f => f.tema === "embarazo").flatMap(f => f.fuentes.map(x => x.nombre)).join(" | ");
    assert.doesNotMatch(fr(nina(EMB)), /20 a 59/, "la cartilla de 20 a 59 no se cita a una niña");
    assert.match(fr(ses(EMB)), /20 a 59/, "a una adulta sí");
  });
});
