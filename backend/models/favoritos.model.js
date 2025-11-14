import db from "../config/database.js";

const FavoritosModel = {
  // Obtener todos los favoritos de un usuario
  async getFavoritosByUser(userId) {
    try {
      const query = `
        SELECT 
          f.id_favorito,
          f.fecha_agregado,
          p.*,
          c.nombre as categoria_nombre
        FROM favoritos f
        JOIN productos p ON f.id_producto = p.id_producto
        LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
        WHERE f.id_usuario = $1
        ORDER BY f.fecha_agregado DESC
      `;
      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error("Error en getFavoritosByUser:", error);
      throw error;
    }
  },

  // Agregar producto a favoritos
  async addFavorito(userId, productId) {
    try {
      const query = `
        INSERT INTO favoritos (id_usuario, id_producto)
        VALUES ($1, $2)
        ON CONFLICT (id_usuario, id_producto) DO NOTHING
        RETURNING *
      `;
      const result = await db.query(query, [userId, productId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error en addFavorito:", error);
      throw error;
    }
  },

  // Eliminar producto de favoritos
  async removeFavorito(userId, productId) {
    try {
      const query = `
        DELETE FROM favoritos
        WHERE id_usuario = $1 AND id_producto = $2
        RETURNING *
      `;
      const result = await db.query(query, [userId, productId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error en removeFavorito:", error);
      throw error;
    }
  },

  // Verificar si un producto está en favoritos
  async isFavorito(userId, productId) {
    try {
      const query = `
        SELECT EXISTS(
          SELECT 1 FROM favoritos
          WHERE id_usuario = $1 AND id_producto = $2
        ) as is_favorito
      `;
      const result = await db.query(query, [userId, productId]);
      return result.rows[0].is_favorito;
    } catch (error) {
      console.error("Error en isFavorito:", error);
      throw error;
    }
  },

  // Obtener cantidad de favoritos de un usuario
  async countFavoritos(userId) {
    try {
      const query = `
        SELECT COUNT(*) as total
        FROM favoritos
        WHERE id_usuario = $1
      `;
      const result = await db.query(query, [userId]);
      return parseInt(result.rows[0].total);
    } catch (error) {
      console.error("Error en countFavoritos:", error);
      throw error;
    }
  },

  // Toggle favorito (agregar si no existe, eliminar si existe)
  async toggleFavorito(userId, productId) {
    try {
      const isFav = await this.isFavorito(userId, productId);

      if (isFav) {
        await this.removeFavorito(userId, productId);
        return { action: "removed", isFavorito: false };
      } else {
        await this.addFavorito(userId, productId);
        return { action: "added", isFavorito: true };
      }
    } catch (error) {
      console.error("Error en toggleFavorito:", error);
      throw error;
    }
  },
};

export default FavoritosModel;
