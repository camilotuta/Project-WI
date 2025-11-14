import db from "../config/database.js";

const CategoriasModel = {
  async getAll() {
    try {
      const query = `SELECT * FROM categorias`;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error en getAll:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const query = `SELECT * FROM categorias WHERE id_categoria = $1`;
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error en getById:", error);
      throw error;
    }
  },

  async create(data) {
    try {
      const { nombre, descripcion } = data;
      const query = `
        INSERT INTO categorias (nombre, descripcion)
        VALUES ($1, $2)
        RETURNING *
      `;
      const result = await db.query(query, [nombre, descripcion]);
      return result.rows[0];
    } catch (error) {
      console.error("Error en create:", error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const fields = Object.keys(data);
      const values = Object.values(data);
      const setClause = fields
        .map((field, i) => `${field} = $${i + 1}`)
        .join(", ");

      const query = `UPDATE categorias SET ${setClause} WHERE id_categoria = $${
        fields.length + 1
      } RETURNING *`;
      const result = await db.query(query, [...values, id]);

      return result.rows[0];
    } catch (error) {
      console.error("Error en update:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const query = `DELETE FROM categorias WHERE id_categoria = $1 RETURNING *`;
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error en delete:", error);
      throw error;
    }
  },
};

export default CategoriasModel;
