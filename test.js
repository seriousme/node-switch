const SunCalc = require("suncalc");
const { location } = require("./.config.json");

function sunRiseHour() {
  return SunCalc.getTimes(
    new Date(),
    location.latitude,
    location.longitude
  ).sunrise.getHours();
}

console.log(sunRiseHour());
