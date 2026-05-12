const express = require('express')
const router = express.Router()

const {
  getArtistas,
  createArtista,
  updateArtista,
  deleteArtista
} = require('../controllers/artista.controller')

const { verificarToken } = require('../middlewares/auth.middleware')
const { verificarRol } = require('../middlewares/role.middleware')

// Listar artistas
router.get('/', verificarToken, verificarRol('administrador'), getArtistas)

// Crear artista
router.post('/', verificarToken, verificarRol('administrador'), createArtista)

// Editar artista
router.put('/:id', verificarToken, verificarRol('administrador'), updateArtista)

// Eliminar artista
router.delete('/:id', verificarToken, verificarRol('administrador'), deleteArtista)

module.exports = router