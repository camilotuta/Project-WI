import express from "express";
import {
  upload,
  uploadImage,
  deleteImage,
} from "../controllers/upload.controller.js";

const router = express.Router();

// POST /api/upload - Subir imagen
router.post("/", upload.single("image"), uploadImage);

// DELETE /api/upload/:filename - Eliminar imagen
router.delete("/:filename", deleteImage);

export default router;
