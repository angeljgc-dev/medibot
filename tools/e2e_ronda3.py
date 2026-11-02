"""Pruebas en el navegador de la ronda 3 (criterios 52–75): cada una revisa lo que la persona VE y
OYE, no solo la sesión. Las de motor (58, 64, 73) están además en tests/ronda3_motor.test.mjs.
Uso (desde la carpeta MediBot):  PYTHONUTF8=1 python tools/e2e_ronda3.py [--capturas DIR]"""
import argparse, json, pathlib, re, socket, subprocess, sys, time
from playwright.sync_api import sync_playwright

raiz = pathlib.Path(__file__).resolve().parent.parent
fallas: list[str] = []


def revisa(cond: bool, msg: str) -> None:
    print(("  OK   " if cond else "  FALLA ") + msg)
    if not cond: fallas.append(msg)


PREPARAR = """(c) => {
  const M = window.MediBot; document.querySelectorAll("dialog[open]").forEach(d => d.close());
  M.terminar(); M.ir("bienvenida");
  const s = M.sesion; Object.assign(s, JSON.parse(JSON.stringify(c.sesion || {})));
  for (const p of window.MediBotData.alarma.preguntas) if (!(p.id in (c.sesion.alarma || {}))) s.alarma[p.id] = false;
  const v = (x) => ({ valor: x, estado: "valida", origen: "manual", calidad: 1 });
  const m = c.medidas || [79, 97, 36.6];
  ["fc", "spo2", "temp"].forEach((k, i) => { s.medidas[k] = m[i] == null ? { valor: null, origen: null, calidad: null, estado: null } : v(m[i]); });
  M.ir(c.pantalla, c.opciones || undefined);
  return M.pantalla;
}"""
ADULTO = {"paraQuien": "yo", "grupo": "18a59", "embarazoOpcion": "no", "embarazoRespondido": True, "medicinas": ["ninguna"], "categorias": ["diarrea"]}
NINO = {"paraQuien": "nino", "grupo": "nino", "edadNino": "2a5", "medicinas": ["ninguna"], "categorias": ["diarrea"]}
EMB = {"paraQuien": "yo", "grupo": "18a59", "embarazo": True, "embarazoOpcion": "si", "embarazoRespondido": True, "medicinas": ["ninguna"], "categorias": ["embarazo", "diarrea"]}


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
            ESCALA: dict[int, str] = {}

            def pagina(ancho=1280, alto=800, tema="light", escala="md", init=None):
                ctx = nav.new_context(viewport={"width": ancho, "height": alto}, color_scheme=tema)
                ctx.add_init_script("window.__impresiones = 0; window.print = () => { window.__impresiones++; }; try { localStorage.clear(); } catch (e) { console.warn(e.message); }"
                                    " if (window.speechSynthesis) { speechSynthesis.speak = () => {}; }" + (" try { localStorage.setItem('medibot.theme', 'dark'); } catch (e) { console.warn(e.message); }" if tema == "dark" else ""))  # criterio 79: de fábrica es claro; el oscuro se fuerza como lo elegiría el operador
                if init: ctx.add_init_script(init)
                pg = ctx.new_page()
                pg.on("console", lambda m: errores.append(m.text) if m.type == "error" else None)
                pg.on("pageerror", lambda e: errores.append(str(e)))
                pg.goto(url); pg.wait_for_function("() => window.MediBot")
                pg.evaluate("(e) => { document.documentElement.dataset.scale = e; }", escala)
                ESCALA[id(pg)] = escala
                return pg

            def ir(pg, pantalla, sesion, medidas=None, opciones=None):
                # terminar() vuelve a letra normal (criterio 49): la letra grande se pone de nuevo, como lo haría la persona
                r = pg.evaluate("(c) => { const r = (" + PREPARAR + ")(c); if (c.escala === 'lg') document.querySelector('[data-accion=letra]').click(); return r; }",
                                {"pantalla": pantalla, "sesion": sesion, "medidas": medidas, "opciones": opciones, "escala": ESCALA.get(id(pg), "md")})
                pg.wait_for_timeout(80); return r
            voz = lambda pg: pg.evaluate("() => window.MediBotVoz.textoPantalla()")
            ultimo = lambda pg: pg.evaluate("() => window.MediBotVoz.ultimoTexto")
            def accion(pg, ident):
                pg.evaluate("(id) => window.MediBotVoz.accion(id)", ident); pg.wait_for_timeout(60); return ultimo(pg)
            sesion = lambda pg: pg.evaluate("() => JSON.parse(JSON.stringify(window.MediBot.sesion))")
            pantalla = lambda pg: pg.evaluate("() => window.MediBot.pantalla")
            boton = lambda pg, c: pg.evaluate("(c) => { const b = document.querySelector(`.botonera [data-boton=${c}] .largo`); return b ? b.textContent : null; }", c)
            # visible: la caja del elemento queda dentro del área de contenido (entre la cabecera y la botonera)
            visible = lambda pg, sel: pg.evaluate("""(sel) => { const e = [...document.querySelectorAll(sel)].find(x => x.getClientRects().length); if (!e) return false;
                const r = e.getBoundingClientRect(); const c = document.querySelector('.contenido').getBoundingClientRect(); const b = document.querySelector('.botonera');
                const abajo = b && b.getClientRects().length ? b.getBoundingClientRect().top : innerHeight;
                return r.top >= c.top - 0.5 && r.bottom <= Math.min(c.bottom, abajo) + 0.5 && r.left >= 0 && r.right <= innerWidth; }""", sel)
            def captura(pg, nombre):
                if a.capturas: pg.screenshot(path=str(a.capturas / f"r2_{nombre}.png"))

            # ------------------------------------------------------------------------------------------------ 52
            print("52 · la botonera siempre es la de la pantalla actual (medición en segundo plano)")
            pg = pagina()
            ir(pg, "mediciones", {**ADULTO, "categorias": []}, medidas=[None, None, None])
            pg.evaluate("() => window.MediBot.sensores.conectarSim('normal')"); pg.wait_for_timeout(300)
            accion(pg, "si"); pg.wait_for_timeout(1500)   # empieza el pulso (30 s)
            accion(pg, "no")                                # Saltar
            accion(pg, "no"); accion(pg, "no"); accion(pg, "si")  # saltar temperatura y peso, continuar → «Qué cuidar»
            antes = [pantalla(pg), boton(pg, "verde"), boton(pg, "rojo")]
            pg.wait_for_timeout(31000)
            despues = [pantalla(pg), boton(pg, "verde"), boton(pg, "rojo")]
            revisa(antes[0] == "cuidar" and antes == despues, f"30 s después la botonera sigue siendo la de «{antes[0]}»: {antes} → {despues}")
            revisa("Midiendo" not in ultimo(pg) and "Pulso" not in ultimo(pg), "y la voz no habla de la medición vieja: " + ultimo(pg)[:60])
            pg.evaluate("() => window.MediBot.terminar()"); pg.close()

            # ------------------------------------------------------------------------------------------------ 53, 56
            print("53 · oxígeno urgente: voz = pantalla; 56 · lo escrito a mano se evalúa al confirmar")
            pg = pagina()
            ir(pg, "mediciones", ADULTO, medidas=[None, None, None])
            pg.click("[data-medicion=fc] >> text=Escribir a mano"); pg.fill("#m-fc", "80"); pg.fill("#m-spo2", "84"); pg.wait_for_timeout(1500)
            sin_confirmar = [boton(pg, "verde"), pg.locator(".aviso-rojo:not([hidden])").count(), ultimo(pg)]
            revisa(sin_confirmar[0] != "Ver qué hacer ahora" and sin_confirmar[1] == 0 and "urgencia" not in sin_confirmar[2].lower(), f"sin confirmar (1.5 s después) no hay rojo ni en pantalla ni en voz: {sin_confirmar[:2]}")
            pg.press("#m-spo2", "Enter"); pg.wait_for_timeout(150)
            franja = pg.inner_text(".aviso-rojo:not([hidden]) p") if pg.locator(".aviso-rojo:not([hidden])").count() else ""
            u = ultimo(pg)
            revisa(boton(pg, "verde") == "Ver qué hacer ahora" and "Ya no necesitas medir más" in franja and "Ya no necesitas medir más" in u and "ver qué hacer ahora" in u.lower(), f"al confirmar con Enter: franja «{franja}» y voz «{u[:80]}»")
            ir(pg, "mediciones", ADULTO, medidas=[None, None, None], opciones={"medicion": 1})
            pg.click("[data-medicion=temp] >> text=Escribir a mano"); pg.fill("#m-temp", "35"); pg.wait_for_timeout(1500)
            revisa(boton(pg, "verde") != "Ver qué hacer ahora" and pg.locator(".aviso-rojo:not([hidden])").count() == 0 and sesion(pg)["medidas"]["temp"]["valor"] is None, "«35» escrito y sin confirmar: no cuenta (ni rojo ni guardado)")
            pg.fill("#m-temp", "36.5"); accion(pg, "si"); pg.wait_for_timeout(100)
            revisa(sesion(pg)["medidas"]["temp"]["valor"] == 36.5 and boton(pg, "verde") == "Siguiente", "el verde lo confirma y la botonera pasa a «Siguiente»")
            pg.close()

            # ------------------------------------------------------------------------------------------------ 54
            print("54 · cambiar a la persona en «¿Está bien esto?» vuelve a hacer las preguntas de alarma")
            pg = pagina()
            ir(pg, "confirmar", ADULTO)
            pg.click(".datos__fila:has-text('Para quién') >> text=Cambiar"); pg.wait_for_timeout(80)
            pg.click(".opcion:has-text('Para un niño')"); pg.click(".opcion:has-text('3 meses a 11 años')"); pg.click(".opcion:has-text('2 a 5')")
            accion(pg, "siguiente"); pg.wait_for_timeout(80)
            txt = pg.inner_text("#app") if pantalla(pg) == "alarma" else ""
            revisa(pantalla(pg) == "alarma" and "Pregunta 1" in txt and "niño" in txt and "Pregunta 1" in voz(pg), f"tras cambiar a un niño, primero las preguntas de alarma ({pantalla(pg)})")
            for _ in range(15):
                if pantalla(pg) != "alarma": break
                accion(pg, "no" if boton(pg, "rojo") == "No" else "si")
            revisa(pantalla(pg) == "confirmar", f"y luego regresa a «¿Está bien esto?» ({pantalla(pg)})")
            pg.close()

            # ------------------------------------------------------------------------------------------------ 55, 57
            print("55 · la nota de cada medición en el resultado (pantalla y voz) y en la hoja; 57 · notas por perfil en la voz")
            pg = pagina()
            for nombre, ses, med, extra, busca in [
                    ("niño 2-5, pulso", NINO, [100, 97, 36.6], None, "80–130"),
                    ("temperatura que no se estabilizó", ADULTO, [80, 97, None], {"temp": {"valor": None, "origen": "sensor", "calidad": 0, "estado": "invalida", "nota": "La temperatura no se estabilizó."}}, "no se estabilizó"),
                    ("oxígeno urgente sin confirmar", ADULTO, [80, None, 36.6], {"spo2": {"valor": None, "origen": "sensor", "calidad": None, "estado": "invalida", "nota": "Salió 84 %, fuera de lo esperado, y no se confirmó."}}, "no se confirmó")]:
                ir(pg, "bienvenida", ses, medidas=med)
                pg.evaluate("(x) => { Object.assign(window.MediBot.sesion.medidas, x || {}); window.MediBot.ir('resultado'); }", extra); pg.wait_for_timeout(80)
                t, g = pg.inner_text("#app"), voz(pg)
                pg.evaluate("() => window.MediBot.ir('resumen')"); pg.wait_for_timeout(80)
                hj = pg.inner_text(".hoja")
                revisa(busca in t and busca in g and busca in hj, f"{nombre}: «{busca}» en pantalla {busca in t}, voz {busca in g}, hoja {busca in hj}")
            ir(pg, "resultado", {**ADULTO, "grupo": "60mas", "embarazoOpcion": None}, medidas=[80, 97, 36.6])
            nota = pg.evaluate("() => window.MediBotData.textos.niveles.verde.nota_60mas")
            revisa(nota in pg.inner_text("#app") and nota in voz(pg), "60 años o más en verde: la nota se ve y se oye")
            pg.close()

            # ------------------------------------------------------------------------------------------------ 58, 63, 69
            print("58 · hoja: título real, «Va en tu hoja» solo en las que van; 63 · etiquetas cortas; 69 · hoja roja limpia")
            pg = pagina()
            ses = {**EMB, "categorias": ["embarazo", "energia", "diarrea"]}
            ir(pg, "resumen", ses)
            pg.pdf(format="Letter", print_background=True)
            pg.evaluate("() => window.MediBotPantallas.ajustarHoja()")
            t = pg.evaluate("() => { const h = document.querySelector('.hoja'); const vis = [...h.querySelectorAll('.ideas-hoja > li')].filter(l => getComputedStyle(l).display !== 'none' || !document.querySelector('link[media=print]')); return { titulo: (h.querySelector('.hoja__ideas h2') || {}).textContent, n: h.querySelectorAll('.ideas-hoja > li').length }; }")
            pg.emulate_media(media="print")
            vis = pg.evaluate("() => [...document.querySelectorAll('.ideas-hoja > li')].filter(l => getComputedStyle(l).display !== 'none').length")
            titulo = pg.evaluate("() => (document.querySelector('.hoja__ideas h2') || {}).textContent")
            etiquetas = pg.eval_on_selector_all(".hoja .tabla--hoja .nivel", "els => els.map(e => [e.textContent, e.getClientRects().length])")
            pg.emulate_media(media="screen")
            esperado = "Tu idea" if vis == 1 else f"Tus {vis} ideas"
            revisa(titulo == esperado, f"el título dice las ideas que de verdad salen impresas: «{titulo}» ({vis} visibles)")
            revisa(all(len(x[0]) <= 14 and x[1] == 1 for x in etiquetas), f"etiquetas de estado cortas y en una línea: {etiquetas}")
            temas = pg.eval_on_selector_all(".ideas-hoja > li", "els => els.map(e => e.dataset.tema)")
            revisa("embarazo" in temas, f"al recortar se queda la idea de la situación (embarazo): {temas}")
            ir(pg, "fichas", ses)
            va = pg.evaluate("""() => { const r = window.MediBot.recomendar(); const M = window.MediBotRecomendaciones; const s = window.MediBot.sesion;
              return [...document.querySelectorAll('[data-item=idea]')].map((a, k) => [a.textContent.includes('Va en tu hoja'), M.vaEnHoja ? M.vaEnHoja(r.tarjetas[Number(a.dataset.i)], r, s.categorias, { omitir: ['senal_prenatal'], aceptadas: [] }) : null]); }""")
            # [marca en pantalla, motor]: la marca sale de la hoja IMPRESA (abajo, «revisión independiente»), que puede traer
            # menos que el motor si no caben en una carta; aquí: ninguna marca que el motor no ponga, y no todas marcadas
            revisa(all(b or not a for a, b in va) and any(not a for a, b in va), f"«Va en tu hoja» solo en las que van: {va}")
            ir(pg, "resumen", ADULTO, medidas=[80, 84, None])
            hj = pg.inner_text(".hoja")
            revisa("Fuentes: ." not in hj and "Vuelve o pide ayuda" not in hj and "no mejora en 2 días" not in hj, "hoja roja sin «Fuentes: .» vacío ni «Vuelve si…»")
            pg.close()

            # ------------------------------------------------------------------------------------------------ 59, 60, 67, 71
            print("59 · niño: se le habla al adulto; 60 · edad del niño a la vista y sin título repetido; 67 · «No / soy hombre»; 71 · peso simulado por edad")
            pg = pagina()
            ir(pg, "mediciones", NINO, medidas=[None, None, None])
            t = pg.inner_text("#app")
            revisa("no podrá ser verde" not in t, "mediciones de un niño: sin «Si omites, el resultado no podrá ser verde»")
            pg.evaluate("() => window.MediBot.ir('mediciones', { medicion: 2 })"); pg.wait_for_timeout(60)
            revisa("Que se suba el niño" in pg.inner_text("[data-medicion=peso]"), "peso: «Que se suba el niño o la niña…»")
            ir(pg, "resultado", NINO, medidas=[100, None, 36.6])
            t = pg.inner_text("#app") + voz(pg)
            revisa("No pudimos medirte bien" not in t, "resultado de un niño con algo omitido: sin «No pudimos medirte bien»")
            ir(pg, "sobreTi", {})
            pg.click(".opcion:has-text('Para un niño')"); pg.click(".opcion:has-text('3 meses a 11 años')"); pg.wait_for_timeout(120)
            h2 = pg.eval_on_selector_all(".bloque:not([hidden]) h2", "els => els.map(e => e.textContent)")
            vis25 = pg.locator(".opcion", has_text="2 a 5").first.bounding_box(); cont = pg.locator(".contenido").bounding_box(); bot = pg.locator(".botonera").bounding_box()
            revisa(len(h2) == len(set(h2)) and vis25 and vis25["y"] >= cont["y"] - 1 and vis25["y"] + vis25["height"] <= bot["y"] + 1, f"la sub-pregunta de edad se ve y sin título repetido: {h2}")
            ir(pg, "sobreTi", {"paraQuien": "yo", "grupo": "18a59"})
            pg.click(".opcion:has-text('No / soy hombre')"); pg.wait_for_timeout(60)
            g = voz(pg)
            revisa("pecho" not in g, "con «No / soy hombre» la voz no pregunta si das pecho: " + g[-80:])
            pg.evaluate("() => window.MediBot.sensores.conectarSim('normal')"); pg.wait_for_timeout(200)
            ir(pg, "bienvenida", NINO); pg.evaluate("() => window.MediBot.sensores.conectarSim('normal')"); pg.wait_for_timeout(200)
            pg.evaluate("() => window.MediBot.ir('mediciones', { medicion: 2 })"); pg.wait_for_timeout(200)
            accion(pg, "si"); pg.wait_for_timeout(14000)
            est = pg.inner_text("[data-medicion=peso] .medicion__estado")
            revisa("¿Se subió alguien más?" not in est and sesion(pg)["peso"]["valor"] is not None, f"un niño de 2 a 5 años en la báscula simulada no se rechaza: «{est}», {sesion(pg)['peso']}")
            pg.evaluate("() => window.MediBot.terminar()"); pg.close()

            # ------------------------------------------------------------------------------------------------ 61, 62, 70
            print("61 · al desplazarse se ve el título completo; 62 · simulación a 375 con letra grande; 70 · resaltado ≠ elegido")
            pg = pagina(375, 812, init="window.medibotEscritorio = { esApp: true, version: 'x', salida: 'x', salir() {}, imprimir: async () => ({ ok: true, motivo: '' }) };")
            ir(pg, "sobreTi", {"paraQuien": "yo", "grupo": "18a59"})
            pg.evaluate("() => window.MediBotVoz.leerPantalla()"); pg.wait_for_timeout(300)
            ok61 = pg.evaluate("""() => { const o = document.querySelector('.opcion--preguntando'); if (!o) return 'sin'; const b = o.closest('.bloque').querySelector('h2'); const r = b.getBoundingClientRect(); const c = document.querySelector('.contenido').getBoundingClientRect(); return r.top >= c.top - 0.5 && r.bottom <= c.bottom; }""")
            revisa(ok61 is True, f"la opción que pregunta la voz y el título de su pregunta se ven completos ({ok61})")
            est = pg.evaluate("() => { const p = document.querySelector('.opcion--preguntando'); const n = document.querySelector('.opcion[aria-pressed=true]'); return p && n ? [getComputedStyle(p).backgroundColor, getComputedStyle(n).backgroundColor, getComputedStyle(p).outlineStyle] : null; }")
            revisa(est and est[0] != est[1] and est[2] == "dashed", f"la opción de la voz va con contorno, distinta de la elegida (rellena): {est}")
            pg.close()
            pg = pagina(375, 812, escala="lg")
            ir(pg, "mediciones", ADULTO, medidas=[None, None, None])
            pg.evaluate("() => window.MediBot.sensores.conectarSim('normal')"); pg.wait_for_timeout(300)
            accion(pg, "si"); pg.wait_for_timeout(33000)
            revisa(visible(pg, "[data-medicion=fc] .medicion__etiquetas .nivel"), "simulación, 375×812, letra grande: la etiqueta de estado se ve al terminar")
            pg.evaluate("() => window.MediBot.terminar()"); pg.close()

            # ------------------------------------------------------------------------------------------------ 66, 68, 72, 74
            print("66 · última idea; 68 · Enter es el verde; 72 · sin «·» colgado; 74 · trato de tú")
            pg = pagina()
            ir(pg, "fichas", {**ADULTO, "categorias": ["vista"]})
            n = pg.locator("[data-item]").count()
            for _ in range(n - 1): accion(pg, "si")
            g1 = voz(pg); accion(pg, "no"); g2 = ultimo(pg)
            revisa("ver tu hoja" in g1.lower() and "ver tu hoja" in g2.lower(), f"última idea: «verde: ver tu hoja» al entrar y tras «No lo encuentro» ({g1[-40:]} | {g2[-40:]})")
            ir(pg, "sobreTi", {"paraQuien": "yo"})
            pg.click(".opcion:has-text('18 a 59')"); pg.keyboard.press("Enter"); pg.wait_for_timeout(80)
            revisa(pantalla(pg) != "sobreTi", f"Enter con el foco en una opción tocada hace lo del verde ({pantalla(pg)})")
            colgados = []
            for pan, ses2 in [("cuidar", ADULTO), ("resultado", ADULTO), ("fichas", {**ADULTO, "categorias": ["diarrea", "dolor_cabeza"]}), ("resumen", ADULTO)]:
                ir(pg, pan, ses2)
                colgados += pg.evaluate("() => [...document.querySelectorAll('#app *')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && /[^\\u00a0]·/.test(n.textContent))).map(e => e.textContent.slice(0, 40))")
            revisa(not colgados, f"«·» siempre pegado con espacio duro a la palabra anterior: {colgados[:3]}")
            ir(pg, "cuidar", {"paraQuien": "otra", "grupo": "60mas", "medicinas": ["presion"], "categorias": []})
            t = pg.inner_text("#app")
            revisa("le sugerimos" not in t and "te sugerimos" in t, "«…te sugerimos estas ideas» (trato de tú)")
            pg.close()

            # ---------------------------------------------- revisión independiente de la ronda 3 (58, 59, 61, 54, 67)
            print("58 · «Va en tu hoja» = las ideas que de verdad salen en la hoja IMPRESA (después del ajuste a una carta)")
            MAY = {"paraQuien": "yo", "grupo": "60mas", "embarazoOpcion": "no_aplica", "embarazoRespondido": True, "medicinas": ["presion"]}
            IMPRESAS = """() => { window.MediBotPantallas.ajustarHoja(); const h = document.querySelector('.hoja');
              return { nombres: [...h.querySelectorAll('.ideas-hoja > li')].filter(l => l.getClientRects().length).map(l => l.querySelector('b').textContent.replace(/:\\s*$/, '')),
                       titulo: (h.querySelector('.hoja__ideas h2') || {}).textContent || '' }; }"""
            por_ancho: dict[str, list] = {}
            for (w, hh) in [(1280, 800), (375, 812)]:
                pg = pagina(w, hh)
                for nombre, ses, cats in [("Juana", EMB, ["embarazo", "energia"]), ("embarazo largo", EMB, ["embarazo", "energia", "diarrea"]),
                                          ("persona mayor", MAY, ["sueno", "mayor", "huesos"]), ("niño", NINO, ["ninos", "diarrea", "defensas"]),
                                          ("adulto", ADULTO, ["diarrea", "dolor_cabeza", "defensas"])]:
                    ir(pg, "fichas", {**ses, "categorias": cats})
                    if pantalla(pg) != "fichas": revisa(False, f"{nombre}: no llegó a las ideas ({pantalla(pg)})"); continue
                    marcadas = pg.evaluate("""() => { const r = window.MediBot.recomendar();
                      return [...document.querySelectorAll('[data-item=idea]')].filter(a => a.textContent.includes('Va en tu hoja')).map(a => r.tarjetas[Number(a.dataset.i)].entrada.nombre); }""")
                    pg.evaluate("() => window.MediBot.ir('resumen')"); pg.wait_for_timeout(100)
                    pg.emulate_media(media="print"); imp = pg.evaluate(IMPRESAS); pg.emulate_media(media="screen")
                    n = len(imp["nombres"])
                    revisa(sorted(marcadas) == sorted(imp["nombres"]) and imp["titulo"] == ("Tu idea" if n == 1 else f"Tus {n} ideas"),
                           f"{nombre} {w}: marcadas {marcadas} = impresas {imp['nombres']} («{imp['titulo']}»)")
                    por_ancho.setdefault(nombre, []).append(sorted(imp["nombres"]))
                pg.close()
            # el papel es el mismo aunque la pantalla sea angosta (la hoja se mide con las reglas de impresión)
            revisa(all(len(v) == 2 and v[0] == v[1] for v in por_ancho.values()), "la hoja impresa trae las mismas ideas a 375 que a 1280: " + json.dumps({k: [len(x) for x in v] for k, v in por_ancho.items()}, ensure_ascii=False))

            print("58 · la marca de la idea EN TURNO no promete de más (con su verde va; tras su rojo se recalcula)")
            pg = pagina()
            for nombre, ses in [("adulto", {**ADULTO, "categorias": ["diarrea", "dolor_cabeza", "defensas"]}), ("niño", {**NINO, "categorias": ["ninos", "diarrea", "defensas"]}),
                                ("Juana", {**EMB, "categorias": ["embarazo", "energia", "diarrea"]})]:
                for modo in ["acepta", "rechaza_pares"]:
                    ir(pg, "fichas", ses); vistos = {}; k = 0
                    for _ in range(40):
                        if pantalla(pg) != "fichas": break
                        cur = pg.evaluate("() => { const a = document.querySelector('[data-item=idea]:not([hidden])'); if (!a) return null; const r = window.MediBot.recomendar(); return [r.tarjetas[Number(a.dataset.i)].entrada.nombre, a.querySelector('.idea__va') ? a.querySelector('.idea__va').textContent : null]; }")
                        if cur:
                            vistos[cur[0]] = cur[1]
                            if modo == "rechaza_pares" and k % 2 == 0:
                                accion(pg, "no"); vistos[cur[0]] = pg.evaluate("() => { const s = document.querySelector('[data-item=idea]:not([hidden]) .idea__va'); return s ? s.textContent : null; }")
                            k += 1
                        accion(pg, "si")
                    pg.emulate_media(media="print"); imp = pg.evaluate(IMPRESAS); pg.emulate_media(media="screen")
                    # nunca promete de más; si la persona acepta todo, dice exactamente lo que sale (rechazar después puede dejarle
                    # lugar a una idea que en su turno no decía «Va en tu hoja»: eso se permite)
                    de_mas = [n for n, v in vistos.items() if v is not None and "Va en tu hoja" in v and n not in imp["nombres"]]
                    de_menos = [n for n, v in vistos.items() if v is not None and "Va en tu hoja" not in v and n in imp["nombres"]]
                    revisa(pantalla(pg) == "resumen" and not de_mas and (modo != "acepta" or not de_menos),
                           f"{nombre}, {modo}: «Va en tu hoja» en su turno y no salió: {de_mas}; salió sin decirlo: {de_menos}")
            pg.close()

            print("59 · niño: resultado, voz y hoja impresa le hablan al adulto")
            pg = pagina()
            ADULTO_TU = r"(Si empeoras|tus mediciones|Tus mediciones|Te sientes peor|medirte|te revise|Acude a tu|Acude hoy|ve a tu centro|ve hoy a tu centro|que estés|se te pasa|que te lleven)"
            for med in [[100, 97, 36.6], [100, None, 36.6], [110, 85, 36.6]]:
                ir(pg, "resultado", NINO, medidas=med)
                t, g = pg.inner_text("#app"), voz(pg)
                pg.evaluate("() => window.MediBot.ir('resumen')"); pg.wait_for_timeout(80)
                pg.emulate_media(media="print"); hj = pg.evaluate("() => { window.MediBotPantallas.ajustarHoja(); return document.querySelector('.hoja').innerText; }"); pg.emulate_media(media="screen")
                malas = sorted(set(re.findall(ADULTO_TU, t) + re.findall(ADULTO_TU, g) + re.findall(ADULTO_TU, hj)))
                revisa(not malas, f"niño {med}: sin trato de «tú» al niño en pantalla, voz ni hoja impresa: {malas}")
            pg.close()

            print("61 · la voz deja el título de la pregunta completo o fuera de vista, nunca a la mitad")
            MITAD = """() => { const o = document.querySelector('.opcion--preguntando'); if (!o) return null; const t = o.closest('.bloque') && o.closest('.bloque').querySelector('h2'); if (!t) return 'sin título';
              const c = document.getElementById('contenido').getBoundingClientRect(); const b = document.querySelector('.botonera'); const abajo = b && b.getClientRects().length ? Math.min(c.bottom, b.getBoundingClientRect().top) : c.bottom;
              const r = t.getBoundingClientRect(); const ro = o.getBoundingClientRect();
              const mitad = (r.top < c.top - 0.5 && r.bottom > c.top + 0.5) || (r.top < abajo - 0.5 && r.bottom > abajo + 0.5);
              return mitad || ro.top < c.top - 0.5 || ro.bottom > abajo + 0.5 ? t.textContent.slice(0, 30) + ' / ' + o.textContent.trim().slice(0, 20) : 'ok'; }"""
            for (w, hh, esc) in [(375, 812, "md"), (375, 812, "lg"), (1280, 800, "lg")]:
                pg = pagina(w, hh, escala=esc); pg.emulate_media(reduced_motion="reduce")
                for ses in [{}, {"paraQuien": "otra"}]:
                    ir(pg, "sobreTi", ses)
                    pg.evaluate("() => window.MediBotVoz.leerPantalla()"); pg.wait_for_timeout(150)
                    malos = []
                    for _ in range(14):
                        if pantalla(pg) != "sobreTi": break
                        c = pg.evaluate(MITAD)
                        if c is None: break
                        if c != "ok": malos.append(c)
                        accion(pg, "no"); pg.wait_for_timeout(100)
                    revisa(not malos, f"{w}×{hh} {esc} {ses.get('paraQuien', 'yo')}: título y opción a la vista en cada paso {malos[:2]}")
                pg.close()

            print("54 · al terminar las preguntas pendientes, el verde dice a dónde va de verdad; 67 · «No / soy hombre» por voz")
            pg = pagina()
            ir(pg, "confirmar", ADULTO)
            pg.click(".datos__fila:has-text('Para quién') >> text=Cambiar"); pg.wait_for_timeout(80)
            pg.click(".opcion:has-text('Para un niño')"); pg.click(".opcion:has-text('3 meses a 11 años')"); pg.click(".opcion:has-text('2 a 5')")
            accion(pg, "siguiente")
            for _ in range(15):
                if pantalla(pg) != "alarma" or "Ya contestaste" in pg.inner_text("#app"): break
                accion(pg, "no")
            verde, dicho = boton(pg, "verde"), ultimo(pg)
            accion(pg, "si")
            revisa(pantalla(pg) == "confirmar" and "medir" not in (verde or "").lower() and "medir" not in dicho.lower() and "revisar" in (verde or "").lower(),
                   f"verde «{verde}», voz «{dicho[-60:]}» → {pantalla(pg)}")
            ir(pg, "sobreTi", {})
            pg.evaluate("() => window.MediBotVoz.leerPantalla()"); pg.wait_for_timeout(100)
            accion(pg, "si")
            for _ in range(6):
                u = ultimo(pg)
                if "embarazada" in u: break
                accion(pg, "si" if "18 a 59" in u else "no")
            u = accion(pg, "no")
            revisa("Si eres mujer, ¿estás dando pecho?" in u and sesion(pg)["embarazoOpcion"] is None, f"rojo a «¿estás embarazada?»: pregunta «Si eres mujer, ¿estás dando pecho?» (sin elegir nada): «{u[-70:]}»")
            u2 = accion(pg, "no")
            elegidas = pg.eval_on_selector_all(".opcion[aria-pressed=true]", "els => els.map(e => e.textContent.trim())")
            revisa("pecho" not in u2 and any("soy hombre" in e for e in elegidas) and sesion(pg)["embarazoOpcion"] == "no", f"y el rojo ahí deja «No / soy hombre» y no vuelve a preguntar: «{u2[-60:]}»")
            ir(pg, "sobreTi", {"paraQuien": "yo", "grupo": "18a59", "categorias": ["sueno"]})
            pg.evaluate("() => window.MediBotVoz.leerPantalla()"); pg.wait_for_timeout(100)
            accion(pg, "no"); accion(pg, "si")
            lact = pg.evaluate("() => [window.MediBot.sesion.embarazoOpcion, window.MediBot.recomendar().perfil.lactancia]")
            revisa(lact == ["lactancia", True], f"una mujer que da pecho lo puede decir por voz (rojo a embarazo, verde a «dando pecho»): {lact}")
            ir(pg, "sobreTi", {"paraQuien": "yo", "grupo": "18a59"})
            pg.evaluate("() => window.MediBotVoz.leerPantalla()"); pg.wait_for_timeout(100)
            pg.click(".opcion:has-text('No / soy hombre')"); pg.wait_for_timeout(80)
            u1 = accion(pg, "si"); accion(pg, "si")
            revisa(sesion(pg)["embarazoOpcion"] == "no" and "embarazada" not in u1, f"tocar «No / soy hombre» y luego verde, verde: no vuelve a preguntar ni elige «Sí» ({sesion(pg)['embarazoOpcion']}, «{u1[-60:]}»)")
            pg.close()
            nav.close()
    finally:
        srv.terminate(); srv.wait(timeout=10)
        print(f"servidor PID={srv.pid} detenido (código {srv.returncode})")
    revisa(not errores, "consola sin errores: " + json.dumps(errores[:5], ensure_ascii=False))
    print("E2E RONDA 3: OK" if not fallas else f"E2E RONDA 3: FALLÓ ({len(fallas)})")
    sys.exit(1 if fallas else 0)


if __name__ == "__main__":
    main()
