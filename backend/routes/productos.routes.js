const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// GET todos los productos
router.get("/", async (req, res) => {
  try {
    const {
      categoria,
      destacado,
      nuevo,
      oferta,
      limit = 50,
      offset = 0,
    } = req.query;

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

    const params = [];
    let paramCount = 1;

    if (categoria) {
      queryText += ` AND p.id_categoria = $${paramCount}`;
      params.push(categoria);
      paramCount++;
    }

    if (destacado === "true") {
      queryText += ` AND p.destacado = true`;
    }

    if (nuevo === "true") {
      queryText += ` AND p.nuevo = true`;
    }

    if (oferta === "true") {
      queryText += ` AND p.oferta = true`;
    }

    queryText += `
      GROUP BY p.id_producto, c.nombre
      ORDER BY p.destacado DESC, p.fecha_creacion DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    params.push(limit, offset);

    const result = await pool.query(queryText, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error en GET /productos:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo productos",
      error: error.message,
    });
  }
});

// GET producto por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

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

    const result = await pool.query(queryText, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error en GET /productos/:id:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo producto",
      error: error.message,
    });
  }
});

// GET productos relacionados
router.get("/:id/relacionados", async (req, res) => {
  try {
    const { id } = req.params;
    const limit = req.query.limit || 4;

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

    const result = await pool.query(queryText, [id, limit]);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error en GET /productos/:id/relacionados:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo productos relacionados",
      error: error.message,
    });
  }
});

module.exports = router;
