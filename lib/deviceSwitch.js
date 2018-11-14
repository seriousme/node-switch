const debug = require("debug")("switch");
debug.enabled = true;

const spawn = require("await-spawn");
const SWITCHCMD = "/usr/local/bin/kaku";

function valid(value) {
  const values = { on: true, off: true };
  return values[value] ? value : null;
}

function blindsval(value) {
  const values = { up: "off", down: "on" };
  return values[value] ? values[value] : null;
}

const switchMap = {
  "lamp/1": { group: "B", device: 1, valid },
  "lamp/2": { group: "B", device: 2, valid },
  "lamp/3": { group: "B", device: 3, valid },
  "lamp/4": { group: "C", device: 1, valid },
  power: { group: "C", device: 2, valid },
  "blinds/side": { group: "C", device: 3, valid: blindsval },
  "blinds/front": { group: "D", device: 1, valid: blindsval }
};

exports.deviceSwitch = async (key, val) => {
  debug("switch", key, val);
  const dev = switchMap[key];
  if (!dev) return;
  const value = dev.valid(val);
  if (value === null) return;
  await spawn(SWITCHCMD, ["-g", dev.group, "-n", dev.device, value]);
};