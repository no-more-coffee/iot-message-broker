import { connect as mqttConnect, IConnackPacket, MqttClient } from "mqtt";
import { ActiveDevice } from "./active-device";
import { PassiveDevice } from "./passive-device";
import { BaseDevice } from "./base-device";
import { CONFIG } from "./config";
import { packMessage } from "./message";

const device: BaseDevice = CONFIG.is_passive ? new PassiveDevice() : new ActiveDevice();

let client: MqttClient = mqttConnect({
  ...CONFIG,
  protocol: "mqtts",
  rejectUnauthorized: false,
});

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
        })
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
