const mqtt = require("../lib/mqttRoute");
const client = mqtt.connect();
client.on("connect", () => {
  client.pubRetain("config/auto", "on");
  client.pubRetain("config/sunblock", "off");
  client.pubRetain("config/useweather", "off");
  client.pubRetain("lamp/1", "off");
  client.pubRetain("lamp/2", "off");
  client.pubRetain("lamp/3", "off");
  client.pubRetain("lamp/4", "off");
  client.pubRetain("power", "off");
  client.end();
});
