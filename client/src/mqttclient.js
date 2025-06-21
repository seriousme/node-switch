const clientId = `nodeSwitch_${Math.random().toString(16).substring(2, 8)}`;

const mqttDemo = {
	events: {},
	on: function (evt, fn) {
		this.events[evt] = fn;
	},
	publish: function (evt, data) {
		this.events.message(evt.replace("/set", ""), data);
	},
	initDemo: function () {
		this.publish("lamp/1/set", "off");
		this.publish("lamp/2/set", "off");
		this.publish("lamp/3/set", "off");
		this.publish("lamp/4/set", "off");
		this.publish("power/set", "off");
		this.publish(
			"data/forecast/set",
			JSON.stringify({
				date: "2024-10-27T15:08:03.000Z",
				weer: "halfbewolkt",
				max_temp: 16,
				min_tem: 9,
				windbft: 1,
				windr: "ZW",
				neersl_perc_dag: 0,
				zond_perc_dag: 47,
			}),
		);
		this.publish("config/auto/set", "on");
		this.publish("config/sunblock/set", "on");
		this.publish("config/useweather/set", "on");
	},
};

class MqttClient {
	constructor(topics, updateState) {
		let mqttClient;
		const url = `ws://${window.location.host}`;
		try {
			mqttClient = mqtt.connect(url, { clientId });
		} catch (_error) {
			mqttClient = mqttDemo;
		}

		mqttClient.on("connect", () => {
			mqttClient.subscribe(topics);
		});
		mqttClient.on("message", (topic, payload) => {
			const value = payload.toString();
			console.log("received", { topic, value });
			updateState(topic, value || "off");
		});
		if (mqttClient.initDemo) {
			updateState("error", "Using demo mode, no live traffic");
			mqttClient.initDemo();
		}
		this.mqttClient = mqttClient;
	}

	publish(topic, msg) {
		this.mqttClient.publish(topic, msg);
	}
}

export default MqttClient;
