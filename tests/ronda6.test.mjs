// Ronda 6 (2026-11-15): sexo y embarazo en niñas. Parte del motor y de los textos de 80–85.
//   80/81: pregunta «Mujer / Hombre / Prefiero no decir»; con «Hombre» no hay embarazo ni lactancia (aunque quede algo viejo
//          en la sesión); desaparecen «No / soy hombre» y el «Si eres mujer:».
//   82: «6 a 11» se parte en «6 a 8» y «9 a 11»; embarazo desde «9 a 11» con «Mujer»; nunca antes; lactancia solo desde 12.
//   83: niña de 9 a 11 o 12 a 17 con embarazo «Sí» o «Prefiero no decir»: los mismos filtros del embarazo que una adulta.
//   84: «Cólicos de la regla» no se sugiere a «Hombre» (pero no se esconde).
//   85: (sin pantalla todavía) el motor sabe cuándo aplica: niña de 9 a 14 con embarazo «Sí».
// Las sesiones de las pruebas de antes no traen `sexo`: sin contestar, todo sigue como antes.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { cargar, sesionBase, valida } from "./cargar.mjs";

const plano = (x) => JSON.parse(JSON.stringify(x));
const igual = (a, b, m) => assert.deepEqual(plano(a), plano(b), m);
const medidas = (fc, spo2, temp = null) => ({ fc: valida(fc), spo2: valida(spo2), temp: temp == null ? { valor: null, estado: null } : valida(temp) });
const ctx = cargar(["data/cuidado.js"]);
const M = ctx.MediBotRecomendaciones; const R = ctx.MediBotReglas; const T = ctx.MediBotData.textos;
const ses = (c = {}) => sesionBase(ctx, { grupo: "18a59", medicinas: ["ninguna"], medidas: medidas(75, 98, 36.8), ...c });
const nina = (edadNino, c = {}) => ses({ paraQuien: "nino", grupo: "nino", edadNino, sexo: "mujer", medidas: medidas(100, 98), ...c });
const per = (s) => M.perfil(s, R.evaluar(s));
const EMB = { embarazo: true, embarazoOpcion: "si", embarazoRespondido: true };
const NO_DECIR = { embarazo: null, embarazoOpcion: "no_decir", embarazoRespondido: true };
// Lo que nunca dicen la pantalla, la voz ni la hoja en un embarazo de una menor
export const PROHIBIDAS_85 = /violaci[oó]n|abuso|agresor|delito|denuncia|ministerio p[uú]blico|fiscal[ií]a|procuradur[ií]a|(?<!\p{L})DIF(?!\p{L})|polic[ií]a|qui[eé]n fue|qui[eé]n es el pap[aá]|felicidades|vas a ser mam[aá]|tu beb[eé]|cu[eé]ntale a tu|alto riesgo|aborto|interrumpir|no deseado|es secreto|nadie se va a enterar|menor de 15|debiste|irresponsable|muy peligroso|puedes morir/iu;

describe("80/81 · sexo; embarazo y lactancia solo con «Mujer» o «Prefiero no decir»", () => {
  test("textos: la pregunta de sexo con sus tres opciones, voz en primera y tercera persona", () => {
    const S = T.sexo; assert.ok(S, "textos.sexo");
    igual(S.opciones.map(o => o.id), ["mujer", "hombre", "no_decir"]);
    igual(S.opciones.map(o => o.nombre), ["Mujer", "Hombre", "Prefiero no decir"]);
    assert.ok(S.titulo && S.titulo_otra && S.titulo_nino, "títulos para mí, otra persona y niño");
    for (const o of S.opciones) assert.ok(o.voz && o.voz_otra && o.voz_nino, "voces de " + o.id);
    assert.match(S.opciones[0].voz, /¿Eres mujer\?/); assert.match(S.opciones[0].voz_otra, /¿La persona es mujer\?/);
  });
  test("textos del embarazo: sin «No / soy hombre» ni «Si eres mujer»; opciones No, Sí, dando pecho, Prefiero no decir", () => {
    const E = T.embarazo;
    igual(E.opciones.map(o => o.id), ["no", "si", "lactancia", "no_decir"]);
    assert.equal(E.opciones[0].nombre, "No");
    const todo = JSON.stringify(E);
    assert.doesNotMatch(todo, /soy hombre|eres hombre|es hombre|Si eres mujer|Si es mujer/i);
    for (const o of E.opciones.slice(1, 3)) assert.ok(o.nombre_otra, "tercera persona en pantalla: " + o.id);
    assert.equal(E.opciones[1].nombre_otra, "Sí, está embarazada"); assert.equal(E.opciones[2].nombre_otra, "Está dando pecho");
    assert.ok(E.pregunta_nino, "pregunta para una niña");
  });
  test("«Hombre»: ni embarazo, ni embarazo posible, ni lactancia, aunque quede una respuesta vieja en la sesión", () => {
    for (const viejo of [EMB, NO_DECIR, { embarazoOpcion: "lactancia", lactancia: true }, {}]) {
      const p = per(ses({ sexo: "hombre", ...viejo }));
      igual([p.embarazo, p.embarazoPosible, p.lactancia], [false, false, false], JSON.stringify(viejo));
    }
    const ruda = M.porId("ruda") || M.corpus().entradas.find(e => e.excluir && e.excluir.embarazo);
    assert.ok(M.esSegura(ruda, per(ses({ sexo: "hombre" }))) || ruda.excluir.edad_minima > 18, "a un hombre no se le quita lo que es solo «no en el embarazo»");
  });
  test("«Mujer» y «Prefiero no decir» como antes (sin contestar el embarazo cuenta como posible de 12 a 59)", () => {
    for (const sexo of ["mujer", "no_decir", undefined]) {
      assert.equal(per(ses({ sexo, ...EMB })).embarazo, true, String(sexo));
      assert.equal(per(ses({ sexo, embarazoOpcion: null })).embarazoPosible, true, String(sexo));
      assert.equal(per(ses({ sexo, embarazoOpcion: "lactancia", lactancia: true })).lactancia, true, String(sexo));
    }
  });
});

describe("82 · «6 a 8» y «9 a 11»", () => {
  test("textos.edad_nino: menos2, 2a5, 6a8, 9a11 (ya no 6a11)", () => {
    igual(T.edad_nino.opciones.map(o => o.id), ["menos2", "2a5", "6a8", "9a11"]);
    igual(T.edad_nino.opciones.map(o => o.nombre), ["Menos de 2 años", "2 a 5 años", "6 a 8 años", "9 a 11 años"]);
  });
  test("edad para el corpus y texto de la edad", () => {
    igual([per(nina("6a8")).edad, per(nina("6a8")).edadMax], [6, 8.99]);
    igual([per(nina("9a11")).edad, per(nina("9a11")).edadMax], [9, 11.99]);
    assert.match(M.encabezado(per(nina("6a8"))), /de 6 a 8 años/);
    assert.match(M.encabezado(per(nina("9a11"))), /de 9 a 11 años/);
  });
  test("embarazo desde «9 a 11» con «Mujer» o «Prefiero no decir»; nunca a menores de 9 ni con «Hombre»; lactancia no antes de 12", () => {
    assert.equal(per(nina("9a11", EMB)).embarazo, true);
    assert.equal(per(nina("9a11", { sexo: "no_decir", ...EMB })).embarazo, true);
    for (const e of ["menos2", "2a5", "6a8"]) assert.equal(per(nina(e, EMB)).embarazo, false, e);
    assert.equal(per(nina("9a11", { sexo: "hombre", ...EMB })).embarazo, false);
    assert.equal(per(nina("9a11", { embarazoOpcion: "lactancia" })).lactancia, false, "no se pregunta antes de 12");
  });
  test("una niña de 9 a 11 sin contestar el embarazo NO se trata como posible embarazada (solo con «Prefiero no decir»)", () => {
    assert.equal(per(nina("9a11")).embarazoPosible, false);
    assert.equal(per(nina("9a11", NO_DECIR)).embarazoPosible, true);
  });
});

describe("83 · ideas seguras en el embarazo también para niñas y adolescentes", () => {
  const conExclusion = () => M.corpus().entradas.filter(e => e.excluir && e.excluir.embarazo && (e.excluir.edad_minima ?? 18) <= 9);
  test("niña de 9 a 11 o de 12 a 17 con embarazo «Sí» o «Prefiero no decir»: nada de lo que no es para el embarazo", () => {
    const ex = conExclusion(); assert.ok(ex.length >= 1, "hay entradas aptas a los 9 que se excluyen en el embarazo: " + ex.length);
    for (const s of [nina("9a11", EMB), nina("9a11", NO_DECIR), ses({ grupo: "12a17", sexo: "mujer", ...EMB }), ses({ grupo: "12a17", sexo: "mujer", ...NO_DECIR })])
      for (const e of ex) assert.equal(M.esSegura(e, per(s)), false, `${e.id} para ${s.grupo}/${s.edadNino || ""}/${s.embarazoOpcion}`);
    for (const e of ex) assert.equal(M.esSegura(e, per(nina("9a11"))), true, "sin embarazo sí le sale: " + e.id);
  });
  test("se sugiere «Embarazo y dar pecho» y «Cuidado con esto» trae las tarjetas del embarazo", () => {
    for (const s of [nina("9a11", EMB), ses({ grupo: "12a17", sexo: "mujer", ...EMB })]) {
      const p = per(s);
      assert.ok(M.sugeridas(p).includes("embarazo"), "sugerida: " + M.sugeridas(p));
      const c = M.cuidadoSecciones(["embarazo"], p).embarazo || [];
      assert.ok(c.some(x => /embarazo/.test(x.tarjeta.id) || (x.tarjeta.perfiles || []).includes("embarazo")), "tarjetas del embarazo: " + c.map(x => x.tarjeta.id));
    }
    // 12 a 17: la tarjeta de la ruda, por id (no basta con cualquier tarjeta)
    assert.ok((M.cuidadoSecciones(["embarazo"], per(ses({ grupo: "12a17", sexo: "mujer", ...EMB }))).embarazo || []).some(x => x.tarjeta.id === "ruda_te"), "ruda_te a 12–17");
  });
  test("85a: a una menor embarazada no se le ofrece nada que diga palabras de la lista prohibida ni que dé por hecho el parto", () => {
    for (const w of ["DIF", "Acude al DIF municipal", "la policía", "tu bebé"]) assert.match(w, M.PROHIBIDAS_MENOR, "el filtro reconoce: " + w);
    assert.match("Acude al DIF municipal", PROHIBIDAS_85);
    for (const w of ["difícil", "dificultad", "diferente"]) { assert.doesNotMatch(w, M.PROHIBIDAS_MENOR, w); assert.doesNotMatch(w, PROHIBIDAS_85, w); }
    for (const s of [nina("9a11", EMB), nina("9a11", NO_DECIR), ses({ grupo: "12a17", sexo: "mujer", ...NO_DECIR }), ses({ grupo: "12a17", sexo: "mujer", edadAdol: "12a14", ...EMB }), ses({ grupo: "12a17", sexo: "mujer", edadAdol: "15a17", ...EMB })]) {
      const p = per(s); const r = M.recomendar(s, R.evaluar(s), ["embarazo", "ninos", "diarrea"]);
      const texto = JSON.stringify([r.tarjetas.map(x => [x.entrada, x.avisos, x.porque]), Object.values(r.cuidados || {})]);
      assert.doesNotMatch(texto, PROHIBIDAS_85, `${s.grupo}/${s.edadNino || s.edadAdol}`);
      assert.ok(!r.tarjetas.some(x => x.entrada.id === "lactancia_6m"), "sin «Dar solo pecho los primeros 6 meses»: " + r.tarjetas.map(x => x.entrada.id));
      if (p.embarazo) assert.ok(M.sugeridas(p).includes("embarazo"), "la sección se sigue sugiriendo");
    }
    // a una adulta embarazada sí le salen (no se quita nada a quien sí le toca)
    const ad = ses({ sexo: "mujer", ...EMB }); const ra = M.recomendar(ad, R.evaluar(ad), ["embarazo"]);
    assert.ok(ra.tarjetas.some(x => x.entrada.id === "mover_embarazo"), "adulta: mover_embarazo");
  });
});

describe("84 · «Cólicos de la regla» no se sugiere a «Hombre»", () => {
  test("no se sugiere, pero se puede buscar (sigue visible)", () => {
    const h = per(ses({ sexo: "hombre" })); const m = per(ses({ sexo: "mujer" }));
    assert.equal(typeof M.noSugerir, "function");
    assert.equal(M.noSugerir("colicos", h), true);
    assert.equal(M.noSugerir("colicos", m), false); assert.equal(M.noSugerir("colicos", per(ses({ sexo: "no_decir" }))), false);
    assert.ok(M.seccionesVisibles(h).some(t => t.id === "colicos"), "a quien la busque no se le esconde");
    assert.ok(!M.sugeridas(h).includes("colicos"));
    // (la sección no tiene sugerir_si: esto lo protege la voz de «Qué cuidar», en tools/e2e_ronda6.py)
  });
});

describe("85a/85b/87 · embarazo en menores (textos aprobados el 2026-11-15)", () => {
  const adol = (edadAdol, c = {}) => ses({ grupo: "12a17", sexo: "mujer", edadAdol, ...EMB, ...c });
  test("87: subpregunta «12 a 14» / «15 a 17» en textos", () => {
    igual(T.edad_adolescente.opciones.map(o => [o.id, o.nombre]), [["12a14", "12 a 14 años"], ["15a17", "15 a 17 años"]]);
    for (const o of T.edad_adolescente.opciones) assert.ok(o.voz && o.voz_otra, o.id);
  });
  test("cuándo aplica: 9 a 14 → «si» (12 a 17 sin contestar la subpregunta también: lado seguro); 15 a 17 → no es menor de 15", () => {
    assert.equal(M.embarazoMenor15(per(nina("9a11", EMB))), "si");
    assert.equal(M.embarazoMenor15(per(adol(null))), "si", "sin contestar «12 a 14 / 15 a 17» se usa el mensaje de menores de 15");
    assert.equal(M.embarazoMenor15(per(adol("12a14"))), "si");
    assert.equal(M.embarazoMenor15(per(adol("15a17"))), "no");
    for (const s of [nina("9a11"), nina("9a11", NO_DECIR), ses({ sexo: "mujer", ...EMB }), ses({ grupo: "12a17", sexo: "mujer" }), nina("6a8", EMB), adol("12a14", { sexo: "hombre" })])
      assert.equal(M.embarazoMenor15(per(s)), "no", JSON.stringify([s.grupo, s.edadNino, s.edadAdol, s.embarazoOpcion, s.sexo]));
    assert.equal(M.embarazoAdolescente(per(adol("15a17"))), "15a17");
    assert.equal(M.embarazoAdolescente(per(adol("12a14"))), "menor15");
    assert.equal(M.embarazoAdolescente(per(nina("9a11", EMB))), "menor15");
    assert.equal(M.embarazoAdolescente(per(ses({ sexo: "mujer", ...EMB }))), null, "a una adulta no");
  });
  test("textos aprobados, tal cual (pantalla, voz y hoja; niña y adulto; 15 a 17 con «esta semana»)", () => {
    const E = T.embarazo_menor; assert.ok(E, "textos.embarazo_menor");
    assert.equal(E.nina.titulo, "Hoy ve al centro de salud");
    igual(E.nina.parrafos, ["Gracias por decirnos. Tú no hiciste nada malo.", "A tu edad, el embarazo necesita revisión desde ya. Ve hoy al centro de salud. Es gratis.",
      "Ahí te atienden con respeto y responden tus dudas. Puedes pedir hablar a solas con la doctora, el doctor o la enfermera.",
      "Si algo te da miedo o quieres hablar con alguien, llama gratis al 079 y elige la opción 1. Te contestan de día y de noche.",
      "Si sangras mucho, te desmayas o te da un ataque, llama ya al 911."]);
    assert.match(E.nina.voz, /marca cero, siete, nueve\. Cuando te contesten, elige la opción uno\./); assert.match(E.nina.voz, /nueve, uno, uno/);
    igual(E.nina.hoja, ["Embarazo: ve HOY al centro de salud. Es gratis.", "Puedes pedir hablar a solas con el personal de salud.", "Líneas: 079, opción 1 (gratis, confidencial, 24 horas) · 911 emergencias."]);
    assert.equal(E.adulto.titulo, "Hoy llévala al centro de salud"); // reespecificado por 97 (2026-11-15)
    assert.ok(E.adulto.parrafos.includes("Ella no tiene la culpa. Lo que más la ayuda es que la acompañen con cariño y sin regaños."));
    assert.match(E.adulto.voz, /marca cero, siete, nueve\. Cuando te contesten, elige la opción uno\./); // reespecificado por 97 (2026-11-15)
    igual(E.adulto.hoja[0], "Embarazo: ir HOY al centro de salud. Es gratis.");
    for (const k of ["nina", "adulto"]) {
      const q = E["15a17"][k];
      assert.ok([q.titulo, ...q.parrafos, q.voz, ...q.hoja].join(" ").includes("esta semana"), "15 a 17 con «esta semana»: " + k);
      assert.doesNotMatch([q.titulo, ...q.parrafos, q.voz, ...q.hoja].join(" "), /\bhoy\b/i, "15 a 17 sin «hoy»: " + k);
    }
  });
  test("ninguno de esos textos dice palabras que marquen el caso o culpen (pantalla, voz y hoja)", () => {
    const todo = JSON.stringify(T.embarazo_menor);
    assert.doesNotMatch(todo, PROHIBIDAS_85);
  });
});
