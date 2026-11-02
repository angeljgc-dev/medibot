# Esquema del corpus (`data/corpus.js`)

El archivo define `window.MediBotData.corpus = { version, revisado, temas: [...], entradas: [...] }` en JSON válido (mismo patrón que `data/fichas.js`, para que el lint lo lea).

## Temas
`temas` es la lista que ve la persona en "¿Qué te gustaría cuidar?". Cada tema: `{ "id", "nombre", "icono", "dibujo" }`. `dibujo` es un emoji o nombre de icono distinto por tema (la revisión UX encontró 6 temas con el mismo icono de hoja). Temas mínimos: `defensas`, `digestion`, `sueno`, `energia`, `huesos_articulaciones`, `corazon`, `piel`, `vista`, `tos_garganta`, `orina`. Se pueden agregar otros si el corpus lo justifica.

## Entrada
```json
{
  "id": "manzanilla",
  "tipo": "planta",                        // "alimento" | "planta" | "suplemento" | "habito"
  "nombre": "Manzanilla",
  "nombre_cientifico": "Matricaria chamomilla",   // obligatorio en plantas
  "temas": ["digestion", "sueno"],
  "para": "Se usa tradicionalmente para aliviar molestias leves del estómago, como gases.",
  "como": "Té: 1 cucharadita de flor seca en una taza de agua caliente, tapada 5 minutos. Hasta 3 tazas al día.",
  "cuanto_ninos": "De 2 a 6 años: media cucharadita por taza.",  // opcional; solo si la fuente da dosis por edad
  "ayuda": 1,                              // 1 = ayuda poco o es solo tradición; 2 = algo; 3 = bastante (solo con evidencia bien establecida)
  "evidencia": "Uso tradicional reconocido; no está comprobado que cure.",
  "aviso": "No la tomes si te da alergia la ambrosía, el cempasúchil o la margarita.",
  "excluir": {
    "embarazo": false,
    "lactancia": false,
    "edad_minima": 0.5,                    // años; la persona más joven que puede usarla según la fuente
    // "edad_maxima": 5,                   // opcional (fase 2), exclusiva: apta solo si edad < edad_maxima
    "medicinas": ["anticoagulante"],       // claves de medicinas (abajo) con las que choca
    "condiciones": []                       // "vesicula", "higado", "rinon_poca_agua", "acidez", "alergia_asteraceas"
  },
  "leyenda_embarazo": false,               // true para plantas del Art. SEGUNDO del Acuerdo de 1999 (ruda, salvia, perejil…)
  "donde": "mercado",                      // "casa" | "mercado" | "tienda" | "farmacia" | "huerto" | "centro_salud" (gratis, pero hay que ir)
  "costo": 1,                              // 1 barato, 2 medio, 3 caro
  "alternativas": ["hierbabuena", "hinojo", "comer_despacio"],  // ids del mismo corpus, mismo propósito, de más fácil a más difícil de conseguir
  "si_no_hay": "Si no hay manzanilla, el té de hierbabuena o de hinojo se usa igual.",
  "fuentes": [ { "nombre": "EMA, monografía de manzanilla", "url": "https://..." } ]
}
```

### Campos opcionales de la fase 2 (decisión de diseño del 2026-11-01)
| Campo | Dónde va | Qué hace |
|---|---|---|
| `edad_maxima` | **dentro de `excluir`**, junto a `edad_minima` | Exclusiva: la entrada es apta solo si edad < `edad_maxima` (por ejemplo `jugar_1a4`: `edad_minima` 1, `edad_maxima` 5). La edad del perfil es el límite inferior de su grupo (18a59 → 18; 6a11 → 6). El lint exige que sea un número mayor que `edad_minima`. |
| `ayuda_por_tema` | raíz de la entrada | `{ tema: 1..3 }`: evidencia para ESE tema; los temas que no aparecen usan `ayuda`. Cada clave debe ser uno de sus `temas`. |
| `prioriza_si` | raíz de la entrada | Lista de rasgos del perfil que suben la entrada a igual evidencia (+15): `fiebre`, `imc_alto` (IMC ≥ 30, 18 años o más), `imc_bajo` (< 18.5 en 18a59, < 22 en 60mas), `embarazo`, `nino` (3 meses a 11 años, o si la consulta es para un niño), `mayor60`, `azucar`, `presion`. |

Orden dentro de una sección (`js/recomendaciones.js`, `puntaje`): 100 × evidencia para el tema + 20 × pertinencia (2 si es su primer tema) + 15 × `prioriza_si` + 8 × tipo (alimento y hábito 2, planta 1, suplemento 0) + 4 × acceso (casa 2; huerto, mercado, tienda o centro de salud 1; farmacia 0; +1 si `costo` = 1) − mín(20, 10 × avisos que aplican a esa persona); desempate por costo y luego por id. Se muestran máx. 4 por molestia y 3 por situación, máx. 2 por tipo, 1 planta, 1 suplemento y siempre ≥ 1 alimento o hábito.

## Secciones (fase 2)
`temas` tiene las 18 secciones y `grupos` las 5 zonas del cuerpo (`{ id, nombre, dibujo }`). Campos opcionales de cada sección:
- `clase`: `"situacion"` (se sugiere sola según el perfil; 3 tarjetas) o `"molestia"` (la elige la persona; 4 tarjetas).
- `grupo`: id de `grupos`. `embarazo`, `ninos` y `mayores` no tienen grupo: solo se sugieren.
- `tipos_permitidos`: tipos de tarjeta que caben en la sección.
- `ocultar_grupos`: grupos de edad (`bebe`, `nino`, `12a17`, `18a59`, `60mas`) que no la ven.
- `sugerir_si` + `prioridad`: rasgos que la sugieren (`embarazo`, `lactancia`, `nino`, `mayor60`, `azucar`, `presion`, `corazon`, `imc_alto`…); se sugieren máx. 2, por prioridad.
- `cuando_ir: { texto, fuentes: [{ nombre, url }] }`: franja arriba de las tarjetas de la sección; no cuenta como opción.

Una sección se oculta si tiene menos de 3 opciones aptas para el perfil.

## Claves de medicinas (pregunta "¿Tomas alguna medicina todos los días?")
| Clave | Qué le preguntamos a la persona | Ejemplos |
|---|---|---|
| `presion` | Pastilla para la presión | enalapril, captopril, losartán, hidroclorotiazida |
| `azucar` | Pastilla o insulina para el azúcar | metformina, glibenclamida, insulina |
| `anticoagulante` | Para la sangre aguada o aspirina diaria | warfarina, acenocumarol, aspirina, clopidogrel |
| `corazon` | Para el corazón | digoxina |
| `tiroides` | Para la tiroides | levotiroxina |
| `nervios_sueno` | Para dormir o para los nervios | clonazepam, sertralina, fluoxetina |
| `convulsiones` | Para convulsiones o epilepsia | fenitoína, carbamazepina, valproato |
| `anticonceptivo` | Pastillas o inyección para no embarazarse | |
| `ninguna` | Ninguna | |
| `no_se` | No sé | se trata como si tomara todas: se excluye todo lo que choque con alguna |

## Reglas de contenido
1. Solo datos con fuente oficial: EMA (Committee on Herbal Medicinal Products), NCCIH, NIH ODS, OMS, Secretaría de Salud, COFEPRIS, USDA FoodData Central, NAP/DRI. Fuentes débiles (UTEP, blogs) solo para AVISOS de seguridad, nunca para decir que algo ayuda.
2. Plantas: redacción de uso tradicional ("se usa tradicionalmente para aliviar molestias leves de…"), nunca "cura", "previene", "trata", ni nombres de enfermedades. Molestias leves sí (gases, tos con resfriado, dolor de garganta, nervios leves, dormir).
3. Suplementos: sin molestias ni enfermedades (art. 174 RCSPS), solo "es un nutrimento que…" y para quién NO es.
4. Excluir por completo las plantas del Art. PRIMERO del Acuerdo de plantas prohibidas para tés (DOF 15-dic-1999): epazote, gobernadora, árnica de uso interno, artemisa, ajenjo, poleo, hipérico, toloache, ricino, consuelda, anís estrella japonés, entre otras.
5. Cuando la fuente dice "no recomendado en embarazo" o "en menores de 12" se marca la exclusión correspondiente (la app no lo muestra, no lo muestra "con advertencia").
6. Toda entrada recomendable tiene al menos 2 alternativas válidas en el corpus, y al menos una alternativa es un alimento o un hábito.
7. Lenguaje de 6.º de primaria: sin "nutrimento" en lo que se lee en pantalla (usar "lo que el cuerpo necesita"), sin "UI", "mg" solo en "como" si es imprescindible, sin "anticoagulante" en pantalla (decir "medicina para la sangre aguada o aspirina").

## Campos de la ronda de correcciones (2026-11-02)

| Campo | Dónde | Qué hace |
|---|---|---|
| `sin_cambio` | raíz de la entrada, `true` | La entrada no tiene sustituto (vacunas, control prenatal, dar pecho, ir al centro de salud…). «No lo encuentro» no ofrece alternativas: dice «Esta no tiene cambio» y lee `si_no_hay`. Su lista `alternativas` queda vacía. |
| `avisos_perfil` | raíz, `{ rasgo: texto }` | Avisos que solo le tocan a una persona con ese rasgo (`embarazo`, `lactancia`, `nino`, `mayor60`). El campo `aviso` queda solo para lo que vale para todos. Igual que `avisos_medicina`, pero por perfil. |
| `actividad` | raíz, `true` | Marca la actividad física (OMS 2020/2019). En las secciones donde hay alguna apta, la selección incluye al menos una (criterio 11). |

Regla de contenido para `alternativas`: cada alternativa debe servir **para lo mismo** que la tarjeta (si no hay guayaba, otra fruta con vitamina C; si no hay calor en la panza, un baño tibio). Si nada la sustituye, `sin_cambio: true`. Las alternativas respetan `tipos_permitidos` de las secciones de la tarjeta.
