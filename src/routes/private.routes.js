import { authenticateJWT, requireRole } from "../middlewares/auth.js";
import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller.js";
const router = Router();

router.get("/ping", authenticateJWT, requireRole("admin"), (req, res) => {
  res.json({ message: "pong" });
});



router.get("/",authenticateJWT, requireRole("admin"), getProducts);
router.get("/:id",authenticateJWT, requireRole("admin"), getProductById);
router.post("/",authenticateJWT, requireRole("admin"), createProduct);
router.put("/:id",authenticateJWT, requireRole("admin"), updateProduct);
router.delete("/:id",authenticateJWT, requireRole("admin"), deleteProduct);

export default router;

