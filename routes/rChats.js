import { Router } from "express";
import { cUser } from "../controllers/cUser.js";
import { cChat } from "../controllers/cChat.js";

export const rChat = Router();

rChat.get("/", cChat.main);
rChat.get("/chat", cChat.chat);
rChat.get("/protected", cChat.protected);

rChat.put("/updatemessage", cChat.updateMessage);
rChat.delete("/deletemessage", cChat.deleteMessage);

rChat.post("/register", cUser.create);
rChat.post("/login", cUser.login);
rChat.post("/logout", cUser.logout);
