const { query } = require("../config/database");

class SuplementoModel {
  // Obtener todos los suplementos con su producto
  static async getAll() {
    const result = await query(`
      SELECT s.*, p.nombre AS nombre_producto, p.precio, p.descripcion AS descripcion_producto, p.imagen_url
      FROM suplementos s
      JOIN productos p ON s.id_producto = p.id_producto
      ORDER BY s.id_suplemento ASC
    `);
    return result.rows;
  }

  // Obtener un suplemento por ID
  static async getById(id) {
    const result = await query(
      `
      SELECT s.*, p.nombre AS nombre_producto, p.precio, p.descripcion AS descripcion_producto, p.imagen_url
      FROM suplementos s
      JOIN productos p ON s.id_producto = p.id_producto
      WHERE s.id_suplemento = $1
    `,
      [id]
    );
    return result.rows[0];
  }

  // Crear un nuevo suplemento
  static async create(data) {
    const {
      id_producto,
      tipo,
      ingredientes,
      dosis_recomendada,
      beneficios,
      advertencias,
      certificaciones,
    } = data;
    const result = await query(
      `
      INSERT INTO suplementos (id_producto, tipo, ingredientes, dosis_recomendada, beneficios, advertencias, certificaciones)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
      [
        id_producto,
        tipo,
        ingredientes,
        dosis_recomendada,
        beneficios,
        advertencias,
        certificaciones,
      ]
    );
    return result.rows[0];
  }

  // Actualizar suplemento
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
      `
      UPDATE suplementos
      SET ${fields.join(", ")}
      WHERE id_suplemento = $${paramCount}
      RETURNING *
    `,
      values
    );
    return result.rows[0];
  }

  // Eliminar suplemento (borrado real)
  static async delete(id) {
    const result = await query(
      `
      DELETE FROM suplementos WHERE id_suplemento = $1 RETURNING *
    `,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = SuplementoModel;
