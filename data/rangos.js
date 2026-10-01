/* Rangos de referencia por parámetro y grupo de edad.
   Versión 0.2 (2026-09-19), revisada contra fuentes oficiales (ver docs/reglas_orientacion.md).
   Cada banda: { nivel: "verde" | "ambar" | "rojo" | "nd", min, max, prisa?, etiqueta? }. Inclusivas; gana la primera que coincide.
   "nd" = se muestra el valor sin clasificar (no participa en el semáforo).
   "prisa": "hoy" cambia el texto del ámbar de "en los próximos días" a "hoy mismo". */
window.MediBotData = window.MediBotData || {};
window.MediBotData.rangos = {
  "version": "0.2",
  "consultado": "2026-09-19",
  "grupos": [
    { "id": "bebe",    "nombre": "Bebé menor de 3 meses", "sub": "no se mide aquí", "no_medir": true },
    { "id": "nino",    "nombre": "3 meses a 11 años",      "sub": "se muestran valores sin semáforo" },
    { "id": "12a17",   "nombre": "12 a 17 años",           "sub": "adolescente" },
    { "id": "18a59",   "nombre": "18 a 59 años",           "sub": "adulto" },
    { "id": "60mas",   "nombre": "60 años o más",          "sub": "adulto mayor" }
  ],
  "mensaje_bebe": "Los bebés muy pequeños se revisan solo con personal de salud. Si el bebé se siente caliente, no come o está muy decaído, ve hoy mismo al centro de salud o llama al 911.",

  "parametros": {
    "fc": {
      "nombre": "Pulso en reposo",
      "unidad": "latidos por minuto",
      "icono": "i-heart",
      "min_valido": 30, "max_valido": 220,
      "discordancia": 10,
      "nota_general": "Si haces deporte seguido, es normal tener el pulso más bajo (40 a 60).",
      "por_grupo": {
        "nino": {
          "clasificar": false,
          "nota": "En niñas y niños el pulso cambia con la edad: 1 a 2 años 80–130; 3 a 4 años 80–120; 5 a 6 años 75–115; 7 a 9 años 70–110; 10 años o más 60–100. Coméntalo en tu centro de salud.",
          "fuente": { "nombre": "MedlinePlus (NIH), Pulso", "url": "https://medlineplus.gov/spanish/ency/article/003399.htm" }
        },
        "todos": {
          "bandas": [
            { "nivel": "ambar", "min": 0,   "max": 49,  "prisa": "hoy" },
            { "nivel": "ambar", "min": 50,  "max": 59 },
            { "nivel": "verde", "min": 60,  "max": 100 },
            { "nivel": "ambar", "min": 101, "max": 120 },
            { "nivel": "ambar", "min": 121, "max": 999, "prisa": "hoy" }
          ],
          "rango_texto": "esperado 60 a 100 latidos por minuto",
          "fuente": { "nombre": "MedlinePlus (NIH), Pulso", "url": "https://medlineplus.gov/spanish/ency/article/003399.htm" }
        }
      }
    },

    "spo2": {
      "nombre": "Oxígeno en la sangre",
      "unidad": "%",
      "icono": "i-heart",
      "min_valido": 70, "max_valido": 100,
      "discordancia": 3,
      "requerido_para_verde": true,
      "por_grupo": {
        "nino": {
          "bandas": [
            { "nivel": "rojo", "min": 0,  "max": 89 },
            { "nivel": "nd",   "min": 90, "max": 100 }
          ],
          "nota": "En niñas y niños mostramos el valor sin semáforo; solo avisamos si está por debajo de 90.",
          "rango_texto": "esperado 95 % o más",
          "fuente": { "nombre": "OMS, Manual de oximetría de pulso", "url": "https://cdn.who.int/media/docs/default-source/patient-safety/pulse-oximetry/who-ps-pulse-oxymetry-training-manual-en.pdf" }
        },
        "todos": {
          "bandas": [
            { "nivel": "rojo",  "min": 0,  "max": 89 },
            { "nivel": "ambar", "min": 90, "max": 94 },
            { "nivel": "verde", "min": 95, "max": 100 }
          ],
          "rango_texto": "esperado 95 % o más",
          "fuente": { "nombre": "OMS, Manual de oximetría de pulso", "url": "https://cdn.who.int/media/docs/default-source/patient-safety/pulse-oximetry/who-ps-pulse-oxymetry-training-manual-en.pdf" }
        }
      },
      "fuente_limitaciones": { "nombre": "FDA, Pulse Oximeter Basics", "url": "https://www.fda.gov/consumers/consumer-updates/pulse-oximeter-basics" },
      "nota_altitud": "Aquí estamos alto y eso baja un poco el número; por eso pedimos que te revisen, no que te asustes."
    },

    "temp": {
      "nombre": "Temperatura axilar (aproximada)",
      "unidad": "°C",
      "icono": "i-temp",
      "min_valido": 34.0, "max_valido": 41.5,
      "discordancia": 0.6,
      "por_grupo": {
        "nino": {
          "bandas": [
            { "nivel": "rojo",  "min": 0,    "max": 35.0 },
            { "nivel": "nd",    "min": 35.1, "max": 37.1 },
            { "nivel": "ambar", "min": 37.2, "max": 99 }
          ],
          "nota": "En niñas y niños, 37.2 °C en la axila ya cuenta como fiebre. Si además está muy decaído, no bebe o le cuesta respirar, ve hoy mismo.",
          "rango_texto": "fiebre desde 37.2 °C en la axila",
          "fuente": { "nombre": "MedlinePlus (NIH), Fiebre", "url": "https://medlineplus.gov/spanish/ency/article/003090.htm" }
        },
        "todos": {
          "bandas": [
            { "nivel": "rojo",  "min": 0,    "max": 35.0 },
            { "nivel": "ambar", "min": 35.1, "max": 35.4 },
            { "nivel": "verde", "min": 35.5, "max": 37.1 },
            { "nivel": "ambar", "min": 37.2, "max": 38.4 },
            { "nivel": "ambar", "min": 38.5, "max": 39.4, "prisa": "hoy" },
            { "nivel": "rojo",  "min": 39.5, "max": 99 }
          ],
          "rango_texto": "esperado 35.5 a 37.1 °C en la axila",
          "fuente": { "nombre": "MedlinePlus (NIH), Fiebre e Hipotermia", "url": "https://medlineplus.gov/spanish/ency/article/003090.htm" },
          "fuente_2": { "nombre": "MedlinePlus (NIH), Hipotermia", "url": "https://medlineplus.gov/spanish/ency/article/000038.htm" }
        }
      }
    },

    "imc": {
      "nombre": "Índice de masa corporal (IMC)",
      "unidad": "kg/m²",
      "icono": "i-scale",
      "min_valido": 8, "max_valido": 80,
      "fuera_semaforo": true,
      "nota_general": "Esto no es una urgencia. Coméntalo en tu próxima consulta.",
      "por_grupo": {
        "nino":  { "clasificar": false, "nota": "En menores de 18 años el IMC se lee con tablas por edad y sexo. Pídelas en tu centro de salud.", "fuente": { "nombre": "OMS, Obesidad y sobrepeso", "url": "https://www.who.int/es/news-room/fact-sheets/detail/obesity-and-overweight" } },
        "12a17": { "clasificar": false, "nota": "En menores de 18 años el IMC se lee con tablas por edad y sexo. Pídelas en tu centro de salud.", "fuente": { "nombre": "OMS, Obesidad y sobrepeso", "url": "https://www.who.int/es/news-room/fact-sheets/detail/obesity-and-overweight" } },
        "18a59": {
          "bandas": [
            { "nivel": "ambar", "min": 0,    "max": 15.9, "etiqueta": "Delgadez severa", "prisa": "semana" },
            { "nivel": "nd",    "min": 16.0, "max": 18.4, "etiqueta": "Bajo peso" },
            { "nivel": "nd",    "min": 18.5, "max": 24.9, "etiqueta": "Peso saludable" },
            { "nivel": "nd",    "min": 25.0, "max": 29.9, "etiqueta": "Sobrepeso" },
            { "nivel": "nd",    "min": 30.0, "max": 99,   "etiqueta": "Obesidad" }
          ],
          "rango_texto": "referencia OMS: 18.5 a 24.9 kg/m²",
          "fuente": { "nombre": "OMS, Obesidad y sobrepeso", "url": "https://www.who.int/es/news-room/fact-sheets/detail/obesity-and-overweight" },
          "fuente_2": { "nombre": "OMS, Delgadez severa (IMC < 16)", "url": "https://www.who.int/data/nutrition/nlis/info/malnutrition-in-women" }
        },
        "60mas": {
          "bandas": [
            { "nivel": "ambar", "min": 0,    "max": 21.9, "etiqueta": "Bajo peso para tu edad" },
            { "nivel": "nd",    "min": 22.0, "max": 22.9, "etiqueta": "Límite bajo" },
            { "nivel": "nd",    "min": 23.0, "max": 28.0, "etiqueta": "Rango recomendado para adultos mayores" },
            { "nivel": "nd",    "min": 28.1, "max": 99,   "etiqueta": "Por arriba del rango recomendado" }
          ],
          "rango_texto": "referencia OPS/OMS adultos mayores: 23 a 28 kg/m²",
          "fuente": { "nombre": "OPS/OMS, Guía clínica APS adultos mayores (Secretaría de Salud)", "url": "http://www.cenaprece.salud.gob.mx/programas/interior/adulto/descargas/pdf/GuiaClinicaAPS2004.pdf" }
        }
      }
    }
  }
};
