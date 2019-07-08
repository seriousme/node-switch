const { IFTTT } = require("../.config.json");
const { checkWeatherPi } = require("../lib/checkWeatherPi");
const { triggerIFTTT } = require("../lib/triggerIFTTT");

console.log(IFTTT);

(async () => {
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
})();
