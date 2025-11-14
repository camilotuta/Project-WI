// controllers/email.controller.js
import crypto from "crypto";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

// Almacenamiento temporal de códigos de verificación (en producción usar Redis o DB)
const verificationCodes = new Map();

// Configuración de SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "TU_API_KEY_AQUI";
const FROM_EMAIL = process.env.FROM_EMAIL || "greenhousefitnesss@gmail.com";

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
      100000 + Math.random() * 900000
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
      subject: "🌿 Código de Verificación - Greenhouse Fitness",
      text: `Tu código de verificación es: ${verificationCode}. Este código expira en 10 minutos.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c59 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: white; border: 2px dashed #2d5016; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .code { font-size: 32px; font-weight: bold; color: #2d5016; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .emoji { font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">🌿</div>
              <h1 style="margin: 10px 0;">Greenhouse Fitness</h1>
              <p style="margin: 0;">Verificación de Email</p>
            </div>
            <div class="content">
              <h2 style="color: #2d5016;">¡Bienvenido!</h2>
              <p>Gracias por registrarte en Greenhouse Fitness. Para completar tu registro, por favor ingresa el siguiente código de verificación:</p>
              
              <div class="code-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Tu código de verificación es:</p>
                <div class="code">${verificationCode}</div>
              </div>
              
              <p><strong>Este código expirará en 10 minutos.</strong></p>
              
              <p>Si no solicitaste este código, por favor ignora este email.</p>
              
              <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; font-size: 14px;">
                  <strong>💡 Tip:</strong> Nunca compartas este código con nadie. Nuestro equipo nunca te pedirá este código por teléfono o email.
                </p>
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Greenhouse Fitness - Sopó, Cundinamarca, Colombia</p>
              <p>greenhousefitnesss@gmail.com | +57 312 853 5465</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Enviar email
    await sgMail.send(msg);

    console.log(
      `Código de verificación enviado a ${email}: ${verificationCode}`
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
setInterval(() => {
  const expirationTime = 10 * 60 * 1000;
  const now = Date.now();

  for (const [email, data] of verificationCodes.entries()) {
    if (now - data.timestamp > expirationTime) {
      verificationCodes.delete(email);
      console.log(`Código expirado eliminado para: ${email}`);
    }
  }
}, 5 * 60 * 1000); // Limpiar cada 5 minutos
