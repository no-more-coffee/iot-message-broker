import { MqttClient } from "mqtt";

export interface BaseDevice {
  isPassive: boolean;

  onConnect(client: MqttClient): void;

  onMessage(client: MqttClient, topic: string, payload: Buffer): void;

  onClose(): void;
}
