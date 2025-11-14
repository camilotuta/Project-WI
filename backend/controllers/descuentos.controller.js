import DescuentosModel from "../models/descuentos.model.js";

class DescuentosController {
  // POST /api/descuentos/validar
  static async validarCodigo(req, res) {
    try {
      const { codigo, subtotal } = req.body;

      if (!codigo || !subtotal) {
        return res.status(400).json({
          success: false,
          mensaje: "Código y subtotal son requeridos",
        });
      }

      const resultado = await DescuentosModel.validarCodigo(codigo, subtotal);

      if (!resultado.valido) {
        return res.status(400).json({
          success: false,
          mensaje: resultado.mensaje,
        });
      }

      // Calcular monto de descuento
      const montoDescuento = DescuentosModel.calcularDescuento(
        resultado.descuento,
        subtotal
      );

      return res.status(200).json({
        success: true,
        mensaje: resultado.mensaje,
        descuento: {
          id: resultado.descuento.id_descuento,
          codigo: resultado.descuento.codigo,
          descripcion: resultado.descuento.descripcion,
          tipo: resultado.descuento.tipo_descuento,
          valor: resultado.descuento.valor,
          monto: montoDescuento,
        },
      });
    } catch (error) {
      console.error("Error en validarCodigo:", error);
      return res.status(500).json({
        success: false,
        mensaje: "Error al validar el código de descuento",
      });
    }
  }

  // POST /api/descuentos/aplicar
  static async aplicarDescuento(req, res) {
    try {
      const { codigoId } = req.body;

      if (!codigoId) {
        return res.status(400).json({
          success: false,
          mensaje: "ID del código es requerido",
        });
      }

      const resultado = await DescuentosModel.incrementarUsos(codigoId);

      return res.status(200).json({
        success: true,
        mensaje: "Descuento aplicado correctamente",
        descuento: resultado,
      });
    } catch (error) {
      console.error("Error en aplicarDescuento:", error);
      return res.status(500).json({
        success: false,
        mensaje: "Error al aplicar el descuento",
      });
    }
  }

  // GET /api/descuentos
  static async obtenerTodos(req, res) {
    try {
      const descuentos = await DescuentosModel.obtenerTodos();

      return res.status(200).json({
        success: true,
        data: descuentos,
      });
    } catch (error) {
      console.error("Error en obtenerTodos:", error);
      return res.status(500).json({
        success: false,
        mensaje: "Error al obtener descuentos",
      });
    }
  }

  // POST /api/descuentos
  static async crear(req, res) {
    try {
      const nuevoCupon = await DescuentosModel.crear(req.body);

      return res.status(201).json({
        success: true,
        mensaje: "Cupón creado correctamente",
        descuento: nuevoCupon,
      });
    } catch (error) {
      console.error("Error en crear:", error);
      return res.status(500).json({
        success: false,
        mensaje: "Error al crear cupón",
      });
    }
  }

  // PUT /api/descuentos/:id
  static async actualizar(req, res) {
    try {
      const { id } = req.params;
      const cuponActualizado = await DescuentosModel.actualizar(id, req.body);

      if (!cuponActualizado) {
        return res.status(404).json({
          success: false,
          mensaje: "Cupón no encontrado",
        });
      }

      return res.status(200).json({
        success: true,
        mensaje: "Cupón actualizado correctamente",
        data: cuponActualizado,
      });
    } catch (error) {
      console.error("Error en actualizar:", error);
      return res.status(500).json({
        success: false,
        mensaje: "Error al actualizar cupón",
      });
    }
  }

  // GET /api/descuentos/:id
  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const descuento = await DescuentosModel.obtenerPorId(id);

      if (!descuento) {
        return res.status(404).json({
          success: false,
          message: "Descuento no encontrado",
        });
      }

      return res.status(200).json({
        success: true,
        data: descuento,
      });
    } catch (error) {
      console.error("Error en obtenerPorId:", error);
      return res.status(500).json({
        success: false,
        message: "Error al obtener descuento",
      });
    }
  }

  // DELETE /api/descuentos/:id
  static async eliminar(req, res) {
    try {
      const { id } = req.params;
      const eliminado = await DescuentosModel.eliminar(id);

      if (!eliminado) {
        return res.status(404).json({
          success: false,
          message: "Descuento no encontrado",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Descuento eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error en eliminar:", error);
      return res.status(500).json({
        success: false,
        message: "Error al eliminar descuento",
      });
    }
  }
}

export default DescuentosController;
