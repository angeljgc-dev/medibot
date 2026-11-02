// Ronda 5 (criterio 77): pictogramas en el estilo «A · Bordado». Revisa lo que se dibuja de verdad (los SVG sueltos, el
// sprite de assets/pictos y el que va dentro de index.html) y el token del contorno en claro, oscuro e impresión.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { cargar } from "./cargar.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (p) => readFileSync(join(RAIZ, p), "utf8");
const PALETA = ["#B3261E", "#2F4F8F", "#D49A2A", "#3E7D4F", "#8A5A3C", "#FFF8EE", "#7FA7D9", "#2B1D16"]; // grana, añil, ocre, verde, piel, crema, azul agua, contorno
const VAR = "var(--picto-contorno, #2B1D16)";
const GLIFOS = ["p-escuchar", "p-imprimir", "p-siguiente", "p-anterior", "p-si", "p-no", "p-terminar", "p-alerta", "p-nivel-verde", "p-nivel-ambar", "p-nivel-rojo", "p-hojita"];
const indice = JSON.parse(leer("assets/pictos/indice.json"));
const IDS = Object.keys(indice.pictos);
const simbolos = (txt) => Object.fromEntries([...txt.matchAll(/<symbol id="(p-[a-z0-9-]+)"([^>]*)>([\s\S]*?)<\/symbol>/g)].map(m => [m[1], { attrs: m[2], cuerpo: m[3] }]));
const sprite = simbolos(leer("assets/pictos/sprite.svg"));
const html = leer("index.html");
const spriteHtml = simbolos(html.slice(html.indexOf("<!-- sprite:inicio -->"), html.indexOf("<!-- sprite:fin -->")));
const valores = (cuerpo, attr) => [...cuerpo.matchAll(new RegExp(`\\s${attr}="([^"]*)"`, "g"))].map(m => m[1].trim());

describe("criterio 77 · pictogramas «A · Bordado»", () => {
  test("los 75 ids: índice = archivos sueltos = sprite = sprite de index.html", () => {
    assert.equal(IDS.length, 75, "75 pictogramas en indice.json");
    const archivos = readdirSync(join(RAIZ, "assets/pictos")).filter(f => /^p-.*\.svg$/.test(f)).map(f => f.replace(/\.svg$/, "")).sort();
    assert.deepEqual(archivos, [...IDS].sort(), "un archivo por id, sin sobrantes");
    assert.deepEqual(Object.keys(sprite).sort(), [...IDS].sort(), "sprite.svg");
    assert.deepEqual(Object.keys(spriteHtml).sort(), [...IDS].sort(), "sprite de index.html");
    for (const id of IDS) assert.equal(spriteHtml[id].cuerpo, sprite[id].cuerpo, "index.html trae el mismo dibujo que sprite.svg: " + id);
  });

  test("viewBox 0 0 64 64; contorno variable (dibujos) o currentColor (glifos); solo colores de la paleta", () => {
    for (const id of IDS) {
      const s = sprite[id]; const glifo = GLIFOS.includes(id);
      assert.match(s.attrs, /viewBox="0 0 64 64"/, id);
      const g = s.cuerpo.match(/<g ([^>]*)>/); assert.ok(g, "grupo raíz: " + id);
      assert.ok(g[1].includes(`stroke="${glifo ? "currentColor" : VAR}"`), `${id}: el contorno es ${glifo ? "currentColor" : VAR}`);
      assert.ok(g[1].includes(`stroke-width="${glifo ? "4.5" : "2.5"}"`) && g[1].includes('stroke-linecap="round"') && g[1].includes('stroke-linejoin="round"'), `${id}: trazo base ${glifo ? "4.5" : "2.5"}, puntas y uniones redondas`);
      for (const v of [...valores(s.cuerpo, "fill"), ...valores(s.cuerpo, "stroke")]) {
        const ok = glifo ? ["currentColor", "none"].includes(v) : v === "none" || v === VAR || PALETA.includes(v.toUpperCase());
        assert.ok(ok, `${id}: color fuera de la paleta «${v}»`);
      }
      assert.doesNotMatch(s.cuerpo, /<(text|image|linearGradient|radialGradient|filter|style|script|foreignObject)\b|opacity|url\(/i, id + ": sin texto, degradados, filtros ni opacidad");
      const svg = leer(`assets/pictos/${id}.svg`);
      assert.match(svg, /viewBox="0 0 64 64"/, "archivo suelto: " + id);
      assert.ok(svg.includes(sprite[id].cuerpo.replace(/^<title>[^<]*<\/title>/, "")), "el archivo suelto dibuja lo mismo que el sprite: " + id);
    }
  });

  test("formas del semáforo y de la alerta (sistema.md §6.10): distintas por forma, no solo por color", () => {
    assert.match(sprite["p-nivel-verde"].cuerpo, /<circle/); assert.match(sprite["p-nivel-verde"].cuerpo, /<path/);   // ✓ en círculo
    assert.equal((sprite["p-nivel-ambar"].cuerpo.match(/<circle/g) || []).length, 2, "círculo con punto");
    assert.doesNotMatch(sprite["p-nivel-rojo"].cuerpo, /<circle[^>]*r="(1\d|2\d)/, "el rojo no es un círculo grande");
    assert.match(sprite["p-nivel-rojo"].cuerpo, /<path d="M\s*[\d.]+\s+[\d.]+\s*L\s*[\d.]+\s+[\d.]+\s*(H\s*[\d.]+|L\s*[\d.]+\s+[\d.]+)\s*z"/i, "triángulo cerrado de 3 vértices");
    assert.match(sprite["p-nivel-rojo"].cuerpo, /<path d="M32 \d+ v\d+"/, "con la barra del «!»"); assert.match(sprite["p-nivel-rojo"].cuerpo, /<circle[^>]*fill="currentColor"/, "y su punto");
    assert.match(sprite["p-alerta"].cuerpo, /<path[^>]*d="M\s*32[^"]*"/, "la alerta es un rombo con vértice arriba al centro");
    assert.match(sprite["p-llamar-911"].cuerpo, /<circle[^>]*fill="#B3261E"/, "911: círculo grana");
  });

  test("todos los ids que usa la app existen (js/*.js, index.html, data/pictos.js); ningún mapa apunta a un id que no hay", () => {
    const usados = new Set();
    for (const f of readdirSync(join(RAIZ, "js")).filter(f => f.endsWith(".js"))) for (const m of leer("js/" + f).matchAll(/["'](p-[a-z0-9]+(?:-[a-z0-9]+)*)["']/g)) usados.add(m[1]);
    const fuera = html.replace(/<!-- sprite:inicio -->[\s\S]*?<!-- sprite:fin -->/, "");
    for (const m of fuera.matchAll(/#(p-[a-z0-9-]+)/g)) usados.add(m[1]);
    const P = cargar(["data/pictos.js"]).MediBotData.pictos;
    for (const [k, mapa] of Object.entries(P)) if (mapa && typeof mapa === "object" && k !== "titulos") for (const v of Object.values(mapa)) if (typeof v === "string") usados.add(v);
    assert.ok(usados.size >= 40, "se encontraron los ids que usa la app: " + usados.size);
    for (const id of usados) assert.ok(IDS.includes(id), "id que usa la app y no existe: " + id);
    assert.deepEqual(Object.keys(P.titulos).sort(), [...IDS].sort(), "data/pictos.js nombra a los 75");
    assert.match(String(indice.estilo), /Bordado/, "indice.json con la versión de estilo nueva");
  });

  test("token --picto-contorno: claro #2B1D16, oscuro crema, impresión oscuro; contraste ≥ 3:1 contra el papel", () => {
    const tok = leer("css/tokens.css"); const doc = leer("docs/diseno/tokens.css");
    const lum = (hex) => { const c = hex.match(/[0-9a-f]{2}/gi).map(x => parseInt(x, 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
    const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
    const decl = [...tok.matchAll(/--picto-contorno:\s*(#[0-9A-Fa-f]{6})/g)].map(m => m[1].toUpperCase());
    assert.ok(decl.length >= 4, "claro, oscuro por el sistema, oscuro forzado e impresión: " + decl);
    assert.equal(decl[0], "#2B1D16", "claro");
    assert.ok(decl.slice(1).some(v => lum(v) > 0.6), "oscuro: contorno crema");
    for (const l of doc.split("\n").filter(l => l.includes("--picto-contorno"))) assert.ok(tok.includes(l.trim()), "docs/diseno/tokens.css = css/tokens.css: " + l.trim());
    assert.ok(doc.includes("--picto-contorno"), "el token también está en docs/diseno/tokens.css");
    assert.ok(contraste("#2B1D16", "#F6EFE3") >= 3, "claro sobre el papel");
    const oscuro = decl.slice(1).find(v => lum(v) > 0.6);
    assert.ok(contraste(oscuro, "#1E1512") >= 3, "oscuro sobre #1E1512: " + contraste(oscuro, "#1E1512").toFixed(1));
    assert.doesNotMatch(leer("css/app.css"), /--picto-contorno:\s*#/, "sin hex del contorno en app.css");
  });
});
