import express from "express";
import CarritoController from "../controllers/carrito.controller.js";

const router = express.Router();

router.get("/:id_usuario", CarritoController.getCart);
router.post("/", CarritoController.addToCart);
router.put("/:id_carrito", CarritoController.updateCartItem);
router.delete("/:id_carrito", CarritoController.removeFromCart);
router.delete("/clear/:id_usuario", CarritoController.clearCart);

export default router;
