import {config} from "dotenv";
import {
  connect as mqttConnect,
  IConnackPacket,
  IDisconnectPacket,
  ISubscriptionGrant,
  MqttClient
} from "mqtt";
import {ActiveDevice} from "./active-device";
import {BaseDevice} from "./basic-device";
import {PassiveDevice} from "./passive-device";

config();

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
  console.debug("Connect");

  client.subscribe(
    "commands",
    (err: Error, granted: ISubscriptionGrant[]) => {
      console.debug("Subscribe to commands");
      if (!err) {
        client.publish("clients", JSON.stringify({isPassive: device.isPassive}));
      } else {
        console.error(err);
      }
    }
  );

  device.onConnect(client)
});


client.on("message", (topic: string, payload: Buffer) => {
  const message = payload.toString();
  console.log("Received message", message);
  device.onMessage(client, topic, payload)
});

client.on("disconnect", (packet: IDisconnectPacket) => {
  console.debug("Disconnect", packet);
  device.onDisconnect()
});

client.on("error", (error: Error) => {
  console.error("Error", error);
});

client.on("close", () => {
  console.debug("Close");
  client.unsubscribe("commands");
  client.end();
});
