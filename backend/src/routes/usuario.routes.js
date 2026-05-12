const express = require('express')
const router = express.Router()

const {
  getUsuarios,
  createUsuarioAdmin,
  updateUsuarioEstado
} = require('../controllers/usuario.controller')

const { verificarToken } = require('../middlewares/auth.middleware')
const { verificarRol } = require('../middlewares/role.middleware')

router.get(
  '/',
  verificarToken,
  verificarRol('administrador'),
  getUsuarios
)

router.post(
  '/',
  verificarToken,
  verificarRol('administrador'),
  createUsuarioAdmin
)

router.patch(
  '/:id_usuario/estado',
  verificarToken,
  verificarRol('administrador'),
  updateUsuarioEstado
)

module.exports = router