import ProductosModel from "../models/productos.model.js";

const ProductosController = {
  async getAll(req, res) {
    try {
      const productos = await ProductosModel.getAll();
      res.json({
        success: true,
        message: "Productos obtenidos",
        data: productos,
      });
    } catch (error) {
      console.error("Error en getAll:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener productos",
        error: error.message,
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const producto = await ProductosModel.getById(id);

      if (!producto) {
        return res.status(404).json({
          success: false,
          message: "Producto no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Producto obtenido",
        data: producto,
      });
    } catch (error) {
      console.error("Error en getById:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener producto",
        error: error.message,
      });
    }
  },

  async getRelated(req, res) {
    try {
      const { id } = req.params;
      const relacionados = await ProductosModel.getRelated(id);

      res.json({
        success: true,
        message: "Productos relacionados obtenidos",
        data: relacionados,
      });
    } catch (error) {
      console.error("Error en getRelated:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener productos relacionados",
        error: error.message,
      });
    }
  },

  async create(req, res) {
    try {
      const { nombre, descripcion, precio, categoria, stock } = req.body;

      if (!nombre || !precio) {
        return res.status(400).json({
          success: false,
          message: "Faltan campos requeridos",
        });
      }

      const producto = await ProductosModel.create({
        nombre,
        descripcion,
        precio,
        categoria,
        stock,
      });

      res.json({
        success: true,
        message: "Producto creado",
        data: producto,
      });
    } catch (error) {
      console.error("Error en create:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear producto",
        error: error.message,
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const datos = req.body;

      const producto = await ProductosModel.update(id, datos);

      res.json({
        success: true,
        message: "Producto actualizado",
        data: producto,
      });
    } catch (error) {
      console.error("Error en update:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar producto",
        error: error.message,
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      await ProductosModel.delete(id);

      res.json({
        success: true,
        message: "Producto eliminado",
      });
    } catch (error) {
      console.error("Error en delete:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar producto",
        error: error.message,
      });
    }
  },

  async getRandom(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 4;
      const productos = await ProductosModel.getRandom(limit);

      res.json({
        success: true,
        message: "Productos aleatorios obtenidos",
        data: productos,
      });
    } catch (error) {
      console.error("Error en getRandom:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener productos aleatorios",
        error: error.message,
      });
    }
  },

  async getFeatured(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 8;
      const productos = await ProductosModel.getFeatured(limit);

      res.json({
        success: true,
        message: "Productos destacados obtenidos",
        data: productos,
      });
    } catch (error) {
      console.error("Error en getFeatured:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener productos destacados",
        error: error.message,
      });
    }
  },

  async getOffers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 12;
      const productos = await ProductosModel.getOffers(limit);

      res.json({
        success: true,
        message: "Productos en oferta obtenidos",
        data: productos,
      });
    } catch (error) {
      console.error("Error en getOffers:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener productos en oferta",
        error: error.message,
      });
    }
  },

  async getNew(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 12;
      const productos = await ProductosModel.getNew(limit);

      res.json({
        success: true,
        message: "Productos nuevos obtenidos",
        data: productos,
      });
    } catch (error) {
      console.error("Error en getNew:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener productos nuevos",
        error: error.message,
      });
    }
  },
};

export default ProductosController;
