const { spawn } = require("child_process");
const SWITCHCMD = "/usr/local/bin/lightswitch";

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

exports.switch = (key, val) => {
  console.log(`${SWITCHCMD} -g ${dev.group} -n ${dev.device} ${value}`);

  return new Promise((resolve, reject) => {
    console.log("switch", key, val);
    const dev = switchMap[key];
    if (!dev) reject();
    const value = dev.valid(val);
    if (value === null) reject();
    const lightSwitch = spawn(SWITCHCMD, [
      "-g",
      dev.group,
      "-n",
      dev.device,
      value
    ]);

    lightSwitch.on("exit", code => {
      if (code !== 0) {
        console.log();
        reject(`${SWITCHCMD} exited with code ${code}`);
      } else {
        resolve("OK");
      }
    });

    lightSwitch.on("error", err => {
      console.log("Failed to start", SWITCHCMD);
      reject(`Failed to start ${SWITCHCMD}`);
    });
  });
};
