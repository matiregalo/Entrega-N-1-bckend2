import UserDAO from "../dao/user.dao.js";
import UserDto from "../dto/user.dto.js";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";

const userDAO = new UserDAO();
const { JWT_SECRET, JWT_EXPIRES = "15m", COOKIE_NAME } = process.env;
const signAccessToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

export const getUsers = async (req, res) => {
  try {
    const users = await userDAO.getAll();
    const usersDto = UserDto.fromArray(users);
    res.send({ status: "success", payload: usersDto });
  } catch (error) {
    res.status(500).send({ status: "error", message: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // Obtener el usuario actual desde req.user (seteado por authenticateJWT)
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

export const getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    // Solo permitir ver el propio perfil o si es admin
    if (req.user && req.user.role !== "admin" && req.user.id !== id) {
      return res
        .status(403)
        .send({ status: "error", message: "No tienes permisos para ver este usuario" });
    }
    const user = await userDAO.getById(id);
    if (!user) {
      return res
        .status(404)
        .send({ status: "error", message: "Usuario no encontrado" });
    }
    const userDto = UserDto.from(user);
    res.send({ status: "success", payload: userDto });
  } catch (error) {
    res.status(500).send({ status: "error", message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;

    // Validaciones básicas (igual que en register)
    if (!first_name || !last_name || age == null || !email || !password) {
      return res.status(400).send({
        status: "error",
        message: "Faltan campos requeridos: first_name, last_name, age, email, password",
      });
    }

    // El DAO se encarga de normalizar el email automáticamente
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
    if (error.message.includes("validación") || error.message.includes("obligatorio")) {
      return res.status(400).send({ status: "error", message: error.message });
    }
    res.status(500).send({ status: "error", message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    // Solo permitir actualizar el propio perfil o si es admin
    if (req.user && req.user.role !== "admin" && req.user.id !== id) {
      return res
        .status(403)
        .send({ status: "error", message: "No tienes permisos para actualizar este usuario" });
    }
    // Los usuarios normales no pueden cambiar su rol
    if (req.user && req.user.role !== "admin" && req.body.role) {
      delete req.body.role;
    }
    // No permitir actualizar la contraseña directamente (debe hacerse por otro endpoint)
    if (req.body.password) {
      delete req.body.password;
    }
    const updatedUser = await userDAO.update(id, req.body);
    if (!updatedUser) {
      return res.status(404).send({ status: "error", message: "Usuario no encontrado" });
    }
    const userDto = UserDto.from(updatedUser);
    res.status(200).send({ status: "success", payload: userDto });
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(409)
        .send({ status: "error", message: "Email ya está en uso" });
    }
    if (error.message.includes("validación")) {
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

export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    // Solo admin puede eliminar usuarios
    if (req.user && req.user.role !== "admin") {
      return res
        .status(403)
        .send({ status: "error", message: "Solo los administradores pueden eliminar usuarios" });
    }
    const user = await userDAO.getById(id);
    if (!user) {
      return res.status(404).send({ status: "error", message: "Usuario no encontrado" });
    }
    const ok = await userDAO.delete(id);
    if (!ok) {
      return res.status(500).send({ status: "error", message: "Error al eliminar el usuario" });
    }
    res.status(200).send({ status: "success", message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).send({ status: "error", message: error.message });
  }
};