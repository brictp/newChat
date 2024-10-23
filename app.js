import express, { Router } from "express";
import logger from "morgan";
import { config } from "dotenv";

import { Server } from "socket.io";
import { createServer } from "node:http";
import cookieParser from "cookie-parser";
import { repoUser } from "./models/mUser.js";
import { rChat } from "./routes/rChats.js";
import jwt from "jsonwebtoken";
import { SECRET_JWT_KEY } from "./config/config.js";
import { cChat } from "./controllers/cChat.js";

config();

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(logger("dev"));
app.use(cookieParser());

app.set("view engine", "ejs");

app.use((req, res, next) => {
  const token = req.cookies.access_token;
  req.session = { user: null };

  try {
    const data = jwt.verify(token, SECRET_JWT_KEY);
    req.session.user = data;
  } catch {}

  next(); // -> Seguir al siguiente middleware
});

io.on("connection", async (socket) => {
  const user = socket.handshake.auth.username;

  const res = await repoUser.searchUserByUsername(user);

  const id = res.rows[0].id;
  const username = res.rows[0].username;

  socket.on("chat message", async (msg) => {
    let result;
    try {
      result = await cChat.saveMessage({ msg, user_id: id });
    } catch (e) {
      console.log(e);
    }
    let message_id = result.lastInsertRowid.toString();
    io.emit("chat message", msg, message_id, username);
  });

  if (!socket.recovered) {
    // <- Recuperase todos los mensajes sin coneccion
    try {
      const results = await cChat.recovered(socket);

      results.rows.forEach((row) => {
        let { content, message_id, username } = row;
        message_id = message_id.toString();
        socket.emit("chat message", content, message_id, username);
      });
    } catch (e) {
      console.log(e);
    }
  }
});

app.use("/", rChat);

server.listen(PORT, () => {
  console.log(`APP corriendo en el puerto http://localhost:${PORT}`);
});
