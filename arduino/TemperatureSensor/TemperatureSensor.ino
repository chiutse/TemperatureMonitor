#include <SoftwareSerial.h>
#include <DHT.h>;

#define RX 10
#define TX 11
String AP = "<YOUR WIFI SSID>";
String PASS = "<YOUR WIFI PASSWORD>";
String token = "P7zlANXN30KXQHaDzzjorQ==";
String HOST = "<YOUR URL>";
String PORT = "3000";
SoftwareSerial esp8266(RX, TX);

#define DHTPIN 7     // what pin we're connected to
#define DHTTYPE DHT22   // DHT 22  (AM2302)
DHT dht(DHTPIN, DHTTYPE); //// Initialize DHT sensor for normal 16mhz Arduino
float temp = 0;
float hum = 0;

void setup() {
  Serial.begin(9600);
  esp8266.begin(115200);
  esp8266.println("AT");
  esp8266.println("AT+CWMODE=1");
  esp8266.println("AT+CWJAP=\"" + AP + "\",\"" + PASS + "\"");
  dht.begin();
}

unsigned long lastTimeMillis = 0;
void printResponse() {
  while (esp8266.available()) {
    Serial.println(esp8266.readStringUntil('\n')); 
  }
}

void loop() {
  if (millis() - lastTimeMillis > 30000) {
    lastTimeMillis = millis();

    esp8266.println("AT+CIPMUX=1");
    delay(1000);
    printResponse();

    esp8266.println("AT+CIPSTART=4,\"TCP\",\"" + HOST + "\"," + PORT + "");
    delay(1000);
    printResponse();

    temp = dht.readTemperature();
    hum = dht.readHumidity();
    String cmd = "GET /?token=" + token + "&temp=" + String(temp) + "&hum=" + String(hum) + " HTTP/1.1";
    esp8266.println("AT+CIPSEND=4," + String(cmd.length() + 4));
    delay(1000);

    esp8266.println(cmd);
    delay(1000);
    esp8266.println(""); 
  }

  if (esp8266.available()) {
    Serial.write(esp8266.read());
  }
}
