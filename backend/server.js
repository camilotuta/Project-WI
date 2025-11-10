const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { testConnection } = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

// ==============================================
// MIDDLEWARES
// ==============================================

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================================
// RUTAS
// ==============================================

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    message: "🌿 Greenhouse Fitness API",
    version: "1.0.0",
    status: "active",
    endpoints: {
      productos: "/api/productos",
      categorias: "/api/categorias",
      suplementos: "/api/suplementos",
      usuarios: "/api/usuarios",
      carrito: "/api/carrito",
    },
  });
});

// Cargar rutas con manejo de errores
try {
  const productosRoutes = require("./routes/productos.routes");
  app.use("/api/productos", productosRoutes);
  console.log("✅ Rutas de productos cargadas");
} catch (e) {
  console.log("⚠️ Rutas de productos no disponibles:", e.message);
}

try {
  const categoriasRoutes = require("./routes/categorias.routes");
  app.use("/api/categorias", categoriasRoutes);
  console.log("✅ Rutas de categorías cargadas");
} catch (e) {
  console.log("⚠️ Rutas de categorías no disponibles:", e.message);
}

try {
  const suplementosRoutes = require("./routes/suplementos.routes");
  app.use("/api/suplementos", suplementosRoutes);
  console.log("✅ Rutas de suplementos cargadas");
} catch (e) {
  console.log("⚠️ Rutas de suplementos no disponibles:", e.message);
}

try {
  const usuariosRoutes = require("./routes/usuarios.routes");
  app.use("/api/usuarios", usuariosRoutes);
  console.log("✅ Rutas de usuarios cargadas");
} catch (e) {
  console.log("⚠️ Rutas de usuarios no disponibles:", e.message);
}

try {
  const carritoRoutes = require("./routes/carrito.routes");
  app.use("/api/carrito", carritoRoutes);
  console.log("✅ Rutas de carrito cargadas");
} catch (e) {
  console.log("⚠️ Rutas de carrito no disponibles:", e.message);
}

// ==============================================
// MANEJO DE ERRORES
// ==============================================

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ==============================================
// INICIO DEL SERVIDOR
// ==============================================

const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    const connected = await testConnection();

    if (!connected) {
      console.error("❌ No se pudo conectar a la base de datos");
      console.log("💡 Verifica:");
      console.log("   1. PostgreSQL está corriendo");
      console.log("   2. Credenciales en .env son correctas");
      console.log("   3. Base de datos existe");
      process.exit(1);
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════╗
║   🌿 GREENHOUSE FITNESS API               ║
║                                            ║
║   🚀 Servidor corriendo en puerto ${PORT}    ║
║   🌍 http://localhost:${PORT}               ║
║   📝 Modo: ${process.env.NODE_ENV || "development"}          ║
╚════════════════════════════════════════════╝
      `);

      console.log("\n📍 Endpoints disponibles:");
      console.log(`   - http://localhost:${PORT}/api/productos`);
      console.log(`   - http://localhost:${PORT}/api/categorias`);
      console.log(`   - http://localhost:${PORT}/api/suplementos`);
      console.log(`   - http://localhost:${PORT}/api/usuarios`);
      console.log(`   - http://localhost:${PORT}/api/carrito`);
      console.log("\n");
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM recibido. Cerrando servidor...");
  process.exit(0);
});

startServer();

module.exports = app;
