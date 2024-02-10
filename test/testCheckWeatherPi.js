import { ConfigJson } from "../lib/config.js";
import { checkWeatherPi } from "../lib/checkWeatherPi.js";
import { sns } from "../lib/SNS.js";

const { SNS } = ConfigJson;

console.log(IFTTT);

(async () => {
  try {
    await checkWeatherPi();
  } catch (error) {
    console.log(error.message);
    sns.publish(SNS.TopicArn, `checkWeatherPi errored: "${error.message}"`);
  }
})();
