import { Router } from "express";
import {
  getAllStats,
  getResenas,
  createResena,
  deleteResena,
  verificarResena,
  puedeResenar,
} from "../controllers/resenas.controller.js";

const router = Router();

// GET  /api/resenas/stats                     → stats de todos los productos
router.get("/resenas/stats", getAllStats);

// GET  /api/productos/:id/resenas             → listar reseñas + stats
router.get("/productos/:id/resenas", getResenas);

// GET  /api/productos/:id/puede-resenar       → verificar si el usuario puede reseñar
router.get("/productos/:id/puede-resenar", puedeResenar);

// POST /api/productos/:id/resenas             → crear reseña (usuario autenticado + compra verificada)
router.post("/productos/:id/resenas", createResena);

// DELETE /api/resenas/:id                     → eliminar reseña
router.delete("/resenas/:id", deleteResena);

// PATCH /api/resenas/:id/verificar            → marcar como verificada (admin)
router.patch("/resenas/:id/verificar", verificarResena);

export default router;
