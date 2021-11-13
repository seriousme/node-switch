import axios from "axios";
import { ConfigJson } from "./config.js";

const {
  weatherPi: { sensors, host }, } = ConfigJson;
const MAX_AGE = 3 * 60 * 60 * 1000; // 3 hours

export async function checkWeatherPi() {
  try {
    for (const sensor of sensors) {
      const url = `${host}/weatherdb/_design/data/_view/byhour?reduce=false&descending=true&limit=1&startkey=[%22${sensor}%22,%22temp%22,{}]`;
      const response = await axios.get(url);
      const data = response.data.rows[0];
      const lastDate = new Date(data.id);
      const now = new Date();
      const tooOld = now - lastDate > MAX_AGE;
      if (tooOld) {
        throw new Error(`Old data for sensor "${sensor}"`);
      }
      if (data.key[0] !== sensor) {
        throw new Error(`No data for sensor "${sensor}"`);
      }
      console.log(sensor, "ok");
    }
  } catch (error) {
    throw new Error(error.message);
  }
}
