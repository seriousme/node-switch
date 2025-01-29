import SunCalc from "suncalc";
import ConfigJson from "../.config.json" with { type: "json" };
import mqttRoute from "../lib/mqttRoute.js";
import { deviceSwitch } from "../lib/deviceSwitch.js";
import { getWeatherInfo } from "../lib/getWeatherInfo.js";
import { checkWeatherPi } from "../lib/checkWeatherPi.js";
import { sns } from "../lib/SNS.js";
import Debug from "debug";

const debug = Debug("rules");
debug.enabled = true;

const {
	location,
	weerlive,
	SNS,
	sunblock = {},
	mqttServer = {},
	subTopics = {},
	controls = {},
} = ConfigJson;

const cIdx = {};

for (const item in controls) {
	cIdx[item.topic] = item;

	if (item.type === "switch") {
		item.cmd = `${item.topic}/${subTopics.switchCmd}`;
		item.status = `${item.topic}/${subTopics.switchStatus}`;
	}
	if (item.type === "blind") {
		item.cmd = `${item.topic}/${subTopics.blindsCmd}`;
		item.status = `${item.topic}/${subTopics.blindsStatus}`;
	}
}

const lastPid = {};
let batteryMsgs = 0;

const app = new mqttRoute();
const State = new Map();
const sleep = (sec) =>
	new Promise((resolve) => setTimeout(resolve, sec * 1000));

function isSunnyForecast(minTemp) {
	if (State.get("config/useweather") === "on") {
		const isSunny = {
			zonnig: true,
			halfbewolkt: true,
			bewolkt: true,
		};
		const forecast = State.get("data/forecast");
		if (typeof forecast === "object") {
			if (!isSunny[forecast.weer]) {
				debug("forecast says not sunny");
				return false;
			}
			if (minTemp && forecast.max_temp <= minTemp) {
				debug("forecast says sunny but not warm enough");
				return false;
			}
		}
	}
	// if no forecast is available its always sunny
	return true;
}

function getSunRiseTime() {
	return SunCalc.getTimes(new Date(), location.latitude, location.longitude)
		.sunrise.toTimeString()
		.split(" ")[0];
}

async function sunWait(timeType = "sunset", correction = 0) {
	debug({ timeType, correction });

	const time = SunCalc.getTimes(
		new Date(),
		location.latitude,
		location.longitude,
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

function handleSunRise() {
	debug("sunRise");
	// these get scheduled in parallel
	// front
	(async () => {
		await sunWait("sunrise", 900);
		app.publish("blinds/front/auto", "open");
	})();
	// back
	(async () => {
		await sunWait("sunrise", 1800);
		app.publish("blinds/back/auto", "open");
	})();
	// side
	(async () => {
		if (getSunRiseTime() < "07:00:00") {
			app.publish("blinds/side/auto", "sunblock");
		} else {
			await sunWait("sunrise", 1740);
			app.publish("blinds/side/auto", "open");
		}
	})();
}

async function handleSunSet() {
	debug("sunSet");
	const currentMonth = new Date().getMonth() + 1;
	await sunWait("sunset", 2220);
	app.publish("lights/1/auto", "on");
	await sleep(600);
	app.publish("lights/2/auto", "on");
	app.publish("lights/3/auto", "on");
	await sleep(900);
	app.publish("blinds/front/auto", "close");
	await sleep(600);
	app.publish("blinds/side/auto", "close");
	//from october until end of march
	if (currentMonth < 4 || currentMonth > 9) {
		await sleep(600);
		app.publish("blinds/back/auto", "close");
	}
}

function handleAuto(req) {
	if (State.get("config/auto/all") === "on") {
		const topic = req.topic.replace("/auto", "");
		if (State.get(`config/auto/${topic}` === "on")) {
			app.publish(topic, req.data);
		}
	}
}

async function handleSwitchSet(req) {
	const topic = req.topic;
	if (topic === "lights/all") {
		app.publish("lights/1", req.data);
		app.publish("lights/2", req.data);
		app.publish("lights/3", req.data);
		return;
	}
	const item = cIdx[topic];
	if (!item) {
		return;
	}
	if (item.model === "kaku") {
		State.set(item.status, req.data);
		deviceSwitch(topic, req.data);
		app.pubRetain(item.status, req.data);
		return;
	}
	app.publish(cIdx[topic].cmd, req.data);
}

async function handleBlindsSet(req) {
	const topic = req.topic;
	debug("handleBlinds");
	if (req.data === "sunblock" && sunblock[topic]) {
		if (
			topic === "blinds/front" &&
			State.get("config/sunblock") === "on" &&
			isSunnyForecast(21)
		) {
			req.data = sunblock[topic];
		} else {
			return;
		}
		if (topic === "blinds/side" && isSunnyForecast()) {
			req.data = sunblock[topic];
		} else {
			req.data = "open";
		}
	}
	app.publish(cIdx[topic].cmd, req.data);
}

async function openAllBlinds() {
	debug("handleBlinds");
	app.publish("blinds/back", "open");
	await sleep(2);
	app.publish("blinds/side", "open");
	await sleep(2);
	app.publish("blinds/front", "open");
}

function toggleButton(topic) {
	const item = cIdx[topic];
	if (item.model === "kaku") {
		const newState = State.get(item.status) === "on" ? "off" : "on";
		app.publish(item.status, newState);
		return;
	}
	app.publish(item.cmd, "toggle");
}

function handleRemote(req) {
	const msg = req.data;
	// check for valid messages
	if (msg.BTHome_version !== 2) {
		return;
	}
	// debounce
	if (lastPid[req.topic === msg.pid]) {
		return;
	}
	// warn for empty battery
	if (msg.battery < 20 && batteryMsgs++ % 10 === 0) {
		sns.publish(SNS.TopicArn, `BLE battery low: "${msg.battery}"`);
	}

	if (msg.button[0] === 1) {
		toggleButton("lights/1");
	}
	if (msg.button[1] === 1) {
		toggleButton("lights/2");
	}
	if (msg.button[2] === 1) {
		toggleButton("lights/3");
	}
	if (msg.button[3] === 1) {
		openAllBlinds();
	}
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
		sns.publish(SNS.TopicArn, error);
	}
}

async function handleCheckWeatherPi() {
	try {
		await checkWeatherPi();
	} catch (error) {
		console.log(error.message);
		sns.publish(SNS.TopicArn, `checkWeatherPi errored: "${error.message}"`);
	}
}

app.use("lights/+/auto", handleAuto);
app.use("blinds/+/auto", handleAuto);
app.use("power/auto", handleAuto);
app.use("sun/rise", handleSunRise);
app.use("sun/set", handleSunSet);
app.use("lights/+", handleSwitchSet);
app.use("power", handleSwitchSet);
app.use("blinds/+", handleBlindsSet);
app.use("config/+", handleState);
app.use("data/+", handleState);
app.use("forecast/get", handleForecast);
app.use("remote/ble", handleRemote);
app.use("checkWeatherPi", handleCheckWeatherPi);
app.listen(mqttServer.URL);
