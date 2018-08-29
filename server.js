const mqttPort = 1883;
const httpPort = 8080;
const staticSite = __dirname + "/public";
const mqttJS = __dirname + "/node_modules/mqtt/dist/mqtt.min.js";

const NedbPersistence = require("aedes-persistence-nedb");
const db = new NedbPersistence();
const aedes = require("aedes")({ persistence: db });
// MQTT server
const server = require("net").createServer(aedes.handle);

server.listen(mqttPort, () => {
  console.log("MQTT server listening on port", mqttPort);
});

// HTTP server
const express = require("express");
const app = express();
app.use("/mqtt.js", (req, res) => res.sendFile(mqttJS));
app.use("/publish", (req, res) => {
  console.log(
    `new http publish on "${req.query.topic}" from ${
      req.connection.remoteAddress
    }`
  );
  res.json(
    aedes.publish({
      cmd: "publish",
      qos: req.query.qos || 0,
      topic: req.query.topic,
      payload: Buffer.from(req.query.message),
      retain: req.query.retain
    })
  );
});
app.use("/", express.static(staticSite));
const httpServer = require("http").createServer(app);

// WebSockets server
const ws = require("websocket-stream");

ws.createServer(
  {
    server: httpServer
  },
  aedes.handle
);

httpServer.listen(httpPort, () => {
  console.log("websocket server listening on port", httpPort);
});

aedes.on("publish", (packet, client) => {
  if (client) {
    console.log(
      "message from client",
      client.id,
      packet.topic,
      packet.payload.toString()
    );
  }
});

aedes.on("client", client => {
  const clientType = client.conn.remoteAddress
    ? "MQTT"
    : "MQTT over websockets";
  console.log(
    `new ${clientType} client "${client.id}" connecting from ${client.conn
      .remoteAddress || client.conn.socket._socket.remoteAddress}`
  );
});
