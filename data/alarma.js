/* Preguntas de señales de alarma. Versión 0.2 (2026-09-19), tras revisión clínica.
   nivel "rojo": urgencia; se ofrece saltar directo al resultado.
   nivel "ambar": centro de salud en los próximos días.
   nivel "apoyo": no cambia el semáforo; abre la tarjeta de Línea de la Vida.
   solo_grupo: lista de grupos de edad en los que se muestra (vacío = todos). */
window.MediBotData = window.MediBotData || {};
window.MediBotData.alarma = {
  "version": "0.2",
  "intro": "Responde sí o no. Son preguntas para saber si necesitas ayuda hoy mismo. Si respondes sí a una señal de urgencia, te diremos qué hacer de inmediato.",
  "preguntas": [
    { "id": "pecho", "nivel": "rojo",
      "texto": "¿Ahorita te duele el pecho o sientes que te aprieta, y el dolor se pasa al brazo, al cuello o a la quijada?",
      "ayuda": "También si sudas frío.",
      "fuente": { "nombre": "IMSS, Infarto del corazón", "url": "https://www.imss.gob.mx/salud-en-linea/infarto" } },

    { "id": "aire", "nivel": "rojo",
      "texto": "¿Te falta el aire estando quieto, o ves morados los labios o las uñas?",
      "ayuda": "",
      "fuente": { "nombre": "MedlinePlus (NIH), Dificultad respiratoria", "url": "https://medlineplus.gov/spanish/ency/article/003075.htm" } },

    { "id": "cerebro", "nivel": "rojo",
      "texto": "¿De repente se te torció la cara, perdiste fuerza en un brazo o una pierna, o se te trabó la lengua?",
      "ayuda": "Aunque ya se te haya pasado.",
      "fuente": { "nombre": "Secretaría de Salud, Infarto cerebral", "url": "https://www.gob.mx/salud/prensa/415-en-mexico-se-registran-alrededor-de-170-mil-infartos-cerebrales" } },

    { "id": "desmayo", "nivel": "rojo",
      "texto": "¿Hoy te desmayaste, te dio un ataque (convulsión), o alguien te ve muy confundido?",
      "ayuda": "",
      "fuente": { "nombre": "MedlinePlus (NIH), Fiebre: cuándo llamar al 911", "url": "https://medlineplus.gov/spanish/ency/article/003090.htm" } },

    { "id": "sangre", "nivel": "rojo",
      "texto": "¿Estás sangrando mucho y no se detiene, o estás vomitando sangre?",
      "ayuda": "",
      "fuente": { "nombre": "MedlinePlus (NIH), Sangrado", "url": "https://medlineplus.gov/spanish/ency/article/000045.htm" } },

    { "id": "nino_peligro", "nivel": "rojo", "solo_grupo": ["nino"],
      "texto": "¿El niño o la niña no quiere comer ni beber, vomita todo, o está muy decaído y no despierta bien?",
      "ayuda": "",
      "fuente": { "nombre": "OPS/OMS, AIEPI: signos generales de peligro", "url": "https://iris.paho.org/bitstream/handle/10665.2/49287/si-clinico2.pdf" } },

    { "id": "apoyo", "nivel": "apoyo",
      "texto": "¿Te gustaría que alguien te escuche? A veces uno se siente muy triste, con mucha angustia o con ganas de ya no estar.",
      "ayuda": "No cambia tu resultado. Solo te mostramos dónde te escuchan gratis, las 24 horas.",
      "telefono": "800 911 2000",
      "fuente": { "nombre": "CONASAMA, Línea de la Vida", "url": "https://www.gob.mx/conasama/articulos/linea-de-la-vida-800-911-2000" } },

    { "id": "tos", "nivel": "ambar",
      "texto": "¿Llevas más de dos semanas tosiendo, o tosiendo con flema?",
      "ayuda": "En el centro de salud te hacen un estudio gratuito.",
      "relacionada": "spo2",
      "fuente": { "nombre": "IMSS, Tuberculosis pulmonar", "url": "https://www.imss.gob.mx/salud-en-linea/tuberculosis-pulmonar" } },

    { "id": "peso", "nivel": "ambar",
      "texto": "¿Has bajado de peso sin querer en las últimas semanas?",
      "ayuda": "",
      "fuente": { "nombre": "IMSS, Tuberculosis pulmonar", "url": "https://www.imss.gob.mx/salud-en-linea/tuberculosis-pulmonar" } },

    { "id": "molestia", "nivel": "ambar",
      "texto": "¿Tienes alguna molestia (dolor, ardor, comezón o una herida que no cierra) que lleve más de dos semanas sin quitarse?",
      "ayuda": "",
      "fuente": { "nombre": "Criterio del proyecto (dos semanas), tomado del criterio de tos del IMSS", "url": "https://www.imss.gob.mx/salud-en-linea/tuberculosis-pulmonar" } }
  ]
};
