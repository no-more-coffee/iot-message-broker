import {config} from "dotenv";

config();

import {connect as mqttConnect, IConnackPacket, MqttClient} from "mqtt";
import {ActiveDevice} from "./active-device";
import {PassiveDevice} from "./passive-device";
import {BaseDevice} from "./base-device";


const device: BaseDevice = (process.env.IS_PASSIVE?.toLowerCase() === 'true')
  ? new PassiveDevice()
  : new ActiveDevice()

let client: MqttClient = mqttConnect({
  protocol: "mqtts",
  host: process.env.HOST || "localhost",
  port: process.env.PORT ? Number(process.env.PORT) : 8883,
  username: process.env.USERNAME || "brokerusername",
  password: process.env.PASSWORD || "brokerpassword",
  rejectUnauthorized: false,
});

client.on("connect", (packet: IConnackPacket) => {
  console.debug("Connected");

  client.subscribe(
    "commands",
    (err, _granted) => {
      console.debug("Subscribe to commands");
      if (err) {
        console.error(err);
      } else {
        client.publish("clients", JSON.stringify({
          isPassive: device.isPassive,
        }));
      }
    }
  );

  device.onConnect(client)
});

client.on("message", (topic: string, payload: Buffer) => {
  device.onMessage(client, topic, payload)
});

client.on("error", (error: Error) => {
  console.error("Error", error);
});

client.on("close", () => {
  console.debug("Close");
  device.onClose()
  client.unsubscribe("commands");
  client.end();
});
