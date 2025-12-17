import { Router } from "express";
import {
  getCurrentUser,
  registerUser,
  login,
  logout,
} from "../controllers/users.controller.js";
import { authenticateJWT } from "../middlewares/auth.js";

const router = Router();

router.get("/current", authenticateJWT, getCurrentUser);
router.post("/", registerUser);
router.post("/login", login);
router.post("/logout", logout);

export default router;
