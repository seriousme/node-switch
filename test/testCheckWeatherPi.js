import { ConfigJson } from "../lib/config.js";
import { checkWeatherPi } from "../lib/checkWeatherPi.js";
import { triggerIFTTT } from "../lib/triggerIFTTT.js";

const { IFTTT } = ConfigJson;

console.log(IFTTT);

(async () => {
	try {
		await checkWeatherPi();
	} catch (error) {
		console.log(error.message);
		triggerIFTTT(
			IFTTT.event,
			IFTTT.key,
			`checkWeatherPi errored: "${error.message}"`,
		);
	}
})();
