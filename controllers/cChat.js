import { repositoryChat } from "../models/mChat.js";

export class cChat {
  static async main(req, res) {
    const { user } = req.session;

    res.render("index", user);
  }

  static async chat(req, res) {
    const { user } = req.session;

    if (!user) return res.send("<h1>No tienes acceso a esta pagina</h1>");

    res.render("chat", user);
  }

  static async protected(req, res) {
    const { user } = req.session;

    console.log(user);

    if (user.rol !== "admin")
      return res.status(401).send(
        `<h1>No tienes accesso a esa pagina, solo los usuarios con rol de admin pueden acceder</h1>
          <a href='/'>Regresar</a>
          `
      );

    res.render("protected", user);
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
      if (user.id !== message.rows[0].user_id) {
        return res
          .status(401)
          .json({ message: "No tienes acceso para Editar este mensaje" });
      }

      let ress = await repositoryChat.updateMessage(message_id, content);

      res.json({ message: "mensaje actualizado" });
    } catch (error) {
      console.log(error);
    }
  }

  static async deleteMessage(req, res) {
    const { message_id } = req.body;
    const { user } = req.session;

    try {
      let message = await repositoryChat.searchMessageById(message_id);

      if (user.id === message.rows[0].user_id || user.rol === "admin") {
        let result = await repositoryChat.deleteMessage(message_id);
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
