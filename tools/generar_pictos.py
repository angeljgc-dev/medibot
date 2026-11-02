"""Fuente ÚNICA de los pictogramas de MediBot, estilo «A · Bordado» (criterio 77; docs/diseno/sistema.md §8).

Uso (desde la carpeta MediBot):  PYTHONUTF8=1 python tools/generar_pictos.py [--revisar]

Escribe, desde los dibujos de abajo:
  - assets/pictos/<id>.svg (75), assets/pictos/sprite.svg y assets/pictos/indice.json;
  - el sprite dentro de index.html, entre <!-- sprite:inicio --> y <!-- sprite:fin --> (Electron carga con file:// y Chromium
    no deja usar <use href="archivo.svg#id"> entre archivos con ese origen), y en las páginas de docs/diseno con esas marcas;
  - data/pictos.js (títulos y mapas para la app, sin fetch) y docs/diseno/herramientas/indice_pictos.js (copia del índice para las páginas de diseño).
Con --revisar no escribe nada: sale con código 1 si algún archivo generado no está al día (lo usa el lint).

Estilo (decisión de diseño, 2026-11-02):
  - viewBox 0 0 64 64; formas planas con contorno de 2.5 (detalles 1.2–1.8); uniones y puntas redondas.
  - Paleta única: grana, añil, ocre, verde, piel, crema, azul agua y contorno (abajo). Sin degradados, brillos, sombras,
    opacidad, emoji ni texto (la «z» de dormir es trazo). Puntada (stroke-dasharray) solo donde ayuda.
  - "dibujo": el contorno de las formas que tocan el fondo es var(--picto-contorno, #2B1D16) (token de css/tokens.css:
    oscuro en claro, crema en oscuro); los detalles encima de un relleno usan CONTORNO o CREMA fijos.
  - "glifo" (acciones, semáforo, alerta, hojita): una sola tinta currentColor, para ir blanca sobre un botón de color.
  - Gente con piel morena, rebozo, trenza, sombrero, canas en mayores. Dignidad: diarrea, orina, cólicos y digestión con
    objetos (taza de baño estilizada, vaso, panza vestida con mano), nunca cuerpos expuestos.
"""
import json, pathlib, re, sys

raiz = pathlib.Path(__file__).resolve().parent.parent
DIR = raiz / "assets" / "pictos"
INDEX = raiz / "index.html"
SALIDA = raiz / "data" / "pictos.js"
GUIA_JS = raiz / "docs" / "diseno" / "herramientas" / "indice_pictos.js"
DISENO = [*sorted((raiz / "docs" / "diseno").glob("*.html")), *sorted((raiz / "docs" / "diseno" / "maquetas").glob("*.html"))]

# ---------- Paleta «A · Bordado» (solo dibujos; nunca es color de interfaz) ----------
GRANA = "#B3261E"; ANIL = "#2F4F8F"; OCRE = "#D49A2A"; VERDE = "#3E7D4F"
PIEL = "#8A5A3C"; CREMA = "#FFF8EE"; AGUA = "#7FA7D9"; CONTORNO = "#2B1D16"
PALETA = dict(GRANA=GRANA, ANIL=ANIL, OCRE=OCRE, VERDE=VERDE, PIEL=PIEL, CREMA=CREMA, AGUA=AGUA, CONTORNO=CONTORNO)
VAR = "var(--picto-contorno, #2B1D16)"
ATTR = {"dibujo": f'fill="none" stroke="{VAR}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"',
        "glifo": 'fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"'}
ESTILO = "A · Bordado (2026-11-02): viewBox 0 0 64 64; contorno var(--picto-contorno) de 2.5 en dibujos, currentColor en glifos; paleta grana, añil, ocre, verde, piel, crema, azul agua y contorno"

P = []  # (id, titulo, grupo, uso, modo, cuerpo)


def add(id_, titulo, grupo, uso, modo, cuerpo):
    P.append((id_, titulo, grupo, uso, modo, cuerpo.strip().replace("\n", "")))


# =====================================================================================
# Los 75 dibujos (revisados el 2026-11-02 en hojas de contacto a 112 y 48 px, claro y oscuro)
# =====================================================================================
add('p-adulto', 'Persona adulta', 'persona', '¿Para quién es? → para mí (adulto de 18 a 59 años).', 'dibujo', f"""
<path d="M12 60 q0 -24 20 -24 q20 0 20 24 z" fill="{ANIL}"/>
<path d="M18 51 h28" stroke="{OCRE}" stroke-dasharray="3 3"/>
<path d="M27 37 l5 6 l5 -6" stroke="{CREMA}" stroke-width="1.8"/>
<circle cx="32" cy="24" r="9" fill="{PIEL}"/>
<ellipse cx="32" cy="16" rx="20" ry="4.5" fill="{OCRE}"/>
<path d="M24 15 q8 -14 16 0 z" fill="{OCRE}"/>
<path d="M24.6 13 q7.4 -2.2 14.8 0" stroke="{GRANA}" stroke-width="1.8"/>
""")

add('p-mayor', 'Persona mayor', 'persona', 'Edad de 60 años o más; sección «Persona mayor: caídas y memoria».', 'dibujo', f"""
<path d="M10 56 q0 -22 16 -22 q16 0 16 22 z" fill="{GRANA}"/>
<path d="M14 48 h24" stroke="{OCRE}" stroke-dasharray="3 3"/>
<circle cx="26" cy="19" r="8" fill="{PIEL}"/>
<path d="M18 17 q8 -11 16 0 q-8 -4 -16 0 z" fill="{CREMA}" stroke-width="1.5"/>
<path d="M51 31 v25 M51 31 q-6 0 -6 5" stroke-width="6.5"/>
<path d="M51 31 v25 M51 31 q-6 0 -6 5" stroke="{OCRE}" stroke-width="3.5"/>
""")

add('p-embarazada', 'Embarazada', 'persona', 'Embarazo; sección «Embarazo y dar pecho».', 'dibujo', f"""
<path d="M22 24 q6 -4 12 0 l2 10 q12 4 6 14 l-3 2 l1 9 h-20 l2 -19 z" fill="{ANIL}"/>
<path d="M21 25 l17 8 l-1 5 l-17 -8 z" fill="{GRANA}" stroke="{CONTORNO}" stroke-width="1.5"/>
<circle cx="28" cy="14" r="7" fill="{PIEL}"/>
<path d="M22.25 14 a5.75 5.75 0 0 1 11.5 0 q-5.75 -3.9 -11.5 0 z" fill="{CONTORNO}" stroke="none"/>
<path d="M21.5 13 q-3 8 1 15" stroke-width="6"/>
<path d="M21.5 13 q-3 8 1 15" stroke="{CONTORNO}" stroke-width="3.8"/>
""")

add('p-lactancia', 'Mamá dando pecho', 'persona', 'Lactancia («¿Das pecho?»).', 'dibujo', f"""
<path d="M15 30 q8 -6 16 -1 q6 12 6 31 h-24 q-1 -18 2 -30 z" fill="{ANIL}"/>
<circle cx="24" cy="17" r="7.5" fill="{PIEL}"/>
<path d="M17.75 17 a6.25 6.25 0 0 1 12.5 0 q-6.25 -4.1 -12.5 0 z" fill="{CONTORNO}" stroke="none"/>
<path d="M16.8 16 q-3 8 0 15" stroke-width="6"/>
<path d="M16.8 16 q-3 8 0 15" stroke="{CONTORNO}" stroke-width="3.8"/>
<ellipse cx="42" cy="41" rx="14" ry="8.5" transform="rotate(20 42 41)" fill="{GRANA}"/>
<path d="M41 33.5 q-3 7 -1 16 M48 36 q-3 7 -1 15" stroke="{OCRE}" stroke-width="2.5"/>
<circle cx="32" cy="34" r="6" fill="{PIEL}"/>
<path d="M29.5 34.5 q1.5 1.5 3 0" stroke="{CONTORNO}" stroke-width="1.5"/>
<path d="M22 42 q8 13 28 8" stroke-width="7.5"/>
<path d="M22 42 q8 13 28 8" stroke="{ANIL}" stroke-width="4.5"/>
<circle cx="51" cy="49.5" r="3" fill="{PIEL}"/>
""")

add('p-nino', 'Niño o niña', 'persona', '¿Para quién es? → para un niño o niña; sección «Niñas y niños».', 'dibujo', f"""
<path d="M25 38 l-6 9 M39 38 l6 9" stroke-width="7"/>
<path d="M25 38 l-6 9 M39 38 l6 9" stroke="{OCRE}" stroke-width="4"/>
<path d="M28 50 v8 M36 50 v8" stroke-width="7"/>
<path d="M28 50 v8 M36 50 v8" stroke="{ANIL}" stroke-width="4"/>
<path d="M23 36 q9 -4 18 0 l2 15 h-22 z" fill="{OCRE}"/>
<path d="M24 45 h16" stroke="{GRANA}" stroke-width="2" stroke-dasharray="2.5 2.5"/>
<circle cx="32" cy="20" r="12" fill="{PIEL}"/>
<path d="M21.25 20 a10.75 10.75 0 0 1 21.5 0 q-10.75 -3.6 -21.5 0 z" fill="{CONTORNO}" stroke="none"/>
<path d="M27.5 22 v1 M36.5 22 v1" stroke="{CONTORNO}" stroke-width="2.5"/>
""")

add('p-bebe', 'Bebé', 'persona', 'Edad: menos de 1 año (bebé).', 'dibujo', f"""
<ellipse cx="32" cy="39" rx="15" ry="20" fill="{GRANA}"/>
<path d="M18 35 q14 6 28 0 M18 45 q14 6 28 0" stroke="{OCRE}" stroke-width="3"/>
<circle cx="32" cy="22" r="9" fill="{PIEL}"/>
<path d="M27.5 22 q1.5 1.5 3 0 M33.5 22 q1.5 1.5 3 0" stroke="{CONTORNO}" stroke-width="1.5"/>
""")

add('p-otra-persona', 'Otra persona', 'persona', '¿Para quién es? → para otra persona adulta (no soy yo).', 'dibujo', f"""
<path d="M31 60 q0 -22 14.5 -22 q14.5 0 14.5 22 z" fill="{GRANA}"/>
<path d="M35 52 h22" stroke="{OCRE}" stroke-dasharray="3 3"/>
<circle cx="46" cy="24" r="8" fill="{PIEL}"/>
<path d="M39.25 24 a6.75 6.75 0 0 1 13.5 0 q-6.75 -4.4 -13.5 0 z" fill="{CONTORNO}" stroke="none"/>
<path d="M38.5 22 q-3 9 1 16" stroke-width="6"/>
<path d="M38.5 22 q-3 9 1 16" stroke="{CONTORNO}" stroke-width="3.8"/>
<path d="M4 60 q0 -17 12 -17 q12 0 12 17 z" fill="{ANIL}"/>
<circle cx="16" cy="34" r="6.5" fill="{PIEL}"/>
<path d="M10.75 34 a5.25 5.25 0 0 1 10.5 0 q-5.25 -3.6 -10.5 0 z" fill="{CONTORNO}" stroke="none"/>
<path d="M22 50 l8 -9" stroke-width="7.5"/>
<path d="M22 50 l8 -9" stroke="{ANIL}" stroke-width="4.5"/>
<path d="M30 41 l3.5 -3.5" stroke-width="3.6"/>
<path d="M30 41 l3.5 -3.5" stroke="{PIEL}" stroke-width="1.6"/>
<circle cx="29.5" cy="41.5" r="2.8" fill="{PIEL}"/>
""")

add('p-medir-oximetro', 'Dedo en el oxímetro', 'medicion', 'Pantalla de mediciones: cómo poner el dedo para pulso y oxígeno.', 'dibujo', f"""
<path d="M34 14 h6 l3 -6 l4 12 l3 -6 h8" stroke="{GRANA}"/>
<path d="M28.5 27 h23 a6.5 6.5 0 0 1 6.5 6.5 v0 a6.5 6.5 0 0 1 -6.5 6.5 h-23 a6.5 6.5 0 0 1 -6.5 -6.5 v-0 a6.5 6.5 0 0 1 6.5 -6.5 z" fill="{PIEL}"/>
<path d="M12 22 h14 a6 6 0 0 1 6 6 v11 a6 6 0 0 1 -6 6 h-14 a6 6 0 0 1 -6 -6 v-11 a6 6 0 0 1 6 -6 z" fill="{ANIL}"/>
<path d="M12 26 h11 a2 2 0 0 1 2 2 v5 a2 2 0 0 1 -2 2 h-11 a2 2 0 0 1 -2 -2 v-5 a2 2 0 0 1 2 -2 z" fill="{CREMA}" stroke="{CONTORNO}" stroke-width="1.5"/>
<path d="M11 31 h3 l1.5 -2.5 l2 5 l1.5 -2.5 h4" stroke="{GRANA}" stroke-width="1.5"/>
""")

add('p-medir-termometro', 'Termómetro en la axila', 'medicion', 'Pantalla de mediciones: cómo poner el termómetro bajo el brazo.', 'dibujo', f"""
<path d="M8 29 h0 a4 4 0 0 1 4 4 v16 a4 4 0 0 1 -4 4 h-0 a4 4 0 0 1 -4 -4 v-16 a4 4 0 0 1 4 -4 z" fill="{ANIL}"/>
<circle cx="8" cy="54" r="3.5" fill="{PIEL}"/>
<path d="M13 60 v-27 q0 -7 7 -7 h12 q7 0 7 7 v27 z" fill="{ANIL}"/>
<path d="M17 52 h18" stroke="{OCRE}" stroke-dasharray="3 3"/>
<circle cx="26" cy="14" r="8" fill="{PIEL}"/>
<path d="M19.25 14 a6.75 6.75 0 0 1 13.5 0 q-6.75 -4.4 -13.5 0 z" fill="{CONTORNO}" stroke="none"/>
<path d="M44 29 h0 a4 4 0 0 1 4 4 v16 a4 4 0 0 1 -4 4 h-0 a4 4 0 0 1 -4 -4 v-16 a4 4 0 0 1 4 -4 z" fill="{ANIL}"/>
<circle cx="44" cy="54" r="3.5" fill="{PIEL}"/>
<g transform="rotate(40 40 37)">
<path d="M40 9 h0 a4 4 0 0 1 4 4 v17 a4 4 0 0 1 -4 4 h-0 a4 4 0 0 1 -4 -4 v-17 a4 4 0 0 1 4 -4 z" fill="{CREMA}"/>
<path d="M39 13 h2 a1 1 0 0 1 1 1 v6 a1 1 0 0 1 -1 1 h-2 a1 1 0 0 1 -1 -1 v-6 a1 1 0 0 1 1 -1 z" fill="{OCRE}" stroke="{CONTORNO}" stroke-width="1.2"/>
<path d="M40 31 h0 a2 2 0 0 1 2 2 v5 a2 2 0 0 1 -2 2 h-0 a2 2 0 0 1 -2 -2 v-5 a2 2 0 0 1 2 -2 z" fill="{GRANA}" stroke="{CONTORNO}" stroke-width="1.5"/>
</g>
""")

add('p-medir-bascula', 'Subirse a la báscula', 'medicion', 'Pantalla «Sobre ti» y mediciones: pesarse en la tabla del piso.', 'dibujo', f"""
<path d="M17 10 h30 a9 9 0 0 1 9 9 v28 a9 9 0 0 1 -9 9 h-30 a9 9 0 0 1 -9 -9 v-28 a9 9 0 0 1 9 -9 z" fill="{CREMA}"/>
<path d="M17 26 h30 a5 5 0 0 1 5 5 v16 a5 5 0 0 1 -5 5 h-30 a5 5 0 0 1 -5 -5 v-16 a5 5 0 0 1 5 -5 z" stroke="{GRANA}" stroke-width="1.2" stroke-dasharray="2 2.5"/>
<path d="M26 15 h12 a2 2 0 0 1 2 2 v3 a2 2 0 0 1 -2 2 h-12 a2 2 0 0 1 -2 -2 v-3 a2 2 0 0 1 2 -2 z" fill="{ANIL}" stroke="{CONTORNO}" stroke-width="1.5"/>
<path d="M21 30 q-4 8 0 18 q4 3 7 0 q2 -9 -1 -18 q-3 -3 -6 0 z" fill="{PIEL}" stroke="{CONTORNO}" stroke-width="1.5"/>
<path d="M37 30 q-4 8 0 18 q4 3 7 0 q2 -9 -1 -18 q-3 -3 -6 0 z" fill="{PIEL}" stroke="{CONTORNO}" stroke-width="1.5"/>
""")

add('p-medir-estatura', 'Cinta para la estatura', 'medicion', 'Medir la estatura contra la cinta de la pared.', 'dibujo', f"""
<path d="M44 9 h7 a2 2 0 0 1 2 2 v47 a2 2 0 0 1 -2 2 h-7 a2 2 0 0 1 -2 -2 v-47 a2 2 0 0 1 2 -2 z" fill="{OCRE}"/>
<path d="M42 15 h6 M42 21 h3.5 M42 27 h6 M42 33 h3.5 M42 39 h6 M42 45 h3.5 M42 51 h6 M42 57 h3.5" stroke="{CONTORNO}" stroke-width="1.5"/>
<path d="M21 28 l-3 13 M35 28 l3 13" stroke-width="7"/>
<path d="M21 28 l-3 13 M35 28 l3 13" stroke="{ANIL}" stroke-width="4"/>
<path d="M25 45 v13 M31 45 v13" stroke-width="6.5"/>
<path d="M25 45 v13 M31 45 v13" stroke="{PIEL}" stroke-width="3.5"/>
<path d="M20 26 q8 -5 16 0 l2 20 h-20 z" fill="{ANIL}"/>
<circle cx="28" cy="15" r="6.5" fill="{PIEL}"/>
<path d="M22.75 15 a5.25 5.25 0 0 1 10.5 0 q-5.25 -3.6 -10.5 0 z" fill="{CONTORNO}" stroke="none"/>
<path d="M18 4 h35 a2 2 0 0 1 2 2 v0 a2 2 0 0 1 -2 2 h-35 a2 2 0 0 1 -2 -2 v-0 a2 2 0 0 1 2 -2 z" fill="{GRANA}"/>
""")

add('p-escuchar', 'Escuchar', 'accion', 'Botón azul: escuchar o repetir lo que dice la pantalla.', 'glifo', f"""
<path d="M9 25 h9 l13 -11 v36 l-13 -11 h-9 z" fill="currentColor"/>
<path d="M40 24 q5 8 0 16 M48 16 q10 16 0 32" stroke-width="5.5"/>
""")

add('p-imprimir', 'Imprimir', 'accion', 'Imprimir la hoja para llevar.', 'glifo', f"""
<path d="M19 21 v-12 h26 v12"/>
<path d="M18 45 h-6 q-4 0 -4 -4 v-15 q0 -4 4 -4 h40 q4 0 4 4 v15 q0 4 -4 4 h-6"/>
<path d="M20.5 36 h23 a1.5 1.5 0 0 1 1.5 1.5 v18 a1.5 1.5 0 0 1 -1.5 1.5 h-23 a1.5 1.5 0 0 1 -1.5 -1.5 v-18 a1.5 1.5 0 0 1 1.5 -1.5 z"/>
<path d="M25.5 43 h13 M25.5 50 h8" stroke-width="4.5"/>
<circle cx="47" cy="29" r="2.5" fill="currentColor" stroke="none"/>
""")

add('p-siguiente', 'Siguiente', 'accion', 'Botón verde: seguir, siguiente.', 'glifo', f"""
<path d="M13 32 h38 M37 18 l14 14 l-14 14" stroke-width="7"/>
""")

add('p-anterior', 'Anterior', 'accion', 'Regresar a la pantalla anterior (rojo largo).', 'glifo', f"""
<path d="M51 32 h-38 M27 18 l-14 14 l14 14" stroke-width="7"/>
""")

add('p-si', 'Sí', 'accion', 'Botón verde: sí. También es la forma del nivel verde.', 'glifo', f"""
<path d="M12 33 l13 13 l27 -27" stroke-width="7"/>
""")

add('p-no', 'No', 'accion', 'Botón rojo: no.', 'glifo', f"""
<path d="M17 17 l30 30 M47 17 l-30 30" stroke-width="7"/>
""")

add('p-terminar', 'Terminar', 'accion', 'Terminar la consulta (abre el diálogo «¿Quieres seguir?»).', 'glifo', f"""
<path d="M30 9 h-19 v46 h19"/>
<path d="M11 9 l14 5 v45 l-14 -4 z" fill="currentColor"/>
<path d="M34 32 h21 M46 23 l9 9 l-9 9" stroke-width="6"/>
""")

add('p-centro-salud', 'Centro de salud', 'accion', 'Ir al centro de salud (franja «Cuándo ir», nivel ámbar).', 'dibujo', f"""
<path d="M6 30 L32 8 L58 30 z" fill="{OCRE}"/>
<path d="M12 30 h40 v26 h-40 z" fill="{CREMA}"/>
<path d="M29.5 33 h5 v4 h4 v5 h-4 v4 h-5 v-4 h-4 v-5 h4 z" fill="{GRANA}" stroke="{CONTORNO}" stroke-width="1.2"/>
<path d="M16 44 h8 v7 h-8 z" fill="{ANIL}" stroke="{CONTORNO}" stroke-width="1.5"/>
<path d="M40 44 h8 v12 h-8 z" fill="{ANIL}" stroke="{CONTORNO}" stroke-width="1.5"/>
""")

add('p-llamar-911', 'Llamar al 911', 'accion', 'Caja del 911 en urgencia; teléfonos de ayuda.', 'dibujo', f"""
<circle cx="32" cy="32" r="26" fill="{GRANA}"/>
<path d="M22 16 h6 l3 8 l-4 4 q3 7 10 10 l4 -4 l8 3 v6 q-1 5 -6 5 q-20 -2 -25 -25 q0 -7 4 -7 z" fill="{CREMA}" stroke="{CONTORNO}" stroke-width="2"/>
""")

add('p-alerta', 'Cuidado', 'accion', 'Tarjeta «Cuidado con esto» y avisos de una idea. Rombo como la señal preventiva de camino; NO es el triángulo del nivel rojo.', 'glifo', f"""
<path d="M32 5 L59 32 L32 59 L5 32 z" stroke-width="5"/>
<path d="M32 19 v15" stroke-width="6.5"/>
<circle cx="32" cy="44" r="3.8" fill="currentColor" stroke="none"/>
""")

add('p-nivel-verde', 'Nivel verde', 'semaforo', 'Forma del nivel verde (✓ en círculo). Va con color y texto.', 'glifo', f"""
<circle cx="32" cy="32" r="26" stroke-width="5"/>
<path d="M20 33 l8 8 l16 -16" stroke-width="6.5"/>
""")

add('p-nivel-ambar', 'Nivel amarillo', 'semaforo', 'Forma del nivel ámbar (círculo con punto). Va con color y texto.', 'glifo', f"""
<circle cx="32" cy="32" r="26" stroke-width="5"/>
<circle cx="32" cy="32" r="10" fill="currentColor" stroke="none"/>
""")

add('p-nivel-rojo', 'Nivel rojo', 'semaforo', 'Forma del nivel rojo (triángulo con !). Va con color y texto.', 'glifo', f"""
<path d="M32 6 L59 55 H5 z" stroke-width="5"/>
<path d="M32 23 v14" stroke-width="6.5"/>
<circle cx="32" cy="46" r="3.8" fill="currentColor" stroke="none"/>
""")

add('p-taza', 'Una taza', 'medida', 'Cuánto: una taza (jarro).', 'dibujo', f"""
<path d="M44 26 q11 0 10 11 q-1 9 -11 9" stroke-width="4"/>
<path d="M14 14 h34 q-3 3 -3.5 8 l-2 27 q-0.6 7 -7.5 7 h-8 q-7 0 -7.5 -7 l-2 -27 q-0.5 -5 -3.5 -8 z" fill="{PIEL}"/>
<path d="M19 30 h24" stroke="{CREMA}" stroke-width="1.8" stroke-dasharray="3 2.5"/>
<path d="M20 38 l3 -3 l3 3 l3 -3 l3 3 l3 -3 l3 3 l3 -3" stroke="{OCRE}" stroke-width="1.8"/>
<path d="M8 59 h40" stroke-width="2.5"/>
""")

add('p-cucharadita', 'Una cucharadita', 'medida', 'Cuánto: una cucharadita.', 'dibujo', f"""
<g transform="rotate(45 32 32)">
<path d="M32 2 h0 a3 3 0 0 1 3 3 v28 a3 3 0 0 1 -3 3 h-0 a3 3 0 0 1 -3 -3 v-28 a3 3 0 0 1 3 -3 z" fill="{CREMA}"/>
<ellipse cx="32" cy="46" rx="10" ry="13" fill="{CREMA}"/>
<ellipse cx="32" cy="47.5" rx="6" ry="8" fill="{OCRE}" stroke="{CONTORNO}" stroke-width="1.5"/>
</g>
""")

add('p-puno', 'Un puño', 'medida', 'Cuánto: lo que cabe en un puño.', 'dibujo', f"""
<path d="M22 50 h20 a2 2 0 0 1 2 2 v6 a2 2 0 0 1 -2 2 h-20 a2 2 0 0 1 -2 -2 v-6 a2 2 0 0 1 2 -2 z" fill="{ANIL}"/>
<path d="M22 52 h20" stroke="{CREMA}" stroke-width="1.5" stroke-dasharray="2.5 2.5"/>
<path d="M16 22 h32 q4 0 4 4 v14 q0 11 -11 11 h-18 q-11 0 -11 -11 v-14 q0 -4 4 -4 z" fill="{PIEL}"/>
<path d="M18 12 h0 a5 5 0 0 1 5 5 v7 a5 5 0 0 1 -5 5 h-0 a5 5 0 0 1 -5 -5 v-7 a5 5 0 0 1 5 -5 z" fill="{PIEL}"/>
<path d="M27 10 h0 a5 5 0 0 1 5 5 v9 a5 5 0 0 1 -5 5 h-0 a5 5 0 0 1 -5 -5 v-9 a5 5 0 0 1 5 -5 z" fill="{PIEL}"/>
<path d="M36 10 h0 a5 5 0 0 1 5 5 v9 a5 5 0 0 1 -5 5 h-0 a5 5 0 0 1 -5 -5 v-9 a5 5 0 0 1 5 -5 z" fill="{PIEL}"/>
<path d="M45 12 h0 a5 5 0 0 1 5 5 v7 a5 5 0 0 1 -5 5 h-0 a5 5 0 0 1 -5 -5 v-7 a5 5 0 0 1 5 -5 z" fill="{PIEL}"/>
<path d="M15 33 h21 q5 0 5 4.5 q0 4.5 -5 4.5 h-17" fill="{PIEL}" stroke="{CONTORNO}" stroke-width="1.8"/>
""")

add('p-vaso', 'Un vaso', 'medida', 'Cuánto: un vaso.', 'dibujo', f"""
<path d="M16 10 h32 l-4 46 h-24 z" fill="{CREMA}"/>
<path d="M19.5 17 h25" stroke="{GRANA}" stroke-width="1.8" stroke-dasharray="3 2.5"/>
<path d="M20.5 27 h7 M21.4 37 h6 M22.3 47 h5" stroke="{CONTORNO}" stroke-width="1.8"/>
<path d="M8 59 h48" stroke-width="2.5"/>
""")

add('p-al-dia', 'Al día', 'medida', 'Frecuencia: cada día (sol).', 'dibujo', f"""
<path d="M47.1 28.5 L59 32 L47.1 35.5 z" fill="{OCRE}"/>
<path d="M45.1 40.2 L51.1 51.1 L40.2 45.1 z" fill="{OCRE}"/>
<path d="M35.5 47.1 L32 59 L28.5 47.1 z" fill="{OCRE}"/>
<path d="M23.8 45.1 L12.9 51.1 L18.9 40.2 z" fill="{OCRE}"/>
<path d="M16.9 35.5 L5 32 L16.9 28.5 z" fill="{OCRE}"/>
<path d="M18.9 23.8 L12.9 12.9 L23.8 18.9 z" fill="{OCRE}"/>
<path d="M28.5 16.9 L32 5 L35.5 16.9 z" fill="{OCRE}"/>
<path d="M40.2 18.9 L51.1 12.9 L45.1 23.8 z" fill="{OCRE}"/>
<circle cx="32" cy="32" r="13" fill="{OCRE}"/>
<circle cx="32" cy="32" r="8" stroke="{GRANA}" stroke-width="1.5" stroke-dasharray="2.5 2.5"/>
""")

add('p-en-la-noche', 'En la noche', 'medida', 'Frecuencia: en la noche, antes de dormir (luna).', 'dibujo', f"""
<circle cx="32" cy="32" r="27" fill="{ANIL}"/>
<path d="M30 13 a19 19 0 1 0 17 27 a15 15 0 1 1 -17 -27 z" fill="{OCRE}" stroke="{CREMA}" stroke-width="1.5"/>
<path d="M45 14.5 Q45 19 49.5 19 Q45 19 45 23.5 Q45 19 40.5 19 Q45 19 45 14.5 z M50 29.8 Q50 33 53.2 33 Q50 33 50 36.2 Q50 33 46.8 33 Q50 33 50 29.8 z M39 25.4 Q39 28 41.6 28 Q39 28 39 30.6 Q39 28 36.4 28 Q39 28 39 25.4 z" fill="{CREMA}" stroke="none"/>
""")

add('p-hojita', 'Hojita de ayuda', 'medida', 'Cuánto ayuda: 1, 2 o 3 hojitas (poco, algo, bastante). Una sola tinta.', 'glifo', f"""
<path d="M11.5 47.5 C10 28 28 10 52 12 Z" fill="currentColor" stroke-width="2.5"/>
<path d="M16.5 52.5 C36 54 54 36 52 12 Z" fill="currentColor" stroke-width="2.5"/>
<path d="M14 50 Q9 53 6 58" stroke-width="3.5"/>
""")

add('p-tipo-comida', 'Comida', 'tipo', 'Etiqueta de tipo: comida.', 'dibujo', f"""
<ellipse cx="32" cy="26" rx="9.5" ry="19" fill="{OCRE}"/>
<path d="M26.5 13 q5.5 1.6 11.1 0 M24.8 18 q7.2 1.6 14.4 0 M24 23 q8 1.6 16 0 M24 28 q8 1.6 16.1 0 M24.6 33 q7.4 1.6 14.9 0 M28.6 9.8 q-1.8 17 0 34 M35.4 9.8 q1.8 17 0 34" stroke="{CONTORNO}" stroke-width="1.2"/>
<path d="M32 60 Q9 54 11 25 Q30 34 32 60 z" fill="{VERDE}"/>
<path d="M32 60 Q55 54 53 25 Q34 34 32 60 z" fill="{VERDE}"/>
<path d="M16 32 Q19 46 29 55 M48 32 Q45 46 35 55" stroke="{CREMA}" stroke-width="1.4"/>
""")

add('p-tipo-habito', 'Hábito', 'tipo', 'Etiqueta de tipo: algo que haces cada día.', 'dibujo', f"""
<path d="M46.1 15.1 A22 22 0 1 1 19.4 14" stroke-width="3.5"/>
<path d="M12.4 14 L19.4 14 L17 20.6" stroke-width="3.5"/>
<path d="M43.5 32 L47 32 M40.1 40.1 L42.6 42.6 M32 43.5 L32 47 M23.9 40.1 L21.4 42.6 M20.5 32 L17 32 M23.9 23.9 L21.4 21.4 M32 20.5 L32 17 M40.1 23.9 L42.6 21.4" stroke="{GRANA}" stroke-width="2.2"/>
<circle cx="32" cy="32" r="8" fill="{OCRE}"/>
""")

add('p-tipo-planta', 'Planta', 'tipo', 'Etiqueta de tipo: planta o té.', 'dibujo', f"""
<path d="M32 40 V18" stroke-width="2.8"/>
<path d="M32 33 Q17 34 14 20 Q29 19 32 33 z" fill="{VERDE}"/>
<path d="M32 26 Q46 26 50 13 Q35 12 32 26 z" fill="{VERDE}"/>
<path d="M32 18 Q27 11 32 4 Q37 11 32 18 z" fill="{VERDE}"/>
<path d="M31 32 L19 22 M33 25 L46 15" stroke="{CREMA}" stroke-width="1.4"/>
<path d="M21 46 h22 l-3.5 14 h-15 z" fill="{GRANA}"/>
<path d="M19 39 h26 a2 2 0 0 1 2 2 v4 a2 2 0 0 1 -2 2 h-26 a2 2 0 0 1 -2 -2 v-4 a2 2 0 0 1 2 -2 z" fill="{GRANA}"/>
<path d="M20 43 h24" stroke="{OCRE}" stroke-width="1.8" stroke-dasharray="3 2.5"/>
""")

add('p-tipo-suplemento', 'Suplemento', 'tipo', 'Etiqueta de tipo: suplemento (vitamina o mineral en pastilla).', 'dibujo', f"""
<path d="M18 20 h16 a6 6 0 0 1 6 6 v26 a6 6 0 0 1 -6 6 h-16 a6 6 0 0 1 -6 -6 v-26 a6 6 0 0 1 6 -6 z" fill="{CREMA}"/>
<path d="M17.5 8 h17 a2.5 2.5 0 0 1 2.5 2.5 v7 a2.5 2.5 0 0 1 -2.5 2.5 h-17 a2.5 2.5 0 0 1 -2.5 -2.5 v-7 a2.5 2.5 0 0 1 2.5 -2.5 z" fill="{ANIL}"/>
<path d="M19 11.5 v5 M24 11.5 v5 M29 11.5 v5 M34 11.5 v5" stroke="{CREMA}" stroke-width="1.4"/>
<path d="M18 29 h16 a2 2 0 0 1 2 2 v14 a2 2 0 0 1 -2 2 h-16 a2 2 0 0 1 -2 -2 v-14 a2 2 0 0 1 2 -2 z" fill="{OCRE}" stroke="{CONTORNO}" stroke-width="1.5"/>
<path d="M23 35 h6 a3 3 0 0 1 3 3 v0 a3 3 0 0 1 -3 3 h-6 a3 3 0 0 1 -3 -3 v-0 a3 3 0 0 1 3 -3 z" fill="{CREMA}" stroke="{CONTORNO}" stroke-width="1.4"/>
<g transform="rotate(-35 51 44)">
<path d="M46 44 v-6 a5 5 0 0 1 10 0 v6 z" fill="{GRANA}"/>
<path d="M46 44 v6 a5 5 0 0 0 10 0 v-6 z" fill="{CREMA}"/>
</g>
<circle cx="52" cy="25" r="5" fill="{OCRE}"/>
<path d="M49.5 25 h5" stroke="{CONTORNO}" stroke-width="1.4"/>
""")

add('p-frijol', 'Frijol', 'idea', 'Idea: frijol de la olla.', 'dibujo', f"""
<path d="M13 35 q-7 0 -7 6 q0 5 7 5 M51 35 q7 0 7 6 q0 5 -7 5" stroke-width="3"/>
<ellipse cx="32" cy="41" rx="20" ry="17" fill="{PIEL}"/>
<g fill="{CONTORNO}" stroke="{CREMA}" stroke-width="1.2">
<ellipse cx="25" cy="17" rx="4.2" ry="3" transform="rotate(-20 25 17)"/>
<ellipse cx="33" cy="14" rx="4.2" ry="3" transform="rotate(15 33 14)"/>
<ellipse cx="40" cy="18" rx="4.2" ry="3" transform="rotate(30 40 18)"/>
<ellipse cx="30" cy="20" rx="4.2" ry="3" transform="rotate(5 30 20)"/>
<ellipse cx="37" cy="21" rx="4.2" ry="3" transform="rotate(-10 37 21)"/>
</g>
<path d="M21 21 h22 a3 3 0 0 1 3 3 v2 a3 3 0 0 1 -3 3 h-22 a3 3 0 0 1 -3 -3 v-2 a3 3 0 0 1 3 -3 z" fill="{PIEL}"/>
<path d="M15 41 q17 8 34 0" stroke="{OCRE}" stroke-width="2.5" stroke-dasharray="3 3"/>
<path d="M19 49 q13 5 26 0" stroke="{CREMA}" stroke-width="1.5" stroke-dasharray="2 2.5"/>
""")

add('p-tortilla', 'Tortilla', 'idea', 'Idea: tortilla de maíz nixtamalizado.', 'dibujo', f"""
<ellipse cx="32" cy="31" rx="22" ry="6" fill="{CREMA}"/>
<ellipse cx="32" cy="27" rx="22" ry="6" fill="{CREMA}"/>
<ellipse cx="32" cy="23" rx="22" ry="6" fill="{CREMA}"/>
<g fill="{PIEL}" stroke="none">
<circle cx="24" cy="22" r="1.6"/>
<circle cx="33" cy="20.5" r="1.3"/>
<circle cx="40" cy="24" r="1.6"/>
<circle cx="29" cy="25" r="1.1"/>
</g>
<path d="M6 32 h52 l-7 25 h-38 z" fill="{OCRE}"/>
<path d="M9.5 40 h45 M11.8 48 h40.4" stroke="{CONTORNO}" stroke-width="1.5" stroke-dasharray="3 2.5"/>
<path d="M40 32 h16 l-6 13 z" fill="{GRANA}" stroke="{CONTORNO}" stroke-width="1.5"/>
<path d="M43 35 h9" stroke="{CREMA}" stroke-width="1.2" stroke-dasharray="2 2"/>
""")

add('p-agua', 'Agua', 'idea', 'Idea: tomar agua simple (hervida o purificada).', 'dibujo', f"""
<path d="M18.6 30 h26.8 l-2.2 26 h-22.4 z" fill="{AGUA}" stroke="none"/>
<path d="M16 12 h32 l-4 44 h-24 z"/>
<path d="M53 6 q5 7 0 10 q-5 -3 0 -10 z" fill="{ANIL}" stroke-width="1.5"/>
""")

add('p-caminar', 'Caminar', 'idea', 'Idea: caminar o moverte.', 'dibujo', f"""
<path d="M10 59 h44" stroke="{OCRE}" stroke-width="2.5"/>
<path d="M28 41 L20 56 M28 41 L37 55" stroke-width="5"/>
<path d="M29 28 L21 36 M29 28 L38 34" stroke="{ANIL}" stroke-width="4.5"/>
<path d="M30 24 L28 41" stroke="{ANIL}" stroke-width="7"/>
<circle cx="30" cy="18" r="5" fill="{PIEL}" stroke-width="1.5"/>
<ellipse cx="30" cy="13" rx="13" ry="3.5" fill="{OCRE}" stroke-width="1.5"/>
<path d="M24 12 q6 -10 12 0" fill="{OCRE}" stroke-width="1.5"/>
""")

add('p-dormir', 'Dormir', 'idea', 'Idea: dormir a la misma hora.', 'dibujo', f"""
<path d="M42 10 a22 22 0 1 0 14 32 a17 17 0 1 1 -14 -32 z" fill="{OCRE}"/>
<path d="M8 12 h8 l-8 9 h8 M18 26 h6 l-6 7 h6" stroke="{ANIL}" stroke-width="2.5"/>
<circle cx="52" cy="12" r="2" fill="{GRANA}" stroke="none"/>
""")

add('p-lavar-manos', 'Lavarse las manos', 'idea', 'Idea: lavarte las manos con jabón.', 'dibujo', f"""
<path d="M6 6 h18 a6 6 0 0 1 6 6 v4 h-7 v-3 h-17 z" fill="{ANIL}"/>
<path d="M24.5 19.5 v7 M28.5 19.5 v5" stroke="{AGUA}" stroke-width="3"/>
<g transform="translate(39 36) rotate(16) scale(-1 1)">
<path d="M-5.5 15 Q-8 8 -8 2 L-13.5 -4.5 a2.2 2.2 0 0 1 3.2 -3 L-8 -4 V-11 a2 2 0 0 1 4 0 V-13.5 a2 2 0 0 1 4 0 V-13 a2 2 0 0 1 4 0 V-10.5 a2 2 0 0 1 4 0 V2 Q8 8 5.5 15 z" fill="{PIEL}"/>
<path d="M-4 -11 V-4 M0 -13 V-4 M4 -10.5 V-4" stroke="{CONTORNO}" stroke-width="1.2"/>
<path d="M-8.5 13.5 h17 l0.8 5.5 h-18.6 z" fill="{GRANA}"/>
</g>
<g transform="translate(25.5 36.5) rotate(-14)">
<path d="M-5.5 15 Q-8 8 -8 2 L-13.5 -4.5 a2.2 2.2 0 0 1 3.2 -3 L-8 -4 V-11 a2 2 0 0 1 4 0 V-13.5 a2 2 0 0 1 4 0 V-13 a2 2 0 0 1 4 0 V-10.5 a2 2 0 0 1 4 0 V2 Q8 8 5.5 15 z" fill="{PIEL}"/>
<path d="M-4 -11 V-4 M0 -13 V-4 M4 -10.5 V-4" stroke="{CONTORNO}" stroke-width="1.2"/>
<path d="M-8.5 13.5 h17 l0.8 5.5 h-18.6 z" fill="{ANIL}"/>
<path d="M-7.5 16.3 h15" stroke="{CREMA}" stroke-width="1.4" stroke-dasharray="2.5 2.5"/>
</g>
<g stroke="{CONTORNO}" stroke-width="1.2" fill="{CREMA}">
<circle cx="23" cy="40" r="2.6"/>
<circle cx="29" cy="34" r="1.8"/>
<circle cx="20" cy="33" r="1.6"/>
</g>
<circle cx="51" cy="17" r="4" fill="{CREMA}"/>
<circle cx="56" cy="27" r="2.5" fill="{CREMA}"/>
<circle cx="9" cy="30" r="3" fill="{CREMA}"/>
""")

add('p-guayaba', 'Guayaba', 'idea', 'Idea: guayaba (vitamina C).', 'dibujo', f"""
<path d="M25 12 q-2 -7 6 -9 q2 7 -6 9 z" fill="{VERDE}" stroke-width="1.8"/>
<ellipse cx="22" cy="27" rx="13" ry="15" transform="rotate(-25 22 27)" fill="{OCRE}"/>
<path d="M15.5 34 l-2.4 0.6 M15.5 34 l-0.6 2.4 M15.5 34 l-1.8 -1.8 M15.5 34 l1.8 1.8" stroke="{CONTORNO}" stroke-width="1.4"/>
<ellipse cx="41" cy="42" rx="17" ry="15" fill="{OCRE}"/>
<ellipse cx="41" cy="42" rx="13" ry="11" fill="{GRANA}" stroke="{CONTORNO}" stroke-width="1.2"/>
<ellipse cx="41" cy="42" rx="4" ry="3.5" fill="{CREMA}" stroke="none"/>
<g fill="{CREMA}" stroke="none">
<circle cx="47" cy="42" r="1.2"/>
<circle cx="45.6" cy="45.9" r="1.2"/>
<circle cx="42" cy="47.9" r="1.2"/>
<circle cx="38" cy="47.2" r="1.2"/>
<circle cx="35.4" cy="44.1" r="1.2"/>
<circle cx="35.4" cy="39.9" r="1.2"/>
<circle cx="38" cy="36.8" r="1.2"/>
<circle cx="42" cy="36.1" r="1.2"/>
<circle cx="45.6" cy="38.1" r="1.2"/>
</g>
""")

add('p-naranja-limon', 'Naranja o limón', 'idea', 'Idea: naranja o limón (con el frijol ayuda a aprovechar el hierro).', 'dibujo', f"""
<ellipse cx="19" cy="20" rx="12" ry="10" transform="rotate(-20 19 20)" fill="{VERDE}"/>
<path d="M8 16 l-3 -2" stroke-width="2.5"/>
<path d="M14 15 q5 -3 10 -1" stroke="{CREMA}" stroke-width="1.4"/>
<circle cx="39" cy="40" r="20" fill="{OCRE}"/>
<circle cx="39" cy="40" r="15" fill="{OCRE}" stroke="{CREMA}" stroke-width="2.2"/>
<path d="M39 40 L49.6 44.4 M39 40 L43.4 50.6 M39 40 L34.6 50.6 M39 40 L28.4 44.4 M39 40 L28.4 35.6 M39 40 L34.6 29.4 M39 40 L43.4 29.4 M39 40 L49.6 35.6" stroke="{CREMA}" stroke-width="1.8"/>
<circle cx="39" cy="40" r="2" fill="{CREMA}" stroke="none"/>
""")

add('p-quelites', 'Quelites', 'idea', 'Idea: quelites, quintonil, verdolagas.', 'dibujo', f"""
<path d="M29 48 L24.5 59 M32 48 L32 60 M35 48 L39.5 59" stroke-width="2.5"/>
<ellipse cx="38.1" cy="34.5" rx="6" ry="8.8" transform="rotate(28 38.1 34.5)" fill="{VERDE}"/>
<ellipse cx="44.9" cy="37.3" rx="6" ry="10.5" transform="rotate(56 44.9 37.3)" fill="{VERDE}"/>
<ellipse cx="32" cy="29.3" rx="6" ry="11.3" transform="rotate(0 32 29.3)" fill="{VERDE}"/>
<ellipse cx="24.7" cy="32.3" rx="6" ry="10.5" transform="rotate(-28 24.7 32.3)" fill="{VERDE}"/>
<ellipse cx="21.2" cy="38.7" rx="6" ry="8.8" transform="rotate(-56 21.2 38.7)" fill="{VERDE}"/>
<path d="M35.5 39.5 L41.4 28.4 M39.3 41.1 L51.7 32.7 M32 36.5 L32 20.4 M27.9 38.3 L20.9 25 M25.9 41.9 L15.5 34.8" stroke="{CREMA}" stroke-width="1.4"/>
<path d="M27 44 h10 a2 2 0 0 1 2 2 v3 a2 2 0 0 1 -2 2 h-10 a2 2 0 0 1 -2 -2 v-3 a2 2 0 0 1 2 -2 z" fill="{GRANA}"/>
<path d="M27 47.5 h10" stroke="{OCRE}" stroke-width="1.5" stroke-dasharray="2 2"/>
""")

add('p-nopal', 'Nopal', 'idea', 'Idea: nopal.', 'dibujo', f"""
<ellipse cx="44" cy="22" rx="9" ry="12" transform="rotate(30 44 22)" fill="{VERDE}"/>
<ellipse cx="30" cy="39" rx="14" ry="18" fill="{VERDE}"/>
<ellipse cx="21" cy="16" rx="5" ry="6" fill="{GRANA}" stroke-width="1.8"/>
<g fill="{CREMA}" stroke="none">
<circle cx="25" cy="32" r="1.4"/>
<circle cx="34" cy="36" r="1.4"/>
<circle cx="27" cy="44" r="1.4"/>
<circle cx="35" cy="48" r="1.4"/>
<circle cx="43" cy="20" r="1.3"/>
<circle cx="47" cy="25" r="1.3"/>
</g>
<path d="M12 59 h36" stroke-width="3"/>
""")

add('p-caldo', 'Caldo', 'idea', 'Idea: caldo de pollo o de verduras.', 'dibujo', f"""
<path d="M22 22 q-3 -3.5 0 -7 q3 -3.5 0 -7 M32 20 q-3 -3.5 0 -7 q3 -3.5 0 -7 M42 22 q-3 -3.5 0 -7 q3 -3.5 0 -7" stroke-width="2.2"/>
<path d="M25 52 h14 a2 2 0 0 1 2 2 v3 a2 2 0 0 1 -2 2 h-14 a2 2 0 0 1 -2 -2 v-3 a2 2 0 0 1 2 -2 z" fill="{ANIL}"/>
<path d="M7 31 a25 23 0 0 0 50 0 z" fill="{ANIL}"/>
<path d="M12 42 q20 9 40 0" stroke="{CREMA}" stroke-width="1.8" stroke-dasharray="3 2.5"/>
<ellipse cx="32" cy="31" rx="25" ry="6" fill="{OCRE}"/>
<g stroke="{CONTORNO}" stroke-width="1.2">
<circle cx="21" cy="30" r="3" fill="{GRANA}"/>
<path d="M30 27 h4 a1 1 0 0 1 1 1 v3 a1 1 0 0 1 -1 1 h-4 a1 1 0 0 1 -1 -1 v-3 a1 1 0 0 1 1 -1 z" fill="{VERDE}"/>
<circle cx="43" cy="31" r="3" fill="{GRANA}"/>
<path d="M38 32 h3 a1 1 0 0 1 1 1 v1.5 a1 1 0 0 1 -1 1 h-3 a1 1 0 0 1 -1 -1 v-1.5 a1 1 0 0 1 1 -1 z" fill="{VERDE}"/>
<path d="M14 31 h3 a1 1 0 0 1 1 1 v1.5 a1 1 0 0 1 -1 1 h-3 a1 1 0 0 1 -1 -1 v-1.5 a1 1 0 0 1 1 -1 z" fill="{VERDE}"/>
</g>
""")

add('p-suero-oral', 'Suero oral', 'idea', 'Idea: suero oral (un sobre en un litro de agua hervida).', 'dibujo', f"""
<path d="M7.5 10 h23 a2.5 2.5 0 0 1 2.5 2.5 v37 a2.5 2.5 0 0 1 -2.5 2.5 h-23 a2.5 2.5 0 0 1 -2.5 -2.5 v-37 a2.5 2.5 0 0 1 2.5 -2.5 z" fill="{CREMA}"/>
<path d="M5 18 h28" stroke="{CONTORNO}" stroke-width="1.5" stroke-dasharray="2.5 2.5"/>
<path d="M11 22 h16 a2 2 0 0 1 2 2 v21 a2 2 0 0 1 -2 2 h-16 a2 2 0 0 1 -2 -2 v-21 a2 2 0 0 1 2 -2 z" fill="{GRANA}" stroke="{CONTORNO}" stroke-width="1.5"/>
<path d="M19 26 q7.5 9.3 0 15 q-7.5 -5.7 0 -15 z" fill="{AGUA}" stroke="{CREMA}" stroke-width="1.5"/>
<path d="M39.8 36 h16.4 l-1.7 20 h-13 z" fill="{AGUA}" stroke="none"/>
<path d="M38 28 h20 l-3 30 h-14 z"/>
<path d="M34 60 h25" stroke-width="2.5"/>
""")

add('p-manzanilla', 'Manzanilla', 'idea', 'Idea: té de manzanilla.', 'dibujo', f"""
<path d="M28 34 Q30 48 26 60 M30 46 Q38 42 42 46" stroke-width="2.5"/>
<path d="M24 54 q-8 -2 -10 -9 q7 0 10 9 z M27 52 q6 -5 12 -3 q-5 6 -12 3 z" fill="{VERDE}" stroke-width="1.8"/>
<ellipse cx="38" cy="22" rx="3.4" ry="6.5" transform="rotate(90 38 22)" fill="{CREMA}"/>
<ellipse cx="36.1" cy="27.9" rx="3.4" ry="6.5" transform="rotate(126 36.1 27.9)" fill="{CREMA}"/>
<ellipse cx="31.1" cy="31.5" rx="3.4" ry="6.5" transform="rotate(162 31.1 31.5)" fill="{CREMA}"/>
<ellipse cx="24.9" cy="31.5" rx="3.4" ry="6.5" transform="rotate(198 24.9 31.5)" fill="{CREMA}"/>
<ellipse cx="19.9" cy="27.9" rx="3.4" ry="6.5" transform="rotate(234 19.9 27.9)" fill="{CREMA}"/>
<ellipse cx="18" cy="22" rx="3.4" ry="6.5" transform="rotate(270 18 22)" fill="{CREMA}"/>
<ellipse cx="19.9" cy="16.1" rx="3.4" ry="6.5" transform="rotate(306 19.9 16.1)" fill="{CREMA}"/>
<ellipse cx="24.9" cy="12.5" rx="3.4" ry="6.5" transform="rotate(342 24.9 12.5)" fill="{CREMA}"/>
<ellipse cx="31.1" cy="12.5" rx="3.4" ry="6.5" transform="rotate(378 31.1 12.5)" fill="{CREMA}"/>
<ellipse cx="36.1" cy="16.1" rx="3.4" ry="6.5" transform="rotate(414 36.1 16.1)" fill="{CREMA}"/>
<circle cx="28" cy="22" r="6.5" fill="{OCRE}"/>
<path d="M25.5 20.5 h0.1 M30 20 h0.1 M27.5 24.5 h0.1 M31 24 h0.1" stroke="{CONTORNO}" stroke-width="2"/>
<ellipse cx="53" cy="42" rx="2.2" ry="4" transform="rotate(90 53 42)" fill="{CREMA}"/>
<ellipse cx="51.2" cy="46.2" rx="2.2" ry="4" transform="rotate(135 51.2 46.2)" fill="{CREMA}"/>
<ellipse cx="47" cy="48" rx="2.2" ry="4" transform="rotate(180 47 48)" fill="{CREMA}"/>
<ellipse cx="42.8" cy="46.2" rx="2.2" ry="4" transform="rotate(225 42.8 46.2)" fill="{CREMA}"/>
<ellipse cx="41" cy="42" rx="2.2" ry="4" transform="rotate(270 41 42)" fill="{CREMA}"/>
<ellipse cx="42.8" cy="37.8" rx="2.2" ry="4" transform="rotate(315 42.8 37.8)" fill="{CREMA}"/>
<ellipse cx="47" cy="36" rx="2.2" ry="4" transform="rotate(360 47 36)" fill="{CREMA}"/>
<ellipse cx="51.2" cy="37.8" rx="2.2" ry="4" transform="rotate(405 51.2 37.8)" fill="{CREMA}"/>
<circle cx="47" cy="42" r="4" fill="{OCRE}"/>
""")

add('p-sombrero-sombra', 'Sombrero y sombra', 'idea', 'Idea: usar sombrero y buscar sombra con el calor.', 'dibujo', f"""
<circle cx="53" cy="11" r="5" fill="{OCRE}"/>
<path d="M45.5 11 h-2 M53 18.5 v2 M47.7 5.7 l-1.4 -1.4 M47.7 16.3 l-1.4 1.4" stroke="{OCRE}" stroke-width="2.2"/>
<path d="M21 26 h3 a2 2 0 0 1 2 2 v26 a2 2 0 0 1 -2 2 h-3 a2 2 0 0 1 -2 -2 v-26 a2 2 0 0 1 2 -2 z" fill="{PIEL}"/>
<path d="M8 28 q-6 -10 4 -16 q4 -10 14 -6 q10 -4 14 6 q8 4 3 14 q-4 6 -12 4 q-6 6 -13 1 q-7 3 -10 -3 z" fill="{VERDE}"/>
<path d="M13 21 q6 3 10 -2 M26 15 q4 5 10 2" stroke="{CREMA}" stroke-width="1.4"/>
<ellipse cx="25" cy="57" rx="20" ry="3" stroke="{VERDE}" stroke-width="1.8" stroke-dasharray="3 2.5"/>
<path d="M35 49 q0 -13 9 -13 q9 0 9 13 z" fill="{OCRE}"/>
<ellipse cx="44" cy="50" rx="15" ry="4.5" fill="{OCRE}"/>
<path d="M35.5 45 q8.5 2.2 17 0" stroke="{GRANA}" stroke-width="2.2"/>
<path d="M32 50 h24" stroke="{CONTORNO}" stroke-width="1.2" stroke-dasharray="2 2"/>
""")

add('p-huevo', 'Huevo', 'idea', 'Idea: huevo.', 'dibujo', f"""
<path d="M22 8 q11 0 11 17 q0 13 -11 13 q-11 0 -11 -13 q0 -17 11 -17 z" fill="{PIEL}"/>
<path d="M14 46 q-2 -11 9 -13 q6 -7 16 -3 q12 -1 13 10 q6 9 -3 14 q-7 8 -18 4 q-15 1 -17 -12 z" fill="{CREMA}"/>
<circle cx="35" cy="43" r="7.5" fill="{OCRE}"/>
""")

add('p-calabaza', 'Calabaza', 'idea', 'Idea: calabaza de Castilla.', 'dibujo', f"""
<path d="M33 18 q2 -7 8 -10" stroke="{VERDE}" stroke-width="3.5"/>
<path d="M33 18 q2 -7 8 -10" stroke-width="1.2"/>
<path d="M30 21 q-10 -6 -18 2 q-8 8 -6 18 q2 14 14 16 q6 1 12 -1 q6 2 12 1 q12 -2 14 -16 q2 -10 -6 -18 q-8 -8 -18 -2 z" fill="{OCRE}"/>
<path d="M32 22 q-5 16 0 34 M32 22 q5 16 0 34 M21 22 q-9 14 -1 33 M43 22 q9 14 1 33" stroke="{CONTORNO}" stroke-width="1.6"/>
<path d="M28 20 l1 -8 h6 l1 8 z" fill="{VERDE}"/>
<path d="M36 13 q8 -6 14 0 q-6 6 -14 0 z" fill="{VERDE}" stroke-width="1.8"/>
""")

add('p-papaya', 'Papaya', 'idea', 'Idea: papaya.', 'dibujo', f"""
<g transform="rotate(-35 32 33)">
<ellipse cx="32" cy="33" rx="18" ry="28" fill="{VERDE}"/>
<ellipse cx="32" cy="34" rx="13.5" ry="23.5" fill="{OCRE}" stroke="none"/>
<ellipse cx="32" cy="36" rx="6.5" ry="14" fill="{GRANA}" stroke="{CONTORNO}" stroke-width="1.4"/>
<g fill="{CONTORNO}" stroke="none">
<circle cx="30" cy="28" r="1.7"/>
<circle cx="34" cy="31" r="1.7"/>
<circle cx="30" cy="34" r="1.7"/>
<circle cx="34" cy="37" r="1.7"/>
<circle cx="30" cy="40" r="1.7"/>
<circle cx="34" cy="43" r="1.7"/>
<circle cx="32" cy="46.5" r="1.5"/>
<circle cx="32" cy="25" r="1.5"/>
</g>
</g>
""")

add('p-sardina', 'Sardina', 'idea', 'Idea: sardina de lata (con espina).', 'dibujo', f"""
<path d="M20 20 h24 a16 16 0 0 1 16 16 v6 a16 16 0 0 1 -16 16 h-24 a16 16 0 0 1 -16 -16 v-6 a16 16 0 0 1 16 -16 z" fill="{OCRE}"/>
<path d="M21 25 h22 a12 12 0 0 1 12 12 v4 a12 12 0 0 1 -12 12 h-22 a12 12 0 0 1 -12 -12 v-4 a12 12 0 0 1 12 -12 z" fill="{GRANA}" stroke="{CONTORNO}" stroke-width="1.5"/>
<g>
<path d="M13 35 q11 -8 26 -2 l8 -5 v14 l-8 -5 q-15 6 -26 -2 z" fill="{AGUA}" stroke="{CONTORNO}" stroke-width="1.5"/>
<path d="M20 35 h15 M24 32.5 v5 M28 32 v6 M32 32.5 v5" stroke="{CONTORNO}" stroke-width="1.2"/>
<circle cx="17" cy="34" r="1.2" fill="{CONTORNO}" stroke="none"/>
</g>
<g transform="translate(64 11) scale(-1 1)">
<path d="M13 35 q11 -8 26 -2 l8 -5 v14 l-8 -5 q-15 6 -26 -2 z" fill="{AGUA}" stroke="{CONTORNO}" stroke-width="1.5"/>
<path d="M20 35 h15 M24 32.5 v5 M28 32 v6 M32 32.5 v5" stroke="{CONTORNO}" stroke-width="1.2"/>
<circle cx="17" cy="34" r="1.2" fill="{CONTORNO}" stroke="none"/>
</g>
<path d="M14 9 h34 a6 6 0 0 1 6 6 v0 a6 6 0 0 1 -6 6 h-34 a6 6 0 0 1 -6 -6 v-0 a6 6 0 0 1 6 -6 z" fill="{OCRE}"/>
<path d="M14 11.5 a3.5 3.5 0 1 0 3 3.5" stroke="{CONTORNO}" stroke-width="1.5"/>
<path d="M22 15 h28" stroke="{CONTORNO}" stroke-width="1.4" stroke-dasharray="2 2.5"/>
<path d="M54 15 h4 v-6" stroke-width="2.5"/>
""")

add('p-amaranto', 'Amaranto', 'idea', 'Idea: amaranto o alegría.', 'dibujo', f"""
<path d="M51 58 v-26" stroke="{VERDE}" stroke-width="3"/>
<path d="M51 44 q-9 -2 -10 -10 q9 1 10 10 z" fill="{VERDE}" stroke-width="1.8"/>
<path d="M51 5 a3 3 0 0 0 -4 4 a3 3 0 0 0 -2 6 a3 3 0 0 0 -1 6 a3 3 0 0 0 1 6 a3.5 3.5 0 0 0 6 4 a3.5 3.5 0 0 0 6 -4 a3 3 0 0 0 1 -6 a3 3 0 0 0 -1 -6 a3 3 0 0 0 -2 -6 a3 3 0 0 0 -4 -4 z" fill="{GRANA}"/>
<g fill="{CREMA}" stroke="none">
<circle cx="49" cy="14" r="1.1"/>
<circle cx="53" cy="18" r="1.1"/>
<circle cx="48.5" cy="22" r="1.1"/>
<circle cx="53.5" cy="26" r="1.1"/>
<circle cx="50" cy="29" r="1.1"/>
</g>
<path d="M12 24 h24 a4 4 0 0 1 4 4 v7 a4 4 0 0 1 -4 4 h-24 a4 4 0 0 1 -4 -4 v-7 a4 4 0 0 1 4 -4 z" fill="{OCRE}"/>
<path d="M8 40 h28 a4 4 0 0 1 4 4 v9 a4 4 0 0 1 -4 4 h-28 a4 4 0 0 1 -4 -4 v-9 a4 4 0 0 1 4 -4 z" fill="{OCRE}"/>
<g fill="{CREMA}" stroke="none">
<circle cx="13" cy="29" r="1.3"/>
<circle cx="19" cy="33" r="1.3"/>
<circle cx="25" cy="28.5" r="1.3"/>
<circle cx="31" cy="33" r="1.3"/>
<circle cx="36" cy="28.5" r="1.3"/>
<circle cx="14" cy="35" r="1.3"/>
<circle cx="27" cy="35" r="1.3"/>
<circle cx="9" cy="45" r="1.3"/>
<circle cx="15" cy="50" r="1.3"/>
<circle cx="21" cy="45" r="1.3"/>
<circle cx="27" cy="51" r="1.3"/>
<circle cx="33" cy="45.5" r="1.3"/>
<circle cx="36" cy="51.5" r="1.3"/>
<circle cx="10" cy="53" r="1.3"/>
<circle cx="21" cy="53.5" r="1.3"/>
<circle cx="27" cy="44.5" r="1.3"/>
</g>
""")

add('p-avena', 'Avena', 'idea', 'Idea: avena cocida.', 'dibujo', f"""
<g transform="translate(1.5 0)">
<path d="M15 24 q-3 -4 0 -8 q3 -4 0 -8 M25 24 q-3 -4 0 -8 q3 -4 0 -8" stroke-width="2"/>
<path d="M52 58 q2 -22 -2 -46" stroke="{OCRE}" stroke-width="2.5"/>
<g fill="{OCRE}" stroke-width="1.4">
<ellipse cx="50" cy="10" rx="2.5" ry="4"/>
<ellipse cx="46" cy="18" rx="2.5" ry="4" transform="rotate(-30 46 18)"/>
<ellipse cx="55" cy="19" rx="2.5" ry="4" transform="rotate(30 55 19)"/>
<ellipse cx="47" cy="27" rx="2.5" ry="4" transform="rotate(-30 47 27)"/>
<ellipse cx="56" cy="28" rx="2.5" ry="4" transform="rotate(30 56 28)"/>
</g>
<path d="M17 52 h12 a2 2 0 0 1 2 2 v2 a2 2 0 0 1 -2 2 h-12 a2 2 0 0 1 -2 -2 v-2 a2 2 0 0 1 2 -2 z" fill="{GRANA}"/>
<path d="M3 34 h40 q0 20 -20 20 q-20 0 -20 -20 z" fill="{GRANA}"/>
<path d="M8 42 h30" stroke="{OCRE}" stroke-width="2.2" stroke-dasharray="3 2.5"/>
<ellipse cx="23" cy="34" rx="20" ry="5" fill="{CREMA}"/>
<g fill="{OCRE}" stroke="{CONTORNO}" stroke-width="1.2">
<ellipse cx="14" cy="34" rx="2.6" ry="1.5"/>
<ellipse cx="22" cy="32.5" rx="2.6" ry="1.5"/>
<ellipse cx="30" cy="35" rx="2.6" ry="1.5"/>
<ellipse cx="35" cy="32.6" rx="2.2" ry="1.3"/>
<ellipse cx="21" cy="36.4" rx="2.2" ry="1.3"/>
</g>
</g>
""")

add('p-dolor-cabeza', 'Dolor de cabeza', 'seccion', 'Sección «Dolor de cabeza».', 'dibujo', f"""
<path d="M8 60 q0 -13 22 -13 q22 0 22 13 z" fill="{GRANA}"/>
<path d="M14 54 h32" stroke="{OCRE}" stroke-width="2.2" stroke-dasharray="3 2.5"/>
<circle cx="30" cy="31" r="15" fill="{PIEL}"/>
<path d="M15 31 q0 -17 15 -17 q15 0 15 17 q-4 -10 -15 -10 q-11 0 -15 10 z" fill="{CONTORNO}"/>
<path d="M21 29 l4 2.5 l-4 2.5 M39 29 l-4 2.5 l4 2.5 M25 40 q5 -3.5 10 0" stroke="{CONTORNO}" stroke-width="1.7"/>
<path d="M45 52 l4 -20 l8 2 l-4 19 z" fill="{GRANA}"/>
<ellipse cx="48" cy="27" rx="5.5" ry="7.5" transform="rotate(-12 48 27)" fill="{PIEL}"/>
<path d="M6 16 l5 4 M12 8 l3 6 M4 25 h6" stroke="{GRANA}" stroke-width="2.8"/>
""")

add('p-sueno', 'Sueño, nervios y tristeza', 'seccion', 'Sección «Sueño, nervios y tristeza».', 'dibujo', f"""
<path d="M50 5 a9 9 0 1 0 8 12.5 a7 7 0 1 1 -8 -12.5 z" fill="{OCRE}"/>
<circle cx="56" cy="26" r="1.6" fill="{OCRE}" stroke="none"/>
<path d="M4 60 q0 -11 24 -11 q24 0 24 11 z" fill="{ANIL}"/>
<path d="M9 55.5 h38" stroke="{CREMA}" stroke-width="1.8" stroke-dasharray="3 2.5"/>
<circle cx="28" cy="33" r="17" fill="{PIEL}"/>
<path d="M11 33 q0 -19 17 -19 q17 0 17 19 q-5 -11 -17 -11 q-12 0 -17 11 z" fill="{CONTORNO}"/>
<path d="M17 30 l7 -2.5 M39 30 l-7 -2.5" stroke="{CONTORNO}" stroke-width="1.7"/>
<path d="M18 35 q3 2.5 6 0 M32 35 q3 2.5 6 0 M19 39 q2.5 1.2 5 0 M32 39 q2.5 1.2 5 0" stroke="{CONTORNO}" stroke-width="1.5"/>
<path d="M21 45 q3.5 -2.5 7 0 q3.5 2.5 7 0" stroke="{CONTORNO}" stroke-width="1.7"/>
""")

add('p-vista', 'Vista', 'seccion', 'Sección «Vista».', 'dibujo', f"""
<g transform="translate(0 5)">
<path d="M12 18 l-3 -5 M22 13 l-1.5 -6 M32 11 v-6 M42 13 l1.5 -6 M52 18 l3 -5" stroke-width="2.5"/>
<path d="M4 34 q28 -28 56 0 q-28 28 -56 0 z" fill="{CREMA}"/>
<circle cx="32" cy="34" r="11.5" fill="{ANIL}" stroke="{CONTORNO}" stroke-width="1.8"/>
<circle cx="32" cy="34" r="4.8" fill="{CONTORNO}" stroke="none"/>
<circle cx="32" cy="34" r="8.3" fill="none" stroke="{CREMA}" stroke-width="1.2" stroke-dasharray="1.6 2.2"/>
</g>
""")

add('p-boca', 'Boca y dientes', 'seccion', 'Sección «Boca y dientes».', 'dibujo', f"""
<path d="M24 12 q-6 -5 -12 -2 q-6 4 -3 14 q2 6 3 14 l2 14 q1 4 4 2 l3 -12 q1 -3 3 -3 q2 0 3 3 l3 12 q3 2 4 -2 l2 -14 q1 -8 3 -14 q3 -10 -3 -14 q-6 -3 -12 2 z" fill="{CREMA}"/>
<path d="M14 20 q10 5 20 0" stroke="{AGUA}" stroke-width="1.6" stroke-dasharray="2 2.5"/>
<path d="M54 26 h0 a4 4 0 0 1 4 4 v24 a4 4 0 0 1 -4 4 h-0 a4 4 0 0 1 -4 -4 v-24 a4 4 0 0 1 4 -4 z" fill="{ANIL}"/>
<path d="M53 6 h2 a3 3 0 0 1 3 3 v16 a3 3 0 0 1 -3 3 h-2 a3 3 0 0 1 -3 -3 v-16 a3 3 0 0 1 3 -3 z" fill="{ANIL}"/>
<path d="M43.5 8 h5 a1.5 1.5 0 0 1 1.5 1.5 v12 a1.5 1.5 0 0 1 -1.5 1.5 h-5 a1.5 1.5 0 0 1 -1.5 -1.5 v-12 a1.5 1.5 0 0 1 1.5 -1.5 z" fill="{CREMA}"/>
<path d="M45 10 v11 M47.5 10 v11" stroke="{CONTORNO}" stroke-width="1.2"/>
""")

add('p-tos', 'Tos y garganta', 'seccion', 'Sección «Tos y garganta».', 'dibujo', f"""
<path d="M4 60 q0 -20 18 -20 q16 0 18 20 z" fill="{ANIL}"/>
<circle cx="23" cy="25" r="11" fill="{PIEL}"/>
<path d="M12 27 q-2 -14 11 -13 q10 0 11 8 q-8 -5 -14 1 q-3 4 -8 4 z" fill="{CONTORNO}"/>
<path d="M27 22 q2 1.6 4 0" stroke="{CONTORNO}" stroke-width="1.6"/>
<path d="M28 50 L42 32 L28 18" stroke-width="10"/>
<path d="M28 50 L42 32 L28 18" stroke="{GRANA}" stroke-width="5"/>
<path d="M50 22 l7 -5 M51 32 h8 M50 42 l7 5" stroke-width="2.6"/>
<circle cx="56" cy="27" r="1.5" fill="{AGUA}" stroke="none"/>
<circle cx="56" cy="37" r="1.5" fill="{AGUA}" stroke="none"/>
""")

add('p-corazon', 'Presión y corazón', 'seccion', 'Sección «Presión y corazón».', 'dibujo', f"""
<path d="M32 57 q-26 -15 -26 -33 q0 -14 13 -14 q9 0 13 9 q4 -9 13 -9 q13 0 13 14 q0 18 -26 33 z" fill="{GRANA}"/>
<path d="M10 31 h12 l3 -8 l6 17 l5 -14 l3 5 h15" stroke="{CREMA}" stroke-width="3"/>
""")

add('p-digestion', 'Estómago y digestión', 'seccion', 'Sección «Estómago y digestión».', 'dibujo', f"""
<path d="M10 60 q-2 -16 3 -30 q3 -10 -1 -22 h40 q-4 12 -1 22 q5 14 3 30 z" fill="{CREMA}"/>
<path d="M24 8 q8 10 16 0 z" fill="{PIEL}"/>
<path d="M20 9 q12 22 24 0" stroke="{GRANA}" stroke-width="2.2" stroke-dasharray="3 2.5"/>
<path d="M14 26 h36" stroke="{GRANA}" stroke-width="2.2" stroke-dasharray="3 2.5"/>
<path d="M40 37 l16 -5 l3.5 14 l-17 5 z" fill="{CREMA}"/>
<path d="M44 36.5 l3.5 13" stroke="{GRANA}" stroke-width="2" stroke-dasharray="2.5 2"/>
<path d="M27 37 q-3 -4 -9 -3.5 q-3 1 -1 3.2 q5 0.3 7 3 z" fill="{PIEL}"/>
<path d="M45 36 h-25 a2 2 0 0 0 0 4 h-3 a2 2 0 0 0 0 4 h1 a2 2 0 0 0 0 4 h3 a2 2 0 0 0 0 4 h24 z" fill="{PIEL}"/>
<path d="M18 40 h12 M16 44 h14 M19 48 h11" stroke="{CONTORNO}" stroke-width="1.3"/>
""")

add('p-diarrea', 'Diarrea y agua limpia', 'seccion', 'Sección «Diarrea y agua limpia».', 'dibujo', f"""
<path d="M51 4 q7 8.4 7 12.2 a7 7 0 0 1 -14 0 q0 -3.9 7 -12.2 z" fill="{AGUA}"/>
<path d="M9 10 h9 a3 3 0 0 1 3 3 v18 a3 3 0 0 1 -3 3 h-9 a3 3 0 0 1 -3 -3 v-18 a3 3 0 0 1 3 -3 z" fill="{CREMA}"/>
<path d="M10.5 14 h3 a1.5 1.5 0 0 1 1.5 1.5 v0 a1.5 1.5 0 0 1 -1.5 1.5 h-3 a1.5 1.5 0 0 1 -1.5 -1.5 v-0 a1.5 1.5 0 0 1 1.5 -1.5 z" fill="{AGUA}" stroke="{CONTORNO}" stroke-width="1.2"/>
<path d="M19 58 l2 -12 h16 l2 12 z" fill="{CREMA}"/>
<path d="M8 33 h40 q0 15 -18 16 q-20 0 -22 -16 z" fill="{CREMA}"/>
<path d="M8.5 30 h39 a2.5 2.5 0 0 1 2.5 2.5 v0 a2.5 2.5 0 0 1 -2.5 2.5 h-39 a2.5 2.5 0 0 1 -2.5 -2.5 v-0 a2.5 2.5 0 0 1 2.5 -2.5 z" fill="{ANIL}"/>
""")

add('p-orina', 'Orina', 'seccion', 'Sección «Orina».', 'dibujo', f"""
<path d="M32 5 q4.5 5.4 4.5 7.9 a4.5 4.5 0 0 1 -9.0 0 q0 -2.5 4.5 -7.9 z" fill="{OCRE}"/>
<path d="M22 22 h20 a5 5 0 0 1 5 5 v26 a5 5 0 0 1 -5 5 h-20 a5 5 0 0 1 -5 -5 v-26 a5 5 0 0 1 5 -5 z" fill="{CREMA}"/>
<path d="M18.3 37 h27.4 v16 q0 3.7 -3.7 3.7 h-20 q-3.7 0 -3.7 -3.7 z" fill="{OCRE}" stroke="none"/>
<path d="M18.3 37 h27.4" stroke="{CONTORNO}" stroke-width="1.4"/>
<path d="M40 27 h4 M41 32 h3 M40 42 h4 M41 47 h3" stroke="{CONTORNO}" stroke-width="1.3"/>
<path d="M22 22 h20 a5 5 0 0 1 5 5 v26 a5 5 0 0 1 -5 5 h-20 a5 5 0 0 1 -5 -5 v-26 a5 5 0 0 1 5 -5 z" fill="none"/>
<path d="M16.5 17 h31 a2.5 2.5 0 0 1 2.5 2.5 v2 a2.5 2.5 0 0 1 -2.5 2.5 h-31 a2.5 2.5 0 0 1 -2.5 -2.5 v-2 a2.5 2.5 0 0 1 2.5 -2.5 z" fill="{ANIL}"/>
<path d="M17 20.5 h30" stroke="{CREMA}" stroke-width="1.2" stroke-dasharray="1.6 2"/>
""")

add('p-colicos', 'Cólicos de la regla', 'seccion', 'Sección «Cólicos de la regla».', 'dibujo', f"""
<path d="M14 4 h36 q-2 14 0 30 h-36 q2 -16 0 -30 z" fill="{CREMA}"/>
<path d="M14 36 h36 q8 12 8 24 h-52 q0 -12 8 -24 z" fill="{ANIL}"/>
<path d="M13 29 h38 a2 2 0 0 1 2 2 v4 a2 2 0 0 1 -2 2 h-38 a2 2 0 0 1 -2 -2 v-4 a2 2 0 0 1 2 -2 z" fill="{OCRE}"/>
<path d="M14 33 h36" stroke="{GRANA}" stroke-width="1.6" stroke-dasharray="2.5 2"/>
<path d="M24 22 q-3 -4 0 -8 q3 -4 0 -8 M32 22 q-3 -4 0 -8 q3 -4 0 -8 M40 22 q-3 -4 0 -8 q3 -4 0 -8" stroke="{GRANA}" stroke-width="2.2"/>
<path d="M28.5 23 h7 a1.5 1.5 0 0 1 1.5 1.5 v2 a1.5 1.5 0 0 1 -1.5 1.5 h-7 a1.5 1.5 0 0 1 -1.5 -1.5 v-2 a1.5 1.5 0 0 1 1.5 -1.5 z" fill="{GRANA}"/>
<path d="M26 27 h12 a8 8 0 0 1 8 8 v13 a8 8 0 0 1 -8 8 h-12 a8 8 0 0 1 -8 -8 v-13 a8 8 0 0 1 8 -8 z" fill="{GRANA}"/>
<path d="M23 35 h18 M23 41 h18 M23 47 h18" stroke="{CREMA}" stroke-width="1.6"/>
""")

add('p-piel', 'Piel, raspones y piquetes', 'seccion', 'Sección «Piel, raspones y piquetes».', 'dibujo', f"""
<g transform="rotate(-40 34 38)">
<ellipse cx="53" cy="25" rx="6" ry="3" transform="rotate(-25 53 25)" fill="{PIEL}"/>
<path d="M17 28 h26 a10 10 0 0 1 10 10 v0 a10 10 0 0 1 -10 10 h-26 a10 10 0 0 1 -10 -10 v-0 a10 10 0 0 1 10 -10 z" fill="{PIEL}"/>
<path d="M47 27 h9 q7 0 7 11 q0 11 -7 11 h-9 z" fill="{PIEL}"/>
<path d="M56 32.5 h5.5 M57 38 h5.5 M56 43.5 h5.5" stroke="{CONTORNO}" stroke-width="1.3"/>
<path d="M22 24 h4 a4 4 0 0 1 4 4 v20 a4 4 0 0 1 -4 4 h-4 a4 4 0 0 1 -4 -4 v-20 a4 4 0 0 1 4 -4 z" fill="{CREMA}"/>
<path d="M21.5 32 h5 a1.5 1.5 0 0 1 1.5 1.5 v9 a1.5 1.5 0 0 1 -1.5 1.5 h-5 a1.5 1.5 0 0 1 -1.5 -1.5 v-9 a1.5 1.5 0 0 1 1.5 -1.5 z" fill="{OCRE}" stroke="{CONTORNO}" stroke-width="1.2"/>
<g fill="{CONTORNO}" stroke="none">
<circle cx="21" cy="27.5" r="0.8"/>
<circle cx="24" cy="27.5" r="0.8"/>
<circle cx="27" cy="27.5" r="0.8"/>
<circle cx="21" cy="48.5" r="0.8"/>
<circle cx="24" cy="48.5" r="0.8"/>
<circle cx="27" cy="48.5" r="0.8"/>
</g>
<circle cx="40" cy="36" r="3.4" fill="{GRANA}" stroke="{CREMA}" stroke-width="1.3"/>
</g>
<ellipse cx="13" cy="12" rx="5.5" ry="3.2" transform="rotate(-35 13 12)" fill="{AGUA}" stroke-width="1.5"/>
<ellipse cx="22" cy="8" rx="5.5" ry="3.2" transform="rotate(25 22 8)" fill="{AGUA}" stroke-width="1.5"/>
<path d="M14 20 l-5 4 M18 21 l-1 6 M22 19 l4 4" stroke-width="1.4"/>
<ellipse cx="19" cy="17" rx="3" ry="6" transform="rotate(-45 19 17)" fill="{CONTORNO}" stroke-width="1.5"/>
<path d="M23 21 l6 6" stroke-width="1.6"/>
""")

add('p-huesos', 'Huesos y articulaciones', 'seccion', 'Sección «Huesos y articulaciones».', 'dibujo', f"""
<path transform="translate(22 20) rotate(40)" d="M-7.02 -3.4 A4.5 4.5 0 1 0 -13.91 0 A4.5 4.5 0 1 0 -7.02 3.4 L7.02 3.4 A4.5 4.5 0 1 0 13.91 0 A4.5 4.5 0 1 0 7.02 -3.4 Z" fill="{CREMA}"/>
<path transform="translate(35 42) rotate(105)" d="M-7.02 -3.4 A4.5 4.5 0 1 0 -13.91 0 A4.5 4.5 0 1 0 -7.02 3.4 L7.02 3.4 A4.5 4.5 0 1 0 13.91 0 A4.5 4.5 0 1 0 7.02 -3.4 Z" fill="{CREMA}"/>
<circle cx="35" cy="29" r="6.5" fill="{OCRE}"/>
<path d="M50 22 q4 4 0 8 M55 18 q7 8 0 16" stroke="{GRANA}" stroke-width="2.4"/>
""")

add('p-energia', 'Cansancio y sangre', 'seccion', 'Sección «Cansancio y sangre».', 'dibujo', f"""
<path d="M50 5 q7.5 9.0 7.5 13.1 a7.5 7.5 0 0 1 -15.0 0 q0 -4.1 7.5 -13.1 z" fill="{GRANA}"/>
<path d="M9 28 h32 a5 5 0 0 1 5 5 v14 a5 5 0 0 1 -5 5 h-32 a5 5 0 0 1 -5 -5 v-14 a5 5 0 0 1 5 -5 z" fill="{CREMA}"/>
<path d="M48 34 h2 a2 2 0 0 1 2 2 v8 a2 2 0 0 1 -2 2 h-2 a2 2 0 0 1 -2 -2 v-8 a2 2 0 0 1 2 -2 z" fill="{CREMA}"/>
<path d="M9.5 32 h5 a1.5 1.5 0 0 1 1.5 1.5 v13 a1.5 1.5 0 0 1 -1.5 1.5 h-5 a1.5 1.5 0 0 1 -1.5 -1.5 v-13 a1.5 1.5 0 0 1 1.5 -1.5 z" fill="{GRANA}" stroke="{CONTORNO}" stroke-width="1.4"/>
<path d="M21 32 h5 a1.5 1.5 0 0 1 1.5 1.5 v13 a1.5 1.5 0 0 1 -1.5 1.5 h-5 a1.5 1.5 0 0 1 -1.5 -1.5 v-13 a1.5 1.5 0 0 1 1.5 -1.5 z" fill="none" stroke="{CONTORNO}" stroke-width="1.2" stroke-dasharray="2 2"/>
<path d="M32.5 32 h5 a1.5 1.5 0 0 1 1.5 1.5 v13 a1.5 1.5 0 0 1 -1.5 1.5 h-5 a1.5 1.5 0 0 1 -1.5 -1.5 v-13 a1.5 1.5 0 0 1 1.5 -1.5 z" fill="none" stroke="{CONTORNO}" stroke-width="1.2" stroke-dasharray="2 2"/>
""")

add('p-defensas', 'Defensas', 'seccion', 'Sección «Defensas».', 'dibujo', f"""
<path d="M32 4 l24 8 v16 q0 22 -24 32 q-24 -10 -24 -32 v-16 z" fill="{ANIL}"/>
<path d="M32 10 l18 6 v12 q0 17 -18 25 q-18 -8 -18 -25 v-12 z" fill="none" stroke="{CREMA}" stroke-width="1.6" stroke-dasharray="3 2.5"/>
<path d="M28 18 h8 v8 h8 v8 h-8 v8 h-8 v-8 h-8 v-8 h8 z" fill="{CREMA}" stroke="{CONTORNO}" stroke-width="1.4"/>
""")

add('p-azucar-peso', 'Azúcar y peso', 'seccion', 'Sección «Azúcar y peso».', 'dibujo', f"""
<path d="M18 13 h4 a1 1 0 0 1 1 1 v14 a1 1 0 0 1 -1 1 h-4 a1 1 0 0 1 -1 -1 v-14 a1 1 0 0 1 1 -1 z" fill="{CREMA}"/>
<path d="M20 4.5 q4.6 5.5 4.6 8.0 a4.6 4.6 0 0 1 -9.2 0 q0 -2.5 4.6 -8.0 z" fill="{GRANA}"/>
<path d="M12 26 h16 a6 6 0 0 1 6 6 v22 a6 6 0 0 1 -6 6 h-16 a6 6 0 0 1 -6 -6 v-22 a6 6 0 0 1 6 -6 z" fill="{ANIL}"/>
<path d="M12 30 h16 a2 2 0 0 1 2 2 v9 a2 2 0 0 1 -2 2 h-16 a2 2 0 0 1 -2 -2 v-9 a2 2 0 0 1 2 -2 z" fill="{CREMA}" stroke="{CONTORNO}" stroke-width="1.5"/>
<path d="M13 37 h3 l2 -4 l3 7 l2 -3 h4" stroke="{GRANA}" stroke-width="1.5"/>
<circle cx="14" cy="51" r="2.8" fill="{CREMA}" stroke="{CREMA}" stroke-width="1.2"/>
<circle cx="26" cy="51" r="2.8" fill="{CREMA}" stroke="{CREMA}" stroke-width="1.2"/>
<path d="M38 45 L43 40 H57 V54 L52 59 H38 Z" fill="{CREMA}"/>
<path d="M38 45 H52 L57 40 M52 45 V59" stroke="{CONTORNO}" stroke-width="1.5"/>
<path d="M40 29 L44 25 H58 V39 L54 43 H40 Z" fill="{CREMA}"/>
<path d="M40 29 H54 L58 25 M54 29 V43 M40 43 H54 L57.5 39.5" stroke="{CONTORNO}" stroke-width="1.5"/>
""")

add('p-grupo-cabeza', 'Cabeza y ánimo', 'grupo', 'Grupo de temas «Cabeza y ánimo».', 'dibujo', f"""
<path d="M17 21 h0 a3 3 0 0 1 3 3 v18 a3 3 0 0 1 -3 3 h-0 a3 3 0 0 1 -3 -3 v-18 a3 3 0 0 1 3 -3 z" transform="rotate(8 17 23)" fill="{CREMA}"/>
<path d="M47 21 h0 a3 3 0 0 1 3 3 v18 a3 3 0 0 1 -3 3 h-0 a3 3 0 0 1 -3 -3 v-18 a3 3 0 0 1 3 -3 z" transform="rotate(-8 47 23)" fill="{CREMA}"/>
<path d="M27.5 44 h0 a3.5 3.5 0 0 1 3.5 3.5 v9 a3.5 3.5 0 0 1 -3.5 3.5 h-0 a3.5 3.5 0 0 1 -3.5 -3.5 v-9 a3.5 3.5 0 0 1 3.5 -3.5 z" fill="{CREMA}"/>
<path d="M36.5 44 h0 a3.5 3.5 0 0 1 3.5 3.5 v9 a3.5 3.5 0 0 1 -3.5 3.5 h-0 a3.5 3.5 0 0 1 -3.5 -3.5 v-9 a3.5 3.5 0 0 1 3.5 -3.5 z" fill="{CREMA}"/>
<path d="M29 15 h6 v7 h-6 z" fill="{CREMA}"/>
<path d="M22 34 h20 v8 q0 4 -4 4 h-12 q-4 0 -4 -4 z" fill="{CREMA}"/>
<path d="M22 24 q0 -4 4 -4 h12 q4 0 4 4 v10 h-20 z" fill="{CREMA}"/>
<circle cx="32" cy="11" r="7" fill="{GRANA}"/>
""")

add('p-grupo-pecho', 'Pecho y garganta', 'grupo', 'Grupo de temas «Pecho y garganta».', 'dibujo', f"""
<path d="M17 21 h0 a3 3 0 0 1 3 3 v18 a3 3 0 0 1 -3 3 h-0 a3 3 0 0 1 -3 -3 v-18 a3 3 0 0 1 3 -3 z" transform="rotate(8 17 23)" fill="{CREMA}"/>
<path d="M47 21 h0 a3 3 0 0 1 3 3 v18 a3 3 0 0 1 -3 3 h-0 a3 3 0 0 1 -3 -3 v-18 a3 3 0 0 1 3 -3 z" transform="rotate(-8 47 23)" fill="{CREMA}"/>
<path d="M27.5 44 h0 a3.5 3.5 0 0 1 3.5 3.5 v9 a3.5 3.5 0 0 1 -3.5 3.5 h-0 a3.5 3.5 0 0 1 -3.5 -3.5 v-9 a3.5 3.5 0 0 1 3.5 -3.5 z" fill="{CREMA}"/>
<path d="M36.5 44 h0 a3.5 3.5 0 0 1 3.5 3.5 v9 a3.5 3.5 0 0 1 -3.5 3.5 h-0 a3.5 3.5 0 0 1 -3.5 -3.5 v-9 a3.5 3.5 0 0 1 3.5 -3.5 z" fill="{CREMA}"/>
<path d="M29 15 h6 v7 h-6 z" fill="{GRANA}"/>
<path d="M22 34 h20 v8 q0 4 -4 4 h-12 q-4 0 -4 -4 z" fill="{CREMA}"/>
<path d="M22 24 q0 -4 4 -4 h12 q4 0 4 4 v10 h-20 z" fill="{GRANA}"/>
<circle cx="32" cy="11" r="7" fill="{CREMA}"/>
""")

add('p-grupo-panza', 'Panza', 'grupo', 'Grupo de temas «Panza».', 'dibujo', f"""
<path d="M17 21 h0 a3 3 0 0 1 3 3 v18 a3 3 0 0 1 -3 3 h-0 a3 3 0 0 1 -3 -3 v-18 a3 3 0 0 1 3 -3 z" transform="rotate(8 17 23)" fill="{CREMA}"/>
<path d="M47 21 h0 a3 3 0 0 1 3 3 v18 a3 3 0 0 1 -3 3 h-0 a3 3 0 0 1 -3 -3 v-18 a3 3 0 0 1 3 -3 z" transform="rotate(-8 47 23)" fill="{CREMA}"/>
<path d="M27.5 44 h0 a3.5 3.5 0 0 1 3.5 3.5 v9 a3.5 3.5 0 0 1 -3.5 3.5 h-0 a3.5 3.5 0 0 1 -3.5 -3.5 v-9 a3.5 3.5 0 0 1 3.5 -3.5 z" fill="{CREMA}"/>
<path d="M36.5 44 h0 a3.5 3.5 0 0 1 3.5 3.5 v9 a3.5 3.5 0 0 1 -3.5 3.5 h-0 a3.5 3.5 0 0 1 -3.5 -3.5 v-9 a3.5 3.5 0 0 1 3.5 -3.5 z" fill="{CREMA}"/>
<path d="M29 15 h6 v7 h-6 z" fill="{CREMA}"/>
<path d="M22 34 h20 v8 q0 4 -4 4 h-12 q-4 0 -4 -4 z" fill="{GRANA}"/>
<path d="M22 24 q0 -4 4 -4 h12 q4 0 4 4 v10 h-20 z" fill="{CREMA}"/>
<circle cx="32" cy="11" r="7" fill="{CREMA}"/>
""")

add('p-grupo-piel-huesos', 'Piel y huesos', 'grupo', 'Grupo de temas «Piel y huesos».', 'dibujo', f"""
<path d="M17 21 h0 a3 3 0 0 1 3 3 v18 a3 3 0 0 1 -3 3 h-0 a3 3 0 0 1 -3 -3 v-18 a3 3 0 0 1 3 -3 z" transform="rotate(8 17 23)" fill="{ANIL}"/>
<path d="M47 21 h0 a3 3 0 0 1 3 3 v18 a3 3 0 0 1 -3 3 h-0 a3 3 0 0 1 -3 -3 v-18 a3 3 0 0 1 3 -3 z" transform="rotate(-8 47 23)" fill="{ANIL}"/>
<path d="M27.5 44 h0 a3.5 3.5 0 0 1 3.5 3.5 v9 a3.5 3.5 0 0 1 -3.5 3.5 h-0 a3.5 3.5 0 0 1 -3.5 -3.5 v-9 a3.5 3.5 0 0 1 3.5 -3.5 z" fill="{ANIL}"/>
<path d="M36.5 44 h0 a3.5 3.5 0 0 1 3.5 3.5 v9 a3.5 3.5 0 0 1 -3.5 3.5 h-0 a3.5 3.5 0 0 1 -3.5 -3.5 v-9 a3.5 3.5 0 0 1 3.5 -3.5 z" fill="{ANIL}"/>
<path d="M29 15 h6 v7 h-6 z" fill="{CREMA}"/>
<path d="M22 34 h20 v8 q0 4 -4 4 h-12 q-4 0 -4 -4 z" fill="{CREMA}"/>
<path d="M22 24 q0 -4 4 -4 h12 q4 0 4 4 v10 h-20 z" fill="{CREMA}"/>
<circle cx="32" cy="11" r="7" fill="{CREMA}"/>
""")

add('p-grupo-cuerpo', 'Todo el cuerpo', 'grupo', 'Grupo de temas «Todo el cuerpo».', 'dibujo', f"""
<path d="M17 21 h0 a3 3 0 0 1 3 3 v18 a3 3 0 0 1 -3 3 h-0 a3 3 0 0 1 -3 -3 v-18 a3 3 0 0 1 3 -3 z" transform="rotate(8 17 23)" fill="{GRANA}"/>
<path d="M47 21 h0 a3 3 0 0 1 3 3 v18 a3 3 0 0 1 -3 3 h-0 a3 3 0 0 1 -3 -3 v-18 a3 3 0 0 1 3 -3 z" transform="rotate(-8 47 23)" fill="{GRANA}"/>
<path d="M27.5 44 h0 a3.5 3.5 0 0 1 3.5 3.5 v9 a3.5 3.5 0 0 1 -3.5 3.5 h-0 a3.5 3.5 0 0 1 -3.5 -3.5 v-9 a3.5 3.5 0 0 1 3.5 -3.5 z" fill="{GRANA}"/>
<path d="M36.5 44 h0 a3.5 3.5 0 0 1 3.5 3.5 v9 a3.5 3.5 0 0 1 -3.5 3.5 h-0 a3.5 3.5 0 0 1 -3.5 -3.5 v-9 a3.5 3.5 0 0 1 3.5 -3.5 z" fill="{GRANA}"/>
<path d="M29 15 h6 v7 h-6 z" fill="{GRANA}"/>
<path d="M22 34 h20 v8 q0 4 -4 4 h-12 q-4 0 -4 -4 z" fill="{GRANA}"/>
<path d="M22 24 q0 -4 4 -4 h12 q4 0 4 4 v10 h-20 z" fill="{GRANA}"/>
<circle cx="32" cy="11" r="7" fill="{GRANA}"/>
""")

# ---------- Mapas para la app ----------
SECCIONES = {"embarazo": "p-embarazada", "ninos": "p-nino", "mayores": "p-mayor", "dolor_cabeza": "p-dolor-cabeza", "sueno": "p-sueno", "vista": "p-vista", "boca": "p-boca", "tos_garganta": "p-tos", "corazon": "p-corazon", "digestion": "p-digestion", "diarrea": "p-diarrea", "orina": "p-orina", "colicos": "p-colicos", "piel": "p-piel", "huesos_articulaciones": "p-huesos", "energia": "p-energia", "defensas": "p-defensas", "azucar_peso": "p-azucar-peso"}
GRUPOS = {"cabeza": "p-grupo-cabeza", "pecho": "p-grupo-pecho", "panza": "p-grupo-panza", "piel_huesos": "p-grupo-piel-huesos", "cuerpo": "p-grupo-cuerpo"}
TIPOS = {"alimento": "p-tipo-comida", "habito": "p-tipo-habito", "planta": "p-tipo-planta", "suplemento": "p-tipo-suplemento"}
ENTRADAS = {"frijol": "p-frijol", "tortilla": "p-tortilla", "agua": "p-agua", "caminar": "p-caminar", "dormir_misma_hora": "p-dormir", "lavar_manos": "p-lavar-manos", "guayaba": "p-guayaba", "naranja_limon": "p-naranja-limon", "quelites": "p-quelites", "nopal": "p-nopal", "caldo": "p-caldo", "suero_oral": "p-suero-oral", "manzanilla": "p-manzanilla", "sombrero_sombra": "p-sombrero-sombra", "huevo": "p-huevo", "calabaza": "p-calabaza", "papaya": "p-papaya", "sardina": "p-sardina", "amaranto": "p-amaranto", "avena": "p-avena"}

# Mapas propios de la app (no están en indice.json). Solo ids que existen; se revisa abajo.
APP = {
    "para_quien": {"yo": "p-adulto", "nino": "p-nino", "otra": "p-otra-persona"},
    "edades": {"bebe": "p-bebe", "nino": "p-nino", "12a17": "p-adulto", "18a59": "p-adulto", "60mas": "p-mayor"},
    "embarazo": {"si": "p-embarazada", "lactancia": "p-lactancia", "no": "p-no"},
    # Las señales de alarma todavía no tienen dibujo propio (sistema.md §15.2): se usa la zona del cuerpo.
    "alarma": {"pecho": "p-grupo-pecho", "aire": "p-grupo-pecho", "cerebro": "p-grupo-cabeza", "desmayo": "p-grupo-cabeza",
               "sangre": "p-grupo-cuerpo", "nino_peligro": "p-nino", "apoyo": "p-adulto", "tos": "p-tos", "peso": "p-medir-bascula",
               "molestia": "p-grupo-cuerpo"},
    "mediciones": {"fc": "p-medir-oximetro", "spo2": "p-medir-oximetro", "temp": "p-medir-termometro", "peso": "p-medir-bascula",
                   "talla": "p-medir-estatura", "imc": "p-medir-bascula"},
    "niveles": {"verde": "p-nivel-verde", "ambar": "p-nivel-ambar", "rojo": "p-nivel-rojo"},
}


def compacta(s):
    return "".join(l.strip() for l in s.splitlines() if l.strip())


def generar():
    """Devuelve {ruta: texto} de todo lo generado."""
    ids = [p[0] for p in P]
    assert len(ids) == len(set(ids)) == 75, "75 ids sin repetir"
    out, simbolos = {}, []
    indice = {"version": "2.0", "estilo": ESTILO, "pigmentos": PALETA, "pictos": {},
              "secciones": SECCIONES, "grupos": GRUPOS, "tipos": TIPOS, "entradas": ENTRADAS}
    for id_, titulo, grupo, uso, modo, cuerpo in P:
        c = compacta(cuerpo)
        out[DIR / f"{id_}.svg"] = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img"><title>{titulo}</title><g {ATTR[modo]}>{c}</g></svg>\n'
        simbolos.append(f'<symbol id="{id_}" viewBox="0 0 64 64"><title>{titulo}</title><g {ATTR[modo]}>{c}</g></symbol>')
        indice["pictos"][id_] = {"titulo": titulo, "grupo": grupo, "uso": uso, "modo": modo, "archivo": f"{id_}.svg"}
    faltan = sorted({v for m in (SECCIONES, GRUPOS, TIPOS, ENTRADAS, *APP.values()) for v in m.values()} - set(ids))
    if faltan:
        sys.exit(f"ids que no están en los dibujos: {faltan}")
    sprite = ('<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">\n'
              '<!-- Pictogramas de MediBot, estilo «A · Bordado». Generado por tools/generar_pictos.py; no editar a mano. Ver docs/diseno/sistema.md §8 -->\n'
              + "\n".join(simbolos) + "\n</svg>\n")
    out[DIR / "sprite.svg"] = sprite
    texto_indice = json.dumps(indice, ensure_ascii=False, indent=1)
    out[DIR / "indice.json"] = texto_indice
    datos = {"version": indice["version"], "titulos": {k: v["titulo"] for k, v in indice["pictos"].items()},
             **{k: indice[k] for k in ("secciones", "grupos", "tipos", "entradas")}, **APP}
    out[SALIDA] = ("/* Generado por tools/generar_pictos.py. No editar a mano. */\n"
                   "window.MediBotData = window.MediBotData || {};\n"
                   "window.MediBotData.pictos = " + json.dumps(datos, ensure_ascii=False, indent=1) + ";\n")
    out[GUIA_JS] = ("/* Generado por tools/generar_pictos.py: copia de assets/pictos/indice.json para la guía (funciona con file://). */\n"
                    "window.MediBotPictos = " + texto_indice + ";\n")
    for html in [INDEX, *DISENO]:
        t = html.read_text(encoding="utf-8")
        if "<!-- sprite:inicio -->" not in t:
            if html == INDEX: sys.exit("index.html no tiene las marcas <!-- sprite:inicio --> / <!-- sprite:fin -->")
            continue
        out[html] = re.sub(r"(<!-- sprite:inicio -->).*?(<!-- sprite:fin -->)", lambda m: m.group(1) + "\n" + sprite.strip() + "\n" + m.group(2), t, flags=re.S)
    return out


def main():
    out = generar()
    viejos = [p for p in sorted(DIR.glob("p-*.svg")) if p not in out]
    if "--revisar" in sys.argv:
        malos = [p.relative_to(raiz).as_posix() for p, t in out.items() if not p.exists() or p.read_text(encoding="utf-8") != t]
        malos += [p.relative_to(raiz).as_posix() + " (sobra)" for p in viejos]
        print("pictos: al día" if not malos else "pictos: no están al día (corre tools/generar_pictos.py): " + ", ".join(malos[:6]))
        sys.exit(1 if malos else 0)
    for p in viejos: p.unlink()
    for p, t in out.items(): p.write_text(t, encoding="utf-8", newline="\n")
    print(f"{len(P)} pictogramas: {len(out)} archivos escritos (assets/pictos, index.html, data/pictos.js, docs/diseno)")


if __name__ == "__main__":
    main()
