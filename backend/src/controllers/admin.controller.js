const pool = require("../config/db");

const getDashboardAdmin = async (req, res) => {
  try {
    const ventasTotalesResult = await pool.query(`
      SELECT COALESCE(SUM(total_venta), 0) AS total
      FROM ventas
      WHERE estado_venta = 'pagada'
    `);

    const entradasVendidasResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM boletos
      WHERE estado_boleto = 'activo'
    `);

    const eventosActivosResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM conciertos
      WHERE estado = 'activo'
    `);

    const clientesResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM usuarios u
      INNER JOIN roles r
        ON u.id_rol = r.id_rol
      WHERE LOWER(r.nombre_rol) = 'cliente'
    `);

    const ventasPorDiaResult = await pool.query(`
      SELECT
        TO_CHAR(fecha_venta::DATE, 'DD Mon') AS fecha,
        fecha_venta::DATE AS fecha_orden,
        COALESCE(SUM(total_venta), 0) AS total
      FROM ventas
      WHERE estado_venta = 'pagada'
      GROUP BY fecha_venta::DATE
      ORDER BY fecha_orden ASC
      LIMIT 7
    `);

    const proximosEventosResult = await pool.query(`
      SELECT
        id_concierto,
        nombre_concierto,
        fecha,
        estado
      FROM conciertos
      WHERE estado = 'activo'
      ORDER BY fecha ASC
      LIMIT 5
    `);

    const ventasRecientesResult = await pool.query(`
      SELECT
        v.id_venta,
        v.total_venta AS total,
        v.fecha_venta,
        TO_CHAR(v.fecha_venta, 'DD/MM/YYYY') AS fecha_formateada,
        TO_CHAR(v.fecha_venta, 'HH12:MI AM') AS hora_formateada,
        u.nombre,
        u.apellido,
        c.nombre_concierto,
        COUNT(b.id_boleto) AS cantidad_boletos,
        STRING_AGG(DISTINCT z.nombre_zona, ', ') AS zonas
      FROM ventas v
      INNER JOIN usuarios u
        ON v.id_usuario = u.id_usuario
      INNER JOIN reservas r
        ON v.id_reserva = r.id_reserva
      INNER JOIN conciertos c
        ON r.id_concierto = c.id_concierto
      LEFT JOIN boletos b
        ON b.id_venta = v.id_venta
      LEFT JOIN asientos a
        ON b.id_asiento = a.id_asiento
      LEFT JOIN zonas z
        ON a.id_zona = z.id_zona
      WHERE v.estado_venta = 'pagada'
      GROUP BY
        v.id_venta,
        v.total_venta,
        v.fecha_venta,
        u.nombre,
        u.apellido,
        c.nombre_concierto
      ORDER BY v.fecha_venta DESC
      LIMIT 5
    `);

    res.status(200).json({
      ok: true,

      resumen: {
        ventasTotales: Number(ventasTotalesResult.rows[0].total),
        entradasVendidas: Number(entradasVendidasResult.rows[0].total),
        eventosActivos: Number(eventosActivosResult.rows[0].total),
        clientes: Number(clientesResult.rows[0].total),
      },

      ventasPorDia: ventasPorDiaResult.rows.map((item) => ({
        fecha: item.fecha,
        total: Number(item.total),
      })),

      proximosEventos: proximosEventosResult.rows,

      ventasRecientes: ventasRecientesResult.rows.map((venta) => ({
        id_venta: venta.id_venta,
        total: Number(venta.total),
        fecha_venta: venta.fecha_venta,
        fecha_formateada: venta.fecha_formateada,
        hora_formateada: venta.hora_formateada,
        nombre: venta.nombre,
        apellido: venta.apellido,
        nombre_concierto: venta.nombre_concierto,
        cantidad_boletos: Number(venta.cantidad_boletos),
        zonas: venta.zonas || "Sin zona",
      })),
    });
  } catch (error) {
    console.error("Error al cargar dashboard admin:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al cargar dashboard admin",
    });
  }
};

const getHistorialVentasAdmin = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        v.id_venta,
        v.total_venta,
        v.estado_venta,
        v.fecha_venta,
        TO_CHAR(v.fecha_venta, 'DD/MM/YYYY') AS fecha_formateada,
        TO_CHAR(v.fecha_venta, 'HH12:MI AM') AS hora_formateada,
        u.nombre,
        u.apellido,
        u.correo_electronico,
        c.nombre_concierto,
        COUNT(b.id_boleto) AS cantidad_boletos,
        STRING_AGG(DISTINCT z.nombre_zona, ', ') AS zonas
      FROM ventas v
      INNER JOIN usuarios u
        ON v.id_usuario = u.id_usuario
      INNER JOIN reservas r
        ON v.id_reserva = r.id_reserva
      INNER JOIN conciertos c
        ON r.id_concierto = c.id_concierto
      LEFT JOIN boletos b
        ON b.id_venta = v.id_venta
      LEFT JOIN asientos a
        ON b.id_asiento = a.id_asiento
      LEFT JOIN zonas z
        ON a.id_zona = z.id_zona
      GROUP BY
        v.id_venta,
        v.total_venta,
        v.estado_venta,
        v.fecha_venta,
        u.nombre,
        u.apellido,
        u.correo_electronico,
        c.nombre_concierto
      ORDER BY v.fecha_venta DESC
    `);

    res.json({
      ok: true,
      ventas: result.rows.map((venta) => ({
        id_venta: venta.id_venta,
        total_venta: Number(venta.total_venta),
        estado_venta: venta.estado_venta,
        fecha_venta: venta.fecha_venta,
        fecha_formateada: venta.fecha_formateada,
        hora_formateada: venta.hora_formateada,
        cliente: `${venta.nombre} ${venta.apellido}`,
        correo_electronico: venta.correo_electronico,
        nombre_concierto: venta.nombre_concierto,
        cantidad_boletos: Number(venta.cantidad_boletos),
        zonas: venta.zonas || "Sin zona",
      })),
    });
  } catch (error) {
    console.error("Error al obtener historial de ventas:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener historial de ventas",
    });
  }
};

module.exports = {
  getDashboardAdmin,
  getHistorialVentasAdmin,
};