import {MqttClient} from "mqtt";
import {probe} from "./measures";
import {BaseDevice} from "./base-device";

const COMMAND_SEND_MORE = JSON.stringify({"command": "please, send more"});

export class ActiveDevice implements BaseDevice {
  isPassive = false;

  onConnect(client: MqttClient): void {
  }

  onMessage(client: MqttClient, topic: string, payload: Buffer): void {
    if (topic !== "commands")
      return

    const message = payload.toString();
    if (message === COMMAND_SEND_MORE) {
      console.log("Received command", message);
      const measure = probe()
      client.publish(`measures/active/random`, JSON.stringify(measure));
    }
  }

  onClose(): void {
  }
}