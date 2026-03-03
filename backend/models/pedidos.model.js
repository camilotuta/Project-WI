import db from "../config/database.js";

const PedidosModel = {
  /**
   * Crear un pedido completo a partir del carrito del usuario.
   * items: [{ id_producto, cantidad, precio_unitario }]
   */
  async create({ id_usuario, items }) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const total = items.reduce(
        (sum, i) => sum + i.precio_unitario * i.cantidad,
        0,
      );

      // Insertar cabecera del pedido
      const pedidoRes = await client.query(
        `INSERT INTO pedidos (id_usuario, total, estado)
         VALUES ($1, $2, 'completado')
         RETURNING *`,
        [id_usuario, total],
      );
      const pedido = pedidoRes.rows[0];

      // Insertar los items del pedido
      for (const item of items) {
        await client.query(
          `INSERT INTO pedido_items (id_pedido, id_producto, cantidad, precio_unitario)
           VALUES ($1, $2, $3, $4)`,
          [
            pedido.id_pedido,
            item.id_producto,
            item.cantidad,
            item.precio_unitario,
          ],
        );
      }

      await client.query("COMMIT");
      return pedido;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Obtener todos los pedidos de un usuario (con sus items)
   */
  async getByUsuario(idUsuario) {
    const result = await db.query(
      `SELECT
         p.id_pedido,
         p.total,
         p.estado,
         p.fecha_pedido,
         json_agg(
           json_build_object(
             'id_item',        pi.id_item,
             'id_producto',    pi.id_producto,
             'cantidad',       pi.cantidad,
             'precio_unitario',pi.precio_unitario,
             'nombre',         pr.nombre,
             'imagen_url',     pr.imagen_url
           )
         ) AS items
       FROM pedidos p
       JOIN pedido_items pi ON pi.id_pedido = p.id_pedido
       JOIN productos pr    ON pr.id_producto = pi.id_producto
       WHERE p.id_usuario = $1
       GROUP BY p.id_pedido
       ORDER BY p.fecha_pedido DESC`,
      [idUsuario],
    );
    return result.rows;
  },

  /**
   * Verificar si un usuario compró un producto específico
   */
  async hasPurchased(idUsuario, idProducto) {
    const result = await db.query(
      `SELECT 1
       FROM pedidos p
       JOIN pedido_items pi ON pi.id_pedido = p.id_pedido
       WHERE p.id_usuario   = $1
         AND pi.id_producto = $2
         AND p.estado       = 'completado'
       LIMIT 1`,
      [idUsuario, idProducto],
    );
    return result.rowCount > 0;
  },
};

export default PedidosModel;
