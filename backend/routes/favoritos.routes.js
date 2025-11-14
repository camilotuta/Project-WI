import express from "express";
import FavoritosController from "../controllers/favoritos.controller.js";

const router = express.Router();

// Obtener favoritos de un usuario
router.get("/:userId", FavoritosController.getFavoritos);

// Obtener cantidad de favoritos
router.get("/:userId/count", FavoritosController.countFavoritos);

// Verificar si un producto es favorito
router.get("/:userId/check/:productId", FavoritosController.checkFavorito);

// Toggle favorito (agregar o eliminar)
router.post("/toggle", FavoritosController.toggleFavorito);

// Agregar favorito
router.post("/", FavoritosController.addFavorito);

// Eliminar favorito
router.delete("/", FavoritosController.removeFavorito);

export default router;
