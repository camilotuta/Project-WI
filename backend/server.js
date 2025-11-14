// ==============================================
// IMPORTACIONES
// ==============================================
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Importar rutas
import productosRoutes from "./routes/productos.routes.js";
import categoriasRoutes from "./routes/categorias.routes.js";
import suplementosRoutes from "./routes/suplementos.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import carritoRoutes from "./routes/carrito.routes.js";
import descuentosRoutes from "./routes/descuentos.routes.js";
import favoritosRoutes from "./routes/favoritos.routes.js";
import emailRoutes from "./routes/email.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ==============================================
// MIDDLEWARES
// ==============================================

// CORS mejorado para desarrollo
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:5500",
      "http://localhost:5500",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta frontend
app.use("/assets", express.static(join(__dirname, "../frontend/assets")));

// Logger de requests en desarrollo
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} ${req.path}`);
    next();
  });
}

// ==============================================
// RUTAS
// ==============================================

app.get("/", (req, res) => {
  res.json({ message: "✅ Servidor funcionando correctamente" });
});

app.get("/health", (req, res) => {
  res.json({ status: "✅ OK" });
});

// Registrar rutas con /api prefix
app.use("/api/carrito", carritoRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/suplementos", suplementosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/descuentos", descuentosRoutes);
app.use("/api/favoritos", favoritosRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/upload", uploadRoutes);

// ==============================================
// MANEJO DE ERRORES
// ==============================================

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
    path: req.path,
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// ==============================================
// INICIAR SERVIDOR
// ==============================================

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
  console.log(`📌 Ambiente: ${process.env.NODE_ENV || "development"}`);
});
