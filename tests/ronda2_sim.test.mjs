// Ronda de correcciones, criterio 34: la simulación es estable. Cada valor simulado regresa al del escenario (ruido acotado,
// sin deriva); el oxígeno nunca pasa de 100; en «normal» nunca sale ámbar ni rojo en 30 minutos simulados.
import { test, describe, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { cargar } from "./cargar.mjs";

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
  S.reloj = () => Date.now();
  return { S, R: ctx.MediBotReglas };
}

/** Corre la simulación `segundos` y junta las muestras de pulso, oxígeno, temperatura y peso. */
async function simular(escenario, segundos) {
  const { S, R } = nuevosSensores();
  const m = { bpm: [], spo2: [], temp: [], kg: [] };
  S.addEventListener("muestra", (e) => { const x = e.detail; if (x.t === "pulso") { m.bpm.push(x.bpm); m.spo2.push(x.spo2); } if (x.t === "temp") m.temp.push(x.c); if (x.t === "peso") m.kg.push(x.kg); });
  await S.conectarSim(escenario);
  if (S._simColocarTermometro) S._simColocarTermometro();
  for (let k = 0; k < segundos; k++) mock.timers.tick(1000);
  await S.desconectar();
  return { m, R };
}

describe("criterio 34 · simulación estable", () => {
  beforeEach(() => mock.timers.enable({ apis: ["setInterval", "setTimeout", "Date"], now: 0 }));
  afterEach(() => mock.timers.reset());

  test("34a: «normal» durante 30 min: pulso y oxígeno siempre en verde, oxígeno ≤ 100, sin deriva", async () => {
    const { m, R } = await simular("normal", 1800);
    assert.ok(m.bpm.length >= 1700, `muestras: ${m.bpm.length}`);
    const fueraPulso = m.bpm.filter(v => R.clasificar("fc", v, "18a59").nivel !== "verde");
    const fueraOx = m.spo2.filter(v => v > 100 || R.clasificar("spo2", v, "18a59").nivel !== "verde");
    assert.deepEqual([fueraPulso.slice(0, 5), fueraOx.slice(0, 5)], [[], []]);
    // la temperatura, ya estabilizada (después del primer minuto), en verde
    const fueraT = m.temp.slice(60).filter(v => R.clasificar("temp", v, "18a59").nivel !== "verde");
    assert.deepEqual(fueraT.slice(0, 5), []);
    // sin deriva: el promedio del último minuto se parece al del primero (±3 lpm, ±1 %)
    const prom = (a) => a.reduce((x, y) => x + y, 0) / a.length;
    assert.ok(Math.abs(prom(m.bpm.slice(0, 60)) - prom(m.bpm.slice(-60))) <= 3, "deriva del pulso");
    assert.ok(Math.abs(prom(m.spo2.slice(0, 60)) - prom(m.spo2.slice(-60))) <= 1, "deriva del oxígeno");
    const kg = m.kg.slice(5); assert.ok(Math.max(...kg) - Math.min(...kg) <= 0.4, "la báscula no se mueve más de 0.2 kg");
  });

  test("34b: en todos los escenarios el oxígeno nunca pasa de 100 ni el pulso se va lejos del escenario", async () => {
    for (const esc of ["normal", "oxigeno_bajo", "fiebre", "pulso_alto", "inestable"]) {
      const { m } = await simular(esc, 600);
      assert.ok(Math.max(...m.spo2) <= 100, `${esc}: oxígeno máximo ${Math.max(...m.spo2)}`);
      const base = m.bpm.slice(5, 20).reduce((x, y) => x + y, 0) / 15;
      const lejos = m.bpm.filter((v, i) => i > 5 && Math.abs(v - base) > (esc === "inestable" ? 25 : 8));
      assert.deepEqual(lejos.slice(0, 5), [], `${esc}: pulso lejos del escenario`);
    }
  });
});
