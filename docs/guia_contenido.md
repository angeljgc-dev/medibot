# Guía para editar el contenido (equipo Medirobot)

Todo el texto clínico y educativo vive en `data/*.js`. No hace falta tocar `js/`. Después de cada cambio, ejecuta el lint:

```bash
python tools/lint_contenido.py
```

Si el lint falla, no publiques: dice exactamente qué frase y por qué.

## Archivos

| Archivo | Qué contiene | Reglas |
|---|---|---|
| `data/textos.js` | Bienvenida, aviso de privacidad, textos de cada nivel, safety netting, teléfonos, limitaciones de sensores, leyendas COFEPRIS | La palabra "diagnóstico" solo negada. Leyendas en MAYÚSCULAS. |
| `data/rangos.js` | Grupos de edad y bandas verde/ámbar/rojo/nd por parámetro, con `fuente.url` | Una fuente oficial por grupo. `nd` = mostrar sin clasificar. `prisa: "hoy"` cambia el texto del ámbar. |
| `data/alarma.js` | Preguntas sí/no con nivel `rojo`, `ambar` o `apoyo` | Lenguaje de 6.º de primaria. Máximo 8 rojas. Cada una con `fuente.url`. |
| `data/fichas.js` | Categorías con `alimentos` → `habito` → `suplementos` | Alimentos siempre primero. Sin "cura / previene / trata", sin nombres de enfermedad junto a un producto, sin datos anatómicos ("absorción de calcio"). Cada suplemento con `evidencia`, `nivel_evidencia`, `advertencia` y `fuente.url`. `solo_mayores: true` oculta el ítem a menores de 18. |

## Vocabulario

| No escribas (referido a MediBot) | Escribe |
|---|---|
| diagnostica, detecta, usted tiene, análisis, chequeo, preciso, certificado, "estás sano" | orienta, medimos, tu medida salió fuera del rango, medición con sensores, aproximado, "no encontramos señales de alarma hoy" |

| No escribas (referido a un alimento o suplemento) | Escribe |
|---|---|
| cura, previene, trata, alivia, combate, controla, refuerza las defensas, quema grasa, "para la diabetes/anemia/…", "estimula la síntesis de colágeno", "ayuda a absorber calcio", afrodisíaco, natural = seguro | "es un nutrimento que el cuerpo necesita", "está en estos alimentos", "forma parte de una alimentación variada", "los suplementos también pueden hacer daño" |

Fundamento: art. 174 del Reglamento de Control Sanitario de Productos y Servicios y arts. 21–22 del Reglamento de la Ley General de Salud en materia de publicidad. MediBot no comercializa nada, así que **lo adoptamos voluntariamente como estándar de cuidado**, no por obligación. Decirlo así ante el jurado.

## Cifras

Mientras no haya tabla de composición de alimentos (INSP o USDA FoodData Central), **no escribas cifras de nutrimentos** ("aporta 40 mg"). Escribe "tiene vitamina C". Una afirmación cualitativa con fuente es defendible; una cifra sin fuente es exactamente el pecado del aparato que criticamos.

## Fuentes aceptadas

OMS/OPS, Secretaría de Salud, IMSS, CENETEC (GPC), CONASAMA, COFEPRIS, DOF, NIH (MedlinePlus, ODS, NCCIH, NIAMS, PMC), FDA, NICE (si abre), Cochrane. **No** blogs, tiendas, clínicas privadas ni sitios de suplementos.

## Actualizar versión

Al cambiar contenido: sube `version` en el archivo, actualiza `consultado` en `rangos.js` si volviste a verificar URLs, y cambia el sufijo `?v=` en `index.html` para que el navegador del quiosco no use caché.
