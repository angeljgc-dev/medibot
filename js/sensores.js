/* Capa de sensores v0.3: Web Serial (ESP32/Arduino), simulador y captura manual.
   Protocolo (docs/protocolo_serial.md): una línea JSON por muestra, 115200 baudios.
     {"t":"pulso","bpm":72,"spo2":97,"q":0.82}          ~1 Hz mientras hay dedo; q = calidad 0..1
     {"t":"temp","c":36.4}
     {"t":"peso","kg":70.2,"estable":true,"n":16}        solo con ≥ 5 kg en la plataforma
     {"t":"bascula","estado":"vacia|subiendo|estable|bajando"}
     {"t":"cal","factor":21034.5,"cero":-8231}           al arrancar y tras calibrar
     {"t":"ack","cmd":"tara","ok":true}                   respuesta a comandos TARA / CAL <kg>
     {"t":"hola","fw":"0.2"}
   Detección automática: se prueban los puertos autorizados (primero los de fabricantes conocidos) y se
   conserva el que emite JSON válido de MediBot en menos de 4 s. Reintentos periódicos mientras no haya sensor. */
(function () {
  "use strict";

  const VENDEDORES = [0x303a, 0x10c4, 0x1a86, 0x0403, 0x2341]; // Espressif, CP210x, CH340, FTDI, Arduino
  const RANGOS = { pulso: [30, 220], spo2: [70, 100], temp: [34, 41.5], peso: [5, 300], talla: [40, 250] };
  const mediana = (arr) => { const s = [...arr].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

  class Sensores extends EventTarget {
    constructor() {
      super();
      this.modo = "desconectado"; // desconectado | serial | sim
      this.port = null; this.reader = null; this.writer = null; this._leyendo = false; this._simTimer = null;
      this._oyentes = new Set(); this._probando = false; this._vigilando = false; this._rondasFallidas = 0;
      this._reintento = null; this._lecturaTerminada = null;
    }

    get disponibleSerial() { return "serial" in navigator && window.isSecureContext; }

    _emitir(muestra) {
      muestra.ts = Date.now();
      for (const fn of this._oyentes) { try { fn(muestra); } catch (e) { console.error(e); } }
      this.dispatchEvent(new CustomEvent("muestra", { detail: muestra }));
    }
    _estado(modo, detalle) {
      if (this.modo === modo && modo === "desconectado") return; // sin duplicados
      this.modo = modo;
      this.dispatchEvent(new CustomEvent("estado", { detail: { modo, detalle } }));
    }

    /* ---------- Web Serial ---------- */
    /** Botón del operador: pide un puerto (en la app de escritorio no muestra diálogo) y lo prueba. */
    async conectarSerial() {
      if (!this.disponibleSerial) throw new Error("Este navegador no puede leer el USB. Usa la aplicación de escritorio MediBot.exe.");
      if (this._probando) throw new Error("Ya se está buscando el sensor; espera unos segundos.");
      await this.desconectar();
      const port = await navigator.serial.requestPort(); // requiere gesto de usuario
      this._probando = true;
      try { if (!(await this._probar(port, 5000))) throw new Error("Ese puerto no responde como MediBot. Revisa que el ESP32 tenga el firmware cargado."); }
      finally { this._probando = false; }
    }

    /** Reconexión automática sin gesto: al arrancar, al enchufar (evento connect) y cada 30 s mientras no haya sensor.
        Prueba primero los puertos de fabricantes conocidos; los demás solo tras 2 rondas fallidas (abrir un COM ajeno puede resetear un Arduino). */
    async reconectarSerial() {
      if (!this.disponibleSerial || this.modo !== "desconectado" || this._probando) return false;
      this._probando = true;
      try {
        const ports = await navigator.serial.getPorts();
        const vid = (p) => { try { return p.getInfo().usbVendorId; } catch { return undefined; } };
        const rango = (p) => { const i = VENDEDORES.indexOf(vid(p)); return i < 0 ? 99 : i; };
        let candidatos = [...ports].sort((a, b) => rango(a) - rango(b));
        if (this._rondasFallidas < 2) candidatos = candidatos.filter(p => rango(p) < 99 || vid(p) === undefined);
        for (const p of candidatos) { if (await this._probar(p)) { this._rondasFallidas = 0; return true; } }
        this._rondasFallidas++;
        return false;
      } finally { this._probando = false; }
    }

    /** Abre el puerto y espera una muestra válida; si no llega, lo cierra. */
    async _probar(p, ms = 4000) {
      try { await p.open({ baudRate: 115200 }); } catch (e) { console.warn("No se pudo abrir el puerto:", e.message); return false; }
      let ok = false;
      const oyente = () => { ok = true; };
      this._oyentes.add(oyente);
      this._leyendo = true;
      this._leerSerial(p); // emite "muestra" por cada línea JSON válida
      const inicio = Date.now();
      while (!ok && Date.now() - inicio < ms) await new Promise(r => setTimeout(r, 100));
      this._oyentes.delete(oyente);
      if (ok) { this.port = p; try { this.writer = p.writable ? p.writable.getWriter() : null; } catch { this.writer = null; } this._estado("serial", "detectado"); return true; }
      await this._cerrarPuerto(p); return false;
    }

    async _leerSerial(p) {
      if (!p || !p.readable) { this._leyendo = false; return; }
      let terminar; this._lecturaTerminada = new Promise(r => { terminar = r; });
      const decoder = new TextDecoderStream();
      const cerrado = p.readable.pipeTo(decoder.writable).catch(() => {});
      this.reader = decoder.readable.getReader();
      let buffer = "";
      try {
        while (this._leyendo) {
          const { value, done } = await this.reader.read();
          if (done) break;
          buffer += value;
          if (buffer.length > 4096) buffer = ""; // basura binaria sin salto de línea: no acumular
          const lineas = buffer.split(/\r?\n/);
          buffer = lineas.pop();
          for (const l of lineas) {
            const t = l.trim(); if (!t || t[0] !== "{") continue;
            try { const m = JSON.parse(t); if (m && typeof m.t === "string") this._emitir(m); } catch { /* línea no JSON: ignorar */ }
          }
        }
      } catch (e) {
        if (this._leyendo) console.warn("Lectura serial interrumpida:", e.message);
      } finally {
        try { this.reader.releaseLock(); } catch {}
        await cerrado;
        terminar();
        if (this.port === p && this.modo === "serial") { this.port = null; this.writer = null; this._estado("desconectado", "puerto cerrado"); this._programarReintento(); }
      }
    }

    async _cerrarPuerto(p) {
      this._leyendo = false;
      if (this.reader) { try { await this.reader.cancel(); } catch {} }
      if (this._lecturaTerminada) { try { await this._lecturaTerminada; } catch {} }
      this.reader = null;
      if (this.writer) { try { this.writer.releaseLock(); } catch {} this.writer = null; }
      try { await p.close(); } catch (e) { console.warn("Al cerrar el puerto:", e.message); }
    }

    /** Detección al enchufar/desenchufar y reintento periódico. Idempotente. */
    vigilarUSB() {
      if (!this.disponibleSerial || this._vigilando) return;
      this._vigilando = true;
      navigator.serial.addEventListener("connect", () => this._reintentarConEspera());
      navigator.serial.addEventListener("disconnect", (e) => { if (this.port && e.target === this.port) this.desconectar(); });
      setInterval(() => { if (this.modo === "desconectado" && !this._probando) this.reconectarSerial().catch(() => {}); }, 30_000);
    }
    /** Tras "connect", getPorts() puede venir vacío unos instantes (electron#29366): reintentos con espera creciente. */
    async _reintentarConEspera() {
      for (const ms of [500, 1000, 2000, 5000, 10000]) {
        if (this.modo !== "desconectado") return;
        if (await this.reconectarSerial().catch(() => false)) return;
        await new Promise(r => setTimeout(r, ms));
      }
    }
    _programarReintento() { clearTimeout(this._reintento); this._reintento = setTimeout(() => this._reintentarConEspera(), 2000); }

    /** Envía un comando al ESP32 (TARA, CAL <kg>). */
    async enviar(comando) {
      if (this.modo !== "serial" || !this.writer) throw new Error("No hay ESP32 conectado.");
      await this.writer.write(new TextEncoder().encode(comando.trim() + "\n"));
    }

    /* ---------- Simulador (demo sin hardware) ---------- */
    /** escenario: "normal" | "oxigeno_bajo" | "fiebre" | "pulso_alto" | "inestable" (para demostrar la repetición). */
    async conectarSim(escenario = "normal") {
      await this.desconectar();
      this.escenario = escenario;
      this._estado("sim", "simulación: " + escenario);
      const E = {
        normal:       { bpm: 68 + Math.random() * 14, spo2: 96 + Math.random() * 3, temp: 36.3 + Math.random() * .6 },
        oxigeno_bajo: { bpm: 92, spo2: 91.5, temp: 36.8 },
        fiebre:       { bpm: 98, spo2: 96, temp: 38.7 },
        pulso_alto:   { bpm: 126, spo2: 97, temp: 36.9 },
        inestable:    { bpm: 75, spo2: 96, temp: 36.6 }
      }[escenario] || {};
      let bpm = E.bpm, spo2 = E.spo2, temp = E.temp, kg = 58 + Math.random() * 30;
      const salto = escenario === "inestable" ? 1 : 0;
      let n = 0;
      this._simTimer = setInterval(() => {
        n++;
        bpm += (Math.random() - .5) * 2; spo2 += (Math.random() - .5) * .6; temp += (Math.random() - .5) * .05;
        const q = n < 4 ? .3 + n * .15 : Math.min(1, .75 + Math.random() * .25);
        const desvio = salto ? (Math.floor(n / 30) % 2 ? 18 : 0) : 0;
        this._emitir({ t: "pulso", bpm: Math.round(bpm + desvio), spo2: Math.round(spo2 * 10) / 10, q });
        this._emitir({ t: "temp", c: Math.round(temp * 10) / 10 });
        // báscula simulada: los primeros 3 s "subiendo", luego estable
        this._emitir({ t: "peso", kg: Math.round((kg + (Math.random() - .5) * (n > 3 ? .1 : 3)) * 10) / 10, estable: n > 3, n: 16 });
      }, 1000);
    }

    async desconectar() {
      if (this._simTimer) { clearInterval(this._simTimer); this._simTimer = null; }
      const p = this.port; this.port = null;
      if (p) await this._cerrarPuerto(p); else this._leyendo = false;
      this._estado("desconectado", "");
    }

    /**
     * Mide durante hasta `segundos`; llama onMuestra({valor, valor2, calidad, progreso, n}) cada muestra.
     * tipo: "pulso" (bpm + spo2), "temp", "peso", "talla". Para "peso" termina antes con 3 muestras estables seguidas.
     * Resuelve con la mediana de las muestras buenas (pulso: últimas 10).
     */
    medir(tipo, segundos, onMuestra) {
      return new Promise((resolve, reject) => {
        if (this.modo === "desconectado") return reject(new Error("Sin sensor conectado"));
        const buenas = []; const inicio = Date.now(); let establesSeguidas = 0;
        const [min, max] = RANGOS[tipo] || [-Infinity, Infinity];
        const terminar = (err) => {
          this._oyentes.delete(oyente); clearTimeout(timer);
          if (err) return reject(err);
          if (buenas.length < 3) return reject(new Error("Señal insuficiente"));
          const ult = tipo === "pulso" ? buenas.slice(-10) : buenas;
          const r = { valor: Math.round(mediana(ult.map(b => b.valor)) * 10) / 10, calidad: Math.min(1, buenas.length / Math.max(3, segundos * .8)) };
          if (tipo === "pulso") r.valor2 = Math.round(mediana(ult.map(b => b.valor2)));
          if (tipo === "peso") r.calidad = establesSeguidas >= 3 ? 1 : .6;
          resolve(r);
        };
        const oyente = (m) => {
          if (m.t !== tipo) return;
          let valor, valor2, calidad = 1;
          if (tipo === "pulso") { valor = m.bpm; valor2 = m.spo2; calidad = typeof m.q === "number" ? m.q : 1; }
          else if (tipo === "temp") { valor = m.c; }
          else if (tipo === "peso") { valor = m.kg; calidad = m.estable === false ? .4 : 1; }
          else if (tipo === "talla") { valor = m.cm; }
          if (typeof valor !== "number" || Number.isNaN(valor)) return;
          const enRango = valor >= min && valor <= max && (tipo !== "pulso" || (valor2 >= RANGOS.spo2[0] && valor2 <= RANGOS.spo2[1]));
          if (!enRango) calidad = 0;
          if (calidad >= .6) buenas.push({ valor, valor2 });
          if (tipo === "peso") { establesSeguidas = (m.estable && enRango) ? establesSeguidas + 1 : 0; }
          const progreso = Math.min(1, (Date.now() - inicio) / (segundos * 1000));
          if (onMuestra) onMuestra({ valor, valor2, calidad, progreso, n: buenas.length, estable: !!m.estable });
          if (tipo === "peso" && establesSeguidas >= 3) terminar();
        };
        this._oyentes.add(oyente);
        const timer = setTimeout(() => terminar(), segundos * 1000);
      });
    }
  }

  window.MediBotSensores = new Sensores();
})();
