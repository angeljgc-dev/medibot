# Guía de llenado de «¿A dónde voy?» (criterio 17)

Para la persona que instala el quiosco en una comunidad.

## Qué ve la persona

| Dónde | Qué sale |
|---|---|
| Resultado **rojo** | El **911 primero y grande**. Después la ambulancia local (si la configuraste) y las otras líneas. Tu centro de salud **solo** si marcaste «Atiende urgencias las 24 horas». |
| Resultado **ámbar** y pantalla del bebé menor de 3 meses | Tarjeta «¿A dónde voy?» con tu centro de salud y sus datos, más las líneas nacionales. |
| Franjas «Cuándo ir al centro de salud» | El nombre de tu centro de salud y sus datos. |
| Hoja impresa | Una línea con tu centro de salud (sin «cómo llegar», para que quepa en una carta) y los números. |
| Voz | Los números en grupos: «nueve, uno, uno»; «ochocientos, novecientos once, dos mil»; «marca cero, siete, nueve. Cuando te contesten, elige la opción uno»; los de 10 dígitos, cifra por cifra (9 7 1, 1 7 9, 0 8, 9 8). |

Sin configuración solo salen las tres líneas nacionales verificadas: **911**, **Línea de la Vida 800 911 2000** y **Línea de las Mujeres 079, opción 1**. Un campo vacío no se muestra nunca.

## Cómo configurarlo (panel de operador)

1. En la pantalla de inicio, en el panel de operador, toca **«¿A dónde voy? (centro de salud)»**.
2. **Municipio:** escribe el nombre; no importan los acentos («Matias» encuentra «Matías Romero Avendaño»). Están los 570 municipios de INEGI.
3. **Unidad de salud:** elige la que usa la comunidad. Las unidades móviles van al final y dicen «no siempre está». Si no está en la lista (o está en otro municipio), elige **«Otra unidad (escribirla a mano)»**.
4. **Datos:** lo que viene del catálogo dice «Confírmalo antes de guardar». Revisa cada campo:
   - **Nombre corto:** como lo dice la gente («Centro de Salud de Palomares»). Sin nombre, la unidad no se muestra.
   - **Cómo llegar, días de vacunación y ambulancia:** el catálogo no los trae; pregúntalos en la unidad.
   - **Teléfono:** llama antes. El catálogo solo prellena un teléfono propio (10 dígitos, no en ceros y usado por 3 unidades o menos). Muchos números del catálogo son de oficinas regionales (por ejemplo, uno se repite en 104 unidades de la Mixteca): **nunca copies uno así**. Si no contestó la unidad, déjalo vacío.
   - **Horario:** viene del catálogo cuando existe (solo 63 % de las unidades lo tienen). Confírmalo.
   - **Atiende urgencias las 24 horas:** márcalo solo si lo confirmaste. Es lo único que hace que la unidad salga en rojo.
   - **Quién confirmó y fecha:** no se muestran al público. Si pasan 12 meses, el panel de operador avisa «Revisa los datos».
5. **Vista previa:** se ve como la verá la persona. Toca **Escuchar** para oírla. Si está bien, toca **Guardar**.

Se guarda en el equipo (no en internet). No es un dato personal y no guarda nada de las personas que consultan.

## Copiar a otro quiosco

En la misma pantalla, «Copiar a otro quiosco»: **Exportar** baja `medibot_a_donde_voy.json` y lo muestra en el cuadro de texto. En el otro quiosco, elige el archivo o pega el texto y toca **Importar**. Lo importado pasa por las mismas reglas (un teléfono en ceros no entra).

## Editar a mano `data/lugares.js`

- `unidad` es la plantilla: si nadie guarda una configuración en el equipo, se usa la del archivo. Deja vacío (`""`) lo que no sepas; **nunca** pongas «[nombre]» ni «0000000000» (el lint lo rechaza).
- `nacionales` solo lleva líneas verificadas en fuente oficial, con `voz` en grupos. Al 911 no se le pone «gratis».
- `no_mostrar` guarda lo investigado que todavía no se muestra. Hoy: el **CAT de IMSS-Bienestar (800 298 11 50)**, porque dos páginas oficiales dan horarios distintos y no se sabe para qué sirve ni si es gratis. Para mostrarlo, alguien debe llamar y confirmar el horario; nunca va en rojo.
- Después de editar: `PYTHONUTF8=1 python tools/verify.py`.

## Actualizar el catálogo CLUES

1. Baja el XLSX más reciente desde http://www.dgis.salud.gob.mx/contenidos/intercambio/clues_gobmx.html (abre por http).
2. Desde la carpeta MediBot: `PYTHONUTF8=1 python -P tools/generar_clues_oaxaca.py <ESTABLECIMIENTO_SALUD_AAAAMM.xlsx>` (descarga los municipios de INEGI; con `--inegi archivo.json` usa uno guardado). Requiere `openpyxl`.
3. Revisa el encabezado de `data/clues_oaxaca.js` (fuente, fecha y licencia) y corre `verify`.

Licencia del CLUES: la DGIS dice que sus variables «están abiertas a todo el sector salud, no existen restricciones para su uso». No se pudo confirmar la licencia «Libre Uso MX» en datos.gob.mx; por eso se cita la fuente y la fecha.
