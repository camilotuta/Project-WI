import { Router } from "express";
import { upload } from "../controllers/upload.controller.js";
import {
  getImagenes,
  addImagenes,
  addImagenUrl,
  updateImagen,
  reorderImagenes,
  deleteImagen,
} from "../controllers/producto_imagenes.controller.js";

const router = Router();

// Imágenes de un producto específico
router.get("/productos/:id/imagenes", getImagenes);
router.post(
  "/productos/:id/imagenes",
  upload.array("imagenes", 10),
  addImagenes,
);
router.post("/productos/:id/imagenes/url", addImagenUrl);
router.post("/productos/:id/imagenes/reorder", reorderImagenes);

// Operaciones sobre una imagen individual
router.patch("/imagenes/:id_imagen", updateImagen);
router.delete("/imagenes/:id_imagen", deleteImagen);

export default router;
