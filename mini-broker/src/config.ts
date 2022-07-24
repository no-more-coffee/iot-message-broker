import { config } from "dotenv";

config(); // Read .env file

export const CONFIG = {
  port: process.env.PORT ? Number(process.env.PORT) : 8883,
  username: process.env.USERNAME || "broker-username",
  password: process.env.PASSWORD || "broker-password",
  interval_millis: process.env.INTERVAL_MILLIS ? Number(process.env.INTERVAL_MILLIS) : 1000,
  ws_host: process.env.WS_HOST || "localhost",
  ws_port: process.env.WS_PORT ? Number(process.env.WS_PORT) : 8080,
};
