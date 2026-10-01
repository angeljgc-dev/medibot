/* Voz de MediBot: lee la pantalla en voz alta con las voces de Windows (es-MX, sin internet)
   y acepta respuestas por botones físicos o teclado (para personas que no leen).
   No usa ningún asistente ni servicio en línea: solo speechSynthesis del sistema.
   Entradas aceptadas (todas equivalen a tocar la pantalla):
     - Teclado / botonera USB: S o + = sí · N o - = no · Enter o → = siguiente · ← = atrás · R o espacio = repetir lectura · E = escuchar
     - ESP32: {"t":"boton","id":"si"|"no"|"siguiente"|"atras"|"repetir"} (botones físicos en el quiosco) */
(function () {
  "use strict";
  const { h, icono, $ } = window.U;
  const pref = (k, d) => { try { return localStorage.getItem("medibot." + k) ?? d; } catch { return d; } };
  const guardar = (k, v) => { try { localStorage.setItem("medibot." + k, v); } catch {} };

  const Voz = {
    disponible: "speechSynthesis" in window,
    siempre: pref("voz", "0") === "1",     // leer cada pantalla al entrar
    _voz: null,

    elegirVoz() {
      if (!this.disponible) return null;
      const vs = speechSynthesis.getVoices();
      return vs.find(v => /es-MX/i.test(v.lang) && /sabina/i.test(v.name)) || vs.find(v => /es-MX/i.test(v.lang)) || vs.find(v => /^es/i.test(v.lang)) || null;
    },
    detener() { if (this.disponible) speechSynthesis.cancel(); },
    leer(texto) {
      if (!this.disponible || !texto) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = "es-MX"; u.rate = 0.95; u.pitch = 1;
      const v = this.elegirVoz(); if (v) u.voice = v;
      speechSynthesis.speak(u);
    },

    /** Texto de la pantalla actual, en orden de lectura, sin fuentes ni panel de operador. */
    textoPantalla() {
      const app = $("#app"); if (!app) return "";
      const preguntas = app.querySelectorAll(".pregunta");
      if (preguntas.length) return this.textoPregunta(true);
      const partes = [];
      app.querySelectorAll("h1, h2, p, li, .opcion, .chip, .dato, .medida__valor, .medida__estado, .aviso-incompleto, .aviso-rojo, .nivel-hero, .telefono").forEach(el => {
        if (el.closest("[hidden]") || el.closest(".operador") || el.closest(".fuente") || el.closest(".leyenda") || el.closest("details:not([open])")) return;
        if (el.matches("p, li") && el.closest(".nivel-hero, .telefono, .aviso-incompleto, .aviso-rojo")) return; // ya se lee el contenedor
        const t = el.innerText.replace(/\s+/g, " ").trim();
        if (t && t.length > 1 && !partes.includes(t)) partes.push(t);
      });
      let texto = partes.map(t => /[.!?…:]$/.test(t) ? t : t + ".").join(" ");
      const sig = app.querySelector(".acciones .btn--primario:not([disabled])");
      if (sig) texto += ". Para continuar, toca el botón " + sig.innerText.trim() + " o di siguiente.";
      return texto.slice(0, 3000);
    },
    /** En la pantalla de preguntas lee solo la siguiente sin responder (una a la vez). */
    textoPregunta(conIntro) {
      const app = $("#app");
      const todas = [...app.querySelectorAll(".pregunta")];
      const pendiente = todas.find(p => !p.querySelector('.sino button[aria-pressed="true"]'));
      const intro = conIntro ? (app.querySelector("h1")?.innerText + ". " + (app.querySelector(".cabecera p")?.innerText || "") + " ") : "";
      if (!pendiente) return intro + "Ya respondiste todas las preguntas. Toca Continuar o di siguiente.";
      const i = todas.indexOf(pendiente) + 1;
      const texto = pendiente.querySelector(".pregunta__texto")?.innerText || "";
      const ayuda = pendiente.querySelector(".pregunta__ayuda")?.innerText || "";
      return `${intro}Pregunta ${i} de ${todas.length}. ${texto} ${ayuda} Responde sí o no.`;
    },
    leerPantalla() { this.leer(this.textoPantalla()); },
    leerSiguientePregunta() { const app = $("#app"); if (app && app.querySelector(".pregunta")) this.leer(this.textoPregunta(false)); },

    /* ---------- Acciones por botón físico / teclado ---------- */
    accion(id) {
      const app = $("#app"); if (!app) return;
      const enTexto = document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if (enTexto && id !== "siguiente") return;
      const clic = (el) => { if (el && !el.disabled) { el.click(); return true; } return false; };
      if (id === "repetir") return this.leerPantalla();
      if (id === "si" || id === "no") {
        const pendiente = [...app.querySelectorAll(".pregunta")].find(p => !p.querySelector('.sino button[aria-pressed="true"]'));
        if (pendiente) { clic(pendiente.querySelector(`.sino button[data-v="${id}"]`)); this.leerSiguientePregunta(); return; }
        // fuera del cuestionario: sí = continuar, no = atrás
        if (id === "si") { clic(app.querySelector(".acciones .btn--primario:not([disabled])") || app.querySelector(".reposo")); }
        else clic([...app.querySelectorAll(".acciones .btn--secundario")].find(b => /atr[aá]s/i.test(b.innerText)));
        return;
      }
      if (id === "siguiente") { if (!clic(app.querySelector(".acciones .btn--primario:not([disabled])")) && app.querySelector(".reposo")) app.querySelector(".reposo").click(); return; }
      if (id === "atras") { clic([...app.querySelectorAll(".acciones .btn--secundario")].find(b => /atr[aá]s/i.test(b.innerText))); return; }
    },

    instalar() {
      if (this.disponible) speechSynthesis.getVoices(); // precarga
      // Teclado / botonera USB (encoder de botones arcade envía teclas)
      document.addEventListener("keydown", e => {
        const k = e.key;
        const enTexto = document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
        if (enTexto && k !== "Enter") return;
        const mapa = { s: "si", S: "si", "+": "si", n: "no", N: "no", "-": "no", Enter: "siguiente", ArrowRight: "siguiente", ArrowLeft: "atras", r: "repetir", R: "repetir", " ": "repetir", e: "escuchar", E: "escuchar" };
        const id = mapa[k]; if (!id) return;
        if (id === "escuchar") { this.leerPantalla(); e.preventDefault(); return; }
        if (k === " " && !enTexto) e.preventDefault();
        this.accion(id);
      });
      // Botones físicos del ESP32
      window.MediBotSensores.addEventListener("muestra", e => { const m = e.detail; if (m.t === "boton" && m.id) this.accion(m.id); });
      // Al responder una pregunta con el dedo, en modo voz se lee la siguiente
      document.addEventListener("click", e => { if (this.siempre && e.target.closest(".pregunta .sino button")) setTimeout(() => this.leerSiguientePregunta(), 150); });
      // Botón "Escuchar" de la barra
      const btn = $('[data-accion="escuchar"]'); if (btn) btn.hidden = !this.disponible;
    }
  };
  window.MediBotVoz = Voz;
})();
