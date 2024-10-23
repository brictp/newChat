import { createClient } from "@libsql/client";
import { config } from "dotenv";

config();

export const db = createClient({
  url: process.env.URL,
  authToken: process.env.TOKEN,
});
