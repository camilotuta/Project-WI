const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const { pool } = require('./config/database'); // Ruta relativa desde server.js

// Rutas (agrega más si creas para productos/categorias)
const usuarioRoutes = require('./routes/usuarios.routes');
const carritoRoutes = require('./routes/carrito.routes');

// Cargar variables de entorno desde .env
dotenv.config();

const app = express();

// Middlewares de seguridad y logging
app.use(helmet()); // Seguridad en headers
app.use(compression()); // Compresión de respuestas
app.use(morgan('dev')); // Logging de requests
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*', // Usa tu CORS_ORIGIN como array
  credentials: true
}));
app.use(express.json()); // Parseo de JSON
app.use(express.urlencoded({ extended: true })); // Parseo de URL-encoded

// Montar rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/carrito', carritoRoutes);

// Placeholder para otras rutas (crea los archivos si necesitas)
 // app.use('/api/productos', require('./routes/productos.routes'));
 // app.use('/api/categorias', require('./routes/categorias.routes'));

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined // Muestra error solo en dev
  });
});

// Iniciar servidor y conectar a DB
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  try {
    const client = await pool.connect();
    client.release(); // Libera el cliente después de probar
    console.log('Conexión a la base de datos establecida exitosamente');
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1); // Salir si falla la DB
  }
});



app.get('/', (req, res) => {
  res.json({
    message: 'Servidor funcionando correctamente 🚀',
    endpoints: ['/api/usuarios', '/api/carrito']
  });
});
