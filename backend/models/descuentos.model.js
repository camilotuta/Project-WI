import pool from "../config/database.js";

class DescuentosModel {
  // Validar un código de descuento
  static async validarCodigo(codigo, subtotal) {
    try {
      const query = `
        SELECT * FROM descuentos 
        WHERE codigo = $1 
          AND activo = true
          AND (fecha_expiracion IS NULL OR fecha_expiracion > NOW())
          AND (usos_maximos IS NULL OR usos_actuales < usos_maximos)
          AND $2 >= monto_minimo
      `;

      const result = await pool.query(query, [codigo.toUpperCase(), subtotal]);

      if (result.rows.length === 0) {
        // Verificar motivo específico del rechazo
        const checkQuery = `SELECT * FROM descuentos WHERE codigo = $1`;
        const checkResult = await pool.query(checkQuery, [
          codigo.toUpperCase(),
        ]);

        if (checkResult.rows.length === 0) {
          return {
            valido: false,
            mensaje: "❌ Código de descuento no válido",
          };
        }

        const cupon = checkResult.rows[0];

        if (!cupon.activo) {
          return {
            valido: false,
            mensaje: "❌ Este cupón ya no está activo",
          };
        }

        if (
          cupon.fecha_expiracion &&
          new Date(cupon.fecha_expiracion) < new Date()
        ) {
          return {
            valido: false,
            mensaje: "❌ Este cupón ha expirado",
          };
        }

        if (cupon.usos_maximos && cupon.usos_actuales >= cupon.usos_maximos) {
          return {
            valido: false,
            mensaje: "❌ Este cupón ha alcanzado el límite de usos",
          };
        }

        if (subtotal < cupon.monto_minimo) {
          return {
            valido: false,
            mensaje: `❌ Compra mínima de $${parseFloat(
              cupon.monto_minimo
            ).toLocaleString("es-CO")} COP requerida`,
          };
        }
      }

      return {
        valido: true,
        descuento: result.rows[0],
        mensaje: "✅ Cupón aplicado correctamente",
      };
    } catch (error) {
      console.error("Error validando código:", error);
      throw error;
    }
  }

  // Calcular el monto de descuento
  static calcularDescuento(descuento, subtotal) {
    if (descuento.tipo_descuento === "porcentaje") {
      return (subtotal * parseFloat(descuento.valor)) / 100;
    } else if (descuento.tipo_descuento === "fijo") {
      return parseFloat(descuento.valor);
    }
    return 0;
  }

  // Incrementar contador de usos
  static async incrementarUsos(codigoId) {
    try {
      const query = `
        UPDATE descuentos 
        SET usos_actuales = usos_actuales + 1 
        WHERE id_descuento = $1
        RETURNING *
      `;

      const result = await pool.query(query, [codigoId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error incrementando usos:", error);
      throw error;
    }
  }

  // Obtener todos los cupones activos (para admin)
  static async obtenerTodos() {
    try {
      const query = `
        SELECT * FROM descuentos 
        ORDER BY fecha_creacion DESC
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error obteniendo descuentos:", error);
      throw error;
    }
  }

  // Crear nuevo cupón
  static async crear(datosCupon) {
    try {
      const query = `
        INSERT INTO descuentos 
        (codigo, descripcion, tipo_descuento, valor_descuento, compra_minima, fecha_inicio, fecha_expiracion, limite_uso, activo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const values = [
        datosCupon.codigo.toUpperCase(),
        datosCupon.descripcion || null,
        datosCupon.tipo_descuento || "percentage",
        datosCupon.valor_descuento,
        datosCupon.compra_minima || 0,
        datosCupon.fecha_inicio,
        datosCupon.fecha_expiracion,
        datosCupon.limite_uso || null,
        datosCupon.activo !== undefined ? datosCupon.activo : true,
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error creando descuento:", error);
      throw error;
    }
  }

  // Actualizar cupón
  static async actualizar(id, datosCupon) {
    try {
      const query = `
        UPDATE descuentos 
        SET codigo = $1,
            descripcion = $2,
            tipo_descuento = $3,
            valor_descuento = $4,
            compra_minima = $5,
            fecha_inicio = $6,
            fecha_expiracion = $7,
            limite_uso = $8,
            activo = $9
        WHERE id_descuento = $10
        RETURNING *
      `;

      const values = [
        datosCupon.codigo?.toUpperCase(),
        datosCupon.descripcion || null,
        datosCupon.tipo_descuento,
        datosCupon.valor_descuento,
        datosCupon.compra_minima || 0,
        datosCupon.fecha_inicio,
        datosCupon.fecha_expiracion,
        datosCupon.limite_uso || null,
        datosCupon.activo !== undefined ? datosCupon.activo : true,
        id,
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error actualizando descuento:", error);
      throw error;
    }
  }

  // Obtener descuento por ID
  static async obtenerPorId(id) {
    try {
      const query = `SELECT * FROM descuentos WHERE id_descuento = $1`;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error obteniendo descuento:", error);
      throw error;
    }
  }

  // Eliminar descuento
  static async eliminar(id) {
    try {
      const query = `DELETE FROM descuentos WHERE id_descuento = $1 RETURNING *`;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error eliminando descuento:", error);
      throw error;
    }
  }
}

export default DescuentosModel;
