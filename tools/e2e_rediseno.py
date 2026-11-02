"""Pruebas en el navegador del rediseño v0.5 (docs/diseno/sistema.md, criterios 20–31) y de los paquetes A1–A10 del
rediseño (A1 simulación, A2 imprimir, A3 medicinas, A4 regresar, A5 alarma, A6 rojo, A7 colores, A8 voz corta, A9
temperatura, A10 peso). Una sección por paquete; cada revisión dice qué comprueba.
Uso (desde la carpeta MediBot):  PYTHONUTF8=1 python tools/e2e_rediseno.py [--capturas DIR]
Requiere Playwright para Python con chromium. Levanta `python -m http.server` y lo detiene por su PID."""
import argparse, json, pathlib, re, socket, subprocess, sys, time
from playwright.sync_api import sync_playwright

raiz = pathlib.Path(__file__).resolve().parent.parent
fallas: list[str] = []
FRASES_PROHIBIDAS = [r"\best[aá]s san[oa]\b", r"\btodo est[aá] bien\b", r"\best[aá]s bien\b", r"\bcura\w*", r"\bnormal\b"]
EMOJI = re.compile("[\U0001F000-\U0001FAFF☀-➿⬀-⯿️]")


def revisa(cond: bool, msg: str) -> None:
    print(("  OK   " if cond else "  FALLA ") + msg)
    if not cond: fallas.append(msg)


PREPARAR = """(c) => {
  const M = window.MediBot; document.querySelectorAll("dialog[open]").forEach(d => d.close());
  M.terminar(); M.ir("bienvenida");
  const s = M.sesion; Object.assign(s, JSON.parse(JSON.stringify(c.sesion || {})));
  if (!c.alarmaVacia) for (const p of window.MediBotData.alarma.preguntas) if (!(p.id in (c.sesion.alarma || {}))) s.alarma[p.id] = false;
  const v = (x) => ({ valor: x, estado: "valida", origen: "manual", calidad: 1 });
  const m = c.medidas || [79, 97, 36.6];
  ["fc", "spo2", "temp"].forEach((k, i) => { s.medidas[k] = m[i] == null ? { valor: null, origen: null, calidad: null, estado: null } : v(m[i]); });
  M.ir(c.pantalla, c.opciones);
  return M.pantalla;
}"""
ADULTO = {"paraQuien": "yo", "grupo": "18a59", "embarazoOpcion": "no", "embarazoRespondido": True, "medicinas": ["ninguna"], "categorias": ["diarrea", "dolor_cabeza"]}
MAMA = {"paraQuien": "yo", "grupo": "18a59", "embarazoOpcion": "lactancia", "embarazoRespondido": True, "embarazo": False, "lactancia": True, "medicinas": ["ninguna"], "categorias": ["digestion", "ninos"]}


def puerto_libre() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0)); return s.getsockname()[1]


def main() -> None:
    ap = argparse.ArgumentParser(); ap.add_argument("--capturas", type=pathlib.Path); a = ap.parse_args()
    if a.capturas: a.capturas.mkdir(parents=True, exist_ok=True)
    puerto = puerto_libre()
    srv = subprocess.Popen([sys.executable, "-m", "http.server", str(puerto), "--bind", "127.0.0.1"], cwd=raiz, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"servidor http.server PID={srv.pid} puerto={puerto}")
    url = f"http://127.0.0.1:{puerto}/index.html"
    errores: list[str] = []
    voces: list[str] = []
    try:
        time.sleep(0.8)
        with sync_playwright() as p:
            nav = p.chromium.launch()

            def pagina(ancho=1280, alto=800, init=None, reloj=False, tema="light"):
                ctx = nav.new_context(viewport={"width": ancho, "height": alto}, color_scheme=tema)
                # Sin bocinas: la voz del sistema no habla (sus eventos llegarían en tiempo real y moverían los tiempos de
                # inactividad del reloj falso); lo dicho se revisa en MediBotVoz.ultimoTexto, que no cambia.
                ctx.add_init_script("window.__impresiones = 0; window.print = () => { window.__impresiones++; }; try { localStorage.clear(); } catch (e) { console.warn(e.message); }"
                                    " if (window.speechSynthesis) { speechSynthesis.speak = () => {}; }" + (" try { localStorage.setItem('medibot.theme', 'dark'); } catch (e) { console.warn(e.message); }" if tema == "dark" else ""))  # criterio 79: de fábrica es claro; el oscuro se fuerza como lo elegiría el operador
                if init: ctx.add_init_script(init)
                pg = ctx.new_page()
                if reloj: pg.clock.install()
                pg.on("console", lambda m: errores.append(m.text) if m.type == "error" else None)
                pg.on("pageerror", lambda e: errores.append(str(e)))
                pg.goto(url); pg.wait_for_function("() => window.MediBot")
                return pg

            def ir(pg, pantalla, sesion, medidas=None, opciones=None, alarma_vacia=False):
                r = pg.evaluate(PREPARAR, {"pantalla": pantalla, "sesion": sesion, "medidas": medidas, "opciones": opciones, "alarmaVacia": alarma_vacia})
                pg.wait_for_timeout(80); return r

            voz = lambda pg: pg.evaluate("() => window.MediBotVoz.textoPantalla()")
            ultimo = lambda pg: pg.evaluate("() => window.MediBotVoz.ultimoTexto")
            def accion(pg, ident):
                pg.evaluate("(id) => window.MediBotVoz.accion(id)", ident); pg.wait_for_timeout(40)
                t = ultimo(pg); voces.append(t); return t
            sesion = lambda pg: pg.evaluate("() => JSON.parse(JSON.stringify(window.MediBot.sesion))")
            pantalla = lambda pg: pg.evaluate("() => window.MediBot.pantalla")
            texto_boton = lambda pg, color: pg.evaluate("(c) => { const b = document.querySelector(`.botonera [data-boton=${c}] .largo`); return b ? b.textContent : null; }", color)
            def captura(pg, nombre):
                if a.capturas: pg.screenshot(path=str(a.capturas / f"e2e_{nombre}.png"))
            dentro = lambda pg, sel: pg.evaluate("""(sel) => { const e = document.querySelector(sel); if (!e) return false; const r = e.getBoundingClientRect();
                const b = document.querySelector('.botonera').getBoundingClientRect();
                return r.top >= 0 && r.left >= 0 && r.right <= innerWidth && r.bottom <= Math.min(innerHeight, b.top) + 0.5; }""", sel)

            # ------------------------------------------------------------------------------------------------ A1
            print("A1 · simulación: panel oculto, solo con el gesto; terminar la apaga; DEMOSTRACIÓN en todo")
            pg = pagina()
            revisa(pg.locator(".operador").count() == 0, "en el reposo no existe el panel del operador")
            pie = pg.evaluate("() => document.getElementById('pie').textContent")
            revisa("simulaci" not in pie.lower() and not re.search(r"v\d+\.\d", pie), "el pie no dice «simulación» ni la versión: " + " ".join(pie.split())[:90])
            pg.keyboard.press("Control+Alt+Shift+KeyO"); pg.wait_for_timeout(100)
            revisa(pantalla(pg) == "operador" and pg.locator(".operador").is_visible(), "Ctrl+Alt+Shift+O abre el panel del operador")
            pg.evaluate("() => window.MediBot.terminar()")
            logo = pg.locator(".marca").bounding_box()
            pg.mouse.move(logo["x"] + 20, logo["y"] + 20); pg.mouse.down(); pg.wait_for_timeout(5300); pg.mouse.up()
            revisa(pantalla(pg) == "operador", "mantener el logo 5 s abre el panel")
            pg.select_option(".operador select", "normal"); pg.wait_for_timeout(200)
            revisa(pg.evaluate("() => window.MediBot.sensores.modo") == "sim", "simulación encendida desde el panel")
            pg.click("text=Cerrar panel"); pg.wait_for_timeout(100)
            revisa(pantalla(pg) == "reposo" and pg.evaluate("() => window.MediBot.sensores.modo") == "sim" and pg.locator("#demo").is_visible(), "«Cerrar panel» vuelve al reposo con la simulación y la franja DEMOSTRACIÓN")
            demo_vis = []
            for pan in ["bienvenida", "sobreTi", "medicinas", "alarma", "mediciones", "cuidar", "confirmar", "resultado", "fichas", "resumen"]:
                pg.evaluate("(p) => { const M = window.MediBot; Object.assign(M.sesion, { paraQuien: 'yo', grupo: '18a59', categorias: ['diarrea'] }); for (const q of window.MediBotData.alarma.preguntas) M.sesion.alarma[q.id] = false; M.ir(p); }", pan)
                demo_vis.append(pg.locator("#demo").is_visible())
            revisa(all(demo_vis), f"franja «DEMOSTRACIÓN» visible en las 10 pantallas del flujo ({demo_vis.count(True)}/10)")
            pg.emulate_media(media="print")
            revisa(pg.evaluate("() => getComputedStyle(document.getElementById('demo')).display") != "none", "y en la hoja impresa (emulateMedia print)")
            pg.emulate_media(media="screen")
            pg.evaluate("() => { const M = window.MediBot; M.ir('sobreTi'); Object.assign(M.sesion, { paraQuien: 'yo', grupo: '18a59' }); M.ir('mediciones', { medicion: 2 }); }")  # criterio 41: se pesa en «Te medimos»
            pg.wait_for_function("() => window.MediBot.sesion.peso.origen", timeout=25000)
            revisa(sesion(pg)["peso"]["origen"] == "simulado", f"una medida simulada se guarda con origen «simulado»: {sesion(pg)['peso']}")
            pg.evaluate("() => window.MediBot.terminar()"); pg.wait_for_timeout(100)
            revisa(pg.evaluate("() => window.MediBot.sensores.modo") == "desconectado", "terminar() apaga la simulación")
            msg = pg.evaluate("() => window.MediBot.sensores.medir('temp', 1).then(() => 'midió', e => e.message)")
            revisa(msg == "Sin sensor conectado", f"en la sesión nueva, medir sin reconectar falla: «{msg}»")
            pg.close()
            pe = pagina(init="window.medibotEscritorio = { esApp: true, version: 'prueba', salida: 'Ctrl+Alt+Shift+Q', salir() {}, imprimir: async () => ({ ok: true, motivo: '' }) };")
            r = pe.evaluate("() => { try { window.MediBot.sensores.conectarSim('normal'); return 'conectó'; } catch (e) { return e.message; } }")
            revisa("panel del operador" in r and pe.evaluate("() => window.MediBot.sensores.modo") == "desconectado", f"en el quiosco, la simulación no se enciende fuera del panel: «{r}»")
            pe.close()

            # ------------------------------------------------------------------------------------------------ A10
            print("A10 · peso confiable")
            pg = pagina()
            pg.keyboard.press("Control+Alt+Shift+KeyO"); pg.select_option(".operador select", "normal"); pg.wait_for_timeout(100)
            pg.evaluate("() => { const M = window.MediBot; M.ir('bienvenida'); Object.assign(M.sesion, { paraQuien: 'yo', grupo: '18a59' }); M.ir('mediciones', { medicion: 2 }); }")  # criterio 41
            pg.wait_for_function("() => /Pesando|Leyendo|Casi/.test(document.querySelector('[data-medicion=peso] .medicion__estado').textContent)", timeout=10000)
            pg.fill("#peso", "95"); pg.wait_for_timeout(14000)  # la báscula termina de pesar (12 s) con el 95 ya escrito
            revisa(sesion(pg)["peso"] == {"valor": 95, "origen": "manual"} and pg.input_value("#peso") == "95", f"escrito a mano mientras la báscula pesaba, el peso se queda: {sesion(pg)['peso']}")
            pg.evaluate("() => { const M = window.MediBot; M.ir('bienvenida'); Object.assign(M.sesion, { paraQuien: 'nino', grupo: 'nino', edadNino: '2a5', peso: { valor: null, origen: null } }); M.ir('mediciones', { medicion: 2 }); }")
            pg.wait_for_timeout(4000)
            revisa(sesion(pg)["peso"]["valor"] is None, "con un niño o niña no se pesa solo")
            # la báscula da 67.8 kg (otra persona encima): se sustituye solo la lectura del sensor, no la regla que se prueba
            pg.evaluate("() => { const S = window.MediBot.sensores; const orig = S.medir.bind(S); S.medir = (t, s, cb) => t === 'peso' ? Promise.resolve({ valor: 67.8, calidad: 1 }) : orig(t, s, cb); }")
            accion(pg, "si"); pg.wait_for_timeout(200)  # el verde de «Te medimos» pesa (antes: botón «Pesar con la báscula» en «Sobre ti»)
            revisa(sesion(pg)["peso"]["valor"] is None and "¿Se subió alguien más?" in ultimo(pg), f"67.8 kg para 2 a 5 años no se guarda y la voz pregunta «¿Se subió alguien más?» ({ultimo(pg)[:60]})")
            revisa("± 0.5" not in pg.inner_text("body"), "el DOM no dice «± 0.5»")
            pg.close()

            # ------------------------------------------------------------------------------------------------ A3
            print("A3 · medicinas en positivo y recorrido que no pisa lo tocado")
            pg = pagina()
            ir(pg, "medicinas", {"paraQuien": "yo", "grupo": "18a59", "medicinas": []})
            g = voz(pg)
            revisa("¿Tomas alguna medicina" in g and "¿No tomas" not in g, "la primera voz pregunta en positivo: " + g[:90])
            t = accion(pg, "si")
            revisa("ninguna" not in sesion(pg)["medicinas"] and "¿Tomas pastilla para la presión?" in t, "S: no marca «Ninguna» y la voz sigue con la primera familia: " + t[:80])
            revisa(pg.locator(".opcion--preguntando").count() == 1 and dentro(pg, ".opcion--preguntando"), "una sola opción marcada como «preguntando» y a la vista")
            ir(pg, "medicinas", {"paraQuien": "yo", "grupo": "18a59", "medicinas": []})
            t = accion(pg, "no")
            revisa(sesion(pg)["medicinas"] == ["ninguna"] and "vesícula" in t, "N: «Ninguna» y la voz pasa a las condiciones: " + t[:80])
            ir(pg, "medicinas", {"paraQuien": "yo", "grupo": "18a59", "medicinas": []})
            accion(pg, "si")
            pg.click(".opcion:has-text('Para la presión')"); pg.click(".opcion:has-text('Para el azúcar')")
            accion(pg, "si")
            revisa(sorted(sesion(pg)["medicinas"]) == ["azucar", "presion"], f"tocar presión y azúcar y luego S: siguen las dos, sin «ninguna»: {sesion(pg)['medicinas']}")
            for _ in range(20):
                u = ultimo(pg)
                t = accion(pg, "si" if ("presión" in u or "azúcar" in u) and "Seguimos" not in u else "no")
                if "Seguimos" in t: break
            revisa("Elegiste: para la presión y para el azúcar" in t, "el cierre dice lo elegido: " + t[:80])
            ir(pg, "medicinas", {"paraQuien": "yo", "grupo": "18a59", "medicinas": [], "condiciones": []}, opciones={"lista": True})
            for _ in range(25):
                t = accion(pg, "no")
                if "Seguimos" in t: break
            revisa("No elegiste ninguna" in t, "sin elegir: «No elegiste ninguna»: " + t[:60])
            pg.evaluate("() => { const M = window.MediBot; M.terminar(); M.ir('bienvenida'); M.ir('sobreTi'); }")
            pg.click(".opcion:has-text('Para mí')"); pg.click(".opcion:has-text('60 años o más')")
            accion(pg, "si"); accion(pg, "si")
            s = sesion(pg)
            revisa(s["paraQuien"] == "yo" and s["grupo"] == "60mas", f"tocar «Para mí» y «60 años o más» y luego S, S: la sesión queda en yo / 60mas ({s['paraQuien']}, {s['grupo']})")
            ir(pg, "cuidar", {"paraQuien": "yo", "grupo": "18a59", "medicinas": ["ninguna"], "categorias": []})
            t = accion(pg, "si")
            revisa(t.startswith("Abrimos:") and "Elegiste:" not in t.split(".")[0], "en cuidar, abrir un grupo dice «Abrimos:»: " + t[:50])
            t = accion(pg, "no")
            revisa(not t.startswith("Listo."), "después de N la voz no empieza con «Listo.»: " + t[:50])
            pg.close()

            # ------------------------------------------------------------------------------------------------ A4
            print("A4 · el rojo no regresa callado; Terminar y el logo abren dlg-borrar")
            pg = pagina(reloj=True)
            dialogos_nativos = []
            pg.on("dialog", lambda d: (dialogos_nativos.append(d.message), d.dismiss()))
            pg.keyboard.press("x"); pg.wait_for_timeout(40)
            revisa("Para empezar, aprieta el verde" in ultimo(pg), "cualquier tecla en el reposo: «Para empezar, aprieta el verde»")
            ir(pg, "bienvenida", {})
            pg.keyboard.press("x"); pg.wait_for_timeout(40)
            revisa(len(ultimo(pg).strip()) > 10, "una tecla sin acción en la bienvenida da voz: " + ultimo(pg)[:60])
            ir(pg, "resultado", ADULTO)
            t = accion(pg, "no")
            revisa(pantalla(pg) == "resultado" and "verde" in t, "N en el resultado: no cambia de pantalla y la voz dice el verde: " + t[:70])
            ir(pg, "alarma", {"paraQuien": "yo", "grupo": "18a59"})
            t = accion(pg, "no")
            revisa(pantalla(pg) == "alarma" and "verde" in t, "N en una alarma ya contestada: no cambia y la voz dice el verde")
            ir(pg, "confirmar", ADULTO)
            pg.keyboard.press("ArrowLeft"); pg.wait_for_timeout(60)
            revisa(pantalla(pg) == "cuidar" and "Regresamos a" in ultimo(pg), "ArrowLeft regresa y la voz dice «Regresamos a»: " + ultimo(pg)[:40])
            ir(pg, "sobreTi", {"paraQuien": "yo", "grupo": "18a59"})
            antes = sesion(pg)
            pg.click(".fantasma--terminar"); pg.wait_for_timeout(60)
            revisa(pg.locator("#dlg-borrar[open]").count() == 1 and pantalla(pg) == "sobreTi" and sesion(pg) == antes and "seguir con tu consulta" in ultimo(pg), "Terminar abre dlg-borrar, no cambia nada y la voz lo pregunta")
            pg.keyboard.press("Enter"); pg.wait_for_timeout(60)
            revisa(pg.locator("#dlg-borrar[open]").count() == 0 and sesion(pg)["grupo"] == "18a59", "Enter = «Sí, seguir»: cierra sin borrar")
            pg.click(".fantasma--terminar"); accion(pg, "si")
            revisa(pg.locator("#dlg-borrar[open]").count() == 0 and sesion(pg)["grupo"] == "18a59", "S también sigue sin borrar")
            pg.click(".fantasma--terminar"); accion(pg, "no")
            revisa(pantalla(pg) == "reposo" and sesion(pg)["grupo"] is None, "N = «No, borrar todo»: reposo con la sesión vacía")
            ir(pg, "sobreTi", {"paraQuien": "yo", "grupo": "18a59"})
            pg.click(".marca"); pg.wait_for_timeout(60)
            revisa(not dialogos_nativos and pg.locator("#dlg-borrar[open]").count() == 1, "clic en el logo: sin confirm() nativo y con dlg-borrar")
            pg.clock.fast_forward(31000); pg.wait_for_timeout(60)
            revisa(pantalla(pg) == "reposo", "sin respuesta, a los 30 s se borra y vuelve al reposo")
            ir(pg, "sobreTi", {"paraQuien": "yo", "grupo": "18a59"})
            dist = pg.evaluate("""() => { const t = document.querySelector('.fantasma--terminar').getBoundingClientRect(); const l = document.querySelector('.fantasma--letra').getBoundingClientRect(); return Math.round(t.left - l.right); }""")
            revisa(dist >= 24, f"Terminar queda a {dist} px de su vecino (≥ 24)")
            revisa(pg.locator(".cabecera [data-accion=tema]").count() == 0, "el botón de tema no está en la barra pública")
            pg.close()

            # ------------------------------------------------------------------------------------------------ A2
            print("A2 · imprimir con los botones y tiempos por pantalla")
            pg = pagina(reloj=True)
            ir(pg, "resumen", ADULTO)
            g = voz(pg)
            revisa(len(g.split()) <= 40 and "imprim" in g.lower(), f"la voz al entrar a la hoja: {len(g.split())} palabras, dice «imprim»")
            prim = pg.evaluate("() => [...document.querySelectorAll('.btn--primario')].filter(b => b.getClientRects().length && !b.closest('dialog')).map(b => [b.textContent.trim(), getComputedStyle(b).backgroundColor])")
            revisa(len(prim) == 1 and "Imprimir mi hoja" in prim[0][0] and prim[0][1] == "rgb(46, 115, 70)", f"un solo primario: «Imprimir mi hoja», verde: {prim}")
            accion(pg, "si"); pg.wait_for_timeout(100)
            revisa(pg.evaluate("() => window.__impresiones") == 1 and sesion(pg)["grupo"] == "18a59", "S imprime una vez sin borrar")
            revisa("Toma tu hoja" in ultimo(pg), "y la voz dice «Toma tu hoja de la impresora»")
            pg.clock.fast_forward(29000); pg.wait_for_timeout(40)
            revisa(pg.locator("#dlg-borrar[open]").count() == 0, "después de imprimir: sin aviso a los 29 s")
            pg.clock.fast_forward(2000); pg.wait_for_timeout(40)
            revisa(pg.locator("#dlg-borrar[open]").count() == 1, "aviso a los 30 s")
            accion(pg, "si")
            revisa(len(ultimo(pg).strip()) > 10, "«Sí, seguir»: la voz vuelve a leer la pantalla: " + ultimo(pg)[:50])
            accion(pg, "si")
            revisa(pantalla(pg) == "reposo" and sesion(pg)["grupo"] is None, "un segundo S termina y deja la sesión vacía")
            ir(pg, "resumen", ADULTO); accion(pg, "no")
            revisa(pg.locator("#dlg-borrar[open]").count() == 1 and pantalla(pg) == "resumen", "N en la hoja abre dlg-borrar")
            ir(pg, "fichas", ADULTO)
            pg.clock.fast_forward(61000); pg.wait_for_timeout(40)
            sin_aviso = pg.locator("#dlg-borrar[open]").count() == 0
            pg.clock.fast_forward(60000); pg.wait_for_timeout(40)
            con_aviso = pg.locator("#dlg-borrar[open]").count() == 1
            pg.clock.fast_forward(30500); pg.wait_for_timeout(40)
            revisa(sin_aviso and con_aviso and pantalla(pg) == "reposo", "en las ideas, sin imprimir: nada a los 61 s, aviso a los 120 s, borrado a los 150 s")
            ir(pg, "sobreTi", {"paraQuien": "yo", "grupo": "18a59"})
            pg.clock.fast_forward(59000); pg.wait_for_timeout(40); a59 = pg.locator("#dlg-borrar[open]").count() == 0
            pg.clock.fast_forward(2000); pg.wait_for_timeout(40); a61 = pg.locator("#dlg-borrar[open]").count() == 1
            pg.clock.fast_forward(30000); pg.wait_for_timeout(40)
            revisa(a59 and a61 and pantalla(pg) == "reposo", "en «Sobre ti» siguen 60 y 90 s")
            pg.close()
            pe = pagina(init="window.medibotEscritorio = { esApp: true, version: 'prueba', salida: 'x', salir() {}, imprimir: async () => ({ ok: false, motivo: 'sin impresora' }) };")
            ir(pe, "resumen", ADULTO); accion(pe, "si"); pe.wait_for_timeout(150)
            revisa("No salió la hoja" in ultimo(pe) and pe.evaluate("() => window.__impresiones") == 0, "en el quiosco imprime por el puente de Electron; si falla, «No salió la hoja»")
            pe.close()
            main_js = (raiz / "escritorio" / "main.js").read_text(encoding="utf-8"); pre_js = (raiz / "escritorio" / "preload.js").read_text(encoding="utf-8")
            revisa("imprimir" in pre_js and re.search(r"print\(\{\s*silent:\s*true", main_js) is not None, "preload expone imprimir() y main.js llama print({ silent: true … })")

            # ------------------------------------------------------------------------------------------------ A5
            print("A5 · alarma roja: se ve y un «sí» por error se corrige")
            pg = pagina(reloj=True)
            ir(pg, "alarma", {"paraQuien": "yo", "grupo": "18a59", "medicinas": ["ninguna"]}, alarma_vacia=True)
            t = accion(pg, "si")
            revisa(dentro(pg, ".aviso-rojo"), "S en la pregunta del pecho: la franja roja se ve sin desplazarse")
            revisa(texto_boton(pg, "verde") == "Ver qué hacer ahora" and pg.locator("text=Continuar a medir").count() == 0, "el verde dice «Ver qué hacer ahora»; «Continuar a medir» ya no es el principal")
            revisa("me equivoqué" in t.lower(), "la voz ofrece «me equivoqué»: " + t[:80])
            captura(pg, "alarma_rojo")
            pg.clock.fast_forward(30000); pg.wait_for_timeout(40)
            revisa(sesion(pg)["alarma"]["pecho"] is True, "sin respuesta 30 s, el «sí» se queda")
            t = accion(pg, "no")
            revisa(sesion(pg)["alarma"]["pecho"] is False and "9 1 1" in t and pg.evaluate("() => window.MediBot.evaluar().nivel") != "rojo", "N: se quita, la voz dice el 9 1 1 y el nivel se recalcula")
            ir(pg, "alarma", {"paraQuien": "yo", "grupo": "18a59", "medicinas": ["ninguna"]}, alarma_vacia=True)
            accion(pg, "si"); accion(pg, "si")
            revisa(pantalla(pg) == "resultado" and pg.evaluate("() => window.MediBot.evaluar().nivel") == "rojo", "S, S: resultado rojo")
            ir(pg, "alarma", {"paraQuien": "yo", "grupo": "18a59", "medicinas": ["ninguna"], "alarma": {"tos": True}}, opciones={"volverA": "confirmar", "corregir": True})
            g = voz(pg)
            revisa("Dijiste que sí a" in g and "tosiendo" in g and "Ya respondiste todas" not in g and "pecho" not in g.split("Pregunta")[0], "desde «Corregir respuestas» la voz enumera solo los «sí»: " + g[:100])
            pg.close()

            # ------------------------------------------------------------------------------------------------ A6
            print("A6 · resultado rojo: el 911 primero, completo y sin lo demás")
            for (w, h) in [(1280, 800), (375, 812)]:
                pg = pagina(w, h)
                ir(pg, "resultado", ADULTO, medidas=[80, 84, None])
                revisa(dentro(pg, ".caja-911"), f"{w}×{h}: la caja del 911 se ve completa, arriba de la botonera")
                if w == 1280:
                    txt = pg.inner_text("#app")
                    revisa("Vuelve o pide ayuda" not in txt and pg.locator(".medidas, .tabla").count() == 0 and "Paso" not in txt, "sin safety netting, sin tabla de mediciones y sin «Paso»")
                    revisa("encargada del quiosco" not in pg.inner_text("body"), "no promete a una «persona encargada del quiosco»")
                    g = voz(pg)
                    revisa("9 1 1" in g.split(".")[0], "el primer enunciado de la voz trae el 9 1 1: " + g.split(".")[0])
                    revisa(pg.evaluate("() => window.__impresiones") == 0 and texto_boton(pg, "verde") == "Imprimir hoja para llevar", "no se imprime al entrar; el verde es «Imprimir hoja para llevar»")
                    accion(pg, "si"); pg.wait_for_timeout(500)
                    revisa(pantalla(pg) == "resumen" and pg.evaluate("() => window.__impresiones") == 1, "el verde imprime la hoja")
                    pg.emulate_media(media="print")
                    revisa(pg.locator(".tabla--hoja tr").count() >= 2 and "Oxígeno" in pg.inner_text(".hoja") and "Por qué" in pg.inner_text(".hoja"), "la hoja del rojo trae las mediciones y el motivo")
                    pg.emulate_media(media="screen")
                captura(pg, f"rojo_{w}")
                pg.close()

            # ------------------------------------------------------------------------------------------------ A7
            print("A7 · colores con un solo significado y botonera fija")
            for tema in ["light", "dark"]:
                pg = pagina(tema=tema)
                ir(pg, "bienvenida", {})
                c = pg.evaluate("""() => { const lum = (rgb) => { const v = rgb.match(/\\d+/g).slice(0, 3).map(Number).map(x => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
                  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
                  const v = document.querySelector('.botonera .btn--primario'); const cs0 = getComputedStyle(v); const cs = { color: cs0.color, backgroundColor: cs0.backgroundColor };
                  const azul = getComputedStyle(document.querySelector('.botonera [data-boton=azul] .fisico__tecla')).backgroundColor;
                  window.MediBot.ir('mediciones', { medicion: 2 }); const inp = document.querySelector('#peso'); const fondo = getComputedStyle(inp).backgroundColor; const borde = getComputedStyle(inp).borderTopColor;
                  const nd = document.createElement('span'); nd.className = 'nivel nivel--nd'; nd.textContent = 'Sin color'; document.getElementById('app').appendChild(nd);
                  const ndc = getComputedStyle(nd);
                  const barro = [...document.querySelectorAll('button')].filter(b => b.getClientRects().length && !b.classList.contains('marca')).some(b => /181, 71, 31|224, 114, 74/.test(getComputedStyle(b).backgroundColor + getComputedStyle(b).borderTopColor + getComputedStyle(b).color));
                  return { fondo: cs.backgroundColor, blanco: ratio(cs.color, cs.backgroundColor), azul, borde: ratio(borde, fondo), nd: ratio(ndc.color, ndc.backgroundColor), barro }; }""")
                if tema == "light": revisa(c["fondo"] == "rgb(46, 115, 70)", f"el primario es verde #2E7346 ({c['fondo']})")
                revisa(c["blanco"] >= 4.5, f"{tema}: blanco sobre el verde {c['blanco']:.2f}:1 (≥ 4.5)")
                revisa(c["azul"] == "rgb(43, 76, 140)", f"{tema}: Escuchar es azul ({c['azul']})")
                revisa(c["borde"] >= 3, f"{tema}: borde de los campos {c['borde']:.2f}:1 (≥ 3)")
                revisa(c["nd"] >= 4.5, f"{tema}: etiqueta «sin color» {c['nd']:.2f}:1 (≥ 4.5)")
                revisa(not c["barro"], f"{tema}: ningún control usa el barro")
                pg.close()
            for (w, h) in [(1280, 800), (375, 812)]:
                pg = pagina(w, h); vistos = []
                for pan, ses in [("bienvenida", {}), ("sobreTi", {}), ("medicinas", {"grupo": "18a59"}), ("alarma", {"grupo": "18a59"}), ("mediciones", {"grupo": "18a59"}), ("cuidar", ADULTO), ("confirmar", ADULTO), ("resultado", ADULTO), ("fichas", ADULTO), ("resumen", ADULTO)]:
                    ir(pg, pan, {"paraQuien": "yo", **ses})
                    vistos.append(dentro(pg, ".botonera [data-boton=verde]") or pg.evaluate("() => { const r = document.querySelector('.botonera [data-boton=verde]').getBoundingClientRect(); return r.bottom <= innerHeight + 0.5 && r.top >= 0; }"))
                revisa(all(vistos), f"{w}×{h}: el botón verde se ve sin desplazarse en las 10 pantallas del flujo ({vistos.count(True)}/10)")
                pg.emulate_media(media="print")
                revisa(pg.evaluate("() => getComputedStyle(document.querySelector('.botonera')).display") == "none", f"{w}: la botonera no se imprime")
                pg.close()

            # ------------------------------------------------------------------------------------------------ A8
            print("A8 · voz corta con el mínimo que no se quita")
            pg = pagina()
            ir(pg, "bienvenida", {})
            g = voz(pg)
            revisa(all(x in g.lower() for x in ["no soy", "9 1 1", "nombre", "borra", "azul", "gratis"]) and len(g.split()) <= 50, f"bienvenida ({len(g.split())} palabras): no soy, 9 1 1, nombre, borra, azul, gratis")
            for medidas, inicio in [([79, 97, 36.6], "Salió verde"), ([112, 96, 38.6], "Salió amarillo"), ([80, 84, None], "Salió rojo")]:
                ir(pg, "resultado", ADULTO, medidas=medidas); g = voz(pg); voces.append(g)
                revisa(g.startswith(inicio), f"la voz del resultado empieza con «{inicio}»")
            ir(pg, "resultado", ADULTO, medidas=[79, 97, 36.6]); g = voz(pg)
            revisa("Pulso 79: dentro de lo esperado" in g, "la voz dice «Pulso 79: dentro de lo esperado»")
            ir(pg, "resultado", ADULTO, medidas=[79, None, 36.6]); g = voz(pg)
            texto_inc = pg.evaluate("() => window.MediBotData.textos.datos_incompletos.texto")
            revisa(texto_inc in g, "con una medición omitida, la voz lee «datos incompletos»")
            ir(pg, "resultado", {"paraQuien": "nino", "grupo": "nino", "edadNino": "6a11", "medicinas": ["ninguna"], "categorias": ["boca"]}, medidas=[100, 97, 36.6]); g = voz(pg)
            revisa("sin color" not in g and "rango de su edad" in g, "en un niño sin clasificar, la voz dice que se compara con el rango de su edad (criterio 39: ya no «sin color»)")
            ir(pg, "fichas", ADULTO)
            n_ideas = pg.locator("[data-item=idea]").count(); dichos = [voz(pg)]
            for _ in range(pg.locator("[data-item]").count() + 1):
                if pantalla(pg) != "fichas": break
                dichos.append(accion(pg, "si"))
            todo = " ".join(dichos)
            revisa(todo.count("Lo que te toca a ti") == 1, f"«Lo que te toca a ti» se dice una sola vez en el recorrido ({todo.count('Lo que te toca a ti')})")
            rec = pg.evaluate("() => { const M = window.MediBot; M.ir('fichas'); const r = window.MediBot.recomendar(); return { avisos: r.tarjetas.flatMap(t => t.avisos), franjas: r.franjas.map(f => f.tema), temas: r.tarjetas.map(t => t.tema) }; }")
            revisa(all(av in todo for av in rec["avisos"]), f"cada idea con aviso lo dice completo ({len(rec['avisos'])} avisos)")
            ok_orden = True
            for tema in rec["franjas"]:
                ult = max(i for i, t in enumerate(rec["temas"]) if t == tema)
                k_idea = todo.find(f"Idea {ult + 1} de {n_ideas}.")
                k_cuando = todo.find("Y recuerda:", k_idea)
                ok_orden &= k_idea >= 0 and k_cuando > k_idea
            revisa(ok_orden and pantalla(pg) in ("fichas", "resumen"), "«Cuándo ir» se lee después de la última idea de su sección y el verde no la salta")
            voces.extend(dichos)
            pg.close()

            # ------------------------------------------------------------------------------------------------ A9
            print("A9 · temperatura hasta que se estabilice")
            pan_js = (raiz / "js" / "pantallas.js").read_text(encoding="utf-8")
            revisa("segundos: 20" not in pan_js, "pantallas.js ya no mide la temperatura con «segundos: 20»")
            pg = pagina()
            pg.keyboard.press("Control+Alt+Shift+KeyO"); pg.select_option(".operador select", "normal"); pg.wait_for_timeout(100)
            ir(pg, "mediciones", {"paraQuien": "yo", "grupo": "18a59"}, medidas=[79, 97, None], opciones={"medicion": 1})
            pg.evaluate("() => window.MediBot.sensores.conectarSim('normal')"); pg.wait_for_timeout(300)  # ir() terminó la sesión anterior y con ella la simulación
            accion(pg, "si"); pg.wait_for_timeout(2500)
            t = accion(pg, "si")
            revisa("faltan" in t, "S durante la espera: la voz dice cuánto falta: " + t[:60])
            lim = pg.evaluate("() => window.MediBotData.textos.limitaciones_medicion.temp")
            revisa("3 minutos" not in lim and "hasta que termine la cuenta" in lim, "el texto de límites ya no dice «3 minutos»")
            pg.evaluate("() => window.MediBot.terminar()")
            pg.close()

            # ------------------------------------------------------------------------------------------------ Criterios 21, 22, 23, 25, 26
            print("C21–C26 · botonera, ideas una por pantalla, pictogramas, «es gratis» y «Cuidado con esto»")
            pg = pagina()
            orden_ok = []
            for pan, ses in [("bienvenida", {}), ("sobreTi", {}), ("alarma", {"grupo": "18a59"}), ("mediciones", {"grupo": "18a59"}), ("resultado", ADULTO), ("fichas", ADULTO), ("resumen", ADULTO)]:
                ir(pg, pan, {"paraQuien": "yo", **ses})
                orden_ok.append(pg.evaluate("() => [...document.querySelectorAll('.botonera > button')].map(b => b.dataset.boton + ':' + /botón|largo/.test(b.querySelector('small').textContent)).join()") == "azul:true,rojo:true,verde:true")
            revisa(all(orden_ok), f"botonera azul · rojo · verde, cada uno dice qué botón físico es ({orden_ok.count(True)}/7)")
            ir(pg, "fichas", MAMA)
            vis = pg.evaluate("() => [...document.querySelectorAll('[data-item]')].filter(e => !e.hidden).length")
            revisa(vis == 1 and pg.locator(".miniaturas li").count() == pg.locator("[data-item=idea]").count(), "una idea por pantalla, con su tira de miniaturas")
            botones_idea = (texto_boton(pg, "rojo"), texto_boton(pg, "verde"))
            revisa(botones_idea[0] in ("No lo encuentro", "No puedo hacerlo") and botones_idea[1] in ("Sí lo tengo", "Sí puedo", "Ver mi hoja"), f"«Sí lo tengo» / «No lo encuentro» en la botonera: {botones_idea}")
            revisa(pg.evaluate("() => !!document.querySelector('[data-item]:not([hidden]) .idea__lamina svg use[href^=\"#p-\"]')"), "la idea trae su pictograma")
            accion(pg, "no")
            revisa(pg.locator("[data-item]:not([hidden]) .alternativas:not([hidden])").count() == 1, "el rojo abre las alternativas en la misma pantalla")
            cu = pg.eval_on_selector_all("[data-cuidado]", "els => els.map(e => e.dataset.tema + ':' + e.dataset.cuidado)")
            revisa(sum(1 for x in cu if x.startswith("digestion:")) == 2, f"«Cuidado con esto»: 2 tarjetas en Estómago y digestión ({cu})")
            con_emoji = []
            for pan, ses in [("bienvenida", {}), ("sobreTi", {}), ("medicinas", {"grupo": "18a59", "medicinas": ["presion"]}), ("alarma", {"grupo": "18a59"}), ("cuidar", ADULTO), ("confirmar", ADULTO), ("resultado", ADULTO), ("fichas", MAMA), ("resumen", MAMA)]:
                ir(pg, pan, {"paraQuien": "yo", **ses})
                if EMOJI.search(pg.evaluate("() => document.body.textContent")): con_emoji.append(pan)
            revisa(not con_emoji, f"ninguna pantalla muestra emoji: {con_emoji}")
            ir(pg, "bienvenida", {})
            revisa("Es gratis" in pg.inner_text("#app") and "gratis" in voz(pg), "la bienvenida dice «Es gratis» en pantalla y en voz")
            revisa("Es gratis. No guardamos tu nombre ni tus datos." in pg.inner_text(".privacidad"), "y el aviso de privacidad también")
            pg.close()

            # ------------------------------------------------------------------------------------------------ Criterio 30
            print("C30 · la hoja sale en tinta negra sobre blanco y en una carta, aunque el quiosco esté oscuro y con letra grande")
            pg = pagina(tema="dark")
            pg.evaluate("() => { document.documentElement.dataset.scale = 'lg'; }")
            ir(pg, "resumen", {**MAMA, "categorias": ["digestion", "ninos", "diarrea"]})
            pg.emulate_media(media="print")
            colores = pg.evaluate("() => { const h = document.querySelector('.hoja'); const b = getComputedStyle(document.body); return [getComputedStyle(h).color, b.backgroundColor, getComputedStyle(h.querySelector('h2')).color]; }")
            pg.emulate_media(media="screen")
            pdf = pg.pdf(format="Letter", print_background=True)
            paginas = len(re.findall(rb"/Type\s*/Page[^s]", pdf))
            revisa(colores == ["rgb(0, 0, 0)", "rgb(255, 255, 255)", "rgb(0, 0, 0)"] and paginas == 1, f"oscuro + letra grande: {colores}, {paginas} página(s)")
            if a.capturas: (a.capturas / "e2e_hoja_oscuro_grande.pdf").write_bytes(pdf)
            pg.close()

            # ------------------------------------------------------------------------------------------------ Revisión
            print("Hallazgos de la revisión independiente: verde largo, saltar una medición, Escape, valores imposibles")
            pg = pagina(reloj=True)
            ir(pg, "sobreTi", {})
            revisa(pg.evaluate("() => document.querySelector('.botonera [data-boton=verde] small').textContent") == "verde largo", "en las pantallas con recorrido, el verde de la pantalla es el «verde largo» (el corto contesta la voz)")
            ir(pg, "sobreTi", {"paraQuien": "yo", "grupo": "18a59"})
            pg.click(".fantasma--terminar"); pg.keyboard.press("Escape"); pg.wait_for_timeout(60)
            pg.clock.fast_forward(31000); pg.wait_for_timeout(60)
            revisa(pg.locator("#dlg-borrar[open]").count() == 0 and sesion(pg)["grupo"] == "18a59" and pantalla(pg) == "sobreTi", "Escape en «¿Quieres seguir?» = seguir (no queda una cuenta escondida que borre todo)")
            ir(pg, "mediciones", {"paraQuien": "yo", "grupo": "18a59"}, medidas=[None, None, None], opciones={"medicion": 1})
            pg.click("[data-medicion=temp] >> text=Escribir a mano"); pg.fill("#m-temp", "0"); pg.press("#m-temp", "Enter"); pg.wait_for_timeout(40)  # ronda 3, criterio 56: se confirma
            revisa(sesion(pg)["medidas"]["temp"]["estado"] == "invalida", "una temperatura escrita fuera de lo que mide el aparato (0 °C) es «no válida», no válida")
            pg.close()
            pg = pagina()
            pg.keyboard.press("Control+Alt+Shift+KeyO"); pg.select_option(".operador select", "normal"); pg.click("text=Cerrar panel"); pg.wait_for_timeout(100)
            pg.evaluate("() => { const M = window.MediBot; M.ir('bienvenida'); Object.assign(M.sesion, { paraQuien: 'yo', grupo: '18a59' }); M.ir('mediciones', { medicion: 1 }); }")
            accion(pg, "si"); pg.wait_for_timeout(1500)
            revisa(texto_boton(pg, "rojo") == "Saltar", "midiendo la temperatura, el rojo dice «Saltar»")
            accion(pg, "no"); pg.wait_for_timeout(2500)
            revisa(pg.locator("[data-medicion=peso]:not([hidden])").count() == 1 and sesion(pg)["medidas"]["temp"]["valor"] is None, "y sí salta: pasa a la siguiente medición (el peso, criterio 41) sin guardar lo que siga llegando")
            pg.evaluate("() => window.MediBot.terminar()")
            pg.close()

            # ------------------------------------------------------------------------------------------------ Rosa, Juana y Pedro
            def caminar(nombre: str, decide, consultas: int = 1) -> dict:
                """Recorrido solo con S / N, decidiendo por lo que dice la voz (como una persona que no lee). Cuenta palabras."""
                pg = pagina(init="window.medibotEscritorio = { esApp: true, version: 'prueba', salida: 'x', salir() {}, imprimir: async () => { window.__impresiones++; return { ok: true, motivo: '' }; } };")
                dicho: list[str] = []; por: dict[str, int] = {}; recorridos = []
                for k in range(consultas):
                    pg.evaluate("() => window.MediBot.ir('bienvenida')")
                    vistas: list[str] = []; ultimo_dicho = ""
                    for _ in range(160):
                        pan = pantalla(pg)
                        if pan == "reposo": break
                        if pan not in vistas:
                            vistas.append(pan)
                            if pan == "mediciones":  # sin aparato aquí: los valores ya escritos, como si se hubieran medido
                                pg.evaluate("() => { const s = window.MediBot.sesion; const v = (x) => ({ valor: x, estado: 'valida', origen: 'manual' }); s.medidas.fc = v(80); s.medidas.spo2 = v(97); s.medidas.temp = v(36.7); }")
                            ultimo_dicho = voz(pg); dicho.append(ultimo_dicho); por[pan] = por.get(pan, 0) + len(ultimo_dicho.split())
                        ultimo_dicho = accion(pg, decide(k, pan, ultimo_dicho)); dicho.append(ultimo_dicho); por[pan] = por.get(pan, 0) + len(ultimo_dicho.split())
                    recorridos.append(vistas)
                info = {"recorridos": recorridos, "palabras": sum(len(x.split()) for x in dicho), "por": por, "impresiones": pg.evaluate("() => window.__impresiones"), "dicho": dicho}
                pg.close()
                return info
            def ultima_pregunta(todo: str) -> str:
                preguntas = re.findall(r"¿[^?]*\?", todo)
                return preguntas[-1] if preguntas and "Seguimos" not in todo and "Verde: seguir" not in todo else todo
            def persona(edad: str, toma: str, cuida: list[str], para: str = "¿Es para ti?", embarazo: str = "", nino_edad: str = ""):
                def decide(k, pan, todo):
                    u = ultima_pregunta(todo)
                    if pan == "sobreTi":
                        if "Seguimos" in u: return "si"
                        if "embaraz" in u: return "si" if embarazo == "si" else "no"
                        if "pecho" in u: return "no"
                        return "si" if (para in u or edad in u or (nino_edad and nino_edad in u)) else "no"
                    if pan == "medicinas": return "si" if ("Seguimos" in u or ("alguna medicina" in u and toma) or (toma and toma in u)) else "no"
                    if pan == "alarma": return "no" if "Pregunta" in todo else "si"
                    if pan == "mediciones": return "si" if ("Seguimos" in u or "Verde: seguir" in u) else "no"
                    if pan == "cuidar": return "si" if ("Seguimos" in u or any(c in u for c in cuida)) else "no"
                    return "si"
                return decide
            print("Recorridos de Rosa, Juana (dos consultas) y Don Pedro solo con botones")
            rosa = caminar("Rosa", persona("60 años o más", "presión", ["Cabeza y ánimo", "Sueño"]))
            juana1 = persona("18 a 59", "", ["Panza", "Diarrea"], embarazo="si")
            juana2 = persona("3 meses a 11 años", "", ["Panza", "Diarrea"], para="¿Es para un niño", nino_edad="de 2 a 5")
            juana = caminar("Juana", lambda k, pan, todo: (juana1 if k == 0 else juana2)(k, pan, todo), consultas=2)
            pedro = caminar("Pedro", persona("18 a 59", "azúcar", ["Pecho y garganta", "Presión y corazón"]))
            for nombre, r in [("Rosa", rosa), ("Juana", juana), ("Pedro", pedro)]:
                ok = all(v[-1:] == ["resumen"] for v in r["recorridos"]) and r["impresiones"] >= len(r["recorridos"])
                revisa(ok, f"{nombre}: {len(r['recorridos'])} consulta(s) hasta su hoja, {r['impresiones']} impresión(es), solo con botones ({' → '.join(r['recorridos'][0])})")
                voces.extend(r["dicho"])
            print("        Pedro, palabras por pantalla: " + ", ".join(f"{k} {v}" for k, v in pedro["por"].items()))
            # A8: se reporta la cifra antes y después; si no se llega, se dice. Es un reporte, no una compuerta.
            print(f"  {'META ALCANZADA' if pedro['palabras'] <= 1300 else 'META NO ALCANZADA'}: Pedro {pedro['palabras']} palabras de voz (meta ≤ 1,300; la v0.4 con el mismo recorrido: 2,798)")
            nav.close()
    finally:
        srv.terminate(); srv.wait(timeout=10)
        print(f"servidor PID={srv.pid} detenido (código {srv.returncode})")
    malas = sorted({m for v in voces for m in re.findall("|".join(FRASES_PROHIBIDAS), v.lower())})
    revisa(not malas, f"ningún guion generado dice frases prohibidas: {malas}")
    revisa(not errores, "consola sin errores: " + json.dumps(errores[:5], ensure_ascii=False))
    print("E2E REDISEÑO: OK" if not fallas else f"E2E REDISEÑO: FALLÓ ({len(fallas)})")
    sys.exit(1 if fallas else 0)


if __name__ == "__main__":
    main()
