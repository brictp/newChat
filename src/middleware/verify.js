import jwt from "jsonwebtoken";
import { SECRET_JWT_KEY } from "../config/config.js";

export const verifyUser = (req, res, next) => {
  const { access_token } = req.cookies;
  req.session = { user: null };
  try {
    const data = jwt.verify(access_token, SECRET_JWT_KEY);
    req.session.user = data;
  } catch {}

  next();
};
