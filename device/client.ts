import * as mqtt from "mqtt";
let client: mqtt.MqttClient = mqtt.connect("mqtts://localhost:8883", {
  port: 8883,
  host: 'localhost',
  rejectUnauthorized: false,
  protocol: 'mqtts',
  username: 'brokerusername',
  password: 'brokerpassword',
});

client.on("connect", (packet: mqtt.IConnackPacket) => {
  console.log("connect");
  // client.subscribe(
  //   "presence",
  //   (err: Error, granted: mqtt.ISubscriptionGrant[]) => {
  //     console.log("subscribe");
  //     if (!err) {
  //       client.publish("presence", "HELLO");
  //     } else {
  //       console.error(err);
  //     }
  //   }
  // );
});

client.on("message", (topic: string, payload: Buffer) => {
  // message is Buffer
  console.log("message", payload.toString());
  client.unsubscribe("presence");
  client.end();
});

client.on("disconnect", (packet: mqtt.IDisconnectPacket) => {
  console.log("disconnect", packet);
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
