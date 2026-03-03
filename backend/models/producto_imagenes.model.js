import db from "../config/database.js";

const ProductoImagenesModel = {
  // Obtener todas las imágenes de un producto ordenadas
  async getByProducto(id_producto) {
    const result = await db.query(
      `SELECT * FROM producto_imagenes
       WHERE id_producto = $1
       ORDER BY orden ASC, id_imagen ASC`,
      [id_producto],
    );
    return result.rows;
  },

  // Agregar una imagen a un producto
  async add({ id_producto, imagen_url, orden = null, alt_text = null }) {
    // Si no se especifica orden, usar el siguiente disponible
    if (orden === null) {
      const maxResult = await db.query(
        `SELECT COALESCE(MAX(orden), -1) + 1 AS next_orden
         FROM producto_imagenes WHERE id_producto = $1`,
        [id_producto],
      );
      orden = maxResult.rows[0].next_orden;
    }
    const result = await db.query(
      `INSERT INTO producto_imagenes (id_producto, imagen_url, orden, alt_text)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id_producto, imagen_url, orden, alt_text],
    );
    return result.rows[0];
  },

  // Actualizar datos de una imagen (url, orden, alt_text)
  async update(id_imagen, { imagen_url, orden, alt_text }) {
    const fields = [];
    const values = [];
    let i = 1;
    if (imagen_url !== undefined) {
      fields.push(`imagen_url = $${i++}`);
      values.push(imagen_url);
    }
    if (orden !== undefined) {
      fields.push(`orden = $${i++}`);
      values.push(orden);
    }
    if (alt_text !== undefined) {
      fields.push(`alt_text = $${i++}`);
      values.push(alt_text);
    }
    if (fields.length === 0) throw new Error("Nada que actualizar");
    values.push(id_imagen);
    const result = await db.query(
      `UPDATE producto_imagenes SET ${fields.join(", ")} WHERE id_imagen = $${i} RETURNING *`,
      values,
    );
    return result.rows[0];
  },

  // Reordenar imágenes: recibe array [{id_imagen, orden}]
  async reorder(ordenes) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      for (const { id_imagen, orden } of ordenes) {
        await client.query(
          "UPDATE producto_imagenes SET orden = $1 WHERE id_imagen = $2",
          [orden, id_imagen],
        );
      }
      await client.query("COMMIT");
      return true;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // Eliminar una imagen
  async delete(id_imagen) {
    const result = await db.query(
      "DELETE FROM producto_imagenes WHERE id_imagen = $1 RETURNING *",
      [id_imagen],
    );
    return result.rows[0];
  },

  // Eliminar todas las imágenes de un producto
  async deleteByProducto(id_producto) {
    const result = await db.query(
      "DELETE FROM producto_imagenes WHERE id_producto = $1",
      [id_producto],
    );
    return result.rowCount;
  },
};

export default ProductoImagenesModel;
