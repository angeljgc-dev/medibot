# Instalación

MediBot es una aplicación de escritorio para Windows 10 u 11. No necesita internet ni instalar nada más.

## En la computadora del quiosco

1. Copia la carpeta de la aplicación (la del ZIP de Releases, o `escritorio/dist/win-unpacked` si la compilaste) a `C:\MediBot`. Pesa unos 370 MB porque trae su propio navegador adentro.
2. Doble clic en `Instalar autoinicio.cmd`. Crea el icono **MediBot** en el Escritorio y lo pone en la carpeta de Inicio para que arranque solo al encender.
3. Abre MediBot. Se abre en pantalla completa.

Para cerrarla:

- Con teclado: **Ctrl+Alt+Shift+Q**.
- Sin teclado: en la pantalla de inicio, mantén apretado **"Cerrar MediBot"** (abajo a la derecha; en pantallas chicas está al final del inicio, desliza hacia arriba) 3 segundos y toca **"Sí, cerrar"**. El botón verde y Enter nunca la cierran, y si nadie contesta en 15 segundos la pregunta se quita sola.
- Desde el panel del operador: **"Salir de la aplicación"**.

Para quitar el arranque automático, borra `MediBot.lnk` de la carpeta que abre `shell:startup`.

## Panel del operador

No se ve en la pantalla de inicio para que el público no lo abra por accidente. Se abre manteniendo apretado el logo de MediBot (arriba a la izquierda) 5 segundos, o con **Ctrl+Alt+Shift+O**. Ahí se configura:

1. **Lugar**: municipio y centro de salud de la comunidad, desde el catálogo de unidades públicas de Oaxaca o a mano. Se puede exportar e importar para pasarlo a otra computadora. Ver [guia_lugares.md](guia_lugares.md).
2. **Altitud** del sitio en metros.
3. **Verificación de sensores**: tara y calibración de la báscula con una pesa conocida, prueba del termómetro y bitácora. Ver [bascula.md](bascula.md).
4. **Simulación** para demostrar sin sensores. Pinta "DEMOSTRACIÓN" en todas las pantallas y en la hoja, y se apaga sola al terminar cada consulta.
5. **Claro u oscuro**. De fábrica MediBot sale en claro aunque Windows esté en modo oscuro; si lo cambias aquí, se respeta tu elección.

## Conectar el ESP32

No hay que autorizar nada. Al abrir MediBot o al enchufar el ESP32, la app prueba los puertos USB y se queda con el que responde como MediBot. El pie de página dice "Sensores: ESP32 conectado". Si se desenchufa, cambia a "sin conectar" y vuelve a buscar cada 30 segundos; mientras tanto los datos se pueden escribir a mano.

Si Windows no reconoce el ESP32, falta el controlador del chip USB (CP210x de Silicon Labs). Se instala una vez. Conviene comprar placas con CP2102 y no con CH340: los controladores nuevos de Windows 11 dejan de funcionar con los CH340 falsificados.

## Editar el contenido sin compilar

Los textos, preguntas, ideas y tarjetas están en `C:\MediBot\resources\web\data\`. Se pueden editar con el Bloc de notas siguiendo [guia_contenido.md](guia_contenido.md) y [corpus_esquema.md](corpus_esquema.md). Luego se cierra y se vuelve a abrir la app. Antes de llevar los cambios a una comunidad, corre `python tools/lint_contenido.py` en la carpeta del código. Los rangos y las preguntas de alarma (`rangos.js`, `alarma.js`) no se cambian sin revisión clínica.

## Actualizar a una versión nueva

Reemplaza la carpeta por la nueva. Las preferencias del equipo (lugar, altitud, tema, tamaño de letra, bitácora de calibración) se guardan en el perfil de la aplicación de esa computadora, no en la carpeta, así que se conservan.

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

La ventana corre aislada (sin acceso a Node desde la página) y no navega a ningún sitio externo. No guarda datos personales: todo se borra al terminar. Lo único que se guarda en la computadora son preferencias de pantalla, el lugar y su centro de salud, la altitud y la bitácora de calibración.
