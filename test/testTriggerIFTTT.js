const { IFTTT } = require("../.config.json");
const { triggerIFTTT } = require("../lib/triggerIFTTT");

console.log(IFTTT);

triggerIFTTT(IFTTT.event, IFTTT.key, "test message");
