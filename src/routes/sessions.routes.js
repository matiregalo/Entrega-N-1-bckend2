import { Router } from "express";
import User from "../models/User.js";
import error from "../middlewares/error.js";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import { authenticateJWT } from "../middlewares/auth.js";

const router = Router();
const { JWT_SECRET, JWT_EXPIRES = "15m", COOKIE_NAME } = process.env;
const signAccessToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

router.post("/register", async (req, res, next) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;

    if (!first_name || !last_name || age == null || !email) {
      return res.status(400).json({
        message: "Faltan campos requeridos: first_name, last_name, age, email",
      });
    }

    const normEmail = String(email).toLowerCase().trim();

    const user = await User.create({
      first_name,
      last_name,
      email: normEmail,
      age,
      password,
    });
    res.status(201).json({ ok: true, id: user.id });
  } catch (error) {
    if (error?.code == 11000)
      return res.status(409).json({ error: "Email ya registrado" });
    next(error);
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (error, user) => {
    if (error) return next(error);
    if (!user) return res.status(401).json({ error: "Credenciales invalidas" });

    const token = signAccessToken({
      sub: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      age: user.age,
      role: user.role,
    });
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      signed: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV,
      maxAge: 15 * 60 * 1000,
      path: "/",
    });
    return res.json({ ok: true });
  })(req, res, next);
});

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ ok: true, message: "Token eliminado" });
});

router.get(
  "/current",
  authenticateJWT,
  (req, res) => {
    const { id, first_name, last_name, email, age, role } = req.user;
    return res.json({
      ok: true,
      user: req.user,
    });
  },
);

export default router;
