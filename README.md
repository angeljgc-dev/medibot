# MediBot

Quiosco de orientación en salud para comunidades rurales e indígenas de Oaxaca. Proyecto escolar del grupo 301 de TSU en Automatización.

MediBot mide pulso, oxígeno, temperatura y peso con sensores conectados a un ESP32, hace unas preguntas de señales de alarma y le dice a la persona si hoy no hay señales de alarma (verde), si le conviene ir al centro de salud (amarillo) o si necesita atención urgente (rojo). Después le da ideas para cuidarse según su caso (alimentos de la región, plantas, hábitos y algunos suplementos), cada una con su fuente, sus cuidados y qué usar si no se consigue, y una hoja impresa para llevarse.

- **No da diagnósticos.** Orienta y manda con el personal de salud. Cada rango que usa viene de una fuente oficial (OMS, MedlinePlus, IMSS, Secretaría de Salud) y la fuente aparece en pantalla y en la hoja.
- **Es gratis.** Nadie cobra por usar el quiosco y la app lo dice desde el inicio.
- **No guarda datos de nadie.** Todo se borra al terminar o después de un rato sin uso.
- **No necesita internet.**

El proyecto empezó al revisar un "analizador cuántico" que se vende para hacer reportes de salud poniendo la mano en un sensor. Al abrir su base de datos encontramos que los reportes son frases ya escritas que el programa elige según un número, y que el sensor manda siempre los mismos bytes con o sin mano. MediBot es la versión honesta de esa idea: sensores que se pueden comprobar con una pesa y un termómetro. Detalle en [docs/evidencia_qrma.md](docs/evidencia_qrma.md).

## Qué hay de nuevo en la versión 0.6

Lista completa de cambios por versión en [CHANGELOG.md](CHANGELOG.md).

- **Pregunta de sexo, opcional.** En "Sobre ti", después de la edad, MediBot pregunta **Mujer**, **Hombre** o **Prefiero no decir**, cada una con su dibujo y su voz. Si la consulta es por un niño o niña, las opciones dicen "Niña" y "Niño". A los bebés no se les pregunta. Se puede saltar, y no cambia el semáforo ni ningún rango: solo sirve para no dar ideas que no tocan.
- **Embarazo y lactancia, solo cuando tienen sentido.** Se preguntan solo si la persona eligió **Mujer** o **Prefiero no decir**. Con "Hombre" no aparecen, ni en la pantalla ni en la voz. Ya no existe la opción "No / soy hombre" ni el "Si eres mujer:" en la pregunta. Si alguien cambia el sexo o la edad, se borra la respuesta que ya no aplica.
- **La edad "6 a 11 años" se partió en "6 a 8" y "9 a 11".** La báscula, las ideas, la voz y la hoja funcionan igual con las dos.
- **El embarazo se pregunta desde los 9 años.** A una niña de 9 a 11 se le pregunta si está embarazada; lo de dar pecho, desde los 12. De 12 a 17, si contesta que sí, sale una pregunta más: "12 a 14" o "15 a 17". Si no la contesta, MediBot toma el lado que más protege.
- **Mensaje protector para niñas y adolescentes embarazadas**, en el resultado, en la voz y en la hoja. Hay un texto para la niña y otro para el adulto que la acompaña. No culpa, no pregunta cómo pasó y no usa palabras que señalen el caso. Dice que vaya al centro de salud **hoy** (de 9 a 14 años, y de 15 a 17 si el semáforo ya pide ir hoy o salió rojo) o **esta semana** (de 15 a 17, con verde o amarillo sin prisa). También dice que puede pedir hablar a solas con el personal de salud y da dos números: el **079, opción 1** (gratis, de día y de noche) y el **911**. El color del semáforo no cambia, pero el resto de la pantalla ya no dice lo contrario (nada de "puedes cuidarte en casa").
- **Ideas seguras en el embarazo, también para menores.** Con embarazo "Sí" o "Prefiero no decir", desde los 9 años se aplican los mismos cuidados que a una adulta (por ejemplo, nada de té de ruda), y salen las señales de alarma del embarazo en "Cuándo ir" y en "Cuidado con esto". Se quita todo lo que da por hecho el parto o la lactancia, y para menores de 12 la sección se llama "Embarazo".
- **Sugerencias según el sexo**: "Cólicos de la regla" no se le sugiere a quien eligió "Hombre", aunque sigue ahí si la busca.
- **"¿Está bien esto?" muestra el sexo** que se contestó, para corregirlo si se tocó por error.
- **La hoja impresa sale siempre en blanco**, aunque el quiosco esté en modo oscuro.
- **3 pictogramas nuevos**: Mujer, Hombre y Prefiero no decir (78 en total).
- **Mejoras de redacción**: trato de tú en todas las pantallas. Sobre el alcohol en el embarazo dice "No tomes nada de alcohol", nunca "toma menos". La actividad física de 12 a 17 años trae la cantidad que toca a esa edad. La voz lee los rangos como "de 80 a 130" y dice el mismo nombre que se ve en la pantalla. "¿Por qué MediBot no diagnostica?" se explica más simple. La bienvenida ya no repite avisos, y cada idea muestra solo las fuentes que corresponden a la persona.
- **Panel del operador**: "Salir de la aplicación" pregunta con el diálogo de MediBot. La casilla de la voz es más grande. El contador del modo evidencia marca 0 hasta que empieza a escuchar. Dice "1 unidad pública", en singular, cuando solo hay una, y ya no pide "apretar el verde" (ahí no hay botonera).
- Pruebas automáticas: 251 pruebas del motor y del contenido, pruebas en navegador de cada pantalla (también de la pregunta de sexo y del mensaje protector) y la revisión de desborde en 840 vistas.

## Qué hay de nuevo en la versión 0.5

- **Diseño nuevo de toda la interfaz**, pensado para personas mayores, para quien no lee bien y para comunidades indígenas: una idea por pantalla, letra grande y clara (Atkinson Hyperlegible), botonera fija abajo con los mismos colores que los botones físicos (azul = oír, rojo = atrás o no, verde = seguir o sí) y el semáforo con forma y palabra, no solo color.
- **75 pictogramas propios en estilo "bordado"**: formas planas con contorno, en los colores de los textiles oaxaqueños, con gente de piel morena, rebozo, trenza y sombrero, y comida de aquí (nopal, frijol de la olla, tortilla, quelites, amaranto, guayaba). Se ven igual de bien en claro y en oscuro.
- **Ideas personalizadas**: 138 ideas en 18 secciones (por ejemplo "Embarazo y dar pecho", "Niñas y niños", "Persona mayor", "Diarrea y agua limpia", "Azúcar y peso"). Toman en cuenta la edad, el embarazo, la lactancia, las medicinas de todos los días y lo que salió en las mediciones. Si la persona dice "No lo encuentro", le da otra opción segura.
- **"Cuidado con esto"**: 14 tarjetas sobre remedios comunes que pueden hacer daño (por ejemplo té de ruda en el embarazo) y qué hacer en su lugar.
- **"¿A dónde voy?"**: el 911, la Línea de la Vida y la Línea de las Mujeres vienen de fábrica, y el operador elige el municipio y el centro de salud de la comunidad desde un catálogo de unidades públicas de Oaxaca.
- **Voz** más corta y completa: lee cada pantalla en español de México sin internet, sin recortar dosis ni avisos.
- **Hoja impresa** de una carta, con letra de 10 puntos o más, las mediciones, las ideas, cuándo ir al centro de salud y las fuentes.
- **Pantalla roja** con el 911 siempre completo y a la vista, también con letra grande y en pantallas chicas.
- **Botón "Cerrar MediBot"** en la pantalla de inicio para mantenimiento: hay que mantenerlo apretado 3 segundos y confirmar, para que nadie lo cierre sin querer.
- **Tema claro de fábrica** (se lee mejor con luz de día). El operador puede cambiarlo a oscuro.
- **Panel del operador escondido**: ya no se ve en la pantalla de inicio; se abre con un gesto o un atajo (ver abajo).
- Pruebas automáticas de todo: 219 pruebas del motor y del contenido, pruebas en navegador de cada pantalla y una revisión de que nada se desborde ni se descoloque en 768 vistas (6 tamaños de pantalla, letra normal y grande, claro y oscuro).

## Instalación (Windows)

Se necesita una computadora con Windows 10 u 11. No hay que instalar nada más.

1. Compila la aplicación (ver [Compilar y probar](#compilar-y-probar)) y copia la carpeta `escritorio/dist/win-unpacked` a la computadora del quiosco, por ejemplo en `C:\MediBot`. Pesa unos 370 MB. (El ZIP que está en **Releases** es de la versión 0.3; trae la app anterior.)
2. Doble clic en **`Instalar autoinicio.cmd`**, una sola vez. Crea el icono **MediBot** en el Escritorio y hace que MediBot arranque solo al encender la computadora.
3. Abre **MediBot**. Se abre en pantalla completa.
4. Conecta el ESP32 por USB. La app lo detecta sola; el pie de página dice "Sensores: ESP32 conectado". Si se desconecta, sigue intentando cada 30 segundos.
5. Abre el panel del operador y configura el lugar (municipio y centro de salud) y la altitud. Ver [docs/guia_lugares.md](docs/guia_lugares.md).
6. Haz una verificación de los sensores con una pesa conocida y un termómetro antes de dejarlo en la comunidad. Ver [docs/protocolo_feria.md](docs/protocolo_feria.md).

Si Windows no reconoce el ESP32, falta el controlador USB-serie del chip (CP210x de Silicon Labs); se instala una vez.

Para actualizar, reemplaza la carpeta por la nueva versión. Las preferencias del equipo (lugar, altitud, tema, calibración) se conservan.

Guía completa: [docs/instalacion.md](docs/instalacion.md).

### Sin sensores (demostración)

Sin ESP32 también funciona: en el panel del operador, **Simulación**, elige un escenario (normal, oxígeno bajo, fiebre, pulso alto, lecturas inestables). Mientras la simulación está encendida, todas las pantallas y la hoja dicen **DEMOSTRACIÓN**, y se apaga sola al terminar cada consulta.

## Cómo lo usa la persona

Todo se puede hacer con los tres botones físicos, con la pantalla táctil o con el teclado (Enter = verde, flechas, S = sí, N = no, R = repetir). El botón azul lee la pantalla en voz alta en cualquier momento.

1. **Inicio**: "Aprieta el verde o toca la pantalla". Siempre dice "¿Es urgente? Llama al 911".
2. **Bienvenida y aviso de privacidad**: qué hace MediBot, que es gratis y que no guarda nada.
3. **Sobre ti**, una pregunta a la vez:
   - **Para quién es**: para mí, para un niño o niña, o para otra persona.
   - **La edad**. Si es un niño o niña: menos de 2 años, 2 a 5, 6 a 8 o 9 a 11.
   - **Sexo (opcional)**: Mujer, Hombre o Prefiero no decir ("Niña" o "Niño" si es para un niño). No se pregunta a bebés.
   - **Embarazo (opcional)**: solo con Mujer o Prefiero no decir, de 12 a 59 años, o en una niña de 9 a 11. Las opciones son "No", "Sí, estoy embarazada", "Estoy dando pecho" (desde los 12) y "Prefiero no decir". De 12 a 17, si dice que sí, se pregunta también "12 a 14" o "15 a 17"; se puede dejar sin contestar.
   - **Medicinas**: si toma alguna todos los días.
4. **Señales de alarma**: una pregunta por pantalla, antes de medir. Un "sí" grave lleva directo a la pantalla roja con el 911.
5. **Mediciones**, una a la vez: pulso y oxígeno (dedo en el oxímetro), temperatura (termómetro en la axila) y peso (subirse a la báscula, pesa solo). Si una lectura sale fuera de rango pide otra y se queda con la peor. Si falta alguna medición, nunca da verde: dice "no pudimos medirte bien".
6. **¿Qué te gustaría cuidar?**: elige hasta tres temas, o ninguno. MediBot sugiere los que tocan por su caso (por ejemplo embarazo o persona mayor).
7. **Revisión**: muestra lo que entendió para que la persona lo corrija.
8. **Resultado**: verde, amarillo o rojo, con lo que hay que hacer y lo que se midió. Si es una niña o adolescente embarazada, también sale el mensaje protector, con la prisa que toca ("hoy" o "esta semana"), el 079 opción 1 y el 911.
9. **Lo que te toca a ti**: las ideas, una por pantalla, con cómo se usa, cuidados y "No lo encuentro" para ver otra opción. Al final, "Cuidado con esto" y cuándo ir al centro de salud.
10. **Tu hoja de hoy**: se imprime con el botón verde y se borra todo.

Si nadie toca nada por un rato, MediBot pregunta si quieres seguir y, si no hay respuesta, borra todo y regresa al inicio.

## Panel del operador

Es para quien instala o cuida el quiosco; el público no lo ve.

- **Abrirlo**: mantén apretado el logo de MediBot (arriba a la izquierda) **5 segundos**, o aprieta **Ctrl + Alt + Shift + O**.
- **Qué hay ahí**:
  - **Lugar**: municipio y centro de salud de la comunidad (catálogo de unidades públicas de Oaxaca o datos a mano), con exportar e importar para pasar la configuración a otra computadora.
  - **Altitud** del sitio (ajusta la nota del oxígeno en lugares altos).
  - **Verificación de sensores**: tara y calibración de la báscula con una pesa conocida, prueba del termómetro y bitácora.
  - **Simulación** para demostraciones.
  - **Cambiar entre claro y oscuro**.
  - **Salir de la aplicación** (pide confirmar con "Sí, cerrar").

### Cerrar MediBot

- **Con teclado**: **Ctrl + Alt + Shift + Q**.
- **Sin teclado**: en la pantalla de inicio, mantén apretado **"Cerrar MediBot"** (abajo a la derecha; en pantallas chicas está al final, desliza hacia arriba) **3 segundos** y toca **"Sí, cerrar"**. El botón verde y Enter nunca cierran la app.
- Para volver a abrirla: el icono **MediBot** del Escritorio. Al reiniciar la computadora arranca sola.

## Hardware: qué se conecta y cómo

MediBot no habla con los sensores directamente. Todos los sensores van a **un solo ESP32**, y el ESP32 va a la computadora con **un cable USB de datos**. El ESP32 lee los sensores y manda una línea de texto por cada lectura; MediBot la recibe y la muestra.

```
dedo     -> MAX30102 (pulso y oxígeno) ----+
axila    -> DS18B20 (temperatura) --------+
báscula  -> 4 celdas de carga -> HX711 ----+--> ESP32 --cable USB--> computadora con MediBot
botones  -> verde / rojo / azul -----------+
```

### Piezas

| Pieza | Para qué |
|---|---|
| ESP32 DevKit V1 (38 pines) con chip USB **CP2102** | El cerebro; evita las placas con CH340 |
| MAX30102 | Pulso y oxígeno en el dedo |
| DS18B20 en sonda de acero con cable de 1 m + resistencia de 4.7 kΩ | Temperatura en la axila (aproximada) |
| Báscula de baño con sus 4 celdas de carga + módulo HX711 | Peso |
| 3 botones arcade (verde, rojo, azul) | Responder sin leer |
| Cable USB de datos (no solo de carga) | ESP32 a la computadora |

Lista con precios: [docs/lista_de_materiales.md](docs/lista_de_materiales.md).

### Conexiones

Todos los sensores se alimentan del pin **3V3** del ESP32 y comparten **GND**. Nunca a 5 V.

| Sensor | Pin del sensor | Pin del ESP32 |
|---|---|---|
| MAX30102 | VIN / GND / SDA / SCL | 3V3 / GND / **GPIO21** / **GPIO22** (INT sin conectar) |
| DS18B20 | rojo / negro / amarillo | 3V3 / GND / **GPIO15**, con la resistencia de 4.7 kΩ entre amarillo y 3V3 |
| HX711 | VCC / GND / DT / SCK | 3V3 / GND / **GPIO16** / **GPIO4** |
| Botón verde (sí) | una pata / la otra | **GPIO32** / GND |
| Botón rojo (no) | una pata / la otra | **GPIO33** / GND |
| Botón azul (repetir) | una pata / la otra | **GPIO25** / GND |

Los botones no llevan resistencia (el programa usa la interna). Cómo conectar las celdas de la báscula al HX711 y calibrarla: [docs/bascula.md](docs/bascula.md).

### Cargar el programa al ESP32 (una sola vez)

1. Instala **Arduino IDE 2** y agrega las placas ESP32 de Espressif (URL del gestor: `https://espressif.github.io/arduino-esp32/package_esp32_index.json`).
2. Instala las bibliotecas: SparkFun MAX3010x, HX711 (Bogdan Necula), OneWire y DallasTemperature.
3. Abre `firmware/medibot_esp32/medibot_esp32.ino`, elige la placa **ESP32 Dev Module** y su puerto COM, y presiona **Subir**. Si se queda en "Connecting...", mantén apretado el botón **BOOT** de la placa.
4. Prueba: en Herramientas > Monitor serie a **115200** baudios debe salir `{"t":"hola","fw":"0.2"}`, y luego `{"t":"pulso",...}` al poner el dedo, `{"t":"temp",...}` con la sonda en la mano, `{"t":"peso",...}` al subirse a la báscula y `{"t":"boton","id":"si"}` con el verde.
5. **Cierra el Monitor serie y Arduino IDE** antes de abrir MediBot: el puerto USB solo puede estar abierto en un programa a la vez.

### Conectarlo a MediBot

1. Abre MediBot y conecta el ESP32 por USB. No hay que elegir puerto ni dar permisos: en unos segundos el pie de la pantalla dice **"Sensores: ESP32 conectado"**.
2. Abre el panel del operador (logo 5 segundos o **Ctrl+Alt+Shift+O**) y entra a **Verificación de sensores**: ves las lecturas en vivo, haces la **tara** con la báscula vacía y la **calibración** con una pesa conocida (comprueba con 20, 50 y 80 kg en las cuatro esquinas). La calibración se guarda en el ESP32.
3. Si se desconecta, MediBot dice "sin conectar" y vuelve a buscarlo cada 30 segundos; mientras tanto, los datos se pueden escribir a mano.

Guía completa con montaje y tabla de fallas ("sale -127", "el peso baja al subirse", "el ESP32 se reinicia solo"…): [docs/esp32_conexiones.md](docs/esp32_conexiones.md). Formato de los mensajes: [docs/protocolo_serial.md](docs/protocolo_serial.md).

## Compilar y probar

Se necesita Node 24 y, para las pruebas en navegador, Python 3.11 con Playwright.

```bash
cd escritorio
npm install
npm start               # probar
npm run empaquetar      # genera escritorio/dist/win-unpacked
```

Para probar en ventana normal en lugar de pantalla completa: `MEDIBOT_VENTANA=1 npm start`.

Verificación completa (contenido, motor, pantallas y desborde; tarda unos 9 minutos):

```bash
pip install playwright
python -m playwright install chromium
python tools/verify.py
```

`verify.py` corre:

- `tools/lint_contenido.py`: vocabulario que COFEPRIS no permite, fuentes completas, leyendas, pictogramas y colores.
- `node --test tests/*.test.mjs`: reglas del semáforo, recomendaciones, voz, temperatura, pictogramas.
- `tools/e2e_*.py`: cada pantalla en el navegador, con lo que se ve y lo que se oye.
- `tools/check_desborde.py`: que nada se salga ni se descoloque en 840 vistas.

Termina con `VERIFY: OK` si todo pasa.

## Editar el contenido

Los textos, rangos, preguntas, ideas y tarjetas viven en `data/` y se pueden editar sin tocar el código. Después de editar, corre `python tools/lint_contenido.py`.

- Cómo escribir contenido sin prometer curas: [docs/guia_contenido.md](docs/guia_contenido.md).
- Campos de las ideas: [docs/corpus_esquema.md](docs/corpus_esquema.md).
- Reglas del semáforo y sus fuentes: [docs/reglas_orientacion.md](docs/reglas_orientacion.md). Los archivos del semáforo (`js/reglas.js`, `data/rangos.js`, `data/alarma.js`) están protegidos por una prueba de huella: no se cambian sin revisión clínica.
- Voz y accesibilidad: [docs/voz_y_accesibilidad.md](docs/voz_y_accesibilidad.md).
- Sistema de diseño (colores, letra, pictogramas): [docs/diseno/sistema.md](docs/diseno/sistema.md). Los pictogramas salen de una sola fuente, `tools/generar_pictos.py`.

## Carpetas

```
index.html, css/, js/   la interfaz (lo que Electron empaqueta)
data/                   textos, rangos, preguntas, ideas, tarjetas y catálogo de lugares
assets/                 letra, icono y pictogramas
escritorio/             la aplicación de Electron
firmware/               programa del ESP32
tests/                  pruebas del motor (node --test)
tools/                  revisión del contenido, pruebas en navegador y generadores
docs/                   instalación, reglas, diseño, báscula, protocolo y demás
```

## Límites y pendientes

Lo que todavía no está comprobado, dicho tal cual:

- El firmware está escrito pero falta probarlo en la placa con los sensores reales, armar la báscula y calibrarla. Hasta ahora la app se probó con el simulador.
- Las reglas y los textos nuevos de la versión 0.5 (preguntas de alarma para niños, trato para consultas de niños, textos cortos del motivo) necesitan revisión de personal de salud antes de usarse con personas.
- Lo mismo para la versión 0.6: el mensaje protector para niñas y adolescentes embarazadas no lo ha firmado personal de salud. Falta su firma para decidir si el semáforo de una niña o adolescente embarazada debe subir a amarillo con prisa "hoy". Mientras tanto el color no cambia. La propuesta, con sus fuentes (NOM-007, NOM-046, OMS), está en [docs/reglas_orientacion.md](docs/reglas_orientacion.md).
- Falta probar los pictogramas con personas de la comunidad, la impresora real y la toma de temperatura con varias personas.
- Falta una pregunta de alarma propia del embarazo con fuente oficial y una tabla de composición de alimentos de Oaxaca para poder dar cantidades.
- Traducción a zapoteco y mixe.
- No se ha revisado con COFEPRIS ni con un abogado; el encuadre como software que no es dispositivo médico es una interpretación razonable de la Ley General de Salud.

## Licencias

- Código y contenido propio: MIT. Ver [LICENSE](LICENSE).
- Letra Atkinson Hyperlegible: SIL Open Font License, en [assets/fonts/OFL.txt](assets/fonts/OFL.txt).
- Catálogo de unidades de salud (CLUES) y municipios (INEGI): datos públicos del Gobierno de México.
