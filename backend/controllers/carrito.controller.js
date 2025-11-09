
const CarritoModel = require('../models/carrito.model');

class CarritoController {
  
  // GET /api/carrito/:id_usuario
  static async getCart(req, res, next) {
    try {
      const { id_usuario } = req.params;
      
      const items = await CarritoModel.getByUserId(id_usuario);
      const totales = await CarritoModel.getCartTotal(id_usuario);

      res.json({
        success: true,
        data: {
          items,
          totales
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/carrito
  static async addToCart(req, res, next) {
    try {
      const { id_usuario, id_producto, cantidad } = req.body;

      if (!id_usuario || !id_producto) {
        return res.status(400).json({
          success: false,
          message: 'id_usuario e id_producto son requeridos'
        });
      }

      const item = await CarritoModel.addItem(id_usuario, id_producto, cantidad || 1);

      res.status(201).json({
        success: true,
        message: 'Producto agregado al carrito',
        data: item
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/carrito/:id_carrito
  static async updateCartItem(req, res, next) {
    try {
      const { id_carrito } = req.params;
      const { cantidad } = req.body;

      if (!cantidad || cantidad < 1) {
        return res.status(400).json({
          success: false,
          message: 'Cantidad debe ser mayor a 0'
        });
      }

      const item = await CarritoModel.updateQuantity(id_carrito, cantidad);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item del carrito no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Cantidad actualizada',
        data: item
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/carrito/:id_carrito
  static async removeFromCart(req, res, next) {
    try {
      const { id_carrito } = req.params;

      const item = await CarritoModel.removeItem(id_carrito);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item del carrito no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Producto eliminado del carrito',
        data: item
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/carrito/clear/:id_usuario
  static async clearCart(req, res, next) {
    try {
      const { id_usuario } = req.params;

      await CarritoModel.clearCart(id_usuario);

      res.json({
        success: true,
        message: 'Carrito vaciado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CarritoController;