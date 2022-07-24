import { Aedes, Client } from "aedes";
import { CONFIG } from "./config";
import { packMessage } from "./message";
import EventEmitter from "events";

export const EXTERNAL_COMMAND_EVENT = "on-external-command";
export const RESULT_EVENT = "on-external-result";
export const deviceEventsEmitter = new EventEmitter();
const enabledDevices = new Map();

function enableDevice(clientId: string, aedes: Aedes) {
  const interval = enabledDevices.get(clientId) || setInterval(() => {
      const command = { command: "please, send more" };
      aedes.publish(
        {
          topic: "commands",
          payload: packMessage(command),
          qos: 1,
          dup: false,
          retain: false,
          cmd: "publish",
        },
        (err) => {
          if (err) {
            console.error("Failed to publish", err);
          }
        },
      );
    },
    CONFIG.interval_millis,
  );

  enabledDevices.set(clientId, interval);
}

function disableDevice(clientId: string) {
  const interval = enabledDevices.get(clientId);
  if (interval) {
    clearInterval(interval);
  }
  enabledDevices.set(clientId, null);
}

export function onNewActiveDevice(aedes: Aedes, client: Client) {
  enableDevice(client.id, aedes);
}

export function onDeviceDisconnected(clientId: string) {
  disableDevice(clientId);
  enabledDevices.delete(clientId);
}

deviceEventsEmitter.on(EXTERNAL_COMMAND_EVENT, (aedes, data) => {
  const command = data.command;

  if (command === "list") {
    const connectedDevices = Array.from(enabledDevices.entries()).map(
      ([clientId, interval]) => [clientId, Boolean(interval)],
    );
    deviceEventsEmitter.emit(RESULT_EVENT, connectedDevices);
  } else if (["enable", "disable"].includes(command)) {
    const [clientId, ...rest] = data.args;
    if (command === "enable") {
      enableDevice(clientId, aedes);
    } else {
      disableDevice(clientId);
    }
    deviceEventsEmitter.emit(RESULT_EVENT, "Success");
  }
});
