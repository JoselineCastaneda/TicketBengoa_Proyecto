const pool = require('../config/db')

const BASE_URL = 'http://localhost:3000'

const obtenerRutaImagen = (req, imagenBody = null) => {
  if (req.file) {
    return `${BASE_URL}/uploads/${req.file.filename}`
  }

  return imagenBody || null
}

const validarPublicacionEvento = async (idConcierto, imagenFinal) => {
  if (!imagenFinal) {
    return 'No se puede publicar el evento porque no tiene poster'
  }

  const zonasResult = await pool.query(
    `
    SELECT id_zona, precio_zona
    FROM zonas
    WHERE id_concierto = $1
    `,
    [idConcierto]
  )

  if (zonasResult.rows.length === 0) {
    return 'No se puede publicar el evento porque no tiene zonas inicializadas'
  }

  for (const zona of zonasResult.rows) {
    if (zona.precio_zona === null || Number(zona.precio_zona) < 0) {
      return 'Existen zonas sin precio válido'
    }

    const asientosResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM asientos
      WHERE id_zona = $1
      `,
      [zona.id_zona]
    )

    if (Number(asientosResult.rows[0].total) === 0) {
      return `La zona ${zona.id_zona} no tiene asientos`
    }
  }

  return null
}

const getConciertos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id_concierto,
        c.nombre_concierto,
        c.id_artista,
        a.nombre_artista,
        c.descripcion,
        c.fecha,
        c.hora,
        c.imagen,
        c.estado,
        c.fecha_creacion
      FROM conciertos c
      INNER JOIN artistas a
        ON c.id_artista = a.id_artista
      ORDER BY c.id_concierto DESC
    `)

    res.json({
      ok: true,
      conciertos: result.rows
    })
  } catch (error) {
    console.error('Error al obtener conciertos:', error)

    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener conciertos'
    })
  }
}

const createConcierto = async (req, res) => {
  try {
    const {
      nombre_concierto,
      id_artista,
      descripcion,
      fecha,
      hora,
      imagen,
      estado
    } = req.body

    if (!nombre_concierto || !id_artista || !fecha || !hora) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Nombre, artista, fecha y hora son obligatorios'
      })
    }

    const artistaExiste = await pool.query(
      'SELECT id_artista FROM artistas WHERE id_artista = $1',
      [id_artista]
    )

    if (artistaExiste.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'El artista seleccionado no existe'
      })
    }

    const imagenFinal = obtenerRutaImagen(req, imagen)
    const estadoFinal = estado || 'borrador'

    if (estadoFinal === 'activo') {
      return res.status(400).json({
        ok: false,
        mensaje: 'Primero crea el evento como borrador, inicializa zonas y luego publícalo'
      })
    }

    const result = await pool.query(
      `
      INSERT INTO conciertos (
        nombre_concierto,
        id_artista,
        descripcion,
        fecha,
        hora,
        imagen,
        estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        nombre_concierto,
        id_artista,
        descripcion || null,
        fecha,
        hora,
        imagenFinal,
        estadoFinal
      ]
    )

    res.status(201).json({
      ok: true,
      mensaje: 'Evento creado correctamente',
      concierto: result.rows[0]
    })
  } catch (error) {
    console.error('Error al crear concierto:', error)

    res.status(500).json({
      ok: false,
      mensaje: 'Error al crear evento'
    })
  }
}

const updateConcierto = async (req, res) => {
  try {
    const { id } = req.params

    const {
      nombre_concierto,
      id_artista,
      descripcion,
      fecha,
      hora,
      imagen,
      estado
    } = req.body

    if (!nombre_concierto || !id_artista || !fecha || !hora) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Nombre, artista, fecha y hora son obligatorios'
      })
    }

    const artistaExiste = await pool.query(
      'SELECT id_artista FROM artistas WHERE id_artista = $1',
      [id_artista]
    )

    if (artistaExiste.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'El artista seleccionado no existe'
      })
    }

    const eventoActual = await pool.query(
      `
      SELECT imagen, estado
      FROM conciertos
      WHERE id_concierto = $1
      `,
      [id]
    )

    if (eventoActual.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Evento no encontrado'
      })
    }

    const imagenAnterior = eventoActual.rows[0].imagen
    const imagenFinal = obtenerRutaImagen(req, imagen || imagenAnterior)
    const estadoFinal = estado || 'borrador'

    if (estadoFinal === 'activo') {
      const errorPublicacion = await validarPublicacionEvento(id, imagenFinal)

      if (errorPublicacion) {
        return res.status(400).json({
          ok: false,
          mensaje: errorPublicacion
        })
      }
    }

    const result = await pool.query(
      `
      UPDATE conciertos
      SET
        nombre_concierto = $1,
        id_artista = $2,
        descripcion = $3,
        fecha = $4,
        hora = $5,
        imagen = $6,
        estado = $7
      WHERE id_concierto = $8
      RETURNING *
      `,
      [
        nombre_concierto,
        id_artista,
        descripcion || null,
        fecha,
        hora,
        imagenFinal,
        estadoFinal,
        id
      ]
    )

    res.json({
      ok: true,
      mensaje: 'Evento actualizado correctamente',
      concierto: result.rows[0]
    })
  } catch (error) {
    console.error('Error al actualizar concierto:', error)

    res.status(500).json({
      ok: false,
      mensaje: 'Error al actualizar evento'
    })
  }
}

const deleteConcierto = async (req, res) => {
  try {
    const { id } = req.params

    const zonasResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM zonas
      WHERE id_concierto = $1
      `,
      [id]
    )

    const totalZonas = Number(zonasResult.rows[0].total)

    if (totalZonas > 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se puede eliminar el evento porque tiene zonas asociadas'
      })
    }

    const result = await pool.query(
      `
      DELETE FROM conciertos
      WHERE id_concierto = $1
      RETURNING *
      `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Evento no encontrado'
      })
    }

    res.json({
      ok: true,
      mensaje: 'Evento eliminado correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar concierto:', error)

    res.status(500).json({
      ok: false,
      mensaje: 'Error al eliminar evento'
    })
  }
}

module.exports = {
  getConciertos,
  createConcierto,
  updateConcierto,
  deleteConcierto
}