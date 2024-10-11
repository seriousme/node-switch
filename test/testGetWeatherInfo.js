import ConfigJson from "../.config.json" with { type: "json" };
import { getWeatherInfo } from "../lib/getWeatherInfo.js";
const { weerlive } = ConfigJson;
console.log(weerlive);

(async () => {
	try {
		const data = await getWeatherInfo(weerlive.location, weerlive.key);
		console.log(data);
	} catch (error) {
		console.log(error.message);
	}
})();
