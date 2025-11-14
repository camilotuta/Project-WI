import FavoritosModel from "../models/favoritos.model.js";

const FavoritosController = {
  // GET /api/favoritos/:userId
  async getFavoritos(req, res) {
    try {
      const { userId } = req.params;
      const favoritos = await FavoritosModel.getFavoritosByUser(userId);

      res.json({
        success: true,
        data: favoritos,
        count: favoritos.length,
      });
    } catch (error) {
      console.error("Error al obtener favoritos:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener favoritos",
        error: error.message,
      });
    }
  },

  // POST /api/favoritos
  async addFavorito(req, res) {
    try {
      const { userId, productId } = req.body;

      if (!userId || !productId) {
        return res.status(400).json({
          success: false,
          message: "userId y productId son requeridos",
        });
      }

      const favorito = await FavoritosModel.addFavorito(userId, productId);

      res.json({
        success: true,
        message: "Producto agregado a favoritos",
        data: favorito,
      });
    } catch (error) {
      console.error("Error al agregar favorito:", error);
      res.status(500).json({
        success: false,
        message: "Error al agregar favorito",
        error: error.message,
      });
    }
  },

  // DELETE /api/favoritos
  async removeFavorito(req, res) {
    try {
      const { userId, productId } = req.body;

      if (!userId || !productId) {
        return res.status(400).json({
          success: false,
          message: "userId y productId son requeridos",
        });
      }

      const favorito = await FavoritosModel.removeFavorito(userId, productId);

      res.json({
        success: true,
        message: "Producto eliminado de favoritos",
        data: favorito,
      });
    } catch (error) {
      console.error("Error al eliminar favorito:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar favorito",
        error: error.message,
      });
    }
  },

  // POST /api/favoritos/toggle
  async toggleFavorito(req, res) {
    try {
      const { userId, productId } = req.body;

      if (!userId || !productId) {
        return res.status(400).json({
          success: false,
          message: "userId y productId son requeridos",
        });
      }

      const result = await FavoritosModel.toggleFavorito(userId, productId);

      res.json({
        success: true,
        message:
          result.action === "added"
            ? "Producto agregado a favoritos"
            : "Producto eliminado de favoritos",
        data: result,
      });
    } catch (error) {
      console.error("Error al toggle favorito:", error);
      res.status(500).json({
        success: false,
        message: "Error al procesar favorito",
        error: error.message,
      });
    }
  },

  // GET /api/favoritos/:userId/check/:productId
  async checkFavorito(req, res) {
    try {
      const { userId, productId } = req.params;
      const isFavorito = await FavoritosModel.isFavorito(userId, productId);

      res.json({
        success: true,
        isFavorito,
      });
    } catch (error) {
      console.error("Error al verificar favorito:", error);
      res.status(500).json({
        success: false,
        message: "Error al verificar favorito",
        error: error.message,
      });
    }
  },

  // GET /api/favoritos/:userId/count
  async countFavoritos(req, res) {
    try {
      const { userId } = req.params;
      const count = await FavoritosModel.countFavoritos(userId);

      res.json({
        success: true,
        count,
      });
    } catch (error) {
      console.error("Error al contar favoritos:", error);
      res.status(500).json({
        success: false,
        message: "Error al contar favoritos",
        error: error.message,
      });
    }
  },
};

export default FavoritosController;
