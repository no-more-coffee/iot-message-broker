import {MqttClient} from "mqtt";
import {probe} from "./measures";
import {BaseDevice} from "./base-device";
import {CONFIG} from "./config";

let passiveInterval: string | number | NodeJS.Timeout | null | undefined = null

export class PassiveDevice implements BaseDevice {
  isPassive = true;

  onConnect(client: MqttClient): void {
    passiveInterval = passiveInterval || setInterval(
      () => {
        const measure = probe()
        client.publish(`measures/passive/${CONFIG.device_name}`, JSON.stringify(measure));
      },
      CONFIG.interval_millis,
    );
  }

  onMessage(client: MqttClient, topic: string, payload: Buffer): void {
  }

  onClose(): void {
    if (passiveInterval) {
      clearInterval(passiveInterval);
      passiveInterval = null;
    }
  }
}