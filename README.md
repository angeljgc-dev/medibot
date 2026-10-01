# MediBot

Quiosco de orientación en salud para comunidades rurales. Proyecto escolar del grupo 301 de TSU en Automatización.

MediBot mide pulso, oxígeno, temperatura y peso con sensores conectados a un ESP32, hace unas preguntas de señales de alarma y le dice a la persona si hoy no hay señales de alarma, si le conviene ir al centro de salud o si necesita atención urgente. Después le da ideas de alimentación y suplementos para lo que quiera cuidar, cada una con su fuente y sus advertencias, y una hoja para llevarse.

**No da diagnósticos.** Orienta y manda con el personal de salud. Cada rango que usa viene de una fuente oficial (OMS, MedlinePlus, IMSS, Secretaría de Salud) y la fuente aparece en la pantalla.

El proyecto empezó al revisar un "analizador cuántico" que se vende para hacer reportes de salud poniendo la mano en un sensor. Al abrir su base de datos encontramos que los reportes son frases ya escritas que el programa elige según un número, y que el sensor manda siempre los mismos bytes con o sin mano. MediBot es la versión honesta de esa idea: sensores que se pueden comprobar con una pesa y un termómetro.

## Cómo usarlo

La forma normal es la aplicación de escritorio para Windows (`MediBot.exe`). No necesita internet.

1. Descarga el ZIP de la sección **Releases** y descomprímelo, por ejemplo en `C:\MediBot`.
2. Doble clic en `Instalar autoinicio.cmd` (una sola vez). Crea el icono en el Escritorio y hace que MediBot arranque al encender la computadora.
3. Abre **MediBot**. Se abre en pantalla completa.
4. Conecta el ESP32 por USB. La app lo detecta sola, sin que tengas que hacer nada.

Para cerrarla: **Ctrl+Alt+Shift+Q**, o el botón "Salir de la aplicación" en la pantalla de inicio. A propósito no hay una X visible: la idea es que se quede abierta en el quiosco.

Sin sensores también funciona: en la pantalla de inicio, en el panel de abajo, elige un escenario en **Simulación** (normal, oxígeno bajo, fiebre, pulso alto, lecturas inestables).

Más detalle en [docs/instalacion.md](docs/instalacion.md).

## Qué hace

- Detecta el ESP32 al abrir y cada vez que se enchufa. Si se desconecta, sigue intentando cada 30 segundos.
- Toma pulso y oxígeno del dedo, con control de calidad. Si una lectura sale fuera de rango pide otra y se queda con la peor.
- Toma la temperatura en la axila (aproximada).
- Pesa a la persona en cuanto se sube a la báscula, sin tocar nada.
- Hace las preguntas de señales de alarma antes de medir. Un "sí" grave lleva directo a la pantalla de urgencia con el 911.
- Si faltan mediciones nunca da verde: dice "no pudimos medirte bien".
- Lee la pantalla en voz alta (botón **Escuchar**) para personas que no saben leer, y acepta respuestas con botones físicos o con el teclado.
- Muestra fichas de alimentos de la región primero y suplementos después, con lo que se puede usar si no se consiguen.
- Borra todo al terminar o tras 90 segundos sin uso. No guarda datos de nadie.

## Hardware

Todo va a un solo ESP32 y el ESP32 va a la computadora con un cable USB.

```
dedo     -> MAX30102 (pulso y oxígeno) ----+
axila    -> MAX30205 o DS18B20 ------------+
báscula  -> 4 celdas de carga -> HX711 ----+--> ESP32 --USB--> computadora con MediBot
botones  -> verde / rojo / azul -----------+
```

Lista de piezas y precios en [docs/lista_de_materiales.md](docs/lista_de_materiales.md). Cómo armar y calibrar la báscula en [docs/bascula.md](docs/bascula.md). El programa del ESP32 está en `firmware/medibot_esp32/` y el formato de los mensajes en [docs/protocolo_serial.md](docs/protocolo_serial.md).

## Compilar

Se necesita Node 24.

```bash
cd escritorio
npm install
npm start               # probar
npm run empaquetar      # genera escritorio/dist/win-unpacked
```

Para probar en ventana normal en lugar de pantalla completa: `MEDIBOT_VENTANA=1 npm start`.

## Carpetas

```
index.html, css/, js/   la interfaz (lo que Electron empaqueta)
data/                   textos, rangos, preguntas y fichas; se pueden editar sin tocar el código
escritorio/             la aplicación de Electron
firmware/               programa del ESP32
tools/                  revisión del contenido (vocabulario y fuentes)
docs/                   instalación, reglas, báscula, protocolo y demás
```

Si editas algo en `data/`, corre `python tools/lint_contenido.py` antes de empaquetar. Revisa que no se cuele vocabulario que COFEPRIS no permite y que todo tenga fuente. Ver [docs/guia_contenido.md](docs/guia_contenido.md).

## Estado

La aplicación está terminada y probada con el simulador. El firmware está escrito pero falta probarlo en la placa con los sensores, armar la báscula y calibrarla.

Pendiente después: pregunta de alarma para embarazo con fuente oficial, tabla de composición de alimentos de Oaxaca para poder dar cantidades, prueba con personas mayores y traducción a zapoteco y mixe.

## Licencia

MIT. Ver [LICENSE](LICENSE).
