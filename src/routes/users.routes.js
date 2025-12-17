import { Router } from "express";
import {
  getUsers,
  getCurrentUser,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  login,
  logout,
} from "../controllers/users.controller.js";
import { authenticateJWT, requireRole } from "../middlewares/auth.js";

const router = Router();

// Obtener todos los usuarios (solo admin)
router.get("/", ,authenticateJWT, requireRole("admin") getUsers);

// Obtener el usuario actual autenticado (equivalente a /api/sessions/current)
router.get("/current", authenticateJWT, getCurrentUser);

// Obtener un usuario por ID (requiere autenticación, el controlador valida permisos)
router.get("/:id", authenticateJWT, getUserById);

// Crear un nuevo usuario (público - para registro)
router.post("/", createUser);

// Iniciar sesión (público)
router.post("/login", login);

// Cerrar sesión (público)
router.post("/logout", logout);

// Actualizar un usuario (requiere autenticación, el controlador valida permisos)
router.put("/:id", authenticateJWT, updateUser);

// Eliminar un usuario (solo admin)
router.delete("/:id", authenticateJWT, requireRole("admin"), deleteUser);

export default router;

