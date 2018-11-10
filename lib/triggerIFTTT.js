const debug = require("debug")("triggerIFTTT");
debug.enabled = true;
const https = require("https");

exports.triggerIFTTT = (event, key, message) => {
  const url = encodeURI(
    `https://maker.ifttt.com/trigger/${event}/with/key/${key}?value1=${message}`
  );
  debug("calling", url);
  https.get(url);
};
