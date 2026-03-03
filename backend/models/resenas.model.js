import db from "../config/database.js";

const ResenasModel = {
  /**
   * Obtener todas las reseñas de un producto con stats
   */
  async getByProducto(idProducto) {
    const result = await db.query(
      `SELECT
         r.id_resena,
         r.id_producto,
         r.id_usuario,
         r.nombre_autor,
         r.calificacion,
         r.titulo,
         r.comentario,
         r.verificado,
         r.fecha_creacion
       FROM resenas r
       WHERE r.id_producto = $1
       ORDER BY r.fecha_creacion DESC`,
      [idProducto],
    );
    return result.rows;
  },

  /**
   * Estadísticas de calificaciones de un producto:
   * promedio, total, distribución por estrella (1-5)
   */
  async getStats(idProducto) {
    const result = await db.query(
      `SELECT
         COUNT(*)::int                                        AS total,
         ROUND(AVG(calificacion)::numeric, 1)                AS promedio,
         COUNT(*) FILTER (WHERE calificacion = 5)::int       AS cinco,
         COUNT(*) FILTER (WHERE calificacion = 4)::int       AS cuatro,
         COUNT(*) FILTER (WHERE calificacion = 3)::int       AS tres,
         COUNT(*) FILTER (WHERE calificacion = 2)::int       AS dos,
         COUNT(*) FILTER (WHERE calificacion = 1)::int       AS uno
       FROM resenas
       WHERE id_producto = $1`,
      [idProducto],
    );
    return result.rows[0];
  },

  /**
   * Crear nueva reseña
   */
  async create({
    id_producto,
    id_usuario,
    nombre_autor,
    calificacion,
    titulo,
    comentario,
  }) {
    const result = await db.query(
      `INSERT INTO resenas (id_producto, id_usuario, nombre_autor, calificacion, titulo, comentario)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        id_producto,
        id_usuario || null,
        nombre_autor || "Anónimo",
        calificacion,
        titulo || null,
        comentario || null,
      ],
    );
    return result.rows[0];
  },

  /**
   * Eliminar reseña (solo admin o propietario)
   */
  async delete(idResena) {
    const result = await db.query(
      `DELETE FROM resenas WHERE id_resena = $1 RETURNING id_resena`,
      [idResena],
    );
    return result.rowCount > 0;
  },

  /**
   * Verificar reseña (admin)
   */
  async setVerificado(idResena, verificado) {
    const result = await db.query(
      `UPDATE resenas SET verificado = $2 WHERE id_resena = $1 RETURNING *`,
      [idResena, verificado],
    );
    return result.rows[0];
  },

  /**
   * Stats de todos los productos a la vez (para el carrusel/catálogo)
   * Retorna: [{id_producto, promedio, total}]
   */
  async getAllStats() {
    const result = await db.query(
      `SELECT
         id_producto,
         ROUND(AVG(calificacion)::numeric, 1) AS promedio,
         COUNT(*)::int AS total
       FROM resenas
       GROUP BY id_producto`,
    );
    return result.rows;
  },

  /**
   * Verificar si un usuario ya reseñó este producto
   */
  async existsByUsuario(idProducto, idUsuario) {
    const result = await db.query(
      `SELECT 1 FROM resenas WHERE id_producto = $1 AND id_usuario = $2 LIMIT 1`,
      [idProducto, idUsuario],
    );
    return result.rowCount > 0;
  },

  /**
   * Verificar si el usuario compró el producto (tiene al menos un pedido completado con ese producto)
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

export default ResenasModel;
