import {config} from "dotenv";

config(); // Read .env file

import Aedes, {AedesPublishPacket, Client, Subscription,} from "aedes";
import {createServer} from "tls";
import {readFileSync} from "fs";
import {authHandler} from "./authenticate";
import {onDeviceDisconnected, onNewActiveDevice} from "./active-clients";


const aedes = Aedes();
const port = process.env.PORT ? Number(process.env.PORT) : 8883;
const options = {
  key: readFileSync("./certificates/broker-private.pem"),
  cert: readFileSync("./certificates/broker-public.pem"),
};
const server = createServer(options, aedes.handle);

server.listen(port, async () => {
  aedes.authenticate = authHandler
  console.debug(`Server started. Port: ${port}`);
});

aedes.on("client", async (client: Client) => {
  console.log(`Connected: ${client.id}`);
});

// fired when a message is published
aedes.on("publish", async (packet: AedesPublishPacket, client: Client) => {
  let data = packet.payload.toString();

  if (!client) {
    // Ignore broker own messages
    console.debug("...", packet.topic, data);
    return;
  }

  console.log("On publish", client.id, "Payload", data, "Topic", packet.topic);

  if (packet.topic === "clients") {
    const payload = JSON.parse(data);
    const isPassive = payload?.isPassive
    console.log("New client", isPassive, payload);
    if (typeof isPassive === "boolean" && isPassive === false) {
      onNewActiveDevice(aedes, client)
    }
  }
});

aedes.on("clientDisconnect", async (client: Client) => {
  console.log(`Disconnected: ${client.id}`);
  onDeviceDisconnected(client.id)
});

aedes.on("clientError", async (client: Client, error: Error) => {
  console.error("Error", client?.id, error.toString());
});

aedes.on("subscribe", async (subscriptions: Subscription[], client: Client) => {
  console.log("Subscribe", client?.id, subscriptions);
});

aedes.on("unsubscribe", async (unsubscriptions: string[], client: Client) => {
  console.log("Unsubscribe", client?.id, unsubscriptions);
});
