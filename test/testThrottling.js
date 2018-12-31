const { deviceSwitch } = require("../lib/deviceSwitch");
for (let i = 0; i < 10; i++) {
  deviceSwitch("lamp/3", "on");
}
