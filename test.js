import SunCalc from "suncalc";
import { ConfigJson } from "./lib/config.js"
const { location } = ConfigJson;

function getSunRiseTime() {
  return SunCalc.getTimes(
    new Date(),
    location.latitude,
    location.longitude,
  ).sunrise.toTimeString().split(" ")[0];
}

console.log(getSunRiseTime());
