# Voz y accesibilidad para personas que no leen

Fecha: 2026-09-23. Objetivo: que alguien que no sabe leer pueda usar MediBot completo: escuchar lo que dice la pantalla y responder sin leer.

## Lo que hace la app (implementado)

**1. La pantalla habla.** Botón **Escuchar** (altavoz) arriba en todas las pantallas: lee en voz alta el título, la explicación y las opciones, y termina diciendo qué botón tocar. Usa las voces de Windows en español de México (Sabina o Raúl), que vienen instaladas y funcionan **sin internet**. En la pantalla de preguntas no lee todas de golpe: lee una pregunta, espera la respuesta y lee la siguiente.

**2. Modo voz permanente.** En el panel del operador (pantalla de inicio): casilla "Leer en voz alta cada pantalla". Con ella activada, cada pantalla se lee sola al aparecer, sin tocar nada. Recomendado para la comunidad.

**3. Responder sin leer.** Tres formas, todas equivalentes a tocar la pantalla:

| Forma | Sí | No | Siguiente | Atrás | Repetir lectura |
|---|---|---|---|---|---|
| Botones físicos en el ESP32 (verde, rojo, azul) | verde corto | rojo corto | verde 1 s | rojo 1 s | azul |
| Botonera USB o teclado | S o + | N o − | Enter o → | ← | R o espacio |
| Pantalla táctil | Sí | No | Continuar | Atrás | Escuchar |

En el cuestionario, "sí" y "no" contestan la pregunta que se acaba de leer. Fuera del cuestionario, "sí" equivale a Continuar y "no" a Atrás. Con esto una persona puede hacer el recorrido completo oyendo y apretando dos botones; solo la estatura (si no hay sensor) necesita que alguien la escriba.

**Botones físicos.** Tres botones arcade grandes (verde, rojo, azul, unos 30 pesos cada uno) conectados al ESP32 en los GPIO 32, 33 y 25 contra GND. El firmware v0.2 ya los lee con antirrebote y manda `{"t":"boton","id":"si"}`. Alternativa sin soldar: una botonera USB con codificador "zero delay" (unos 150 pesos) configurada para enviar las teclas de la tabla.

## Lo que NO se implementó, y por qué: el micrófono

Reconocer "sí" y "no" por voz sin ningún servicio en línea sí es posible, pero con condiciones que hoy no se cumplen:

- El reconocimiento de voz que trae el navegador (y Electron) envía el audio a un servidor de Google: **necesita internet** y en la app de escritorio ni siquiera funciona. Queda descartado.
- La alternativa sin internet es un motor local como **Vosk** (código abierto, no es un asistente conversacional: solo convierte audio en palabras). Se puede limitar a un vocabulario de diez palabras ("sí", "no", "siguiente", "atrás", "repetir") para que acierte más. Requiere descargar un modelo de español de unos 40 MB y unas 4 a 6 horas de integración y prueba.
- El problema real no es la técnica sino el lugar: en una feria o un centro comunitario hay ruido, varias personas hablan a la vez y la persona está a un metro del micrófono de la laptop. Un "no" mal entendido como "sí" en una pregunta de alarma es un error grave. Los botones no fallan.

Recomendación: botones físicos como entrada principal y, si después de probar en la comunidad se ve necesario, añadir Vosk con micrófono de solapa o de diadema, y siempre con confirmación en voz ("Entendí sí. ¿Es correcto?").

## Sustitutos de suplementos (implementado)

Cada ficha de suplemento tiene ahora "Si no lo consigues": primero el alimento de la región que aporta lo mismo, después el genérico de farmacia si aplica, y para lo que no tiene sustituto (melatonina) se dice claramente. Arriba de las fichas hay una nota fija: si no se consigue el suplemento no pasa nada, la comida de la lista aporta lo mismo; en farmacia pedir el genérico; mostrar la hoja en el centro de salud. El lint exige este campo en todo suplemento.

## Pendiente de probar en la comunidad
- Velocidad de la voz (0.95) y si conviene Raúl o Sabina.
- Que el texto leído sea suficiente sin ver la pantalla (probar con los ojos cerrados).
- Colocación de los botones: al alcance de una persona mayor sentada.
