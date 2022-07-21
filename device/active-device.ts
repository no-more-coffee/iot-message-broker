import {MqttClient} from "mqtt";
import {BaseDevice} from "./basic-device";
import {probe} from "./measures";

export class ActiveDevice implements BaseDevice {
  isPassive = false;

  onConnect(client: MqttClient): void {
  }

  onMessage(client: MqttClient, topic: string, payload: Buffer): void {
    if (topic !== "commands")
      return

    const message = payload.toString();
    if (message === "send more") {
      const measure = probe()
      client.publish(`measures/active/random`, measure);
    }
  }

  onDisconnect(): void {
  }
}