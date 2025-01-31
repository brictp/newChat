import express from "express";
import logger from "morgan";
import { Server } from "socket.io";
import { createServer } from "node:http";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import { repoUser } from "./models/mUser.js";
import { rChat } from "./routes/rChats.js";
import { cChat } from "./controllers/cChat.js";
import { PORT } from "./config/config.js";
import { verifyUser } from "./middleware/verify.js";

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(logger("dev"));
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(verifyUser);

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
    } catch (error) {
      throw new Error(error.mesesage);
    }
  }
});

app.use("/", rChat);

server.listen(PORT, () => {
  console.log(`APP corriendo en el puerto http://localhost:${PORT}`);
});
