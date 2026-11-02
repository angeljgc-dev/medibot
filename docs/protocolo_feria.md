# Protocolo humano del quiosco (imprimir y pegar junto a MediBot)

Sin esto, el nivel rojo es teatro. Llenar los huecos antes de la feria.

## Antes de abrir
- [ ] Adulto responsable del plantel a menos de 5 metros durante todo el horario: ______________________ (nombre y celular).
- [ ] Teléfono del centro de salud / unidad médica más cercana: ______________________ Dirección: ______________________.
- [ ] Quién llama al 911 si hay un rojo: ______________________. Quién acompaña a la persona: ______________________.
- [ ] Pantalla orientada de modo que la fila **no** vea las respuestas. Silla para la persona. Gel para limpiar el sensor entre personas.
- [ ] Abrir MediBot (icono del Escritorio). El **panel del operador** ya no se ve en el reposo (v0.5): se abre manteniendo apretado el logo 5 segundos o con **Ctrl+Alt+Shift+O**. La simulación solo se enciende desde ahí, pinta la franja «DEMOSTRACIÓN» en todas las pantallas y en la hoja, y se apaga sola al terminar cada consulta. Conectar el ESP32 y hacer una **verificación** (pesa patrón y termómetro) desde el panel de operador. Anotar la fecha en la bitácora.
- [ ] Altitud del sitio configurada en el panel de operador (metros sobre el nivel del mar).
- [ ] Cartel con el aviso de privacidad completo visible (responsable, finalidad, "no guardamos nada").

## Durante la feria
- El operador **no interpreta** resultados ni da consejos médicos. Lee la pantalla con la persona si hace falta y remite.
- Si sale **ROJO**: el operador avisa al adulto responsable de inmediato, ofrece sentarse, llama al 911 si la persona lo acepta o si pierde el conocimiento, y no la deja sola. La demo se detiene.
- Si sale **ÁMBAR con prisa "hoy"**: recordar la dirección del centro de salud y ofrecer la hoja impresa.
- Si la persona marca la pregunta de **apoyo emocional** o toca "¿Te sientes mal por dentro?": el operador ofrece hablar en un lugar aparte y muestra la Línea de la Vida (800 911 2000). Nunca comentar en voz alta frente a la fila.
- **Bebés menores de 3 meses**: no se miden. Remitir.
- Repetir mediciones solo como lo pide la pantalla (máximo 3). Nunca "hasta que salga verde".
- Hojas impresas: se las lleva la persona. Las que queden en el quiosco se destruyen al cierre.

## Claro u oscuro
- De fábrica MediBot sale **claro** (se lee mejor con luz de día), aunque Windows esté en modo oscuro.
- Para cambiarlo: abre el panel del operador (Ctrl+Alt+Shift+O o mantener el logo 5 segundos) y toca **«Cambiar entre
  claro y oscuro»**. La elección se guarda en el equipo y se respeta al volver a abrir. El público no ve botón de tema
  (solo «Letra grande»).

## Al cerrar
- [ ] Tocar "Terminar" y cerrar la aplicación. Nada queda guardado. Dos formas, las dos solo para el operador:
  - **Con teclado:** Ctrl+Alt+Shift+Q.
  - **Sin teclado (pantalla de reposo):** abajo a la derecha está **«Cerrar MediBot»**. Mantenlo apretado 3 segundos (la
    barra de abajo se llena) y en el diálogo toca **«Sí, cerrar»**. «No, seguir», el botón verde, Enter y los botones de
    la consola nunca cierran la app; si nadie contesta en 15 segundos, el diálogo se quita solo. Un toque corto solo dice
    «Mantén apretado para cerrar». Para volver a abrirla: el ícono MediBot del Escritorio.
  - El botón solo aparece en la app de escritorio, no en el navegador, y la voz no lo anuncia.
  - Si la pantalla es chica (por ejemplo 1366×768 con la escala de Windows al 125 %), el botón no cabe en la esquina sin
    tapar algo: entonces está al final del reposo. Desliza el reposo hacia arriba para encontrarlo.
- [ ] Destruir hojas abandonadas.
- [ ] Anotar incidentes (sin nombres): cuántos rojos, cuántos ámbar, fallos de sensor.

## Qué decir si preguntan "¿esto diagnostica?"
"No. Mide con sensores sencillos, hace preguntas de alarma y te dice si conviene que te revise personal de salud. Cada número tiene su fuente. El diagnóstico lo hace un profesional."
