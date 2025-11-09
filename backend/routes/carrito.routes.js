
const express = require('express');
const router = express.Router();
const CarritoController = require('../controllers/carrito.controller');

router.get('/:id_usuario', CarritoController.getCart);
router.post('/', CarritoController.addToCart);
router.put('/:id_carrito', CarritoController.updateCartItem);
router.delete('/:id_carrito', CarritoController.removeFromCart);
router.delete('/clear/:id_usuario', CarritoController.clearCart);

module.exports = router;