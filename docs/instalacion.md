# Instalación

MediBot es una aplicación de escritorio para Windows 10 u 11. No necesita internet ni instalar nada más.

## En la computadora del quiosco

1. Copia la carpeta de la aplicación (la del ZIP de Releases, o `escritorio/dist/win-unpacked` si la compilaste) a `C:\MediBot`. Pesa unos 370 MB porque trae su propio navegador adentro.
2. Doble clic en `Instalar autoinicio.cmd`. Crea el icono **MediBot** en el Escritorio y lo pone en la carpeta de Inicio para que arranque solo al encender.
3. Abre MediBot. Se abre en pantalla completa.

Para cerrarla: Ctrl+Alt+Shift+Q, o el botón "Salir de la aplicación" en la pantalla de inicio. Para quitar el arranque automático, borra `MediBot.lnk` de la carpeta que abre `shell:startup`.

## Conectar el ESP32

No hay que autorizar nada. Al abrir MediBot o al enchufar el ESP32, la app prueba los puertos USB y se queda con el que responde como MediBot. El pie de página dice "Sensores: ESP32 conectado". Si se desenchufa, cambia a "sin conectar" y vuelve a buscar cada 30 segundos; mientras tanto los datos se pueden escribir a mano.

Si Windows no reconoce el ESP32, falta el controlador del chip USB (CP210x de Silicon Labs). Se instala una vez. Conviene comprar placas con CP2102 y no con CH340: los controladores nuevos de Windows 11 dejan de funcionar con los CH340 falsificados.

## Editar el contenido sin compilar

Los textos, rangos, preguntas y fichas están en `C:\MediBot\resources\web\data\`. Se pueden editar con el Bloc de notas siguiendo [guia_contenido.md](guia_contenido.md). Luego se cierra y se vuelve a abrir la app.

## Compilar desde el código

Con Node 24:

```bash
cd escritorio
npm install
npm run empaquetar
```

La carpeta `escritorio/dist/win-unpacked` es la aplicación completa. Como se copia por USB y no se descarga de internet, Windows no la bloquea y no hace falta firmarla.

Opciones para probar:

| Variable | Qué hace |
|---|---|
| `MEDIBOT_VENTANA=1` | Abre en ventana normal con herramientas de desarrollo (F12) |
| `MEDIBOT_PRUEBA=1` | Imprime una línea `AUTOPRUEBA {...}` con el estado de la app y se cierra |
| `MEDIBOT_SIN_GPU=1` | Desactiva la aceleración gráfica (para computadoras viejas) |

## Cómo encuentra el puerto

1. La app tiene permiso para los puertos serie desde el arranque, así que no aparece ningún diálogo.
2. Ordena los puertos por fabricante (Espressif, CP210x, CH340, FTDI, Arduino) y prueba primero esos. Los demás solo después de dos rondas sin éxito, porque abrir un puerto ajeno puede reiniciar otro Arduino.
3. Abre cada candidato a 115200 baudios y espera hasta 4 segundos una línea de MediBot (`{"t":"hola",...}`, `{"t":"pulso",...}`). Si no llega, lo cierra y sigue con el siguiente.

## Antes de dejarla en una comunidad

- Apaga el Wi-Fi: MediBot no lo necesita y así Windows no se pone a actualizar.
- Haz un ensayo completo con el ESP32 real, incluyendo desenchufar y volver a enchufar el USB.
- Revisa [protocolo_feria.md](protocolo_feria.md): quién llama al 911, teléfono del centro de salud, quién acompaña.

## Seguridad y privacidad

La ventana corre aislada (sin acceso a Node desde la página) y no navega a ningún sitio externo. No guarda datos personales: todo se borra al terminar. Lo único que se guarda en la computadora son preferencias de pantalla, la altitud del lugar y la bitácora de calibración.
