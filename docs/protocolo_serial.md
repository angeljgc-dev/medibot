# Protocolo serial ESP32 ↔ MediBot

Puerto USB a 115200 baudios, 8N1. El ESP32 imprime **una línea JSON por muestra**, terminada en `\n`. MediBot (`js/sensores.js`) lee con Web Serial API, parte por líneas y descarta lo que no sea JSON.

## Mensajes (ESP32 → navegador)

| Mensaje | Frecuencia | Campos |
|---|---|---|
| `{"t":"hola","fw":"0.1"}` | al arrancar | versión de firmware |
| `{"t":"pulso","bpm":72,"spo2":97,"q":0.82}` | ~1 Hz mientras hay dedo | `bpm` entero, `spo2` en %, `q` calidad de señal 0..1 (perfusión / estabilidad) |
| `{"t":"temp","c":36.4}` | ~1 Hz | grados Celsius con un decimal |
| `{"t":"peso","kg":70.2,"estable":true,"crudo":-12345,"n":16}` | ~8 Hz solo con ≥ 5 kg en la plataforma | kilos; `estable` = rango de las últimas 16 muestras < 0.20 kg; `crudo` cuentas del HX711 (auditoría) |
| `{"t":"bascula","estado":"vacia"}` | al cambiar | `vacia` / `subiendo` / `estable` / `bajando` |
| `{"t":"cal","factor":21034.5,"cero":-8231}` | al arrancar y tras TARA/CAL | calibración vigente guardada en NVS; la app la archiva en la bitácora |
| `{"t":"ack","cmd":"tara","ok":true}` | respuesta a comando | confirma TARA o CAL (`factor` incluido en CAL) |
| `{"t":"boton","id":"si"}` | al pulsar | botones físicos del quiosco: `si`, `no`, `siguiente`, `atras`, `repetir` (ver `voz_y_accesibilidad.md`) |

## Comandos (navegador → ESP32), una línea terminada en `
`

| Comando | Efecto |
|---|---|
| `TARA` | Fija el cero con la plataforma vacía y lo guarda en NVS |
| `CAL 20.0` | Con la pesa patrón indicada sobre la plataforma, calcula el factor y lo guarda en NVS |
| `{"t":"talla","cm":165}` | opcional | centímetros (si se agrega sensor ultrasónico) |

## Cómo consume MediBot cada medición

- `medir(tipo, segundos)` acumula las muestras cuya `q` ≥ 0.6 (o `estable` ≠ false) durante hasta `segundos` (30 s pulso, 20 s temperatura, 12 s peso con salida temprana tras 3 muestras estables seguidas).
- Descarta valores fuera de rango físico (pulso 30–220, SpO2 70–100, temperatura 34–41.5 °C, peso 5–300 kg). Necesita al menos 3 muestras buenas; si no, la medición falla y la pantalla ofrece repetir o capturar a mano.
- Devuelve la **mediana** de las muestras buenas (pulso: últimas 10) y una `calidad` 0..1.
- La pantalla "Sobre ti" se pesa sola: al detectar ≥ 5 kg inicia la medición sin tocar nada.

## Requisitos del navegador

- Chrome o Edge. Web Serial no existe en Firefox ni Safari.
- Contexto seguro. **`file://` cuenta como seguro en Chrome/Edge** (verificado el 2026-09-19 con Chrome real: `isSecureContext = true` y `navigator.serial` disponible al abrir `index.html` directamente). Por eso `MediBot.cmd` abre el archivo en modo aplicación sin servidor. `iniciar.bat` queda solo como opción para servir a otra computadora de la red.
- `requestPort()` exige un gesto del usuario: por eso el botón "Conectar ESP32 por USB" está en el panel de operador. En la aplicación de escritorio (Electron) el permiso se concede por código y no hay diálogo.
- Detección automática: se prueban primero los puertos de fabricantes conocidos (Espressif, CP210x, CH340, FTDI, Arduino) y solo tras dos rondas fallidas los demás, porque abrir un puerto COM ajeno puede resetear un Arduino. Se conserva el puerto que emite JSON válido en < 4 s. Reintentos con espera creciente al enchufar y cada 30 s mientras no haya sensor.

## Simulador

Sin hardware, el operador elige un escenario en el panel de reposo: `normal`, `oxigeno_bajo` (SpO2 ≈ 91), `fiebre` (38.7 °C), `pulso_alto` (126 lpm), `inestable` (el pulso salta 18 lpm cada 30 s para demostrar la regla de lecturas discordantes).

## Firmware de referencia

`firmware/medibot_esp32/medibot_esp32.ino` (boceto sin probar en hardware; ajustar pines y bibliotecas):
- MAX30102 con la biblioteca SparkFun MAX3010x (algoritmo `spo2_algorithm.h`).
- MAX30205 (I²C) o DS18B20 (OneWire) para temperatura.
- HX711 con celda de carga de 50 kg × 4 para peso; calibrar con pesa patrón y guardar el factor.
