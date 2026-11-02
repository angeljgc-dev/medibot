/* Textos fijos de MediBot. Versión 0.5 (2026-11-02): rediseño (docs/diseno/sistema.md); antes 0.2, tras revisión clínico-regulatoria.
   Regla: lenguaje sencillo, frases cortas. La palabra "diagnóstico" solo aparece negada ("no es un ... diagnóstico"). */
window.MediBotData = window.MediBotData || {};
window.MediBotData.textos = {
  "version": "0.5",
  "revisado": "2026-11-02",

  "bienvenida": {
    "titulo": "Hola. Soy MediBot.",
    "gratis": "Es gratis.",
    "que_es": [
      "Soy un proyecto escolar que te orienta.",
      "Mido pulso, oxígeno y temperatura con sensores sencillos que pueden equivocarse.",
      "Te doy ideas para cuidarte, con su fuente, que viene en tu hoja impresa."
    ],
    "que_no_es": [
      "No soy un médico ni un aparato de diagnóstico. No digo qué enfermedad tienes.",
      "No sustituyo la consulta en tu centro de salud.",
      "No vendo ni recomiendo marcas."
    ],
    "urgencia": "Si te sientes mal, ve con personal de salud. Si es urgente, llama al 911.",
    "privacidad_titulo": "Aviso de privacidad",
    "privacidad": [
      "Responsable: equipo MediBot, grupo 301 de TSU en Automatización.",
      "MediBot usa tus respuestas y tus medidas de pulso, oxígeno, temperatura, peso y estatura solo para mostrarte orientación en esta pantalla. Son datos de salud, que la ley considera sensibles.",
      "Es gratis. No guardamos tu nombre ni tus datos.",
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
      "nombre": "Rojo: urgente",
      "icono": "i-triangle",
      "frase": "Necesitas atención médica ahora.",
      "explica": "Esto no es un diagnóstico, pero sí una razón para que te atiendan hoy, sin esperar.",
      "acciones": [
        "Llama ya al 911 o pide que te lleven al hospital. No manejes tú.",
        "Pide a alguien que esté cerca que te acompañe.",
        "No esperes a ver si se te pasa. Si puedes, lleva tus medicinas o sus cajas."
      ],
      "no_esperes": "Nunca esperes si: te duele el pecho, no puedes respirar, sangras mucho, o alguien pierde el conocimiento."
    },
    "ambar": {
      "nombre": "Amarillo: ve al centro de salud",
      "icono": "i-circle",
      "frase": "Conviene que te revise personal de salud en los próximos días.",
      "frase_hoy": "Conviene que te revise personal de salud hoy mismo.",
      "explica": "Esto no es un diagnóstico. Es una orientación con lo que medimos y respondiste hoy.",
      "acciones": [
        "Acude a tu centro de salud o unidad médica en los próximos 2 o 3 días.",
        "Lleva esta hoja: tiene tus mediciones de hoy y ayuda al personal de salud.",
        "Si empeoras o aparece dolor de pecho, falta de aire, fiebre muy alta, confusión o sangrado, no esperes: llama al 911."
      ],
      "acciones_hoy": [
        "Acude hoy mismo a tu centro de salud o unidad médica. No lo dejes para la semana.",
        "Lleva esta hoja: tiene tus mediciones de hoy y ayuda al personal de salud.",
        "Si empeoras o aparece dolor de pecho, falta de aire, fiebre muy alta, confusión o sangrado, no esperes: llama al 911."
      ],
      "no_esperes": "Ve de inmediato si aparece: dolor de pecho, falta de aire, fiebre muy alta, confusión o sangrado."
    },
    "verde": {
      "nombre": "Verde: puedes cuidarte en casa",
      "icono": "i-check",
      "frase": "Hoy no encontramos señales de alarma.",
      "explica": "Esto no es un diagnóstico. Es una orientación con lo que medimos y respondiste hoy.",
      "acciones": [
        "Sigue cuidándote: come variado, toma agua, muévete y duerme bien.",
        "Hazte una revisión general en tu centro de salud al menos una vez al año. Si un malestar dura más de 2 semanas, ve antes.",
        "Aunque hoy salió verde: si sientes dolor de pecho, falta de aire o un malestar fuerte y nuevo, llama al 911."
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

  "_trato_nino": "Criterio 59: en la consulta para un niño o una niña, el resultado, su voz y la hoja le hablan al adulto que lo acompaña. Cada par es [lo que dice para un adulto, lo que dice para el niño]; se cambia el texto tal cual (js/pantallas.js, tratoPara).",
  "trato_nino": [
    ["Conviene que te revise personal de salud", "Conviene que personal de salud revise al niño o la niña"],
    ["Necesitas atención médica ahora.", "El niño o la niña necesita atención médica ahora."],
    ["Acude hoy mismo a tu centro de salud o unidad médica.", "Lleva hoy mismo al niño o la niña a su centro de salud o unidad médica."],
    ["Acude a tu centro de salud o unidad médica", "Lleva al niño o la niña a su centro de salud o unidad médica"],
    ["tiene tus mediciones de hoy", "tiene sus mediciones de hoy"],
    ["Si empeoras o aparece", "Si empeora o le aparece"],
    ["Sigue cuidándote: come variado, toma agua, muévete y duerme bien.", "Que siga cuidándose: que coma variado, tome agua, se mueva y duerma bien."],
    ["Hazte una revisión general en tu centro de salud al menos una vez al año.", "Que tenga su revisión de niño sano en su centro de salud, cuando le toque."],
    ["si sientes dolor de pecho", "si siente dolor de pecho"],
    ["Te sientes peor que ahora", "Se siente peor que ahora"],
    ["Aparece algo nuevo que te asusta.", "Le aparece algo nuevo que te asusta."],
    ["No pudimos medirte bien.", "No pudimos medir bien al niño o la niña."],
    ["Esto no quiere decir que estés enfermo, ni que estés sano", "Esto no quiere decir que esté enfermo, ni que esté sano"],
    ["Cuando puedas, pásate a tu centro de salud.", "Cuando puedan, pasen a su centro de salud."],
    ["Si puedes, lleva tus medicinas o sus cajas.", "Si puedes, lleva sus medicinas o las cajas."],
    ["Llama ya al 911 o pide que te lleven al hospital.", "Llama ya al 911 o pide que los lleven al hospital."],
    ["Pide que te lleven al hospital.", "Pide que los lleven al hospital."],
    ["No esperes a ver si se te pasa.", "No esperes a ver si se le pasa."],
    ["ve hoy a tu centro de salud", "ve hoy con el niño o la niña a su centro de salud"],
    ["ve a tu centro de salud", "ve con el niño o la niña a su centro de salud"],
    ["Tus mediciones: ", "Sus mediciones: "]
  ],

  "embarazo": {
    "pregunta": "Si eres mujer: ¿estás embarazada o crees que puedes estarlo?",
    "pregunta_otra": "Si es mujer: ¿la persona está embarazada o cree que puede estarlo?",
    "ayuda": "Opcional. Sirve para no darte ideas que no son para el embarazo ni para cuando das pecho. Si prefieres no decir, no te damos nada que no sea para el embarazo.",
    "opciones": [
      { "id": "no", "nombre": "No / soy hombre", "voz": "¿No estás embarazada, o eres hombre?" },
      { "id": "si", "nombre": "Sí, estoy embarazada", "voz": "Si eres mujer, ¿estás embarazada o crees que puedes estarlo?" },
      { "id": "lactancia", "nombre": "Estoy dando pecho", "voz": "¿Estás dando pecho?", "voz_tras_no": "Si eres mujer, ¿estás dando pecho?" },
      { "id": "no_decir", "nombre": "Prefiero no decir", "voz": "¿Prefieres no decirlo?" }
    ],
    "linea": "Como estás embarazada, acude a tu control prenatal aunque te sientas bien, y comenta ahí cualquier suplemento antes de tomarlo.",
    "linea_otra": "Como la persona está embarazada, que acuda a su control prenatal aunque se sienta bien, y que comente ahí cualquier suplemento antes de tomarlo.",
    "linea_fiebre": "Como estás embarazada y tienes temperatura alta, avisa en tu centro de salud o en tu control prenatal. Ahí te dicen qué medicina puedes tomar para la fiebre; no tomes otras por tu cuenta.",
    "linea_fiebre_otra": "Como la persona está embarazada y tiene temperatura alta, que avise en su centro de salud o en su control prenatal. Ahí le dicen qué medicina puede tomar para la fiebre; que no tome otras por su cuenta."
  },

  "alarma_nino": "Contesta por el niño o la niña: lo que le pasa a él o a ella, no a ti.",

  "para_quien": {
    "titulo": "¿Para quién es?",
    "opciones": [
      { "id": "yo", "nombre": "Para mí", "voz": "¿Es para ti?" },
      { "id": "nino", "nombre": "Para un niño o niña", "voz": "¿Es para un niño o una niña?" },
      { "id": "otra", "nombre": "Para otra persona", "voz": "¿Es para otra persona?" }
    ]
  },

  "edad_nino": {
    "titulo": "¿Qué edad tiene el niño o la niña?",
    "opciones": [
      { "id": "menos2", "nombre": "Menos de 2 años", "voz": "¿El niño o la niña tiene menos de 2 años?" },
      { "id": "2a5", "nombre": "2 a 5 años", "voz": "¿El niño o la niña tiene de 2 a 5 años?" },
      { "id": "6a11", "nombre": "6 a 11 años", "voz": "¿El niño o la niña tiene de 6 a 11 años?" }
    ]
  },

  "medicinas": {
    "titulo": "¿Tomas alguna medicina todos los días?",
    "titulo_otra": "¿La persona toma alguna medicina todos los días?",
    "titulo_nino": "¿El niño o la niña toma alguna medicina todos los días?",
    "ayuda": "No te vamos a regañar. Solo es para no darte algo que choque con tu medicina.",
    "ayuda_otra": "No te vamos a regañar. Solo es para no darle algo que choque con su medicina.",
    "nota": "Puedes elegir varias. No se guarda: se borra al terminar. Si no eliges nada, lo tomamos como «No sé».",
    "opciones": [
      { "id": "ninguna", "nombre": "Ninguna", "exclusiva": true, "voz": "¿Tomas alguna medicina todos los días?" },
      { "id": "presion", "nombre": "Para la presión", "voz": "¿Tomas pastilla para la presión?" },
      { "id": "azucar", "nombre": "Para el azúcar (pastilla o insulina)", "voz": "¿Tomas pastilla o insulina para el azúcar?" },
      { "id": "anticoagulante", "nombre": "Para la sangre aguada o aspirina diaria", "voz": "¿Tomas medicina para la sangre aguada, o una aspirina diaria?" },
      { "id": "corazon", "nombre": "Para el corazón", "voz": "¿Tomas medicina para el corazón?" },
      { "id": "tiroides", "nombre": "Para la tiroides", "voz": "¿Tomas medicina para la tiroides?" },
      { "id": "nervios_sueno", "nombre": "Para dormir o para los nervios", "voz": "¿Tomas medicina para dormir o para los nervios?" },
      { "id": "convulsiones", "nombre": "Para convulsiones o epilepsia", "voz": "¿Tomas medicina para las convulsiones o la epilepsia?" },
      { "id": "anticonceptivo", "nombre": "Para no embarazarse (pastilla o inyección)", "solo_grupos": ["12a17", "18a59"], "voz": "¿Usas pastillas o inyección para no embarazarte?" },
      { "id": "no_se", "nombre": "No sé", "exclusiva": true, "voz": "¿Tomas una medicina pero no sabes para qué es?", "voz_otra": "¿No sabes qué medicina toma?" }
    ],
    "condiciones": {
      "titulo": "También me han dicho que tengo:",
      "titulo_otra": "A la persona también le han dicho que tiene:",
      "titulo_nino": "Al niño o la niña también le han dicho que tiene:",
      "ayuda": "Opcional. Si no marcas nada, lo tomamos como que no. No se guarda: se borra al terminar.",
      "voz_intro": "Otra pregunta, también opcional.",
      "opciones": [
        { "id": "vesicula", "nombre": "Vesícula", "voz": "¿Te han dicho que tienes problemas de la vesícula?" },
        { "id": "higado", "nombre": "Hígado", "voz": "¿Te han dicho que tienes problemas del hígado?" },
        { "id": "rinon_poca_agua", "nombre": "Riñones (o tomo poca agua)", "nombre_otra": "Riñones (o toma poca agua)", "voz": "¿Te han dicho que tienes problemas de los riñones, o que tomes poca agua?" },
        { "id": "acidez", "nombre": "Agruras", "voz": "¿Te han dicho que tienes agruras?" },
        { "id": "alergia_asteraceas", "nombre": "Alergia a la manzanilla o la margarita", "voz": "¿Te han dicho que tienes alergia a la manzanilla o a la margarita?" }
      ]
    }
  },

  "cuidar": {
    "sugerencia_titulo": "Por tu caso te sugerimos estas ideas.",
    "sugerencia_titulo_otra": "Por su caso, te sugerimos estas ideas.",
    "sugerencia_pregunta": "¿Está bien?",
    "sugerencia_una": "¿Quieres ideas de {nombre}?",
    "grupos_titulo": "¿Qué parte del cuerpo te gustaría cuidar?",
    "grupos_ayuda": "Toca una parte del cuerpo para ver sus temas.",
    "lleno": "Ya elegiste 3. Si quieres otro, quita uno.",
    "cuando_ir_titulo": "Cuándo ir al centro de salud"
  },

  "cronico": {
    "azucar": "Sigue las citas de control de tu azúcar en tu centro de salud.",
    "presion": "Sigue las citas de control de tu presión en tu centro de salud.",
    "ambos": "Sigue las citas de control de tu azúcar y de tu presión en tu centro de salud."
  },

  "recomendaciones": {
    "titulo": "Lo que te toca a ti",
    "ayuda_niveles": ["Ayuda poco", "Ayuda algo", "Ayuda bastante"],
    "encabezado_rojo": "Hoy lo importante es que te atiendan. Por eso no te damos ideas de plantas, comida ni suplementos: mira qué hacer ahora.",
    "sin_tema": "Para este tema no tenemos una idea que sea para tu caso. Pregunta en tu centro de salud.",
    "ambar_suplemento": "Antes de tomarlo, pregúntalo en tu centro de salud.",
    "embarazo_suplemento": "En el embarazo, pregúntalo en tu control prenatal antes de tomarlo.",
    "aviso_no_se": "Como no sabes qué medicina tomas, lleva las cajas de tus medicinas al centro de salud y pregunta antes de tomarlo.",
    "planta_pie": "Es un uso de la tradición; no está comprobado que cure. Consulte a su médico.",
    "sin_alternativa": "Para tu caso no tenemos un cambio seguro de esta. Pregunta en tu centro de salud.",
    "si_no_hay": "Si no consigues {nombre}, puedes probar con:",
    "si_no_hay_habito": "Si esto no se te facilita, puedes probar con:",
    "sin_cambio_propio": "Esta no tiene cambio.",
    "senales": {
      "hidratacion": {
        "id": "senal_hidratacion", "tipo": "habito", "nombre": "Toma agua y suero oral",
        "para": "Con temperatura alta el cuerpo pierde agua. Tomar líquidos seguido es lo primero.",
        "como": "Toma sorbos de agua limpia o de Vida Suero Oral durante todo el día. El suero oral es gratis en tu centro de salud.",
        "cuanto_ninos": "Dale sorbos pequeños y seguidos de agua o de suero oral. Si no quiere beber o vomita todo, ve hoy mismo al centro de salud.",
        "ayuda": 3, "evidencia": "Recomendación de MedlinePlus para la fiebre.",
        "sin_cambio": true,
        "si_no_hay": "Si no tienes suero oral, toma agua limpia a sorbos y pide suero oral en tu centro de salud.",
        "avisos_condicion": { "rinon_poca_agua": "Como te han dicho que tomes poca agua o tienes problemas de los riñones, pregunta en tu centro de salud cuánto tomar." },
        "avisos_medicina": { "corazon": "Si tomas medicina para el corazón y te han dicho que tomes poca agua, pregunta en tu centro de salud cuánto tomar." },
        "fuentes": [{ "nombre": "MedlinePlus (NIH), Fiebre", "url": "https://medlineplus.gov/spanish/ency/article/003090.htm" },
          { "nombre": "MedlinePlus (NIH), Dieta para la enfermedad renal crónica (líquidos)", "url": "https://medlineplus.gov/spanish/ency/article/002442.htm" },
          { "nombre": "MedlinePlus (NIH), Insuficiencia cardíaca: líquidos y diuréticos", "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000112.htm" }]
      },
      "prenatal": {
        "id": "senal_prenatal", "tipo": "habito", "nombre": "Tu control prenatal",
        "para": "En el embarazo, lo que más te cuida es ir a todas tus citas de control.",
        "como": "Ácido fólico y hierro: los que te da tu control. No tomes otros sin preguntar ahí.",
        "ayuda": 3, "evidencia": "Recomendación de MedlinePlus para el embarazo.",
        "sin_cambio": true,
        "si_no_hay": "Si todavía no tienes cita, pídela en tu centro de salud.",
        "fuentes": [{ "nombre": "MedlinePlus (NIH), Cuidado prenatal", "url": "https://medlineplus.gov/spanish/prenatalcare.html" }]
      }
    },
    "base": {
      "id": "base_cuidado", "tipo": "habito", "nombre": "Agua, comida variada y descanso",
      "para": "Es lo que sirve para todo y no choca con ninguna medicina.",
      "como": "Toma agua limpia, come de todos los grupos del plato y duerme a la misma hora.",
      "ayuda": 2, "evidencia": "Recomendación de la OMS.",
      "fuentes": [{ "nombre": "OMS, Alimentación sana", "url": "https://www.who.int/es/news-room/fact-sheets/detail/healthy-diet" }]
    },
    "avisos_medicina": [
      { "medicina": "azucar", "patron": "nopal", "texto": "Puede bajar más el azúcar junto con tu pastilla. Si te sientes débil, sudas frío o tiemblas, come algo y avisa en tu centro de salud.",
        "fuente": { "nombre": "UAQ, nopal y metformina (estudio en animales)", "url": "https://ri-ng.uaq.mx/bitstream/123456789/7114/1/RI001330.pdf" } },
      { "medicina": "presion", "patron": "jamaica", "texto": "Puede bajar más la presión junto con tu pastilla. Tómala con medida y coméntalo en tu control.",
        "fuente": { "nombre": "Señal débil: estudio de 2025 sobre jamaica en preprint, sin revisión por pares; se avisa por precaución" } },
      { "medicina": "tiroides", "patron": "calcio|hierro|multivit", "texto": "Tómalo 4 horas antes o 4 horas después de tu pastilla de la tiroides.",
        "fuente": { "nombre": "PeaceHealth, levotiroxina", "url": "https://www.peacehealth.org/medical-topics/id/hn-10000162" } },
      { "medicina": "anticoagulante", "patron": "quelite|espinaca|verdolaga|acelga|hoja verde", "texto": "Con medicina para la sangre aguada, come estas verduras en cantidades parecidas cada semana, sin cambiar de golpe.",
        "fuente": { "nombre": "Legacy Health, warfarina y vitamina K", "url": "https://www.legacyhealth.org/-/media/Files/PDF/Services/Adults/AntiCoagulation/Warfarin-Vitamin-K-Handout-Spanish.pdf" } }
    ]
  },


  "etiquetas_medicion": {
    "verde": "Dentro de lo esperado",
    "ambar": "Conviene revisar",
    "rojo": "Fuera de lo esperado: urgente",
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
    "temp": "Este sensor no es un termómetro clínico. Se mide en la axila: déjalo bajo el brazo, quieto, hasta que termine la cuenta. Aun así es aproximado. La fiebre por sí sola no es urgencia; lo que importa es cómo te sientes.",
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
  "categorias_ayuda": "Elige hasta 3. Te daré ideas de comida de aquí, hábitos y, solo si son para tu caso, plantas o suplementos con su fuente.",

  "imprimir_titulo": "Hoja de orientación. No es diagnóstico ni consulta médica.",
  "imprimir_nota": "Escribe tu nombre a mano solo si quieres llevar esta hoja al centro de salud. MediBot no lo guarda. Si dejas la hoja, tírala tú: no la dejes en el quiosco.",

  "motivo_corto": {
    "pecho": "Dolor o presión en el pecho",
    "aire": "Falta de aire o labios morados",
    "cerebro": "Cara chueca, brazo débil o habla trabada",
    "desmayo": "Desmayo, convulsión o confusión",
    "sangre": "Sangrado fuerte o vómito con sangre",
    "nino_peligro": "No come ni bebe o está muy decaído"
  },

  "alarma_nino_textos": {
    "pecho": { "texto": "¿Ahorita al niño o la niña le duele el pecho o siente que le aprieta, y el dolor se le pasa al brazo, al cuello o a la quijada?", "ayuda": "También si suda frío." },
    "aire": { "texto": "¿Al niño o la niña le falta el aire estando quieto, o le ves morados los labios o las uñas?" },
    "cerebro": { "texto": "¿De repente al niño o la niña se le torció la cara, perdió fuerza en un brazo o una pierna, o se le trabó la lengua?", "ayuda": "Aunque ya se le haya pasado." },
    "desmayo": { "texto": "¿Hoy el niño o la niña se desmayó, le dio un ataque (convulsión), o lo ves muy confundido?" },
    "sangre": { "texto": "¿El niño o la niña está sangrando mucho y no se detiene, o está vomitando sangre?" },
    "apoyo": { "texto": "¿Al niño o la niña le gustaría que alguien lo escuche? A veces uno se siente muy triste, con mucha angustia o con ganas de ya no estar.", "ayuda": "No cambia el resultado. Solo te mostramos dónde escuchan gratis, las 24 horas." },
    "tos": { "texto": "¿El niño o la niña lleva más de dos semanas tosiendo, o tosiendo con flema?", "ayuda": "En el centro de salud le hacen un estudio gratuito." },
    "peso": { "texto": "¿El niño o la niña ha bajado de peso sin querer en las últimas semanas?" },
    "molestia": { "texto": "¿El niño o la niña tiene alguna molestia (dolor, ardor, comezón o una herida que no cierra) que lleve más de dos semanas sin quitarse?" }
  },

  "pie_apoyo": "¿Te sientes muy triste o con angustia?",

  "voz_corta": {
    "reposo": "Hola. Si es urgente, llama al 9 1 1. Para empezar, aprieta el verde.",
    "bienvenida": "Hola, soy MediBot. Es gratis. Te hago preguntas y te mido pulso, oxígeno, temperatura y peso. No soy doctor: no digo qué enfermedad tienes. Si es urgente, llama al 9 1 1. No pido tu nombre y todo se borra al terminar. Aviso completo: el azul. Para empezar: el verde.",
    "sobreTi": "Cuéntame un poco de ti. No pedimos tu nombre.",
    "medicinas": "No te vamos a regañar. Solo es para no darte algo que choque con tu medicina.",
    "alarma": "Preguntas importantes. Verde es sí y rojo es no.",
    "mediciones": "Vamos a medir, una cosa a la vez.",
    "cuidar": "¿Qué te gustaría cuidar? Elegir es opcional. Puedes elegir hasta 3.",
    "confirmar": "Revisa tus datos.",
    "resultado": "Al final te imprimo tu hoja.",
    "fichas": "Lo que te toca a ti.",
    "resumen": "Tu hoja está lista. Verde: imprimirla. Rojo: terminar sin hoja.",
    "bebe": "Aquí no medimos a bebés de menos de 3 meses. Que lo revise personal de salud."
  }
};
