import { db } from "../config/db.js";

export class repositoryChat {
  static async searchMessageById(id) {
    try {
      let res = db.execute({
        sql: `SELECT * FROM messages WHERE message_id = (:id)`,
        args: { id },
      });

      return res;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async insert({ msg, user_id }) {
    try {
      let result = await db.execute({
        sql: `INSERT INTO messages (content, user_id) VALUES (:msg, :user_id)`,
        args: { msg, user_id },
      });

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  static async recovery(socket) {
    try {
      const result = await db.execute({
        sql: `SELECT message_id, content, users.username FROM messages
        JOIN users ON users.id = messages.user_id
        WHERE message_id > ?`,
        args: [socket.handshake.auth.serverOffset ?? 0],
      });

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async updateMessage(id, content) {
    try {
      const res = await db.execute({
        sql: `UPDATE messages SET content = (:content) WHERE message_id = (:message_id)`,
        args: { content, message_id: id },
      });

      return res;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async deleteMessage(id) {
    try {
      const res = await db.execute({
        sql: `DELETE FROM messages WHERE message_id = (:id)`,
        args: { id },
      });

      return res;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
