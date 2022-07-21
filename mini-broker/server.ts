import {config} from "dotenv";

config(); // Read .env file

import Aedes, {
  AedesPublishPacket,
  Client,
  Subscription,
} from "aedes";
import {createServer} from "tls";
import {readFileSync} from "fs";
import {authHandler} from "./authenticate";

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
  console.info(`Connected: ${client.id}`);
});

aedes.on("clientDisconnect", async (client: Client) => {
  console.info(`Disconnected: ${client.id}`);
});

let receivedMessages: number = 0;
const INTERVAL_MILLIS = process.env.INTERVAL_MILLIS ? Number(process.env.INTERVAL_MILLIS) : 1000;
let activeInterval: string | number | NodeJS.Timeout | null | undefined = null

// fired when a message is published
aedes.on("publish", async (packet: AedesPublishPacket, client: Client) => {
  if (!client) {
    console.debug("event:", packet.topic, packet.payload.toString());
    return;
  }

  const client_id = "\x1b[31m" + client.id + "\x1b[0m";
  console.info(
    "On publish",
    client_id,
    "Payload",
    packet.payload.toString(),
    "Topic",
    packet.topic
  );

  if (packet.topic === "clients") {
    const payload = JSON.parse(packet.payload.toString());
    console.info("Clients", payload);
    if (payload?.isPassive === false) {
      activeInterval = activeInterval || setInterval(
        () => {
          aedes.publish(
            {
              topic: "commands",
              payload: Buffer.from("send more"),
              qos: 1,
              dup: false,
              retain: false,
              cmd: "publish",
            },
            function (err) {
              console.error(err);
            }
          )
        },
        INTERVAL_MILLIS,
      );
    }
  }

  if (packet.topic.startsWith("measures")) {
    receivedMessages += 1;
    if (receivedMessages > 4) {
      receivedMessages = 0;
      aedes.publish(
        {
          topic: "commands",
          payload: Buffer.from("stop"),
          qos: 1,
          dup: false,
          retain: false,
          cmd: "publish",
        },
        function (err) {
          console.error(err);
        }
      );
    }
  }
});

aedes.on("clientError", async (client: Client, error: Error) => {
  console.error("clientError", client.id, error.toString());
});

aedes.on("subscribe", async (subscriptions: Subscription[], client: Client) => {
  const client_id = client ? "\x1b[31m" + client?.id + "\x1b[0m" : "";
  console.info("subscribe", client_id, subscriptions);
});

aedes.on("unsubscribe", async (unsubscriptions: string[], client: Client) => {
  const client_id = client ? "\x1b[31m" + client?.id + "\x1b[0m" : "";
  console.info("unsubscribe", client_id, unsubscriptions);
});

aedes.on("closed", () => {
  console.debug("closed");
});
