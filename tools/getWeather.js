const axios = require("axios");
const mqtt = require("../lib/mqttRoute");

const { weerlive } = require("../.config.json");

const weatherUrl = `http://weerlive.nl/api/json-data-10min.php?key=${
  weerlive.key
}&locatie=${weerlive.location}`;

function publish(data) {
  const client = mqtt.connect();
  const topic = "data/forecast/set";
  client.publish(topic, JSON.stringify(data), null, _ => client.end());
}

function getWeatherInfo(url) {
  axios
    .get(url)
    .then(response => {
      const today = response.data.liveweer[0];
      const data = {
        date: Number(new Date()),
        weer: today.d0weer,
        tmax: Number(today.d0tmax),
        tmin: Number(today.d0tmin),
        windk: Number(today.d0windk),
        windr: today.d0windr,
        neerslag: Number(today.d0neerslag),
        zon: Number(today.d0zon)
      };
      console.log(data);
      publish(data);
    })
    .catch(error => {
      console.log(error.message);
      publish(null);
    });
}

getWeatherInfo(weatherUrl);
