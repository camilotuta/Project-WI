const SuplementoModel = require("../models/suplementos.model");

class SuplementoController {
  static async getAll(req, res) {
    try {
      const suplementos = await SuplementoModel.getAll();
      res.json(suplementos);
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Error al obtener suplementos",
          error: error.message,
        });
    }
  }

  static async getById(req, res) {
    try {
      const suplemento = await SuplementoModel.getById(req.params.id);
      if (!suplemento)
        return res
          .status(404)
          .json({ success: false, message: "Suplemento no encontrado" });
      res.json(suplemento);
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al obtener suplemento" });
    }
  }

  static async create(req, res) {
    try {
      const suplemento = await SuplementoModel.create(req.body);
      res.status(201).json(suplemento);
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al crear suplemento" });
    }
  }

  static async update(req, res) {
    try {
      const suplemento = await SuplementoModel.update(req.params.id, req.body);
      if (!suplemento)
        return res
          .status(404)
          .json({ success: false, message: "Suplemento no encontrado" });
      res.json(suplemento);
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al actualizar suplemento" });
    }
  }

  static async delete(req, res) {
    try {
      const suplemento = await SuplementoModel.delete(req.params.id);
      if (!suplemento)
        return res
          .status(404)
          .json({ success: false, message: "Suplemento no encontrado" });
      res.json({
        success: true,
        message: "Suplemento eliminado correctamente",
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al eliminar suplemento" });
    }
  }
}

module.exports = SuplementoController;
