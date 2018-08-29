var State = {};
var mqttClient;

const clientId =
  "nodeSwitch_" +
  Math.random()
    .toString(16)
    .substr(2, 8);

function byId(id) {
  return document.getElementById(id);
}

const pages = {
  Settings: "Settings",
  Controls: "Controls"
};

function route(page) {
  for (const p in pages) {
    const el = byId(pages[p]);
    if (p !== page) {
      el.setAttribute("hidden", true);
    } else {
      el.removeAttribute("hidden");
    }
  }
}

function hide(id, bool) {
  console.log("hiding", id, bool);
  const el = byId(id);
  if (bool) {
    el.classList.add("d-none");
    el.classList.remove("d-flex");
  } else {
    el.classList.remove("d-none");
    el.classList.add("d-flex");
  }
}

function setToggle(id, value) {
  console.log("setToggle", id, value);
  value = value || "off";
  const bOn = byId(`${id}-${value === "on" ? "on" : "off"}`).classList;
  bOn.remove("btn-default");
  bOn.add("btn-primary");
  const bOff = byId(`${id}-${value === "off" ? "on" : "off"}`).classList;
  bOff.add("btn-default");
  bOff.remove("btn-primary");
  State[id] = value;
  setVisibility();
}

function setForecastItem(item, value) {
  const fcEl = byId(`forecast-${item}`);
  if (fcEl) {
    fcEl.innerText = value;
  }
}

function setForecast(topic, value) {
  const id = "forecast";
  var forecast;
  try {
    forecast = JSON.parse(value);
  } catch (error) {
    forecast = value;
  }
  console.log(id, forecast, typeof forecast);
  if (typeof forecast === "object") {
    for (const item in forecast) {
      if (item !== "date") {
        setForecastItem(item, forecast[item]);
      }
    }
    const d = new Date(forecast.date);
    setForecastItem(
      "date",
      d.toLocaleDateString("nl-NL", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
      })
    );
    hide(id, false);
  } else {
    hide(id, true);
  }
  State[id] = forecast;
  setVisibility();
}

function setVisibility() {
  const hideSunblock = State["config/auto"] !== "on";
  const hideWeather =
    hideSunblock || State["config/sunblock"] === "off" || !State.forecast;

  hide("config/sunblock", hideSunblock);
  hide("forecast", hideWeather);
  hide("config/useweather", hideWeather);
  hide("error", true);
}

function setError(error) {
  hide("error", false);
  byId("error").innerText = error.message;
}

function push(id, value) {
  console.log("push", { id, value });
  mqttClient.publish(id + "/set", value);
}

function toggle(id) {
  console.log("toggle", id, State[id]);
  mqttClient.publish(id + "/set", State[id] === "on" ? "off" : "on");
}

function mqttInit(items) {
  mqttClient = mqtt.connect({ clientId });
  mqttClient.on("connect", function() {
    mqttClient.subscribe(Object.keys(items));
  });
  mqttClient.on("message", function(topic, payload) {
    const handler = items[topic];
    if (typeof handler === "function") {
      const message = payload.toString();
      console.log("received", topic, message);
      handler(topic, message);
    }
  });
}

const Items = {
  "lamp/1": setToggle,
  "lamp/2": setToggle,
  "lamp/3": setToggle,
  "lamp/4": setToggle,
  "data/forecast": setForecast,
  "config/auto": setToggle,
  "config/sunblock": setToggle,
  "config/useweather": setToggle
};

mqttInit(Items);
