import { config } from "dotenv";

config(); // Read .env file

export const CONFIG = {
  host: process.env.HOST || "localhost",
  port: process.env.PORT ? Number(process.env.PORT) : 8883,
  username: process.env.USERNAME || "broker-username",
  password: process.env.PASSWORD || "broker-password",
  device_name: process.env.DEVICE_NAME || "random-name",
  is_passive: process.env.IS_PASSIVE?.toLowerCase() === "true",
  interval_millis: process.env.INTERVAL_MILLIS ? Number(process.env.INTERVAL_MILLIS) : 1000,
};
