import UsuariosModel from "../models/usuarios.model.js";

const UsuariosController = {
  async register(req, res) {
    try {
      const {
        nombre,
        email,
        password,
        telefono,
        direccion,
        ciudad,
        codigo_postal,
        fecha_nacimiento,
      } = req.body;

      if (!nombre || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Faltan campos requeridos",
        });
      }

      const usuario = await UsuariosModel.create({
        nombre,
        email,
        password,
        telefono: telefono || "",
        direccion: direccion || "",
        ciudad: ciudad || "",
        codigo_postal: codigo_postal || "",
        fecha_nacimiento: fecha_nacimiento || null,
      });

      // Combine nombre and apellido for response
      const nombreCompleto = usuario.apellido
        ? `${usuario.nombre} ${usuario.apellido}`
        : usuario.nombre;

      res.json({
        success: true,
        message: "Usuario registrado exitosamente",
        data: {
          ...usuario,
          nombre: nombreCompleto,
        },
      });
    } catch (error) {
      console.error("Error en register:", error);
      res.status(500).json({
        success: false,
        message: "Error al registrar usuario",
        error: error.message,
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email y contraseña requeridos",
        });
      }

      const usuario = await UsuariosModel.findByEmail(email);

      console.log("Usuario encontrado:", usuario ? "Sí" : "No");
      if (usuario) {
        console.log("Password en DB:", usuario.password);
        console.log("Password recibido:", password);
        console.log("Coinciden:", usuario.password === password);
      }

      if (
        !usuario ||
        (usuario.password !== password && usuario.password_hash !== password)
      ) {
        return res.status(401).json({
          success: false,
          message: "Email o contraseña incorrectos",
        });
      }

      console.log(
        `✅ Login exitoso para usuario: ${usuario.nombre} (ID: ${usuario.id_usuario})`
      );

      // Combine nombre and apellido for response
      const nombreCompleto = usuario.apellido
        ? `${usuario.nombre} ${usuario.apellido}`
        : usuario.nombre;

      res.json({
        success: true,
        message: "Login exitoso",
        data: {
          id_usuario: usuario.id_usuario,
          nombre: nombreCompleto,
          email: usuario.email,
          telefono: usuario.telefono || "",
          direccion: usuario.direccion || "",
          ciudad: usuario.ciudad || "",
          codigo_postal: usuario.codigo_postal || "",
          fecha_nacimiento: usuario.fecha_nacimiento || null,
          fecha_registro: usuario.fecha_registro,
        },
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({
        success: false,
        message: "Error al iniciar sesión",
        error: error.message,
      });
    }
  },

  async getProfile(req, res) {
    try {
      // Aquí normalmente verificarías el token
      res.json({
        success: true,
        message: "Perfil obtenido",
        data: {},
      });
    } catch (error) {
      console.error("Error en getProfile:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener perfil",
        error: error.message,
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const usuario = await UsuariosModel.getById(id);

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Usuario obtenido",
        data: usuario,
      });
    } catch (error) {
      console.error("Error en getById:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener usuario",
        error: error.message,
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const datos = req.body;

      const usuario = await UsuariosModel.update(id, datos);

      res.json({
        success: true,
        message: "Usuario actualizado",
        data: usuario,
      });
    } catch (error) {
      console.error("Error en update:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar usuario",
        error: error.message,
      });
    }
  },

  async getAll(req, res) {
    try {
      const usuarios = await UsuariosModel.getAll();

      res.json({
        success: true,
        data: usuarios,
      });
    } catch (error) {
      console.error("Error en getAll:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener usuarios",
        error: error.message,
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      await UsuariosModel.delete(id);

      res.json({
        success: true,
        message: "Usuario eliminado",
      });
    } catch (error) {
      console.error("Error en delete:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar usuario",
        error: error.message,
      });
    }
  },
};

export default UsuariosController;
