const express = require('express')
const router = express.Router()
const pool = require('../config/db')

router.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()')

    res.json({
      ok: true,
      mensaje: 'Conexión exitosa con PostgreSQL',
      fecha: result.rows[0].now
    })

  } catch (error) {
    console.error(error)

    res.status(500).json({
      ok: false,
      mensaje: 'Error al conectar con PostgreSQL'
    })
  }
})

module.exports = router