const { query } = require('../config/database');

class ProductoModel {
  
  // Obtener todos los productos con filtros
  static async getAll(filters = {}) {
    const { 
      categoria, 
      destacado, 
      nuevo, 
      oferta, 
      limit = 50, 
      offset = 0,
      search 
    } = filters;

    let queryText = `
      SELECT 
        p.*,
        c.nombre as nombre_categoria,
        COALESCE(AVG(v.puntuacion), 0) as valoracion_promedio,
        COUNT(DISTINCT v.id_valoracion) as total_valoraciones
      FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN valoraciones v ON p.id_producto = v.id_producto
      WHERE p.activo = true
    `;

    const queryParams = [];
    let paramCount = 1;

    if (categoria) {
      queryText += ` AND p.id_categoria = $${paramCount}`;
      queryParams.push(categoria);
      paramCount++;
    }

    if (destacado !== undefined) {
      queryText += ` AND p.destacado = $${paramCount}`;
      queryParams.push(destacado);
      paramCount++;
    }

    if (nuevo !== undefined) {
      queryText += ` AND p.nuevo = $${paramCount}`;
      queryParams.push(nuevo);
      paramCount++;
    }

    if (oferta !== undefined) {
      queryText += ` AND p.oferta = $${paramCount}`;
      queryParams.push(oferta);
      paramCount++;
    }

    if (search) {
      queryText += ` AND (p.nombre ILIKE $${paramCount} OR p.descripcion ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    queryText += `
      GROUP BY p.id_producto, c.nombre
      ORDER BY p.fecha_creacion DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);
    return result.rows;
  }

  // Obtener un producto por ID
  static async getById(id) {
    const queryText = `
      SELECT 
        p.*,
        c.nombre as nombre_categoria,
        COALESCE(AVG(v.puntuacion), 0) as valoracion_promedio,
        COUNT(DISTINCT v.id_valoracion) as total_valoraciones
      FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN valoraciones v ON p.id_producto = v.id_producto
      WHERE p.id_producto = $1 AND p.activo = true
      GROUP BY p.id_producto, c.nombre
    `;

    const result = await query(queryText, [id]);
    return result.rows[0];
  }

  // Crear un nuevo producto
  static async create(productoData) {
    const {
      nombre,
      descripcion,
      precio,
      precio_original,
      id_categoria,
      imagen_url,
      stock,
      destacado,
      nuevo,
      oferta
    } = productoData;

    const queryText = `
      INSERT INTO productos (
        nombre, descripcion, precio, precio_original, 
        id_categoria, imagen_url, stock, destacado, nuevo, oferta
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      nombre,
      descripcion,
      precio,
      precio_original || null,
      id_categoria,
      imagen_url || null,
      stock || 0,
      destacado || false,
      nuevo || false,
      oferta || false
    ];

    const result = await query(queryText, values);
    return result.rows[0];
  }

  // Actualizar un producto
  static async update(id, productoData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(productoData).forEach(key => {
      if (productoData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(productoData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(id);

    const queryText = `
      UPDATE productos 
      SET ${fields.join(', ')}
      WHERE id_producto = $${paramCount}
      RETURNING *
    `;

    const result = await query(queryText, values);
    return result.rows[0];
  }

  // Eliminar (soft delete) un producto
  static async delete(id) {
    const queryText = `
      UPDATE productos 
      SET activo = false 
      WHERE id_producto = $1
      RETURNING *
    `;

    const result = await query(queryText, [id]);
    return result.rows[0];
  }

  // Actualizar stock
  static async updateStock(id, cantidad) {
    const queryText = `
      UPDATE productos 
      SET stock = stock + $1
      WHERE id_producto = $2
      RETURNING *
    `;

    const result = await query(queryText, [cantidad, id]);
    return result.rows[0];
  }

  // Verificar disponibilidad de stock
  static async checkStock(id, cantidad) {
    const queryText = `
      SELECT stock FROM productos WHERE id_producto = $1
    `;

    const result = await query(queryText, [id]);
    if (!result.rows[0]) return false;
    
    return result.rows[0].stock >= cantidad;
  }

  // Obtener productos relacionados (por categoría)
  static async getRelated(id_producto, limit = 4) {
    const queryText = `
      SELECT 
        p.*,
        c.nombre as nombre_categoria,
        COALESCE(AVG(v.puntuacion), 0) as valoracion_promedio
      FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN valoraciones v ON p.id_producto = v.id_producto
      WHERE p.id_categoria = (
        SELECT id_categoria FROM productos WHERE id_producto = $1
      )
      AND p.id_producto != $1
      AND p.activo = true
      GROUP BY p.id_producto, c.nombre
      ORDER BY RANDOM()
      LIMIT $2
    `;

    const result = await query(queryText, [id_producto, limit]);
    return result.rows;
  }
}

module.exports = ProductoModel;