/* Modo evidencia: lee en vivo el sensor de mano del QRMA (HID 5608:0808) y muestra, sin interpretarlo, lo que manda.
   Propósito: demostrar ante la comunidad y el jurado que el aparato no produce una señal que dependa de la mano.
   Nunca alimenta la orientación: es una exhibición de solo lectura. No se envía ningún byte al aparato. */
(function () {
  "use strict";
  const { h, icono } = window.U;
  const QRMA = { vendorId: 0x5608, productId: 0x0808 };

  class EvidenciaQRMA extends EventTarget {
    constructor() { super(); this.device = null; this.total = 0; this.patrones = new Map(); this.inicio = 0; this.ultimo = null; this._t = null; }
    get disponible() { return "hid" in navigator && window.isSecureContext; }
    async buscar() {
      if (!this.disponible) return null;
      const devs = await navigator.hid.getDevices();
      return devs.find(d => d.vendorId === QRMA.vendorId && d.productId === QRMA.productId) || null;
    }
    async pedir() { // navegador: requiere clic; app de escritorio: sin diálogo
      const devs = await navigator.hid.requestDevice({ filters: [QRMA] });
      return devs[0] || null;
    }
    async conectar(dev) {
      dev = dev || await this.buscar();
      if (!dev) return false;
      if (!dev.opened) await dev.open();
      this.device = dev; this.reiniciar();
      dev.addEventListener("inputreport", (e) => this._reporte(e));
      this.dispatchEvent(new CustomEvent("estado", { detail: "conectado" }));
      return true;
    }
    reiniciar() { this.total = 0; this.patrones.clear(); this.inicio = Date.now(); this.ultimo = null; }
    _reporte(e) {
      const bytes = Array.from(new Uint8Array(e.data.buffer)).map(b => b.toString(16).padStart(2, "0")).join(" ");
      this.total++; this.ultimo = bytes;
      const p = this.patrones.get(bytes) || { n: 0, primero: (Date.now() - this.inicio) / 1000 };
      p.n++; this.patrones.set(bytes, p);
      this.dispatchEvent(new CustomEvent("reporte", { detail: { bytes, total: this.total, distintos: this.patrones.size } }));
    }
    async cerrar() { if (this.device) { try { await this.device.close(); } catch {} this.device = null; this.dispatchEvent(new CustomEvent("estado", { detail: "desconectado" })); } }
  }
  window.MediBotEvidencia = new EvidenciaQRMA();

  /* ---------- Pantalla ---------- */
  function evidencia(ctx) {
    const E = window.MediBotEvidencia;
    const estado = h("p.medida__estado", "Buscando el aparato del QRMA (USB 5608:0808)…");
    const nTotal = h("b", "0"), nSeg = h("b", "0"), nDist = h("b", "0"), ult = h("code.hex", "—"), seg = h("b", "0");
    const listaPat = h("ul.patrones");
    const btnConectar = h("button.btn.btn--secundario", { type: "button", hidden: true, onclick: async () => { try { const d = await E.pedir(); if (d) await E.conectar(d); } catch (err) { estado.textContent = "No se pudo abrir el aparato: " + err.message; } } }, icono("i-usb"), "Conectar el aparato (elige 5608:0808)");
    const btnReiniciar = h("button.btn.btn--fantasma", { type: "button", onclick: () => { E.reiniciar(); pinta(); } }, "Reiniciar conteo");
    let tick = null;
    function pinta() {
      nTotal.textContent = E.total; nDist.textContent = E.patrones.size; ult.textContent = E.ultimo || "—";
      const s = (Date.now() - E.inicio) / 1000; seg.textContent = s.toFixed(0); nSeg.textContent = s > 0 ? (E.total / s).toFixed(1) : "0";
      listaPat.replaceChildren(...[...E.patrones.entries()].slice(0, 12).map(([k, v]) => h("li", h("code.hex", k), ` ×${v.n} (apareció a los ${v.primero.toFixed(1)} s)`)));
    }
    async function arrancar() {
      if (!E.disponible) { estado.textContent = "Este navegador no puede leer dispositivos HID. Usa la aplicación de escritorio o abre MediBot con Edge/Chrome."; return; }
      if (E.device) { estado.textContent = "Aparato del QRMA conectado. Leyendo…"; return; }
      const ok = await E.conectar().catch(() => false);
      if (ok) estado.textContent = "Aparato del QRMA detectado y abierto. Leyendo en vivo (solo lectura).";
      else { estado.textContent = "No encontré el aparato. Conéctalo por USB" + (window.medibotEscritorio ? " y espera unos segundos." : " y pulsa el botón para autorizarlo."); btnConectar.hidden = !!window.medibotEscritorio; }
    }
    E.addEventListener("estado", () => { if (E.device) { estado.textContent = "Aparato del QRMA conectado. Leyendo en vivo (solo lectura)."; btnConectar.hidden = true; } });
    tick = setInterval(() => { if (!document.contains(estado)) { clearInterval(tick); return; } pinta(); }, 500);
    if (window.medibotEscritorio) { const re = setInterval(() => { if (!document.contains(estado)) { clearInterval(re); return; } if (!E.device) arrancar(); }, 5000); }
    arrancar();

    return h("section.pantalla",
      h("div.cabecera", h("div.kicker", "Modo evidencia · ¿qué manda el aparato del QRMA?"), h("h1", "Lo que el aparato dice, tal cual"),
        h("p", "Esta pantalla no interpreta nada. Muestra los bytes que el sensor de mano envía por USB. Si de verdad midiera tu cuerpo, tendrían que cambiar al poner o quitar la mano. Prueba: mano puesta, mano quitada, una naranja.")),
      h("div.tarjeta", estado, h("div.medida__acciones", { style: "margin-top:.6rem" }, btnConectar, btnReiniciar)),
      h("div.rejilla", { style: "margin-top:1rem" },
        h("div.tarjeta", h("h2", "Reportes recibidos"), h("p.medida__valor", nTotal), h("p", nSeg, " por segundo · ", seg, " s escuchando")),
        h("div.tarjeta", h("h2", "Patrones distintos"), h("p.medida__valor", nDist), h("p", "Un sensor real cambia con la mano. Un patrón único que se repite es una señal de presencia, no una medición.")),
        h("div.tarjeta", h("h2", "Último reporte (8 bytes)"), h("p", ult))),
      h("div.tarjeta", { style: "margin-top:1rem" }, h("h2", "Patrones vistos"), listaPat),
      h("div.tarjeta.tarjeta--plana", { style: "margin-top:1rem" },
        h("h2", "Qué significa"),
        h("ul",
          h("li", "Hallazgo del 2026-09-20 en el taller: 1,329 reportes en 40 s, todos iguales (08 a4 01 02 03 04 05 06), con la mano puesta y sin ella."),
          h("li", "Los 'resultados' del QRMA son frases precargadas (R01A…R62B) en su base de datos, elegidas por un número; este aparato no aporta ese número desde el cuerpo."),
          h("li", "MediBot nunca usa estos bytes para orientar a nadie. Sus mediciones vienen del ESP32 con sensores que se pueden comprobar con una pesa y un termómetro."))),
      h("div.acciones", h("button.btn.btn--secundario", { type: "button", onclick: () => { clearInterval(tick); ctx.terminar(); } }, icono("i-back"), "Volver al inicio"))
    );
  }
  window.MediBotPantallas.evidencia = evidencia;
})();
