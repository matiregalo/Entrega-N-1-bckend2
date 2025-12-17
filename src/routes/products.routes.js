import { Router } from "express";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/products.controller";

const router  = Router()
router.get("/", getProducts)
router.get("/:id", getProducts)
router.get("/", createProduct)
router.get("/:id", updateProduct)
router.get("/:id", deleteProduct)


export default router;