import { ConfigJson } from "../lib/config.js";
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
