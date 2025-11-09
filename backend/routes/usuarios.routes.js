
const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuarios.controller');
// const { protect } = require('../middleware/auth.middleware'); // Implementar después

// Rutas públicas
router.post('/register', UsuarioController.register);
router.post('/login', UsuarioController.login);

// Rutas protegidas
// router.get('/profile', protect, UsuarioController.getProfile);
// router.get('/', protect, UsuarioController.getAll);
// router.get('/:id', protect, UsuarioController.getById);
// router.put('/:id', protect, UsuarioController.update);
// router.delete('/:id', protect, UsuarioController.delete);

// Temporalmente sin protección (agregar middleware después)
router.get('/profile', UsuarioController.getProfile);
router.get('/', UsuarioController.getAll);
router.get('/:id', UsuarioController.getById);
router.put('/:id', UsuarioController.update);
router.delete('/:id', UsuarioController.delete);

module.exports = router;