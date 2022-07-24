import WebSocket from "ws";
import { CONFIG } from "./config";

const ws = new WebSocket(`ws://${CONFIG.ws_host}:${CONFIG.ws_port}`);

ws.on("open", () => {
  console.log("Open.");

  const [_nodePath, _filePath, command, ...commandArgs] = process.argv;
  if (!command) {
    console.warn(
      "Please, specify command. Available commands: \"list\", \"enable\", \"disable\"",
    );
    ws.terminate();
    return;
  }

  ws.send(JSON.stringify({ command: command, args: commandArgs }));
});

ws.on("message", data => {
  console.log("Received: %s", data);
  ws.terminate();
});

ws.on("close", (code, reason) => {
  console.log("Closed.", code, reason.toString());
});
