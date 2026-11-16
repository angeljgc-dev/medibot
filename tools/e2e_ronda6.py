"""Pruebas en el navegador de la ronda 6 (80–84 y 86): sexo y embarazo en niñas. Revisan
lo que la persona VE y OYE en «Sobre ti» y en «Qué cuidar», no solo la sesión. Las de motor están en tests/ronda6.test.mjs.
Uso (desde la carpeta MediBot):  PYTHONUTF8=1 python tools/e2e_ronda6.py [--capturas DIR]"""
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
# bloques visibles de «Sobre ti»: [título, [opciones]]
BLOQUES = """() => [...document.querySelectorAll('#app .bloque')].filter(b => !b.hidden && b.getClientRects().length).map(b => [
  (b.querySelector('h2') || {}).textContent || '', [...b.querySelectorAll('.opcion')].filter(o => !o.hidden).map(o => o.textContent.trim()),
  [...b.querySelectorAll('.opcion')].filter(o => !o.hidden).map(o => !!o.querySelector('svg.pic'))])"""


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

            def pagina(ancho=1280, alto=800):
                ctx = nav.new_context(viewport={"width": ancho, "height": alto})
                ctx.add_init_script("window.print = () => {}; try { localStorage.clear(); } catch (e) { console.warn(e.message); }"
                                    " if (window.speechSynthesis) { speechSynthesis.speak = () => {}; }")
                pg = ctx.new_page()
                pg.on("console", lambda m: errores.append(m.text) if m.type == "error" else None)
                pg.on("pageerror", lambda e: errores.append(str(e)))
                pg.goto(url); pg.wait_for_function("() => window.MediBot")
                return pg
            ir = lambda pg, pan, ses, med=None: (pg.evaluate(PREPARAR, {"pantalla": pan, "sesion": ses, "medidas": med}), pg.wait_for_timeout(100))
            sesion = lambda pg: pg.evaluate("() => JSON.parse(JSON.stringify(window.MediBot.sesion))")
            ultimo = lambda pg: pg.evaluate("() => window.MediBotVoz.ultimoTexto")
            def accion(pg, ident):
                pg.evaluate("(id) => window.MediBotVoz.accion(id)", ident); pg.wait_for_timeout(60); return ultimo(pg)
            def leer(pg):
                pg.evaluate("() => window.MediBotVoz.leerPantalla()"); pg.wait_for_timeout(60); return ultimo(pg)
            bloques = lambda pg: pg.evaluate(BLOQUES)
            def tocar(pg, texto):  # la opción cuyo nombre es exactamente ese («Niña» no es «Para un niño o niña»)
                i = pg.evaluate("(t) => [...document.querySelectorAll('#app .opcion')].findIndex(o => !o.hidden && o.getClientRects().length && (o.querySelector('.opcion__texto b') || o).textContent.trim() === t)", texto)
                assert i >= 0, "no hay opción «" + texto + "»"
                pg.locator("#app .opcion").nth(i).click(); pg.wait_for_timeout(80)
            boton = lambda pg, c: pg.evaluate("(c) => { const b = document.querySelector(`.botonera [data-boton=${c}]`); return b ? !b.disabled : null; }", c)
            def captura(pg, nombre):
                if a.capturas: pg.screenshot(path=str(a.capturas / f"r6_{nombre}.png"))

            # ------------------------------------------------------------------------------------------------ 80
            print("80 · la pregunta de sexo va después de la edad, con dibujo; opcional; voz en primera y tercera persona")
            pg = pagina()
            ir(pg, "sobreTi", {"paraQuien": "yo"})
            antes = [b[0] for b in bloques(pg)]
            revisa(not any("mujer" in t.lower() for t in antes), f"antes de elegir la edad no se pregunta el sexo: {antes}")
            tocar(pg, "18 a 59 años")
            bs = bloques(pg); sexo = next((b for b in bs if "mujer u hombre" in b[0]), None)
            revisa(bool(sexo) and sexo[1] == ["Mujer", "Hombre", "Prefiero no decir"] and sexo[2][:2] == [True, True] and "opcional" in sexo[0],
                   f"«¿Eres mujer u hombre? (opcional)» con Mujer y Hombre dibujados: {sexo}")
            revisa([b[0] for b in bs].index(sexo[0]) > [b[0] for b in bs].index("¿Cuántos años tienes?") if sexo else False, "va después de la edad")
            revisa(boton(pg, "verde") is True, "el verde no exige contestarla")
            ir(pg, "sobreTi", {"paraQuien": "yo", "grupo": "18a59"})
            revisa("¿Eres mujer?" in leer(pg), "la voz pregunta «¿Eres mujer?»")
            ir(pg, "sobreTi", {"paraQuien": "otra", "grupo": "18a59"})
            revisa("¿La persona es mujer?" in leer(pg), "por otra persona: «¿La persona es mujer?»")
            ir(pg, "sobreTi", {"paraQuien": "nino", "grupo": "nino", "edadNino": "2a5"})
            nb = next((b for b in bloques(pg) if "niña o niño" in b[0]), None)
            revisa(bool(nb) and nb[1] == ["Niña", "Niño", "Prefiero no decir"] and "¿Es niña?" in leer(pg), f"por un niño: «¿Es niña o niño?» y la voz «¿Es niña?»: {nb}")
            ir(pg, "sobreTi", {"paraQuien": "nino", "grupo": "bebe"})
            revisa(not any("niña o niño" in b[0] or "mujer" in b[0].lower() for b in bloques(pg)), "a un bebé menor de 3 meses no se le pregunta")
            ir(pg, "sobreTi", {"paraQuien": "nino", "grupo": "nino"})
            revisa(not any("niña o niño" in b[0] for b in bloques(pg)), "con niño pero sin la sub-edad todavía no se pregunta")

            # ------------------------------------------------------------------------------------------------ 81
            print("81 · embarazo y pecho solo con «Mujer» o «Prefiero no decir»; sin «No / soy hombre» ni «Si eres mujer»")
            ir(pg, "sobreTi", {"paraQuien": "yo", "grupo": "18a59"})
            revisa(not any("embarazada" in b[0] for b in bloques(pg)), "sin contestar el sexo no se pregunta el embarazo")
            tocar(pg, "Hombre")
            g = leer(pg)
            revisa(not any("embarazada" in b[0] for b in bloques(pg)) and "embarazada" not in g and "pecho" not in g, f"con «Hombre» ni embarazo ni pecho, en pantalla y voz: «{g[-80:]}»")
            captura(pg, "hombre_sin_embarazo_1280")
            tocar(pg, "Mujer")
            emb = next((b for b in bloques(pg) if "embarazada" in b[0]), None)
            revisa(bool(emb) and "Si eres mujer" not in emb[0] and emb[1] == ["No", "Sí, estoy embarazada", "Estoy dando pecho", "Prefiero no decir"],
                   f"con «Mujer»: «¿Estás embarazada…?» y No / Sí / dando pecho / Prefiero no decir: {emb}")
            revisa(not pg.locator("text=soy hombre").count(), "ya no existe «No / soy hombre»")
            captura(pg, "sobreti_mujer_1280")
            tocar(pg, "Sí, estoy embarazada")
            tocar(pg, "Hombre")
            s = sesion(pg)
            revisa(s["embarazo"] is None and s["embarazoOpcion"] is None and not s.get("lactancia"), f"cambiar a «Hombre» borra el embarazo: {[s['embarazo'], s['embarazoOpcion'], s.get('lactancia')]}")
            tocar(pg, "Prefiero no decir")
            revisa(any("embarazada" in b[0] for b in bloques(pg)), "con «Prefiero no decir» se conserva la pregunta opcional del embarazo")
            tocar(pg, "Estoy dando pecho"); tocar(pg, "60 años o más")
            s = sesion(pg)
            revisa(s["embarazoOpcion"] is None and not s.get("lactancia"), f"cambiar la edad a 60 o más borra lo que ya no aplica: {[s['embarazoOpcion'], s.get('lactancia')]}")
            ir(pg, "sobreTi", {"paraQuien": "otra", "grupo": "18a59", "sexo": "mujer"})
            emb = next((b for b in bloques(pg) if "embarazada" in b[0]), None)
            revisa(bool(emb) and "La persona" in emb[0] and "Sí, está embarazada" in emb[1] and "Está dando pecho" in emb[1], f"por otra persona, en tercera persona: {emb}")
            ir(pg, "sobreTi", {"paraQuien": "yo", "grupo": "18a59", "sexo": "mujer"})
            u1 = leer(pg); u2 = accion(pg, "no"); u3 = accion(pg, "no")
            revisa("¿Estás embarazada" in u1 and "Si eres" not in u1 and "¿Estás dando pecho?" in u2 and sesion(pg)["embarazoOpcion"] == "no" and "pecho" not in u3,
                   f"voz con «Mujer»: embarazo → rojo → pecho → rojo = «No»: «{u1[-50:]}» | «{u2[-40:]}» | {sesion(pg)['embarazoOpcion']}")

            # ------------------------------------------------------------------------------------------------ 82
            print("82 · «6 a 8» y «9 a 11»; embarazo desde 9 con «Niña»; sin pecho antes de 12")
            ir(pg, "sobreTi", {"paraQuien": "nino", "grupo": "nino"})
            sub = next((b for b in bloques(pg) if "De qué edad" in b[0]), None)
            revisa(bool(sub) and sub[1] == ["Menos de 2 años", "2 a 5 años", "6 a 8 años", "9 a 11 años"], f"sub-edades: {sub}")
            tocar(pg, "6 a 8 años"); tocar(pg, "Niña")
            revisa(not any("embarazada" in b[0] for b in bloques(pg)), "niña de 6 a 8: no se pregunta el embarazo")
            tocar(pg, "9 a 11 años")
            emb = next((b for b in bloques(pg) if "embarazada" in b[0]), None)
            revisa(bool(emb) and "La niña" in emb[0] and not any("pecho" in o for o in emb[1]), f"niña de 9 a 11: «¿La niña está embarazada…?» sin «dando pecho»: {emb}")
            captura(pg, "nina_9a11_embarazo_1280")
            ir(pg, "sobreTi", {"paraQuien": "nino", "grupo": "nino", "edadNino": "9a11", "sexo": "mujer"})
            u1 = leer(pg); u2 = accion(pg, "no")
            revisa("¿La niña está embarazada" in u1 and "pecho" not in u2 and sesion(pg)["embarazoOpcion"] == "no", f"voz de la niña de 9 a 11: sin pregunta de pecho: «{u1[-50:]}» | «{u2[-40:]}»")
            ir(pg, "sobreTi", {"paraQuien": "nino", "grupo": "nino", "edadNino": "9a11", "sexo": "hombre"})
            revisa(not any("embarazada" in b[0] for b in bloques(pg)), "niño de 9 a 11: no se pregunta")
            ir(pg, "confirmar", {"paraQuien": "nino", "grupo": "nino", "edadNino": "9a11", "sexo": "mujer", "medicinas": ["ninguna"]})
            revisa("9 a 11 años" in pg.inner_text("#app"), "«¿Está bien esto?» dice «9 a 11 años»")

            # ------------------------------------------------------------------------------------------------ 83, 84
            print("83 · niña embarazada: se sugiere «Embarazo y dar pecho»; 84 · «Cólicos de la regla» no se sugiere a «Hombre»")
            ir(pg, "cuidar", {"paraQuien": "nino", "grupo": "nino", "edadNino": "9a11", "sexo": "mujer", "embarazo": True, "embarazoOpcion": "si", "embarazoRespondido": True, "medicinas": ["ninguna"]})
            sug = pg.inner_text(".sugerencia") if pg.locator(".sugerencia").count() else ""
            revisa("Embarazo" in sug and "dar pecho" not in sug, f"sugerencia para la niña embarazada: «Embarazo», sin «dar pecho»: «{sug[:80]}»")  # reespecificado por 99
            ir(pg, "cuidar", {"paraQuien": "yo", "grupo": "18a59", "sexo": "hombre", "medicinas": ["ninguna"]})
            pg.locator(".grupo", has_text="Panza").first.click(); pg.wait_for_timeout(80)
            chip = pg.locator(".chip", has_text="Cólicos de la regla").count()
            dichos = [leer(pg)]
            for _ in range(30):
                u = accion(pg, "si" if "Panza" in dichos[-1] and "Quieres ideas de" in dichos[-1] else "no"); dichos.append(u)
                if "Seguimos" in u: break
            revisa(chip == 1 and not any("Cólicos" in d for d in dichos), f"«Hombre»: el chip sigue para quien lo busque ({chip}) y la voz no lo ofrece ({sum('Cólicos' in d for d in dichos)} veces)")
            ir(pg, "cuidar", {"paraQuien": "yo", "grupo": "18a59", "sexo": "mujer", "medicinas": ["ninguna"]})
            dichos = [leer(pg)]
            for _ in range(30):
                u = accion(pg, "si" if "Panza" in dichos[-1] and "Quieres ideas de" in dichos[-1] else "no"); dichos.append(u)
                if "Seguimos" in u: break
            revisa(any("Cólicos" in d for d in dichos), "con «Mujer» la voz sí la ofrece")
            pg.close()

            # ------------------------------------------------------------------------------------------------ 87
            print("87 · «12 a 14» / «15 a 17» en 12 a 17 años, solo con embarazo «Sí»")
            pg = pagina()
            ir(pg, "sobreTi", {"paraQuien": "yo", "grupo": "12a17", "sexo": "mujer"})
            revisa(not any("12 a 14" in " ".join(b[1]) for b in bloques(pg)), "sin embarazo «Sí» no se pregunta")
            tocar(pg, "Sí, estoy embarazada")
            ad = next((b for b in bloques(pg) if "12 a 14 años" in b[1]), None)
            titulos = [b[0] for b in bloques(pg)]
            revisa(bool(ad) and ad[1] == ["12 a 14 años", "15 a 17 años"] and titulos.index(ad[0]) > next(i for i, x in enumerate(titulos) if "embarazada" in x),
                   f"con «Sí», después del embarazo: {ad}")
            u = leer(pg)
            revisa("¿Tienes de 12 a 14 años?" in u, "la voz la pregunta: " + u[-60:])
            tocar(pg, "15 a 17 años"); tocar(pg, "No")
            revisa(sesion(pg).get("edadAdol") is None and not any("12 a 14 años" in b[1] for b in bloques(pg)), "si el embarazo cambia a «No», se quita y se borra")
            ir(pg, "sobreTi", {"paraQuien": "otra", "grupo": "12a17", "sexo": "mujer", "embarazo": True, "embarazoOpcion": "si", "embarazoRespondido": True})
            revisa("¿La persona tiene de 12 a 14 años?" in leer(pg), "por otra persona, en tercera persona")

            # ------------------------------------------------------------------------------------------------ 85a, 85b
            print("85a / 85b · embarazo en menores: mensaje protector en el resultado, la voz y la hoja; el semáforo no cambia")
            EMB = {"sexo": "mujer", "embarazo": True, "embarazoOpcion": "si", "embarazoRespondido": True, "medicinas": ["ninguna"]}
            PROHIBIDAS = re.compile(r"violaci[oó]n|abuso|agresor|delito|denuncia|ministerio p[uú]blico|fiscal[ií]a|procuradur[ií]a|\bDIF\b|polic[ií]a|qui[eé]n fue|qui[eé]n es el pap[aá]|felicidades|vas a ser mam[aá]|tu beb[eé]|cu[eé]ntale a tu|alto riesgo|aborto|interrumpir|no deseado|es secreto|nadie se va a enterar|menor de 15|debiste|irresponsable|muy peligroso|puedes morir", re.I)
            def tres(ses, med=None):
                ir(pg, "resultado", ses, med)
                pan, vz = pg.inner_text("#app"), pg.evaluate("() => window.MediBotVoz.textoPantalla()")
                nivel = pg.evaluate("() => window.MediBot.evaluar().nivel")
                pg.evaluate("() => window.MediBot.ir('resumen')"); pg.wait_for_timeout(100)
                pg.emulate_media(media="print"); hj = pg.evaluate("() => { window.MediBotPantallas.ajustarHoja(); return document.querySelector('.hoja').innerText; }"); pg.emulate_media(media="screen")
                paginas.append(len(re.findall(rb"/Type\s*/Page[^s]", pg.pdf(format="Letter", print_background=True))))
                return pan, vz, hj, nivel
            casos = [
                ("niña de 9 a 11 (consulta para un niño)", {"paraQuien": "nino", "grupo": "nino", "edadNino": "9a11", **EMB}, "adulto", None),
                ("12 a 14, ella misma", {"paraQuien": "yo", "grupo": "12a17", "edadAdol": "12a14", **EMB}, "nina", None),
                ("12 a 17 sin contestar la subpregunta: lado seguro", {"paraQuien": "yo", "grupo": "12a17", **EMB}, "nina", None),
                ("12 a 14, otra persona, en rojo", {"paraQuien": "otra", "grupo": "12a17", "edadAdol": "12a14", **EMB}, "adulto", [80, 84, 36.6]),
                ("15 a 17, ella misma", {"paraQuien": "yo", "grupo": "12a17", "edadAdol": "15a17", **EMB}, "15a17.nina", None),
                ("15 a 17, otra persona", {"paraQuien": "otra", "grupo": "12a17", "edadAdol": "15a17", **EMB}, "15a17.adulto", None)]
            TX = pg.evaluate("() => window.MediBotData.textos.embarazo_menor")
            paginas: list[int] = []
            for nombre, ses, version, med in casos:
                V = TX["15a17"][version.split(".")[1]] if version.startswith("15a17") else TX[version]
                pan, vz, hj, nivel = tres(ses, med)
                sin = dict(ses); sin.update({"embarazo": False, "embarazoOpcion": "no"})
                nivel_sin = tres(sin, med)[3]
                malas = sorted({m.group(0) for x in (pan, vz, hj) for m in PROHIBIDAS.finditer(x)})
                revisa(V["titulo"] in pan and all(x in pan for x in V["parrafos"]) and V["voz"] in vz and all(x in hj for x in V["hoja"]) and nivel == nivel_sin and not malas,
                       f"{nombre}: mensaje en pantalla {V['titulo'] in pan}, voz {V['voz'][:30] in vz}, hoja {all(x in hj for x in V['hoja'])}; nivel {nivel} = {nivel_sin}; palabras prohibidas {malas}")
                if a.capturas and nombre.startswith(("niña", "12 a 14, otra", "15 a 17, ella")):
                    ir(pg, "resultado", ses, med); pg.wait_for_timeout(100); captura(pg, "85_" + nombre.split(",")[0].replace(" ", "_") + "_1280")
            # Las ideas y la hoja con ideas aceptadas («Embarazo y dar pecho», la sección que el 83 sugiere): tampoco dicen nada
            # de la lista prohibida (p. ej. «tu bebé») ni dan por hecho el parto («Dar solo pecho los primeros 6 meses»)
            NODECIR = {**EMB, "embarazo": None, "embarazoOpcion": "no_decir"}
            for nombre, ses in [("niña de 9 a 11", {"paraQuien": "nino", "grupo": "nino", "edadNino": "9a11", **EMB}),
                                ("niña de 9 a 11 con «Prefiero no decir»", {"paraQuien": "nino", "grupo": "nino", "edadNino": "9a11", **NODECIR}),
                                ("12 a 14", {"paraQuien": "yo", "grupo": "12a17", "edadAdol": "12a14", **EMB}),
                                ("15 a 17", {"paraQuien": "otra", "grupo": "12a17", "edadAdol": "15a17", **EMB})]:
                ir(pg, "fichas", {**ses, "categorias": ["embarazo", "diarrea"]})
                textos, vista = [], set()
                for _ in range(30):
                    if pg.evaluate("() => window.MediBot.pantalla") != "fichas": break
                    textos += [pg.inner_text("#app"), pg.evaluate("() => window.MediBotVoz.textoPantalla()")]
                    pg.evaluate("() => window.MediBotVoz.accion('si')"); pg.wait_for_timeout(60)
                pg.emulate_media(media="print"); textos.append(pg.evaluate("() => { window.MediBotPantallas.ajustarHoja(); return document.querySelector('.hoja').innerText; }")); pg.emulate_media(media="screen")
                malas = sorted({m.group(0) for x in textos for m in PROHIBIDAS.finditer(x)})
                parto = [x for x in ("Dar solo pecho los primeros 6 meses", "después de nacer") if any(x in y for y in textos)]
                revisa(len(textos) > 4 and not malas and not parto, f"{nombre} con «Embarazo y dar pecho»: ideas, voz y hoja sin palabras prohibidas {malas} ni ideas que dan por hecho el parto {parto}")
            pan, vz, hj, _ = tres({"paraQuien": "yo", "grupo": "18a59", **EMB})
            revisa(TX["nina"]["titulo"] not in pan and "control prenatal" in pan, "a una adulta embarazada no le sale (sigue la línea del control prenatal)")
            revisa(paginas and all(n == 1 for n in paginas), f"la hoja impresa con el mensaje cabe en una carta: {paginas}")
            pg.close()

            # ------------------------------------------------------------------------------------------------ capturas a 375
            if a.capturas:
                pg = pagina(375, 812)
                ir(pg, "sobreTi", {"paraQuien": "yo", "grupo": "18a59", "sexo": "mujer"}); pg.locator("text=¿Eres mujer u hombre?").scroll_into_view_if_needed(); captura(pg, "sobreti_mujer_375")
                ir(pg, "sobreTi", {"paraQuien": "nino", "grupo": "nino", "edadNino": "9a11", "sexo": "mujer"}); pg.locator("text=¿La niña está embarazada").first.scroll_into_view_if_needed(); captura(pg, "nina_9a11_embarazo_375")
                ir(pg, "sobreTi", {"paraQuien": "yo", "grupo": "18a59", "sexo": "hombre"}); pg.locator("text=¿Eres mujer u hombre?").scroll_into_view_if_needed(); captura(pg, "hombre_sin_embarazo_375")
                pg.close()
            nav.close()
    finally:
        srv.terminate(); srv.wait(timeout=10)
        print(f"servidor PID={srv.pid} detenido (código {srv.returncode})")
    revisa(not errores, "consola sin errores: " + json.dumps(errores[:5], ensure_ascii=False))
    print("E2E RONDA 6: OK" if not fallas else f"E2E RONDA 6: FALLÓ ({len(fallas)})")
    sys.exit(1 if fallas else 0)


if __name__ == "__main__":
    main()
