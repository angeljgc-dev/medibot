/* «¿A dónde voy?» v1.0 (2026-11-02), criterio 17. Guía de llenado: docs/guia_lugares.md.
   - `nacionales`: solo líneas VERIFICADAS en fuente oficial. `voz` es como se dicen los números (en grupos).
     Al 911 no se le pone «gratis» (la regla vigente de gratuidad sin saldo no está verificada).
   - `unidad`: plantilla editable a mano por la comunidad. La configuración que guarda el operador en el equipo
     (pantalla «¿A dónde voy?» del panel de operador) se superpone a esta plantilla. Un campo vacío no se muestra.
   - `no_mostrar`: líneas investigadas que NO se muestran todavía, con el motivo. El código nunca las lee para pantalla.
   El objeto es JSON válido (lo lee json.loads en tools/lint_contenido.py). Lógica: js/lugares.js. */
window.MediBotData = window.MediBotData || {};
window.MediBotData.lugares = {
  "version": "1.0",
  "fecha": "2026-11-02",
  "textos": {
    "titulo": "¿A dónde voy?",
    "unidad_titulo": "Tu centro de salud",
    "lineas_titulo": "Líneas nacionales",
    "rojo_llama": "Si es urgente, llama ya al",
    "prellenado": "Del catálogo de la DGIS (CLUES, septiembre de 2026). Confírmalo antes de guardar.",
    "revisar": "Revisa los datos de «¿A dónde voy?»: se confirmaron hace más de 12 meses."
  },
  "etiquetas": {
    "como_llegar": "Cómo llegar",
    "horario": "Horario",
    "telefono": "Teléfono",
    "ambulancia": "Ambulancia o traslado",
    "vacunacion": "Días de vacunación"
  },
  "nacionales": [
    {
      "id": "emergencias_911",
      "nombre": "Emergencias",
      "numero": "911",
      "voz": "nueve, uno, uno",
      "nota": "Ambulancia, policía y bomberos. Las 24 horas, todos los días.",
      "fuente": { "nombre": "Gobierno de México, 911", "url": "https://www.gob.mx/911/articulos/como-realizo-una-llamada-al-9-1-1-90817" }
    },
    {
      "id": "linea_vida",
      "nombre": "Línea de la Vida",
      "numero": "800 911 2000",
      "voz": "ochocientos, novecientos once, dos mil",
      "nota": "Si te sientes muy triste, con angustia o con ganas de ya no estar. Gratis, las 24 horas, te escuchan.",
      "fuente": { "nombre": "CONASAMA, Línea de la Vida", "url": "https://www.gob.mx/conasama/articulos/linea-de-la-vida-800-911-2000" }
    },
    {
      "id": "mujeres_079",
      "nombre": "Línea de las Mujeres",
      "numero": "079, opción 1",
      "voz": "marca cero, siete, nueve. Cuando te contesten, elige la opción uno",
      "nota": "Si vives violencia o necesitas orientación. Gratis y confidencial, las 24 horas.",
      "fuente": { "nombre": "SESNSP, 079 opción 1, Línea de las Mujeres", "url": "https://www.gob.mx/sesnsp/articulos/conoce-el-079-opcion-1-linea-de-bienestar-para-las-mujeres" }
    }
  ],
  "unidad": {
    "nombre_corto": "",
    "como_llegar": "",
    "horario": "",
    "telefono": "",
    "ambulancia": "",
    "vacunacion": "",
    "urgencias_24h": false,
    "clues": "",
    "municipio": "",
    "confirmo": "",
    "fecha_confirmacion": ""
  },
  "no_mostrar": [
    {
      "id": "imss_bienestar_cat",
      "nombre": "IMSS-Bienestar, Centro de Atención Telefónica",
      "numero": "800 298 11 50",
      "motivo": "Dos páginas oficiales dan horarios distintos (L-V 9:00-15:00 y 17:00-19:00 frente a L-V 9:00-19:00) y no está verificado para qué sirve ni si es gratis. No es de emergencia: nunca va en rojo. Se puede mostrar en ámbar y en la hoja cuando alguien llame y confirme el horario.",
      "fuente": { "nombre": "IMSS-Bienestar", "url": "https://www.imssbienestar.gob.mx" }
    }
  ]
};
