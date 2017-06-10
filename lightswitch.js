const { spawn } = require("child_process");
const SWITCHCMD = "/usr/local/bin/lightswitch";

const switchMap = {
  device1: { group: "B", device: 1 },
  device2: { group: "B", device: 2 },
  device3: { group: "B", device: 3 },
  device4: { group: "C", device: 1 },
  device5: { group: "C", device: 2 },
  power: { group: "C", device: 2 }
};

exports.switch = (key, value) => {
  if (!switchMap[key]) return;
  const dev = switchMap[key];
  console.log(SWITCHCMD, "-g", dev.group, "-n", dev.device, value);
  const lightSwitch = spawn(SWITCHCMD, [
    "-g",
    dev.group,
    "-n",
    dev.device,
    value
  ]);

  lightSwitch.on("exit", code => {
    if (code !== 0) {
      console.log(SWITCHCMD, "exited with code", code);
    }
  });
  lightSwitch.on("error", err => {
    console.log("Failed to start", SWITCHCMD);
  });
};
