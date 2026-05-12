const pool = require('../config/db')

const getArtistas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id_artista,
        nombre_artista,
        nacionalidad_artista,
        genero_musical,
        descripcion_artista
      FROM artistas
      ORDER BY id_artista DESC
    `)

    res.json({
      ok: true,
      artistas: result.rows
    })
  } catch (error) {
    console.error('Error al obtener artistas:', error)
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener artistas'
    })
  }
}

const createArtista = async (req, res) => {
  try {
    const {
      nombre_artista,
      nacionalidad_artista,
      genero_musical,
      descripcion_artista
    } = req.body

    if (!nombre_artista) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El nombre del artista es obligatorio'
      })
    }

    const result = await pool.query(
      `
      INSERT INTO artistas (
        nombre_artista,
        nacionalidad_artista,
        genero_musical,
        descripcion_artista
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        nombre_artista,
        nacionalidad_artista || null,
        genero_musical || null,
        descripcion_artista || null
      ]
    )

    res.status(201).json({
      ok: true,
      mensaje: 'Artista creado correctamente',
      artista: result.rows[0]
    })
  } catch (error) {
    console.error('Error al crear artista:', error)
    res.status(500).json({
      ok: false,
      mensaje: 'Error al crear artista'
    })
  }
}

const updateArtista = async (req, res) => {
  try {
    const { id } = req.params

    const {
      nombre_artista,
      nacionalidad_artista,
      genero_musical,
      descripcion_artista
    } = req.body

    if (!nombre_artista) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El nombre del artista es obligatorio'
      })
    }

    const result = await pool.query(
      `
      UPDATE artistas
      SET
        nombre_artista = $1,
        nacionalidad_artista = $2,
        genero_musical = $3,
        descripcion_artista = $4
      WHERE id_artista = $5
      RETURNING *
      `,
      [
        nombre_artista,
        nacionalidad_artista || null,
        genero_musical || null,
        descripcion_artista || null,
        id
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Artista no encontrado'
      })
    }

    res.json({
      ok: true,
      mensaje: 'Artista actualizado correctamente',
      artista: result.rows[0]
    })
  } catch (error) {
    console.error('Error al actualizar artista:', error)
    res.status(500).json({
      ok: false,
      mensaje: 'Error al actualizar artista'
    })
  }
}

const deleteArtista = async (req, res) => {
  try {
    const { id } = req.params

    const conciertosResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM conciertos
      WHERE id_artista = $1
      `,
      [id]
    )

    const totalConciertos = Number(conciertosResult.rows[0].total)

    if (totalConciertos > 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se puede eliminar el artista porque tiene conciertos asociados'
      })
    }

    const result = await pool.query(
      `
      DELETE FROM artistas
      WHERE id_artista = $1
      RETURNING *
      `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Artista no encontrado'
      })
    }

    res.json({
      ok: true,
      mensaje: 'Artista eliminado correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar artista:', error)
    res.status(500).json({
      ok: false,
      mensaje: 'Error al eliminar artista'
    })
  }
}

module.exports = {
  getArtistas,
  createArtista,
  updateArtista,
  deleteArtista
}