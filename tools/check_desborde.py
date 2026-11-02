"""«Nada desbordado ni descolocado» (criterio 27): desborde y alineación de MediBot en todas las pantallas y anchos.
Uso (desde la carpeta MediBot):  PYTHONUTF8=1 python tools/check_desborde.py [--capturas DIR] [--json SALIDA] [--rapido]
Requiere Playwright para Python con chromium. Levanta `python -m http.server` y lo detiene por su PID.

Recorre cada pantalla (también diálogos, el panel del operador y los estados de una pantalla: alarma con un «sí» rojo,
ideas en «Cuidado con esto» y en «Cuándo ir», medicinas en lista, el formulario del operador…) a 320, 375, 768, 1280,
1440 y 1920 px, con letra normal y «Letra grande», en claro y en oscuro. Falla (código 1) si:
  - document.documentElement.scrollWidth (o body.scrollWidth) > innerWidth: la página se mueve de lado;
  - un elemento visible se sale de la ventana o del área de contenido (lo que se sale queda cortado: overflow-x hidden);
  - una caja (.tarjeta, .idea, .hoja, .opciones…) es más ancha por dentro que por fuera (su contenido se sale);
  - un texto queda cortado dentro de una caja con overflow oculto;
  - DESCOLOCADO: en una misma fila visual, elementos del mismo tipo (botones con botones, campos con campos, etiquetas con
    etiquetas, tarjetas con tarjetas) no tienen el mismo borde superior (±2 px), o se enciman;
  - los botones de la botonera no miden lo mismo de alto (±1 px) o miden menos de 64 px; un botón de la cabecera o de un
    diálogo mide menos de 64 px (sistema.md §1.6); un diálogo abierto no cabe en la ventana.
--rapido: solo 375 y 1280 px (para revisar mientras se trabaja; verify.py usa la corrida completa)."""
import argparse, json, pathlib, socket, subprocess, sys, time
from playwright.sync_api import sync_playwright

raiz = pathlib.Path(__file__).resolve().parent.parent
# Pantallas y estados. «resultado-rojo»: medición urgente (sin ideas). «resultado-fiebre»: ámbar con embarazo y medicinas.
PANTALLAS = ["reposo", "bienvenida", "sobreTi", "sobreTi-completo", "medicinas", "medicinas-lista", "alarma", "alarma-rojo",
             "mediciones", "mediciones-resumen", "cuidar", "cuidar-abierto", "confirmar", "resultado", "resultado-rojo", "resultado-fiebre",
             "fichas", "fichas-no", "fichas-cuidado", "fichas-cuando", "resumen", "bebe", "dlg-borrar", "dlg-acerca", "dlg-apoyo",
             "operador", "verificacion", "evidencia", "lugar", "lugar-datos", "reposo-escritorio", "dlg-cerrar"]
# «reposo-escritorio» y «dlg-cerrar» (criterio 76): el reposo de la app de escritorio, con «Cerrar MediBot» y su diálogo
# (se simula window.medibotEscritorio solo para esos dos estados)
VENTANAS = [(320, 640), (375, 812), (768, 1024), (1280, 800), (1440, 900), (1920, 1080)]
ESCALAS = ["md", "lg"]   # «Letra grande»
TEMAS = ["light", "dark"]
TOQUE_MIN, BOTONERA_MIN, TOLERANCIA = 64, 64, 2   # sistema.md §1.6: toques de 64 px o más

MEDIR = """() => {
  const de = document.documentElement, vw = de.clientWidth, vh = innerHeight;
  const nombre = (e) => `${e.tagName}${typeof e.className === "string" && e.className.trim() ? "." + e.className.trim().split(/\\s+/).join(".") : ""}`;
  const visible = (e) => !e.closest("[hidden], dialog:not([open]), .oculto, .salto") && getComputedStyle(e).visibility !== "hidden" && getComputedStyle(e).display !== "none";
  const dlg = document.querySelector("dialog[open]");
  const raizVista = dlg || document.body;
  const todos = [...raizVista.querySelectorAll("*")].filter(e => !(e instanceof SVGElement && e.tagName !== "svg"));
  const cont = document.querySelector(".contenido").getBoundingClientRect();
  const fuera = todos.map(e => ({ e, r: e.getBoundingClientRect() }))
    .filter(({ e, r }) => r.width > 1 && r.height > 1 && visible(e) && getComputedStyle(e).position !== "fixed" && (
      r.right > vw + 0.5 || r.left < -0.5 ||
      (!dlg && e.closest(".contenido") && e !== document.querySelector(".contenido") && (r.right > cont.right + 0.5 || r.left < cont.left - 0.5))))
    .sort((a, b) => b.r.right - a.r.right).slice(0, 5)
    .map(({ e, r }) => `${nombre(e)} left=${Math.round(r.left)} right=${Math.round(r.right)}`);
  const cajas = [...raizVista.querySelectorAll(".tarjeta, .bloque, .pasos, .dos, .hoja, .hoja__dos, .ideas, .idea, .idea__cuerpo, .acciones, .heroe, .tabla, .datos, .opciones, .grupos, .sugerencia, .medicion, .caja-911, .cuando-ir, .alternativas, .pregunta, .botonera, .cabecera, .fisico, .opcion, .dialogo, .operador__grupo, .formulario, .medidas")]
    .filter(e => visible(e) && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX === "visible")
    .slice(0, 5).map(e => `${nombre(e)} ${e.scrollWidth}>${e.clientWidth}`);
  // Texto cortado: una caja con overflow oculto cuyo contenido es más ancho o más alto que ella. No cuenta el texto oculto a
  // propósito para lectores de pantalla (1 × 1 px con clip, p. ej. «Terminar» del botón de la cabecera con letra grande a 375)
  const soloLector = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width <= 1 && r.height <= 1 && cs.position === "absolute" && (cs.clip !== "auto" || cs.clipPath !== "none"); };
  const cortados = todos.filter(e => visible(e) && !["HTML", "BODY", "svg", "DIALOG"].includes(e.tagName) && !e.matches(".contenido, .progreso, .progreso *, .marca__cruz, .oculto, .fantasma__texto, .marca__nombre") && !soloLector(e)
      && /hidden|clip/.test(getComputedStyle(e).overflowX + getComputedStyle(e).overflowY) && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1) && e.textContent.trim())
    .slice(0, 5).map(e => `${nombre(e)} ${e.scrollWidth}x${e.scrollHeight} > ${e.clientWidth}x${e.clientHeight}`);
  // DESCOLOCADO: filas visuales dentro de contenedores de fila; se comparan elementos del mismo tipo
  const FILAS = ".botonera, .cabecera__fin, .dialogo__acciones, .opciones, .dos, .columnas, .grupos, .grupo__secciones, .sn, .acciones, .medida__acciones, .medicion__acciones, .operador__fila, .operador__rejilla, .miniaturas, .reposo__medidas, .rejilla, .hoja__dos, .alternativas ul, .cuando-ir, .lineas, .manual";
  const tipo = (e) => e.tagName + "." + (typeof e.className === "string" ? e.className.trim().split(/\\s+/)[0] : "");
  const descolocados = [];
  const revisarFila = (cont, hijos) => {
    const porTipo = new Map();
    for (const e of hijos) { if (!visible(e) || getComputedStyle(e).position === "absolute") continue; const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue; const k = tipo(e); if (!porTipo.has(k)) porTipo.set(k, []); porTipo.get(k).push({ e, r }); }
    for (const [k, lista] of porTipo) {
      lista.sort((a, b) => a.r.top - b.r.top);
      const filas = [];
      for (const x of lista) {
        const f = filas.find(f => f.some(y => Math.min(x.r.bottom, y.r.bottom) - Math.max(x.r.top, y.r.top) > 0.5 * Math.min(x.r.height, y.r.height)));
        if (f) f.push(x); else filas.push([x]);
      }
      for (const f of filas) {
        if (f.length < 2) continue;
        const tops = f.map(x => x.r.top); const dif = Math.max(...tops) - Math.min(...tops);
        if (dif > %TOL%) descolocados.push(`${nombre(cont)} > ${k}: bordes superiores difieren ${Math.round(dif)} px`);
        f.sort((a, b) => a.r.left - b.r.left);
        for (let i = 1; i < f.length; i++) if (f[i - 1].r.right > f[i].r.left + 1) descolocados.push(`${nombre(cont)} > ${k}: se enciman (${Math.round(f[i - 1].r.right - f[i].r.left)} px)`);
      }
    }
  };
  for (const c of raizVista.querySelectorAll(FILAS)) if (visible(c)) revisarFila(c, [...c.children]);
  for (const f of raizVista.querySelectorAll(".formulario")) if (visible(f)) {
    for (const sel of [":scope > .campo > label", ":scope > .campo > input", ":scope > .campo > .ayuda"]) revisarFila(f, [...f.querySelectorAll(sel)]);
  }
  const caja = (b) => { const r = b.getBoundingClientRect(); return { nombre: b.dataset.boton || b.dataset.accion || b.textContent.trim().slice(0, 20), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
  const conCaja = (e) => visible(e) && e.getClientRects().length > 0;
  const botonera = [...document.querySelectorAll(".botonera > button")].filter(conCaja).map(caja);
  const otros = [...document.querySelectorAll(".cabecera button, .cerrar-app" + (dlg ? ", dialog[open] button" : ""))].filter(conCaja).map(caja);
  let dialogo = null;
  if (dlg) { const r = dlg.getBoundingClientRect(); dialogo = { cabe: r.top >= -0.5 && r.left >= -0.5 && r.right <= vw + 0.5 && r.bottom <= vh + 0.5, h: Math.round(r.height) }; }
  const cab = document.querySelector(".cabecera").getBoundingClientRect();
  return { desborde: Math.max(de.scrollWidth, document.body.scrollWidth) - innerWidth, fuera, cajas, cortados, descolocados: [...new Set(descolocados)].slice(0, 6),
    botonera, otros, dialogo, barra: { w: Math.round(cab.width), h: Math.round(cab.height) } };
}""".replace("%TOL%", str(TOLERANCIA))


def puerto_libre():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0)); return s.getsockname()[1]


def ir(page, destino):
    """Navega con la API de la app. Desde «resultado» la sesión trae mediciones y, salvo en el rojo, temas elegidos.
    Devuelve la pantalla que mostró la app (para revisar que es la pedida)."""
    page.evaluate("""(d) => {
      const M = window.MediBot, med = v => ({ valor: v, origen: "manual", calidad: null, estado: "valida" });
      // terminar() regresa a letra normal (criterio 49): la escala de esta corrida se vuelve a poner después de cada terminar()
      const T = () => { M.terminar(); document.documentElement.dataset.scale = window.__escala || "md"; window.dispatchEvent(new Event("resize")); };
      document.querySelectorAll("dialog[open]").forEach(x => x.close());
      if (window.__stubEscritorio) { delete window.medibotEscritorio; delete window.__stubEscritorio; }
      if (d === "reposo-escritorio" || d === "dlg-cerrar") {
        window.__stubEscritorio = true; window.medibotEscritorio = { esApp: true, version: "prueba", salida: "Ctrl+Alt+Shift+Q", salir() {}, imprimir: async () => ({ ok: true, motivo: "" }) };
        T(); if (d === "dlg-cerrar") M.pedirCerrarApp(); return;
      }
      T(); M.ir("bienvenida");
      const s = M.sesion;
      if (d === "reposo") { T(); return; }
      if (d === "operador") { M.abrirOperador(); return; }
      if (["confirmar", "resultado", "resultado-rojo", "resultado-fiebre", "fichas", "fichas-no", "fichas-cuidado", "fichas-cuando", "resumen", "mediciones-resumen"].includes(d)) {
        Object.assign(s, { paraQuien: "yo", grupo: "18a59", peso: { valor: 70, origen: "manual" }, talla: { valor: 170, origen: "manual" }, medicinas: ["presion", "azucar"] });
        if (d === "resultado-fiebre") Object.assign(s, { embarazo: true, embarazoOpcion: "si", embarazoRespondido: true });
        Object.assign(s.medidas, { fc: med(d === "resultado-fiebre" ? 112 : 78), spo2: med(d === "resultado-rojo" ? 84 : 97), temp: med(d === "resultado-fiebre" ? 38.6 : 36.6) });
        for (const q of window.MediBotData.alarma.preguntas) s.alarma[q.id] = false;
        if (d === "fichas-cuidado" || d === "fichas-cuando") Object.assign(s, { embarazoOpcion: "lactancia", embarazoRespondido: true, lactancia: true, medicinas: ["ninguna"], categorias: ["digestion", "ninos"] });
        else if (d !== "resultado-rojo") s.categorias.push(...window.MediBotData.corpus.temas.filter(x => x.clase !== "situacion").slice(0, 3).map(x => x.id));
      }
      if (d === "sobreTi-completo") Object.assign(s, { paraQuien: "yo", grupo: "18a59" });
      if (d === "medicinas-lista") Object.assign(s, { paraQuien: "yo", grupo: "18a59", medicinas: ["presion"] });
      if (d === "cuidar-abierto") Object.assign(s, { paraQuien: "yo", grupo: "18a59", categorias: ["digestion"] });
      if (d === "mediciones-resumen") { M.ir("mediciones", { medicion: 3 }); return; }
      if (d.startsWith("dlg-")) { M.ir("sobreTi"); if (d === "dlg-borrar") M.pedirBorrar(); else document.querySelector(d === "dlg-acerca" ? "[data-accion=acerca]" : "[data-accion=apoyo]").click(); return; }
      const base = d.startsWith("resultado") ? "resultado" : d.split("-")[0];
      M.ir(base);
      if (d === "alarma-rojo") window.MediBotVoz.accion("si");
    }""", destino)
    page.wait_for_timeout(120)
    if destino in ("fichas-no", "fichas-cuidado", "fichas-cuando"):
        objetivo = {"fichas-no": None, "fichas-cuidado": "cuidado", "fichas-cuando": "cuando"}[destino]
        if objetivo is None: page.click(".botonera [data-boton=rojo]")
        else:
            for _ in range(20):
                if page.locator(f"[data-item={objetivo}]:not([hidden])").count(): break
                page.click(".botonera [data-boton=verde]")
        page.wait_for_timeout(80)
    if destino == "lugar-datos":
        page.wait_for_function("() => window.MediBotData.clues && document.querySelector('.lugar__municipios .opcion')")
        page.locator(".lugar__municipios .opcion").first.click()
        page.locator(".lugar__unidades .opcion").last.click()
        page.wait_for_selector(".formulario")
    elif destino == "lugar":
        page.wait_for_function("() => window.MediBotData.clues && document.querySelector('.lugar__municipios .opcion')")
    page.evaluate("() => window.MediBotVoz && window.MediBotVoz.detener()")
    real = page.evaluate("() => document.querySelector('dialog[open]') ? 'dlg-' + document.querySelector('dialog[open]').id.replace('dlg-', '') : window.MediBot.pantalla")
    esperado_base = destino if destino.startswith("dlg-") else destino.split("-")[0] if not destino.startswith("resultado") else "resultado"
    return destino if real == esperado_base else real


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--capturas", type=pathlib.Path)
    ap.add_argument("--json", type=pathlib.Path)
    ap.add_argument("--rapido", action="store_true")
    a = ap.parse_args()
    if a.capturas: a.capturas.mkdir(parents=True, exist_ok=True)
    ventanas = [v for v in VENTANAS if v[0] in (375, 1280)] if a.rapido else VENTANAS

    puerto = puerto_libre()
    srv = subprocess.Popen([sys.executable, "-m", "http.server", str(puerto), "--bind", "127.0.0.1"], cwd=raiz,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"servidor http.server PID={srv.pid} puerto={puerto}")
    fallas, datos, n = [], {}, 0
    try:
        time.sleep(0.8)
        with sync_playwright() as p:
            nav = p.chromium.launch()
            for tema in TEMAS:
                for escala in ESCALAS:
                    for (ancho, alto) in ventanas:
                        page = nav.new_page(viewport={"width": ancho, "height": alto}, color_scheme=tema)
                        # criterio 79: de fábrica es claro; el oscuro se fuerza como lo elegiría el operador en el panel
                        page.add_init_script("try { localStorage.clear(); } catch (e) { console.warn(e.message); }" + (" try { localStorage.setItem('medibot.theme', 'dark'); } catch (e) { console.warn(e.message); }" if tema == "dark" else ""))
                        page.goto(f"http://127.0.0.1:{puerto}/index.html")
                        page.wait_for_function("() => window.MediBot")
                        page.evaluate("(e) => { window.__escala = e; document.documentElement.dataset.scale = e; window.MediBotVoz.leer = function (t) { this.ultimoTexto = String(t); }; }", escala)
                        for nombre_base in PANTALLAS:
                            real = ir(page, nombre_base)
                            nombre = nombre_base + ("+letra" if escala == "lg" else "") + ("+oscuro" if tema == "dark" else "")
                            m = page.evaluate(MEDIR); n += 1
                            esc_real = page.evaluate("() => document.documentElement.dataset.scale")
                            datos[f"{ancho}/{nombre}"] = m
                            mal = []
                            if real != nombre_base: mal.append(f"la app mostró «{real}»")
                            if esc_real != escala: mal.append(f"se midió con letra «{esc_real}», no «{escala}»")
                            tema_real = page.evaluate("() => document.documentElement.dataset.theme")
                            if tema_real != tema: mal.append(f"se midió en tema «{tema_real}», no «{tema}»")
                            if m["desborde"] > 0: mal.append(f"scrollWidth pasa de innerWidth por {m['desborde']} px")
                            if m["fuera"]: mal.append("se salen de la ventana o del contenido: " + "; ".join(m["fuera"]))
                            if m["cajas"]: mal.append("contenido más ancho que su caja: " + "; ".join(m["cajas"]))
                            if m["cortados"]: mal.append("texto cortado: " + "; ".join(m["cortados"]))
                            if m["descolocados"]: mal.append("DESCOLOCADO: " + "; ".join(m["descolocados"]))
                            bt = m["botonera"]
                            if bt:
                                altos = [b["h"] for b in bt]; tops = [b["y"] for b in bt]
                                if max(altos) - min(altos) > 1: mal.append(f"botonera con alturas distintas {altos}")
                                if max(tops) - min(tops) > TOLERANCIA: mal.append(f"botonera con bordes superiores distintos {tops}")
                                if min(altos) < BOTONERA_MIN: mal.append(f"botonera con un botón de {min(altos)} px (< {BOTONERA_MIN})")
                            for b in m["otros"]:
                                if b["w"] < TOQUE_MIN or b["h"] < TOQUE_MIN: mal.append(f"botón {b['nombre']} mide {b['w']}x{b['h']} (< {TOQUE_MIN})")
                            if m["dialogo"] and not m["dialogo"]["cabe"]: mal.append("el diálogo no cabe en la ventana")
                            estado = "OK" if not mal else "FALLA"
                            print(f"{ancho:>5} px  {nombre:<34} desborde={m['desborde']:>3} salidos={len(m['fuera'])} cajas={len(m['cajas'])} cortados={len(m['cortados'])} "
                                  f"descolocados={len(m['descolocados'])} botonera={'x'.join(str(b['h']) for b in bt) or '-'}  {estado}")
                            for x in mal: fallas.append(f"{ancho}/{nombre}: {x}")
                            if a.capturas and (mal or nombre_base in ("resultado-rojo", "fichas", "lugar-datos")):
                                page.screenshot(path=str(a.capturas / f"desborde_{ancho}_{nombre.replace('+', '_')}.png"))
                        page.close()
            nav.close()
    finally:
        srv.terminate(); srv.wait(timeout=10)
        print(f"servidor PID={srv.pid} detenido (código {srv.returncode})")

    if a.json: a.json.write_text(json.dumps(datos, indent=1, ensure_ascii=False), encoding="utf-8")
    for f in fallas: print("FALLA:", f)
    print(f"{n} vistas medidas ({len(PANTALLAS)} pantallas o estados × {len(ventanas)} anchos × {len(ESCALAS)} tamaños de letra × {len(TEMAS)} temas)")
    print("DESBORDE: OK" if not fallas else f"DESBORDE: FALLÓ ({len(fallas)})")
    sys.exit(1 if fallas else 0)


if __name__ == "__main__":
    main()
