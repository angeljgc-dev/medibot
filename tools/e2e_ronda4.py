"""Pruebas en el navegador de la ronda 4 (criterio 76): «Cerrar MediBot» en el reposo, solo en la
app de escritorio. Se simula window.medibotEscritorio con un stub que cuenta las llamadas a salir().
Revisa lo que la persona ve y oye: el botón y su texto, la barra que se llena, el aviso del toque corto, el diálogo, que
el verde, Enter y los botones físicos nunca cierran la app, y que el reposo no se mueve ni se tapa.
Uso (desde la carpeta MediBot):  PYTHONUTF8=1 python tools/e2e_ronda4.py [--capturas DIR]"""
import argparse, json, pathlib, socket, subprocess, sys, time
from playwright.sync_api import sync_playwright

raiz = pathlib.Path(__file__).resolve().parent.parent
fallas: list[str] = []


def revisa(cond: bool, msg: str) -> None:
    print(("  OK   " if cond else "  FALLA ") + msg)
    if not cond: fallas.append(msg)


STUB = ("window.__salir = 0; window.medibotEscritorio = { esApp: true, version: 'prueba', salida: 'Ctrl+Alt+Shift+Q', "
        "salir() { window.__salir++; }, imprimir: async () => ({ ok: true, motivo: '' }) };")
BASE = ("window.print = () => {}; try { localStorage.clear(); } catch (e) { console.warn(e.message); }"
        " if (window.speechSynthesis) { speechSynthesis.speak = () => {}; }")
# lo que no debe moverse ni taparse en el reposo
FIJOS = ["h1", ".reposo__medidas", ".reposo__lema", ".reposo__urgencia", ".consola"]
CAJAS = """(sels) => { const r = (e) => { const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)]; };
  const c = document.querySelector('#contenido'); const b = document.querySelector('.cerrar-app');
  return { fijos: sels.map(s => r(document.querySelector('.reposo ' + s))), boton: b ? r(b) : null, scroll: c.scrollTop,
           alto: c.scrollHeight, cliente: c.clientHeight, barra: c.offsetWidth - c.clientWidth, escala: document.documentElement.dataset.scale,
           fijo: !!document.querySelector('.cerrar-app__lugar--fijo'), vista: [innerWidth, innerHeight], desborde: document.documentElement.scrollWidth - innerWidth,
           aviso: (() => { const a = document.querySelector('.cerrar-app__aviso'); if (!a) return null; a.hidden = false; const x = r(a); a.hidden = true; return x; })() }; }"""


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
    try:
        time.sleep(0.8)
        with sync_playwright() as p:
            nav = p.chromium.launch()

            nav_barras = p.chromium.launch(ignore_default_args=["--hide-scrollbars"])  # como Electron en Windows: barras de 15 px

            def pagina(ancho=1280, alto=800, escritorio=True, tema="light", escala="md", barras=False, tactil=False, pref=None):
                ctx = (nav_barras if barras else nav).new_context(viewport={"width": ancho, "height": alto}, color_scheme=tema, has_touch=tactil)
                ctx.add_init_script(BASE + (STUB if escritorio else "") + (f"localStorage.setItem('medibot.theme', '{pref}');" if pref else ""))
                pg = ctx.new_page()
                pg.on("console", lambda m: errores.append(m.text) if m.type == "error" else None)
                pg.on("pageerror", lambda e: errores.append(str(e)))
                pg.goto(url); pg.wait_for_function("() => window.MediBot")
                # terminar() regresa a letra normal (criterio 49): la escala se pone DESPUÉS y se recoloca el botón como al cambiar la ventana
                pg.evaluate("(e) => { window.MediBot.terminar(); document.documentElement.dataset.scale = e; window.dispatchEvent(new Event('resize')); }", escala); pg.wait_for_timeout(120)
                return pg
            pantalla = lambda pg: pg.evaluate("() => window.MediBot.pantalla")
            salir = lambda pg: pg.evaluate("() => window.__salir")
            abierto = lambda pg: pg.evaluate("() => !!document.querySelector('#dlg-cerrar[open]')")
            def accion(pg, ident):
                pg.evaluate("(id) => window.MediBotVoz.accion(id)", ident); pg.wait_for_timeout(80)
            def centro(pg):
                b = pg.locator(".cerrar-app").bounding_box(); return b["x"] + b["width"] / 2, b["y"] + b["height"] / 2
            def apretar(pg, ms, soltar=True):
                x, y = centro(pg); pg.mouse.move(x, y); pg.mouse.down(); pg.wait_for_timeout(ms)
                if soltar: pg.mouse.up()
            def captura(pg, nombre):
                if a.capturas: pg.screenshot(path=str(a.capturas / f"r4_{nombre}.png"))

            print("76 a · solo en la app de escritorio, en el reposo, con su texto; la voz no lo anuncia")
            pg = pagina(escritorio=False)
            revisa(pantalla(pg) == "reposo" and pg.locator(".cerrar-app").count() == 0, "en el navegador (sin medibotEscritorio) el botón no existe")
            accion(pg, "si")
            revisa(pantalla(pg) == "bienvenida", f"en el navegador el verde en el reposo inicia la consulta ({pantalla(pg)})")
            pg.close()
            pg = pagina()
            n = pg.locator(".cerrar-app").count()
            txt = pg.inner_text(".cerrar-app") if n else ""
            caja = pg.locator(".cerrar-app").bounding_box() if n else None
            revisa(n == 1 and "Cerrar MediBot" in txt and "mantén apretado 3 segundos" in txt, f"en la app hay un botón «Cerrar MediBot» / «mantén apretado 3 segundos»: «{txt}»")
            revisa(bool(caja) and caja["width"] >= 64 and caja["height"] >= 64, f"toque de 64 px o más: {caja}")
            vw = pg.evaluate("() => innerWidth")
            revisa(bool(caja) and caja["x"] + caja["width"] > vw * 0.6, f"abajo a la derecha: {caja}")
            fondo = pg.evaluate("() => { const b = document.querySelector('.cerrar-app'); return b ? [getComputedStyle(b).backgroundColor, b.className] : null; }")
            revisa(bool(fondo) and "verde" not in fondo[1] and "rojo" not in fondo[1], f"botón fantasma, sin color de semáforo: {fondo}")
            g = pg.evaluate("() => window.MediBotVoz.textoPantalla()")
            revisa("Cerrar" not in g and "cerrar" not in g, "la voz del reposo no lo anuncia: " + g[:80])
            try:
                print("76 b · un toque corto no cierra nada (dice «Mantén apretado para cerrar»)")
                apretar(pg, 250); pg.wait_for_timeout(150)
                aviso = pg.evaluate("() => { const x = document.querySelector('.cerrar-app__aviso'); return x && !x.hidden && x.getClientRects().length ? x.textContent : ''; }")
                revisa(pantalla(pg) == "reposo" and not abierto(pg) and salir(pg) == 0 and "Mantén apretado para cerrar" in aviso, f"toque corto: sigue el reposo, sin diálogo, sin salir, aviso «{aviso}»")
                pg.wait_for_timeout(3300)
                aviso2 = pg.evaluate("() => { const x = document.querySelector('.cerrar-app__aviso'); return x && !x.hidden && x.getClientRects().length ? x.textContent : ''; }")
                revisa(aviso2 == "", "el aviso se quita a los 3 s")
                print("76 b · mantener 3 s: la barra se llena y sale el diálogo")
                apretar(pg, 1500, soltar=False)
                lleno = pg.evaluate("() => { const f = document.querySelector('.cerrar-app__lleno'); const b = document.querySelector('.cerrar-app__barra'); return f && b ? f.getBoundingClientRect().width / b.getBoundingClientRect().width : -1; }")
                revisa(0.25 < lleno < 0.8 and not abierto(pg), f"a 1.5 s la barra va a la mitad ({lleno:.2f}) y todavía no hay diálogo")
                captura(pg, "apretando")
                pg.mouse.move(5, 5); pg.wait_for_timeout(2000); pg.mouse.up()
                revisa(not abierto(pg) and salir(pg) == 0, "si el dedo se sale del botón antes de 3 s, no pasa nada")
                apretar(pg, 3300)
                dlg = pg.inner_text("#dlg-cerrar") if abierto(pg) else ""
                revisa("¿Cerrar MediBot?" in dlg and "Para volver a abrirlo, usa el ícono MediBot del Escritorio." in dlg and "No, seguir" in dlg and "Sí, cerrar" in dlg,
                       f"a los 3 s sale el diálogo: «{dlg[:120]}»")
                prim = pg.evaluate("() => { const p = document.querySelector('#dlg-cerrar .btn--primario'); return p ? [p.textContent.trim(), document.activeElement === p] : null; }")
                revisa(bool(prim) and "No, seguir" in prim[0] and prim[1], f"«No, seguir» es el principal y tiene el foco: {prim}")
                captura(pg, "dialogo")
                print("76 b, c · solo «Sí, cerrar» cierra; verde, Enter, rojo, «No, seguir» y el tiempo no")
                pg.keyboard.press("Enter"); pg.wait_for_timeout(100)
                revisa(not abierto(pg) and salir(pg) == 0 and pantalla(pg) == "reposo", "Enter: se cierra el diálogo y la app sigue")
                for ident in ["si", "siguiente", "no", "atras", "repetir"]:
                    apretar(pg, 3300); accion(pg, ident)
                    revisa(salir(pg) == 0 and (ident in ("atras", "repetir") or not abierto(pg)), f"botón físico «{ident}» con el diálogo: no cierra la app (verde y rojo contestan «No, seguir»)")
                    pg.evaluate("() => { const d = document.querySelector('#dlg-cerrar'); if (d.open) d.close(); }")
                apretar(pg, 3300); pg.focus("#dlg-cerrar [data-accion=cerrar-app-si]"); pg.keyboard.press("Enter"); pg.wait_for_timeout(100)
                revisa(salir(pg) == 0, "Enter con el foco en «Sí, cerrar»: tampoco cierra")
                if abierto(pg): pg.click("#dlg-cerrar [data-accion=cerrar-app-no]")
                apretar(pg, 3300); pg.click("#dlg-cerrar [data-accion=cerrar-app-no]"); pg.wait_for_timeout(100)
                revisa(not abierto(pg) and salir(pg) == 0, "«No, seguir»: no cierra")
                apretar(pg, 3300); pg.wait_for_timeout(15500)
                revisa(not abierto(pg) and salir(pg) == 0 and pantalla(pg) == "reposo", "nadie contesta en 15 s: se quita el diálogo y la app sigue")
                apretar(pg, 3300); pg.click("#dlg-cerrar [data-accion=cerrar-app-si]"); pg.wait_for_timeout(100)
                revisa(salir(pg) == 1, f"«Sí, cerrar» llama a medibotEscritorio.salir() una vez ({salir(pg)})")
                print("76 b, d · el verde y Enter en el reposo siguen iniciando la consulta (también con el foco en el botón)")
                pg.evaluate("() => { document.querySelectorAll('dialog[open]').forEach(d => d.close()); window.__salir = 0; window.MediBot.terminar(); }"); pg.wait_for_timeout(100)
                accion(pg, "si")
                revisa(pantalla(pg) == "bienvenida" and salir(pg) == 0, f"verde en el reposo: empieza la consulta ({pantalla(pg)})")
                pg.evaluate("() => window.MediBot.terminar()"); pg.wait_for_timeout(100)
                pg.focus(".cerrar-app"); pg.keyboard.press("Enter"); pg.wait_for_timeout(120)
                revisa(pantalla(pg) == "bienvenida" and salir(pg) == 0 and not abierto(pg), f"Enter con el foco en «Cerrar MediBot»: empieza la consulta, no cierra ({pantalla(pg)})")
                pg.evaluate("() => window.MediBot.terminar()"); pg.wait_for_timeout(100)
                pg.click(".reposo__lema"); pg.wait_for_timeout(100)
                revisa(pantalla(pg) == "bienvenida", "tocar la pantalla del reposo sigue iniciando la consulta")
            except Exception as ex:  # sin el botón no hay con qué interactuar: se cuenta como falla, no se calla
                revisa(False, f"interacciones con «Cerrar MediBot»: {type(ex).__name__}: {str(ex)[:120]}")
            pg.close()

            print("76 b · con el dedo (táctil por CDP): deslizarlo fuera del botón cancela; mantenerlo 3 s abre el diálogo")
            pg = pagina(tactil=True)
            cdp = pg.context.new_cdp_session(pg)
            def toque(tipo, x, y):
                cdp.send("Input.dispatchTouchEvent", {"type": tipo, "touchPoints": [] if tipo == "touchEnd" else [{"x": x, "y": y}]})
            x, y = centro(pg)
            toque("touchStart", x, y); pg.wait_for_timeout(300); toque("touchMove", x - 600, y - 300); pg.wait_for_timeout(3200); toque("touchEnd", 0, 0); pg.wait_for_timeout(150)
            revisa(not abierto(pg) and salir(pg) == 0, f"dedo deslizado fuera antes de 3 s: sin diálogo ({abierto(pg)})")
            pg.evaluate("() => window.MediBot.terminar()"); pg.wait_for_timeout(150); x, y = centro(pg)
            toque("touchStart", x, y); pg.wait_for_timeout(3400); toque("touchEnd", 0, 0); pg.wait_for_timeout(150)
            revisa(abierto(pg) and salir(pg) == 0, f"dedo quieto 3 s: sale el diálogo y la app sigue ({abierto(pg)})")
            pg.close()

            print("76 d · la letra grande nunca llega al reposo (criterio 49): por eso el reposo se mide con letra normal")
            pg = pagina()
            vias = {}
            for via in ["terminar", "borrar", "panel"]:
                pg.evaluate("() => { window.MediBot.ir('bienvenida'); document.querySelector('[data-accion=letra]').click(); }"); pg.wait_for_timeout(80)
                antes = pg.evaluate("() => document.documentElement.dataset.scale")
                if via == "terminar": pg.evaluate("() => window.MediBot.terminar()")
                elif via == "borrar": pg.evaluate("() => { window.MediBot.pedirBorrar(); document.querySelector('#dlg-borrar [data-accion=borrar]').click(); }")
                else: pg.evaluate("() => { window.MediBot.abrirOperador(); document.querySelector('[data-accion=inicio]').click(); }")
                pg.wait_for_timeout(120)
                vias[via] = [antes, pantalla(pg), pg.evaluate("() => document.documentElement.dataset.scale")]
            revisa(all(v == ["lg", "reposo", "md"] for v in vias.values()), f"con «Letra grande» puesta, al volver al reposo queda letra normal: {vias}")
            pg.close()

            print("76 d · el reposo no se mueve ni se tapa, y el botón no agrega una barra de desplazamiento (barras visibles, como en Windows)")
            for (w, hh) in [(320, 640), (375, 812), (768, 1024), (800, 600), (1000, 700), (1024, 600), (1024, 768), (1093, 614), (1097, 617), (1280, 720), (1280, 800), (1366, 768), (1440, 900), (1536, 864), (1920, 1080)]:
                for esc in ["md"]:
                    sin = pagina(w, hh, escritorio=False, escala=esc, barras=True); m0 = sin.evaluate(CAJAS, FIJOS); sin.close()
                    con = pagina(w, hh, escala=esc, barras=True); m1 = con.evaluate(CAJAS, FIJOS)
                    b = m1["boton"]
                    igual = all(all(abs(x - y) <= 1 for x, y in zip(f0, f1)) for f0, f1 in zip(m0["fijos"], m1["fijos"]))
                    encima = [FIJOS[k] for k, f in enumerate(m1["fijos"]) for c in [b, m1["aviso"]] if c and not (c[2] <= f[0] or f[2] <= c[0] or c[3] <= f[1] or f[3] <= c[1])]
                    barra_nueva = m1["alto"] > m1["cliente"] + 1 and not m0["alto"] > m0["cliente"] + 1
                    a_la_vista = bool(b) and (not m1["fijo"] or (b[3] <= hh and b[2] <= w))
                    revisa(bool(b) and igual and not encima and not barra_nueva and a_la_vista and m1["desborde"] <= 0 and b[2] <= w and m1["escala"] == esc,
                           f"{w}×{hh} {esc}: en su lugar {igual}, sin tapar {encima}, barra nueva {barra_nueva}, {'fijo en la esquina' if m1['fijo'] else 'al final del reposo'} {b}")
                    con.close()

            print("79 · de fábrica, claro (aunque Windows esté en oscuro); si el operador eligió tema, se respeta")
            FONDO = "() => { const c = getComputedStyle(document.body).backgroundColor.match(/[0-9.]+/g).map(Number); return [document.documentElement.dataset.theme, Math.round((c[0] * 299 + c[1] * 587 + c[2] * 114) / 1000)]; }"
            pg = pagina(tema="dark"); f1 = pg.evaluate(FONDO); captura(pg, "79_windows_oscuro_sin_pref"); pg.close()
            pg = pagina(tema="dark", pref="dark"); f2 = pg.evaluate(FONDO); pg.close()
            pg = pagina(tema="light", pref="dark"); f3 = pg.evaluate(FONDO); pg.close()
            revisa(f1[0] == "light" and f1[1] > 180, f"Windows en oscuro y sin preferencia guardada: el reposo sale claro {f1}")
            revisa(f2[0] == "dark" and f2[1] < 80 and f3[0] == "dark" and f3[1] < 80, f"preferencia «dark» guardada por el operador: sale oscuro {f2} {f3}")
            pg = pagina(tema="dark")
            pg.evaluate("() => window.MediBot.abrirOperador()"); pg.wait_for_timeout(120)
            boton_tema = pg.locator("button:has-text('Cambiar entre claro y oscuro')")
            hay = boton_tema.count()
            if hay: boton_tema.first.click(); pg.wait_for_timeout(80)
            guardado = pg.evaluate("() => localStorage.getItem('medibot.theme')")
            f4 = pg.evaluate(FONDO)  # (al abrir otra vez, la preferencia guardada «dark» se respeta: caso de arriba)
            revisa(hay == 1 and guardado == "dark" and f4[0] == "dark" and f4[1] < 80, f"desde el panel, «Cambiar entre claro y oscuro» pasa de claro a oscuro y lo guarda ({guardado}, {f4})")
            pg.evaluate("() => window.MediBot.terminar()"); pg.wait_for_timeout(80)
            publico = pg.evaluate("() => [...document.querySelectorAll('.cabecera button, .botonera button')].filter(b => b.getClientRects().length).map(b => b.textContent.trim()).filter(x => /tema|oscuro|claro/i.test(x))")
            pg.evaluate("() => window.MediBot.ir('bienvenida')"); pg.wait_for_timeout(80)
            publico += pg.evaluate("() => [...document.querySelectorAll('.cabecera button, .botonera button')].filter(b => b.getClientRects().length).map(b => b.textContent.trim()).filter(x => /tema|oscuro|claro/i.test(x))")
            revisa(not publico, f"el público no ve botón de tema: {publico}")
            pg.close()

            print("76 · Electron: «Sí, cerrar» usa el mismo IPC que el panel del operador")
            pre = (raiz / "escritorio" / "preload.js").read_text(encoding="utf-8"); main_js = (raiz / "escritorio" / "main.js").read_text(encoding="utf-8")
            revisa('ipcRenderer.send("medibot:salir")' in pre and 'ipcMain.on("medibot:salir"' in main_js, "preload.salir() → ipcMain «medibot:salir»")
            nav.close(); nav_barras.close()
    finally:
        srv.terminate(); srv.wait(timeout=10)
        print(f"servidor PID={srv.pid} detenido (código {srv.returncode})")
    revisa(not errores, "consola sin errores: " + json.dumps(errores[:5], ensure_ascii=False))
    print("E2E RONDA 4: OK" if not fallas else f"E2E RONDA 4: FALLÓ ({len(fallas)})")
    sys.exit(1 if fallas else 0)


if __name__ == "__main__":
    main()
