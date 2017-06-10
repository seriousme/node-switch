const ls = require("./lightswitch");
const express = require("express");

const port = 8080;
const staticSite = __dirname + "/public";

const state = {
  auto: "on",
  device1: "off",
  device2: "off",
  device3: "off",
  device4: "off",
  device5: "off",
  power: {}
};

const statevals = { on: "1", off: "0" };

function handlePower(query, client) {
  if (!query) return;
  if (!query.cmd) return;
  client = "ip" + client;
  if (query.cmd === "on") {
    if (Object.keys(state.power).length === 0) ls.switch("power", query.cmd);
    state.power[client] = "active";
  }
  if (query.cmd === "off") {
    delete state.power[client];
    if (Object.keys(state.power).length === 0) ls.switch("power", query.cmd);
  }
  if (query.cmd === "del") {
    state.power = {};
    ls.switch("power", "off");
  }
}

function handleState(query) {
  if (!query) return;
  for (var key in query) {
    console.log(key);
    if (state[key]) {
      const val = query[key];
      if (!statevals[val]) return;
      if (state[key] !== val) {
        // ls.switch(key, val);
        state[key] = val;
      }
    }
  }
}

const app = express();
app.use("/cgi-bin/switch", function(req, res) {
  handleState(req.query);
  res.json(state);
});
app.use("/cgi-bin/power", function(req, res) {
  handlePower(req.query, req.connection.remoteAddress);
  res.json(state);
});
app.use("/", express.static(staticSite));
app.use(function(req, res) {
  res.status(404).send("404: Page not found");
});

app.listen(port, function() {
  console.log("listening");
});
