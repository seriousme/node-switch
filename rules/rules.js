const debug = require("debug")("rules");
debug.enabled = true;
const SunCalc = require("suncalc");
const { location, weerlive } = require("../.config.json");

const mqttRoute = require("../lib/mqttRoute");
const { deviceSwitch } = require("../lib/deviceSwitch");
const { getWeatherInfo } = require("../lib/getWeatherInfo");

const app = new mqttRoute();
const State = new Map();
const handleError = error => console.error(error);
const sleep = sec => new Promise(resolve => setTimeout(resolve, sec * 1000));

function sunRiseHour() {
  return SunCalc.getTimes(
    new Date(),
    location.latitude,
    location.longitude
  ).sunrise.getHours();
}

async function sunWait(timeType = "sunset", correction = 0) {
  debug({ timeType, correction });

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
    await sleep(timeTowait);
  }
}

async function doSunBlock(topic) {
  deviceSwitch(topic, "down");
  await sleep(15);
  deviceSwitch(topic, "down");
}

function handleSunRise() {
  debug("sunRise");
  // these get scheduled in parallel
  // front
  (async () => {
    await sunWait("sunrise", 4020);
    app.publish("blinds/front/auto", "up");
  })();
  // side
  (async () => {
    await sunWait("sunrise", 4920);
    if (sunRiseHour() < 7) {
      app.publish("blinds/side/auto", "stripes");
    } else {
      await sleep(3600);
      app.publish("blinds/side/auto", "up");
    }
  })();
}

async function handleSunSet() {
  debug("sunSet");
  await sunWait("sunset", 5820);
  app.publish("lamp/1/auto", "on");
  await sleep(600);
  app.publish("lamp/2/auto", "on");
  app.publish("lamp/4/auto", "on");
  await sleep(900);
  app.publish("blinds/front/auto", "down");
  await sleep(600);
  app.publish("blinds/side/auto", "down");
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
  deviceSwitch(topic, req.data);
  app.pubRetain(topic, req.data);
}

async function handleBlinds(req) {
  const topic = req.topic;
  switch (req.data) {
    case "up":
    case "down":
      deviceSwitch(topic, req.data);
      break;
    case "stripes":
      if (topic.startsWith("blinds/side")) {
        deviceSwitch(topic, "down");
        await sleep(22);
        deviceSwitch(topic, "down");
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
              debug("doing sunblock because of forecast");
              doSunBlock(topic);
            } else {
              debug("not doing sunblock because of forecast");
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
  debug("setting state", req.topic, req.data);
  State.set(req.topic, req.data);
}

async function handleForecast(req) {
  const topic = "data/forecast/set";
  try {
    const data = await getWeatherInfo(weerlive.location, weerlive.key);
    app.publish(topic, data);
  } catch (error) {
    handleError(error);
  }
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
app.use("forecast/get", handleForecast);
app.use("data/+/set", handleStateSet);
app.use("data/+", handleState);
app.listen();
