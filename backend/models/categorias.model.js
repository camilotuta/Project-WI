const { query } = require("../config/database");

class CategoriaModel {
  // Obtener todas las categorías
  static async getAll() {
    const result = await query(
      `SELECT * FROM categorias WHERE activo = true ORDER BY id_categoria ASC`
    );
    return result.rows;
  }

  // Obtener categoría por ID
  static async getById(id) {
    const result = await query(
      `SELECT * FROM categorias WHERE id_categoria = $1`,
      [id]
    );
    return result.rows[0];
  }

  // Crear nueva categoría
  static async create({ nombre, descripcion, imagen_url }) {
    const result = await query(
      `INSERT INTO categorias (nombre, descripcion, imagen_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nombre, descripcion, imagen_url]
    );
    return result.rows[0];
  }

  // Actualizar categoría
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) throw new Error("No hay campos para actualizar");

    values.push(id);

    const result = await query(
      `UPDATE categorias SET ${fields.join(
        ", "
      )} WHERE id_categoria = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  // Eliminar (soft delete)
  static async delete(id) {
    const result = await query(
      `UPDATE categorias SET activo = false WHERE id_categoria = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = CategoriaModel;
