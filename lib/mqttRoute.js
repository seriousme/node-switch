const debug = require("debug")("mqttRoute");
const Trie = require("./trie");
const mqtt = require("mqtt");
const path = require("path");
const programName = path.basename(process.argv[1]);

class MqttRoute {
  constructor() {
    this.mqtt = null;
    this.topics = [];
    this.root = new Trie();
  }

  static _generateClientID() {
    return (
      programName +
      "_" +
      Math.random()
        .toString(16)
        .substr(2, 8)
    );
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
      callback
    );
  }

  pubRetain(topic, value, opts = {}) {
    opts.retain = true;
    this.publish(topic, value, opts);
  }

  static connect(brokerUrl, opts) {
    const that = new MqttRoute();
    that.connect(
      brokerUrl,
      opts
    );
    return that;
  }

  connect(brokerUrl, opts) {
    //debug(brokerUrl, opts);
    const id = MqttRoute._generateClientID();
    const cOpts = opts || brokerUrl || {};
    cOpts.clientId = cOpts.clientId || id;
    //debug(brokerUrl, opts, brokerUrl || cOpts);
    this.mqtt = mqtt.connect(
      brokerUrl || cOpts,
      opts
    );
  }

  listen(brokerUrl, opts) {
    this.connect(
      brokerUrl,
      opts
    );
    this.mqtt.on("connect", () => {
      if (this.topics.length) {
        debug(`subscribing to ${this.topics}`);
        this.mqtt.subscribe(this.topics);
      }
    });
    this.mqtt.on("message", (topic, payload) => {
      const message = payload.toString();
      var data;
      try {
        data = JSON.parse(message);
      } catch (_) {
        data = message;
      }
      debug(`resolving ${topic}`);
      const topicPaths = this.root.match(topic.split("/"));
      topicPaths.map(tp => {
        debug(
          `calling ${tp.handler.name} for ${JSON.stringify({
            topic,
            data
          })}`
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

module.exports = MqttRoute;
