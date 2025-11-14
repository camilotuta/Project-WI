import express from "express";
import CategoriasController from "../controllers/categorias.controller.js";

const router = express.Router();

router.get("/", CategoriasController.getAll);
router.post("/", CategoriasController.create);
router.get("/:id", CategoriasController.getById);
router.put("/:id", CategoriasController.update);
router.delete("/:id", CategoriasController.delete);

export default router;
