# Reglas de orientación de MediBot v0.2

Fecha: 2026-09-19. Cada umbral tiene su fuente oficial; todas las URL se abrieron y revisaron esa fecha. Los datos viven en `data/rangos.js` y `data/alarma.js`; aquí se explica el porqué.

## 1. Grupos de edad

| Grupo | Qué hace MediBot |
|---|---|
| Bebé menor de 3 meses | No se mide. Pantalla única que remite a personal de salud hoy mismo. Fuente: [MedlinePlus, Cuando su bebé o lactante tenga fiebre](https://medlineplus.gov/spanish/ency/patientinstructions/000319.htm) |
| 3 meses a 11 años | Se miden y muestran los valores con el rango de su edad, **sin semáforo numérico** (solo se avisa SpO2 < 90 y temperatura ≤ 35 o ≥ 37.2 axilar). El resultado nunca es verde: se remite al centro de salud. |
| 12 a 17 años | Semáforo completo con umbrales de adulto para pulso, SpO2 y temperatura. IMC sin clasificar. |
| 18 a 59 años | Semáforo completo. |
| 60 años o más | Semáforo completo; IMC con banda distinta (23–28). Texto adicional: una infección puede cursar sin fiebre. |

No se pregunta el sexo: ningún umbral de v0.2 lo usa. Se pregunta embarazo (opcional, 12–59) solo para añadir la línea "acude a tu control prenatal".

## 2. Umbrales

### Pulso en reposo (MedlinePlus NIH, [Pulso](https://medlineplus.gov/spanish/ency/article/003399.htm))
- Verde 60–100 lpm. Ámbar < 60 o > 100. Ámbar con prisa "hoy" si < 50 o > 120. **No hay rojo por pulso solo**: un sensor de consumo confunde movimiento con taquicardia.
- Niños: se muestra el rango por edad (1–2 a 80–130; 3–4 a 80–120; 5–6 a 75–115; 7–9 a 70–110; ≥10 a 60–100) sin clasificar.

### Oxígeno en la sangre (OMS, [Pulse Oximetry Training Manual](https://cdn.who.int/media/docs/default-source/patient-safety/pulse-oximetry/who-ps-pulse-oxymetry-training-manual-en.pdf); FDA, [Pulse Oximeter Basics](https://www.fda.gov/consumers/consumer-updates/pulse-oximeter-basics))
- Verde ≥ 95 %. Ámbar 90–94 %. Rojo < 90 % (emergencia clínica según la OMS).
- 90–94 es ámbar no porque 93 sea patológico sino porque un oxímetro de consumo que marca 93 no puede descartar un 89 real (la FDA reconoce sobreestimación en piel oscura). El texto en pantalla lo dice así.
- Altitud: por encima de 1 500 m el ámbar añade "aquí estamos alto y eso baja un poco el número". Se configura en el panel de operador. Referencia: recién nacidos sanos a 2 240 m con SpO2 media 93.5 % ([Gac Méd Méx 2008](https://www.anmm.org.mx/GMM/2008/n3/18_vol_144_n3.pdf)).

### Temperatura axilar aproximada (MedlinePlus NIH, [Fiebre](https://medlineplus.gov/spanish/ency/article/003090.htm) e [Hipotermia](https://medlineplus.gov/spanish/ency/article/000038.htm))
- El sensor de contacto no es termómetro clínico. Se mide en axila, sostenido, y se rotula "aproximada".
- Adultos y 12–17: verde 35.5–37.1; ámbar 35.1–35.4 y 37.2–38.4; ámbar "hoy" 38.5–39.4; rojo ≤ 35.0 o ≥ 39.5. Lecturas fuera de 34.0–41.5 se consideran artefacto (inválidas).
- Niños 3 m–11 a: ámbar desde 37.2; rojo ≤ 35.0; el resto se muestra sin clasificar.
- La fiebre sola no es urgencia: la urgencia la marcan los síntomas acompañantes (preguntas de alarma).

### IMC (OMS, [Obesidad y sobrepeso](https://www.who.int/es/news-room/fact-sheets/detail/obesity-and-overweight); OMS [delgadez severa](https://www.who.int/data/nutrition/nlis/info/malnutrition-in-women); OPS/OMS [Guía clínica APS adultos mayores](http://www.cenaprece.salud.gob.mx/programas/interior/adulto/descargas/pdf/GuiaClinicaAPS2004.pdf))
- **Fuera del semáforo.** Se muestra en un panel aparte con la frase "Esto no es una urgencia. Coméntalo en tu próxima consulta". Motivo: con la prevalencia real de sobrepeso, un ámbar en IMC 25 pintaría de ámbar a casi toda la fila y el ámbar dejaría de significar algo.
- Excepciones que sí suben a ámbar: IMC < 16 en 18–59 (delgadez severa, "esta semana"); IMC < 22 en 60 o más (riesgo de desnutrición).
- Menores de 18: sin clasificar (se usan tablas por edad y sexo en el centro de salud).

## 3. Señales de alarma (`data/alarma.js`)

Rojas (saltan directo al resultado): dolor de pecho con irradiación ([IMSS, Infarto](https://www.imss.gob.mx/salud-en-linea/infarto)); falta de aire en reposo o cianosis ([MedlinePlus, Dificultad respiratoria](https://medlineplus.gov/spanish/ency/article/003075.htm)); déficit neurológico súbito ([Secretaría de Salud, infarto cerebral](https://www.gob.mx/salud/prensa/415-en-mexico-se-registran-alrededor-de-170-mil-infartos-cerebrales)); desmayo, convulsión o confusión ([MedlinePlus, Fiebre: cuándo llamar al 911](https://medlineplus.gov/spanish/ency/article/003090.htm)); sangrado que no para o vómito con sangre ([MedlinePlus, Sangrado](https://medlineplus.gov/spanish/ency/article/000045.htm)); en niños: no bebe, vomita todo, letárgico ([OPS/OMS AIEPI](https://iris.paho.org/bitstream/handle/10665.2/49287/si-clinico2.pdf)).

Ámbar: tos > 2 semanas ([IMSS, Tuberculosis](https://www.imss.gob.mx/salud-en-linea/tuberculosis-pulmonar)); pérdida de peso sin querer (misma fuente); molestia o herida > 2 semanas (criterio del proyecto derivado del anterior; sin fuente oficial única, declararlo si preguntan).

Apoyo (no cambia el semáforo): ofrecimiento respetuoso de la [Línea de la Vida 800 911 2000](https://www.gob.mx/conasama/articulos/linea-de-la-vida-800-911-2000). No es un tamizaje de suicidio: un quiosco no debe cribar eso. El número aparece en todos los resultados y en el pie de página.

## 4. Algoritmo (`js/reglas.js`)

1. nivel := VERDE.
2. Cualquier pregunta roja con "sí" → ROJO. Nada de lo que sigue lo baja (antirrebaja).
3. Medición con señal mala, fuera del rango físico o con lecturas discordantes → NO VÁLIDA (no neutra).
4. nivel := máximo entre nivel, mediciones válidas y preguntas ámbar.
5. Coherencia: síntoma ámbar cuya medición relacionada no es válida → se informa y se mantiene al menos ámbar.
6. Suficiencia: VERDE solo si pulso y oxígeno son válidos y están en rango y ninguna pregunta salió "sí". Si no, ÁMBAR con el banner "No pudimos medirte bien" (o, en niños, "no damos semáforo por números").
7. Repetición (en la pantalla de mediciones): un valor fuera de rango se mide una segunda vez; si difieren más de 10 lpm, 3 puntos de SpO2 o 0.6 °C, se pide una tercera; tres discordantes → inválida. Se conserva la **peor** lectura válida, nunca la última. Máximo 3 intentos.

## 5. Combinaciones probadas (2026-09-19, en el navegador con `MediBotReglas.evaluar`)

| Caso | Resultado |
|---|---|
| Todo omitido, todas las preguntas "no" | Ámbar + datos incompletos (antes salía verde) |
| Pulso 72 y SpO2 97 válidos | Verde |
| Tos > 2 semanas con SpO2 omitida | Ámbar, motivo "además no pudimos medir bien: oxígeno" |
| SpO2 92 | Ámbar |
| Pulso 125 | Ámbar con prisa "hoy" |
| SpO2 88 | Rojo |
| Niño con pulso 118, SpO2 97, temp 37.5 | Ámbar (por temperatura); pulso y SpO2 sin clasificar |
| 60+ con IMC 20.8 | Ámbar (bajo peso para su edad) |
| Adulto con IMC 29.4 | Verde; IMC "Sobrepeso" en panel aparte |
| Temperatura inválida, resto normal | Verde (temperatura no es requisito de verde; se informa como no válida) |
| Dolor de pecho "sí" con mediciones normales | Rojo |
| Temperatura 39.6 | Rojo |
| Escenario simulado "oxígeno bajo": 1.ª lectura 90 → pide confirmar; 2.ª lectura 89 → conserva 89 | Rojo |

## 6. Lo que no está verificado (decir tal cual ante el jurado)

- El criterio genérico "molestia > 2 semanas" solo tiene fuente oficial para tos (IMSS).
- No se incluyó pregunta de alarma obstétrica por falta de fuente oficial mexicana verificada (buscar GPC CENETEC de preeclampsia antes de añadirla).
- Las páginas de NIH ODS y PubMed responden 403 a robots; las URL existen y deben abrirse a mano para copiar cifras.
- Contenido nutricional de alimentos oaxaqueños: sin cifras hasta tener tabla de composición (INSP / USDA FoodData Central). Por eso las fichas dicen "tiene" y no "aporta X mg".
- Encuadre de software no regulado como dispositivo médico: inferencia razonable a partir de la Ley General de Salud (no hay exclusión expresa).
