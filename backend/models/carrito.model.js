
const { query } = require('../config/database');

class CarritoModel {
  
  // Obtener carrito de un usuario
  static async getByUserId(id_usuario) {
    const queryText = `
      SELECT 
        c.id_carrito,
        c.id_usuario,
        c.id_producto,
        c.cantidad,
        c.fecha_agregado,
        p.nombre,
        p.descripcion,
        p.precio,
        p.imagen_url,
        p.stock,
        (p.precio * c.cantidad) as subtotal
      FROM carrito c
      INNER JOIN productos p ON c.id_producto = p.id_producto
      WHERE c.id_usuario = $1 AND p.activo = true
      ORDER BY c.fecha_agregado DESC
    `;

    const result = await query(queryText, [id_usuario]);
    return result.rows;
  }

  // Agregar producto al carrito
  static async addItem(id_usuario, id_producto, cantidad = 1) {
    // Verificar si el producto ya está en el carrito
    const checkQuery = `
      SELECT id_carrito, cantidad FROM carrito 
      WHERE id_usuario = $1 AND id_producto = $2
    `;
    
    const existing = await query(checkQuery, [id_usuario, id_producto]);

    if (existing.rows.length > 0) {
      // Si existe, actualizar cantidad
      const updateQuery = `
        UPDATE carrito 
        SET cantidad = cantidad + $1
        WHERE id_carrito = $2
        RETURNING *
      `;
      const result = await query(updateQuery, [cantidad, existing.rows[0].id_carrito]);
      return result.rows[0];
    } else {
      // Si no existe, crear nuevo item
      const insertQuery = `
        INSERT INTO carrito (id_usuario, id_producto, cantidad)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const result = await query(insertQuery, [id_usuario, id_producto, cantidad]);
      return result.rows[0];
    }
  }

  // Actualizar cantidad de un item
  static async updateQuantity(id_carrito, cantidad) {
    const queryText = `
      UPDATE carrito 
      SET cantidad = $1
      WHERE id_carrito = $2
      RETURNING *
    `;

    const result = await query(queryText, [cantidad, id_carrito]);
    return result.rows[0];
  }

  // Eliminar item del carrito
  static async removeItem(id_carrito) {
    const queryText = `
      DELETE FROM carrito 
      WHERE id_carrito = $1
      RETURNING *
    `;

    const result = await query(queryText, [id_carrito]);
    return result.rows[0];
  }

  // Vaciar carrito de un usuario
  static async clearCart(id_usuario) {
    const queryText = `
      DELETE FROM carrito 
      WHERE id_usuario = $1
      RETURNING *
    `;

    const result = await query(queryText, [id_usuario]);
    return result.rows;
  }

  // Obtener total del carrito
  static async getCartTotal(id_usuario) {
    const queryText = `
      SELECT 
        COUNT(c.id_carrito) as total_items,
        SUM(c.cantidad) as total_productos,
        SUM(p.precio * c.cantidad) as total
      FROM carrito c
      INNER JOIN productos p ON c.id_producto = p.id_producto
      WHERE c.id_usuario = $1 AND p.activo = true
    `;

    const result = await query(queryText, [id_usuario]);
    return result.rows[0];
  }
}

module.exports = CarritoModel;