import { db } from "../config/db.js";

export class repoUser {
  static async createUser({ id, username, password }) {
    try {
      let result = await db.execute({
        sql: `INSERT INTO users (id, username, password) VALUES (:id, :username, :password)`,
        args: { id, username, password },
      });
      return result;
    } catch (error) {
      console.log(error);
    }
  }
  static async updateUser(data) {}
  static async deleteUser() {}
  static async searchUserByUsername(username) {
    try {
      let result = await db.execute({
        sql: `SELECT * FROM users WHERE username = (:username)`,
        args: { username },
      });

      return result;
    } catch (error) {
      console.log(error);
    }
  }
}
