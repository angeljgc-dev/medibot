#!/usr/bin/env python3
"""Lint de contenido de MediBot.

Revisa data/*.js y falla (código de salida 1) si:
  1. Aparece vocabulario prohibido (referido a MediBot o a un suplemento), salvo en frases negadas de la lista blanca
     ("no es un aparato de diagnóstico", "no diagnostica", "no sustituye la consulta"...).
  2. Una ficha de alimento/suplemento nombra una enfermedad junto al producto (art. 174 RCSPyS, adoptado voluntariamente).
  3. Falta `fuente.url`, `nivel_evidencia` o `advertencia` en un suplemento; falta `fuente.url` en alimentos, preguntas o rangos.
  4. Las leyendas COFEPRIS no están en MAYÚSCULAS.
  5. En una categoría los suplementos aparecen antes que los alimentos.
  6. data/corpus.js (si existe): JSON válido; campos obligatorios; temas mínimos con dibujo distinto; ids de alternativas
     existentes (≥ 2, al menos una comida o hábito); fuentes con URL; plantas con nombre científico y redacción de uso
     tradicional; sin plantas ni suplementos del Art. PRIMERO del Acuerdo de 1999 (sus 76 fracciones; `--contar-primero`);
     Art. SEGUNDO con leyenda de embarazo; `sin_cambio` con `alternativas` vacía; `avisos_perfil`, `actividad` y
     `ocultar_si` (temas) con valores conocidos; vocabulario
     prohibido en `para`/`aviso`/`si_no_hay`/`como`/`cuanto_ninos`/`nombre` y palabras difíciles en pantalla ("nutrimento", "UI", "anticoagulante").
  7. data/cuidado.js (criterio 16): campos, ids de `en_su_lugar` y `secciones` existentes en el corpus, alternativas que
     no son del Art. PRIMERO, fuentes https (al menos una oficial), perfiles conocidos, mismas palabras prohibidas.
     Pruebas: `--cuidado RUTA` (se compara con el corpus de `--corpus`).
  8. data/lugares.js (criterio 17): líneas nacionales con fuente https y voz agrupada, «079, opción 1», nada de
     `no_mostrar` visible, 911 sin «gratis», plantilla sin marcadores y con teléfonos válidos. Pruebas: `--lugares RUTA`.

Uso:  python tools/lint_contenido.py        (desde la carpeta MediBot)
"""
from __future__ import annotations
import json, re, sys, pathlib, unicodedata
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

RAIZ = pathlib.Path(__file__).resolve().parent.parent
DATA = RAIZ / "data"

# --- 1. Vocabulario prohibido -------------------------------------------------------------
PROHIBIDO_GENERAL = [
    r"\bdiagn[oó]stic\w*", r"\bdetecta\w*", r"\bidentificamos\b", r"\busted tiene\b", r"\bpadeces\b",
    r"\bexamen m[eé]dico\b", r"\bchequeo\b", r"\bvaloraci[oó]n m[eé]dica\b", r"\banálisis cl[ií]nico\b",
    r"\besc[aá]ner\b", r"\bescaneo\b", r"\bcu[aá]ntic\w*", r"\bbio\s?resonancia\b", r"\benerg[ií]a celular\b",
    r"\bpreciso\b", r"\bexacto\b", r"\bcertificad\w*", r"\bvalidado m[eé]dicamente\b", r"\baprobado por\b",
    r"\best[aá]s sano\b", r"\best[aá]s bien\b", r"\btodo bien\b",
]
PROHIBIDO_PRODUCTO = [
    r"\bcura\w*", r"\bsana\w*", r"\bremedia\w*", r"\bcorrige\w*",
    r"\bprevien\w*", r"\bprevenir\b", r"\bprotege contra\b", r"\breduce el riesgo\b",
    r"\btrata\b", r"\btratamiento\b", r"\balivia\w*", r"\bcombate\w*", r"\belimina\w*", r"\bcontrola\w*",
    r"\bs[ií]ntesis\b", r"\babsor\w*", r"\bmotilidad\b", r"\bmetabolismo\b", r"\binmunidad\b", r"\bantioxidante\w*",
    r"\btriglic[eé]rid\w*", r"\btestosterona\b", r"\brefuerza\b", r"\bestimula\w*", r"\bquema grasa\b", r"\bda energ[ií]a\b",
    r"\bsustituye una comida\b", r"\bafrodis[ií]ac\w*", r"\bmilagros\w*", r"\bsin efectos secundarios\b", r"\binofensiv\w*",
    r"\brecomendado por m[eé]dicos\b", r"\bel mejor\b",
]
ENFERMEDADES = [
    r"\bdiabetes\b", r"\bc[aá]ncer\b", r"\banemia\b", r"\bgastritis\b", r"\bartritis\b", r"\bcovid\b", r"\bresfriad\w*", r"\bgripa\b",
    r"\bhipertensi[oó]n\b", r"\bosteoporosis\b", r"\bdegeneraci[oó]n macular\b", r"\binfecci[oó]n\w*", r"\bdepresi[oó]n\b", r"\binsomnio\b",
]
# Frases negadas permitidas (se borran antes de buscar prohibidos)
LISTA_BLANCA = [
    r"no (es|soy|son|somos) (un |una )?(m[eé]dico|aparato|resultado|proyecto)[^.]{0,60}?diagn[oó]stic\w*",
    r"no (es|son) (un |una )?diagn[oó]stic\w*", r"no (da|doy|damos|dar) diagn[oó]stic\w*", r"no diagnostica\w*",
    r"por qu[eé] medibot no diagnostica", r"no sustitu\w*", r"no detecta\w*", r"puede equivocarse", r"pueden equivocarse",
    r"no evita\w*", r"no hace que", r"no (es|son) (una )?urgencia",
    r"esto no es un diagn[oó]stico", r"sin diagn[oó]stico",
    r"no previene\w*",  # negaciones honestas de evidencia
    r"tratamiento no", r"controla\w* (la|el) (presi[oó]n|az[uú]car)",  # frases de remisión al centro de salud
]

def cargar(nombre: str, ruta: pathlib.Path | None = None):
    txt = (ruta or DATA / f"{nombre}.js").read_text(encoding="utf-8")
    m = re.search(r"window\.MediBotData\.%s\s*=\s*(\{.*\})\s*;\s*$" % nombre, txt, re.S)
    if not m:
        raise SystemExit(f"[{nombre}.js] no encontré el objeto JSON")
    try:
        return json.loads(m.group(1)), txt
    except json.JSONDecodeError as e:
        raise SystemExit(f"[{nombre}.js] JSON inválido: {e}")

def textos_de(obj, ruta=""):
    """Genera (ruta, texto) para toda cadena del objeto."""
    if isinstance(obj, str):
        yield ruta, obj
    elif isinstance(obj, dict):
        for k, v in obj.items():
            if k == "url":
                continue
            yield from textos_de(v, f"{ruta}.{k}" if ruta else k)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from textos_de(v, f"{ruta}[{i}]")

def limpiar(texto: str) -> str:
    t = texto.lower()
    for pat in LISTA_BLANCA:
        t = re.sub(pat, " ", t)
    return t

def buscar(patrones, texto):
    return [p for p in patrones if re.search(p, texto)]

errores: list[str] = []
def err(msg): errores.append(msg)

# --- Cargar ---------------------------------------------------------------------------------
textos, _ = cargar("textos"); rangos, _ = cargar("rangos"); alarma, _ = cargar("alarma"); fichas, fichas_txt = cargar("fichas")

# --- Regla 1: prohibidos generales en todo ---------------------------------------------------
for nombre, obj in (("textos", textos), ("rangos", rangos), ("alarma", alarma), ("fichas", fichas)):
    for ruta, t in textos_de(obj):
        if ruta.startswith("acerca"):
            continue  # la explicación del QRMA cita su vocabulario a propósito (entre comillas)
        hits = buscar(PROHIBIDO_GENERAL, limpiar(t))
        if hits:
            err(f"[{nombre}] {ruta}: vocabulario prohibido {hits} en: «{t[:90]}»")

# --- Regla 1b y 2: prohibidos de producto y enfermedades en fichas --------------------------
for ci, cat in enumerate(fichas["categorias"]):
    for tipo in ("alimentos", "suplementos"):
        for ii, item in enumerate(cat.get(tipo, [])):
            for ruta, t in textos_de(item, f"categorias[{ci}].{tipo}[{ii}]"):
                if ruta.endswith(".fuente.nombre"):
                    continue
                lt = limpiar(t)
                hits = buscar(PROHIBIDO_PRODUCTO, lt)
                if hits:
                    err(f"[fichas] {ruta}: declaración prohibida {hits} en: «{t[:90]}»")
                enf = buscar(ENFERMEDADES, lt)
                if enf:
                    err(f"[fichas] {ruta}: nombra enfermedad junto al producto {enf} en: «{t[:90]}»")
    # Regla 3: campos obligatorios
    for ii, sup in enumerate(cat.get("suplementos", [])):
        for campo in ("nivel_evidencia", "advertencia", "evidencia", "si_no_hay"):
            if not sup.get(campo):
                err(f"[fichas] categorias[{ci}].suplementos[{ii}] ({sup.get('nombre')}): falta `{campo}`")
        if not (sup.get("fuente") or {}).get("url"):
            err(f"[fichas] categorias[{ci}].suplementos[{ii}] ({sup.get('nombre')}): falta fuente.url")
    for ii, al in enumerate(cat.get("alimentos", [])):
        if not (al.get("fuente") or {}).get("url"):
            err(f"[fichas] categorias[{ci}].alimentos[{ii}] ({al.get('nombre')}): falta fuente.url")
    # Regla 5: orden alimentos antes que suplementos (en el texto del archivo)
    bloque = re.search(r'"id":\s*"%s".*?(?=\n\s*\{\s*\n\s*"id"|\n\s*\]\s*\n\};)' % re.escape(cat["id"]), fichas_txt, re.S)
    if bloque and '"suplementos"' in bloque.group(0) and '"alimentos"' in bloque.group(0):
        if bloque.group(0).index('"suplementos"') < bloque.group(0).index('"alimentos"'):
            err(f"[fichas] categoría {cat['id']}: los suplementos aparecen antes que los alimentos")

# --- Regla 3: fuentes en alarma y rangos -----------------------------------------------------
for p in alarma["preguntas"]:
    if not (p.get("fuente") or {}).get("url"):
        err(f"[alarma] pregunta {p['id']}: falta fuente.url")
for pid, param in rangos["parametros"].items():
    for gid, g in param["por_grupo"].items():
        if not (g.get("fuente") or {}).get("url"):
            err(f"[rangos] {pid}.{gid}: falta fuente.url")
        for b in g.get("bandas", []):
            if b["nivel"] not in ("verde", "ambar", "rojo", "nd"):
                err(f"[rangos] {pid}.{gid}: nivel desconocido {b['nivel']}")

# --- Regla 4: leyendas en mayúsculas ----------------------------------------------------------
for l in textos["leyenda_cofepris"]["mayusculas"]:
    if l != l.upper():
        err(f"[textos] leyenda COFEPRIS no está en mayúsculas: «{l}»")

# --- Regla 6: corpus de remedios (data/corpus.js, docs/corpus_esquema.md) -------------------------
# Solo si el archivo existe (mientras no exista, la app usa data/fichas.js como respaldo).
TIPOS = {"alimento", "planta", "suplemento", "habito"}
TEMAS_MINIMOS = {"defensas", "digestion", "sueno", "energia", "huesos_articulaciones", "corazon", "piel", "vista", "tos_garganta", "orina"}
CLAVES_MEDICINA = {"presion", "azucar", "anticoagulante", "corazon", "tiroides", "nervios_sueno", "convulsiones", "anticonceptivo"}
CONDICIONES = {"vesicula", "higado", "rinon_poca_agua", "acidez", "alergia_asteraceas"}
# Fase 2: campos de sección y de entrada
CLASES_TEMA = {"situacion", "molestia"}
GRUPOS_EDAD = {"bebe", "nino", "12a17", "18a59", "60mas"}
RASGOS = {"fiebre", "imc_alto", "imc_bajo", "embarazo", "lactancia", "nino", "mayor60", "azucar", "presion", "corazon"}
DONDE = {"casa", "mercado", "tienda", "farmacia", "huerto", "centro_salud"}  # centro_salud: decisión de diseño 2026-11-01
RASGOS_PERFIL = {"embarazo", "lactancia", "nino", "mayor60"}  # avisos_perfil (docs/corpus_esquema.md, 2026-11-02)
PRIORIZA = {"fiebre", "imc_alto", "imc_bajo", "embarazo", "nino", "mayor60", "azucar", "presion"}
# Acuerdo por el que se determinan las plantas prohibidas o permitidas para tés, infusiones y aceites vegetales
# comestibles (DOF 15-dic-1999), Art. PRIMERO: las 76 fracciones, copiadas del texto oficial del DOF.
# (fracción, nombres científicos, nombres comunes). Los científicos llevan la grafía del DOF y la correcta (el DOF
# escribe «Digital purpurea», «Veratum», «Gorinanthe»…); los comunes se buscan como palabra completa en el nombre de
# plantas y suplementos. «Matricaria» (fracc. XXI) NO se busca como nombre común: la manzanilla es Matricaria
# chamomilla y está permitida. Nombres comunes que en México también nombran otra planta (uña de gato, orozuz,
# madreselva) se marcan igual: el criterio 14 tampoco admite plantas que se confundan con una prohibida.
ART_PRIMERO = [
    ("I", [r"acacia gregg?ii"], [r"acacia"]), ("II", [r"aconitum"], [r"ac[oó]nito"]), ("III", [r"acorus calamus"], [r"c[aá]lamo"]),
    ("IV", [r"aesculus hippocastanum"], [r"casta[nñ]o de indias"]), ("V", [r"apocynum cannabi"], [r"c[aá][nñ]amo de canad[aá]", r"apocino"]),
    ("VI", [r"arnica montana"], [r"[aá]rnica"]), ("VII", [r"artemisia absinthium"], [r"ajenjo"]),
    ("VIII", [r"artemisia maritima", r"artemisia cina"], [r"ajenjo marino"]), ("IX", [r"artemisia vulgaris"], [r"artemisa"]),
    ("X", [r"atropa bellad"], [r"belladona"]), ("XI", [r"berberis vulgaris"], [r"agracejo"]), ("XII", [r"bryonia dioica"], [r"nueza"]),
    ("XIII", [r"cinnamomum camphora"], [r"alcanfor"]), ("XIV", [r"colchicum autumnale"], [r"c[oó]lquico"]), ("XV", [r"conium maculatum"], [r"cicuta"]),
    ("XVI", [r"convallaria majalis"], [r"convalaria", r"lirio de los valles"]), ("XVII", [r"croton tiglium"], [r"cr[oó]ton"]),
    ("XVIII", [r"cys?tisus scoparius", r"cytisus scoparius"], [r"retama negra"]), ("XIX", [r"chelidonium majus"], [r"celidonia"]),
    ("XX", [r"chenopodium ambrosioides", r"dysphania ambrosioides"], [r"epazote", r"pazote"]),
    ("XXI", [r"chrysanthemu[ms] partheniu[mn]", r"tanacetum parthenium"], [r"amarganza", r"bot[oó]n de plata"]),
    ("XXII", [r"daphne laure"], [r"laureol"]), ("XXIII", [r"daphne meze"], [r"mezere[oó]n"]), ("XXIV", [r"\bdaphne\b"], [r"torvisco"]),
    ("XXV", [r"datura stramonium"], [r"estramonio", r"higuera loca", r"toloache"]),
    ("XXVI", [r"digital(is)? purpurea", r"\bdigitalis\b"], [r"digital", r"dedalera"]),
    ("XXVII", [r"dipteryx odorata"], [r"haba tonga", r"sarrapia", r"cumerona", r"cumarona"]), ("XXVIII", [r"euonymus atropurpureus"], [r"ev[oó]nimo"]),
    ("XXIX", [r"euonymus europ"], [r"ev[oó]nimo europeo"]), ("XXX", [r"eupatorium rugosum", r"ageratina altissima"], []),
    ("XXXI", [r"euphorbia characias"], [r"caracias"]), ("XXXII", [r"\beuphorbia\b"], [r"t[aá]rtago"]),
    ("XXXIII", [r"exogonium purga", r"ipomoea purga"], [r"jalapa"]), ("XXXIV", [r"gelsemium sempervirens"], [r"gelsemio", r"madreselva"]),
    ("XXXV", [r"gorinanthe johimbe", r"corynanthe johimbe"], [r"corteza de yohimbe"]),
    ("XXXVI", [r"hedeoma pulegioides"], [r"poleo americano", r"hedeoma"]), ("XXXVII", [r"heliotropium europ"], [r"heliotropo", r"verrucaria"]),
    ("XXXVIII", [r"hyoscyamus niger"], [r"bele[nñ]o"]), ("XXXIX", [r"hypericum perforatum"], [r"hip[eé]rico", r"hierba de san juan"]),
    ("XL", [r"illicium anisatum"], [r"an[ií]s estrella japon[eé]s"]), ("XLI", [r"ipomoea purpurea"], [r"gloria de la ma[nñ]ana"]),
    ("XLII", [r"juniperus sabina"], [r"sabina"]), ("XLIII", [r"lantana camara"], [r"orozu[sz]", r"cinco negritos", r"u[nñ]a de gato", r"alantana"]),
    ("XLIV", [r"larrea tridentata"], [r"gobernadora"]), ("XLV", [r"lobelia"], [r"lobelia"]), ("XLVI", [r"mahonia aquifolium"], []),
    ("XLVII", [r"mandragora"], [r"mandr[aá]gora"]), ("XLVIII", [r"mentha pulegium"], [r"poleo"]), ("XLIX", [r"narcissus"], [r"narciso"]),
    ("L", [r"pausinystalia yohimbe"], [r"yohimb\w*"]), ("LI", [r"phora?n?dendron flavescens"], [r"mu[eé]rdago americano"]),
    ("LII", [r"phoradendron juniperinum"], []), ("LIII", [r"physostigma venenosum"], [r"haba de calabar", r"nuez de eser[eé]"]),
    ("LIV", [r"phytolacca americana"], [r"hierba carm[ií]n"]), ("LV", [r"podophyllum peltatum"], [r"pod[oó]filo"]),
    ("LVI", [r"rau[wv]olfia"], [r"sarna de perro"]), ("LVII", [r"ricinus communis"], [r"ricino"]), ("LVIII", [r"sanguinaria canadensis"], [r"sanguinaria"]),
    ("LIX", [r"sarothamnus scoparius"], [r"retama de escobas"]), ("LX", [r"sassafras"], [r"sasafr[aá]s"]), ("LXI", [r"senecio aureus"], [r"senecio"]),
    ("LXII", [r"senecio jacobaea", r"jacobaea vulgaris"], [r"hierba de santiago"]), ("LXIII", [r"solanum dulcamara"], [r"dulcamara"]),
    ("LXIV", [r"stroph?anth?us gratus"], [r"komb[eé]"]), ("LXV", [r"stroph?anth?us kombe"], [r"estrofanto"]),
    ("LXVI", [r"strychnos nux-?vomica"], [r"nuez v[oó]mica"]), ("LXVII", [r"symphytum asperum"], []),
    ("LXVIII", [r"symphytum officinale", r"\bsymphytum\b"], [r"consuelda"]), ("LXIX", [r"symphytum x? ?uplandicum"], []),
    ("LXX", [r"tanacetum vulgare"], [r"tanaceto"]), ("LXXI", [r"thuja occidentalis"], [r"tuya", r"[aá]rbol de la vida"]),
    ("LXXII", [r"tussilago farfara"], [r"f[aá]rfara"]), ("LXXIII", [r"vera?trum album"], [r"el[eé]boro"]),
    ("LXXIV", [r"vinca minor"], [r"vincaper\w*", r"vinca"]), ("LXXV", [r"viscum album"], [r"mu[eé]rdago", r"mistlatos"]),
    ("LXXVI", [r"withania somnifera", r"strychnos hypnotica"], [r"ashwagandha", r"orovale"]),
]
PROHIBIDAS_CIENTIFICO = [p for _, cs, _ in ART_PRIMERO for p in cs]
PROHIBIDAS_COMUN = [r"\b" + p + r"\b" for _, _, cs in ART_PRIMERO for p in cs]
if "--contar-primero" in sys.argv:
    print(f"Art. PRIMERO: {len(ART_PRIMERO)} fracciones, {len(PROHIBIDAS_CIENTIFICO)} nombres científicos, {len(PROHIBIDAS_COMUN)} nombres comunes")
    sys.exit(0 if len(ART_PRIMERO) == 76 else 1)


def prohibida_primero(e: dict) -> str | None:
    """Fracción del Art. PRIMERO que nombra la entrada (por nombre científico o común), o None."""
    cientifico = (e.get("nombre_cientifico") or "").lower()
    nombre = (e.get("nombre") or "").lower() + " " + (e.get("id") or "").replace("_", " ").lower()
    for frac, cs, comunes in ART_PRIMERO:
        if any(re.search(p, cientifico) for p in cs) or any(re.search(r"\b" + p + r"\b", nombre) for p in comunes):
            return frac
    return None

# Art. SEGUNDO: llevan "ATENCION: NO CONSUMIRSE DURANTE EL EMBARAZO"
ART_SEGUNDO = [r"ruta graveolens", r"salvia officinalis", r"petroselinum", r"arctostaphylos", r"caulophyllum", r"cimicifuga", r"hydrastis", r"lippia dulcis", r"montanoa tomentosa"]
# Lenguaje de pantalla (corpus_esquema.md, regla 7)
PROHIBIDO_PANTALLA = [r"\bnutriment\w*", r"anticoagulante\w*"]
TRADICIONAL = re.compile(r"tradici\w*", re.I)

def corpus_plantas_ok(texto: str) -> str:
    """En plantas se permite 'aliviar molestias leves' y 'resfriado' si la frase atribuye el uso a la tradición."""
    t = limpiar(texto)
    if TRADICIONAL.search(t):
        t = re.sub(r"\balivia\w*", " ", t)
        t = re.sub(r"\bresfriad\w*", " ", t)
    return t

def tipo_ok(v, clase):
    if clase == "numero":
        return isinstance(v, (int, float)) and not isinstance(v, bool)
    return isinstance(v, clase)

# Uso de prueba: python tools/lint_contenido.py --corpus tests/fixtures/corpus_min.js
RUTA_CORPUS = pathlib.Path(sys.argv[sys.argv.index("--corpus") + 1]) if "--corpus" in sys.argv else DATA / "corpus.js"
if RUTA_CORPUS.exists():
    corpus, _ = cargar("corpus", RUTA_CORPUS)
    temas = corpus.get("temas") or []
    entradas = corpus.get("entradas") or []
    ids_temas = [t.get("id") for t in temas]
    if not temas or not entradas:
        err("[corpus] faltan `temas` o `entradas`")
    for falta in sorted(TEMAS_MINIMOS - set(ids_temas)):
        err(f"[corpus] falta el tema mínimo `{falta}`")
    dibujos = [t.get("dibujo") for t in temas]
    for t in temas:
        for campo in ("id", "nombre", "dibujo"):
            if not t.get(campo):
                err(f"[corpus] tema {t.get('id')}: falta `{campo}`")
    repetidos = sorted({d for d in dibujos if d and dibujos.count(d) > 1})
    if repetidos:
        err(f"[corpus] temas con el mismo dibujo: {repetidos}")
    # Fase 2: grupos por zona del cuerpo y campos de sección
    grupos_corpus = corpus.get("grupos") or []
    ids_grupos = {g.get("id") for g in grupos_corpus}
    for g in grupos_corpus:
        for campo in ("id", "nombre", "dibujo"):
            if not g.get(campo):
                err(f"[corpus] grupo {g.get('id')}: falta `{campo}`")
    for t in temas:
        donde_t = f"[corpus] tema {t.get('id')}"
        if "clase" in t and t["clase"] not in CLASES_TEMA:
            err(f"{donde_t}: clase desconocida {t['clase']!r}")
        if t.get("grupo") is not None and t["grupo"] not in ids_grupos:
            err(f"{donde_t}: grupo desconocido {t['grupo']!r}")
        for campo, validos in (("tipos_permitidos", TIPOS), ("ocultar_grupos", GRUPOS_EDAD), ("sugerir_si", RASGOS), ("ocultar_si", RASGOS)):
            if campo in t:
                if not isinstance(t[campo], list) or not t[campo]:
                    err(f"{donde_t}: `{campo}` debe ser una lista no vacía")
                for v in t.get(campo) or []:
                    if v not in validos:
                        err(f"{donde_t}: {campo} con valor desconocido {v!r}")
        if t.get("sugerir_si") and not tipo_ok(t.get("prioridad"), "numero"):
            err(f"{donde_t}: `sugerir_si` necesita `prioridad` (número)")
        if "cuando_ir" in t:
            ci = t["cuando_ir"] or {}
            texto = ci.get("texto") or ""
            if not texto:
                err(f"{donde_t}: cuando_ir sin `texto`")
            if not ci.get("fuentes") or any(not (f or {}).get("url", "").startswith("https://") for f in ci.get("fuentes") or []):
                err(f"{donde_t}: cuando_ir necesita fuentes con url https")
            hits = buscar(PROHIBIDO_PRODUCTO + PROHIBIDO_GENERAL, limpiar(texto)) + buscar(PROHIBIDO_PANTALLA, texto.lower())
            if hits:
                err(f"{donde_t}.cuando_ir: declaración o palabra prohibida {hits} en: «{texto[:90]}»")
    ids = [e.get("id") for e in entradas]
    for d in sorted({i for i in ids if ids.count(i) > 1}):
        err(f"[corpus] id repetido: {d}")
    por_id = {e.get("id"): e for e in entradas}
    for e in entradas:
        eid = e.get("id") or "(sin id)"
        tipo = e.get("tipo")
        donde = f"[corpus] {eid}"
        sin_cambio = e.get("sin_cambio") is True
        for campo in ("id", "tipo", "nombre", "temas", "para", "como", "ayuda", "evidencia", "excluir", "alternativas", "si_no_hay", "fuentes", "donde", "costo"):
            if campo == "alternativas" and sin_cambio:
                continue  # sin_cambio: su lista va vacía (se revisa abajo)
            if e.get(campo) in (None, "", []):
                err(f"{donde}: falta `{campo}`")
        if tipo not in TIPOS:
            err(f"{donde}: tipo desconocido {tipo!r}")
        if e.get("donde") and e["donde"] not in DONDE:
            err(f"{donde}: `donde` desconocido {e['donde']!r} (vale: {', '.join(sorted(DONDE))})")
        for t in e.get("temas") or []:
            if t not in ids_temas:
                err(f"{donde}: tema desconocido {t!r}")
        if e.get("ayuda") not in (1, 2, 3):
            err(f"{donde}: `ayuda` debe ser 1, 2 o 3")
        ex = e.get("excluir") or {}
        for campo, clase in (("embarazo", bool), ("lactancia", bool), ("edad_minima", "numero"), ("medicinas", list), ("condiciones", list)):
            if not tipo_ok(ex.get(campo), clase):
                err(f"{donde}: excluir.{campo} falta o no es del tipo correcto")
        for m in ex.get("medicinas") or []:
            if m not in CLAVES_MEDICINA:
                err(f"{donde}: clave de medicina desconocida {m!r}")
        for c in ex.get("condiciones") or []:
            if c not in CONDICIONES:
                err(f"{donde}: condición desconocida {c!r}")
        # Campos opcionales de la fase 2 (docs/corpus_esquema.md)
        if "edad_maxima" in ex and not (tipo_ok(ex["edad_maxima"], "numero") and tipo_ok(ex.get("edad_minima"), "numero") and ex["edad_maxima"] > ex["edad_minima"]):
            err(f"{donde}: excluir.edad_maxima debe ser un número mayor que edad_minima")
        if "ayuda_por_tema" in e:
            apt = e["ayuda_por_tema"]
            if not isinstance(apt, dict) or not apt:
                err(f"{donde}: `ayuda_por_tema` debe ser {{tema: 1..3}}")
            for tm, v in (apt.items() if isinstance(apt, dict) else []):
                if tm not in (e.get("temas") or []):
                    err(f"{donde}: ayuda_por_tema.{tm} no es uno de sus temas")
                if v not in (1, 2, 3):
                    err(f"{donde}: ayuda_por_tema.{tm} debe ser 1, 2 o 3")
        for v in e.get("prioriza_si") or []:
            if v not in PRIORIZA:
                err(f"{donde}: prioriza_si con valor desconocido {v!r}")
        if "prioriza_si" in e and not isinstance(e["prioriza_si"], list):
            err(f"{donde}: `prioriza_si` debe ser una lista")
        # Campos opcionales (docs/corpus_esquema.md)
        for campo in ("solo_embarazo", "sin_cambio", "actividad"):
            if campo in e and not isinstance(e[campo], bool):
                err(f"{donde}: `{campo}` debe ser true o false")
        # Ronda de correcciones 2026-11-02 (docs/corpus_esquema.md): avisos_perfil solo con rasgos que el motor conoce
        if "avisos_perfil" in e and not isinstance(e["avisos_perfil"], dict):
            err(f"{donde}: `avisos_perfil` debe ser {{rasgo: texto}}")
        for rasgo, texto in (e.get("avisos_perfil") if isinstance(e.get("avisos_perfil"), dict) else {}).items():
            if rasgo not in RASGOS_PERFIL:
                err(f"{donde}: avisos_perfil con rasgo desconocido {rasgo!r} (vale: {', '.join(sorted(RASGOS_PERFIL))})")
            if not isinstance(texto, str) or not texto.strip():
                err(f"{donde}: avisos_perfil.{rasgo} sin texto")
                continue
            pant = buscar(PROHIBIDO_PANTALLA, texto.lower())
            if pant:
                err(f"{donde}.avisos_perfil.{rasgo}: palabra difícil o prohibida en pantalla {pant}")
            hits = buscar(PROHIBIDO_PRODUCTO + PROHIBIDO_GENERAL, limpiar(texto))
            if hits:
                err(f"{donde}.avisos_perfil.{rasgo}: declaración prohibida {hits} en: «{texto[:90]}»")
        for clave, texto in (e.get("avisos_medicina") or {}).items():
            if clave not in CLAVES_MEDICINA:
                err(f"{donde}: avisos_medicina con clave desconocida {clave!r}")
            pant = buscar(PROHIBIDO_PANTALLA, str(texto).lower())
            if pant:
                err(f"{donde}.avisos_medicina.{clave}: palabra difícil o prohibida en pantalla {pant}")
        # Alternativas: existen, no es ella misma, al menos 2
        alts = e.get("alternativas") or []
        if sin_cambio and alts:
            err(f"{donde}: sin_cambio = true va con `alternativas` vacía (tiene {len(alts)})")
        elif not sin_cambio and len(alts) < 2:
            err(f"{donde}: necesita al menos 2 alternativas (tiene {len(alts)})")
        for a in alts:
            if a == eid:
                err(f"{donde}: se pone a sí misma como alternativa")
            elif a not in por_id:
                err(f"{donde}: la alternativa {a!r} no existe en el corpus")
        if alts and not any((por_id.get(a) or {}).get("tipo") in ("alimento", "habito") for a in alts):
            err(f"{donde}: ninguna alternativa es un alimento o un hábito")
        # Fuentes con URL
        for i, f in enumerate(e.get("fuentes") or []):
            if not (f or {}).get("url"):
                err(f"{donde}: fuentes[{i}] sin url")
        # Plantas: nombre científico, redacción de uso tradicional, prohibidas del Art. PRIMERO, leyenda del Art. SEGUNDO
        cientifico = (e.get("nombre_cientifico") or "").lower()
        if tipo == "planta":
            if not cientifico:
                err(f"{donde}: planta sin nombre_cientifico")
            if not TRADICIONAL.search(e.get("para") or ""):
                err(f"{donde}: planta sin redacción de uso tradicional en `para` («se usa tradicionalmente…»)")

            if any(re.search(p, cientifico) for p in ART_SEGUNDO) and not (e.get("leyenda_embarazo") and ex.get("embarazo")):
                err(f"{donde}: planta del Art. SEGUNDO: requiere leyenda_embarazo = true y excluir.embarazo = true")
        # Art. PRIMERO (tés, infusiones y suplementos): plantas y suplementos por nombre científico o común; alimentos y
        # hábitos solo por nombre científico (el epazote en los frijoles es comida, no un té).
        frac = prohibida_primero(e) if tipo in ("planta", "suplemento") else next(
            (f for f, cs, _ in ART_PRIMERO if any(re.search(p, cientifico) for p in cs)), None)
        if frac:
            err(f"{donde}: planta prohibida para tés y suplementos (Acuerdo DOF 15-dic-1999, Art. PRIMERO, fracc. {frac})")
        # Vocabulario: declaraciones prohibidas en para/aviso/si_no_hay; enfermedades en para/si_no_hay; lenguaje de pantalla
        for campo in ("para", "aviso", "si_no_hay", "como", "cuanto_ninos", "nombre"):
            texto = e.get(campo) or ""
            if not texto:
                continue
            lt = corpus_plantas_ok(texto) if tipo == "planta" else limpiar(texto)
            hits = buscar(PROHIBIDO_PRODUCTO + PROHIBIDO_GENERAL, lt)
            if hits:
                err(f"{donde}.{campo}: declaración prohibida {hits} en: «{texto[:90]}»")
            if campo in ("para", "si_no_hay"):
                enf = buscar(ENFERMEDADES, lt)
                if enf:
                    err(f"{donde}.{campo}: nombra enfermedad {enf} en: «{texto[:90]}»")
            pant = buscar(PROHIBIDO_PANTALLA, texto.lower()) + ([r"\bUI\b"] if re.search(r"\bUI\b", texto) else [])
            if pant:
                err(f"{donde}.{campo}: palabra difícil o prohibida en pantalla {pant} en: «{texto[:90]}»")

# --- Regla 7: «Cuidado con esto» (data/cuidado.js, criterio 16) ----------------------------------
# Mismas listas de palabras que el corpus. Los ids de `en_su_lugar` y `secciones` se buscan en el corpus real; con
# `--cuidado RUTA` (pruebas) se buscan en el corpus de `--corpus`. Las tarjetas nombran plantas del Art. PRIMERO a
# propósito (son el aviso); lo que no puede ser del Art. PRIMERO es la alternativa de «en su lugar».
CAMPOS_CUIDADO = {"id": str, "nombre": str, "que_es": str, "por_que_cuidado": str, "en_su_lugar": list,
                  "texto_en_su_lugar": str, "secciones": list, "perfiles": list, "fuentes": list}
TEXTOS_CUIDADO = ("nombre", "que_es", "por_que_cuidado", "texto_en_su_lugar", "urgente_si")
QUITADAS_CUIDADO = {"arnica_tomada": "decisión de diseño 2026-11-02: la árnica que se toma en México es otra planta"}
OFICIALES_CUIDADO = ("gob.mx", "cdc.gov", "who.int", "inchem.org", "nih.gov", "europa.eu", "texas.gov", "iowa.gov")
RUTA_CUIDADO = pathlib.Path(sys.argv[sys.argv.index("--cuidado") + 1]) if "--cuidado" in sys.argv else DATA / "cuidado.js"
n_cuidado = 0
if RUTA_CUIDADO.exists():
    cuidado, _ = cargar("cuidado", RUTA_CUIDADO)
    if "--cuidado" in sys.argv and RUTA_CORPUS.exists():
        corpus_c = corpus
    else:
        corpus_c, _ = cargar("corpus", DATA / "corpus.js")
    ent_c = {e.get("id"): e for e in corpus_c.get("entradas") or []}
    temas_c = {t.get("id") for t in corpus_c.get("temas") or []}
    tarjetas = cuidado.get("tarjetas") or []
    n_cuidado = len(tarjetas)
    if not cuidado.get("version") or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(cuidado.get("fecha", ""))):
        err("[cuidado] faltan `version` o `fecha` (AAAA-MM-DD)")
    if not tarjetas:
        err("[cuidado] sin tarjetas")
    vistos = set()
    for i, c in enumerate(tarjetas):
        cid = c.get("id") or f"(tarjeta {i})"
        donde = f"[cuidado] {cid}"
        for campo, tipo in CAMPOS_CUIDADO.items():
            if not isinstance(c.get(campo), tipo):
                err(f"{donde}: falta `{campo}` o no es {tipo.__name__}")
        if cid in vistos:
            err(f"{donde}: id repetido")
        vistos.add(cid)
        if cid in QUITADAS_CUIDADO:
            err(f"{donde}: tarjeta quitada ({QUITADAS_CUIDADO[cid]})")
        for s in c.get("secciones") or []:
            if s not in temas_c:
                err(f"{donde}: la sección {s!r} no existe en el corpus")
        for p in c.get("perfiles") or []:
            if p not in RASGOS_PERFIL:
                err(f"{donde}: perfil desconocido {p!r}")
        if not c.get("en_su_lugar"):
            err(f"{donde}: `en_su_lugar` vacío")
        for a in c.get("en_su_lugar") or []:
            e = ent_c.get(a)
            if not e:
                err(f"{donde}: en_su_lugar {a!r} no existe en el corpus")
                continue
            cient = (e.get("nombre_cientifico") or "").lower()
            frac = prohibida_primero(e) or next((f for f, cs, _ in ART_PRIMERO if any(re.search(p, cient) for p in cs)), None)
            if frac:
                err(f"{donde}: en_su_lugar {a!r} es una planta del Art. PRIMERO (fracc. {frac}): no se puede recomendar")
        fuentes = c.get("fuentes") or []
        if not fuentes:
            err(f"{donde}: sin fuentes")
        for j, f in enumerate(fuentes):
            url = (f or {}).get("url") or ""
            if not (f or {}).get("nombre"):
                err(f"{donde}: fuentes[{j}] sin nombre")
            if not url.startswith("https://"):
                err(f"{donde}: fuentes[{j}] sin url https ({url[:60]})")
        if fuentes and not any(re.match(r"https://([^/]*\.)?(" + "|".join(re.escape(o) for o in OFICIALES_CUIDADO) + r")(/|$)", (f or {}).get("url") or "") for f in fuentes):
            err(f"{donde}: ninguna fuente es de un dominio oficial")
        for campo in TEXTOS_CUIDADO:
            texto = c.get(campo) or ""
            if not texto:
                continue
            lt = limpiar(texto)
            hits = buscar(PROHIBIDO_PRODUCTO + PROHIBIDO_GENERAL + ENFERMEDADES, lt)
            if hits:
                err(f"{donde}.{campo}: palabra prohibida {hits} en: «{texto[:90]}»")
            pant = buscar(PROHIBIDO_PANTALLA, texto.lower()) + ([r"\bUI\b"] if re.search(r"\bUI\b", texto) else [])
            if pant:
                err(f"{donde}.{campo}: palabra difícil o prohibida en pantalla {pant} en: «{texto[:90]}»")
    for ruta, t in textos_de(cuidado.get("textos") or {}, "textos"):
        if buscar(PROHIBIDO_PRODUCTO + PROHIBIDO_GENERAL, limpiar(t)):
            err(f"[cuidado] {ruta}: palabra prohibida en «{t}»")

# --- Regla 8: «¿A dónde voy?» (data/lugares.js, criterio 17) -------------------------------------
# Solo líneas nacionales verificadas, con fuente https; el 079 siempre «079, opción 1»; nada de `no_mostrar` en las
# líneas visibles; la plantilla de la unidad sin marcadores («[nombre]») y con teléfonos vacíos o de 10 dígitos válidos.
MARCADOR = re.compile(r"[\[\]{}<>]|^[\s\-—–_.?¿!0]*$|^(x+|n/?a|s/?n|tbd|pendiente|por (definir|confirmar)|sin (dato|datos|tel[eé]fono|n[uú]mero)|ninguno|no s[eé]|no hay)$", re.I)
MARCADORES_LLANOS = {"na", "sn", "nd", "tbd", "pendiente", "pordefinir", "porconfirmar", "sindato", "sindatos", "sintelefono", "sinnumero",
                     "sinhorario", "sinnombre", "noaplica", "ninguno", "ninguna", "nose", "nohay", "desconocido"}  # igual que js/lugares.js
RUTA_LUGARES = pathlib.Path(sys.argv[sys.argv.index("--lugares") + 1]) if "--lugares" in sys.argv else DATA / "lugares.js"
n_lugares = 0
if RUTA_LUGARES.exists():
    lugares, _ = cargar("lugares", RUTA_LUGARES)
    nac = lugares.get("nacionales") or []
    n_lugares = len(nac)
    ocultos = {re.sub(r"\D", "", x.get("numero", "")) for x in lugares.get("no_mostrar") or []}
    if not nac:
        err("[lugares] sin líneas nacionales")
    for i, l in enumerate(nac):
        donde = f"[lugares] nacionales[{i}] ({l.get('numero')})"
        for campo in ("id", "nombre", "numero", "voz", "nota"):
            if not isinstance(l.get(campo), str) or not l.get(campo).strip():
                err(f"{donde}: falta `{campo}`")
        url = (l.get("fuente") or {}).get("url") or ""
        if not url.startswith("https://"):
            err(f"{donde}: fuente sin url https")
        num = re.sub(r"\D", "", l.get("numero") or "")
        if num.startswith("079") and "opción 1" not in (l.get("numero") or ""):
            err(f"{donde}: el 079 siempre se escribe «079, opción 1»")
        if num and any(num == o or num.startswith(o) for o in ocultos):
            err(f"{donde}: está en `no_mostrar` (sin verificar): {l.get('numero')}")
        if re.search(r"\d{3,}", l.get("voz") or ""):
            err(f"{donde}: `voz` debe decir los números en grupos, no de corrido")
        if l.get("numero") == "911" and re.search(r"gratis|gratuit", l.get("nota") or "", re.I):
            err(f"{donde}: al 911 no se le pone «gratis» (no verificado)")
        for campo in ("nombre", "nota", "voz"):
            t = l.get(campo) or ""
            hits = buscar(PROHIBIDO_PRODUCTO + PROHIBIDO_GENERAL, limpiar(t))
            if hits:
                err(f"{donde}.{campo}: palabra prohibida {hits} en «{t[:80]}»")
    for k, v in (lugares.get("unidad") or {}).items():
        if k == "urgencias_24h":
            if not isinstance(v, bool):
                err("[lugares] unidad.urgencias_24h debe ser true o false")
            continue
        if not isinstance(v, str):
            err(f"[lugares] unidad.{k} debe ser texto")
            continue
        llano = re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", v).encode("ascii", "ignore").decode().lower())
        if v.strip() and (MARCADOR.search(v.strip()) or not llano or re.fullmatch(r"0+|x+", llano) or llano in MARCADORES_LLANOS):
            err(f"[lugares] unidad.{k}: marcador en vez de dato («{v}»): déjalo vacío")
        if k in ("telefono", "ambulancia") and v.strip():
            d = re.sub(r"\D", "", v)
            if len(d) != 10 or len(set(d)) == 1:
                err(f"[lugares] unidad.{k}: teléfono inválido «{v}» (10 dígitos, no en ceros)")
    for ruta, t in textos_de({"textos": lugares.get("textos") or {}, "etiquetas": lugares.get("etiquetas") or {}}):
        if buscar(PROHIBIDO_PRODUCTO + PROHIBIDO_GENERAL, limpiar(t)):
            err(f"[lugares] {ruta}: palabra prohibida en «{t}»")

# --- Ronda de correcciones, criterio 40: campos para no mostrar a menores lo que es de adultos ---------------------------
if RUTA_CORPUS.exists():
    for e in corpus.get("entradas", []):
        frases = e.get("aviso_no_ninos")
        if frases is None: continue
        if not isinstance(frases, list) or not all(isinstance(f, str) and f.strip() for f in frases):
            err(f"[corpus] {e.get('id')}: `aviso_no_ninos` debe ser una lista de frases"); continue
        for f in frases:
            if f not in str(e.get("aviso") or ""):
                err(f"[corpus] {e.get('id')}: frase de `aviso_no_ninos` que no está tal cual en `aviso`: «{f[:60]}»")
    for tm in corpus.get("temas", []):
        ci = tm.get("cuando_ir") or {}
        if "edad_minima" in ci and not isinstance(ci["edad_minima"], (int, float)):
            err(f"[corpus] tema {tm.get('id')}: `cuando_ir.edad_minima` debe ser un número")
        for f in ci.get("texto_no_ninos") or []:
            if not isinstance(f, str) or f not in str(ci.get("texto") or ""):
                err(f"[corpus] tema {tm.get('id')}: frase de `cuando_ir.texto_no_ninos` que no está en `cuando_ir.texto`: «{str(f)[:60]}»")
if RUTA_CUIDADO.exists():
    for c in (cuidado.get("tarjetas") or []):
        if "edad_minima" in c and not isinstance(c["edad_minima"], (int, float)):
            err(f"[cuidado] {c.get('id')}: `edad_minima` debe ser un número")

# --- Rediseño v0.5 (docs/diseno/sistema.md) ----------------------------------------------------------
# Cada pantalla tiene su voz corta, con largo máximo y sin frases que suenen a juicio de salud.
PANTALLAS_VOZ = ["reposo", "bienvenida", "sobreTi", "medicinas", "alarma", "mediciones", "cuidar", "confirmar", "resultado", "fichas", "resumen", "bebe"]
FRASES_VOZ = [r"\best[aá]s san[oa]\b", r"\btodo est[aá] bien\b", r"\best[aá]s bien\b", r"\bcura\w*", r"\bnormal\b", r"\bsalud perfecta\b"]
voz_corta = textos.get("voz_corta") or {}
for pantalla in PANTALLAS_VOZ:
    v = str(voz_corta.get(pantalla) or "").strip()
    limite = 50 if pantalla == "bienvenida" else 30
    if not v:
        err(f"[textos] voz_corta.{pantalla}: falta la voz corta de la pantalla")
        continue
    n = len(v.split())
    if n > limite:
        err(f"[textos] voz_corta.{pantalla}: {n} palabras (máximo {limite})")
    hits = buscar(FRASES_VOZ, v.lower())
    if hits:
        err(f"[textos] voz_corta.{pantalla}: frase prohibida {hits}")
vb = str(voz_corta.get("bienvenida") or "").lower()
for parte in ("gratis", "no soy", "9 1 1", "nombre", "borra", "azul", "verde"):
    if parte not in vb:
        err(f"[textos] voz_corta.bienvenida: falta «{parte}» (mínimo que no se quita; «gratis» se confirmó el 2026-11-02)")
if "gratis" not in str((textos.get("bienvenida") or {}).get("gratis", "")).lower():
    err("[textos] bienvenida.gratis: la bienvenida debe decir en pantalla que es gratis (criterio 25)")

# Criterio 23: sin emoji en js/ ni en data/textos.js (salvo líneas marcadas «permitido-emoji», p. ej. el filtro de la voz)
EMOJI = re.compile("[🀀-🫿☀-➿⬀-⯿️]")
for arch in sorted((RAIZ / "js").glob("*.js")) + [DATA / "textos.js"]:
    for i, linea in enumerate(arch.read_text(encoding="utf-8").splitlines(), 1):
        if EMOJI.search(linea) and "permitido-emoji" not in linea:
            err(f"[emoji] {arch.relative_to(RAIZ).as_posix()}:{i}: usa un pictograma del sprite (assets/pictos), no emoji")

# Criterio 20: css/app.css y css/print.css solo con tokens (sin colores hex sueltos); css/tokens.css igual al aprobado
for arch in (RAIZ / "css" / "app.css", RAIZ / "css" / "print.css"):
    if arch.exists():
        for i, linea in enumerate(arch.read_text(encoding="utf-8").splitlines(), 1):
            if re.search(r"#[0-9a-fA-F]{3,8}\b", linea):
                err(f"[css] {arch.name}:{i}: color hex suelto; usa un token de css/tokens.css")
tok_app, tok_doc = RAIZ / "css" / "tokens.css", RAIZ / "docs" / "diseno" / "tokens.css"
if tok_app.exists() and tok_doc.exists():
    decl = lambda txt: [l.strip() for l in txt.splitlines() if re.match(r"\s*--[\w-]+\s*:", l)]
    app_txt = tok_app.read_text(encoding="utf-8")
    for d in decl(tok_doc.read_text(encoding="utf-8")):
        if d not in app_txt:
            err(f"[css] css/tokens.css no trae igual la línea de docs/diseno/tokens.css: «{d[:80]}»")
# Pictogramas: data/pictos.js y el sprite de index.html al día con assets/pictos (tools/generar_pictos.py)
import subprocess as _sp
_r = _sp.run([sys.executable, str(RAIZ / "tools" / "generar_pictos.py"), "--revisar"], capture_output=True, text=True, encoding="utf-8")
if _r.returncode:
    err("[pictos] " + (_r.stdout or _r.stderr).strip())
# Criterio 77: los SVG pasan la lista permitida (sin scripts ni enlaces) y solo usan la paleta «A · Bordado»
_v = _sp.run([sys.executable, str(RAIZ / "docs" / "diseno" / "herramientas" / "validar_pictos.py")], capture_output=True, text=True, encoding="utf-8")
if _v.returncode:
    err("[pictos] " + " | ".join(l for l in (_v.stdout or _v.stderr).splitlines() if l.startswith("FALLA"))[:600])

# Criterio 78: lo que ve la persona o el operador no remite a documentos internos que no existen para quien instala MediBot.
# Se revisan las cadenas (no los comentarios) de data/*.js y de js/pantallas.js.
INTERNO = re.compile(r"docs/investigacion|dictamen|§B\.", re.I)
def cadenas_js(txt: str):
    """(línea, texto) de cada cadena "…", '…' o `…` de un archivo JS, sin contar comentarios // ni /* */."""
    i, n, linea = 0, len(txt), 1
    while i < n:
        c = txt[i]
        if c == "\n": linea += 1; i += 1
        elif txt.startswith("//", i): j = txt.find("\n", i); i = n if j < 0 else j
        elif txt.startswith("/*", i): j = txt.find("*/", i + 2); j = n if j < 0 else j + 2; linea += txt.count("\n", i, j); i = j
        elif c in "\"'`":
            j, ini = i + 1, linea
            while j < n and txt[j] != c:
                if txt[j] == "\\": j += 1
                elif txt[j] == "\n": linea += 1
                j += 1
            yield ini, txt[i + 1:j]; i = j + 1
        elif c == "/" and (re.match(r"[=(,:;!&|?{}\[\n]\s*$", txt[max(0, i - 20):i].rstrip(" ")[-1:] or "\n")
                           or re.search(r"\b(return|typeof|case|in|of|void|delete|throw|yield|await|instanceof)\s*$", txt[max(0, i - 20):i])):
            j = i + 1   # expresión regular literal: se salta hasta la «/» que la cierra
            while j < n and txt[j] not in "/\n":
                if txt[j] == "\\": j += 1
                elif txt[j] == "[":
                    while j < n and txt[j] != "]": j += 2 if txt[j] == "\\" else 1
                j += 1
            i = j + 1
        else: i += 1
for arch in sorted(DATA.glob("*.js")) + [RAIZ / "js" / "pantallas.js"]:
    for ln, s in cadenas_js(arch.read_text(encoding="utf-8")):
        m = INTERNO.search(s)
        if m: err(f"[interno] {arch.relative_to(RAIZ).as_posix()}:{ln}: el texto remite a un documento interno («{m.group(0)}»): «{s[:90]}»")

# --- Resultado ---------------------------------------------------------------------------------
if errores:
    print(f"LINT: {len(errores)} problema(s)\n")
    print("\n".join(" - " + e for e in errores))
    sys.exit(1)
print("LINT: contenido OK (sin vocabulario prohibido, fuentes completas, leyendas en mayúsculas, orden correcto"
      + (f"; corpus {RUTA_CORPUS.name}: {len(corpus['entradas'])} entradas, {len(corpus['temas'])} temas" if RUTA_CORPUS.exists() else "; sin data/corpus.js: se usa data/fichas.js")
      + (f"; cuidado: {n_cuidado} tarjetas" if RUTA_CUIDADO.exists() else "") + (f"; lugares: {n_lugares} líneas nacionales" if RUTA_LUGARES.exists() else "") + ")")
