#!/usr/bin/env python3
"""Lint de contenido de MediBot.

Revisa data/*.js y falla (código de salida 1) si:
  1. Aparece vocabulario prohibido (referido a MediBot o a un suplemento), salvo en frases negadas de la lista blanca
     ("no es un aparato de diagnóstico", "no diagnostica", "no sustituye la consulta"...).
  2. Una ficha de alimento/suplemento nombra una enfermedad junto al producto (art. 174 RCSPyS, adoptado voluntariamente).
  3. Falta `fuente.url`, `nivel_evidencia` o `advertencia` en un suplemento; falta `fuente.url` en alimentos, preguntas o rangos.
  4. Las leyendas COFEPRIS no están en MAYÚSCULAS.
  5. En una categoría los suplementos aparecen antes que los alimentos.

Uso:  python tools/lint_contenido.py        (desde la carpeta MediBot)
"""
from __future__ import annotations
import json, re, sys, pathlib
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

def cargar(nombre: str):
    txt = (DATA / f"{nombre}.js").read_text(encoding="utf-8")
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

# --- Resultado ---------------------------------------------------------------------------------
if errores:
    print(f"LINT: {len(errores)} problema(s)\n")
    print("\n".join(" - " + e for e in errores))
    sys.exit(1)
print("LINT: contenido OK (sin vocabulario prohibido, fuentes completas, leyendas en mayúsculas, orden correcto)")
