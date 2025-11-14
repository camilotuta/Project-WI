import CarritoModel from "../models/carrito.model.js";

const CarritoController = {
  // Obtener carrito del usuario
  async getCart(req, res) {
    try {
      const { id_usuario } = req.params;

      if (!id_usuario) {
        return res.status(400).json({
          success: false,
          message: "ID de usuario requerido",
        });
      }

      const carrito = await CarritoModel.getByUserId(id_usuario);

      res.json({
        success: true,
        message: "Carrito obtenido exitosamente",
        data: carrito,
      });
    } catch (error) {
      console.error("Error en getCart:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener carrito",
        error: error.message,
      });
    }
  },

  // Agregar producto al carrito
  async addToCart(req, res) {
    try {
      const { id_usuario, id_producto, cantidad } = req.body;

      // Validar que todos los parámetros estén presentes
      if (!id_usuario || !id_producto || !cantidad) {
        return res.status(400).json({
          success: false,
          message: "Faltan parámetros: id_usuario, id_producto, cantidad",
        });
      }

      console.log(
        `📦 Agregando al carrito - Usuario: ${id_usuario}, Producto: ${id_producto}, Cantidad: ${cantidad}`
      );

      // Verificar si el producto ya existe en el carrito
      const existingItem = await CarritoModel.getByUserAndProduct(
        id_usuario,
        id_producto
      );

      if (existingItem) {
        // Si existe, actualizar la cantidad
        const newQuantity = existingItem.cantidad + cantidad;
        const updated = await CarritoModel.update(
          existingItem.id_carrito,
          newQuantity
        );

        console.log(`✅ Cantidad actualizada: ${newQuantity}`);

        return res.json({
          success: true,
          message: "Producto actualizado en el carrito",
          data: updated,
        });
      }

      // Si no existe, crear nuevo item
      const newItem = await CarritoModel.create(
        id_usuario,
        id_producto,
        cantidad
      );

      console.log(`✅ Producto agregado al carrito:`, newItem);

      res.json({
        success: true,
        message: "Producto agregado al carrito",
        data: newItem,
      });
    } catch (error) {
      console.error("Error en addToCart:", error);
      res.status(500).json({
        success: false,
        message: "Error al agregar producto al carrito",
        error: error.message,
      });
    }
  },

  // Actualizar cantidad de producto en el carrito
  async updateCartItem(req, res) {
    try {
      const { id_carrito } = req.params;
      const { cantidad } = req.body;

      if (!id_carrito || !cantidad) {
        return res.status(400).json({
          success: false,
          message: "Faltan parámetros: id_carrito, cantidad",
        });
      }

      if (cantidad <= 0) {
        return res.status(400).json({
          success: false,
          message: "La cantidad debe ser mayor a 0",
        });
      }

      console.log(
        `📝 Actualizando carrito ${id_carrito} - Nueva cantidad: ${cantidad}`
      );

      const updated = await CarritoModel.update(id_carrito, cantidad);

      res.json({
        success: true,
        message: "Cantidad actualizada",
        data: updated,
      });
    } catch (error) {
      console.error("Error en updateCartItem:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar el carrito",
        error: error.message,
      });
    }
  },

  // Eliminar producto del carrito
  async removeFromCart(req, res) {
    try {
      const { id_carrito } = req.params;

      if (!id_carrito) {
        return res.status(400).json({
          success: false,
          message: "ID de carrito requerido",
        });
      }

      console.log(`🗑️ Eliminando del carrito: ${id_carrito}`);

      await CarritoModel.delete(id_carrito);

      res.json({
        success: true,
        message: "Producto eliminado del carrito",
      });
    } catch (error) {
      console.error("Error en removeFromCart:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar del carrito",
        error: error.message,
      });
    }
  },

  // Vaciar carrito del usuario
  async clearCart(req, res) {
    try {
      const { id_usuario } = req.params;

      if (!id_usuario) {
        return res.status(400).json({
          success: false,
          message: "ID de usuario requerido",
        });
      }

      console.log(`🗑️ Vaciando carrito del usuario: ${id_usuario}`);

      await CarritoModel.deleteByUserId(id_usuario);

      res.json({
        success: true,
        message: "Carrito vaciado",
      });
    } catch (error) {
      console.error("Error en clearCart:", error);
      res.status(500).json({
        success: false,
        message: "Error al vaciar el carrito",
        error: error.message,
      });
    }
  },
};

export default CarritoController;
