# Cambios

## 0.6.0 (2026-11-15)

### Agregado
- Pregunta de sexo opcional en "Sobre ti", después de la edad: Mujer, Hombre o Prefiero no decir, con pictograma y voz ("Niña" y "Niño" si la consulta es por un niño). No se pregunta a bebés y no cambia el semáforo ni ningún rango.
- Pregunta de embarazo para niñas de 9 a 11 años (sin la opción de dar pecho, que empieza a los 12).
- Pregunta de edad "12 a 14" o "15 a 17", solo cuando una persona de 12 a 17 dice que está embarazada. Si no se contesta, se toma el lado protector.
- Mensaje protector para niñas y adolescentes embarazadas, en el resultado, la voz y la hoja, con una versión para la niña y otra para el adulto que la acompaña. Pide ir al centro de salud "hoy" (de 9 a 14 años, y de 15 a 17 si el semáforo ya pide ir hoy o es rojo) o "esta semana" (de 15 a 17 en verde o amarillo sin prisa), dice que puede hablar a solas con el personal de salud y da el 079 opción 1 y el 911. No cambia el color del semáforo.
- "Prefiero no decir" también por voz en la pregunta de embarazo cuando el sexo es "Prefiero no decir".
- "¿Está bien esto?" muestra el sexo contestado.
- Pictogramas `p-mujer`, `p-hombre` y `p-no-decir` (78 en total).
- Variable `MEDIBOT_OCULTA=1` para correr la app sin ventana visible en pruebas automáticas.
- Pruebas nuevas: `tests/ronda6.test.mjs`, `tests/ronda6b.test.mjs`, `tools/e2e_ronda6.py` y `tools/e2e_ronda6b.py`. La revisión de desborde incluye las pantallas nuevas (pregunta de sexo, embarazo de una niña y mensaje protector).
- Propuesta para que la firme personal de salud (no aplicada): amarillo con prisa "hoy" para embarazo de 9 a 14 años. Está en `docs/reglas_orientacion.md`.

### Cambiado
- Embarazo y lactancia se preguntan solo con Mujer o Prefiero no decir. Con Hombre no aparecen ni en pantalla ni en voz. Se quitaron la opción "No / soy hombre" y el "Si eres mujer:" del título.
- Cambiar el sexo o la edad borra la respuesta de embarazo o lactancia que ya no aplica. Cambiar la edad conserva el sexo, salvo al pasar a bebé.
- La edad "6 a 11 años" se partió en "6 a 8" y "9 a 11". Las sesiones con "6 a 11" siguen funcionando.
- Con embarazo "Sí" o "Prefiero no decir" desde los 9 años, las ideas aplican los mismos filtros de embarazo que a una adulta, y salen las señales de alarma del embarazo y las tarjetas de "Cuidado con esto" del embarazo (té de ruda incluido). La idea "Comida segura en el embarazo" ya no dice "tu bebé".
- A una menor embarazada no se le muestra nada que dé por hecho el parto o la lactancia, ni la fuente de lactancia. Para menores de 12, la sección se llama "Embarazo".
- Su hoja no imprime la sub-edad ni la tarjeta "Tu control prenatal", porque el mensaje protector ya lo dice.
- Con el mensaje protector, la frase del encabezado, la voz y la hoja dicen "Por el embarazo, ve hoy al centro de salud" ("esta semana" de 15 a 17; "llévala" si consulta otra persona). Se quitan "puedes cuidarte en casa", "en los próximos días" y frases parecidas.
- Cuando un adulto consulta por una niña embarazada, las ideas le hablan de la niña ("su control prenatal", "que no tome otros").
- "Cólicos de la regla" no se le sugiere a Hombre, y "Tomar menos alcohol" ya no le menciona la regla.
- Alcohol en el embarazo: la alternativa es "No tomes nada de alcohol", nunca "toma menos".
- Actividad física de 12 a 17 años con la dosis de su edad ("De 5 a 17 años: una hora al día").
- Trato de tú en todo: el mensaje para el adulto, "Consulta a tu médico", "Comer a tus horas", "Te damos ideas".
- "¿Por qué MediBot no diagnostica?" sin tecnicismos ni promesa de enlaces en el quiosco. "Sin clasificar" se dice en palabras simples.
- La voz lee los rangos como "de 80 a 130", dice el nombre que se ve en la pantalla ("Niña", "Sí, está embarazada") y explica una sola vez cómo marcar el 079.
- Cada idea muestra solo las fuentes que corresponden a la persona: nada sobre la regla a hombres, ni guías de personas mayores a quien no lo es, ni la cartilla de 20 a 59 a menores.

### Corregido
- La hoja impresa salía con fondo oscuro si el quiosco estaba en modo oscuro. Ahora siempre sale en blanco.
- "Salir de la aplicación", en el panel del operador, usaba el diálogo del sistema. Ahora pregunta con el diálogo de MediBot.
- El contador "s escuchando" del modo evidencia avanzaba antes de empezar. Ahora marca 0.
- "1 unidades públicas" ahora dice "1 unidad pública".
- La casilla de la voz del panel medía menos de 44 px.
- El panel del operador decía "aprieta el verde", pero no tiene botonera.
- A 375 px, con la voz encendida, el título de "Qué cuidar" quedaba cortado.
- La bienvenida repetía que no se guarda nada, y en la pregunta de embarazo "(opcional)" salía dos veces.

## 0.5.0 (2026-11-02)

### Interfaz
- Diseño nuevo de todas las pantallas: una idea por pantalla, letra Atkinson Hyperlegible, títulos y números en Bahnschrift, colores con contraste alto en claro y oscuro.
- Botonera fija abajo con los colores de los botones físicos (azul = oír, rojo = atrás o no, verde = seguir o sí). Enter y el botón verde siempre hacen lo que dice el verde.
- 75 pictogramas propios en estilo "bordado" (contorno oscuro, colores de textil oaxaqueño, gente con rasgos de la región, comida de aquí). Salen de una sola fuente, `tools/generar_pictos.py`.
- Semáforo con forma y palabra: verde (palomita en círculo), amarillo (círculo con punto), rojo (triángulo con signo de admiración).
- Pantalla roja con el 911 completo y a la vista, también con letra grande y en pantallas de 375 px.
- El 911 siempre visible en la pantalla de inicio.
- Botón "Letra grande" en las pantallas de la consulta; se regresa a normal al terminar.
- Tema claro de fábrica; el operador puede cambiarlo a oscuro.
- Botón "Cerrar MediBot" en la pantalla de inicio (mantener 3 s y confirmar).
- El panel del operador ya no se ve en el inicio: se abre con el logo (5 s) o Ctrl+Alt+Shift+O.
- La app dice que el uso del quiosco es gratis.

### Contenido
- Corpus de 138 ideas en 18 secciones: alimentos de la región, plantas, hábitos y suplementos, con fuente, cuidados y alternativas cuando no se consigue algo.
- Ideas personalizadas por edad, embarazo, lactancia, medicinas de todos los días y resultado de las mediciones.
- "Cuidado con esto": 14 tarjetas de remedios comunes que pueden hacer daño, hasta 2 por sección.
- "¿A dónde voy?": líneas nacionales (911, Línea de la Vida, Línea de las Mujeres) y configuración del municipio y centro de salud con el catálogo de unidades públicas de Oaxaca.
- Consultas para niñas y niños con preguntas de alarma propias y trato al adulto que acompaña.
- El suero oral ya no lleva avisos que retrasen tomarlo; en su lugar, señales para ir hoy al centro de salud.

### Voz
- Voz más corta, sin recortar dosis ni avisos; lo que se oye coincide con lo que se ve.
- Los números de teléfono se leen agrupados ("ochocientos, novecientos once, dos mil").

### Hoja impresa
- Una carta, letra de 10 puntos o más; si no cabe, se quitan ideas de menor prioridad en lugar de achicar la letra.
- La hoja dice cuántas ideas trae de verdad y prioriza las de la situación de la persona.

### Mediciones
- La temperatura escrita a mano se evalúa al confirmar, no mientras se escribe.
- La báscula no guarda un peso fuera del rango creíble para la edad ("¿Se subió alguien más?").
- La simulación da un peso según la edad y se apaga al terminar cada consulta.

### Pruebas
- `tools/verify.py` corre lint de contenido, 219 pruebas del motor, pruebas en navegador de cada pantalla (lo que se ve y lo que se oye) y la revisión de desborde en 768 vistas.

## 0.3.0 (2026-09-30)

- Aplicación de escritorio para Windows con Electron: pantalla completa, autoinicio, permiso del USB sin diálogos y búsqueda del ESP32 por fabricante.
- Lectura en voz alta en español de México sin internet y respuestas con botones físicos o teclado.
- Fichas de alimentos y suplementos con lo que se puede usar si no se consiguen.
- Modo evidencia para mostrar que el sensor del "analizador cuántico" manda siempre los mismos bytes.
- Firmware del ESP32 v0.2 (pulso y oxígeno, temperatura, báscula con HX711 y botones) y guía de conexiones.

## 0.2.0 (2026-09-19)

- Primera versión del quiosco: preguntas de alarma antes de medir, semáforo con rangos de fuentes oficiales, hoja impresa y lint de contenido.
