import {BaseDevice} from "./basic-device";
import {MqttClient} from "mqtt";
import {probe} from "./measures";

const INTERVAL_MILLIS = process.env.INTERVAL_MILLIS ? Number(process.env.INTERVAL_MILLIS) : 1000;
let passiveInterval: string | number | NodeJS.Timeout | null | undefined = null

export class PassiveDevice implements BaseDevice {
  isPassive = true;

  onConnect(client: MqttClient): void {
    console.log("isPassive");
    passiveInterval = passiveInterval || setInterval(
      () => {
        const measure = probe()
        client.publish(`measures/passive/random`, measure);
      },
      INTERVAL_MILLIS,
    );
  }

  onMessage(client: MqttClient, topic: string, payload: Buffer): void {
    if (topic !== "commands")
      return

    const message = payload.toString();
    if (message === "stop") {
      if (passiveInterval) {
        clearInterval(passiveInterval);
        passiveInterval = null;
      }
    }
  }

  onDisconnect(): void {
    if (passiveInterval) {
      clearInterval(passiveInterval);
      passiveInterval = null;
    }
  }
}