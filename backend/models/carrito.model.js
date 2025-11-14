import db from "../config/database.js";

const CarritoModel = {
  // Obtener carrito del usuario
  async getByUserId(id_usuario) {
    try {
      const query = `
        SELECT 
          c.id_carrito,
          c.id_usuario,
          c.id_producto,
          c.cantidad,
          p.nombre,
          p.precio,
          p.descripcion,
          p.imagen_url
        FROM carrito c
        JOIN productos p ON c.id_producto = p.id_producto
        WHERE c.id_usuario = $1
        ORDER BY c.fecha_agregado DESC
      `;

      const result = await db.query(query, [id_usuario]);
      console.log(
        `📦 Carrito obtenido para usuario ${id_usuario}:`,
        result.rows
      );
      return result.rows;
    } catch (error) {
      console.error("Error en getByUserId:", error);
      throw error;
    }
  },

  // Obtener item específico del carrito
  async getByUserAndProduct(id_usuario, id_producto) {
    try {
      const query = `
        SELECT * FROM carrito
        WHERE id_usuario = $1 AND id_producto = $2
        LIMIT 1
      `;

      const result = await db.query(query, [id_usuario, id_producto]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error en getByUserAndProduct:", error);
      throw error;
    }
  },

  // Crear item en el carrito
  async create(id_usuario, id_producto, cantidad) {
    try {
      const query = `
        INSERT INTO carrito (id_usuario, id_producto, cantidad)
        VALUES ($1, $2, $3)
        RETURNING *
      `;

      const result = await db.query(query, [id_usuario, id_producto, cantidad]);

      console.log(`✅ Item creado en carrito:`, result.rows[0]);

      return result.rows[0];
    } catch (error) {
      console.error("Error en create:", error);
      throw error;
    }
  },

  // Actualizar cantidad
  async update(id_carrito, cantidad) {
    try {
      const query = `
        UPDATE carrito
        SET cantidad = $1
        WHERE id_carrito = $2
        RETURNING *
      `;

      const result = await db.query(query, [cantidad, id_carrito]);

      console.log(`✅ Carrito actualizado:`, result.rows[0]);

      return result.rows[0];
    } catch (error) {
      console.error("Error en update:", error);
      throw error;
    }
  },

  // Eliminar item del carrito
  async delete(id_carrito) {
    try {
      const query = `DELETE FROM carrito WHERE id_carrito = $1 RETURNING *`;

      const result = await db.query(query, [id_carrito]);

      console.log(`✅ Item eliminado del carrito:`, result.rows[0]);

      return result.rows[0];
    } catch (error) {
      console.error("Error en delete:", error);
      throw error;
    }
  },

  // Eliminar todo el carrito del usuario
  async deleteByUserId(id_usuario) {
    try {
      const query = `DELETE FROM carrito WHERE id_usuario = $1 RETURNING *`;

      const result = await db.query(query, [id_usuario]);

      console.log(
        `✅ Carrito eliminado para usuario ${id_usuario}:`,
        result.rows
      );

      return result.rows;
    } catch (error) {
      console.error("Error en deleteByUserId:", error);
      throw error;
    }
  },

  // Obtener cantidad total de items
  async getTotalItems(id_usuario) {
    try {
      const query = `
        SELECT SUM(cantidad) as total
        FROM carrito
        WHERE id_usuario = $1
      `;

      const result = await db.query(query, [id_usuario]);
      return result.rows[0]?.total || 0;
    } catch (error) {
      console.error("Error en getTotalItems:", error);
      throw error;
    }
  },

  // Obtener total de precio
  async getTotalPrice(id_usuario) {
    try {
      const query = `
        SELECT SUM(p.precio * c.cantidad) as total
        FROM carrito c
        JOIN productos p ON c.id_producto = p.id_producto
        WHERE c.id_usuario = $1
      `;

      const result = await db.query(query, [id_usuario]);
      return result.rows[0]?.total || 0;
    } catch (error) {
      console.error("Error en getTotalPrice:", error);
      throw error;
    }
  },
};

export default CarritoModel;
