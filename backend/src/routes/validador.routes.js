const express = require("express");
const router = express.Router();

const {
  getConciertosValidador,
  getIngresosPorConcierto,
} = require("../controllers/validador.controller");

router.get("/conciertos", getConciertosValidador);

router.get("/ingresos/:idConcierto", getIngresosPorConcierto);

module.exports = router;