# -*- coding: utf-8 -*-
"""Revisa los pictogramas de assets/pictos/ (solo biblioteca estándar).

Comprueba en cada .svg: XML válido, solo elementos de una lista permitida (en el espacio de nombres SVG: nada de
<script>, <style>, <foreignObject>, <set>, <animate>…), solo atributos permitidos (sin on*, sin style, sin url() externos),
<title> no vacío, viewBox "0 0 64 64", menos de 6 KB y, estilo «A · Bordado» (criterio 77): solo colores de la paleta
(grana, añil, ocre, verde, piel, crema, azul agua y contorno), el contorno variable var(--picto-contorno, #2B1D16),
currentColor o none.
Además: que sprite.svg tenga un <symbol id> por archivo y que indice.json los nombre a todos.
Uso: python docs/diseno/herramientas/validar_pictos.py   (sale con código 1 si algo falla)
"""
import json, pathlib, re, sys
import xml.etree.ElementTree as ET

RAIZ = pathlib.Path(__file__).resolve().parents[3]
DIR = RAIZ / "assets" / "pictos"
NS = "{http://www.w3.org/2000/svg}"
TINTA = {"currentcolor", "none", "var(--picto-contorno, #2b1d16)", ""}
PALETA = {"#B3261E", "#2F4F8F", "#D49A2A", "#3E7D4F", "#8A5A3C", "#FFF8EE", "#7FA7D9", "#2B1D16"}
ELEMENTOS = {"svg", "symbol", "title", "g", "path", "circle", "rect", "ellipse", "line", "polyline", "polygon", "use", "defs"}
ATRIBUTOS = {"xmlns", "viewBox", "role", "id", "width", "height", "style", "aria-hidden", "focusable", "fill", "stroke", "stroke-width",
             "stroke-linecap", "stroke-linejoin", "stroke-dasharray", "d", "cx", "cy", "r", "rx", "ry", "x", "y", "x1", "y1", "x2", "y2",
             "points", "transform", "href", "{http://www.w3.org/1999/xlink}href"}
COLOR = re.compile(r"^(#[0-9a-fA-F]{6}|currentColor|none|var\(--picto-contorno, #2B1D16\))$")


def revisar_elementos(raiz: ET.Element, es_sprite: bool = False) -> tuple[list[str], set[str]]:
    """Lista permitida de elementos y atributos; devuelve errores y pigmentos encontrados."""
    errores: list[str] = []
    colores: set[str] = set()
    for el in raiz.iter():
        if not el.tag.startswith(NS):
            errores.append(f"elemento fuera del espacio SVG {el.tag}")
            continue
        nombre = el.tag[len(NS):]
        if nombre not in ELEMENTOS:
            errores.append(f"elemento no permitido <{nombre}>")
        for k, v in el.attrib.items():
            if k not in ATRIBUTOS:
                errores.append(f"atributo no permitido {k} en <{nombre}>")
            if k == "style" and not (es_sprite and nombre == "svg" and v.replace(" ", "") == "position:absolute"):
                errores.append(f"atributo style en <{nombre}>")
            if k.endswith("href") and not v.startswith("#"):
                errores.append(f"enlace externo {v}")
            if k in ("fill", "stroke"):
                if not COLOR.match(v.strip()):
                    errores.append(f"{k}={v!r} no es un color simple")
                elif v.strip().lower() not in TINTA:
                    colores.add(v.strip().upper())
                    if v.strip().upper() not in PALETA:
                        errores.append(f"{k}={v} no es de la paleta «A · Bordado»")
    return errores, colores


def revisar(f: pathlib.Path) -> tuple[list[str], int]:
    errores = []
    datos = f.read_bytes()
    if len(datos) >= 6144:
        errores.append(f"pesa {len(datos)} B (máximo 6 KB)")
    if b"<!DOCTYPE" in datos or b"<!ENTITY" in datos:
        return ["tiene DOCTYPE o ENTITY (no se permite: evita XXE)"], 0
    try:
        raiz = ET.fromstring(datos)
    except ET.ParseError as e:
        return [f"XML inválido: {e}"], 0
    if raiz.tag != NS + "svg":
        errores.append("la raíz no es <svg>")
    if raiz.get("viewBox") != "0 0 64 64":
        errores.append(f"viewBox {raiz.get('viewBox')!r}")
    t = raiz.find(NS + "title")
    if t is None or not (t.text or "").strip():
        errores.append("sin <title>")
    err, colores = revisar_elementos(raiz)
    errores += err
    return errores, len(colores)


def main() -> int:
    archivos = sorted(p for p in DIR.glob("p-*.svg"))
    fallas = 0
    for f in archivos:
        errores, n = revisar(f)
        if errores:
            fallas += 1
            print("FALLA", f.name, "·", "; ".join(errores))
    sprite = (DIR / "sprite.svg").read_text(encoding="utf-8")
    ids_sprite = set(re.findall(r'<symbol id="([^"]+)"', sprite))
    ids_arch = {f.stem for f in archivos}
    indice = json.loads((DIR / "indice.json").read_text(encoding="utf-8"))
    ids_ind = set(indice["pictos"])
    for nombre, a, b in (("sprite", ids_arch, ids_sprite), ("indice.json", ids_arch, ids_ind)):
        if a != b:
            fallas += 1
            print("FALLA", nombre, "no coincide con los archivos:", sorted(a ^ b))
    if "<!DOCTYPE" in sprite or "<!ENTITY" in sprite:
        fallas += 1; print("FALLA sprite.svg tiene DOCTYPE o ENTITY")
    try:
        err, _ = revisar_elementos(ET.fromstring(sprite), es_sprite=True)
        if err:
            fallas += 1; print("FALLA sprite.svg ·", "; ".join(sorted(set(err))))
    except ET.ParseError as e:
        fallas += 1; print("FALLA sprite.svg no es XML válido:", e)
    pesos = [f.stat().st_size for f in archivos]
    print(f"{len(archivos)} pictogramas revisados · {fallas} con fallas · peso máx. {max(pesos)} B · sprite {len(sprite.encode())} B")
    return 1 if fallas else 0


if __name__ == "__main__":
    sys.exit(main())
