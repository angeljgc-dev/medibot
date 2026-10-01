# Modo evidencia: MediBot y el aparato de mano del QRMA

Fecha: 2026-09-20. MediBot **no modifica** el QRMA ni usa su programa. Lee el aparato de mano por USB en modo de solo lectura y muestra tal cual lo que envía, para que cualquiera compruebe si depende de la mano. Nunca alimenta la orientación de salud.

## Qué es el aparato a nivel USB

| Dato | Valor |
|---|---|
| Identificador USB | VID 5608, PID 0808 |
| Clase | HID "definido por el proveedor" (usagePage 0xFF00, usage 0x01) |
| Reportes | 1 de entrada de 8 bytes, 1 de salida de 8 bytes, sin reportes de característica |
| Nombre de producto | vacío |
| La llave (dongle) | es otro dispositivo: HID 096E:0304 (Feitian ET199), solo licencia |

## Lo que se midió (taller, 2026-09-20)

- Sin el programa del QRMA, el aparato emite continuamente el mismo reporte: `08 a4 01 02 03 04 05 06`.
- 40 s de escucha con la mano puesta y sin ella: **1,329 reportes, 33 por segundo, 1 solo patrón**.
- Es una secuencia de fábrica (un encabezado y los números 1 a 6), no una señal fisiológica. Un sensor real cambia cuando la mano entra y sale.

Herramienta usada: `escritorio/herramientas/explorar_hid.js` (Electron, solo lectura, no envía bytes). Uso desde `MediBot/escritorio`:

```bash
npx electron herramientas/explorar_hid.js 5608 0808 40
```

## La pregunta que falta (y cómo cerrarla en la Asus)

El aparato tiene un reporte de salida de 8 bytes: el programa del QRMA podría enviarle un comando durante el "escaneo". Hay que ver si, aun así, el aparato devuelve algo distinto. Esto se comprueba **sin modificar nada**, capturando el tráfico USB en la Asus mientras el programa hace un escaneo:

1. En la Asus instalar Wireshark con USBPcap (gratuitos; https://www.wireshark.org). Requiere administrador solo para la instalación.
2. Abrir Wireshark, elegir la interfaz `USBPcap` que muestre el aparato 5608:0808 (conectarlo antes) y empezar la captura.
3. En el programa del QRMA: hacer un escaneo completo con la mano, luego otro con una naranja (o guante relleno), luego uno con la mano de otra persona.
4. Detener la captura y guardarla como `qrma_escaneo.pcapng`. Llevarla a otra computadora para revisarla con calma.
5. Filtro en Wireshark: `usb.idVendor == 0x5608` (o `usbhid`). Mirar los paquetes `URB_INTERRUPT out` (lo que el programa envía) y `URB_INTERRUPT in` (lo que el aparato responde).

Interpretación:
- Si durante los tres escaneos el aparato responde siempre `08 a4 01 02 03 04 05 06` mientras el programa "mide" y produce reportes distintos, queda demostrado que **el número sale del programa, no del cuerpo**. Es el hallazgo estrella del proyecto, más fuerte aún que las frases precargadas.
- Si el aparato responde con bytes que cambian, se analiza si cambian con la mano o solo con el tiempo (ruido). En cualquier caso, MediBot lo mostraría como "señal cruda del aparato", nunca como pulso, oxígeno ni órgano alguno.

## Cómo se usa en la exhibición

Panel de operador → **Evidencia QRMA**. La pantalla muestra reportes por segundo, patrones distintos y el último reporte. Guion sugerido para el público: "Mira el número de patrones. Pon la mano. Quítala. Pon la naranja. Sigue en 1. El aparato no sabe que estás ahí". Con la aplicación de escritorio la detección es automática; con Edge/Chrome hay que autorizarlo una vez con el botón.

## Lo que MediBot no hará

- No mostrará los bytes del QRMA como mediciones de salud ni los usará en el semáforo.
- No instala ni ejecuta el programa del QRMA. MediBot no lo necesita en ninguna computadora.
- No envía comandos al aparato salvo que la captura en la Asus muestre un comando concreto y el equipo decida reproducirlo **solo** para la exhibición, documentándolo.

## Lo que sí conviene hacer con el aparato

Reutilizar su carcasa para alojar el MAX30102 y el sensor de temperatura del ESP32: la persona pone la mano en "la máquina" y esta vez sí se mide algo.
