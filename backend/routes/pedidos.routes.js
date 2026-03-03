import { Router } from "express";
import {
  createPedido,
  getPedidosUsuario,
  verificarCompra,
} from "../controllers/pedidos.controller.js";

const router = Router();

// POST /api/pedidos               → crear pedido desde carrito
router.post("/pedidos", createPedido);

// GET  /api/pedidos/usuario/:id   → historial de pedidos del usuario
router.get("/pedidos/usuario/:id", getPedidosUsuario);

// GET  /api/pedidos/verificar-compra?id_usuario=X&id_producto=Y
router.get("/pedidos/verificar-compra", verificarCompra);

export default router;
