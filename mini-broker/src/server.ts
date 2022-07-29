import { WebSocketServer } from "ws";
import { createServer, TlsOptions } from "tls";
import { CONFIG } from "./config";
import { mqttServer } from "./mqtt-server";
import { IncomingMessage } from "http";
import { readFileSync } from "fs";
import { deviceEventsEmitter, EXTERNAL_COMMAND_EVENT, RESULT_EVENT } from "./active-clients";

const options: TlsOptions = {
  key: readFileSync("./certificates/server-key.pem"),
  cert: readFileSync("./certificates/server-cert.pem"),

  // This is necessary only if using client certificate authentication.
  requestCert: true,

  // This is necessary only if the client uses a self-signed certificate.
  ca: [readFileSync("./certificates/client-cert.pem")],

  rejectUnauthorized: true,
};
const server = createServer(options, mqttServer.handle);

server.listen(CONFIG.port, () => {
  console.debug(`Server started. Port: ${CONFIG.port}`);
});


const wss = new WebSocketServer({ port: CONFIG.ws_port });

wss.on("connection", (ws, request: IncomingMessage) => {
  console.debug("Connected ws client");

  ws.on("message", data => {
    try {
      const parsedData = JSON.parse(data.toString());
      console.info("Received ws message:", parsedData);
      deviceEventsEmitter.emit(EXTERNAL_COMMAND_EVENT, mqttServer, parsedData);
    } catch (e) {
      console.debug(e);

      const errorString = (e instanceof Error)
        ? e.toString()
        : (typeof e === "string" || e instanceof String)
          ? e : "Unknown error";

      ws.send(JSON.stringify(errorString));
    }
  });

  deviceEventsEmitter.on(RESULT_EVENT, (result) => {
    ws.send(JSON.stringify(result));
  });

  ws.on("close", (code, reason) => {
    console.debug("Closed ws:", code, reason.toString());
  });
});
