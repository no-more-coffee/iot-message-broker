import Server, { AedesPublishPacket, Client, Subscription } from "aedes";
import { unpackMessage } from "./message";
import { onDeviceDisconnected, onNewActiveDevice } from "./active-clients";
import { authHandler } from "./authenticate";

const aedes = Server({
  authenticate: authHandler,
});

aedes.on("client", async (client: Client) => {
  console.log(`Connected: ${client.id}`);
});

// fired when a message is published
aedes.on("publish", async (packet: AedesPublishPacket, client: Client) => {
  if (!client) {
    // Ignore broker own messages
    console.debug("...", packet.topic);
    return;
  }

  let data = unpackMessage(packet.payload);
  console.log("On publish:", client.id, "Payload:", data, "Topic:", packet.topic);

  if (packet.topic === "clients") {
    const isPassive = data?.isPassive;
    console.log("New client:", isPassive, data);
    if (typeof isPassive === "boolean" && !isPassive) {
      onNewActiveDevice(aedes, client);
    }
  }
});

aedes.on("clientDisconnect", async (client: Client) => {
  console.log(`Disconnected: ${client.id}`);
  onDeviceDisconnected(client.id);
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

export const mqttServer = aedes;