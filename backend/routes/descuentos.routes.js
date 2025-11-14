import express from "express";
import DescuentosController from "../controllers/descuentos.controller.js";

const router = express.Router();

// Validar código de descuento
router.post("/validar", DescuentosController.validarCodigo);

// Aplicar descuento (incrementar contador)
router.post("/aplicar", DescuentosController.aplicarDescuento);

// Obtener todos los cupones (admin)
router.get("/", DescuentosController.obtenerTodos);

// Obtener cupón por ID (admin)
router.get("/:id", DescuentosController.obtenerPorId);

// Crear nuevo cupón (admin)
router.post("/", DescuentosController.crear);

// Actualizar cupón (admin)
router.put("/:id", DescuentosController.actualizar);

// Eliminar cupón (admin)
router.delete("/:id", DescuentosController.eliminar);

export default router;
