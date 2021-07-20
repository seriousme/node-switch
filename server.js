const debug = require("debug")("mqttServer");
debug.enabled = true;
const mqttPort = 1883;
const httpPort = 8080;
const staticSite = __dirname + "/client/public";
const mqttJS = __dirname + "/node_modules/mqtt/dist/mqtt.min.js";
const level = require("level");
const aedesPersistencelevel = require("aedes-persistence-level");
const db = aedesPersistencelevel(level("./data"));

const aedes = require("aedes")({ persistence: db });
// MQTT server
const server = require("net").createServer(aedes.handle);

server.listen(mqttPort, () => {
  debug("MQTT server listening on port", mqttPort);
});

// HTTP server
const express = require("express");
const app = express();
app.use("/mqtt.js", (req, res) => res.sendFile(mqttJS));
app.use("/", express.static(staticSite));
const httpServer = require("http").createServer(app);

// WebSockets server
const WebSocket = require("ws");

const wss = new WebSocket.Server({
  server: httpServer,
});
wss.on("connection", function connection(ws, req) {
  const wsStream = WebSocket.createWebSocketStream(ws);
  aedes.handle(wsStream, req);
});

httpServer.listen(httpPort, () => {
  debug("websocket server listening on port", httpPort);
});

aedes.on("publish", (packet, client) => {
  if (client) {
    debug(
      "message from client",
      client.id,
      packet.topic,
      packet.payload.toString()
    );
  }
});

aedes.on("client", (client) => {
  const clientType = client.conn.remoteAddress
    ? "MQTT"
    : "MQTT over websockets";
  debug(
    `new ${clientType} client "${client.id}" connecting from ${
      client.conn.remoteAddress || client.req.socket.remoteAddress
    }`
  );
});
