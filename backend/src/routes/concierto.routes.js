const express = require('express')
const router = express.Router()

const {
  getConciertos,
  createConcierto,
  updateConcierto,
  deleteConcierto
} = require('../controllers/concierto.controller')

const { verificarToken } = require('../middlewares/auth.middleware')
const { verificarRol } = require('../middlewares/role.middleware')
const upload = require('../middlewares/upload.middleware')

router.get('/', verificarToken, verificarRol('administrador'), getConciertos)

router.post(
  '/',
  verificarToken,
  verificarRol('administrador'),
  upload.single('imagen'),
  createConcierto
)

router.put(
  '/:id',
  verificarToken,
  verificarRol('administrador'),
  upload.single('imagen'),
  updateConcierto
)

router.delete('/:id', verificarToken, verificarRol('administrador'), deleteConcierto)

module.exports = router