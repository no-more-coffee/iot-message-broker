import {Aedes, Client} from "aedes";
import {CONFIG} from "./config";
import {packMessage} from "./message";

const activeDevices = new Set();
let activeInterval: string | number | NodeJS.Timeout | null | undefined = null

export function onNewActiveDevice(aedes: Aedes, client: Client) {
  activeDevices.add(client.id)

  activeInterval = activeInterval || setInterval(
    () => {
      const command = {"command": "please, send more"};
      aedes.publish(
        {
          topic: "commands",
          payload: packMessage(command),
          qos: 1,
          dup: false,
          retain: false,
          cmd: "publish",
        },
        function (err) {
          if (err) {
            console.error('Failed to publish', err);
          }
        }
      )
    },
    CONFIG.interval_millis,
  )
}

export function onDeviceDisconnected(client_id: string) {
  const deleted = activeDevices.delete(client_id);

  if (deleted && activeDevices.size === 0 && activeInterval) {
    clearInterval(activeInterval);
    activeInterval = null;
  }
}