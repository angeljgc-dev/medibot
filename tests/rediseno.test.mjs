// Rediseño v0.5 (docs/diseno/sistema.md): «Cuidado con esto» con hasta 2 tarjetas por sección (criterio 26),
// pictogramas en lugar de emoji (criterio 23) y textos de la bienvenida («es gratis», criterio 25; voz corta).
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cargar, sesionBase } from "./cargar.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const ctx = cargar(["data/cuidado.js", "data/pictos.js"]);
const M = ctx.MediBotRecomendaciones; const D = ctx.MediBotData; const R = ctx.MediBotReglas;
const PERFILES = {
  adulto: { grupo: "18a59", embarazoOpcion: "no" }, embarazo: { grupo: "18a59", embarazo: true, embarazoOpcion: "si", embarazoRespondido: true },
  lactancia: { grupo: "18a59", embarazoOpcion: "lactancia", lactancia: true }, bebe_menos2: { paraQuien: "nino", grupo: "nino", edadNino: "menos2" },
  nino2a5: { paraQuien: "nino", grupo: "nino", edadNino: "2a5" }, nino6a11: { paraQuien: "nino", grupo: "nino", edadNino: "6a11" },
  adolescente: { grupo: "12a17", embarazoOpcion: "no" }, mayor: { grupo: "60mas" }
};
const perfilDe = (pc) => M.perfil(sesionBase(ctx, { medicinas: ["ninguna"], ...pc }), null);

describe("Cuidado con esto: hasta 2 por sección (decisión de diseño, criterio 26)", () => {
  test("R1: ≤ 2 por sección, la primera = cuidado(), sin repetir en la consulta, perfil y sección respetados", () => {
    const fallas = [];
    for (const [n, pc] of Object.entries(PERFILES)) {
      const p = perfilDe(pc); const vis = M.seccionesVisibles(p).map(t => t.id);
      for (let i = 0; i < vis.length; i++) {
        const temas = [...new Set([vis[i], vis[(i + 1) % vis.length], vis[(i + 4) % vis.length]])];
        const todas = M.cuidadoSecciones(temas, p); const una = M.cuidado(temas, p);
        const ids = Object.values(todas).flat().map(x => x.tarjeta.id);
        if (new Set(ids).size !== ids.length) fallas.push(`${n}: repetida en ${temas}: ${ids}`);
        for (const [tema, lista] of Object.entries(todas)) {
          if (lista.length > 2) fallas.push(`${n}/${tema}: ${lista.length} tarjetas`);
          if ((lista[0] ? lista[0].tarjeta.id : null) !== (una[tema] ? una[tema].tarjeta.id : null)) fallas.push(`${n}/${tema}: la primera no es la de cuidado()`);
          for (const x of lista) if (!x.tarjeta.secciones.includes(tema)) fallas.push(`${x.tarjeta.id} no es de ${tema}`);
        }
      }
    }
    assert.deepEqual(fallas.slice(0, 10), []);
  });

  test("R2: con 2 por sección, en una sección con 2 o más candidatas salen 2 (diarrea, adulto)", () => {
    const p = perfilDe(PERFILES.adulto);
    const candidatas = D.cuidado.tarjetas.filter(t => t.secciones.includes("diarrea") && (!t.perfiles.length));
    const l = M.cuidadoSecciones(["diarrea"], p).diarrea;
    assert.equal(l.length, Math.min(2, candidatas.length), l.map(x => x.tarjeta.id).join());
    assert.equal(l[0].tarjeta.id, "ayuno_diarrea", "la más grave sigue primero");
  });

  test("R3: en rojo no sale ninguna (tampoco la segunda)", () => {
    const s = sesionBase(ctx, { grupo: "18a59", embarazoOpcion: "no", medicinas: ["ninguna"] });
    s.medidas.spo2 = { valor: 84, estado: "valida", origen: "manual" }; s.medidas.fc = { valor: 72, estado: "valida", origen: "manual" };
    const r = M.recomendar(s, R.evaluar(s), ["digestion", "diarrea"]);
    assert.equal(R.evaluar(s).nivel, "rojo");
    assert.ok(Object.values(r.cuidados).every(l => l.length === 0));
  });

  test("R4: las 14 tarjetas de data/cuidado.js salen en alguna combinación real (perfil × hasta 3 secciones visibles)", () => {
    assert.equal(D.cuidado.tarjetas.length, 14);
    const vistas = new Map();
    for (const [n, pc] of Object.entries(PERFILES)) {
      const p = perfilDe(pc); const vis = M.seccionesVisibles(p).map(t => t.id);
      const combos = [];
      for (let a = 0; a < vis.length; a++) { combos.push([vis[a]]); for (let b = a + 1; b < vis.length; b++) { combos.push([vis[a], vis[b]]); for (let c = b + 1; c < vis.length; c++) combos.push([vis[a], vis[b], vis[c]]); } }
      for (const temas of combos) for (const orden of [temas, [...temas].reverse()])
        for (const x of Object.values(M.cuidadoSecciones(orden, p)).flat()) if (!vistas.has(x.tarjeta.id)) vistas.set(x.tarjeta.id, `${n}: ${orden.join("+")}`);
    }
    const nunca = [...D.cuidado.tarjetas.map(t => t.id).filter(id => !vistas.has(id))];
    assert.deepEqual(nunca, [], "tarjetas que nunca salen");
    for (const id of ["miel_bebe", "remedios_quemadura", "alcohol_tabaco_embarazo"]) assert.ok(vistas.has(id), id);
    console.log("ejemplo de dónde sale cada una:", JSON.stringify(Object.fromEntries(vistas)));
  });
});

describe("Pictogramas y textos del rediseño", () => {
  const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;
  test("P1: sin emoji en js/ ni en data/textos.js (criterio 23); el único permitido es el filtro de la voz", () => {
    const archivos = [...readdirSync(join(RAIZ, "js")).filter(f => f.endsWith(".js")).map(f => "js/" + f), "data/textos.js"];
    const hallados = [];
    for (const rel of archivos) readFileSync(join(RAIZ, rel), "utf8").split(/\r?\n/).forEach((l, i) => {
      if (!EMOJI.test(l)) return;
      if (rel === "js/voz.js" && /permitido-emoji/.test(l)) return; // quita símbolos del texto antes de leerlo en voz
      hallados.push(`${rel}:${i + 1}`);
    });
    assert.deepEqual(hallados, []);
  });
  test("P2: cada sección, grupo y tipo del corpus tiene su pictograma en data/pictos.js", () => {
    const P = D.pictos;
    for (const t of D.corpus.temas) assert.ok(P.secciones[t.id], "sección " + t.id);
    for (const g of D.corpus.grupos) assert.ok(P.grupos[g.id], "grupo " + g.id);
    for (const tipo of ["alimento", "habito", "planta", "suplemento"]) assert.ok(P.tipos[tipo], tipo);
    for (const p of D.alarma.preguntas) assert.ok(P.alarma[p.id], "alarma " + p.id);
    const sprite = readFileSync(join(RAIZ, "index.html"), "utf8");
    const usados = new Set([...Object.values(P.secciones), ...Object.values(P.grupos), ...Object.values(P.tipos), ...Object.values(P.entradas), ...Object.values(P.alarma)]);
    for (const id of usados) assert.ok(sprite.includes(`<symbol id="${id}"`), "en el sprite de index.html: " + id);
  });
  test("P3: la bienvenida dice «es gratis» en pantalla y en su voz corta; la voz corta tiene ≤ 50 palabras y el mínimo", () => {
    const B = D.textos.bienvenida; const vc = D.textos.voz_corta.bienvenida;
    assert.match(B.gratis, /es gratis/i);
    assert.match(vc, /gratis/i);
    assert.ok(vc.split(/\s+/).filter(Boolean).length <= 50, vc);
    for (const parte of [/no soy/i, /9 1 1/, /nombre/i, /borra/i, /azul/i, /verde/i]) assert.match(vc, parte);
    assert.ok(B.privacidad.some(p => /Es gratis\. No guardamos tu nombre ni tus datos/.test(p)), "aviso de privacidad");
  });
});
