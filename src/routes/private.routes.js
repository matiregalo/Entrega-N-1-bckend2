import { authenticateJWT, requireRole } from "../middlewares/auth.js";
import { Router } from "express";
const router = Router();

router.get("/ping", authenticateJWT, requireRole("admin"), (req, res) => {
  res.json({ message: "pong" });
});

export default router;
