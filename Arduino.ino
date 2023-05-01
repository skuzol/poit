#include <ArduinoJson.h>
#include <DHT.h>

#define dht_apin 2 // Digital Pin sensor is connected to
#define led_dpin 8

DHT dht(dht_apin, DHT11); // Initialize DHT sensor
bool led_enable = 0;
const char* led_color = "red";
DynamicJsonDocument doc(1024);

void setup() {
  Serial.begin(9600);
   dht.begin();
  delay(500); // Wait before accessing Sensor
  pinMode(8, OUTPUT);
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  delay(1000); // Wait before accessing Sensor

}

void loop() {
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  // Print JSON
  Serial.print("{\"humidity\":");
  Serial.print(humidity);
  Serial.print(", \"temperature\":");
  Serial.print(temperature);
  Serial.println("}");

  // Control LED using Serial input
  if (Serial.available() > 0) {
    String incoming_json = Serial.readString();
    
    deserializeJson(doc, incoming_json);
    const char* sensor = doc["sensor"];
    led_color = doc["led_color"];
    led_enable = doc["led_enabled"];

  }

  // Turn on LED by color
  if (strcmp("red", led_color) == 0) {
    digitalWrite(8, led_enable);
    delay(100);
    digitalWrite(9, LOW);
    delay(100);
    digitalWrite(10, LOW);
    delay(1000);
  } else if (strcmp("green", led_color) == 0) {
    digitalWrite(9, led_enable);
    digitalWrite(8, LOW);
    delay(100);
    digitalWrite(10, LOW);
    delay(1000);
  } else if (strcmp("blue", led_color) == 0) {
    digitalWrite(10, led_enable);
    delay(100);
    digitalWrite(8, LOW);
    delay(100);
    digitalWrite(9, LOW);
    delay(1000);
  }

  delay(5000);
}