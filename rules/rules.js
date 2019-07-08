const debug = require("debug")("rules");
debug.enabled = true;
const SunCalc = require("suncalc");
const { location, weerlive, IFTTT } = require("../.config.json");

const mqttRoute = require("../lib/mqttRoute");
const { deviceSwitch } = require("../lib/deviceSwitch");
const { getWeatherInfo } = require("../lib/getWeatherInfo");
const { checkWeatherPi } = require("../lib/checkWeatherPi");
const { triggerIFTTT } = require("../lib/triggerIFTTT");

const app = new mqttRoute();
const State = new Map();
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
    debug(`${timeType} is not a valid time type`);
    return;
  }

  const diff = Math.floor((time - Date.now()) / 1000);
  const timeTowait = diff - correction;

  if (timeTowait > 0) {
    debug("sleeping", { timeType, timeTowait });
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
    await sunWait("sunrise", 900);
    app.publish("blinds/front/auto", "up");
  })();
  // side
  (async () => {
    if (sunRiseHour() < 7) {
      app.publish("blinds/side/auto", "stripes");
    } else {
      await sunWait("sunrise", 1800);
      app.publish("blinds/side/auto", "up");
    }
  })();
}

async function handleSunSet() {
  debug("sunSet");
  await sunWait("sunset", 2220);
  app.publish("lamp/1/auto", "on");
  await sleep(600);
  app.publish("lamp/2/auto", "on");
  app.publish("lamp/3/auto", "on");
  await sleep(900);
  app.publish("blinds/front/auto", "down");
  await sleep(600);
  app.publish("blinds/side/auto", "down");
}

function handleAuto(req) {
  if (State.get("config/auto") === "on") {
    req.topic = req.topic.replace("/auto", "/set");
    app.publish(req.topic, req.data);
  }
}

function handleAutoSet(req) {
  if (State.get("config/auto") === "on") {
    req.topic = req.topic.replace("/auto", "/set");
    app.publish(req.topic, req.data);
  }
}

async function handleSwitchSet(req) {
  const topic = req.topic.replace("/set", "");
  if (topic === "lamp/all") {
    app.publish("lamp/1/set", req.data);
    app.publish("lamp/2/set", req.data);
    app.publish("lamp/3/set", req.data);
    return;
  }
  deviceSwitch(topic, req.data);
  app.pubRetain(topic, req.data);
}

async function handleBlindsSet(req) {
  debug("handleBlinds");
  const topic = req.topic.replace("/set", "");
  switch (req.data) {
    case "up":
    case "down":
      deviceSwitch(topic, req.data);
      break;
    case "stripes":
      if (topic.startsWith("blinds/side")) {
        deviceSwitch(topic, "up");
        await sleep(22);
        deviceSwitch(topic, "up");
      }
      break;
    case "stripes-down":
      if (topic.startsWith("blinds/side")) {
        deviceSwitch(topic, "down");
        await sleep(10);
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
    triggerIFTTT(IFTTT.event, IFTTT.key, error);
  }
}

async function handleCheckWeatherPi() {
  try {
    await checkWeatherPi();
  } catch (error) {
    console.log(error.message);
    triggerIFTTT(
      IFTTT.event,
      IFTTT.key,
      `checkWeatherPi errored: "${error.message}"`
    );
  }
}

app.use("sun/rise", handleSunRise);
app.use("sun/set", handleSunSet);
app.use("lamp/+/set", handleSwitchSet);
app.use("lamp/+/auto", handleAutoSet);
app.use("power/set", handleSwitchSet);
app.use("power/auto", handleAutoSet);
app.use("blinds/+/set", handleBlindsSet);
app.use("blinds/+/auto", handleAuto);
app.use("config/+/set", handleStateSet);
app.use("config/+", handleState);
app.use("forecast/get", handleForecast);
app.use("data/+/set", handleStateSet);
app.use("data/+", handleState);
app.use("checkWeatherPi", handleCheckWeatherPi);
app.listen();
