const { query } = require('../config/database');

class CategoriaModel {
  
  static async getAll() {
    const queryText = `
      SELECT 
        c.*,
        COUNT(p.id_producto) as total_productos
      FROM categorias c
      LEFT JOIN productos p ON c.id_categoria = p.id_categoria AND p.activo = true
      WHERE c.activo = true
      GROUP BY c.id_categoria
      ORDER BY c.nombre ASC
    `;

    const result = await query(queryText);
    return result.rows;
  }

  static async getById(id) {
    const queryText = `
      SELECT 
        c.*,
        COUNT(p.id_producto) as total_productos
      FROM categorias c
      LEFT JOIN productos p ON c.id_categoria = p.id_categoria AND p.activo = true
      WHERE c.id_categoria = $1 AND c.activo = true
      GROUP BY c.id_categoria
    `;

    const result = await query(queryText, [id]);
    return result.rows[0];
  }

  static async create(categoriaData) {
    const { nombre, descripcion, imagen_url } = categoriaData;

    const queryText = `
      INSERT INTO categorias (nombre, descripcion, imagen_url)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await query(queryText, [nombre, descripcion, imagen_url || null]);
    return result.rows[0];
  }

  static async update(id, categoriaData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(categoriaData).forEach(key => {
      if (categoriaData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(categoriaData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(id);

    const queryText = `
      UPDATE categorias 
      SET ${fields.join(', ')}
      WHERE id_categoria = $${paramCount}
      RETURNING *
    `;

    const result = await query(queryText, values);
    return result.rows[0];
  }

  static async delete(id) {
    const queryText = `
      UPDATE categorias 
      SET activo = false 
      WHERE id_categoria = $1
      RETURNING *
    `;

    const result = await query(queryText, [id]);
    return result.rows[0];
  }
}

module.exports = CategoriaModel;