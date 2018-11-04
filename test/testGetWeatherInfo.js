const { weerlive } = require("../.config.json");
const { getWeatherInfo } = require("../lib/getWeatherInfo");

console.log(weerlive);

getWeatherInfo(weerlive.location, weerlive.key)
  .then(data => console.log(data))
  .catch(err => console.log(err));
