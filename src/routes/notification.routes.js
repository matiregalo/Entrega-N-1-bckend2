import { Router } from "express";
import { forgotPassword } from "../controllers/notifications.controller.js";

const router = Router();
router.post("/forgotPassword", forgotPassword);

export default router;
