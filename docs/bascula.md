# Báscula

La báscula se arma con una báscula de baño barata: se le quita su tarjeta y sus cuatro celdas de carga se conectan a un HX711 que va al ESP32. Así se aprovecha la plataforma de vidrio y las celdas ya montadas en las esquinas, que es la parte difícil de hacer en casa.

Como respaldo se puede usar una Xiaomi Mi Body Composition Scale 2. El ESP32 la lee por Bluetooth y manda el peso igual que si fuera la báscula propia (en el firmware, `BASCULA_BLE 1`). La aplicación no puede leerla directo porque Electron no permite escuchar anuncios Bluetooth sin conectarse.

## Por qué no una báscula comercial con USB

Las básculas de plataforma con "USB" que se venden en México (Rhino, Torrey) no publican cómo mandan los datos y en varias el USB es solo para cargar la batería. Las de punto de venta con RS-232 son de 30 a 40 kg. Y las plataformas de paquetería son resbalosas para un adulto mayor.

## Precisión que hace falta

Con ±0.5 kg alcanza. A una persona de 1.65 m, medio kilo cambia el IMC en 0.18 puntos, mientras que un centímetro de error en la estatura lo cambia 0.30 y la ropa con zapatos pesa entre medio kilo y dos. Los cortes del IMC están separados por 5 puntos.

## Conexión

```
4 medias celdas (3 hilos cada una) forman UN puente de Wheatstone:
  E+ / E-  (rojo / negro del HX711)   -> los dos extremos
  A+ / A-  (blanco / verde)           -> los dos puntos medios
  El punto medio se encuentra con el multímetro: mide más o menos la mitad
  de la resistencia hacia cada uno de los otros dos cables.
  Si al pisar la lectura BAJA, intercambia A+ y A-.
  Si una esquina sube y otra baja, una celda quedó al revés.

HX711 -> ESP32:  VCC a 3V3, GND, DOUT al GPIO16, SCK al GPIO4
                 puente RATE a VCC para 80 lecturas por segundo
```

Antes de comprar varias, abre una para confirmar que trae cuatro celdas de tres hilos. Algunas básculas nuevas traen un solo sensor o celdas de dos hilos.

## Cómo decide el peso el ESP32

- Plataforma vacía (menos de 2 kg) por más de 5 segundos: ajusta el cero poco a poco, para compensar la deriva.
- Más de 5 kg: alguien se subió.
- Estable: cuando las últimas 16 lecturas (unos 2 segundos) varían menos de 0.20 kg.
- La app fija el peso con tres lecturas estables seguidas y usa la mediana.

El factor de calibración y el cero se guardan en la memoria del ESP32, así que no se pierden al apagar.

## Pesas patrón sin comprar pesas

Llena tres bultos con arena y pésalos en una báscula comercial de la comunidad que tenga su calcomanía de verificación (NOM-010): uno de 20 kg, uno de 50 y uno de unos 80. Rotúlalos con su peso y toma foto de la lectura.

## Calibración (una vez, en el taller)

1. Enciende y espera 20 minutos para que se estabilice la temperatura.
2. Con la plataforma vacía y nivelada, en MediBot ve a "Verificación de sensores" y toca **Tara**.
3. Pon el bulto de 20 kg en el centro, escribe 20 y toca **Calibrar con esta pesa**.
4. Comprueba con 50 y 80 kg en el centro. Si alguno se va más de 0.4 kg, revisa el montaje.
5. Esquinas: pon los 50 kg en el centro y luego en cada esquina. La diferencia máxima debe ser de 0.5 kg; si es mayor, una celda está mal montada o la plataforma se dobla.
6. Repetibilidad: sube y baja el mismo bulto 10 veces. Debe dar casi lo mismo cada vez.
7. Deja 50 kg encima 5 minutos. No debe moverse más de 0.3 kg.

## Cada día que se use

Al empezar, pesa el bulto de 20 kg desde "Verificación de sensores" y toca **Comparar**. Si se va más de 0.5 kg, haz Tara; si sigue, recalibra. La app guarda cada prueba en la bitácora con fecha y resultado.

Lo esperado: ±0.3 kg al repetir, ±0.5 kg de exactitud con la persona al centro y hasta ±0.8 kg en el peor caso. No es una báscula médica certificada y la hoja impresa lo dice.
