import ProductoImagenesModel from "../models/producto_imagenes.model.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET /api/productos/:id/imagenes
export const getImagenes = async (req, res) => {
  try {
    const imagenes = await ProductoImagenesModel.getByProducto(req.params.id);
    res.json({ ok: true, data: imagenes });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// POST /api/productos/:id/imagenes  (sube 1 o más archivos: campo "imagenes")
export const addImagenes = async (req, res) => {
  try {
    const id_producto = parseInt(req.params.id);
    const files = req.files; // array desde multer
    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ ok: false, message: "No se enviaron archivos" });
    }
    const saved = [];
    for (const file of files) {
      const imagen_url = `/assets/images/products/${file.filename}`;
      const alt_text = req.body.alt_text || null;
      const img = await ProductoImagenesModel.add({
        id_producto,
        imagen_url,
        alt_text,
      });
      saved.push(img);
    }
    res.status(201).json({ ok: true, data: saved });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// POST /api/productos/:id/imagenes/url  (agrega imagen por URL directa)
export const addImagenUrl = async (req, res) => {
  try {
    const id_producto = parseInt(req.params.id);
    const { imagen_url, orden, alt_text } = req.body;
    if (!imagen_url)
      return res
        .status(400)
        .json({ ok: false, message: "imagen_url requerida" });
    const img = await ProductoImagenesModel.add({
      id_producto,
      imagen_url,
      orden,
      alt_text,
    });
    res.status(201).json({ ok: true, data: img });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// PATCH /api/imagenes/:id_imagen  (actualizar orden / alt_text)
export const updateImagen = async (req, res) => {
  try {
    const img = await ProductoImagenesModel.update(
      req.params.id_imagen,
      req.body,
    );
    if (!img)
      return res
        .status(404)
        .json({ ok: false, message: "Imagen no encontrada" });
    res.json({ ok: true, data: img });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// POST /api/productos/:id/imagenes/reorder  (reordenar)
export const reorderImagenes = async (req, res) => {
  try {
    const { ordenes } = req.body; // [{id_imagen, orden}]
    if (!Array.isArray(ordenes))
      return res
        .status(400)
        .json({ ok: false, message: "ordenes debe ser array" });
    await ProductoImagenesModel.reorder(ordenes);
    res.json({ ok: true, message: "Orden actualizado" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// DELETE /api/imagenes/:id_imagen
export const deleteImagen = async (req, res) => {
  try {
    const img = await ProductoImagenesModel.delete(req.params.id_imagen);
    if (!img)
      return res
        .status(404)
        .json({ ok: false, message: "Imagen no encontrada" });
    // Intentar borrar archivo físico si es local
    if (img.imagen_url && img.imagen_url.startsWith("/assets/")) {
      const filePath = path.join(__dirname, "../../frontend", img.imagen_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ ok: true, data: img });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};
