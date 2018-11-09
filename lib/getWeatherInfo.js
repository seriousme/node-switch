const axios = require("axios");

exports.getWeatherInfo = async (location, key) => {
  const url = `http://weerlive.nl/api/json-data-10min.php?key=${key}&locatie=${location}`;
  const response = await axios.get(url);
  try {
    const today = response.data.liveweer[0];
    return {
      date: Number(new Date()),
      weer: today.d0weer,
      tmax: Number(today.d0tmax),
      tmin: Number(today.d0tmin),
      windk: Number(today.d0windk),
      windr: today.d0windr,
      neerslag: Number(today.d0neerslag),
      zon: Number(today.d0zon)
    };
  } catch (error) {
    throw new Error("error parsing weather data");
  }
};
