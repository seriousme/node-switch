const SunCalc = require("suncalc");
const { location } = require("./.config.json");

function getSunRiseTime() {
  return SunCalc.getTimes(
    new Date(),
    location.latitude,
    location.longitude
  ).sunrise.toTimeString().split(' ')[0];
}

console.log(getSunRiseTime());
