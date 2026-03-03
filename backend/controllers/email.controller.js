// controllers/email.controller.js
import crypto from "crypto";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import UsuariosModel from "../models/usuarios.model.js";

dotenv.config();

// Almacenamiento temporal de códigos de verificación (en producción usar Redis o DB)
const verificationCodes = new Map();

// Almacenamiento temporal de tokens de recuperación de contraseña
const passwordResetTokens = new Map();

// Configuración de SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "TU_API_KEY_AQUI";
const FROM_EMAIL = process.env.FROM_EMAIL || "gymark.co@gmail.com";

/**
 * Enviar código de verificación al email
 */
export const sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "El email es requerido",
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email inválido",
      });
    }

    // Generar código de 6 dígitos
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // Guardar código con timestamp (expira en 10 minutos)
    verificationCodes.set(email, {
      code: verificationCode,
      timestamp: Date.now(),
      attempts: 0,
    });

    // Configurar SendGrid
    sgMail.setApiKey(SENDGRID_API_KEY);

    const msg = {
      to: email,
      from: FROM_EMAIL, // Email verificado en SendGrid
      subject: "🔐 Código de Verificación - GYMARK.co",
      text: `Tu código de verificación es: ${verificationCode}. Este código expira en 10 minutos.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8"/>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
            .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(7,7,9,0.12); }
            .header { background: linear-gradient(135deg, #070709 0%, #2C2C2E 100%); color: #fefefe; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 12px 0 4px; font-size: 26px; letter-spacing: 0.06em; }
            .header p { margin: 0; color: rgba(254,254,254,0.7); font-size: 14px; }
            .content { padding: 36px 30px; color: #333; }
            .code-box { background: #f8f8f8; border: 2px dashed #070709; padding: 24px; text-align: center; margin: 24px 0; border-radius: 10px; }
            .code { font-size: 38px; font-weight: bold; color: #070709; letter-spacing: 10px; font-family: monospace; }
            .warning { background: #fff8e1; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 6px; margin-top: 20px; font-size: 13px; color: #555; }
            .footer { text-align: center; padding: 20px 30px; background: #f8f8f8; color: #999; font-size: 12px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <h1>GYMARK.co</h1>
              <p>Verificación de Email</p>
            </div>
            <div class="content">
              <h2 style="color:#070709;">¡Bienvenido!</h2>
              <p>Gracias por registrarte en GYMARK.co. Para completar tu registro, ingresa el siguiente código de verificación:</p>
              <div class="code-box">
                <p style="margin:0 0 8px; font-size:13px; color:#666;">Tu código de verificación</p>
                <div class="code">${verificationCode}</div>
              </div>
              <p><strong>Este código expirará en 10 minutos.</strong></p>
              <p>Si no solicitaste este código, ignora este email.</p>
              <div class="warning">
                🔒 <strong>Seguridad:</strong> Nunca compartas este código con nadie. GYMARK.co jamás te lo pedirá por teléfono o chat.
              </div>
            </div>
            <div class="footer">
              <p>© 2026 GYMARK.co — Chía, Cundinamarca, Colombia</p>
              <p>gymark.co@gmail.com | +57 321 273 9433</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Enviar email
    await sgMail.send(msg);

    console.log(
      `Código de verificación enviado a ${email}: ${verificationCode}`,
    );

    res.status(200).json({
      success: true,
      message: "Código de verificación enviado correctamente",
      // En desarrollo, puedes devolver el código (QUITAR EN PRODUCCIÓN)
      ...(process.env.NODE_ENV === "development" && { code: verificationCode }),
    });
  } catch (error) {
    console.error("Error al enviar código de verificación:", error);

    if (error.response) {
      console.error("Error de SendGrid:", error.response.body);
    }

    res.status(500).json({
      success: false,
      message: "Error al enviar el código de verificación",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Verificar código
 */
export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email y código son requeridos",
      });
    }

    const storedData = verificationCodes.get(email);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "No se encontró un código de verificación para este email",
      });
    }

    // Verificar expiración (10 minutos)
    const expirationTime = 10 * 60 * 1000; // 10 minutos en milisegundos
    if (Date.now() - storedData.timestamp > expirationTime) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: "El código ha expirado. Por favor solicita uno nuevo.",
      });
    }

    // Verificar intentos
    if (storedData.attempts >= 3) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message:
          "Demasiados intentos fallidos. Por favor solicita un nuevo código.",
      });
    }

    // Verificar código
    if (storedData.code !== code.toString()) {
      storedData.attempts++;
      verificationCodes.set(email, storedData);

      return res.status(400).json({
        success: false,
        message: `Código incorrecto. Te quedan ${
          3 - storedData.attempts
        } intentos.`,
      });
    }

    // Código correcto - eliminar del almacenamiento
    verificationCodes.delete(email);

    res.status(200).json({
      success: true,
      message: "Código verificado correctamente",
      verified: true,
    });
  } catch (error) {
    console.error("Error al verificar código:", error);
    res.status(500).json({
      success: false,
      message: "Error al verificar el código",
    });
  }
};

/**
 * Limpiar códigos expirados (ejecutar periódicamente)
 */
setInterval(
  () => {
    const expirationTime = 10 * 60 * 1000;
    const now = Date.now();

    for (const [email, data] of verificationCodes.entries()) {
      if (now - data.timestamp > expirationTime) {
        verificationCodes.delete(email);
        console.log(`Código expirado eliminado para: ${email}`);
      }
    }

    for (const [token, data] of passwordResetTokens.entries()) {
      if (now - data.timestamp > expirationTime) {
        passwordResetTokens.delete(token);
      }
    }
  },
  5 * 60 * 1000,
); // Limpiar cada 5 minutos

/**
 * Enviar código de recuperación de contraseña
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "El email es requerido" });
    }

    // Verificar que el usuario existe
    const usuario = await UsuariosModel.findByEmail(email);
    if (!usuario) {
      // Por seguridad responder igual aunque no exista
      return res.status(200).json({
        success: true,
        message:
          "Si el email está registrado, recibirás un código de recuperación.",
      });
    }

    // Generar código de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar token con email y timestamp (expira en 10 minutos)
    const token = crypto.randomBytes(20).toString("hex");
    passwordResetTokens.set(token, {
      email,
      code: resetCode,
      timestamp: Date.now(),
      attempts: 0,
    });

    // Configurar SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || "TU_API_KEY_AQUI");

    const nombreUsuario = usuario.apellido
      ? `${usuario.nombre} ${usuario.apellido}`
      : usuario.nombre;

    const msg = {
      to: email,
      from: process.env.FROM_EMAIL || "gymark.co@gmail.com",
      subject: "🔐 Recuperación de Contraseña - GYMARK.co",
      text: `Tu código de recuperación es: ${resetCode}. Expira en 10 minutos.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8"/>
          <style>
            body { font-family: 'Arial', sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
            .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(7,7,9,0.12); }
            .header { background: linear-gradient(135deg, #070709 0%, #2C2C2E 100%); color: #fefefe; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 12px 0 4px; font-size: 26px; letter-spacing: 0.06em; }
            .header p { margin: 0; color: rgba(254,254,254,0.7); font-size: 14px; }
            .content { padding: 36px 30px; color: #333; }
            .code-box { background: #f8f8f8; border: 2px dashed #070709; padding: 24px; text-align: center; margin: 24px 0; border-radius: 10px; }
            .code { font-size: 38px; font-weight: bold; color: #070709; letter-spacing: 10px; font-family: monospace; }
            .warning { background: #fff8e1; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 6px; margin-top: 20px; font-size: 13px; color: #555; }
            .footer { text-align: center; padding: 20px 30px; background: #f8f8f8; color: #999; font-size: 12px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <h1>GYMARK.co</h1>
              <p>Recuperación de Contraseña</p>
            </div>
            <div class="content">
              <p>Hola, <strong>${nombreUsuario}</strong>.</p>
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Ingresa el siguiente código en la página de recuperación:</p>
              <div class="code-box">
                <p style="margin:0 0 8px; font-size:13px; color:#666;">Tu código de verificación</p>
                <div class="code">${resetCode}</div>
              </div>
              <p><strong>Este código expirará en 10 minutos.</strong></p>
              <p>Si no solicitaste restablecer tu contraseña, ignora este correo. Tu cuenta permanece segura.</p>
              <div class="warning">
                🔒 <strong>Seguridad:</strong> Nunca compartamos este código con nadie. GYMARK.co jamás te lo pedirá por teléfono o chat.
              </div>
            </div>
            <div class="footer">
              <p>© 2026 GYMARK.co — Chía, Cundinamarca, Colombia</p>
              <p>gymark.co@gmail.com | +57 321 273 9433</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await sgMail.send(msg);

    console.log(
      `[ForgotPassword] Código enviado a ${email}: ${resetCode} | token: ${token}`,
    );

    res.status(200).json({
      success: true,
      message:
        "Si el email está registrado, recibirás un código de recuperación.",
      token,
      ...(process.env.NODE_ENV === "development" && { code: resetCode }),
    });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error al enviar el correo de recuperación.",
      });
  }
};

/**
 * Restablecer contraseña con código
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, code, newPassword } = req.body;

    if (!token || !code || !newPassword) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Token, código y nueva contraseña son requeridos.",
        });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: "La contraseña debe tener al menos 6 caracteres.",
        });
    }

    const storedData = passwordResetTokens.get(token);

    if (!storedData) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Token inválido o expirado. Solicita un nuevo código.",
        });
    }

    // Verificar expiración (10 minutos)
    if (Date.now() - storedData.timestamp > 10 * 60 * 1000) {
      passwordResetTokens.delete(token);
      return res
        .status(400)
        .json({
          success: false,
          message: "El código ha expirado. Solicita uno nuevo.",
        });
    }

    // Verificar intentos
    if (storedData.attempts >= 3) {
      passwordResetTokens.delete(token);
      return res
        .status(400)
        .json({
          success: false,
          message: "Demasiados intentos fallidos. Solicita un nuevo código.",
        });
    }

    // Verificar código
    if (storedData.code !== code.toString().trim()) {
      storedData.attempts++;
      passwordResetTokens.set(token, storedData);
      return res.status(400).json({
        success: false,
        message: `Código incorrecto. Te quedan ${3 - storedData.attempts} intentos.`,
      });
    }

    // Código válido — actualizar contraseña
    const usuario = await UsuariosModel.findByEmail(storedData.email);
    if (!usuario) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado." });
    }

    await UsuariosModel.update(usuario.id_usuario, {
      password: newPassword,
      password_hash: newPassword,
    });

    passwordResetTokens.delete(token);

    res
      .status(200)
      .json({
        success: true,
        message: "Contraseña restablecida correctamente.",
      });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al restablecer la contraseña." });
  }
};
