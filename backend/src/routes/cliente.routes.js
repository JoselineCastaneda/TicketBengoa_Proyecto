const express = require('express')
const router = express.Router()

const {
  getEventosActivos,
  getDetalleEvento,
  getAsientosEvento,
  crearReserva,
  cancelarReserva,
  confirmarPago,
  getBoletosPorVenta,
  getMisBoletos
} = require('../controllers/cliente.controller')

const { verificarToken } = require('../middlewares/auth.middleware')
const { verificarRol } = require('../middlewares/role.middleware')

router.get(
  '/eventos',
  verificarToken,
  verificarRol('cliente'),
  getEventosActivos
)

router.get(
  '/eventos/:id',
  verificarToken,
  verificarRol('cliente'),
  getDetalleEvento
)

router.get(
  '/eventos/:id/asientos',
  verificarToken,
  verificarRol('cliente'),
  getAsientosEvento
)

router.post(
  '/reservas',
  verificarToken,
  verificarRol('cliente'),
  crearReserva
)

router.patch(
  '/reservas/:id/cancelar',
  verificarToken,
  verificarRol('cliente'),
  cancelarReserva
)

router.post(
  '/pagos',
  verificarToken,
  verificarRol('cliente'),
  confirmarPago
)

router.get(
  '/ventas/:id_venta/boletos',
  verificarToken,
  verificarRol('cliente'),
  getBoletosPorVenta
)

router.get(
  '/boletos',
  verificarToken,
  verificarRol('cliente'),
  getMisBoletos
)

module.exports = router