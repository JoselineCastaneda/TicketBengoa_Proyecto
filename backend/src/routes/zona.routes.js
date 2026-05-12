const express = require('express')
const router = express.Router()

const {
  getZonasPorConcierto,
  inicializarZonas,
  updateZona
} = require('../controllers/zona.controller')

const { verificarToken } = require('../middlewares/auth.middleware')
const { verificarRol } = require('../middlewares/role.middleware')

router.get(
  '/concierto/:id_concierto',
  verificarToken,
  verificarRol('administrador'),
  getZonasPorConcierto
)

router.post(
  '/inicializar/:id_concierto',
  verificarToken,
  verificarRol('administrador'),
  inicializarZonas
)

router.put(
  '/:id_zona',
  verificarToken,
  verificarRol('administrador'),
  updateZona
)

module.exports = router