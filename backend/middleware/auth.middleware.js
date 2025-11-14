import jwt from "jsonwebtoken";
import UsuarioModel from "../models/usuarios.model.js";

// Middleware para proteger rutas
const protect = async (req, res, next) => {
  let token;

  // Verificar si el token viene en los headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Obtener token del header
      token = req.headers.authorization.split(" ")[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obtener usuario del token (sin password)
      req.user = await UsuarioModel.getById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      next();
    } catch (error) {
      console.error("Error en autenticación:", error);
      return res.status(401).json({
        success: false,
        message: "No autorizado, token inválido",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No autorizado, no hay token",
    });
  }
};

// Middleware para verificar roles específicos (opcional)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: `Rol ${req.user.rol} no autorizado para acceder a este recurso`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
