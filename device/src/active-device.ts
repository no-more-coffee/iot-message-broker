import {MqttClient} from "mqtt";
import {probe} from "./measures";
import {BaseDevice} from "./base-device";
import {CONFIG} from "./config";

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
      client.publish(`measures/active/${CONFIG.device_name}`, JSON.stringify(measure));
    }
  }

  onClose(): void {
  }
}