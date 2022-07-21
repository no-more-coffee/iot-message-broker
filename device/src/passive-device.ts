import {MqttClient} from "mqtt";
import {probe} from "./measures";
import {BaseDevice} from "./base-device";

const INTERVAL_MILLIS = process.env.INTERVAL_MILLIS ? Number(process.env.INTERVAL_MILLIS) : 1000;
let passiveInterval: string | number | NodeJS.Timeout | null | undefined = null

export class PassiveDevice implements BaseDevice {
  isPassive = true;

  onConnect(client: MqttClient): void {
    passiveInterval = passiveInterval || setInterval(
      () => {
        const measure = probe()
        client.publish(`measures/passive/random`, JSON.stringify(measure));
      },
      INTERVAL_MILLIS,
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