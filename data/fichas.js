/* Fichas educativas por categoría. Versión 0.2 (2026-09-19), tras revisión COFEPRIS (art. 174 RCSPyS, arts. 21-22 Reglamento de Publicidad).
   Reglas de redacción: sin "cura/previene/trata", sin nombres de enfermedad junto a un producto, sin datos anatómicos ni fenómenos fisiológicos
   ("estimula la síntesis de colágeno", "absorción de calcio"…). Solo se dice "está en estos alimentos" y "es un nutrimento que el cuerpo necesita".
   Sin cifras de nutrimentos hasta tener tabla de composición (INSP/USDA). Orden fijo: alimentos → hábito → suplemento (si aplica).
   nivel_evidencia: "alta" | "moderada" | "baja" | "sin evidencia". solo_mayores: true = no se muestra a menores de 18. */
window.MediBotData = window.MediBotData || {};
window.MediBotData.fichas = {
  "version": "0.2",
  "marco": { "nombre": "NOM-043-SSA2-2012, El Plato del Bien Comer", "url": "https://www.gob.mx/cms/uploads/attachment/file/138258/NOM-043-servicios-basicos-salud-educacion-alimentaria.pdf" },
  "advertencia_universal": "Los suplementos también pueden hacer daño y pelearse con tus medicinas. Dile siempre a tu médico todo lo que tomas.",
  "nota_si_no_hay": "Si en tu comunidad no consigues el suplemento, no pasa nada: la comida de la lista aporta lo mismo. Cuando se mencione una farmacia, pide el genérico, que es el más barato, y muestra esta hoja en tu centro de salud.",
  "categorias": [
    {
      "id": "defensas", "nombre": "Defensas", "icono": "i-leaf",
      "alimentos": [
        { "nombre": "Guayaba, naranja, limón, chile de agua", "nota": "Tienen vitamina C, un nutrimento que el cuerpo necesita. Una guayaba al día alcanza.", "fuente": { "nombre": "NIH ODS, Vitamina C (consumidor)", "url": "https://ods.od.nih.gov/factsheets/VitaminC-Consumer/" } },
        { "nombre": "Pepitas de calabaza, frijol, garbanzo", "nota": "Tienen zinc. Forman parte de una alimentación variada según el Plato del Bien Comer.", "fuente": { "nombre": "NIH ODS, Zinc (consumidor)", "url": "https://ods.od.nih.gov/factsheets/Zinc-Consumer/" } }
      ],
      "habito": "Lávate las manos con agua y jabón, duerme bien y toma agua. Eso es lo que más ayuda.",
      "suplementos": [
        { "nombre": "Vitamina C", "que_hace": "Es el mismo nutrimento de la guayaba, en pastilla.", "si_no_hay": "Guayaba, limón, naranja o chile de agua: dan lo mismo y más barato. En farmacia, tabletas genéricas de ácido ascórbico (vitamina C) de cualquier marca.", "evidencia": "Tomarla todos los días no hace que te enfermes menos; puede acortar un poco el malestar cuando ya estás mal.", "nivel_evidencia": "moderada", "advertencia": "No pases de 2,000 mg al día: puede dar piedras en el riñón.", "fuente": { "nombre": "NCCIH (NIH), enfoques complementarios: síntesis de evidencia", "url": "https://www.nccih.nih.gov/health/providers/digest/the-common-cold-and-complementary-health-approaches-science" } },
        { "nombre": "Zinc", "que_hace": "Nutrimento que el cuerpo necesita en cantidades pequeñas.", "si_no_hay": "Pepitas de calabaza, frijol y garbanzo. Primero la comida; si el centro de salud te lo indica, en farmacia se vende como sulfato de zinc genérico.", "evidencia": "Solo se ha visto beneficio en personas a quienes les falta zinc.", "nivel_evidencia": "moderada", "advertencia": "Más de 40 mg al día hace daño y baja el cobre. Se pelea con algunos antibióticos.", "fuente": { "nombre": "PMC (NIH), Zinc en la salud humana", "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC2277319/" } }
      ]
    },
    {
      "id": "digestion", "nombre": "Digestión", "icono": "i-leaf",
      "destacado": { "nombre": "Vida Suero Oral", "nota": "Si tienes diarrea o vómito, lo importante es no deshidratarte. El suero oral es gratuito en tu centro de salud. Pídelo.", "fuente": { "nombre": "IMSS, Enfermedad diarreica: hidratación", "url": "https://www.imss.gob.mx/salud-en-linea/enfermedad-diarreica" } },
      "alimentos": [
        { "nombre": "Frijol, nopal, tortilla de maíz, papaya", "nota": "Alimentos con fibra, parte de una alimentación variada según el Plato del Bien Comer.", "fuente": { "nombre": "MedlinePlus (NIH), Fibra en la dieta", "url": "https://medlineplus.gov/spanish/dietaryfiber.html" } },
        { "nombre": "Té de jengibre o de manzanilla", "nota": "Se usan tradicionalmente para el malestar leve. La evidencia es limitada.", "fuente": { "nombre": "PMC (NIH), Manzanilla: revisión", "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC2995283/" }, "advertencia": "Manzanilla: evítala si eres alérgico a la ambrosía. Jengibre: evítalo si tienes úlcera o tomas anticoagulantes." }
      ],
      "habito": "Toma agua limpia durante el día y come a tus horas. Si la diarrea dura más de 2 días o hay sangre, ve al centro de salud.",
      "suplementos": []
    },
    {
      "id": "sueno", "nombre": "Sueño y estrés", "icono": "i-moon",
      "alimentos": [
        { "nombre": "Cena ligera y sin café después de las 4 de la tarde", "nota": "El café tarda horas en salir del cuerpo.", "fuente": { "nombre": "MedlinePlus (NIH), Sueño saludable", "url": "https://medlineplus.gov/spanish/healthysleep.html" } },
        { "nombre": "Té de manzanilla o de tila", "nota": "Uso tradicional. No hay evidencia firme de que ayuden a dormir.", "fuente": { "nombre": "PMC (NIH), Manzanilla: revisión", "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC2995283/" } }
      ],
      "habito": "Acuéstate y levántate a la misma hora, y apaga la pantalla del celular una hora antes de dormir.",
      "suplementos": [
        { "nombre": "Melatonina", "solo_mayores": true, "que_hace": "Sustancia que el cuerpo produce de noche, en pastilla.", "si_no_hay": "No tiene sustituto de tienda. Lo que sí funciona sin costo: acostarse a la misma hora, cuarto oscuro y sin pantallas una hora antes; un té de manzanilla o tila.", "evidencia": "Ayuda un poco a dormirse antes. El efecto es pequeño.", "nivel_evidencia": "moderada", "advertencia": "Solo mayores de 18. Dosis de 0.5 a 5 mg. Cuidado si tomas anticoagulantes o tienes una enfermedad autoinmune.", "fuente": { "nombre": "PMC (NIH), Melatonina: revisión", "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11200646/" } },
        { "nombre": "Valeriana", "solo_mayores": true, "que_hace": "Planta de uso tradicional para dormir.", "si_no_hay": "Té de tila o de manzanilla (uso tradicional, igual de débil en evidencia). La rutina de sueño ayuda más que cualquier planta.", "evidencia": "Los estudios son de baja calidad; la evidencia es débil.", "nivel_evidencia": "baja", "advertencia": "Da sueño. No con alcohol ni con pastillas para dormir.", "fuente": { "nombre": "PubMed, Valeriana: metaanálisis", "url": "https://pubmed.ncbi.nlm.nih.gov/17145239/" } }
      ]
    },
    {
      "id": "energia", "nombre": "Energía", "icono": "i-leaf",
      "bandera_roja": "Si el cansancio llegó de golpe, viene con fiebre, bajaste de peso o te falta el aire: ve al centro de salud.",
      "alimentos": [
        { "nombre": "Frijol, lentejas, amaranto (alegría), huevo", "nota": "Tienen hierro y proteína. Con limón o naranja el hierro de las plantas se aprovecha mejor.", "fuente": { "nombre": "NIH ODS, Hierro (consumidor)", "url": "https://ods.od.nih.gov/factsheets/Iron-Consumer/" } },
        { "nombre": "Huevo, pollo, maíz y granos integrales", "nota": "Tienen vitaminas del grupo B, nutrimentos que el cuerpo necesita.", "fuente": { "nombre": "PMC (NIH), Vitaminas B: revisión", "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10542023/" } }
      ],
      "habito": "Si te cansas mucho, pide que te revisen la sangre en tu centro de salud. El estudio es gratuito. No tomes hierro en pastillas sin ese análisis: en exceso es tóxico.",
      "suplementos": [
        { "nombre": "Complejo B", "que_hace": "Vitaminas del grupo B en pastilla.", "si_no_hay": "Huevo, frijol, tortilla de maíz nixtamalizado y pollo. En farmacia, complejo B genérico (tabletas o ampolletas solo si lo indica el centro de salud).", "evidencia": "Solo se ha visto beneficio claro en personas a quienes les faltan.", "nivel_evidencia": "moderada", "advertencia": "B6 en dosis altas (más de 200 mg al día) daña los nervios.", "fuente": { "nombre": "PMC (NIH), Vitaminas B: revisión", "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10542023/" } }
      ]
    },
    {
      "id": "piel", "nombre": "Piel", "icono": "i-leaf",
      "alimentos": [
        { "nombre": "Guayaba, zanahoria, chile de agua, jitomate", "nota": "Tienen vitamina C y vitamina A, nutrimentos que el cuerpo necesita.", "fuente": { "nombre": "NIH ODS, Vitamina C (consumidor)", "url": "https://ods.od.nih.gov/factsheets/VitaminC-Consumer/" } },
        { "nombre": "Agua, sombrero y sombra", "nota": "Tomar agua y cuidarte del sol ayuda más a la piel que cualquier crema o cápsula cara.", "fuente": { "nombre": "MedlinePlus (NIH), Protección solar", "url": "https://medlineplus.gov/spanish/sunexposure.html" } }
      ],
      "habito": "Usa sombrero y busca la sombra entre 11 de la mañana y 4 de la tarde.",
      "suplementos": []
    },
    {
      "id": "huesos", "nombre": "Huesos", "icono": "i-leaf",
      "bandera_roja": "Dolor de huesos que no se quita o fracturas seguidas: ve al centro de salud.",
      "alimentos": [
        { "nombre": "Tortilla de maíz nixtamalizado", "nota": "Al preparar el maíz con cal (nixtamal) la tortilla gana calcio. Es el alimento con calcio más accesible de la región.", "fuente": { "nombre": "SADER, Del maíz a la tortilla y el proceso de nixtamalización", "url": "https://www.gob.mx/agricultura/articulos/del-maiz-a-la-tortilla-y-el-proceso-de-nixtamalizacion" } },
        { "nombre": "Frijol, quelites, hoja de amaranto, queso, leche", "nota": "Tienen calcio, un nutrimento que el cuerpo necesita.", "fuente": { "nombre": "MedlinePlus (NIH), Calcio en la dieta", "url": "https://medlineplus.gov/ency/patientinstructions/000490.htm" } },
        { "nombre": "Sol 10 a 15 minutos al día, huevo, pescado", "nota": "Ayudan a tener vitamina D, un nutrimento que el cuerpo necesita.", "fuente": { "nombre": "NIAMS (NIH), Calcio y vitamina D", "url": "https://www.niams.nih.gov/health-topics/calcium-and-vitamin-d-important-bone-health" } }
      ],
      "habito": "Camina y carga cosas ligeras: los huesos se fortalecen con el movimiento.",
      "suplementos": [
        { "nombre": "Calcio", "que_hace": "El mismo nutrimento de la tortilla y el queso, en pastilla.", "si_no_hay": "Tortilla de maíz nixtamalizado, queso, charales o sardina con espina, hoja de amaranto. En farmacia, carbonato de calcio genérico.", "evidencia": "Útil si comes poco calcio. Primero la comida.", "nivel_evidencia": "moderada", "advertencia": "Máximo 500 mg por toma. Puede estreñir. Se pelea con antibióticos y con medicinas para los huesos.", "fuente": { "nombre": "MedlinePlus (NIH), Calcio en la dieta", "url": "https://medlineplus.gov/ency/patientinstructions/000490.htm" } },
        { "nombre": "Vitamina D", "que_hace": "Nutrimento que también se obtiene del sol.", "si_no_hay": "Sol en brazos y piernas 10 a 15 minutos al día (antes de las 11 o después de las 4), huevo, sardina. En farmacia, vitamina D3 en gotas genérica.", "evidencia": "Recomendada en adultos mayores que reciben poco sol.", "nivel_evidencia": "moderada", "advertencia": "Más de 4,000 UI al día por mucho tiempo es tóxico.", "fuente": { "nombre": "NIAMS (NIH), Calcio y vitamina D", "url": "https://www.niams.nih.gov/health-topics/calcium-and-vitamin-d-important-bone-health" } }
      ]
    },
    {
      "id": "corazon", "nombre": "Corazón", "icono": "i-heart",
      "alimentos": [
        { "nombre": "Frijol, aguacate, pescado (mojarra, sardina), nuez, linaza", "nota": "Grasas y proteínas de una alimentación variada según el Plato del Bien Comer.", "fuente": { "nombre": "NIH ODS, Omega-3 (consumidor)", "url": "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-Consumer/" } },
        { "nombre": "Menos sal, menos refresco, más caminata", "nota": "Lo que más le ayuda al corazón no viene en frasco.", "fuente": { "nombre": "OMS, Alimentación sana", "url": "https://www.who.int/es/news-room/fact-sheets/detail/healthy-diet" } }
      ],
      "habito": "Camina 30 minutos al día y pide que te tomen la presión en tu centro de salud una vez al año.",
      "suplementos": [
        { "nombre": "Omega-3 en cápsula", "que_hace": "Las mismas grasas del pescado, en cápsula.", "si_no_hay": "Sardina enlatada (la más barata), chía o linaza molida, nuez. Con dos latas de sardina a la semana no hace falta la cápsula.", "evidencia": "Efecto modesto. Mejor comer pescado.", "nivel_evidencia": "moderada", "advertencia": "Más de 3 g al día aumenta el sangrado. Cuidado si tomas anticoagulantes.", "fuente": { "nombre": "NIH ODS, Omega-3 (consumidor)", "url": "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-Consumer/" } }
      ]
    },
    {
      "id": "vista", "nombre": "Vista", "icono": "i-leaf",
      "bandera_roja": "Si de repente ves borroso o las líneas rectas se ven chuecas: ve hoy mismo con personal de salud.",
      "alimentos": [
        { "nombre": "Quelites, verdolagas, espinaca, zanahoria, yema de huevo", "nota": "Verduras de hoja verde y alimentos con vitamina A, parte de una alimentación variada.", "fuente": { "nombre": "PMC (NIH), Luteína y zeaxantina: revisión", "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC5611842/" } }
      ],
      "habito": "Revísate la vista en tu centro de salud cada año, sobre todo si tienes el azúcar alta.",
      "suplementos": []
    }
  ]
};
