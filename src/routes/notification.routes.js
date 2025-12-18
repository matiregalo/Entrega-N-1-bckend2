import { Router } from "express";
import { forgotPassword, testEmail } from "../controllers/notifications.controller.js";

const router = Router();
router.post("/forgotPassword", forgotPassword);
router.post("/testEmail", testEmail); // Endpoint de prueba simple

export default router;
