import {Aedes, Client} from "aedes";

const INTERVAL_MILLIS = process.env.INTERVAL_MILLIS ? Number(process.env.INTERVAL_MILLIS) : 1000;
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
          payload: Buffer.from(JSON.stringify(command)),
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
    INTERVAL_MILLIS,
  )
}

export function onDeviceDisconnected(client_id: string) {
  const deleted = activeDevices.delete(client_id);

  if (deleted && activeDevices.size === 0 && activeInterval) {
    clearInterval(activeInterval);
    activeInterval = null;
  }
}