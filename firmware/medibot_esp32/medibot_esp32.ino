/*
  MediBot · firmware de referencia para ESP32 · v0.2 (2026-09-20). BOCETO SIN PROBAR EN HARDWARE.
  Emite una línea JSON por muestra (docs/protocolo_serial.md) y acepta comandos TARA y CAL <kg>.

  Cambios v0.2 (ver docs/bascula.md):
    - Si el MAX30102 no responde, no se cuelga el loop (antes bloqueaba la báscula).
    - Sin tare() al arrancar: auto-tara lenta solo con la plataforma vacía.
    - Factor y cero de la báscula guardados en NVS (Preferences); comandos TARA / CAL <kg>.
    - Máquina de estados de la báscula: VACIA -> SUBIENDO -> ESTABLE -> BAJANDO; "estable" = rango de 16 muestras < 0.20 kg.
    - Plan B: báscula Xiaomi Mi Scale 2 leída por BLE (anuncios pasivos, service data 0x181B) y reenviada por USB.

  Bibliotecas (Library Manager): SparkFun MAX3010x + spo2_algorithm.h · HX711 (bogde) · OneWire + DallasTemperature · Preferences (ESP32) · BLE (ESP32).
  Pines (ESP32 DevKit CP2102): I2C SDA 21 / SCL 22 · HX711 DOUT 16 / SCK 4 (puente RATE a VCC = 80 SPS) · DS18B20 DATA 15.
  Báscula de baño: sus 4 medias celdas forman un puente completo: E+/E- a los extremos, A+/A- a los puntos medios (ver docs/bascula.md).
*/
#include <Wire.h>
#include <Preferences.h>
#include "MAX30105.h"
#include "spo2_algorithm.h"
#include "HX711.h"
#include <OneWire.h>
#include <DallasTemperature.h>

#define BASCULA_HX711 1      // 1 = báscula propia (HX711). 0 = sin báscula por HX711
#define BASCULA_BLE   0      // 1 = plan B: Xiaomi Mi Scale 2 por BLE (requiere partición con espacio para BLE)

#if BASCULA_BLE
#include <BLEDevice.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>
#endif

MAX30105 oxi; bool oxiOk = false;
HX711 bascula; bool basculaOk = false;
OneWire oneWire(15); DallasTemperature termo(&oneWire);
Preferences nvs;

// ---- Botones físicos (para personas que no leen): verde = SÍ / siguiente, rojo = NO / atrás, azul = repetir lectura ----
// Cada botón entre el GPIO y GND (pull-up interno). Pulsación corta = sí/no; el verde mantenido 1 s = "siguiente", el rojo mantenido 1 s = "atras".
const uint8_t BOTONES[3] = { 32, 33, 25 };
const char* BOTON_CORTO[3] = { "si", "no", "repetir" };
const char* BOTON_LARGO[3] = { "siguiente", "atras", "repetir" };
unsigned long botonDesde[3] = { 0, 0, 0 }; bool botonEmitido[3] = { false, false, false };

const uint8_t N = 100; uint32_t irBuf[N], redBuf[N];
int32_t spo2 = 0, bpm = 0; int8_t spo2Ok = 0, bpmOk = 0;

// ---- Báscula: calibración y estado ----
float factor = 21000.0f;   // cuentas por kg (se sobreescribe con NVS / CAL)
long  cero   = 0;          // cuentas con plataforma vacía (se sobreescribe con NVS / TARA / auto-tara)
enum EstadoBascula { VACIA, SUBIENDO, ESTABLE, BAJANDO } estado = VACIA;
const float UMBRAL_PERSONA = 5.0f;   // kg: por debajo no se emite peso
const float RANGO_ESTABLE  = 0.20f;  // kg: rango máx. de la ventana para declarar estable
const uint8_t VENTANA = 16;          // muestras (≈2 s a 8 Hz)
float ventana[VENTANA]; uint8_t iv = 0, nv = 0;
unsigned long vaciaDesde = 0;

void guardarCal() { nvs.begin("medibot", false); nvs.putFloat("factor", factor); nvs.putLong("cero", cero); nvs.end(); }
void cargarCal()  { nvs.begin("medibot", true); factor = nvs.getFloat("factor", factor); cero = nvs.getLong("cero", cero); nvs.end(); }
void emitirCal()  { Serial.printf("{\"t\":\"cal\",\"factor\":%.2f,\"cero\":%ld}\n", factor, cero); }

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  oxiOk = oxi.begin(Wire, I2C_SPEED_FAST);
  if (oxiOk) oxi.setup(60, 4, 2, 100, 411, 4096);
  termo.begin();
#if BASCULA_HX711
  bascula.begin(16, 4);
  basculaOk = bascula.wait_ready_timeout(1000);
  cargarCal();                       // NO tare(): si alguien está parado al encender, el cero quedaría mal
#endif
#if BASCULA_BLE
  iniciarBLE();
#endif
  for (uint8_t i = 0; i < 3; i++) pinMode(BOTONES[i], INPUT_PULLUP);
  Serial.println("{\"t\":\"hola\",\"fw\":\"0.2\"}");
  emitirCal();
}

void leerBotones() {
  for (uint8_t i = 0; i < 3; i++) {
    bool pulsado = digitalRead(BOTONES[i]) == LOW;
    if (pulsado && botonDesde[i] == 0) { botonDesde[i] = millis(); botonEmitido[i] = false; }
    if (pulsado && !botonEmitido[i] && millis() - botonDesde[i] > 1000) { Serial.printf("{\"t\":\"boton\",\"id\":\"%s\"}\n", BOTON_LARGO[i]); botonEmitido[i] = true; }
    if (!pulsado && botonDesde[i] != 0) {
      if (!botonEmitido[i] && millis() - botonDesde[i] > 40) Serial.printf("{\"t\":\"boton\",\"id\":\"%s\"}\n", BOTON_CORTO[i]);  // 40 ms: antirrebote
      botonDesde[i] = 0; botonEmitido[i] = false;
    }
  }
}

// ---- Oxímetro ----
float calidad(uint32_t *ir, uint8_t n) {
  uint32_t mn = UINT32_MAX, mx = 0; double suma = 0;
  for (uint8_t i = 0; i < n; i++) { mn = min(mn, ir[i]); mx = max(mx, ir[i]); suma += ir[i]; }
  double media = suma / n;
  if (media < 30000) return 0.0f;      // sin dedo
  double ac = (double)(mx - mn) / media;
  if (ac < 0.002) return 0.3f;         // señal plana
  if (ac > 0.2) return 0.4f;           // movimiento
  return 0.9f;
}
void leerOximetro() {
  if (!oxiOk) return;
  for (uint8_t i = 0; i < N; i++) {
    unsigned long t0 = millis();
    while (!oxi.available()) { oxi.check(); if (millis() - t0 > 200) return; }  // nunca bloquear el loop
    redBuf[i] = oxi.getRed(); irBuf[i] = oxi.getIR(); oxi.nextSample();
  }
  maxim_heart_rate_and_oxygen_saturation(irBuf, N, redBuf, &spo2, &spo2Ok, &bpm, &bpmOk);
  float q = calidad(irBuf, N);
  if (!spo2Ok || !bpmOk) q = min(q, 0.4f);
  if (q > 0.0f) Serial.printf("{\"t\":\"pulso\",\"bpm\":%ld,\"spo2\":%ld,\"q\":%.2f}\n", (long)bpm, (long)spo2, q);
}

// ---- Temperatura ----
void leerTemperatura() {
  termo.requestTemperatures();
  float c = termo.getTempCByIndex(0);
  if (c > -100) Serial.printf("{\"t\":\"temp\",\"c\":%.1f}\n", c);
}

// ---- Báscula HX711 ----
#if BASCULA_HX711
const char* nombreEstado(EstadoBascula e) { return e == VACIA ? "vacia" : e == SUBIENDO ? "subiendo" : e == ESTABLE ? "estable" : "bajando"; }
void leerBascula() {
  if (!basculaOk || !bascula.is_ready()) return;
  long crudo = bascula.read_average(4);
  float kg = (crudo - cero) / factor;
  ventana[iv] = kg; iv = (iv + 1) % VENTANA; if (nv < VENTANA) nv++;
  float mn = ventana[0], mx = ventana[0];
  for (uint8_t i = 1; i < nv; i++) { mn = min(mn, ventana[i]); mx = max(mx, ventana[i]); }
  bool quieta = (nv == VENTANA) && (mx - mn) < RANGO_ESTABLE;
  EstadoBascula antes = estado;

  if (fabs(kg) < 2.0f) {
    if (vaciaDesde == 0) vaciaDesde = millis();
    if (millis() - vaciaDesde > 5000) cero += (long)(0.02f * (crudo - cero));   // auto-tara lenta con plataforma vacía
    estado = VACIA;
  } else {
    vaciaDesde = 0;
    if (kg >= UMBRAL_PERSONA) estado = quieta ? ESTABLE : SUBIENDO;
    else estado = (antes == ESTABLE || antes == SUBIENDO) ? BAJANDO : VACIA;
  }
  if (estado != antes) Serial.printf("{\"t\":\"bascula\",\"estado\":\"%s\"}\n", nombreEstado(estado));
  if (kg >= UMBRAL_PERSONA)
    Serial.printf("{\"t\":\"peso\",\"kg\":%.1f,\"estable\":%s,\"crudo\":%ld,\"n\":%u}\n", kg, estado == ESTABLE ? "true" : "false", crudo, nv);
}
#endif

// ---- Comandos por serie: TARA · CAL <kg> ----
void atenderComandos() {
  static String linea;
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n' || c == '\r') {
      linea.trim();
      if (linea.equalsIgnoreCase("TARA")) {
#if BASCULA_HX711
        if (basculaOk) { cero = bascula.read_average(16); guardarCal(); nv = 0; Serial.println("{\"t\":\"ack\",\"cmd\":\"tara\",\"ok\":true}"); emitirCal(); }
        else
#endif
        Serial.println("{\"t\":\"ack\",\"cmd\":\"tara\",\"ok\":false}");
      } else if (linea.startsWith("CAL ")) {
        float kgPatron = linea.substring(4).toFloat();
#if BASCULA_HX711
        if (basculaOk && kgPatron > 0.5f) { long crudo = bascula.read_average(16); factor = (crudo - cero) / kgPatron; guardarCal(); Serial.printf("{\"t\":\"ack\",\"cmd\":\"cal\",\"ok\":true,\"factor\":%.2f}\n", factor); emitirCal(); }
        else
#endif
        Serial.println("{\"t\":\"ack\",\"cmd\":\"cal\",\"ok\":false}");
      }
      linea = "";
    } else if (linea.length() < 40) linea += c;
  }
}

// ---- Plan B: Xiaomi Mi Body Composition Scale 2 por BLE ----
#if BASCULA_BLE
BLEScan* escaner = nullptr; unsigned long ultimoAnuncio = 0;
class Oyente : public BLEAdvertisedDeviceCallbacks {
  void onResult(BLEAdvertisedDevice d) override {
    if (!d.haveServiceData()) return;
    for (int i = 0; i < d.getServiceDataCount(); i++) {
      if (!d.getServiceDataUUID(i).equals(BLEUUID((uint16_t)0x181B))) continue;
      std::string sd = d.getServiceData(i);
      if (sd.length() != 13) continue;   // Mi Scale 2: 13 bytes
      const uint8_t* b = (const uint8_t*)sd.data();
      uint8_t flags = b[1];
      bool estable = flags & 0x20, retirado = flags & 0x80;
      uint16_t crudo = b[11] | (b[12] << 8);
      float kg = (b[0] & 0x01) ? crudo / 100.0f * 0.4536f : (b[0] & 0x10) ? crudo / 100.0f * 0.5f : crudo / 200.0f; // lb / jin / kg
      ultimoAnuncio = millis();
      if (!retirado && kg >= UMBRAL_PERSONA) Serial.printf("{\"t\":\"peso\",\"kg\":%.1f,\"estable\":%s,\"fuente\":\"ble\"}\n", kg, estable ? "true" : "false");
    }
  }
};
void iniciarBLE() { BLEDevice::init("MediBot"); escaner = BLEDevice::getScan(); escaner->setAdvertisedDeviceCallbacks(new Oyente(), true); escaner->setActiveScan(false); escaner->setInterval(100); escaner->setWindow(99); ultimoAnuncio = millis(); }
void leerBLE() {
  escaner->start(1, false); escaner->clearResults();
  if (millis() - ultimoAnuncio > 60000) { BLEDevice::deinit(true); delay(200); iniciarBLE(); }  // reinicio si el BLE se queda mudo
}
#endif

void loop() {
  leerBotones();
  atenderComandos();
  leerOximetro();      // ~1 s cuando hay dedo
  leerTemperatura();
#if BASCULA_HX711
  leerBascula();
#endif
#if BASCULA_BLE
  leerBLE();
#endif
}
