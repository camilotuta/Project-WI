// routes/email.routes.js
import express from "express";
import {
  sendVerificationCode,
  verifyCode,
} from "../controllers/email.controller.js";

const router = express.Router();

// POST /api/email/send-verification - Enviar código de verificación
router.post("/send-verification", sendVerificationCode);

// POST /api/email/verify-code - Verificar código
router.post("/verify-code", verifyCode);

export default router;
