import express from "express";
import ProductosController from "../controllers/productos.controller.js";

const router = express.Router();

router.get("/", ProductosController.getAll);
router.get("/random", ProductosController.getRandom);
router.get("/destacados", ProductosController.getFeatured);
router.get("/ofertas", ProductosController.getOffers);
router.get("/nuevos", ProductosController.getNew);
router.get("/relacionados/:id", ProductosController.getRelated);
router.get("/:id", ProductosController.getById);
router.post("/", ProductosController.create);
router.put("/:id", ProductosController.update);
router.delete("/:id", ProductosController.delete);

export default router;
