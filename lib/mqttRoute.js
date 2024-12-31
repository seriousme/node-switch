import Trie from "./trie.js";
import { connect as MQTTconnect } from "mqtt";
import { basename } from "node:path";
import Debug from "debug";

const debug = Debug("mqttRoute");
const programName = basename(process.argv[1]);

class MqttRoute {
	constructor() {
		this.mqtt = null;
		this.topics = [];
		this.root = new Trie();
	}

	static _generateClientID() {
		return `${programName}_${Math.random().toString(16).substring(2, 8)}`;
	}

	use(topicPath, handler) {
		if (typeof topicPath === "string") {
			this.topics.push(topicPath);
			this.root.add(topicPath.split("/"), { topicPath, handler });
		}
	}

	publish(topic, data, opts, callback) {
		debug("publish", topic, data, opts);
		this.mqtt.publish(
			topic,
			typeof data !== "string" ? JSON.stringify(data) : data,
			opts,
			callback,
		);
	}

	pubRetain(topic, value, opts, callback) {
		const pOpts = opts || {};
		pOpts.retain = true;
		this.publish(topic, value, pOpts, callback);
	}

	static connect(brokerUrl, opts) {
		const that = new MqttRoute();
		that.connect(brokerUrl, opts);
		return that;
	}

	connect(brokerUrl, opts = {}) {
		//debug(brokerUrl, opts);
		const id = MqttRoute._generateClientID();
		opts.clientId = opts.clientId || id;
		debug(brokerUrl, opts, brokerUrl || opts);
		this.mqtt = MQTTconnect(brokerUrl, opts);
	}

	listen(brokerUrl, opts) {
		this.connect(brokerUrl, opts);
		this.mqtt.on("connect", () => {
			if (this.topics.length) {
				debug(`subscribing to ${this.topics}`);
				this.mqtt.subscribe(this.topics);
			}
		});
		this.mqtt.on("message", (topic, payload) => {
			const message = payload.toString();
			let data;
			try {
				data = JSON.parse(message);
			} catch (_) {
				data = message;
			}
			debug(`resolving ${topic}`);
			const topicPaths = this.root.match(topic.split("/"));
			topicPaths.map((tp) => {
				debug(
					`calling ${tp.handler.name} for ${JSON.stringify({
						topic,
						data,
					})}`,
				);
				tp.handler({ topicPath: tp.topicPath, topic, data });
			});
		});
	}

	on(event, handler) {
		this.mqtt.on(event, handler);
	}

	end() {
		this.mqtt.end();
	}
}

export default MqttRoute;
