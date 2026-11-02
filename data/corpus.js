/* Corpus de MediBot v1.0 (2026-11-01). Esquema: docs/corpus_esquema.md.
   Generado y validado por la curaduría clínico-regulatoria; el objeto es JSON válido (lo lee json.loads). */
window.MediBotData = window.MediBotData || {};
window.MediBotData.corpus = {
  "version": "1.0",
  "revisado": "2026-11-02",
  "temas": [
    {
      "id": "embarazo",
      "nombre": "Embarazo y dar pecho",
      "icono": "i-person",
      "dibujo": "🤰",
      "clase": "situacion",
      "tipos_permitidos": [
        "alimento",
        "habito",
        "suplemento"
      ],
      "sugerir_si": [
        "embarazo",
        "lactancia"
      ],
      "prioridad": 1,
      "cuando_ir": {
        "texto": "Si estás embarazada, ve de inmediato al hospital si tienes: sangrado o salida de agua por la vagina, dolor fuerte de panza, dolor de cabeza que no se quita, zumbido de oídos o ves lucecitas, si el bebé se mueve menos o ya no se mueve, o si empiezan los dolores de parto. Si no puedes llegar, llama al 911. Ve a todas tus consultas de control.",
        "fuentes": [
          {
            "nombre": "Secretaría de Salud, Cartilla Nacional de Salud de la mujer de 20 a 59 años (2023)",
            "url": "https://www.gob.mx/cms/uploads/attachment/file/894122/Cartilla_Mujeres_2023.pdf"
          },
          {
            "nombre": "NHS, Vaginal bleeding in pregnancy",
            "url": "https://www.nhs.uk/pregnancy/common-symptoms/vaginal-bleeding/"
          },
          {
            "nombre": "Gobierno de México, 9-1-1 Emergencias",
            "url": "https://www.gob.mx/911"
          }
        ],
        "edad_minima": 12
      }
    },
    {
      "id": "ninos",
      "nombre": "Niñas y niños",
      "icono": "i-person",
      "dibujo": "🧒",
      "clase": "situacion",
      "tipos_permitidos": [
        "alimento",
        "habito"
      ],
      "sugerir_si": [
        "nino"
      ],
      "prioridad": 2,
      "cuando_ir": {
        "texto": "Lleva de inmediato a tu niña o niño a la unidad de salud si: respira muy rápido, se le hunden las costillas al respirar o le silba el pecho; tiene los labios morados; está muy dormido o sin fuerza; no come ni bebe, o vomita todo; tiene fiebre de más de 38 grados que no baja; tiene popó con sangre, los ojos hundidos, llora sin lágrimas u orina menos. En el recién nacido, también si no quiere mamar, tiene la mollera hundida o abombada, o el ombligo rojo o con mal olor.",
        "fuentes": [
          {
            "nombre": "Secretaría de Salud, Cartilla Nacional de Salud de niñas y niños de 0 a 9 años (2023)",
            "url": "https://www.gob.mx/cms/uploads/attachment/file/894123/Cartilla_Ni_os_2023.pdf"
          }
        ]
      }
    },
    {
      "id": "mayores",
      "nombre": "Persona mayor: caídas y memoria",
      "icono": "i-person",
      "dibujo": "👵",
      "clase": "situacion",
      "tipos_permitidos": [
        "alimento",
        "habito"
      ],
      "sugerir_si": [
        "mayor60"
      ],
      "prioridad": 5,
      "cuando_ir": {
        "texto": "Ve al centro de salud si te caíste 2 veces o más en el año, si tienes miedo de caerte, si se te olvidan las cosas más que antes, o si andas triste o te sientes solo. Si alguien se cae y no se puede levantar, o se pegó en la cabeza, la espalda o la cadera, no lo cargues: pide ayuda y llama al 911. Si de pronto a alguien se le tuerce la cara, no puede levantar un brazo o no puede hablar bien, llama al 911 de inmediato.",
        "fuentes": [
          {
            "nombre": "Secretaría de Salud, Cartilla Nacional de Salud de adultos mayores de 60 años (2023)",
            "url": "https://www.gob.mx/cms/uploads/attachment/file/894120/Cartilla_Adultos_2023.pdf"
          },
          {
            "nombre": "NHS, Falls",
            "url": "https://www.nhs.uk/conditions/falls/"
          },
          {
            "nombre": "NHS, Symptoms of a stroke",
            "url": "https://www.nhs.uk/conditions/stroke/symptoms/"
          },
          {
            "nombre": "Gobierno de México, 9-1-1 Emergencias",
            "url": "https://www.gob.mx/911"
          }
        ],
        "edad_minima": 12
      }
    },
    {
      "id": "dolor_cabeza",
      "nombre": "Dolor de cabeza",
      "icono": "i-info",
      "dibujo": "🤕",
      "clase": "molestia",
      "grupo": "cabeza",
      "tipos_permitidos": [
        "habito"
      ],
      "cuando_ir": {
        "texto": "Llama al 911 o ve de inmediato al hospital si el dolor de cabeza empezó de golpe y es muy fuerte; si viene con la cara chueca, debilidad o adormecimiento de un lado, dificultad para hablar o caminar, confusión o mucho sueño; si hubo convulsiones; si hay fiebre muy alta con el cuello tieso o con manchas en la piel que no se quitan al apretarlas con un vaso; o si te pegaste en la cabeza en los últimos 3 meses. Ve pronto al centro de salud si el dolor viene con vómito o problemas de la vista, si empeora al toser o al agacharte, si a un niño lo despierta en la noche o si te duele muy seguido. Si estás embarazada y el dolor no se quita, ve al hospital.",
        "texto_no_ninos": [
          "Si estás embarazada y el dolor no se quita, ve al hospital."
        ],
        "fuentes": [
          {
            "nombre": "NHS, Headaches",
            "url": "https://www.nhs.uk/symptoms/headaches/"
          },
          {
            "nombre": "Secretaría de Salud, Cartilla Nacional de Salud de la mujer de 20 a 59 años (2023)",
            "url": "https://www.gob.mx/cms/uploads/attachment/file/894122/Cartilla_Mujeres_2023.pdf"
          },
          {
            "nombre": "Gobierno de México, 9-1-1 Emergencias",
            "url": "https://www.gob.mx/911"
          }
        ]
      }
    },
    {
      "id": "sueno",
      "nombre": "Sueño, nervios y tristeza",
      "icono": "i-moon",
      "dibujo": "🌙",
      "clase": "molestia",
      "grupo": "cabeza",
      "cuando_ir": {
        "texto": "Si llevas semanas durmiendo mal y no mejoras al cambiar tus hábitos, o si llevas 2 semanas o más triste, sin ganas de nada o muy preocupado, ve a tu centro de salud: ahí te pueden orientar y apoyar. Si piensas en hacerte daño o en que sería mejor no estar vivo, no estás solo: llama ya a la Línea de la Vida, 800 911 2000, gratis, las 24 horas, todos los días. Si hay peligro inmediato, llama al 911.",
        "texto_no_ninos": [
          "Si piensas en hacerte daño o en que sería mejor no estar vivo, no estás solo: llama ya a la Línea de la Vida, 800 911 2000, gratis, las 24 horas, todos los días."
        ],
        "fuentes": [
          {
            "nombre": "CONASAMA (Secretaría de Salud), La Línea de la Vida te escucha: 800 911 2000",
            "url": "https://www.gob.mx/conasama/articulos/linea-de-la-vida-800-911-2000?idiom=es"
          },
          {
            "nombre": "OMS, Trastorno depresivo (nota descriptiva): cuidado personal",
            "url": "https://www.who.int/es/news-room/fact-sheets/detail/depression"
          },
          {
            "nombre": "NHS, Insomnia (qué hacer y cuándo ir)",
            "url": "https://www.nhs.uk/conditions/insomnia/"
          },
          {
            "nombre": "Secretaría de Salud, Cartilla Nacional de Salud de adultos mayores de 60 años (2023)",
            "url": "https://www.gob.mx/cms/uploads/attachment/file/894120/Cartilla_Adultos_2023.pdf"
          },
          {
            "nombre": "Gobierno de México, 9-1-1 Emergencias",
            "url": "https://www.gob.mx/911"
          }
        ]
      }
    },
    {
      "id": "vista",
      "nombre": "Vista",
      "icono": "i-info",
      "dibujo": "👁️",
      "clase": "molestia",
      "grupo": "cabeza"
    },
    {
      "id": "boca",
      "nombre": "Boca y dientes",
      "icono": "i-hand",
      "dibujo": "🦷",
      "clase": "molestia",
      "grupo": "cabeza",
      "tipos_permitidos": [
        "alimento",
        "habito"
      ],
      "cuando_ir": {
        "texto": "Ve al centro de salud o con el dentista si te duele una muela más de 2 días, si te duele al morder, si tienes calentura con dolor de muela, o si una llaga de la boca no cierra en 3 semanas. Es urgencia si se hincha alrededor del ojo o el cuello, o si la hinchazón no te deja respirar, tragar o hablar.",
        "fuentes": [
          {
            "nombre": "NHS, Toothache",
            "url": "https://www.nhs.uk/conditions/toothache/"
          },
          {
            "nombre": "NHS, Mouth ulcers",
            "url": "https://www.nhs.uk/conditions/mouth-ulcers/"
          }
        ]
      }
    },
    {
      "id": "tos_garganta",
      "nombre": "Tos y garganta",
      "icono": "i-voz",
      "dibujo": "🗣️",
      "clase": "molestia",
      "grupo": "pecho"
    },
    {
      "id": "corazon",
      "nombre": "Presión y corazón",
      "icono": "i-heart",
      "dibujo": "❤️",
      "clase": "situacion",
      "grupo": "pecho",
      "sugerir_si": [
        "presion",
        "corazon"
      ],
      "prioridad": 4,
      "ocultar_grupos": [
        "bebe",
        "nino"
      ],
      "cuando_ir": {
        "texto": "Llama al 911 o ve de inmediato al hospital si tienes dolor o presión en el pecho que puede pasar al brazo, la espalda, el cuello o la quijada, con falta de aire, sudor frío o mareo; o si de repente se te duerme o no puedes mover la cara, un brazo o una pierna de un lado, se te tuerce la boca, no puedes hablar bien o te da un dolor de cabeza muy fuerte. No esperes a que se pase. Si tienes la presión alta, no dejes tu pastilla y pide que te midan la presión en tus consultas.",
        "fuentes": [
          {
            "nombre": "OMS, Enfermedades cardiovasculares (síntomas de infarto y de accidente cerebrovascular)",
            "url": "https://www.who.int/es/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)"
          },
          {
            "nombre": "NHS, Heart attack",
            "url": "https://www.nhs.uk/conditions/heart-attack/"
          },
          {
            "nombre": "NHS, Symptoms of a stroke",
            "url": "https://www.nhs.uk/conditions/stroke/symptoms/"
          },
          {
            "nombre": "Gobierno de México, 9-1-1 Emergencias",
            "url": "https://www.gob.mx/911"
          },
          {
            "nombre": "Secretaría de Salud, Cartilla Nacional de Salud de adultos mayores de 60 años (2023)",
            "url": "https://www.gob.mx/cms/uploads/attachment/file/894120/Cartilla_Adultos_2023.pdf"
          }
        ],
        "edad_minima": 12
      }
    },
    {
      "id": "digestion",
      "nombre": "Estómago y digestión",
      "icono": "i-leaf",
      "dibujo": "🫖",
      "clase": "molestia",
      "grupo": "panza"
    },
    {
      "id": "diarrea",
      "nombre": "Diarrea y agua limpia",
      "icono": "i-temp",
      "dibujo": "🚰",
      "clase": "molestia",
      "grupo": "panza",
      "tipos_permitidos": [
        "alimento",
        "habito",
        "suplemento"
      ],
      "cuando_ir": {
        "texto": "Ve hoy al centro de salud si hay sangre en el excremento, si no puede tomar líquidos, orina muy poco, tiene los ojos hundidos o está muy dormido, o si tiene calentura que no se quita, vómito o dolor de panza que no para. También si la diarrea no mejora en 2 días en un niño o en 5 días en un adulto. Con un bebé, ve pronto.",
        "fuentes": [
          {
            "nombre": "OMS, Enfermedades diarreicas (nota descriptiva, 7-mar-2024)",
            "url": "https://www.who.int/es/news-room/fact-sheets/detail/diarrhoeal-disease"
          },
          {
            "nombre": "MedlinePlus, Cuando usted tiene diarrea",
            "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000121.htm"
          },
          {
            "nombre": "IMSS, Enfermedad diarreica: hidratación",
            "url": "https://www.imss.gob.mx/salud-en-linea/enfermedad-diarreica"
          }
        ]
      }
    },
    {
      "id": "orina",
      "nombre": "Orina",
      "icono": "i-temp",
      "dibujo": "💧",
      "clase": "molestia",
      "grupo": "panza"
    },
    {
      "id": "colicos",
      "nombre": "Cólicos de la regla",
      "icono": "i-leaf",
      "dibujo": "🌸",
      "clase": "molestia",
      "grupo": "panza",
      "tipos_permitidos": [
        "alimento",
        "habito",
        "planta"
      ],
      "ocultar_grupos": [
        "nino",
        "60mas"
      ],
      "cuando_ir": {
        "texto": "Ve al centro de salud si el dolor de la regla es muy fuerte o peor que otras veces y no se quita, si no te deja hacer tus cosas, si tu regla se vuelve más dolorosa, más abundante o irregular, si sangras entre una regla y otra, o si te duele al orinar o al ir al baño. Si estás embarazada y te duele la panza con sangrado, salida de agua o un dolor que no se quita con reposo, ve de inmediato.",
        "fuentes": [
          {
            "nombre": "NHS, Period pain",
            "url": "https://www.nhs.uk/conditions/period-pain/"
          },
          {
            "nombre": "NHS, Stomach pain in pregnancy",
            "url": "https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/stomach-pain/"
          }
        ],
        "edad_minima": 12
      },
      "ocultar_si": [
        "embarazo"
      ]
    },
    {
      "id": "piel",
      "nombre": "Piel, raspones y piquetes",
      "icono": "i-hand",
      "dibujo": "🧴",
      "clase": "molestia",
      "grupo": "piel_huesos",
      "cuando_ir": {
        "texto": "Ve hoy al centro de salud si una herida es grande u honda, tiene tierra que no sale, es mordida de animal o de persona, o se pone hinchada, roja, caliente o con pus; si una quemadura es grande, honda, en la cara o en las partes íntimas, o fue por químico o electricidad; o si a un bebé de menos de 1 año le picó un insecto. Es urgencia si la sangre no para o sale a chorros, o si después de un piquete se hinchan los labios, la lengua o la garganta, o cuesta respirar.",
        "fuentes": [
          {
            "nombre": "NHS, Cuts and grazes",
            "url": "https://www.nhs.uk/conditions/cuts-and-grazes/"
          },
          {
            "nombre": "NHS, Tetanus",
            "url": "https://www.nhs.uk/conditions/tetanus/"
          },
          {
            "nombre": "NHS, Burns and scalds",
            "url": "https://www.nhs.uk/conditions/burns-and-scalds/"
          },
          {
            "nombre": "OMS, Quemaduras (nota descriptiva, 21-oct-2026)",
            "url": "https://www.who.int/es/news-room/fact-sheets/detail/burns"
          },
          {
            "nombre": "NHS, Insect bites and stings",
            "url": "https://www.nhs.uk/conditions/insect-bites-and-stings/"
          }
        ]
      }
    },
    {
      "id": "huesos_articulaciones",
      "nombre": "Huesos y articulaciones",
      "icono": "i-person",
      "dibujo": "🦴",
      "clase": "molestia",
      "grupo": "piel_huesos"
    },
    {
      "id": "energia",
      "nombre": "Cansancio y sangre",
      "icono": "i-person",
      "dibujo": "⚡",
      "clase": "molestia",
      "grupo": "cuerpo"
    },
    {
      "id": "defensas",
      "nombre": "Defensas",
      "icono": "i-hand",
      "dibujo": "🛡️",
      "clase": "molestia",
      "grupo": "cuerpo"
    },
    {
      "id": "azucar_peso",
      "nombre": "Azúcar y peso",
      "icono": "i-scale",
      "dibujo": "⚖️",
      "clase": "situacion",
      "grupo": "cuerpo",
      "tipos_permitidos": [
        "alimento",
        "habito"
      ],
      "sugerir_si": [
        "azucar",
        "imc_alto"
      ],
      "prioridad": 3,
      "cuando_ir": {
        "texto": "Ve al centro de salud y pide que te midan el azúcar si tienes mucha sed, orinas mucho más que antes, ves borroso, andas muy cansado o bajas de peso sin querer: pueden ser señales de azúcar alta. La prueba es sencilla. Si ya tomas medicina para el azúcar, no la dejes y ve a tus consultas. Ve pronto si tienes una herida en el pie que no cierra o que cambia de color.",
        "texto_no_ninos": [
          "Ve pronto si tienes una herida en el pie que no cierra o que cambia de color."
        ],
        "fuentes": [
          {
            "nombre": "OMS, Diabetes (nota descriptiva)",
            "url": "https://www.who.int/es/news-room/fact-sheets/detail/diabetes"
          },
          {
            "nombre": "Secretaría de Salud, Cartilla Nacional de Salud de adultos mayores de 60 años (2023)",
            "url": "https://www.gob.mx/cms/uploads/attachment/file/894120/Cartilla_Adultos_2023.pdf"
          },
          {
            "nombre": "NIDDK (NIH), La diabetes y los problemas de los pies",
            "url": "https://www.niddk.nih.gov/health-information/informacion-de-la-salud/diabetes/informacion-general/prevenir-problemas/pies-piel"
          }
        ]
      }
    }
  ],
  "entradas": [
    {
      "id": "manzanilla",
      "tipo": "planta",
      "nombre": "Manzanilla",
      "nombre_cientifico": "Matricaria chamomilla (Matricaria recutita)",
      "temas": [
        "digestion"
      ],
      "para": "Se usa tradicionalmente para aliviar molestias leves del estómago, como gases, panza hinchada o cólicos leves.",
      "como": "Té: 1 bolsita o 1 cucharadita de flor seca en una taza de agua recién hervida. Tápala 5 a 10 minutos. Hasta 3 o 4 tazas al día.",
      "cuanto_ninos": "De 6 meses a 2 años: té ligero (1 bolsita en una taza) y darle solo media taza, 2 a 4 veces al día, sin dejar el pecho ni la leche. De 2 a 6 años: 1 bolsita por taza, 2 a 4 veces al día. De 6 a 12 años: 1 o 2 bolsitas por taza, 2 a 4 veces al día.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "No la tomes si te dan alergia la ambrosía, el cempasúchil, la margarita o el crisantemo. Si la molestia dura más de una semana, o hay fiebre o sangre, ve al centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0.5,
        "medicinas": [
          "anticoagulante"
        ],
        "condiciones": [
          "alergia_asteraceas"
        ]
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "comer_despacio",
        "agua",
        "menta",
        "hinojo",
        "anis"
      ],
      "si_no_hay": "Si no hay manzanilla, comer despacio y tomar agua tibia también ayudan con los gases.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de manzanilla (Matricariae flos, 2015)",
          "url": "https://www.ema.europa.eu/documents/herbal-monograph/final-european-union-herbal-monograph-matricaria-recutita-l-flos_en.pdf"
        },
        {
          "nombre": "NCCIH (NIH), Chamomile",
          "url": "https://www.nccih.nih.gov/health/chamomile"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "menta",
      "tipo": "planta",
      "nombre": "Hierbabuena o menta",
      "nombre_cientifico": "Mentha x piperita",
      "temas": [
        "digestion"
      ],
      "para": "Se usa tradicionalmente para aliviar molestias leves del estómago, como gases o sentirse muy lleno después de comer.",
      "como": "Té: 1 bolsita o 1 cucharadita de hoja seca en una taza de agua recién hervida, tapada 5 a 10 minutos. 3 tazas al día.",
      "cuanto_ninos": "De 4 a 11 años: 1 bolsita o 1 cucharadita rasa por taza, 3 veces al día. Menores de 4 años: no.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "Si tienes agruras, puede empeorarlas. Si tienes piedras en la vesícula, pregunta antes. No es el poleo: el poleo no se toma. Si la molestia sigue después de 2 semanas, ve al centro de salud.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 4,
        "medicinas": [
          "anticoagulante"
        ],
        "condiciones": [
          "acidez",
          "vesicula"
        ]
      },
      "leyenda_embarazo": false,
      "donde": "huerto",
      "costo": 1,
      "alternativas": [
        "comer_despacio",
        "manzanilla",
        "anis",
        "hinojo"
      ],
      "si_no_hay": "Si no hay hierbabuena, comer despacio y sin prisa también ayuda con los gases.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de hoja de menta (rev. 1)",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/european-union-herbal-monograph-mentha-x-piperita-l-folium-revision-1_en.pdf"
        },
        {
          "nombre": "DOF 15-dic-1999, Acuerdo de plantas prohibidas o permitidas para tés",
          "url": "https://farmacopea.org.mx/Repositorio/LegislacionFiles/Acuerdoplantprohibidas15dic99.pdf"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "toronjil",
      "tipo": "planta",
      "nombre": "Toronjil (melisa)",
      "nombre_cientifico": "Melissa officinalis",
      "temas": [
        "sueno",
        "digestion"
      ],
      "para": "Se usa tradicionalmente para aliviar los nervios leves, ayudar a dormir y aliviar molestias leves del estómago con gases.",
      "como": "Té: 1 a 2 cucharaditas de hoja seca en una taza de agua recién hervida, tapada 5 a 10 minutos. De 1 a 3 tazas al día; para dormir, una taza en la noche.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "En México también llaman toronjil a otras plantas, como el toronjil morado. Esta información es solo de la melisa. Si los nervios o el mal dormir siguen después de 2 semanas, ve al centro de salud.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 12,
        "medicinas": [
          "anticoagulante",
          "nervios_sueno"
        ],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "dormir_misma_hora",
        "sin_cafe_tarde",
        "noche_tranquila",
        "respiracion_lenta",
        "lavanda",
        "pasiflora",
        "valeriana"
      ],
      "si_no_hay": "Si no hay toronjil, acostarte y levantarte a la misma hora ayuda más que cualquier té.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de melisa o toronjil",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-community-herbal-monograph-melissa-officinalis-l-folium_en.pdf"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "hinojo",
      "tipo": "planta",
      "nombre": "Hinojo (semilla)",
      "nombre_cientifico": "Foeniculum vulgare (fruto)",
      "temas": [
        "digestion",
        "tos_garganta",
        "colicos"
      ],
      "para": "Se usa tradicionalmente para aliviar molestias leves del estómago, como gases y cólicos, los cólicos leves de la regla y la tos con flema del catarro.",
      "como": "Té: media cucharadita bien llena de semillas machacadas en una taza grande de agua recién hervida, tapada 15 minutos. 3 tazas al día. No más de 2 semanas.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "No lo uses si te da alergia el apio, el cilantro, el anís o el eneldo. Si la tos dura más de una semana, o hay fiebre, flema de color o te falta el aire, ve al centro de salud. Si el dolor de la regla es muy fuerte, peor que otras veces, o cambia tu regla, ve al centro de salud.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 12,
        "medicinas": [
          "anticoagulante"
        ],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "comer_despacio",
        "calor_panza",
        "manzanilla",
        "anis"
      ],
      "si_no_hay": "Si no hay hinojo, comer despacio y tomar agua tibia también ayudan con los gases.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de fruto de hinojo dulce (rev. 1), indicación 2: espasmos leves de la regla",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/european-union-herbal-monograph-foeniculum-vulgare-miller-subsp-vulgare-var-dulce-mill-batt-trab-fructus-revision-1_en.pdf"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        },
        {
          "nombre": "NHS, Period pain",
          "url": "https://www.nhs.uk/symptoms/period-pain/"
        }
      ]
    },
    {
      "id": "anis",
      "tipo": "planta",
      "nombre": "Anís (semillita)",
      "nombre_cientifico": "Pimpinella anisum (fruto)",
      "temas": [
        "digestion",
        "tos_garganta"
      ],
      "para": "Se usa tradicionalmente para aliviar molestias leves del estómago, como gases, y la tos con flema del catarro.",
      "como": "Té: media a 1 cucharadita de semillas machacadas en una taza de agua recién hervida, tapada 10 minutos. 3 tazas al día. No más de 2 semanas.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "Es el anís de semillita, no el anís estrella (la estrellita café): el anís estrella no se le da a bebés ni a niños. No lo uses si te da alergia el apio, el cilantro o el hinojo.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 12,
        "medicinas": [
          "anticoagulante"
        ],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "comer_despacio",
        "descanso_liquidos",
        "miel",
        "hinojo",
        "manzanilla"
      ],
      "si_no_hay": "Si no hay anís, comer despacio y tomar agua tibia también ayudan con los gases.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de anís (Anisi fructus)",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-community-herbal-monograph-pimpinella-anisum-l-fructus_en.pdf"
        },
        {
          "nombre": "DOF 15-dic-1999, Acuerdo de plantas prohibidas o permitidas para tés",
          "url": "https://farmacopea.org.mx/Repositorio/LegislacionFiles/Acuerdoplantprohibidas15dic99.pdf"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "jengibre",
      "tipo": "planta",
      "nombre": "Jengibre",
      "nombre_cientifico": "Zingiber officinale (raíz)",
      "temas": [
        "digestion",
        "tos_garganta"
      ],
      "para": "Tomado antes de viajar, ayuda a no tener ganas de vomitar por el mareo del camión o del carro. También se usa tradicionalmente para aliviar molestias leves del estómago y del catarro.",
      "como": "Para el viaje: media a 1 cucharadita de jengibre en polvo con agua, 1 hora antes de salir. Para el estómago: una pizca a media cucharadita en polvo en una taza de agua caliente, hasta 3 veces al día.",
      "ayuda": 2,
      "evidencia": "La agencia europea de medicinas lo acepta por estudios para el mareo de viaje en adultos. Otra agencia (NCCIH, de EE. UU.) dice que los estudios no coinciden. Para el estómago es uso tradicional.",
      "aviso": "Puede dar agruras o diarrea. Si los vómitos no paran o no puedes tomar agua, ve al centro de salud.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 18,
        "medicinas": [
          "anticoagulante"
        ],
        "condiciones": [
          "acidez"
        ]
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "comer_despacio",
        "manzanilla",
        "menta"
      ],
      "si_no_hay": "Si no hay jengibre, antes de viajar come ligero y toma agua a traguitos.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de jengibre (rev. 1)",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-zingiber-officinale-roscoe-rhizoma-revision-1_en.pdf"
        },
        {
          "nombre": "NCCIH (NIH), Ginger",
          "url": "https://www.nccih.nih.gov/health/ginger"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "eucalipto",
      "tipo": "planta",
      "nombre": "Eucalipto (té de hoja)",
      "nombre_cientifico": "Eucalyptus globulus (hoja)",
      "temas": [
        "tos_garganta"
      ],
      "para": "Se usa tradicionalmente para aliviar la tos del catarro.",
      "como": "Té: 1 cucharadita de hoja seca picada en una taza de agua recién hervida, tapada 10 minutos. Hasta 3 tazas al día.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "Nunca tomes ni untes aceite de eucalipto: puede envenenar, sobre todo a los niños. Guárdalo lejos de ellos. Si la tos dura más de una semana, o hay fiebre, flema de color o te falta el aire, ve al centro de salud.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 12,
        "medicinas": [
          "anticoagulante"
        ],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "descanso_liquidos",
        "caldo",
        "miel",
        "tomillo",
        "llanten"
      ],
      "si_no_hay": "Si no hay eucalipto, toma líquidos tibios como caldo o agua durante el día.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de hoja de eucalipto",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-community-herbal-monograph-eucalyptus-globulus-labill-folium_en.pdf"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "tomillo",
      "tipo": "planta",
      "nombre": "Tomillo",
      "nombre_cientifico": "Thymus vulgaris",
      "temas": [
        "tos_garganta"
      ],
      "para": "Se usa tradicionalmente para aliviar la tos con flema del catarro.",
      "como": "Té: 1 cucharadita de tomillo seco en una taza de agua recién hervida, tapada 10 minutos. 3 o 4 tazas al día.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "No lo uses si te da alergia la hierbabuena, el romero o el orégano (son de la misma familia). Si la tos dura más de una semana, o hay fiebre, flema de color o te falta el aire, ve al centro de salud.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 12,
        "medicinas": [
          "anticoagulante"
        ],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "descanso_liquidos",
        "caldo",
        "miel",
        "eucalipto",
        "anis"
      ],
      "si_no_hay": "Si no hay tomillo, toma líquidos tibios como caldo o agua durante el día.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de tomillo",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-community-herbal-monograph-thymus-vulgaris-l-and-thymus-zygis-l-herba_en.pdf"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "ajo",
      "tipo": "planta",
      "nombre": "Ajo en la comida",
      "nombre_cientifico": "Allium sativum (diente o bulbo)",
      "temas": [
        "tos_garganta",
        "corazon"
      ],
      "para": "Se usa tradicionalmente para aliviar molestias leves del catarro. En la cocina, da sabor y te deja usar menos sal.",
      "como": "En la comida: 1 o 2 dientes de ajo picados en tu caldo o guisado, cada día. No tomes ajo en cápsulas o pastillas sin preguntar en tu centro de salud.",
      "ayuda": 1,
      "evidencia": "Uso tradicional. En cápsulas hay estudios con efectos pequeños; en la comida no está comprobado.",
      "aviso": "Puede dar mal aliento, agruras y gases. Si te van a operar, deja de comer mucho ajo 7 días antes.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 12,
        "medicinas": [
          "anticoagulante"
        ],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "descanso_liquidos",
        "menos_sal",
        "caldo",
        "miel"
      ],
      "si_no_hay": "Si no hay ajo, usa cebolla, limón y hierbas de olor para dar sabor con poca sal.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de ajo (Allii sativi bulbus)",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-allium-sativum-l-bulbus_en.pdf"
        },
        {
          "nombre": "NCCIH (NIH), Garlic",
          "url": "https://www.nccih.nih.gov/health/garlic"
        }
      ]
    },
    {
      "id": "canela",
      "tipo": "planta",
      "nombre": "Canela de rajita (Ceylán)",
      "nombre_cientifico": "Cinnamomum verum (corteza)",
      "temas": [
        "digestion"
      ],
      "para": "Se usa tradicionalmente para aliviar molestias leves del estómago, como gases o cólicos leves.",
      "como": "En té o atole: un trocito de rajita (como de 2 centímetros) o un cuarto de cucharadita de canela molida, hasta 4 veces al día.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "Usa la canela de rajita suave en capas (de Ceylán). La canela china, dura y gruesa, en mucha cantidad puede dañar el hígado. Si hay diarrea, primero toma suero oral; si sigue 2 días, ve al centro de salud.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 18,
        "medicinas": [
          "anticoagulante"
        ],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "tienda",
      "costo": 1,
      "alternativas": [
        "comer_despacio",
        "manzanilla",
        "hinojo"
      ],
      "si_no_hay": "Si no hay canela, comer despacio y tomar agua tibia también ayudan con los gases.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de corteza de canela de Ceylán",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/community-herbal-monograph-cinnamomum-verum-js-presl-cortex_en.pdf"
        },
        {
          "nombre": "NCCIH (NIH), Cinnamon",
          "url": "https://www.nccih.nih.gov/health/cinnamon"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "valeriana",
      "tipo": "planta",
      "nombre": "Valeriana",
      "nombre_cientifico": "Valeriana officinalis (raíz)",
      "temas": [
        "sueno"
      ],
      "para": "Se usa tradicionalmente para aliviar los nervios leves y ayudar a dormir.",
      "como": "Té: 1 cucharadita de raíz seca en una taza de agua recién hervida, tapada 10 a 15 minutos. Una taza de media hora a una hora antes de dormir. Hace efecto poco a poco, en 2 a 4 semanas.",
      "ayuda": 1,
      "evidencia": "Hay estudios con pastillas de extracto, pero no coinciden entre sí. El té es uso tradicional.",
      "aviso": "No la tomes si tienes problemas del hígado. Da sueño: no manejes ni uses máquinas después de tomarla. No la mezcles con alcohol. Si sigues sin dormir después de 2 semanas, ve al centro de salud.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 12,
        "medicinas": [
          "anticoagulante",
          "nervios_sueno"
        ],
        "condiciones": [
          "higado"
        ]
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 2,
      "alternativas": [
        "dormir_misma_hora",
        "sin_cafe_tarde",
        "noche_tranquila",
        "respiracion_lenta",
        "toronjil",
        "lavanda",
        "pasiflora"
      ],
      "si_no_hay": "Si no hay valeriana, acostarte y levantarte a la misma hora ayuda más que cualquier té.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de raíz de valeriana",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-valeriana-officinalis-l-radix_en.pdf"
        },
        {
          "nombre": "NCCIH (NIH), Valerian",
          "url": "https://www.nccih.nih.gov/health/valerian"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "pasiflora",
      "tipo": "planta",
      "nombre": "Pasiflora (flor de la pasión)",
      "nombre_cientifico": "Passiflora incarnata",
      "temas": [
        "sueno"
      ],
      "para": "Se usa tradicionalmente para aliviar los nervios leves y ayudar a dormir.",
      "como": "Té: 1 cucharadita de planta seca en una taza de agua recién hervida, tapada 10 minutos. De 1 a 4 tazas al día; para dormir, una en la noche.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "Puede dar sueño y mareo: no manejes después. No la tomes 2 semanas antes de una operación. Si la molestia sigue después de 2 semanas, ve al centro de salud.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 12,
        "medicinas": [
          "anticoagulante",
          "nervios_sueno"
        ],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 2,
      "alternativas": [
        "dormir_misma_hora",
        "sin_cafe_tarde",
        "noche_tranquila",
        "respiracion_lenta",
        "toronjil",
        "lavanda",
        "valeriana"
      ],
      "si_no_hay": "Si no hay pasiflora, acostarte y levantarte a la misma hora ayuda más que cualquier té.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de pasiflora",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-community-herbal-monograph-passiflora-incarnata-l-herba_en.pdf"
        },
        {
          "nombre": "NCCIH (NIH), Passionflower",
          "url": "https://www.nccih.nih.gov/health/passionflower"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "cola_caballo",
      "tipo": "planta",
      "nombre": "Cola de caballo",
      "nombre_cientifico": "Equisetum arvense",
      "temas": [
        "orina"
      ],
      "para": "Se usa tradicionalmente para orinar más cuando hay molestias leves al orinar, junto con tomar mucha agua.",
      "como": "Té: 1 cucharadita de planta seca en una taza de agua recién hervida, 3 o 4 tazas al día, y toma más agua. De 2 a 4 semanas como máximo.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "No la tomes si tienes problemas de los riñones o si te dijeron que tomes poca agua. Si hay fiebre, ardor fuerte, dolor de espalda o sangre en la orina, ve hoy al centro de salud.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 12,
        "medicinas": [
          "anticoagulante",
          "presion",
          "corazon"
        ],
        "condiciones": [
          "rinon_poca_agua"
        ]
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "agua",
        "orinar_a_tiempo",
        "ortiga",
        "diente_leon"
      ],
      "si_no_hay": "Si no hay cola de caballo, toma más agua durante el día: es lo que más ayuda.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de cola de caballo (Equiseti herba)",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-equisetum-arvense-l-herba_en.pdf"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "ortiga",
      "tipo": "planta",
      "nombre": "Ortiga (hoja)",
      "nombre_cientifico": "Urtica dioica (hoja)",
      "temas": [
        "huesos_articulaciones",
        "orina"
      ],
      "para": "Se usa tradicionalmente para aliviar dolores leves de las articulaciones y para orinar más cuando hay molestias leves al orinar.",
      "como": "Té: 1 a 2 cucharaditas de hoja seca en una taza de agua recién hervida, 3 tazas al día. No más de 4 semanas.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "No la tomes si tienes problemas de los riñones o si te dijeron que tomes poca agua. Usa guantes si la cortas fresca: pica. Si la articulación está hinchada, roja o caliente, o hay fiebre, ve al centro de salud.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 12,
        "medicinas": [
          "anticoagulante",
          "presion",
          "corazon"
        ],
        "condiciones": [
          "rinon_poca_agua"
        ]
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "caminar",
        "agua",
        "orinar_a_tiempo",
        "cola_caballo"
      ],
      "si_no_hay": "Si no hay ortiga, moverte un poco cada día ayuda a las articulaciones.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de hoja de ortiga",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-community-herbal-monograph-urtica-dioica-l-urtica-urens-l-folium_en.pdf"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "diente_leon",
      "tipo": "planta",
      "nombre": "Diente de león (raíz)",
      "nombre_cientifico": "Taraxacum officinale (raíz)",
      "temas": [
        "digestion",
        "orina"
      ],
      "para": "Se usa tradicionalmente para aliviar molestias leves de la digestión, como sentirse lleno o con gases, y para orinar más.",
      "como": "Hierve 1 cucharadita de raíz seca en una taza de agua por 5 minutos. 2 o 3 tazas al día. Si la molestia sigue después de 2 semanas, ve al centro de salud.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "No lo uses si tienes piedras en la vesícula o problemas del hígado, ni si te da alergia la manzanilla, la margarita o el cempasúchil. No la tomes si tienes problemas de los riñones o te dijeron que tomes poca agua.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 12,
        "medicinas": [
          "anticoagulante",
          "azucar",
          "presion",
          "corazon"
        ],
        "condiciones": [
          "vesicula",
          "higado",
          "rinon_poca_agua",
          "alergia_asteraceas"
        ]
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "comer_despacio",
        "agua",
        "orinar_a_tiempo",
        "manzanilla"
      ],
      "si_no_hay": "Si no hay diente de león, comer despacio y tomar agua también ayudan.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de raíz de diente de león",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-taraxacum-officinale-fh-wigg-radix_en.pdf"
        },
        {
          "nombre": "NCCIH (NIH), Dandelion",
          "url": "https://www.nccih.nih.gov/health/dandelion"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "boldo",
      "tipo": "planta",
      "nombre": "Boldo",
      "nombre_cientifico": "Peumus boldus (hoja)",
      "temas": [
        "digestion"
      ],
      "para": "Se usa tradicionalmente para aliviar molestias leves de la digestión y cólicos leves.",
      "como": "Té: 2 o 3 hojitas secas (media cucharadita) en una taza de agua recién hervida, 2 o 3 veces al día. No más de 2 semanas.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "Solo para adultos. No lo uses si tienes piedras en la vesícula o problemas del hígado. Hay reportes de alergias fuertes y de hojas falsas que se venden como boldo.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 18,
        "medicinas": [
          "anticoagulante"
        ],
        "condiciones": [
          "vesicula",
          "higado"
        ]
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "comer_despacio",
        "manzanilla",
        "menta"
      ],
      "si_no_hay": "Si no hay boldo, comer despacio y tomar agua también ayudan.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de hoja de boldo",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-peumus-boldus-molina-folium_en.pdf"
        },
        {
          "nombre": "UTEP Herbal Safety, Boldo (solo para el aviso)",
          "url": "https://utep.edu/herbal-safety/hechos-herbarios/hojas-de-datos-a-base-de-hierbas/boldo.html"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "romero",
      "tipo": "planta",
      "nombre": "Romero",
      "nombre_cientifico": "Rosmarinus officinalis (hoja)",
      "temas": [
        "digestion"
      ],
      "para": "Se usa tradicionalmente para aliviar molestias leves de la digestión y cólicos leves.",
      "como": "Té: 1 cucharadita de hoja seca (o una ramita) en una taza de agua recién hervida, 2 o 3 veces al día. No más de 2 semanas.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "No lo uses si tienes piedras en la vesícula o problemas del hígado.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 12,
        "medicinas": [
          "anticoagulante"
        ],
        "condiciones": [
          "vesicula",
          "higado"
        ]
      },
      "leyenda_embarazo": false,
      "donde": "huerto",
      "costo": 1,
      "alternativas": [
        "comer_despacio",
        "manzanilla",
        "menta"
      ],
      "si_no_hay": "Si no hay romero, comer despacio y tomar agua también ayudan.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de hoja de romero (rev. 1, 2024)",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-rosmarinus-officinalis-l-folium-revision-1_en.pdf"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "sabila",
      "tipo": "planta",
      "nombre": "Sábila (solo el gel, en la piel)",
      "nombre_cientifico": "Aloe vera (gel de la hoja)",
      "temas": [
        "piel"
      ],
      "para": "Se usa tradicionalmente el gel de adentro de la hoja para aliviar quemaduras pequeñas de la piel, como las del sol o de la cocina.",
      "como": "Lava una hoja, quítale la cáscara y la parte amarilla, y unta el gel transparente en la piel 2 o 3 veces al día. Solo por fuera: no se toma.",
      "ayuda": 2,
      "evidencia": "Algunos estudios dicen que el gel en la piel ayuda a que una quemadura leve se cierre más rápido y duela menos. Tomada por la boca puede hacer daño.",
      "aviso": "No la tomes: el jugo amarillo de la cáscara da diarrea fuerte y cólicos. No la pongas en quemaduras grandes, con ampollas o abiertas: ve al centro de salud. Si te da comezón o ronchas, quítatela.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 12,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "huerto",
      "costo": 1,
      "alternativas": [
        "agua_quemadura",
        "calendula",
        "manzanilla_piel"
      ],
      "si_no_hay": "Si no hay sábila, enfría la quemadura con agua fresca de la llave y cúbrela con un trapo limpio.",
      "fuentes": [
        {
          "nombre": "NCCIH (NIH), Aloe Vera",
          "url": "https://www.nccih.nih.gov/health/aloe-vera"
        }
      ]
    },
    {
      "id": "suero_oral",
      "tipo": "suplemento",
      "nombre": "Suero oral (Vida Suero Oral)",
      "temas": [
        "digestion",
        "diarrea"
      ],
      "para": "Repone el agua y las sales que se pierden con diarrea o vómito. Es gratis en tu centro de salud.",
      "como": "Disuelve un sobre en 1 litro de agua hervida y fría. Tómalo a traguitos después de cada vez que vayas al baño suelto; los adultos, lo que quieran. Tira lo que sobre a las 24 horas.",
      "cuanto_ninos": "Menores de 2 años: un cuarto a media taza después de cada evacuación suelta. De 2 a 10 años: media a una taza. Si vomita, dale a cucharaditas y espera 10 minutos. Sigue dándole pecho y comida.",
      "ayuda": 3,
      "evidencia": "La OMS y UNICEF lo recomiendan para no deshidratarse.",
      "aviso": "Los refrescos, las bebidas deportivas y los sueros de sabor de la tienda no lo sustituyen. Ve hoy al centro de salud si vomita una y otra vez, no puede tomar líquidos, orina muy poco, está muy decaído o muy dormido, hay sangre en el excremento o es un bebé. Si tienes los riñones mal o te dijeron que tomes poca agua, pregunta en tu centro de salud cuánto tomar.",
      "aviso_no_ninos": [
        "Si tienes los riñones mal o te dijeron que tomes poca agua, pregunta en tu centro de salud cuánto tomar."
      ],
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "centro_salud",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no tienes suero, da agua o caldo a traguitos y ve al centro de salud por sobres gratis.",
      "fuentes": [
        {
          "nombre": "OMS, Enfermedades diarreicas (nota descriptiva)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/diarrhoeal-disease"
        },
        {
          "nombre": "MSF Guías clínicas, Plan A de rehidratación de la OMS",
          "url": "https://medicalguidelines.msf.org/en/node/663"
        },
        {
          "nombre": "IMSS, Enfermedad diarreica: hidratación",
          "url": "https://www.imss.gob.mx/salud-en-linea/enfermedad-diarreica"
        },
        {
          "nombre": "NHS (Worcestershire Acute Hospitals), Oral rehydration salts: no usar con enfermedad del riñón o del hígado sin indicación médica",
          "url": "https://www.worcsacute.nhs.uk/leaflets/oral-rehydration-salts/"
        }
      ],
      "rehidratacion": true,
      "sin_cambio": true
    },
    {
      "id": "acido_folico",
      "tipo": "suplemento",
      "nombre": "Ácido fólico de tu control prenatal",
      "temas": [
        "energia",
        "embarazo"
      ],
      "para": "Es lo que el cuerpo del bebé necesita desde antes del embarazo y en los primeros meses.",
      "como": "Tómalo como te lo indiquen en tu control prenatal; casi siempre es 1 tableta al día y es gratis en tu centro de salud. Si quieres embarazarte, empieza desde antes.",
      "ayuda": 3,
      "evidencia": "La OMS lo recomienda a toda mujer que busca embarazarse y durante el embarazo.",
      "aviso": "No tomes más de lo que te indiquen.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 12,
        "medicinas": [
          "convulsiones"
        ],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "centro_salud",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no te lo han dado, pídelo en tu centro de salud. Mientras, come frijol, quelites y naranja.",
      "fuentes": [
        {
          "nombre": "OMS eLENA, Ácido fólico antes del embarazo",
          "url": "https://www.who.int/tools/elena/interventions/folate-periconceptional"
        },
        {
          "nombre": "OMS eLENA, Hierro y ácido fólico diarios en el embarazo",
          "url": "https://www.who.int/tools/elena/interventions/daily-iron-pregnancy"
        },
        {
          "nombre": "NIH ODS, Folato (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/Folate-Consumer/"
        }
      ],
      "solo_embarazo": true,
      "sin_cambio": true
    },
    {
      "id": "hierro",
      "tipo": "suplemento",
      "nombre": "Hierro de tu control prenatal",
      "temas": [
        "energia",
        "embarazo"
      ],
      "para": "Es lo que el cuerpo necesita para hacer sangre.",
      "como": "Tómalo como te lo indiquen en tu control prenatal. Tómalo con agua o agua de naranja, no junto con leche ni con pastillas de calcio.",
      "ayuda": 3,
      "evidencia": "La OMS lo recomienda en el embarazo junto con el ácido fólico.",
      "aviso": "Puede estreñir o dar dolor de estómago. Guárdalo lejos de los niños: mucho hierro los envenena.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 12,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "centro_salud",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no te lo han dado, pídelo en tu control prenatal. Mientras, come frijol con limón, amaranto y huevo.",
      "fuentes": [
        {
          "nombre": "OMS eLENA, Hierro y ácido fólico diarios en el embarazo",
          "url": "https://www.who.int/tools/elena/interventions/daily-iron-pregnancy"
        },
        {
          "nombre": "NIH ODS, Hierro (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/Iron-Consumer/"
        },
        {
          "nombre": "MedlinePlus, Levotiroxina (separar 4 horas de calcio y hierro)",
          "url": "https://medlineplus.gov/spanish/druginfo/meds/a682461-es.html"
        }
      ],
      "solo_embarazo": true,
      "avisos_medicina": {
        "tiroides": "Tómalo 4 horas antes o 4 horas después de tu pastilla de la tiroides."
      },
      "sin_cambio": true
    },
    {
      "id": "vitamina_c",
      "tipo": "suplemento",
      "nombre": "Vitamina C en tableta",
      "temas": [
        "defensas"
      ],
      "para": "Es una vitamina que el cuerpo necesita todos los días. Con fruta y verdura casi siempre hay suficiente.",
      "como": "Solo si casi no comes fruta ni verdura: 1 tableta al día. No pases de 2,000 mg al día.",
      "ayuda": 1,
      "evidencia": "Tomarla diario casi no cambia qué tan seguido te enfermas.",
      "aviso": "Mucha vitamina C da diarrea y cólicos.",
      "excluir": {
        "embarazo": true,
        "lactancia": false,
        "edad_minima": 18,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "farmacia",
      "costo": 1,
      "alternativas": [
        "guayaba",
        "naranja_limon",
        "papaya",
        "jitomate",
        "mango",
        "jicama"
      ],
      "si_no_hay": "Una guayaba o una naranja al día dan lo mismo y cuestan menos.",
      "fuentes": [
        {
          "nombre": "NIH ODS, Vitamina C (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/VitaminC-Consumer/"
        }
      ]
    },
    {
      "id": "vitamina_d",
      "tipo": "suplemento",
      "nombre": "Vitamina D",
      "temas": [
        "huesos_articulaciones"
      ],
      "para": "Es una vitamina que el cuerpo necesita. El cuerpo la hace cuando el sol le da en la piel.",
      "como": "Solo si te la indican en tu centro de salud, sobre todo si casi no sales al sol. No pases de 4,000 unidades al día.",
      "ayuda": 2,
      "evidencia": "Sirve sobre todo a personas mayores o que casi no reciben sol.",
      "aviso": "Mucha vitamina D por mucho tiempo hace daño: náusea, debilidad y piedras en el riñón.",
      "excluir": {
        "embarazo": true,
        "lactancia": false,
        "edad_minima": 18,
        "medicinas": [
          "presion"
        ],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "farmacia",
      "costo": 2,
      "alternativas": [
        "sol_manana",
        "huevo",
        "sardina"
      ],
      "si_no_hay": "Unos minutos de sol en la mañana en cara y brazos, huevo y sardina ayudan a tener vitamina D.",
      "fuentes": [
        {
          "nombre": "NIH ODS, Vitamina D (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/VitaminD-Consumer/"
        }
      ]
    },
    {
      "id": "vitamina_b12",
      "tipo": "suplemento",
      "nombre": "Vitamina B12",
      "temas": [
        "energia"
      ],
      "para": "Es una vitamina que el cuerpo necesita para la sangre y los nervios. Está en el huevo, la carne, el pescado y la leche. Si tomas metformina, pregunta en tu centro de salud por la vitamina B12.",
      "como": "Solo como te la indiquen en tu centro de salud.",
      "ayuda": 2,
      "evidencia": "Sirve a quien le falta: personas mayores, quien no come carne ni huevo, y quien toma metformina por mucho tiempo.",
      "aviso": "Casi no da molestias, pero no cambies tu medicina por ella.",
      "excluir": {
        "embarazo": true,
        "lactancia": false,
        "edad_minima": 18,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "farmacia",
      "costo": 1,
      "alternativas": [
        "huevo",
        "higado_pollo",
        "sardina"
      ],
      "si_no_hay": "Huevo, sardina, pollo o leche tienen vitamina B12.",
      "fuentes": [
        {
          "nombre": "NIH ODS, Vitamina B12 (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/VitaminB12-Consumer/"
        }
      ],
      "prioriza_si": [
        "azucar"
      ]
    },
    {
      "id": "complejo_b",
      "tipo": "suplemento",
      "nombre": "Complejo B",
      "temas": [
        "energia"
      ],
      "para": "Son vitaminas que el cuerpo necesita. Con frijol, huevo, tortilla y verduras casi siempre hay suficiente.",
      "como": "Solo si te lo indican en tu centro de salud, en tableta. No te inyectes ampolletas si no te las mandan.",
      "ayuda": 1,
      "evidencia": "Solo sirve claramente a quien le faltan.",
      "aviso": "Mucha vitamina B6 por mucho tiempo daña los nervios: no tomes más de lo que diga la caja.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 18,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "farmacia",
      "costo": 1,
      "alternativas": [
        "frijol",
        "huevo",
        "tortilla"
      ],
      "si_no_hay": "Huevo, frijol, tortilla de nixtamal y pollo tienen vitaminas B.",
      "fuentes": [
        {
          "nombre": "PMC (NIH), Vitaminas B: revisión",
          "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10542023/"
        }
      ]
    },
    {
      "id": "calcio",
      "tipo": "suplemento",
      "nombre": "Calcio en tableta",
      "temas": [
        "huesos_articulaciones"
      ],
      "para": "Es lo que el cuerpo necesita para los huesos y los dientes. La tortilla de nixtamal, la sardina con espina y los quelites tienen calcio.",
      "como": "Solo si comes poco de eso y te lo indican: no más de 500 mg por toma, con comida.",
      "ayuda": 2,
      "evidencia": "Sirve si comes poco calcio. Primero la comida.",
      "aviso": "Puede estreñir y dar gases. Sepáralo de algunos antibióticos.",
      "excluir": {
        "embarazo": true,
        "lactancia": false,
        "edad_minima": 18,
        "medicinas": [
          "presion"
        ],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "farmacia",
      "costo": 1,
      "alternativas": [
        "tortilla",
        "quelites",
        "ajonjoli",
        "sardina",
        "leche",
        "yogur"
      ],
      "si_no_hay": "La tortilla de nixtamal, la sardina con espina y los quelites tienen calcio y cuestan menos.",
      "fuentes": [
        {
          "nombre": "NIH ODS, Calcio (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/Calcium-Consumer/"
        },
        {
          "nombre": "MedlinePlus, Levotiroxina (separar 4 horas de calcio y hierro)",
          "url": "https://medlineplus.gov/spanish/druginfo/meds/a682461-es.html"
        }
      ],
      "avisos_medicina": {
        "tiroides": "Tómalo 4 horas antes o 4 horas después de tu pastilla de la tiroides."
      }
    },
    {
      "id": "magnesio",
      "tipo": "suplemento",
      "nombre": "Magnesio",
      "temas": [
        "huesos_articulaciones"
      ],
      "para": "Es un mineral que el cuerpo necesita. Está en el frijol, las pepitas, la avena y las verduras de hoja.",
      "como": "Solo si te lo indican. En pastilla, no más de 350 mg al día.",
      "ayuda": 1,
      "evidencia": "No está claro que en pastilla sirva a quien come bien.",
      "aviso": "No lo tomes si tienes problemas de los riñones o si te dijeron que tomes poca agua. En pastilla, de más da diarrea y cólicos. Sepáralo de algunos antibióticos.",
      "excluir": {
        "embarazo": true,
        "lactancia": false,
        "edad_minima": 18,
        "medicinas": [
          "presion"
        ],
        "condiciones": [
          "rinon_poca_agua"
        ]
      },
      "leyenda_embarazo": false,
      "donde": "farmacia",
      "costo": 2,
      "alternativas": [
        "frijol",
        "pepitas",
        "avena",
        "cacahuate"
      ],
      "si_no_hay": "Frijol, pepitas y avena tienen magnesio.",
      "fuentes": [
        {
          "nombre": "NIH ODS, Magnesio (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/Magnesium-Consumer/"
        }
      ]
    },
    {
      "id": "zinc",
      "tipo": "suplemento",
      "nombre": "Zinc",
      "temas": [
        "defensas"
      ],
      "para": "Es un mineral que el cuerpo necesita en cantidad pequeña. Está en el frijol, las pepitas, el huevo y la carne.",
      "como": "Solo si te lo indican en tu centro de salud. No pases de 40 mg al día.",
      "ayuda": 1,
      "evidencia": "Solo se ve beneficio en quien le falta zinc.",
      "aviso": "De más da náusea y dolor de cabeza, y con el tiempo baja el cobre del cuerpo. Sepáralo de algunos antibióticos.",
      "excluir": {
        "embarazo": true,
        "lactancia": false,
        "edad_minima": 18,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "farmacia",
      "costo": 1,
      "alternativas": [
        "pepitas",
        "frijol",
        "huevo",
        "lentejas",
        "cacahuate"
      ],
      "si_no_hay": "Pepitas de calabaza, frijol y huevo tienen zinc.",
      "fuentes": [
        {
          "nombre": "NIH ODS, Zinc (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/Zinc-Consumer/"
        }
      ]
    },
    {
      "id": "omega3",
      "tipo": "suplemento",
      "nombre": "Omega-3 en cápsula (aceite de pescado)",
      "temas": [
        "corazon"
      ],
      "para": "Son grasas que el cuerpo necesita. Están en la sardina, la chía y la nuez.",
      "como": "Solo si casi no comes pescado y te lo indican: 1 cápsula al día. No más de 5 gramos al día.",
      "ayuda": 1,
      "evidencia": "En cápsula, el efecto es pequeño. Mejor comer sardina.",
      "aviso": "Puede dar mal sabor, agruras y diarrea. No la tomes si te da alergia el pescado.",
      "excluir": {
        "embarazo": true,
        "lactancia": false,
        "edad_minima": 18,
        "medicinas": [
          "anticoagulante"
        ],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "farmacia",
      "costo": 3,
      "alternativas": [
        "sardina",
        "chia"
      ],
      "si_no_hay": "Dos latas de sardina a la semana dan estas grasas y cuestan menos.",
      "fuentes": [
        {
          "nombre": "NIH ODS, Omega-3 (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-Consumer/"
        },
        {
          "nombre": "NCCIH (NIH), Omega-3 Supplements",
          "url": "https://www.nccih.nih.gov/health/omega3-supplements-what-you-need-to-know"
        }
      ]
    },
    {
      "id": "probioticos",
      "tipo": "suplemento",
      "nombre": "Probióticos en cápsula o sobre",
      "temas": [
        "digestion"
      ],
      "para": "Son microbios buenos, como los del yogur natural. Si te dieron antibiótico, pregunta en tu centro de salud si te conviene tomarlos.",
      "como": "Solo si te lo indican, mientras tomas el antibiótico y unos días después.",
      "ayuda": 2,
      "evidencia": "Hay estudios de calidad media en adultos que toman antibiótico.",
      "aviso": "No los uses si tienes las defensas muy bajas por una enfermedad grave o una medicina fuerte.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 18,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "farmacia",
      "costo": 3,
      "alternativas": [],
      "si_no_hay": "Toma agua, come a tus horas y termina tu antibiótico como te lo indicaron.",
      "fuentes": [
        {
          "nombre": "NCCIH (NIH), Probiotics: Usefulness and Safety",
          "url": "https://www.nccih.nih.gov/health/probiotics-usefulness-and-safety"
        }
      ],
      "sin_cambio": true
    },
    {
      "id": "melatonina",
      "tipo": "suplemento",
      "nombre": "Melatonina",
      "temas": [
        "sueno"
      ],
      "para": "Es una sustancia que el cuerpo hace solo cuando está oscuro. En pastilla, a veces se usa por cambios de horario, como después de un viaje largo.",
      "como": "Solo si te la indican: 1 pastilla de dosis baja una hora antes de dormir, por pocos días.",
      "ayuda": 1,
      "evidencia": "Ayuda poco. Para el mal dormir de todos los días no hay pruebas fuertes.",
      "aviso": "Puede dar dolor de cabeza, mareo y sueño de día. No se la des a personas que olvidan mucho las cosas por la edad. Guárdala lejos de los niños.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 18,
        "medicinas": [
          "anticoagulante",
          "convulsiones",
          "nervios_sueno"
        ],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "farmacia",
      "costo": 2,
      "alternativas": [
        "dormir_misma_hora",
        "sin_cafe_tarde",
        "sol_manana",
        "noche_tranquila",
        "respiracion_lenta"
      ],
      "si_no_hay": "No tiene sustituto de tienda. Lo que sí sirve sin costo: acostarte a la misma hora, cuarto oscuro y sin pantallas una hora antes.",
      "fuentes": [
        {
          "nombre": "NCCIH (NIH), Melatonin: What You Need To Know",
          "url": "https://www.nccih.nih.gov/health/melatonin-what-you-need-to-know"
        }
      ]
    },
    {
      "id": "fibra",
      "tipo": "suplemento",
      "nombre": "Fibra en polvo (psilio)",
      "temas": [
        "digestion"
      ],
      "para": "Es fibra, como la del nopal, el frijol y la avena, pero en polvo.",
      "como": "Solo si con la comida no basta: 1 cucharadita en un vaso grande de agua, 1 a 3 veces al día. Toma más agua durante el día.",
      "ayuda": 2,
      "evidencia": "Sirve si se toma con suficiente agua; sin agua puede atorarse.",
      "aviso": "No la tomes si tienes problemas de los riñones o si te dijeron que tomes poca agua. Tómala siempre con mucha agua.",
      "excluir": {
        "embarazo": true,
        "lactancia": false,
        "edad_minima": 18,
        "medicinas": [],
        "condiciones": [
          "rinon_poca_agua"
        ]
      },
      "leyenda_embarazo": false,
      "donde": "farmacia",
      "costo": 2,
      "alternativas": [
        "agua",
        "papaya",
        "avena",
        "nopal",
        "frijol"
      ],
      "si_no_hay": "Agua, papaya, avena, nopal y frijol dan fibra y cuestan menos.",
      "fuentes": [
        {
          "nombre": "MedlinePlus, Psilio",
          "url": "https://medlineplus.gov/spanish/druginfo/meds/a601104-es.html"
        }
      ],
      "avisos_medicina": {
        "anticoagulante": "Si tomas aspirina, tómala 3 horas después de la fibra.",
        "corazon": "Si tomas digoxina para el corazón, tómala 3 horas después de la fibra.",
        "azucar": "Si tomas pastilla o insulina para el azúcar, pregunta antes en tu centro de salud."
      }
    },
    {
      "id": "tortilla",
      "tipo": "alimento",
      "nombre": "Tortilla de maíz nixtamalizado",
      "temas": [
        "huesos_articulaciones",
        "energia"
      ],
      "para": "Al cocer el maíz con cal (nixtamal), la tortilla gana calcio. Es el alimento con calcio más fácil de conseguir en la región.",
      "como": "En cada comida, como siempre. Mejor tortilla de nixtamal que de harina de trigo.",
      "ayuda": 2,
      "evidencia": "Datos de la Secretaría de Agricultura (SADER) y del USDA.",
      "aviso": "",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 1,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "tienda",
      "costo": 1,
      "alternativas": [
        "quelites",
        "ajonjoli",
        "sardina",
        "leche",
        "yogur"
      ],
      "si_no_hay": "Si no hay tortilla de nixtamal, el frijol, los quelites y la sardina con espina también tienen calcio.",
      "fuentes": [
        {
          "nombre": "SADER, Del maíz a la tortilla: nixtamalización",
          "url": "https://www.gob.mx/agricultura/articulos/del-maiz-a-la-tortilla-y-el-proceso-de-nixtamalizacion"
        },
        {
          "nombre": "USDA FoodData Central 175036, tortilla de maíz",
          "url": "https://fdc.nal.usda.gov/food-details/175036/nutrients"
        }
      ]
    },
    {
      "id": "frijol",
      "tipo": "alimento",
      "nombre": "Frijol",
      "temas": [
        "energia",
        "digestion",
        "corazon",
        "embarazo",
        "ninos",
        "mayores",
        "azucar_peso"
      ],
      "para": "Tiene hierro, fibra, proteína y ácido fólico. Con limón o naranja, el hierro del frijol se aprovecha mejor.",
      "como": "Una taza de frijol de la olla al día. Para niños pequeños, molido.",
      "ayuda": 2,
      "evidencia": "Composición del USDA; hierro y vitamina C según NIH ODS.",
      "aviso": "Si te da muchos gases, cuécelo bien y empieza con poquito.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0.5,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "tienda",
      "costo": 1,
      "alternativas": [
        "lentejas",
        "amaranto",
        "avena",
        "huevo"
      ],
      "si_no_hay": "Si no hay frijol, lentejas, habas o garbanzo dan algo parecido.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 173735, frijol negro cocido",
          "url": "https://fdc.nal.usda.gov/food-details/173735/nutrients"
        },
        {
          "nombre": "NIH ODS, Hierro (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/Iron-Consumer/"
        },
        {
          "nombre": "NIH ODS, Folato (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/Folate-Consumer/"
        }
      ],
      "prioriza_si": [
        "embarazo"
      ]
    },
    {
      "id": "nopal",
      "tipo": "alimento",
      "nombre": "Nopal",
      "temas": [
        "digestion",
        "corazon",
        "azucar_peso"
      ],
      "para": "Tiene fibra y es parte de la comida de siempre.",
      "como": "Asado, en ensalada o guisado, varias veces por semana.",
      "ayuda": 1,
      "evidencia": "Composición del USDA. Que ayude más allá de la fibra no está comprobado.",
      "aviso": "",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 1,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "frijol",
        "avena",
        "papaya"
      ],
      "si_no_hay": "Si no hay nopal, el frijol, la avena y la papaya también dan fibra.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 168571, nopal crudo",
          "url": "https://fdc.nal.usda.gov/food-details/168571/nutrients"
        },
        {
          "nombre": "UAQ, tesis sobre nopal y antidiabéticos (solo para el aviso)",
          "url": "https://ri-ng.uaq.mx/bitstream/123456789/7114/1/RI001330.pdf"
        }
      ],
      "avisos_medicina": {
        "azucar": "Puede bajar más el azúcar junto con tu pastilla. Si te sientes débil, sudas frío o tiemblas, come algo y avisa en tu centro de salud. No tomes licuados de nopal sin preguntar en tu centro de salud."
      }
    },
    {
      "id": "chia",
      "tipo": "alimento",
      "nombre": "Chía",
      "temas": [
        "digestion",
        "corazon"
      ],
      "para": "Tiene fibra, calcio y grasas buenas (omega-3 de planta).",
      "como": "1 cucharada al día, remojada antes en un vaso de agua por 15 minutos.",
      "ayuda": 1,
      "evidencia": "Composición del USDA.",
      "aviso": "Nunca la comas seca y sola: con poca agua se hincha y puede atorarse. Toma agua.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 4,
        "medicinas": [
          "anticoagulante"
        ],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 2,
      "alternativas": [
        "avena",
        "nopal",
        "frijol"
      ],
      "si_no_hay": "Si no hay chía, la avena, el nopal y el frijol también dan fibra.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 170554, chía seca",
          "url": "https://fdc.nal.usda.gov/food-details/170554/nutrients"
        },
        {
          "nombre": "NIH ODS, Omega-3 (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-Consumer/"
        }
      ]
    },
    {
      "id": "sardina",
      "tipo": "alimento",
      "nombre": "Sardina de lata con espina",
      "temas": [
        "huesos_articulaciones",
        "corazon",
        "energia",
        "mayores"
      ],
      "para": "Tiene calcio, vitamina D, vitamina B12, proteína y grasas buenas (omega-3).",
      "como": "Una lata 2 veces por semana. Cómete también las espinitas: son suaves y tienen el calcio.",
      "ayuda": 2,
      "evidencia": "Composición del USDA.",
      "aviso": "Trae sal: escúrrela y no le pongas más sal.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 1,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "tienda",
      "costo": 2,
      "alternativas": [
        "huevo",
        "frijol",
        "tortilla"
      ],
      "si_no_hay": "Si no hay sardina, el huevo y la tortilla de nixtamal dan parte de lo mismo.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 175139, sardina en aceite con espina",
          "url": "https://fdc.nal.usda.gov/food-details/175139/nutrients"
        },
        {
          "nombre": "NIH ODS, Calcio (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/Calcium-Consumer/"
        },
        {
          "nombre": "NIH ODS, Omega-3 (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-Consumer/"
        }
      ]
    },
    {
      "id": "guayaba",
      "tipo": "alimento",
      "nombre": "Guayaba",
      "temas": [
        "defensas"
      ],
      "para": "Tiene mucha vitamina C, más que la naranja, y fibra.",
      "como": "Una guayaba al día.",
      "ayuda": 2,
      "evidencia": "Composición del USDA.",
      "aviso": "",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 1,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "naranja_limon",
        "papaya",
        "mango",
        "jitomate"
      ],
      "si_no_hay": "Si no hay guayaba, una naranja o una rebanada de papaya dan vitamina C.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 173044, guayaba cruda",
          "url": "https://fdc.nal.usda.gov/food-details/173044/nutrients"
        },
        {
          "nombre": "NIH ODS, Vitamina C (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/VitaminC-Consumer/"
        }
      ]
    },
    {
      "id": "naranja_limon",
      "tipo": "alimento",
      "nombre": "Naranja y limón",
      "temas": [
        "defensas",
        "energia"
      ],
      "para": "Tienen vitamina C. Con frijol o lentejas, ayudan a aprovechar mejor su hierro.",
      "como": "Una naranja al día, o limón en tu comida y en agua fresca con poca azúcar.",
      "ayuda": 2,
      "evidencia": "Composición del USDA; hierro y vitamina C según NIH ODS.",
      "aviso": "Si te dan agruras, cómelos con comida.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 1,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "guayaba",
        "papaya",
        "jitomate",
        "mango"
      ],
      "si_no_hay": "Si no hay naranja ni limón, la guayaba y la papaya dan vitamina C.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 169097, naranja",
          "url": "https://fdc.nal.usda.gov/food-details/169097/nutrients"
        },
        {
          "nombre": "USDA FoodData Central 167746, limón",
          "url": "https://fdc.nal.usda.gov/food-details/167746/nutrients"
        },
        {
          "nombre": "NIH ODS, Vitamina C (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/VitaminC-Consumer/"
        },
        {
          "nombre": "NIH ODS, Hierro (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/Iron-Consumer/"
        }
      ]
    },
    {
      "id": "papaya",
      "tipo": "alimento",
      "nombre": "Papaya",
      "temas": [
        "digestion",
        "defensas",
        "vista",
        "ninos"
      ],
      "para": "Tiene fibra, vitamina C y vitamina A.",
      "como": "Una rebanada o una taza al día, bien madura.",
      "ayuda": 1,
      "evidencia": "Composición del USDA.",
      "aviso": "",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0.5,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "guayaba",
        "mango",
        "avena"
      ],
      "si_no_hay": "Si no hay papaya, el plátano, la guayaba o la avena son buenas opciones.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 169926, papaya cruda",
          "url": "https://fdc.nal.usda.gov/food-details/169926/nutrients"
        }
      ],
      "avisos_perfil": {
        "embarazo": "En el embarazo, come solo papaya bien madura, no verde."
      }
    },
    {
      "id": "platano",
      "tipo": "alimento",
      "nombre": "Plátano",
      "temas": [
        "energia",
        "digestion",
        "diarrea",
        "ninos"
      ],
      "para": "Es suave para el estómago, fácil de comer y tiene potasio.",
      "como": "Uno al día, en el desayuno o como colación.",
      "ayuda": 1,
      "evidencia": "Composición del USDA.",
      "aviso": "Si te dijeron que cuides el potasio por los riñones, pregunta cuánto puedes comer.",
      "aviso_no_ninos": [
        "Si te dijeron que cuides el potasio por los riñones, pregunta cuánto puedes comer."
      ],
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0.5,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "caldo",
        "arroz_cocido",
        "avena"
      ],
      "si_no_hay": "Si no hay plátano, la papaya o la avena son suaves para el estómago.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 173944, plátano crudo",
          "url": "https://fdc.nal.usda.gov/food-details/173944/nutrients"
        }
      ]
    },
    {
      "id": "quelites",
      "tipo": "alimento",
      "nombre": "Quelites y hoja de amaranto (quintonil)",
      "temas": [
        "huesos_articulaciones",
        "vista",
        "energia",
        "embarazo",
        "ninos",
        "azucar_peso"
      ],
      "para": "Las hojas verdes como el quintonil tienen calcio, hierro, ácido fólico y vitamina A.",
      "como": "Guisados o en caldo, varias veces por semana. Lávalos bien.",
      "ayuda": 2,
      "evidencia": "Composición del USDA (hoja de amaranto).",
      "aviso": "",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 1,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "verdolagas",
        "frijol",
        "tortilla",
        "zanahoria",
        "calabaza"
      ],
      "si_no_hay": "Si no hay quelites, verdolagas, chepil o cualquier hoja verde de la región sirven.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 168385, hoja de amaranto cruda",
          "url": "https://fdc.nal.usda.gov/food-details/168385/nutrients"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ],
      "avisos_medicina": {
        "anticoagulante": "Con medicina para la sangre aguada, come estas verduras en cantidades parecidas cada semana, sin cambiar de golpe."
      }
    },
    {
      "id": "amaranto",
      "tipo": "alimento",
      "nombre": "Amaranto (alegría)",
      "temas": [
        "energia",
        "huesos_articulaciones"
      ],
      "para": "El grano de amaranto tiene hierro, calcio, magnesio y proteína.",
      "como": "2 cucharadas de amaranto tostado en tu atole, avena o fruta. La alegría también sirve, de vez en cuando.",
      "ayuda": 1,
      "evidencia": "Composición del USDA.",
      "aviso": "La alegría trae azúcar o miel: si tienes el azúcar alta, mejor el amaranto tostado sin dulce. No le des alegría con miel a bebés menores de 1 año.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 1,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "frijol",
        "avena",
        "huevo"
      ],
      "si_no_hay": "Si no hay amaranto, el frijol y la avena dan hierro.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 170682, grano de amaranto",
          "url": "https://fdc.nal.usda.gov/food-details/170682/nutrients"
        }
      ]
    },
    {
      "id": "avena",
      "tipo": "alimento",
      "nombre": "Avena",
      "temas": [
        "digestion",
        "corazon",
        "energia",
        "ninos",
        "azucar_peso"
      ],
      "para": "Tiene fibra, hierro y magnesio.",
      "como": "Media taza de avena cocida en el desayuno, con fruta. Mejor sin mucha azúcar.",
      "ayuda": 1,
      "evidencia": "Composición del USDA.",
      "aviso": "",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0.5,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "tienda",
      "costo": 1,
      "alternativas": [
        "frijol",
        "tortilla",
        "nopal"
      ],
      "si_no_hay": "Si no hay avena, el frijol y la tortilla de nixtamal también llenan y dan fibra.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 173904, avena",
          "url": "https://fdc.nal.usda.gov/food-details/173904/nutrients"
        }
      ]
    },
    {
      "id": "pepitas",
      "tipo": "alimento",
      "nombre": "Pepitas de calabaza",
      "temas": [
        "defensas",
        "corazon"
      ],
      "para": "Tienen zinc, magnesio, hierro y grasas buenas.",
      "como": "Un puñito (2 cucharadas) al día, sin sal o con poca.",
      "ayuda": 1,
      "evidencia": "Composición del USDA.",
      "aviso": "A niños pequeños dáselas molidas: enteras pueden atorarse.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 1,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "frijol",
        "huevo",
        "cacahuate",
        "lentejas"
      ],
      "si_no_hay": "Si no hay pepitas, el frijol y el huevo dan zinc.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 170556, pepita de calabaza",
          "url": "https://fdc.nal.usda.gov/food-details/170556/nutrients"
        },
        {
          "nombre": "NIH ODS, Zinc (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/Zinc-Consumer/"
        }
      ]
    },
    {
      "id": "huevo",
      "tipo": "alimento",
      "nombre": "Huevo",
      "temas": [
        "energia",
        "vista",
        "embarazo",
        "ninos",
        "mayores"
      ],
      "para": "Tiene proteína, vitamina B12, vitamina A y un poco de vitamina D.",
      "como": "Uno al día, bien cocido.",
      "ayuda": 2,
      "evidencia": "Composición del USDA.",
      "aviso": "Cuécelo bien, sobre todo para niños, embarazadas y personas mayores.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0.5,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "tienda",
      "costo": 1,
      "alternativas": [
        "frijol",
        "lentejas",
        "amaranto",
        "sardina"
      ],
      "si_no_hay": "Si no hay huevo, el frijol y la sardina dan proteína.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 171287, huevo entero",
          "url": "https://fdc.nal.usda.gov/food-details/171287/nutrients"
        },
        {
          "nombre": "NIH ODS, Vitamina B12 (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/VitaminB12-Consumer/"
        }
      ]
    },
    {
      "id": "agua",
      "tipo": "alimento",
      "nombre": "Agua simple",
      "temas": [
        "digestion",
        "orina",
        "piel",
        "energia",
        "diarrea",
        "boca",
        "azucar_peso"
      ],
      "para": "El cuerpo necesita agua todo el día. Ayuda a ir bien al baño y a orinar seguido.",
      "como": "Toma agua hervida o purificada durante el día, aunque no tengas sed. Más si hace calor o sudas.",
      "ayuda": 2,
      "evidencia": "Recomendación general de hidratación; con diarrea, primero el suero oral.",
      "aviso": "Si te dijeron que tomes poca agua por el corazón o los riñones, sigue lo que te indicaron.",
      "aviso_no_ninos": [
        "Si te dijeron que tomes poca agua por el corazón o los riñones, sigue lo que te indicaron."
      ],
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0.5,
        "medicinas": [],
        "condiciones": [
          "rinon_poca_agua"
        ]
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no tienes agua limpia, hiérvela 5 minutos desde que suelta el hervor y déjala enfriar tapada.",
      "fuentes": [
        {
          "nombre": "MedlinePlus, Gas",
          "url": "https://medlineplus.gov/spanish/gas.html"
        },
        {
          "nombre": "OMS, Enfermedades diarreicas (nota descriptiva)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/diarrhoeal-disease"
        }
      ],
      "sin_cambio": true
    },
    {
      "id": "caldo",
      "tipo": "alimento",
      "nombre": "Caldo de pollo o de verduras",
      "temas": [
        "tos_garganta",
        "digestion",
        "diarrea"
      ],
      "para": "Es una forma fácil de tomar líquido y comida cuando te sientes mal.",
      "como": "Una taza tibia, 2 o 3 veces al día, con poca sal.",
      "ayuda": 1,
      "evidencia": "Recomendación general: seguir comiendo y tomando líquidos cuando uno se siente mal.",
      "aviso": "Si tienes problemas de los riñones o te dijeron que tomes poca agua o poca sal, pregunta en tu centro de salud cuánto caldo puedes tomar. Si tienes la presión alta, ponle poca sal.",
      "aviso_no_ninos": [
        "Si tienes problemas de los riñones o te dijeron que tomes poca agua o poca sal, pregunta en tu centro de salud cuánto caldo puedes tomar.",
        "Si tienes la presión alta, ponle poca sal."
      ],
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0.5,
        "medicinas": [],
        "condiciones": [
          "rinon_poca_agua"
        ]
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "agua",
        "descanso_liquidos"
      ],
      "si_no_hay": "Si no hay caldo, toma agua tibia a traguitos.",
      "fuentes": [
        {
          "nombre": "OMS, Enfermedades diarreicas (nota descriptiva)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/diarrhoeal-disease"
        },
        {
          "nombre": "OMS, Reducción de la ingesta de sodio",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/salt-reduction"
        }
      ]
    },
    {
      "id": "miel",
      "tipo": "alimento",
      "nombre": "Miel de abeja",
      "temas": [
        "tos_garganta"
      ],
      "para": "Una cucharadita de miel calma un poco la tos.",
      "como": "1 cucharadita, sola o en agua tibia con limón, hasta 3 veces al día.",
      "cuanto_ninos": "De 1 a 5 años: media cucharadita, hasta 3 veces al día. Menores de 1 año: nunca.",
      "ayuda": 2,
      "evidencia": "El NICE (Reino Unido) la recomienda para la tos en mayores de 1 año; la prueba es limitada.",
      "aviso": "Nunca le des miel a un bebé menor de 1 año: puede enfermarlo gravemente. Si tienes el azúcar alta, mejor no.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 1,
        "medicinas": [
          "azucar"
        ],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "descanso_liquidos",
        "caldo",
        "agua"
      ],
      "si_no_hay": "Si no hay miel, toma caldo o agua tibia a traguitos.",
      "fuentes": [
        {
          "nombre": "NICE NG120, Tos aguda: autocuidado con miel (mayores de 1 año)",
          "url": "https://www.nice.org.uk/guidance/ng120"
        }
      ]
    },
    {
      "id": "caminar",
      "tipo": "habito",
      "nombre": "Caminar o moverte",
      "temas": [
        "corazon",
        "azucar_peso",
        "huesos_articulaciones",
        "energia",
        "sueno",
        "mayores",
        "embarazo",
        "colicos"
      ],
      "para": "Moverte todos los días es de lo que más le ayuda al cuerpo y al ánimo.",
      "como": "Adultos: de 150 a 300 minutos a la semana, por ejemplo media hora, 5 días, a un paso en el que puedas platicar pero no cantar. Todo cuenta: el trabajo del campo, acarrear agua, barrer, ir a pie al mercado. No tiene que ser de una vez: los ratitos también suman. Si no te mueves casi nada, empieza con poquito y sube poco a poco. Hacer algo es mejor que no hacer nada.",
      "cuanto_ninos": "De 1 a 4 años: que juegue y se mueva 3 horas al día, repartidas. De 5 a 17 años: una hora al día, en promedio, de juego o deporte que lo agite.",
      "ayuda": 3,
      "evidencia": "La OMS lo recomienda con pruebas fuertes (directrices 2020).",
      "aviso": "Si te duele el pecho, te falta mucho el aire o te mareas al caminar, para y ve al centro de salud. Con mucho calor, camina temprano o ya tarde, a la sombra, y lleva agua.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 1,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "menos_sentado",
        "moverse_sentado",
        "fuerza_casa",
        "equilibrio_mayores",
        "mover_embarazo",
        "jugar_5a17",
        "jugar_1a4",
        "pantallas_ninos"
      ],
      "si_no_hay": "Si no puedes salir, camina dentro de tu casa o en el patio.",
      "fuentes": [
        {
          "nombre": "OMS, Actividad física (nota descriptiva en español)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/physical-activity"
        },
        {
          "nombre": "OMS 2020, Directrices de actividad física y comportamiento sedentario (Bull et al., Br J Sports Med 2020;54:1451-1462)",
          "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/"
        },
        {
          "nombre": "NHS, Physical activity guidelines for older adults",
          "url": "https://www.nhs.uk/live-well/exercise/physical-activity-guidelines-older-adults/"
        },
        {
          "nombre": "NHS, Exercise in pregnancy",
          "url": "https://www.nhs.uk/pregnancy/keeping-well/exercise/"
        },
        {
          "nombre": "NHS, Period pain (ejercicio suave, como caminar)",
          "url": "https://www.nhs.uk/symptoms/period-pain/"
        },
        {
          "nombre": "NIA (NIH), Three types of exercise can improve your health (seguridad: no aguantar la respiración; mareo o dolor de pecho)",
          "url": "https://www.nia.nih.gov/health/exercise-and-physical-activity/three-types-exercise-can-improve-your-health"
        },
        {
          "nombre": "OMS, Calor y salud (nota descriptiva, 31-jul-2026)",
          "url": "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health"
        }
      ],
      "prioriza_si": [
        "imc_alto",
        "azucar",
        "presion"
      ],
      "ayuda_por_tema": {
        "colicos": 1
      },
      "actividad": true
    },
    {
      "id": "dormir_misma_hora",
      "tipo": "habito",
      "nombre": "Dormir a la misma hora",
      "temas": [
        "sueno",
        "energia",
        "dolor_cabeza",
        "azucar_peso"
      ],
      "para": "Acostarte y levantarte a la misma hora todos los días ayuda a dormir mejor.",
      "como": "Escoge una hora para dormir y otra para levantarte, también en fin de semana. Apaga la tele y el celular una hora antes. Cuarto oscuro y sin ruido.",
      "ayuda": 2,
      "evidencia": "Recomendación de la Biblioteca Nacional de Medicina de EE. UU. (MedlinePlus).",
      "aviso": "Si roncas fuerte y te quedas sin respirar, o duermes mal más de un mes, ve al centro de salud.",
      "aviso_no_ninos": [
        "Si roncas fuerte y te quedas sin respirar, o duermes mal más de un mes, ve al centro de salud."
      ],
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "noche_tranquila",
        "sin_cafe_tarde",
        "sol_manana",
        "caminar"
      ],
      "si_no_hay": "Siempre se puede: no cuesta nada.",
      "fuentes": [
        {
          "nombre": "MedlinePlus, Dormir bien",
          "url": "https://medlineplus.gov/spanish/healthysleep.html"
        }
      ]
    },
    {
      "id": "sin_cafe_tarde",
      "tipo": "habito",
      "nombre": "Café y refresco de cola solo hasta las 4 de la tarde",
      "temas": [
        "sueno"
      ],
      "para": "El café y el refresco de cola tardan horas en salir del cuerpo y no dejan dormir bien.",
      "como": "No tomes café, refresco de cola ni bebidas energéticas después de las 4 de la tarde. Cena ligero.",
      "ayuda": 2,
      "evidencia": "Recomendación de MedlinePlus.",
      "aviso": "",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 12,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "dormir_misma_hora",
        "noche_tranquila"
      ],
      "si_no_hay": "Siempre se puede: no cuesta nada.",
      "fuentes": [
        {
          "nombre": "MedlinePlus, Dormir bien",
          "url": "https://medlineplus.gov/spanish/healthysleep.html"
        }
      ]
    },
    {
      "id": "sol_manana",
      "tipo": "habito",
      "nombre": "Sol de la mañana",
      "temas": [
        "huesos_articulaciones",
        "sueno",
        "mayores"
      ],
      "para": "Con el sol, la piel hace vitamina D. La luz de la mañana también ayuda a que el cuerpo sepa cuándo es de día.",
      "como": "Unos minutos de sol en cara y brazos (10 a 15), antes de las 11 de la mañana.",
      "ayuda": 2,
      "evidencia": "NIH ODS: el cuerpo hace vitamina D con el sol.",
      "aviso": "No te quemes: si tu piel se pone roja, es demasiado. A los bebés menores de 6 meses no los pongas al sol directo.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0.5,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "dormir_misma_hora",
        "huevo",
        "sardina"
      ],
      "si_no_hay": "Si casi no puedes salir, siéntate junto a una ventana abierta o en el patio.",
      "fuentes": [
        {
          "nombre": "NIH ODS, Vitamina D (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/VitaminD-Consumer/"
        },
        {
          "nombre": "MedlinePlus, Exposición solar",
          "url": "https://medlineplus.gov/spanish/sunexposure.html"
        }
      ]
    },
    {
      "id": "lavar_manos",
      "tipo": "habito",
      "nombre": "Lavarte las manos con jabón",
      "temas": [
        "defensas",
        "digestion",
        "diarrea",
        "embarazo",
        "ninos",
        "tos_garganta"
      ],
      "para": "Lavarte las manos con agua y jabón quita los microbios que enferman del estómago y de la tos.",
      "como": "Antes de comer o cocinar, y después de ir al baño o de cambiar un pañal: frota con jabón 20 segundos y enjuaga.",
      "ayuda": 3,
      "evidencia": "La OMS lo recomienda con pruebas fuertes.",
      "aviso": "",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no hay jabón, frota bien las manos con agua corriente.",
      "fuentes": [
        {
          "nombre": "OMS, Enfermedades diarreicas (nota descriptiva)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/diarrhoeal-disease"
        }
      ],
      "ayuda_por_tema": {
        "diarrea": 2
      },
      "sin_cambio": true
    },
    {
      "id": "comer_despacio",
      "tipo": "habito",
      "nombre": "Comer despacio",
      "temas": [
        "digestion"
      ],
      "para": "Comer despacio y masticar bien hace que tragues menos aire y tengas menos gases.",
      "como": "Siéntate a comer, mastica bien y no comas con prisa. Si tienes gases, evita el refresco y el chicle.",
      "ayuda": 2,
      "evidencia": "Recomendación de MedlinePlus.",
      "aviso": "Si el dolor de panza es fuerte, no se quita o hay sangre, ve al centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Siempre se puede: no cuesta nada.",
      "fuentes": [
        {
          "nombre": "MedlinePlus, Gas",
          "url": "https://medlineplus.gov/spanish/gas.html"
        }
      ],
      "sin_cambio": true
    },
    {
      "id": "menos_sal",
      "tipo": "habito",
      "nombre": "Menos sal",
      "temas": [
        "corazon"
      ],
      "para": "Comer menos sal ayuda a cuidar la presión y el corazón.",
      "como": "Cocina con poca sal, no pongas el salero en la mesa, usa ajo, limón, cebolla y hierbas para dar sabor, y evita sopas instantáneas y frituras de bolsa.",
      "ayuda": 3,
      "evidencia": "La OMS lo recomienda con pruebas fuertes: menos de una cucharadita de sal al día en adultos.",
      "aviso": "Si tienes problemas de los riñones, pregunta antes de usar sal baja en sodio o sal sustituta: trae potasio.",
      "aviso_no_ninos": [
        "Si tienes problemas de los riñones, pregunta antes de usar sal baja en sodio o sal sustituta: trae potasio."
      ],
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 1,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Siempre se puede: no cuesta nada.",
      "fuentes": [
        {
          "nombre": "OMS, Reducción de la ingesta de sodio",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/salt-reduction"
        },
        {
          "nombre": "MedlinePlus, Enalapril (sustitutos de sal con potasio)",
          "url": "https://medlineplus.gov/spanish/druginfo/meds/a686022-es.html"
        }
      ],
      "avisos_medicina": {
        "presion": "Con pastilla para la presión, pregunta antes de usar sal baja en sodio o sal sustituta: trae potasio."
      },
      "sin_cambio": true
    },
    {
      "id": "sombrero_sombra",
      "tipo": "habito",
      "nombre": "Sombrero y sombra",
      "temas": [
        "piel",
        "vista"
      ],
      "para": "Cuidarte del sol fuerte cuida tu piel y tus ojos.",
      "como": "Usa sombrero de ala ancha y busca la sombra entre las 11 de la mañana y las 4 de la tarde. Lentes de sol si puedes.",
      "ayuda": 2,
      "evidencia": "Recomendación de MedlinePlus.",
      "aviso": "",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no tienes sombrero, una gorra, un rebozo o una sombrilla también sirven.",
      "fuentes": [
        {
          "nombre": "MedlinePlus, Exposición solar",
          "url": "https://medlineplus.gov/spanish/sunexposure.html"
        }
      ],
      "sin_cambio": true
    },
    {
      "id": "agua_quemadura",
      "tipo": "habito",
      "nombre": "Agua fresca en una quemadura pequeña",
      "temas": [
        "piel"
      ],
      "para": "Lo primero en una quemadura es enfriarla con agua fresca. Así arde menos.",
      "como": "Quita la ropa y los anillos de esa parte, menos lo que esté pegado a la piel. Pon la quemadura bajo el chorro de agua fresca, no helada, o en una cubeta con agua fresca, de 15 a 20 minutos. Luego tápala sin apretar con un trapo limpio.",
      "ayuda": 2,
      "evidencia": "Primeros auxilios de la OMS, la Secretaría de Salud y el NHS (servicio de salud del Reino Unido).",
      "aviso": "No pongas hielo, pasta de dientes, aceite, mantequilla, cremas, pomadas, tomate, ajo, cúrcuma ni algodón. No revientes las ampollas. No enfríes de más a la persona, sobre todo a un bebé: si tiembla, tápala. Si la quemadura es grande u honda, está en la cara o en las partes íntimas, o fue por químico o electricidad, ve de inmediato al centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no hay agua de la llave, usa agua limpia y fresca de una cubeta.",
      "fuentes": [
        {
          "nombre": "OMS, Quemaduras (nota descriptiva, 21-oct-2026)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/burns"
        },
        {
          "nombre": "Secretaría de Salud, comunicado 287 (11-sep-2023): primeros auxilios en quemaduras",
          "url": "https://www.gob.mx/salud/prensa/287-quien-recibe-primeros-auxilios-en-caso-de-accidente-tiene-80-de-probabilidad-de-sobrevivir"
        },
        {
          "nombre": "NHS, Burns and scalds",
          "url": "https://www.nhs.uk/conditions/burns-and-scalds/"
        }
      ],
      "sin_cambio": true
    },
    {
      "id": "calendula",
      "tipo": "planta",
      "nombre": "Caléndula (en la piel)",
      "nombre_cientifico": "Calendula officinalis (flor)",
      "temas": [
        "piel"
      ],
      "para": "Se usa tradicionalmente para aliviar la piel irritada, como la quemada por el sol, y para ayudar a que cierren raspones pequeños.",
      "como": "No se toma: solo se pone en la piel. Pon 1 cucharadita de flor seca en una taza de agua recién hervida, tapa 10 minutos y deja que se entibie. Cuélala, moja un trapo limpio y ponlo sobre la piel de media hora a una hora; luego quítalo. De 2 a 4 veces al día.",
      "cuanto_ninos": "De 6 a 11 años: igual que los adultos, con un adulto que lo ponga. Menores de 6 años: no.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "No se toma. Antes de usarla, ponla en un pedacito de piel y espera hasta el otro día: si te da comezón o ronchas, no la uses. No la uses si te dan alergia la manzanilla, el cempasúchil, la margarita o el crisantemo. Si la herida es grande o profunda, o la piel se pone roja, caliente o con pus, ve al centro de salud. Si no mejora en una semana, ve al centro de salud.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 6,
        "medicinas": [],
        "condiciones": [
          "alergia_asteraceas"
        ]
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "agua_quemadura",
        "lavar_herida",
        "manzanilla_piel",
        "sabila"
      ],
      "si_no_hay": "Si no hay caléndula, enfría la piel con agua fresca de la llave y cúbrela del sol.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de flor de caléndula (Calendulae flos, rev. 1)",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-calendula-officinalis-l-flos-revision-1_en.pdf"
        },
        {
          "nombre": "EMA (HMPC), Glosario de tés de hierbas (infusión 5 a 15 min, remojo en frío 30 min)",
          "url": "https://www.ema.europa.eu/en/documents/regulatory-procedural-guideline/glossary-herbal-teas_en.pdf"
        }
      ]
    },
    {
      "id": "manzanilla_piel",
      "tipo": "planta",
      "nombre": "Manzanilla en lavados (para la piel)",
      "nombre_cientifico": "Matricaria chamomilla (Matricaria recutita), flor, uso en la piel",
      "temas": [
        "piel"
      ],
      "para": "Se usa tradicionalmente para aliviar la piel irritada, como la quemada por el sol, y raspones pequeños.",
      "como": "No se toma: solo se pone en la piel. Pon 3 bolsitas o 1 cucharada de flor seca en media taza de agua recién hervida, tapa 10 minutos y deja que se enfríe. Cuélala, moja un trapo limpio y ponlo sobre la piel, o lava con ella la parte irritada. Varias veces al día.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "No se toma. No la uses si te dan alergia la ambrosía, el cempasúchil, la margarita o el crisantemo. No la pongas en heridas abiertas o grandes: ve al centro de salud. Si no mejora en una semana, ve al centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 12,
        "medicinas": [],
        "condiciones": [
          "alergia_asteraceas"
        ]
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "agua_quemadura",
        "lavar_herida",
        "calendula",
        "sabila"
      ],
      "si_no_hay": "Si no hay manzanilla, enfría la piel con agua fresca de la llave y cúbrela con un trapo limpio.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de manzanilla (Matricariae flos), indicación 5 y sección 4.6 (preparación a)",
          "url": "https://www.ema.europa.eu/documents/herbal-monograph/final-european-union-herbal-monograph-matricaria-recutita-l-flos_en.pdf"
        },
        {
          "nombre": "EMA (HMPC), Glosario de tés de hierbas (infusión 5 a 15 min, remojo en frío 30 min)",
          "url": "https://www.ema.europa.eu/en/documents/regulatory-procedural-guideline/glossary-herbal-teas_en.pdf"
        }
      ],
      "avisos_perfil": {
        "lactancia": "Si das pecho, no la pongas en el pecho, o lávalo bien antes de darle de comer al bebé."
      }
    },
    {
      "id": "llanten_piel",
      "tipo": "planta",
      "nombre": "Llantén en compresas (para la piel)",
      "nombre_cientifico": "Plantago lanceolata (hoja), uso en la piel",
      "temas": [
        "piel"
      ],
      "para": "Se usa tradicionalmente para aliviar la piel irritada o enrojecida.",
      "como": "No se toma: solo se pone en la piel. Pon 1 cucharadita de hoja seca picada en una taza de agua hervida ya fría. Déjala remojando media hora, cuélala y úsala enseguida: moja un trapo limpio y ponlo sobre la piel. De 3 a 4 veces al día.",
      "cuanto_ninos": "De 3 a 11 años: igual que los adultos, con un adulto que lo ponga. Menores de 3 años: no.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "No se toma. No lo pongas en heridas abiertas. No lo uses si te da alergia el polen del llantén. Usa hoja de llantén que conozcas bien, de tu huerto o de alguien de confianza. Si la piel se pone roja, caliente o con pus, o no mejora en una semana, ve al centro de salud.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 3,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "huerto",
      "costo": 1,
      "alternativas": [
        "crema_piel",
        "calendula",
        "manzanilla_piel"
      ],
      "si_no_hay": "Si no hay llantén, lava la piel con agua limpia y protégela del sol.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de hoja de llantén (Plantaginis lanceolatae folium, rev. 1), indicación 3",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-plantaginis-lanceolatae-folium-revision-1_en.pdf"
        },
        {
          "nombre": "EMA (HMPC), Glosario de tés de hierbas (infusión 5 a 15 min, remojo en frío 30 min)",
          "url": "https://www.ema.europa.eu/en/documents/regulatory-procedural-guideline/glossary-herbal-teas_en.pdf"
        }
      ]
    },
    {
      "id": "llanten",
      "tipo": "planta",
      "nombre": "Llantén (té de hoja)",
      "nombre_cientifico": "Plantago lanceolata (hoja)",
      "temas": [
        "tos_garganta"
      ],
      "para": "Se usa tradicionalmente para aliviar la garganta irritada con tos seca y la tos del catarro.",
      "como": "Té: 1 cucharadita de hoja seca picada en una taza de agua recién hervida, tapada 10 minutos. 2 o 3 tazas al día.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "Usa hoja de llantén que conozcas bien, de tu huerto o de alguien de confianza. No lo tomes si te da alergia el polen del llantén. Si te falta el aire, hay fiebre o flema de color, ve al centro de salud. Si la tos dura más de una semana, ve al centro de salud.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 12,
        "medicinas": [
          "anticoagulante"
        ],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "huerto",
      "costo": 1,
      "alternativas": [
        "gargaras_sal",
        "caldo",
        "miel",
        "malva",
        "altea"
      ],
      "si_no_hay": "Si no hay llantén, toma líquidos tibios como caldo, y una cucharadita de miel si tienes más de 1 año.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de hoja de llantén (Plantaginis lanceolatae folium, rev. 1), indicaciones 1 y 2",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-plantaginis-lanceolatae-folium-revision-1_en.pdf"
        },
        {
          "nombre": "EMA (HMPC), Glosario de tés de hierbas (infusión 5 a 15 min, remojo en frío 30 min)",
          "url": "https://www.ema.europa.eu/en/documents/regulatory-procedural-guideline/glossary-herbal-teas_en.pdf"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "malva",
      "tipo": "planta",
      "nombre": "Malva (flor u hoja)",
      "nombre_cientifico": "Malva sylvestris (flor u hoja; la hoja también de Malva neglecta)",
      "temas": [
        "tos_garganta",
        "digestion"
      ],
      "para": "Se usa tradicionalmente para aliviar la garganta irritada con tos seca y molestias leves del estómago.",
      "como": "Té: 1 cucharadita de flor u hoja seca en una taza de agua recién hervida, tapada 10 minutos. 2 o 3 tazas al día.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "Si te falta el aire, hay fiebre o flema de color, ve al centro de salud. Si la tos dura más de una semana, o la molestia del estómago más de 2 semanas, ve al centro de salud.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 12,
        "medicinas": [
          "anticoagulante"
        ],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "huerto",
      "costo": 1,
      "alternativas": [
        "gargaras_sal",
        "caldo",
        "miel",
        "llanten",
        "altea"
      ],
      "si_no_hay": "Si no hay malva, toma líquidos tibios como caldo o agua durante el día.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de flor de malva (Malvae sylvestris flos)",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-malva-sylvestris-l-flos-first-version_en.pdf"
        },
        {
          "nombre": "EMA, monografía de hoja de malva (Malvae folium)",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-malva-sylvestris-l-andor-malva-neglecta-wallr-folium-first-version_en.pdf"
        },
        {
          "nombre": "EMA (HMPC), Glosario de tés de hierbas (infusión 5 a 15 min, remojo en frío 30 min)",
          "url": "https://www.ema.europa.eu/en/documents/regulatory-procedural-guideline/glossary-herbal-teas_en.pdf"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "altea",
      "tipo": "planta",
      "nombre": "Raíz de altea",
      "nombre_cientifico": "Althaea officinalis (raíz)",
      "temas": [
        "tos_garganta"
      ],
      "para": "Se usa tradicionalmente para aliviar la garganta irritada con tos seca.",
      "como": "Remojo en frío: pon 1 cucharadita de raíz seca picada en una taza de agua hervida ya fría. Déjala media hora, cuélala y tómala enseguida. 3 veces al día.",
      "cuanto_ninos": "De 3 a 11 años: media cucharadita de raíz picada en una taza de agua hervida ya fría, igual que arriba, 3 veces al día. Menores de 3 años: no.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "También le dicen malvavisco, pero no es el dulce. Si tomas alguna medicina, tómala 1 hora antes o 1 hora después de la altea, porque puede hacer que tu medicina tarde en hacer efecto. Si te falta el aire, hay fiebre o flema de color, ve al centro de salud. Si la tos dura más de una semana, ve al centro de salud.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 3,
        "medicinas": [
          "anticoagulante"
        ],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "tienda",
      "costo": 2,
      "alternativas": [
        "descanso_liquidos",
        "caldo",
        "miel",
        "gargaras_sal",
        "malva",
        "llanten"
      ],
      "si_no_hay": "Si no hay altea, toma líquidos tibios como caldo, y una cucharadita de miel si tienes más de 1 año.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de raíz de altea (Althaeae radix)",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-althaea-officinalis-l-radix_en.pdf"
        },
        {
          "nombre": "EMA (HMPC), Glosario de tés de hierbas (infusión 5 a 15 min, remojo en frío 30 min)",
          "url": "https://www.ema.europa.eu/en/documents/regulatory-procedural-guideline/glossary-herbal-teas_en.pdf"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "sauco_flor",
      "tipo": "planta",
      "nombre": "Saúco (solo la flor)",
      "nombre_cientifico": "Sambucus nigra (flor)",
      "temas": [
        "tos_garganta",
        "defensas"
      ],
      "para": "Se usa tradicionalmente para aliviar las primeras molestias del catarro.",
      "como": "Té: 1 cucharada de flor seca en una taza de agua recién hervida, tapada 10 minutos. 3 tazas al día.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "Usa solo la flor seca. No tomes hojas, corteza, tallos ni bolitas verdes o crudas del saúco: dan vómito y diarrea fuerte. Si te falta el aire, hay fiebre alta o flema de color, ve al centro de salud. Si dura más de una semana, ve al centro de salud.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 12,
        "medicinas": [
          "anticoagulante"
        ],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "descanso_liquidos",
        "caldo",
        "miel"
      ],
      "si_no_hay": "Si no hay flor de saúco, descansa, toma caldo y agua tibia, y lávate las manos seguido.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de flor de saúco (Sambuci flos, rev. 1)",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-sambucus-nigra-l-flos-revision-1_en.pdf"
        },
        {
          "nombre": "NCCIH (NIH), European Elder (partes crudas de la planta: solo para el aviso)",
          "url": "https://www.nccih.nih.gov/health/european-elder"
        },
        {
          "nombre": "EMA (HMPC), Glosario de tés de hierbas (infusión 5 a 15 min, remojo en frío 30 min)",
          "url": "https://www.ema.europa.eu/en/documents/regulatory-procedural-guideline/glossary-herbal-teas_en.pdf"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "lavanda",
      "tipo": "planta",
      "nombre": "Lavanda o alhucema (flor)",
      "nombre_cientifico": "Lavandula angustifolia (flor)",
      "temas": [
        "sueno"
      ],
      "para": "Se usa tradicionalmente para aliviar los nervios leves y el cansancio, y para ayudar a dormir.",
      "como": "Té: 1 cucharadita de flor seca en una taza de agua recién hervida, tapada 10 minutos. Hasta 3 tazas al día; la última, antes de dormir.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "Puede dar sueño: no manejes ni uses máquinas después de tomarla. Nunca tomes aceite de lavanda. Si sigues sin dormir bien o te sientes peor, ve al centro de salud.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 12,
        "medicinas": [
          "anticoagulante",
          "nervios_sueno"
        ],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "dormir_misma_hora",
        "sin_cafe_tarde",
        "toronjil",
        "pasiflora"
      ],
      "si_no_hay": "Si no hay lavanda, acuéstate a la misma hora cada noche y no tomes café en la tarde.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de flor de lavanda (Lavandulae flos)",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-community-herbal-monograph-lavandula-angustifolia-p-mill-flos_en.pdf"
        },
        {
          "nombre": "NCCIH (NIH), Lavender",
          "url": "https://www.nccih.nih.gov/health/lavender"
        },
        {
          "nombre": "EMA (HMPC), Glosario de tés de hierbas (infusión 5 a 15 min, remojo en frío 30 min)",
          "url": "https://www.ema.europa.eu/en/documents/regulatory-procedural-guideline/glossary-herbal-teas_en.pdf"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "linaza",
      "tipo": "planta",
      "nombre": "Linaza (semilla)",
      "nombre_cientifico": "Linum usitatissimum (semilla)",
      "temas": [
        "digestion"
      ],
      "para": "Se usa tradicionalmente para aliviar el estreñimiento leve y ayudar a ir al baño, y para molestias leves del estómago.",
      "como": "Para ir al baño: 1 cucharada de linaza entera en un vaso de agua (150 mililitros), 2 o 3 veces al día durante el día. Toma mucha agua todo el día. Hace efecto en 12 a 24 horas. No la tomes justo antes de dormir.",
      "ayuda": 2,
      "evidencia": "La agencia europea de medicinas (EMA) reconoce que la linaza con agua ayuda a ir al baño cuando cuesta trabajo. Para el estómago es solo uso tradicional.",
      "aviso": "No la tomes si tienes problemas de los riñones o si te dijeron que tomes poca agua. Tómala siempre con mucha agua: sin agua se puede atorar en la garganta o en la panza. No la tomes si te cuesta tragar. Las personas mayores o débiles deben tomarla con alguien que las cuide. Si tomas alguna medicina, tómala 1 hora antes o 1 hora después de la linaza. Usa semilla seca y madura; no la comas verde. Si en 3 días no vas al baño, o tienes dolor de panza, vómito o sangre, ve al centro de salud.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 12,
        "medicinas": [
          "anticoagulante"
        ],
        "condiciones": [
          "rinon_poca_agua"
        ]
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "agua",
        "papaya",
        "avena",
        "nopal"
      ],
      "si_no_hay": "Si no hay linaza, come papaya, avena, nopal o frijol, y toma más agua.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de semilla de linaza (Lini semen)",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-community-herbal-monograph-linum-usitatissimum-l-semen_en.pdf"
        },
        {
          "nombre": "NCCIH (NIH), Flaxseed and Flaxseed Oil",
          "url": "https://www.nccih.nih.gov/health/flaxseed-and-flaxseed-oil"
        },
        {
          "nombre": "USDA FoodData Central 169414, linaza (1 cucharada entera = 10.3 g)",
          "url": "https://fdc.nal.usda.gov/food-details/169414/measures"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "curcuma",
      "tipo": "planta",
      "nombre": "Cúrcuma (polvo de cocina)",
      "nombre_cientifico": "Curcuma longa (raíz molida)",
      "temas": [
        "digestion"
      ],
      "para": "Se usa tradicionalmente para aliviar la digestión lenta, la sensación de llenura y los gases.",
      "como": "Té: un cuarto de cucharadita de cúrcuma molida en una taza de agua recién hervida, 2 o 3 veces al día.",
      "ayuda": 1,
      "evidencia": "Uso tradicional reconocido por la agencia europea de medicinas (EMA). No está comprobado científicamente.",
      "aviso": "Solo para adultos. Usa solo la cúrcuma molida de cocina: no tomes cápsulas ni pastillas de cúrcuma o curcumina, porque algunas han dañado el hígado. No la tomes si tienes piedras en la vesícula o problemas del hígado. Puede dar agruras. Si te pones amarillo o la orina sale muy oscura, déjala y ve al centro de salud. Si la molestia sigue después de 2 semanas, ve al centro de salud.",
      "excluir": {
        "embarazo": true,
        "lactancia": true,
        "edad_minima": 18,
        "medicinas": [
          "anticoagulante"
        ],
        "condiciones": [
          "vesicula",
          "higado",
          "acidez"
        ]
      },
      "leyenda_embarazo": false,
      "donde": "tienda",
      "costo": 1,
      "alternativas": [
        "comer_despacio",
        "manzanilla",
        "menta"
      ],
      "si_no_hay": "Si no hay cúrcuma, comer despacio y tomar agua también ayudan con la llenura.",
      "fuentes": [
        {
          "nombre": "EMA, monografía de cúrcuma (Curcumae longae rhizoma, rev. 1)",
          "url": "https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-curcuma-longa-l-rhizoma-revision-1_en.pdf"
        },
        {
          "nombre": "NCCIH (NIH), Turmeric",
          "url": "https://www.nccih.nih.gov/health/turmeric"
        },
        {
          "nombre": "USDA FoodData Central 172231, cúrcuma molida (1 cucharadita = 3 g)",
          "url": "https://fdc.nal.usda.gov/food-details/172231/measures"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ]
    },
    {
      "id": "calabaza",
      "tipo": "alimento",
      "nombre": "Calabaza de pulpa naranja (de Castilla)",
      "temas": [
        "vista",
        "defensas",
        "ninos"
      ],
      "para": "Tiene vitamina A, que el cuerpo usa para ver bien y para sus defensas.",
      "como": "Una taza de calabaza cocida, en caldo, guisada o al vapor, varias veces por semana. Mejor sin azúcar: el dulce de calabaza trae mucho piloncillo.",
      "ayuda": 2,
      "evidencia": "Composición del USDA (calabaza cocida). Para qué usa el cuerpo la vitamina A: NIH (ODS).",
      "aviso": "La que tiene vitamina A es la calabaza de pulpa naranja. La calabacita verde casi no tiene.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0.5,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "zanahoria",
        "camote",
        "quelites",
        "papaya"
      ],
      "si_no_hay": "Si no hay calabaza, la zanahoria, el camote o los quelites también tienen vitamina A.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 168449, calabaza cocida sin sal",
          "url": "https://fdc.nal.usda.gov/food-details/168449/nutrients"
        },
        {
          "nombre": "USDA FoodData Central 170487, calabacita cruda (para comparar)",
          "url": "https://fdc.nal.usda.gov/food-details/170487/nutrients"
        },
        {
          "nombre": "NIH ODS, Vitamina A (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/VitaminA-Consumer/"
        },
        {
          "nombre": "NHS, Primeras comidas del bebé (evitar zanahoria cruda y alimentos duros)",
          "url": "https://www.nhs.uk/baby/weaning-and-feeding/babys-first-solid-foods/"
        }
      ]
    },
    {
      "id": "camote",
      "tipo": "alimento",
      "nombre": "Camote de pulpa naranja",
      "temas": [
        "vista",
        "defensas",
        "ninos"
      ],
      "para": "Tiene vitamina A, que el cuerpo usa para ver bien y para sus defensas. También tiene fibra y vitamina C.",
      "como": "Medio camote mediano cocido o al horno, varias veces por semana. Mejor sin azúcar ni piloncillo.",
      "ayuda": 2,
      "evidencia": "Composición del USDA (camote al horno). Para qué usa el cuerpo la vitamina A: NIH (ODS).",
      "aviso": "La información es del camote de pulpa naranja.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0.5,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "calabaza",
        "zanahoria",
        "papaya"
      ],
      "si_no_hay": "Si no hay camote, la calabaza naranja o la zanahoria tienen vitamina A.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 168483, camote al horno sin sal",
          "url": "https://fdc.nal.usda.gov/food-details/168483/nutrients"
        },
        {
          "nombre": "NIH ODS, Vitamina A (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/VitaminA-Consumer/"
        },
        {
          "nombre": "NHS, Primeras comidas del bebé (evitar zanahoria cruda y alimentos duros)",
          "url": "https://www.nhs.uk/baby/weaning-and-feeding/babys-first-solid-foods/"
        }
      ],
      "avisos_medicina": {
        "azucar": "Es dulce: come una porción chica, sin azúcar ni piloncillo, y no en jugo."
      }
    },
    {
      "id": "zanahoria",
      "tipo": "alimento",
      "nombre": "Zanahoria",
      "temas": [
        "vista",
        "defensas",
        "ninos"
      ],
      "para": "Tiene vitamina A, que el cuerpo usa para ver bien y para sus defensas.",
      "como": "Una zanahoria mediana al día: rallada en ensalada, en caldo o guisada.",
      "ayuda": 2,
      "evidencia": "Composición del USDA (zanahoria cruda). Para qué usa el cuerpo la vitamina A: NIH (ODS).",
      "aviso": "A bebés y niños chicos dásela cocida y suave o machacada: cruda y dura puede atorarse.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0.5,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "calabaza",
        "camote",
        "quelites"
      ],
      "si_no_hay": "Si no hay zanahoria, la calabaza naranja, el camote o los quelites tienen vitamina A.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 170393, zanahoria cruda",
          "url": "https://fdc.nal.usda.gov/food-details/170393/nutrients"
        },
        {
          "nombre": "NIH ODS, Vitamina A (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/VitaminA-Consumer/"
        },
        {
          "nombre": "NHS, Primeras comidas del bebé (evitar zanahoria cruda y alimentos duros)",
          "url": "https://www.nhs.uk/baby/weaning-and-feeding/babys-first-solid-foods/"
        }
      ]
    },
    {
      "id": "verdolagas",
      "tipo": "alimento",
      "nombre": "Verdolagas",
      "temas": [
        "defensas",
        "vista",
        "azucar_peso"
      ],
      "para": "Tienen vitamina C, vitamina A, magnesio y potasio. El cuerpo usa la vitamina C y la A para sus defensas.",
      "como": "Guisadas, en caldo o con frijol, varias veces por semana. Lávalas bien.",
      "ayuda": 1,
      "evidencia": "Composición del USDA (verdolaga cruda). Para qué usa el cuerpo estas vitaminas: NIH (ODS).",
      "aviso": "",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 1,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "quelites",
        "jitomate",
        "nopal"
      ],
      "si_no_hay": "Si no hay verdolagas, los quelites, el quintonil o el chepil se guisan igual.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 169274, verdolaga cruda",
          "url": "https://fdc.nal.usda.gov/food-details/169274/nutrients"
        },
        {
          "nombre": "NIH ODS, Vitamina C (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/VitaminC-Consumer/"
        },
        {
          "nombre": "NIH ODS, Vitamina A (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/VitaminA-Consumer/"
        },
        {
          "nombre": "MedlinePlus, Tomar warfarina (tés de hierbas y verduras de hoja)",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000292.htm"
        }
      ],
      "avisos_medicina": {
        "anticoagulante": "Con medicina para la sangre aguada, come estas verduras en cantidades parecidas cada semana, sin cambiar de golpe."
      }
    },
    {
      "id": "mango",
      "tipo": "alimento",
      "nombre": "Mango",
      "temas": [
        "defensas",
        "piel",
        "vista"
      ],
      "para": "Tiene vitamina C, que el cuerpo usa para sus defensas, para hacer la piel y para que cierren las heridas. También tiene algo de vitamina A.",
      "como": "Un mango chico o una taza en trozos, en temporada. Lávalo antes de pelarlo.",
      "ayuda": 1,
      "evidencia": "Composición del USDA. Para qué usa el cuerpo la vitamina C: NIH (ODS).",
      "aviso": "",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0.5,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "papaya",
        "guayaba",
        "calabaza",
        "jicama"
      ],
      "si_no_hay": "Si no es temporada de mango, la guayaba, la papaya o la naranja tienen vitamina C.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 169910, mango crudo",
          "url": "https://fdc.nal.usda.gov/food-details/169910/nutrients"
        },
        {
          "nombre": "NIH ODS, Vitamina C (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/VitaminC-Consumer/"
        },
        {
          "nombre": "NIH ODS, Vitamina A (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/VitaminA-Consumer/"
        }
      ],
      "avisos_medicina": {
        "azucar": "Es dulce: come una porción chica, sin azúcar ni piloncillo, y no en jugo."
      }
    },
    {
      "id": "jitomate",
      "tipo": "alimento",
      "nombre": "Jitomate",
      "temas": [
        "defensas",
        "piel"
      ],
      "para": "Tiene vitamina C, que el cuerpo usa para sus defensas, para hacer la piel y para que cierren las heridas.",
      "como": "En salsa, ensalada o caldo, todos los días. Crudo, como en la salsa, guarda más vitamina C.",
      "ayuda": 1,
      "evidencia": "Composición del USDA. Para qué usa el cuerpo la vitamina C, y que al cocinar se pierde: NIH (ODS).",
      "aviso": "A bebés, el jitomate cherry pártelo en cuatro.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0.5,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "guayaba",
        "naranja_limon",
        "papaya",
        "mango"
      ],
      "si_no_hay": "Si no hay jitomate, la guayaba, la naranja o el limón tienen vitamina C.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 170457, jitomate rojo crudo",
          "url": "https://fdc.nal.usda.gov/food-details/170457/nutrients"
        },
        {
          "nombre": "NIH ODS, Vitamina C (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/VitaminC-Consumer/"
        },
        {
          "nombre": "NHS, Primeras comidas del bebé (evitar zanahoria cruda y alimentos duros)",
          "url": "https://www.nhs.uk/baby/weaning-and-feeding/babys-first-solid-foods/"
        }
      ]
    },
    {
      "id": "jicama",
      "tipo": "alimento",
      "nombre": "Jícama",
      "temas": [
        "defensas",
        "piel"
      ],
      "para": "Tiene vitamina C, que el cuerpo usa para sus defensas y para hacer la piel. También tiene fibra y mucha agua.",
      "como": "Una taza en tiras, con limón, como botana. Con poca sal.",
      "ayuda": 1,
      "evidencia": "Composición del USDA. Para qué usa el cuerpo la vitamina C: NIH (ODS).",
      "aviso": "A niños chicos dásela rallada o en tiras delgadas: en trozos duros puede atorarse.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 1,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "guayaba",
        "naranja_limon",
        "jitomate"
      ],
      "si_no_hay": "Si no hay jícama, la guayaba, la naranja o el pepino con limón son buenas botanas.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 170073, jícama cruda",
          "url": "https://fdc.nal.usda.gov/food-details/170073/nutrients"
        },
        {
          "nombre": "NIH ODS, Vitamina C (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/VitaminC-Consumer/"
        },
        {
          "nombre": "NHS, Primeras comidas del bebé (evitar zanahoria cruda y alimentos duros)",
          "url": "https://www.nhs.uk/baby/weaning-and-feeding/babys-first-solid-foods/"
        }
      ]
    },
    {
      "id": "higado_pollo",
      "tipo": "alimento",
      "nombre": "Hígado de pollo",
      "temas": [
        "energia",
        "vista"
      ],
      "para": "Tiene mucho hierro, vitamina B12 y vitamina A. El cuerpo usa el hierro para la sangre y la vitamina A para ver bien.",
      "como": "Un hígado de pollo una vez por semana, bien cocido: encebollado o guisado. No más de una vez por semana.",
      "ayuda": 2,
      "evidencia": "Composición del USDA. El NHS (Reino Unido) pide no comer hígado más de una vez por semana y nada en el embarazo.",
      "aviso": "No lo comas más de una vez por semana: tiene tanta vitamina A que de más hace daño. Si comes hígado cada semana, no tomes vitaminas que traigan vitamina A ni aceite de hígado de pescado.",
      "excluir": {
        "embarazo": true,
        "lactancia": false,
        "edad_minima": 1,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "frijol",
        "huevo",
        "quelites",
        "lentejas"
      ],
      "si_no_hay": "Si no hay hígado, el frijol, las lentejas, el huevo y los quelites tienen hierro.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 171061, hígado de pollo cocido",
          "url": "https://fdc.nal.usda.gov/food-details/171061/nutrients"
        },
        {
          "nombre": "NHS, Vitamina A (hígado no más de una vez por semana)",
          "url": "https://www.nhs.uk/conditions/vitamins-and-minerals/vitamin-a/"
        },
        {
          "nombre": "NHS, Alimentos que hay que evitar en el embarazo (hígado)",
          "url": "https://www.nhs.uk/pregnancy/keeping-well/foods-to-avoid/"
        },
        {
          "nombre": "NIH ODS, Vitamina A (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/VitaminA-Consumer/"
        }
      ]
    },
    {
      "id": "lentejas",
      "tipo": "alimento",
      "nombre": "Lentejas o garbanzos",
      "temas": [
        "energia",
        "defensas",
        "embarazo",
        "ninos"
      ],
      "para": "Tienen hierro, zinc, ácido fólico, fibra y proteína. El cuerpo usa el zinc para sus defensas y para que cierren las heridas.",
      "como": "Una taza cocida, en sopa o guisada, 2 o 3 veces por semana. Acompañada de jitomate, limón o guayaba, el cuerpo aprovecha mejor el hierro.",
      "ayuda": 2,
      "evidencia": "Composición del USDA. Para qué usa el cuerpo el zinc y que la vitamina C ayuda con el hierro de las plantas: NIH (ODS).",
      "aviso": "",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0.5,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "tienda",
      "costo": 1,
      "alternativas": [
        "frijol",
        "huevo",
        "pepitas"
      ],
      "si_no_hay": "Si no hay lentejas ni garbanzos, el frijol sirve igual.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 172421, lenteja cocida sin sal",
          "url": "https://fdc.nal.usda.gov/food-details/172421/nutrients"
        },
        {
          "nombre": "USDA FoodData Central 173757, garbanzo cocido sin sal",
          "url": "https://fdc.nal.usda.gov/food-details/173757/nutrients"
        },
        {
          "nombre": "NIH ODS, Zinc (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/Zinc-Consumer/"
        },
        {
          "nombre": "NIH ODS, Vitamina C (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/VitaminC-Consumer/"
        },
        {
          "nombre": "NIH ODS, Hierro (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/Iron-Consumer/"
        },
        {
          "nombre": "NIH ODS, Folato (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/Folate-Consumer/"
        }
      ],
      "prioriza_si": [
        "embarazo"
      ]
    },
    {
      "id": "cacahuate",
      "tipo": "alimento",
      "nombre": "Cacahuate natural o tostado",
      "temas": [
        "defensas"
      ],
      "para": "Tiene zinc, magnesio, proteína y grasas buenas. El cuerpo usa el zinc para sus defensas.",
      "como": "Un puñito (2 cucharadas) al día, natural o tostado, sin sal o con poca. El garapiñado trae azúcar y el japonés trae sal.",
      "ayuda": 1,
      "evidencia": "Composición del USDA. Para qué usa el cuerpo el zinc: NIH (ODS).",
      "aviso": "Si después de comerlo te da comezón, se te hincha la boca o te cuesta respirar, busca ayuda de inmediato.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 5,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "tienda",
      "costo": 1,
      "alternativas": [
        "pepitas",
        "frijol",
        "lentejas"
      ],
      "si_no_hay": "Si no hay cacahuate, las pepitas de calabaza o el frijol tienen zinc.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 172430, cacahuate crudo",
          "url": "https://fdc.nal.usda.gov/food-details/172430/nutrients"
        },
        {
          "nombre": "NIH ODS, Zinc (consumidor)",
          "url": "https://ods.od.nih.gov/factsheets/Zinc-Consumer/"
        },
        {
          "nombre": "NHS, Alimentos que no hay que dar a bebés y niños pequeños (cacahuate entero antes de 5 años)",
          "url": "https://www.nhs.uk/baby/weaning-and-feeding/foods-to-avoid-giving-babies-and-young-children/"
        }
      ]
    },
    {
      "id": "gargaras_sal",
      "tipo": "habito",
      "nombre": "Gárgaras de agua tibia con sal",
      "temas": [
        "tos_garganta"
      ],
      "para": "Hacer gárgaras con agua tibia y sal puede calmar un poco el dolor de garganta.",
      "como": "Disuelve media cucharadita de sal en un vaso de agua tibia. Haz gárgaras y escúpela: no te la tragues. Puedes repetirlo varias veces al día.",
      "ayuda": 1,
      "evidencia": "Autocuidado que recomienda el NHS (Reino Unido) para el dolor de garganta.",
      "aviso": "Si el dolor no mejora en una semana, ve al centro de salud. Si no puedes tragar, se te sale la saliva o te cuesta respirar, ve de inmediato.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 12,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "agua",
        "caldo",
        "miel",
        "malva"
      ],
      "si_no_hay": "Si no puedes hacer gárgaras, toma agua o caldo tibio a traguitos y descansa.",
      "fuentes": [
        {
          "nombre": "NHS, Dolor de garganta (gárgaras de agua tibia con sal)",
          "url": "https://www.nhs.uk/conditions/sore-throat/"
        }
      ]
    },
    {
      "id": "humo_lena",
      "tipo": "habito",
      "nombre": "Sacar el humo de la cocina de leña",
      "temas": [
        "tos_garganta"
      ],
      "para": "El humo de la leña dentro de la casa irrita la garganta y los pulmones. Sacar el humo cuida a toda la familia, sobre todo a mujeres y niños.",
      "como": "Cocina con la puerta y la ventana abiertas, o afuera. Si puedes, usa un fogón con chimenea (estufa ahorradora) o de gas. Que los bebés y niños jueguen y duerman lejos del fogón.",
      "ayuda": 2,
      "evidencia": "La OMS dice que el humo de la cocina dentro de la casa daña los pulmones y que mejorar la ventilación es parte de la solución.",
      "aviso": "Si alguien tiene tos que no se quita, le falta el aire o le silba el pecho, llévalo al centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no se puede cocinar afuera, deja la puerta abierta mientras cocinas y saca a los niños del cuarto del fogón.",
      "fuentes": [
        {
          "nombre": "OMS, Contaminación del aire doméstico y salud (nota descriptiva)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/household-air-pollution-and-health"
        }
      ],
      "sin_cambio": true
    },
    {
      "id": "agua_segura",
      "tipo": "habito",
      "nombre": "Hervir o clorar el agua para tomar",
      "temas": [
        "digestion",
        "defensas",
        "diarrea",
        "embarazo",
        "ninos"
      ],
      "para": "El agua de río, de pozo abierto o de tubería rota puede traer microbios que enferman del estómago. Hervirla o ponerle cloro la hace segura para tomar.",
      "como": "Hiérvela 5 minutos desde que suelta el hervor. O ponle 2 gotas de cloro de uso doméstico por cada litro y espera 30 minutos antes de tomarla. Guárdala tapada en un bote limpio de plástico o de vidrio.",
      "ayuda": 3,
      "evidencia": "Lo recomienda la Secretaría de Salud de México.",
      "aviso": "Usa solo cloro de uso doméstico y solo 2 gotas por litro. Lava cada semana con jabón, cepillo y cloro los botes y tambos donde guardas el agua.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no tienes cloro, hiérvela. Si no puedes hervirla, compra agua purificada para tomar y para el bebé.",
      "fuentes": [
        {
          "nombre": "Secretaría de Salud, Consumo de agua (desinfección para consumo)",
          "url": "https://www.gob.mx/salud/documentos/consumo-de-agua-desinfeccion-para-consumo"
        },
        {
          "nombre": "Secretaría de Salud, Enfermedades transmitidas por agua (hervir y clorar)",
          "url": "https://www.gob.mx/salud/articulos/las-enfermedades-transmitidas-por-agua-si-pueden-prevenirse?idiom=es"
        },
        {
          "nombre": "OMS, Lactancia materna (solo pecho 6 meses, ni siquiera agua)",
          "url": "https://www.who.int/es/health-topics/breastfeeding"
        }
      ],
      "ayuda_por_tema": {
        "diarrea": 2
      },
      "sin_cambio": true,
      "avisos_perfil": {
        "nino": "Si es un bebé de menos de 6 meses que toma solo pecho, no le des agua, ni siquiera hervida: la leche de pecho le da toda el agua que necesita."
      }
    },
    {
      "id": "sin_moscos",
      "tipo": "habito",
      "nombre": "Cuidarte de los piquetes de moscos (dengue)",
      "temas": [
        "defensas",
        "piel"
      ],
      "para": "El mosco del dengue nace en el agua limpia que se queda guardada o estancada y pica de día. Sin agua estancada y sin piquetes, cuidas a tu familia.",
      "como": "Cada semana: lava con jabón y cepillo, tapa y voltea cubetas, tambos y tinacos, y tira latas, llantas y botellas que junten agua. Duerme con mosquitero, también de día, usa ropa que cubra brazos y piernas, y usa repelente.",
      "ayuda": 2,
      "evidencia": "Lo recomiendan la OMS y los Servicios de Salud de Oaxaca (Lava, tapa, voltea y tira).",
      "aviso": "A los niños no les pongas repelente en las manos, los ojos ni la boca: ponlo en tus manos y luego en su cara. A los bebés, mejor el mosquitero. Si hay fiebre con dolor fuerte de panza, vómito o sangrado, ve al centro de salud y no tomes aspirina ni ibuprofeno por tu cuenta.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no tienes mosquitero ni repelente, usa ropa de manga larga y tapa y voltea todo lo que junte agua.",
      "fuentes": [
        {
          "nombre": "OMS, Dengue y dengue grave (nota descriptiva)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/dengue-and-severe-dengue"
        },
        {
          "nombre": "Servicios de Salud de Oaxaca, Tapar depósitos con agua limpia (7-feb-2024)",
          "url": "https://oaxaca.gob.mx/salud/wp-content/uploads/sites/32/2024/02/7-de-febrero-de-2024-Tapar-depositos-con-agua-limpia-evita-criaderos-del-mosquito-Aedes-aegypti-SSO.pdf"
        },
        {
          "nombre": "CDC, Cómo evitar las picaduras de mosquitos (repelente en niños)",
          "url": "https://www.cdc.gov/mosquitoes/prevention/index.html"
        }
      ],
      "sin_cambio": true
    },
    {
      "id": "descanso_vista",
      "tipo": "habito",
      "nombre": "Descansar la vista (20-20-20)",
      "temas": [
        "vista",
        "dolor_cabeza",
        "mayores"
      ],
      "para": "Ver de cerca mucho rato cansa los ojos. Descansarlos seguido ayuda a que no se cansen tanto.",
      "como": "Si ves el celular, lees, coses o bordas mucho rato: cada 20 minutos mira algo lejano, como el cerro o la calle, durante 20 segundos. Hazlo con buena luz.",
      "ayuda": 1,
      "evidencia": "Lo recomienda el Instituto Nacional del Ojo de Estados Unidos (NEI) para el trabajo en pantalla.",
      "aviso": "Si de pronto ves borroso, ves manchas o te duele el ojo, ve al centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 4,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Siempre se puede: no cuesta nada.",
      "fuentes": [
        {
          "nombre": "NEI (NIH), Cuide sus ojos: descanso 20-20-20 y revisión con azúcar o presión altas",
          "url": "https://www.nei.nih.gov/learn-about-eye-health/healthy-vision/keep-your-eyes-healthy"
        }
      ],
      "avisos_medicina": {
        "azucar": "Si tomas medicina para el azúcar, pide en tu centro de salud que te revisen los ojos.",
        "presion": "Si tomas pastilla para la presión, pide en tu centro de salud que te revisen los ojos."
      },
      "sin_cambio": true
    },
    {
      "id": "orinar_a_tiempo",
      "tipo": "habito",
      "nombre": "Ir al baño a tiempo",
      "temas": [
        "orina"
      ],
      "para": "Aguantar mucho la orina debilita la vejiga. Ir al baño a tiempo y vaciarla bien la cuida.",
      "como": "Ve al baño cada 3 o 4 horas. Siéntate tranquila o tranquilo y tómate tu tiempo para vaciar bien. Las mujeres: límpiense de adelante hacia atrás. Toma agua durante el día y usa calzón de algodón.",
      "cuanto_ninos": "Niños: que vayan al baño cada 2 o 3 horas durante el día.",
      "ayuda": 2,
      "evidencia": "Lo recomienda el Instituto Nacional sobre el Envejecimiento de Estados Unidos (NIA).",
      "aviso": "Si te arde al orinar, ves sangre, tienes fiebre o dolor de espalda, ve al centro de salud. Si te dijeron que tomes poca agua, sigue lo que te indicaron.",
      "aviso_no_ninos": [
        "Si te dijeron que tomes poca agua, sigue lo que te indicaron."
      ],
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 4,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Siempre se puede: no cuesta nada.",
      "fuentes": [
        {
          "nombre": "NIA (NIH), 15 consejos para cuidar la vejiga",
          "url": "https://www.nia.nih.gov/health/bladder-health-and-incontinence/15-tips-keep-your-bladder-healthy"
        },
        {
          "nombre": "MedlinePlus, Cuidados personales de las vías urinarias en las mujeres",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000391.htm"
        },
        {
          "nombre": "NIDDK (NIH), Vejiga en niños: orinar cada 2 a 3 horas",
          "url": "https://www.niddk.nih.gov/health-information/informacion-de-la-salud/enfermedades-urologicas/problemas-control-vejiga-enuresis-ninos/prevencion"
        }
      ],
      "avisos_medicina": {
        "nervios_sueno": "Las medicinas para dormir o para los nervios pueden hacer que no sientas las ganas: ve al baño cada 3 o 4 horas aunque no tengas ganas."
      },
      "sin_cambio": true
    },
    {
      "id": "piso_pelvico",
      "tipo": "habito",
      "nombre": "Ejercicios para no escapar orina (Kegel)",
      "temas": [
        "orina"
      ],
      "para": "Apretar y soltar los músculos que detienen la orina los hace más fuertes y ayuda a que no se escape la orina al toser, reír o cargar.",
      "como": "Aprieta los músculos que usas para aguantar la orina y cuenta hasta 3 o 5. Suelta y cuenta hasta 3 o 5. Hazlo 10 veces, en la mañana, en la tarde y en la noche, sentado o acostado.",
      "ayuda": 2,
      "evidencia": "Los recomiendan MedlinePlus y el NIA (Estados Unidos).",
      "aviso": "No los hagas mientras orinas. No aprietes la panza, las nalgas ni las piernas, y respira normal. Si se te escapa la orina seguido, coméntalo en tu centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 12,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "orinar_a_tiempo",
        "menos_cafe_vejiga"
      ],
      "si_no_hay": "Siempre se puede: no cuesta nada y se hace en cualquier lugar.",
      "fuentes": [
        {
          "nombre": "MedlinePlus, Cuidados personales: los ejercicios de Kegel",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000141.htm"
        },
        {
          "nombre": "NIA (NIH), 15 consejos para cuidar la vejiga",
          "url": "https://www.nia.nih.gov/health/bladder-health-and-incontinence/15-tips-keep-your-bladder-healthy"
        }
      ]
    },
    {
      "id": "crema_piel",
      "tipo": "habito",
      "nombre": "Crema o vaselina para la piel reseca",
      "temas": [
        "piel"
      ],
      "para": "La crema o la vaselina cubren la piel y le guardan la humedad, para que no se reseque ni dé tanta comezón.",
      "como": "Báñate con agua tibia, no caliente, y jabón suave, sin tallar fuerte. Sécate con toquecitos y ponte crema sin perfume o vaselina en brazos y piernas cada día, mejor después de bañarte.",
      "ayuda": 2,
      "evidencia": "Lo recomiendan MedlinePlus, el NIA (Estados Unidos) y el NHS (Reino Unido).",
      "aviso": "La crema y la vaselina que quedan en la ropa y las cobijas prenden fuego fácil: aléjate del fogón, las velas y los cigarros. Si la piel se abre, sangra o se pone muy roja, ve al centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "tienda",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no tienes crema, la vaselina sola es más barata. Báñate rápido y con agua tibia.",
      "fuentes": [
        {
          "nombre": "MedlinePlus, Piel seca",
          "url": "https://medlineplus.gov/spanish/ency/article/000835.htm"
        },
        {
          "nombre": "NIA (NIH), Cuidado de la piel y envejecimiento",
          "url": "https://www.nia.nih.gov/health/skin-care/skin-care-and-aging"
        },
        {
          "nombre": "NHS, Emolientes (tipos y cuidado con el fuego)",
          "url": "https://www.nhs.uk/conditions/emollients/"
        }
      ],
      "sin_cambio": true
    },
    {
      "id": "respiracion_lenta",
      "tipo": "habito",
      "nombre": "Respirar despacio para calmar los nervios",
      "temas": [
        "sueno",
        "dolor_cabeza",
        "colicos"
      ],
      "para": "Respirar despacio unos minutos ayuda a calmar los nervios y a relajarte antes de dormir.",
      "como": "Siéntate o acuéstate cómoda o cómodo. Mete el aire por la nariz contando del 1 al 5 y sácalo por la boca contando del 1 al 5, sin forzar. Hazlo 5 minutos. Sirve más si lo haces todos los días.",
      "ayuda": 1,
      "evidencia": "Lo recomienda el NHS (Reino Unido) para el estrés y para relajarse antes de dormir.",
      "aviso": "Si los nervios no te dejan hacer tus cosas o sientes que ya no puedes más, busca ayuda en tu centro de salud. Si piensas en hacerte daño, pide ayuda hoy mismo.",
      "aviso_no_ninos": [
        "Si los nervios no te dejan hacer tus cosas o sientes que ya no puedes más, busca ayuda en tu centro de salud.",
        "Si piensas en hacerte daño, pide ayuda hoy mismo."
      ],
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 6,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "dormir_misma_hora",
        "noche_tranquila",
        "bano_tibio"
      ],
      "si_no_hay": "Siempre se puede: no cuesta nada.",
      "fuentes": [
        {
          "nombre": "NHS, Ejercicios de respiración para el estrés",
          "url": "https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/"
        },
        {
          "nombre": "NHS Every Mind Matters, Cómo dormir mejor",
          "url": "https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/how-to-fall-asleep-faster-and-sleep-better/"
        },
        {
          "nombre": "MedlinePlus (NIH), Períodos menstruales dolorosos",
          "url": "https://medlineplus.gov/spanish/ency/article/003150.htm"
        }
      ]
    },
    {
      "id": "noche_tranquila",
      "tipo": "habito",
      "nombre": "Cuarto oscuro y sin pantallas en la noche",
      "temas": [
        "sueno",
        "dolor_cabeza"
      ],
      "para": "Un cuarto oscuro, callado y fresco, y dejar el celular antes de acostarte, ayudan a dormir mejor.",
      "como": "Una hora antes de dormir apaga el celular y la tele. Cena ligero y no muy tarde. Si después de 20 minutos no te duermes, levántate, haz algo tranquilo y vuelve a la cama cuando tengas sueño.",
      "ayuda": 2,
      "evidencia": "Lo recomienda el NHS (Reino Unido).",
      "aviso": "Si casi no duermes durante semanas y te sientes muy cansado de día, coméntalo en tu centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 1,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "dormir_misma_hora",
        "sol_manana",
        "sin_cafe_tarde",
        "respiracion_lenta"
      ],
      "si_no_hay": "Si no puedes oscurecer el cuarto, tapa la ventana con una cobija o un rebozo.",
      "fuentes": [
        {
          "nombre": "NHS Every Mind Matters, Cómo dormir mejor",
          "url": "https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/how-to-fall-asleep-faster-and-sleep-better/"
        }
      ]
    },
    {
      "id": "mover_bebe",
      "tipo": "habito",
      "nombre": "Jugar en el suelo con tu bebé",
      "temas": [
        "ninos"
      ],
      "para": "Moverse desde chiquito le ayuda a tu bebé a crecer y a desarrollarse.",
      "como": "Juega con tu bebé en el suelo, sobre un petate o una cobija limpia, varias veces al día. Si todavía no gatea, ponlo boca abajo, despierto y tú mirándolo, en ratitos que sumen media hora al día. No lo tengas amarrado en la carriola, la silla o el rebozo más de 1 hora seguida. Nada de tele ni celular. Cuando esté quieto, platícale, cántale o cuéntale cuentos. Desde que cumple 1 año, que juegue y se mueva 3 horas al día, repartidas.",
      "ayuda": 2,
      "evidencia": "Recomendación de la OMS (2019) para menores de 1 año.",
      "aviso": "Boca abajo, solo despierto y con alguien mirándolo. Para dormir, siempre boca arriba.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "edad_maxima": 2,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "No necesitas comprar nada: el suelo limpio y tus manos bastan.",
      "fuentes": [
        {
          "nombre": "OMS, Directrices de actividad física, sedentarismo y sueño para menores de 5 años (nota del 24-abr-2019)",
          "url": "https://www.who.int/news/item/24-04-2019-to-grow-up-healthy-children-need-to-sit-less-and-play-more"
        },
        {
          "nombre": "NHS, Sudden infant death syndrome (SIDS): dormir boca arriba",
          "url": "https://www.nhs.uk/baby/caring-for-a-newborn/sudden-infant-death-syndrome-sids/"
        }
      ],
      "sin_cambio": true,
      "actividad": true,
      "prioriza_si": [
        "nino"
      ]
    },
    {
      "id": "jugar_1a4",
      "tipo": "habito",
      "nombre": "Jugar y moverse (1 a 5 años)",
      "temas": [
        "ninos"
      ],
      "para": "Jugar y moverse mucho le ayuda a tu niña o niño a crecer y a desarrollarse.",
      "como": "Que juegue y se mueva 3 horas al día, repartidas: gatear, caminar, bailar, jugar a la pelota. A los 3 y 4 años, 1 hora de esas 3 que lo agite, como correr y brincar. No lo tengas amarrado en la carriola o la silla más de 1 hora seguida. Al año de edad, nada de tele ni celular; de 2 a 4 años, 1 hora al día como máximo, y menos es mejor. Cuando esté quieto, cuéntale cuentos o cántale.",
      "ayuda": 2,
      "evidencia": "Recomendación de la OMS (2019) para niñas y niños de 1 a 4 años.",
      "aviso": "Cuando haga mucho calor, que juegue a la sombra y tome agua seguido.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 1,
        "edad_maxima": 6,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "No hacen falta juguetes: una pelota de trapo, cantar y bailar también cuentan.",
      "fuentes": [
        {
          "nombre": "OMS, Directrices de actividad física, sedentarismo y sueño para menores de 5 años (nota del 24-abr-2019)",
          "url": "https://www.who.int/news/item/24-04-2019-to-grow-up-healthy-children-need-to-sit-less-and-play-more"
        },
        {
          "nombre": "OMS, Calor y salud (nota descriptiva, 31-jul-2026)",
          "url": "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health"
        }
      ],
      "sin_cambio": true,
      "actividad": true,
      "prioriza_si": [
        "nino"
      ]
    },
    {
      "id": "jugar_5a17",
      "tipo": "habito",
      "nombre": "Una hora de juego al día (5 a 17 años)",
      "temas": [
        "ninos",
        "energia"
      ],
      "para": "Moverse una hora al día le ayuda al cuerpo, a los huesos, al ánimo y a la escuela de niñas, niños y jóvenes.",
      "como": "Una hora al día, en promedio, de juego, deporte o trabajo que lo agite (que respire más rápido): correr, jugar fútbol o básquet, brincar la cuerda, bailar. 3 días a la semana, algo que haga fuerza: trepar, brincar, jalar la cuerda. Menos rato sentado frente a la tele o el celular.",
      "ayuda": 3,
      "evidencia": "La OMS lo recomienda con pruebas fuertes (directrices 2020).",
      "aviso": "Si le duele el pecho, se marea o le falta mucho el aire, que pare y vayan al centro de salud. Con mucho calor, a la sombra y con agua.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 5,
        "edad_maxima": 18,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "caminar",
        "menos_sentado"
      ],
      "si_no_hay": "Si no hay cancha, sirve el patio, la calle sin carros o ayudar en el campo.",
      "fuentes": [
        {
          "nombre": "OMS 2020, Directrices de actividad física y comportamiento sedentario (Bull et al., Br J Sports Med 2020;54:1451-1462)",
          "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/"
        },
        {
          "nombre": "NIA (NIH), Three types of exercise can improve your health (seguridad: no aguantar la respiración; mareo o dolor de pecho)",
          "url": "https://www.nia.nih.gov/health/exercise-and-physical-activity/three-types-exercise-can-improve-your-health"
        },
        {
          "nombre": "OMS, Calor y salud (nota descriptiva, 31-jul-2026)",
          "url": "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health"
        }
      ],
      "actividad": true,
      "prioriza_si": [
        "nino"
      ]
    },
    {
      "id": "fuerza_casa",
      "tipo": "habito",
      "nombre": "Hacer fuerza en casa",
      "temas": [
        "huesos_articulaciones",
        "corazon",
        "azucar_peso",
        "mayores"
      ],
      "para": "Hacer fuerza con tu cuerpo 2 días a la semana, además de caminar, ayuda a tus músculos y a tus huesos.",
      "como": "2 días a la semana o más: 1) Siéntate en una silla firme, sin ruedas, y párate despacio usando las piernas, no los brazos; luego siéntate despacio. Empieza con 5 veces. 2) Párate frente a la pared, pon las manos en ella a la altura del pecho y dobla los brazos despacio, de 5 a 10 veces. 3) Con 2 botellas o 2 cubetas chicas con un poco de agua, dobla los codos para subirlas al hombro, 5 veces con cada brazo. Poco a poco haz más. Cargar el mandado o el trabajo pesado del campo, como escarbar, también cuenta.",
      "ayuda": 3,
      "evidencia": "La OMS lo recomienda con pruebas fuertes (directrices 2020).",
      "aviso": "Respira mientras haces fuerza: no aguantes el aire. Si una articulación te duele mucho, para. Si te duele el pecho, te falta mucho el aire o te mareas, para y ve al centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 18,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "moverse_sentado",
        "equilibrio_mayores",
        "caminar"
      ],
      "si_no_hay": "Si no tienes silla firme, usa una banca pegada a la pared.",
      "fuentes": [
        {
          "nombre": "OMS 2020, Directrices de actividad física y comportamiento sedentario (Bull et al., Br J Sports Med 2020;54:1451-1462)",
          "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/"
        },
        {
          "nombre": "NHS, Strength exercises",
          "url": "https://www.nhs.uk/live-well/exercise/strength-exercises/"
        },
        {
          "nombre": "NHS, Physical activity guidelines for older adults",
          "url": "https://www.nhs.uk/live-well/exercise/physical-activity-guidelines-older-adults/"
        },
        {
          "nombre": "NIA (NIH), Three types of exercise can improve your health (seguridad: no aguantar la respiración; mareo o dolor de pecho)",
          "url": "https://www.nia.nih.gov/health/exercise-and-physical-activity/three-types-exercise-can-improve-your-health"
        }
      ],
      "actividad": true
    },
    {
      "id": "equilibrio_mayores",
      "tipo": "habito",
      "nombre": "Ejercicios de equilibrio",
      "temas": [
        "mayores",
        "huesos_articulaciones"
      ],
      "para": "Hacer ejercicios de equilibrio y fuerza 3 días a la semana ayuda a las personas mayores a estar más firmes al caminar y a caerse menos.",
      "como": "3 días a la semana, siempre junto a una pared o agarrado del respaldo de una silla firme: 1) Párate en un pie de 5 a 10 segundos y cambia de pie; 3 veces con cada uno. 2) Camina poniendo el talón de un pie pegado a la punta del otro, al menos 5 pasos, mirando al frente. 3) Camina de lado, despacio, 10 pasos para un lado y 10 para el otro. Bailar también ayuda al equilibrio. Súmalos a los ejercicios de fuerza.",
      "ayuda": 3,
      "evidencia": "La OMS lo recomienda con pruebas fuertes (directrices 2020 y nota de caídas).",
      "aviso": "Hazlos siempre junto a algo firme de dónde agarrarte. Si te mareas, siéntate y descansa.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 60,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "casa_sin_tropiezos",
        "levantarse_despacio",
        "fuerza_casa",
        "caminar",
        "calzado_firme"
      ],
      "si_no_hay": "Si no tienes silla firme, agárrate de una mesa pesada o de la orilla de la pared.",
      "fuentes": [
        {
          "nombre": "OMS 2020, Directrices de actividad física y comportamiento sedentario (Bull et al., Br J Sports Med 2020;54:1451-1462)",
          "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/"
        },
        {
          "nombre": "OMS, Caídas (nota descriptiva, 26-abr-2021)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/falls"
        },
        {
          "nombre": "NHS, Balance exercises",
          "url": "https://www.nhs.uk/live-well/exercise/balance-exercises/"
        },
        {
          "nombre": "NIA (NIH), Three types of exercise can improve your health (seguridad: no aguantar la respiración; mareo o dolor de pecho)",
          "url": "https://www.nia.nih.gov/health/exercise-and-physical-activity/three-types-exercise-can-improve-your-health"
        }
      ],
      "prioriza_si": [
        "mayor60"
      ],
      "actividad": true
    },
    {
      "id": "moverse_sentado",
      "tipo": "habito",
      "nombre": "Moverte sentado",
      "temas": [
        "mayores",
        "huesos_articulaciones",
        "corazon",
        "azucar_peso"
      ],
      "para": "Aunque no puedas caminar mucho, moverte sentado le hace bien a tu cuerpo. Cada quien según lo que pueda: algo es mejor que nada.",
      "como": "Siéntate en una silla firme, sin ruedas, con los pies en el piso. 1) Sube una rodilla y bájala despacio; luego la otra; 5 veces cada una. 2) Estira una pierna y mueve la punta del pie hacia adelante y hacia ti; 5 veces con cada pie. 3) Gira la cabeza despacio hacia un hombro y luego hacia el otro; 3 veces. 4) Con una botella con agua en cada mano, dobla los codos para subirlas. Al menos 2 días a la semana, y poco a poco más.",
      "ayuda": 2,
      "evidencia": "Recomendación de la OMS (2020) para personas con enfermedades de largo plazo o con discapacidad, según lo que puedan.",
      "aviso": "Si no sabes si te conviene, pregunta en tu centro de salud. Si te duele el pecho, te falta mucho el aire o te mareas, para y ve al centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 12,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "menos_sentado",
        "caminar",
        "fuerza_casa",
        "equilibrio_mayores"
      ],
      "si_no_hay": "Si no tienes silla firme, hazlo sentado en la orilla de la cama, con los pies en el suelo.",
      "fuentes": [
        {
          "nombre": "OMS 2020, Directrices de actividad física y comportamiento sedentario (Bull et al., Br J Sports Med 2020;54:1451-1462)",
          "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/"
        },
        {
          "nombre": "NHS, Sitting exercises",
          "url": "https://www.nhs.uk/live-well/exercise/sitting-exercises/"
        },
        {
          "nombre": "NHS, Strength exercises",
          "url": "https://www.nhs.uk/live-well/exercise/strength-exercises/"
        },
        {
          "nombre": "NIA (NIH), Three types of exercise can improve your health (seguridad: no aguantar la respiración; mareo o dolor de pecho)",
          "url": "https://www.nia.nih.gov/health/exercise-and-physical-activity/three-types-exercise-can-improve-your-health"
        }
      ],
      "actividad": true
    },
    {
      "id": "mover_embarazo",
      "tipo": "habito",
      "nombre": "Moverte en el embarazo",
      "temas": [
        "embarazo"
      ],
      "para": "Si tu embarazo va bien, moverte es seguro para ti y para tu bebé, y te ayuda a dormir y a sentirte de mejor ánimo.",
      "como": "Muévete casi todos los días hasta juntar 150 minutos a la semana, por ejemplo media hora, 5 días: caminar a un paso en el que puedas platicar, el quehacer a paso tranquilo y estiramientos suaves. 2 días a la semana, algo de fuerza suave, como cargar el mandado. Si no hacías ejercicio, empieza con 10 minutos al día y sube poco a poco; si no llegas a 150, haz lo que puedas. Si tienes alguna enfermedad o tu embarazo es de cuidado, pregunta en tu control prenatal qué puedes hacer. Después del parto, vuelve poco a poco; si fue cesárea, pregunta primero.",
      "ayuda": 3,
      "evidencia": "La OMS lo recomienda con pruebas fuertes (directrices 2020) para embarazadas sin complicaciones y después del parto.",
      "aviso": "Para si te sientes mal, incómoda o con mucho calor. Ve luego luego al centro de salud si sangras, te sale agua, te duele fuerte la panza, te mareas o te desmayas, te falta el aire o te duele el pecho. Toma agua, no lo hagas con el estómago vacío ni en el calor fuerte, ni nada en que te puedas caer o pegar en la panza. Ya avanzado el embarazo, no te acuestes boca arriba mucho rato.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 12,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "caminar",
        "menos_sentado"
      ],
      "si_no_hay": "Si no puedes salir, camina dentro de tu casa o en el patio.",
      "fuentes": [
        {
          "nombre": "OMS 2020, Directrices de actividad física y comportamiento sedentario (Bull et al., Br J Sports Med 2020;54:1451-1462)",
          "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/"
        },
        {
          "nombre": "NHS, Exercise in pregnancy",
          "url": "https://www.nhs.uk/pregnancy/keeping-well/exercise/"
        },
        {
          "nombre": "NHS Best Start in Life, Exercising in pregnancy",
          "url": "https://www.nhs.uk/best-start-in-life/pregnancy/exercising-in-pregnancy/"
        },
        {
          "nombre": "NHS, Vaginal bleeding in pregnancy",
          "url": "https://www.nhs.uk/pregnancy/common-symptoms/vaginal-bleeding/"
        },
        {
          "nombre": "NHS, Signs that labour has begun (cuando se rompe la fuente)",
          "url": "https://www.nhs.uk/pregnancy/labour-and-birth/signs-that-labour-has-begun/"
        },
        {
          "nombre": "HSE (servicio público de salud de Irlanda), When to stop exercising during pregnancy",
          "url": "https://www2.hse.ie/pregnancy-birth/keeping-well/exercise/safe-exercise/"
        }
      ],
      "solo_embarazo": true,
      "prioriza_si": [
        "embarazo"
      ],
      "actividad": true
    },
    {
      "id": "menos_sentado",
      "tipo": "habito",
      "nombre": "Menos tiempo sentado",
      "temas": [
        "corazon",
        "azucar_peso",
        "mayores",
        "energia"
      ],
      "para": "Pasar menos tiempo sentado o acostado, y moverte aunque sea poquito, le hace bien a tu cuerpo.",
      "como": "Si pasas mucho rato sentado o acostado, levántate seguido y muévete un poco: camina por la casa, ve por agua, riega las plantas, barre un rato. Cambia un rato de tele o celular por un rato de moverte, aunque sea suave.",
      "ayuda": 2,
      "evidencia": "Recomendación de la OMS (2020): cambiar tiempo sentado por cualquier movimiento, aunque sea suave, trae beneficios. La OMS no dice cada cuánto pararse.",
      "aviso": "Si te mareas al pararte, levántate despacio.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 5,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "caminar",
        "jugar_5a17",
        "moverse_sentado",
        "fuerza_casa"
      ],
      "si_no_hay": "Siempre se puede: no cuesta nada.",
      "fuentes": [
        {
          "nombre": "OMS 2020, Directrices de actividad física y comportamiento sedentario (Bull et al., Br J Sports Med 2020;54:1451-1462)",
          "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/"
        },
        {
          "nombre": "NHS, Physical activity guidelines for older adults",
          "url": "https://www.nhs.uk/live-well/exercise/physical-activity-guidelines-older-adults/"
        },
        {
          "nombre": "NHS, Low blood pressure (hypotension)",
          "url": "https://www.nhs.uk/conditions/low-blood-pressure-hypotension/"
        }
      ],
      "actividad": true
    },
    {
      "id": "casa_sin_tropiezos",
      "tipo": "habito",
      "nombre": "Casa sin tropiezos",
      "temas": [
        "mayores"
      ],
      "para": "Una casa sin cosas en el paso y con luz en la noche ayuda a no tropezar ni caerse.",
      "como": "Quita del paso lo que estorba: cables, cubetas, leña, juguetes y tapetes que se resbalan. Pega los cables a la pared. Deja una lámpara o una luz junto a la cama y en el camino al baño para la noche. No camines en el piso recién trapeado. En el baño, pon algo que no resbale; donde haya escalones, algo firme de dónde agarrarte. No te subas a sillas ni mesas para alcanzar cosas: pide ayuda.",
      "ayuda": 2,
      "evidencia": "La OMS cuenta revisar y arreglar la casa entre lo que sirve para las caídas de los mayores; consejos del NHS y del NIA.",
      "aviso": "Si alguien se cae y se pega en la cabeza, el cuello, la espalda o la cadera, o no se puede levantar, no lo cargues tú solo: pide ayuda y llévenlo al centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "levantarse_despacio",
        "revisar_vista_oido",
        "equilibrio_mayores",
        "calzado_firme"
      ],
      "si_no_hay": "Si no hay lámpara, deja una linterna o el celular junto a la cama.",
      "fuentes": [
        {
          "nombre": "OMS, Caídas (nota descriptiva, 26-abr-2021)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/falls"
        },
        {
          "nombre": "NHS, Falls (qué hacer y cómo evitar caídas)",
          "url": "https://www.nhs.uk/conditions/falls/"
        },
        {
          "nombre": "NIA (NIH), Preventing falls at home: room by room",
          "url": "https://www.nia.nih.gov/health/falls-and-falls-prevention/preventing-falls-home-room-room"
        }
      ],
      "prioriza_si": [
        "mayor60"
      ]
    },
    {
      "id": "calzado_firme",
      "tipo": "habito",
      "nombre": "Zapatos que no resbalen",
      "temas": [
        "mayores"
      ],
      "para": "Un zapato que te queda bien y que agarra el piso ayuda a no resbalar ni caerse.",
      "como": "Usa zapatos o huaraches que te queden bien, que no se te salgan del pie, con suela que agarre y de tacón bajo. No andes en calcetines ni con chanclas de suela lisa, sobre todo en escalones o en piso mojado.",
      "ayuda": 1,
      "evidencia": "Consejo del NHS y del NIA para evitar caídas.",
      "aviso": "Si los pies te duelen al caminar, pregunta en tu centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 2,
      "alternativas": [
        "casa_sin_tropiezos",
        "levantarse_despacio",
        "equilibrio_mayores",
        "revisar_vista_oido"
      ],
      "si_no_hay": "Si tus zapatos tienen la suela lisa, úsalos solo en piso seco y parejo, y agárrate al bajar escalones.",
      "fuentes": [
        {
          "nombre": "NHS, Falls (qué hacer y cómo evitar caídas)",
          "url": "https://www.nhs.uk/conditions/falls/"
        },
        {
          "nombre": "NIA (NIH), Falls and fractures in older adults: causes and prevention",
          "url": "https://www.nia.nih.gov/health/falls-and-falls-prevention/falls-and-fractures-older-adults-causes-and-prevention"
        }
      ]
    },
    {
      "id": "revisar_medicinas_mareo",
      "tipo": "habito",
      "nombre": "Preguntar si tu medicina te marea",
      "temas": [
        "mayores"
      ],
      "para": "Algunas medicinas dan sueño o mareo, y eso hace más fácil caerse. Entre más medicinas, más fácil es caerse.",
      "como": "Si alguna medicina te da sueño o te marea, llévala (o su caja) a tu centro de salud o a la farmacia y pregunta si puede ser por eso.",
      "ayuda": 2,
      "evidencia": "La OMS cuenta quitar o bajar las medicinas para los nervios entre lo que sirve para las caídas de los mayores; consejos del NHS y del NIA.",
      "aviso": "No dejes ni cambies tu medicina por tu cuenta: pregúntalo primero en tu centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 18,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no puedes ir, pídele a alguien de tu familia que lleve la caja y pregunte por ti.",
      "fuentes": [
        {
          "nombre": "OMS, Caídas (nota descriptiva, 26-abr-2021)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/falls"
        },
        {
          "nombre": "NHS, Falls (qué hacer y cómo evitar caídas)",
          "url": "https://www.nhs.uk/conditions/falls/"
        },
        {
          "nombre": "NIA (NIH), Falls and fractures in older adults: causes and prevention",
          "url": "https://www.nia.nih.gov/health/falls-and-falls-prevention/falls-and-fractures-older-adults-causes-and-prevention"
        }
      ],
      "avisos_medicina": {
        "nervios_sueno": "Las medicinas para dormir o para los nervios pueden dar sueño o mareo: pregunta en tu centro de salud si la tuya te puede hacer caer. No la dejes por tu cuenta."
      },
      "sin_cambio": true
    },
    {
      "id": "levantarse_despacio",
      "tipo": "habito",
      "nombre": "Levantarte despacio",
      "temas": [
        "mayores",
        "corazon"
      ],
      "para": "Pararte despacio ayuda a no marearte ni caerte.",
      "como": "Al levantarte de la cama, primero siéntate un ratito en la orilla y luego párate despacio. Igual al pararte de una silla. No te agaches ni te voltees de golpe. No estés mucho rato parado sin moverte.",
      "ayuda": 1,
      "evidencia": "Consejo del NHS y del NIA.",
      "aviso": "Si te mareas o casi te desmayas seguido al pararte, ve al centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "casa_sin_tropiezos",
        "revisar_medicinas_mareo",
        "calzado_firme"
      ],
      "si_no_hay": "Siempre se puede: no cuesta nada.",
      "fuentes": [
        {
          "nombre": "NHS, Low blood pressure (hypotension)",
          "url": "https://www.nhs.uk/conditions/low-blood-pressure-hypotension/"
        },
        {
          "nombre": "NIA (NIH), Falls and fractures in older adults: causes and prevention",
          "url": "https://www.nia.nih.gov/health/falls-and-falls-prevention/falls-and-fractures-older-adults-causes-and-prevention"
        },
        {
          "nombre": "NHS, Falls (qué hacer y cómo evitar caídas)",
          "url": "https://www.nhs.uk/conditions/falls/"
        }
      ],
      "avisos_medicina": {
        "presion": "Algunas pastillas de la presión pueden marear al pararte. Si te pasa, no la dejes: pregúntalo en tu centro de salud."
      },
      "prioriza_si": [
        "mayor60",
        "presion"
      ]
    },
    {
      "id": "revisar_vista_oido",
      "tipo": "habito",
      "nombre": "Revisar la vista y el oído",
      "temas": [
        "mayores",
        "vista",
        "dolor_cabeza"
      ],
      "para": "Ver y oír bien ayuda a no tropezar ni caerse; hasta un cambio chico cuenta.",
      "como": "Pide en tu centro de salud que te revisen la vista y el oído. Si te dan lentes, úsalos como te dijeron y date unos días para acostumbrarte. Si usas aparato para oír, que te quede bien y úsalo.",
      "ayuda": 1,
      "evidencia": "Consejo del NHS y del NIA para evitar caídas.",
      "aviso": "",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 18,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Mientras te revisan, camina con más cuidado y con buena luz.",
      "fuentes": [
        {
          "nombre": "NHS, Falls (qué hacer y cómo evitar caídas)",
          "url": "https://www.nhs.uk/conditions/falls/"
        },
        {
          "nombre": "NIA (NIH), Falls and fractures in older adults: causes and prevention",
          "url": "https://www.nia.nih.gov/health/falls-and-falls-prevention/falls-and-fractures-older-adults-causes-and-prevention"
        },
        {
          "nombre": "NHS, Headaches",
          "url": "https://www.nhs.uk/symptoms/headaches/"
        }
      ],
      "sin_cambio": true
    },
    {
      "id": "calor_cuidado",
      "tipo": "habito",
      "nombre": "Cuidarse del calor",
      "temas": [
        "mayores",
        "ninos",
        "piel"
      ],
      "para": "Con mucho calor el cuerpo se cansa y se puede enfermar. Las personas mayores, los bebés, los niños, las embarazadas y quien trabaja al sol corren más peligro.",
      "como": "En los días de mucho calor: no salgas ni hagas trabajo pesado en las horas de más calor (de 11 de la mañana a 3 de la tarde); busca la sombra; toma agua seguido durante el día; usa ropa ligera y floja y sombrero; mójate la piel con un trapo húmedo o báñate con agua fresca. No tomes alcohol. En la casa, cierra y tapa las ventanas de día y ábrelas en la noche, cuando refresque. Ve a ver seguido a las personas mayores, a los enfermos y a quien vive solo. Nunca dejes a un niño dentro de un carro.",
      "cuanto_ninos": "Bebés de menos de 6 meses: nada de sol directo. Si solo toma pecho, no necesita agua: dale pecho más seguido. Desde los 6 meses: traguitos de agua hervida y fría en vasito con la comida, y un poco más con el calor. No tapes la carriola con una cobija. Niñas y niños: ropa ligera y floja que cubra la piel, y sombrero.",
      "ayuda": 2,
      "evidencia": "Consejos de la OMS y del NHS para el calor.",
      "aviso": "Si alguien con calor tiene la piel caliente y seca, respira rápido, está confundido o se desmaya, es urgencia: ponlo a la sombra, mójalo con agua fresca y llévenlo ya al centro de salud. Si en tu centro de salud te dijeron que tomes poca agua, pregunta allí cuánta tomar con el calor.",
      "aviso_no_ninos": [
        "Si en tu centro de salud te dijeron que tomes poca agua, pregunta allí cuánta tomar con el calor."
      ],
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no hay sombra cerca, usa un sombrero o un trapo mojado en la cabeza y busca un lugar techado.",
      "fuentes": [
        {
          "nombre": "OMS, Calor y salud (nota descriptiva, 31-jul-2026)",
          "url": "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health"
        },
        {
          "nombre": "NHS, Heatwave: how to cope in hot weather",
          "url": "https://www.nhs.uk/live-well/seasonal-health/heatwave-how-to-cope-in-hot-weather/"
        },
        {
          "nombre": "NHS, Heat exhaustion and heatstroke",
          "url": "https://www.nhs.uk/conditions/heat-exhaustion-heatstroke/"
        },
        {
          "nombre": "NHS, Safety in the sun (bebés y niños; agua y pecho con calor)",
          "url": "https://www.nhs.uk/baby/first-aid-and-safety/safety/safety-in-the-sun/"
        }
      ],
      "sin_cambio": true
    },
    {
      "id": "cepillar_dientes",
      "tipo": "habito",
      "nombre": "Cepillarte los dientes con pasta con flúor",
      "temas": [
        "boca"
      ],
      "para": "Cepillarte con pasta con flúor cuida los dientes de las caries (dientes picados) y cuida las encías.",
      "como": "Por lo menos 2 veces al día, y una de ellas en la noche, antes de dormir. Usa pasta que diga «flúor» o «fluoruro» en la caja, de 1000 a 1500 ppm. Cepilla dientes, encías y lengua de 2 a 3 minutos. Escupe la pasta y no te enjuagues luego luego con agua, para que el flúor se quede. Cambia el cepillo cuando esté despeinado.",
      "ayuda": 3,
      "evidencia": "Lo recomiendan la OMS, la Secretaría de Salud y el NHS (servicio de salud del Reino Unido).",
      "aviso": "Si te duele una muela más de 2 días, o te duele al morder, ve al centro de salud o con el dentista.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 6,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "tienda",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no tienes pasta con flúor, cómprala en la tienda. Mientras, come y toma menos dulce.",
      "fuentes": [
        {
          "nombre": "OMS, Salud bucodental (nota descriptiva, 17-mar-2025)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/oral-health"
        },
        {
          "nombre": "Secretaría de Salud, 10 reglas para conservar tu boca (2016)",
          "url": "https://www.gob.mx/salud/articulos/10-reglas-para-conservar-tu-boca-sana"
        },
        {
          "nombre": "NHS, How to keep your teeth clean",
          "url": "https://www.nhs.uk/live-well/healthy-teeth-and-gums/how-to-keep-your-teeth-clean/"
        },
        {
          "nombre": "NHS, Toothache",
          "url": "https://www.nhs.uk/conditions/toothache/"
        },
        {
          "nombre": "NHS, Taking care of children's teeth",
          "url": "https://www.nhs.uk/live-well/healthy-teeth-and-gums/taking-care-of-childrens-teeth/"
        }
      ],
      "sin_cambio": true,
      "cuanto_ninos": "A los 6 años, pasta con flúor de 1000 a 1500 ppm, del tamaño de un chícharo. Desde los 7 años, pasta con flúor de 1350 a 1500 ppm. 2 veces al día, unos 2 minutos, y la última antes de dormir. Que escupa la pasta y no se enjuague con agua.",
      "avisos_perfil": {
        "nino": "A los 6 años, ayúdale y míralo mientras se cepilla. Desde los 7 ya se puede cepillar solo, pero sigue revisando que lo haga bien."
      }
    },
    {
      "id": "limpiar_dientes_bebe",
      "tipo": "habito",
      "nombre": "Cepillarle los dientes a tu bebé desde el primer diente",
      "temas": [
        "boca",
        "ninos"
      ],
      "para": "Los dientes de leche también se pican. Hay que cepillarlos desde que sale el primer diente.",
      "como": "Tú le cepillas los dientes 2 veces al día, y una de ellas en la noche, antes de dormir. Usa pasta con flúor (en la caja dice por lo menos 1000 ppm) y pon solo una embarradita delgada en el cepillo. No le enjuagues la boca con agua después.",
      "ayuda": 3,
      "evidencia": "Lo recomienda el NHS (servicio de salud del Reino Unido); la OMS pide pasta con flúor.",
      "aviso": "Pon solo una embarradita de pasta, no más. Llévalo a revisión de los dientes cuando le salgan los primeros, o antes de que cumpla 1 año.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "edad_maxima": 3,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "tienda",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no tienes cepillo de bebé, pregunta en tu centro de salud. No le des refresco, jugo ni bebidas con azúcar.",
      "fuentes": [
        {
          "nombre": "NHS, Taking care of children's teeth",
          "url": "https://www.nhs.uk/live-well/healthy-teeth-and-gums/taking-care-of-childrens-teeth/"
        },
        {
          "nombre": "OMS, Salud bucodental (nota descriptiva, 17-mar-2025)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/oral-health"
        },
        {
          "nombre": "OMS, Alimentación sana (nota descriptiva, 26-ene-2026)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/healthy-diet"
        }
      ],
      "sin_cambio": true,
      "prioriza_si": [
        "nino"
      ]
    },
    {
      "id": "pasta_ninos",
      "tipo": "habito",
      "nombre": "Pasta con flúor para niñas y niños de 2 a 5 años",
      "temas": [
        "boca",
        "ninos"
      ],
      "para": "A esta edad necesitan que un adulto les ayude o los vea, para que usen poca pasta y la escupan.",
      "como": "2 veces al día, unos 2 minutos, y una de ellas en la noche, antes de dormir. Antes de los 3 años, tú le cepillas, con una embarradita de pasta con flúor (por lo menos 1000 ppm). De 3 a 6 años, pasta con flúor de 1000 a 1500 ppm, del tamaño de un chícharo, y que se cepille mientras tú lo ves. Que escupa la pasta y no se enjuague con agua.",
      "ayuda": 3,
      "evidencia": "Lo recomienda el NHS (servicio de salud del Reino Unido); la OMS pide pasta con flúor.",
      "aviso": "Usa poca pasta: una embarradita antes de los 3 años y del tamaño de un chícharo de los 3 a los 6. Que la escupa y no se la trague.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 2,
        "edad_maxima": 6,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "tienda",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no tienes pasta con flúor, cómprala en la tienda. Mientras, que tome agua simple en lugar de refresco.",
      "fuentes": [
        {
          "nombre": "NHS, Taking care of children's teeth",
          "url": "https://www.nhs.uk/live-well/healthy-teeth-and-gums/taking-care-of-childrens-teeth/"
        },
        {
          "nombre": "OMS, Salud bucodental (nota descriptiva, 17-mar-2025)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/oral-health"
        }
      ],
      "sin_cambio": true,
      "prioriza_si": [
        "nino"
      ]
    },
    {
      "id": "menos_dulce_refresco",
      "tipo": "habito",
      "nombre": "Menos refresco, jugo y dulces",
      "temas": [
        "boca",
        "azucar_peso",
        "ninos",
        "corazon"
      ],
      "para": "El azúcar de los refrescos, los jugos y los dulces pica los dientes. Comer y tomar menos azúcar es parte de comer bien para toda la familia.",
      "como": "Toma agua simple en lugar de refresco o jugo. De postre, mejor una fruta. Ponle menos azúcar, miel o piloncillo al café, al atole y al agua de sabor. A los niños menores de 2 años no les des refresco, jugo ni bebidas con azúcar.",
      "ayuda": 3,
      "evidencia": "Lo recomiendan la OMS y el IMSS.",
      "aviso": "Los jugos de caja, los néctares y el agua de sabor también traen mucha azúcar.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Siempre se puede: el agua simple es la bebida más barata.",
      "fuentes": [
        {
          "nombre": "OMS, Salud bucodental (nota descriptiva, 17-mar-2025)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/oral-health"
        },
        {
          "nombre": "OMS, Alimentación sana (nota descriptiva, 26-ene-2026)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/healthy-diet"
        },
        {
          "nombre": "OMS, Obesidad y sobrepeso (nota descriptiva, 7-oct-2026)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/obesity-and-overweight"
        },
        {
          "nombre": "IMSS, Recomendaciones para la sana alimentación (infografía)",
          "url": "https://www.imss.gob.mx/sites/all/statics/salud/infografiasl/Recomendaciones-sana-alimentacion.pdf"
        }
      ],
      "ayuda_por_tema": {
        "corazon": 2
      },
      "prioriza_si": [
        "imc_alto",
        "azucar"
      ],
      "sin_cambio": true
    },
    {
      "id": "revisar_dientes",
      "tipo": "habito",
      "nombre": "Revisión de la boca cada 6 meses",
      "temas": [
        "boca"
      ],
      "para": "Que el dentista te revise la boca seguido ayuda a cuidar tus dientes y tus encías.",
      "como": "Ve con el dentista o a tu centro de salud cada 6 meses, aunque no te duela nada. Lleva a tus hijos desde que les salen los primeros dientes.",
      "ayuda": 2,
      "evidencia": "Lo recomienda la Secretaría de Salud (cada 6 meses).",
      "aviso": "Si te duele una muela más de 2 días, te duele al morder o se te hincha la cara, no esperes a los 6 meses: ve pronto.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "centro_salud",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no hay dentista cerca, pregunta en tu centro de salud cuándo viene el servicio de dientes.",
      "fuentes": [
        {
          "nombre": "Secretaría de Salud, 10 reglas para conservar tu boca (2016)",
          "url": "https://www.gob.mx/salud/articulos/10-reglas-para-conservar-tu-boca-sana"
        },
        {
          "nombre": "Secretaría de Salud, Programa de Salud Bucal del CENAPRECE (20-mar-2026)",
          "url": "https://www.gob.mx/salud/articulos/prevencion-y-autocuidado-pilares-del-programa-de-salud-bucal-del-cenaprece"
        },
        {
          "nombre": "NHS, Taking care of children's teeth",
          "url": "https://www.nhs.uk/live-well/healthy-teeth-and-gums/taking-care-of-childrens-teeth/"
        },
        {
          "nombre": "NHS, Toothache",
          "url": "https://www.nhs.uk/conditions/toothache/"
        }
      ],
      "sin_cambio": true
    },
    {
      "id": "no_tabaco",
      "tipo": "habito",
      "nombre": "Dejar de fumar, y que nadie fume en la casa",
      "temas": [
        "boca",
        "corazon",
        "tos_garganta",
        "orina",
        "colicos"
      ],
      "para": "Dejar de fumar es bueno para la boca y el corazón, y ayuda a respirar mejor. El humo de otros también hace daño, sobre todo a los niños.",
      "como": "Si fumas, pide ayuda en tu centro de salud para dejarlo: con ayuda es más fácil. No fumes dentro de la casa ni cerca de los niños. Tampoco masques tabaco.",
      "ayuda": 3,
      "evidencia": "Lo recomiendan la OMS, el NHS (servicio de salud del Reino Unido) y el NIA (Estados Unidos).",
      "aviso": "Si tienes una llaga en la boca que no cierra en 3 semanas, ve al centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Siempre se puede: dejar de fumar no cuesta y ahorras dinero.",
      "fuentes": [
        {
          "nombre": "OMS, Salud bucodental (nota descriptiva, 17-mar-2025)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/oral-health"
        },
        {
          "nombre": "OMS, Hipertensión (nota descriptiva)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/hypertension"
        },
        {
          "nombre": "OMS, Tabaco (nota descriptiva, 26-jun-2026)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/tobacco"
        },
        {
          "nombre": "NHS, Benefits of quitting smoking",
          "url": "https://www.nhs.uk/better-health/quit-smoking/why-quit-smoking/benefits-of-quitting-smoking/"
        },
        {
          "nombre": "NHS, Period pain",
          "url": "https://www.nhs.uk/conditions/period-pain/"
        },
        {
          "nombre": "NIA (NIH), 15 tips to keep your bladder healthy",
          "url": "https://www.nia.nih.gov/health/bladder-health-and-incontinence/15-tips-keep-your-bladder-healthy"
        },
        {
          "nombre": "NHS, Mouth ulcers",
          "url": "https://www.nhs.uk/conditions/mouth-ulcers/"
        }
      ],
      "ayuda_por_tema": {
        "colicos": 1,
        "orina": 2
      },
      "prioriza_si": [
        "presion"
      ],
      "sin_cambio": true
    },
    {
      "id": "llagas_boca",
      "tipo": "habito",
      "nombre": "Cuidar las llagas de la boca",
      "temas": [
        "boca"
      ],
      "para": "Comer blando y no lastimar la llaga hace que moleste menos mientras se cierra.",
      "como": "Usa un cepillo de cerdas suaves. Come cosas blandas. Toma las bebidas frescas con popote. No comas muy picante, muy salado ni ácido, como limón o jugo, ni cosas duras como tostadas o frituras. No tomes bebidas muy calientes.",
      "ayuda": 1,
      "evidencia": "Lo recomienda el NHS (servicio de salud del Reino Unido).",
      "aviso": "Si la llaga dura más de 3 semanas, sangra, se pone más roja y duele más, o es distinta a otras que has tenido, ve al centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 4,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Siempre se puede: come blando y fresco mientras se cierra.",
      "fuentes": [
        {
          "nombre": "NHS, Mouth ulcers",
          "url": "https://www.nhs.uk/conditions/mouth-ulcers/"
        }
      ],
      "sin_cambio": true
    },
    {
      "id": "seguir_comiendo",
      "tipo": "habito",
      "nombre": "Seguir comiendo y dando pecho con diarrea",
      "temas": [
        "diarrea",
        "ninos"
      ],
      "para": "Con diarrea el cuerpo pierde agua y fuerza. Seguir comiendo y dando pecho ayuda a recuperarse.",
      "como": "No dejes de comer ni de dar pecho. Come poco y seguido comida blanda, como arroz, plátano, papa o huevo cocido. Además, toma suero oral o agua segura después de cada vez que vayas al baño suelto.",
      "ayuda": 3,
      "evidencia": "Lo recomienda la OMS: seguir dando de comer y dar pecho durante la diarrea.",
      "aviso": "No dejes sin comer al niño con diarrea. Ve hoy al centro de salud si hay sangre en el excremento, no puede tomar líquidos, tiene los ojos hundidos o está muy dormido.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Siempre se puede: dale su comida de siempre y sigue dando pecho.",
      "fuentes": [
        {
          "nombre": "OMS, Enfermedades diarreicas (nota descriptiva, 7-mar-2024)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/diarrhoeal-disease"
        },
        {
          "nombre": "MedlinePlus, Cuando usted tiene diarrea",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000121.htm"
        },
        {
          "nombre": "MedlinePlus, Diarrea en bebés",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000691.htm"
        }
      ],
      "ayuda_por_tema": {
        "diarrea": 2
      },
      "sin_cambio": true,
      "cuanto_ninos": "Si le das pecho, sigue dándole pecho, aunque tenga diarrea. Si toma otra leche, dásela como siempre, sin rebajarla con agua. Si ya come (desde los 6 meses), sigue con su comida de siempre; caen bien el plátano, la pasta o el cereal. Si tiene menos de 3 meses y tiene diarrea, llévalo hoy al centro de salud."
    },
    {
      "id": "lavar_frutas_verduras",
      "tipo": "habito",
      "nombre": "Lavar frutas y verduras",
      "temas": [
        "diarrea",
        "defensas"
      ],
      "para": "La tierra y los microbios de la cáscara pueden enfermar del estómago y pasar lombrices. Lavarlas bien ayuda a comerlas sin ese riesgo.",
      "como": "Lávate las manos primero. Quita las partes golpeadas. Talla las frutas y verduras con agua segura que corra, también las que vas a pelar. Usa un cepillo en las duras, como el melón o el pepino. Sécalas con un trapo limpio. Quita las hojas de afuera de la lechuga o la col.",
      "ayuda": 2,
      "evidencia": "Lo recomiendan la OMS y la FDA (Estados Unidos).",
      "aviso": "No hace falta jabón ni detergente para lavarlas. Si no las puedes lavar bien, mejor cómelas cocidas o peladas.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no tienes agua segura de sobra, lávalas con la que tengas y luego cuécelas o pélalas.",
      "fuentes": [
        {
          "nombre": "FDA, 7 consejos para limpiar frutas y verduras",
          "url": "https://www.fda.gov/consumers/articulos-para-el-consumidor-en-espanol/7-consejos-para-limpiar-frutas-y-verduras"
        },
        {
          "nombre": "OMS, Geohelmintiasis (nota descriptiva, 10-ene-2022)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/soil-transmitted-helminth-infections"
        }
      ],
      "sin_cambio": true
    },
    {
      "id": "arroz_cocido",
      "tipo": "alimento",
      "nombre": "Arroz blanco cocido",
      "temas": [
        "diarrea"
      ],
      "para": "Es una comida blanda que suele caer bien cuando hay diarrea.",
      "como": "Arroz blanco cocido en agua o en caldo, sin grasa, en porciones chicas varias veces al día. Puedes acompañarlo con plátano, papa o huevo cocido.",
      "ayuda": 1,
      "evidencia": "Lo recomienda MedlinePlus (Biblioteca Nacional de Medicina de Estados Unidos) como comida para la diarrea.",
      "aviso": "Con diarrea evita lo frito y lo grasoso, el café, el alcohol y el refresco. Lo más importante es tomar suero oral.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0.5,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "tienda",
      "costo": 1,
      "alternativas": [
        "caldo",
        "seguir_comiendo",
        "platano",
        "huevo"
      ],
      "si_no_hay": "Si no hay arroz, el plátano, la papa cocida o el caldo también son comida blanda.",
      "fuentes": [
        {
          "nombre": "MedlinePlus, Cuando usted tiene diarrea",
          "url": "https://medlineplus.gov/spanish/ency/patientinstructions/000121.htm"
        },
        {
          "nombre": "USDA FoodData Central 168878, arroz blanco de grano largo, cocido",
          "url": "https://fdc.nal.usda.gov/food-details/168878/nutrients"
        }
      ]
    },
    {
      "id": "desparasitar_centro",
      "tipo": "habito",
      "nombre": "Preguntar por la medicina para los parásitos",
      "temas": [
        "diarrea",
        "ninos"
      ],
      "para": "En las jornadas de salud se da a niñas y niños una medicina para los parásitos (lombrices).",
      "como": "Pregunta en tu centro de salud si a tus hijos les toca la medicina para los parásitos y cuándo es la próxima jornada de salud. No la compres ni se la des por tu cuenta.",
      "ayuda": 2,
      "evidencia": "La OMS pide dar esta medicina cada cierto tiempo a los niños donde hay muchos parásitos. En México se da en las Jornadas Nacionales de Salud Pública.",
      "aviso": "Esta medicina solo la indica el centro de salud. Lavarse las manos, tomar agua segura, lavar las verduras y no andar descalzo en la tierra también ayudan.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "centro_salud",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no hay jornada de salud cerca, pregunta en tu centro de salud cuándo le toca a tu hijo.",
      "fuentes": [
        {
          "nombre": "OMS, Geohelmintiasis (nota descriptiva, 10-ene-2022)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/soil-transmitted-helminth-infections"
        },
        {
          "nombre": "Secretaría de Salud, Primera Jornada Nacional de Salud Pública 2019 (albendazol de 0 a 9 años)",
          "url": "https://www.gob.mx/salud/articulos/primera-jornada-nacional-de-salud-publica-2019"
        }
      ],
      "sin_cambio": true
    },
    {
      "id": "calor_panza",
      "tipo": "habito",
      "nombre": "Calor tibio en la panza",
      "temas": [
        "colicos"
      ],
      "para": "El calor en la panza ayuda con el dolor de la regla.",
      "como": "Llena una bolsa para agua caliente con agua tibia, ciérrala bien y envuélvela en un trapo. Ponla sobre la panza un rato.",
      "ayuda": 2,
      "evidencia": "Lo recomienda el NHS (servicio de salud del Reino Unido).",
      "aviso": "Usa agua tibia, no hirviendo, y siempre envuelta en un trapo: directo en la piel puede quemar.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 12,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "masaje_panza",
        "bano_tibio",
        "caminar",
        "hinojo"
      ],
      "si_no_hay": "Si no tienes bolsa, un baño tibio o sobarte la panza también ayudan.",
      "fuentes": [
        {
          "nombre": "NHS, Period pain",
          "url": "https://www.nhs.uk/conditions/period-pain/"
        },
        {
          "nombre": "NHS, Stomach pain in pregnancy",
          "url": "https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/stomach-pain/"
        }
      ],
      "avisos_perfil": {
        "embarazo": "Si estás embarazada y te duele la panza, ve al centro de salud."
      }
    },
    {
      "id": "bano_tibio",
      "tipo": "habito",
      "nombre": "Baño tibio",
      "temas": [
        "colicos",
        "sueno"
      ],
      "para": "Un baño tibio relaja. Ayuda con el dolor de la regla y a descansar antes de dormir.",
      "como": "Báñate con agua tibia, no caliente. Si es para dormir, báñate una hora antes de acostarte.",
      "ayuda": 1,
      "evidencia": "Lo recomienda el NHS (servicio de salud del Reino Unido) para el dolor de la regla y para dormir.",
      "aviso": "Usa agua tibia, no caliente, para no quemarte.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 12,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "calor_panza",
        "masaje_panza",
        "noche_tranquila",
        "dormir_misma_hora",
        "respiracion_lenta"
      ],
      "si_no_hay": "Si no puedes bañarte, la bolsa de agua tibia en la panza o sobarte la panza también ayudan con la regla.",
      "fuentes": [
        {
          "nombre": "NHS, Period pain",
          "url": "https://www.nhs.uk/conditions/period-pain/"
        },
        {
          "nombre": "NHS, Insomnia (relajarse 1 hora antes, por ejemplo con un baño)",
          "url": "https://www.nhs.uk/conditions/insomnia/"
        }
      ]
    },
    {
      "id": "masaje_panza",
      "tipo": "habito",
      "nombre": "Sobarte la panza y la espalda",
      "temas": [
        "colicos"
      ],
      "para": "Sobarte con suavidad la panza y la espalda puede ayudar con el dolor de la regla.",
      "como": "Con la mano, soba despacio en círculos la parte baja de la panza, unos minutos. Puedes pedirle a alguien de confianza que te sobe la espalda.",
      "ayuda": 1,
      "evidencia": "Lo recomienda el NHS (servicio de salud del Reino Unido).",
      "aviso": "Si el dolor es muy fuerte y no se quita con nada, o tu regla cambia, ve al centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 12,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "calor_panza",
        "bano_tibio",
        "caminar"
      ],
      "si_no_hay": "Siempre se puede: no cuesta nada.",
      "fuentes": [
        {
          "nombre": "NHS, Period pain",
          "url": "https://www.nhs.uk/conditions/period-pain/"
        }
      ]
    },
    {
      "id": "lavar_herida",
      "tipo": "habito",
      "nombre": "Lavar y tapar raspones y cortadas chicas",
      "temas": [
        "piel"
      ],
      "para": "Una cortada o un raspón chico se cuida en casa: lavarlo bien y taparlo con algo limpio ayuda a que cierre bien.",
      "como": "Lávate las manos. Echa agua limpia sobre la herida: de la llave, de garrafón o hervida y ya fría. Lava la piel de alrededor con agua y jabón, limpiando hacia afuera. Seca con toquecitos con un trapo limpio y tápala con una gasa o una tela limpia. Cámbiala si se moja o se ensucia.",
      "ayuda": 2,
      "evidencia": "Primeros auxilios del NHS (servicio de salud del Reino Unido).",
      "aviso": "Ve hoy al centro de salud si la herida es honda o grande, no deja de sangrar, tiene tierra que no sale, es mordida de animal o de persona, o se pone hinchada, roja, caliente o con pus. Pregunta si te toca la vacuna del tétanos.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no tienes gasa, usa una tela limpia recién lavada.",
      "fuentes": [
        {
          "nombre": "NHS, Cuts and grazes",
          "url": "https://www.nhs.uk/conditions/cuts-and-grazes/"
        },
        {
          "nombre": "NHS, Tetanus",
          "url": "https://www.nhs.uk/conditions/tetanus/"
        }
      ],
      "sin_cambio": true
    },
    {
      "id": "piojos_peine",
      "tipo": "habito",
      "nombre": "Peine de piojos con el cabello mojado",
      "temas": [
        "piel",
        "ninos"
      ],
      "para": "Peinar con un peine de dientes muy finos, con el cabello mojado y con acondicionador, saca los piojos sin medicina.",
      "como": "Lava el cabello con champú normal y ponle bastante acondicionador. Con el peine de piojos, peina todo el cabello desde la raíz hasta las puntas, mechón por mechón, y limpia el peine cada vez. Hazlo 2 veces. Repítelo los días 1, 5, 9 y 13, y revisa otra vez el día 17. Revisa a todos los de la casa el mismo día.",
      "ayuda": 2,
      "evidencia": "Lo recomienda el NHS (servicio de salud del Reino Unido).",
      "aviso": "Nunca pongas petróleo, gasolina, keroseno ni insecticida en la cabeza: son peligrosos y se prenden. Los aceites de árbol de té, eucalipto o lavanda no se recomiendan. No hace falta faltar a la escuela.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "tienda",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no tienes peine de piojos, cómpralo en la farmacia: sirve para toda la familia.",
      "fuentes": [
        {
          "nombre": "NHS, Head lice and nits",
          "url": "https://www.nhs.uk/conditions/head-lice-and-nits/"
        },
        {
          "nombre": "Departamento de Salud de Oklahoma, Piojos de la cabeza (precauciones: no gasolina ni keroseno; solo para el aviso)",
          "url": "https://www.oklahoma.gov/content/dam/ok/en/health/health2/documents/headlice-2014-spanish.pdf"
        }
      ],
      "sin_cambio": true
    },
    {
      "id": "sarna_todos",
      "tipo": "habito",
      "nombre": "Medicina de la sarna para toda la casa el mismo día",
      "temas": [
        "piel"
      ],
      "para": "La sarna da mucha comezón y se pasa entre los de la casa. Para que se quite, todos se tienen que poner la medicina el mismo día, aunque no les pique.",
      "como": "Ve al centro de salud para que te den la crema o loción. Pónsela a todos en todo el cuerpo, también en la cabeza y la cara, menos alrededor de los ojos, y repítelo a los 7 días. Ese mismo día, lava la ropa y las cobijas con agua bien caliente. Lo que no se pueda lavar, guárdalo 3 días en una bolsa cerrada.",
      "ayuda": 2,
      "evidencia": "Lo recomienda el NHS (servicio de salud del Reino Unido).",
      "aviso": "A los menores de 2 años, y a quien está embarazada o da pecho, la medicina la debe indicar el centro de salud. La comezón puede seguir unas semanas: si sigue 2 a 4 semanas después de terminar, regresa.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "farmacia",
      "costo": 2,
      "alternativas": [],
      "si_no_hay": "Si no tienes la medicina, ve al centro de salud; mientras, lava la ropa y las cobijas con agua bien caliente.",
      "fuentes": [
        {
          "nombre": "NHS, Scabies",
          "url": "https://www.nhs.uk/conditions/scabies/"
        }
      ],
      "sin_cambio": true
    },
    {
      "id": "picaduras_frio",
      "tipo": "habito",
      "nombre": "Frío en un piquete de insecto",
      "temas": [
        "piel"
      ],
      "para": "Lavar el piquete y ponerle algo frío baja la hinchazón.",
      "como": "Si quedó el aguijón, sácalo raspando de lado con la uña o una tarjeta, sin apretarlo con pinzas. Lava con agua y jabón. Pon hielo o algo frío envuelto en un trapo por lo menos 20 minutos. Si puedes, levanta esa parte del cuerpo. No te rasques.",
      "ayuda": 1,
      "evidencia": "Primeros auxilios del NHS (servicio de salud del Reino Unido).",
      "aviso": "No pongas bicarbonato ni otros remedios caseros. Es urgencia si se hinchan los labios, la boca, la lengua o la garganta, cuesta respirar o tragar, o la persona se marea o se confunde. A un bebé de menos de 1 año llévalo al centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no tienes hielo, usa un trapo mojado con agua fresca.",
      "fuentes": [
        {
          "nombre": "NHS, Insect bites and stings",
          "url": "https://www.nhs.uk/conditions/insect-bites-and-stings/"
        }
      ],
      "sin_cambio": true
    },
    {
      "id": "lactancia_6m",
      "tipo": "habito",
      "nombre": "Dar solo pecho los primeros 6 meses",
      "temas": [
        "embarazo"
      ],
      "para": "La leche de pecho es todo lo que el bebé necesita para comer y beber en sus primeros 6 meses. Después se sigue dando pecho, junto con comida, hasta los 2 años o más.",
      "como": "Dale pecho en la primera hora después de nacer y luego cada vez que lo pida, de día y de noche. Antes de los 6 meses no le des agua, tés, atoles ni otra leche, salvo que te lo indique el centro de salud. A los 6 meses empieza con poquita comida machacada y sigue dándole pecho.",
      "ayuda": 3,
      "evidencia": "Lo recomiendan la OMS y la Secretaría de Salud de México (Cartilla Nacional de Salud).",
      "aviso": "Si no puedes dar pecho o casi no te sale leche, no es tu culpa: pide ayuda en tu centro de salud. Si el bebé no come, casi no moja el pañal o tiene fiebre, llévalo hoy al centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no puedes dar pecho, pregunta en tu centro de salud qué leche darle. Antes del año no le des leche de vaca como bebida.",
      "fuentes": [
        {
          "nombre": "OMS, Alimentación del lactante y del niño pequeño (nota descriptiva)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/infant-and-young-child-feeding"
        },
        {
          "nombre": "Secretaría de Salud, Cartilla Nacional de Salud de niñas y niños de 0 a 9 años (2023)",
          "url": "https://www.gob.mx/cms/uploads/attachment/file/894123/Cartilla_Ni_os_2023.pdf"
        },
        {
          "nombre": "NHS, Drinks and cups for babies and young children",
          "url": "https://www.nhs.uk/baby/weaning-and-feeding/drinks-and-cups-for-babies-and-young-children/"
        }
      ],
      "prioriza_si": [
        "embarazo"
      ],
      "sin_cambio": true
    },
    {
      "id": "comer_seguro_embarazo",
      "tipo": "habito",
      "nombre": "Comida segura en el embarazo",
      "temas": [
        "embarazo"
      ],
      "para": "Algunas comidas crudas o sin hervir pueden traer microbios que dañan al bebé. Cocinar bien y escoger bien te cuida a ti y a tu bebé.",
      "como": "Come la carne, el pollo, el pescado y los mariscos bien cocidos, sin partes rosadas ni sangre. El huevo, bien cocido. Toma leche pasteurizada y nunca leche bronca. El queso que no diga «pasteurizado», cómelo solo bien cocinado, hasta que eche vapor. No comas hígado. Pescados como la sardina, no más de 2 veces por semana. Café: no más de 2 tazas al día. Té de manzanilla: no más de 4 tazas al día. Nada de alcohol.",
      "ayuda": 2,
      "evidencia": "Lo recomienda el NHS (Reino Unido); lo del alcohol, la OMS.",
      "aviso": "Si comiste algo que te cayó mal y tienes fiebre, vómito o diarrea que no paran, ve al centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 12,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no sabes si algo es seguro, cocínalo bien hasta que eche vapor.",
      "fuentes": [
        {
          "nombre": "NHS, Foods to avoid in pregnancy",
          "url": "https://www.nhs.uk/pregnancy/keeping-well/foods-to-avoid/"
        },
        {
          "nombre": "OMS, Alcohol (nota descriptiva)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/alcohol"
        }
      ],
      "solo_embarazo": true,
      "prioriza_si": [
        "embarazo"
      ],
      "sin_cambio": true
    },
    {
      "id": "vacunas_cartilla",
      "tipo": "habito",
      "nombre": "Vacunas al día con la Cartilla",
      "temas": [
        "ninos",
        "defensas"
      ],
      "para": "Las vacunas cuidan de enfermedades graves que se contagian. Cada edad tiene su Cartilla Nacional de Salud con las vacunas que le tocan. En el centro de salud son gratis y seguras.",
      "como": "Lleva tu Cartilla, o la de tu niña o niño, cada vez que vayas al centro de salud. Ahí dice qué vacuna toca a qué edad. Si falta alguna, pide que la completen. Pregunta qué molestias puede dar la vacuna.",
      "ayuda": 3,
      "evidencia": "Lo pide la Secretaría de Salud de México.",
      "aviso": "Después de una vacuna puede doler donde la pusieron o dar alguna molestia. Si un niño tiene fiebre que no baja, está muy dormido o no come, llévalo al centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "centro_salud",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no tienes la Cartilla, pídela en tu centro de salud.",
      "fuentes": [
        {
          "nombre": "Secretaría de Salud, comunicado 105: llevar a vacunar a niñas, niños y adolescentes (11-mar-2024)",
          "url": "https://www.gob.mx/salud/prensa/105-secretaria-de-salud-invita-a-madres-y-padres-a-llevar-a-vacunar-a-ninas-ninos-y-adolescentes"
        },
        {
          "nombre": "Secretaría de Salud, Cartillas Nacionales de Salud versión 2023",
          "url": "https://www.gob.mx/salud/documentos/cartillas-nacionales-de-vacunacion-version-2023"
        },
        {
          "nombre": "Secretaría de Salud, Cartilla Nacional de Salud de niñas y niños de 0 a 9 años (2023)",
          "url": "https://www.gob.mx/cms/uploads/attachment/file/894123/Cartilla_Ni_os_2023.pdf"
        }
      ],
      "prioriza_si": [
        "nino"
      ],
      "sin_cambio": true
    },
    {
      "id": "pesar_medir_centro",
      "tipo": "habito",
      "nombre": "Llevar a pesar y medir al niño",
      "temas": [
        "ninos"
      ],
      "para": "En sus consultas de control, el centro de salud pesa y mide a tu niña o niño para ver cómo va creciendo, y te orienta si está bajo de peso o pasado de peso.",
      "como": "Llévalo a sus citas de control con la Cartilla Nacional de Salud. Pide que anoten el peso y la estatura y que te expliquen cómo va. Aprovecha para preguntar por sus vacunas, su comida y sus dientes.",
      "ayuda": 2,
      "evidencia": "Lo pide la Secretaría de Salud de México en la Cartilla Nacional de Salud.",
      "aviso": "Si notas que deja de crecer, baja de peso o no quiere comer, no esperes a la cita: llévalo al centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": [],
        "edad_maxima": 12
      },
      "leyenda_embarazo": false,
      "donde": "centro_salud",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no sabes cuándo te toca la cita, pregúntalo en tu centro de salud.",
      "fuentes": [
        {
          "nombre": "Secretaría de Salud, Cartilla Nacional de Salud de niñas y niños de 0 a 9 años (2023)",
          "url": "https://www.gob.mx/cms/uploads/attachment/file/894123/Cartilla_Ni_os_2023.pdf"
        }
      ],
      "prioriza_si": [
        "imc_bajo",
        "imc_alto",
        "nino"
      ],
      "sin_cambio": true
    },
    {
      "id": "pantallas_ninos",
      "tipo": "habito",
      "nombre": "Menos pantallas, más juego y sueño",
      "temas": [
        "ninos",
        "sueno"
      ],
      "para": "Los niños pequeños crecen mejor si pasan menos tiempo sentados frente a la tele o el celular, juegan más y duermen bien.",
      "como": "Antes de los 2 años: nada de tele ni celular. De 2 a 4 años: menos de 1 hora al día; entre menos, mejor. Cuando esté quieto, léele, cuéntale cuentos o canten juntos. Que se duerma y se despierte a la misma hora.",
      "cuanto_ninos": "Horas de sueño al día, contando las siestas: de 0 a 3 meses, de 14 a 17; de 4 a 11 meses, de 12 a 16; de 1 a 2 años, de 11 a 14; de 3 a 4 años, de 10 a 13.",
      "ayuda": 2,
      "evidencia": "Lo recomienda la OMS (2019) para menores de 5 años.",
      "aviso": "",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": [],
        "edad_maxima": 6
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "noche_tranquila",
        "jugar_1a4",
        "mover_bebe",
        "dormir_misma_hora"
      ],
      "si_no_hay": "Siempre se puede: no cuesta nada.",
      "fuentes": [
        {
          "nombre": "OMS 2019, Menores de 5 años: menos tiempo sentados y más juego (pantallas y sueño por edad)",
          "url": "https://www.who.int/news/item/24-04-2019-to-grow-up-healthy-children-need-to-sit-less-and-play-more"
        }
      ]
    },
    {
      "id": "plato_mitad_verduras",
      "tipo": "habito",
      "nombre": "Medio plato de verduras",
      "temas": [
        "azucar_peso",
        "corazon",
        "boca"
      ],
      "para": "Servir la mitad del plato con verduras te ayuda a comer porciones del tamaño adecuado, sin tener que contar ni medir.",
      "como": "En un plato mediano: la mitad, verduras como nopales, quelites, verdolagas, calabacita, chayote, jitomate o ejotes. Un cuarto: tortilla, arroz, frijol o fruta. El otro cuarto: huevo, pollo, pescado o queso. Para tomar, agua simple en vez de refresco.",
      "ayuda": 2,
      "evidencia": "Es el «método del plato» de los Institutos Nacionales de Salud (NIH) de Estados Unidos.",
      "aviso": "",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 12,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "nopal",
        "quelites",
        "verdolagas"
      ],
      "si_no_hay": "Si no hay verduras frescas, usa las de temporada del mercado o del huerto: quelites, verdolagas o nopales.",
      "fuentes": [
        {
          "nombre": "NIDDK (NIH), Cómo llevar una vida saludable con diabetes: método del plato",
          "url": "https://www.niddk.nih.gov/health-information/informacion-de-la-salud/diabetes/informacion-general/como-llevar-vida-saludable-si-tiene-diabetes"
        }
      ],
      "prioriza_si": [
        "imc_alto",
        "azucar"
      ],
      "avisos_medicina": {
        "azucar": "Si tomas pastilla o insulina para el azúcar, no dejes de comer: pregunta en tu centro de salud cómo repartir tus comidas con tu medicina."
      }
    },
    {
      "id": "cuidar_pies",
      "tipo": "habito",
      "nombre": "Revisarte los pies cada día",
      "temas": [
        "azucar_peso"
      ],
      "para": "Revisar y cuidar tus pies cada día ayuda a encontrar a tiempo heridas, ampollas o callos que a veces no se sienten.",
      "como": "Cada noche, al quitarte el zapato, mírate los pies y entre los dedos; si no alcanzas, usa un espejo o pide ayuda. Lávalos con agua tibia, no caliente (pruébala con el codo), y sécalos bien entre los dedos. Córtate las uñas derechas. No andes descalzo, ni dentro de la casa. Usa calcetín y zapato cerrado que te quede bien, no de plástico. No te cortes los callos.",
      "ayuda": 2,
      "evidencia": "Lo recomiendan los Institutos Nacionales de Salud (NIH) de Estados Unidos.",
      "aviso": "Ve pronto al centro de salud si tienes una herida, ampolla o moretón en el pie que no empieza a cerrar en pocos días, o si la piel del pie está roja, caliente, te duele o se pone oscura.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 12,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Siempre se puede: solo necesitas mirar tus pies cada noche.",
      "fuentes": [
        {
          "nombre": "NIDDK (NIH), La diabetes y los problemas de los pies",
          "url": "https://www.niddk.nih.gov/health-information/informacion-de-la-salud/diabetes/informacion-general/prevenir-problemas/pies-piel"
        }
      ],
      "prioriza_si": [
        "azucar"
      ],
      "avisos_medicina": {
        "azucar": "Si tomas pastilla o insulina para el azúcar, pide que te revisen los pies en cada consulta."
      },
      "sin_cambio": true
    },
    {
      "id": "comer_a_sus_horas",
      "tipo": "habito",
      "nombre": "Comer a sus horas",
      "temas": [
        "dolor_cabeza",
        "azucar_peso"
      ],
      "para": "Saltarse comidas es una causa común del dolor de cabeza. Comer a horas parecidas cada día también ayuda a planear qué y cuánto comes.",
      "como": "Haz 3 comidas al día, a horas parecidas, sin saltarte el desayuno. Si vas a trabajar al campo, lleva tu taco. Aunque no tengas mucha hambre, come algo ligero.",
      "ayuda": 2,
      "evidencia": "Lo recomienda el NHS (Reino Unido) para el dolor de cabeza; planear las comidas, los Institutos Nacionales de Salud (NIH) de Estados Unidos.",
      "aviso": "Si el dolor de cabeza no se quita o te da muy seguido, ve al centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 1,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no tienes tiempo de cocinar, una tortilla con frijol o una fruta es mejor que no comer.",
      "fuentes": [
        {
          "nombre": "NHS, Headaches",
          "url": "https://www.nhs.uk/symptoms/headaches/"
        },
        {
          "nombre": "NIDDK (NIH), Cómo llevar una vida saludable con diabetes: método del plato",
          "url": "https://www.niddk.nih.gov/health-information/informacion-de-la-salud/diabetes/informacion-general/como-llevar-vida-saludable-si-tiene-diabetes"
        }
      ],
      "prioriza_si": [
        "azucar"
      ],
      "avisos_medicina": {
        "azucar": "Si tomas pastilla o insulina para el azúcar, pregunta en tu centro de salud a qué horas comer según tu medicina."
      },
      "sin_cambio": true
    },
    {
      "id": "menos_alcohol",
      "tipo": "habito",
      "nombre": "Tomar menos alcohol, o nada",
      "temas": [
        "dolor_cabeza",
        "sueno",
        "corazon",
        "colicos",
        "boca"
      ],
      "para": "El alcohol puede dar dolor de cabeza, quitar el buen sueño, empeorar los cólicos de la regla y el ánimo, y dañar el corazón y el hígado.",
      "como": "Si tomas, toma menos; lo mejor es no tomar, porque ninguna cantidad está libre de riesgo. No tomes en las 6 horas antes de dormir. Si te cuesta dejarlo, pide ayuda en tu centro de salud o llama gratis a la Línea de la Vida: 800 911 2000.",
      "ayuda": 2,
      "evidencia": "Lo dicen la OMS y el NHS (Reino Unido).",
      "aviso": "",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 12,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Cambia la copa por agua natural o agua de fruta sin azúcar.",
      "fuentes": [
        {
          "nombre": "OMS, Alcohol (nota descriptiva)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/alcohol"
        },
        {
          "nombre": "NHS, Headaches",
          "url": "https://www.nhs.uk/symptoms/headaches/"
        },
        {
          "nombre": "NHS, Insomnia (qué hacer y cuándo ir)",
          "url": "https://www.nhs.uk/conditions/insomnia/"
        },
        {
          "nombre": "NHS, Period pain",
          "url": "https://www.nhs.uk/symptoms/period-pain/"
        },
        {
          "nombre": "CONASAMA (Secretaría de Salud), La Línea de la Vida te escucha: 800 911 2000",
          "url": "https://www.gob.mx/conasama/articulos/linea-de-la-vida-800-911-2000?idiom=es"
        },
        {
          "nombre": "CDC, Alcohol y lactancia materna",
          "url": "https://www.cdc.gov/breastfeeding-special-circumstances/hcp/vaccine-medication-drugs/alcohol.html"
        },
        {
          "nombre": "CDC, Alcohol y embarazo (no hay una cantidad segura)",
          "url": "https://www.cdc.gov/alcohol-pregnancy/about/index.html"
        }
      ],
      "sin_cambio": true,
      "avisos_perfil": {
        "embarazo": "En el embarazo, nada de alcohol.",
        "lactancia": "Si das pecho, lo más seguro es no tomar alcohol. Si tomas una copa, espera 2 horas antes de dar pecho. Sacarte la leche y tirarla no le quita el alcohol."
      }
    },
    {
      "id": "platicar_con_alguien",
      "tipo": "habito",
      "nombre": "Platicar con alguien de confianza",
      "temas": [
        "sueno",
        "mayores"
      ],
      "para": "Cuando andas triste, preocupado o sin ganas, contarle a alguien cómo te sientes y convivir con tu familia y tus amigos le hace bien al ánimo. Esto no sustituye la ayuda de un profesional.",
      "como": "Busca cada día un rato para estar con tu familia, por ejemplo comer juntos. Visita o llama a un amigo o a un vecino. Cuéntale a alguien de confianza cómo te sientes. Si alguien de tu familia vive solo, ve a verlo.",
      "ayuda": 2,
      "evidencia": "Lo recomiendan la OMS y el NHS (Reino Unido) para cuidar el ánimo.",
      "aviso": "Si llevas 2 semanas o más triste o sin ganas de nada, ve a tu centro de salud. Si piensas en hacerte daño o en no seguir viviendo, llama ya a la Línea de la Vida, 800 911 2000, gratis y a cualquier hora; si hay peligro inmediato, llama al 911.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 12,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "hacer_algo_que_te_guste",
        "caminar",
        "respiracion_lenta"
      ],
      "si_no_hay": "Si no tienes con quién platicar, llama gratis a la Línea de la Vida: 800 911 2000. Te escucha un profesional, a cualquier hora.",
      "fuentes": [
        {
          "nombre": "OMS, Trastorno depresivo (nota descriptiva): cuidado personal",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/depression"
        },
        {
          "nombre": "NHS, 5 steps to mental wellbeing",
          "url": "https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/five-steps-to-mental-wellbeing/"
        },
        {
          "nombre": "CONASAMA (Secretaría de Salud), La Línea de la Vida te escucha: 800 911 2000",
          "url": "https://www.gob.mx/conasama/articulos/linea-de-la-vida-800-911-2000?idiom=es"
        },
        {
          "nombre": "Secretaría de Salud, Cartilla Nacional de Salud de adultos mayores de 60 años (2023)",
          "url": "https://www.gob.mx/cms/uploads/attachment/file/894120/Cartilla_Adultos_2023.pdf"
        }
      ],
      "prioriza_si": [
        "mayor60"
      ]
    },
    {
      "id": "hacer_algo_que_te_guste",
      "tipo": "habito",
      "nombre": "Hacer algo que te guste",
      "temas": [
        "sueno"
      ],
      "para": "Seguir haciendo cosas que te gustaban, aprender algo nuevo o ayudar a alguien puede mejorar el ánimo. Esto no sustituye la ayuda de un profesional.",
      "como": "Escoge algo pequeño para cada día: cocinar una receta nueva, tejer, sembrar, cantar o arreglar algo de la casa. Ayuda a un vecino o dale las gracias a alguien. Pon atención, sin prisa, a lo que haces y a lo que ves a tu alrededor.",
      "ayuda": 2,
      "evidencia": "Lo recomiendan la OMS y el NHS (Reino Unido) para cuidar el ánimo.",
      "aviso": "Si llevas 2 semanas o más triste o sin ganas de nada, ve a tu centro de salud. Si piensas en hacerte daño, llama ya a la Línea de la Vida, 800 911 2000, gratis y a cualquier hora.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 12,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "platicar_con_alguien",
        "caminar",
        "respiracion_lenta"
      ],
      "si_no_hay": "Siempre se puede: algo pequeño también cuenta.",
      "fuentes": [
        {
          "nombre": "NHS, 5 steps to mental wellbeing",
          "url": "https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/five-steps-to-mental-wellbeing/"
        },
        {
          "nombre": "OMS, Trastorno depresivo (nota descriptiva): cuidado personal",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/depression"
        },
        {
          "nombre": "CONASAMA (Secretaría de Salud), La Línea de la Vida te escucha: 800 911 2000",
          "url": "https://www.gob.mx/conasama/articulos/linea-de-la-vida-800-911-2000?idiom=es"
        }
      ]
    },
    {
      "id": "descanso_liquidos",
      "tipo": "habito",
      "nombre": "Descansar y tomar líquidos con el catarro",
      "temas": [
        "tos_garganta",
        "defensas"
      ],
      "para": "Con el catarro, descansar, tomar suficientes líquidos y comer bien ayudan a reponerte. Casi siempre mejora en 1 o 2 semanas.",
      "como": "Descansa y toma agua seguido. Come lo que puedas; es normal que los niños coman menos unos días. Si tienes fiebre o te sientes muy mal, quédate en casa y no te acerques mucho a otros hasta que mejores. No fumes.",
      "cuanto_ninos": "A los niños pequeños no les des bebidas calientes. No le des miel a un bebé de menos de 1 año. No le des aspirina a menores de 16 años.",
      "ayuda": 2,
      "evidencia": "Lo recomienda el NHS (Reino Unido).",
      "aviso": "Ve al centro de salud si la fiebre dura más de 3 días, si empeoras, si te falta el aire o te duele el pecho, si en 10 días no mejoras o si la tos dura más de 3 semanas. Si te dijeron que tomes poca agua, sigue lo que te indicaron.",
      "aviso_no_ninos": [
        "Si te dijeron que tomes poca agua, sigue lo que te indicaron."
      ],
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no puedes dejar de trabajar, descansa en cuanto puedas y lleva agua contigo.",
      "fuentes": [
        {
          "nombre": "NHS, Common cold",
          "url": "https://www.nhs.uk/conditions/common-cold/"
        }
      ],
      "prioriza_si": [
        "fiebre"
      ],
      "sin_cambio": true
    },
    {
      "id": "toser_en_codo",
      "tipo": "habito",
      "nombre": "Toser y estornudar en el codo",
      "temas": [
        "tos_garganta",
        "defensas"
      ],
      "para": "Taparte la boca y la nariz con el codo o con un pañuelo al toser o estornudar es un hábito de higiene que cuida a tu familia y a los demás.",
      "como": "Tose o estornuda en la parte de adentro del codo, o en un pañuelo o papel. Tira el papel a la basura y lávate las manos con agua y jabón. Enséñaselo a los niños.",
      "ayuda": 2,
      "evidencia": "Lo recomienda la Secretaría de Salud de México («estornudo de etiqueta»).",
      "aviso": "",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no tienes pañuelo, usa el codo: siempre se puede.",
      "fuentes": [
        {
          "nombre": "Secretaría de Salud, Neumonía: estornudo de etiqueta y lavado de manos",
          "url": "https://www.gob.mx/salud/es/articulos/neumonia-enfermedad-que-afecta-los-pulmones"
        }
      ],
      "sin_cambio": true
    },
    {
      "id": "ajonjoli",
      "tipo": "alimento",
      "nombre": "Ajonjolí",
      "temas": [
        "huesos_articulaciones"
      ],
      "para": "Tiene calcio, que el cuerpo usa para formar y mantener huesos fuertes. También tiene hierro y fibra.",
      "como": "Una o dos cucharadas al día, tostado y molido, en mole, pipián, salsas o atole. Una cucharada tiene casi el mismo calcio que un tercio de vaso de leche.",
      "cuanto_ninos": "Desde los 6 meses, solo bien molido o en pasta, nunca la semilla entera. La primera vez, poquito, para ver si le da alergia.",
      "ayuda": 1,
      "evidencia": "Composición del USDA; para qué usa el cuerpo el calcio, NIH (ODS).",
      "aviso": "Puede dar alergia: si al comerlo se hinchan los labios o la cara, salen ronchas o cuesta respirar, ve de inmediato al centro de salud.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0.5,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "mercado",
      "costo": 1,
      "alternativas": [
        "tortilla",
        "quelites",
        "sardina",
        "leche",
        "yogur"
      ],
      "si_no_hay": "Si no hay ajonjolí, la tortilla de nixtamal y la sardina con espina también tienen calcio.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 170150, ajonjolí entero seco",
          "url": "https://fdc.nal.usda.gov/food-details/170150/nutrients"
        },
        {
          "nombre": "NIH ODS, Calcio (hoja en español)",
          "url": "https://ods.od.nih.gov/factsheets/Calcium-DatosEnEspanol/"
        },
        {
          "nombre": "NHS, Food allergies in babies and young children",
          "url": "https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/"
        }
      ]
    },
    {
      "id": "yogur",
      "tipo": "alimento",
      "nombre": "Yogur natural sin azúcar",
      "temas": [
        "huesos_articulaciones"
      ],
      "para": "Tiene calcio y proteína. El cuerpo usa el calcio para formar y mantener huesos fuertes.",
      "como": "Una taza al día, natural y sin azúcar. Si lo quieres dulce, ponle fruta picada en vez de azúcar.",
      "cuanto_ninos": "Desde los 6 meses: yogur natural, entero, pasteurizado y sin azúcar.",
      "ayuda": 2,
      "evidencia": "Composición del USDA; para qué usa el cuerpo el calcio, NIH (ODS).",
      "aviso": "Escoge yogur pasteurizado y sin azúcar: muchos yogures de la tienda traen mucha azúcar (fíjate en los sellos negros).",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 0.5,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "tienda",
      "costo": 2,
      "alternativas": [
        "tortilla",
        "ajonjoli",
        "quelites",
        "sardina",
        "leche"
      ],
      "si_no_hay": "Si no hay yogur, la leche, la sardina con espina y la tortilla de nixtamal también tienen calcio.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 171284, yogur natural de leche entera",
          "url": "https://fdc.nal.usda.gov/food-details/171284/nutrients"
        },
        {
          "nombre": "NIH ODS, Calcio (hoja en español)",
          "url": "https://ods.od.nih.gov/factsheets/Calcium-DatosEnEspanol/"
        },
        {
          "nombre": "NHS, Your baby's first solid foods",
          "url": "https://www.nhs.uk/baby/weaning-and-feeding/babys-first-solid-foods/"
        },
        {
          "nombre": "Secretaría de Salud, Cartilla Nacional de Salud de niñas y niños de 0 a 9 años (2023)",
          "url": "https://www.gob.mx/cms/uploads/attachment/file/894123/Cartilla_Ni_os_2023.pdf"
        }
      ]
    },
    {
      "id": "leche",
      "tipo": "alimento",
      "nombre": "Leche",
      "temas": [
        "huesos_articulaciones",
        "ninos"
      ],
      "para": "Tiene calcio y proteína. El cuerpo usa el calcio para formar y mantener huesos fuertes.",
      "como": "Un vaso al día, pasteurizada. Sola o en atole con poca azúcar.",
      "cuanto_ninos": "Como bebida, desde que cumple 1 año: leche entera pasteurizada. Antes del año, solo pecho o la leche que te indique el centro de salud. A menores de 5 años no les des leche descremada como bebida principal.",
      "ayuda": 2,
      "evidencia": "Composición del USDA; para qué usa el cuerpo el calcio, NIH (ODS).",
      "aviso": "No tomes ni des leche bronca sin hervir. Si la leche te cae mal, el yogur o el queso pueden caerte mejor.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 1,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "tienda",
      "costo": 2,
      "alternativas": [
        "tortilla",
        "ajonjoli",
        "sardina",
        "yogur"
      ],
      "si_no_hay": "Si no hay leche, la tortilla de nixtamal, la sardina con espina y el ajonjolí molido también tienen calcio.",
      "fuentes": [
        {
          "nombre": "USDA FoodData Central 171265, leche entera 3.25 %",
          "url": "https://fdc.nal.usda.gov/food-details/171265/nutrients"
        },
        {
          "nombre": "NIH ODS, Calcio (hoja en español)",
          "url": "https://ods.od.nih.gov/factsheets/Calcium-DatosEnEspanol/"
        },
        {
          "nombre": "NHS, Drinks and cups for babies and young children",
          "url": "https://www.nhs.uk/baby/weaning-and-feeding/drinks-and-cups-for-babies-and-young-children/"
        }
      ]
    },
    {
      "id": "menos_cafe_vejiga",
      "tipo": "habito",
      "nombre": "Menos café, refresco y alcohol para la vejiga",
      "temas": [
        "orina"
      ],
      "para": "El café, el té negro, la mayoría de los refrescos y el alcohol pueden molestar la vejiga y dar ganas de orinar más seguido o de prisa. Tomar menos puede ayudar.",
      "como": "Cambia poco a poco el café y el refresco por agua natural. Toma agua durante el día, lo suficiente para orinar cada pocas horas.",
      "ayuda": 1,
      "evidencia": "Lo recomienda el Instituto Nacional sobre el Envejecimiento de Estados Unidos (NIA).",
      "aviso": "Si te arde al orinar, ves sangre o tienes fiebre, ve al centro de salud. Si te dijeron que tomes poca agua, sigue lo que te indicaron.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 12,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "casa",
      "costo": 1,
      "alternativas": [
        "orinar_a_tiempo",
        "agua",
        "piso_pelvico"
      ],
      "si_no_hay": "Siempre se puede: no cuesta nada.",
      "fuentes": [
        {
          "nombre": "NIA (NIH), 15 tips to keep your bladder healthy",
          "url": "https://www.nia.nih.gov/health/bladder-health-and-incontinence/15-tips-keep-your-bladder-healthy"
        }
      ]
    },
    {
      "id": "pastillas_dolor_medida",
      "tipo": "habito",
      "nombre": "Cuidado con tomar muchas pastillas para el dolor",
      "temas": [
        "dolor_cabeza"
      ],
      "para": "Tomar pastillas para el dolor muchos días seguidos también puede causar dolor de cabeza.",
      "como": "Si tomas pastillas para el dolor de cabeza casi diario, no subas la cantidad por tu cuenta. Ve al centro de salud y lleva las cajas para que las vean.",
      "ayuda": 2,
      "evidencia": "El NHS (Reino Unido) pone tomar demasiadas pastillas para el dolor entre las causas comunes del dolor de cabeza.",
      "aviso": "No dejes una medicina que te dio tu médico sin preguntarle primero.",
      "excluir": {
        "embarazo": false,
        "lactancia": false,
        "edad_minima": 12,
        "medicinas": [],
        "condiciones": []
      },
      "leyenda_embarazo": false,
      "donde": "centro_salud",
      "costo": 1,
      "alternativas": [],
      "si_no_hay": "Si no puedes ir pronto, apunta en un papel qué días te duele y cuántas pastillas tomas, y llévalo cuando vayas.",
      "fuentes": [
        {
          "nombre": "NHS, Headaches",
          "url": "https://www.nhs.uk/symptoms/headaches/"
        }
      ],
      "sin_cambio": true
    }
  ],
  "grupos": [
    {
      "id": "cabeza",
      "nombre": "Cabeza y ánimo",
      "dibujo": "🙂"
    },
    {
      "id": "pecho",
      "nombre": "Pecho y garganta",
      "dibujo": "🫁"
    },
    {
      "id": "panza",
      "nombre": "Panza",
      "dibujo": "🍽️"
    },
    {
      "id": "piel_huesos",
      "nombre": "Piel y huesos",
      "dibujo": "🖐️"
    },
    {
      "id": "cuerpo",
      "nombre": "Todo el cuerpo",
      "dibujo": "🧍"
    }
  ]
};
