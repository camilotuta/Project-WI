import ResenasModel from "../models/resenas.model.js";
import db from "../config/database.js";

/**
 * GET /api/resenas/stats
 * Devuelve promedios y totales de todos los productos que tienen reseñas
 */
export async function getAllStats(req, res) {
  try {
    const rows = await ResenasModel.getAllStats();
    // Convertir array a objeto keyed por id_producto para acceso O(1)
    const stats = {};
    rows.forEach((r) => {
      stats[r.id_producto] = {
        promedio: parseFloat(r.promedio) || 0,
        total: r.total || 0,
      };
    });
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("❌ getAllStats:", error);
    res.status(500).json({ success: false, message: "Error al obtener stats" });
  }
}

/**
 * GET /api/productos/:id/resenas
 * Devuelve reseñas + estadísticas de un producto
 */
export async function getResenas(req, res) {
  try {
    const { id } = req.params;

    const [resenas, stats] = await Promise.all([
      ResenasModel.getByProducto(id),
      ResenasModel.getStats(id),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          total: stats.total || 0,
          promedio: parseFloat(stats.promedio) || 0,
          distribucion: {
            5: stats.cinco || 0,
            4: stats.cuatro || 0,
            3: stats.tres || 0,
            2: stats.dos || 0,
            1: stats.uno || 0,
          },
        },
        resenas,
      },
    });
  } catch (error) {
    console.error("❌ getResenas:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al obtener reseñas" });
  }
}

/**
 * POST /api/productos/:id/resenas
 * Crea una nueva reseña para el producto.
 * Requisitos: usuario autenticado + haber comprado el producto + no tener reseña previa.
 */
export async function createResena(req, res) {
  try {
    const { id } = req.params;
    const { id_usuario, calificacion, titulo, comentario } = req.body;

    // 1. El usuario DEBE estar autenticado
    if (!id_usuario) {
      return res.status(401).json({
        success: false,
        message: "Debes iniciar sesión para publicar una reseña",
      });
    }

    // 2. Validar calificación
    const cal = parseInt(calificacion);
    if (!cal || cal < 1 || cal > 5) {
      return res.status(400).json({
        success: false,
        message: "La calificación debe ser un número entre 1 y 5",
      });
    }

    // 3. El usuario debe haber comprado el producto
    const compro = await ResenasModel.hasPurchased(id_usuario, id);
    if (!compro) {
      return res.status(403).json({
        success: false,
        message: "Solo puedes reseñar productos que hayas comprado",
      });
    }

    // 4. Evitar doble reseña del mismo usuario para el mismo producto
    const yaReseno = await ResenasModel.existsByUsuario(id, id_usuario);
    if (yaReseno) {
      return res.status(409).json({
        success: false,
        message: "Ya tienes una reseña para este producto",
      });
    }

    // 5. Obtener el nombre del usuario desde la base de datos
    const userResult = await db.query(
      `SELECT TRIM(nombre || ' ' || COALESCE(apellido, '')) AS nombre_completo
       FROM usuarios WHERE id_usuario = $1`,
      [id_usuario],
    );
    const nombre_autor =
      userResult.rows[0]?.nombre_completo?.trim() || "Usuario";

    // 6. Crear la reseña
    const nueva = await ResenasModel.create({
      id_producto: id,
      id_usuario,
      nombre_autor,
      calificacion: cal,
      titulo: titulo?.trim() || null,
      comentario: comentario?.trim() || null,
    });

    res.status(201).json({
      success: true,
      message: "¡Reseña publicada correctamente!",
      data: nueva,
    });
  } catch (error) {
    console.error("❌ createResena:", error);
    res.status(500).json({ success: false, message: "Error al crear reseña" });
  }
}

/**
 * DELETE /api/resenas/:id
 * Elimina una reseña
 */
export async function deleteResena(req, res) {
  try {
    const { id } = req.params;
    const deleted = await ResenasModel.delete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Reseña no encontrada" });
    }

    res.json({ success: true, message: "Reseña eliminada" });
  } catch (error) {
    console.error("❌ deleteResena:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al eliminar reseña" });
  }
}

/**
 * PATCH /api/resenas/:id/verificar
 * Marca/desmarca reseña como verificada (admin)
 */
export async function verificarResena(req, res) {
  try {
    const { id } = req.params;
    const { verificado } = req.body;
    const updated = await ResenasModel.setVerificado(id, verificado !== false);

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Reseña no encontrada" });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("❌ verificarResena:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al verificar reseña" });
  }
}
/**
 * GET /api/productos/:id/puede-resenar?id_usuario=X
 * Indica si el usuario puede reseñar el producto:
 *   - compro: si compró el producto
 *   - yaReseno: si ya tiene una reseña publicada
 */
export async function puedeResenar(req, res) {
  try {
    const { id } = req.params;
    const { id_usuario } = req.query;

    if (!id_usuario) {
      return res.json({
        success: true,
        data: { compro: false, yaReseno: false },
      });
    }

    const [compro, yaReseno] = await Promise.all([
      ResenasModel.hasPurchased(id_usuario, id),
      ResenasModel.existsByUsuario(id, id_usuario),
    ]);

    res.json({ success: true, data: { compro, yaReseno } });
  } catch (error) {
    console.error("❌ puedeResenar:", error);
    res.status(500).json({ success: false, message: "Error al verificar" });
  }
}
