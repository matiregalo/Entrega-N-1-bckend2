import { Router } from "express";
import {
  getCurrentUser,
  registerUser,
  login,
  logout,
  resetPassword,
  showResetPasswordForm,
} from "../controllers/users.controller.js";
import { authenticateJWT } from "../middlewares/auth.js";

const router = Router();

router.get("/current", authenticateJWT, getCurrentUser);
router.post("/", registerUser);
router.post("/login", login);
router.post("/logout", logout);
router.get("/reset-password", showResetPasswordForm); // Página HTML para restablecer contraseña
router.post("/resetPassword", resetPassword);

export default router;
