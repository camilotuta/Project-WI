
const UsuarioModel = require('../models/usuarios.model');
const jwt = require('jsonwebtoken');

class UsuarioController {
  
  // Registrar nuevo usuario
  static async register(req, res, next) {
    try {
      const usuarioData = req.body;

      // Validar que el email no exista
      const usuarioExistente = await UsuarioModel.getByEmail(usuarioData.email);
      if (usuarioExistente) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }

      const nuevoUsuario = await UsuarioModel.create(usuarioData);

      // Generar token JWT
      const token = jwt.sign(
        { id: nuevoUsuario.id_usuario, email: nuevoUsuario.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: nuevoUsuario,
        token
      });
    } catch (error) {
      next(error);
    }
  }

  // Login
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
      }

      // Buscar usuario con password
      const usuario = await UsuarioModel.getByEmail(email);

      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Validar contraseña
      const isValidPassword = await UsuarioModel.validatePassword(password, usuario.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Generar token
      const token = jwt.sign(
        { id: usuario.id_usuario, email: usuario.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      // Remover password_hash de la respuesta
      delete usuario.password_hash;

      res.json({
        success: true,
        message: 'Login exitoso',
        data: usuario,
        token
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const usuarios = await UsuarioModel.getAll();

      res.json({
        success: true,
        count: usuarios.length,
        data: usuarios
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const usuario = await UsuarioModel.getById(id);

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  // Perfil del usuario autenticado
  static async getProfile(req, res, next) {
    try {
      // req.user viene del middleware de autenticación
      const usuario = await UsuarioModel.getById(req.user.id);

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Obtener estadísticas
      const stats = await UsuarioModel.getUserStats(req.user.id);

      res.json({
        success: true,
        data: {
          ...usuario,
          stats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const usuarioData = req.body;

      const usuarioActualizado = await UsuarioModel.update(id, usuarioData);

      if (!usuarioActualizado) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuarioActualizado
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const usuarioEliminado = await UsuarioModel.delete(id);

      if (!usuarioEliminado) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente',
        data: usuarioEliminado
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UsuarioController;