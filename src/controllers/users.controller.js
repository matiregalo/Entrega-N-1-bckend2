import UserDAO from "../dao/user.dao.js";
import UserDto from "../dto/user.dto.js";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";

const userDAO = new UserDAO();
const { JWT_SECRET, JWT_EXPIRES = "15m", COOKIE_NAME } = process.env;
const signAccessToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).send({
        status: "error",
        message: "No autenticado",
      });
    }

    const user = await userDAO.getById(req.user.id);
    if (!user) {
      return res.status(404).send({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    const userDto = UserDto.from(user);
    res.send({ status: "success", payload: userDto });
  } catch (error) {
    res.status(500).send({ status: "error", message: error.message });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;
    if (!first_name || !last_name || age == null || !email || !password) {
      return res.status(400).send({
        status: "error",
        message:
          "Faltan campos requeridos: first_name, last_name, age, email, password",
      });
    }
    const newUser = await userDAO.create({
      first_name,
      last_name,
      email,
      age,
      password,
    });

    const userDto = UserDto.from(newUser);
    res.status(201).send({ status: "success", payload: userDto });
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(409)
        .send({ status: "error", message: "Email ya registrado" });
    }
    if (
      error.message.includes("validación") ||
      error.message.includes("obligatorio")
    ) {
      return res.status(400).send({ status: "error", message: error.message });
    }
    res.status(500).send({ status: "error", message: error.message });
  }
};

export const login = (req, res, next) => {
  passport.authenticate("local", { session: false }, (error, user) => {
    if (error) return next(error);
    if (!user) {
      return res.status(401).send({
        status: "error",
        message: "Credenciales inválidas",
      });
    }

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
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    return res.send({
      status: "success",
      message: "Sesión iniciada correctamente",
    });
  })(req, res, next);
};

export const logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.send({
    status: "success",
    message: "Sesión cerrada correctamente",
  });
};
