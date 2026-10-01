/* Utilidades mínimas de DOM (sin framework). Todo el contenido se inserta como texto o nodos, nunca como HTML. */
(function () {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";

  /** h("button.btn.btn--primario", { onclick, "aria-label": "x" }, "texto", nodo, [nodos]) */
  function h(tag, attrs, ...children) {
    const parts = tag.split(".");
    const el = document.createElement(parts[0] || "div");
    if (parts.length > 1) el.className = parts.slice(1).join(" ");
    if (attrs && typeof attrs === "object" && !(attrs instanceof Node) && !Array.isArray(attrs)) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === null || v === undefined || v === false) continue;
        if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
        else if (k === "class") el.className += (el.className ? " " : "") + v;
        else if (k === "dataset") Object.assign(el.dataset, v);
        else if (v === true) el.setAttribute(k, "");
        else el.setAttribute(k, String(v));
      }
    } else if (attrs !== undefined) {
      children.unshift(attrs);
    }
    append(el, children);
    return el;
  }

  function append(el, children) {
    for (const c of children.flat(Infinity)) {
      if (c === null || c === undefined || c === false) continue;
      el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return el;
  }

  /** Icono del sprite: icono("i-heart", "ico") */
  function icono(id, cls) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", cls || "ico");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const use = document.createElementNS(SVG_NS, "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  function fmt(n, dec) {
    if (n === null || n === undefined || Number.isNaN(n)) return "—";
    return Number(n).toLocaleString("es-MX", { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
  }

  function limitar(v, min, max) { return Math.min(max, Math.max(min, v)); }

  /** Enlace de fuente (texto + URL). Si no hay URL, avisa que está pendiente. */
  function fuenteEl(f) {
    if (!f || !f.nombre) return h("span.fuente", "Fuente pendiente");
    if (!f.url) return h("span.fuente", "Fuente: " + f.nombre + " (URL pendiente)");
    return h("span.fuente", "Fuente: ", h("a", { href: f.url, target: "_blank", rel: "noopener" }, f.nombre));
  }

  function esperar(ms) { return new Promise(r => setTimeout(r, ms)); }

  window.U = { h, append, icono, fmt, limitar, fuenteEl, esperar, $: (s, r) => (r || document).querySelector(s), $$: (s, r) => Array.from((r || document).querySelectorAll(s)) };
})();
