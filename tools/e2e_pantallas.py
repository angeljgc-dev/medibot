"""Pruebas de pantalla de MediBot en el navegador (ronda de correcciones 2026-11-02).
Uso (desde la carpeta MediBot):  PYTHONUTF8=1 python tools/e2e_pantallas.py [--capturas DIR]
Requiere Playwright para Python con chromium. Levanta `python -m http.server` y lo detiene por su PID.

Comprueba lo que el motor no puede probar sin DOM: la voz sin palabras pegadas ni «Listo. Listo.», la hoja impresa
(número real de ideas, una por sección elegida, franjas «cuándo ir»), las situaciones sugeridas una por una (botones y
voz), la línea «Contesta por el niño o la niña», el texto de medicinas en tercera persona, «dando pecho» en la
confirmación, la voz encendida por defecto en la app de escritorio y que la consola no muestre errores."""
import argparse, json, pathlib, re, socket, subprocess, sys, time
from playwright.sync_api import sync_playwright

raiz = pathlib.Path(__file__).resolve().parent.parent

PREPARAR = """(c) => {
  const M = window.MediBot; M.terminar(); M.ir("bienvenida");
  const s = M.sesion;
  Object.assign(s, JSON.parse(JSON.stringify(c.sesion || {})));
  if (!c.alarmaVacia) for (const p of window.MediBotData.alarma.preguntas) s.alarma[p.id] = false;
  const v = (x) => ({ valor: x, estado: "valida", origen: "manual", calidad: 1 });
  if (c.medidas !== false) { s.medidas.fc = v(80); s.medidas.spo2 = v(97); s.medidas.temp = c.temp ? v(c.temp) : { valor: null, origen: null, calidad: null, estado: null }; }
  M.ir(c.pantalla);
  return M.pantalla;
}"""
# Palabras pegadas: minúscula o punto seguido de mayúscula sin espacio («AutocuidadoHoy», «salud.Si»). «MediBot» es el nombre.
_PEGADAS = re.compile(r"[a-záéíóúñ.,:;!?…)][A-ZÁÉÍÓÚÑ¿¡]")


def pegadas(texto: str) -> list[str]:
    """Pares pegados con 6 letras de contexto; «MediBot» no cuenta."""
    t = texto.replace("MediBot", "Medibot")
    return [t[max(0, m.start() - 6):m.end() + 6] for m in _PEGADAS.finditer(t)]

fallas = []
def revisa(cond, msg):
    print(("  OK   " if cond else "  FALLA ") + msg)
    if not cond: fallas.append(msg)


PERMITIDAS_LS = {"medibot.lugar", "medibot.voz", "medibot.theme", "medibot.scale", "medibot.altitud", "medibot.bitacora"}


def fase3(nav, url, errores_consola, capturas):
    """Fase 3 a 1280x800: «Cuidado con esto» visible, configuración del operador («¿A dónde voy?») y rojo con el 911."""
    ctx = nav.new_context(viewport={"width": 1280, "height": 800})
    pg = ctx.new_page()
    pg.on("console", lambda m: errores_consola.append(m.text) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errores_consola.append(str(e)))
    pg.goto(url); pg.wait_for_function("() => window.MediBot")
    pg.evaluate("() => localStorage.clear()")

    def ir(pantalla, sesion, medidas=None):
        pg.evaluate("""(c) => {
          const M = window.MediBot; M.terminar(); M.ir("bienvenida");
          const s = M.sesion; Object.assign(s, JSON.parse(JSON.stringify(c.sesion)));
          for (const p of window.MediBotData.alarma.preguntas) s.alarma[p.id] = false;
          const v = (x) => ({ valor: x, estado: "valida", origen: "manual", calidad: 1 });
          const m = c.medidas || [80, 97, null];
          s.medidas.fc = v(m[0]); s.medidas.spo2 = v(m[1]); s.medidas.temp = m[2] ? v(m[2]) : { valor: null, origen: null, calidad: null, estado: null };
          M.ir(c.pantalla);
        }""", {"pantalla": pantalla, "sesion": sesion, "medidas": medidas})
        pg.wait_for_timeout(450)

    def foto(nombre, selector=None):
        if not capturas: return
        if selector: pg.locator(selector).first.scroll_into_view_if_needed()
        pg.screenshot(path=str(capturas / f"f3_{nombre}.png"))

    voz = lambda: pg.evaluate("() => window.MediBotVoz.textoPantalla()")
    nivel = lambda: pg.evaluate("() => window.MediBot.evaluar().nivel")

    print("E9 · «Cuidado con esto»: tarjeta visible junto a su sección, en la voz y en la hoja")
    mama = {"paraQuien": "yo", "grupo": "18a59", "embarazoOpcion": "lactancia", "embarazoRespondido": True, "embarazo": False, "lactancia": True,
            "medicinas": ["ninguna"], "categorias": ["digestion", "ninos"]}
    ir("fichas", mama)
    esperado = pg.evaluate("() => { const r = window.MediBot.recomendar(); return Object.fromEntries(Object.entries(r.cuidado).map(([k, v]) => [k, v && v.tarjeta.id])); }")
    revisa(esperado == {"digestion": "greta_azarcon", "ninos": "te_agua_bebe"}, f"el motor da 1 por sección sin repetir: {esperado}")
    for _ in range(6):  # pasa de página hasta que aparezca (va después de la última idea de su sección)
        if pg.locator("[data-cuidado]").count() or pg.locator(".btn--mas:visible").count() == 0: break
        pg.click(".btn--mas"); pg.wait_for_timeout(200)
    vistas = pg.eval_on_selector_all("[data-cuidado]", "els => els.map(e => e.dataset.tema + ':' + e.dataset.cuidado)")
    revisa(any(v.startswith("digestion:greta_azarcon") for v in vistas), f"la tarjeta de cuidado se ve en pantalla: {vistas}")
    junto = pg.evaluate("""() => { const c = document.querySelector('[data-cuidado]'); const p = c && c.previousElementSibling; const r = window.MediBot.recomendar();
      const i = p ? Number(p.dataset.i) : -1; return { tema: r.tarjetas[i] && r.tarjetas[i].tema, ultima: i === r.tarjetas.map(t => t.tema).lastIndexOf(c.dataset.tema) }; }""")
    revisa(junto == {"tema": "digestion", "ultima": True}, f"va justo después de la última idea de su sección ({junto})")
    tarjeta = pg.inner_text("[data-cuidado]")
    revisa("cuidado con esto" in tarjeta.lower() and "En su lugar" in tarjeta, "la tarjeta dice «Cuidado con esto» y «En su lugar»")
    # v0.5 (una idea por pantalla): «Cuidado con esto» es su propia pantalla justo después de la última idea de su sección;
    # se llega con el verde y se escucha con el azul de la botonera (antes: botón «Escuchar esta» de la idea anterior)
    for _ in range(20):
        if pg.locator("[data-cuidado=greta_azarcon]:not([hidden])").count(): break
        pg.click(".botonera [data-boton=verde]"); pg.wait_for_timeout(60)
    pg.click(".botonera [data-boton=azul]")
    u = pg.evaluate("() => window.MediBotVoz.ultimoTexto")
    revisa("Cuidado con esto: Greta y azarcón" in u, "la pantalla de «Cuidado con esto» se oye con el azul: " + u[-160:])
    foto("cuidado_ideas", "[data-cuidado]")
    ir("resumen", mama)
    hoja = pg.eval_on_selector_all(".hoja__cuidado [data-cuidado]", "els => els.map(e => e.dataset.cuidado)")
    # v0.5 (decisión de diseño): hasta 2 por sección → digestión: greta y epazote; niños: té y agua al bebé
    revisa(sorted(hoja) == ["epazote_te", "greta_azarcon", "te_agua_bebe"], f"la hoja trae las tarjetas de cuidado (hasta 2 por sección): {hoja}")
    foto("cuidado_hoja", ".hoja__cuidado")

    print("E10 · operador: configurar «¿A dónde voy?» (municipio → unidad → datos → vista previa en voz → guardar)")
    pg.evaluate("() => { window.MediBot.terminar(); }"); pg.wait_for_timeout(300)
    pg.keyboard.press("Control+Alt+Shift+KeyO"); pg.wait_for_timeout(200)  # v0.5: el panel solo se abre con el gesto
    revisa(pg.locator(".operador .btn--lugar").count() == 1, "el panel de operador tiene el botón «¿A dónde voy?»")
    pg.click(".operador .btn--lugar")
    pg.wait_for_function("() => window.MediBotData.clues && document.querySelector('.lugar__municipios')")
    pg.fill(".lugar-config input[type=text]", "matias romero")
    pg.wait_for_timeout(150)
    revisa(pg.locator(".lugar__municipios .opcion", has_text="Matías Romero Avendaño").count() == 1, "«matias romero» (sin acento) encuentra Matías Romero Avendaño")
    foto("config_1_municipio")
    pg.locator(".lugar__municipios .opcion", has_text="Matías Romero Avendaño").click()
    pg.wait_for_timeout(150)
    textos_u = pg.eval_on_selector_all(".lugar__unidades .opcion", "els => els.map(e => e.innerText)")
    revisa(any("Palomares" in t for t in textos_u) and "escribirla a mano" in textos_u[-1], f"lista de unidades del CLUES + «a mano» al final ({len(textos_u)})")
    foto("config_2_unidad")
    pg.locator(".lugar__unidades .opcion", has_text="Palomares").first.click()
    pg.wait_for_timeout(150)
    revisa(pg.input_value("input[name=telefono]") == "9711790898", "el teléfono propio del CLUES se prellena")
    revisa("8 de la mañana a 8 de la noche" in pg.input_value("input[name=horario]"), "el horario se prellena en palabras: " + pg.input_value("input[name=horario]"))
    revisa("Confírmalo" in pg.inner_text(".lugar-config"), "dice que lo prellenado viene de la DGIS y hay que confirmarlo")
    pg.fill("input[name=nombre_corto]", "Centro de Salud de Palomares")
    pg.fill("input[name=como_llegar]", "Frente al parque, junto a la escuela")
    pg.fill("input[name=ambulancia]", "972 722 1183")
    pg.fill("input[name=vacunacion]", "")
    pg.fill("input[name=confirmo]", "Prueba E2E")
    foto("config_3_datos")
    pg.fill("input[name=telefono]", "000")
    pg.click("text=Vista previa"); pg.wait_for_timeout(100)
    revisa("10 dígitos" in pg.inner_text("[data-error=telefono]") and pg.locator("[data-paso='3']").count() == 1, "un teléfono inválido no deja seguir")
    pg.fill("input[name=telefono]", "9711790898")
    pg.click("text=Vista previa"); pg.wait_for_timeout(150)
    vista = pg.inner_text(".lugar__vista")
    revisa("Centro de Salud de Palomares" in vista and "Días de vacunación" not in vista and "[" not in vista, "vista previa sin campos vacíos")
    pg.click(".lugar__escuchar")
    u = pg.evaluate("() => window.MediBotVoz.ultimoTexto")
    revisa("9 7 1, 1 7 9, 0 8, 9 8" in u and "nueve, uno, uno" in u and "opción uno" in u, "la vista previa se lee en voz con números agrupados: " + u[:140])
    foto("config_4_vista", ".lugar__vista")
    pg.click(".lugar__guardar"); pg.wait_for_timeout(150)
    guardado = pg.evaluate("() => JSON.parse(localStorage.getItem('medibot.lugar'))")
    revisa(guardado and guardado["nombre_corto"] == "Centro de Salud de Palomares" and guardado["telefono"] == "9711790898" and guardado["vacunacion"] == "", f"guardado en el equipo: {guardado and guardado['nombre_corto']}")
    pg.click("summary:has-text('exportar')")
    pg.click(".lugar__exportar"); pg.wait_for_timeout(150)
    exportado = pg.input_value(".lugar-config textarea")
    pg.evaluate("() => localStorage.removeItem('medibot.lugar')")
    pg.fill(".lugar-config textarea", exportado)
    pg.click(".lugar__importar"); pg.wait_for_timeout(150)
    revisa(pg.evaluate("() => JSON.parse(localStorage.getItem('medibot.lugar'))") == guardado, "exportar e importar da la misma configuración (L6)")

    print("E10b · la unidad configurada sale en ámbar, en la franja «cuándo ir» y en la hoja")
    fiebre = {"paraQuien": "yo", "grupo": "18a59", "embarazoOpcion": "no", "medicinas": ["ninguna"], "categorias": ["diarrea", "dolor_cabeza"]}
    ir("resultado", fiebre, [112, 96, 38.6])
    revisa(nivel() == "ambar", "escenario ámbar")
    revisa("Centro de Salud de Palomares" in pg.inner_text(".lugar") and "Días de vacunación" not in pg.inner_text(".lugar"), "ámbar: tarjeta «¿A dónde voy?» con la unidad, sin campos vacíos")
    v = voz()
    revisa("Tu centro de salud: Centro de Salud de Palomares" in v and "9 7 1, 1 7 9, 0 8, 9 8" in v and "9711790898" not in v, "la voz del ámbar dice la unidad con números agrupados")
    foto("ambar_lugar", ".lugar")
    ir("fichas", fiebre, [112, 96, 38.6])
    revisa(pg.locator(".cuando-ir__lugar", has_text="Palomares").count() >= 1, "la franja «cuándo ir» dice a qué centro de salud ir")
    foto("franja_lugar", ".cuando-ir__lugar")
    largo = {"paraQuien": "yo", "grupo": "18a59", "embarazo": True, "embarazoRespondido": True, "embarazoOpcion": "si", "medicinas": ["no_se"], "categorias": ["diarrea", "piel", "embarazo"]}
    ir("resumen", largo, [80, 97, 38.4])
    revisa("Palomares" in pg.inner_text(".hoja__lugares"), "la hoja trae la unidad")
    n_cu = pg.locator(".hoja__cuidado [data-cuidado]").count()
    pdf = pg.pdf(format="Letter", print_background=True)
    paginas = len(re.findall(rb"/Type\s*/Page[^s]", pdf))
    impresas = pg.evaluate("() => document.querySelector('.hoja').classList.contains('hoja--sin-cuidado') ? 0 : document.querySelectorAll('.hoja__cuidado [data-cuidado]').length")
    # v0.5 (decisión de diseño): hasta 2 por sección × 3 secciones = 6
    revisa(paginas == 1 and n_cu == 6, f"hoja con la unidad y {n_cu} tarjetas de cuidado (fiebre, embarazo, «No sé», 3 secciones) cabe en 1 carta ({paginas} páginas; cuidado impreso: {impresas})")
    if capturas: (capturas / "f3_hoja_larga.pdf").write_bytes(pdf)
    print("E10c · «si cabe»: los casos más largos que halló la revisión (con y sin centro de salud) caben en 1 carta")
    grande = {"nombre_corto": "Centro de Salud Urbano de Matías Romero Avendaño", "como_llegar": "Frente al parque central, junto a la escuela primaria Benito Juárez",
              "horario": "Lunes a viernes, de 8 de la mañana a 8 de la noche; sábado y domingo, de 9 de la mañana a 3 de la tarde", "telefono": "9711790898",
              "ambulancia": "9727221183", "vacunacion": "Martes y jueves, de 9 de la mañana a 1 de la tarde", "urgencias_24h": False, "clues": "X",
              "municipio": "Matías Romero Avendaño", "confirmo": "E2E", "fecha_confirmacion": "2026-11-01"}
    emb = {"paraQuien": "yo", "grupo": "18a59", "embarazo": True, "embarazoRespondido": True, "embarazoOpcion": "si", "medicinas": ["no_se"]}
    for etiqueta, cats, cfg in [("sueño+diarrea+azúcar, centro largo", ["sueno", "diarrea", "azucar_peso"], grande),
                                ("sueño+diarrea+azúcar, sin centro", ["sueno", "diarrea", "azucar_peso"], None),
                                ("corazón+diarrea+azúcar, sin centro", ["corazon", "diarrea", "azucar_peso"], None)]:
        pg.evaluate("(c) => c ? localStorage.setItem('medibot.lugar', JSON.stringify(c)) : localStorage.removeItem('medibot.lugar')", cfg)
        ir("resumen", {**emb, "categorias": cats}, [80, 97, 38.4])
        pdf = pg.pdf(format="Letter", print_background=True)
        paginas = len(re.findall(rb"/Type\s*/Page[^s]", pdf))
        estado = pg.evaluate("() => { const h = document.querySelector('.hoja'); return { sinCuidado: h.classList.contains('hoja--sin-cuidado'), alto: h.dataset.altoCarta, lugares: !!h.querySelector('.hoja__lugares') }; }")
        revisa(paginas == 1 and estado["lugares"], f"{etiqueta}: {paginas} página(s); «¿A dónde voy?» impreso; cuidado fuera por espacio: {estado['sinCuidado']} (alto medido {estado['alto']} px)")
    pg.evaluate("(c) => localStorage.setItem('medibot.lugar', JSON.stringify(c))", guardado)
    ir("resumen", mama)
    pg.pdf(format="Letter", print_background=True)
    revisa(not pg.evaluate("() => document.querySelector('.hoja').classList.contains('hoja--sin-cuidado')"), "si cabe, «Cuidado con esto» sí se imprime (caso corto)")
    foto("hoja_lugar", ".hoja__lugares")

    print("E11 · rojo: el 911 primero y grande; la unidad no (no atiende urgencias 24 h); sin tarjetas de cuidado")
    ir("resultado", {**fiebre, "categorias": ["digestion"]}, [80, 84, None])
    revisa(nivel() == "rojo", "escenario rojo")
    primera = pg.locator(".lugar-urgente .telefono").first
    revisa(primera.get_attribute("data-linea") == "emergencias_911" and "telefono--urgente" in (primera.get_attribute("class") or ""), "el 911 va primero y destacado")
    revisa(pg.evaluate("() => { const a = document.querySelector('.lugar-urgente').getBoundingClientRect(); const b = document.querySelector('.heroe').getBoundingClientRect(); return a.top >= b.bottom - 1 && a.top < 800; }"), "y se ve arriba, justo debajo del nivel")
    urg = pg.inner_text(".lugar-urgente")
    revisa("Palomares" not in urg and "972 722 1183" in urg, "la unidad no sale en rojo, la ambulancia local sí")
    revisa(pg.evaluate("() => { const f = parseFloat(getComputedStyle(document.querySelector('.telefono--urgente .num')).fontSize); const o = document.querySelector('.lugar-urgente .telefono:not(.telefono--urgente) .num'); return f > parseFloat(getComputedStyle(o).fontSize); }"), "el 911 se ve más grande que las otras líneas")
    v = voz()
    revisa("Si es urgente, llama ya al 911: nueve, uno, uno" in v and v.index("nueve, uno, uno") < v.index("Qué hacer ahora"), "la voz dice el 911 antes que lo demás")
    foto("rojo_911", ".heroe")
    ir("resumen", {**fiebre, "categorias": ["digestion"]}, [80, 84, None])
    revisa(pg.locator(".hoja__cuidado").count() == 0, "en rojo la hoja no trae tarjetas de cuidado")

    print("E12 · sin configuración: solo las 3 líneas nacionales; y no se guarda nada de la persona")
    keys = pg.evaluate("() => Object.keys(localStorage)")
    revisa(set(keys) <= PERMITIDAS_LS, f"localStorage solo trae configuración del equipo: {keys}")
    pg.evaluate("() => localStorage.removeItem('medibot.lugar')")
    ir("resultado", fiebre, [112, 96, 38.6])
    lineas = pg.eval_on_selector_all(".telefono .num", "els => els.map(e => e.textContent)")
    revisa(lineas == ["911", "800 911 2000", "079, opción 1"] and pg.locator(".lugar").count() == 0, f"sin configuración: {lineas}")
    ctx.close()


def puerto_libre():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0)); return s.getsockname()[1]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--capturas", type=pathlib.Path)
    a = ap.parse_args()
    if a.capturas: a.capturas.mkdir(parents=True, exist_ok=True)
    puerto = puerto_libre()
    srv = subprocess.Popen([sys.executable, "-m", "http.server", str(puerto), "--bind", "127.0.0.1"], cwd=raiz,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"servidor http.server PID={srv.pid} puerto={puerto}")
    url = f"http://127.0.0.1:{puerto}/index.html"
    errores_consola = []
    try:
        time.sleep(0.8)
        with sync_playwright() as p:
            nav = p.chromium.launch()

            def pagina(init=None):
                ctx = nav.new_context(viewport={"width": 1440, "height": 900})
                if init: ctx.add_init_script(init)
                pg = ctx.new_page()
                pg.on("console", lambda m: errores_consola.append(m.text) if m.type == "error" else None)
                pg.on("pageerror", lambda e: errores_consola.append(str(e)))
                pg.goto(url); pg.wait_for_function("() => window.MediBot")
                return pg

            def ir(pg, pantalla, sesion, temp=None, alarma_vacia=False):
                real = pg.evaluate(PREPARAR, {"pantalla": pantalla, "sesion": sesion, "temp": temp, "alarmaVacia": alarma_vacia})
                pg.wait_for_timeout(450)
                return real

            def captura(pg, nombre):
                if a.capturas: pg.screenshot(path=str(a.capturas / f"fix_{nombre}.png"), full_page=True)

            voz = lambda pg: pg.evaluate("() => window.MediBotVoz.textoPantalla()")
            ultimo = lambda pg: pg.evaluate("() => window.MediBotVoz.ultimoTexto")
            accion = lambda pg, id: pg.evaluate("(id) => window.MediBotVoz.accion(id)", id)

            pg = pagina()
            print("E1 · confirmación: «dando pecho» y voz sin palabras pegadas")
            lact = {"paraQuien": "yo", "grupo": "18a59", "embarazoOpcion": "lactancia", "embarazoRespondido": True, "embarazo": False, "lactancia": True,
                    "medicinas": ["ninguna"], "categorias": ["colicos", "diarrea"]}
            ir(pg, "confirmar", lact)
            texto = pg.inner_text("#app")
            revisa("Dando pecho" in texto, "la confirmación dice «Dando pecho»")
            t = voz(pg)
            revisa("estaturaNo" not in t and not pegadas(t), "voz de la confirmación sin palabras pegadas: " + str(pegadas(t)[:5]))
            captura(pg, "p3_confirmar_1440")

            print("E2 · ideas: encabezado «dando pecho» y «No lo encuentro» honesto")
            ir(pg, "fichas", lact)
            revisa("dando pecho" in pg.inner_text(".encabezado-personal"), "el encabezado de las ideas dice «dando pecho»")
            pg.click(".botonera [data-boton=rojo]")  # v0.5: «No lo encuentro» es el rojo de la botonera
            panel = pg.inner_text(".alternativas:not([hidden])")
            revisa("sirve igual" not in panel and ("puedes probar con" in panel or "no tiene cambio" in panel), "«No lo encuentro» sin «sirve igual»: " + panel[:80])
            captura(pg, "p3_ideas_1440")

            print("E3 · hoja impresa: número real, una por sección elegida, franjas «cuándo ir», voz sin pegadas")
            ir(pg, "resumen", lact)
            titulo = pg.inner_text(".hoja__ideas h2")
            n = pg.locator(".ideas-hoja > li").count()
            esperado = "Tu idea" if n == 1 else f"Tus {n} ideas"
            revisa(titulo == esperado, f"título «{titulo}» = {esperado}")
            temas_hoja = pg.eval_on_selector_all(".ideas-hoja > li", "els => els.map(e => e.dataset.tema).filter(Boolean)")
            for tm in lact["categorias"]:
                revisa(tm in temas_hoja, f"la hoja trae al menos una idea de {tm} ({temas_hoja})")
            con_franja = pg.evaluate("(ids) => ids.filter(id => { const t = window.MediBotData.corpus.temas.find(x => x.id === id); return t && t.cuando_ir; })", lact["categorias"])
            franjas = pg.eval_on_selector_all(".hoja__cuando-ir li", "els => els.map(e => e.dataset.tema)")
            revisa(sorted(franjas) == sorted(con_franja), f"franjas «cuándo ir» impresas {franjas} = {con_franja}")
            t = voz(pg)
            revisa(not pegadas(t), "voz de la hoja sin palabras pegadas: " + str(pegadas(t)[:5]))
            captura(pg, "p3_hoja_1440")

            print("E3b · hoja impresa en una carta, en el caso más largo (fiebre, embarazo, «No sé» y 3 secciones con franja)")
            largo = {"paraQuien": "yo", "grupo": "18a59", "embarazo": True, "embarazoRespondido": True, "embarazoOpcion": "si",
                     "medicinas": ["no_se"], "categorias": ["dolor_cabeza", "diarrea", "embarazo"]}
            ir(pg, "resumen", largo, temp=38.4)
            n = pg.locator(".ideas-hoja > li").count()
            pdf = pg.pdf(format="Letter", print_background=True)
            paginas = len(re.findall(rb"/Type\s*/Page[^s]", pdf))
            revisa(paginas == 1, f"la hoja cabe en 1 carta ({paginas} páginas, {n} ideas, franjas {pg.locator('.hoja__cuando-ir li').count()})")
            if a.capturas: (a.capturas / "fix_p2_hoja_impresa.pdf").write_bytes(pdf)

            print("E4 · situaciones sugeridas una por una (botones)")
            mayor = {"paraQuien": "yo", "grupo": "60mas", "medicinas": ["presion"], "condiciones": ["rinon_poca_agua"], "categorias": []}
            ir(pg, "cuidar", mayor)
            sug = pg.evaluate("() => window.MediBotRecomendaciones.sugeridas(window.MediBotRecomendaciones.perfil(window.MediBot.sesion, null))")
            filas = pg.locator(".sugerencia .pregunta")
            revisa(filas.count() == len(sug) == 2, f"una pregunta por situación sugerida ({filas.count()} filas, {sug})")
            filas.nth(0).locator('[data-v="no"]').click()
            cats = pg.evaluate("() => window.MediBot.sesion.categorias.slice()")
            revisa(sug[0] not in cats and sug[1] in cats, f"«No» a la primera quita solo esa: {cats}")
            captura(pg, "p1_cuidar_1440")

            print("E5 · situaciones sugeridas una por una (voz)")
            ir(pg, "cuidar", mayor)
            nombres = pg.evaluate("(ids) => ids.map(id => window.MediBotRecomendaciones.nombreTema(id))", sug)
            g = voz(pg)
            revisa(f"¿Quieres ideas de {nombres[0]}?" in g, "la voz pregunta por la primera: " + g[:160])
            accion(pg, "si")
            u = ultimo(pg)
            revisa(f"¿Quieres ideas de {nombres[1]}?" in u, "luego por la segunda: " + u[:120])
            accion(pg, "no")
            cats = pg.evaluate("() => window.MediBot.sesion.categorias.slice()")
            revisa(sug[0] in cats and sug[1] not in cats, f"sí a la primera y no a la segunda: {cats}")

            print("E6 · niño: «Contesta por el niño o la niña» y medicinas en tercera persona")
            nino = {"paraQuien": "nino", "grupo": "nino", "edadNino": "6a11", "medicinas": ["ninguna"], "categorias": ["boca", "defensas"]}
            ir(pg, "alarma", nino, alarma_vacia=True)
            revisa("Contesta por el niño o la niña" in pg.inner_text("#app"), "la línea sale en la pantalla de alarma")
            g = voz(pg)
            revisa("Pregunta 1" in g and "Contesta por el niño o la niña" in g and g.index("Contesta por el niño o la niña") < g.index("Pregunta 1"), "y la voz la dice antes de la pregunta 1")
            captura(pg, "p4_alarma_1440")
            ir(pg, "medicinas", nino)
            ayuda = pg.inner_text(".medicinas-lista .bloque > p.ayuda")  # v0.5: la ayuda va bajo la pregunta (antes «.cabecera p»)
            revisa("su medicina" in ayuda and "darte" not in ayuda, "ayuda de medicinas en tercera persona: " + ayuda)
            revisa("toma poca agua" in pg.inner_text(".condiciones"), "la casilla de riñones dice «toma poca agua»")
            no_se = pg.evaluate("() => window.MediBotData.textos.medicinas.opciones.find(o => o.id === 'no_se').voz_otra")
            revisa(no_se == "¿No sabes qué medicina toma?", f"«No sé» por otra persona: {no_se}")
            captura(pg, "p4_medicinas_1440")

            print("E7 · sobreTi por voz: sin «Listo. Listo.»")
            pg.evaluate("() => { window.MediBot.terminar(); window.MediBot.ir('bienvenida'); window.MediBot.ir('sobreTi'); }")
            pg.wait_for_timeout(300)
            for paso in ["si", "si", "no", "no"]:   # para mí · 12 a 17 · embarazo no · dando pecho no
                accion(pg, paso)
            u = ultimo(pg)
            revisa("Listo. Listo." not in u, "final de «Sobre ti» por voz: " + u[:90])
            pg.close()

            print("E8 · app de escritorio: «Leer cada pantalla» encendido por defecto")
            pe = pagina("window.medibotEscritorio = { esApp: true, version: 'prueba', salida: 'Ctrl+Alt+Shift+Q', salir() {} };")
            revisa(pe.evaluate("() => window.MediBotVoz.siempre") is True, "Voz.siempre = true en la app")
            pe.keyboard.press("Control+Alt+Shift+KeyO"); pe.wait_for_timeout(200)  # v0.5: el panel solo se abre con el gesto
            revisa(pe.is_checked(".operador input[type=checkbox]"), "la casilla del operador aparece marcada")
            pe.close()
            pn = pagina()
            revisa(pn.evaluate("() => window.MediBotVoz.siempre") is False, "en el navegador sigue apagado")
            pn.close()
            fase3(nav, url, errores_consola, a.capturas)
            nav.close()
    finally:
        srv.terminate(); srv.wait(timeout=10)
        print(f"servidor PID={srv.pid} detenido (código {srv.returncode})")
    revisa(not errores_consola, "consola sin errores: " + json.dumps(errores_consola[:5], ensure_ascii=False))
    print("E2E: OK" if not fallas else f"E2E: FALLÓ ({len(fallas)})")
    sys.exit(1 if fallas else 0)


if __name__ == "__main__":
    main()
