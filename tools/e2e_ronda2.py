"""Pruebas en el navegador de la ronda de correcciones (criterios 32–51; el 34 está en
tests/ronda2_sim.test.mjs y el 40 en tests/ronda2_ninos.test.mjs). Cada revisión dice qué criterio comprueba.
Uso (desde la carpeta MediBot):  PYTHONUTF8=1 python tools/e2e_ronda2.py [--capturas DIR]"""
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

            # ------------------------------------------------------------------------------------------------ 32
            print("32 · el 911 siempre completo en los 6 rojos (375 y 1280, letra normal y grande, claro y oscuro)")
            pg0 = pagina()
            rojas = pg0.evaluate("() => window.MediBotData.alarma.preguntas.filter(p => p.nivel === 'rojo' && !p.solo_grupo).map(p => p.id)")
            pg0.close()
            casos = [("oxigeno", {}, [80, 84, None])] + [(r, {"alarma": {r: True}}, None) for r in rojas]
            revisa(len(casos) == 6, f"6 rojos: {[c[0] for c in casos]}")
            malos = []
            for (w, h) in [(375, 812), (1280, 800)]:
                for escala in ["md", "lg"]:
                    for tema in ["light", "dark"]:
                        pg = pagina(w, h, tema, escala)
                        for nombre, extra, med in casos:
                            ir(pg, "resultado", {**ADULTO, **extra}, medidas=med)
                            m = pg.evaluate("() => ({ nivel: window.MediBot.evaluar().nivel, heroe: (document.querySelector('.heroe p') || {}).textContent || '' })")
                            ok = m["nivel"] == "rojo" and visible(pg, ".caja-911") and len(m["heroe"]) <= 45 and "¿" not in m["heroe"]
                            if not ok:
                                malos.append(f"{w}x{h}/{escala}/{tema}/{nombre}: «{m['heroe'][:50]}»")
                                captura(pg, f"rojo_{w}_{escala}_{tema}_{nombre}")
                        pg.close()
            revisa(not malos, f"caja del 911 completa y porqué en una línea corta en 48 vistas ({len(malos)} malas: {malos[:3]})")
            texto_sistema = (raiz / "docs" / "diseno" / "sistema.md").read_text(encoding="utf-8")
            revisa("A 1280×800 el resultado rojo sigue mostrando el 911 completo" not in texto_sistema or "también con «Letra grande»" in texto_sistema, "sistema.md §7 no dice nada falso sobre el 911 con «Letra grande»")

            # ------------------------------------------------------------------------------------------------ 33
            print("33 · la voz de las ideas nunca recorta dosis ni avisos")
            pg = pagina()
            for nombre, ses in [("niño 2-5 con diarrea", NINO), ("embarazada", EMB)]:
                ir(pg, "fichas", ses)
                info = pg.evaluate("""() => { const M = window.MediBotRecomendaciones; const r = window.MediBot.recomendar();
                  return r.tarjetas.map(t => ({ id: t.entrada.id, como: M.comoPara(t.entrada, r.perfil) || '', avisos: t.avisos })); }""")
                dicho = [voz(pg)]
                for _ in range(40):
                    if pantalla(pg) != "fichas": break
                    dicho.append(accion(pg, "si"))
                todo = " ".join(dicho)
                faltan = [i["id"] for i in info if (i["como"] and i["como"] not in todo) or any(av not in todo for av in i["avisos"])]
                revisa(not faltan, f"{nombre}: cada idea dice su «cómo y cuánto» y sus avisos completos (faltan: {faltan})")
            ir(pg, "resultado", {**EMB, "categorias": []})
            linea = pg.evaluate("() => window.MediBotData.textos.embarazo.linea")
            revisa(linea in voz(pg), "el resultado verde de una embarazada dice la línea del control prenatal")
            pg.close()

            # ------------------------------------------------------------------------------------------------ 35, 36, 50
            print("35 · oxígeno urgente confirmado → resultado directo; 36 · Saltar omite de verdad; 50 · temperatura a mano")
            pg = pagina()
            ir(pg, "mediciones", {"paraQuien": "yo", "grupo": "18a59", "medicinas": ["ninguna"]}, medidas=[None, None, None])
            pg.click("[data-medicion=fc] >> text=Escribir a mano"); pg.fill("#m-fc", "80"); pg.fill("#m-spo2", "84"); pg.press("#m-spo2", "Enter"); pg.wait_for_timeout(150)  # ronda 3, criterio 56: lo escrito cuenta al confirmarlo
            revisa(boton(pg, "verde") == "Ver qué hacer ahora", f"con el oxígeno en 84 el verde dice «Ver qué hacer ahora» ({boton(pg, 'verde')})")
            accion(pg, "si")
            revisa(pantalla(pg) == "resultado" and pg.evaluate("() => window.MediBot.evaluar().nivel") == "rojo", "S lleva directo al resultado rojo (sin «Qué cuidar» ni «Confirmar»)")
            ir(pg, "mediciones", {"paraQuien": "yo", "grupo": "18a59"}, medidas=[None, None, None])
            pg.evaluate("() => { const s = window.MediBot.sesion; s.medidas.fc = { valor: 130, origen: 'sensor', calidad: 1, estado: 'confirmar', intentos: 1 }; s.medidas.spo2 = { valor: 97, origen: 'sensor', calidad: 1, estado: 'confirmar', intentos: 1 }; window.MediBot.ir('mediciones'); }")
            pg.wait_for_timeout(60)
            revisa(boton(pg, "rojo") == "Saltar", f"con «falta confirmar», el rojo dice «Saltar» ({boton(pg, 'rojo')})")
            accion(pg, "no")
            m = sesion(pg)["medidas"]
            revisa(m["fc"]["valor"] is None and m["fc"]["estado"] is None, f"Saltar omite la medición pendiente: {m['fc']}")
            accion(pg, "no")  # salta la temperatura
            accion(pg, "no")  # salta el peso (criterio 41: ahora es la medición 3 de 3)
            accion(pg, "si")  # continuar
            revisa(pantalla(pg) == "cuidar", f"y se puede seguir solo con botones ({pantalla(pg)})")
            # revisión independiente: un oxígeno urgente SIN confirmar que se salta no se borra sin rastro, y la voz dice «Rojo: saltar»
            ir(pg, "mediciones", {"paraQuien": "yo", "grupo": "18a59"}, medidas=[None, None, None])
            pg.evaluate("() => { const s = window.MediBot.sesion; s.medidas.fc = { valor: 80, origen: 'sensor', calidad: 1, estado: 'confirmar', intentos: 1 }; s.medidas.spo2 = { valor: 84, origen: 'sensor', calidad: 1, estado: 'confirmar', intentos: 1 }; window.MediBot.ir('mediciones'); }")
            pg.wait_for_timeout(60)
            revisa("Rojo: saltar" in voz(pg) and boton(pg, "rojo") == "Saltar", "con una lectura por confirmar, la voz y la botonera dicen «saltar»: " + voz(pg)[-60:])
            accion(pg, "no")
            m = sesion(pg)["medidas"]["spo2"]
            revisa(m["estado"] == "invalida" and "84" in (m.get("nota") or ""), f"saltar un oxígeno urgente sin confirmar lo deja «no válido», con lo que salió: {m}")
            ir(pg, "mediciones", {"paraQuien": "yo", "grupo": "18a59"}, medidas=[None, None, None], opciones={"medicion": 1})
            pg.click("[data-medicion=temp] >> text=Escribir a mano"); pg.type("#m-temp", "35.5", delay=60); pg.wait_for_timeout(20)
            revisa(boton(pg, "verde") != "Ver qué hacer ahora", "escribiendo «35.5» a mano, el verde no salta a «Ver qué hacer ahora» a la mitad")
            pg.fill("#m-temp", "36.5"); pg.press("#m-temp", "Enter"); pg.wait_for_timeout(150)  # criterio 56: se confirma
            revisa(boton(pg, "verde") == "Siguiente", f"50: tras escribir la temperatura, el verde dice «Siguiente» ({boton(pg, 'verde')})")
            pg.close()

            # ------------------------------------------------------------------------------------------------ 37
            print("37 · con letra grande (1280) y a 375, la pregunta y la medición se ven sin desplazar")
            for (w, h, esc) in [(1280, 800, "lg"), (375, 812, "md"), (375, 812, "lg")]:
                pg = pagina(w, h, escala=esc)
                ir(pg, "alarma", {"paraQuien": "yo", "grupo": "18a59", "medicinas": ["ninguna"]}, medidas=[None, None, None])
                pg.evaluate("() => { const s = window.MediBot.sesion; s.alarma = {}; window.MediBot.ir('alarma'); }"); pg.wait_for_timeout(80)
                a1 = visible(pg, ".pregunta h2")
                accion(pg, "no"); a2 = visible(pg, ".pregunta h2")
                pg.keyboard.press("n"); pg.wait_for_timeout(60); a3 = visible(pg, ".pregunta h2")
                ir(pg, "mediciones", {"paraQuien": "yo", "grupo": "18a59"}, medidas=[None, None, None])
                pg.click("[data-medicion=fc] >> text=Escribir a mano"); pg.fill("#m-fc", "80"); pg.fill("#m-spo2", "97"); pg.press("#m-spo2", "Enter"); pg.wait_for_timeout(80)
                pg.evaluate("() => window.MediBotVoz.accion('repetir')"); pg.wait_for_timeout(80)
                m1 = visible(pg, "[data-medicion=fc] .medicion__valor") and visible(pg, "[data-medicion=fc] .medicion__etiquetas")
                revisa(a1 and a2 and a3 and m1, f"{w}×{h} {esc}: pregunta de alarma (al entrar, con S/N y con tecla) {a1, a2, a3}; número y su estado {m1}")
                captura(pg, f"medicion_{w}_{esc}")
                pg.close()

            # ------------------------------------------------------------------------------------------------ 38
            print("38 · hoja impresa: texto de 11 pt o más; quita secciones antes de achicar; el rojo aprovecha la página")
            pg = pagina()
            for nombre, ses, med in [("largo", {**EMB, "medicinas": ["no_se"], "categorias": ["dolor_cabeza", "diarrea", "embarazo"]}, [80, 97, 38.4]),
                                     ("tres secciones", {**ADULTO, "categorias": ["sueno", "diarrea", "azucar_peso"]}, None), ("rojo", ADULTO, [80, 84, None])]:
                ir(pg, "resumen", ses, medidas=med)
                pdf = pg.pdf(format="Letter", print_background=True)
                paginas = len(re.findall(rb"/Type\s*/Page[^s]", pdf))
                pg.emulate_media(media="print")
                minimo = pg.evaluate("""() => { window.MediBotPantallas.ajustarHoja(); const h = document.querySelector('.hoja'); const z = parseFloat(h.style.zoom || '1');
                  let min = 99; for (const e of h.querySelectorAll('*')) { if (!e.getClientRects().length) continue; const tx = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (!tx) continue;
                    min = Math.min(min, parseFloat(getComputedStyle(e).fontSize) * z * 0.75); } return { min: Math.round(min * 10) / 10, base: parseFloat(getComputedStyle(h).fontSize) * 0.75, zoom: z }; }""")
                pg.emulate_media(media="screen")
                quitado = pg.evaluate("() => document.querySelector('.hoja').className")
                # 38: ≥ 11 pt; solo se achica debajo si ya se quitó todo lo que se puede quitar (la última clase es hoja--sin-fuentes)
                revisa(paginas == 1 and (minimo["min"] >= 11 or "hoja--sin-fuentes" in quitado), f"{nombre}: {paginas} página(s), letra mínima {minimo['min']} pt, zoom {minimo['zoom']}, quitado: {quitado.replace('hoja ', '')}")
                if nombre == "rojo": revisa(minimo["base"] >= 13, f"rojo: la hoja aprovecha la página (letra base {minimo['base']:.1f} pt ≥ 13)")
                if a.capturas: (a.capturas / f"r2_hoja_{nombre.replace(' ', '_')}.pdf").write_bytes(pdf)
            pg.close()

            # ------------------------------------------------------------------------------------------------ 39
            print("39 · consulta para un niño: se habla al adulto; sin «No pudimos medirte bien» ni «sin color»")
            pg = pagina()
            ir(pg, "alarma", NINO)
            pg.evaluate("() => { window.MediBot.sesion.alarma = {}; window.MediBot.ir('alarma'); }"); pg.wait_for_timeout(60)
            t = pg.inner_text(".pregunta h2"); g = voz(pg)
            revisa(not re.search(r"\b(te duele|te falta|se te|te desmayaste|Estás)\b", t) and ("niño" in t or "niña" in t), "la pregunta de alarma habla del niño o la niña: " + t[:70])
            revisa("Al niño o la niña" in g or "el niño o la niña" in g, "y la voz también")
            ir(pg, "resultado", NINO, medidas=[100, 97, 36.6])
            txt = pg.inner_text("#app"); g = voz(pg)
            revisa("No pudimos medirte bien" not in txt + g and "sin color" not in g, "resultado de un niño medido: sin «No pudimos medirte bien» y la voz sin «sin color»")
            ir(pg, "resumen", NINO, medidas=[100, 97, 36.6])
            revisa("No pudimos medirte bien" not in pg.inner_text(".hoja"), "tampoco en la hoja")
            ir(pg, "fichas", NINO)
            revisa("tu niño" in pg.inner_text("#titulo-pantalla").lower() or "tu niño" in voz(pg).lower(), "las ideas dicen «tu niño o niña»")
            ir(pg, "fichas", {**NINO, "categorias": ["diarrea", "digestion"]})
            ley = pg.evaluate("() => [...document.querySelectorAll('[data-item]')].filter(a => a.querySelector('.leyenda')).map(a => a.querySelector('h2').textContent)")
            revisa(not any("suero" in x.lower() for x in ley), f"40: el suero oral (se pide en el centro de salud) no lleva la leyenda COFEPRIS ({ley})")
            pg.close()

            # ------------------------------------------------------------------------------------------------ 41
            print("41 · báscula: solo en Mediciones, después de elegir para quién; al cambiar de persona se borra")
            pg = pagina()
            pg.evaluate("() => window.MediBot.sensores.conectarSim('normal')"); pg.wait_for_timeout(200)
            pg.evaluate("() => { const M = window.MediBot; M.ir('bienvenida'); M.ir('sobreTi'); }"); pg.wait_for_timeout(4000)
            revisa(sesion(pg)["peso"]["valor"] is None and pg.locator("text=Pesar con la báscula").count() == 0, "en «Sobre ti» la báscula no pesa ni hay botón para pesar")
            pg.evaluate("() => { const M = window.MediBot; Object.assign(M.sesion, { paraQuien: 'yo', grupo: '18a59' }); M.ir('alarma'); }"); pg.wait_for_timeout(4000)
            revisa(sesion(pg)["peso"]["valor"] is None and pantalla(pg) == "alarma", "en «Preguntas importantes» tampoco: nunca interrumpe otra pantalla")
            pg.evaluate("() => window.MediBot.ir('mediciones', { medicion: 2 })"); pg.wait_for_timeout(200)
            pg.wait_for_function("() => window.MediBot.sesion.peso.valor", timeout=25000)
            revisa(sesion(pg)["peso"]["origen"] == "simulado", "en Mediciones sí se pesa")
            pg.evaluate("() => { const M = window.MediBot; M.ir('sobreTi'); }"); pg.wait_for_timeout(60)
            pg.click(".opcion:has-text('Para otra persona')"); pg.wait_for_timeout(60)
            revisa(sesion(pg)["peso"]["valor"] is None, "al cambiar de persona, el peso se borra")
            pg.evaluate("() => window.MediBot.terminar()")
            pg.close()

            # ------------------------------------------------------------------------------------------------ 42, 43
            print("42 · tocar con la voz encendida elige esa opción y detiene la voz; 43 · «Si eres mujer…» y «No / soy hombre» primero")
            pg = pagina(init="window.medibotEscritorio = { esApp: true, version: 'x', salida: 'x', salir() {}, imprimir: async () => ({ ok: true, motivo: '' }) };")
            ir(pg, "medicinas", {"paraQuien": "yo", "grupo": "18a59", "medicinas": []}, opciones={"lista": True})
            pg.evaluate("() => window.MediBotVoz.leerPantalla()")
            pg.click(".opcion:has-text('Para el azúcar')"); pg.wait_for_timeout(80)
            u = ultimo(pg)
            marcadas = pg.evaluate("() => [...document.querySelectorAll('.opcion--preguntando')].length")
            revisa(sesion(pg)["medicinas"] == ["azucar"] and marcadas == 0 and u.startswith("Elegiste") and "¿" not in u, f"elige solo esa, sin resaltar otra y sin seguir preguntando: {sesion(pg)['medicinas']}, {marcadas}, «{u[:60]}»")
            ir(pg, "sobreTi", {"paraQuien": "yo", "grupo": "18a59"})
            emb = pg.evaluate("() => { const b = document.querySelectorAll('.bloque')[3]; return b ? [b.querySelector('h2').textContent, b.querySelector('.opcion').textContent] : null; }")
            revisa(emb and "Si eres mujer" in emb[0] and emb[1].startswith("No / soy hombre"), f"la pregunta de embarazo: {emb}")
            revisa("Si eres mujer" in voz(pg), "la voz también dice «Si eres mujer»: " + voz(pg)[:90])
            pg.close()

            # ------------------------------------------------------------------------------------------------ 44, 49
            print("44 · el reposo dice «Si es urgente, llama al 911» en pantalla y en voz; 49 · «Letra grande» se apaga al terminar")
            pg = pagina(375, 812)
            pg.evaluate("() => window.MediBot.terminar()")
            revisa(visible(pg, ".reposo__urgencia") and "911" in pg.inner_text(".reposo__urgencia"), "la línea del 911 cabe sin desplazar a 375×812")
            pg.keyboard.press("x"); pg.wait_for_timeout(60)
            revisa("urgente" in ultimo(pg) and ("9 1 1" in ultimo(pg) or "911" in ultimo(pg)), "la voz del reposo lo dice: " + ultimo(pg)[:80])
            pg.close()
            pg = pagina()
            ir(pg, "sobreTi", {"paraQuien": "yo", "grupo": "18a59"})
            pg.click("[data-accion=letra]"); pg.keyboard.press("Enter"); pg.wait_for_timeout(60)
            revisa(pg.evaluate("() => document.documentElement.dataset.scale") == "lg", "Enter después de tocar «Letra grande» no la apaga")
            pg.evaluate("() => window.MediBot.terminar()")
            revisa(pg.evaluate("() => document.documentElement.dataset.scale") == "md", "al terminar la consulta vuelve a letra normal")
            pg.close()

            # ------------------------------------------------------------------------------------------------ 45
            print("45 · la voz y la botonera dicen lo mismo")
            pg = pagina()
            ir(pg, "mediciones", {"paraQuien": "yo", "grupo": "18a59"}, medidas=[None, None, None])
            pg.evaluate("() => { const S = window.MediBot.sensores; S.modo = 'sim'; S.medir = () => Promise.reject(new Error('mala señal')); }")
            t = accion(pg, "si"); pg.wait_for_timeout(100); t = ultimo(pg)
            revisa("No pude leer bien" in t and boton(pg, "verde") == "Medir" and boton(pg, "rojo") == "Saltar" and "Verde: medir" in t and "Rojo: saltar" in t, f"«No pude leer bien»: verde {boton(pg, 'verde')}, rojo {boton(pg, 'rojo')}; voz «{t[-70:]}»")
            pg.evaluate("() => { window.MediBot.sensores.modo = 'desconectado'; }")
            ir(pg, "fichas", ADULTO)
            accion(pg, "no")
            revisa(boton(pg, "verde") not in ("Sí lo tengo", "Sí puedo"), f"tras «No lo encuentro», el verde no dice «Sí lo tengo» ({boton(pg, 'verde')})")
            hab = pg.evaluate("() => { const r = window.MediBot.recomendar(); return r.tarjetas.findIndex(t => t.entrada.tipo === 'habito'); }")
            ir(pg, "fichas", {**ADULTO, "categorias": ["sueno"]})
            for _ in range(10):
                if boton(pg, "verde") == "Sí puedo": break
                accion(pg, "si")
            revisa(boton(pg, "verde") != "Sí puedo" or "Si puedes hacerlo" in voz(pg), "«Sí puedo» en la botonera ↔ «Si puedes hacerlo, aprieta el verde» en la voz")
            pg.close()

            # ------------------------------------------------------------------------------------------------ 46, 47, 48, 51
            print("46 · hoja; 47 · palabras; 48 · voz del rojo; 51 · trato de «tú»")
            pg = pagina()
            ir(pg, "resumen", {**ADULTO, "categorias": ["diarrea", "dolor_cabeza"]})
            revisa("Esta no tiene cambio" not in pg.inner_text(".hoja"), "la hoja no dice «Esta no tiene cambio» si no se rechazó nada")
            ir(pg, "fichas", {**ADULTO, "categorias": ["diarrea"]})
            for _ in range(12):
                sin = pg.evaluate("() => { const it = [...document.querySelectorAll('[data-item=idea]')].find(e => !e.hidden); return it ? it.textContent.includes('Esta no tiene cambio') : false; }")
                if sin: break
                accion(pg, "si")
            accion(pg, "no"); pg.evaluate("() => window.MediBot.ir('resumen')"); pg.wait_for_timeout(60)
            revisa("Esta no tiene cambio" in pg.inner_text(".hoja"), "y sí lo dice de la que la persona rechazó")
            ir(pg, "resumen", EMB)
            temas = pg.eval_on_selector_all(".ideas-hoja > li", "els => els.map(e => e.dataset.tema)")
            revisa("embarazo" in temas, f"las ideas propias del embarazo salen en la hoja ({temas})")
            ir(pg, "resultado", {**ADULTO, "peso": {"valor": 70, "origen": "manual"}, "talla": {"valor": None, "origen": None}})
            t = pg.inner_text("#app")
            revisa("70" in t and "Peso" in t and "IMC: falta la talla" in t and "No se midió: IMC" not in t, "el peso medido sale en «Lo que medimos» con «IMC: falta la talla»")
            textos_ui = []
            for pan, ses, med in [("mediciones", {"paraQuien": "yo", "grupo": "18a59"}, [80, 97, None]), ("confirmar", ADULTO, None), ("resultado", ADULTO, [130, 97, 36.6]), ("resumen", ADULTO, [130, 97, 36.6])]:
                ir(pg, pan, ses, medidas=med); textos_ui.append(pg.inner_text("#app"))
            todo = " ".join(textos_ui)
            revisa(not re.search(r"\blpm\b", todo) and "fuera de rango" not in todo.lower(), "sin «lpm» ni «fuera de rango» en pantalla")
            ir(pg, "resultado", ADULTO, medidas=[80, 84, None]); g = voz(pg)
            i911, ique, ivida = g.find("nueve, uno, uno"), g.find("Qué hacer ahora"), g.find("Línea de la Vida")
            revisa(0 <= i911 < ique < ivida, f"voz del rojo: 911 ({i911}) → qué hacer ({ique}) → otras líneas ({ivida})")
            pv = pg.evaluate("() => window.MediBotVoz.paraVoz('Línea de la Vida: 800 911 2000.')")
            revisa("9 1 1" not in pv and "nueve once" not in pv and "novecientos once" in pv, f"el 800 se dice agrupado sin parecer 911: «{pv}»")
            usted = []
            for pan, ses in [("bienvenida", {}), ("sobreTi", {}), ("medicinas", {"grupo": "18a59", "medicinas": ["presion"]}), ("resultado", ADULTO), ("fichas", {**ADULTO, "categorias": ["digestion"]}), ("resumen", ADULTO)]:
                ir(pg, pan, {"paraQuien": "yo", **ses})
                tx = pg.inner_text("#app").replace("Consulte a su médico", "")  # leyenda obligatoria de remedios herbolarios (RLGSMP art. 45)
                usted += re.findall(r"\b(usted|Consulte|consulte|su médico|Acuda|acuda)\b", tx)
            revisa(not usted, f"trato de «tú» en la interfaz (fuera de la leyenda legal): {usted[:5]}")
            ir(pg, "mediciones", {"paraQuien": "yo", "grupo": "18a59"}, medidas=[None, None, None], opciones={"medicion": 1})
            pg.evaluate("() => window.MediBot.sensores.conectarSim('normal')"); pg.wait_for_timeout(200)
            accion(pg, "si"); pg.wait_for_timeout(1500)
            est = pg.inner_text("[data-medicion=temp] .medicion__estado")
            revisa("minuto" in est and visible(pg, "[data-medicion=temp] .medicion__estado"), f"47: la cuenta de la temperatura dice minutos y se ve completa: «{est}»")
            pg.evaluate("() => window.MediBot.terminar()")
            pg.close()
            nav.close()
    finally:
        srv.terminate(); srv.wait(timeout=10)
        print(f"servidor PID={srv.pid} detenido (código {srv.returncode})")
    revisa(not errores, "consola sin errores: " + json.dumps(errores[:5], ensure_ascii=False))
    print("E2E RONDA 2: OK" if not fallas else f"E2E RONDA 2: FALLÓ ({len(fallas)})")
    sys.exit(1 if fallas else 0)


if __name__ == "__main__":
    main()
