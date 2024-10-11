import ConfigJson from "../.config.json" with { type: "json" };
import { checkWeatherPi } from "../lib/checkWeatherPi.js";
import { sns } from "../lib/SNS.js";

const { SNS } = ConfigJson;

console.log(SNS);

(async () => {
	try {
		await checkWeatherPi();
	} catch (error) {
		console.log(error.message);
		sns.publish(SNS.TopicArn, `checkWeatherPi errored: "${error.message}"`);
	}
})();
