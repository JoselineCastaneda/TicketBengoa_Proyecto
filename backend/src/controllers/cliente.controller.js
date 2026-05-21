const pool = require('../config/db')

const liberarReservasVencidas = async (client, id_concierto) => {
  const reservasVencidas = await client.query(
    `
    SELECT id_reserva
    FROM reservas
    WHERE id_concierto = $1
      AND estado_reserva = 'activa'
      AND fecha_expiracion <= NOW()
    `,
    [id_concierto]
  )

  for (const reserva of reservasVencidas.rows) {
    await client.query(
      `
      UPDATE asientos
      SET estado_asiento = 'disponible'
      WHERE id_asiento IN (
        SELECT id_asiento
        FROM detalle_reservas
        WHERE id_reserva = $1
      )
      AND estado_asiento = 'reservado'
      `,
      [reserva.id_reserva]
    )

    await client.query(
      `
      UPDATE reservas
      SET estado_reserva = 'vencida'
      WHERE id_reserva = $1
      `,
      [reserva.id_reserva]
    )
  }
}

const getEventosActivos = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        c.id_concierto,
        c.nombre_concierto,
        c.descripcion,
        c.fecha,
        c.hora,
        c.imagen,
        c.estado,
        a.nombre_artista,
        a.genero_musical
      FROM conciertos c
      INNER JOIN artistas a
        ON c.id_artista = a.id_artista
      WHERE c.estado = 'activo'
      ORDER BY c.fecha ASC, c.hora ASC
      `
    )

    res.json({
      ok: true,
      eventos: result.rows
    })
  } catch (error) {
    console.error('Error al obtener eventos activos:', error)

    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener eventos disponibles'
    })
  }
}

const getDetalleEvento = async (req, res) => {
  try {
    const { id } = req.params

    const eventoResult = await pool.query(
      `
      SELECT
        c.id_concierto,
        c.nombre_concierto,
        c.descripcion,
        c.fecha,
        c.hora,
        c.imagen,
        c.estado,
        a.nombre_artista,
        a.genero_musical
      FROM conciertos c
      INNER JOIN artistas a
        ON c.id_artista = a.id_artista
      WHERE c.id_concierto = $1
        AND c.estado = 'activo'
      `,
      [id]
    )

    if (eventoResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Evento no encontrado o no disponible'
      })
    }

    const zonasResult = await pool.query(
      `
      SELECT
        z.id_zona,
        z.nombre_zona,
        z.descripcion_zona,
        z.precio_zona,
        z.capacidad_zona,
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
        z.capacidad_zona
      ORDER BY z.id_zona
      `,
      [id]
    )

    res.json({
      ok: true,
      evento: eventoResult.rows[0],
      zonas: zonasResult.rows
    })
  } catch (error) {
    console.error('Error al obtener detalle evento:', error)

    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener detalle del evento'
    })
  }
}

const getAsientosEvento = async (req, res) => {
  const client = await pool.connect()

  try {
    const { id } = req.params

    await client.query('BEGIN')

    await liberarReservasVencidas(client, id)

    const eventoResult = await client.query(
      `
      SELECT
        c.id_concierto,
        c.nombre_concierto,
        c.fecha,
        c.hora,
        c.imagen,
        c.estado,
        a.nombre_artista,
        a.genero_musical
      FROM conciertos c
      INNER JOIN artistas a
        ON c.id_artista = a.id_artista
      WHERE c.id_concierto = $1
        AND c.estado = 'activo'
      `,
      [id]
    )

    if (eventoResult.rows.length === 0) {
      await client.query('ROLLBACK')

      return res.status(404).json({
        ok: false,
        mensaje: 'Evento no encontrado o no disponible'
      })
    }

    const zonasResult = await client.query(
      `
      SELECT
        id_zona,
        nombre_zona,
        descripcion_zona,
        precio_zona,
        capacidad_zona
      FROM zonas
      WHERE id_concierto = $1
      ORDER BY id_zona
      `,
      [id]
    )

    const asientosResult = await client.query(
      `
      SELECT
        a.id_asiento,
        a.fila_asiento,
        a.numero_asiento,
        a.codigo_svg,
        a.estado_asiento,
        z.id_zona,
        z.nombre_zona,
        z.precio_zona
      FROM asientos a
      INNER JOIN zonas z
        ON a.id_zona = z.id_zona
      WHERE z.id_concierto = $1
      ORDER BY z.id_zona, a.fila_asiento, a.numero_asiento
      `,
      [id]
    )

    await client.query('COMMIT')

    res.json({
      ok: true,
      evento: eventoResult.rows[0],
      zonas: zonasResult.rows,
      asientos: asientosResult.rows
    })
  } catch (error) {
    await client.query('ROLLBACK')

    console.error('Error al obtener asientos del evento:', error)

    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener asientos del evento'
    })
  } finally {
    client.release()
  }
}

const crearReserva = async (req, res) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const id_usuario = req.usuario.id_usuario
    const { id_concierto, asientos } = req.body

    await liberarReservasVencidas(client, id_concierto)

    if (!id_concierto || !Array.isArray(asientos) || asientos.length === 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        ok: false,
        mensaje: 'Debe seleccionar al menos un asiento'
      })
    }

    if (asientos.length > 6) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        ok: false,
        mensaje: 'Solo puede reservar máximo 6 asientos'
      })
    }

    const eventoResult = await client.query(
      `
      SELECT id_concierto
      FROM conciertos
      WHERE id_concierto = $1
        AND estado = 'activo'
      `,
      [id_concierto]
    )

    if (eventoResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({
        ok: false,
        mensaje: 'Evento no disponible'
      })
    }

    const reservaActivaResult = await client.query(
      `
      SELECT COUNT(*) AS total
      FROM reservas
      WHERE id_usuario = $1
        AND id_concierto = $2
        AND estado_reserva = 'activa'
        AND fecha_expiracion > NOW()
      `,
      [id_usuario, id_concierto]
    )

    if (Number(reservaActivaResult.rows[0].total) > 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        ok: false,
        mensaje:
          'Ya tienes una reserva activa para este evento. Cancélala o finaliza el pago antes de crear otra.'
      })
    }

    const boletosUsuarioResult = await client.query(
      `
      SELECT COUNT(*) AS total
      FROM boletos b
      INNER JOIN ventas v
        ON b.id_venta = v.id_venta
      WHERE v.id_usuario = $1
        AND b.id_concierto = $2
        AND b.estado_boleto = 'activo'
      `,
      [id_usuario, id_concierto]
    )

    const totalBoletosComprados = Number(boletosUsuarioResult.rows[0].total)

    if (totalBoletosComprados + asientos.length > 6) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        ok: false,
        mensaje: `Solo puedes tener máximo 6 boletos por evento. Ya tienes ${totalBoletosComprados}.`
      })
    }

    const asientosResult = await client.query(
      `
      SELECT
        a.id_asiento,
        a.estado_asiento,
        z.id_concierto
      FROM asientos a
      INNER JOIN zonas z
        ON a.id_zona = z.id_zona
      WHERE a.id_asiento = ANY($1::int[])
      FOR UPDATE
      `,
      [asientos]
    )

    if (asientosResult.rows.length !== asientos.length) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        ok: false,
        mensaje: 'Uno o más asientos no existen'
      })
    }

    const asientoFueraEvento = asientosResult.rows.some(
      (asiento) => Number(asiento.id_concierto) !== Number(id_concierto)
    )

    if (asientoFueraEvento) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        ok: false,
        mensaje: 'Uno o más asientos no pertenecen a este evento'
      })
    }

    const ocupados = asientosResult.rows.some(
      (asiento) => asiento.estado_asiento !== 'disponible'
    )

    if (ocupados) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        ok: false,
        mensaje: 'Uno o más asientos ya no están disponibles'
      })
    }

    const reservaResult = await client.query(
      `
      INSERT INTO reservas (
        id_usuario,
        id_concierto,
        fecha_expiracion,
        estado_reserva
      )
      VALUES (
        $1,
        $2,
        NOW() + INTERVAL '10 minutes',
        'activa'
      )
      RETURNING
        id_reserva,
        id_usuario,
        id_concierto,
        fecha_reserva,
        fecha_expiracion,
        estado_reserva
      `,
      [id_usuario, id_concierto]
    )

    const reserva = reservaResult.rows[0]

    for (const id_asiento of asientos) {
      await client.query(
        `
        INSERT INTO detalle_reservas (
          id_reserva,
          id_asiento
        )
        VALUES ($1, $2)
        `,
        [reserva.id_reserva, id_asiento]
      )

      await client.query(
        `
        UPDATE asientos
        SET estado_asiento = 'reservado'
        WHERE id_asiento = $1
        `,
        [id_asiento]
      )
    }

    await client.query('COMMIT')

    res.status(201).json({
      ok: true,
      mensaje: 'Reserva creada correctamente',
      reserva
    })
  } catch (error) {
    await client.query('ROLLBACK')

    console.error('Error al crear reserva:', error)

    res.status(500).json({
      ok: false,
      mensaje: 'Error al crear reserva'
    })
  } finally {
    client.release()
  }
}

const cancelarReserva = async (req, res) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const { id } = req.params
    const id_usuario = req.usuario.id_usuario

    const reservaResult = await client.query(
      `
      SELECT
        id_reserva,
        estado_reserva
      FROM reservas
      WHERE id_reserva = $1
        AND id_usuario = $2
        AND estado_reserva = 'activa'
      FOR UPDATE
      `,
      [id, id_usuario]
    )

    if (reservaResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({
        ok: false,
        mensaje: 'Reserva no encontrada o ya no está activa'
      })
    }

    await client.query(
      `
      UPDATE asientos
      SET estado_asiento = 'disponible'
      WHERE id_asiento IN (
        SELECT id_asiento
        FROM detalle_reservas
        WHERE id_reserva = $1
      )
      AND estado_asiento = 'reservado'
      `,
      [id]
    )

    await client.query(
      `
      UPDATE reservas
      SET estado_reserva = 'cancelada'
      WHERE id_reserva = $1
      `,
      [id]
    )

    await client.query('COMMIT')

    res.json({
      ok: true,
      mensaje: 'Reserva cancelada correctamente'
    })
  } catch (error) {
    await client.query('ROLLBACK')

    console.error('Error al cancelar reserva:', error)

    res.status(500).json({
      ok: false,
      mensaje: 'Error al cancelar reserva'
    })
  } finally {
    client.release()
  }
}

const confirmarPago = async (req, res) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const id_usuario = req.usuario.id_usuario
    const { id_reserva, id_metodo_pago } = req.body

    if (!id_reserva || !id_metodo_pago) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        ok: false,
        mensaje: 'Reserva y método de pago son obligatorios'
      })
    }

    const reservaResult = await client.query(
      `
      SELECT
        id_reserva,
        id_usuario,
        id_concierto,
        fecha_expiracion,
        estado_reserva
      FROM reservas
      WHERE id_reserva = $1
        AND id_usuario = $2
      FOR UPDATE
      `,
      [id_reserva, id_usuario]
    )

    if (reservaResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({
        ok: false,
        mensaje: 'Reserva no encontrada'
      })
    }

    const reserva = reservaResult.rows[0]

    if (reserva.estado_reserva !== 'activa') {
      await client.query('ROLLBACK')
      return res.status(400).json({
        ok: false,
        mensaje: 'La reserva ya no está activa'
      })
    }

    if (new Date(reserva.fecha_expiracion).getTime() <= Date.now()) {
      await client.query(
        `
        UPDATE reservas
        SET estado_reserva = 'vencida'
        WHERE id_reserva = $1
        `,
        [id_reserva]
      )

      await client.query(
        `
        UPDATE asientos
        SET estado_asiento = 'disponible'
        WHERE id_asiento IN (
          SELECT id_asiento
          FROM detalle_reservas
          WHERE id_reserva = $1
        )
        AND estado_asiento = 'reservado'
        `,
        [id_reserva]
      )

      await client.query('COMMIT')

      return res.status(400).json({
        ok: false,
        mensaje: 'La reserva venció. Debes seleccionar los asientos nuevamente.'
      })
    }

    const metodoResult = await client.query(
      `
      SELECT id_metodo_pago
      FROM metodos_pagos
      WHERE id_metodo_pago = $1
      `,
      [id_metodo_pago]
    )

    if (metodoResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        ok: false,
        mensaje: 'Método de pago inválido'
      })
    }

    const totalResult = await client.query(
      `
      SELECT COALESCE(SUM(z.precio_zona), 0) AS total
      FROM detalle_reservas dr
      INNER JOIN asientos a
        ON dr.id_asiento = a.id_asiento
      INNER JOIN zonas z
        ON a.id_zona = z.id_zona
      WHERE dr.id_reserva = $1
      `,
      [id_reserva]
    )

    const total = Number(totalResult.rows[0].total)

    const ventaResult = await client.query(
      `
      INSERT INTO ventas (
        id_usuario,
        id_reserva,
        total_venta,
        estado_venta
      )
      VALUES ($1, $2, $3, 'pagada')
      RETURNING
        id_venta,
        id_usuario,
        id_reserva,
        fecha_venta,
        total_venta,
        estado_venta
      `,
      [id_usuario, id_reserva, total]
    )

    const venta = ventaResult.rows[0]

    const referenciaPago = `TB-${Date.now()}-${id_reserva}`

    const pagoResult = await client.query(
      `
      INSERT INTO pagos (
        id_venta,
        id_metodo_pago,
        monto_pago,
        referencia_pago,
        estado_pago
      )
      VALUES ($1, $2, $3, $4, 'completado')
      RETURNING
        id_pago,
        id_venta,
        monto_pago,
        referencia_pago,
        fecha_pago,
        estado_pago
      `,
      [venta.id_venta, id_metodo_pago, total, referenciaPago]
    )

    const asientosResult = await client.query(
      `
      SELECT id_asiento
      FROM detalle_reservas
      WHERE id_reserva = $1
      `,
      [id_reserva]
    )

    const boletos = []

    for (const asiento of asientosResult.rows) {
      await client.query(
        `
        UPDATE asientos
        SET estado_asiento = 'vendido'
        WHERE id_asiento = $1
        `,
        [asiento.id_asiento]
      )

      const boletoResult = await client.query(
        `
        INSERT INTO boletos (
          codigo_unico,
          id_venta,
          id_asiento,
          id_concierto,
          estado_boleto
        )
        VALUES ($1, $2, $3, $4, 'activo')
        RETURNING
          id_boleto,
          codigo_unico,
          id_asiento,
          id_concierto,
          estado_boleto
        `,
        [
          `BOL-${venta.id_venta}-${asiento.id_asiento}-${Date.now()}`,
          venta.id_venta,
          asiento.id_asiento,
          reserva.id_concierto
        ]
      )

      boletos.push(boletoResult.rows[0])
    }

    await client.query(
      `
      UPDATE reservas
      SET estado_reserva = 'pagada'
      WHERE id_reserva = $1
      `,
      [id_reserva]
    )

    await client.query('COMMIT')

    res.json({
      ok: true,
      mensaje: 'Pago realizado correctamente',
      venta,
      pago: pagoResult.rows[0],
      boletos
    })
  } catch (error) {
    await client.query('ROLLBACK')

    console.error('Error al confirmar pago:', error)

    res.status(500).json({
      ok: false,
      mensaje: 'Error al confirmar pago'
    })
  } finally {
    client.release()
  }
}

module.exports = {
  getEventosActivos,
  getDetalleEvento,
  getAsientosEvento,
  crearReserva,
  cancelarReserva,
  confirmarPago
}