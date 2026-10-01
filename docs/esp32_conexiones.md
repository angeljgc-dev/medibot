# ESP32: conexiones y puesta en marcha

Esta guía explica cómo conectar cada sensor al ESP32, cómo cargarle el programa con Arduino IDE y cómo comprobar que MediBot recibe todo.

## La idea general

MediBot no habla con los sensores directamente. Habla con un solo ESP32 por un cable USB, y el ESP32 es el que lee los sensores.

```
                       +---------------------------+
dedo   -> MAX30102 --->|                           |
axila  -> DS18B20 ---->|          ESP32            |---- cable USB ----> computadora con MediBot
báscula-> HX711 ------>|  (programa medibot_esp32) |
botones  verde/rojo/azul|                           |
                       +---------------------------+
```

El programa del ESP32 (`firmware/medibot_esp32/medibot_esp32.ino`) da vueltas sin parar. En cada vuelta lee los sensores y escribe por el USB una línea de texto por lectura:

```
{"t":"pulso","bpm":72,"spo2":97,"q":0.82}
{"t":"temp","c":36.4}
{"t":"peso","kg":70.2,"estable":true}
{"t":"boton","id":"si"}
```

MediBot lee esas líneas y por la etiqueta `t` sabe qué es cada una. Por eso no hay que configurar nada en la computadora: basta con que el ESP32 tenga el programa cargado y los sensores conectados en los pines correctos.

## ¿Y Arduino?

"Arduino" aquí es el programa **Arduino IDE**, con el que se escribe y se carga el programa en la placa. La placa es un **ESP32**, no un Arduino Uno. El ESP32 trabaja a 3.3 V como los sensores, tiene memoria para guardar la calibración de la báscula y Bluetooth para la báscula de respaldo. El programa usa funciones propias del ESP32, así que no funciona tal cual en un Uno.

Placa recomendada: **ESP32 DevKit V1 (38 pines) con chip USB CP2102**. Evitar las que traen CH340: los controladores nuevos de Windows 11 no funcionan con las copias falsas de ese chip.

## Tabla de conexiones

Todos los sensores se alimentan del pin **3V3** del ESP32 y comparten **GND**. Nunca conectes un sensor a 5 V si su pin de datos va directo al ESP32.

| Sensor | Pin del sensor | Pin del ESP32 | Notas |
|---|---|---|---|
| MAX30102 (pulso y oxígeno) | VIN | 3V3 | |
| | GND | GND | |
| | SDA | GPIO21 | Bus I2C |
| | SCL | GPIO22 | Bus I2C |
| | INT | sin conectar | No se usa |
| DS18B20 (temperatura, sonda impermeable) | Rojo (VDD) | 3V3 | |
| | Negro (GND) | GND | |
| | Amarillo (DATA) | GPIO15 | Resistencia de 4.7 kΩ entre DATA y 3V3 |
| HX711 (báscula) | VCC | 3V3 | Si el módulo tiene VCC y VDD, los dos a 3V3 |
| | GND | GND | |
| | DT (DOUT) | GPIO16 | |
| | SCK | GPIO4 | |
| Botón verde (sí) | una pata | GPIO32 | la otra pata a GND |
| Botón rojo (no) | una pata | GPIO33 | la otra pata a GND |
| Botón azul (repetir) | una pata | GPIO25 | la otra pata a GND |

Los botones no necesitan resistencia: el programa activa la resistencia interna del ESP32.

Si algún sensor tiene que ir en otro pin, se cambia el número en el programa (líneas `Wire.begin(21, 22)`, `OneWire oneWire(15)`, `bascula.begin(16, 4)` y `BOTONES[3] = { 32, 33, 25 }`) y se vuelve a cargar.

## Cada sensor, uno por uno

### MAX30102: pulso y oxígeno

Va dentro del soporte donde la persona apoya el dedo (puede ser la carcasa del aparato del QRMA, vaciada). La cara con las dos lucecitas hacia arriba, cubierta con algo oscuro alrededor para que no entre luz de la sala. El dedo se apoya sin apretar.

Cómo lo lee el programa: toma 100 muestras de luz roja e infrarroja (un segundo), calcula pulso y oxígeno, y además calcula una "calidad" de 0 a 1. Si no hay dedo no manda nada. Si el dedo se mueve, la calidad baja y MediBot no usa esa lectura.

### DS18B20: temperatura

Se usa la versión en **sonda de acero con cable de 1 m**, que es la que se puede poner en la axila. Muchas sondas vienen con un módulo pequeño que ya trae la resistencia de 4.7 kΩ; si la tuya son solo tres cables sueltos, hay que ponerla.

La persona sostiene la sonda en la axila unos minutos. MediBot la rotula como "aproximada" porque no es un termómetro clínico.

Alternativa más precisa a futuro: MAX30205 (I2C, en los mismos pines 21 y 22). El programa actual no la lee; habría que agregar su biblioteca.

### HX711 y báscula

Las cuatro celdas de la báscula de baño van al HX711 y el HX711 al ESP32. El cableado de las celdas, cómo encontrar el punto medio con el multímetro y la calibración están en [bascula.md](bascula.md).

En el módulo HX711 hay un puente llamado **RATE**: conectarlo a VCC hace que lea 80 veces por segundo en lugar de 10, y la báscula responde más rápido.

Usa cable apantallado de cuatro hilos entre la báscula y el HX711, lo más corto posible. El HX711 debe quedar cerca de la báscula; el cable largo va del HX711 al ESP32.

### Botones

Tres botones arcade grandes (verde, rojo, azul) para personas que no leen. Pulsación corta: sí, no o repetir. El verde mantenido un segundo es "siguiente" y el rojo mantenido es "atrás". Ver [voz_y_accesibilidad.md](voz_y_accesibilidad.md).

## Cargar el programa (una sola vez)

Se hace en cualquier computadora, no necesariamente la del quiosco.

1. Instala **Arduino IDE 2** desde arduino.cc.
2. Agrega las placas ESP32: Archivo > Preferencias > "URLs adicionales de gestor de placas", pega
   `https://espressif.github.io/arduino-esp32/package_esp32_index.json`. Luego Herramientas > Placa > Gestor de placas, busca **esp32** (de Espressif) e instálalo.
3. Instala las bibliotecas desde Herramientas > Gestionar bibliotecas:
   - **SparkFun MAX3010x Pulse and Proximity Sensor Library**
   - **HX711 Arduino Library** (de Bogdan Necula)
   - **OneWire**
   - **DallasTemperature**
4. Abre `firmware/medibot_esp32/medibot_esp32.ino`.
5. Conecta el ESP32 por USB. En Herramientas elige la placa **ESP32 Dev Module** y el puerto COM que aparezca.
6. Presiona **Subir** (la flecha). Si se queda en "Connecting...", mantén presionado el botón **BOOT** de la placa hasta que empiece a cargar.

Si Windows no muestra ningún puerto COM, falta el controlador del chip USB (CP210x de Silicon Labs).

## Probar sin MediBot

Con la placa conectada, abre Herramientas > Monitor serie a **115200** baudios. Al reiniciar la placa debe aparecer:

```
{"t":"hola","fw":"0.2"}
{"t":"cal","factor":21000.00,"cero":0}
```

Después, sensor por sensor:

| Prueba | Qué debe salir |
|---|---|
| Pon el dedo en el MAX30102 | `{"t":"pulso",...}` cada segundo, con `q` cerca de 0.9 |
| Sostén la sonda en la mano | `{"t":"temp","c":...}` subiendo poco a poco |
| Súbete a la báscula (ya calibrada) | `{"t":"bascula","estado":"subiendo"}`, luego `{"t":"peso",...,"estable":true}` |
| Aprieta el botón verde | `{"t":"boton","id":"si"}` |

Si un sensor no aparece, revisa sus cables. El programa sigue funcionando con los demás: si el MAX30102 no responde al arrancar, lo salta y sigue leyendo la báscula y la temperatura.

**Importante:** cierra el Monitor serie antes de abrir MediBot. Un puerto USB solo puede estar abierto en un programa a la vez.

## Conectar a MediBot

1. Cierra Arduino IDE.
2. Abre MediBot en la computadora del quiosco.
3. Conecta el ESP32 por USB.

En unos segundos el pie de la pantalla dice **"Sensores: ESP32 conectado"**. MediBot prueba los puertos USB y se queda con el que manda líneas de MediBot; no hay que elegir nada.

Luego, en la pantalla de inicio, entra a **Verificación de sensores**. Ahí ves las lecturas en vivo de los tres sensores y haces la tara y calibración de la báscula (ver [bascula.md](bascula.md)). La calibración se guarda en el ESP32, así que se hace una vez.

## Si algo falla

| Síntoma | Qué revisar |
|---|---|
| MediBot dice "sin conectar" | Que el cable USB sea de datos y no solo de carga. Que el Monitor serie de Arduino esté cerrado. Que el ESP32 tenga el programa cargado. |
| No sale pulso | Dedo bien apoyado y quieto, sin esmalte, mano tibia. Revisar SDA en 21 y SCL en 22. |
| La temperatura sale -127 o no sale | Falta la resistencia de 4.7 kΩ o el cable amarillo no está en GPIO15. |
| El peso baja al subirse | Intercambiar A+ y A- de las celdas en el HX711. |
| El peso no se estabiliza | Báscula en piso firme y nivelado, persona quieta. Cable de celdas corto y apantallado. |
| Un botón no hace nada | Que una pata vaya al GPIO y la otra a GND. |
| El ESP32 se reinicia solo | Alimentación insuficiente: usar un puerto USB de la computadora directo, no un hub sin corriente. |

## Montaje final

- ESP32 y HX711 dentro de una caja, con el cable USB saliendo hacia la computadora.
- MAX30102 y botones en el soporte de mano, al alcance de una persona sentada.
- Sonda de temperatura colgando de un gancho junto al soporte, con su cable de 1 m.
- Báscula en el piso frente al quiosco, sobre tapete antiderrapante.
- Todo el cableado sujeto con cinchos para que nadie se tropiece.
