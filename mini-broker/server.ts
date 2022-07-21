import Aedes, {
  AedesPublishPacket,
  AuthenticateError,
  AuthErrorCode,
  Client,
  ConnackPacket,
  Subscription,
} from "aedes";
import fs from "fs";
import tls from "tls";

const aedes = Aedes();
const port = 8883;
const options = {
  key: fs.readFileSync("./certificates/broker-private.pem"),
  cert: fs.readFileSync("./certificates/broker-public.pem"),
};
const server = tls.createServer(options, aedes.handle);

async function setupAuthentication() {
  aedes.authenticate = (client, username, password, cb) => {
    if (
      username &&
      typeof username === "string" &&
      username === "brokerusername" &&
      password &&
      typeof password === "object" &&
      password.toString() === "brokerpassword"
    ) {
      cb(null, true);
      console.info(`Client authenticated successfully: ${client.id}`);
    } else {
      const authenticate_error = new Error() as AuthenticateError;
      authenticate_error.returnCode = AuthErrorCode.BAD_USERNAME_OR_PASSWORD;
      cb(authenticate_error, false);
    }
  };
}
server.listen(port, async () => {
  await setupAuthentication();
  console.log("server started and listening on port ", port);
});

aedes.on("client", async (client: Client) => {
  console.log(`Connected: \x1b[33m${client?.id}\x1b[0m. Broker: ${aedes.id}`);
});

aedes.on("clientDisconnect", async (client: Client) => {
  console.log(
    "Disconnected: \x1b[31m" + client.id + "\x1b[0m",
    "to broker",
    aedes.id
  );
});

// fired when a message is published
aedes.on("publish", async (packet: AedesPublishPacket, client: Client) => {
  if (client) {
    const client_id = "\x1b[31m" + client.id + "\x1b[0m";
    console.log(
      "Publish",
      client_id,
      "Payload",
      packet.payload.toString(),
      "Topic",
      packet.topic
    );
  } else {
    console.log("event:", packet.topic, packet.payload.toString());
  }
});
aedes.on("closed", () => {
  console.log("closed");
});
aedes.on("clientError", async (client: Client, error: Error) => {
  console.log("clientError", client.id, error.toString());
});
aedes.on("connackSent", async (packet: ConnackPacket, client: Client) => {
  console.log("connackSent", packet, client?.id);
});
aedes.on("subscribe", async (subscriptions: Subscription[], client: Client) => {
  const client_id = client ? "\x1b[31m" + client?.id + "\x1b[0m" : "";
  console.log("subscribe", client_id, subscriptions);
});
aedes.on("unsubscribe", async (unsubscriptions: string[], client: Client) => {
  const client_id = client ? "\x1b[31m" + client?.id + "\x1b[0m" : "";
  console.log("unsubscribe", client_id, unsubscriptions);
});
