import {config} from "dotenv";

config(); // Read .env file

export const CONFIG = {
  port: process.env.PORT ? Number(process.env.PORT) : 8883,
  username: process.env.USERNAME || "broker-username",
  password: process.env.PASSWORD || "broker-password",
  interval_millis: process.env.INTERVAL_MILLIS ? Number(process.env.INTERVAL_MILLIS) : 1000,
}
