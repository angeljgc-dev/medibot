#!/usr/bin/env python3
"""Genera data/clues_oaxaca.js: extracto del catálogo CLUES (DGIS) con las unidades PÚBLICAS de atención de Oaxaca.

Lo usa solo la pantalla «¿A dónde voy?» del panel de operador (se carga al abrirla; la persona usuaria nunca lo carga).
Guía de llenado del panel: docs/guia_lugares.md.

Uso (desde la carpeta MediBot):
  python -P tools/generar_clues_oaxaca.py <ESTABLECIMIENTO_SALUD_AAAAMM.xlsx> [--inegi mgem20.json] [--salida data/clues_oaxaca.js]

Fuentes:
  - CLUES: http://www.dgis.salud.gob.mx/contenidos/intercambio/clues_gobmx.html (abre por http; el enlace de descarga
    lleva a https://gobi.salud.gob.mx/gobi/catalogos/catalogosmaestros/ESTABLECIMIENTO_SALUD_202609.xlsx).
  - Municipios (570, con acentos y clave INEGI): servicio del Marco Geoestadístico de INEGI,
    https://gaia.inegi.org.mx/wscatgeo/v2/mgem/20 . Si no se da --inegi, se descarga.
Requiere openpyxl.

Qué entra:
  - Entidad 20 (Oaxaca), estatus EN OPERACION, tipo «DE CONSULTA…» o «DE HOSP…», institución distinta de SMP (privados).
  - Por unidad: clues, nombre, institución, tipología (índice), municipio (clave INEGI), localidad, teléfono SOLO si es
    propio (10 dígitos, no todos iguales y repetido en 3 unidades o menos; si no, vacío), lat, lon y horario
    («DLMXJVS HH:MM-HH:MM», de la hoja HORARIOS).
"""
from __future__ import annotations
import argparse, collections, datetime, hashlib, json, pathlib, re, sys, urllib.request

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

URL_INEGI = "https://gaia.inegi.org.mx/wscatgeo/v2/mgem/20"
LICENCIA = ("DGIS: «Las variables de las CLUES están abiertas a todo el sector salud, no existen restricciones para su uso» "
            "(página del catálogo, consultada el 2026-11-02). No se confirmó la licencia «Libre Uso MX» en datos.gob.mx "
            "(devolvió 403): se cita la fuente y la fecha.")


def s(v) -> str:
    return "" if v is None else str(v).strip()


def municipios_inegi(ruta: pathlib.Path | None) -> dict[int, str]:
    if ruta:
        datos = json.loads(ruta.read_text(encoding="utf-8"))
    else:
        with urllib.request.urlopen(URL_INEGI, timeout=60) as r:
            datos = json.loads(r.read().decode("utf-8"))
    out = {int(m["cve_mun"]): m["nomgeo"] for m in datos["datos"] if m.get("cve_ent") == "20"}
    if len(out) != 570:
        raise SystemExit(f"INEGI devolvió {len(out)} municipios de Oaxaca (se esperaban 570)")
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("xlsx", type=pathlib.Path)
    ap.add_argument("--inegi", type=pathlib.Path)
    ap.add_argument("--salida", type=pathlib.Path, default=pathlib.Path(__file__).resolve().parent.parent / "data" / "clues_oaxaca.js")
    a = ap.parse_args()
    import openpyxl  # solo para generar; la app no lo necesita

    wb = openpyxl.load_workbook(a.xlsx, read_only=True, data_only=True)
    hoja_h = next(n for n in wb.sheetnames if n.startswith("HORARIOS"))
    hoja_c = next(n for n in wb.sheetnames if n.startswith("CLUES"))

    it = wb[hoja_h].iter_rows(values_only=True); next(it)
    hor: dict[str, list[str]] = {}
    for f in it:
        bl = []
        for b in range(1, len(f), 9):
            blk = [s(x) for x in f[b:b + 9]]
            if any(blk):
                dias = "".join("DLMXJVS"[i] for i in range(7) if blk[i] == "SI")
                bl.append(f"{dias} {blk[7][:5]}-{blk[8][:5]}")
        if bl:
            hor[s(f[0])] = bl

    it = wb[hoja_c].iter_rows(values_only=True)
    enc = [s(c) for c in next(it)]
    aten = []
    for f in it:
        d = dict(zip(enc, (s(x) for x in f)))
        if d["CLAVE DE LA ENTIDAD"] == "20" and d["ESTATUS DE OPERACION"] == "EN OPERACION" and d["NOMBRE TIPO ESTABLECIMIENTO"].startswith(("DE CONSULTA", "DE HOSP")):
            aten.append(d)
    tel = lambda d: re.sub(r"\D", "", d["TELEFONO 1 DEL ESTABLECIMIENTO"])
    frec = collections.Counter(tel(d) for d in aten)

    def tel_propio(d):
        t = tel(d)
        return len(t) == 10 and len(set(t)) > 1 and frec[t] <= 3

    pub = [d for d in aten if d["CLAVE DE LA INSTITUCION"] != "SMP"]
    tip = sorted({d["NOMBRE DE TIPOLOGIA"] for d in pub})
    ti = {t: i for i, t in enumerate(tip)}
    uni = [[d["CLUES"], d["NOMBRE DE LA UNIDAD"], d["CLAVE DE LA INSTITUCION"], ti[d["NOMBRE DE TIPOLOGIA"]],
            int(d["CLAVE DEL MUNICIPIO"]), d["LOCALIDAD"],
            tel(d) if tel_propio(d) else "",
            round(float(d["LATITUD"]), 5) if d["LATITUD"] else None,
            round(float(d["LONGITUD"]), 5) if d["LONGITUD"] else None,
            hor.get(d["CLUES"], [])] for d in pub]
    munis = municipios_inegi(a.inegi)
    faltan = sorted({u[4] for u in uni} - set(munis))
    if faltan:
        raise SystemExit(f"Claves de municipio del CLUES que no están en INEGI: {faltan}")
    sha = hashlib.sha256(a.xlsx.read_bytes()).hexdigest()
    datos = {
        "fuente": f"DGIS, Catálogo CLUES, {a.xlsx.name} (actualización septiembre 2026)",
        "fuente_municipios": "INEGI, Marco Geoestadístico (Censo de Población y Vivienda 2020), " + URL_INEGI,
        "licencia": LICENCIA,
        "generado": datetime.date.today().isoformat(),
        "sha256_xlsx": sha,
        "campos": ["clues", "nombre", "institucion", "tipologia", "municipio", "localidad", "telefono", "lat", "lon", "horario"],
        "tipologias": tip,
        "municipios": {str(k): munis[k] for k in sorted(munis)},
        "unidades": uni,
    }
    cab = ("/* Extracto del catálogo CLUES de Oaxaca para la pantalla «¿A dónde voy?» del operador (no lo carga la consulta).\n"
           f"   Fuente: DGIS, Catálogo de Clave Única de Establecimientos de Salud (CLUES), {a.xlsx.name}, actualización\n"
           "   septiembre de 2026, http://www.dgis.salud.gob.mx/contenidos/intercambio/clues_gobmx.html\n"
           f"   Licencia: {LICENCIA}\n"
           "   Municipios: INEGI, Marco Geoestadístico, " + URL_INEGI + "\n"
           f"   {len(uni)} unidades públicas de consulta externa u hospitalización en operación. Teléfono solo si es propio.\n"
           "   Generado con: python -P tools/generar_clues_oaxaca.py <xlsx> --inegi <json>. No editar a mano. */\n")
    a.salida.write_text(cab + "window.MediBotData = window.MediBotData || {};\nwindow.MediBotData.clues = "
                        + json.dumps(datos, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"{a.salida}: {len(uni)} unidades, {len(munis)} municipios, {round(a.salida.stat().st_size / 1024)} KB, xlsx sha256 {sha}")


if __name__ == "__main__":
    main()
