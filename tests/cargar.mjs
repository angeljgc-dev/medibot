// Carga los scripts del navegador (data/*.js y js/*.js puros) en un contexto de Node para probarlos.
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
export const HAY_CORPUS_REAL = existsSync(join(RAIZ, "data/corpus.js"));
export const FIXTURE = "tests/fixtures/corpus_min.js";

/**
 * cargar(archivosExtra, { corpus })
 *   corpus: "real" (data/corpus.js, si existe), "fixture" (tests/fixtures/corpus_min.js) o "ninguno" (sin corpus:
 *   el motor debe usar data/fichas.js como respaldo). Por omisión "real".
 * Los archivos que no existen se saltan (por ejemplo js/recomendaciones.js antes de escribirlo).
 */
export function cargar(archivos = [], { corpus = "real", antes } = {}) {
  const ctx = { console };
  ctx.window = ctx;
  if (typeof antes === "function") antes(ctx); // p. ej. simular el puente de Electron (window.medibotEscritorio)
  vm.createContext(ctx);
  const base = ["data/textos.js", "data/rangos.js", "data/alarma.js", "data/fichas.js"];
  if (corpus === "real") base.push("data/corpus.js");
  else if (corpus === "fixture") base.push(FIXTURE);
  base.push("js/util.js", "js/reglas.js", "js/recomendaciones.js");
  for (const rel of [...new Set([...base, ...archivos])]) {
    const ruta = join(RAIZ, rel);
    if (!existsSync(ruta)) continue;
    vm.runInContext(readFileSync(ruta, "utf8"), ctx, { filename: rel });
  }
  return ctx;
}

/** Sesión mínima con todas las preguntas de alarma respondidas "no". */
export function sesionBase(ctx, cambios = {}) {
  const s = {
    paraQuien: "yo", grupo: "18a59", edadNino: null, embarazo: null, embarazoRespondido: false, embarazoOpcion: null,
    peso: { valor: null, origen: null }, talla: { valor: null, origen: null },
    medidas: { fc: { valor: null, estado: null }, spo2: { valor: null, estado: null }, temp: { valor: null, estado: null } },
    alarma: {}, categorias: [], medicinas: []
  };
  for (const p of ctx.MediBotData.alarma.preguntas) s.alarma[p.id] = false;
  return Object.assign(s, cambios);
}

export const valida = (valor) => ({ valor, estado: "valida", origen: "manual" });
