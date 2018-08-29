const mqttRoute = require("../lib/mqttRoute");
const sw = require("./switch");

const app = new mqttRoute();
const State = new Map();
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function handleAuto(req) {
  //console.log("State", State);
  if (State.get("config/auto") === "on") {
    req.topic = req.topic.replace("/auto", "");
    handleSwitch(req);
  }
}

function handleSwitch(req) {
  const topic = req.topic.replace("/set", "");
  sw.switch(topic, req.data)
    .then(() => app.pubRetain(topic, req.data))
    .catch(err => console.log(err));
}

function handleStateSet(req) {
  const topic = req.topic.replace("/set", "");
  State.set(req.topic, req.data);
  app.pubRetain(topic, req.data);
}

function handleState(req) {
  State.set(req.topic, req.data);
}

app.use("lamp/+/set", handleSwitch);
app.use("power/set", handleSwitch);
app.use("blinds/+/set", handleSwitch);
app.use("lamp/+/auto", handleAuto);
app.use("blinds/+/auto", handleAuto);
app.use("power/auto", handleAuto);
app.use("config/+/set", handleStateSet);
app.use("config/+", handleState);
app.use("data/forecast", handleState);
app.listen();
