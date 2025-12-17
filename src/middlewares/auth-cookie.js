import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export function attachUserFromCookie(req, res, next) {
  const COOKIE_NAME = config.COOKIE_NAME;
  const JWT_SECRET = config.JWT_SECRET;

  req.user = undefined;
  res.locals.user = undefined;
  try {
    const token =
      req.signedCookie?.[COOKIE_NAME] || req.cookies?.[COOKIE_NAME] || null;
    if (!token) return next();
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: payload.id ?? payload.sub ?? null,
      email: payload.email,
      role: payload.role,
    };
    res.locals.user = req.user;
    next();
  } catch (error) {
    next();
  }
}
