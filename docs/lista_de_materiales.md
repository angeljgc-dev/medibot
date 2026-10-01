# Qué necesita MediBot para funcionar solo (sin operador)

Fecha: 2026-09-20. Precios aproximados en MXN, sin validar; verificar antes de comprar.

## 1. Computadora
- Laptop o mini PC con Windows 10/11 y un puerto USB (la Asus sirve). Pantalla táctil recomendada; si no, un mouse.
- No se instala nada: se copia la carpeta de la aplicación de escritorio (`escritorio/dist/win-unpacked`, renombrada `MediBot`) y se ejecuta `Instalar autoinicio.cmd`. Arranca sola al encender, en pantalla completa.

## 2. Electrónica (todo se conecta al mismo ESP32; un solo cable USB a la computadora)

| # | Pieza | Para qué | Precio aprox. | Notas |
|---|---|---|---|---|
| 1 | ESP32 DevKit **con chip CP2102** | Cerebro; manda todo por USB | 180–250 | No CH340: los controladores recientes de Windows 11 inutilizan los falsificados |
| 2 | MAX30102 (módulo) | Pulso y oxígeno en el dedo | 80–150 | I2C (SDA 21, SCL 22). Va dentro de la carcasa donde se apoya la mano |
| 3 | Sensor de temperatura: MAX30205 (recomendado, ±0.1 °C, I2C) o sonda DS18B20 impermeable (±0.5 °C, OneWire) | Temperatura axilar aproximada | 60–250 | Para axila: sonda con cable de 1 m. Se rotula "aproximada" |
| 4 | Báscula de baño digital de vidrio, 180 kg, plataforma ≥ 30×30 cm | Peso | 250–400 | Se desecha su tarjeta; se usan su plataforma y sus 4 celdas |
| 5 | Módulo HX711 (comprar 2, uno de repuesto) | Lee las celdas de la báscula | 60–120 | DOUT 16, SCK 4; puente RATE a VCC |
| 6 | Cable USB **con datos**, apantallado, 1.5 m (2) | ESP32 ↔ computadora | 120 | Muchos cables baratos son solo de carga |
| 7 | Cable apantallado 4 hilos (1 m), borneras, termoencogible, estaño | Báscula ↔ HX711 | 200 | |
| 8 | Caja para el ESP32 + carcasa de mano (puede ser la del QRMA, vaciada) | Montaje | 0–150 | |
| 9 | Tapete antiderrapante y gomas | Seguridad al pesarse | 100 | |
| 10 | Opcional: sensor de distancia VL53L1X o HC-SR04 en un poste de 2.2 m | Estatura automática | 60–150 | El protocolo ya acepta `{"t":"talla","cm":165}`; sin él la persona teclea su estatura |
| 11 | Plan B / contraste: Xiaomi Mi Body Composition Scale 2 | Báscula alterna por Bluetooth (la lee el ESP32) | 500–700 | Requiere compilar el firmware con `BASCULA_BLE 1` |

Total sin el opcional ni el plan B: **≈ 1,100–1,700 MXN**. Con ambos: ≈ 1,700–2,600.

## 3. Software del ESP32
1. Arduino IDE con el paquete ESP32 y las bibliotecas: SparkFun MAX3010x, HX711 (bogde), OneWire + DallasTemperature (o ClosedCube MAX30205), Preferences.
2. Cargar `firmware/medibot_esp32/medibot_esp32.ino` (v0.2). Ajustar pines si cambian.
3. Al conectar por USB, MediBot lo detecta sola: el pie de página dice "Sensores: ESP32 conectado".

## 4. Calibración (una vez, en el taller; 20 minutos)
- Báscula: plataforma vacía → botón **Tara** en "Verificación de sensores"; pesa patrón conocida (bulto certificado en una báscula comercial verificada) → **Calibrar con esta pesa**; comprobar con 20, 50 y 80 kg y en las cuatro esquinas (ver `bascula.md`).
- Temperatura: comparar contra un termómetro comercial en axila.
- Todo queda en la bitácora de la app y en la memoria del ESP32.

## 5. Qué hace la persona y qué hace la app

| Lo hace la app sola | Lo hace la persona en la pantalla |
|---|---|
| Detectar el ESP32 al encender o al enchufar | Tocar "empezar" y elegir su grupo de edad |
| Pesar en cuanto alguien se sube (3 lecturas estables) | Responder sí/no a las preguntas de señales de alarma |
| Leer pulso y oxígeno al poner el dedo (30 s, con control de calidad y repetición si sale fuera de rango) | Sostener el sensor de temperatura en la axila |
| Leer temperatura | Elegir hasta 3 temas que quiere cuidar |
| Calcular IMC, aplicar los rangos con fuente y el semáforo | Escribir su estatura si no hay sensor de distancia |
| Mostrar el resultado, las fichas y la hoja imprimible; borrar todo al terminar | Llevarse la hoja |

## 6. Qué entrega
- Un nivel: **verde** (hoy no encontramos señales de alarma), **ámbar** (conviene que te revise personal de salud; "hoy mismo" si el dato lo amerita) o **rojo** (urgencia, 911), con los motivos y la fuente de cada rango.
- Fichas por tema: primero alimentos de la región, luego el suplemento naturista con su evidencia, advertencia y fuente, y las leyendas obligatorias.
- Hoja imprimible con encabezado "ESTO NO ES UN RESULTADO MÉDICO".
- Nunca dice "tienes tal enfermedad" ni "tu hígado está mal": dice "tu medida salió fuera de lo esperado, conviene revisar", que es lo defendible ante un jurado y ante COFEPRIS.

## 7. Estado real hoy
- Aplicación: terminada y probada con simulador y con el aparato del QRMA en modo evidencia.
- Firmware: escrito, **sin probar en una placa real**. Primer trabajo del equipo: cargarlo, ver que salgan las líneas JSON en el monitor serie y que MediBot lo detecte.
- Báscula: pendiente de armar y calibrar.
- Ensayo completo en la Asus con todo conectado antes de dejarlo en la comunidad.
