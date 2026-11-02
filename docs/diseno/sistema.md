# MediBot · Sistema de diseño v1.0

Fecha: 2026-11-02. Alcance: rediseño visual, pantalla de ideas con una idea por pantalla y dibujos propios.

Este documento es la especificación. Lo acompañan:

| Archivo | Qué es |
|---|---|
| `docs/diseno/tokens.css` | Solo variables CSS (claro, oscuro, «Letra grande» e impresión) y las dos `@font-face`. Se importa antes de `css/app.css`. |
| `docs/diseno/componentes.css` | Implementación de referencia de los componentes de §6, hecha solo con tokens. El programador puede copiarla a `css/app.css`. |
| `assets/pictos/` | 75 pictogramas SVG (`p-*.svg`), `sprite.svg` con `<symbol id="p-…">` e `indice.json` (id → título, grupo, uso, y los mapas sección/grupo/tipo/entrada del corpus). |
| `assets/fonts/` | Atkinson Hyperlegible Regular y Bold en woff2, con su `OFL.txt`. |
| `tools/generar_pictos.py` | Copia el sprite a `index.html` y escribe `data/pictos.js`; con `--revisar` comprueba que estén al día (lo usa el lint). |

Lo que NO cambia: las reglas del semáforo (`js/reglas.js`, `data/alarma.js`, `data/rangos.js`), el orden de pantallas de «ahora y pronto» (`js/app.js` ORDEN) y la voz. Este sistema solo dice cómo se ve cada cosa.

---

## 1. Reglas de fondo

1. **Un color, un significado** (§2.3). Verde = sí, sigue, nivel verde. Rojo = no, anterior, nivel rojo, urgencia. Ámbar = solo el nivel amarillo. Añil = escuchar, repetir y foco. Barro = solo el logo y la faja.
2. **La pantalla es el retrato de la consola.** Abajo, siempre, la botonera con los 3 botones físicos en su color y su orden (§6.1). Quien aprende la consola aprende la pantalla, y al revés.
3. **Una cosa por pantalla**, con su dibujo y su voz (Medhi et al. 2011: «Avoid menus that require scrolling», «Minimize hierarchical structures»). A 1280×800 y 1920×1080 nada se desplaza (medido, §12).
4. **El semáforo siempre es forma + color + texto.** Nunca uno solo (§6.10).
5. **Texto de 20 px, nunca menos de 19 px** para la persona (ODPHP 3.3). El panel del operador puede bajar a 16 px.
6. **Toques de 64 px o más**; los de la barra, 80 px. Terminar queda a 24 px o más de todo.
7. **Hecho aquí, no de plantilla** (§9).

---

## 2. Color

### 2.1 Paleta (claro)

Escala de papel y tinta con trabajos fijos por paso, como la escala de 12 pasos de Radix (fondos → controles → bordes → sólidos → texto), pero con solo 8 pasos cálidos.

| Token | Hex | Trabajo | Contraste sobre `--papel` |
|---|---|---|---|
| `--papel` | #F6EFE3 | Fondo de la app | — |
| `--papel-2` | #EEE3D0 | Barras, paneles, lámina del dibujo | 1.11:1 (no es texto) |
| `--papel-3` | #E3D3B9 | Opción elegida | 1.29:1 (no es texto) |
| `--hoja` | #FFFCF6 | Superficie que se lee: tarjeta de idea, caja del 911 | 1.12:1 |
| `--linea` | #D8C8B2 | Separador que **no** se toca | 1.43:1 (decorativo) |
| `--linea-control` | #85725F | Borde de todo lo que se toca | 4.02:1 |
| `--tinta-2` | #5C4A3F | Texto secundario | 7.33:1 |
| `--tinta` | #2A1C15 | Texto | 14.41:1 |
| `--verde` / `--verde-osc` / `--verde-suave` | #2E7346 / #1F5532 / #DFF0E3 | Sí, sigue, nivel verde | 5.02:1 |
| `--ambar` / `--ambar-osc` / `--ambar-suave` | #9A5A0A / #6E3F05 / #FBEBD0 | Solo nivel amarillo | 4.78:1 |
| `--rojo` / `--rojo-osc` / `--rojo-suave` | #B3261E / #8A1C16 / #F9DCD9 | No, anterior, nivel rojo, urgencia | 5.72:1 |
| `--anil` / `--anil-osc` / `--anil-suave` | #2B4C8C / #1D3566 / #DCE4F2 | Escuchar, repetir, foco | 7.31:1 |
| `--barro` / `--barro-osc` | #B5471F / #8E3616 | Solo logo y faja | 4.73:1 |
| `--sem-nd` | #5C4A3F | Etiqueta «sin color» (fijo en los dos temas) | blanco encima 8.38:1 |

### 2.2 Tokens de función (los que usan los componentes)

Los componentes nunca usan la paleta directo, sino estos nombres (patrón de Primer: primitivos → función → componente):

`--fondo`, `--fondo-panel`, `--fondo-elegido`, `--fondo-lectura`, `--texto`, `--texto-2`, `--borde-suave`, `--borde-control`, `--borde-fuerte`; `--sigue`, `--sigue-texto`, `--sigue-canto`, `--sigue-borde`; `--no-borde`, `--no-icono`, `--no-texto`; `--oir`, `--oir-texto`, `--oir-canto`, `--oir-borde`; `--sem-{verde|ambar|rojo}`, `--sem-*-fondo`, `--sem-*-borde`, `--sem-*-texto`, `--sem-nd`, `--sobre-solido`; `--urgente-borde`; `--identidad`, `--identidad-texto`; `--foco`, `--foco-sobre-color`.

### 2.3 Dónde va cada color (y dónde no)

| Color | Sí | Nunca |
|---|---|---|
| Verde | Botón verde de la barra (uno por pantalla), Sí, nivel verde, ✓ de opción elegida | Decoración, enlaces, encabezados, dibujos de interfaz |
| Rojo | Botón rojo de la barra (contorno), No, nivel rojo, caja del 911, borde de «No lo encuentro», lista «Llama al 911 o ve al hospital ya si:» | Avisos que no son urgentes («Cuidado» va en tinta), errores de escritura |
| Ámbar | Nivel amarillo, lista «Ve al centro de salud en estos días si:» | «Cuidado con esto», advertencias generales, la faja |
| Añil | Botón azul (Escuchar, Repetir), foco, la opción de la que habla la voz | Botones de seguir, encabezados, enlaces |
| Barro | Cruz del logo, faja | Cualquier control o texto de lectura |

Los pigmentos de los dibujos (§8.2) son aparte: una olla es de barro aunque el barro no sea un color de interfaz.

### 2.4 Contraste medido

Medido con un script que lee `tokens.css`, resuelve `var()` y aplica la fórmula de WCAG 2.2. Resultado: **72 pares medidos (36 en claro y 36 en oscuro), 0 fallan.** El texto corrido (`--texto` sobre cualquier fondo) queda en 7:1 o más en los dos temas. El texto secundario y las etiquetas en negritas sobre color quedan en AA (4.5:1 o más; AAA de letra grande): `--texto-2` sobre panel 6.60:1, blanco sobre ámbar 5.47:1, blanco sobre verde 5.74:1. Por eso la letra secundaria nunca lleva información que no esté también en la voz o en el texto corrido.

<!-- tabla-contraste -->
| Par (frente / fondo) | Uso | Claro | Oscuro | Mínimo |
|---|---|---|---|---|
| `--texto` / `--fondo` | Texto de lectura sobre la app | 14.41:1 (#2A1C15/#F6EFE3) | 14.94:1 (#F3E9DC/#1E1512) | 7:1 |
| `--texto` / `--fondo-panel` | Texto sobre barra o panel | 12.96:1 (#2A1C15/#EEE3D0) | 13.37:1 (#F3E9DC/#2A1F1A) | 7:1 |
| `--texto` / `--fondo-elegido` | Texto de opción elegida | 11.20:1 (#2A1C15/#E3D3B9) | 11.18:1 (#F3E9DC/#3A2C24) | 7:1 |
| `--texto` / `--fondo-lectura` | Texto en tarjeta de idea / caja 911 | 16.08:1 (#2A1C15/#FFFCF6) | 14.14:1 (#F3E9DC/#251A16) | 7:1 |
| `--texto-2` / `--fondo` | Texto secundario | 7.33:1 (#5C4A3F/#F6EFE3) | 9.30:1 (#C9B8A6/#1E1512) | 4.5:1 |
| `--texto-2` / `--fondo-panel` | Texto secundario en panel | 6.60:1 (#5C4A3F/#EEE3D0) | 8.32:1 (#C9B8A6/#2A1F1A) | 4.5:1 |
| `--texto-2` / `--fondo-lectura` | Fuente / nota en tarjeta | 8.18:1 (#5C4A3F/#FFFCF6) | 8.80:1 (#C9B8A6/#251A16) | 4.5:1 |
| `--borde-control` / `--fondo` | Borde de opción, campo, botón rojo vacío | 4.02:1 (#85725F/#F6EFE3) | 5.63:1 (#A08D7C/#1E1512) | 3:1 |
| `--borde-control` / `--fondo-panel` | Borde de control en panel | 3.62:1 (#85725F/#EEE3D0) | 5.04:1 (#A08D7C/#2A1F1A) | 3:1 |
| `--borde-control` / `--fondo-lectura` | Borde de control en tarjeta | 4.49:1 (#85725F/#FFFCF6) | 5.33:1 (#A08D7C/#251A16) | 3:1 |
| `--sigue-texto` / `--sigue` | Texto blanco en botón verde | 5.74:1 (#FFFFFF/#2E7346) | 5.74:1 (#FFFFFF/#2E7346) | 4.5:1 |
| `--oir-texto` / `--oir` | Texto blanco en botón azul | 8.35:1 (#FFFFFF/#2B4C8C) | 8.35:1 (#FFFFFF/#2B4C8C) | 4.5:1 |
| `--sobre-solido` / `--sem-verde` | Etiqueta / héroe verde | 5.74:1 (#FFFFFF/#2E7346) | 5.74:1 (#FFFFFF/#2E7346) | 4.5:1 |
| `--sobre-solido` / `--sem-ambar` | Etiqueta / héroe ámbar | 5.47:1 (#FFFFFF/#9A5A0A) | 5.47:1 (#FFFFFF/#9A5A0A) | 4.5:1 |
| `--sobre-solido` / `--sem-rojo` | Etiqueta / héroe rojo | 6.54:1 (#FFFFFF/#B3261E) | 6.54:1 (#FFFFFF/#B3261E) | 4.5:1 |
| `--sobre-solido` / `--sem-nd` | Etiqueta «sin color» | 8.38:1 (#FFFFFF/#5C4A3F) | 8.38:1 (#FFFFFF/#5C4A3F) | 4.5:1 |
| `--no-borde` / `--fondo` | Contorno del botón rojo | 5.72:1 (#B3261E/#F6EFE3) | 7.51:1 (#F28B82/#1E1512) | 3:1 |
| `--no-borde` / `--fondo-panel` | Contorno del botón rojo en la barra | 5.15:1 (#B3261E/#EEE3D0) | 6.71:1 (#F28B82/#2A1F1A) | 3:1 |
| `--sem-verde-borde` / `--fondo` | Borde/icono verde sobre papel | 5.02:1 (#2E7346/#F6EFE3) | 8.08:1 (#6FBF85/#1E1512) | 3:1 |
| `--sem-ambar-borde` / `--fondo` | Borde/icono ámbar sobre papel | 4.78:1 (#9A5A0A/#F6EFE3) | 8.52:1 (#E2A93C/#1E1512) | 3:1 |
| `--sem-rojo-borde` / `--fondo` | Borde/icono rojo sobre papel | 5.72:1 (#B3261E/#F6EFE3) | 7.51:1 (#F28B82/#1E1512) | 3:1 |
| `--urgente-borde` / `--fondo-lectura` | Borde de la caja del 911 | 6.38:1 (#B3261E/#FFFCF6) | 7.10:1 (#F28B82/#251A16) | 3:1 |
| `--sem-verde-texto` / `--sem-verde-fondo` | Texto en franja verde suave | 7.37:1 (#1F5532/#DFF0E3) | 10.32:1 (#F3E9DC/#1F3A29) | 7:1 |
| `--sem-ambar-texto` / `--sem-ambar-fondo` | Texto en franja ámbar suave | 7.53:1 (#6E3F05/#FBEBD0) | 11.43:1 (#F3E9DC/#3C2A10) | 7:1 |
| `--sem-rojo-texto` / `--sem-rojo-fondo` | Texto en franja roja suave | 7.20:1 (#8A1C16/#F9DCD9) | 12.58:1 (#F3E9DC/#3F1C19) | 7:1 |
| `--texto` / `--sem-ambar-fondo` | Texto normal en franja ámbar | 14.03:1 (#2A1C15/#FBEBD0) | 11.43:1 (#F3E9DC/#3C2A10) | 7:1 |
| `--texto` / `--sem-rojo-fondo` | Texto normal en franja roja | 12.75:1 (#2A1C15/#F9DCD9) | 12.58:1 (#F3E9DC/#3F1C19) | 7:1 |
| `--texto` / `--anil-suave` | Texto en «opción preguntando» (añil suave) | 12.88:1 (#2A1C15/#DCE4F2) | 11.91:1 (#F3E9DC/#1E2A44) | 7:1 |
| `--foco` / `--fondo` | Contorno de foco sobre papel | 10.48:1 (#1D3566/#F6EFE3) | 8.94:1 (#8FB8FF/#1E1512) | 3:1 |
| `--foco` / `--fondo-panel` | Contorno de foco sobre panel | 9.43:1 (#1D3566/#EEE3D0) | 7.99:1 (#8FB8FF/#2A1F1A) | 3:1 |
| `--foco-sobre-color` / `--sem-rojo` | Foco dentro de franja roja | 6.54:1 (#FFFFFF/#B3261E) | 6.54:1 (#FFFFFF/#B3261E) | 3:1 |
| `--identidad-texto` / `--identidad` | Cruz del logo sobre barro | 5.40:1 (#FFFFFF/#B5471F) | 5.40:1 (#FFFFFF/#B5471F) | 3:1 |
| `--sigue-borde` / `--fondo` | Borde del botón verde contra el papel | 5.02:1 (#2E7346/#F6EFE3) | 8.08:1 (#6FBF85/#1E1512) | 3:1 |
| `--oir-borde` / `--fondo` | Borde del botón azul contra el papel | 7.31:1 (#2B4C8C/#F6EFE3) | 8.94:1 (#8FB8FF/#1E1512) | 3:1 |
| `--sigue-borde` / `--fondo-panel` | Borde del botón verde en la barra | 4.52:1 (#2E7346/#EEE3D0) | 7.23:1 (#6FBF85/#2A1F1A) | 3:1 |
| `--oir-borde` / `--fondo-panel` | Borde del botón azul en la barra | 6.57:1 (#2B4C8C/#EEE3D0) | 7.99:1 (#8FB8FF/#2A1F1A) | 3:1 |

| Par | ΔE visión típica | ΔE deuteranopía | ΔE protanopía | Luminancia deut. |
|---|---|---|---|---|
| verde–ámbar | 62.5 | 34.8 | 25.0 | 1.19:1 |
| verde–rojo | 90.4 | 29.2 | 14.5 | 1.08:1 |
| verde–añil | 72.8 | 58.4 | 61.4 | 1.45:1 |
| verde–barro | 79.9 | 32.5 | 15.8 | 1.26:1 |
| ámbar–rojo | 35.7 | 5.9 | 21.3 | 1.1:1 |
| ámbar–añil | 91.0 | 93.0 | 85.4 | 1.73:1 |
| ámbar–barro | 22.3 | 3.1 | 10.4 | 1.06:1 |
| rojo–añil | 91.5 | 87.4 | 66.3 | 1.58:1 |
| rojo–barro | 14.0 | 5.0 | 11.5 | 1.16:1 |
| añil–barro | 90.8 | 90.7 | 75.2 | 1.83:1 |

**Daltonismo.** La segunda tabla mide ΔE (CIE Lab) entre colores después de simular deuteranopía y protanopía con las matrices de Machado, Oliveira y Fernandes (2009), severidad 1.0, aplicadas en RGB lineal. Ámbar y rojo quedan casi iguales en deuteranopía (ΔE 5.9) y verde contra rojo baja a 14.5 en protanopía: **por eso el color nunca va solo**. Lo que los separa:
- Semáforo: forma (✓ en círculo / ○ con punto / △ con «!» en cuadro) + palabra («Verde», «Amarillo», «Rojo») + frase. La etiqueta roja además lleva doble anillo (§6.10).
- Botones: el verde es sólido con ✓ o flecha; el rojo es contorno con ✗ o flecha a la izquierda; el azul es contorno con bocina. Además, cada uno ocupa siempre el mismo lugar.
- El añil se separa bien de todos (ΔE ≥ 58 en las dos simulaciones), por eso es el color del foco.

Se revisaron capturas con el filtro aplicado a toda la página (§12).

---

## 3. Letra

| Uso | Familia | Notas |
|---|---|---|
| Texto | **Atkinson Hyperlegible** (Braille Institute, OFL 1.1), Regular 400 y Bold 700, en `assets/fonts/` | Hecha para baja visión: letras que no se confunden (I l 1, 0 O con barra, b d). Cubre á é í ó ú ñ ¿ ¡ ü (verificado en el navegador). |
| Títulos y números | **Bahnschrift** (viene con Windows 10 1709 o posterior), respaldo Atkinson | Números de mediciones con `font-variant-numeric: tabular-nums` (clase `.num`). |
| Respaldo final | Segoe UI, Verdana, sans-serif | Nada se carga de internet. |

Escala (`--base` = 20 px; «Letra grande» = 28 px, +40 %):

| Token | rem | px (normal) | px (grande) | Uso |
|---|---|---|---|---|
| `--t-min` | 0.95 | 19 | 26.6 | Piso: ayudas, fuentes, rótulos de la barra |
| `--t-cuerpo` | 1 | 20 | 28 | Texto corrido |
| `--t-destacado` | 1.2 | 24 | 33.6 | Etiqueta de opción, «para qué», pasos |
| `--t-titulo-3` | 1.45 | 29 | 40.6 | Título de bloque, valor de una medida |
| `--t-titulo-2` | 1.9 | 38 | 53.2 | Pregunta de la pantalla |
| `--t-titulo-1` | clamp(1.9rem, 6vw, 2.6rem) | 38–52 | 53–73 | Nombre de la idea |
| `--t-heroe` | clamp(2.1rem, 7.5vw, 3.2rem) | 42–64 | 59–90 | «Amarillo: ve al centro de salud» |
| `--t-911` | clamp(3rem, 15vw, 4.2rem) | 60–84 | 84–118 | El número 911 |
| `--t-vivo` | clamp(3rem, 14vw, 4.8rem) | 60–96 | 84–134 | Número de la medición en vivo |
| `--t-operador` | 0.8 | 16 | 22.4 | Solo panel del operador |

Interlineado 1.45 en texto y 1.1 en títulos (ODPHP: 130–150 %). Línea máxima `--medida: 36em`. Sin mayúsculas sostenidas en ninguna etiqueta (los kicker en mayúsculas se quitan). Los tamaños grandes usan `clamp()` con `vw` solo para no desbordar a 320 px; la base sigue fija hasta conocer la pantalla real (`--base` es la única perilla).

---

## 4. Espacio, tacto y forma

- **Espaciado** en escala de 4, en rem (crece con «Letra grande»): `--e-1` 5 px · `--e-2` 10 · `--e-3` 15 · `--e-4` 20 · `--e-5` 30 · `--e-6` 40 · `--e-7` 60 · `--e-8` 80 (a 20 px de base).
- **Margen lateral** `clamp(16px, 3vw, 2.5rem)`: 16 px a 375, ~38 px a 1280.
- **Tacto** en px (no se encoge): `--toque` 64 (grande 72), `--toque-principal` 80 (88), `--tecla` 52, `--separa-peligro` 24, `--barra-alto` 112 (128).
- **Forma**: bordes de 2, 3 y 5 px; foco de 4 px. Radio 4 px en tarjetas y cajas (papel impreso) y 8 px en controles. El único círculo es la «tecla» que copia el botón físico y la forma del semáforo.
- **Sombras**: ninguna difusa. Solo el «canto» duro de 5 px bajo el botón verde (`--canto`), que dice «esto se aprieta» como una tecla.

---

## 5. Estados y foco

| Estado | Cómo se ve |
|---|---|
| Normal | Borde `--borde-control` (3:1 o más) sobre `--fondo-lectura` |
| Elegido (`aria-pressed="true"`) | Fondo `--fondo-elegido`, borde doble en tinta y ✓ blanco en cuadro verde a la derecha (forma + color) |
| Sí / No contestado | El botón contestado se llena de su color con texto blanco; el otro queda en contorno |
| La opción de la que habla la voz (`.opcion--preguntando`) | Contorno añil de 6 px y fondo `--anil-suave`; `scrollIntoView({block:'center'})` |
| Foco de teclado (`:focus-visible`) | Contorno de 4 px en `--foco` con 3 px de separación (10.48:1 claro, 8.94:1 oscuro). Dentro de una caja de color: `--foco-sobre-color` (blanco). `#app:focus { outline: none }`. |
| Apretado | El botón baja 3 px y pierde el canto |
| Desactivado | Evitarlo. Si hace falta, se oculta el control y la voz dice por qué |
| Midiendo | Barra de avance en tinta (no en color de semáforo) y la frase «Midiendo. No te muevas.» |
| Simulación activa | Franja `.demo` en tinta arriba de todo: «DEMOSTRACIÓN: estas lecturas no son reales» |

`prefers-reduced-motion`: sin transiciones ni animaciones. No hay animaciones de adorno en ningún componente.

---

## 6. Componentes

Todos están implementados en `componentes.css`.

### 6.1 Botonera fija

Retrato de la consola: **azul a la izquierda, rojo en medio, verde ancho a la derecha** (proporción 1 : 1 : 1.6), siempre en la fila de abajo de la pantalla (rejilla de `100dvh`: cabecera / contenido que se desplaza si hace falta / botonera; equivale a `position: sticky; bottom: 0`).

- Cada botón: «tecla» redonda de 52 px del color del botón físico con su dibujo blanco (`p-escuchar`, `p-no`/`p-anterior`/`p-terminar`, `p-si`/`p-siguiente`/`p-imprimir`), la acción en Bahnschrift 24 px y debajo, a 19 px, el nombre del botón físico («botón azul», «rojo largo», «botón verde · siguiente idea»).
- Verde: sólido, texto blanco (5.74:1), canto duro. Rojo y azul: contorno de 3 px y fondo papel.
- La palabra cambia por pantalla (§10); el color y el lugar, nunca.
- A menos de 640 px: tecla arriba y palabra corta abajo (`.corto`: «Oír», «Atrás», «No hay», «Lo tengo», «Imprimir»), sin el rótulo del botón físico; la barra baja a 96 px. Entre botón y botón siempre hay 24 px (`--separa-peligro`), porque el rojo a veces es Terminar.
- Nunca tapa la caja del 911 (medido, §12). No se imprime.

### 6.2 Opción

Botón de ancho completo, 64 px o más, dibujo de 64 px a la izquierda, texto a 24 px y cuadro de marca a la derecha. Rejilla `auto-fit` de columnas de 15 rem o más. Se elige con toque, Enter o el verde cuando la voz la pregunta.

### 6.3 Pregunta sí/no

Una por pantalla (fase 2) o una por tarjeta (ahora). Dibujo de 120 px, pregunta a 38 px, ayuda a 19 px y los botones **✓ Sí** (contorno verde) y **✗ No** (contorno rojo) de 64 px y 9 rem de ancho mínimo, separados 20 px.

### 6.4 Tarjeta de idea (una idea por pantalla)

```
┌── borde superior de 6 px en tinta ─────────────────────────────────────┐
│ ┌────────────┐  [dibujo tipo] Comida · Presión y corazón   (19 px)     │
│ │            │  Frijol de la olla                          (52 px)     │
│ │  lámina    │  Para qué, una o dos líneas                 (24 px)     │
│ │  (27 %)    │  ┌ cuánto ┐ [taza] × 1 [sol] Una taza al día · 🍃🍃 Ayuda algo │
│ │            │  ◇ Cuidado: el aviso de esa idea (siempre)              │
│ └────────────┘  Fuente: nombre corto. Va completa en tu hoja. (19 px)  │
└────────────────────────────────────────────────────────────────────────┘
```

- **Cuánto en pictograma y texto**: medida casera (`p-taza`, `p-cucharadita`, `p-puno`, `p-vaso`) + «× n» en números grandes + frecuencia (`p-al-dia`, `p-en-la-noche`) + la frase. Los números sí se leen (Medhi 2007: «subjects could easily recognize numerals»).
- **Ayuda**: 1, 2 o 3 `p-hojita` en tinta + palabra («Ayuda poco / algo / bastante»).
- Sin borde de color por tipo: el tipo va como dibujo + palabra.
- Sin enlaces de fuente en el quiosco: texto corto.
- A menos de 760 px la lámina pasa arriba, de 9 rem.
- **«Sí lo tengo» y «No lo encuentro»** son los botones verde y rojo de la barra en esta pantalla (no dos botones más dentro de la tarjeta). Así no hay dos botones más por idea (obligarían a decidir en cada tarjeta): el verde ya es «siguiente», solo cambia la palabra.

### 6.5 «No lo encuentro» / «No puedo hacerlo»

Caja con borde rojo de 3 px y fondo panel: título «Si no hay frijol, prueba con:» con ✗ rojo, y 1 o 2 alternativas como filas con dibujo de 56 px, nombre y una línea. En hábitos el título es «Si no puedes, prueba con:» y el botón dice «No puedo hacerlo». Se abre en la misma pantalla, debajo del cuerpo de la idea; el verde sigue siendo «Sí lo tengo».

### 6.6 «Cuidado con esto»

Caja en tinta (borde de 3 px), fondo panel, **rombo** `p-alerta` de 40 px y «Cuidado:» en Bahnschrift. Nunca ámbar ni rojo: no es un nivel del semáforo. El rombo es la señal preventiva de los caminos de México y no se confunde con el △ del nivel rojo.

### 6.7 Franja «Cuándo ir»

Dos cajas lado a lado (una sobre otra a menos de 22 rem): **«Llama al 911 o ve al hospital ya si:»** con borde izquierdo rojo de 10 px, △ y teléfono; **«Ve al centro de salud en estos días si:»** con borde ámbar, ○ y `p-centro-salud`. 4 viñetas cortas como máximo. Va a todo el ancho, después de las ideas de su sección; en fase 2, como pantalla propia.

### 6.8 Caja del 911

Fondo `--hoja`, borde rojo de 5 px, teléfono de 104 px en rojo, «Llama ya al» a 29 px y **911 a 84 px** (60 px en el teléfono), «Llama ya o pide que te lleven al hospital. No manejes tú.» en negritas a 24 px y la línea de medicinas y acompañante a 20 px. Debajo, aparte y más chica, la Línea de la Vida (salvo `apoyo === true`).

### 6.9 Medición en vivo

Dibujo de **cómo** se hace a 160 px (`p-medir-oximetro`, `p-medir-termometro`, `p-medir-bascula`), nombre de la medida, número a 96 px con unidad en palabras («latidos por minuto»), estado («Midiendo. No te muevas.» / «Ya casi.») y barra de avance en tinta. Al terminar, la etiqueta del nivel (6.10). El valor tiene `aria-live="polite"`.

### 6.10 Semáforo

| Nivel | Forma (`p-nivel-*`) | Contenedor de la forma | Color | Texto |
|---|---|---|---|---|
| Verde | ✓ en círculo | círculo | `--sem-verde` | «Verde: puedes cuidarte en casa» |
| Amarillo | ○ con punto | círculo | `--sem-ambar` | «Amarillo: ve al centro de salud» |
| Rojo | △ con «!» | **cuadro** | `--sem-rojo` | «Rojo: urgente» |
| Sin color | raya «–» | — | `--sem-nd` | «Sin color» |

- **Héroe**: fondo suave del nivel, borde izquierdo de 14 px, forma de 112 px y título a 64 px. En rojo se usa `heroe--compacto` (forma de 72 px, título y porqué en una línea): en una urgencia, el héroe es la caja del 911.
- **Etiqueta** (`.nivel`): forma de 1.5 em + texto blanco sobre el sólido, sin partirse en dos renglones. La roja lleva además un doble anillo, para que tenga una segunda señal aparte del tono.

### 6.11 Otros

- **Cabecera**: logo (cruz en barro) + «MediBot», en medio el nombre de la pantalla («Lo que te toca a ti», «Tu resultado») y a la derecha «A+» (Letra grande) y Terminar, separados 24 px. Debajo, la faja de 10 px. El botón de tema sale de la barra pública.
- **Qué hacer ahora**: lista de 3 pasos como máximo con número en círculo de 44 px, dibujo de 52 px y texto a 24 px.
- **Lo que medimos**: filas con dibujo, nombre, valor a 29 px y etiqueta; la etiqueta pasa abajo cuando la columna mide menos de 24 rem (consulta de contenedor).
- **Diálogo `dlg-borrar`**: mismo lenguaje; «¿Quieres seguir con tu consulta?», verde «Sí, seguir» (`.fisico--verde`) y rojo «No, borrar todo» (`.fisico--rojo`), con la cuenta regresiva en `.num`.

---

## 7. Modo oscuro y «Letra grande»

- **Oscuro** (sigue al sistema o `data-theme="dark"`): papel café muy oscuro #1E1512, tinta crema #F3E9DC. Los sólidos del semáforo y del añil **no cambian** (el blanco encima sigue en 5.5–8.4:1); cambian los bordes e iconos sobre papel a sus versiones claras (#6FBF85, #E2A93C, #F28B82, #8FB8FF) y los fondos suaves a tonos oscuros. Los botones verde y azul ganan un borde claro para que su silueta tenga 3:1 contra el fondo (sin él, el azul daba 2.15:1: el script lo detectó y se corrigió). La forma del héroe y las teclas roja y azul llevan un anillo del color de borde: en claro no se nota y en oscuro dibuja su silueta con 3:1 o más. La cruz del logo queda en barro original. Los dibujos cambian solos: su contorno es el token `--picto-contorno` (#2B1D16 en claro, crema #F3E9DC en oscuro, #2B1D16 en la hoja impresa) y los glifos usan `currentColor`.
- **Letra grande** (`data-scale="lg"`): `--base` 28 px, toques de 72 px, barra de 128 px. El resultado rojo muestra la caja del 911 completa, sin desplazar, a 375×812 y 1280×800, también con «Letra grande» y en claro y oscuro, en los 6 rojos (oxígeno y las 5 preguntas rojas): el encabezado rojo dice el porqué en una línea corta y, con letra grande, la caja se compacta (ronda de correcciones, criterio 32, medido con `tools/e2e_ronda2.py`). Antes de esa ronda esto NO se cumplía con letra grande ni con las preguntas rojas a 375; las pantallas de ideas y de resultado amarillo **sí se desplazan** en el centro (la barra queda fija). Es el costo de +40 % de letra y está medido (§12).

---

## 8. Pictogramas

### 8.1 Estilo «A · Bordado» (criterio 77, decisión de diseño del 2026-11-02)

- viewBox `0 0 64 64`, fondo transparente, `<title>` en español.
- **Dibujos**: formas planas con contorno de 2.5 (detalles de 1.2 a 1.8), uniones y puntas redondas. El contorno de lo que
  toca el fondo es `var(--picto-contorno, #2B1D16)`: el token de `css/tokens.css` lo pone oscuro en claro y crema en oscuro
  (contraste ≥ 3:1 contra el papel en los dos temas; lo revisa `tests/pictos.test.mjs`). Los detalles encima de un relleno
  van en contorno o crema fijos. La puntada (línea punteada) va solo donde ayuda.
- **Glifos** (acciones, semáforo, alerta, hojita): una sola tinta `currentColor`, trazo grueso, para ir blancos sobre un
  botón de color o del color del texto: `p-escuchar`, `p-imprimir`, `p-siguiente`, `p-anterior`, `p-si`, `p-no`,
  `p-terminar`, `p-alerta`, `p-nivel-verde`, `p-nivel-ambar`, `p-nivel-rojo`, `p-hojita`.
- Formas que no cambian: verde = ✓ en círculo, ámbar = círculo con punto, rojo = triángulo con «!», alerta = **rombo** con
  «!» (§6.10); `p-llamar-911` es un teléfono crema en círculo grana.
- Sin degradados, brillos, sombras, opacidad, emoji ni texto (la «z» de dormir es trazo).
- Gente de aquí: piel morena, pelo negro, rebozo, trenza, sombrero de palma, canas en las personas mayores. Proporciones
  adultas para adultos; solo el niño o la niña tiene cabeza grande.
- Dignidad: diarrea, orina, cólicos y digestión se dibujan con objetos (taza de baño estilizada con gota, vaso, panza
  vestida con mano), nunca con cuerpos expuestos ni personas haciendo del baño.
- Comida de aquí, reconocible: nopal con tuna, quelites, tortilla, frijol en olla, alegría de amaranto, guayaba, calabaza,
  papaya, sardina, huevo, avena, naranja y limón, caldo, jarro de té, manzanilla.
- Grupos del cuerpo: el mismo cuerpo de frente, con la zona marcada en color fuerte y el resto en crema (se distingue
  también en gris).

### 8.2 Paleta (solo dibujos; nunca es color de interfaz)

grana #B3261E · añil #2F4F8F · ocre #D49A2A · verde #3E7D4F · piel #8A5A3C · crema #FFF8EE · azul agua #7FA7D9 ·
contorno #2B1D16. Ningún otro color: lo revisan `tests/pictos.test.mjs` y `docs/diseno/herramientas/validar_pictos.py`
(este último también desde el lint).

### 8.3 Inventario (75; los mismos ids y archivos desde la v0.4)

| Grupo | Ids |
|---|---|
| Personas (7) | `p-adulto`, `p-mayor`, `p-embarazada`, `p-lactancia`, `p-nino`, `p-bebe`, `p-otra-persona` |
| Mediciones (4) | `p-medir-oximetro`, `p-medir-termometro`, `p-medir-bascula`, `p-medir-estatura` |
| Acciones (10) | `p-escuchar`, `p-imprimir`, `p-siguiente`, `p-anterior`, `p-si`, `p-no`, `p-terminar`, `p-centro-salud`, `p-llamar-911`, `p-alerta` |
| Semáforo (3) | `p-nivel-verde`, `p-nivel-ambar`, `p-nivel-rojo` |
| Medidas y frecuencia (7) | `p-taza`, `p-cucharadita`, `p-puno`, `p-vaso`, `p-al-dia`, `p-en-la-noche`, `p-hojita` |
| Tipos (4) | `p-tipo-comida`, `p-tipo-habito`, `p-tipo-planta`, `p-tipo-suplemento` |
| Comida y hábitos (20) | `p-frijol`, `p-tortilla`, `p-agua`, `p-caminar`, `p-dormir`, `p-lavar-manos`, `p-guayaba`, `p-naranja-limon`, `p-quelites`, `p-nopal`, `p-caldo`, `p-suero-oral`, `p-manzanilla`, `p-sombrero-sombra`, `p-huevo`, `p-calabaza`, `p-papaya`, `p-sardina`, `p-amaranto`, `p-avena` |
| Secciones (15 propias + 3 de persona) | `p-dolor-cabeza`, `p-sueno`, `p-vista`, `p-boca`, `p-tos`, `p-corazon`, `p-digestion`, `p-diarrea`, `p-orina`, `p-colicos`, `p-piel`, `p-huesos`, `p-energia`, `p-defensas`, `p-azucar-peso`; «embarazo» → `p-embarazada`, «ninos» → `p-nino`, «mayores» → `p-mayor` |
| Grupos del cuerpo (5) | `p-grupo-cabeza`, `p-grupo-pecho`, `p-grupo-panza`, `p-grupo-piel-huesos`, `p-grupo-cuerpo` (el mismo cuerpo de frente con la zona en color fuerte, grana o añil, y el resto en crema) |

`indice.json` trae los mapas listos: `secciones` (las 18 de `data/corpus.js`), `grupos` (los 5), `tipos` (alimento, habito, planta, suplemento) y `entradas` (los 20 ids del corpus). Para usarlos, el campo `dibujo` del corpus pasa de emoji a id (`"dibujo": "p-frijol"`), lo que quita de secciones y grupos los emoji (dos de ellos no existen en Windows 10). **Solo 20 de las 138 entradas tienen dibujo propio**: mientras se dibujan las otras 118, su tarjeta muestra el dibujo de su tipo (`indice.json → tipos`) y su nombre en grande, nunca un emoji. Las entradas del corpus no tienen hoy un campo `dibujo`: hay que agregarlo (o usar `indice.json → entradas`).

### 8.4 Cómo se usan

- **Fuente única**: `tools/generar_pictos.py` (los 75 dibujos, sus títulos y usos, y los mapas). Escribe
  `assets/pictos/*.svg`, `sprite.svg`, `indice.json`, el sprite dentro de `index.html` y de las páginas de `docs/diseno`,
  `data/pictos.js` y `docs/diseno/herramientas/indice_pictos.js`. Nada de eso se edita a mano. Regenerar:
  `PYTHONUTF8=1 python tools/generar_pictos.py`;
  `--revisar` solo comprueba que esté al día (lo usa el lint).
- **En la app**: `<svg class="pic" aria-hidden="true"><use href="#p-frijol"/></svg>` (Electron carga con `file://` y
  Chromium no deja usar `<use href="archivo.svg#id">` entre archivos). Si el dibujo es el único rótulo:
  `role="img" aria-label="Frijol"`.
- **En la hoja impresa**: los mismos símbolos a 12 mm (`--pict-hoja`), con el contorno oscuro de impresión.

### 8.5 Verificado y pendiente

- Verificado con un script de validación (con lista permitida de elementos y atributos; se probó que rechaza `<script>` en otro espacio de nombres, `<style>` con `@import`, `<set>` con `javascript:`, `style=` y `fill=url()` externos y `onclick`): 75 SVG con XML válido, sin scripts, sin eventos, sin enlaces externos, con `<title>` y viewBox 64, el más pesado de 2,284 B (límite 6 KB), solo colores de la paleta «A · Bordado» (2026-11-02); sprite e índice coinciden con los archivos.
- **Estilo «A · Bordado» (2026-11-02)**: hojas de contacto de los 75 a 112 y 48 px, en claro y oscuro, revisadas y aprobadas. La medición de pares en gris de abajo es de los dibujos anteriores: hay que repetirla con los nuevos.
- **A 48 px y en gris, dibujos anteriores**: se renderizaron los 75 a 48 px en escala de grises y se compararon los 2,775 pares. Todo par difiere en al menos una zona de 12×12 px por 0.33 o más (diferencia media de 0 a 1; el par más cercano es calabaza contra frijol). Los de diferencia global más baja son los 5 grupos del cuerpo, que solo cambian de zona; por eso la zona va en tierra oscura (#5A2E22), que en gris sale casi negra; no se usa el barro de la marca para esto.
- **Pendiente (no verificable aquí): probarlos con personas de la comunidad.** Dowse y Ehlers mostraron que los pictogramas locales ganan a los de USP (20 de 23 contra 11 de 23 en el criterio ANSI de 85 % en Xhosa, 2001), y que la comprensión depende de la alfabetización en salud. Protocolo sugerido: 10 personas por grupo de edad, mostrar el dibujo solo y preguntar «¿qué es?» o «¿qué te dice que hagas?»; pasa con 85 % (ANSI) y si no, se redibuja. Los más dudosos, a probar primero: `p-defensas` (escudo, metáfora), `p-energia`, `p-digestion` (órgano), `p-colicos`, `p-orina` (frasco), `p-tipo-habito` (sol con flecha), `p-medir-oximetro` y los 5 grupos del cuerpo.

---

## 9. Reglas «anti-plantilla» y culturales

**No se usa:**
- Degradados (morados, azules o de cualquier color), vidrio esmerilado, brillos, sombras difusas, desenfoques.
- Tarjetas redondeadas idénticas en rejilla como recurso por defecto. Aquí hay una cosa por pantalla; las cajas son casi rectas (radio 4 px) y cada una tiene una forma distinta según su función (borde superior en tinta, borde izquierdo de nivel, borde de 5 px del 911).
- Inter, Poppins, Space Grotesk ni ninguna letra de moda: Atkinson Hyperlegible y Bahnschrift, elegidas por legibilidad y porque ya están en Windows o vienen en el proyecto.
- Emoji como iconos (fallan en Windows 10 y salen rubios) e ilustraciones de «personas planas corporativas» (figuras de piernas largas, colores pastel, sin rasgos).
- Mayúsculas sostenidas, kicker en gris, texto chico de adorno, iconos de línea fina.

**Sí se usa:**
- Papel y tinta, reglas gruesas y bordes duros, como un cartel de salud comunitaria o la Cartilla Nacional de Salud.
- Una faja geométrica propia (zigzag claro sobre barro con puntos de tinta). Nunca grecas de Mitla, rombos de un huipil concreto ni otro motivo reconocible de un pueblo.
- Dibujos con gente morena, ropa y objetos de aquí, en proporciones adultas, sin caricatura.
- Palabras de la persona en la pantalla («Lo que te toca a ti», «Llama ya», «No manejes tú»), tuteo y frases cortas.

**Respeto:**
- Nunca un dibujo que ridiculice ropa, cuerpo o costumbre.
- La persona mayor tiene bastón y lentes, no cara de abuelita de caricatura.
- «Otra persona» es un adulto, no un niño.
- Antes de producción, los dibujos se prueban con personas de la comunidad (§8.5) y se cambian según lo que digan.

---

## 10. Pantalla por pantalla

Esquema de cada pantalla: **arriba** (cabecera, 72 px + faja), **centro** (se desplaza solo si no cabe) y **abajo** (botonera, 112 px). Entre corchetes, los botones de la barra: [azul · rojo · verde]. Lo que cada botón **hace** lo decide `js/voz.js`; aquí solo cómo se ve.

| Pantalla | Arriba | Centro | Abajo: [azul · rojo · verde] |
|---|---|---|---|
| **Reposo** | Solo el logo grande y la faja (sin pasos, sin Terminar, sin panel del operador) | 3 dibujos de 160 px: `p-medir-oximetro`, `p-medir-termometro`, `p-medir-bascula`, con una palabra cada uno. Lema: «Te medimos y te damos ideas para cuidarte. No es una consulta.» | Dibujo de la consola con la frase «Aprieta el verde o toca la pantalla». Toda la pantalla es un botón. |
| **Bienvenida** | Cabecera | Aviso corto y quién lo hizo. El aviso legal completo se oye con el azul. | [Escuchar el aviso · Atrás · Empezar] |
| **Sobre ti** | Cabecera «Sobre ti» | Fase 2: una pregunta por pantalla. «¿Para quién es?»: 3 opciones de 2 líneas con `p-adulto`, `p-nino`, `p-otra-persona` a 64 px. Edad: opciones con dibujo (`p-bebe`, `p-nino`, `p-adulto`, `p-mayor`). Embarazo: pregunta sí/no con `p-embarazada` y «Esta pregunta es solo para mujeres». Peso: `p-medir-bascula` y el número en vivo. | [Escuchar · Atrás · Siguiente] |
| **Medicinas** | Cabecera «Tus medicinas» | «¿Tomas alguna medicina todos los días?» (pregunta sí/no). Si sí: opciones de 3 columnas con dibujos propios (pendientes de dibujar; no se usa 💉 ni 🍬). | [Escuchar · No · Sí] durante la pregunta; [Escuchar · Atrás · Siguiente] en la lista |
| **Señales de alarma** | Cabecera «Preguntas importantes» + «Pregunta 3 de 9» | Una pregunta sí/no por pantalla con su dibujo. Con un «sí» rojo: la franja roja aparece arriba del centro (`bannerRojo.scrollIntoView`) y el botón verde **sigue verde** pero dice «Ver qué hacer ahora» con △; «Continuar a medir» deja de ser principal (ver §14). | [Escuchar · No · Sí] → con sí rojo: [Escuchar · Me equivoqué · Ver qué hacer ahora] |
| **Mediciones** | Cabecera «Te medimos» | Una medición a la vez (6.9): dibujo grande de cómo, número en vivo, estado. La nota de piel morena del oxímetro a 20 px con ◇. | [Escuchar · Saltar · Medir] |
| **¿Qué te gustaría cuidar?** | Cabecera | Los 5 grupos del cuerpo (`p-grupo-*`) como opciones grandes; al abrir uno, sus secciones con su dibujo (`indice.json → secciones`). | [Escuchar · No · Sí] |
| **¿Está bien esto?** | Cabecera «Revisa tus datos» | Filas: dibujo de 44 px + etiqueta (sin mayúsculas, 19 px) + valor a 24 px + «Cambiar» (contorno, 64 px). | [Escuchar · Corregir · Está bien] |
| **Resultado verde** | Cabecera «Tu resultado» | Héroe verde. Dos columnas: «Qué hacer ahora» (3 pasos; el 3.º «Aunque hoy salió verde… llama al 911» con `p-llamar-911`) y «Lo que medimos». | [Repetir · Atrás · Ver ideas para ti] |
| **Resultado amarillo** | Cabecera «Tu resultado» | Héroe ámbar. «Qué hacer ahora» con el paso de embarazo primero si aplica y «Lo que medimos». | [Repetir · Anterior · Ver ideas para ti] |
| **Resultado rojo** | Cabecera sin Terminar | Héroe rojo compacto (porqué en una línea) y **caja del 911 justo debajo, completa y visible** a 1280×800, 1920×1080, 768 y 375×812. Línea de la Vida aparte y chica. Sin safety netting, tabla vacía ni «Paso X de Y». | [Repetir · Terminar · Imprimir hoja para llevar] |
| **Ideas** | Cabecera «Lo que te toca a ti»; fila con «Idea 2 de 4», miniaturas de 56 px (la actual con borde de 4 px en tinta) y «Para ti, que…» | Una tarjeta de idea (6.4) a todo el ancho; «No lo encuentro» se abre debajo (6.5). «Cuándo ir» como pantalla propia al terminar las ideas de su sección (6.7). | [Escuchar esta · No lo encuentro / No puedo hacerlo · Sí lo tengo] |
| **Tu hoja** | Cabecera «Tu hoja de hoy» | Vista previa de la hoja: forma del semáforo grande, qué hacer, ideas con su dibujo. «No dejes esta hoja aquí.» | [Escuchar · Terminar · Imprimir mi hoja] |
| **Configuración del operador** | Franja en tinta «Panel del operador» (no hay faja; se distingue del flujo público) | Controles de 48 px o más y texto de 16 px o más (`--t-operador`): sensores, simulación (con la franja DEMOSTRACIÓN), tema, voz, altitud, evidencia. Solo se abre con el gesto (logo apretado 5 segundos o Ctrl+Alt+Shift+O). | Sin botonera pública: botón «Cerrar panel» |

Tamaños de pantalla: las maquetas de diseño de ideas y de resultado se midieron a 1280×800, 1920×1080, 1440×900, 768×1024, 375×812 y 320×640 (§12). A 768 y menos el centro se desplaza si no cabe; nunca hay desborde horizontal.

---

## 11. Hoja impresa

Carta, una página, en blanco y negro o a color. Tokens de `@media print` en `tokens.css`:
- Arriba a la izquierda, la **forma del semáforo de 25 mm** con el nombre del nivel a 16 pt. Debajo, en una línea de 11 pt: «Hoja de orientación. No es diagnóstico ni consulta médica».
- «Qué hacer ahora» a 12 pt. «Cuándo ir» y teléfonos a 11–12 pt en la mitad de arriba, con `p-llamar-911` y `p-centro-salud`.
- Ideas a 11 pt en una columna, cada una con su dibujo de 12 mm y «Si no lo consigues: X». (UKAAF pide 12 pt como mínimo; las ideas van a 11 pt para que la hoja quepa en una carta. Si la prueba E3b deja espacio, subir a 12 pt.)
- El bloque de impresión de `tokens.css` pesa lo mismo que los de modo oscuro y «Letra grande» y va después: la hoja sale en tinta negra sobre blanco a 12 pt aunque el quiosco esté en oscuro o con letra grande (verificado con `emulate_media(print)`, §12). `componentes.css` oculta la botonera y los botones de la cabecera y usa `--forma-nivel` y `--pict-hoja`.
- Sin barra, sin cabecera de pantalla, sin fondos de color: los dibujos se imprimen con su contorno (en gris se siguen distinguiendo, §8.5). La faja, si se imprime, como una línea de 1 mm.
- La hoja no depende del color: forma + palabra del nivel.

---

## 12. Verificación (2026-11-02)

Servidor: `python -m http.server 8820 --bind 127.0.0.1` sobre la raíz del proyecto; mediciones con Playwright y chromium sobre las tres maquetas de diseño (ideas, resultado amarillo y resultado rojo).

<!-- tabla-mediciones -->
**Resumen:** 30 capturas; desborde horizontal en 0; errores de consola o peticiones fallidas en 0; botones de menos de 60 px en 0; texto de menos de 19 px en 0. Las tres maquetas caben sin desplazarse a 1280×800, 1440×900 y 1920×1080, en claro, oscuro, deuteranopía y protanopía. No caben con «Letra grande» a 1280×800 (el centro se desplaza y la barra queda fija) ni a 768 o menos (se desplaza en vertical, sin desborde). El 911 queda completo arriba de la barra en todas las vistas del rojo salvo 320×640 (pantalla de 640 px de alto, fuera de los tamaños del quiosco), donde se ve al desplazar.

| Captura | scrollWidth ≤ innerWidth | Centro cabe sin desplazarse | 911 completo arriba de la barra | Texto mínimo | Botones < 60 px | Errores de consola / peticiones fallidas |
|---|---|---|---|---|---|---|
| `cap_ideas_1280x800` | sí | sí (593/593 px) | — | 19 px | 0 | 0 / 0 |
| `cap_ideas_1920x1080` | sí | sí (873/873 px) | — | 19 px | 0 | 0 / 0 |
| `cap_ideas_1440x900` | sí | sí (693/693 px) | — | 19 px | 0 | 0 / 0 |
| `cap_ideas_768x1024` | sí | **no** (841/721 px) | — | 19 px | 0 | 0 / 0 |
| `cap_ideas_375x812` | sí | **no** (1178/568 px) | — | 19 px | 0 | 0 / 0 |
| `cap_ideas_320x640` | sí | **no** (1299/396 px) | — | 19 px | 0 | 0 / 0 |
| `cap_resultado_ambar_1280x800` | sí | sí (593/593 px) | — | 19 px | 0 | 0 / 0 |
| `cap_resultado_ambar_1920x1080` | sí | sí (873/873 px) | — | 19 px | 0 | 0 / 0 |
| `cap_resultado_ambar_1440x900` | sí | sí (693/693 px) | — | 19 px | 0 | 0 / 0 |
| `cap_resultado_ambar_768x1024` | sí | **no** (896/793 px) | — | 19 px | 0 | 0 / 0 |
| `cap_resultado_ambar_375x812` | sí | **no** (1233/568 px) | — | 19 px | 0 | 0 / 0 |
| `cap_resultado_ambar_320x640` | sí | **no** (1471/396 px) | — | 19 px | 0 | 0 / 0 |
| `cap_resultado_rojo_1280x800` | sí | sí (593/593 px) | sí | 19 px | 0 | 0 / 0 |
| `cap_resultado_rojo_1920x1080` | sí | sí (873/873 px) | sí | 19 px | 0 | 0 / 0 |
| `cap_resultado_rojo_1440x900` | sí | sí (693/693 px) | sí | 19 px | 0 | 0 / 0 |
| `cap_resultado_rojo_768x1024` | sí | sí (771/771 px) | sí | 19 px | 0 | 0 / 0 |
| `cap_resultado_rojo_375x812` | sí | **no** (591/568 px) | sí | 19 px | 0 | 0 / 0 |
| `cap_resultado_rojo_320x640` | sí | **no** (681/396 px) | **no** | 19 px | 0 | 0 / 0 |
| `cap_ideas_1280x800_oscuro` | sí | sí (593/593 px) | — | 19 px | 0 | 0 / 0 |
| `cap_ideas_1280x800_grande` | sí | **no** (878/471 px) | — | 26.6 px | 0 | 0 / 0 |
| `cap_resultado_ambar_1280x800_oscuro` | sí | sí (593/593 px) | — | 19 px | 0 | 0 / 0 |
| `cap_resultado_ambar_1280x800_grande` | sí | **no** (1010/540 px) | — | 26.6 px | 0 | 0 / 0 |
| `cap_resultado_rojo_1280x800_oscuro` | sí | sí (593/593 px) | sí | 19 px | 0 | 0 / 0 |
| `cap_resultado_rojo_1280x800_grande` | sí | **no** (624/540 px) | sí | 26.6 px | 0 | 0 / 0 |
| `cap_ideas_1280x800_deuteranopia` | sí | sí (593/593 px) | — | 19 px | 0 | 0 / 0 |
| `cap_ideas_1280x800_protanopia` | sí | sí (593/593 px) | — | 19 px | 0 | 0 / 0 |
| `cap_resultado_ambar_1280x800_deuteranopia` | sí | sí (593/593 px) | — | 19 px | 0 | 0 / 0 |
| `cap_resultado_ambar_1280x800_protanopia` | sí | sí (593/593 px) | — | 19 px | 0 | 0 / 0 |
| `cap_resultado_rojo_1280x800_deuteranopia` | sí | sí (593/593 px) | sí | 19 px | 0 | 0 / 0 |
| `cap_resultado_rojo_1280x800_protanopia` | sí | sí (593/593 px) | sí | 19 px | 0 | 0 / 0 |
| `cap_guia_1280x800` | sí | — (—/— px) | — | 19 px | 0 | 0 / 0 |
| `cap_guia_1920x1080` | sí | — (—/— px) | — | 19 px | 0 | 0 / 0 |
| `cap_guia_1440x900` | sí | — (—/— px) | — | 19 px | 0 | 0 / 0 |
| `cap_guia_768x1024` | sí | — (—/— px) | — | 19 px | 0 | 0 / 0 |
| `cap_guia_375x812` | sí | — (—/— px) | — | 19 px | 0 | 0 / 0 |
| `cap_guia_320x640` | sí | — (—/— px) | — | 19 px | 0 | 0 / 0 |
| `cap_guia_1280x800_deuteranopia` | sí | — (—/— px) | — | 19 px | 0 | 0 / 0 |
| `cap_guia_375x812_deuteranopia` | sí | — (—/— px) | — | 19 px | 0 | 0 / 0 |
| `cap_guia_1280x800_oscuro` | sí | — (—/— px) | — | 19 px | 0 | 0 / 0 |

Otras verificaciones:
- Validación de los SVG: 75 pictogramas revisados, 0 con fallas, peso máximo 2,853 B.
- Comparación de los 75 dibujos a 48 px en gris (2,775 pares): diferencia local mínima 0.33 (`p-calabaza` contra `p-frijol`); los grupos del cuerpo, que solo cambian de zona, quedan entre 0.33 y 0.55.
- Atkinson Hyperlegible cargada (`document.fonts.check`) en las 30 capturas; cubre á é í ó ú ñ ¿ ¡ ü ° · × – « » (prueba de ancho en canvas, 0 faltantes).
- Impresión (`emulate_media(print)` en las 3 maquetas): en claro, en oscuro del sistema, con `data-theme=dark` y con «Letra grande», `--tinta` = #000000, `--papel` = #FFFFFF, `--base` = 12pt, título en rgb(0, 0, 0) y la botonera oculta.
- Terminar (o «Salir») queda a 24 px o más de cualquier otro botón a 1280, 375 y 320 px en las 3 maquetas (distancia mínima medida: 24 px).
- Siluetas en oscuro con el anillo de borde: héroe verde 5.58:1, ámbar 6.52:1 y rojo 6.32:1 contra su fondo suave; tecla azul 7.99:1 y roja 6.71:1 contra la barra.
- **Revisión independiente**: rechazó la primera versión con 1 bloqueante (la hoja salía crema sobre blanco en modo oscuro), 3 mayores (Terminar a 20 px, botón rojo atado a la tecla verde en la alarma, validador permisivo) y 8 menores. Los 4 primeros y 6 menores se corrigieron y se volvieron a medir aquí; 2 menores quedan documentados (ideas a 11 pt en la hoja, y las 118 entradas sin dibujo propio en §8.3 y §15). Sus recálculos independientes de 41 pares de contraste coincidieron con la tabla.

---

## 13. De dónde salió cada decisión

### 13.1 Sistemas de diseño consultados

| Sistema | Qué se tomó |
|---|---|
| Radix Themes y Radix Colors (escala de 12 pasos) | Que cada paso de la escala tenga un trabajo fijo (fondo, control, borde, sólido, texto) y que el modo oscuro sea «la misma escala reasignada, no un filtro». Lo apliqué a papel/tinta (8 pasos) y a los tokens `--sem-*` (sólido, fondo, borde, texto). |
| Primer (GitHub) | Nombres por función (`--fondo`, `--texto-2`, `--sem-ambar-borde`) en lugar de colores; temas para daltonismo como parte del sistema; el contraste revisado por script y no a ojo; bordes y rellenos en vez de sombras. |
| Lista «awesome-design-systems» | La lista para comparar sistemas de gobierno (GOV.UK) y la idea de que una guía de voz es parte del sistema. |
| SmartHR UI | Documentar el porqué de cada regla junto a la regla, con la accesibilidad dentro de los componentes. |

No se tomó nada visual de sitios de animación, 3D ni «Awwwards»: van contra la regla de sobriedad.

### 13.2 Referencias externas (abiertas el 2026-11-02)

| Referencia | URL | Qué se tomó |
|---|---|---|
| GOV.UK Design System, Colour | https://design-system.service.gov.uk/styles/colour/ | Colores con nombre de función y un color reservado solo para el foco («Only use this colour to indicate which element is focused on»). Aquí el foco es añil porque el amarillo de GOV.UK chocaría con el ámbar del semáforo. |
| GOV.UK Design System, Button | https://design-system.service.gov.uk/components/button/ | Un solo botón principal por pantalla; el botón de peligro no depende solo del rojo y lleva confirmación (Terminar → `dlg-borrar`). |
| NHS Service Manual, Colour | https://service-manual.nhs.uk/design-system/styles/colour | «Don't rely on colour alone», apuntar a AAA, probar con simulador de daltonismo; el verde como color de botón. |
| NHS Service Manual, Care cards | https://service-manual.nhs.uk/design-system/components/care-cards | Tres niveles de atención con cajas distintas, la de emergencia con su número y sin otros enlaces; ordenar por gravedad. Base de la caja del 911 y de la franja «Cuándo ir». |
| Medhi, Patnaik, Brunskill, Gautama, Thies y Toyama (2011), ACM ToCHI | https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/ToCHI2711_Medhi.pdf | Pistas gráficas, voz en todo, menos jerarquía, «Avoid menus that require scrolling», dibujos estáticos hechos a mano mejor que fotos o iconos. |
| Medhi, Sagar y Toyama (2007), interfaces sin texto | https://ocw.mit.edu/courses/mas-965-nextlab-i-designing-mobile-technologies-for-the-next-billion-users-fall-2008/8ccecb3eacd514b7ea0255f5158de907_MITMAS_965F08_medhi2007.pdf | Preferencia por dibujos semiabstractos; demasiada abstracción confunde (las flechas animadas no se entendieron y los cochecitos sí); los números sí se leen; una ayuda constante en el mismo lugar (la botonera). |
| Dowse y Ehlers (2001), Patient Education and Counseling 45(2):87-99, PMID 11687321 | https://pubmed.ncbi.nlm.nih.gov/11687321/ | 46 personas xhosa con 7 años de escuela o menos: 20 de 23 pictogramas locales pasaron el criterio ANSI de 85 % contra 11 de 23 de USP, y prefirieron los locales. Base de dibujar con objetos de aquí y probar con la comunidad. (El dato de 2004, 12 contra 2 de 23, viene de un resumen de búsqueda; no lo pude abrir.) |
| Seguimiento 2023 del mismo grupo, Health SA Gesondheid | https://hsag.co.za/index.php/hsag/article/view/2192 | 90 adultos, 10 pictogramas locales, 8 pasaron el criterio ISO de 66.7 %; la comprensión baja con la edad y con poca alfabetización en salud. Por eso la prueba debe incluir personas mayores. |
| Health ATM rural (Digital Health News) | https://www.digitalhealthnews.com/the-impact-of-health-atms-in-revolutionizing-rural-healthcare | Quiosco tipo cajero con pantalla táctil, pocas mediciones y operación asistida; la nota no describe interfaz para baja alfabetización, así que solo tomo el modelo de «cajero» (pocos pasos, botones fijos). |
| Secretaría de Salud, Cartillas Nacionales de Salud | https://www.gob.mx/salud/articulos/cartillas-nacionales-de-salud | Los 5 grupos de cartilla (0–9, 10–19, mujer y hombre 20–59, 60 o más). Tomo el tono de documento oficial claro, impreso; no sus colores. |
| Radix Colors, escala | https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale | Trabajo de cada paso (1–2 fondos, 3–5 controles, 6–8 bordes, 9–10 sólidos, 11–12 texto). |
| Machado, Oliveira y Fernandes (2009) | https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html | Matrices de deuteranopía y protanopía de severidad 1.0 para el script y para el filtro de las capturas. |
| Atkinson Hyperlegible (repositorio oficial de Google Fonts) | https://github.com/googlefonts/atkinson-hyperlegible | Los woff2 Regular y Bold (`fonts/webfonts/`) y `OFL.txt`. |

ODPHP Health Literacy Online 3.3 (19 px para personas mayores) y UKAAF (12 pt mínimo en papel) se toman de revisiones anteriores del proyecto; no se volvieron a abrir para este documento.

---

## 14. Propuestas anteriores y cómo quedaron

| Tema | Propuesta anterior | Este sistema |
|---|---|---|
| «Sí lo tengo» / «No lo encuentro» | Descartado: dos botones por idea | Se quedan, como los botones verde y rojo de la barra con esa palabra; no hay botones extra dentro de la tarjeta (6.4). |
| Identidad en añil | Descartada: el barro se queda en logo y faja | Igual: barro solo en identidad; añil solo en escuchar y foco. |
| Letra fluida y columna de 1560 px | Descartada hasta conocer la pantalla | `--base` fija en 20 px; solo los tamaños gigantes usan `clamp()` para no desbordar a 320 px. |
| Barra de progreso de 6 etapas | «Después» | La cabecera dice el nombre de la pantalla; en ideas va «Idea n de m». Las etapas quedan para después. |
| Botón principal en la alarma con un «sí» rojo | Primario `btn--rojo` «Ver qué hacer ahora» | **Cambia:** el botón sigue verde y solo cambia la palabra (y lleva △). La regla es «botón principal = verde» y «verde = sigue, como el botón físico»: un botón rojo atado a la tecla verde dejaría dos rojos en pantalla y rompería la única pista de quien no lee. La urgencia la marcan la franja roja, su △ y la voz (lo demás no cambia). |

## 15. Pendiente

1. **Probar los dibujos con personas de la comunidad** (§8.5), en especial los de metáfora.
2. Dibujar las 9 medicinas y 5 condiciones de «Medicinas» (pastilla de la presión, del azúcar sin 💉 ni 🍬, tiroides, etc.) y las señales de alarma (dolor de pecho, falta de aire, cara chueca…): no estaban en el alcance de esta entrega.
3. Dibujar las 118 entradas del corpus que no tienen dibujo propio (mientras tanto, la tarjeta usa el dibujo de su tipo) y agregar el campo `dibujo` a las entradas.
4. Revisar los dibujos en la pantalla táctil real y en la impresora del quiosco (no hay aparato aquí).
5. Fijar la escala definitiva cuando se conozca la pantalla.
6. Mantener `css/app.css`, `index.html` y `js/pantallas.js` alineados con este sistema (la v0.5 ya lo aplica).
