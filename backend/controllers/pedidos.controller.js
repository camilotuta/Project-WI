import PedidosModel from "../models/pedidos.model.js";
import CarritoModel from "../models/carrito.model.js";
import db from "../config/database.js";

/**
 * POST /api/pedidos
 * Convierte el carrito actual del usuario en un pedido completado.
 * Body: { id_usuario }
 */
export async function createPedido(req, res) {
  try {
    const { id_usuario } = req.body;

    if (!id_usuario) {
      return res.status(400).json({
        success: false,
        message: "Se requiere id_usuario",
      });
    }

    // Obtener carrito del usuario
    const carritoItems = await CarritoModel.getByUserId(id_usuario);

    if (!carritoItems || carritoItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El carrito está vacío",
      });
    }

    // Mapear items para el pedido
    const items = carritoItems.map((i) => ({
      id_producto: i.id_producto,
      cantidad: i.cantidad,
      precio_unitario: parseFloat(i.precio),
    }));

    // Crear el pedido
    const pedido = await PedidosModel.create({ id_usuario, items });

    // Vaciar el carrito después de confirmar el pedido
    await db.query(`DELETE FROM carrito WHERE id_usuario = $1`, [id_usuario]);

    res.status(201).json({
      success: true,
      message: "¡Pedido completado correctamente!",
      data: pedido,
    });
  } catch (error) {
    console.error("❌ createPedido:", error);
    res.status(500).json({ success: false, message: "Error al crear pedido" });
  }
}

/**
 * GET /api/pedidos/usuario/:id
 * Obtener historial de pedidos de un usuario
 */
export async function getPedidosUsuario(req, res) {
  try {
    const { id } = req.params;
    const pedidos = await PedidosModel.getByUsuario(id);
    res.json({ success: true, data: pedidos });
  } catch (error) {
    console.error("❌ getPedidosUsuario:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al obtener pedidos" });
  }
}

/**
 * GET /api/pedidos/verificar-compra?id_usuario=X&id_producto=Y
 * Verificar si un usuario compró un producto (para permitir reseña)
 */
export async function verificarCompra(req, res) {
  try {
    const { id_usuario, id_producto } = req.query;

    if (!id_usuario || !id_producto) {
      return res.status(400).json({
        success: false,
        message: "Se requieren id_usuario e id_producto",
      });
    }

    const compro = await PedidosModel.hasPurchased(id_usuario, id_producto);
    res.json({ success: true, data: { compro } });
  } catch (error) {
    console.error("❌ verificarCompra:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al verificar compra" });
  }
}
