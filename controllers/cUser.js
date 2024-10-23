import { repoUser } from "../models/mUser.js";
import { validateUsername } from "../schemas/sChat.js";
import { SALT_ROUNDS, SECRET_JWT_KEY } from "../config/config.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

const salt = parseInt(SALT_ROUNDS);

export class cUser {
  static async create(req, res) {
    let { username, password } = req.body;
    try {
      const result = validateUsername(req.body);

      if (!result.success) {
        // 422 Unprocessable Entity
        return res.status(400).json(result.error);
      }

      const id = crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(password, salt);

      username = username.toLowerCase();

      const newUser = await repoUser.createUser({
        id,
        username,
        password: hashedPassword,
      });

      if (newUser) {
        const token = jwt.sign({ id, username, rol: "user" }, SECRET_JWT_KEY, {
          expiresIn: "1w",
        });

        res
          .cookie("access_token", token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 1000 * 60 * 10080,
          })
          .send({ newUser });
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  static async login(req, res) {
    let { username, password } = req.body;
    try {
      const result = validateUsername(req.body);

      if (!result.success) {
        return res.status(400).json(result.error);
      }

      username = username.toLowerCase();

      const user = await repoUser.searchUserByUsername(username);
      if (!user) {
        return res
          .status(400)
          .json({ message: "Usuario o contraseña incorrecta" });
      }

      const userPass = user.rows[0].password;
      const userID = user.rows[0].id;
      const userName = user.rows[0].username;

      const isPassword = await bcrypt.compare(password, userPass);
      if (!isPassword)
        throw new Error({ message: "Usuario o Contraseña incorrecta" });

      const token = jwt.sign(
        { id: userID, username: userName, rol: "user" },
        SECRET_JWT_KEY,
        {
          expiresIn: "1w",
        }
      );

      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 1000 * 60 * 10080,
        })
        .json({ message: "ok" });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async logout(req, res) {
    res
      .clearCookie("access_token")
      .json({ message: "Salida de sesion exitosa" });
  }
}
