import { Router } from "express";
import { cUser } from "../controllers/cUser.js";
import { cChat } from "../controllers/cChat.js";

export const rChat = Router();

rChat.get("/", cChat.main);
rChat.get("/chat", cChat.chat);
rChat.get("/protected", cChat.protected);
rChat.get("/register", cChat.registerPage);

rChat.put("/updatemessage", cChat.updateMessage);
rChat.delete("/deletemessage", cChat.deleteMessage);

rChat.post("/rol", cChat.changeRol);

rChat.post("/api/register", cUser.create);
rChat.post("/api/login", cUser.login);
rChat.post("/api/logout", cUser.logout);
