import jwt from "jsonwebtoken";
import { repositoryChat } from "../models/mChat.js";
import { SECRET_JWT_KEY } from "../config/config.js";

export class cChat {
  static async main(req, res) {
    const { user } = req.session;

    res.render("index", user);
  }

  static async registerPage(req, res) {
    const { user } = req.session;

    if (user) {
      res.render("index", user);
      return;
    }

    res.render("register");
  }

  static async chat(req, res) {
    const { user } = req.session;

    if (!user) return res.send("<h1>No tienes acceso a esta pagina</h1>");

    res.render("chat", user);
  }

  static async protected(req, res) {
    const { user } = req.session;

    if (user.rol !== "admin") {
      res.render("protected", user);
      return;
    }

    res.render("admin", user);
  }

  static async saveMessage(msg, user_id) {
    try {
      let result = await repositoryChat.insert(msg, user_id);

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async recovered(socket) {
    try {
      let result = await repositoryChat.recovery(socket);
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async updateMessage(req, res) {
    const { message_id, content } = req.body;
    const { user } = req.session;

    try {
      let message = await repositoryChat.searchMessageById(message_id);

      if (user.id !== message.rows[0].user_id || user.rol !== "admin") {
        return res
          .status(401)
          .json({ message: "No tienes acceso para Editar este mensaje" });
      }

      await repositoryChat.updateMessage(message_id, content);

      res.json({ message: "mensaje actualizado" });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async changeRol(req, res) {
    let { access_token } = req.cookies;

    if (!access_token) {
      res.status(401).json({ message: "Error no authorized " });
      return;
    }

    let data = jwt.verify(access_token, SECRET_JWT_KEY);

    data.rol === "user" ? (data.rol = "admin") : (data.rol = "user");

    const newToken = jwt.sign(data, SECRET_JWT_KEY);

    res
      .cookie("access_token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 10080,
      })
      .json({ message: "rol changed" });

    return;
  }

  static async deleteMessage(req, res) {
    const { message_id } = req.body;
    const { user } = req.session;

    try {
      let message = await repositoryChat.searchMessageById(message_id);

      if (user.id === message.rows[0].user_id || user.rol === "admin") {
        await repositoryChat.deleteMessage(message_id);
        return res.json({ message: "Mensaje eliminado" });
      }

      return res
        .status(401)
        .json({ message: "No tienes acceso para Eliminar este mensaje" });
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
