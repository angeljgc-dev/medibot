# Cambios

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
