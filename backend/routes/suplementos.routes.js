const express = require("express");
const router = express.Router();
const SuplementoController = require("../controllers/suplementos.controller");

router.get("/", SuplementoController.getAll);
router.get("/:id", SuplementoController.getById);
router.post("/", SuplementoController.create);
router.put("/:id", SuplementoController.update);
router.delete("/:id", SuplementoController.delete);

module.exports = router;
