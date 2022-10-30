import { ConfigJson } from "../lib/config.js";
import { triggerIFTTT } from "../lib/triggerIFTTT.js";

const { IFTTT } = ConfigJson;
console.log(IFTTT);

triggerIFTTT(IFTTT.event, IFTTT.key, "test message");
