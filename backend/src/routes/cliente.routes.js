const express = require('express')
const router = express.Router()

const {
  getEventosActivos,
  getDetalleEvento,
  getAsientosEvento,
  crearReserva,
  cancelarReserva
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

module.exports = router