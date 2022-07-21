import * as mqtt from "mqtt";
require("dotenv").config();

let client: mqtt.MqttClient = mqtt.connect({
  port: process.env.PORT ? Number(process.env.PORT) : 8883,
  host: "localhost",
  rejectUnauthorized: false,
  protocol: "mqtts",
  username: "brokerusername",
  password: "brokerpassword",
});
const is_passive = process.env.IS_PASSIVE
  ? Boolean(process.env.IS_PASSIVE)
  : false;
let nIntervId: string | number | NodeJS.Timeout | null | undefined;

client.on("connect", (packet: mqtt.IConnackPacket) => {
  console.log("connect");

  client.subscribe(
    "commands",
    (err: Error, granted: mqtt.ISubscriptionGrant[]) => {
      console.log("subscribe");
      if (!err) {
        client.publish("clients", "HELLO");
      } else {
        console.error(err);
      }
    }
  );

  if (is_passive) {
    console.log("is_passive");
    if (!nIntervId) {
      nIntervId = setInterval(() => sendMockMeasure(client), 1000);
    }
  } else {
  }
});

function sendMockMeasure(client: mqtt.MqttClient): void {
  const clientType = is_passive ? "passive" : "active";
  const measure = Math.floor(Math.random() * 100);
  const message = { "some-measure": measure };
  client.publish(`measures/${clientType}/random`, JSON.stringify(message));
}

client.on("message", (topic: string, payload: Buffer) => {
  console.log("message", payload.toString());
  if (topic === "commands") {
    if (nIntervId) {
      clearInterval(nIntervId);
      nIntervId = null;
    }
  }
  // client.unsubscribe("presence");
  // client.end();
});

client.on("disconnect", (packet: mqtt.IDisconnectPacket) => {
  console.log("disconnect", packet);
  if (nIntervId) {
    clearInterval(nIntervId);
    nIntervId = null;
  }
});

client.on("error", (error: Error) => {
  console.log("error", error);
});

client.on("close", () => {
  console.log("close");
});

client.on("end", () => {
  console.log("end");
});
