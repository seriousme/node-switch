import Debug from "debug";
import spawn from "await-spawn";

const debug = Debug("switch");
// debug.enabled = true;

const SWITCHCMD = "/usr/local/bin/kaku";
const queue = { cmds: [], running: false };
const switchMap = {
	"lamp/1": { group: "B", device: 1, valid },
	"lamp/2": { group: "B", device: 2, valid },
};

function sleep(sec) {
	return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

function valid(value) {
	const values = { on: true, off: true };
	return values[value] ? value : null;
}

function blindsval(value) {
	const values = { up: "off", down: "on" };
	return values[value] ? values[value] : null;
}

async function doSwitch(dev, value) {
	queue.cmds.push({ dev, value });
	if (queue.running) {
		return;
	}
	queue.running = true;
	while (queue.cmds.length > 0) {
		const { dev, value } = queue.cmds.shift();
		//console.log(SWITCHCMD, ["-g", dev.group, "-n", dev.device, value]);
		await spawn(SWITCHCMD, ["-g", dev.group, "-n", dev.device, value]);
		await sleep(0.1);
	}
	queue.running = false;
}

export async function deviceSwitch(key, val) {
	debug("switch", key, val);
	const dev = switchMap[key];
	if (!dev) return;
	const value = dev.valid(val);
	if (value === null) return;
	doSwitch(dev, value);
}
