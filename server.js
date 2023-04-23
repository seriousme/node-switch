import { createServer as netCreateServer } from "net";
import { createServer as httpCreateServer } from "http";
import Express from "express";
import Aedes from "aedes";
import { Level } from "level";
import aedesPersistencelevel from "aedes-persistence-level";
import { createWebSocketStream, WebSocketServer } from "ws";
import Debug from "debug";

const debug = Debug("mqttServer");
debug.enabled = true;
const mqttPort = 1883;
const httpPort = 8080;

const localFile = (file) => new URL(file, import.meta.url).pathname;
const staticSite = localFile("./client/dist");
const mqttJS = localFile("./node_modules/mqtt/dist/mqtt.min.js");

// Config Aedes MQTT server
const db = aedesPersistencelevel(new Level("./data"));
const aedes = Aedes({ persistence: db });
aedes.on("publish", (packet, client) => {
	if (client) {
		debug(
			"message from client",
			client.id,
			packet.topic,
			packet.payload.toString(),
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
		}`,
	);
});

// Config MQTT Socket server
const server = netCreateServer(aedes.handle);

// Config HTTP server
const app = Express();
app.use("/mqtt.js", (req, res) => res.sendFile(mqttJS));
app.use("/", Express.static(staticSite));
const httpServer = httpCreateServer(app);

// Config WebSockets server
const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", function connection(ws, req) {
	const wsStream = createWebSocketStream(ws);
	aedes.handle(wsStream, req);
});

// Start the show
server.listen(mqttPort, () => {
	debug("MQTT server listening on port", mqttPort);
});

httpServer.listen(httpPort, () => {
	debug("websocket server listening on port", httpPort);
});
