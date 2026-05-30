const express = require("express");
const router = express.Router();

const {
  getDashboardAdmin,
  getHistorialVentasAdmin,
} = require("../controllers/admin.controller");

router.get("/dashboard", getDashboardAdmin);
router.get("/ventas", getHistorialVentasAdmin);

module.exports = router;