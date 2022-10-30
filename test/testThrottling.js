import { deviceSwitch } from "../lib/deviceSwitch.js";
for (let i = 0; i < 10; i++) {
  deviceSwitch("lamp/3", "on");
}
