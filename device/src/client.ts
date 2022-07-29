import { connect as mqttConnect, IConnackPacket, MqttClient } from "mqtt";
import { ActiveDevice } from "./active-device";
import { PassiveDevice } from "./passive-device";
import { BaseDevice } from "./base-device";
import { CONFIG } from "./config";
import { packMessage } from "./message";
import { readFileSync } from "fs";
import { IClientOptions } from "mqtt/types/lib/client";

const device: BaseDevice = CONFIG.is_passive ? new PassiveDevice() : new ActiveDevice();

let client: MqttClient = mqttConnect({
  ...CONFIG,
  protocol: "mqtts",

  // Necessary only if the server requires client certificate authentication.
  key: readFileSync("./certificates/client-key.pem"),
  cert: readFileSync("./certificates/client-cert.pem"),

  // Necessary only if the server uses a self-signed certificate.
  ca: [readFileSync("./certificates/server-cert.pem")],

  // Necessary only if the server's cert isn't for "localhost".
  checkServerIdentity: () => null,

  rejectUnauthorized: true,
} as IClientOptions);

client.on("connect", (packet: IConnackPacket) => {
  console.debug("Connected");

  client.subscribe("commands", (err, _granted) => {
    console.debug("Subscribe to commands");
    if (err) {
      console.error(err);
    } else {
      client.publish(
        "clients",
        packMessage({
          isPassive: device.isPassive,
        }),
      );
    }
  });

  device.onConnect(client);
});

client.on("message", (topic: string, payload: Buffer) => {
  device.onMessage(client, topic, payload);
});

client.on("error", (error: Error) => {
  console.error("Error", error);
});

client.on("close", () => {
  console.debug("Close");
  device.onClose();
  client.unsubscribe("commands");
  client.end();
});
