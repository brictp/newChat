import { configDotenv } from "dotenv";

configDotenv();

export const { SALT_ROUNDS, SECRET_JWT_KEY, TOKEN, URL, PORT } = process.env;
