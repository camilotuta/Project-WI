import db from "../config/database.js";

const ProductosModel = {
  async getAll() {
    try {
      const query = `
        SELECT 
          p.*,
          c.nombre as categoria_nombre
        FROM productos p
        LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
        ORDER BY p.id_producto
      `;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error en getAll:", error);
      throw error;
    }
  },

  async getByCategory(categoryName) {
    try {
      const query = `
        SELECT 
          p.*,
          c.nombre as categoria_nombre
        FROM productos p
        JOIN categorias c ON p.id_categoria = c.id_categoria
        WHERE LOWER(c.nombre) = LOWER($1)
        ORDER BY p.id_producto
      `;
      const result = await db.query(query, [categoryName]);
      return result.rows;
    } catch (error) {
      console.error("Error en getByCategory:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const query = `
        SELECT 
          p.*,
          c.nombre as categoria_nombre
        FROM productos p
        LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
        WHERE p.id_producto = $1
      `;
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error en getById:", error);
      throw error;
    }
  },

  async getRelated(id, limit = 5) {
    try {
      const query = `
        SELECT 
          p2.*,
          c.nombre as categoria_nombre
        FROM productos p1
        JOIN productos p2 ON p1.id_categoria = p2.id_categoria
        LEFT JOIN categorias c ON p2.id_categoria = c.id_categoria
        WHERE p1.id_producto = $1 
          AND p2.id_producto != $1
        ORDER BY RANDOM()
        LIMIT $2
      `;
      const result = await db.query(query, [id, limit]);
      return result.rows;
    } catch (error) {
      console.error("Error en getRelated:", error);
      throw error;
    }
  },

  async create(data) {
    try {
      const { nombre, descripcion, precio, categoria, stock } = data;
      const query = `
        INSERT INTO productos (nombre, descripcion, precio, categoria, stock)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const result = await db.query(query, [
        nombre,
        descripcion,
        precio,
        categoria,
        stock || 0,
      ]);
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

      const query = `UPDATE productos SET ${setClause} WHERE id_producto = $${
        fields.length + 1
      } RETURNING *`;
      const result = await db.query(query, [...values, id]);

      return result.rows[0];
    } catch (error) {
      console.error("Error en update:", error);
      throw error;
    }
  },

  async getRandom(limit = 4) {
    try {
      const query = `
        SELECT * FROM productos 
        ORDER BY RANDOM() 
        LIMIT $1
      `;
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error("Error en getRandom:", error);
      throw error;
    }
  },

  async getFeatured(limit = 8) {
    try {
      const query = `
        SELECT * FROM productos 
        WHERE destacado = TRUE 
        ORDER BY RANDOM() 
        LIMIT $1
      `;
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error("Error en getFeatured:", error);
      throw error;
    }
  },

  async getOffers(limit = 12) {
    try {
      const query = `
        SELECT * FROM productos 
        WHERE oferta IS NOT NULL AND oferta > 0
        ORDER BY oferta DESC 
        LIMIT $1
      `;
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error("Error en getOffers:", error);
      throw error;
    }
  },

  async getNew(limit = 12) {
    try {
      const query = `
        SELECT * FROM productos 
        ORDER BY id_producto DESC 
        LIMIT $1
      `;
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error("Error en getNew:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const query = `DELETE FROM productos WHERE id_producto = $1 RETURNING *`;
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error en delete:", error);
      throw error;
    }
  },
};

export default ProductosModel;
