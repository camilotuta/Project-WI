const CategoriaModel = require("../models/categorias.model");

class CategoriaController {
  static async getAll(req, res) {
    try {
      const categorias = await CategoriaModel.getAll();
      res.json(categorias);
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Error al obtener categorías",
          error: error.message,
        });
    }
  }

  static async getById(req, res) {
    try {
      const categoria = await CategoriaModel.getById(req.params.id);
      if (!categoria)
        return res
          .status(404)
          .json({ success: false, message: "Categoría no encontrada" });
      res.json(categoria);
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al obtener la categoría" });
    }
  }

  static async create(req, res) {
    try {
      const categoria = await CategoriaModel.create(req.body);
      res.status(201).json(categoria);
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al crear la categoría" });
    }
  }

  static async update(req, res) {
    try {
      const categoria = await CategoriaModel.update(req.params.id, req.body);
      if (!categoria)
        return res
          .status(404)
          .json({ success: false, message: "Categoría no encontrada" });
      res.json(categoria);
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al actualizar la categoría" });
    }
  }

  static async delete(req, res) {
    try {
      const categoria = await CategoriaModel.delete(req.params.id);
      if (!categoria)
        return res
          .status(404)
          .json({ success: false, message: "Categoría no encontrada" });
      res.json({
        success: true,
        message: "Categoría desactivada correctamente",
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al eliminar la categoría" });
    }
  }
}

module.exports = CategoriaController;
