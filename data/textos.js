/* Textos fijos de MediBot. Versión 0.2 (2026-09-19), tras revisión clínico-regulatoria.
   Regla: lenguaje sencillo, frases cortas. La palabra "diagnóstico" solo aparece negada ("no es un ... diagnóstico"). */
window.MediBotData = window.MediBotData || {};
window.MediBotData.textos = {
  "version": "0.2",
  "revisado": "2026-09-19",

  "bienvenida": {
    "titulo": "Hola. Soy MediBot.",
    "que_es": [
      "Soy un proyecto escolar que te orienta.",
      "Mido pulso, oxígeno y temperatura con sensores sencillos que pueden equivocarse.",
      "Te doy ideas de alimentación con fuentes que puedes revisar."
    ],
    "que_no_es": [
      "No soy un médico ni un aparato de diagnóstico. No digo qué enfermedad tienes.",
      "No sustituyo la consulta en tu centro de salud.",
      "No vendo ni recomiendo marcas."
    ],
    "urgencia": "Si te sientes mal, ve con personal de salud. Si es urgente, llama al 911.",
    "privacidad_titulo": "Aviso de privacidad",
    "privacidad": [
      "Responsable: [nombre y domicilio de la escuela].",
      "MediBot usa tus respuestas y tus medidas de pulso, oxígeno, temperatura, peso y estatura solo para mostrarte orientación en esta pantalla. Son datos de salud, que la ley considera sensibles.",
      "No te pedimos tu nombre. No se guarda nada, no sale de este equipo y se borra al terminar.",
      "Si no quieres que se usen, no continúes o toca Terminar. Aviso completo: cartel junto al quiosco."
    ],
    "boton": "Entiendo, empezar"
  },

  "descargo_corto": "MediBot orienta, no da diagnósticos. Ante cualquier duda, acude con personal de salud.",

  "leyenda_cofepris": {
    "mayusculas": [
      "ESTE PRODUCTO NO ES UN MEDICAMENTO.",
      "EL CONSUMO DE ESTE PRODUCTO ES RESPONSABILIDAD DE QUIEN LO RECOMIENDA Y DE QUIEN LO USA."
    ],
    "linea": "Antes de tomar cualquier suplemento, consulta a tu médico o a tu centro de salud, sobre todo si tomas medicinas, estás embarazada o estás amamantando.",
    "fuentes": [
      { "nombre": "Ley General de Salud, art. 216", "url": "https://www.diputados.gob.mx/LeyesBiblio/pdf/LGS.pdf" },
      { "nombre": "Reglamento de Control Sanitario de Productos y Servicios, Apéndice XVII, XVII.3.8", "url": "https://www.ordenjuridico.gob.mx/Documentos/Federal/pdf/wo88301.pdf" }
    ]
  },

  "niveles": {
    "rojo": {
      "nombre": "Urgencia",
      "icono": "i-triangle",
      "frase": "Necesitas atención médica ahora.",
      "explica": "Esto no es un diagnóstico, pero sí una razón para que te atiendan hoy, sin esperar.",
      "acciones": [
        "Llama al 911 o pide que alguien te lleve al hospital o centro de salud más cercano.",
        "Avisa a la persona encargada del quiosco: te va a acompañar.",
        "No manejes tú. No esperes a ver si se te pasa. Si puedes, lleva una lista de las medicinas que tomas."
      ],
      "no_esperes": "Nunca esperes si: te duele el pecho, no puedes respirar, sangras mucho, o alguien pierde el conocimiento."
    },
    "ambar": {
      "nombre": "Ve al centro de salud",
      "icono": "i-circle",
      "frase": "Conviene que te revise personal de salud en los próximos días.",
      "frase_hoy": "Conviene que te revise personal de salud hoy mismo.",
      "explica": "Esto no es un diagnóstico. Es una orientación con lo que medimos y respondiste hoy.",
      "acciones": [
        "Acude a tu centro de salud o unidad médica en los próximos 2 o 3 días.",
        "Lleva esta hoja: tiene tus mediciones de hoy y ayuda al personal de salud.",
        "Si algo empeora antes, no esperes: llama al 911."
      ],
      "acciones_hoy": [
        "Acude hoy mismo a tu centro de salud o unidad médica. No lo dejes para la semana.",
        "Lleva esta hoja: tiene tus mediciones de hoy y ayuda al personal de salud.",
        "Si aparece dolor de pecho, falta de aire, confusión o sangrado, llama al 911."
      ],
      "no_esperes": "Ve de inmediato si aparece: dolor de pecho, falta de aire, fiebre muy alta, confusión o sangrado."
    },
    "verde": {
      "nombre": "Autocuidado",
      "icono": "i-check",
      "frase": "Hoy no encontramos señales de alarma.",
      "explica": "Esto no es un diagnóstico. Es una orientación con lo que medimos y respondiste hoy.",
      "acciones": [
        "Sigue cuidándote: come variado, toma agua, muévete y duerme bien.",
        "Si tienes un malestar, obsérvalo. Si dura más de 2 semanas, ve al centro de salud.",
        "Hazte una revisión general en tu centro de salud al menos una vez al año."
      ],
      "no_esperes": "Aunque hoy salió verde: si sientes dolor de pecho, falta de aire o un malestar fuerte y nuevo, ve con personal de salud.",
      "nota_60mas": "Aunque tu temperatura salga bien: si te sientes muy mal, no comes o te ves confundido, ve con personal de salud. En personas mayores una infección puede no dar fiebre."
    }
  },

  "datos_incompletos": {
    "titulo": "No pudimos medirte bien.",
    "texto": "Esto no quiere decir que estés enfermo, ni que estés sano: quiere decir que aquí no lo sabemos. Cuando puedas, pásate a tu centro de salud."
  },

  "datos_incompletos_nino": {
    "titulo": "En niñas y niños no damos semáforo por números.",
    "texto": "Mostramos los valores con el rango de su edad. Llévalos a su centro de salud en la siguiente revisión; ahí sí pueden valorarlo bien."
  },

  "embarazo": {
    "pregunta": "¿Estás embarazada o crees que puedes estarlo?",
    "ayuda": "Opcional. Solo cambia una recomendación.",
    "linea": "Si estás embarazada, acude a tu control prenatal aunque te sientas bien, y comenta ahí cualquier suplemento antes de tomarlo."
  },

  "etiquetas_medicion": {
    "verde": "Dentro de lo esperado",
    "ambar": "Conviene revisar",
    "rojo": "Fuera de rango: urgente",
    "nd": "Se muestra sin clasificar",
    "invalida": "Medición no válida"
  },

  "safety_netting": {
    "titulo": "Vuelve o pide ayuda si…",
    "puntos": [
      "Te sientes peor que ahora, aunque los números hayan salido bien.",
      "Un malestar no mejora en 2 días o dura más de 2 semanas.",
      "Aparece algo nuevo que te asusta."
    ],
    "fuente": { "nombre": "MedlinePlus (NIH), Fiebre: cuándo contactar a un profesional", "url": "https://medlineplus.gov/spanish/ency/article/003090.htm" }
  },

  "telefonos": [
    { "nombre": "Emergencias", "numero": "911", "nota": "Ambulancia, policía, bomberos. Gratis, 24 horas.", "fuente": { "nombre": "Gobierno de México, 911", "url": "https://www.gob.mx/911" } },
    { "nombre": "Línea de la Vida", "numero": "800 911 2000", "nota": "Si te sientes muy triste, con angustia o con ganas de ya no estar. Gratis, 24 horas, te escuchan.", "fuente": { "nombre": "CONASAMA, Línea de la Vida", "url": "https://www.gob.mx/conasama/articulos/linea-de-la-vida-800-911-2000" } }
  ],

  "limitaciones_medicion": {
    "spo2": "Este número puede salir equivocado. Sale más alto de lo real si tu piel es morena u oscura. Sale mal con manos frías, uñas pintadas o postizas, si te mueves o si fumaste hace poco. Si te sientes mal, hazle caso a cómo te sientes, no al número.",
    "fc": "El pulso sube si acabas de caminar, si tienes nervios o tomaste café. Descansa 5 minutos y vuelve a medir. Si haces deporte seguido, es normal tenerlo más bajo (40 a 60).",
    "temp": "Este sensor no es un termómetro clínico. Se mide en la axila, sostenido 3 minutos, y aun así es aproximado. La fiebre por sí sola no es urgencia; lo que importa es cómo te sientes.",
    "imc": "El IMC es solo una pista. No distingue músculo de grasa. La báscula del quiosco se calibra con una pesa patrón; el valor puede variar medio kilo."
  },

  "acerca": {
    "parrafos": [
      "Este proyecto nació al analizar un aparato que se vende como 'analizador cuántico'. Al abrir su base de datos vimos que sus 'diagnósticos' son frases escritas de antemano (etiquetadas R01A a R62B) que el programa elige según un número. No mide nada del cuerpo.",
      "Un aparato así puede tranquilizar a alguien enfermo o asustar a alguien sano. Por eso MediBot hace lo contrario: usa sensores que se pueden comprobar con una pesa patrón o un termómetro, dice de dónde sale cada rango y cada consejo, y siempre te manda con personal de salud.",
      "MediBot no da diagnósticos porque eso requiere a un profesional que te explore, te pregunte y pida estudios. Lo que sí puede hacer un quiosco honesto es orientar: avisarte cuando algo merece revisión y darte información con fuente.",
      "Todo lo que ves aquí se puede revisar: cada número tiene un enlace a su fuente, la báscula y el termómetro tienen bitácora de calibración, y el código está abierto para el jurado y la comunidad."
    ]
  },

  "categorias_titulo": "¿Qué te gustaría cuidar?",
  "categorias_ayuda": "Elige hasta 3. Te daré ideas de alimentos de aquí y, solo si hace falta, de suplementos con su fuente.",

  "imprimir_titulo": "ESTO NO ES UN RESULTADO MÉDICO",
  "imprimir_nota": "Escribe tu nombre a mano solo si quieres llevar esta hoja al centro de salud. MediBot no lo guarda. Si dejas la hoja, tírala tú: no la dejes en el quiosco.",

  "pie_apoyo": "¿Te sientes mal por dentro?"
};
