const express = require('express')
const router = express.Router()
const { verificarToken } = require('../middlewares/auth.middleware')
const { verificarRol } = require('../middlewares/role.middleware')

router.get('/perfil', verificarToken, (req, res) => {
  res.json({
    ok: true,
    mensaje: 'Acceso autorizado',
    usuario: req.usuario
  })
})

router.get(
  '/admin',
  verificarToken,
  verificarRol('administrador'),
  (req, res) => {
    res.json({
      ok: true,
      mensaje: 'Bienvenido administrador',
      usuario: req.usuario
    })
  }
)

router.get(
  '/cliente',
  verificarToken,
  verificarRol('cliente'),
  (req, res) => {
    res.json({
      ok: true,
      mensaje: 'Bienvenido cliente',
      usuario: req.usuario
    })
  }
)

router.get(
  '/validador',
  verificarToken,
  verificarRol('validador'),
  (req, res) => {
    res.json({
      ok: true,
      mensaje: 'Bienvenido validador',
      usuario: req.usuario
    })
  }
)

module.exports = router