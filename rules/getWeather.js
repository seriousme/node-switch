const axios = require("axios");
const config = require("../.config.json");

const weatherUrl = `http://weerlive.nl/api/json-data-10min.php?key=${
  config.weerlive.key
}&locatie=${config.weerlive.locatie}`;
const publishUrl = "http://localhost:8080/publish";

const topic = "data/forecast";
const qos = { retain: true };

function publish(message) {
  axios
    .get(publishUrl, {
      params: {
        topic,
        message,
        qos
      }
    })
    .then(function(response) {
      console.log("result of publish:", response.statusText);
    })
    .catch(function(error) {
      console.log("result of publish:", error.message);
    });
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
