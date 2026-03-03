// routes/email.routes.js
import express from "express";
import {
  sendVerificationCode,
  verifyCode,
  forgotPassword,
  resetPassword,
} from "../controllers/email.controller.js";

const router = express.Router();

// POST /api/email/send-verification - Enviar código de verificación
router.post("/send-verification", sendVerificationCode);

// POST /api/email/verify-code - Verificar código
router.post("/verify-code", verifyCode);

// POST /api/email/forgot-password - Solicitar recuperación de contraseña
router.post("/forgot-password", forgotPassword);

// POST /api/email/reset-password - Restablecer contraseña con código
router.post("/reset-password", resetPassword);

export default router;
