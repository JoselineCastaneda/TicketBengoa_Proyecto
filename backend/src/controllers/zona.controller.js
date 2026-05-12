const pool = require('../config/db')

const zonasBase = [
  {
    nombre_zona: 'Zona VIP',
    descripcion_zona: 'Zona superior izquierda',
    precio_zona: 40.00,
    capacidad_zona: 180
  },
  {
    nombre_zona: 'Zona Ejecutiva',
    descripcion_zona: 'Zona superior central',
    precio_zona: 30.00,
    capacidad_zona: 360
  },
  {
    nombre_zona: 'Zona Platinum',
    descripcion_zona: 'Zona superior derecha',
    precio_zona: 35.00,
    capacidad_zona: 180
  },
  {
    nombre_zona: 'Bloque A',
    descripcion_zona: 'Bloque central izquierdo',
    precio_zona: 22.00,
    capacidad_zona: 126
  },
  {
    nombre_zona: 'Bloque B',
    descripcion_zona: 'Bloque central izquierdo interno',
    precio_zona: 22.00,
    capacidad_zona: 126
  },
  {
    nombre_zona: 'Bloque F',
    descripcion_zona: 'Bloque central derecho interno',
    precio_zona: 22.00,
    capacidad_zona: 126
  },
  {
    nombre_zona: 'Bloque E',
    descripcion_zona: 'Bloque central derecho',
    precio_zona: 22.00,
    capacidad_zona: 126
  },
  {
    nombre_zona: 'Zona General A',
    descripcion_zona: 'Bloque inferior general izquierdo',
    precio_zona: 15.00,
    capacidad_zona: 90
  },
  {
    nombre_zona: 'Zona General B',
    descripcion_zona: 'Bloque inferior general derecho',
    precio_zona: 15.00,
    capacidad_zona: 90
  }
]

const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N']
const letrasGeneral = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

const insertarAsientosSerieZonaA = async (client, idZona, rangos) => {
  for (const [inicio, fin] of rangos) {
    for (let numero = inicio; numero <= fin; numero++) {
      await client.query(
        `
        INSERT INTO asientos (
          fila_asiento,
          numero_asiento,
          codigo_svg,
          id_zona,
          estado_asiento
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        ['A', numero, `ZonaA${numero}`, idZona, 'disponible']
      )
    }
  }
}

const insertarAsientosBloque = async (client, idZona, prefijo) => {
  for (const fila of letras) {
    for (let numero = 1; numero <= 9; numero++) {
      await client.query(
        `
        INSERT INTO asientos (
          fila_asiento,
          numero_asiento,
          codigo_svg,
          id_zona,
          estado_asiento
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [fila, numero, `${prefijo}-${fila}${numero}`, idZona, 'disponible']
      )
    }
  }
}

const insertarAsientosGeneral = async (client, idZona, prefijo) => {
  for (const fila of letrasGeneral) {
    for (let numero = 1; numero <= 9; numero++) {
      await client.query(
        `
        INSERT INTO asientos (
          fila_asiento,
          numero_asiento,
          codigo_svg,
          id_zona,
          estado_asiento
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [`${prefijo}-${fila}`, numero, `${prefijo}-${fila}${numero}`, idZona, 'disponible']
      )
    }
  }
}

const getZonasPorConcierto = async (req, res) => {
  try {
    const { id_concierto } = req.params

    const concierto = await pool.query(
      `
      SELECT id_concierto, nombre_concierto, estado
      FROM conciertos
      WHERE id_concierto = $1
      `,
      [id_concierto]
    )

    if (concierto.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Evento no encontrado'
      })
    }

    const zonas = await pool.query(
      `
      SELECT
        z.id_zona,
        z.nombre_zona,
        z.descripcion_zona,
        z.precio_zona,
        z.capacidad_zona,
        z.id_concierto,
        COUNT(a.id_asiento) AS total_asientos
      FROM zonas z
      LEFT JOIN asientos a
        ON z.id_zona = a.id_zona
      WHERE z.id_concierto = $1
      GROUP BY
        z.id_zona,
        z.nombre_zona,
        z.descripcion_zona,
        z.precio_zona,
        z.capacidad_zona,
        z.id_concierto
      ORDER BY z.id_zona
      `,
      [id_concierto]
    )

    res.json({
      ok: true,
      evento: concierto.rows[0],
      zonas: zonas.rows
    })
  } catch (error) {
    console.error('Error al obtener zonas:', error)

    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener zonas del evento'
    })
  }
}

const inicializarZonas = async (req, res) => {
  const client = await pool.connect()

  try {
    const { id_concierto } = req.params

    await client.query('BEGIN')

    const concierto = await client.query(
      `
      SELECT id_concierto, estado
      FROM conciertos
      WHERE id_concierto = $1
      `,
      [id_concierto]
    )

    if (concierto.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({
        ok: false,
        mensaje: 'Evento no encontrado'
      })
    }

    if (concierto.rows[0].estado !== 'borrador') {
      await client.query('ROLLBACK')
      return res.status(400).json({
        ok: false,
        mensaje: 'Solo se pueden inicializar zonas en eventos en borrador'
      })
    }

    const zonasExistentes = await client.query(
      `
      SELECT COUNT(*) AS total
      FROM zonas
      WHERE id_concierto = $1
      `,
      [id_concierto]
    )

    if (Number(zonasExistentes.rows[0].total) > 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        ok: false,
        mensaje: 'Este evento ya tiene zonas inicializadas'
      })
    }

    const idsZonas = {}

    for (const zona of zonasBase) {
      const result = await client.query(
        `
        INSERT INTO zonas (
          nombre_zona,
          descripcion_zona,
          precio_zona,
          capacidad_zona,
          id_concierto
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id_zona, nombre_zona
        `,
        [
          zona.nombre_zona,
          zona.descripcion_zona,
          zona.precio_zona,
          zona.capacidad_zona,
          id_concierto
        ]
      )

      idsZonas[zona.nombre_zona] = result.rows[0].id_zona
    }

    await insertarAsientosSerieZonaA(client, idsZonas['Zona VIP'], [
      [1, 36],
      [193, 252],
      [433, 516]
    ])

    await insertarAsientosSerieZonaA(client, idsZonas['Zona Ejecutiva'], [
      [37, 156],
      [253, 372],
      [517, 636]
    ])

    await insertarAsientosSerieZonaA(client, idsZonas['Zona Platinum'], [
      [157, 192],
      [373, 432],
      [637, 720]
    ])

    await insertarAsientosBloque(client, idsZonas['Bloque A'], 'A')
    await insertarAsientosBloque(client, idsZonas['Bloque B'], 'B')
    await insertarAsientosBloque(client, idsZonas['Bloque F'], 'F')
    await insertarAsientosBloque(client, idsZonas['Bloque E'], 'E')

    await insertarAsientosGeneral(client, idsZonas['Zona General A'], 'A2')
    await insertarAsientosGeneral(client, idsZonas['Zona General B'], 'B2')

    await client.query('COMMIT')

    res.status(201).json({
      ok: true,
      mensaje: 'Zonas y asientos inicializados correctamente'
    })
  } catch (error) {
    await client.query('ROLLBACK')

    console.error('Error al inicializar zonas:', error)

    res.status(500).json({
      ok: false,
      mensaje: 'Error al inicializar zonas del evento'
    })
  } finally {
    client.release()
  }
}

const updateZona = async (req, res) => {
  try {
    const { id_zona } = req.params
    const { precio_zona } = req.body

    if (precio_zona === undefined || precio_zona === '') {
      return res.status(400).json({
        ok: false,
        mensaje: 'El precio de la zona es obligatorio'
      })
    }

    if (Number(precio_zona) < 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El precio no puede ser negativo'
      })
    }

    const zonaActual = await pool.query(
      `
      SELECT
        z.id_zona,
        z.id_concierto,
        c.estado
      FROM zonas z
      INNER JOIN conciertos c
        ON z.id_concierto = c.id_concierto
      WHERE z.id_zona = $1
      `,
      [id_zona]
    )

    if (zonaActual.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Zona no encontrada'
      })
    }

    if (zonaActual.rows[0].estado !== 'borrador') {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se puede modificar el precio porque el evento ya no está en borrador'
      })
    }

    const result = await pool.query(
      `
      UPDATE zonas
      SET precio_zona = $1
      WHERE id_zona = $2
      RETURNING *
      `,
      [precio_zona, id_zona]
    )

    res.json({
      ok: true,
      mensaje: 'Precio de zona actualizado correctamente',
      zona: result.rows[0]
    })
  } catch (error) {
    console.error('Error al actualizar zona:', error)

    res.status(500).json({
      ok: false,
      mensaje: 'Error al actualizar zona'
    })
  }
}

module.exports = {
  getZonasPorConcierto,
  inicializarZonas,
  updateZona
}