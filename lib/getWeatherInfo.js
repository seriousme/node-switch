const axios = require("axios");

exports.getWeatherInfo = (location, key) => {
  const url = `http://weerlive.nl/api/json-data-10min.php?key=${key}&locatie=${location}`;
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then(response => {
        try {
          const today = response.data.liveweer[0];
          const data = {
            date: Number(new Date()),
            weer: today.d0weer,
            tmax: Number(today.d0tmax),
            tmin: Number(today.d0tmin),
            windk: Number(today.d0windk),
            windr: today.d0windr,
            neerslag: Number(today.d0neerslag),
            zon: Number(today.d0zon)
          };
          resolve(data);
        } catch (error) {
          reject(response.data);
        }
      })
      .catch(error => {
        reject(error.toString());
      });
  });
};
