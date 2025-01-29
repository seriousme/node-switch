const clientId = `nodeSwitch_${Math.random().toString(16).substring(2, 8)}`;

const mqttDemo = {
	events: {},
	on: function (evt, fn) {
		this.events[evt] = fn;
	},
	publish: function (evt, data) {
		this.events.message(evt.replace("/set", ""), data);
	},
};

class MqttClient {
	constructor(topics, updateState) {
		let mqttClient;
		const url = `ws://${window.location.host}`;
		try {
			mqttClient = mqtt.connect(url, { clientId });
		} catch (error) {
			mqttClient = mqttDemo;
			this.isDemo = true;
		}

		mqttClient.on("connect", () => {
			mqttClient.subscribe(topics);
		});
		mqttClient.on("message", (topic, payload) => {
			const value = payload.toString();
			console.log("received", { topic, value });
			updateState(topic, value || "off");
		});
		if (mqttClient.isDemo) {
			updateState("error", "Using demo mode, no live traffic");
			//mqttClient.initDemo();
		}
		this.mqttClient = mqttClient;
	}

	publish(topic, msg) {
		this.mqttClient.publish(topic, msg);
	}
}

export default MqttClient;
