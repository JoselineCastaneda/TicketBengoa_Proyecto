const pool = require("../config/db");

const getConciertosValidador = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id_concierto,
        nombre_concierto,
        fecha,
        estado
      FROM conciertos
      WHERE estado = 'activo'
      ORDER BY fecha ASC
    `);

    res.json({
      ok: true,
      conciertos: result.rows,
    });
  } catch (error) {
    console.error("Error al obtener conciertos para validador:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener conciertos",
    });
  }
};

const getIngresosPorConcierto = async (req, res) => {
  try {
    const { idConcierto } = req.params;

    const result = await pool.query(
      `
      SELECT
        vb.id_validacion,
        vb.fecha_validacion,
        TO_CHAR(vb.fecha_validacion, 'HH12:MI AM') AS hora,
        u.nombre,
        u.apellido,
        z.nombre_zona,
        a.fila_asiento,
        a.numero_asiento
      FROM validacion_boletos vb
      INNER JOIN boletos b
        ON vb.id_boleto = b.id_boleto
      INNER JOIN ventas v
        ON b.id_venta = v.id_venta
      INNER JOIN usuarios u
        ON v.id_usuario = u.id_usuario
      INNER JOIN asientos a
        ON b.id_asiento = a.id_asiento
      INNER JOIN zonas z
        ON a.id_zona = z.id_zona
      WHERE b.id_concierto = $1
      ORDER BY vb.fecha_validacion DESC
      LIMIT 5
      `,
      [idConcierto]
    );

    res.json({
      ok: true,
      ingresos: result.rows,
    });
  } catch (error) {
    console.error("Error al obtener ingresos:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener ingresos",
    });
  }
};

module.exports = {
  getConciertosValidador,
  getIngresosPorConcierto,
};