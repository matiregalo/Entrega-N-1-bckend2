import { authenticateJWT, requireRole } from "../middlewares/auth.js";
import { Router } from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller.js";
const router = Router();

router.get("/ping", authenticateJWT, requireRole("admin"), (req, res) => {
  res.json({ message: "pong" });
});

router.post("/", authenticateJWT, requireRole("admin"), createProduct);
router.put("/:id", authenticateJWT, requireRole("admin"), updateProduct);
router.delete("/:id", authenticateJWT, requireRole("admin"), deleteProduct);

export default router;
