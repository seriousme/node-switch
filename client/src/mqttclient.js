const clientId = "nodeSwitch_" + Math.random().toString(16).substr(2, 8);

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
        this.publish(
            "data/forecast/set",
            '{"date":1541832934232,"weer":"bewolkt","tmax":13,"tmin":10,"windk":3,"windr":"Z","neerslag":29,"zon":3}'
        );
        this.publish("config/auto/set", "on");
        this.publish("config/sunblock/set", "on");
        this.publish("config/useweather/set", "on");
    }
};

class MqttClient {
    constructor(topics, updateState) {
        let mqttClient;
        try {
            mqttClient = mqtt.connect({ clientId });
        } catch (error) {
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