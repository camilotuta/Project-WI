import db from "../config/database.js";

const SuplementosModel = {
  async getAll() {
    try {
      const query = `SELECT * FROM suplementos`;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error en getAll:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const query = `SELECT * FROM suplementos WHERE id_suplemento = $1`;
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error en getById:", error);
      throw error;
    }
  },

  async create(data) {
    try {
      const { nombre, descripcion, precio } = data;
      const query = `
        INSERT INTO suplementos (nombre, descripcion, precio)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const result = await db.query(query, [nombre, descripcion, precio]);
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

      const query = `UPDATE suplementos SET ${setClause} WHERE id_suplemento = $${
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
      const query = `DELETE FROM suplementos WHERE id_suplemento = $1 RETURNING *`;
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error en delete:", error);
      throw error;
    }
  },
};

export default SuplementosModel;
