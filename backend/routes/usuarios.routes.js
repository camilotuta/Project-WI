import express from "express";
import UsuariosController from "../controllers/usuarios.controller.js";

const router = express.Router();

router.post("/register", UsuariosController.register);
router.post("/login", UsuariosController.login);
router.get("/profile", UsuariosController.getProfile);
router.get("/", UsuariosController.getAll);
router.get("/:id", UsuariosController.getById);
router.put("/:id", UsuariosController.update);
router.delete("/:id", UsuariosController.delete);

export default router;
