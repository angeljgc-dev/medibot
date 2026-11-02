// Pruebas del semáforo actual: deben seguir pasando después de agregar el corpus.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cargar, sesionBase, valida } from "./cargar.mjs";

const ctx = cargar();
const R = ctx.MediBotReglas;
const medidas = (fc, spo2, temp = null) => ({ fc: valida(fc), spo2: valida(spo2), temp: temp == null ? { valor: null, estado: null } : valida(temp) });

test("pulso y oxígeno normales dan verde", () => {
  assert.equal(R.evaluar(sesionBase(ctx, { medidas: medidas(72, 97) })).nivel, "verde");
});
test("todo omitido nunca da verde", () => {
  const r = R.evaluar(sesionBase(ctx));
  assert.equal(r.nivel, "ambar");
  assert.equal(r.datosIncompletos, true);
});
test("oxígeno 92 da ámbar y 88 da rojo", () => {
  assert.equal(R.evaluar(sesionBase(ctx, { medidas: medidas(72, 92) })).nivel, "ambar");
  assert.equal(R.evaluar(sesionBase(ctx, { medidas: medidas(72, 88) })).nivel, "rojo");
});
test("pulso 125 da ámbar con prisa hoy, nunca rojo", () => {
  const r = R.evaluar(sesionBase(ctx, { medidas: medidas(125, 97) }));
  assert.equal(r.nivel, "ambar");
  assert.equal(r.prisa, "hoy");
});
test("una alarma roja con mediciones normales da rojo", () => {
  const s = sesionBase(ctx, { medidas: medidas(72, 97) });
  s.alarma.pecho = true;
  assert.equal(R.evaluar(s).nivel, "rojo");
});
test("temperatura 39.6 da rojo", () => {
  assert.equal(R.evaluar(sesionBase(ctx, { medidas: medidas(72, 97, 39.6) })).nivel, "rojo");
});
test("niños nunca reciben verde por números", () => {
  const r = R.evaluar(sesionBase(ctx, { grupo: "nino", medidas: medidas(100, 98, 36.5) }));
  assert.notEqual(r.nivel, "verde");
});
test("IMC de sobrepeso no cambia el semáforo", () => {
  const r = R.evaluar(sesionBase(ctx, { medidas: medidas(72, 97), peso: { valor: 80 }, talla: { valor: 165 } }));
  assert.equal(r.nivel, "verde");
});
test("adulto mayor con IMC menor a 22 da ámbar", () => {
  const r = R.evaluar(sesionBase(ctx, { grupo: "60mas", medidas: medidas(70, 96), peso: { valor: 50 }, talla: { valor: 155 } }));
  assert.equal(r.nivel, "ambar");
});
