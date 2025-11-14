import SuplementosModel from "../models/suplementos.model.js";

const SuplementosController = {
  async getAll(req, res) {
    try {
      const suplementos = await SuplementosModel.getAll();
      res.json({
        success: true,
        message: "Suplementos obtenidos",
        data: suplementos,
      });
    } catch (error) {
      console.error("Error en getAll:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener suplementos",
        error: error.message,
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const suplemento = await SuplementosModel.getById(id);

      if (!suplemento) {
        return res.status(404).json({
          success: false,
          message: "Suplemento no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Suplemento obtenido",
        data: suplemento,
      });
    } catch (error) {
      console.error("Error en getById:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener suplemento",
        error: error.message,
      });
    }
  },

  async create(req, res) {
    try {
      const { nombre, descripcion, precio } = req.body;

      if (!nombre || !precio) {
        return res.status(400).json({
          success: false,
          message: "Faltan campos requeridos",
        });
      }

      const suplemento = await SuplementosModel.create({
        nombre,
        descripcion,
        precio,
      });

      res.json({
        success: true,
        message: "Suplemento creado",
        data: suplemento,
      });
    } catch (error) {
      console.error("Error en create:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear suplemento",
        error: error.message,
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const datos = req.body;

      const suplemento = await SuplementosModel.update(id, datos);

      res.json({
        success: true,
        message: "Suplemento actualizado",
        data: suplemento,
      });
    } catch (error) {
      console.error("Error en update:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar suplemento",
        error: error.message,
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      await SuplementosModel.delete(id);

      res.json({
        success: true,
        message: "Suplemento eliminado",
      });
    } catch (error) {
      console.error("Error en delete:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar suplemento",
        error: error.message,
      });
    }
  },
};

export default SuplementosController;
