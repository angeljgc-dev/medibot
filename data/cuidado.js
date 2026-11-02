/* «Cuidado con esto» v1.0 (2026-11-02), criterio 16. 14 tarjetas sobre remedios comunes que
   pueden hacer daño, cada una con fuente oficial abierta. Se quitó arnica_tomada
   (decisión de diseño: la árnica que se toma en México es otra planta). El objeto es JSON válido (lo lee
   json.loads en tools/lint_contenido.py). Motor: js/recomendaciones.js → cuidado(). */
window.MediBotData = window.MediBotData || {};
window.MediBotData.cuidado = {
  "version": "1.0",
  "fecha": "2026-11-02",
  "orden": "El orden del arreglo es el de gravedad: dentro de cada sección se muestra la primera tarjeta que le toca al perfil.",
  "textos": {
    "titulo": "Cuidado con esto",
    "en_su_lugar": "En su lugar",
    "si_ya": "Si ya pasó"
  },
  "tarjetas": [
    {
      "id": "greta_azarcon",
      "nombre": "Greta y azarcón para el empacho",
      "que_es": "Son polvos de color naranja o amarillo, también llamados María Luisa, coral o rueda, que se dan para el empacho.",
      "por_que_cuidado": "Tienen mucho plomo, hasta 90 de cada 100 partes, según el CDC de Estados Unidos. El plomo hace daño aunque sea poquito, quita capacidad para aprender y concentrarse, y la Secretaría de Salud dice que el azarcón ya ha intoxicado a niños mexicanos.",
      "en_su_lugar": [
        "comer_despacio",
        "manzanilla",
        "suero_oral"
      ],
      "texto_en_su_lugar": "Para el empacho, come despacio y, desde los 6 meses, toma un té de manzanilla; si hay diarrea o vómito, toma suero oral del centro de salud.",
      "secciones": [
        "digestion",
        "ninos"
      ],
      "perfiles": [],
      "urgente_si": "Si ya se lo diste, avisa en el centro de salud para que vean si necesita una prueba de plomo en la sangre.",
      "fuentes": [
        {
          "nombre": "CDC, Lead in foods, cosmetics and medicines (greta y azarcón)",
          "url": "https://www.cdc.gov/lead-prevention/prevention/foods-cosmetics-medicines.html"
        },
        {
          "nombre": "Secretaría de Salud, NOM-199-SSA1-2000, niveles de plomo en sangre (azarcón)",
          "url": "https://salud.gob.mx/unidades/cdi/nom/199ssa10.html"
        },
        {
          "nombre": "Promoción de la Salud (gob.mx), ¿Dónde se encuentra el plomo que daña tu salud?",
          "url": "https://www.gob.mx/promosalud/articulos/donde-se-encuentra-el-plomo-que-dana-tu-salud?idiom=es"
        }
      ]
    },
    {
      "id": "gordolobo_mercado",
      "nombre": "Té de gordolobo del mercado",
      "que_es": "Es un té de hojas secas que se compra en el mercado y se toma para la tos y la garganta.",
      "por_que_cuidado": "A veces lo que se vende como gordolobo es otra planta, el Senecio, que daña el hígado. En Arizona, dos bebés que tomaron mucho de ese té enfermaron del hígado y uno murió, según el CDC de Estados Unidos.",
      "en_su_lugar": [
        "descanso_liquidos",
        "caldo",
        "miel"
      ],
      "texto_en_su_lugar": "Para la tos con catarro, descansa y toma líquidos, como caldo; desde 1 año, una cucharadita de miel.",
      "secciones": [
        "tos_garganta"
      ],
      "perfiles": [],
      "urgente_si": "Si un bebé o un niño tomó este té seguido y tiene la panza hinchada o está muy decaído, ve hoy mismo al centro de salud.",
      "fuentes": [
        {
          "nombre": "CDC, MMWR 26(32), 12-ago-1977: intoxicación por té de «gordolobo yerba» hecho con Senecio longilobus",
          "url": "https://stacks.cdc.gov/view/cdc/1190"
        }
      ]
    },
    {
      "id": "ruda_te",
      "nombre": "Té de ruda",
      "que_es": "Es una planta de olor fuerte que algunas personas toman en té para los cólicos o para que baje la regla.",
      "por_que_cuidado": "Tomada puede dar vómito y dolor de panza, dañar el hígado y los riñones, y en el embarazo causar sangrado y que se pierda el bebé, según el programa de la OMS sobre venenos (IPCS). Por eso la Secretaría de Salud pide que sus tés digan «ATENCION: NO CONSUMIRSE DURANTE EL EMBARAZO».",
      "en_su_lugar": [
        "calor_panza",
        "bano_tibio",
        "masaje_panza"
      ],
      "texto_en_su_lugar": "Para el dolor de la regla, pon calor tibio en la panza o date un baño tibio; si estás embarazada, cualquier dolor o sangrado se revisa en el centro de salud.",
      "secciones": [
        "embarazo",
        "colicos"
      ],
      "perfiles": [],
      "edad_minima": 12,
      "en_su_lugar_por_seccion": {
        "embarazo": {
          "en_su_lugar": [
            "comer_seguro_embarazo"
          ],
          "texto_en_su_lugar": ""
        }
      },
      "urgente_si": "Si tomaste té de ruda y tienes vómito, dolor fuerte de panza o sangrado, ve hoy mismo al centro de salud.",
      "fuentes": [
        {
          "nombre": "IPCS INCHEM (OMS), Ruta graveolens, monografía de venenos (PIM)",
          "url": "https://www.inchem.org/documents/pims/plant/rutagrav.htm"
        },
        {
          "nombre": "DOF 15-dic-1999, Acuerdo de plantas prohibidas o permitidas para tés, Art. SEGUNDO",
          "url": "https://dof.gob.mx/nota_detalle_popup.php?codigo=4958062"
        }
      ]
    },
    {
      "id": "ayuno_diarrea",
      "nombre": "Dejar de comer con diarrea",
      "que_es": "Es la costumbre de no dar de comer, o de dejar de dar pecho, mientras dura la diarrea.",
      "por_que_cuidado": "La diarrea puede dejar al cuerpo sin el agua y las sales que necesita para vivir, y sin comida el niño se debilita más. La Organización Mundial de la Salud pide seguir dando comida y pecho durante la diarrea, además del suero oral.",
      "en_su_lugar": [
        "seguir_comiendo",
        "suero_oral",
        "arroz_cocido"
      ],
      "texto_en_su_lugar": "Con diarrea, sigue comiendo poco y seguido, sigue dando pecho y toma suero oral cada vez que vayas al baño suelto.",
      "secciones": [
        "diarrea"
      ],
      "perfiles": [],
      "urgente_si": "Ve hoy mismo al centro de salud si hay sangre en el popó, o si está muy decaído, tiene los ojos hundidos o no puede beber; ve también si la diarrea dura 2 semanas o más.",
      "fuentes": [
        {
          "nombre": "OMS, Enfermedades diarreicas (nota descriptiva, 7-mar-2024)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/diarrhoeal-disease"
        }
      ]
    },
    {
      "id": "petroleo_piojos",
      "nombre": "Petróleo o gasolina para los piojos",
      "que_es": "Es untar petróleo, gasolina u otro líquido que prende fuego en el cabello para matar los piojos.",
      "por_que_cuidado": "Estos líquidos le pueden hacer al niño más daño que los piojos, y como prenden fuego lo pueden quemar. Las autoridades de salud de Texas y de Iowa, en Estados Unidos, piden no usarlos nunca.",
      "en_su_lugar": [
        "piojos_peine"
      ],
      "texto_en_su_lugar": "Para los piojos, peina el cabello mojado y con acondicionador con un peine de piojos, mechón por mechón.",
      "secciones": [
        "piel"
      ],
      "perfiles": [],
      "urgente_si": "Si ya se lo pusiste y la piel está roja, ardida o con ampollas, o si se lo tragó, ve hoy mismo al centro de salud.",
      "fuentes": [
        {
          "nombre": "Texas DSHS, Head Lice Fact Sheet No. 5 (mitos sobre los piojos)",
          "url": "https://www.dshs.texas.gov/sites/default/files/CHI-School-Health/Docs/Education-Materials/Head-Lice-Fact-Sheet-No-5-Color.pdf"
        },
        {
          "nombre": "Iowa HHS (antes IDPH), Lice Fact Sheet",
          "url": "https://hhs.iowa.gov/media/11172/download"
        }
      ]
    },
    {
      "id": "toloache",
      "nombre": "Toloache tomado",
      "que_es": "Es una planta de flor blanca grande en forma de trompeta que a veces se toma en té.",
      "por_que_cuidado": "Toda la planta es venenosa, sobre todo las semillas: da boca seca, vista borrosa, fiebre, confusión y ver cosas que no hay, y en Texas murieron dos jóvenes por tomar té de su raíz, según el CDC de Estados Unidos. La Secretaría de Salud la tiene en la lista de plantas que no se deben usar en tés.",
      "en_su_lugar": [
        "noche_tranquila",
        "respiracion_lenta",
        "dormir_misma_hora"
      ],
      "texto_en_su_lugar": "Para dormir mejor o calmar los nervios, deja el cuarto oscuro y tranquilo y respira despacio unos minutos.",
      "secciones": [
        "sueno"
      ],
      "perfiles": [],
      "edad_minima": 12,
      "urgente_si": "Si alguien lo tomó y tiene la boca muy seca, ve borroso, está confundido o muy inquieto, es una urgencia: ve de inmediato al centro de salud o llama al 911.",
      "fuentes": [
        {
          "nombre": "CDC, MMWR, Jimson weed poisoning: Texas, New York and California, 1994",
          "url": "https://www.cdc.gov/mmwr/preview/mmwrhtml/00035694.htm"
        },
        {
          "nombre": "DOF 15-dic-1999, Acuerdo de plantas prohibidas o permitidas para tés, Art. PRIMERO (Datura stramonium)",
          "url": "https://dof.gob.mx/nota_detalle_popup.php?codigo=4958062"
        }
      ]
    },
    {
      "id": "te_agua_bebe",
      "nombre": "Tés o agua al bebé antes de los 6 meses",
      "que_es": "Es darle al bebé tecitos, como de anís o de manzanilla, agua o atole antes de que cumpla 6 meses.",
      "por_que_cuidado": "La Organización Mundial de la Salud pide que antes de los 6 meses el bebé tome solo leche de pecho, sin otras bebidas, ni siquiera agua, salvo que lo indique el personal de salud; darle otras cosas antes puede afectar su crecimiento. Además, el «anís estrella» está en la lista de plantas que la Secretaría de Salud no permite en tés.",
      "en_su_lugar": [
        "lactancia_6m"
      ],
      "texto_en_su_lugar": "Dale pecho cada vez que lo pida, de día y de noche: con eso tiene lo que necesita para comer y beber.",
      "secciones": [
        "ninos"
      ],
      "perfiles": [
        "nino",
        "lactancia"
      ],
      "edad_maxima_nino": 2,
      "fuentes": [
        {
          "nombre": "OMS, Alimentación del lactante y del niño pequeño (nota descriptiva, 4-ago-2026)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/infant-and-young-child-feeding"
        },
        {
          "nombre": "DOF 15-dic-1999, Acuerdo de plantas prohibidas o permitidas para tés, Art. PRIMERO (Illicium anisatum)",
          "url": "https://dof.gob.mx/nota_detalle_popup.php?codigo=4958062"
        }
      ]
    },
    {
      "id": "miel_bebe",
      "nombre": "Miel a bebés menores de 1 año",
      "que_es": "Es darle miel al bebé para la tos, en el chupón o en su té.",
      "por_que_cuidado": "Antes de 1 año, la miel puede causar botulismo del bebé, una enfermedad muy grave que es una urgencia. Por eso el CDC de Estados Unidos pide no darle miel, ni chupones con miel, a un bebé menor de 1 año.",
      "en_su_lugar": [
        "lactancia_6m",
        "humo_lena"
      ],
      "texto_en_su_lugar": "Si tu bebé tiene tos, sigue dándole pecho cada vez que lo pida y que no respire el humo de la leña.",
      "secciones": [
        "tos_garganta"
      ],
      "perfiles": [
        "nino",
        "lactancia"
      ],
      "urgente_si": "Si un bebé comió miel y está estreñido, come mal, llora débil o tiene los párpados caídos, es una urgencia: ve de inmediato al centro de salud.",
      "fuentes": [
        {
          "nombre": "CDC, Preventing botulism (miel y bebés)",
          "url": "https://www.cdc.gov/botulism/prevention/index.html"
        },
        {
          "nombre": "CDC, Botulism: signs and symptoms (en bebés)",
          "url": "https://www.cdc.gov/botulism/signs-symptoms/index.html"
        }
      ]
    },
    {
      "id": "alcohol_tabaco_embarazo",
      "nombre": "Alcohol o cigarro en el embarazo",
      "que_es": "Es tomar cerveza, pulque, mezcal u otra bebida con alcohol, o fumar, estando embarazada, aunque sea poquito o como remedio.",
      "por_que_cuidado": "No hay ninguna cantidad ni ningún momento del embarazo en que el alcohol sea seguro: puede hacer que se pierda el bebé o que nazca con problemas para toda la vida. Fumar hace más probable que el bebé nazca antes de tiempo, con poco peso o con labio partido, o que muera de repente, según el CDC de Estados Unidos.",
      "en_su_lugar": [
        "no_tabaco",
        "menos_alcohol"
      ],
      "texto_en_su_lugar": "En el embarazo lo más seguro es nada de alcohol ni cigarro; si te cuesta dejarlos, pide ayuda en tu centro de salud.",
      "secciones": [
        "embarazo"
      ],
      "perfiles": [
        "embarazo"
      ],
      "fuentes": [
        {
          "nombre": "CDC, About alcohol use during pregnancy",
          "url": "https://www.cdc.gov/alcohol-pregnancy/about/index.html"
        },
        {
          "nombre": "CDC, Health effects of cigarettes: reproductive health",
          "url": "https://www.cdc.gov/tobacco/about/cigarettes-and-reproductive-health.html"
        }
      ]
    },
    {
      "id": "epazote_te",
      "nombre": "Té de epazote para las lombrices",
      "que_es": "Es un té fuerte o un jugo de epazote que se da, sobre todo a los niños, para sacar las lombrices.",
      "por_que_cuidado": "La Secretaría de Salud puso al epazote en la lista de plantas que no se deben usar en tés, porque pueden ser tóxicas. Tomado varias veces o en mucha cantidad ha intoxicado gravemente a niños, con daño en el cerebro, el hígado o los riñones.",
      "en_su_lugar": [
        "desparasitar_centro",
        "lavar_manos",
        "agua_segura"
      ],
      "texto_en_su_lugar": "Para las lombrices, pregunta en tu centro de salud por la medicina para los parásitos de las jornadas de salud.",
      "secciones": [
        "diarrea",
        "digestion"
      ],
      "perfiles": [],
      "urgente_si": "Si un niño tomó té de epazote y está muy dormido, no responde bien o vomita, ve hoy mismo al centro de salud.",
      "fuentes": [
        {
          "nombre": "DOF 15-dic-1999, Acuerdo de plantas prohibidas o permitidas para tés, Art. PRIMERO (Chenopodium ambrosioides)",
          "url": "https://dof.gob.mx/nota_detalle_popup.php?codigo=4958062"
        },
        {
          "nombre": "Elhaddadi et al., Cureus 2024: caso de intoxicación por Chenopodium ambrosioides en una niña de 4 años (apoyo, no oficial)",
          "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11177892/"
        }
      ]
    },
    {
      "id": "remedios_quemadura",
      "nombre": "Pasta de dientes, aceite o mantequilla en las quemaduras",
      "que_es": "Es poner pasta de dientes, aceite, mantequilla, café, huevo u otras cosas de la cocina sobre una quemadura.",
      "por_que_cuidado": "La Organización Mundial de la Salud pide no poner en una quemadura hielo, aceite, mantequilla, pasta de dientes, pastas caseras ni otras cosas de la casa. Tampoco hay que reventar las ampollas.",
      "en_su_lugar": [
        "agua_quemadura"
      ],
      "texto_en_su_lugar": "Pon la quemadura bajo el chorro de agua fresca, no helada, unos 20 minutos, y luego tápala con un trapo limpio.",
      "secciones": [
        "piel"
      ],
      "perfiles": [],
      "urgente_si": "Ve hoy mismo al centro de salud si la quemadura es grande o profunda, si fue por electricidad o por un químico, o si está en la cara, las manos, los pies o las partes íntimas.",
      "fuentes": [
        {
          "nombre": "OMS, Burns (nota descriptiva, 21-oct-2026)",
          "url": "https://www.who.int/news-room/fact-sheets/detail/burns"
        }
      ]
    },
    {
      "id": "poleo_te",
      "nombre": "Té de poleo",
      "que_es": "Es una hierba de olor fuerte, parecida a la hierbabuena, que algunas personas toman en té para la panza o para la regla.",
      "por_que_cuidado": "El poleo está en la lista de plantas que la Secretaría de Salud no permite en tés. La Agencia Europea de Medicamentos dice que su aceite daña el hígado y que ha habido intoxicaciones graves y muertes.",
      "en_su_lugar": [
        "calor_panza",
        "bano_tibio",
        "masaje_panza"
      ],
      "texto_en_su_lugar": "Para el dolor de la regla, pon calor tibio en la panza, date un baño tibio o sóbate la panza con suavidad.",
      "secciones": [
        "colicos"
      ],
      "perfiles": [],
      "edad_minima": 12,
      "fuentes": [
        {
          "nombre": "DOF 15-dic-1999, Acuerdo de plantas prohibidas o permitidas para tés, Art. PRIMERO (Mentha pulegium, Hedeoma pulegioides)",
          "url": "https://dof.gob.mx/nota_detalle_popup.php?codigo=4958062"
        },
        {
          "nombre": "EMA (HMPC), Public statement on herbal medicinal products containing pulegone and menthofuran (2005)",
          "url": "https://www.ema.europa.eu/en/documents/scientific-guideline/public-statement-use-herbal-medicinal-products-containing-pulegone-and-menthofuran-first-version_en.pdf"
        }
      ]
    },
    {
      "id": "antibioticos_sin_receta",
      "nombre": "Antibióticos sin receta",
      "que_es": "Es tomar antibióticos que te vendieron sin receta, que te sobraron de otra vez o que le recetaron a otra persona.",
      "por_que_cuidado": "Tomarlos cuando no se necesitan, o tomar el que no es, hace que los microbios se vuelvan resistentes y que después el antibiótico ya no sirva cuando de verdad lo necesites, dice la Organización Mundial de la Salud. Por eso en México solo se pueden vender con receta médica.",
      "en_su_lugar": [
        "descanso_liquidos",
        "lavar_manos",
        "toser_en_codo"
      ],
      "texto_en_su_lugar": "Con el catarro, descansa y toma líquidos; si te dan un antibiótico, que sea con receta y sigue las indicaciones del personal de salud.",
      "secciones": [
        "defensas"
      ],
      "perfiles": [],
      "fuentes": [
        {
          "nombre": "OMS, Resistencia a los antibióticos (nota descriptiva, 31-jul-2020)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/antibiotic-resistance"
        },
        {
          "nombre": "OMS, Resistencia a los antimicrobianos (nota descriptiva, 16-jul-2026)",
          "url": "https://www.who.int/es/news-room/fact-sheets/detail/antimicrobial-resistance"
        },
        {
          "nombre": "DOF 27-may-2010, Acuerdo de lineamientos para la venta y dispensación de antibióticos",
          "url": "https://dof.gob.mx/nota_detalle.php?codigo=5144336&fecha=27/05/2010"
        }
      ]
    },
    {
      "id": "ashwagandha",
      "nombre": "Ashwagandha en cápsulas o en polvo",
      "que_es": "Es una planta de la India (Withania somnifera) que se vende como suplemento para los nervios, el sueño o el cansancio.",
      "por_que_cuidado": "La Secretaría de Salud la tiene en la lista de plantas que no se deben usar en tés ni en suplementos. El NCCIH de Estados Unidos dice que ha habido casos raros de daño al hígado y que no se debe usar en el embarazo.",
      "en_su_lugar": [
        "dormir_misma_hora",
        "respiracion_lenta",
        "caminar"
      ],
      "texto_en_su_lugar": "Para los nervios o el cansancio, duerme a la misma hora, respira despacio unos minutos y muévete cada día.",
      "secciones": [
        "sueno",
        "energia"
      ],
      "perfiles": [],
      "edad_minima": 12,
      "fuentes": [
        {
          "nombre": "DOF 15-dic-1999, Acuerdo de plantas prohibidas o permitidas para tés, Art. PRIMERO (Withania somnifera)",
          "url": "https://dof.gob.mx/nota_detalle_popup.php?codigo=4958062"
        },
        {
          "nombre": "NCCIH, Ashwagandha: usefulness and safety",
          "url": "https://www.nccih.nih.gov/health/ashwagandha"
        }
      ]
    }
  ]
};
