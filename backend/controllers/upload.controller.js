import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar storage de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ruta absoluta a la carpeta de imágenes del frontend
    const uploadPath = path.join(
      __dirname,
      "../../frontend/assets/images/products"
    );

    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generar nombre único: timestamp + nombre original
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, basename + "-" + uniqueSuffix + ext);
  },
});

// Filtrar solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, gif, webp)"));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: fileFilter,
});

// Controller para subir imagen
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se recibió ninguna imagen",
      });
    }

    // Retornar la ruta relativa para guardar en la BD
    const imagePath = `/assets/images/products/${req.file.filename}`;

    res.json({
      success: true,
      message: "Imagen subida exitosamente",
      data: {
        filename: req.file.filename,
        path: imagePath,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("Error al subir imagen:", error);
    res.status(500).json({
      success: false,
      message: "Error al subir la imagen",
      error: error.message,
    });
  }
};

// Controller para eliminar imagen
export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: "No se especificó el nombre del archivo",
      });
    }

    const imagePath = path.join(
      __dirname,
      "../../frontend/assets/images/products",
      filename
    );

    // Verificar si el archivo existe
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      res.json({
        success: true,
        message: "Imagen eliminada exitosamente",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Imagen no encontrada",
      });
    }
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar la imagen",
      error: error.message,
    });
  }
};
