import { get } from "https";
import Debug from "debug";

const debug = Debug("triggerIFTTT");
// debug.enabled = true;

export function triggerIFTTT(event, key, message) {
	const url = encodeURI(
		`https://maker.ifttt.com/trigger/${event}/with/key/${key}?value1=${message}`,
	);
	debug("calling", url);
	get(url);
}
