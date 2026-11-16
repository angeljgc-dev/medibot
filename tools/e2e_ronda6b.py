"""Pruebas en el navegador del lote de cierre de la ronda 6 (88–106): lo que la persona VE,
OYE e IMPRIME. Las de motor y datos están en tests/ronda6b.test.mjs.
Uso (desde la carpeta MediBot):  PYTHONUTF8=1 python tools/e2e_ronda6b.py [--capturas DIR]"""
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
  ["fc", "spo2", "temp"].forEach((k, i) => { s.medidas[k] = v((c.medidas || [79, 97, 36.6])[i]); });
  M.ir(c.pantalla); return M.pantalla; }"""
ESCRITORIO = "window.medibotEscritorio = { esApp: true, version: 'prueba', salida: 'Ctrl+Alt+Shift+Q', salir() { window.__salir = (window.__salir || 0) + 1; }, imprimir: async () => ({ ok: true, motivo: '' }) };"
EMB = {"sexo": "mujer", "embarazo": True, "embarazoOpcion": "si", "embarazoRespondido": True, "medicinas": ["ninguna"]}
NINA = {"paraQuien": "nino", "grupo": "nino", "edadNino": "9a11", **EMB}
A13 = {"paraQuien": "yo", "grupo": "12a17", "edadAdol": "12a14", **EMB}
A16_OTRA = {"paraQuien": "otra", "grupo": "12a17", "edadAdol": "15a17", **EMB}
CONTRADICEN = re.compile(r"puedes cuidarte en casa|en los próximos días|en los próximos 2 o 3 días|en la siguiente revisión|al menos una vez al año", re.I)


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

            def pagina(ancho=1280, alto=800, escritorio=False, tema="light"):
                ctx = nav.new_context(viewport={"width": ancho, "height": alto})
                ctx.add_init_script("window.print = () => {}; try { localStorage.clear(); } catch (e) { console.warn(e.message); }"
                                    " if (window.speechSynthesis) { speechSynthesis.speak = () => {}; }" + (ESCRITORIO if escritorio else "")
                                    + (" try { localStorage.setItem('medibot.theme', 'dark'); } catch (e) { console.warn(e.message); }" if tema == "dark" else ""))
                pg = ctx.new_page()
                pg.on("console", lambda m: errores.append(m.text) if m.type == "error" else None)
                pg.on("pageerror", lambda e: errores.append(str(e)))
                pg.goto(url); pg.wait_for_function("() => window.MediBot")
                return pg
            ir = lambda pg, pan, ses, med=None: (pg.evaluate(PREPARAR, {"pantalla": pan, "sesion": ses, "medidas": med}), pg.wait_for_timeout(100))
            sesion = lambda pg: pg.evaluate("() => JSON.parse(JSON.stringify(window.MediBot.sesion))")
            ultimo = lambda pg: pg.evaluate("() => window.MediBotVoz.ultimoTexto")
            voz = lambda pg: pg.evaluate("() => window.MediBotVoz.textoPantalla()")
            def accion(pg, ident):
                pg.evaluate("(id) => window.MediBotVoz.accion(id)", ident); pg.wait_for_timeout(60); return ultimo(pg)
            def tocar(pg, texto, bloque=None):
                sel = f"#app .bloque[data-bloque={bloque}] .opcion" if bloque else "#app .opcion"
                i = pg.evaluate("([s, t]) => [...document.querySelectorAll(s)].findIndex(o => !o.hidden && o.getClientRects().length && (o.querySelector('.opcion__texto b') || o).textContent.trim() === t)", [sel, texto])
                assert i >= 0, "no hay opción «" + texto + "»"
                pg.locator(sel).nth(i).click(); pg.wait_for_timeout(80)
            def hoja(pg):
                pg.evaluate("() => window.MediBot.ir('resumen')"); pg.wait_for_timeout(100)
                pg.emulate_media(media="print"); t = pg.evaluate("() => { window.MediBotPantallas.ajustarHoja(); return document.querySelector('.hoja').innerText; }"); pg.emulate_media(media="screen")
                return t
            def captura(pg, nombre):
                if a.capturas: pg.screenshot(path=str(a.capturas / f"r6b_{nombre}.png"))

            pg = pagina()
            # ------------------------------------------------------------------------------------------------ 89
            print("89 · hoja de una menor embarazada: sin sub-edad y sin «Tu control prenatal»")
            for nombre, ses in [("niña de 9 a 11", NINA), ("12 a 14", A13), ("15 a 17, otra persona", A16_OTRA)]:
                ir(pg, "resultado", {**ses, "categorias": ["embarazo"]})
                hj = hoja(pg)
                malas = [x for x in ("9 a 11 años", "12 a 14 años", "15 a 17 años") if x in hj] + re.findall(r"(?m)^(?:Tu|Su) control prenatal:", hj)
                revisa(not malas, f"{nombre}: la hoja no dice {malas}")
            # ------------------------------------------------------------------------------------------------ 90, 91, 93
            print("90 · «¿Está bien esto?» muestra el sexo; 91 · cambiar la edad lo conserva (salvo bebé); 93 · «Prefiero no decir» con dibujo")
            ir(pg, "confirmar", {"paraQuien": "yo", "grupo": "18a59", "sexo": "hombre", "medicinas": ["ninguna"]})
            t = pg.inner_text("#app")
            revisa("Sexo" in t and "Hombre" in t, "«¿Está bien esto?» con «Sexo: Hombre»")
            ir(pg, "confirmar", {"paraQuien": "yo", "grupo": "18a59", "medicinas": ["ninguna"]})
            revisa("Sexo" not in pg.inner_text("#app"), "sin contestar, no sale")
            ir(pg, "sobreTi", {"paraQuien": "nino", "grupo": "12a17", "sexo": "mujer"})
            tocar(pg, "3 meses a 11 años")
            s0 = sesion(pg)["sexo"]
            tocar(pg, "9 a 11 años")
            s1 = sesion(pg)["sexo"] if s0 == "mujer" else s0
            tocar(pg, "Bebé menor de 3 meses")
            s2 = sesion(pg)["sexo"]
            revisa(s1 == "mujer" and s2 is None, f"de 12 a 17 a «3 meses a 11 años» (y a 9 a 11) se conserva «{s1}»; a bebé se borra ({s2})")
            ir(pg, "sobreTi", {"paraQuien": "yo", "grupo": "18a59", "sexo": "mujer"})
            tocar(pg, "60 años o más")
            revisa(sesion(pg)["sexo"] == "mujer", "al pasar de 18 a 59 a 60 o más se conserva el sexo")
            ir(pg, "sobreTi", {"paraQuien": "yo", "grupo": "18a59", "sexo": "no_decir"})
            dib = pg.evaluate("() => ['sexo', 'embarazo'].map(b => { const o = [...document.querySelectorAll(`#app .bloque[data-bloque=${b}] .opcion`)].find(x => x.textContent.includes('Prefiero no decir')); return o ? !!o.querySelector(':scope > svg.pic') : null; })")
            revisa(dib == [True, True], f"«Prefiero no decir» con dibujo en sexo y embarazo: {dib}")
            opc = pg.evaluate("() => ['sexo', 'embarazo'].map(b => (document.querySelector(`#app .bloque[data-bloque=${b}]`).innerText.match(/opcional/gi) || []).length)")
            revisa(opc == [1, 1], f"105 · «(opcional)» una sola vez en cada pregunta: {opc}")
            # ------------------------------------------------------------------------------------------------ 92, 94
            print("92 · 15 a 17 para el adulto: «Ella no tiene la culpa…»; 94 · sin órdenes contradictorias con el mensaje protector")
            ir(pg, "resultado", A16_OTRA)
            tx, vz = pg.inner_text("#app"), voz(pg)
            culpa = "Ella no tiene la culpa. Lo que más la ayuda es que la acompañen con cariño y sin regaños."
            revisa(culpa in tx and culpa in vz, "15 a 17, adulto: la frase en pantalla y voz")
            for nombre, ses, med, accion_txt in [("niña de 9 a 11 (ámbar)", NINA, None, "Por el embarazo, llévala hoy al centro de salud"),
                                                 ("12 a 14, ella misma (verde)", A13, None, "Por el embarazo, ve hoy al centro de salud"),
                                                 ("15 a 17, otra persona (verde)", A16_OTRA, None, "Por el embarazo, llévala esta semana al centro de salud"),
                                                 ("12 a 14 en ámbar por fiebre", A13, [80, 97, 37.8], "Por el embarazo, ve hoy al centro de salud"),
                                                 # 15 a 17 en ámbar: «esta semana», lo mismo que su mensaje protector (85b), sin dos órdenes distintas
                                                 ("15 a 17, otra persona, en ámbar por fiebre", A16_OTRA, [80, 97, 37.8], "Por el embarazo, llévala esta semana al centro de salud"),
                                                 # ámbar con prisa «hoy» por las mediciones: todo dice «hoy» (el mensaje del 85a), sin «esta semana»
                                                 ("15 a 17, otra persona, en ámbar «hoy» por fiebre alta", A16_OTRA, [80, 97, 38.8], "Por el embarazo, llévala hoy al centro de salud"),
                                                 ("15 a 17, ella misma, en ámbar «hoy» por pulso alto", {**A16_OTRA, "paraQuien": "yo"}, [130, 97, 36.6], "Por el embarazo, ve hoy al centro de salud")]:
                ir(pg, "resultado", ses, med)
                tx, vz, nivel = pg.inner_text("#app"), voz(pg), pg.evaluate("() => window.MediBot.evaluar().nivel")
                hj = hoja(pg)
                malas = sorted({m.group(0) for x in (tx, vz, hj) for m in CONTRADICEN.finditer(x)})
                otra = "esta semana" if "hoy" in accion_txt else " hoy al centro"
                choca = [x for x in (tx, vz, hj) if otra in x.replace(accion_txt, "")]
                revisa(accion_txt in tx and accion_txt in vz and accion_txt in hj and not malas and not choca, f"{nombre} [{nivel}]: «{accion_txt}» en pantalla, voz y hoja; sin {malas}; sin la otra prisa «{otra.strip()}»: {len(choca)}")
                if a.capturas and med is None: ir(pg, "resultado", ses); captura(pg, "94_" + nombre.split(" (")[0].replace(" ", "_") + "_1280")
            # Decisión de diseño (2026-11-15): de 15 a 17 siempre el texto del 85b; su prisa coincide con el semáforo
            # («hoy» en ámbar «hoy» y en rojo). Nunca «Una niña embarazada…» ni «esta semana» en esos casos.
            for nombre, ses, med, alarma in [("16, otra persona, ámbar «hoy» (38.8 °C)", A16_OTRA, [80, 97, 38.8], {}),
                                             ("16, ella misma, ámbar «hoy» (pulso 130)", {**A16_OTRA, "paraQuien": "yo"}, [130, 97, 36.6], {}),
                                             ("16, otra persona, rojo", A16_OTRA, None, {"sangre": True}),
                                             ("16, ella misma, rojo", {**A16_OTRA, "paraQuien": "yo"}, None, {"sangre": True})]:
                ir(pg, "resultado", {**ses, "alarma": alarma}, med)
                tx, vz, nivel = pg.inner_text("#app"), voz(pg), pg.evaluate("() => { const r = window.MediBot.evaluar(); return r.nivel + '/' + (r.prisa || ''); }")
                msj = pg.inner_text("#app [data-mensaje=embarazo-menor]") if pg.locator("#app [data-mensaje=embarazo-menor]").count() else ""  # en la pantalla del resultado
                hj = hoja(pg)
                malas = [m for m in ("esta semana", "Una niña embarazada", "una niña embarazada") if any(m in x for x in (tx, vz, hj))]
                del85b = "tiene derecho a hablar a solas con el personal de salud" in tx or "Puedes pedir hablar a solas con el personal de salud" in tx
                revisa(not malas and del85b and "hoy" in msj.lower() and "pronto" not in msj.lower(), f"15 a 17 · {nombre} [{nivel}]: el mensaje del 85b dice «hoy» (no «pronto»), sin {malas}")
            # 97 (parte sin choque): la voz explica una sola vez cómo marcar el 079 (el mensaje protector ya lo explica)
            veces = []
            for ses, med in ((NINA, None), (A16_OTRA, [80, 97, 37.8]), (A13, None)):
                ir(pg, "resultado", ses, med); veces.append(voz(pg).count("cero, siete, nueve"))
            revisa(veces == [1, 1, 1], f"97 · la voz dice «cero, siete, nueve» una sola vez (niña ámbar, 15 a 17 ámbar, 12 a 14 verde): {veces}")
            ir(pg, "resultado", {"paraQuien": "yo", "grupo": "18a59", "sexo": "mujer", "embarazoOpcion": "no", "medicinas": ["ninguna"]})
            revisa("puedes cuidarte en casa" in pg.inner_text("#app"), "a una adulta sin embarazo, el verde de siempre")
            # 99 fuera de «Qué cuidar»: la sección se llama «Embarazo» para menores de 12 (etiquetas, «Cuándo ir», hoja, «¿Está bien esto?»)
            ses99 = {**NINA, "categorias": ["embarazo"]}
            textos99 = []
            for pan in ("fichas", "confirmar", "resumen"):
                ir(pg, pan, ses99); textos99.append(pg.inner_text("#app"))
            revisa(all("dar pecho" not in x for x in textos99) and "Embarazo" in textos99[1], f"99 · niña de 9 a 11: «Embarazo» sin «y dar pecho» en ideas, «¿Está bien esto?» y hoja: {[x.count('dar pecho') for x in textos99]}")
            # ------------------------------------------------------------------------------------------------ 96, 103
            print("96 · la voz dice el nombre que se ve; 103 · «Prefiero no decir» también por voz")
            pe = pagina(escritorio=True)
            ir(pe, "sobreTi", {"paraQuien": "yo", "grupo": "18a59"})
            pe.evaluate("() => window.MediBotVoz.leerPantalla()"); pe.wait_for_timeout(80)
            tocar(pe, "Para un niño o niña"); tocar(pe, "3 meses a 11 años"); tocar(pe, "9 a 11 años")
            tocar(pe, "Niña", "sexo"); pe.wait_for_timeout(100)
            u1 = ultimo(pe)
            tocar(pe, "Para otra persona"); tocar(pe, "18 a 59 años"); tocar(pe, "Mujer", "sexo"); tocar(pe, "Sí, está embarazada", "embarazo"); pe.wait_for_timeout(100)
            u2 = ultimo(pe)
            revisa("Niña" in u1 and "Mujer" not in u1 and "Sí, está embarazada" in u2, f"la voz dice el nombre que se ve tras renombrar: «{u1[-30:]}» / «{u2[-40:]}»")
            pe.close()
            # 103 (aclarado el 2026-11-15): SOLO con sexo «Prefiero no decir»; con «Mujer», la cadena del 67 no cambia
            for nombre, ses, pasos, ofrece in [("sexo «Prefiero no decir», adulta", {"paraQuien": "yo", "grupo": "18a59", "sexo": "no_decir"}, ["no", "no"], True),
                                               ("sexo «Prefiero no decir», niña de 9 a 11", {"paraQuien": "nino", "grupo": "nino", "edadNino": "9a11", "sexo": "no_decir"}, ["no"], True),
                                               ("«Mujer», adulta", {"paraQuien": "yo", "grupo": "18a59", "sexo": "mujer"}, ["no", "no"], False),
                                               ("«Niña» de 9 a 11", {"paraQuien": "nino", "grupo": "nino", "edadNino": "9a11", "sexo": "mujer"}, ["no"], False)]:
                for final in ("si", "no"):
                    ir(pg, "sobreTi", ses)
                    pg.evaluate("() => window.MediBotVoz.leerPantalla()"); pg.wait_for_timeout(60)
                    for x in pasos: u = accion(pg, x)
                    pregunta = "¿Prefieres no decirlo?" in u
                    if ofrece:
                        u2 = accion(pg, final); op = sesion(pg)["embarazoOpcion"]
                        espera = "no_decir" if final == "si" else "no"
                        revisa(pregunta and op == espera and "decirlo" not in u2, f"{nombre}: la voz ofrece «Prefiero no decir»; {final} → «{op}»: «{u[-40:]}»")
                    else:
                        op = sesion(pg)["embarazoOpcion"]
                        revisa(not pregunta and op == "no", f"{nombre}: sin pregunta extra, el rojo deja «No» (cadena del 67): «{u[-40:]}» → {op}")
                        break
            # ------------------------------------------------------------------------------------------------ 104
            print("104 · la hoja sale en blanco aunque la app esté en oscuro")
            po = pagina(tema="dark")
            ir(po, "resultado", A13); po.evaluate("() => window.MediBot.ir('resumen')"); po.wait_for_timeout(100)
            po.emulate_media(media="print")
            fondos = po.evaluate("() => [document.documentElement, document.body, document.querySelector('.contenido'), document.querySelector('.hoja')].map(e => getComputedStyle(e).backgroundColor)")
            esquema = po.evaluate("() => getComputedStyle(document.documentElement).colorScheme")
            po.emulate_media(media="screen")
            revisa(all(f in ("rgb(255, 255, 255)", "rgba(0, 0, 0, 0)") for f in fondos) and fondos[0] == "rgb(255, 255, 255)" and "dark" not in esquema, f"fondos al imprimir {fondos}, esquema «{esquema}»")
            po.close()
            # ------------------------------------------------------------------------------------------------ 105
            print("105 · pulido")
            ir(pg, "bienvenida", {})
            priv = pg.inner_text(".privacidad")
            revisa(priv.lower().count("tu nombre") == 1, f"el aviso de privacidad no repite «tu nombre»: {priv.lower().count('tu nombre')}")
            revisa(pg.evaluate("() => (window.MediBotData.corpus.entradas.find(e => e.id === 'comer_a_sus_horas') || {}).nombre") == "Comer a tus horas", "«Comer a tus horas» (tú)")
            pa = pagina(escritorio=True)
            pa.evaluate("() => { const o = window.MediBotVoz.leer.bind(window.MediBotVoz); window.__lect = []; window.MediBotVoz.leer = (t) => { window.__lect.push(String(Array.isArray(t) ? t.join(' ') : t)); return o(t); }; }")
            ir(pa, "sobreTi", {"paraQuien": "yo"}); pa.wait_for_timeout(500)
            pa.evaluate("() => { window.__lect = []; document.querySelector('[data-accion=acerca]').click(); }"); pa.wait_for_timeout(1500)
            ac = pa.inner_text("#dlg-acerca")
            veces = pa.evaluate("() => window.__lect.join(' ').split('Lo que sí hace es orientarte').length - 1")
            revisa(not re.search(r"R01A|R62B|base de datos|enlace", ac) and veces == 1, f"«¿Por qué MediBot no diagnostica?» sin tecnicismos ni enlaces, y la voz lo lee una vez ({veces})")
            pa.close()
            pc = pagina(375, 812, escritorio=True)
            pc.emulate_media(reduced_motion="reduce")
            ir(pc, "cuidar", NINA)
            pc.evaluate("() => window.MediBotVoz.leerPantalla()"); pc.wait_for_timeout(300)
            marcada = pc.evaluate("() => !!document.querySelector('.opcion--preguntando')")
            cortado = pc.evaluate("""() => { const c = document.getElementById('contenido').getBoundingClientRect(); return [...document.querySelectorAll('#app h1, #app h2, #app h3')].filter(h => h.getClientRects().length)
              .map(h => h.getBoundingClientRect()).some(r => r.top < c.top - 0.5 && r.bottom > c.top + 0.5); }""")
            revisa(marcada and not cortado, f"«Qué cuidar» a 375 con voz (niña de 10, opción marcada: {marcada}): ningún título a la mitad")
            captura(pc, "105_que_cuidar_375")
            pc.close()
            ir(pg, "resultado", {"paraQuien": "nino", "grupo": "nino", "edadNino": "2a5", "medicinas": ["ninguna"]}, [100, 97, 36.6])
            revisa("sin clasificar" not in pg.inner_text("#app").lower(), "sin «sin clasificar» en el resultado de un niño")
            rv = pg.evaluate("() => window.MediBotVoz.paraVoz('1 a 2 años 80–130; 3 a 4 años 80–120')")
            revisa("de 80 a 130" in rv and "de 80 a 120" in rv, f"la voz lee los rangos como «de 80 a 130»: «{rv}»")
            po = pagina(escritorio=True)
            po.evaluate("() => window.MediBot.abrirOperador()"); po.wait_for_timeout(150)
            vz_op = voz(po)
            casilla = po.evaluate("() => { const c = document.querySelector('.operador input[type=checkbox]'); if (!c) return null; const r = c.getBoundingClientRect(); return [r.width, r.height]; }")
            revisa("aprieta el verde" not in vz_op.lower(), "el panel del operador no dice «aprieta el verde»: " + vz_op[-60:])
            revisa(bool(casilla) and casilla[0] >= 44 and casilla[1] >= 44, f"casilla de voz de al menos 44 px: {casilla}")
            nat = []
            po.on("dialog", lambda d: (nat.append(d.message), d.dismiss()))
            po.locator("button", has_text="Salir de la aplicación").first.click(); po.wait_for_timeout(150)
            revisa(not nat and po.locator("#dlg-cerrar[open]").count() == 1, f"«Salir de la aplicación» con el diálogo de MediBot (no window.confirm): {nat}")
            po.evaluate("() => document.querySelectorAll('dialog[open]').forEach(d => d.close())")
            po.evaluate("() => window.MediBot.ir('evidencia')"); po.wait_for_timeout(1200)
            ev = po.inner_text("#app")
            m = re.search(r"([\d.,]+) s escuchando", ev)
            revisa(bool(m) and m.group(1) == "0", f"«s escuchando» en 0 si no ha empezado: {m.group(0) if m else '—'}")
            po.evaluate("() => window.MediBotEvidencia.reiniciar()"); po.wait_for_timeout(2200)
            m2 = re.search(r"([\d.,]+) s escuchando", po.inner_text("#app"))
            revisa(bool(m2) and 1 <= int(m2.group(1)) < 60, f"y al empezar, el contador avanza (no debe quedarse en 0): {m2.group(0) if m2 else '—'}")
            po.evaluate("() => window.MediBot.ir('lugar')"); po.wait_for_function("() => document.querySelector('.lugar__municipios .opcion')", timeout=15000)
            uno = po.evaluate("() => { const L = window.MediBotLugares, c = window.MediBotData.clues; const m = L.buscarMunicipios(c, '', 5000).find(x => L.unidadesDe(c, x.clave).length === 1); return m ? m.nombre : null; }")
            if uno: po.fill("#lugar-municipio", uno); po.wait_for_timeout(200)
            lt = po.inner_text(".lugar__municipios")
            revisa(bool(uno) and "1 unidades" not in lt and "1 unidad pública" in lt, f"«1 unidad» en singular ({uno})")
            po.close()
            pg.close()
            nav.close()
    finally:
        srv.terminate(); srv.wait(timeout=10)
        print(f"servidor PID={srv.pid} detenido (código {srv.returncode})")
    revisa(not errores, "consola sin errores: " + json.dumps(errores[:5], ensure_ascii=False))
    print("E2E RONDA 6B: OK" if not fallas else f"E2E RONDA 6B: FALLÓ ({len(fallas)})")
    sys.exit(1 if fallas else 0)


if __name__ == "__main__":
    main()
