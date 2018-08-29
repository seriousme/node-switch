const mqtt = require("../lib/mqttRoute");
const client = mqtt.connect();
client.on("connect", () => {
  client.pubRetain("config/auto", "off");
  client.pubRetain("lights/2", "on");
  client.publish("lights/3/auto", "off");
  client.publish("lights/4/auto", "blah");
  client.pubRetain("config/auto", "on");
  client.publish("lights/3/auto", "off");
  client.publish("blinds/side/auto", "up");
  client.pubRetain("data/forecast", { a: 1, b: 2 });
  client.end();
});
