// La temperatura se mide hasta que se estabiliza, no por tiempo fijo.
// Se prueba la lógica real de js/sensores.js (medir, _emitir, conectarSim, _leerSerial). Lo único sustituido es el
// tiempo: el reloj de MediBotSensores (`S.reloj`) y los temporizadores (mock.timers de node:test), para no esperar
// minutos reales. Las muestras entran por los mismos caminos que en el quiosco: _emitir (simulador) o un puerto serial.
import { test, describe, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { cargar } from "./cargar.mjs";

const plano = (x) => JSON.parse(JSON.stringify(x));
const mediana = (arr) => { const s = [...arr].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

/** Carga sensores.js en un contexto aislado con las API del navegador que usa; los temporizadores pasan por mock.timers. */
function nuevosSensores() {
  const ctx = cargar(["js/sensores.js"], {
    corpus: "ninguno",
    antes: (c) => {
      Object.assign(c, {
        EventTarget, CustomEvent, TextEncoder, TextDecoderStream, navigator: {}, isSecureContext: false,
        setTimeout: (...a) => setTimeout(...a), clearTimeout: (...a) => clearTimeout(...a),
        setInterval: (...a) => setInterval(...a), clearInterval: (...a) => clearInterval(...a)
      });
    }
  });
  const S = ctx.MediBotSensores;
  S.reloj = () => Date.now(); // Date de este módulo, controlado por mock.timers
  return S;
}

/** Mide `tipo` mientras emite una muestra cada `pasoMs` (1 s por omisión): muestra(s) con s en segundos, hasta maxS
    (null = no emitir esa vez). Devuelve el resultado (o el error) y las llamadas a onMuestra con el segundo en que llegaron. */
async function correr(S, tipo, segundos, muestra, maxS, pasoMs = 1000) {
  const llamadas = [];
  const p = S.medir(tipo, segundos, (m) => llamadas.push({ s: Date.now() / 1000, ...m }));
  for (let k = 1; k * pasoMs <= maxS * 1000; k++) {
    mock.timers.tick(pasoMs);
    const m = muestra((k * pasoMs) / 1000);
    if (m) S._emitir(m);
  }
  let resultado = null, error = null;
  try { resultado = await p; } catch (e) { error = e; }
  return { resultado, error, llamadas, fin: llamadas.length ? llamadas[llamadas.length - 1].s : null };
}

/** PRNG con semilla (mulberry32) para que el ruido sea reproducible. */
function azar(semilla) {
  let a = semilla >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

beforeEach(() => mock.timers.enable({ apis: ["setTimeout", "setInterval", "Date"], now: 0 }));
afterEach(() => mock.timers.reset());

/* ===================== Criterio 1: subida exponencial 28 → 39.6 °C ===================== */
describe("Criterio 1 · subida exponencial de 28 a 39.6 °C", () => {
  const A = 39.6 - 28;
  const curva = (tau) => (s) => 39.6 - A * Math.exp(-s / tau);
  // Momento en que el cambio en 30 s cae a ≤ 0.1 °C: v(t) − v(t−30) = A·e^(−t/τ)·(e^(30/τ) − 1) = 0.1
  const tEstable = (tau) => tau * Math.log((A * (Math.exp(30 / tau) - 1)) / 0.1);

  for (const tau of [10, 20, 30]) {
    test(`τ = ${tau} s: valor 39.6 ± 0.2 y no termina antes de estabilizarse`, async () => {
      const S = nuevosSensores(); S._estado("sim", "prueba");
      const v = curva(tau);
      const { resultado, error, llamadas, fin } = await correr(S, "temp", 20, (s) => ({ t: "temp", c: v(s) }), 200);
      assert.equal(error, null, error && error.message);
      const t = tEstable(tau);
      assert.equal(resultado.estado, "valida");
      assert.ok(Math.abs(resultado.valor - 39.6) <= 0.2, `valor ${resultado.valor} fuera de 39.6 ± 0.2`);
      assert.ok(fin >= t, `terminó en ${fin} s, antes de estabilizarse (${t.toFixed(1)} s)`);
      assert.ok(fin <= Math.ceil(t) + 1, `terminó en ${fin} s; ya era estable en ${t.toFixed(1)} s`);
      assert.ok(fin < 180, "debe estabilizarse antes del tope");
      assert.equal(resultado.duracion, fin);
      // El callback trae faltan (entero, hasta el tope de 180 s) y estable; conserva los campos de antes.
      for (const m of llamadas) {
        assert.ok(Number.isInteger(m.faltan), "faltan entero");
        assert.equal(m.faltan, 180 - m.s);
        assert.equal(typeof m.estable, "boolean");
        for (const k of ["valor", "valor2", "calidad", "progreso", "n"]) assert.ok(k in m, `falta ${k}`);
        assert.ok(m.progreso >= 0 && m.progreso <= 1);
      }
      assert.equal(llamadas.filter((m) => m.estable).length, 1, "solo la última muestra es estable");
      assert.equal(llamadas[llamadas.length - 1].estable, true);
      assert.equal(llamadas[0].calidad, 0, "28 °C está fuera de rango (34–41.5 °C): calidad 0");
    });
  }

  test("τ = 30 s con lecturas de un decimal (como manda el firmware): valor 39.6 ± 0.2", async () => {
    const S = nuevosSensores(); S._estado("serial", "prueba");
    const v = curva(30);
    const { resultado, fin } = await correr(S, "temp", 20, (s) => ({ t: "temp", c: Math.round(v(s) * 10) / 10 }), 200);
    assert.equal(resultado.estado, "valida");
    assert.ok(Math.abs(resultado.valor - 39.6) <= 0.2, `valor ${resultado.valor}`);
    assert.ok(fin > 120 && fin < 180, `terminó en ${fin} s`);
  });

  // El firmware emite la temperatura cada ~4–5 s (4 s de oxímetro por vuelta del loop), no a 1 Hz.
  for (const [tau, pasoMs] of [[10, 4000], [20, 4750], [30, 5000]]) {
    test(`τ = ${tau} s con una muestra cada ${pasoMs / 1000} s (cadencia del firmware): 39.6 ± 0.2 y no antes de estabilizarse`, async () => {
      const S = nuevosSensores(); S._estado("serial", "prueba");
      const v = curva(tau);
      const { resultado, fin } = await correr(S, "temp", 20, (s) => ({ t: "temp", c: v(s) }), 200, pasoMs);
      const t = tEstable(tau);
      assert.equal(resultado.estado, "valida");
      assert.ok(Math.abs(resultado.valor - 39.6) <= 0.2, `valor ${resultado.valor}`);
      assert.ok(fin >= t, `terminó en ${fin} s, antes de estabilizarse (${t.toFixed(1)} s)`);
      assert.ok(fin < 180);
    });
  }

  test("la regla vieja (mediana de todo en 20 s) habría dado un valor bajo: el caso que motivó la regla nueva", () => {
    const v = curva(10);
    const viejas = Array.from({ length: 20 }, (_, i) => v(i + 1)).filter((x) => x >= 34);
    assert.ok(mediana(viejas) < 39.2, `mediana vieja ${mediana(viejas).toFixed(2)}`);
  });
});

/* ===================== Criterio 2: ruido que no se estabiliza → inválida ===================== */
describe("Criterio 2 · sin estabilizarse en 180 s la medida es inválida", () => {
  test("ruido ±0.3 °C alrededor de 36.5: resuelve (no rechaza) con estado 'invalida' y valor null a los 180 s", async () => {
    const S = nuevosSensores(); S._estado("sim", "prueba");
    const r = azar(26);
    const { resultado, error, llamadas, fin } = await correr(S, "temp", 20, () => ({ t: "temp", c: 36.5 + (r() - 0.5) * 0.6 }), 200);
    assert.equal(error, null, error && error.message);
    assert.deepEqual(plano(resultado), { estado: "invalida", valor: null, calidad: 0, motivo: "no_estable", duracion: 180 });
    assert.equal(fin, 180);
    assert.equal(llamadas[llamadas.length - 1].faltan, 0);
    assert.ok(llamadas.every((m) => m.estable === false));
  });

  test("si las muestras dejan de llegar, el tope de 180 s también la da por inválida", async () => {
    const S = nuevosSensores(); S._estado("sim", "prueba");
    const r = azar(7);
    const { resultado, error } = await correr(S, "temp", 20, (s) => (s <= 40 ? { t: "temp", c: 36.5 + (r() - 0.5) * 0.6 } : null), 200);
    assert.equal(error, null);
    assert.equal(resultado.estado, "invalida");
    assert.equal(resultado.valor, null);
  });

  test("con menos de 3 muestras buenas en 180 s rechaza como hoy («Señal insuficiente»)", async () => {
    const S = nuevosSensores(); S._estado("sim", "prueba");
    const { error } = await correr(S, "temp", 20, (s) => ({ t: "temp", c: s <= 2 ? 36.5 : 25 }), 200);
    assert.ok(error);
    assert.equal(error.message, "Señal insuficiente");
  });
});

/* ===================== Criterio 3: estable enseguida, pero con 30 s de ventana ===================== */
describe("Criterio 3 · un flujo estable desde el inicio espera la ventana de 30 s", () => {
  test("36.5 constante: no termina antes de 30 s de datos; segundos = 20 no manda", async () => {
    const S = nuevosSensores(); S._estado("sim", "prueba");
    const { resultado, llamadas, fin } = await correr(S, "temp", 20, () => ({ t: "temp", c: 36.5 }), 200);
    assert.equal(resultado.estado, "valida");
    assert.equal(resultado.valor, 36.5);
    assert.equal(resultado.calidad, 1);
    assert.ok(fin - llamadas[0].s >= 30, `terminó a los ${fin - llamadas[0].s} s de la primera muestra`);
    assert.equal(fin, 31, "primera muestra en 1 s + 30 s de ventana");
  });

  test("36.5 ↔ 36.6 (cambio de 0.1 °C justo) cuenta como estable", async () => {
    const S = nuevosSensores(); S._estado("sim", "prueba");
    const { resultado, fin } = await correr(S, "temp", 20, (s) => ({ t: "temp", c: s % 2 ? 36.5 : 36.6 }), 200);
    assert.equal(resultado.estado, "valida");
    assert.equal(fin, 31);
    assert.ok(resultado.valor === 36.5 || resultado.valor === 36.6 || resultado.valor === 36.55);
  });

  test("36.5 ↔ 36.7 (cambio de 0.2 °C) no es estable", async () => {
    const S = nuevosSensores(); S._estado("sim", "prueba");
    const { resultado } = await correr(S, "temp", 20, (s) => ({ t: "temp", c: s % 2 ? 36.5 : 36.7 }), 200);
    assert.equal(resultado.estado, "invalida");
  });

  for (const pasoMs of [4000, 4750, 5000]) {
    test(`36.5 constante con una muestra cada ${pasoMs / 1000} s: válida y con 30 s de ventana`, async () => {
      const S = nuevosSensores(); S._estado("serial", "prueba");
      const { resultado, llamadas, fin } = await correr(S, "temp", 20, () => ({ t: "temp", c: 36.5 }), 200, pasoMs);
      assert.equal(resultado.estado, "valida");
      assert.equal(resultado.valor, 36.5);
      assert.ok(fin - llamadas[0].s >= 30 && fin - llamadas[0].s < 30 + pasoMs / 1000, `ventana ${fin - llamadas[0].s} s`);
    });
  }

  test("un hueco de más de 10 s reinicia la ventana: no termina antes de 30 s de datos tras el hueco", async () => {
    const S = nuevosSensores(); S._estado("serial", "prueba");
    const { resultado, fin } = await correr(S, "temp", 20, (s) => (s <= 20 || s >= 80 ? { t: "temp", c: 36.5 } : null), 200);
    assert.equal(resultado.estado, "valida");
    assert.equal(fin, 110);
  });

  test("una lectura fuera de rango (sensor movido) reinicia la ventana", async () => {
    const S = nuevosSensores(); S._estado("serial", "prueba");
    const { resultado, fin } = await correr(S, "temp", 20, (s) => ({ t: "temp", c: s === 25 ? 33.0 : 36.5 }), 200);
    assert.equal(resultado.estado, "valida");
    assert.equal(fin, 56, "30 s después de la primera lectura buena tras la falla (26 s)");
  });

  test("si el sensor se desconecta a media medición, rechaza enseguida («Sensor desconectado»)", async () => {
    const S = nuevosSensores();
    await S.conectarSim("normal");
    const p = S.medir("temp", 20, () => {});
    mock.timers.tick(10_000);
    await S.desconectar();
    await assert.rejects(p, /Sensor desconectado/);
  });
});

/* ===================== Simulador y Web Serial ===================== */
describe("Simulador y Web Serial con la regla nueva", () => {
  test("simulador «fiebre»: sube hacia 38.7 °C, se estabiliza y da ≈ 38.7", async () => {
    const S = nuevosSensores();
    await S.conectarSim("fiebre");
    mock.timers.tick(90_000); // la persona tarda en llegar a la pantalla; el termómetro empieza a subir al medir
    const llamadas = [];
    const p = S.medir("temp", 20, (m) => llamadas.push({ s: Date.now() / 1000, ...m }));
    for (let s = 0; s < 200 && !llamadas.some((m) => m.estable); s++) mock.timers.tick(1000);
    const r = await p;
    await S.desconectar();
    const dur = llamadas[llamadas.length - 1].s - 90;
    assert.equal(r.estado, "valida");
    assert.ok(Math.abs(r.valor - 38.7) <= 0.1, `valor ${r.valor}`);
    assert.ok(llamadas[0].valor < 36, `la primera lectura (${llamadas[0].valor}) debe venir subiendo`);
    assert.ok(dur > 30 && dur < 120, `tardó ${dur} s`);
  });

  for (const esc of ["normal", "oxigeno_bajo", "pulso_alto", "inestable"]) {
    test(`simulador «${esc}»: la temperatura se estabiliza antes del tope`, async () => {
      const S = nuevosSensores();
      await S.conectarSim(esc);
      const p = S.medir("temp", 20, () => {});
      for (let s = 0; s < 200; s++) mock.timers.tick(1000);
      const r = await p;
      await S.desconectar();
      assert.equal(r.estado, "valida");
      assert.ok(r.valor >= 36.2 && r.valor <= 37, `valor ${r.valor}`);
      assert.ok(r.duracion < 120, `tardó ${r.duracion} s`);
    });
  }

  test("Web Serial: las líneas JSON del puerto llegan a medir('temp') y aplica la misma regla", async () => {
    const S = nuevosSensores();
    let ctrl; const readable = new ReadableStream({ start(c) { ctrl = c; } });
    const puerto = { readable };
    S._leyendo = true; S.port = puerto; S._estado("serial", "prueba");
    S._leerSerial(puerto);
    const llamadas = [];
    const p = S.medir("temp", 20, (m) => llamadas.push({ s: Date.now() / 1000, ...m }));
    const enc = new TextEncoder();
    for (let s = 1; s <= 40 && !llamadas.some((m) => m.estable); s++) {
      mock.timers.tick(1000);
      ctrl.enqueue(enc.encode(`basura\r\n{"t":"pulso","bpm":70,"spo2":97,"q":0.9}\n{"t":"temp","c":${s % 2 ? 36.4 : 36.5}}\n`));
      for (let k = 0; k < 50 && llamadas.length < s; k++) await new Promise((r) => setImmediate(r));
    }
    const r = await p;
    S._leyendo = false; ctrl.close();
    for (let k = 0; k < 20; k++) await new Promise((res) => setImmediate(res));
    assert.equal(r.estado, "valida");
    assert.ok(r.valor === 36.4 || r.valor === 36.5 || r.valor === 36.45, `valor ${r.valor}`);
    assert.equal(llamadas[llamadas.length - 1].s, 31);
  });
});

/* ===================== Criterio 4: pulso y peso sin cambios (caracterización) ===================== */
describe("Criterio 4 · pulso y peso se comportan como antes", () => {
  test("sin sensor, medir rechaza para todos los tipos", async () => {
    const S = nuevosSensores();
    for (const t of ["pulso", "temp", "peso"]) await assert.rejects(S.medir(t, 10, () => {}), /Sin sensor conectado/);
  });

  test("pulso: termina a los `segundos`, mediana de las últimas 10 buenas, calidad por conteo", async () => {
    const S = nuevosSensores(); S._estado("sim", "prueba");
    const muestra = (s) => (s % 4 === 0 ? { t: "temp", c: 36.5 } : { t: "pulso", bpm: 70 + (s % 5), spo2: 96 + (s % 3) * 0.5, q: s < 4 ? 0.3 : 0.9 });
    const { resultado, error, llamadas, fin } = await correr(S, "pulso", 20, muestra, 30);
    assert.equal(error, null);
    assert.ok(fin <= 20, `terminó en ${fin}`);
    const buenas = llamadas.filter((m) => m.calidad >= 0.6);
    const ult = buenas.slice(-10);
    assert.deepEqual(plano(resultado), {
      valor: Math.round(mediana(ult.map((m) => m.valor)) * 10) / 10,
      calidad: Math.min(1, buenas.length / Math.max(3, 20 * 0.8)),
      valor2: Math.round(mediana(ult.map((m) => m.valor2)))
    });
    for (const m of llamadas) {
      assert.deepEqual(Object.keys(m).sort(), ["calidad", "estable", "n", "progreso", "s", "valor", "valor2"]);
      assert.equal(m.estable, false);
    }
  });

  test("pulso: con menos de 3 muestras buenas rechaza «Señal insuficiente»", async () => {
    const S = nuevosSensores(); S._estado("sim", "prueba");
    const { error } = await correr(S, "pulso", 10, () => ({ t: "pulso", bpm: 70, spo2: 97, q: 0.2 }), 15);
    assert.equal(error && error.message, "Señal insuficiente");
  });

  test("peso: termina con 3 muestras estables seguidas; mediana de las buenas; calidad 1", async () => {
    const S = nuevosSensores(); S._estado("sim", "prueba");
    const kg = [0, 60, 66, 69, 70.2, 70.4, 70.3, 70.1, 70.2];
    const { resultado, llamadas, fin } = await correr(S, "peso", 12, (s) => ({ t: "peso", kg: kg[s] ?? 70, estable: s >= 4, n: 16 }), 20);
    assert.equal(fin, 6);
    assert.deepEqual(plano(resultado), { valor: 70.3, calidad: 1 });
    assert.deepEqual(llamadas.map((m) => m.estable), [false, false, false, true, true, true]);
  });

  test("peso: sin 3 estables seguidas termina a los `segundos` con calidad 0.6", async () => {
    const S = nuevosSensores(); S._estado("sim", "prueba");
    const { resultado, fin } = await correr(S, "peso", 12, (s) => ({ t: "peso", kg: 70 + s / 10, estable: s % 2 === 0, n: 16 }), 20);
    assert.ok(fin <= 12);
    const buenas = [0.2, 0.4, 0.6, 0.8, 1.0].map((x) => 70 + x); // s = 2, 4, 6, 8, 10 (a los 12 s se cierra antes de la muestra)
    assert.equal(resultado.calidad, 0.6);
    assert.equal(resultado.valor, Math.round(mediana(buenas) * 10) / 10);
  });
});
