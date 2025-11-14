import CategoriasModel from "../models/categorias.model.js";

const CategoriasController = {
  async getAll(req, res) {
    try {
      const categorias = await CategoriasModel.getAll();
      res.json({
        success: true,
        message: "Categorías obtenidas",
        data: categorias,
      });
    } catch (error) {
      console.error("Error en getAll:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener categorías",
        error: error.message,
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const categoria = await CategoriasModel.getById(id);

      if (!categoria) {
        return res.status(404).json({
          success: false,
          message: "Categoría no encontrada",
        });
      }

      res.json({
        success: true,
        message: "Categoría obtenida",
        data: categoria,
      });
    } catch (error) {
      console.error("Error en getById:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener categoría",
        error: error.message,
      });
    }
  },

  async create(req, res) {
    try {
      const { nombre, descripcion } = req.body;

      if (!nombre) {
        return res.status(400).json({
          success: false,
          message: "El nombre es requerido",
        });
      }

      const categoria = await CategoriasModel.create({ nombre, descripcion });

      res.json({
        success: true,
        message: "Categoría creada",
        data: categoria,
      });
    } catch (error) {
      console.error("Error en create:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear categoría",
        error: error.message,
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const datos = req.body;

      const categoria = await CategoriasModel.update(id, datos);

      res.json({
        success: true,
        message: "Categoría actualizada",
        data: categoria,
      });
    } catch (error) {
      console.error("Error en update:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar categoría",
        error: error.message,
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      await CategoriasModel.delete(id);

      res.json({
        success: true,
        message: "Categoría eliminada",
      });
    } catch (error) {
      console.error("Error en delete:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar categoría",
        error: error.message,
      });
    }
  },
};

export default CategoriasController;
