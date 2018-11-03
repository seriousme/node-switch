const SunCalc = require("suncalc");
const { location } = require("../.config.json");
const mqttRoute = require("../lib/mqttRoute");
const sw = require("../lib/switch");

const app = new mqttRoute();
const State = new Map();
const handleError = error => console.error(error);
const wait = sec => new Promise(resolve => setTimeout(resolve, sec * 1000));

function sunRiseHour() {
  return SunCalc.getTimes(
    new Date(),
    location.latitude,
    location.longitude
  ).sunrise.getHours();
}

function sunWait(timeType = "sunset", correction = 0) {
  return new Promise((resolve, reject) => {
    console.log({ timeType, correction, topic });

    const time = SunCalc.getTimes(
      new Date(),
      location.latitude,
      location.longitude
    )[timeType];

    if (typeof time !== "object") {
      reject(`${timeType} is not a valid time type`);
    }

    const diff = Math.floor((time - Date.now()) / 1000);
    const timeTowait = diff - correction;

    if (timeTowait > 0) {
      wait(timeTowait)
        .then(resolve)
        .catch(error => {
          reject(error.message);
        });
    } else {
      resolve();
    }
  });
}

const doPublish = (topic, data) =>
  new Promise(resolve => {
    app.publish(topic.data);
    resolve;
  });

function doSunBlock(topic) {
  sw.switch(topic, "down")
    .then(wait(15))
    .then(sw.switch(topic, "down"))
    .catch(handleError);
}

function handleSunRise() {
  console.log("sunRise");
  // these get scheduled in parallel
  sunWait("sunrise", 4020).then(doPublish("blinds/front/auto", "up"));
  sunWait("sunrise", 4920)
    .then(() => {
      if (sunRiseHour() < 7) {
        app.publish("blinds/side/auto", "stripes");
      } else {
        wait(3600)
          .then(doPublish("blinds/side/auto", "up"))
          .catch(handleError);
      }
    })
    .catch(handleError);
}

function handleSunSet() {
  console.log("sunSet");
  sunWait("sunset", 5820)
    .then(doPublish("lamp/1/auto", "on"))
    .then(wait(600))
    .then(doPublish("lamp/2/auto", "on"))
    .then(doPublish("lamp/4/auto", "on"))
    .then(wait(900))
    .then(doPublish("blinds/front/auto", "down"))
    .then(wait(600))
    .then(doPublish("blinds/side/auto", "down"))
    .catch(handleError);
}

function handleAuto(req) {
  if (State.get("config/auto") === "on") {
    req.topic = req.topic.replace("/auto", "");
    app.publish(req.topic, req.data);
  }
}

function handleAutoSet(req) {
  if (State.get("config/auto") === "on") {
    req.topic = req.topic.replace("/auto", "/set");
    app.publish(req.topic, req.data);
  }
}

function handleSwitchSet(req) {
  const topic = req.topic.replace("/set", "");
  if (topic === "lamp/all") {
    app.publish("lamp/1/set", req.data);
    app.publish("lamp/2/set", req.data);
    app.publish("lamp/4/set", req.data);
    return;
  }
  sw.switch(topic, req.data)
    .then(() => app.pubRetain(topic, req.data))
    .catch(handleError);
}

function handleBlinds(req) {
  const topic = req.topic;
  switch (req.data) {
    case "up":
    case "down":
      sw.switch(topic, req.data);
      break;
    case "stripes":
      if (topic.startsWith("blinds/side")) {
        sw.switch(topic, "down")
          .then(wait(22))
          .then(sw.switch(topic, "down"))
          .catch(handleError);
      }
      break;
    case "sunblock":
      if (topic.startsWith("blinds/front")) {
        if (State.get("config/sunblock") === "on") {
          if (State.get("config/useweather") === "on") {
            const isSunny = {
              zonnig: true,
              halfbewolkt: true,
              bewolkt: true
            };
            const forecast = State.get("data/forecast");
            if (
              typeof forecast === null ||
              (isSunny[forecast.weer] && forecast.tmax > 21)
            ) {
              console.log("doing sunblock because of forecast");
              doSunBlock(topic);
            } else {
              print("not doing sunblock because of forecast");
            }
          } else {
            doSunBlock(topic);
          }
        }
      }
      break;
    default:
      break;
  }
}

function handleStateSet(req) {
  const topic = req.topic.replace("/set", "");
  app.pubRetain(topic, req.data);
}

function handleState(req) {
  State.set(req.topic, req.data);
}

app.use("sun/rise", handleSunRise);
app.use("sun/set", handleSunSet);
app.use("lamp/+/set", handleSwitchSet);
app.use("lamp/+/auto", handleAutoSet);
app.use("power/set", handleSwitchSet);
app.use("power/auto", handleAutoSet);
app.use("blinds/+", handleBlinds);
app.use("blinds/+/auto", handleAuto);
app.use("config/+/set", handleStateSet);
app.use("config/+", handleState);
app.use("data/+/set", handleStateSet);
app.use("data/+", handleState);
app.listen();
