import express from "express";
import SuplementosController from "../controllers/suplementos.controller.js";

const router = express.Router();

router.get("/", SuplementosController.getAll);
router.post("/", SuplementosController.create);
router.get("/:id", SuplementosController.getById);
router.put("/:id", SuplementosController.update);
router.delete("/:id", SuplementosController.delete);

export default router;
