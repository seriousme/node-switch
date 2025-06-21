import { connect } from "../lib/mqttRoute.js";

const client = connect();
client.on("connect", () => {
	client.publish("config/auto/set", "off");
	client.publish("lights/2/set", "on");
	client.publish("lights/3/set/auto", "off");
	client.publish("lights/4/set/auto", "blah");
	client.publish("config/auto/set", "on");
	client.publish("lights/3/auto", "off");
	client.publish("blinds/side/auto", "up");
	client.publish("forecast/get", "now");
	client.end();
});
