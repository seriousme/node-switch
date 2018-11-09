const { weerlive } = require("../.config.json");
const { getWeatherInfo } = require("../lib/getWeatherInfo");

console.log(weerlive);

(async () => {
  try {
    const data = await getWeatherInfo(weerlive.location, weerlive.key1);
    console.log(data);
  } catch (error) {
    console.log(error.message);
  }
})();
